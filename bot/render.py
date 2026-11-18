"""Build the 9:16 reel: Ken-Burns motion on each illustration, Hindi captions with gold highlights,
name labels, source card, CTA card, crossfades, narration + optional background music."""
import os
import random
import re

from PIL import Image, ImageDraw, ImageFont

from .common import CFG, ROOT, log, media_duration, run

V = CFG["video"]
W, H, FPS, XF = V["width"], V["height"], V["fps"], V["crossfade"]
HANDLE = CFG["page"]["handle"]

FONT_DIRS = ["/usr/share/fonts/truetype/noto", str(ROOT / "assets" / "fonts")]
WHITE, GOLD, SAFFRON, MAROON, CREAM = (255, 255, 255), (255, 201, 74), (232, 120, 30), (110, 20, 30), (250, 238, 210)
STROKE = (20, 10, 5)


def font(size: int, serif: bool = False, latin: bool = False):
    name = f"Noto{'Serif' if serif else 'Sans'}{'' if latin else 'Devanagari'}-Bold.ttf"
    for d in FONT_DIRS:
        p = os.path.join(d, name)
        if os.path.exists(p):
            return ImageFont.truetype(p, size, layout_engine=ImageFont.Layout.RAQM)
    raise FileNotFoundError(f"Font {name} not found - install fonts-noto-core")


def wfont(word: str, size: int, serif: bool = False):
    """Devanagari font for Hindi words, Latin font for English words/handles."""
    return font(size, serif, latin=not re.search(r"[ऀ-ॿ]", word))


def clean(t: str) -> str:
    # strip emoji / symbols the fonts can't draw
    return re.sub(r"[^\w\sऀ-ॿ.,!?'\"()\-:@#।॥…]", "", t or "").strip()


def _norm(w: str) -> str:
    return re.sub(r"[^\wऀ-ॿ]", "", w)


def _widths(d, words, size, serif=False):
    return [d.textlength(w, font=wfont(w, size, serif)) for w in words]


def _line(d, words, size, cx, baseline, color_fn, stroke=0, stroke_fill=STROKE, serif=False):
    """Draw one centred line of mixed Hindi/English words on a shared baseline."""
    widths = _widths(d, words, size, serif)
    space = d.textlength(" ", font=font(size, serif, latin=True))
    x = cx - (sum(widths) + space * (len(words) - 1)) / 2
    for w, wd in zip(words, widths):
        d.text((x, baseline), w, font=wfont(w, size, serif), fill=color_fn(w), anchor="ls",
               stroke_width=stroke, stroke_fill=stroke_fill)
        x += wd + space
    return sum(widths) + space * (len(words) - 1)


def mixed(d, cx, cy, text, size, fill, stroke=0, stroke_fill=STROKE, serif=False):
    """Centred single line (cy = visual middle)."""
    return _line(d, clean(text).split(), size, cx, cy + size * 0.36, lambda w: fill, stroke, stroke_fill, serif)


def mixed_width(d, text, size, serif=False):
    words = clean(text).split()
    space = d.textlength(" ", font=font(size, serif, latin=True))
    return sum(_widths(d, words, size, serif)) + space * (len(words) - 1)


def draw_text(img, text, size, cy, highlight=(), max_w=920, color=WHITE, hl=GOLD, stroke=7, serif=False):
    d = ImageDraw.Draw(img)
    hl_set = {_norm(h) for phrase in highlight for h in phrase.split()}
    lines, cur = [], []
    for w in clean(text).split():
        if cur and mixed_width(d, " ".join(cur + [w]), size, serif) > max_w:
            lines.append(cur)
            cur = []
        cur.append(w)
    if cur:
        lines.append(cur)
    lh = int(size * 1.45)
    base = cy - lh * len(lines) / 2 + size * 1.05
    for line in lines:
        _line(d, line, size, W / 2, base, lambda w: hl if _norm(w) in hl_set else color, stroke, STROKE, serif)
        base += lh
    return img


def blank():
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


def caption_png(text, highlight, path):
    draw_text(blank(), text, 74, 400, highlight).save(path)


def hook_png(text, highlight, path):
    img = blank()
    d = ImageDraw.Draw(img)
    for y in range(0, 900):  # dark gradient behind the hook for readability
        d.line([(0, y), (W, y)], fill=(0, 0, 0, int(170 * (1 - y / 900))))
    draw_text(img, text, 92, 430, highlight, max_w=960, stroke=8).save(path)


