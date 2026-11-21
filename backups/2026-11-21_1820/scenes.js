/* Kartik Purnima deepdaan – Matsya avatar (Dadaji & Chinki at the river ghat) */
const DUSK = (t) => sky([[0, "#4a3a8a"], [.5, "#e07a6a"], [1, "#ffc48a"]]) + cMoon(840, 330, 70) + stars(t, 25);
const FLOAT = (t, n = 7) => [...Array(n)].map((_, i) => cDiya((i * 170 + t * 40) % (W + 200) - 100, 1330 + (i % 3) * 70 + wob(t, .4, 6, i), .75, t, i)).join("");
const STEPS = () => [0, 1, 2, 3].map(i => cut(`M-60 ${1560 + i * 90} L${W + 60} ${1560 + i * 90} L${W + 60} ${1650 + i * 90} L-60 ${1650 + i * 90}Z`, i % 2 ? "#d9b48a" : "#e8c9a0", { sw: 5 })).join("");
const GHAT = (t, talker) => DUSK(t) + cTemple(170, 1250, .7) + cRiver(1250, t, 400) + FLOAT(t) + STEPS() +
  puppet(740, 1880, .82, t, { kind: "dadaji", item: { l: "stick" }, talk: talker === "dadaji", arms: talker === "dadaji" ? { l: [-15, 10], r: [60 + wob(t, .5, 20), -100] } : { l: [-15, 10], r: [30, -80] } }) +
  puppet(300, 1880, .66, t, { kind: "chinki", talk: talker === "chinki", arms: talker === "chinki" ? { l: [-150 - wob(t, .8, 15), -25], r: [30, -10] } : { l: [-20, 10], r: [20, -10] } }) + cBorder();
const CLOSE = (t, kind) => DUSK(t) + cRiver(1250, t, 700) + FLOAT(t, 5) + puppet(540, 1700, 1.1, t, { kind, talk: 1, item: kind === "dadaji" ? { l: "stick" } : {}, arms: { l: [-30, 110 + wob(t, .6, 15)], r: [40, -120] } }) + cBorder();
const KING = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "deva", outfit: "#f7f3ea", arms: o.arms || { l: [-20, 10], r: [20, -10] }, talk: o.talk });
const DAY = (t) => sky([[0, "#8fd0f0"], [1, "#e6f6ff"]]) + cSun(880, 330, 60, t) + cCloud(250, 420, 1, t) + cHill(1150, K.green, 80, 2) + cTree(120, 1200, .8, t, false) + cTree(960, 1220, .7, t, false, 3);

