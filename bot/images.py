"""Scene illustrations: Cloudflare Workers AI (free daily quota) -> Pollinations -> placeholder."""
import base64
import random
import urllib.parse

import requests
from PIL import Image, ImageDraw, ImageFilter

from .common import CFG, env, log

STYLE = CFG["images"]["style"]


def build_prompt(scene: dict, characters: dict) -> str:
    chars = "; ".join(f"{k}: {v}" for k, v in (characters or {}).items()
                      if k.lower() in scene["image_prompt"].lower())
    p = f"{scene['image_prompt']}. {('Characters: ' + chars + '.') if chars else ''} Style: {STYLE}"
    return p[:1900]


def _cloudflare(prompt: str, seed: int) -> bytes:
    acc, tok = env("CF_ACCOUNT_ID"), env("CF_API_TOKEN")
    model = CFG["images"]["cloudflare_model"]
    r = requests.post(f"https://api.cloudflare.com/client/v4/accounts/{acc}/ai/run/{model}",
                      headers={"Authorization": f"Bearer {tok}"},
                      json={"prompt": prompt, "steps": 8}, timeout=180)
    if r.status_code != 200:
        raise RuntimeError(f"Cloudflare {r.status_code}: {r.text[:400]}")
    if r.headers.get("content-type", "").startswith("image/"):
        return r.content
    return base64.b64decode(r.json()["result"]["image"])


def _pollinations(prompt: str, seed: int) -> bytes:
    url = ("https://image.pollinations.ai/prompt/" + urllib.parse.quote(prompt)
           + f"?width=864&height=1536&nologo=true&model=flux&seed={seed}")
    r = requests.get(url, timeout=240)
    r.raise_for_status()
    if not r.headers.get("content-type", "").startswith("image/"):
        raise RuntimeError("pollinations returned non-image")
    return r.content


def placeholder(path, text_seed: int = 0):
    rnd = random.Random(text_seed)
    w, h = 1080, 1920
    top = rnd.choice([(40, 30, 90), (25, 40, 80), (70, 25, 45)])
    bot = rnd.choice([(230, 140, 40), (200, 90, 30), (240, 180, 80)])
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        d.line([(0, y), (w, y)], fill=tuple(int(top[i] * (1 - t) + bot[i] * t) for i in range(3)))
    for _ in range(25):
        x, y, r = rnd.randint(0, w), rnd.randint(0, h), rnd.randint(30, 160)
        d.ellipse([x - r, y - r, x + r, y + r], outline=(255, 215, 120), width=3)
    img.filter(ImageFilter.GaussianBlur(2)).save(path, quality=92)


def generate(scene: dict, characters: dict, path, seed: int):
    prompt = build_prompt(scene, characters)
    providers = {"cloudflare": _cloudflare, "pollinations": _pollinations}
    order = [CFG["images"]["provider"]] + [p for p in providers if p != CFG["images"]["provider"]]
    for name in order:
        fn = providers.get(name)
        if not fn:
            continue
        for attempt in range(2):
            try:
                data = fn(prompt, seed + attempt)
                with open(path, "wb") as f:
                    f.write(data)
                Image.open(path).convert("RGB").save(path, quality=95)  # validate/normalise
                return name
            except Exception as e:
                log(f"image via {name} failed ({attempt + 1}/2): {str(e)[:200]}")
    log("all image providers failed -> placeholder")
    placeholder(path, seed)
    return "placeholder"
