"""Shared helpers: config, paths, time, history storage."""
import datetime as dt
import json
import os
import pathlib
import subprocess
from zoneinfo import ZoneInfo

import yaml

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = ROOT / "out"
HISTORY = DATA / "history.json"
PENDING = DATA / "pending"

with open(ROOT / "config.yaml", encoding="utf-8") as f:
    CFG = yaml.safe_load(f)

TZ = ZoneInfo(CFG["page"]["timezone"])


def now() -> dt.datetime:
    return dt.datetime.now(TZ)


def env(name: str, required: bool = True) -> str:
    val = os.environ.get(name, "").strip()
    if required and not val:
        raise RuntimeError(f"Missing environment variable / GitHub secret: {name}")
    return val


def log(*a):
    print("[bot]", *a, flush=True)


def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def save_json(path, data):
    path = pathlib.Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def history() -> list:
    return load_json(HISTORY, [])


def save_history(items: list):
    save_json(HISTORY, items)


def run(cmd: list, **kw) -> subprocess.CompletedProcess:
    """Run a command, raising with stderr on failure."""
    p = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if p.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(map(str, cmd[:6]))}...\n{p.stderr[-3000:]}")
    return p


def media_duration(path) -> float:
    p = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", str(path)])
    return float(p.stdout.strip())


def approval_required(day: dt.date | None = None) -> bool:
    until = dt.date.fromisoformat(str(CFG["approval"]["required_until"]))
    return (day or now().date()) <= until