window.SCENES = [
  // 0 hook – close on Chinki at the ghat, floating diyas behind
  (t, d, k) => CLOSE(t, "chinki"),
  // 1 Dadaji answers
  (t, d, k) => GHAT(t, "dadaji"),
  // 2 King Satyavrata offering water in the river at morning
  (t, d, k) => DAY(t) + cRiver(1350, t, 600) + KING(540, 1720, .9, t, { arms: { l: [-60, 60], r: [60, -60] } }) +
    `<path d="M520 ${1270 + (t * 200) % 60} l0 40 M560 ${1290 + (t * 200) % 60} l0 40" stroke="#bfe3ff" stroke-width="8"/>` + cBorder(),
  // 3 tiny fish appears in his palms (close-up)
  (t, d, k) => DAY(t) + cRiver(1350, t, 600) + KING(540, 2250, 1.5, t, { arms: { l: [-60, 60], r: [60, -60] } }) +
    `<g opacity="${seg(k, .1, .4).toFixed(2)}">${cFish(540, 1700 - 20 * easeOut(seg(k, .1, .5)), .25, t, 0)}</g>` + glow(540, 1700, 140, "#fff1b8", .5 * seg(k, .1, .5)) + cBorder(),
  // 4 the little fish pleads – big fish lurking
  (t, d, k) => sky([[0, "#3d73bd"], [1, "#1e3a6e"]]) + embers(t, 30, 3, "#cfe8ff", [0, 300, W, 1600], 120, 6) +
    cFish(lerp(-200, 260, (t * .08) % 1), 1500, .9, t, 0, "#5a6a7a") + cFish(560, 1100 + wob(t, .8, 20), .35, t, 0) + cBorder(),
  // 5 Chinki: then what?
  (t, d, k) => GHAT(t, "chinki"),
  // 6 at home: fish outgrows the jug overnight (night window)
  (t, d, k) => { const g = easeOut(seg(k, .1, .8));
    return sky([[0, "#1a1440"], [1, "#3a2a6a"]]) + stars(t, 50) + cut("M-60 1300 L1140 1300 L1140 1990 L-60 1990Z", "#a0612f") +
      cut("M380 1700 Q340 1500 420 1420 L660 1420 Q740 1500 700 1700Z", "#c96a3a") + cut("M420 1420 L660 1420 L640 1380 L440 1380Z", "#b55a2a") +
      cFish(540, 1420 - 80 * g, lerp(.2, .6, g), t, 0) + embers(t, 20, 6, "#9fd4f5", [380, 1250, 340, 200], 80, 5) + cBorder(); },
  // 7 pond → lake → ocean: fish grows huge (pan across water bodies)
  (t, d, k) => { const st = Math.min(2, Math.floor(k * 3));
    return sky([[0, "#8fd0f0"], [1, "#e6f6ff"]]) + cSun(880, 330, 60, t) + (st < 2 ? cHill(1100, K.green, 60, st + 1) + POND2(t, 1250 - st * 80) : cSea(1100, t)) +
      cFish(540, 1450, [.6, .9, 1.3][st], t, 0) + `<text x="540" y="1720" text-anchor="middle" font-size="60" font-family="Lat,Dev" font-weight="800" fill="#fff" stroke="${K.line}" stroke-width="4">${["तालाब", "झील", "समुद्र"][st]}</text>` + cBorder(); },
  // 8 king realises – Vishnu glows above the ocean
  (t, d, k) => sky([[0, "#7fb3ea"], [1, "#fff1d0"]]) + rays(540, 900, t, "#fff6c8", 1500, 22, .35) + cSea(1300, t) +
    `<g opacity="${seg(k, .2, .7).toFixed(2)}">${puppet(540, 1250, .7, t, { kind: "vishnu", arms: { l: [-20, 10], r: [150 + wob(t, .5, 8), 10] } })}</g>` +
    KING(860, 1900, .7, t, { arms: { l: [-25, 145], r: [25, -145] } }) + cBorder(),
  // 9 the warning – fish speaks, boat silhouette, gathering clouds
  (t, d, k) => sky([[0, "#4a5a7a"], [1, "#a8b8c8"]]) + cCloud(200, 500, 1.6, t, "#7a8a9a") + cCloud(800, 600, 1.4, t, "#6a7a8a") + cSea(1250, t) +
    cFish(560, 1180, .9, t, 1) + `<g opacity="${seg(k, .3, .7).toFixed(2)}">${cBoat(540, 1700, .7, t)}</g>` + cBorder(),
  // 10 pralaya – storm, rain, lightning
  (t, d, k) => `<g transform="translate(${wob(t, 9, 4).toFixed(1)} ${wob(t, 11, 4, 1).toFixed(1)})">` + sky([[0, "#10182e"], [1, "#2a3a5a"]]) +
    cCloud(180, 380, 1.8, t, "#3a4560") + cCloud(820, 450, 1.6, t, "#323c55") + cSea(1050, t, 1) + cRain(t) + cBoat(560, 1700, .75, t, 14) +
    flash(Math.max(0, Math.sin(t * 2.3)) > .97 ? .7 : 0) + cBorder() + `</g>`,
  // 11 golden horned Matsya tows the boat (rope = Vasuki)
  (t, d, k) => sky([[0, "#1e2a50"], [.6, "#4a5a8a"], [1, "#e8c98a"]]) + rays(540, 1100, t, "#ffe6a0", 1500, 22, .25) + cSea(1250, t, 1) + cRain(t, 25) +
    cFish(lerp(330, 380, k), 1650, 1.1, t, 1) + `<path d="M${lerp(200, 250, k)} 1360 Q520 1480 770 1690" stroke="#3f8f6a" stroke-width="22" fill="none"/><path d="M${lerp(200, 250, k)} 1360 Q520 1480 770 1690" stroke="#f5d76e" stroke-width="5" stroke-dasharray="14 18" fill="none"/>` +
    cBoat(820, 1780, .55, t) + [0, 1, 2].map(i => puppet(750 + i * 60, 1700, .14, t, { kind: "sage" })).join("") + cBorder(),
  // 12 Chinki amazed
  (t, d, k) => CLOSE(t, "chinki"),
  // 13 Dadaji – deepdaan on Kartik Purnima, diyas everywhere on the river
  (t, d, k) => DUSK(t) + cRiver(1250, t, 400) + FLOAT(t, 12) + STEPS() + glow(540, 1350, 400, "#ffe0a0", .3) +
    puppet(740, 1880, .82, t, { kind: "dadaji", item: { l: "stick" }, talk: 1, arms: { l: [-15, 10], r: [60 + wob(t, .5, 20), -100] } }) +
    puppet(300, 1880, .66, t, { kind: "chinki", item: { r: "diya" }, arms: { l: [-20, 10], r: [60, -60] } }) + cBorder(),
  // 14 CTA – full moon over glowing river, golden fish leaps
  (t, d, k) => sky([[0, "#1a1440"], [1, "#4a3a8a"]]) + stars(t, 80) + cMoon(540, 420, 110) + cRiver(1250, t, 700) + FLOAT(t, 12) +
    cFish(540, 1350 - 120 * Math.abs(Math.sin(t * 1.2)), .5, t, 1) + cBorder(),
];
function POND2(t, y) { return cut(`M-60 ${y} Q540 ${y - 50} ${W + 60} ${y} L${W + 60} ${H + 60} L-60 ${H + 60}Z`, K.water) + [0, 1].map(i => `<path d="M${120 + i * 200} ${y + 120 + i * 90} q160 -14 320 0 q160 14 320 0" stroke="#d8f0ff" stroke-width="4" fill="none" opacity=".7"/>`).join(""); }

