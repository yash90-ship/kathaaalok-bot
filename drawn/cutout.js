/* "Paper-cutout sticker" style: bright flat colours, thick dark outline + white stitched dashes,
 * jointed puppet characters with faces that blink and talk. Loaded after engine.js (uses its helpers). */
const K = {
  line: "#1c1714", skin: "#e0a271", skin2: "#c98a5c", blue: "#6aa3d8", blue2: "#4d86c2", asura: "#6f8f3a",
  asura2: "#7a4a8c", gold: "#f5c242", gold2: "#e8a92c", saffron: "#f08a24", red: "#d23a35", white: "#fbf7ef",
  green: "#79b75a", green2: "#5f9e45", leaf: "#4f8f3c", sky: "#9fd4f5", sky2: "#d7eefc", brown: "#7b4a2a",
  rock: "#9c8b80", rock2: "#b9aaa0", water: "#4f86cf", water2: "#3d73bd", pink: "#ef7fa8", hair: "#1f1a1a",
  silver: "#d6dde6", iron: "#8a8f99", purple: "#7d5ba6", cream: "#fff3d6",
};
/* outlined + stitched shape */
function cut(d, fill, o = {}) {
  const sw = o.sw ?? 7, dash = o.dash ?? "11 8";
  return `<path d="${d}" fill="${fill}" stroke="${K.line}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>` +
    (o.noStitch ? "" : `<path d="${d}" fill="none" stroke="#fff" stroke-width="${o.ssw ?? 2.6}" stroke-dasharray="${dash}" stroke-linejoin="round" opacity=".95"/>`);
}
const circ = (x, y, r) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const rrect = (x, y, w, h, r) => `M${x + r} ${y} h${w - 2 * r} a${r} ${r} 0 0 1 ${r} ${r} v${h - 2 * r} a${r} ${r} 0 0 1 ${-r} ${r} h${-(w - 2 * r)} a${r} ${r} 0 0 1 ${-r} ${-r} v${-(h - 2 * r)} a${r} ${r} 0 0 1 ${r} ${-r}Z`;
const ell = (x, y, rx, ry) => `M${x - rx} ${y} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;

/* ---------------- backgrounds ---------------- */
function cSky(top = K.sky, bottom = K.sky2) { return sky([[0, top], [1, bottom]]); }
function cSunrise(t, cx = 540, cy = 520) {
  return sky([[0, "#8d7fb8"], [.45, "#f2a65a"], [1, "#ffd98a"]]) + rays(cx, cy, t, "#fff1b8", 1600, 22, .35, 3) + cSun(cx, cy, 150, t);
}
function cSun(x, y, r, t) {
  let tri = "";
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * TAU + t * .15, a1 = a - .12, a2 = a + .12, R1 = r * 1.15, R2 = r * (1.7 + (i % 2) * .25);
    tri += cut(`M${x + Math.cos(a1) * R1} ${y + Math.sin(a1) * R1} L${x + Math.cos(a) * R2} ${y + Math.sin(a) * R2} L${x + Math.cos(a2) * R1} ${y + Math.sin(a2) * R1}Z`, i % 2 ? K.saffron : K.gold, { sw: 5, noStitch: 1 });
  }
  return tri + cut(circ(x, y, r * 1.12), K.gold2, { sw: 6 }) + cut(circ(x, y, r * .9), "#fff1a8", { sw: 6 });
}
function cMoon(x, y, r) { return glow(x, y, r * 2.6, "#fff6d0", .5) + cut(circ(x, y, r), "#fff4c9") + `<circle cx="${x - r * .3}" cy="${y - r * .2}" r="${r * .16}" fill="#e9d9a6"/><circle cx="${x + r * .3}" cy="${y + r * .25}" r="${r * .11}" fill="#e9d9a6"/>`; }
function cCloud(x, y, s, t, fill = "#fff") {
  const dx = wob(t, .04, 25);
  return `<g transform="${tr(x + dx, y, s)}">${cut("M-110 30 Q-130 -10 -85 -18 Q-80 -60 -30 -55 Q0 -95 50 -62 Q100 -70 105 -20 Q140 -10 125 30Z", fill, { sw: 5 })}</g>`;
}
function cMountain(x, y, w, h, fill = K.rock) {
  return cut(`M${x - w / 2} ${y} L${x - w * .1} ${y - h} L${x + w * .08} ${y - h * .97} L${x + w / 2} ${y}Z`, fill) +
    `<path d="M${x - w * .22} ${y - h * .58} L${x - w * .1} ${y - h} L${x + w * .08} ${y - h * .97} L${x + w * .2} ${y - h * .6} L${x + w * .02} ${y - h * .76}Z" fill="#c7bab2"/>
     <path d="M${x - w * .2} ${y - h * .3} l${w * .05} ${-h * .2} l${-w * .04} ${-h * .2} M${x + w * .25} ${y - h * .15} l${-w * .05} ${-h * .25} l${w * .04} ${-h * .2}" stroke="#6d5f57" stroke-width="5" fill="none"/>`;
}
function cHill(y, fill, amp = 120, seed = 1) {
  const R = rnd(seed), a = 200 + R() * 200, b = 600 + R() * 300;
  return cut(`M-60 ${H + 60} L-60 ${y + 40} Q${a} ${y - amp} ${540} ${y + 10} Q${b} ${y - amp * 1.1} ${W + 60} ${y + 20} L${W + 60} ${H + 60}Z`, fill);
}
function cTree(x, y, s, t, fruit = true, seed = 1) {
  const sw = wob(t, .3, 2, seed);
  let f = "";
  if (fruit) { const R = rnd(seed); for (let i = 0; i < 4; i++) f += `<circle cx="${(R() - .5) * 150}" cy="${-260 + (R() - .5) * 120}" r="13" fill="${i % 2 ? K.red : K.gold}" stroke="${K.line}" stroke-width="4"/>`; }
  return `<g transform="${tr(x, y, s, sw)}">${cut("M-26 0 L-22 -170 L22 -170 L26 0Z", K.brown)}
    ${cut("M-120 -170 Q-170 -230 -120 -290 Q-120 -370 -40 -370 Q0 -420 60 -380 Q140 -380 130 -300 Q175 -240 120 -170Z", K.green2)}${f}</g>`;
}
function cBush(x, y, s) { return `<g transform="${tr(x, y, s)}">${cut("M-110 0 Q-130 -70 -60 -80 Q-30 -130 30 -100 Q110 -110 110 -40 Q130 -10 110 0Z", K.green2)}</g>`; }
function cRiver(y, t, h = 900) {
  let s = `<rect x="-60" y="${y}" width="${W + 120}" height="${h}" fill="${K.water}"/><path d="M-60 ${y} L${W + 60} ${y}" stroke="${K.line}" stroke-width="7"/>`;
  for (let i = 0; i < 14; i++) {
    const yy = y + 60 + i * 70, ph = t * 1.4 + i;
    let d = `M-40 ${yy}`;
    for (let x = -40; x <= W + 40; x += 60) d += ` Q${x + 15} ${yy - 8 + Math.sin(ph) * 3} ${x + 30} ${yy} T${x + 60} ${yy}`;
    s += `<path d="${d}" fill="none" stroke="#cfe3ff" stroke-width="3" opacity=".75"/>`;
  }
  return s;
}
function cLily(x, y, s, t, flower = false) {
  return `<g transform="${tr(x + wob(t, .2, 6), y, s, wob(t, .15, 4))}">${cut("M0 0 L-6 -70 A120 70 0 1 0 40 -66Z", K.green, { sw: 6 })}
    ${flower ? `<g transform="translate(-10 -40)">${[-50, -25, 0, 25, 50].map(a => cut("M0 0 Q-22 -50 0 -95 Q22 -50 0 0Z", K.pink, { sw: 5, noStitch: 1 }).replace("<path", `<path transform="rotate(${a})"`)).join("")}<circle r="14" fill="${K.gold}" stroke="${K.line}" stroke-width="4"/></g>` : ""}</g>`;
}
function cBorder(y = H - 70, t = 0) {
  let s = `<rect x="0" y="${y}" width="${W}" height="80" fill="${K.gold}"/>`;
  const cols = [K.red, K.green2, K.gold2, K.red, "#2f7d3c"];
  for (let i = 0; i < 24; i++) s += `<path d="M${i * 46} ${y + 80} L${i * 46 + 23} ${y + 6} L${i * 46 + 46} ${y + 80}Z" fill="${cols[i % cols.length]}" stroke="${K.line}" stroke-width="3"/>`;
  return s + `<path d="M0 ${y} L${W} ${y}" stroke="${K.line}" stroke-width="6"/>`;
}
function cDiya(x, y, s, t, ph = 0) {
  return `<g transform="${tr(x, y, s)}">${flame(0, -20, .5, t, ph)}${cut("M-44 -18 Q0 34 44 -18Z", "#c8602a", { sw: 5 })}</g>`;
}
function cTemple(x, y, s, fill = "#f2c47a") {
  return `<g transform="${tr(x, y, s)}">${cut("M-130 0 L-130 -170 L130 -170 L130 0Z", fill)}${cut("M-95 -170 Q-85 -350 0 -440 Q85 -350 95 -170Z", "#e9a24a")}
    ${cut("M-35 0 L-35 -90 Q0 -130 35 -90 L35 0Z", "#7b4a2a", { sw: 5 })}${cut("M0 -440 L0 -500 L45 -485 L0 -470", K.saffron, { sw: 4, noStitch: 1 })}</g>`;
}
function cCity(x, y, s, t, metal = "gold", ph = 0, burn = 0) {
  const col = { gold: K.gold, silver: K.silver, iron: K.iron }[metal], dark = { gold: K.gold2, silver: "#a9b4c2", iron: "#6b707a" }[metal];
  const bob = wob(t, .22, 14, ph);
  let win = "";
  for (let i = -2; i <= 2; i++) win += `<rect x="${i * 46 - 10}" y="-90" width="20" height="30" rx="10" fill="#ffe69a" stroke="${K.line}" stroke-width="3"/>`;
  return `<g transform="${tr(x, y + bob, s)}">${cut("M-170 0 L170 0 L70 150 L0 220 L-70 150Z", K.rock)}
    ${cut("M-150 0 L-150 -130 L150 -130 L150 0Z", col)}
    ${[-150, 0, 150].map(cx => cut(`M${cx - 30} -130 L${cx - 30} -190 Q${cx} -250 ${cx + 30} -190 L${cx + 30} -130Z`, dark)).join("")}
    ${cut("M-55 -130 L-55 -220 Q0 -310 55 -220 L55 -130Z", col)}${win}
    ${burn > 0 ? `<g opacity="${burn}">${flame(-90, -120, 1.5, t)}${flame(10, -210, 2, t, 1)}${flame(100, -130, 1.6, t, 2)}</g>` : ""}</g>`;
}
function cChariot(x, y, s, t) {
  const wheel = (cx, col) => `<g transform="translate(${cx} 30) rotate(${t * 140})">${cut(circ(0, 0, 85), col)}
    ${[0, 45, 90, 135].map(a => `<path d="M-80 0 L80 0" stroke="${K.line}" stroke-width="7" transform="rotate(${a})"/>`).join("")}${cut(circ(0, 0, 20), K.red, { sw: 5, noStitch: 1 })}</g>`;
  return `<g transform="${tr(x, y + wob(t, .6, 5), s)}">${cut("M-260 0 L250 0 L290 -70 L-280 -70Z", K.red)}
    ${cut("M-240 -70 L-230 -150 L230 -150 L240 -70Z", K.gold)}${wheel(-160, "#ffcc4d")}${wheel(160, "#e6ecf5")}</g>`;
}

/* ---------------- the puppet ----------------
 * (x,y) = hip centre. o: skin, kind (man|shiva|sage|asura|deva|brahma), outfit, sash, seated, arms {l:[a,b], r:[a,b]}
 * talk (0/1), item {l|r: "bow"|"trishul"|"diya"|"lotus"}, aim (deg for bow), pull (0..1) */
function puppet(x, y, s, t, o = {}) {
  const kind = o.kind || "man", ph = o.ph || 0;
  const skin = o.skin || { shiva: K.blue, asura: K.asura, brahma: "#e7a35c", dadi: "#d99a6c", dadaji: "#c98a5c" }[kind] || K.skin;
  const outfit = o.outfit || { shiva: "#c9a26b", asura: K.asura2, sage: K.saffron, brahma: K.red, deva: K.gold, dadi: "#f6efe0", chintu: K.white, chinki: "#e0457b", dadaji: "#f7f3ea" }[kind] || K.white;
  const sash = o.sash || (kind === "asura" ? "#3c2a4d" : (kind === "shiva" || kind === "chintu" || kind === "chinki") ? null : kind === "dadi" ? "#f6efe0" : kind === "dadaji" ? "#e8d9b5" : K.saffron);
  const bob = wob(t, .5, 4, ph), tilt = (o.tilt ?? 0) + wob(t, .23, 3, ph);
  const blink = ((t + ph * 1.7) % 3.4) < .13;
  const talk = o.talk ? Math.max(0, Math.sin(t * 13 + ph)) * Math.abs(Math.sin(t * 3.1 + ph)) : 0;
  const A = o.arms || {};
  const la = A.l || [-14 + wob(t, .4, 5, ph), 12], ra = A.r || [14 + wob(t, .4, 5, ph + 1), -12];
  let s1 = "";

  // ---- lower body
  if (o.seated) s1 += cut("M-230 40 Q-250 -40 -130 -40 L130 -40 Q250 -40 230 40 Q0 90 -230 40Z", outfit) +
      cut(ell(-150, 30, 46, 26), skin, { noStitch: 1 }) + cut(ell(150, 30, 46, 26), skin, { noStitch: 1 });
  else if (kind === "chinki") s1 += cut("M-120 -10 L120 -10 L190 250 L-190 250Z", outfit) + `<path d="M-185 235 L185 235" stroke="${K.gold}" stroke-width="12"/>` +
      cut(rrect(-75, 250, 40, 80, 16), skin) + cut(rrect(35, 250, 40, 80, 16), skin) + cut(ell(-55, 345, 50, 22), K.red) + cut(ell(55, 345, 50, 22), K.red);
  else s1 += cut("M-115 -10 L115 -10 L140 330 L-140 330Z", outfit) + `<path d="M0 0 L0 330" stroke="${K.line}" stroke-width="4" opacity=".4"/>` +
      cut(ell(-70, 345, 60, 24), skin) + cut(ell(70, 345, 60, 24), skin);
  if (kind === "shiva") s1 += `<path d="M-115 40 l40 22 M-60 90 l45 18 M30 60 l50 20 M70 140 l45 18" stroke="${K.line}" stroke-width="10" stroke-linecap="round"/>`; // tiger skin stripes

  // ---- arm builder (drawn in shoulder frame, hand items stay upright)
  const arm = (side, [a, b], item) => {
    const sx = side * 128, L1 = 190, L2 = 175;
    let it = "";
    if (item === "trishul") it = `<g transform="rotate(${a + b})">${cut("M-9 -330 L9 -330 L9 160 L-9 160Z", "#c9c9c9", { sw: 5 })}
        ${cut("M-60 -330 Q-62 -400 -30 -430 Q-40 -380 -12 -350 L0 -470 L12 -350 Q40 -380 30 -430 Q62 -400 60 -330Z", "#d9d9d9", { sw: 5 })}
        ${cut(rrect(-26, -300, 52, 40, 10), K.red, { sw: 4, noStitch: 1 })}</g>`;
    if (item === "stick") it = `<g transform="rotate(${a + b})">${cut("M-9 -60 L9 -60 L9 560 L-9 560Z", "#8a5a2b", { sw: 5 })}${cut("M-9 -60 Q-10 -110 40 -110 Q70 -108 70 -80 L52 -80 Q50 -92 38 -92 Q10 -92 9 -60Z", "#8a5a2b", { sw: 5 })}</g>`;
    if (item === "diya") it = `<g transform="rotate(${a + b})">${cDiya(0, -10, 1, t, ph)}</g>`;
    if (item === "lotus") it = `<g transform="rotate(${a + b}) translate(0 -20)">${[-40, 0, 40].map(r => cut("M0 0 Q-24 -55 0 -100 Q24 -55 0 0Z", K.pink, { sw: 5, noStitch: 1 }).replace("<path", `<path transform="rotate(${r})"`)).join("")}</g>`;
    if (item === "bow") {
      const aim = o.aim ?? 0, pull = o.pull ?? 0, bend = 90 + pull * 40, str = 30 + pull * (o.reach ?? 420);
      it = `<g transform="rotate(${a + b}) rotate(${aim})">
        <path d="M0 -260 Q${-bend} 0 0 260" fill="none" stroke="${K.line}" stroke-width="22" stroke-linecap="round"/>
        <path d="M0 -260 Q${-bend} 0 0 260" fill="none" stroke="${K.gold2}" stroke-width="12" stroke-linecap="round"/>
        <path d="M0 -258 L${str} 0 L0 258" fill="none" stroke="${K.white}" stroke-width="4"/>
        ${o.arrow === false ? "" : `<path d="M${str} 0 L-170 0" stroke="${K.line}" stroke-width="10"/><path d="M${str} 0 L-170 0" stroke="${K.gold}" stroke-width="5"/>
        ${cut("M-200 0 L-160 -20 L-160 20Z", "#d9d9d9", { sw: 4, noStitch: 1 })}`}</g>`;
    }
    const sleeve = kind === "chintu" ? (o.kurta || "#2f8fd8") : kind === "chinki" ? (o.kurta || "#f5c242") : kind === "dadaji" ? "#f7f3ea" : kind === "dadi" ? "#b8463a" : skin;
    return `<g transform="translate(${sx} -360) rotate(${-a})">${cut(rrect(-34, -20, 68, L1 + 30, 32), sleeve)}
      ${cut(rrect(-36, 40, 72, 30, 8), K.gold, { sw: 4, noStitch: 1 })}
      <g transform="translate(0 ${L1}) rotate(${-b})">${cut(rrect(-31, -10, 62, L2 + 10, 30), skin)}${cut(circ(0, L2 + 10, 34), skin)}
      ${cut(rrect(-30, L2 - 40, 60, 14, 6), K.red, { sw: 3, noStitch: 1 })}<g transform="translate(0 ${L2 + 10})">${it}</g></g></g>`;
  };

  // back arm first if it holds nothing special
  const head = () => {
    let h = "";
    // back hair
    if (kind === "dadi") h += cut("M-135 -560 Q-150 -735 0 -740 Q150 -735 135 -560 L160 -350 L-160 -350Z", outfit) +
        `<path d="M-160 -352 L-135 -560 Q-150 -735 0 -740 Q150 -735 135 -560 L160 -352" fill="none" stroke="${K.red}" stroke-width="12"/>`;
    else if (kind === "chinki") h += [-1, 1].map(sd => cut(`M${sd * 95} -520 Q${sd * 150} -420 ${sd * 120} -300 L${sd * 92} -300 Q${sd * 118} -420 ${sd * 70} -510Z`, K.hair) +
        cut(circ(sd * 106, -290, 18), K.red, { sw: 4, noStitch: 1 })).join("");
    else if (kind !== "sage" && kind !== "asura" && kind !== "chintu" && kind !== "dadaji") h += cut("M-112 -560 L-130 -350 L-60 -360 L-60 -480 L60 -480 L60 -360 L130 -350 L112 -560Z", K.hair, { noStitch: 1 });
    if (kind === "sage") h += cut("M-110 -560 Q-140 -420 -80 -380 L80 -380 Q140 -420 110 -560Z", "#e9e4dc");
    h += cut(rrect(-36, -440, 72, 80, 20), skin, { noStitch: 1 });                 // neck
    h += cut(circ(0, -545, 110), skin);                                            // face
    // headgear
    if (kind === "shiva") h += cut(ell(0, -700, 70, 78), K.hair) + cut("M-50 -655 L50 -655", K.gold, { sw: 12, noStitch: 1 }) +
        cut("M-18 -770 A40 40 0 1 0 40 -720 A30 30 0 1 1 -18 -770Z", "#fff4c9", { sw: 5, noStitch: 1 }) +
        `<path d="M-30 -770 Q-60 -820 -20 -850" stroke="#9fd4f5" stroke-width="8" fill="none"/>`;
    else if (kind === "man" || kind === "sage") h += cut(circ(0, -680, 58), kind === "sage" ? "#e9e4dc" : K.hair) + cut("M-42 -650 L42 -650", K.gold, { sw: 10, noStitch: 1 });
    else if (kind === "dadi") h += cut("M-108 -585 Q0 -700 108 -585 Q60 -640 0 -638 Q-60 -640 -108 -585Z", "#d6d3cf") +
        cut("M-118 -590 Q0 -715 118 -590 Q0 -668 -118 -590Z", outfit, { sw: 6 }) + `<path d="M-118 -590 Q0 -668 118 -590" fill="none" stroke="${K.red}" stroke-width="9"/>`;
    else if (kind === "chintu") h += cut("M-114 -540 Q-130 -650 -80 -680 L-60 -720 L-30 -688 L0 -735 L30 -690 L65 -722 L80 -680 Q130 -650 114 -540 Q100 -600 50 -615 Q0 -592 -50 -615 Q-100 -600 -114 -540Z", K.hair);
    else if (kind === "chinki") h += cut("M-116 -545 Q-130 -690 0 -690 Q130 -690 116 -545 Q105 -610 60 -602 Q20 -640 0 -650 Q-20 -640 -60 -602 Q-105 -610 -116 -545Z", K.hair) +
        `<path d="M0 -690 L0 -650" stroke="#4a3a3a" stroke-width="4"/>` + cut("M-60 -688 l-40 -30 l10 45Z M-60 -688 l-45 20 l40 15Z", K.red, { sw: 4, noStitch: 1 });
    else if (kind === "dadaji") h += cut("M-112 -560 Q-120 -520 -112 -490 L-98 -495 Q-104 -530 -96 -565Z M112 -560 Q120 -520 112 -490 L98 -495 Q104 -530 96 -565Z", "#e6e2dc", { sw: 4 }) +
        cut("M-122 -585 Q-130 -700 0 -712 Q130 -700 122 -585 Q60 -615 0 -612 Q-60 -615 -122 -585Z", "#f2b33d") +
        `<path d="M-118 -615 Q0 -650 118 -615 M-112 -650 Q0 -690 112 -650" stroke="${K.saffron}" stroke-width="8" fill="none"/>` +
        cut("M110 -640 Q170 -600 150 -520 Q130 -590 100 -610Z", "#f2b33d", { sw: 4 });
    else if (kind === "asura") h += cut("M-90 -620 Q-170 -700 -140 -790 Q-120 -700 -55 -650Z", "#efe6d0") + cut("M90 -620 Q170 -700 140 -790 Q120 -700 55 -650Z", "#efe6d0") +
        cut("M-105 -600 L-80 -680 L-40 -630 L0 -700 L40 -630 L80 -680 L105 -600Z", "#3c2a4d");
    else h += cut("M-100 -610 L-100 -690 L-60 -660 L-30 -730 L0 -680 L30 -730 L60 -660 L100 -690 L100 -610Z", K.gold) + cut(circ(0, -650, 18), K.red, { sw: 4, noStitch: 1 });
    // face details
    const ey = -555, kid = kind === "chintu" || kind === "chinki", open = blink ? 2 : (kind === "asura" ? 15 : kid ? 17 : 11);
    for (const ex of [-42, 42]) {
      h += `<ellipse cx="${ex}" cy="${ey}" rx="${kid ? 27 : 24}" ry="${open}" fill="#fff" stroke="${K.line}" stroke-width="4"/>`;
      if (!blink) h += `<circle cx="${ex + 4}" cy="${ey + (kid ? 2 : 0)}" r="${kid ? 11 : 8}" fill="${kind === "asura" ? K.red : "#2b2240"}"/>` +
          (kid ? `<circle cx="${ex + 8}" cy="${ey - 3}" r="3.5" fill="#fff"/>` : "");
      h += `<path d="M${ex - 26} ${ey - 26} Q${ex} ${ey - (kind === "asura" ? 22 : 38)} ${ex + 26} ${ey - 26}" stroke="${K.line}" stroke-width="6" fill="none" stroke-linecap="round" ${kind === "asura" ? `transform="rotate(${ex > 0 ? -15 : 15} ${ex} ${ey - 26})"` : ""}/>`;
    }
    h += `<path d="M0 ${ey + 5} L-8 ${ey + 45} L6 ${ey + 47}" stroke="${K.line}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    if (kind === "dadaji") h += `<circle cx="-42" cy="${ey}" r="34" fill="#fff" fill-opacity=".12" stroke="${K.line}" stroke-width="6"/>
      <circle cx="42" cy="${ey}" r="34" fill="#fff" fill-opacity=".12" stroke="${K.line}" stroke-width="6"/><path d="M-8 ${ey} h16" stroke="${K.line}" stroke-width="5"/>` +
      cut(`M0 ${ey + 58} Q-40 ${ey + 50} -78 ${ey + 78} Q-40 ${ey + 72} 0 ${ey + 66} Q40 ${ey + 72} 78 ${ey + 78} Q40 ${ey + 50} 0 ${ey + 58}Z`, "#f2efe9", { sw: 4 }) +
      `<path d="M-30 ${ey - 72} q30 -8 60 0 M-62 ${ey + 40} q8 12 18 4" stroke="#8a5a3a" stroke-width="4" fill="none"/>`;
    if (kind === "dadi") h += `<circle cx="-42" cy="${ey}" r="36" fill="#fff" fill-opacity=".12" stroke="${K.line}" stroke-width="6"/>
      <circle cx="42" cy="${ey}" r="36" fill="#fff" fill-opacity=".12" stroke="${K.line}" stroke-width="6"/><path d="M-6 ${ey} h12 M-78 ${ey - 6} l-30 -8 M78 ${ey - 6} l30 -8" stroke="${K.line}" stroke-width="5"/>
      <path d="M-66 ${ey + 50} q8 10 18 4 M66 ${ey + 50} q-8 10 -18 4 M-30 ${ey - 70} q30 -8 60 0" stroke="#9a6a4a" stroke-width="4" fill="none"/>`;
    if (kid) h += `<circle cx="-70" cy="${ey + 48}" r="16" fill="#f08a8a" opacity=".55"/><circle cx="70" cy="${ey + 48}" r="16" fill="#f08a8a" opacity=".55"/>`;
    const my = ey + 80;
    if (talk > .15) h += `<ellipse cx="0" cy="${my}" rx="${18 + talk * 6}" ry="${4 + talk * 12}" fill="#6b1d1d" stroke="${K.line}" stroke-width="4"/>`;
    else h += `<path d="M-26 ${my - 4} Q0 ${my + (kind === "asura" ? -8 : 14)} 26 ${my - 4}" stroke="${kind === "asura" ? K.line : "#b43a3a"}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    if (kind === "asura") h += `<path d="M-22 ${my - 2} l6 18 l6 -16 M10 ${my - 2} l6 18 l6 -16" fill="#fff" stroke="${K.line}" stroke-width="3"/>`;
    if (kind === "shiva") h += `<path d="M-45 -615 h90 M-45 -603 h90 M-45 -591 h90" stroke="#fff" stroke-width="5"/>` + `<ellipse cx="0" cy="-625" rx="7" ry="13" fill="${K.red}" stroke="${K.line}" stroke-width="3"/>`;
    else if (kind === "dadi" || kind === "chinki") h += `<circle cx="0" cy="-612" r="${kind === "chinki" ? 7 : 9}" fill="${K.red}"/>`;
    else if (kind !== "asura") h += `<path d="M0 -625 l0 -38" stroke="${K.red}" stroke-width="9" stroke-linecap="round"/>`;
    if (kind === "sage" || kind === "brahma") h += cut(`M-80 ${my - 20} Q-90 ${my + 140} 0 ${my + 190} Q90 ${my + 140} 80 ${my - 20} Q0 ${my + 30} -80 ${my - 20}Z`, "#f3efe8");
    // earrings
    if (kind === "chinki") h += cut(circ(-110, -515, 11), K.gold, { sw: 4, noStitch: 1 }) + cut(circ(110, -515, 11), K.gold, { sw: 4, noStitch: 1 });
    else if (kind !== "chintu" && kind !== "dadaji") h += cut(circ(-110, -520, 20), K.gold, { sw: 5, noStitch: 1 }) + cut(circ(110, -520, 20), K.gold, { sw: 5, noStitch: 1 });
    const hs = (kind === "chintu" || kind === "chinki") ? 1.2 : 1;
    return `<g transform="rotate(${tilt} 0 -430) translate(0 -430) scale(${hs}) translate(0 430)">${h}</g>`;
  };

  // torso
  const top = kind === "chintu" ? (o.kurta || "#2f8fd8") : kind === "chinki" ? (o.kurta || "#f5c242") : kind === "dadaji" ? "#f7f3ea" : kind === "dadi" ? "#b8463a" : (kind === "deva" || kind === "brahma") ? K.gold : skin;
  let torso = cut("M-130 -380 Q-140 -200 -118 0 L118 0 Q140 -200 130 -380 Q0 -410 -130 -380Z", top);
  if (kind === "chinki") torso += [-300, -220, -140].map(y => `<circle cx="${y % 2 ? -50 : 50}" cy="${y}" r="10" fill="${K.red}"/>`).join("");
  if (kind === "chintu" || kind === "dadaji") torso += `<path d="M0 -380 L0 -220" stroke="${K.line}" stroke-width="5"/>` + [-330, -290, -250].map(y => `<circle cx="14" cy="${y}" r="7" fill="${K.gold}" stroke="${K.line}" stroke-width="3"/>`).join("");
  if (sash && kind !== "deva" && kind !== "brahma") torso += cut("M-130 -330 L-80 -380 L130 -60 L120 0 L80 0Z", sash, { sw: 5 }) +
      (kind === "dadi" ? `<path d="M-80 -380 L130 -60" stroke="${K.red}" stroke-width="10"/>` : "");
  else if (kind === "deva" || kind === "brahma") torso += `<circle cx="0" cy="-220" r="34" fill="${K.red}" stroke="${K.line}" stroke-width="5"/>`;
  if (kind === "shiva") torso += `<path d="M-90 -370 Q-110 -260 -20 -250 Q60 -245 70 -330" fill="none" stroke="${K.line}" stroke-width="22" stroke-linecap="round"/>
      <path d="M-90 -370 Q-110 -260 -20 -250 Q60 -245 70 -330" fill="none" stroke="#5c8f3a" stroke-width="14" stroke-linecap="round"/>
      <circle cx="74" cy="-340" r="16" fill="#5c8f3a" stroke="${K.line}" stroke-width="4"/>`;
  else if (!["chintu", "dadi", "chinki"].includes(kind)) { let beads = ""; for (let i = 0; i < 11; i++) { const a = Math.PI * (.12 + i * .076); beads += `<circle cx="${Math.cos(a) * 95}" cy="${-370 + Math.sin(a) * 110}" r="13" fill="#6b3d22" stroke="${K.line}" stroke-width="3"/>`; } torso += beads; }
  if (!["chintu", "dadi", "chinki", "dadaji"].includes(kind)) torso += cut(rrect(-122, -40, 244, 46, 8), K.gold, { sw: 5 });

  const items = o.item || {};
  return `<g transform="translate(${x} ${y + bob}) scale(${s})">${arm(-1, la, items.l)}${s1}${torso}${head()}${arm(1, ra, items.r)}</g>`;
}

