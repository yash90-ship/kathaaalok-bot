/* Pushkar – why Brahma is rarely worshipped (narrator) */
const DESERT = (t) => sky([[0, "#f6c36a"], [.55, "#ffe2a8"], [1, "#fff3d6"]]) + cSun(900, 760, 60, t) + cDunes(1150, t);
const LAKE = (y, t) => cut(`M120 ${y} Q540 ${y - 70} 960 ${y} Q1000 ${y + 200} 540 ${y + 230} Q80 ${y + 200} 120 ${y}Z`, "#5fa6c9") +
  [0, 1].map(i => `<path d="M${240 + i * 80} ${y + 70 + i * 60} q140 -14 280 0 q140 14 280 0" stroke="#d8f0ff" stroke-width="4" fill="none" opacity=".7" transform="translate(${wob(t, .2, 20, i).toFixed(0)} 0)"/>`).join("");
const BRAHMA = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "brahma", seated: o.seated, talk: o.talk, item: o.item, arms: o.arms || { l: [-25, 145], r: [25, -145] } });
const SAVITRI = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "lakshmi", outfit: "#c2185b", talk: o.talk, arms: o.arms || { l: [-20, 10], r: [20, -10] } });
const GAYATRI = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "lakshmi", outfit: "#f2b632", seated: o.seated, talk: o.talk, arms: o.arms || { l: [-25, 145], r: [25, -145] } });
const KUND = (x, y, t) => `<g transform="translate(${x} ${y})">${flame(0, -30, 1.3, t)}${flame(-35, -26, .8, t, 1)}${flame(35, -26, .8, t, 2)}${cut("M-110 -30 L110 -30 L90 20 L-90 20Z", "#9c5b3a")}</g>`;
const YAJNA = (t) => DESERT(t) + LAKE(1180, t) + cTemple(160, 1250, .6) + KUND(540, 1560, t) + embers(t, 20, 3, "#ffcf6e", [400, 1200, 280, 400], 100, 5);
const shake = (t, a) => `translate(${wob(t, 9, a).toFixed(1)} ${wob(t, 11, a, 1).toFixed(1)})`;
const HILLTEMPLE = (x, y, s) => cut(`M${x - 260 * s} ${y} Q${x} ${y - 420 * s} ${x + 260 * s} ${y}Z`, "#b9895a") + cTemple(x, y - 300 * s, .55 * s, "#f7d9a0");

