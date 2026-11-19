"""Turn trend signals into one high-quality, fact-checked reel script.

Pipeline: ideas (10) -> strict critic scores -> best idea >= min_score -> script
          -> scripture fact-check (with web search) -> fixed script.
Returns None when nothing is good enough (the slot is skipped instead of posting junk).
"""
import datetime as dt
import json

from . import llm
from .common import CFG, history, log, now

PAGE = CFG["page"]


# ---------------------------------------------------------------- learning loop
def learnings() -> str:
    """Summarise what worked / flopped on this page from stored Insights."""
    posts = [p for p in history() if p.get("status") == "posted" and p.get("metrics")]
    if len(posts) < 3:
        return "Not enough data yet - rely on general best practice for Hindi mythology reels."

    def score(p):
        m = p["metrics"]
        return (m.get("views") or m.get("reach") or 0) + 30 * (m.get("shares") or 0) + 20 * (m.get("saved") or 0)

    posts.sort(key=score, reverse=True)

    def line(p):
        m = p["metrics"]
        return (f'- "{p.get("title")}" | hook: {p.get("hook")} | posted {p.get("date")} {p.get("slot")} | '
                f'views {m.get("views")}, reach {m.get("reach")}, shares {m.get("shares")}, '
                f'saves {m.get("saved")}, comments {m.get("comments")}, avg watch {m.get("ig_reels_avg_watch_time")}ms')

    top = "\n".join(line(p) for p in posts[:5])
    bottom = "\n".join(line(p) for p in posts[-5:]) if len(posts) > 5 else ""
    return f"BEST performing reels on this page:\n{top}\n\nWORST performing reels:\n{bottom or '(n/a)'}"


def recent_titles() -> list[str]:
    cutoff = (now() - dt.timedelta(days=CFG["quality"]["avoid_repeat_days"])).date().isoformat()
    return [p.get("title", "") for p in history() if p.get("date", "") >= cutoff]


# ---------------------------------------------------------------- steps
def _items(data, key):
    """Models sometimes return a bare list instead of {key: [...]}."""
    if isinstance(data, list):
        return data
    return data.get(key) or next((v for v in data.values() if isinstance(v, list)), [])

def ideas(signals: dict) -> list[dict]:
    prompt = f"""You are the head of content for "{PAGE['handle']}", a {PAGE['language']} Instagram Reels page about
{PAGE['niche']}. Today is {now().strftime('%A %d %B %Y')} (IST).

Your job: propose {CFG['quality']['ideas_per_run']} reel ideas that ride what is trending RIGHT NOW in this niche
(upcoming festivals/vrat in the next 1-7 days, mythology topics in the news/films, questions people search).
Only topics inside the niche. Never generic or random.

What works for Hindi mythology reels:
- A curiosity hook in the first 2 seconds: a surprising question or a rule people follow without knowing why
  (e.g. "साँझ को तुलसी क्यों नहीं तोड़ते?", "कर्ण को अपनी माँ का सच कब पता चला?").
- Lesser-known but authentic stories with a real scripture source.
- Emotional or dramatic turns (curses, boons, sacrifice, secrets), a satisfying "aha" answer at the end.
- Timing: festival stories posted 1-5 days before the festival.

TREND SIGNALS:
{json.dumps(signals, ensure_ascii=False, indent=1)[:12000]}

WHAT WORKED ON OUR PAGE:
{learnings()}

DO NOT repeat these recently posted stories: {json.dumps(recent_titles(), ensure_ascii=False)}

Return JSON: {{"ideas": [{{"title": str, "hook_hi": str (Hindi hook question, <= 12 words),
"story_summary": str, "scripture_source": str (exact text, e.g. "वाल्मीकि रामायण, उत्तरकाण्ड"),
"trend_reason": str, "festival_date": str or null}}]}}"""
    return _items(llm.ask_json(prompt, temperature=0.9), "ideas")


def critique(ideas_list: list[dict]) -> list[dict]:
    prompt = f"""You are a ruthless Instagram growth strategist and a scholar of Hindu scriptures.
Score each reel idea for the Hindi mythology page "{PAGE['handle']}" (today: {now():%d %B %Y}).
Most ideas are mediocre; be strict. Give 1-10 for:
hook (would a scrolling Indian viewer stop in 1 second?), curiosity, timing (is it trending / festival soon?),
shareability (would people send it to family WhatsApp groups?), accuracy (is it genuinely in the cited scripture?),
originality (fresh angle, not the most overdone version).
overall = weighted judgement (accuracy below 7 => overall at most 5).

IDEAS:
{json.dumps(ideas_list, ensure_ascii=False, indent=1)}

Return JSON: {{"scores": [{{"index": int, "hook": int, "curiosity": int, "timing": int, "shareability": int,
"accuracy": int, "originality": int, "overall": float, "reason": str}}]}}"""
    return _items(llm.ask_json(prompt, temperature=0.2), "scores")


