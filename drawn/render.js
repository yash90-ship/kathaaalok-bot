// Render frames of drawn/index.html (with a reel's timeline.js + scenes.js) and pipe them into ffmpeg.
// usage: node render.js <reelDir> <out.mp4> [fps]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
(async () => {
  const [reel, out, fpsArg] = process.argv.slice(2);
  const fps = +(fpsArg || 30);
  const here = __dirname;
  for (const f of ['timeline.js', 'scenes.js']) fs.copyFileSync(path.join(reel, f), path.join(here, f));
  const tl = JSON.parse(fs.readFileSync(path.join(reel, 'timeline.json'), 'utf8'));
  const total = tl.total, n = Math.ceil(total * fps);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(String(e)));
  await page.goto('file://' + path.join(here, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const stage = await page.$('#stage');
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.render(t), i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (fps * 5) === 0) process.stdout.write(`frame ${i}/${n}\n`);
    if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
})();
