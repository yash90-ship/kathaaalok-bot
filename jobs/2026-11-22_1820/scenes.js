/* Bhishma on the bed of arrows – Bhishma Panchak (narrator) */
const DUST = (t) => sky([[0, "#6a3a5a"], [.55, "#e07a4a"], [1, "#f6c38a"]]) + cSun(820, 820, 80, t) + cHill(1250, "#b07a4a", 70, 6) + embers(t, 25, 5, "#ffe0b0", [0, 900, W, 900], 50, 4);
const BHISHMA = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "sage", outfit: "#f7f3ea", talk: o.talk, item: o.item, arms: o.arms || { l: [-20, 10], r: [20, -10] } });
const ARJUNA = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "man", outfit: "#3d6fb0", item: { l: "bow" }, aim: o.aim ?? 0, pull: o.pull ?? .5, arms: o.arms || { l: [-90, 0], r: [-90, 0] } });
const KRISHNA = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "vishnu", arms: o.arms || { l: [-20, 10], r: [100 + wob(t, .5, 8), 30] } });
const LYING = (x, y, s, t) => cArrowBed(x, y + 60, s, t) + `<g transform="translate(${x - 20 * s} ${y}) rotate(-84)">${BHISHMA(0, 0, .55 * s, t, { arms: { l: [-20, 40], r: [20, -40] } })}</g>`;
const FIELD = (t) => DUST(t) + cut("M-60 1450 L1140 1450 L1140 1990 L-60 1990Z", "#c79a62") + cArrow(150, 1600, .5, 20) + cArrow(930, 1650, .5, -25) + cArrow(820, 1520, .4, 10);
const shake = (t, a) => `translate(${wob(t, 9, a).toFixed(1)} ${wob(t, 11, a, 1).toFixed(1)})`;

