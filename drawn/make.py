"""Build an animated hand-drawn reel from a reel folder.

reel folder must contain:
  script.json  - title, source_title, source_sub, cta_text, scenes[{type, narration, highlight, label}], caption, hashtags
  scenes.js    - window.SCENES = [fn(t, d, k) -> svg string, ...]  (one per scene, drawn with engine.js helpers)

usage: python -m drawn.make <reel_dir>
"""
import json
import os
import random
import subprocess
import sys

from bot.common import CFG, ROOT, log, media_duration, run
from bot.render import chunks
from bot.voice import _edge_tts

HERE = os.path.dirname(os.path.abspath(__file__))
GAP = 0.12
HOLD_END = 1.0
MAX_SECONDS = 90


def _norm(w):
    import re
    return re.sub(r"[^\wऀ-ॿ]", "", w)


def build(reel: str) -> str:
    script = json.load(open(os.path.join(reel, "script.json"), encoding="utf-8"))
    scenes = script["scenes"]
    vdir = os.path.join(reel, "vo")
    os.makedirs(vdir, exist_ok=True)

    # 1) narration, one clip per scene (exact timings)
    clips, durs = [], []
    for i, s in enumerate(scenes):
        mp3 = os.path.join(vdir, f"{i:02d}.mp3")
        if not os.path.exists(mp3):
            if CFG["models"].get("voice_engine") == "parler":
                from bot.voice_parler import speak
                speak(s["narration"], mp3, s.get("speaker", "narrator"), s.get("emotion", "calm"), seed=7 + i)
                log(f"voice {i + 1}/{len(scenes)} [{s.get('speaker', 'narrator')}/{s.get('emotion', 'calm')}]")
            else:
                for attempt in range(5):
                    try:
                        _edge_tts(s["narration"], mp3)
                        break
                    except Exception as e:
                        log("tts retry", i, e)
        clips.append(mp3)
        durs.append(media_duration(mp3) + GAP)
    # keep reels within the 90 s limit: re-voice faster once if the story runs long
    if sum(durs) + HOLD_END > MAX_SECONDS and CFG["models"].get("voice_engine") != "parler":
        rate = "+45%"
        log(f"story is {sum(durs):.0f}s - re-voicing at {rate} to stay under {MAX_SECONDS}s")
        for i, s in enumerate(scenes):
            _edge_tts(s["narration"], clips[i], rate=rate)
            durs[i] = media_duration(clips[i]) + GAP
        if sum(durs) + HOLD_END > MAX_SECONDS:
            raise SystemExit(f"Story too long ({sum(durs):.0f}s) - shorten the script to fit {MAX_SECONDS}s")
    if sum(durs) + HOLD_END > MAX_SECONDS:
        raise SystemExit(f"Story too long ({sum(durs):.0f}s) - shorten the script to fit {MAX_SECONDS}s")
    durs[-1] += HOLD_END

    # 2) timeline with caption timings
    tl_scenes, t = [], 0.0
    for i, (s, d) in enumerate(zip(scenes, durs)):
        parts = chunks(s["narration"], max_words=3, max_chars=20)
        w = [len(p) + 4 for p in parts]
        span, c0, caps = d - GAP, 0.0, []
        for p, wi in zip(parts, w):
            dd = span * wi / sum(w)
            caps.append({"text": p, "start": round(c0, 3), "end": round(c0 + dd, 3)})
            c0 += dd
        caps[-1]["end"] = round(d, 3)
        hl = [_norm(x) for h in s.get("highlight", []) for x in h.split()]
        for c in caps:
            c["hl"] = hl
        tl_scenes.append({"start": round(t, 3), "dur": round(d, 3), "type": s.get("type", "story"),
                          "narration": s["narration"], "label": s.get("label"), "captions": caps})
        t += d
    timeline = {"total": round(t, 3), "scenes": tl_scenes, "handle": CFG["page"]["handle"],
                "cta_text": script.get("cta_text", "जय श्री राम"), "source_title": script.get("source_title", ""),
                "source_sub": script.get("source_sub", "")}
    json.dump(timeline, open(os.path.join(reel, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False)
    with open(os.path.join(reel, "timeline.js"), "w", encoding="utf-8") as f:
        f.write("window.TIMELINE = " + json.dumps(timeline, ensure_ascii=False) + ";\n")

    # 3) frames -> silent video
    silent = os.path.join(reel, "silent.mp4")
    log(f"rendering {t:.1f}s of animation")
    if not (os.environ.get("REUSE_FRAMES") and os.path.exists(silent)):
        subprocess.run(["node", os.path.join(HERE, "render.js"), reel, silent, str(CFG["video"]["fps"])], check=True)

    # 4) audio: narration placed at each scene start (+ optional music)
    inputs, filt = [], []
    for i, (c, s) in enumerate(zip(clips, tl_scenes)):
        inputs += ["-i", c]
        ms = int(s["start"] * 1000)
        filt.append(f"[{i}:a]aresample=48000,adelay={ms}|{ms}[a{i}]")
    n = len(clips)
    filt.append("".join(f"[a{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0,loudnorm=I=-14:TP=-1.5[vo]")
    music_dir = ROOT / "assets" / "music"
    tracks = [p for p in music_dir.glob("*") if p.suffix.lower() in (".mp3", ".m4a", ".wav", ".ogg")]
    if tracks:
        inputs += ["-stream_loop", "-1", "-i", str(random.choice(tracks))]
        filt.append(f"[{n}:a]aresample=48000,volume={CFG['video']['music_volume']},afade=t=out:st={t - 2:.2f}:d=2[mu]")
        filt.append("[vo][mu]amix=inputs=2:duration=first:normalize=0[a]")
    else:
        filt.append("[vo]anull[a]")
    mix = os.path.join(reel, "mix.wav")
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(filt), "-map", "[a]",
         "-t", f"{t:.3f}", "-ar", "48000", "-ac", "2", mix])

    out = os.path.join(reel, "reel.mp4")
    run(["ffmpeg", "-y", "-v", "error", "-i", silent, "-i", mix, "-map", "0:v", "-map", "1:a",
         "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p", "-r", str(CFG["video"]["fps"]),
         "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-t", f"{t:.3f}", out])
    run(["ffmpeg", "-y", "-v", "error", "-ss", "1.0", "-i", out, "-frames:v", "1", "-q:v", "2",
         os.path.join(reel, "cover.jpg")])
    log(f"reel ready: {out} ({media_duration(out):.1f}s)")
    return out


if __name__ == "__main__":
    build(sys.argv[1])
