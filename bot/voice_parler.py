"""Free Hindi narration with AI4Bharat Indic Parler-TTS + an emotion director.

Each script line carries `speaker` and `emotion`; the emotion becomes a speaking-style description.
Voice = "Aman" (first version the owner approved). Kids get a lighter, pitched-up voice.
"""
import os
import subprocess

EMOTIONS = {  # emotion -> how the line is performed
    "calm":       "narrates a story in a calm, warm and gentle tone at a moderate pace",
    "curious":    "speaks with curiosity and wonder, slightly rising, at a moderate pace",
    "happy":      "speaks happily and cheerfully, energetic and joyful",
    "excited":    "speaks with great excitement and energy, fast and expressive",
    "dramatic":   "speaks with intense drama and emotion, loud and fast, like the climax of a story",
    "angry":      "speaks with intense anger, loud, sharp and forceful",
    "fear":       "speaks with fear and tension, in a hushed, trembling voice",
    "sad":        "speaks slowly with deep sadness and emotion, with soft pauses",
    "devotional": "speaks with joyful devotion, reverent and uplifting",
    "wise":       "speaks slowly and wisely, kind and reassuring, like an elder telling a story",
    "surprised":  "speaks with surprise and amazement, expressive",
}
# speaker -> (Parler voice, gender, extra description, pitch shift in semitones)
SPEAKERS = {  # speaker -> (Parler voice, pronoun, extra description, ffmpeg post-filter)
    "narrator": ("Aman", "he", "", ""),
    "dadaji":   ("Aman", "he", "He sounds like an old grandfather in his seventies, deep, slightly husky and slow. ",
                 "rubberband=pitch=0.89:formant=shifted:tempo=0.93"),
    # owner picked: Dadi = "dadi_C_divya_elderly"
    "dadi":     ("Divya", "she", "Her voice is soft, warm and low-pitched; she speaks slowly and kindly like an old grandmother. ",
                 "atempo=0.93"),
    # owner picked kid voice "kid_A_divya_child_prompt" for the children
    "chinki":   ("Divya", "she", "Her voice is high-pitched and childlike; she speaks like a curious young child, fast and lively. ", ""),
    # owner picked "chintu_I_aman_light_boy"
    "chintu":   ("Aman", "he", "His voice is light and youthful; he speaks like an excited young boy, fast and playful. ",
                 "rubberband=pitch=1.22:formant=shifted:tempo=1.05"),
    "god":      ("Aman", "he", "He has a deep, powerful and majestic voice. ", "rubberband=pitch=0.94:formant=shifted"),
    "female":   ("Divya", "she", "", ""),
}

_model = None


def _load():
    global _model
    if _model is None:
        from parler_tts import ParlerTTSForConditionalGeneration
        from transformers import AutoTokenizer
        m = "ai4bharat/indic-parler-tts"
        model = ParlerTTSForConditionalGeneration.from_pretrained(m)
        _model = (model, AutoTokenizer.from_pretrained(m),
                  AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path))
    return _model


def describe(speaker: str, emotion: str) -> tuple[str, float]:
    name, pron, extra, post = SPEAKERS.get(speaker, SPEAKERS["narrator"])
    style = EMOTIONS.get(emotion, EMOTIONS["calm"])
    desc = (f"{name}'s voice is clear and expressive; {pron} {style}. {extra}"
            "The recording is of very high quality, very close-sounding, with no background noise.")
    return desc, post


def fix_pronunciation(text: str) -> str:
    """Respell words the voice gets wrong (data/pronunciation.json: {"written": "spoken"}). Subtitles keep the original."""
    import json
    from .common import DATA
    try:
        fixes = json.load(open(DATA / "pronunciation.json", encoding="utf-8"))
    except FileNotFoundError:
        return text
    for w, spoken in sorted(fixes.items(), key=lambda kv: -len(kv[0])):
        if not w.startswith("_"):
            text = text.replace(w, spoken)
    return text


def speak(text: str, out_path: str, speaker: str = "narrator", emotion: str = "calm", seed: int = 7):
    text = fix_pronunciation(text)
    import soundfile as sf
    import torch
    model, tok, dtok = _load()
    desc, post = describe(speaker, emotion)
    torch.manual_seed(seed)
    d, p = dtok(desc, return_tensors="pt"), tok(text, return_tensors="pt")
    with torch.inference_mode():
        g = model.generate(input_ids=d.input_ids, attention_mask=d.attention_mask,
                           prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask)
    sr = model.config.sampling_rate
    raw = out_path + ".raw.wav"
    sf.write(raw, g.cpu().numpy().squeeze(), sr)
    af = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse"
    if post:
        af += "," + post
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", af + ",loudnorm=I=-16:TP=-1.5",
                    "-ar", "44100", "-b:a", "160k", out_path], check=True)
    os.remove(raw)
