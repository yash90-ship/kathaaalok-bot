/* Vaikuntha Chaturdashi – Vishnu's 1000 lotuses & the Sudarshan chakra (narrator) */
const DAWN = (t) => sky([[0, "#e8a6c8"], [.5, "#ffd2a0"], [1, "#fff1d0"]]) + cMountain(250, 1150, 700, 520, "#d9d4e6") + cMountain(820, 1150, 800, 620, "#c9c2dd") +
  cSnow(t, 40);
const POND = (y, t) => cut(`M-60 ${y} Q540 ${y - 60} ${W + 60} ${y} L${W + 60} ${H + 60} L-60 ${H + 60}Z`, "#5fa6c9") +
  [0, 1, 2].map(i => `<path d="M${80 + i * 90} ${y + 80 + i * 70} q160 -16 320 0 q160 16 320 0" stroke="#d8f0ff" stroke-width="4" fill="none" opacity=".7" transform="translate(${wob(t, .2, 20, i).toFixed(0)} 0)"/>`).join("");
const VISHNU = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "vishnu", seated: o.seated, talk: o.talk, item: o.item, arms: o.arms || { l: [-20, 10], r: [20, -10] } });
const SHIVA = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "shiva", item: { r: "trishul" }, talk: o.talk, arms: o.arms || { l: [-20, 10], r: [20, -20] } });
const PUJA = (t, n = 6, hide = -1) => DAWN(t) + cut("M-60 1250 L1140 1250 L1140 1990 L-60 1990Z", "#e9d7b8") + cShivling(700, 1500, .95, t) +
  [...Array(n)].map((_, i) => i === hide ? "" : cLotus(545 + (i % 4) * 85, 1440 - Math.floor(i / 4) * 45, .55, t, i)).join("");
const shake = (t, a) => `translate(${wob(t, 9, a).toFixed(1)} ${wob(t, 11, a, 1).toFixed(1)})`;

