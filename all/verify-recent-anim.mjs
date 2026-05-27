import { chromium } from 'playwright';

const url = 'http://127.0.0.1:8767/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(url, { waitUntil: 'domcontentloaded' });

const sample = async (t) => {
  await page.waitForTimeout(t);
  const data = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('.freecat-home-sidebar-recent h3, .freecat-home-sidebar-recent li'));
    return items.map((el) => ({
      tag: el.tagName,
      text: (el.textContent || '').trim().slice(0, 24),
      opacity: Number(getComputedStyle(el).opacity).toFixed(2),
      delay: el.style.animationDelay || '(none)',
    }));
  });
  console.log(`\n--- t=${t}ms ---`);
  for (const r of data) console.log(`${r.tag.padEnd(3)} delay=${r.delay.padEnd(7)} opacity=${r.opacity}  ${r.text}`);
};

await sample(0);
await sample(500);
await sample(800);
await sample(1100);
await sample(1500);

await browser.close();
