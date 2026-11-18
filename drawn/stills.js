// Quick look: render the middle frame of every scene into a contact sheet folder. usage: node stills.js <reelDir> <outDir>
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const [reel, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  for (const f of ['timeline.js', 'scenes.js']) fs.copyFileSync(path.join(reel, f), path.join(__dirname, f));
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + path.join(__dirname, 'index.html')); await p.evaluate(() => document.fonts.ready);
  const tl = await p.evaluate(() => TIMELINE);
  for (const [i, s] of tl.scenes.entries()) for (const f of [.3, .8]) {
    await p.evaluate(t => render(t), s.start + s.dur * f);
    await p.screenshot({ path: path.join(out, `s${String(i).padStart(2, '0')}_${f}.jpg`), type: 'jpeg', quality: 80 });
  }
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
