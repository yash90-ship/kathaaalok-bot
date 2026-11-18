"""Thin wrapper around the Gemini API (free tier)."""
import json
import re
import time

from .common import CFG, env, log

_client = None


def client():
    global _client
    if _client is None:
        from google import genai
        _client = genai.Client(api_key=env("GEMINI_API_KEY"))
    return _client


def _retry(fn, tries=4):
    for i in range(tries):
        try:
            return fn()
        except Exception as e:  # rate limits / transient errors
            if i == tries - 1 or "NOT_FOUND" in str(e) or "API key not valid" in str(e):
                raise
            wait = 20 * (i + 1)
            log(f"Gemini error: {str(e)[:200]} -- retrying in {wait}s")
            time.sleep(wait)


def parse_json(text: str):
    text = (text or "").strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.S)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"(\{.*\}|\[.*\])", text, flags=re.S)
        if not m:
            raise
        return json.loads(m.group(1))


def search(prompt: str) -> str:
    """Ask Gemini with live Google Search grounding. Returns plain text."""
    from google.genai import types

    def go():
        r = client().models.generate_content(
            model=CFG["models"]["text"], contents=prompt,
            config=types.GenerateContentConfig(
                tools=[types.Tool(google_search=types.GoogleSearch())], temperature=0.3))
        return r.text or ""
    return _retry(go)


def ask_json(prompt: str, temperature: float = 0.7):
    """Ask Gemini for a JSON answer."""
    from google.genai import types

    def go():
        r = client().models.generate_content(
            model=CFG["models"]["text"], contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json", temperature=temperature))
        return parse_json(r.text)
    return _retry(go)
