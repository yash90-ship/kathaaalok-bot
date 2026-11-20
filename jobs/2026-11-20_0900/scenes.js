/* Tulsi Vivah – Dadaji & Chinki conversation */
const HOME = (t, talker, mood = "evening") => cVillage(t, mood) + cCow(150, 1420, .7, t, 1) + cCharpai(700, 1620, 1.05) +
  puppet(700, 1520, .8, t, { kind: "dadaji", seated: 1, item: { l: "stick" }, talk: talker === "dadaji", arms: talker === "dadaji" ? { l: [-15, 10], r: [60 + wob(t, .5, 20), -100] } : { l: [-15, 10], r: [30, -80] } }) +
  puppet(300, 1760, .66, t, { kind: "chinki", talk: talker === "chinki", arms: talker === "chinki" ? { l: [-150 - wob(t, .8, 15), -25], r: [30, -10] } : { l: [-20, 10], r: [20, -10] } }) +
  cDog(930, 1860, .55, t, 2) + cBorder();
const CLOSE = (t, kind) => cVillage(t) + puppet(540, 1560, 1.1, t, { kind, talk: 1, seated: kind === "dadaji", item: kind === "dadaji" ? { l: "stick" } : {}, arms: { l: [-30, 110 + wob(t, .6, 15)], r: [40, -120] } }) + cBorder();
const VRINDA = (t, o = {}) => puppet(o.x ?? 540, o.y ?? 1600, o.s ?? .8, t, { kind: "lakshmi", outfit: "#2f9e6a", seated: o.seated, arms: o.arms || { l: [-25, 145], r: [25, -145] }, talk: o.talk });
const JALANDHAR = (t, o = {}) => puppet(o.x ?? 540, o.y ?? 1600, o.s ?? .8, t, { kind: "asura", outfit: "#3c2a4d", arms: o.arms, ph: o.ph });
const SHALIGRAM = (x, y, s) => `<g transform="${tr(x, y, s)}">${cut(ell(0, -50, 90, 60), "#2a2a2a")}<path d="M0 -50 m-30 0 a30 30 0 1 1 30 30 a20 20 0 1 1 -20 -20" stroke="${K.gold}" stroke-width="6" fill="none"/></g>`;

window.SCENES = [
  (t, d, k) => CLOSE(t, "chinki"),
  (t, d, k) => HOME(t, "dadaji"),
  (t, d, k) => cSky() + cTemple(540, 1250, 1.2) + cHill(1250, K.green) + VRINDA(t, { y: 1720, s: .85, seated: 1 }) + cDiya(250, 1760, 1, t) + cDiya(830, 1760, 1, t, 2) + cBorder(),
  (t, d, k) => cSunrise(t) + cHill(1250, K.green) + glow(360, 1250, 300, "#bfffd8", .5) + VRINDA(t, { x: 360, y: 1700, s: .7 }) + JALANDHAR(t, { x: 760, y: 1720, s: .8, arms: { l: [-160, 10], r: [40, -20] } }) + cBorder(),
  (t, d, k) => HOME(t, "chinki"),
  (t, d, k) => `<g transform="translate(${wob(t, 9, 5).toFixed(1)} ${wob(t, 11, 5, 1).toFixed(1)})">` + sky([[0, "#7a1f2b"], [.6, "#e0602e"], [1, "#ffb347"]]) +
    cHill(1150, "#8a5a3a", 90, 4) + flame(150, 1180, 2, t) + flame(950, 1170, 1.8, t, 2) +
    JALANDHAR(t, { x: 300, y: 1700, s: .8, arms: { l: [-160 + wob(t, 1.2, 15), 10], r: [160, -10] } }) +
    puppet(780, 1720, .75, t, { kind: "deva", arms: { l: [-120, 20], r: [100, -20] } }) + embers(t, 50, 7, "#ffcf6e", [0, 400, W, 1300], 160, 5) + cBorder() + `</g>`,
  (t, d, k) => sky([[0, "#3a3060"], [1, "#8a7aa8"]]) + stars(t, 40) + cHill(1300, "#5a6a5a") +
    `<g opacity="${(1 - seg(k, .3, 1)).toFixed(2)}">${VRINDA(t, { y: 1700, s: .8, seated: 1, arms: { l: [-30, 120], r: [30, -120] } })}</g>` +
    glow(540, 1300 - 500 * seg(k, .3, 1), 200, "#fff6c8", .8 * seg(k, .2, .6)) + cBorder(),
  (t, d, k) => sky([[0, "#7fb3ea"], [1, "#d8ecff"]]) + rays(540, 900, t, "#fff6c8", 1500, 22, .35, 2) + cHill(1300, K.green) +
    puppet(540, 1550, .85, t, { kind: "vishnu", arms: { l: [-20, 10], r: [150 + wob(t, .5, 8), 10] } }) + cBorder(),
  (t, d, k) => sky([[0, "#7fb3ea"], [1, "#d8ecff"]]) + rays(540, 1300, t, "#fff6c8", 1500, 22, .3, 2) + cHill(1300, K.green) +
    `<g opacity="${(1 - seg(k, .2, .7)).toFixed(2)}">${VRINDA(t, { y: 1750, s: .75 })}</g>` +
    `<g opacity="${seg(k, .3, .8).toFixed(2)}" transform="translate(540 1800) scale(${(.4 + .6 * easeOut(seg(k, .3, 1))).toFixed(3)}) translate(-540 -1800)">${cTulsi(540, 1800, 1.1, t)}</g>` + cBorder(),
  (t, d, k) => cVillage(t, "night") + [...Array(8)].map((_, i) => cDiya(90 + i * 130, 1320 + (i % 2) * 60, .9, t, i)).join("") +
    cut("M250 1850 L250 1250 M830 1850 L830 1250", "none") + cut("M230 1250 L850 1250 L850 1290 L230 1290Z", K.red) +
    [...Array(7)].map((_, i) => cut(`M${260 + i * 90} 1290 q45 60 90 0`, "none", { sw: 6 }).replace('stroke="#1c1714"', `stroke="${i % 2 ? K.gold : K.saffron}"`)).join("") +
    cTulsi(430, 1800, .8, t) + SHALIGRAM(700, 1790, 1) + cBorder(),
  (t, d, k) => CLOSE(t, "chinki"),
  (t, d, k) => HOME(t, "dadaji"),
];
