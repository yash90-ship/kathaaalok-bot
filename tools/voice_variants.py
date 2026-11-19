"""Variants for Chintu, Chinki and Dadi ji so the owner can pick. Output: voice-tests/variants/*.mp3"""
import os, subprocess, sys
import soundfile as sf, torch
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer

OUT = "voice-tests/variants"; os.makedirs(OUT, exist_ok=True)
M = "ai4bharat/indic-parler-tts"
model = ParlerTTSForConditionalGeneration.from_pretrained(M)
tok = AutoTokenizer.from_pretrained(M); dtok = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
SR = model.config.sampling_rate
Q = " The recording is of very high quality, very close-sounding, with no background noise."

KID_LINES = ["दादी जी, सब कह रहे हैं कल भगवान विष्णु जागेंगे!", "भगवान भी सोते हैं क्या?"]
DADI_LINES = ["हाँ बेटा! कल देवउठनी एकादशी है।", "सुनो, इसकी बड़ी सुंदर कथा है।"]
# name, lines, parler speaker+description, post-processing ffmpeg filter
V = [
 ("kid_A_divya_child_prompt", KID_LINES, "Divya's voice is high-pitched and childlike; she speaks like a curious young girl, fast and lively.", ""),
 ("kid_B_divya_pitch+3", KID_LINES, "Divya's voice is high-pitched; she speaks with curiosity, fast and lively.", "rubberband=pitch=1.19:formant=shifted"),
 ("kid_C_divya_pitch+3_tempo", KID_LINES, "Divya's voice is high-pitched; she speaks with curiosity, fast and lively.", "rubberband=pitch=1.19:formant=shifted:tempo=1.06"),
 ("kid_D_rani_pitch+4", KID_LINES, "Rani's voice is high-pitched; she speaks with curiosity, fast and lively.", "rubberband=pitch=1.26:formant=shifted"),
 ("kid_E_rohit_boy_pitch+6", KID_LINES, "Rohit's voice is light; he speaks with curiosity, fast and lively.", "rubberband=pitch=1.41:formant=shifted"),
 ("kid_F_aman_boy_pitch+7", KID_LINES, "Aman's voice is light; he speaks with curiosity, fast and lively.", "rubberband=pitch=1.5:formant=shifted"),
 ("dadi_A_rani_elderly", DADI_LINES, "Rani's voice is soft, warm and low-pitched; she speaks slowly and kindly like an old grandmother.", "atempo=0.94"),
 ("dadi_B_rani_older", DADI_LINES, "Rani's voice is soft, warm and low-pitched; she speaks slowly and kindly like an old grandmother.", "rubberband=pitch=0.9:formant=shifted:tempo=0.94"),
 ("dadi_C_divya_elderly", DADI_LINES, "Divya's voice is soft, warm and low-pitched; she speaks slowly and kindly like an old grandmother.", "atempo=0.93"),
 ("dadi_D_divya_older", DADI_LINES, "Divya's voice is soft, warm and low-pitched; she speaks slowly and kindly like an old grandmother.", "rubberband=pitch=0.89:formant=shifted:tempo=0.93"),
]
for name, lines, desc, post in V:
    parts = []
    for i, text in enumerate(lines):
        torch.manual_seed(7 + i)
        d, p = dtok(desc + Q, return_tensors="pt"), tok(text, return_tensors="pt")
        with torch.inference_mode():
            g = model.generate(input_ids=d.input_ids, attention_mask=d.attention_mask, prompt_input_ids=p.input_ids, prompt_attention_mask=p.attention_mask)
        w = f"{OUT}/{name}_{i}.wav"; sf.write(w, g.cpu().numpy().squeeze(), SR); parts.append(w)
    lst = f"{OUT}/l.txt"; open(lst, "w").write("".join(f"file '{os.path.abspath(x)}'\n" for x in parts))
    af = "silenceremove=start_periods=1:start_threshold=-45dB" + ("," + post if post else "") + ",loudnorm=I=-16:TP=-1.5"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-af", af, "-ar", "44100", "-b:a", "160k", f"{OUT}/{name}.mp3"], check=True)
    for x in parts + [lst]: os.remove(x)
    print("done", name, flush=True)