def label_png(text, path):
    img = blank()
    d = ImageDraw.Draw(img)
    tw = mixed_width(d, text, 50)
    x0, y0 = (W - tw) / 2 - 36, 1430
    d.rounded_rectangle([x0, y0, x0 + tw + 72, y0 + 92], radius=46, fill=(*CREAM, 240), outline=(*SAFFRON, 255), width=5)
    mixed(d, W / 2, y0 + 46, text, 50, MAROON)
    img.save(path)


def card_png(title, sub, path):
    img = blank()
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = 150, 820, W - 150, 1120
    d.rounded_rectangle([x0 + 10, y0 + 12, x1 + 10, y1 + 12], radius=24, fill=(0, 0, 0, 110))
    d.rounded_rectangle([x0, y0, x1, y1], radius=24, fill=(*CREAM, 250), outline=(*MAROON, 255), width=6)
    d.rounded_rectangle([x0 + 16, y0 + 16, x1 - 16, y1 - 16], radius=16, outline=(*SAFFRON, 255), width=3)
    mixed(d, W / 2, y0 + 110, title, 64, MAROON, serif=True)
    d.line([(W / 2 - 160, y0 + 175), (W / 2 + 160, y0 + 175)], fill=SAFFRON, width=4)
    if sub:
        mixed(d, W / 2, y0 + 228, sub, 44, SAFFRON, serif=True)
    img.save(path)


def cta_png(cta_text, path):
    img = blank()
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill=(0, 0, 0, 90))
    tw = mixed_width(d, cta_text, 96)
    d.rounded_rectangle([(W - tw) / 2 - 50, 700, (W + tw) / 2 + 50, 860], radius=20, fill=(*MAROON, 245), outline=(*GOLD, 255), width=6)
    mixed(d, W / 2, 780, cta_text, 96, GOLD)
    mixed(d, W / 2, 930, "comment में लिखिए", 48, WHITE, stroke=5)
    t2 = f"Follow @{HANDLE}"
    tw2 = mixed_width(d, t2, 54)
    d.rounded_rectangle([(W - tw2) / 2 - 40, 1060, (W + tw2) / 2 + 40, 1160], radius=50, fill=(*SAFFRON, 250))
    mixed(d, W / 2, 1110, t2, 54, WHITE)
    img.save(path)


def watermark_png(path):
    img = blank()
    d = ImageDraw.Draw(img)
    mixed(d, W / 2, 150, f"@{HANDLE}", 36, (255, 255, 255, 170), stroke=3, stroke_fill=(0, 0, 0, 120))
    img.save(path)


def chunks(text: str, max_words=4, max_chars=24):
    words, out, cur = clean(text).split(), [], []
    for w in words:
        if cur and (len(cur) >= max_words or len(" ".join(cur + [w])) > max_chars):
            out.append(" ".join(cur))
            cur = []
        cur.append(w)
        if re.search(r"[,।!?…]$", w) and len(cur) >= 2:
            out.append(" ".join(cur))
            cur = []
    if cur:
        out.append(" ".join(cur))
    return out


def motion_filter(kind: str, L: float) -> str:
    n = max(int(L * FPS), 1)
    if kind in ("zoom_in", "zoom_out"):
        z = f"1+0.13*on/{n}" if kind == "zoom_in" else f"1.13-0.13*on/{n}"
        return (f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
                f"zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps={FPS}")
    # horizontal pan across a slightly larger frame
    ch = int(H * 2 * 1.08)
    cw = int(ch * W / H)
    x = f"(iw-{cw})*t/{L:.3f}" if kind == "pan_right" else f"(iw-{cw})*(1-t/{L:.3f})"
    return (f"scale=-2:{ch},scale='max(iw,{cw}+40)':-2,crop={cw}:{ch}:x='{x}':y='(ih-{ch})/2',"
            f"scale={W}:{H},fps={FPS}")