const NEW = {
  brahma: (t, d, k) => sky([[0, "#1a1440"], [1, "#4a3a8a"]]) + stars(t, 70) + cSea(1400, t) + cLotus(540, 1500, 2.2, t) +
    puppet(540, 1420, .7, t, { kind: "brahma", seated: 1, arms: { l: [-25, 145], r: [25, -145] } }) +
    [0, 1, 2].map(i => `<text x="${700 + i * 30}" y="${900 - i * 40 - (t * 30) % 40}" font-size="${44 + i * 8}" fill="#fff" stroke="${K.line}" stroke-width="3" font-family="Lat">z</text>`).join("") + cBorder(),
  thief: (t, d, k) => sky([[0, "#10182e"], [1, "#2a3a5a"]]) + stars(t, 40) + cSea(1300, t, 1) +
    puppet(lerp(380, 820, ease(k)), lerp(1750, 2100, seg(k, .6, 1)), .8, t, { kind: "asura", arms: { l: [-160, 10], r: [150, -20] } }) +
    `<g transform="translate(${lerp(240, 680, ease(k))} ${lerp(1150, 1500, seg(k, .6, 1))}) rotate(${wob(t, 1, 8)})">${cut(rrect(-70, -45, 140, 90, 12), "#c96a3a")}<path d="M-55 -20 h110 M-55 0 h110 M-55 20 h110" stroke="${K.gold}" stroke-width="6"/></g>` + cBorder(),
  return: (t, d, k) => sky([[0, "#7fb3ea"], [1, "#fff1d0"]]) + rays(540, 900, t, "#fff6c8", 1500, 22, .35) + cSea(1300, t) + cFish(420, 1550, .9, t, 1) +
    `<g transform="translate(${lerp(420, 760, ease(k))} ${lerp(1450, 1100, ease(k))})">${glow(0, 0, 140, "#fff1b8", .7)}${cut(rrect(-70, -45, 140, 90, 12), "#c96a3a")}<path d="M-55 -20 h110 M-55 0 h110 M-55 20 h110" stroke="${K.gold}" stroke-width="6"/></g>` +
    puppet(820, 1250, .5, t, { kind: "brahma", arms: { l: [-120, 30], r: [120, -30] } }) + cBorder(),
};
const _S = window.SCENES; window.SCENES = [0, 1, "brahma", "thief", 5, 8, 7, 4, "return", 10, 12, 13, 14].map(i => typeof i === 'number' ? _S[i] : NEW[i]);
