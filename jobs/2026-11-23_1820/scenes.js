/* How did Shri Krishna die – Mausala Parva (narrator) */
const KRISHNA = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "vishnu", seated: o.seated, talk: o.talk, arms: o.arms || { l: [-20, 10], r: [100 + wob(t, .5, 8), 30] } });
const JARA = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "man", outfit: "#5a4a2a", item: { l: "bow" }, aim: o.aim ?? 0, pull: o.pull ?? .6, arms: o.arms || { l: [-90, 0], r: [-90, 0] } });
const GANDHARI = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "lakshmi", outfit: "#f2ede0", talk: o.talk, arms: o.arms || { l: [-20, 10], r: [20, -10] } }) +
  cut(rrect(x - 90 * s, y - 590 * s, 180 * s, 50 * s, 10 * s), "#6a5a8a", { sw: 4, noStitch: 1 });
const FOREST = (t) => sky([[0, "#3a5a4a"], [1, "#a8c89a"]]) + cHill(1300, "#2f6a3c", 70, 3) + cTree(150, 1500, 1.2, t, false) + cTree(930, 1480, 1.1, t, false, 2) + cTree(600, 1350, .8, t, false, 5);
const SEA = (t, dark) => sky(dark ? [[0, "#1a1a3a"], [1, "#4a3a6a"]] : [[0, "#7fb3ea"], [1, "#d8ecff"]]) + cSea(1250, t, dark);
const PEEPAL = (x, y, s, t) => `<g transform="${tr(x, y, s)}">${cut("M-40 0 L-30 -300 L30 -300 L40 0Z", K.brown)}${cut("M-260 -280 Q-300 -480 -120 -520 Q0 -640 140 -520 Q300 -480 260 -280Z", "#3f7a3a")}</g>`;
const DWARKA = (y) => [180, 400, 640, 880].map((x, i) => cTemple(x, y, [.8, 1.1, 1, .75][i], i % 2 ? "#f7d9a0" : "#f2c47a")).join("");
const shake = (t, a) => `translate(${wob(t, 9, a).toFixed(1)} ${wob(t, 11, a, 1).toFixed(1)})`;

