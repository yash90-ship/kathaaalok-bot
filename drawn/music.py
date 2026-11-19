"""Original background music, synthesised from scratch (no samples, no copyright).

Moods: calm (tanpura + bansuri), devotional (tanpura + bansuri + manjira + soft tabla),
festive (tabla keherwa + bells + bright flute), dramatic (low drone + dhol + tension pulses),
sad (bhairavi-scale flute, slow, soft drone).
A reel's music follows its story: each scene's emotion picks a mood and moods crossfade.
"""
import wave

import numpy as np

SR = 44100
SA = 138.6  # C#3 - comfortable male narration key

SCALES = {  # semitone offsets from Sa
    "yaman": [0, 2, 4, 6, 7, 9, 11, 12],
    "bhairavi": [0, 1, 3, 5, 7, 8, 10, 12],
    "khamaj": [0, 2, 4, 5, 7, 9, 10, 12],
    "pentatonic": [0, 2, 4, 7, 9, 12],
}
EMOTION_MOOD = {"calm": "calm", "wise": "calm", "curious": "calm", "surprised": "calm",
                "devotional": "devotional", "happy": "festive", "excited": "festive",
                "dramatic": "dramatic", "angry": "dramatic", "fear": "dramatic", "sad": "sad"}


def _env(n, a=.01, r=.3):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr and nr < n: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def _place(buf, x, at):
    i = int(at * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i]


def tanpura(dur, sa=SA, vol=.16):
    out = np.zeros(int(dur * SR))
    strings = [sa * 1.5 / 2, sa, sa, sa / 2]  # Pa (lower), Sa, Sa, low Sa
    t = np.arange(int(4.5 * SR)) / SR
    cycle, k = 2.6, 0
    while k * cycle / 4 < dur:
        f = strings[k % 4]
        tone = sum(np.sin(2 * np.pi * f * h * t + h) / h ** .9 * (1 + .6 * np.sin(2 * np.pi * .7 * t * h / 6)) for h in range(1, 14))
        tone *= np.exp(-t / 2.2) * _env(len(t), .02, .5)
        _place(out, tone * vol / 4, k * cycle / 4)
        k += 1
    return out


def flute_note(f, d, vol=.22, vib=5.2):
    n = int(d * SR); t = np.arange(n) / SR
    v = 1 + .006 * np.sin(2 * np.pi * vib * t) * np.clip(t / .25, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * v) / SR
    tone = np.sin(ph) + .18 * np.sin(2 * ph) + .06 * np.sin(3 * ph)
    breath = np.random.default_rng(int(f)).normal(0, 1, n)
    breath = np.convolve(breath, np.ones(8) / 8, "same") * .05
    return (tone + breath) * _env(n, .07, min(.25, d / 2)) * vol


def melody(dur, scale, sa=SA * 2, seed=1, step=(.6, 1.4), vol=.2, rest=.25):
    rng = np.random.default_rng(seed)
    out = np.zeros(int(dur * SR)); t, idx = .8, 0
    sc = SCALES[scale]
    while t < dur - 1:
        d = rng.uniform(*step)
        if rng.random() > rest:
            idx = int(np.clip(idx + rng.choice([-2, -1, -1, 1, 1, 2, 0]), 0, len(sc) - 1))
            _place(out, flute_note(sa * 2 ** (sc[idx] / 12), d * 1.1, vol), t)
        t += d
    return out


def drum(kind):
    n = int(.5 * SR); t = np.arange(n) / SR
    noise = np.random.default_rng(3).normal(0, 1, n)
    if kind == "dha":   # bayan + dayan
        return (np.sin(2 * np.pi * (70 + 40 * np.exp(-t * 18)) * t) * np.exp(-t * 7) * .9 +
                np.sin(2 * np.pi * SA * 2 * t) * np.exp(-t * 14) * .5 + noise * np.exp(-t * 90) * .15)
    if kind == "na":
        return np.sin(2 * np.pi * SA * 2 * t) * np.exp(-t * 16) * .6 + np.sin(2 * np.pi * SA * 4.1 * t) * np.exp(-t * 30) * .2 + noise * np.exp(-t * 120) * .12
    if kind == "dhol":
        return np.sin(2 * np.pi * (55 + 60 * np.exp(-t * 25)) * t) * np.exp(-t * 6) * 1.1 + noise * np.exp(-t * 60) * .3
    if kind == "bell":
        return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * dcy) * a for f, dcy, a in ((2730, 5, .3), (4100, 7, .2), (6320, 9, .12)))
    return np.zeros(n)


