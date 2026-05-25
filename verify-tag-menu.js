const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const results = [];

    for (const { label, w, h } of [
        { label: '大视口 1280x900', w: 1280, h: 900 },
        { label: '小视口 1280x500', w: 1280, h: 500 },
    ]) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h } });
        const page = await ctx.newPage();
        await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
        await page.click('#tag-menu-toggle');
        await page.waitForSelector('#tag-menu.is-open', { timeout: 5000 });
        await page.waitForTimeout(450);

        const data = await page.evaluate(() => {
            const items = document.querySelector('[data-tag-menu-items]');
            const panel = document.getElementById('tag-menu');
            const links = items.querySelectorAll('a.tag-menu-item');
            return {
                visibleCount: links.length,
                itemsClientHeight: items.clientHeight,
                itemsScrollHeight: items.scrollHeight,
                hasInnerScroll: items.scrollHeight > items.clientHeight + 1,
                panelHeight: panel.getBoundingClientRect().height,
                viewportHeight: window.innerHeight,
                panelBottom: panel.getBoundingClientRect().bottom,
            };
        });
        results.push({ label, ...data });
        await page.screenshot({ path: `tag-menu-${w}x${h}.png` });
        await ctx.close();
    }

    await browser.close();
    console.log(JSON.stringify(results, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