def render_scene(i, scene, script, img_path, d, L, work, wm):
    """Render one scene clip of length L (scene narration lasts d seconds)."""
    overlays = []  # (png, start, end)
    kind = scene.get("type", "story")
    t0 = XF if i > 0 else 0.0   # first XF seconds overlap the previous scene's fade
    t_end = d                   # after d the clip fades into the next scene
    if kind == "hook":
        p = f"{work}/o{i:02d}_hook.png"
        hook_png(scene["narration"], scene.get("highlight", []), p)
        overlays.append((p, 0, t_end))
    elif kind == "cta":
        p = f"{work}/o{i:02d}_cta.png"
        cta_png(script.get("cta_text") or "जय श्री राम", p)
        overlays.append((p, 0, L))
    else:
        if kind == "source":
            p = f"{work}/o{i:02d}_src.png"
            card_png(script.get("source_title", ""), script.get("source_sub", ""), p)
            overlays.append((p, t0, t_end))
        parts = chunks(scene["narration"])
        weights = [len(c) + 4 for c in parts]
        span = max(t_end - t0, 0.5)
        t = t0
        for j, (c, w) in enumerate(zip(parts, weights)):
            dur = span * w / sum(weights)
            p = f"{work}/o{i:02d}_c{j:02d}.png"
            caption_png(c, scene.get("highlight", []), p)
            overlays.append((p, t, t + dur))
            t += dur
        if scene.get("label"):
            p = f"{work}/o{i:02d}_lbl.png"
            label_png(scene["label"], p)
            overlays.append((p, t0 + 0.2, t_end))
    overlays.append((wm, 0, L))

    motions = ["zoom_in", "pan_right", "zoom_out", "pan_left"]
    kind_m = "zoom_in" if i == 0 else motions[i % len(motions)]
    inputs = ["-loop", "1", "-framerate", str(FPS), "-t", f"{L:.3f}", "-i", img_path]
    for p, _, _ in overlays:
        inputs += ["-i", p]
    chain = [f"[0:v]{motion_filter(kind_m, L)},format=yuv420p[b0]"]
    for k, (_, a, b) in enumerate(overlays):
        chain.append(f"[b{k}][{k+1}:v]overlay=0:0:enable='between(t,{a:.3f},{b:.3f})'[b{k+1}]")
    out = f"{work}/scene{i:02d}.mp4"
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(chain),
         "-map", f"[b{len(overlays)}]", "-t", f"{L:.3f}", "-r", str(FPS),
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", out])
    return out


def pick_music():
    d = ROOT / "assets" / "music"
    tracks = [p for p in d.glob("*") if p.suffix.lower() in (".mp3", ".m4a", ".wav", ".ogg")]
    return str(random.choice(tracks)) if tracks else None


def build(script: dict, images: list[str], voice_path: str, durations: list[float], work: str) -> str:
    os.makedirs(work, exist_ok=True)
    wm = f"{work}/watermark.png"
    watermark_png(wm)
    n = len(script["scenes"])
    durations = list(durations)
    durations[-1] += 1.2  # hold the CTA a moment after the voice ends
    clips = []
    for i, (scene, img, d) in enumerate(zip(script["scenes"], images, durations)):
        L = d + (XF if i < n - 1 else 0)
        clips.append(render_scene(i, scene, script, img, d, L, work, wm))
        log(f"scene {i+1}/{n} rendered ({d:.1f}s)")

    total = sum(durations)
    inputs = []
    for c in clips:
        inputs += ["-i", c]
    chain, prev, length = [], "[0:v]", durations[0] + XF
    for k in range(1, n):
        off = length - XF
        out = f"[x{k}]"
        chain.append(f"{prev}[{k}:v]xfade=transition=fade:duration={XF}:offset={off:.3f}{out}")
        prev = out
        length = off + (durations[k] + (XF if k < n - 1 else 0))
    chain.append(f"{prev}fade=t=out:st={total-0.6:.3f}:d=0.6[v]")

    a_idx = n
    inputs += ["-i", voice_path]
    music = pick_music()
    if music:
        inputs += ["-stream_loop", "-1", "-i", music]
        chain.append(f"[{a_idx}:a]aresample=48000,loudnorm=I=-15:TP=-1.5,apad[vo]")
        chain.append(f"[{a_idx+1}:a]aresample=48000,volume={V['music_volume']},afade=t=out:st={total-1.5:.3f}:d=1.5[mu]")
        chain.append("[vo][mu]amix=inputs=2:duration=first:normalize=0[a]")
    else:
        chain.append(f"[{a_idx}:a]aresample=48000,loudnorm=I=-15:TP=-1.5,apad[a]")

    final = f"{work}/reel.mp4"
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(chain),
         "-map", "[v]", "-map", "[a]", "-t", f"{total:.3f}",
         "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", str(FPS),
         "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart", final])
    run(["ffmpeg", "-y", "-v", "error", "-ss", "0.8", "-i", final, "-frames:v", "1", "-q:v", "2", f"{work}/cover.jpg"])
    log(f"reel ready: {final} ({media_duration(final):.1f}s)")
    return final