window.SCENES = [
  // 0 hook – Krishna in meditation under a tree, single arrow glinting in the foreground
  (t, d, k) => FOREST(t) + PEEPAL(540, 1500, 1.3, t) + KRISHNA(540, 1850, .85, t, { seated: 1, arms: { l: [-25, 145], r: [25, -145] } }) +
    cArrow(lerp(-200, 180, (t * .3) % 1), 1700, .7, 90) + glow(540, 1350, 220, "#fff1b8", .3) + cBorder(),
  // 1 source – Dwarka by the sea at golden hour
  (t, d, k) => sky([[0, "#f6a65c"], [1, "#ffe6b0"]]) + cSun(820, 900, 70, t) + cSea(1350, t) + DWARKA(1350) + cBorder(),
  // 2 Gandhari grieving on the battlefield
  (t, d, k) => sky([[0, "#3a2a3a"], [1, "#a0604a"]]) + cut("M-60 1450 L1140 1450 L1140 1990 L-60 1990Z", "#5a3a2a") + cArrow(150, 1650, .6, 20) + cArrow(940, 1700, .6, -20) +
    GANDHARI(380, 1880, .85, t, { arms: { l: [-30, 120], r: [30, -120] } }) + KRISHNA(820, 1900, .7, t, { arms: { l: [-25, 145], r: [25, -145] } }) + embers(t, 30, 3, "#ffb38a", [0, 900, W, 900], 60, 5) + cBorder(),
  // 3 the curse – close on Gandhari, lightning
  (t, d, k) => `<g transform="${shake(t, 4)}">` + sky([[0, "#1a0a1a"], [1, "#7a2a2a"]]) + rays(540, 1300, t, "#ff8a6a", 1500, 22, .3, 6) +
    GANDHARI(540, 2050, 1.4, t, { talk: 1, arms: { l: [-160 + wob(t, 1, 10), 30], r: [40, -20] } }) + flash(Math.max(0, Math.sin(t * 2.5)) > .96 ? .6 : 0) + cBorder() + `</g>`,
  // 4 the prank – Samba disguised, sages seated (village by the sea)
  (t, d, k) => SEA(t) + cut("M-60 1450 L1140 1450 L1140 1990 L-60 1990Z", "#e8c9a0") +
    [200, 380].map((x, i) => puppet(x, 1880, .6, t, { kind: "sage", seated: 1, ph: i, arms: { l: [-25, 145], r: [25, -145] } })).join("") +
    puppet(740, 1880, .7, t, { kind: "lakshmi", outfit: "#e86aa0", arms: { l: [-60, 60], r: [60, -60] } }) + puppet(940, 1900, .55, t, { kind: "man", outfit: "#3d6fb0", arms: { l: [-150 + wob(t, 1.5, 15), 10], r: [20, -10] } }) + cBorder(),
  // 5 the iron musal appears – dramatic
  (t, d, k) => `<g transform="${shake(t, 3)}">` + sky([[0, "#2a1a2a"], [1, "#6a3a3a"]]) + rays(540, 1100, t, "#c9c9d9", 1500, 22, .3, 5) +
    `<g transform="translate(540 1200) scale(${lerp(.3, 1.4, easeOut(seg(k, 0, .6))).toFixed(3)}) translate(-540 -1200)">${cMusal(540, 1300, 1.2, wob(t, .5, 6))}</g>` +
    [200, 880].map((x, i) => puppet(x, 1900, .6, t, { kind: "sage", ph: i, arms: { l: [-150, 30], r: [20, -10] } })).join("") + cBorder() + `</g>`,
  // 6 powdered and thrown into the sea – a fish swallows a piece
  (t, d, k) => SEA(t) + embers(t, 40, 6, "#c9c9d9", [300, 900, 480, 400], -150, 5) + cMusal(lerp(540, 600, k), lerp(1000, 1500, k), .4, k * 200) +
    cFish(lerp(-100, 600, easeOut(seg(k, .4, 1))), 1600, .55, t, 0, "#8a9aaa") + cBorder(),
  // 7 Jara finds the iron and shapes an arrow – forest hut, fire
  (t, d, k) => FOREST(t) + cHut(820, 1550, .9) + KUND(500, 1700, t) + JARA(260, 1900, .8, t, { arms: { l: [-60, 60], r: [60, -60] } }) +
    cArrow(500, lerp(1700, 1350, ease(k)), .8, 0, "#6b707a") + glow(500, 1350, 100, "#c9e0ff", .5 * k) + cBorder(),
  // 8 Yadavas fight; Krishna sits alone under the tree (dusk)
  (t, d, k) => sky([[0, "#4a2a4a"], [1, "#e07a4a"]]) + cHill(1300, "#3a5a3a", 70, 3) + PEEPAL(540, 1500, 1.3, t) +
    KRISHNA(540, 1850, .85, t, { seated: 1, arms: { l: [-25, 145], r: [25, -145] } }) + embers(t, 25, 3, "#ffd27a", [0, 800, W, 900], 50, 4) + cBorder(),
  // 9 the arrow – Jara aims at the "deer" (Krishna's foot), slow tension
  (t, d, k) => FOREST(t) + cBush(820, 1820, 1.3) + `<g opacity=".9">${cDeer(860, 1720, .6, t)}</g>` +
    JARA(220, 1900, .8, t, { pull: lerp(.2, 1, ease(seg(k, 0, .7))) }) + cArrow(lerp(380, 780, easeOut(seg(k, .7, 1))), 1430, .6, 90) + flash(.4 * seg(k, .92, 1)) + cBorder(),
  // 10 Krishna forgives the weeping hunter – golden light rising
  (t, d, k) => sky([[0, "#ffd98a"], [1, "#fff6dc"]]) + rays(540, 1100, t, "#fff1b8", 1600, 24, .45) + PEEPAL(640, 1500, 1.1, t) +
    `<g opacity="${(1 - .5 * seg(k, .6, 1)).toFixed(2)}">${KRISHNA(640, 1850, .8, t, { seated: 1, arms: { l: [-20, 10], r: [110, 40] } })}</g>` +
    JARA(260, 1900, .65, t, { arms: { l: [-25, 145], r: [25, -145] } }) + glow(640, 1300 - 400 * seg(k, .5, 1), 200, "#fff", .6 * seg(k, .4, 1)) + cBorder(),
  // 11 karma: Rama's hidden arrow at Bali – Treta echo (split tones)
  (t, d, k) => sky([[0, "#2a3a6a"], [1, "#8a9ac8"]]) + cTree(200, 1600, 1.3, t, false) + cHill(1350, "#3a5a3a", 70, 6) +
    puppet(230, 1900, .7, t, { kind: "man", outfit: "#2f8f5a", item: { l: "bow" }, aim: 0, pull: .8, arms: { l: [-90, 0], r: [-90, 0] } }) +
    puppet(840, 1900, .7, t, { kind: "deva", outfit: "#8a6a3a", arms: { l: [-120, 20], r: [120, -20] } }) + cArrow(lerp(380, 700, (t * .5) % 1), 1450, .5, 90) + cBorder(),
  // 12 CTA – Krishna's flute-like glow over Dwarka at night
  (t, d, k) => sky([[0, "#1a1440"], [1, "#4a3a8a"]]) + stars(t, 80) + cMoon(840, 900, 60) + cSea(1450, t, 1) + DWARKA(1450) +
    rays(540, 1100, t, "#c9a0ff", 1500, 24, .2) + cLotus(540, 1650, .9, t) + cBorder(),
];
const KUND = (x, y, t) => `<g transform="translate(${x} ${y})">${flame(0, -30, 1.1, t)}${cut("M-90 -30 L90 -30 L70 20 L-70 20Z", "#7a4a2a")}</g>`;
