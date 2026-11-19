"""Make test clips with AI4Bharat Indic Parler-TTS (free, open-source, Hindi, emotion via description)."""
import os, subprocess, sys
import soundfile as sf
import torch
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer

OUT = sys.argv[1] if len(sys.argv) > 1 else "voice-tests/parler"
os.makedirs(OUT, exist_ok=True)
torch.manual_seed(7)
M = "ai4bharat/indic-parler-tts"
model = ParlerTTSForConditionalGeneration.from_pretrained(M)
tok = AutoTokenizer.from_pretrained(M)
dtok = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)

LINES = [
    ("1_calm", "एक सुबह, नन्हे हनुमान को बहुत भूख लगी। आकाश में उगता हुआ लाल सूर्य उन्हें एक पका हुआ फल लगा।",
     "narrates a story in a calm, warm and gentle tone at a moderate pace"),
    ("2_dramatic", "तभी इंद्र ने क्रोध में आकर, अपना वज्र चला दिया!",
     "speaks with intense anger and drama, loud and fast, like the climax of a story"),
    ("3_sad", "नन्हे हनुमान धरती पर गिर पड़े... और पूरा संसार जैसे थम गया।",
     "speaks slowly with deep sadness and emotion, with soft pauses"),
    ("4_devotional", "तब से हनुमान जी बल और साहस के प्रतीक हैं। बोलो... जय हनुमान!",
     "speaks happily with devotion and excitement, energetic and joyful"),
]
SPEAKERS = {"rohit": "Rohit's voice", "aman": "Aman's voice", "divya": "Divya's voice"}

for sk, sname in SPEAKERS.items():
    parts = []
    for key, text, style in LINES:
        desc = (f"{sname} is clear and expressive; he {style}. The recording is of very high quality, "
                "very close-sounding, with no background noise.").replace(" he ", " she " if sk == "divya" else " he ")
        d = dtok(desc, return_tensors="pt"); p = tok(text, return_tensors="pt")
        with torch.inference_mode():
            g = model.generate(input_ids=d.input_ids, attention_mask=d.attention_mask,
                               prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask)
        wav = f"{OUT}/{sk}_{key}.wav"
        sf.write(wav, g.cpu().numpy().squeeze(), model.config.sampling_rate)
        parts.append(wav)
        print("done", sk, key, flush=True)
    # one combined clip per speaker (all 4 emotions back to back), mp3
    lst = f"{OUT}/{sk}_list.txt"
    open(lst, "w").write("".join(f"file '{os.path.abspath(x)}'\n" for x in parts))
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst,
                    "-af", "loudnorm=I=-15", "-b:a", "128k", f"{OUT}/{sk}_all_emotions.mp3"], check=True)
    for x in parts:
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", x, "-b:a", "128k", x[:-4] + ".mp3"], check=True)
        os.remove(x)
    os.remove(lst)
