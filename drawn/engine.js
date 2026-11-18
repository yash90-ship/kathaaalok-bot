/* kathaaalok animated-drawing engine.
 * Style: "deep-night paper cut" – layered silhouettes with golden rim light, glowing skies,
 * drifting embers, parallax and character motion. Everything is drawn in code (SVG), frame by frame.
 *
 * A reel = window.TIMELINE (from make.py: scene timings + captions) + window.SCENES (one draw
 * function per scene, written per story in scenes.js). Each draw fn(t, d, k) returns SVG markup
 * for local time t (seconds) of a scene lasting d seconds; k = t/d (0..1).
 */
const W = 1080, H = 1920;
const TAU = Math.PI * 2;
const C = {
  ink: "#120a16", ink2: "#1d1024", gold: "#f4b942", gold2: "#ffd77a", saffron: "#e8781e",
  crimson: "#9b1d2a", indigo: "#1b1f4b", night: "#0b0d26", rose: "#c8466b", cream: "#fbe9c6",
  silver: "#cfd8e6", iron: "#7c8496", shiva: "#24356e", shiva2: "#3a56a8", asura: "#2a0d10",
};

/* ---------- small math helpers ---------- */
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => (k = clamp(k), k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
const easeOut = k => 1 - Math.pow(1 - clamp(k), 3);
const easeBack = k => { k = clamp(k); const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const seg = (t, a, b) => clamp((t - a) / (b - a));           // 0..1 progress of t between a and b
const wob = (t, f = 1, a = 1, p = 0) => Math.sin(t * f * TAU + p) * a;
function rnd(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
let _uid = 0; const uid = p => `${p}${++_uid}`;
const tr = (x, y, s = 1, r = 0) => `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)})`;

/* ---------- backgrounds ---------- */
function sky(stops, extra = "") {               // stops: [[offset, color], ...] top->bottom
  const id = uid("sky");
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) =>
    `<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient></defs>
    <rect x="-200" y="-200" width="${W + 400}" height="${H + 400}" fill="url(#${id})"/>${extra}`;
}
function glow(x, y, r, color, op = .8) {
  const id = uid("gl");
  return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/>
    <stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/>`;
}
function stars(t, n = 90, seed = 7, ymax = 1100) {
  const R = rnd(seed); let s = "";
  for (let i = 0; i < n; i++) {
    const x = R() * W, y = R() * ymax, r = .8 + R() * 2.4, ph = R() * TAU;
    const o = .35 + .65 * (0.5 + 0.5 * Math.sin(t * (1 + R() * 2) + ph));
    s += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#fff6dc" opacity="${o.toFixed(2)}"/>`;
  }
  return s;
}
function moon(x, y, r, t, color = "#fff1cc") {
  return glow(x, y, r * 3.2, "#ffe9b0", .35) + `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>
    <circle cx="${x - r * .3}" cy="${y - r * .15}" r="${r * .18}" fill="#000" opacity=".06"/>
    <circle cx="${x + r * .25}" cy="${y + r * .3}" r="${r * .12}" fill="#000" opacity=".05"/>`;
}
function sun(x, y, r, t) {
  return glow(x, y, r * 3.5, "#ff9a3c", .55) + rays(x, y, t, "#ffcf6e", r * 3, 18, .18) +
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffb347"/><circle cx="${x}" cy="${y}" r="${r * .82}" fill="#ffd27a"/>`;
}
function rays(x, y, t, color = C.gold2, len = 900, n = 16, op = .14, speed = 4) {
  let s = `<g transform="translate(${x} ${y}) rotate(${(t * speed) % 360})" opacity="${op}">`;
  for (let i = 0; i < n; i++) {
    const a = i / n * 360;
    s += `<path d="M0 0 L${len} -${len * .06} L${len} ${len * .06}Z" fill="${color}" transform="rotate(${a})"/>`;
  }
  return s + "</g>";
}
function hills(y, color, t, amp = 60, seed = 3, drift = 0, rim = null) {
  const R = rnd(seed); const pts = []; const n = 9; const off = drift * t;
  for (let i = -1; i <= n + 1; i++) pts.push([i * W / n + (off % (W / n)), y - R() * amp - amp * .3]);
  let d = `M-200 ${H + 200} L-200 ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    d += ` Q${x1 + (x2 - x1) / 2} ${Math.min(y1, y2) - amp * .4} ${x2} ${y2}`;
  }
  d += ` L${W + 200} ${H + 200}Z`;
  return `<path d="${d}" fill="${color}" ${rim ? `stroke="${rim}" stroke-width="3" stroke-opacity=".55"` : ""}/>`;
}
function mountain(x, y, w, h, color, rim = C.gold) {
  return `<path d="M${x - w / 2} ${y} L${x - w * .12} ${y - h * .78} L${x} ${y - h} L${x + w * .1} ${y - h * .82} L${x + w / 2} ${y}Z"
    fill="${color}" stroke="${rim}" stroke-width="3" stroke-opacity=".5"/>
    <path d="M${x - w * .07} ${y - h * .9} L${x} ${y - h} L${x + w * .06} ${y - h * .9} L${x} ${y - h * .86}Z" fill="#fff" opacity=".85"/>`;
}
function cloud(x, y, s, t, color = "#2b2350", op = .85, rim = C.gold) {
  const dx = wob(t, .05, 30);
  return `<g transform="${tr(x + dx, y, s)}" opacity="${op}"><path d="M-160 40 Q-170 -10 -110 -15 Q-95 -70 -30 -60
    Q10 -105 70 -70 Q140 -80 150 -20 Q200 -5 180 40Z" fill="${color}" stroke="${rim}" stroke-width="3" stroke-opacity=".45"/></g>`;
}
function river(y, t, color = "#1e2a63", h = 260) {
  let s = `<rect x="-100" y="${y}" width="${W + 200}" height="${h}" fill="${color}"/>`;
  const R = rnd(11);
  for (let i = 0; i < 28; i++) {
    const yy = y + 10 + R() * (h - 20), x = ((R() * W + t * (20 + R() * 40)) % (W + 200)) - 100, w = 40 + R() * 120;
    s += `<rect x="${x.toFixed(0)}" y="${yy.toFixed(0)}" width="${w.toFixed(0)}" height="3" rx="2" fill="${C.gold2}" opacity="${(.15 + .35 * (0.5 + 0.5 * Math.sin(t * 3 + i))).toFixed(2)}"/>`;
  }
  return s;
}
function embers(t, n = 40, seed = 5, color = C.gold2, box = [0, 0, W, H], rise = 60, size = 4) {
  const R = rnd(seed); let s = "";
  const [bx, by, bw, bh] = box;
  for (let i = 0; i < n; i++) {
    const x0 = bx + R() * bw, ph = R(), sp = .6 + R() * .8, r = (.5 + R()) * size;
    const k = (ph + t * sp * rise / bh) % 1;
    const y = by + bh - k * bh, x = x0 + Math.sin(t * 1.5 + i) * 18;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}" opacity="${(Math.sin(k * Math.PI) * .9).toFixed(2)}"/>`;
  }
  return s;
}

