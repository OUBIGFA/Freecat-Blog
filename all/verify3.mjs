import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:8767/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const measure = async (label) => {
  const data = await page.evaluate(() => {
    const r = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { top: Math.round(b.top), bottom: Math.round(b.bottom), height: Math.round(b.height), inlineBottom: el.style.bottom };
    };
    const firstCard = document.querySelector('#posts-list > *');
    const b = firstCard?.getBoundingClientRect();
    return {
      scrollY: window.scrollY,
      header: r('header'),
      sidebar: r('.freecat-home-sidebar'),
      avatar: r('#hero-avatar'),
      sidebarBottom: r('.freecat-home-sidebar-bottom'),
      recent: r('.freecat-home-sidebar-recent'),
      firstPost: b ? { top: Math.round(b.top) } : null,
      footer: r('footer'),
      vh: window.innerHeight,
    };
  });
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(data, null, 2));
};

await measure('initial');
await page.screenshot({ path: 'all/verify-v3-top.png', fullPage: false });

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(300);
await measure('at bottom');
await page.screenshot({ path: 'all/verify-v3-bottom.png', fullPage: false });

await browser.close();
