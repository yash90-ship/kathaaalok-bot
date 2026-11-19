# kathaaalok reel maker — instructions for the scheduled Claude runs

You make ONE Instagram reel (+ one backup) for the next posting slot of @kathaaalok, a Hindi
mythology page. You write and draw it; GitHub Actions voices, renders, sends it to the owner's
Telegram for approval and posts it. **Never post to Instagram or message anyone yourself.**
Read and obey `GUIDELINES.md` (account safety, originality, music, religious content, growth).

## 0. Setup (each run starts fresh)
- Repo: `yash90-ship/kathaaalok-bot` (attach with add_repo if missing, clone to /home/user/kathaaalok-bot).
- `npm install` (playwright) and `apt-get install -y fonts-noto-core` if Devanagari fonts are missing.
- Slots (IST): 09:00 and 18:20 (`config.yaml`). Work out the NEXT slot from the current IST time.
- Job id: `<YYYY-MM-DD>_<HHMM>` e.g. `2026-11-20_0900`. If `jobs/<id>/` already exists, stop.

## 1. What kind of reel
`config.yaml > weekly_plan`: Wednesday 18:20 = Dadi ji + Chintu conversation, Saturday 18:20 =
Dadaji + Chinki conversation. Every other slot = mythology story narrated by Aman (speaker "narrator").

## 2. Research (use WebSearch) — this decides reach, be thorough
- Hindu festivals / vrat / tithis in the next 7 days with exact dates (reliable Panchang).
- Mythology topics trending this week (news, films/serials, viral questions), Google-style questions
  people search (Hindi + Hinglish + English phrases).
- What worked before: `data/history.json` (metrics), `data/research/*_report.md`.
- Do not repeat a story posted in the last 30 days (titles in `data/history.json`, `jobs/`, `queue/`).
- Write 8–10 ideas, score each strictly 1–10 (hook, curiosity, timing, shareability, scripture accuracy,
  originality). Best idea ≥ 7.5 → main reel; second best → backup. Festival stories 1–5 days before.

## 3. Script → `jobs/<id>/script.json`
```
{title, hook, source_title, source_sub, cta_text, caption, hashtags[3-5],
 scenes: [{type: hook|source|story|cta, speaker, emotion, narration, highlight[], label}]}
```
- 12–18 scenes, ~60 s (big stories up to 90 s, never more). One short spoken sentence per scene.
- speaker: narrator | dadi | chintu | dadaji | chinki | god | female.
- emotion (emotion director): calm, curious, happy, excited, dramatic, angry, fear, sad, devotional, wise, surprised.
  Music automatically follows these emotions.
- Hook = curiosity question in the first line. Scene 2 = scripture source (be exact; if unsure, "पौराणिक मान्यता").
- Simple spoken Hindi; avoid heavy Sanskrit compounds. If a word is hard to pronounce, add it to
  `data/pronunciation.json` ("written": "spoken-respelling").
- Fact-check every claim with WebSearch against the cited scripture before writing scenes.
- Caption: hook line → 2–3 keyword lines (Hindi + Hinglish search phrases) → relatable question → follow line.
  Hashtags: 1 broad, 1–2 niche, 1 festival/trending, #kathaaalok.
- Conversation reels: the child asks a relatable question, the grandparent answers and narrates;
  the child reacts in between ("फिर क्या हुआ?"); end at home with the lesson + CTA.

## 4. Scenes → `jobs/<id>/scenes.js`
`window.SCENES = [ (t, d, k) => svg, ... ]` — one function per scene, drawn with `drawn/engine.js` and
`drawn/cutout.js` (paper-cutout style). Key helpers:
- Characters: `puppet(x, y, scale, t, {kind, seated, talk, arms:{l:[a,b], r:[a,b]}, item:{l|r: bow|trishul|diya|lotus|stick}, aim, pull})`
  kinds: man, sage, shiva, vishnu, lakshmi, brahma, deva, asura, dadi, dadaji, chintu, chinki.
  Set `talk: true` only for the character who speaks that line.
- Places: cVillage(t, "evening"|"night"|"day"), cHome, cSky, cSunrise, cMountain, cHill, cRiver, cMilkOcean,
  cTemple, cTree, cBush, cCloud, cSun, cMoon, cLily, cTulsi, cHut, cCharpai, cHaystack, cBorder.
- Animals/objects: cCow, cDog, cBird, cShesha, cCity, cChariot, cDiya, flame, embers, rays, glow, flash.
- Look at `jobs/test_conv_*` and `reels/test_tripura` for complete examples. Keep subtitles' area
  (top 290–520 px) clear of key faces; characters large; something moves in every scene.
- Check: `node drawn/stills.js jobs/<id> /tmp/stills` and LOOK at the images (needs a temporary
  `timeline.js`; see how earlier runs built one). Fix anything broken before continuing.

## 5. Backup + hand-off
- Same for the second idea into `backups/<id>/` (script.json + scenes.js + meta.json).
- `jobs/<id>/meta.json`: `{"id": "<id>", "mode": "post", "date": "YYYY-MM-DD", "slot": "HH:MM",
  "score": {...}, "trend_reason": "..."}`
- Commit and push to `main`. The push starts "5 - Render drawn reel" automatically (voice + render +
  Telegram approval). Done — do not wait for it.
