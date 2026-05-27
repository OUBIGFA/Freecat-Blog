import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();

const widths = [1920, 1440, 1280, 1100, 1024];

console.log('=== After fix ===');
for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('http://localhost:8765/page/2/', { waitUntil: 'networkidle' });

    const data = await page.evaluate(() => {
        const nav = document.querySelector('#pagination-buttons nav');
        const container = document.querySelector('#pagination-buttons');
        const sidebar = document.querySelector('.freecat-home-sidebar');
        const cards = document.querySelectorAll('#posts-list a');
        const firstCard = cards[0];
        const r = (el) => el ? { l: el.getBoundingClientRect().left, r: el.getBoundingClientRect().right, w: el.getBoundingClientRect().width } : null;
        return {
            vw: innerWidth,
            sidebar: r(sidebar),
            container: r(container),
            firstCard: r(firstCard),
            nav: r(nav),
        };
    });

    const navCenter = data.nav ? (data.nav.l + data.nav.r) / 2 : null;
    const cardCenter = data.firstCard ? (data.firstCard.l + data.firstCard.r) / 2 : null;
    const vpCenter = data.vw / 2;
    console.log(`W=${w}: vp center=${vpCenter}, nav center=${navCenter?.toFixed(1)}, card center=${cardCenter?.toFixed(1)}`);
    console.log(`  nav: [${data.nav?.l.toFixed(1)}, ${data.nav?.r.toFixed(1)}] | sidebar right=${data.sidebar?.r.toFixed(1)}`);
    console.log(`  diff nav-vp=${navCenter ? (navCenter - vpCenter).toFixed(1) : 'N/A'}, overlap with sidebar = ${data.nav && data.sidebar ? Math.max(0, data.sidebar.r - data.nav.l).toFixed(1) : 'N/A'}`);

    await page.screenshot({ path: path.join(__dirname, `pgn-fix-${w}.png`), fullPage: true });
    await ctx.close();
}

await browser.close();
console.log('Screenshots saved');