function cHome(t, evening = true) {
  return sky(evening ? [[0, "#f3b46a"], [1, "#fbd9a0"]] : [[0, K.sky], [1, K.sky2]]) +
    cut("M-60 1300 L-60 300 L1140 300 L1140 1300Z", "#e9c79a") +
    cut("M120 1300 L120 760 Q220 640 320 760 L320 1300Z", "#7b4a2a") +
    cut(rrect(640, 620, 260, 220, 14), "#5b8fb8") + `<path d="M770 620 v220 M640 730 h260" stroke="${K.line}" stroke-width="7"/>` +
    cut("M-60 1300 L1140 1300 L1140 1950 L-60 1950Z", "#c98f5a") +
    [...Array(7)].map((_, i) => `<path d="M-60 ${1380 + i * 90} L1140 ${1380 + i * 90}" stroke="#b07a48" stroke-width="4"/>`).join("") +
    cDiya(560, 1270, .9, t);
}

function cBird(x, y, s, t, ph = 0, fly = true, col = "#3d3d55") {
  const f = fly ? Math.sin(t * 9 + ph) : 0;
  if (fly) return `<g transform="${tr(x, y, s)}"><path d="M-40 ${-20 * f} Q-20 ${-30 * f - 6} 0 0 Q20 ${-30 * f - 6} 40 ${-20 * f}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round"/></g>`;
  const hop = Math.max(0, Math.sin(t * 2 + ph)) * 6;
  return `<g transform="${tr(x, y - hop, s)}">${cut("M-26 0 Q-30 -30 0 -32 Q30 -30 26 0Z", col, { sw: 4, noStitch: 1 })}${cut(circ(18, -34, 13), col, { sw: 4, noStitch: 1 })}
    <path d="M30 -36 l14 4 l-14 4Z" fill="${K.gold}"/><circle cx="21" cy="-37" r="3" fill="#fff"/><path d="M-26 -8 l-18 -6" stroke="${col}" stroke-width="6"/></g>`;
}
function cCow(x, y, s, t, ph = 0) {
  const tail = wob(t, .6, 18, ph), head = wob(t, .25, 5, ph), chew = Math.abs(Math.sin(t * 3 + ph)) * 4;
  return `<g transform="${tr(x, y, s)}">
    <path d="M-170 -150 Q${-230 + tail} -90 ${-215 + tail} -20" stroke="${K.line}" stroke-width="10" fill="none"/>
    ${[-130, -70, 70, 130].map(lx => cut(rrect(lx - 16, -40, 32, 140, 10), "#f3ede2", { sw: 5 })).join("")}
    ${cut("M-180 -200 Q-185 -60 -150 -40 L150 -40 Q185 -60 180 -200 Q0 -235 -180 -200Z", "#f3ede2")}
    <path d="M-60 -190 q30 30 70 0 q10 40 -40 50 q-40 -10 -30 -50Z" fill="#8a5a3a"/>
    <g transform="rotate(${head} 160 -190)">${cut("M150 -230 Q160 -290 230 -280 Q290 -270 280 -200 Q270 -150 220 -150 Q170 -160 150 -230Z", "#f3ede2")}
      ${cut(`M232 ${-172 + chew} Q270 ${-172 + chew} 282 -195 L250 -205Z`, "#f2b8a0", { sw: 4, noStitch: 1 })}
      <path d="M170 -280 q-20 -40 10 -50 M250 -285 q20 -40 -10 -50" stroke="#efe4c8" stroke-width="12" stroke-linecap="round" fill="none"/>
      <circle cx="225" cy="-235" r="7" fill="${K.line}"/>${cut("M150 -255 l-40 10 l35 15Z", "#f3ede2", { sw: 4 })}</g>
    ${cut(circ(165, -150, 14), K.gold, { sw: 4, noStitch: 1 })}</g>`;
}
function cDog(x, y, s, t, ph = 0) {
  const wag = wob(t, 2.5, 25, ph), ear = wob(t, .4, 6, ph);
  return `<g transform="${tr(x, y, s)}">
    <path d="M-110 -70 Q${-160} ${-120 + wag} ${-150 + wag * .5} -150" stroke="${K.line}" stroke-width="16" stroke-linecap="round" fill="none"/>
    <path d="M-110 -70 Q${-160} ${-120 + wag} ${-150 + wag * .5} -150" stroke="#c98a4a" stroke-width="9" stroke-linecap="round" fill="none"/>
    ${cut("M-130 0 Q-150 -90 -60 -100 L80 -100 Q130 -90 120 0Z", "#c98a4a")}
    ${cut("M70 -90 Q60 -170 130 -170 Q190 -165 185 -110 Q180 -70 120 -70 Q80 -70 70 -90Z", "#c98a4a")}
    <g transform="rotate(${ear} 100 -160)">${cut("M95 -165 Q70 -150 80 -110 Q100 -130 110 -160Z", "#8a5a2b", { sw: 4 })}</g>
    <circle cx="150" cy="-130" r="7" fill="${K.line}"/><circle cx="185" cy="-112" r="9" fill="${K.line}"/></g>`;
}
function cHut(x, y, s, wall = "#d9a76b") {
  return `<g transform="${tr(x, y, s)}">${cut("M-230 0 L-230 -260 L230 -260 L230 0Z", wall)}
    ${cut("M-290 -240 L0 -460 L290 -240Z", "#c9a24a")}${[...Array(9)].map((_, i) => `<path d="M${-250 + i * 62} -255 L${-120 + i * 30} -380" stroke="#9c7a2e" stroke-width="5"/>`).join("")}
    ${cut("M-50 0 L-50 -170 Q0 -215 50 -170 L50 0Z", "#6b3f22")}${cut(rrect(110, -200, 80, 80, 8), "#3d5f80", { sw: 5 })}
    <path d="M-230 -60 h460" stroke="#b9855a" stroke-width="6"/>${[-150, 150].map(cx => `<circle cx="${cx}" cy="-120" r="16" fill="#fff" opacity=".7"/>`).join("")}</g>`;
}
function cNeem(x, y, s, t) { return cTree(x, y, s, t, false, 3); }
function cHaystack(x, y, s) { return `<g transform="${tr(x, y, s)}">${cut("M-120 0 Q-130 -150 0 -200 Q130 -150 120 0Z", "#e3b94a")}<path d="M-80 -60 l40 -20 M20 -120 l40 -10 M-20 -30 l50 -15" stroke="#b9902e" stroke-width="5"/></g>`; }
function cCharpai(x, y, s) {
  return `<g transform="${tr(x, y, s)}">${[-200, 200].map(lx => cut(rrect(lx - 14, -70, 28, 90, 6), "#8a5a2b", { sw: 5 })).join("")}
    ${cut(rrect(-230, -100, 460, 40, 10), "#a8703a")}${[...Array(10)].map((_, i) => `<path d="M${-210 + i * 46} -98 l20 36" stroke="#f2e2b8" stroke-width="4"/>`).join("")}</g>`;
}
function cVillage(t, mood = "evening") {
  const skyC = mood === "evening" ? [[0, "#f7a65c"], [.6, "#ffd59a"], [1, "#fff0c9"]] : mood === "night" ? [[0, "#1d2463"], [1, "#5a4a9a"]] : [[0, K.sky], [1, K.sky2]];
  return sky(skyC) + (mood === "night" ? stars(t, 80) + cMoon(820, 300, 60) : cSun(860, 360, 70, t)) +
    [0, 1, 2].map(i => cBird(((i * 280 + t * 70) % 1400) - 150, 420 + i * 70, .8, t, i)).join("") +
    cHill(1000, K.green, 70, 5) + cNeem(120, 1150, 1.25, t) + cHut(640, 1180, 1.05) +
    cBird(560, 715, .9, t, 1, false) + cBird(720, 712, .9, t, 2.5, false, "#5a4a3a") +
    cHaystack(990, 1180, .9) + cut(`M-60 1170 L1140 1170 L1140 1950 L-60 1950Z`, "#d9a96a") +
    [...Array(6)].map((_, i) => `<path d="M${-40 + i * 210} ${1260 + (i % 2) * 60} q40 -14 80 0" stroke="#b98a4a" stroke-width="5" fill="none"/>`).join("");
}
