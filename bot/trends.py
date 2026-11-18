"""Collect trend signals for the mythology niche.

Sources (all free, each optional - failures are skipped):
  * Google Trends daily trending searches (India)
  * Google News search feeds for mythology / festival keywords
  * Reddit r/hinduism top posts this week
  * Gemini + live Google Search: upcoming festivals/tithis and what is trending now
"""
import urllib.parse
import xml.etree.ElementTree as ET

import requests

from . import llm
from .common import CFG, log, now

UA = {"User-Agent": "Mozilla/5.0 (compatible; reel-bot/1.0)"}
NEWS_QUERIES = ["पौराणिक कथा", "रामायण", "महाभारत", "व्रत कथा", "hindu mythology",
                "भगवान शिव कथा", "श्री कृष्ण कथा", "एकादशी"]


def _rss_titles(url: str, limit: int = 10) -> list[str]:
    r = requests.get(url, headers=UA, timeout=20)
    r.raise_for_status()
    root = ET.fromstring(r.content)
    return [i.findtext("title", "").strip() for i in root.iter("item")][:limit]


def google_trends() -> list[str]:
    try:
        return _rss_titles("https://trends.google.com/trending/rss?geo=IN", 25)
    except Exception as e:
        log("google trends skipped:", e)
        return []


def google_news() -> list[str]:
    out = []
    for q in NEWS_QUERIES:
        url = ("https://news.google.com/rss/search?q=" + urllib.parse.quote(q + " when:7d")
               + "&hl=hi&gl=IN&ceid=IN:hi")
        try:
            out += _rss_titles(url, 6)
        except Exception as e:
            log("news skipped:", q, e)
    return out


def reddit() -> list[str]:
    try:
        r = requests.get("https://www.reddit.com/r/hinduism/top.json?t=week&limit=15",
                         headers=UA, timeout=20)
        r.raise_for_status()
        return [c["data"]["title"] for c in r.json()["data"]["children"]]
    except Exception as e:
        log("reddit skipped:", e)
        return []


def live_research() -> str:
    today = now().strftime("%A, %d %B %Y")
    prompt = f"""Today is {today} (India, IST). I run a Hindi Instagram page about {CFG['page']['niche']}.
Search the web and give me a concise research brief:
1. Hindu festivals, vrat, ekadashi, purnima, amavasya, jayanti or other auspicious days in the
   next 12 days, with exact dates (check a reliable Panchang) and the main mythological story
   linked to each.
2. Mythology topics trending in India in the last 7 days: films, web series, TV shows, news,
   temple events, viral questions or debates, eclipses, etc.
3. Mythology questions people commonly search for right now (Google/YouTube style questions).
Use short bullet points with dates."""
    try:
        return llm.search(prompt)
    except Exception as e:
        log("live research failed:", e)
        return ""


def collect() -> dict:
    signals = {
        "google_trends_india": google_trends(),
        "news_headlines": google_news(),
        "reddit_hinduism": reddit(),
        "live_research": live_research(),
    }
    log("trend signals:", {k: (len(v) if isinstance(v, list) else len(v or "")) for k, v in signals.items()})
    return signals