/* ---------- objects ---------- */
function flame(x, y, s, t, ph = 0) {
  const f1 = 1 + wob(t, 3.1, .12, ph) + wob(t, 7.3, .06, ph), sw = wob(t, 2.3, 6, ph);
  return `<g transform="${tr(x, y, s)}">${glow(0, -30, 90, "#ffae3c", .45)}
    <path d="M0 0 C-26 -20 -18 ${-60 * f1} ${sw} ${-95 * f1} C18 ${-60 * f1} 26 -20 0 0Z" fill="#ff8a1e"/>
    <path d="M0 -4 C-13 -18 -9 ${-45 * f1} ${sw * .6} ${-66 * f1} C9 ${-45 * f1} 13 -18 0 -4Z" fill="#ffe08a"/></g>`;
}
function diya(x, y, s, t, ph = 0, lit = 1) {
  return `<g transform="${tr(x, y, s)}">${lit > 0 ? `<g opacity="${lit}">${flame(0, -16, .45, t, ph)}</g>` : ""}
    <path d="M-34 -14 Q0 26 34 -14 L22 -14 Q0 -4 -22 -14Z" fill="#a8461c" stroke="${C.gold}" stroke-width="2"/>
    <path d="M-34 -14 L-22 -14 M34 -14 L22 -14" stroke="${C.gold}" stroke-width="2"/></g>`;
}
function fireAltar(x, y, s, t) {
  return `<g transform="${tr(x, y, s)}">${flame(0, -40, 1.3, t)}${flame(-30, -36, .8, t, 1)}${flame(30, -36, .8, t, 2)}
    <path d="M-90 -40 L90 -40 L70 0 L-70 0Z" fill="${C.ink2}" stroke="${C.gold}" stroke-width="3"/></g>`;
}