window.SCENES = [
  // 0 hook: Vishnu seated before Shivling, one hand near his eye, lotus glowing
  (t, d, k) => PUJA(t, 7) + VISHNU(300, 1820, .82, t, { seated: 1, arms: { l: [-20, 120], r: [140 + wob(t, .6, 6), 60] } }) + glow(345, 1215, 90, "#ffe0f0", .6 + .3 * Math.sin(t * 3)) + cBorder(),
  // 1 source: Kashi ghat with diyas at dawn
  (t, d, k) => DAWN(t) + cRiver(1350, t, 600) + cTemple(300, 1350, 1.1) + cTemple(780, 1350, .9, "#f7d9a0") + [...Array(7)].map((_, i) => cDiya(120 + i * 140, 1800, .9, t, i)).join("") + cBorder(),
  // 2 demons trouble the devas – stormy red night
  (t, d, k) => `<g transform="${shake(t, 4)}">` + sky([[0, "#2a1030"], [.6, "#7a1f2b"], [1, "#e0602e"]]) + stars(t, 30) + cHill(1250, "#4a2a3a", 90, 3) +
    puppet(300, 1700, .78, t, { kind: "asura", arms: { l: [-160 + wob(t, 1.2, 12), 10], r: [160, -10] } }) + puppet(800, 1740, .62, t, { kind: "deva", arms: { l: [-25, 145], r: [25, -145] } }) +
    embers(t, 40, 7, "#ffcf6e", [0, 400, W, 1300], 120, 5) + cBorder() + `</g>`,
  // 3 Vishnu resolves – walks into the Himalaya at dawn (side pan)
  (t, d, k) => `<g transform="translate(${lerp(60, -60, k).toFixed(0)} 0)">` + DAWN(t) + cHill(1350, "#e9eef6", 80, 5) + cTree(120, 1500, .9, t, false) + `</g>` +
    VISHNU(lerp(380, 620, ease(k)), 1800, .8, t, { item: { l: "lotus" }, arms: { l: [-30, 60], r: [40 + wob(t, 1, 15), -20] } }) + cBorder(),
  // 4 thousand lotuses rise from a pond
  (t, d, k) => DAWN(t) + POND(1150, t) + [...Array(18)].map((_, i) => { const x = 90 + (i % 6) * 180 + (Math.floor(i / 6) % 2) * 80, y = 1280 + Math.floor(i / 6) * 220 + (i % 3) * 30;
    return `<g opacity="${clamp(k * 8 - i * .35).toFixed(2)}">${cLily(x, y + 20, .5, t, false)}${cLotus(x, y, .6 + (i % 3) * .1, t, i)}</g>`; }).join("") + cBorder(),
  // 5 offering one lotus per name – lotuses pile up (close shot)
  (t, d, k) => PUJA(t, Math.min(12, 3 + Math.floor(k * 10))) + VISHNU(300, 1820, .82, t, { seated: 1, arms: { l: [-20, 120], r: [lerp(60, 100, (Math.sin(t * 4) + 1) / 2), -20] } }) +
    cLotus(lerp(420, 560, (t * .7) % 1), lerp(1300, 1420, (t * .7) % 1), .45, t) + cBorder(),
  // 6 Shiva secretly hides one lotus (sparkle trail)
  (t, d, k) => PUJA(t, 12) + `<g opacity="${(1 - seg(k, .4, .8)).toFixed(2)}">${cLotus(lerp(785, 980, ease(seg(k, .2, .8))), lerp(1390, 900, ease(seg(k, .2, .8))), .45, t)}</g>` +
    embers(t, 30, 4, "#fff1b8", [600, 800, 480, 700], 60, 6) + VISHNU(300, 1820, .82, t, { seated: 1, arms: { l: [-20, 120], r: [25, -140] } }) + cBorder(),
  // 7 last name – the basket is empty! (close on Vishnu's surprised face)
  (t, d, k) => DAWN(t) + cut("M-60 1250 L1140 1250 L1140 1990 L-60 1990Z", "#e9d7b8") + VISHNU(540, 2050, 1.25, t, { seated: 1, arms: { l: [-60, 120], r: [60, -120] } }) +
    `<g transform="translate(540 1720) rotate(${wob(t, 2, 6)})">${cut("M-150 0 L150 0 L110 120 L-110 120Z", "#c9964a")}<path d="M-130 40 L130 40 M-120 80 L120 80" stroke="${K.line}" stroke-width="5"/></g>` +
    `<text x="820" y="1150" font-size="160" font-family="Lat" font-weight="800" fill="${K.gold}" stroke="${K.line}" stroke-width="6" transform="rotate(${wob(t, 1.5, 8)} 860 1100)">?</text>` + cBorder(),
  // 8 "my eye is a lotus too" – close-up, lotus beside his eye
  (t, d, k) => sky([[0, "#ffd2a0"], [1, "#fff1d0"]]) + rays(540, 1100, t, "#ffe0f0", 1400, 20, .25) +
    VISHNU(540, 2150, 1.45, t, { talk: 1, seated: 1, arms: { l: [-20, 120], r: [60, -120] } }) + cLotus(860, 1220 + wob(t, .5, 10), .9, t) + glow(860, 1180, 120, "#ffe0f0", .5) + cBorder(),
  // 9 ready to offer – hand rises, golden light (no gore, soft flash)
  (t, d, k) => PUJA(t, 11) + VISHNU(300, 1820, .82, t, { seated: 1, arms: { l: [-20, 120], r: [lerp(40, 150, ease(seg(k, 0, .7))), lerp(-20, 70, ease(seg(k, 0, .7)))] } }) +
    glow(330, 1190, 160, "#fff1b8", .4 + .5 * seg(k, .5, 1)) + flash(.5 * seg(k, .85, 1)) + cBorder(),
  // 10 Shiva appears from the linga and stops him
  (t, d, k) => { const a = easeOut(seg(k, 0, .5));
    return PUJA(t, 11) + rays(720, 1100, t, "#fff1b8", 1400, 24, .35 * a) + `<g opacity="${a.toFixed(2)}" transform="translate(0 ${((1 - a) * 200).toFixed(0)})">${SHIVA(720, 1750, .85, t, { arms: { l: [-120, -30], r: [20, -20] } })}</g>` +
      VISHNU(280, 1820, .8, t, { seated: 1, arms: { l: [-20, 120], r: [25, -140] } }) + flash(.6 * (1 - seg(k, 0, .25))) + cBorder(); },
  // 11 Sudarshan chakra gifted – spinning, rising
  (t, d, k) => sky([[0, "#3a2a7a"], [1, "#e8a6c8"]]) + stars(t, 40) + rays(540, 900, t, "#fff1b8", 1600, 26, .3, 5) + cMountain(540, 1350, 1300, 500, "#c9c2dd") +
    cChakra(540, lerp(1200, 820, easeOut(seg(k, 0, .6))), lerp(.4, 1.1, easeOut(seg(k, 0, .6))), t) +
    SHIVA(260, 1800, .72, t, { talk: 0, arms: { l: [-20, 10], r: [130, 20] } }) + VISHNU(820, 1800, .72, t, { arms: { l: [-120, 30], r: [20, -10] } }) + cBorder(),
  // 12 Hari-Har milan: tulsi and bel, both worshipped together
  (t, d, k) => cVillage(t, "evening") + glow(540, 1200, 400, "#ffe6b0", .4) +
    SHIVA(300, 1720, .72, t, { arms: { l: [-20, 10], r: [80 + wob(t, .5, 8), -60] } }) + VISHNU(780, 1720, .72, t, { arms: { l: [-80 - wob(t, .5, 8), 60], r: [20, -10] } }) +
    cChakra(780, 900, .35, t) + [...Array(8)].map((_, i) => cDiya(90 + i * 130, 1830, .8, t, i)).join("") + cBorder(),
  // 13 CTA: chakra over Kashi at night with petals falling
  (t, d, k) => sky([[0, "#1a1440"], [1, "#4a3a8a"]]) + stars(t, 80) + cMoon(860, 300, 60) + cRiver(1450, t, 500) + cTemple(540, 1450, 1.2) +
    cChakra(540, 1000, .5, t) + cSnow(t, 35, 5) + [...Array(6)].map((_, i) => cDiya(120 + i * 170, 1820, .8, t, i)).join("") + cBorder(),
];

const _S = window.SCENES; window.SCENES = [12, 1, 13, 3, 11, 1, 12, 10, 11, 4, 13].map(i => typeof i === 'number' ? _S[i] : NEW[i]);
