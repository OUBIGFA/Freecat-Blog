import { chromium } from 'playwright';

const URL = 'http://127.0.0.1:4173/';
const widths = [2600, 2100, 1730, 1520, 1280];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const probe = async (w) => {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
  return await page.evaluate(() => {
    const sb = document.querySelector('.freecat-home-sidebar');
    const inn = document.querySelector('.freecat-home-posts-inner');
    const card = document.querySelector('#posts-list > *');
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        left: Math.round(b.left),
        right: Math.round(b.right),
        width: Math.round(b.width),
      };
    };
    return {
      vw: window.innerWidth,
      sidebar: r(sb),
      inner: r(inn),
      card: r(card),
    };
  });
};

console.log('viewport | sb.right | inner [left .. right] w | card w | right-gap');
console.log('---------+----------+------------------------+--------+----------');
for (const w of widths) {
  const d = await probe(w);
  const rightGap = d.vw - (d.inner?.right ?? 0);
  console.log(
    `${String(d.vw).padStart(8)} | ${String(d.sidebar?.right ?? '-').padStart(8)} | [${String(d.inner?.left ?? '-').padStart(4)} .. ${String(d.inner?.right ?? '-').padStart(4)}] w=${String(d.inner?.width ?? '-').padStart(4)} | ${String(d.card?.width ?? '-').padStart(6)} | ${String(rightGap).padStart(8)}`
  );
  await page.screenshot({ path: `all/verify-shift-${w}.png`, fullPage: false });
}

await browser.close();
