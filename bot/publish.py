"""Hosting (public GitHub repo + Pages), Instagram Graph API, Telegram approval bot."""
import base64
import time

import requests

from .common import CFG, env, log

# ------------------------------------------------------------------ media hosting
def upload_media(local_path: str, remote_path: str) -> str:
    """Upload a file to the public media repo; returns its public URL (GitHub Pages)."""
    repo, branch = CFG["media"]["repo"], CFG["media"]["branch"]
    tok = env("MEDIA_REPO_TOKEN")
    api = f"https://api.github.com/repos/{repo}/contents/{remote_path}"
    h = {"Authorization": f"Bearer {tok}", "Accept": "application/vnd.github+json"}
    with open(local_path, "rb") as f:
        content = base64.b64encode(f.read()).decode()
    body = {"message": f"add {remote_path}", "content": content, "branch": branch}
    existing = requests.get(api, headers=h, params={"ref": branch}, timeout=60)
    if existing.status_code == 200:
        body["sha"] = existing.json()["sha"]
    r = requests.put(api, headers=h, json=body, timeout=300)
    r.raise_for_status()
    return raw_url(remote_path)  # tested: Instagram accepts raw.githubusercontent.com video URLs


def delete_media(remote_path: str):
    """Remove a posted video from the media repo so GitHub Pages stays small (<1 GB)."""
    repo, branch = CFG["media"]["repo"], CFG["media"]["branch"]
    h = {"Authorization": f"Bearer {env('MEDIA_REPO_TOKEN')}", "Accept": "application/vnd.github+json"}
    api = f"https://api.github.com/repos/{repo}/contents/{remote_path}"
    r = requests.get(api, headers=h, params={"ref": branch}, timeout=60)
    if r.status_code == 200:
        requests.delete(api, headers=h, json={"message": f"cleanup {remote_path}", "sha": r.json()["sha"],
                                              "branch": branch}, timeout=60)


def raw_url(remote_path: str) -> str:
    repo, branch = CFG["media"]["repo"], CFG["media"]["branch"]
    return f"https://raw.githubusercontent.com/{repo}/{branch}/{remote_path}"


def wait_public(url: str, timeout: int = 600) -> bool:
    end = time.time() + timeout
    while time.time() < end:
        try:
            r = requests.head(url, timeout=20, allow_redirects=True)
            if r.status_code == 200:
                return True
        except requests.RequestException:
            pass
        time.sleep(15)
    return False


# ------------------------------------------------------------------ Instagram
def _graph():
    tok = env("IG_ACCESS_TOKEN")
    host = "graph.instagram.com" if tok.startswith("IG") else "graph.facebook.com"
    return f"https://{host}/{CFG['instagram']['graph_version']}", tok


def ig_publish_reel(video_url: str, caption: str, cover_url: str | None = None) -> dict:
    base, tok = _graph()
    uid = env("IG_USER_ID")
    params = {"media_type": "REELS", "video_url": video_url, "caption": caption,
              "share_to_feed": "true", "access_token": tok}
    if cover_url:
        params["cover_url"] = cover_url
    r = requests.post(f"{base}/{uid}/media", data=params, timeout=120)
    if r.status_code != 200:
        raise RuntimeError(f"create container failed: {r.text}")
    cid = r.json()["id"]
    log("container", cid, "- waiting for Instagram to process the video")
    for _ in range(60):  # up to ~10 min
        time.sleep(10)
        s = requests.get(f"{base}/{cid}", params={"fields": "status_code,status", "access_token": tok}, timeout=60).json()
        code = s.get("status_code")
        if code == "FINISHED":
            break
        if code in ("ERROR", "EXPIRED"):
            raise RuntimeError(f"Instagram processing failed: {s}")
    else:
        raise RuntimeError("Instagram processing timed out")
    r = requests.post(f"{base}/{uid}/media_publish", data={"creation_id": cid, "access_token": tok}, timeout=120)
    if r.status_code != 200:
        raise RuntimeError(f"publish failed: {r.text}")
    mid = r.json()["id"]
    info = requests.get(f"{base}/{mid}", params={"fields": "permalink", "access_token": tok}, timeout=60).json()
    return {"media_id": mid, "permalink": info.get("permalink")}


METRICS = ["views", "reach", "likes", "comments", "shares", "saved", "total_interactions",
           "ig_reels_avg_watch_time", "ig_reels_video_view_total_time"]


def ig_insights(media_id: str) -> dict:
    base, tok = _graph()
    out = {}
    for m in METRICS:  # one by one so a deprecated metric doesn't break the rest
        try:
            r = requests.get(f"{base}/{media_id}/insights", params={"metric": m, "access_token": tok}, timeout=60)
            if r.status_code == 200 and r.json().get("data"):
                out[m] = r.json()["data"][0]["values"][0]["value"]
        except Exception:
            pass
    return out


# ------------------------------------------------------------------ Telegram
def _tg(method: str, **kw):
    tok = env("TELEGRAM_BOT_TOKEN")
    r = requests.post(f"https://api.telegram.org/bot{tok}/{method}", timeout=300, **kw)
    j = r.json()
    if not j.get("ok"):
        raise RuntimeError(f"telegram {method}: {j}")
    return j["result"]


def tg_message(text: str):
    try:
        _tg("sendMessage", data={"chat_id": env("TELEGRAM_CHAT_ID"), "text": text[:4000]})
    except Exception as e:
        log("telegram message failed:", e)


def tg_send_for_approval(video_path: str, item_id: str, text: str, need_approval: bool):
    import json
    markup = {"inline_keyboard": [[{"text": "✅ Post", "callback_data": f"ok:{item_id}"},
                                   {"text": "❌ Skip", "callback_data": f"no:{item_id}"}]]}
    data = {"chat_id": env("TELEGRAM_CHAT_ID"), "caption": text[:1000], "supports_streaming": "true"}
    # tell Telegram the real size, otherwise it may show a 9:16 reel squashed into a square
    try:
        import subprocess
        w, h, dur = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                    "stream=width,height:format=duration", "-of", "default=nw=1:nk=1", video_path],
                                   capture_output=True, text=True).stdout.split()[:3]
        data.update(width=int(w), height=int(h), duration=int(float(dur)))
    except Exception:
        data.update(width=1080, height=1920)
    if need_approval:
        data["reply_markup"] = json.dumps(markup)
    import os
    cover = os.path.join(os.path.dirname(video_path), "cover.jpg")
    with open(video_path, "rb") as f:
        files = {"video": f}
        if os.path.exists(cover):
            files["thumbnail"] = open(cover, "rb")
            data["thumbnail"] = "attach://thumbnail"
        _tg("sendVideo", data=data, files=files)


def tg_decision(item_id: str) -> str | None:
    """Return 'ok', 'no' or None (no answer yet) by reading button presses."""
    chat = str(env("TELEGRAM_CHAT_ID"))
    decision = None
    for u in _tg("getUpdates", data={"allowed_updates": '["callback_query"]', "limit": 100}):
        cq = u.get("callback_query")
        if not cq or str(cq.get("message", {}).get("chat", {}).get("id")) != chat:
            continue
        action, _, cid = (cq.get("data") or "").partition(":")
        if cid == item_id:
            decision = action
            try:
                _tg("answerCallbackQuery", data={"callback_query_id": cq["id"],
                                                 "text": "Will post ✅" if action == "ok" else "Skipped ❌"})
            except Exception:
                pass
    return decision