def write_script(idea: dict) -> dict:
    prompt = f"""Write a {PAGE['language']} Instagram Reel script for the page "{PAGE['handle']}".

IDEA: {json.dumps(idea, ensure_ascii=False)}

RULES
- Length: about 60 seconds (~150-170 Hindi words) for a short story; a bigger story may go up to 90 seconds\n  (~230 words) but NEVER longer. Simple, punchy spoken Hindi - no filler.
- 12-20 scenes. Each scene's narration is 1 short sentence (6-14 words).
- Scene 1 type "hook": only the hook question (<= 12 words). Must create instant curiosity.
- Scene 2 type "source": names the scripture (e.g. "देवी भागवत पुराण में यह कथा आती है।").
- Middle scenes type "story": tell the story with rising drama. Stay faithful to the cited scripture;
  if versions differ, say so briefly. Never invent events.
- Second-last scene: the satisfying answer to the hook ("इसीलिए...").
- Last scene type "cta": ask viewers to comment a devotional phrase (e.g. "जय हनुमान") and follow.
- For each scene give 1-3 "highlight" words copied exactly from that scene's narration (names, key words).
- Optional "label": a short on-screen name tag for a character/object introduced in that scene (e.g. "सूर्यदेव").
- "image_prompt": English description of ONE clear illustration for the scene (characters, action, setting,
  mood, camera angle). Use the character names from "characters". No text in the image.
  Respectful: deities dignified, no gore.
- "characters": consistent English visual descriptions for every recurring character
  (age, skin tone, clothing colours, crown/ornaments, weapon/vehicle).
- Instagram caption (Hindi): line 1 = the hook; then 2-3 short lines with search keywords people actually type
  (one line in Hindi, one line in Hinglish - Roman-script Hindi as people type it, e.g. "तुलसी विवाह कथा" and "tulsi vivah kyu hota hai"); then a question to drive comments.
  No hashtags inside caption text.
- 3 to 5 hashtags only, highly relevant (mix Hindi and English), always include #{PAGE['handle']}.

Return JSON: {{"title": str, "hook": str, "source_title": str, "source_sub": str,
"characters": {{name: description}},
"scenes": [{{"type": "hook"|"source"|"story"|"cta", "narration": str, "highlight": [str],
"label": str or null, "image_prompt": str}}],
"cta_text": str (e.g. "जय हनुमान"), "caption": str, "hashtags": [str]}}"""
    out = llm.ask_json(prompt, temperature=0.7)
    return out[0] if isinstance(out, list) else out


def fact_check(script: dict) -> dict:
    narration = "\n".join(s["narration"] for s in script["scenes"])
    try:
        report = llm.search(f"""Fact-check this Hindi mythology reel narration against the cited scripture
({script.get('source_title')} {script.get('source_sub')}). Search reliable sources.
List every statement that is wrong, invented, or attributed to the wrong scripture, and give the correct
version. If everything is accurate, reply exactly: ALL CORRECT.

{narration}""")
    except Exception as e:
        log("fact-check search unavailable, doing a knowledge-only check:", str(e)[:120])
        report = llm.ask_json(f"""You are a scholar of Hindu scriptures. Check this Hindi reel narration against
{script.get('source_title')} {script.get('source_sub')}. Return JSON {{"report": "ALL CORRECT" or a list of
problems with corrections}}.

{narration}""", temperature=0.1).get("report", "ALL CORRECT")
        report = report if isinstance(report, str) else json.dumps(report, ensure_ascii=False)
    if "ALL CORRECT" in report.upper():
        log("fact-check: all correct")
        return script
    log("fact-check found issues, revising:", report[:400])
    fixed = llm.ask_json(f"""Revise this reel script JSON to fix the factual problems below.
Keep the same structure, style, length and hook. Only change what is needed.

PROBLEMS:
{report}

SCRIPT JSON:
{json.dumps(script, ensure_ascii=False)}

Return the full corrected script JSON.""", temperature=0.3)
    return fixed if fixed.get("scenes") else script


def plan(signals: dict) -> dict | None:
    idea_list = ideas(signals)
    if not idea_list:
        log("no ideas returned")
        return None
    scores = critique(idea_list)
    for s in scores:
        i = s.get("index", -1)
        if 0 <= i < len(idea_list):
            idea_list[i]["score"] = s
    ranked = sorted((i for i in idea_list if "score" in i),
                    key=lambda i: i["score"].get("overall", 0), reverse=True)
    for i in ranked:
        log(f'{i["score"].get("overall")}  {i["title"]}  -- {i["score"].get("reason", "")[:120]}')
    if not ranked or ranked[0]["score"].get("overall", 0) < CFG["quality"]["min_score"]:
        log("No idea reached the minimum score; skipping this slot.")
        return None
    best = ranked[0]
    script = fact_check(write_script(best))
    script["idea"] = best
    return script