/* A generic silhouette person. pose: stand | sit | bow | archer | raise | pray. Feet/base at (x,y). */
function person(x, y, s, t, o = {}) {
  const fill = o.fill || C.ink, rim = o.rim || C.gold, ph = o.ph || 0, pose = o.pose || "stand";
  const br = 1 + wob(t, .25, .012, ph);                         // breathing
  const sway = o.sway ?? wob(t, .18, 1.5, ph);
  const st = `fill="${fill}" stroke="${rim}" stroke-width="${(3 / s).toFixed(2)}" stroke-linejoin="round"`;
  const arm = (sx, sy, a1, a2, len = 95, w = 30) => {          // shoulder, angles (deg) upper/fore
    const r1 = a1 * Math.PI / 180, ex = sx + Math.sin(r1) * len, ey = sy + Math.cos(r1) * len;
    const r2 = (a1 + a2) * Math.PI / 180, hx = ex + Math.sin(r2) * len * .9, hy = ey + Math.cos(r2) * len * .9;
    return { d: `<path d="M${sx} ${sy} L${ex.toFixed(1)} ${ey.toFixed(1)} L${hx.toFixed(1)} ${hy.toFixed(1)}" fill="none"
      stroke="${rim}" stroke-width="${w + 6 / s}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${sx} ${sy} L${ex.toFixed(1)} ${ey.toFixed(1)} L${hx.toFixed(1)} ${hy.toFixed(1)}" fill="none"
      stroke="${fill}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`, hx, hy };
  };
  let legs, torsoY = -250, A, B;
  if (pose === "sit" || pose === "pray") {
    torsoY = -150;
    legs = `<path d="M-110 0 Q-120 -40 -60 -60 L60 -60 Q120 -40 110 0Z" ${st}/>`;
  } else if (pose === "bow") {
    legs = `<path d="M-40 0 L-30 -150 L30 -150 L50 0 L20 0 L5 -110 L-10 0Z" ${st}/>`;
  } else {
    const k = pose === "archer" ? 1 : 0;
    legs = `<path d="M${-55 - k * 40} 0 L-30 -160 L32 -160 L${55 + k * 50} 0 L${30 + k * 50} 0 L4 -110 L${-30 - k * 40} 0Z" ${st}/>`;
  }
  const lean = pose === "bow" ? 28 : 0;
  const ty = torsoY;
  // arms by pose
  const t2 = t + ph;
  if (pose === "raise") { A = arm(-42, ty - 70, 160 + wob(t2, .6, 12), 10); B = arm(42, ty - 70, -160 + wob(t2, .6, 12, 1), -10); }
  else if (pose === "pray" || pose === "bow") { A = arm(-42, ty - 70, 30, 110, 70); B = arm(42, ty - 70, -30, -110, 70); }
  else if (pose === "archer") {
    const pull = o.pull ?? 0, aim = o.aim ?? 0;                  // pull 0..1, aim degrees upward
    A = arm(-42, ty - 70, -95 - aim, 0, 100);                    // bow arm stretched toward the target
    B = arm(42, ty - 70, -95 - aim, lerp(-20, -150, pull), 80);  // drawing arm
  } else { A = arm(-42, ty - 70, 12 + wob(t2, .3, 4), 8); B = arm(42, ty - 70, -12 + wob(t2, .3, 4, 1), -8); }
  const torso = `<path d="M-60 ${ty - 75} Q0 ${ty - 96} 60 ${ty - 75} L42 ${ty + 10} L-42 ${ty + 10}Z" ${st}/>`;
  const dhoti = pose === "sit" || pose === "pray" ? "" : `<path d="M-40 ${ty + 5} L40 ${ty + 5} L58 ${ty + 95} L-58 ${ty + 95}Z" ${st}/>`;
  const head = `<circle cx="0" cy="${ty - 125}" r="40" ${st}/>`;
  const neck = `<rect x="-14" y="${ty - 98}" width="28" height="30" fill="${fill}"/>`;
  let top = "";
  if (o.crown) top += `<path d="M-34 ${ty - 150} L-26 ${ty - 200} L-12 ${ty - 172} L0 ${ty - 215} L12 ${ty - 172} L26 ${ty - 200} L34 ${ty - 150}Z" fill="${C.gold}"/>`;
  if (o.jata) top += `<ellipse cx="0" cy="${ty - 178}" rx="30" ry="34" ${st}/><path d="M-14 ${ty - 200} A22 22 0 0 0 20 ${ty - 192} A16 16 0 0 1 -14 ${ty - 200}Z" fill="${C.cream}"/>`;
  if (o.horns) top += `<path d="M-30 ${ty - 150} Q-70 ${ty - 190} -48 ${ty - 230} Q-50 ${ty - 185} -18 ${ty - 160}Z M30 ${ty - 150} Q70 ${ty - 190} 48 ${ty - 230} Q50 ${ty - 185} 18 ${ty - 160}Z" ${st}/>`;
  if (o.eyes) top += `<circle cx="-12" cy="${ty - 130}" r="5" fill="${o.eyes}"/><circle cx="12" cy="${ty - 130}" r="5" fill="${o.eyes}"/>`;
  if (o.snake) top += `<path d="M-34 ${ty - 80} Q0 ${ty - 40} 34 ${ty - 80}" fill="none" stroke="${C.gold}" stroke-width="7"/>`;
  const scarfK = wob(t2, .7, 1);
  const scarf = o.scarf ? `<path d="M40 ${ty - 70} Q${110 + scarfK * 30} ${ty - 40 + scarfK * 20} ${170 + scarfK * 40} ${ty + 10 + scarfK * 30}
    Q${120 + scarfK * 20} ${ty - 10} 36 ${ty - 40}Z" fill="${o.scarf}" opacity=".95"/>` : "";
  let item = "";
  if (o.trishul) item = `<g transform="translate(${B.hx} ${B.hy})"><rect x="-4" y="-260" width="8" height="330" fill="${C.gold}"/>
    <path d="M-40 -250 Q-40 -300 -20 -320 Q-28 -280 -8 -262 L0 -340 L8 -262 Q28 -280 20 -320 Q40 -300 40 -250Z" fill="${C.gold}"/></g>`;
  if (pose === "archer") {
    // bow drawn in a local frame pointing left (-x), then rotated by the aim angle around the bow hand
    const pull = o.pull ?? 0, aim = o.aim ?? 0, bx = A.hx, by = A.hy, bend = 70 + pull * 30;
    const dist = Math.hypot(B.hx - bx, B.hy - by), sx = bx + dist;
    item += `<g transform="rotate(${aim} ${bx} ${by})">
      <path d="M${bx} ${by - 190} Q${bx - bend} ${by} ${bx} ${by + 190}" fill="none" stroke="${C.gold}" stroke-width="10" stroke-linecap="round"/>
      <path d="M${bx} ${by - 190} L${sx.toFixed(1)} ${by} L${bx} ${by + 190}" fill="none" stroke="${C.cream}" stroke-width="2.5"/>
      ${o.arrow !== false ? `<path d="M${sx.toFixed(1)} ${by} L${bx - 160} ${by}" stroke="${C.cream}" stroke-width="5"/><path d="M${bx - 178} ${by} l24 -12 l0 24Z" fill="${C.gold2}"/>` : ""}</g>`;
  }
  const aura = o.aura ? glow(0, ty - 120, 260, o.aura, .55) + rays(0, ty - 120, t, o.aura, 330, 14, .12) : "";
  return `<g transform="translate(${x} ${y}) scale(${s}) rotate(${sway * .4 + lean} 0 ${ty})"><g transform="scale(1 ${br.toFixed(4)})">
    ${aura}${legs}${dhoti}${scarf}${A.d}${torso}${neck}${head}${top}${B.d}${item}</g></g>`;
}

