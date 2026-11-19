# kathaaalok reel maker — instructions for the scheduled Claude runs

Once a day (early morning IST) you make BOTH of today's reels — 09:00 and 18:20 — plus a light
backup for each, for @kathaaalok, a Hindi mythology page. You write and draw it; GitHub Actions voices, renders, sends it to the owner's
Telegram for approval and posts it. **Never post to Instagram or message anyone yourself.**
Read and obey `GUIDELINES.md` (account safety, originality, music, religious content, growth).

## 0. Setup (each run starts fresh)
- Repo: `yash90-ship/kathaaalok-bot` (attach with add_repo if missing, clone to /home/user/kathaaalok-bot).
- `npm install` (playwright) and `apt-get install -y fonts-noto-core` if Devanagari fonts are missing.
- Slots (IST): 09:00 and 18:20 (`config.yaml`). Make today's two: ids `<YYYY-MM-DD>_0900` and `<YYYY-MM-DD>_1820`.
  Skip any id whose `jobs/<id>/` already exists.

## USAGE BUDGET (important — the owner's Claude plan is shared)
- Research once for both reels: at most ~10 WebSearch calls in total — spend them on research, not on re-checking.
- Reuse helpers and patterns from existing `jobs/*/scenes.js`; keep each scenes.js compact.
- At most 2 stills checks per reel. Don't re-read large files you already know.
- Backups are LIGHT: a new script.json that reuses the main reel's scene functions/backgrounds
  (only change what the new story needs). Never spend more on the backup than on the main reel.
- If you are running out of budget, finish and push the main reels first; skip backups.
- If nothing can be made, push nothing — the free fallback maker covers the slot.


## VIRAL CHECKLIST (score every idea and script against this — reject weak ones)
1. Timing: festival/vrat in the next 1–5 days, or a topic people are searching THIS week.
2. Hook (first 2 s, also caption line 1 and first frame): a question people actually ask, a surprising
   twist, or a rule they follow without knowing why ("साँझ को तुलसी क्यों नहीं तोड़ते?"). No slow intros.
3. Curiosity gap: the answer is revealed only near the end ("इसीलिए…") so people watch to the end.
4. Emotion: at least one dramatic turn (curse, boon, sacrifice, secret, miracle) — use the emotion director.
5. Shareable: something families forward on WhatsApp — a practice they follow, a festival meaning, a lesson.
6. Comment trigger: end with a devotional phrase to write ("जय श्री राम लिखिए") or a question about their home.
7. Lesser-known but authentic angle on a famous story beats a generic retelling.
8. Pacing: a new visual every 2–4 s, something moving in every scene, 55–75 s is the sweet spot.
9. Series: big stories → "Part 1" with a cliffhanger, Part 2 the next day.
10. Learn: favour the topics/hooks that did best in data/history.json; avoid what flopped.


## VARIETY (people must never feel "same video again")
- Before drawing, read `data/variety.json` (what recent reels used) and pick DIFFERENT:
  settings (forest, palace, battlefield, Kailash, ocean, river ghat, village, sky/clouds, cave, ashram, Patala…),
  time of day / colour palette (dawn gold, blue night, stormy, festive pink, misty green…),
  weather/ambience (rain, fireflies, falling petals, snow on Kailash, fog, sparkles),
  camera feel (slow push-in, side pan, top-down, close-up on a face, wide establishing shot),
  hook-frame style and ending style.
- Add at least ONE new drawn element per reel (an animal, prop, building or effect not used in the last
  week: peacock, elephant, horse, monkey army, boat, conch, chakra, mace, palace pillars, lotus pond,
  waterfall, rainbow…). Add it as a reusable helper function in `drawn/cutout.js` so the library grows.
- Mix characters: different deities/heroes, crowds vs. close-ups, vary poses and gestures.
- After pushing, append this reel's choices to `data/variety.json`
  (`{"id", "settings", "palette", "new_elements", "characters", "hook_style"}`); keep only the last 14.
- Budget rule still applies: one or two new elements per reel, not a full redraw of everything.

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
- Caption: hook line → a line of Hindi keywords → a line of HINGLISH keywords (AT LEAST 12 keywords in total, all specific to this video) (Roman-script Hindi people type,
  e.g. "Dev Uthani Ekadashi ki katha | Vishnu ji kyu sote hain") → relatable question → follow line.
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