def rhythm(dur, pattern, bpm, vol=.35, swing=0.0):
    out = np.zeros(int(dur * SR)); beat = 60 / bpm; t, i = .5, 0
    hits = {k: drum(k) for k in set(pattern) if k != "-"}
    while t < dur:
        k = pattern[i % len(pattern)]
        if k != "-": _place(out, hits[k] * vol, t + (swing * beat if i % 2 else 0))
        t += beat / 2; i += 1
    return out


def track(mood, dur, seed=1):
    if mood == "calm":
        x = tanpura(dur) + melody(dur, "yaman", seed=seed, vol=.16, rest=.4)
    elif mood == "devotional":
        x = tanpura(dur) + melody(dur, "khamaj", seed=seed, vol=.18, rest=.25) + rhythm(dur, ["bell", "-", "-", "-"], 70, .18) + rhythm(dur, ["dha", "-", "na", "-", "na", "-", "dha", "na"], 70, .2)
    elif mood == "festive":
        x = tanpura(dur, vol=.1) + melody(dur, "pentatonic", seed=seed, step=(.25, .5), vol=.18, rest=.15) + \
            rhythm(dur, ["dha", "na", "na", "dha", "na", "na", "dha", "na"], 100, .3) + rhythm(dur, ["bell", "-", "bell", "-"], 100, .14)
    elif mood == "dramatic":
        n = int(dur * SR); t = np.arange(n) / SR
        drone = sum(np.sin(2 * np.pi * SA / 2 * h * t) / h for h in range(1, 8)) * .12 * (1 + .3 * np.sin(2 * np.pi * .25 * t))
        pulse = np.sin(2 * np.pi * SA / 2 * 1.06 * t) * .05 * (np.sin(2 * np.pi * 2 * t) > 0)
        x = drone + pulse + rhythm(dur, ["dhol", "-", "-", "dhol", "dhol", "-", "dhol", "-"], 110, .45) + melody(dur, "bhairavi", seed=seed, step=(.3, .6), vol=.1, rest=.5)
    elif mood == "sad":
        x = tanpura(dur, vol=.1) + melody(dur, "bhairavi", seed=seed, step=(1.0, 1.8), vol=.17, rest=.3)
    else:
        x = tanpura(dur)
    return x


def score(scenes: list[dict], durations: list[float], out_wav: str, seed=7):
    """Music that follows the story: per-scene mood with 1 s crossfades."""
    total = sum(durations)
    moods = [EMOTION_MOOD.get(s.get("emotion", "calm"), "calm") for s in scenes]
    n = int(total * SR) + SR
    mix = np.zeros(n)
    tracks = {m: track(m, total + 1, seed) for m in set(moods)}
    start = 0.0
    for m, d in zip(moods, durations):
        env = np.zeros(n)
        a, b = int(max(start - .5, 0) * SR), int(min(start + d + .5, total + 1) * SR)
        env[a:b] = 1
        ramp = int(.5 * SR)
        env[a:a + ramp] *= np.linspace(0, 1, ramp)[: len(env[a:a + ramp])] if start > 0 else 1
        env[max(b - ramp, a):b] *= np.linspace(1, 0, b - max(b - ramp, a))
        mix += tracks[m][:n] * env
        start += d
    fade = int(2 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
    mix = mix / (np.abs(mix).max() + 1e-9) * .8
    st = np.stack([mix, np.roll(mix, int(.012 * SR)) * .95], 1)  # slight stereo width
    with wave.open(out_wav, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    return out_wav


if __name__ == "__main__":
    import sys
    for m in ["calm", "devotional", "festive", "dramatic", "sad"]:
        score([{"emotion": {"calm": "calm", "devotional": "devotional", "festive": "happy", "dramatic": "dramatic", "sad": "sad"}[m]}], [20], f"{sys.argv[1]}/music_{m}.wav")
        print("made", m)
