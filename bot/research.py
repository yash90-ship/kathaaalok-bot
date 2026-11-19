"""Study other public mythology pages through Instagram's official Business Discovery API.

Collects each page's recent posts (likes, comments, time, caption, type) and builds a report:
best posting hours/days, top posts, hooks, hashtags, caption length, reel vs carousel.
"""
import collections
import datetime as dt
import json
import re
import statistics as st

import requests

from .common import DATA, TZ, env, log, now, save_json
from .publish import _graph

FIELDS = "caption,like_count,comments_count,timestamp,media_type,media_product_type,permalink"


def fetch(username: str, max_posts: int = 150) -> dict:
    base, tok = _graph()
    uid = env("IG_USER_ID")
    posts, after, info = [], None, {}
    while len(posts) < max_posts:
        media = f"media.limit(50){{{FIELDS}}}" if not after else f"media.after({after}).limit(50){{{FIELDS}}}"
        q = f"business_discovery.username({username}){{username,name,followers_count,media_count,{media}}}"
        r = requests.get(f"{base}/{uid}", params={"fields": q, "access_token": tok}, timeout=60)
        if r.status_code != 200:
            raise RuntimeError(f"{username}: {r.text[:300]}")
        bd = r.json()["business_discovery"]
        info = {k: bd.get(k) for k in ("username", "name", "followers_count", "media_count")}
        m = bd.get("media", {})
        posts += m.get("data", [])
        after = m.get("paging", {}).get("cursors", {}).get("after")
        if not after or not m.get("data"):
            break
    info["posts"] = posts[:max_posts]
    return info


def _eng(p):  # simple engagement score
    return (p.get("like_count") or 0) + 3 * (p.get("comments_count") or 0)


def analyse(pages: list[dict]) -> str:
    out = [f"# Niche research — {now():%d %b %Y %H:%M} IST\n"]
    allp = []
    for pg in pages:
        ps = pg["posts"]
        if not ps:
            continue
        f = pg.get("followers_count") or 1
        med = st.median(_eng(p) for p in ps)
        for p in ps:
            t = dt.datetime.fromisoformat(p["timestamp"].replace("+0000", "+00:00")).astimezone(TZ)
            p.update(_page=pg["username"], _t=t, _rel=_eng(p) / max(med, 1), _per1k=1000 * _eng(p) / f)
        allp += ps
        reels = [p for p in ps if p.get("media_product_type") == "REELS"]
        days = (ps[0]["_t"] - ps[-1]["_t"]).days or 1
        out.append(f"## @{pg['username']} — {pg.get('followers_count'):,} followers, {pg.get('media_count')} posts\n"
                   f"- studied {len(ps)} posts over {days} days (~{len(ps) / days * 7:.1f} posts/week), {len(reels)} reels\n"
                   f"- median engagement {med:.0f} (likes + 3×comments), {1000 * med / f:.1f} per 1k followers\n")
    if not allp:
        return "\n".join(out + ["No data."])

    def table(key, label, fmt=str):
        g = collections.defaultdict(list)
        for p in allp:
            g[key(p)].append(p["_rel"])
        rows = sorted(g.items(), key=lambda kv: kv[0])
        lines = [f"| {label} | posts | avg performance vs page median |", "|---|---|---|"]
        for k, v in rows:
            if len(v) >= 3:
                lines.append(f"| {fmt(k)} | {len(v)} | {st.mean(v):.2f}× |")
        return "\n".join(lines)

    out.append("## When posts perform best (all pages, relative to each page's own median)\n")
    out.append(table(lambda p: p["_t"].hour, "Hour (IST)", lambda h: f"{h:02d}:00–{h:02d}:59") + "\n")
    out.append(table(lambda p: p["_t"].strftime("%u %a"), "Day") + "\n")
    out.append(table(lambda p: p.get("media_product_type") or p.get("media_type"), "Format") + "\n")

    def lenbucket(p):
        n = len(p.get("caption") or "")
        return "0 short (<150)" if n < 150 else "1 medium (150-500)" if n < 500 else "2 long (500+)"
    out.append(table(lenbucket, "Caption length") + "\n")

    def q(p):
        first = (p.get("caption") or "").strip().split("\n")[0]
        return "question hook" if "?" in first else "statement hook"
    out.append(table(q, "First line") + "\n")

    tags = collections.defaultdict(list)
    for p in allp:
        for h in set(re.findall(r"#[\wऀ-ॿ]+", p.get("caption") or "")):
            tags[h.lower()].append(p["_rel"])
    top_tags = sorted(((h, len(v), st.mean(v)) for h, v in tags.items() if len(v) >= 4), key=lambda x: -x[2])[:25]
    out.append("## Hashtags (used 4+ times) ranked by performance\n| hashtag | uses | avg performance |\n|---|---|---|")
    out += [f"| {h} | {n} | {m:.2f}× |" for h, n, m in top_tags]
    nt = [len(re.findall(r"#\w", p.get("caption") or "")) for p in allp]
    out.append(f"\nAverage hashtags per post: {st.mean(nt):.1f}\n")

    out.append("## Top 25 posts across all pages (by performance vs their page median)\n")
    for p in sorted(allp, key=lambda p: -p["_rel"])[:25]:
        cap = (p.get("caption") or "").replace("\n", " ")[:160]
        out.append(f"- **{p['_rel']:.1f}×** @{p['_page']} {p['_t']:%a %d %b %H:%M} · {p.get('like_count')} likes · "
                   f"{p.get('comments_count')} comments · {p.get('media_product_type')}  \n  {cap}  \n  {p.get('permalink')}")
    out.append("\n## Weakest 10 posts\n")
    for p in sorted(allp, key=lambda p: p["_rel"])[:10]:
        cap = (p.get("caption") or "").replace("\n", " ")[:120]
        out.append(f"- {p['_rel']:.2f}× @{p['_page']} {p['_t']:%a %H:%M} · {cap}")
    return "\n".join(out)


def run(usernames: list[str]):
    pages, errors = [], []
    for u in usernames:
        try:
            pg = fetch(u)
            log(f"@{u}: {len(pg['posts'])} posts, {pg.get('followers_count')} followers")
            pages.append(pg)
        except Exception as e:
            errors.append(str(e))
            log("failed", e)
    stamp = now().strftime("%Y-%m-%d")
    save_json(DATA / "research" / f"{stamp}_raw.json", pages)
    report = analyse(pages)
    if errors:
        report += "\n\n## Pages that could not be read\n" + "\n".join(f"- {e}" for e in errors)
    (DATA / "research" / f"{stamp}_report.md").write_text(report, encoding="utf-8")
    log("report saved")
    return report