/* floating fortress city: metal = gold | silver | iron */
function city(x, y, s, t, metal = "gold", ph = 0, burn = 0) {
  const col = { gold: C.gold, silver: C.silver, iron: C.iron }[metal];
  const bob = wob(t, .22, 14, ph);
  const win = (wx, wy) => `<rect x="${wx}" y="${wy}" width="10" height="16" rx="5" fill="#ffe7a1" opacity="${(.6 + .4 * Math.sin(t * 2 + wx)).toFixed(2)}"/>`;
  let w = "";
  for (let i = -3; i <= 3; i++) w += win(i * 34 - 5, -95) + win(i * 34 - 5, -55);
  return `<g transform="${tr(x, y + bob, s)}">${glow(0, -40, 260, col, .35)}
    <path d="M-170 0 L170 0 L60 150 L0 230 L-60 150Z" fill="${C.ink2}" stroke="${col}" stroke-width="4"/>
    <path d="M-150 0 L-150 -120 L150 -120 L150 0Z" fill="${C.ink}" stroke="${col}" stroke-width="4"/>
    ${[-150, -75, 0, 75, 150].map(cx => `<path d="M${cx - 22} -120 L${cx - 22} -170 Q${cx} -215 ${cx + 22} -170 L${cx + 22} -120Z" fill="${C.ink}" stroke="${col}" stroke-width="4"/>
      <path d="M${cx} -212 l0 -24" stroke="${col}" stroke-width="4"/>`).join("")}
    <path d="M-60 -120 L-60 -200 Q0 -280 60 -200 L60 -120Z" fill="${C.ink}" stroke="${col}" stroke-width="5"/>
    <circle cx="0" cy="-290" r="9" fill="${col}"/>${w}
    ${burn > 0 ? `<g opacity="${burn}">${flame(-90, -110, 1.6, t)}${flame(10, -190, 2.2, t, 1)}${flame(100, -120, 1.7, t, 2)}</g>` : ""}</g>`;
}
function chariot(x, y, s, t) {
  const spin = t * 120;
  const wheel = (cx, kind) => `<g transform="translate(${cx} 40) rotate(${spin})">${glow(0, 0, 120, kind === "sun" ? "#ffb347" : "#dfe7ff", .5)}
    <circle r="78" fill="none" stroke="${kind === "sun" ? C.gold : C.silver}" stroke-width="10"/>
    ${[0, 45, 90, 135].map(a => `<path d="M-78 0 L78 0" stroke="${kind === "sun" ? C.gold : C.silver}" stroke-width="6" transform="rotate(${a})"/>`).join("")}
    <circle r="18" fill="${kind === "sun" ? "#ffb347" : "#eef3ff"}"/></g>`;
  return `<g transform="${tr(x, y + wob(t, .5, 6), s)}">
    <path d="M-230 0 L220 0 L260 -60 L-250 -60Z" fill="${C.ink2}" stroke="${C.gold}" stroke-width="4"/>
    <path d="M-220 -60 L-210 -130 Q0 -160 210 -130 L220 -60Z" fill="${C.ink}" stroke="${C.gold}" stroke-width="4"/>
    <path d="M250 -60 Q330 -150 300 -260 Q360 -170 290 -60Z" fill="${C.ink}" stroke="${C.gold}" stroke-width="4"/>
    ${wheel(-150, "sun")}${wheel(150, "moon")}</g>`;
}
function ghats(y, t, lit = 1, seed = 9) {           // river-side steps with rows of diyas
  let s = "";
  for (let i = 0; i < 5; i++) s += `<rect x="-60" y="${y + i * 46}" width="${W + 120}" height="46" fill="${i % 2 ? "#2a1730" : "#331b38"}" stroke="${C.gold}" stroke-opacity=".25"/>`;
  const R = rnd(seed); let n = 0;
  for (let row = 0; row < 5; row++) for (let i = 0; i < 12; i++) {
    const appear = clamp(lit * 60 - n++);
    if (appear <= 0) continue;
    s += `<g opacity="${appear}">${diya(30 + i * 92 + (row % 2) * 46, y + row * 46 + 38, .42, t, R() * 6)}</g>`;
  }
  return s;
}
function temple(x, y, s, col = C.ink, rim = C.gold) {
  return `<g transform="${tr(x, y, s)}"><path d="M-120 0 L-120 -160 L120 -160 L120 0Z" fill="${col}" stroke="${rim}" stroke-width="4"/>
    <path d="M-90 -160 Q-80 -330 0 -420 Q80 -330 90 -160Z" fill="${col}" stroke="${rim}" stroke-width="4"/>
    <path d="M0 -420 l0 -50 l40 15 l-40 15" fill="${C.saffron}" stroke="${rim}" stroke-width="2"/>
    <path d="M-30 0 L-30 -80 Q0 -115 30 -80 L30 0Z" fill="#ffcf72" opacity=".8"/></g>`;
}
function scroll(x, y, s, open = 1) {
  const h = 420 * easeOut(open);
  return `<g transform="${tr(x, y, s)}">${glow(0, 0, 420, "#ffdf9a", .35)}
    <rect x="-260" y="${-h / 2}" width="520" height="${h}" fill="${C.cream}" stroke="${C.crimson}" stroke-width="6"/>
    <rect x="-280" y="${-h / 2 - 22}" width="560" height="34" rx="16" fill="${C.crimson}"/><rect x="-280" y="${h / 2 - 12}" width="560" height="34" rx="16" fill="${C.crimson}"/></g>`;
}
function flash(k) { return k > 0 ? `<rect x="-200" y="-200" width="${W + 400}" height="${H + 400}" fill="#fff6dc" opacity="${k.toFixed(3)}"/>` : ""; }

