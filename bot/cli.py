"""Entry point.

  python -m bot.cli generate [--slot 13:00|auto]   find trend -> script -> reel -> Telegram
  python -m bot.cli publish  [--slot 13:00|auto]   post the approved reel to Instagram
  python -m bot.cli insights                        pull stats for recent posts (learning loop)
  python -m bot.cli sample --script file.json       render a reel from a ready script (testing)
  python -m bot.cli voices                          render the same lines in several Gemini voices
"""
import argparse
import datetime as dt
import json
import os
import time

from . import images, planner, publish, render, trends, voice
from .common import (CFG, OUT, PENDING, approval_required, history, load_json, log, now,
                     save_history, save_json)


def _slot_dt(slot: str, day: dt.date) -> dt.datetime:
    h, m = map(int, slot.split(":"))
    return dt.datetime.combine(day, dt.time(h, m), tzinfo=now().tzinfo)


def resolve_slot(arg: str, mode: str) -> tuple[str, str]:
    """Return (date_iso, 'HH:MM'). auto: generate -> next upcoming slot; publish -> nearest slot."""
    t = now()
    if arg != "auto":
        return t.date().isoformat(), arg
    cands = [(_slot_dt(s, t.date() + dt.timedelta(days=k)), s) for k in (0, 1) for s in CFG["slots"]]
    if mode == "generate":
        when, s = min((c for c in cands if c[0] > t), key=lambda c: c[0])
    else:
        when, s = min(cands + [(_slot_dt(s, t.date() - dt.timedelta(days=1)), s) for s in CFG["slots"]],
                      key=lambda c: abs((c[0] - t).total_seconds()))
    return when.date().isoformat(), s


def full_caption(script: dict) -> str:
    tags = []
    for h in script.get("hashtags", []):
        h = "#" + h.strip().lstrip("#").replace(" ", "")
        if h.lower() not in (x.lower() for x in tags):
            tags.append(h)
    handle = "#" + CFG["page"]["handle"]
    if handle.lower() not in (x.lower() for x in tags):
        tags = tags[:4] + [handle]
    return (script.get("caption", "").strip() + "\n\n" + " ".join(tags[:5]))[:2150]


def make_reel(script: dict, work: str) -> str:
    os.makedirs(work, exist_ok=True)
    save_json(f"{work}/script.json", script)
    imgs, providers = [], []
    for i, scene in enumerate(script["scenes"]):
        p = f"{work}/img{i:02d}.jpg"
        providers.append(images.generate(scene, script.get("characters", {}), p, seed=1000 + i * 7))
        imgs.append(p)
        log(f"image {i+1}/{len(script['scenes'])} via {providers[-1]}")
    audio, durs, engine = voice.narrate([s["narration"] for s in script["scenes"]], work)
    log("voice engine:", engine)
    return render.build(script, imgs, audio, durs, work)


# ------------------------------------------------------------------ commands
def cmd_generate(a):
    day, slot = resolve_slot(a.slot, "generate")
    item_id = f"{day}_{slot.replace(':', '')}"
    pfile = PENDING / f"{item_id}.json"
    if pfile.exists() and not (a.force or a.dry_run):
        log("already generated:", item_id)
        return
    script = planner.plan(trends.collect())
    if not script and a.dry_run:
        log("dry run: no idea passed the quality bar")
        return
    if not script:
        save_json(pfile, {"id": item_id, "date": day, "slot": slot, "status": "skipped",
                          "reason": "no idea scored high enough"})
        publish.tg_message(f"⏭ {day} {slot}: no trending idea was strong enough, so this slot is skipped.")
        return
    work = str(OUT / item_id)
    video = make_reel(script, work)
    caption = full_caption(script)
    if a.dry_run:
        with open(f"{work}/caption.txt", "w", encoding="utf-8") as f:
            f.write(caption)
        log("dry run done:", video)
        try:  # share the preview: Telegram (to your phone) + a copy in the media repo
            pid = f"previews/{item_id}_{now():%H%M}"
            publish.upload_media(video, pid + ".mp4")
            publish.upload_media(f"{work}/script.json", pid + ".json")
            sc = script["idea"].get("score", {})
            publish.tg_send_for_approval(video, item_id, f"👀 PREVIEW ONLY (not posted)\n🎬 {script.get('title')}\n"
                                         f"⭐ {sc.get('overall')}/10 — {sc.get('reason', '')[:200]}\n\n{caption}", False)
        except Exception as e:
            log("preview sharing failed:", e)
        return
    video_url = publish.upload_media(video, f"videos/{item_id}.mp4")
    cover_url = publish.upload_media(f"{work}/cover.jpg", f"covers/{item_id}.jpg")
    need = approval_required(dt.date.fromisoformat(day))
    sc = script["idea"].get("score", {})
    item = {"id": item_id, "date": day, "slot": slot, "status": "ready", "approval_required": need,
            "title": script.get("title"), "hook": script.get("hook"), "score": sc,
            "trend_reason": script["idea"].get("trend_reason"), "caption": caption,
            "video_url": video_url, "video_path": f"videos/{item_id}.mp4", "cover_url": cover_url,
            "created_at": now().isoformat()}
    save_json(pfile, item)
    head = (f"🎬 {script.get('title')}\n⏰ Posts {day} at {slot} IST\n⭐ Score {sc.get('overall')}/10 — "
            f"{sc.get('reason', '')[:200]}\n📈 Why now: {item['trend_reason']}\n\n")
    if need:
        head += "Tap ✅ Post to approve or ❌ Skip. No answer before the slot = skipped.\n\n"
    publish.tg_send_for_approval(video, item_id, head + caption, need)
    log("generated", item_id)


