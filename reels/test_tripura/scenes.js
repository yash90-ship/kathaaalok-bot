/* Tripurasura vadh – Dev Deepawali. One draw function per scene: (t seconds, d duration, k progress 0..1) */
const NIGHT = [[0, "#0a0b24"], [.55, "#2a1747"], [.85, "#7a2440"], [1, "#c8552e"]];
const DUSK = [[0, "#1a1240"], [.5, "#6b2350"], [.8, "#d8622e"], [1, "#f2a144"]];
const EMBER_RED = [[0, "#1a0508"], [.45, "#5e1018"], [.8, "#b8331f"], [1, "#f07a2a"]];
const shake = (t, a) => `translate(${wob(t, 9, a).toFixed(1)} ${wob(t, 11, a, 1).toFixed(1)})`;

window.SCENES = [
  // 0 HOOK – Shiva draws his bow under three glowing cities
  (t, d, k) => sky(NIGHT) + stars(t, 110) +
    city(250, 640, .42, t, "gold", 0) + city(560, 520, .42, t, "silver", 1.2) + city(850, 660, .42, t, "iron", 2.4) +
    hills(1500, "#170c22", t, 70, 3, 0, C.gold) + mountain(540, 1650, 900, 380, "#120a18") +
    person(540, 1500, 1.25, t, { pose: "archer", aim: 35, pull: .35 + .45 * (0.5 + 0.5 * Math.sin(t * 2.4)), jata: 1, snake: 1, fill: C.shiva, rim: C.gold2, aura: "#7fb2ff", scarf: C.saffron }) +
    hills(1780, "#0b0612", t, 50, 8) + embers(t, 45, 3),

  // 1 SOURCE – temple at night, diyas, scripture
  (t, d, k) => sky(DUSK) + rays(540, 700, t, C.gold2, 1100, 20, .1) + moon(820, 360, 70, t) +
    temple(540, 1460, 1.5, "#1b0e22") + temple(170, 1500, .9, "#140a1a") + temple(910, 1500, .9, "#140a1a") +
    ghats(1500, t, 1) + embers(t, 30, 9, C.gold2, [0, 900, W, 900]),

  // 2 Tarakasura's three sons do tapasya; Brahma appears
  (t, d, k) => sky(NIGHT) + stars(t, 80, 4) + hills(1250, "#1b1030", t, 90, 6, 0, C.gold) +
    `<g opacity="${easeOut(seg(k, .35, .7)).toFixed(2)}">${person(540, 980, .8, t, { pose: "raise", crown: 1, fill: "#3b2a12", rim: C.gold2, aura: "#ffd27a" })}</g>` +
    fireAltar(540, 1500, 1.2, t) +
    person(200, 1880, 1.35, t, { pose: "pray", horns: 1, eyes: "#ff3b2f", fill: C.asura, rim: "#d0533a", ph: 0 }) +
    person(540, 1900, 1.45, t, { pose: "pray", horns: 1, eyes: "#ff3b2f", fill: C.asura, rim: "#d0533a", ph: 1 }) +
    person(880, 1880, 1.35, t, { pose: "pray", horns: 1, eyes: "#ff3b2f", fill: C.asura, rim: "#d0533a", ph: 2 }) +
    embers(t, 35, 21, "#ffb25a", [300, 1100, 480, 600], 120),

  // 3 The boon: three flying cities of gold, silver and iron
  (t, d, k) => sky(DUSK) + sun(540, 1250, 120, t) + cloud(200, 1350, 1.2, t) + cloud(880, 1150, 1, t + 3) +
    city(540, 620 - 60 * easeOut(k), .8, t, "gold", 0) + city(250, 1030 - 40 * easeOut(k), .62, t, "silver", 1) +
    city(830, 1300 - 50 * easeOut(k), .62, t, "iron", 2) + cloud(560, 1650, 1.6, t + 5, "#341c45") + embers(t, 25, 2),

  // 4 Arrogance – the asuras terrorise the three worlds (screen shake)
  (t, d, k) => `<g transform="${shake(t, 6)}">` + sky(EMBER_RED) + city(300, 520, .45, t, "gold", 0, .7) + city(780, 470, .45, t, "iron", 1, .7) +
    hills(1350, "#2a0b10", t, 110, 12, 0, "#ff7a3a") +
    flame(150, 1380, 2.2, t) + flame(420, 1340, 1.6, t, 1) + flame(720, 1370, 2.0, t, 2) + flame(960, 1350, 1.5, t, 3) +
    person(300, 1800, 1.1, t, { pose: "raise", horns: 1, eyes: "#ffdf3b", fill: C.asura, rim: "#ff6a3a", ph: 0 }) +
    person(780, 1820, 1.2, t, { pose: "raise", horns: 1, eyes: "#ffdf3b", fill: C.asura, rim: "#ff6a3a", ph: 1.5 }) +
    embers(t, 70, 7, "#ffb25a", [0, 600, W, 1300], 180, 5) + `</g>`,

  // 5 The devas pray to Shiva on Kailash
  (t, d, k) => sky([[0, "#08102e"], [.6, "#1f2c6b"], [1, "#4b5fa8"]]) + stars(t, 90, 13) +
    mountain(540, 1250, 1300, 820, "#141838", "#cfe0ff") +
    person(540, 1080, .85, t, { pose: "sit", jata: 1, snake: 1, fill: C.shiva, rim: "#bcd2ff", aura: "#8fb8ff" }) +
    hills(1500, "#0e1030", t, 40, 4) +
    person(200, 1820, .9, t, { pose: "bow", crown: 1, fill: C.ink, rim: C.gold, ph: 0 }) +
    person(420, 1850, .95, t, { pose: "pray", crown: 1, fill: C.ink, rim: C.gold, ph: 1 }) +
    person(660, 1850, .95, t, { pose: "pray", crown: 1, fill: C.ink, rim: C.gold, ph: 2 }) +
    person(880, 1820, .9, t, { pose: "bow", crown: 1, fill: C.ink, rim: C.gold, ph: 3 }) + embers(t, 25, 5, "#cfe0ff"),

  // 6 The divine chariot – sun and moon wheels, Brahma as charioteer
  (t, d, k) => sky([[0, "#120c33"], [.6, "#3a1c5c"], [1, "#a8432e"]]) + stars(t, 60, 17) +
    [0, 1, 2, 3].map(i => cloud(((i * 330 - t * 260) % 1500 + 1500) % 1500 - 200, 500 + i * 330, 1.3, t, "#2a1d52", .8)).join("") +
    `<g>${[...Array(14)].map((_, i) => { const y = 300 + i * 110, x = ((i * 173 - t * 900) % 1400 + 1400) % 1400 - 200;
      return `<rect x="${x.toFixed(0)}" y="${y}" width="160" height="4" rx="2" fill="${C.gold2}" opacity=".35"/>`; }).join("")}</g>` +
    chariot(540, 1300, 1.15, t) +
    person(330, 1225, .7, t, { pose: "stand", crown: 1, fill: "#3b2a12", rim: C.gold2 }) +
    person(620, 1225, .85, t, { pose: "archer", aim: 20, pull: .1, jata: 1, snake: 1, fill: C.shiva, rim: C.gold2, aura: "#7fb2ff", arrow: false, scarf: C.saffron }) + embers(t, 40, 31, C.gold2, [0, 0, W, H], -200),

  // 7 The three cities come into one line – Shiva draws the bow fully
  (t, d, k) => { const a = ease(seg(k, 0, .75));
    return sky(NIGHT) + stars(t, 100, 19) + moon(860, 300, 50, t) +
      city(lerp(220, 540, a), lerp(760, 360, a), .38, t, "gold", 0) +
      city(lerp(860, 540, a), lerp(520, 600, a), .38, t, "silver", 1) +
      city(lerp(380, 540, a), lerp(380, 840, a), .38, t, "iron", 2) +
      (k > .75 ? `<rect x="536" y="200" width="8" height="800" fill="${C.gold2}" opacity="${(.5 * seg(k, .75, .9)).toFixed(2)}"/>` : "") +
      hills(1550, "#170c22", t, 60, 3, 0, C.gold) +
      person(540, 1720, 1.15, t, { pose: "archer", aim: 90, pull: ease(seg(k, .2, 1)), jata: 1, snake: 1, fill: C.shiva, rim: C.gold2, aura: "#7fb2ff", scarf: C.saffron, sway: 0 }) +
      embers(t, 30, 23); },

  // 8 One arrow – flash – the cities burn to ashes
  (t, d, k) => { const fly = seg(k, 0, .22), boom = seg(k, .2, .35);
    return `<g transform="${shake(t, 14 * (1 - seg(k, .25, .9)) * (k > .2 ? 1 : 0))}">` + sky(EMBER_RED) + stars(t, 40, 29) +
      `<g opacity="${(1 - seg(k, .45, .95)).toFixed(2)}" transform="translate(0 ${(300 * seg(k, .4, 1)).toFixed(0)})">` +
      city(540, 360, .38, t, "gold", 0, boom) + city(540, 600, .38, t, "silver", 1, boom) + city(540, 840, .38, t, "iron", 2, boom) + `</g>` +
      (fly < 1 ? `<path d="M540 ${lerp(1600, 300, fly)} l-14 60 l28 0Z" fill="${C.gold2}"/><rect x="536" y="${lerp(1660, 360, fly)}" width="8" height="${200 + 400 * fly}" fill="${C.gold2}" opacity=".7"/>` : "") +
      glow(540, 600, 700 * boom, "#ffcf6e", .8 * boom) +
      embers(t, 120, 41, "#ffcf6e", [100, 200, 880, 1100], -260 * boom, 7) +
      hills(1650, "#1a0608", t, 60, 3, 0, "#ff7a3a") +
      flash(boom > 0 ? (1 - seg(k, .2, .4)) * .9 : 0) + `</g>`; },

  // 9 The devas celebrate – lamps light up one by one
  (t, d, k) => sky([[0, "#090a24"], [.55, "#24153f"], [1, "#4a2140"]]) + stars(t, 120, 37) + moon(800, 380, 60, t) +
    temple(300, 1250, 1.1, "#170c1f") + temple(780, 1250, 1.1, "#170c1f") + ghats(1250, t, k * 1.1) +
    river(1480, t) + person(200, 1250, .55, t, { pose: "stand", crown: 1, fill: C.ink, rim: C.gold }) +
    person(900, 1250, .55, t, { pose: "stand", crown: 1, fill: C.ink, rim: C.gold, ph: 2 }) +
    [...Array(8)].map((_, i) => diya(((i * 150 + t * 40) % 1200) - 60, 1560 + (i % 3) * 90, .5, t, i)).join("") +
    embers(t, 40, 43, C.gold2, [0, 900, W, 900], 80),

  // 10 Tripurari Purnima / Dev Deepawali – full moon over a river of light
  (t, d, k) => sky([[0, "#070820"], [.6, "#1e1440"], [1, "#5a2546"]]) + stars(t, 140, 47) +
    moon(540, lerp(760, 520, easeOut(k)), 120, t) + rays(540, lerp(760, 520, easeOut(k)), t, "#fff1cc", 900, 24, .07) +
    temple(150, 1230, .8, "#140a1a") + temple(400, 1250, 1.2, "#1b0e22") + temple(700, 1240, 1.0, "#160b1c") + temple(950, 1230, .8, "#140a1a") +
    ghats(1250, t, 2) + river(1480, t, "#1a2560", 440) +
    [...Array(14)].map((_, i) => diya(((i * 97 + t * 30) % 1200) - 60, 1540 + (i % 4) * 85, .48, t, i)).join("") +
    `<ellipse cx="540" cy="1700" rx="60" ry="200" fill="#fff1cc" opacity=".12"/>`,

  // 11 CTA – Har Har Mahadev
  (t, d, k) => sky(NIGHT) + stars(t, 120, 53) + rays(540, 1300, t, "#9cc3ff", 1100, 24, .1) +
    person(540, 1880, 1.15, t, { pose: "stand", jata: 1, snake: 1, trishul: 1, fill: C.shiva, rim: C.gold2, aura: "#8fb8ff", scarf: C.saffron }) +
    embers(t, 60, 59, C.gold2),
];