window.SCENES = [
  // 0 hook – Bhishma on the bed of arrows at dusk, slow push
  (t, d, k) => FIELD(t) + LYING(560, 1420, 1.55, t) + cBorder(),
  // 1 source – Kurukshetra wide: chariots, banners
  (t, d, k) => DUST(t) + cut("M-60 1450 L1140 1450 L1140 1990 L-60 1990Z", "#c79a62") + cChariot(270, 1700, .7, t) + cChariot(820, 1760, .6, t) +
    [200, 870].map(x => cut(`M${x} 1550 L${x} 1250 L${x + 110} 1290 L${x} 1330`, K.saffron, { sw: 5 })).join("") + cBorder(),
  // 2 the vow – young Bhishma raises hand, palace pillars
  (t, d, k) => sky([[0, "#f4d8a8"], [1, "#fff3d6"]]) + [120, 360, 720, 960].map(x => cut(rrect(x - 45, 700, 90, 1100, 10), "#e9cfa0")).join("") + cut("M-60 1800 L1140 1800 L1140 1990 L-60 1990Z", "#c9a070") +
    puppet(540, 1800, .85, t, { kind: "deva", outfit: "#f7f3ea", arms: { l: [-20, 10], r: [160, 10] } }) + glow(700, 1150, 120, "#fff1b8", .5 + .3 * Math.sin(t * 3)) + cBorder(),
  // 3 Shantanu blesses – iccha mrityu
  (t, d, k) => sky([[0, "#f4d8a8"], [1, "#fff3d6"]]) + rays(300, 1000, t, "#fff1b8", 1300, 20, .3) + [120, 960].map(x => cut(rrect(x - 45, 700, 90, 1100, 10), "#e9cfa0")).join("") +
    puppet(300, 1800, .8, t, { kind: "deva", outfit: "#7d5ba6", arms: { l: [-20, 10], r: [120 + wob(t, .5, 8), 20] } }) +
    puppet(760, 1820, .75, t, { kind: "deva", outfit: "#f7f3ea", arms: { l: [-25, 145], r: [25, -145] } }) + cBorder(),
  // 4 battle – Bhishma unstoppable, arrows fly
  (t, d, k) => `<g transform="${shake(t, 3)}">` + DUST(t) + cChariot(320, 1720, .75, t) + `<g transform="translate(0 -250)">${BHISHMA(320, 1720, .7, t, { item: { l: "bow" }, arms: { l: [-90, 0], r: [-90, 0] } })}</g>` +
    [...Array(6)].map((_, i) => cArrow(((t * 500 + i * 190) % 1300) - 100, 900 + i * 90, .5, 90)).join("") + cBorder() + `</g>`,
  // 5 day ten – Arjuna's arrows, Bhishma falls (flash)
  (t, d, k) => DUST(t) + ARJUNA(260, 1820, .75, t, { pull: (Math.sin(t * 5) + 1) / 2 }) +
    `<g transform="translate(760 1760) rotate(${lerp(0, 50, easeOut(seg(k, .3, .9)))})">${BHISHMA(0, 0, .7, t, { arms: { l: [-120, 30], r: [120, -30] } })}</g>` +
    [...Array(4)].map((_, i) => cArrow(lerp(380, 760, ((t * .8 + i * .25) % 1)), 1250 + i * 40, .45, 90)).join("") + flash(.5 * seg(k, .85, 1)) + cBorder(),
  // 6 he rests on arrows, not the ground (close side view)
  (t, d, k) => FIELD(t) + LYING(560, 1520 - 40 * easeOut(seg(k, 0, .5)), 1.45, t) + glow(540, 1500, 300, "#fff1b8", .3) + cBorder(),
  // 7 pillow of three arrows – Arjuna kneels
  (t, d, k) => FIELD(t) + LYING(680, 1500, 1.15, t) + [0, 1, 2].map(i => `<g opacity="${clamp(k * 5 - i - .5).toFixed(2)}">${cArrow(300 + i * 30, 1520, .5, 10 - i * 10)}</g>`).join("") +
    ARJUNA(120, 1880, .55, t, { aim: -20 }) + cBorder(),
  // 8 water spring from the earth
  (t, d, k) => FIELD(t) + LYING(700, 1500, 1.15, t) + ARJUNA(110, 1880, .55, t, { aim: 40 }) +
    `<g opacity="${seg(k, .2, .5).toFixed(2)}"><path d="M320 1620 Q330 ${1450 - 30 * Math.sin(t * 6)} 300 1380" stroke="#9fd4f5" stroke-width="22" fill="none"/><path d="M320 1620 Q330 1450 300 1380" stroke="#fff" stroke-width="6" fill="none" stroke-dasharray="12 14"/></g>` +
    embers(t, 25, 3, "#cfeaff", [250, 1350, 140, 280], 120, 6) + cBorder(),
  // 9 waiting for Uttarayan – days pass, sun shifts, stars
  (t, d, k) => sky([[0, "#1a1440"], [.6, "#5a3a7a"], [1, "#e07a4a"]]) + stars(t, 60) + cSun(lerp(200, 880, k), 900, 50, t) + cut("M-60 1450 L1140 1450 L1140 1990 L-60 1990Z", "#a07a52") +
    LYING(540, 1560, 1.05, t) + `<text x="540" y="1180" text-anchor="middle" font-size="110" font-family="Lat" font-weight="800" fill="${K.gold}" stroke="${K.line}" stroke-width="5">${Math.min(58, 1 + Math.floor(k * 58))}</text>` + cBorder(),
  // 10 Krishna brings Yudhishthira
  (t, d, k) => FIELD(t) + LYING(720, 1580, .9, t) + KRISHNA(lerp(-80, 220, easeOut(seg(k, 0, .6))), 1800, .62, t) +
    puppet(lerp(-220, 400, easeOut(seg(k, 0, .6))), 1830, .55, t, { kind: "deva", outfit: "#d9a15c", arms: { l: [-25, 145], r: [25, -145] } }) + cBorder(),
  // 11 the teaching – golden light, floating scroll glyphs
  (t, d, k) => sky([[0, "#ffd98a"], [1, "#fff6dc"]]) + rays(700, 1300, t, "#fff1b8", 1500, 24, .3) + cut("M-60 1450 L1140 1450 L1140 1990 L-60 1990Z", "#d8b07a") +
    LYING(720, 1580, .9, t) + KRISHNA(220, 1800, .62, t, { arms: { l: [-20, 10], r: [20, -10] } }) +
    puppet(420, 1830, .55, t, { kind: "deva", outfit: "#d9a15c", seated: 1, arms: { l: [-25, 145], r: [25, -145] } }) +
    ["ॐ", "धर्म", "हरि"].map((w, i) => `<text x="${560 + i * 150}" y="${1250 - ((t * 60 + i * 80) % 300)}" font-size="70" font-family="Dev" font-weight="800" fill="${K.saffron}" opacity=".8">${w}</text>`).join("") + cBorder(),
  // 12 Bhishma Panchak – five diyas light one by one at home tulsi
  (t, d, k) => cVillage(t, "evening") + cTulsi(540, 1640, .8, t) + [...Array(5)].map((_, i) => `<g opacity="${clamp(k * 6 - i).toFixed(2)}">${cDiya(160 + i * 190, 1760, 1, t, i)}</g>`).join("") +
    [...Array(5)].map((_, i) => `<text x="${160 + i * 190}" y="1860" text-anchor="middle" font-size="54" font-family="Lat" font-weight="800" fill="${K.gold}" stroke="${K.line}" stroke-width="3" opacity="${clamp(k * 6 - i).toFixed(2)}">${i + 1}</text>`).join("") + cBorder(),
  // 13 CTA – Krishna with chakra at sunset over the field
  (t, d, k) => DUST(t) + rays(540, 1100, t, "#fff1b8", 1500, 24, .3) + KRISHNA(540, 1750, .8, t) + cChakra(780, 1000, .3, t) + cArrowBed(540, 1880, .8, t) + cBorder(),
];