window.SCENES = [
  // 0 hook – lone Brahma temple in the desert, Brahma seated on lotus above it
  (t, d, k) => DESERT(t) + cTemple(540, 1760, 1.1) + glow(540, 1150, 320, "#fff1b8", .45) + cLotus(540, 1290, 1.9, t) + BRAHMA(540, 1240, .62, t, { seated: 1 }) +
    cCamel(lerp(1150, 760, k), 1830, .55, t) + cBorder(),
  // 1 source – Pushkar mela: camels walking, ghats with diyas
  (t, d, k) => DESERT(t) + LAKE(1250, t) + cTemple(220, 1300, .7) + cTemple(860, 1300, .6, "#f7d9a0") +
    cCamel(lerp(-150, 1250, (t * .06) % 1), 1820, .55, t) + cCamel(lerp(-450, 950, (t * .06) % 1), 1880, .6, t, 2) + cBorder(),
  // 2 a lotus falls from Brahma's hand (sky, top-down drift)
  (t, d, k) => sky([[0, "#8fd0f0"], [1, "#fff3d6"]]) + cCloud(220, 600, 1.4, t) + cCloud(850, 760, 1.1, t) + BRAHMA(540, 980, .6, t, { arms: { l: [-25, 145], r: [130, 40] } }) +
    cLotus(lerp(640, 540, k), lerp(900, 1650, easeOut(k)), .9, t) + cDunes(1550, t) + cBorder(),
  // 3 petals land – three lakes appear
  (t, d, k) => DESERT(t) + [[260, 1350], [760, 1450], [480, 1700]].map(([x, y], i) => `<g opacity="${clamp(k * 4 - i).toFixed(2)}">${cut(ell(x, y, 210, 80), "#5fa6c9")}${cLotus(x, y - 10, .5, t, i)}</g>`).join("") +
    flash(.4 * (1 - seg(k, 0, .2))) + cBorder(),
  // 4 Brahma decides on a yajna – seated by the fire
  (t, d, k) => YAJNA(t) + BRAHMA(300, 1800, .8, t, { seated: 1, arms: { l: [-20, 120], r: [80 + wob(t, .5, 10), -40] } }) + cBorder(),
  // 5 waiting – empty seat, sun moving fast (time passing)
  (t, d, k) => sky([[0, "#f6c36a"], [1, "#fff3d6"]]) + cSun(lerp(200, 880, k), lerp(900, 700, k), 60, t) + cDunes(1150, t) + KUND(540, 1560, t) +
    BRAHMA(300, 1800, .8, t, { seated: 1, arms: { l: [-30, 110], r: [140, 60] } }) + cut(rrect(680, 1650, 220, 60, 20), "#d23a35") +
    `<text x="790" y="1580" text-anchor="middle" font-size="120" font-family="Lat" font-weight="800" fill="${K.gold}" stroke="${K.line}" stroke-width="5">?</text>` + cBorder(),
  // 6 Gayatri seated at the yajna
  (t, d, k) => YAJNA(t) + BRAHMA(300, 1800, .8, t, { seated: 1 }) + GAYATRI(790, 1800, .72, t, { seated: 1 }) + cBorder(),
  // 7 Savitri arrives, angry – red sky, wind
  (t, d, k) => `<g transform="${shake(t, 3)}">` + sky([[0, "#7a1f2b"], [.6, "#e0602e"], [1, "#ffb347"]]) + cDunes(1150, t, "#c9844a", "#b06a38") +
    embers(t, 40, 7, "#ffcf6e", [0, 400, W, 1300], 120, 5) + SAVITRI(lerp(1200, 760, easeOut(seg(k, 0, .5))), 1800, .85, t, { arms: { l: [-150, 20], r: [20, -10] } }) +
    BRAHMA(280, 1820, .72, t, { seated: 1 }) + cBorder() + `</g>`,
  // 8 the curse – close-up of Savitri, lightning flash
  (t, d, k) => `<g transform="${shake(t, 5)}">` + sky([[0, "#3a0f1a"], [1, "#a0302a"]]) + rays(540, 1200, t, "#ff8a6a", 1500, 20, .25, 6) +
    SAVITRI(540, 2040, 1.4, t, { talk: 1, arms: { l: [-160 + wob(t, 1, 10), 30], r: [40, -20] } }) + flash(Math.max(0, Math.sin(t * 2.5)) > .96 ? .6 : 0) + cBorder() + `</g>`,
  // 9 devas tremble
  (t, d, k) => `<g transform="${shake(t, 6)}">` + sky([[0, "#5a2030"], [1, "#c0603a"]]) + cDunes(1250, t, "#c9844a", "#b06a38") +
    [200, 540, 880].map((x, i) => puppet(x, 1800, .58, t, { kind: "deva", ph: i, arms: { l: [-25, 145], r: [25, -145] } })).join("") + cBorder() + `</g>`,
  // 10 Gayatri softens the curse – golden calm light
  (t, d, k) => sky([[0, "#ffd98a"], [1, "#fff6dc"]]) + rays(540, 1100, t, "#fff1b8", 1500, 24, .35) + cDunes(1300, t) +
    GAYATRI(540, 1780, .85, t, { arms: { l: [-20, 10], r: [150 + wob(t, .5, 8), 10] } }) + glow(540, 1150, 220, "#fff1b8", .5) + cBorder(),
  // 11 blessing – Pushkar lake glows with diyas
  (t, d, k) => sky([[0, "#4a3a8a"], [1, "#ffb37a"]]) + stars(t, 30) + cDunes(1150, t, "#d9a15c", "#c08848") + LAKE(1250, t) +
    [...Array(8)].map((_, i) => `<g opacity="${clamp(k * 8 - i).toFixed(2)}">${cDiya(220 + (i % 4) * 210, 1330 + Math.floor(i / 4) * 90, .7, t, i)}</g>`).join("") +
    GAYATRI(880, 1800, .6, t, { talk: 1, arms: { l: [-140, 30], r: [20, -10] } }) + cBorder(),
  // 12 Brahma temple of Pushkar – push-in with red spire
  (t, d, k) => DESERT(t) + `<g transform="translate(540 1500) scale(${lerp(1.1, 1.5, k).toFixed(3)}) translate(-540 -1500)">${cTemple(540, 1500, 1.2, "#f7d9a0")}</g>` +
    cut("M500 860 L540 780 L580 860Z", K.red) + cCamel(180, 1850, .45, t, 1, 0) + cBorder(),
  // 13 Savitri temple on the high hill (wide shot)
  (t, d, k) => sky([[0, "#8fd0f0"], [1, "#fff3d6"]]) + cCloud(300, 480, 1, t) + HILLTEMPLE(720, 1350, 1.4) + HILLTEMPLE(200, 1450, .7) + LAKE(1450, t) +
    cBird(lerp(-50, 1100, k), 700, .6, t) + cBorder(),
  // 14 CTA – desert night, lake of lamps, lotus glows
  (t, d, k) => sky([[0, "#1a1440"], [1, "#4a3a8a"]]) + stars(t, 80) + cMoon(840, 330, 60) + cDunes(1150, t, "#7a5a8a", "#5a4070") + LAKE(1300, t) +
    cLotus(540, 1380, .9, t) + [...Array(6)].map((_, i) => cDiya(130 + i * 165, 1800, .8, t, i)).join("") + cBorder(),
];
