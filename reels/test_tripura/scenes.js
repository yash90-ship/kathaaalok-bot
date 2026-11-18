/* Tripurasura vadh – Dev Deepawali, paper-cutout style. fn(t, d, k) per scene. */
const shake = (t, a) => `translate(${wob(t, 9, a).toFixed(1)} ${wob(t, 11, a, 1).toFixed(1)})`;
const NAMASTE = { l: [-25, 145], r: [25, -145] };
const ARCHER = (aim, pull) => aim >= 60 ? { l: [-90 - aim, 0], r: [-30, lerp(-125, -150, pull)] } : { l: [-90 - aim, 0], r: [-90 - aim + 25, lerp(110, 165, pull)] };
const SHIVA_BOW = (t, x, y, s, aim, pull, extra = {}) =>
  puppet(x, y, s, t, { kind: "shiva", item: { l: "bow" }, aim, pull, arms: ARCHER(aim, pull), ...extra });
const DUSK = () => sky([[0, "#5b4a9a"], [.5, "#e0835a"], [1, "#ffd27a"]]);
const NIGHTC = () => sky([[0, "#1d2463"], [.7, "#4a3a8a"], [1, "#7a58a8"]]);

window.SCENES = [
  // 0 HOOK – Shiva aims at the three flying cities
  (t, d, k) => DUSK() + rays(540, 420, t, "#fff1b8", 1600, 22, .25, 3) +
    cCity(220, 420, .45, t, "gold", 0) + cCity(560, 300, .45, t, "silver", 1.2) + cCity(880, 450, .45, t, "iron", 2.4) +
    cMountain(200, 1250, 600, 420) + cMountain(900, 1300, 650, 480) + cHill(1250, K.green) +
    SHIVA_BOW(t, 600, 1430, .95, 32, .55 + .35 * Math.sin(t * 2.2)) + cBorder(),

  // 1 SOURCE – a sage reads the Shiv Mahapuran outside a temple
  (t, d, k) => cSky() + cCloud(200, 300, 1.1, t) + cCloud(860, 420, .9, t + 4) + cTemple(540, 1200, 1.35) +
    cHill(1200, K.green) + cTree(110, 1450, .9, t, true, 2) + cTree(980, 1420, .8, t, true, 5) +
    puppet(540, 1640, .62, t, { kind: "sage", seated: 1, talk: 1, arms: { l: [-30, 120], r: [30, -120] } }) +
    cDiya(300, 1720, 1, t) + cDiya(780, 1720, 1, t, 2) + cBorder(),

  // 2 Tarakasura's three sons do tapasya; Brahma appears with a boon
  (t, d, k) => NIGHTC() + stars(t, 70) + glow(540, 520, 360 * easeOut(seg(k, .3, .7)), "#ffe9a6", .7) +
    `<g opacity="${easeOut(seg(k, .3, .65)).toFixed(2)}">${puppet(540, 700, .42, t, { kind: "brahma", item: { r: "lotus" }, arms: { l: [-30, 10], r: [150, 20] } })}</g>` +
    cHill(1250, "#3f5a8a", 80, 2) + cFire(540, 1520, t) +
    puppet(190, 1700, .5, t, { kind: "asura", seated: 1, arms: NAMASTE, ph: 0 }) +
    puppet(540, 1760, .55, t, { kind: "asura", seated: 1, arms: NAMASTE, ph: 1, outfit: K.red }) +
    puppet(890, 1700, .5, t, { kind: "asura", seated: 1, arms: NAMASTE, ph: 2, outfit: "#2f7d8c" }) + cBorder(),

  // 3 The boon: three cities of gold, silver and iron that can never be destroyed
  (t, d, k) => cSky() + cSun(880, 330, 90, t) + cCloud(220, 520, 1, t) + cCloud(800, 900, 1.2, t + 3) +
    cCity(540, 700 - 120 * easeOut(k), .8, t, "gold", 0) + cCity(240, 1200 - 90 * easeOut(k), .62, t, "silver", 1) +
    cCity(840, 1360 - 100 * easeOut(k), .62, t, "iron", 2) + cCloud(500, 1650, 1.5, t + 6) + cBorder(),

  // 4 Arrogance – the asuras laugh and spread terror (screen shake)
  (t, d, k) => `<g transform="${shake(t, 5)}">` + sky([[0, "#7a1f2b"], [.6, "#e0602e"], [1, "#ffb347"]]) +
    cCity(260, 380, .4, t, "gold", 0, .8) + cCity(800, 330, .4, t, "iron", 1, .8) + cHill(1150, "#8a5a3a", 90, 4) +
    flame(120, 1180, 2.2, t) + flame(960, 1170, 2.0, t, 2) +
    puppet(300, 1420, .78, t, { kind: "asura", talk: 1, arms: { l: [-160 + wob(t, 1.2, 15), 10], r: [160 + wob(t, 1.2, 15, 1), -10] } }) +
    puppet(780, 1440, .82, t, { kind: "asura", talk: 1, outfit: K.red, ph: 1.4, arms: { l: [-150 + wob(t, 1.3, 15, 2), -20], r: [150 + wob(t, 1.3, 15, 3), 20] } }) +
    embers(t, 50, 7, "#ffcf6e", [0, 400, W, 1300], 160, 5) + cBorder() + `</g>`,

  // 5 The devas pray to Shiva on Kailash
  (t, d, k) => cSky("#7fb8ea", "#d7eefc") + cMountain(540, 1150, 1200, 900, "#a99c94") +
    glow(540, 620, 300, "#bfe0ff", .6) + puppet(540, 880, .42, t, { kind: "shiva", seated: 1, arms: { l: [-20, 100], r: [20, -100] } }) +
    cHill(1250, K.green) +
    puppet(200, 1650, .5, t, { kind: "deva", arms: NAMASTE, ph: 0 }) + puppet(540, 1700, .55, t, { kind: "deva", arms: NAMASTE, ph: 1.1 }) +
    puppet(880, 1650, .5, t, { kind: "deva", arms: NAMASTE, ph: 2.2 }) + cBorder(),

  // 6 The divine chariot – sun and moon wheels, Brahma as charioteer
  (t, d, k) => cSky("#6fa8e8", "#cfe8fb") +
    [0, 1, 2, 3, 4].map(i => cCloud(((i * 300 - t * 380) % 1500 + 1500) % 1500 - 200, 300 + i * 260, 1.1, t)).join("") +
    `<g>${[...Array(12)].map((_, i) => { const y = 260 + i * 120, x = ((i * 173 - t * 1100) % 1400 + 1400) % 1400 - 200;
      return `<rect x="${x.toFixed(0)}" y="${y}" width="180" height="8" rx="4" fill="#fff" opacity=".7"/>`; }).join("")}</g>` +
    puppet(290, 1230, .5, t, { kind: "brahma", arms: { l: [-60, -40], r: [60, 40] } }) +
    SHIVA_BOW(t, 680, 1200, .56, 15, .15, { arrow: false }) + cChariot(540, 1440, 1.55, t) + cBorder(),

  // 7 The three cities come into one line – Shiva draws the bow fully
  (t, d, k) => { const a = ease(seg(k, 0, .75));
    return DUSK() + cMoon(880, 260, 55) +
      cCity(lerp(220, 540, a), lerp(620, 260, a), .36, t, "gold", 0) +
      cCity(lerp(860, 540, a), lerp(420, 500, a), .36, t, "silver", 1) +
      cCity(lerp(360, 540, a), lerp(300, 740, a), .36, t, "iron", 2) +
      (k > .75 ? `<rect x="532" y="150" width="16" height="760" rx="8" fill="#fff6c8" opacity="${(.7 * seg(k, .75, .9)).toFixed(2)}"/>` : "") +
      cHill(1250, K.green) + SHIVA_BOW(t, 540, 1480, .85, 90, ease(seg(k, .1, 1))) + cBorder(); },

  // 8 One arrow – flash – the three cities burn to ashes
  (t, d, k) => { const fly = seg(k, 0, .22), boom = seg(k, .2, .35);
    return `<g transform="${shake(t, 14 * (k > .2 ? 1 - seg(k, .25, .9) : 0))}">` + sky([[0, "#5b2a6b"], [.6, "#e0602e"], [1, "#ffd27a"]]) +
      `<g opacity="${(1 - seg(k, .5, .95)).toFixed(2)}" transform="translate(0 ${(260 * seg(k, .4, 1)).toFixed(0)})">` +
      cCity(540, 260, .36, t, "gold", 0, boom) + cCity(540, 500, .36, t, "silver", 1, boom) + cCity(540, 740, .36, t, "iron", 2, boom) + `</g>` +
      (fly < 1 ? `<g transform="translate(540 ${lerp(1250, 250, fly)})"><path d="M0 0 L0 220" stroke="${K.line}" stroke-width="14"/><path d="M0 0 L0 220" stroke="${K.gold}" stroke-width="7"/>${cut("M0 -36 L-20 6 L20 6Z", "#ddd", { sw: 4, noStitch: 1 })}</g>` : "") +
      glow(540, 500, 700 * boom, "#fff3b0", .9 * boom) + embers(t, 110, 41, "#ffcf6e", [100, 100, 880, 1000], -240 * boom, 8) +
      cHill(1250, K.green2) + puppet(540, 1480, .85, t, { kind: "shiva", item: { l: "bow" }, aim: 90, pull: 0, arrow: false, arms: ARCHER(90, 0) }) +
      flash(boom > 0 ? (1 - seg(k, .2, .42)) * .9 : 0) + cBorder() + `</g>`; },

  // 9 The devas celebrate – lighting lamps on the river bank
  (t, d, k) => NIGHTC() + stars(t, 90, 37) + cMoon(820, 320, 70) + cTemple(220, 1080, .9, "#f0b86a") + cTemple(860, 1080, .9, "#f0b86a") +
    cRiver(1080, t) + [...Array(9)].map((_, i) => `<g opacity="${clamp(k * 12 - i).toFixed(2)}">${cDiya(((i * 130 + t * 35) % 1200) - 60, 1480 + (i % 3) * 110, .9, t, i)}</g>`).join("") +
    puppet(330, 1300, .5, t, { kind: "deva", item: { r: "diya" }, arms: { l: [-20, 10], r: [70, -50] } }) +
    puppet(750, 1300, .5, t, { kind: "deva", item: { r: "diya" }, ph: 2, arms: { l: [-20, 10], r: [70, -50] } }) +
    cLily(140, 1800, .8, t, true) + cLily(960, 1760, .7, t) + cBorder(),

  // 10 Tripurari Purnima / Dev Deepawali – full moon over a river of lamps
  (t, d, k) => NIGHTC() + stars(t, 120, 47) + cMoon(540, lerp(700, 460, easeOut(k)), 130) +
    cTemple(160, 1080, .75, "#f0b86a") + cTemple(420, 1080, 1, "#f5c47a") + cTemple(700, 1080, .85, "#f0b86a") + cTemple(940, 1080, .7, "#f0b86a") +
    cRiver(1080, t) + [...Array(16)].map((_, i) => cDiya(((i * 97 + t * 30) % 1200) - 60, 1200 + (i % 5) * 120, .8, t, i)).join("") +
    `<ellipse cx="540" cy="1400" rx="70" ry="260" fill="#fff6d0" opacity=".25"/>` + cBorder(),

  // 11 CTA – Har Har Mahadev
  (t, d, k) => DUSK() + rays(540, 900, t, "#fff1b8", 1500, 24, .3, 4) + cMountain(200, 1300, 600, 500) + cMountain(880, 1300, 600, 560) +
    cHill(1300, K.green) + puppet(540, 1640, .78, t, { kind: "shiva", item: { l: "trishul" }, arms: { l: [-30, -10], r: [150 + wob(t, .8, 10), 10] } }) + cBorder(),
];

function cFire(x, y, t) { return `<g transform="translate(${x} ${y})">${flame(0, -30, 1.4, t)}${flame(-35, -26, .9, t, 1)}${flame(35, -26, .9, t, 2)}
  ${cut("M-110 -30 L110 -30 L90 20 L-90 20Z", "#9c5b3a")}</g>`; }
