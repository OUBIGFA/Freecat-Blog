const { test, expect } = require('@playwright/test');

function gate() {
    let release;
    const promise = new Promise(resolve => { release = resolve; });
    return { promise, release };
}

test.beforeEach(async ({ page }) => {
    // External services must not determine whether the local navigation tests pass.
    await page.route('https://**', route => route.abort());
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#posts-list a.post-card').first()).toBeVisible();
});

test('one cold click opens the article while a content image is still downloading', async ({ page }) => {
    const image = gate();
    let imageRequested = false;
    await page.route('**/__navigation-test-slow-image.png', async route => {
        imageRequested = true;
        await image.promise;
        await route.fulfill({ status: 204 });
    });
    await page.route('**/posts/**', async route => {
        if (route.request().resourceType() !== 'document') return route.continue();
        const response = await route.fetch();
        const html = (await response.text()).replace('</body>', '<img src="/__navigation-test-slow-image.png" alt="test image"></body>');
        await route.fulfill({ response, body: html });
    });
    const link = page.locator('#posts-list a.post-card').first();
    const href = await link.getAttribute('href');
    try {
        await link.click({ noWaitAfter: true });
        await expect.poll(() => imageRequested).toBe(true);
        await expect(page).toHaveURL(new URL(href, 'http://127.0.0.1:4173').href, { timeout: 3000 });
        const frame = page.frameLocator('#freecat-content-frame');
        await expect(frame.locator('article h1')).toBeVisible();
        expect(await frame.locator('html').evaluate(() => document.readyState)).not.toBe('complete');
        expect(await page.locator('#theme-toggle').evaluate(el => {
            const r = el.getBoundingClientRect();
            const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
            return el === hit || el.contains(hit);
        })).toBe(true);
        expect(await page.locator('meta[name=robots]').getAttribute('content')).not.toContain('noindex');
        expect(await page.locator('link[rel=canonical]').getAttribute('href')).toContain(href);
    } finally {
        image.release();
    }
});

test('repeated clicks on the pending first article keep a single document request', async ({ page }) => {
    const documentResponse = gate();
    let requests = 0;
    await page.route('**/posts/**', async route => {
        if (route.request().resourceType() !== 'document') return route.continue();
        requests++;
        await documentResponse.promise;
        await route.continue();
    });
    const link = page.locator('#posts-list a.post-card').first();
    const href = await link.getAttribute('href');
    try {
        await link.click({ noWaitAfter: true });
        await expect.poll(() => requests).toBe(1);
        await link.click({ noWaitAfter: true });
        await link.click({ noWaitAfter: true });
        expect(requests).toBe(1);
        documentResponse.release();
        await expect(page).toHaveURL(new URL(href, 'http://127.0.0.1:4173').href);
        await expect(page.frameLocator('#freecat-content-frame').locator('article h1')).toBeVisible();
    } finally {
        documentResponse.release();
    }
});

test('the first navigation preserves playback and removes the hidden duplicate audio source', async ({ page }) => {
    // A local silent WAV keeps this a real media playback check without external music services.
    const rate = 8000;
    const wav = Buffer.alloc(44 + rate * 30 * 2);
    wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4);
    wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28);
    wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
    wav.write('data', 36); wav.writeUInt32LE(wav.length - 44, 40);
    await page.route('**/__navigation-test-audio.wav', route => route.fulfill({ contentType: 'audio/wav', body: wav }));
    await page.locator('#nav-audio').evaluate(audio => {
        audio.src = '/__navigation-test-audio.wav';
        audio.loop = true;
        audio.load();
    });
    await expect.poll(() => page.locator('#nav-audio').evaluate(audio => audio.readyState)).toBeGreaterThanOrEqual(2);
    await page.locator('#nav-audio-toggle').click();
    await expect.poll(() => page.locator('#nav-audio').evaluate(audio => audio.currentTime)).toBeGreaterThan(0);
    const before = await page.evaluate(() => {
        window.testPlayer = document.getElementById('nav-audio');
        window.testPlayerEvents = [];
        for (const event of ['pause', 'emptied', 'abort']) window.testPlayer.addEventListener(event, () => window.testPlayerEvents.push(event));
        return window.testPlayer.currentTime;
    });
    const link = page.locator('#posts-list a.post-card').first();
    const href = await link.getAttribute('href');
    await link.click({ noWaitAfter: true });
    await expect(page).toHaveURL(new URL(href, 'http://127.0.0.1:4173').href);
    await expect.poll(() => page.locator('#nav-audio').evaluate(audio => audio.currentTime)).toBeGreaterThan(before);
    expect(await page.evaluate(() => ({
        samePlayer: window.testPlayer === document.getElementById('nav-audio'),
        playing: !window.testPlayer.paused,
        events: window.testPlayerEvents
    }))).toEqual({ samePlayer: true, playing: true, events: [] });
    await expect(page.frameLocator('#freecat-content-frame').locator('#nav-audio')).not.toHaveAttribute('src');
});
