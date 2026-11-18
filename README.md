# kathaaalok reel bot

Automatic Hindi mythology Reels for Instagram **@kathaaalok**: trending topic → strict quality check →
fact-checked script → AI illustrations + Hindi narration → captions → Telegram approval → auto-post at 1 PM and 8 PM IST.
Everything runs free on GitHub Actions.

## How a slot works
| Time (IST) | Workflow | What happens |
|---|---|---|
| ~12:07 / ~19:07 | **1 - Generate reel** | Finds what's trending in mythology (festival calendar, Google Trends, news, Reddit, live Google search), writes 10 ideas, a strict critic scores them, best idea ≥ 8/10 becomes a fact-checked script, then images + voice + video. The reel is sent to Telegram with ✅ Post / ❌ Skip. If nothing scores 8+, the slot is skipped. |
| ~12:57 / ~19:57 | **2 - Publish reel** | If approved (or approval period is over) the reel is posted with caption, keywords and 3–5 hashtags. |
| ~08:41 daily | **3 - Learn from insights** | Pulls views, reach, shares, saves, watch time; the next ideas are scored using what worked on this page. |

## Secrets (Settings → Secrets and variables → Actions)
`IG_ACCESS_TOKEN`, `IG_USER_ID`, `GEMINI_API_KEY`, `CF_ACCOUNT_ID`, `CF_API_TOKEN`,
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `MEDIA_REPO_TOKEN` (fine-grained token with Contents read/write on `kathaaalok-media`).

## Settings
Edit `config.yaml`: slots, approval end date, minimum score, voice, art style, music volume.
Put royalty-free music (mp3) in `assets/music/` to add background music.

## Manual runs (Actions tab → workflow → Run workflow)
- **1 - Generate reel** with *dry run* ticked: makes a preview reel only (download it from the run's Artifacts).
- **Test - Voice samples**: renders the same lines in several Gemini voices.

## Local
```
pip install -r requirements.txt   # plus ffmpeg and fonts-noto-core
python -m bot.cli sample --script examples/hanuman_surya.json
```