/* ---------- frame composer ---------- */
const XF = 0.3;
const SPEED = 1.4;   // animation speed multiplier (motion, not timing)
function cam(svg, t, d, i) {                 // gentle camera move per scene
  const k = d ? t / d : 0;
  const z = 1.04 + (i % 2 ? .08 * k : .08 * (1 - k)), dx = (i % 3 - 1) * 30 * (k - .5);
  return `<g transform="translate(${W / 2 + dx} ${H / 2}) scale(${z.toFixed(4)}) translate(${-W / 2} ${-H / 2})">${svg}</g>`;
}
function drawScene(i, T) {
  const sc = TIMELINE.scenes[i], lt = T - sc.start, d = sc.dur;
  _uid = i * 1000;
  return cam(SCENES[i](lt * SPEED, d * SPEED, clamp(lt / d)), lt, d, i);
}
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
function capHTML(c, lt) {
  const pop = easeBack(seg(lt, c.start, c.start + .18));
  const words = c.text.split(/\s+/).map(w => {
    const k = w.replace(/[^\p{L}\p{M}\p{N}]/gu, "");
    return `<span class="${c.hl.includes(k) ? "hl" : ""}">${esc(w)}</span>`;
  }).join(" ");
  return `<div class="cap" style="transform:scale(${(.8 + .2 * pop).toFixed(3)});opacity:${clamp(pop * 1.5).toFixed(2)}">${words}</div>`;
}
window.render = function (T) {
  const S = TIMELINE.scenes;
  let i = S.findIndex(s => T < s.start + s.dur); if (i < 0) i = S.length - 1;
  let svg = drawScene(i, T);
  const sc = S[i];
  // crossfade into the next scene during the last XF seconds
  if (i < S.length - 1 && T > sc.start + sc.dur - XF) {
    const a = seg(T, sc.start + sc.dur - XF, sc.start + sc.dur);
    svg += `<g opacity="${a.toFixed(3)}">${drawScene(i + 1, T)}</g>`;
  }
  document.getElementById("v").innerHTML = svg;
  // overlays
  const lt = T - sc.start; let ov = "";
  if (sc.type === "hook") ov += `<div class="hookbg"></div>` + capHTML({ ...sc.captions[0], text: sc.narration, start: 0 }, lt).replace('class="cap"', 'class="cap hook"');
  else if (sc.type === "cta") {
    const p = easeBack(seg(lt, .1, .6));
    ov += `<div class="cta" style="transform:translate(-50%,-50%) scale(${(.6 + .4 * p).toFixed(3)});opacity:${clamp(p * 2)}">
      <div class="ctat">${esc(TIMELINE.cta_text)}</div><div class="ctas">comment में लिखिए</div>
      <div class="fol" style="transform:scale(${(1 + .04 * Math.sin(lt * 6)).toFixed(3)})">Follow @${TIMELINE.handle}</div></div>`;
  } else {
    const c = sc.captions.find(c => lt >= c.start && lt < c.end);
    if (c) ov += capHTML(c, lt);
    if (sc.type === "source") {
      const p = easeOut(seg(lt, .15, .7));
      ov += `<div class="src" style="opacity:${p};transform:translate(-50%,0) scale(${(.85 + .15 * p).toFixed(3)})">
        <div class="srct">${esc(TIMELINE.source_title)}</div><div class="line"></div><div class="srcs">${esc(TIMELINE.source_sub || "")}</div></div>`;
    }
    if (sc.label) {
      const p = easeBack(seg(lt, .25, .6));
      ov += `<div class="lbl" style="opacity:${clamp(p)};transform:translate(-50%,${((1 - p) * 40).toFixed(0)}px)">${esc(sc.label)}</div>`;
    }
  }
  ov += `<div class="wm">@${TIMELINE.handle}</div>`;
  document.getElementById("ov").innerHTML = ov;
};
