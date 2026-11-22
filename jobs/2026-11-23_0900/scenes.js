/* Ashwatthama – Krishna's curse (narrator) */
const NIGHT = (t) => sky([[0, "#0a0a1e"], [1, "#2a1a3a"]]) + stars(t, 90) + cMoon(860, 700, 50);
const ASH = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "man", outfit: "#3a3a4a", item: o.item, talk: o.talk, arms: o.arms || { l: [-20, 10], r: [20, -10] } });
const KRISHNA = (x, y, s, t, o = {}) => puppet(x, y, s, t, { kind: "vishnu", talk: o.talk, arms: o.arms || { l: [-20, 10], r: [100 + wob(t, .5, 8), 30] } });
const CAMP = (t, lit = 1) => NIGHT(t) + cHill(1350, "#1e1a2a", 60, 4) + cTent(220, 1500, .9, t, lit) + cTent(820, 1480, .8, t, lit) + cTent(520, 1420, .6, t, lit) + cTorch(380, 1560, .8, t) + cTorch(680, 1560, .8, t, 2);
const shake = (t, a) => `translate(${wob(t, 9, a).toFixed(1)} ${wob(t, 11, a, 1).toFixed(1)})`;
const WOUND = (x, y, s, t) => glow(x, y, 60 * s, "#ff3a3a", .4 + .3 * Math.sin(t * 3)) + cut(ell(x, y, 22 * s, 14 * s), "#8a1a1a", { sw: 4, noStitch: 1 });

