"""Hindi narration.

Primary: Gemini TTS (free tier, expressive, steerable with a style prompt) - one call for the whole
story, then scene boundaries are found from the pauses between paragraphs.
Fallback: Microsoft Edge neural voice (free) - one call per scene, exact timings.
"""
import asyncio
import os
import re
import ssl
import wave

from .common import CFG, log, media_duration, run

SR = 24000


def _gemini_tts(text: str, out_wav: str, voice: str | None = None):
    from google.genai import types
    from .llm import client, _retry

    def go():
        r = client().models.generate_content(
            model=CFG["models"]["tts"],
            contents=f"{CFG['models']['tts_style']}\n\n{text}",
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice or CFG["models"]["tts_voice"])))))
        return r.candidates[0].content.parts[0].inline_data.data
    pcm = _retry(go, tries=3)
    with wave.open(out_wav, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm)


def _edge_tts(text: str, out_mp3: str, rate: str | None = None):
    import edge_tts
    import edge_tts.communicate as c
    ca = os.environ.get("SSL_CERT_FILE") or ("/root/.ccr/ca-bundle.crt" if os.path.exists("/root/.ccr/ca-bundle.crt") else None)
    if ca:
        c._SSL_CTX = ssl.create_default_context(cafile=ca)
    asyncio.run(edge_tts.Communicate(text, CFG["models"]["fallback_voice"],
                                     rate=rate or CFG["models"].get("fallback_rate", "+0%"), pitch="-2Hz").save(out_mp3))


def _silences(path) -> list[tuple[float, float]]:
    p = run(["ffmpeg", "-hide_banner", "-i", str(path), "-af",
             "silencedetect=noise=-38dB:d=0.35", "-f", "null", "-"])
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", p.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", p.stderr)]
    return list(zip(starts, ends))


def _split_by_pauses(path, texts: list[str]) -> list[float]:
    total = media_duration(path)
    n = len(texts)
    sil = [s for s in _silences(path) if 0.3 < s[0] and s[1] < total - 0.2]
    weights = [max(len(t), 1) for t in texts]
    if len(sil) >= n - 1:
        # choose the n-1 longest pauses as scene boundaries
        chosen = sorted(sorted(sil, key=lambda s: s[1] - s[0], reverse=True)[:n - 1])
        bounds = [0.0] + [(a + b) / 2 for a, b in chosen] + [total]
        durs = [bounds[i + 1] - bounds[i] for i in range(n)]
        # sanity: each scene should roughly match its text length
        expect = [total * w / sum(weights) for w in weights]
        if all(d > 0.8 and 0.35 < d / e < 2.8 for d, e in zip(durs, expect)):
            return durs
        log("pause-based split looked wrong, using proportional split")
    return [total * w / sum(weights) for w in weights]


def narrate(texts: list[str], workdir) -> tuple[str, list[float], str]:
    """Return (audio_path, per-scene durations, engine)."""
    full = os.path.join(workdir, "voice.wav")
    try:
        if CFG["models"].get("voice_engine", "edge") != "gemini":
            raise RuntimeError("voice_engine is edge")
        _gemini_tts("\n\n".join(texts), full)
        durs = _split_by_pauses(full, texts)
        return full, durs, "gemini"
    except Exception as e:
        log("Gemini TTS failed, using Edge voice:", str(e)[:300])
    parts, durs = [], []
    gap = 0.25
    for i, t in enumerate(texts):
        mp3 = os.path.join(workdir, f"v{i:02d}.mp3")
        _edge_tts(t, mp3)
        parts.append(mp3)
        durs.append(media_duration(mp3) + gap)
    # concatenate with a short pause after each scene
    inputs, filt = [], []
    for i, p in enumerate(parts):
        inputs += ["-i", p]
        filt.append(f"[{i}:a]aresample={SR},apad=pad_dur={gap}[a{i}]")
    filt.append("".join(f"[a{i}]" for i in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1[out]")
    run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(filt),
         "-map", "[out]", "-ac", "1", full])
    return full, durs, "edge"