def cmd_publish(a):
    day, slot = resolve_slot(a.slot, "publish")
    item_id = f"{day}_{slot.replace(':', '')}"
    pfile = PENDING / f"{item_id}.json"
    item = load_json(pfile, None)
    if not item or item.get("status") != "ready":
        log("nothing ready to publish for", item_id, (item or {}).get("status"))
        return
    if item.get("approval_required"):
        d = publish.tg_decision(item_id)
        if d != "ok":
            item["status"] = "skipped" if d == "no" else "skipped_no_answer"
            save_json(pfile, item)
            publish.tg_message(f"⏭ Not posted ({'you tapped Skip' if d == 'no' else 'no approval received'}): {item['title']}")
            return
    url = item["video_url"]
    if not publish.wait_public(url, timeout=300):
        url = publish.raw_url(item["video_path"])
        log("Pages URL not live, using raw URL")
    try:
        res = publish.ig_publish_reel(url, item["caption"], item.get("cover_url"))
    except Exception as e:
        item["status"] = "failed"
        item["error"] = str(e)[:1000]
        save_json(pfile, item)
        publish.tg_message(f"⚠️ Posting failed for {item['title']}:\n{str(e)[:800]}")
        raise
    item.update(res, status="posted", posted_at=now().isoformat())
    save_json(pfile, item)
    h = history()
    h.append({k: item.get(k) for k in ("id", "date", "slot", "title", "hook", "score", "trend_reason",
                                       "media_id", "permalink", "status", "posted_at")})
    save_history(h)
    publish.tg_message(f"✅ Posted: {item['title']}\n{res.get('permalink', '')}")


def cmd_insights(a):
    h = history()
    cutoff = (now() - dt.timedelta(days=14)).isoformat()
    n = 0
    for p in h:
        if p.get("status") == "posted" and p.get("media_id") and (p.get("posted_at") or "") >= cutoff:
            m = publish.ig_insights(p["media_id"])
            if m:
                p["metrics"] = m
                p["metrics_at"] = now().isoformat()
                n += 1
    save_history(h)
    log(f"updated insights for {n} posts")


def cmd_sample(a):
    script = load_json(a.script, None)
    script.setdefault("idea", {})
    work = str(OUT / ("sample_" + time.strftime("%H%M%S")))
    video = make_reel(script, work)
    print("VIDEO:", video)
    print("CAPTION:\n" + full_caption(script))


def cmd_voices(a):
    os.makedirs(OUT / "voices", exist_ok=True)
    text = ("क्या आप जानते हैं... बचपन में हनुमान जी ने सूर्य को फल समझकर निगलने की कोशिश क्यों की थी?\n\n"
            "एक सुबह, नन्हे हनुमान को बहुत भूख लगी। आकाश में उगता हुआ लाल सूर्य उन्हें एक पका हुआ फल लगा... "
            "और वे उड़ चले, सीधे सूर्य की ओर!")
    for v in a.names.split(","):
        try:
            voice._gemini_tts(text, str(OUT / "voices" / f"gemini_{v}.wav"), voice=v)
            log("ok", v)
            time.sleep(8)
        except Exception as e:
            log("voice failed", v, str(e)[:300])


