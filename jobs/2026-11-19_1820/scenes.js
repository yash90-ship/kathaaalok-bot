/* Dev Uthani Ekadashi – Vamana & King Bali (narrator) */
const BALI = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "deva", outfit: "#7d5ba6", arms: o.arms || { l: [-20, 10], r: [30, -20] }, ph: o.ph, talk: o.talk, seated: o.seated });
const VAMANA = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "vamana", item: { r: "umbrella", l: "kamandal" }, arms: o.arms || { l: [-20, 20], r: [160, 10] }, ph: o.ph });
const YAJNA = (t) => cSky() + cCloud(200, 300, 1, t) + cTemple(800, 1150, 1) + cHill(1200, K.green) + cFire(560, 1360, t);
function cFire(x, y, t) { return `<g transform="translate(${x} ${y})">${flame(0, -30, 1.3, t)}${flame(-35, -26, .8, t, 1)}${flame(35, -26, .8, t, 2)}${cut("M-110 -30 L110 -30 L90 20 L-90 20Z", "#9c5b3a")}</g>`; }
const shake = (t, a) => `translate(${wob(t, 9, a).toFixed(1)} ${wob(t, 11, a, 1).toFixed(1)})`;

window.SCENES = [
  // 0 hook: Vishnu sleeping on Sheshnag, King Bali waiting in Patala below
  (t, d, k) => sky([[0, "#7fb3ea"], [.55, "#d8ecff"], [.56, "#3a2a5a"], [1, "#22163a"]]) + cMilkOcean(700, t).replace(/height="[0-9.]+"/, 'height="380"') +
    cShesha(560, 880, .55, t) + `<g transform="translate(560 830) rotate(-78)">${puppet(0, 0, .34, t, { kind: "vishnu", arms: { l: [-20, 30], r: [20, -30] } })}</g>` +
    `<g opacity=".9">${[0, 1, 2].map(i => `<text x="${780 + i * 30}" y="${560 - i * 40 - (t * 30) % 40}" font-size="${44 + i * 8}" fill="#fff" stroke="${K.line}" stroke-width="3" font-family="Lat">z</text>`).join("")}</g>` +
    BALI(540, 1700, .62, t, { seated: 1, arms: { l: [-25, 145], r: [25, -145] } }) + embers(t, 20, 5, "#c9a0ff", [0, 1100, W, 800], 40) + cBorder(),
  // 1 source
  (t, d, k) => cSky() + cTemple(540, 1250, 1.3) + cHill(1250, K.green) + cDiya(300, 1700, 1.1, t) + cDiya(780, 1700, 1.1, t, 2) + cBorder(),
  // 2 King Bali on his throne
  (t, d, k) => sky([[0, "#5b3a8a"], [1, "#c98ad8"]]) + rays(540, 900, t, "#ffd7f0", 1400, 20, .2) +
    cut("M250 1750 L250 1000 Q540 850 830 1000 L830 1750Z", K.gold) + BALI(540, 1500, .9, t, { seated: 1, arms: { l: [-20, 30], r: [60 + wob(t, .4, 10), -90] } }) + cBorder(),
  // 3 conquers three worlds, devas worried
  (t, d, k) => `<g transform="${shake(t, 4)}">` + sky([[0, "#7a1f2b"], [.6, "#e0602e"], [1, "#ffb347"]]) + cMoon(200, 350, 50) + cSun(880, 330, 70, t) +
    cHill(1150, "#8a5a3a", 90, 4) + BALI(320, 1600, .75, t, { arms: { l: [-160 + wob(t, 1.2, 10), 10], r: [160, -10] } }) +
    puppet(780, 1700, .6, t, { kind: "deva", arms: { l: [-25, 145], r: [25, -145] } }) + embers(t, 40, 7, "#ffcf6e", [0, 400, W, 1300], 120, 5) + cBorder() + `</g>`,
  // 4 Vamana arrives at the yajna
  (t, d, k) => YAJNA(t) + VAMANA(lerp(-100, 330, easeOut(seg(k, 0, .6))), 1700, .62, t) + BALI(800, 1650, .7, t, { arms: { l: [-25, 145], r: [25, -145] } }) + cBorder(),
  // 5 asks for three steps
  (t, d, k) => YAJNA(t) + VAMANA(330, 1700, .62, t, { arms: { l: [-20, 20], r: [100 + wob(t, .8, 10), -40] } }) + BALI(800, 1650, .7, t) +
    [0, 1, 2].map(i => `<g opacity="${clamp(k * 5 - i).toFixed(2)}">${cut(ell(330 + (i - 1) * 90, 1820, 32, 14), "#fff6c8", { sw: 4 })}</g>`).join("") + cBorder(),
  // 6 Bali smiles and pledges (pours water from kalash)
  (t, d, k) => YAJNA(t) + VAMANA(330, 1700, .62, t, { arms: { l: [-30, 40], r: [-40, 60] } }) +
    BALI(800, 1650, .7, t, { talk: 1, arms: { l: [-60, 50], r: [-30, 70] } }) + `<path d="M690 1460 Q600 1500 560 1560" stroke="#9fd4f5" stroke-width="10" fill="none" stroke-dasharray="18 10"/>` + cBorder(),
  // 7 Vamana becomes gigantic: steps over earth and sky
  (t, d, k) => { const g = easeOut(seg(k, 0, .5));
    return sky([[0, "#0e1240"], [.6, "#3a4aa8"], [1, "#9fd4f5"]]) + stars(t, 120) + cMoon(180, 300, 40) + cSun(900, 260, 50, t) +
      `<g transform="translate(540 1960) scale(${lerp(.25, 1.25, g).toFixed(3)}) translate(-540 -1960)">${rays(540, 1100, t, "#fff6c8", 1600, 24, .3)}${puppet(540, 1760, 1, t, { kind: "vishnu", arms: { l: [-150, 0], r: [150, 0] } })}</g>` +
      cut(circ(540, 2200, 520), "#4f9f78") + cBorder(); },
  // 8 Bali offers his head for the third step
  (t, d, k) => sky([[0, "#3a4aa8"], [1, "#9fd4f5"]]) + rays(540, 600, t, "#fff6c8", 1400, 22, .3) + cHill(1350, K.green) +
    `<g transform="translate(0 ${(-200 + 200 * easeOut(seg(k, .3, .9))).toFixed(0)})">${cut("M420 1180 Q540 1120 660 1180 L640 1250 L440 1250Z", K.blue)}</g>` +
    puppet(540, 1800, .75, t, { kind: "deva", outfit: "#7d5ba6", pose: "bow", arms: { l: [-25, 145], r: [25, -145] }, seated: 1 }) + cBorder(),
  // 9 Vishnu blesses Bali – king of Patala
  (t, d, k) => sky([[0, "#22163a"], [1, "#5a3a8a"]]) + stars(t, 50) + cut("M100 1750 L100 1050 L980 1050 L980 1750Z", "#3a2a5a") +
    [200, 420, 660, 880].map(x => cut(`M${x - 50} 1050 L${x - 50} 950 Q${x} 880 ${x + 50} 950 L${x + 50} 1050Z`, "#5b3a8a")).join("") +
    puppet(330, 1650, .7, t, { kind: "vishnu", arms: { l: [-20, 10], r: [100 + wob(t, .5, 8), 30] } }) + glow(330, 1200, 260, "#bfe0ff", .5) +
    BALI(760, 1650, .7, t, { arms: { l: [-25, 145], r: [25, -145] } }) + cBorder(),
  // 10 Vishnu stays four months with Bali in Patala (guardian at the gate)
  (t, d, k) => sky([[0, "#22163a"], [1, "#5a3a8a"]]) + cut("M200 1750 L200 950 Q540 800 880 950 L880 1750Z", "#6b4a9a") +
    cut("M380 1750 L380 1150 Q540 1060 700 1150 L700 1750Z", "#2a1a3a") + puppet(540, 1650, .65, t, { kind: "vishnu", arms: { l: [-20, 10], r: [20, -10] } }) +
    [0, 1, 2, 3].map(i => `<g opacity="${clamp(k * 6 - i).toFixed(2)}">${cut(circ(150 + i * 260, 420, 48), K.gold, { sw: 5 })}<text x="${150 + i * 260}" y="438" text-anchor="middle" font-size="50" font-family="Lat" font-weight="800" fill="${K.line}">${i + 1}</text></g>`).join("") + cBorder(),
  // 11 Chaturmas – yoga nidra
  (t, d, k) => sky([[0, "#7fb3ea"], [1, "#d8ecff"]]) + cMilkOcean(1150, t) + cShesha(560, 1300, .9, t) +
    `<g transform="translate(560 1180) rotate(-78)">${puppet(0, 0, .55, t, { kind: "vishnu", arms: { l: [-20, 30], r: [20, -30] } })}</g>` +
    puppet(860, 1290, .45, t, { kind: "lakshmi", seated: 1, item: { r: "lotus" }, arms: { l: [-20, 100], r: [120, 20] } }) + cBorder(),
  // 12 Dev Uthani – Vishnu wakes, lamps light up
  (t, d, k) => { const a = ease(seg(k, 0, .6));
    return sky([[0, "#7fb3ea"], [1, "#d8ecff"]]) + rays(540, 900, t, "#fff6c8", 1500, 22, .2 + .3 * a, 2) + cMilkOcean(1150, t) + cShesha(560, 1300, .9, t) +
      `<g transform="translate(${lerp(560, 520, a)} ${lerp(1180, 1050, a)}) rotate(${lerp(-78, 0, a)})">${puppet(0, 0, .55, t, { kind: "vishnu", seated: a > .5, arms: { l: [-20, 30], r: [20, -30] } })}</g>` +
      [...Array(8)].map((_, i) => `<g opacity="${clamp(k * 10 - 3 - i).toFixed(2)}">${cDiya(100 + i * 125, 1700 + (i % 2) * 70, .9, t, i)}</g>`).join("") + cBorder(); },
  // 13 CTA
  (t, d, k) => sky([[0, "#f7a65c"], [1, "#ffe6b0"]]) + rays(540, 1250, t, "#fff1b8", 1500, 24, .3, 4) + cHill(1350, K.green) +
    puppet(540, 1650, .78, t, { kind: "vishnu", arms: { l: [-20, 10], r: [150 + wob(t, .8, 10), 10] } }) +
    [...Array(6)].map((_, i) => cDiya(120 + i * 170, 1820, .8, t, i)).join("") + cBorder(),
];