window.SCENES = [
  // 0 hook – shadowy wanderer in fog, glowing wound on forehead, push-in
  (t, d, k) => sky([[0, "#1a1a2a"], [1, "#4a4a5a"]]) + cHill(1300, "#2a2a3a", 80, 2) + cTree(150, 1450, 1.1, t, false) + cTree(950, 1420, .9, t, false, 3) +
    `<g transform="translate(540 1900) scale(${lerp(1, 1.15, k).toFixed(3)}) translate(-540 -1900)">${ASH(540, 1900, 1.15, t, { item: { r: "stick" } })}${WOUND(540, 1900 - 600 * 1.15, 1.15, t)}</g>` +
    cSnow(t, 50, 8).replace(/fill="#fff"/g, 'fill="#c9c9d9"') + cBorder(),
  // 1 source – battlefield night with broken chariot
  (t, d, k) => NIGHT(t) + cut("M-60 1400 L1140 1400 L1140 1990 L-60 1990Z", "#3a2a2a") + `<g transform="rotate(-12 400 1700)">${cChariot(400, 1700, .7, t * 0)}</g>` +
    cArrow(780, 1650, .6, 20) + cArrow(880, 1700, .5, -15) + embers(t, 30, 3, "#ff8a4a", [0, 1200, W, 600], 80, 5) + cBorder(),
  // 2 creeping into the sleeping camp – side pan
  (t, d, k) => `<g transform="translate(${lerp(60, -60, k).toFixed(0)} 0)">${CAMP(t)}</g>` + ASH(lerp(-50, 420, ease(k)), 1880, .75, t, { arms: { l: [-60, 60], r: [60, -60] } }) + cBorder(),
  // 3 the massacre – red flash, tents burn (no gore)
  (t, d, k) => `<g transform="${shake(t, 5)}">` + sky([[0, "#2a0a0a"], [1, "#8a2a1a"]]) + cTent(220, 1500, .9, t, 0) + cTent(820, 1480, .8, t, 0) +
    flame(220, 1300, 2.2, t) + flame(820, 1290, 2, t, 2) + embers(t, 60, 4, "#ffb347", [0, 600, W, 1200], 200, 6) +
    ASH(540, 1880, .85, t, { arms: { l: [-160, 20], r: [160, -20] } }) + flash(.5 * (Math.sin(t * 6) > .9)) + cBorder() + `</g>`,
  // 4 Brahmashira released – blazing weapon in the sky
  (t, d, k) => sky([[0, "#3a0a2a"], [1, "#e0602e"]]) + rays(540, 900, t, "#ffd27a", 1600, 28, .4, 8) + cChakra(540, 900, lerp(.3, 1, easeOut(k)), t * 2) +
    ASH(300, 1900, .8, t, { arms: { l: [-150, 20], r: [160, 10] } }) + puppet(820, 1900, .7, t, { kind: "man", outfit: "#3d6fb0", item: { l: "bow" }, arms: { l: [-90, 0], r: [-90, 0] } }) + cBorder(),
  // 5 he turns it toward Uttara's womb – glowing arc
  (t, d, k) => sky([[0, "#1a0a2a"], [1, "#5a2a4a"]]) + stars(t, 40) + `<path d="M200 900 Q540 ${lerp(600, 900, k)} ${lerp(500, 840, k)} 1350" stroke="#ffd27a" stroke-width="14" fill="none" stroke-dasharray="40 20"/>` +
    cChakra(lerp(500, 840, k), lerp(900, 1300, k), .35, t * 2) + puppet(840, 1900, .72, t, { kind: "lakshmi", outfit: "#e8a0c0", arms: { l: [-25, 145], r: [25, -145] } }) + glow(840, 1600, 140, "#ffe0f0", .5) + cBorder(),
  // 6 Krishna's anger – rays, wind
  (t, d, k) => `<g transform="${shake(t, 3)}">` + sky([[0, "#2a1a4a"], [1, "#d0603a"]]) + rays(540, 1200, t, "#ffb38a", 1600, 26, .35, 6) +
    KRISHNA(540, 1880, .95, t, { arms: { l: [-140, 30], r: [140, -30] } }) + cChakra(540, 850, .5, t * 3) + cBorder() + `</g>`,
  // 7 the curse – close-up of Krishna speaking, lightning
  (t, d, k) => sky([[0, "#1a0a2a"], [1, "#6a2a4a"]]) + rays(540, 1300, t, "#ff9a7a", 1500, 24, .3, 7) + KRISHNA(540, 2050, 1.45, t, { talk: 1, arms: { l: [-20, 10], r: [160, 40] } }) +
    flash(Math.max(0, Math.sin(t * 2.4)) > .96 ? .6 : 0) + cBorder(),
  // 8 the gem is taken from his forehead
  (t, d, k) => NIGHT(t) + cHill(1450, "#1e1a2a", 60, 5) + ASH(540, 2050, 1.3, t, { arms: { l: [-25, 145], r: [25, -145] } }) +
    cGem(lerp(540, 860, easeOut(seg(k, .3, .9))), lerp(2050 - 600 * 1.3, 900, easeOut(seg(k, .3, .9))), 1.2, t) + `<g opacity="${seg(k, .4, .8).toFixed(2)}">${WOUND(540, 2050 - 600 * 1.3, 1.3, t)}</g>` + cBorder(),
  // 9 Krishna revives baby Parikshit – golden light, lotus
  (t, d, k) => sky([[0, "#ffd98a"], [1, "#fff6dc"]]) + rays(540, 1200, t, "#fff1b8", 1600, 24, .4) + KRISHNA(380, 1850, .8, t, { arms: { l: [-20, 10], r: [110, 40] } }) +
    cLotus(760, 1500, 1.2, t) + `<g transform="${tr(760, 1430, .5)}">${cut(ell(0, 0, 60, 40), K.skin)}${cut(circ(60, -20, 34), K.skin)}</g>` + glow(760, 1450, 160 * seg(k, 0, .6), "#fff", .7) + cBorder(),
  // 10 still wandering today – modern-ish lonely road, fog, forehead wound
  (t, d, k) => sky([[0, "#2a2a3a"], [1, "#6a6a7a"]]) + cMountain(300, 1300, 700, 500, "#4a4a5a") + cMountain(820, 1300, 800, 600, "#3a3a4a") +
    cut("M440 1990 L520 1300 L560 1300 L640 1990Z", "#5a5040") + `<g transform="translate(540 ${lerp(1900, 1750, k)}) scale(${lerp(.95, .8, k)}) translate(-540 -1900)">${ASH(540, 1900, 1, t, { item: { r: "stick" } })}${WOUND(540, 1300, 1, t)}</g>` +
    cSnow(t, 60, 4).replace(/fill="#fff"/g, 'fill="#b9b9c9"') + cBorder(),
  // 11 CTA – Krishna with chakra, gem glowing
  (t, d, k) => sky([[0, "#1a1440"], [1, "#4a3a8a"]]) + stars(t, 80) + rays(540, 1250, t, "#c9a0ff", 1500, 24, .25) + KRISHNA(540, 1800, .85, t) + cGem(820, 1250, 1, t) + cBorder(),
];
