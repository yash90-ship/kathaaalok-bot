/* Dev Uthani Ekadashi – Dadi ji & Chintu conversation */
const HOME = (t, talker, mood = "evening") => cVillage(t, mood) + cCow(900, 1420, .7, t) + cCharpai(330, 1600, 1.05) +
  puppet(330, 1500, .8, t, { kind: "dadi", seated: 1, talk: talker === "dadi", arms: talker === "dadi" ? { l: [-20, 60], r: [60 + wob(t, .5, 20), -100] } : { l: [-20, 60], r: [30, -80] } }) +
  puppet(760, 1760, .66, t, { kind: "chintu", talk: talker === "chintu", arms: talker === "chintu" ? { l: [-30, 20], r: [150 + wob(t, .8, 15), 25] } : { l: [-20, 10], r: [20, -10] } }) +
  cDog(170, 1860, .55, t) + cBorder();
const CLOSE = (t, kind, side = 0) => cVillage(t) + puppet(540 + side, 1560, 1.1, t, { kind, talk: 1, seated: kind === "dadi", arms: { l: [-30, 110 + wob(t, .6, 15)], r: [40, -120] } }) + cBorder();
const VISHNU = (t, k, awake = 0) => sky([[0, "#7fb3ea"], [1, "#d8ecff"]]) + rays(540, 900, t, "#fff6c8", 1500, 22, .25 + .3 * awake, 2) +
  cMilkOcean(1150, t) + cShesha(560, 1300, .9, t) +
  `<g transform="translate(${lerp(560, 520, awake)} ${lerp(1180, 1050, awake)}) rotate(${lerp(-78, 0, ease(awake))})">${puppet(0, 0, .55, t, { kind: "vishnu", seated: awake > .5, arms: { l: [-20, 30], r: [20, -30] } })}</g>` +
  puppet(860, 1290, .45, t, { kind: "lakshmi", seated: 1, item: { r: "lotus" }, arms: { l: [-20, 100], r: [120, 20] } }) + cBorder();

window.SCENES = [
  (t, d, k) => CLOSE(t, "chintu"),
  (t, d, k) => HOME(t, "dadi"),
  (t, d, k) => VISHNU(t, k, 0),
  (t, d, k) => VISHNU(t, k, 0) + `<g opacity=".9">${[0, 1, 2, 3].map(i => `<text x="${800 + i * 40}" y="${700 - i * 60 - (t * 30) % 60}" font-size="${50 + i * 10}" fill="#fff" stroke="${K.line}" stroke-width="3" font-family="Lat">z</text>`).join("")}</g>`,
  (t, d, k) => HOME(t, "chintu"),
  (t, d, k) => cSky("#7fb8ea", "#d7eefc") + cMountain(540, 1250, 1200, 900, "#a99c94") + glow(540, 760, 320, "#bfe0ff", .6) +
    puppet(540, 1080, .55, t, { kind: "shiva", seated: 1, item: { l: "trishul" }, arms: { l: [-30, -10], r: [30, -100] } }) + cHill(1300, K.green) + cBorder(),
  (t, d, k) => cVillage(t, "night") + cHut(540, 1300, 1.1) + cDiya(300, 1500, 1.2, t) + cDiya(780, 1500, 1.2, t, 2) + cBorder(),
  (t, d, k) => VISHNU(t, k, ease(seg(k, .2, .9))),
  (t, d, k) => cVillage(t, "night") + [...Array(10)].map((_, i) => `<g opacity="${clamp(k * 14 - i).toFixed(2)}">${cDiya(80 + i * 100, 1300 + (i % 2) * 90, 1, t, i)}</g>`).join("") +
    cTulsi(540, 1800, .9, t) + cBorder(),
  (t, d, k) => CLOSE(t, "chintu"),
  (t, d, k) => cVillage(t) + cTulsi(330, 1700, 1, t) + puppet(780, 1560, .8, t, { kind: "dadi", talk: 1, seated: 1, arms: { l: [-20, 60], r: [60, -100] } }) + cBorder(),
  (t, d, k) => HOME(t, "dadi"),
];
