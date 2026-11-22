/* "Cinematic real" style: one realistic AI image per scene (img/imgNN.jpg) with a camera move,
 * parallax depth and atmosphere (embers, fog, dust, rain, light rays) chosen by the line's emotion. */
function fog(t, n = 6, seed = 3, col = "#ffffff", op = .10, y0 = 900) {
  const R = rnd(seed); let s = "";
  for (let i = 0; i < n; i++) {
    const x = ((R() * W + t * (14 + R() * 26)) % (W + 900)) - 450, y = y0 + R() * 900, rx = 380 + R() * 420, ry = 110 + R() * 120;
    s += glow(x, y, rx, col, op).replace("<circle", `<ellipse rx="${rx}" ry="${ry}"`).replace(/ r="[0-9.]+"/, "");
  }
  return s;
}
function rain(t, n = 90, seed = 5, op = .35) {
  const R = rnd(seed); let s = `<g opacity="${op}" stroke="#dfe9ff" stroke-width="2.5">`;
  for (let i = 0; i < n; i++) { const x = R() * (W + 300) - 150, y = ((R() * H + t * (1400 + R() * 600)) % (H + 200)) - 100;
    s += `<line x1="${x}" y1="${y}" x2="${x - 18}" y2="${y + 70}"/>`; }
  return s + "</g>";
}
function cinePlan(emo, i) {
  return {
    dramatic: { z: [1.0, 1.18], fx: "embers" }, angry: { z: [1.0, 1.2], fx: "embers" }, fear: { z: [1.06, 1.22], fx: "fog" },
    sad: { z: [1.16, 1.03], fx: "rain" }, devotional: { z: [1.02, 1.12], fx: "rays" }, wise: { z: [1.03, 1.1], fx: "rays" },
    curious: { z: [1.04, 1.16], fx: "fog" }, surprised: { z: [1.0, 1.15], fx: "dust" }, happy: { z: [1.03, 1.1], fx: "dust" },
    excited: { z: [1.0, 1.14], fx: "embers" },
  }[emo] || { z: [1.03 + (i % 2) * .08, 1.11 - (i % 2) * .08], fx: "dust" };
}
function cine(i) {
  return (t, d, k) => {
    const sc = TIMELINE.scenes[i] || {}, emo = sc.emotion || "calm", p = cinePlan(emo, i);
    const z = lerp(p.z[0], p.z[1], ease(k)), side = [-1, 1, 0, 1, -1][i % 5], dx = side * 70 * (k - .5);
    // square AI image -> cover 1080x1920 (scaled to height), panned horizontally
    const img = `<g transform="translate(${W / 2 + dx} ${H / 2}) scale(${z.toFixed(4)}) translate(${-H / 2} ${-H / 2})">
      <image href="img/img${String(i).padStart(2, "0")}.jpg" x="0" y="0" width="${H}" height="${H}" preserveAspectRatio="xMidYMid slice"/></g>`;
    let fx = "";
    if (p.fx === "embers") fx = embers(t, 70, 7 + i, "#ffb347", [0, 300, W, H], 140, 5) + glow(W / 2, H * .9, 900, "#ff5a1f", .25);
    if (p.fx === "fog") fx = fog(t, 7, 3 + i, "#e8eeff", .16);
    if (p.fx === "rain") fx = rain(t, 110, 5 + i) + fog(t, 4, 9, "#c9d4e6", .1);
    if (p.fx === "rays") fx = rays(W / 2, -120, t, "#fff2c8", 2200, 14, .12, 2) + embers(t, 30, 11 + i, "#fff2c8", [0, 0, W, H], 40, 3);
    if (p.fx === "dust") fx = embers(t, 45, 13 + i, "#fff6e0", [0, 0, W, H], 25, 2.5);
    const grade = { dramatic: "#ff5a1f", angry: "#ff2a1a", fear: "#2a3cff", sad: "#5a6a8a", devotional: "#ffcf6e", curious: "#6b3ac8" }[emo];
    const vig = `<defs><radialGradient id="cv${i}" cx="50%" cy="45%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient></defs>`;
    return img + fx + (grade ? `<rect width="${W}" height="${H}" fill="${grade}" opacity=".14" style="mix-blend-mode:soft-light"/>` : "") +
      vig + `<rect width="${W}" height="${H}" fill="url(#cv${i})"/>` +
      `<rect width="${W}" height="620" fill="url(#topfade)"/><defs><linearGradient id="topfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>`;
  };
}