def cmd_check(a):
    """Verify every secret works, without posting anything."""
    import requests
    from .common import env as _env
    results = {}

    def t(name, fn):
        try:
            results[name] = "OK " + str(fn() or "")
        except Exception as e:
            results[name] = "FAIL " + str(e)[:300]

    t("GEMINI_API_KEY", lambda: __import__("bot.llm", fromlist=["x"]).ask_json('Return JSON {"ok": true}')["ok"])
    def gimg():
        data = images._gemini("a golden diya on a temple step, Indian miniature painting", 1)
        open("/tmp/g.png", "wb").write(data)
        return f"image {len(data)} bytes"
    t("GEMINI IMAGES", gimg)
    t("CF (images)", lambda: images._cloudflare("a golden diya on a temple step, miniature painting", 1) and "image received")

    def ig():
        base, tok = publish._graph()
        r = requests.get(f"{base}/{_env('IG_USER_ID')}", params={"fields": "username", "access_token": tok}, timeout=30)
        r.raise_for_status()
        return "@" + r.json().get("username", "?")
    t("INSTAGRAM", ig)

    def media():
        repo = CFG["media"]["repo"]
        r = requests.get(f"https://api.github.com/repos/{repo}", timeout=30,
                         headers={"Authorization": f"Bearer {_env('MEDIA_REPO_TOKEN')}"})
        r.raise_for_status()
        if not r.json().get("permissions", {}).get("push"):
            raise RuntimeError("token has no write access to " + repo)
        return repo
    t("MEDIA_REPO_TOKEN", media)
    t("TELEGRAM", lambda: publish._tg("sendMessage", data={"chat_id": _env("TELEGRAM_CHAT_ID"),
        "text": "✅ kathaaalok bot connected. Reels will arrive here for approval."}) and "message sent")
    try:
        for m in __import__("bot.llm", fromlist=["x"]).client().models.list():
            print("GEMINI MODEL:", m.name, getattr(m, "supported_actions", ""))
    except Exception as e:
        print("GEMINI MODELS: list failed", str(e)[:200])
    try:
        r = requests.get(f"https://api.cloudflare.com/client/v4/accounts/{_env('CF_ACCOUNT_ID')}/ai/models/search",
                         params={"task": "Text-to-Image"}, timeout=30,
                         headers={"Authorization": f"Bearer {_env('CF_API_TOKEN')}"})
        print("CF IMAGE MODELS:", ", ".join(m["name"] for m in r.json().get("result", [])) or r.text[:300])
        r = requests.get(f"https://api.cloudflare.com/client/v4/accounts/{_env('CF_ACCOUNT_ID')}/ai/models/search",
                         params={"task": "Text-to-Speech"}, timeout=30,
                         headers={"Authorization": f"Bearer {_env('CF_API_TOKEN')}"})
        for m in r.json().get("result", []):
            print("CF TTS MODEL:", m["name"], "|", (m.get("description") or "")[:200].replace("\n", " "))
            sc = requests.get(f"https://api.cloudflare.com/client/v4/accounts/{_env('CF_ACCOUNT_ID')}/ai/models/schema",
                              params={"model": m["name"]}, timeout=30, headers={"Authorization": f"Bearer {_env('CF_API_TOKEN')}"})
            print("CF TTS SCHEMA:", m["name"], sc.text[:700].replace("\n", " "))
    except Exception as e:
        print("CF IMAGE MODELS: failed", str(e)[:200])
    for k, v in results.items():
        print(f"{k:18} {v}")
    if any(v.startswith("FAIL") for v in results.values()):
        raise SystemExit(1)


def main():
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    g = sp.add_parser("generate"); g.add_argument("--slot", default="auto"); g.add_argument("--force", action="store_true")
    g.add_argument("--dry-run", action="store_true", help="make the reel only: no upload, Telegram or posting")
    p = sp.add_parser("publish"); p.add_argument("--slot", default="auto")
    sp.add_parser("insights")
    sp.add_parser("check")
    s = sp.add_parser("sample"); s.add_argument("--script", required=True)
    v = sp.add_parser("voices"); v.add_argument("--names", default="Charon,Orus,Fenrir,Iapetus,Algenib,Sadaltager")
    a = ap.parse_args()
    {"generate": cmd_generate, "publish": cmd_publish, "insights": cmd_insights,
     "sample": cmd_sample, "voices": cmd_voices, "check": cmd_check}[a.cmd](a)


if __name__ == "__main__":
    main()
