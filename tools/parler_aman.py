"""Aman v2: richer descriptions, short phrases, 3 takes, studio mastering."""
import os, subprocess, sys
import soundfile as sf, torch
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer

OUT = sys.argv[1] if len(sys.argv) > 1 else "voice-tests/aman_v2"
os.makedirs(OUT, exist_ok=True)
M = "ai4bharat/indic-parler-tts"
model = ParlerTTSForConditionalGeneration.from_pretrained(M)
tok = AutoTokenizer.from_pretrained(M)
dtok = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
SR = model.config.sampling_rate

BASE = ("Aman's voice is deep and warm with a low pitch. {style} The recording is very clear and "
        "close-sounding, studio quality, with no background noise and no reverberation.")
LINES = [  # (emotion, [short phrases], style)
    ("calm", ["एक सुबह,", "नन्हे हनुमान को बहुत भूख लगी।", "आकाश में उगता हुआ लाल सूर्य,", "उन्हें एक पका हुआ फल लगा।"],
     "He narrates a story calmly and warmly, with gentle expression, at a moderate pace."),
    ("dramatic", ["तभी इंद्र ने क्रोध में आकर,", "अपना वज्र चला दिया!"],
     "He speaks with very high expressivity, intense and dramatic, loud and slightly fast, like the climax of a story."),
    ("sad", ["नन्हे हनुमान धरती पर गिर पड़े...", "और पूरा संसार जैसे थम गया।"],
     "He speaks slowly and softly with deep sadness and emotion, very expressive, with a low pitch."),
    ("devotional", ["तब से हनुमान जी,", "बल और साहस के प्रतीक हैं।", "बोलो... जय हनुमान!"],
     "He speaks with joyful devotion and energy, very expressive and uplifting, at a moderate pace."),
]
MASTER = ("highpass=f=70,afftdn=nf=-28,equalizer=f=140:t=q:w=1:g=3,equalizer=f=3200:t=q:w=1.4:g=2.5,"
          "equalizer=f=7500:t=q:w=2:g=-2,acompressor=threshold=-20dB:ratio=3:attack=8:release=160:makeup=2,"
          "aecho=0.85:0.5:35|70:0.10|0.05,loudnorm=I=-15:TP=-1.5:LRA=9")


def say(text, desc, seed):
    torch.manual_seed(seed)
    d = dtok(desc, return_tensors="pt"); p = tok(text, return_tensors="pt")
    with torch.inference_mode():
        g = model.generate(input_ids=d.input_ids, attention_mask=d.attention_mask,
                           prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask,
                           do_sample=True, temperature=0.9)
    return g.cpu().numpy().squeeze()


def trim_join(wavs, gap_s):
    import numpy as np
    out = []
    for w in wavs:
        nz = np.where(np.abs(w) > 0.01)[0]
        if len(nz):
            w = w[max(nz[0] - int(.03 * SR), 0): nz[-1] + int(.08 * SR)]
        out += [w, np.zeros(int(gap_s * SR), dtype=w.dtype)]
    return np.concatenate(out)


for take, seed in enumerate([11, 23, 37], 1):
    lines = []
    for emo, phrases, style in LINES:
        wav = trim_join([say(ph, BASE.format(style=style), seed + i) for i, ph in enumerate(phrases)], 0.18)
        raw = f"{OUT}/t{take}_{emo}_raw.wav"
        sf.write(raw, wav, SR)
        mp3 = f"{OUT}/take{take}_{emo}.mp3"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", MASTER, "-ar", "44100", "-b:a", "160k", mp3], check=True)
        os.remove(raw); lines.append(mp3)
        print("done take", take, emo, flush=True)
    lst = f"{OUT}/l.txt"
    open(lst, "w").write("".join(f"file '{os.path.abspath(x)}'\n" for x in lines))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst,
                    "-af", "apad=pad_dur=0.4", "-b:a", "160k", f"{OUT}/AMAN_take{take}_all_emotions.mp3"], check=True)
    os.remove(lst)
