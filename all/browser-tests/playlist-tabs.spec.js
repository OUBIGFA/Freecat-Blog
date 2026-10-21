const { test, expect } = require('@playwright/test');
const path = require('node:path');
const dayjs = require('dayjs');
const { createEngine } = require('../build/template-engine.js');
const { renderPostPage } = require('../build/pages/post.js');
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

// Generate both panels through the production renderer, not mutable article update history.
const readingUrl = '/posts/2000010100000001/';
const siteConfig = { site_name: 'FreeCat', site_url: 'https://example.com' };
const engine = createEngine({
    templatesDir: path.join(__dirname, '../src'), partialsDir: path.join(__dirname, '../src/partials'),
    siteConfig, seoConfig: {}, socialConfig: {}
});
const readingPage = renderPostPage({
    post: { title: '阅读导航', postId: '2000010100000001', link: readingUrl,
        date: dayjs('2026-01-01'), modifiedDate: dayjs('2026-01-02'), tags: [],
        content: Array.from({ length: 24 }, (_, i) => `## 章节 ${i + 1}\n\n阅读内容 ${i + 1}`).join('\n\n'),
        latestUpdate: { items: Array.from({ length: 30 }, (_, i) => ({ text: `更新内容 ${i + 1}` })) }
    },
    template: engine.loadTemplate('template_post.html'), siteConfig, seoConfig: {}
});

// Real browser playback with a local response, independent of external music host availability.
const rate = 8000;
const wav = Buffer.alloc(44 + rate * 60 * 2);
wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4);
wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28);
wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(wav.length - 44, 40);

test.beforeEach(async ({ page }) => {
    await page.route(/^https:\/\//, route => {
        if (route.request().resourceType() !== 'media') return route.abort();
        // Chromium needs byte-range support to seek this WAV; a plain 200 body reports seekable [0, 0].
        const range = /^bytes=(\d+)-(\d*)$/.exec(route.request().headers().range || '');
        const start = range ? Number(range[1]) : 0;
        const end = range && range[2] ? Math.min(Number(range[2]), wav.length - 1) : wav.length - 1;
        return route.fulfill({
            status: range ? 206 : 200, contentType: 'audio/wav', body: wav.subarray(start, end + 1),
            headers: { 'accept-ranges': 'bytes', ...(range ? { 'content-range': `bytes ${start}-${end}/${wav.length}` } : {}) }
        });
    });
    await page.goto('/all');
});

test('song selection midway through an article preserves reading state and cross-page playback', async ({ page }) => {
    const href = await page.locator('#posts-list a.post-card').first().getAttribute('href');
    await page.goto(href);
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.wheel(0, 1000);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(500);
    const before = await page.evaluate(() => {
        window.testArticle = document.querySelector('article');
        window.testPlayer = document.getElementById('nav-audio');
        return scrollY;
    });
    const toggle = page.locator('#nav-audio-playlist-toggle');
    const panel = page.locator('#nav-audio-playlist');
    const tracks = panel.locator('[data-audio-track-index]');
    await toggle.click();
    await expect(panel).toBeVisible();
    expect(await page.locator('#nav-audio').evaluate(audio => audio.paused)).toBe(true);
    await tracks.nth(1).click();
    await expect(page.locator('#nav-audio')).toHaveAttribute('data-audio-index', '1');
    await expect.poll(() => page.locator('#nav-audio').evaluate(audio => audio.currentTime)).toBeGreaterThan(0);
    expect(await page.evaluate(() => ({
        sameArticle: window.testArticle === document.querySelector('article'),
        samePlayer: window.testPlayer === document.getElementById('nav-audio'),
        scroll: scrollY
    }))).toEqual({ sameArticle: true, samePlayer: true, scroll: before });
    await panel.getByRole('button', { name: '随机播放', exact: true }).click();
    await expect(page.locator('#nav-audio-shuffle')).toHaveAttribute('aria-pressed', 'true');
    const lastIndex = String(await tracks.count() - 1);
    await tracks.last().click();
    await expect(page.locator('#nav-audio')).toHaveAttribute('data-audio-index', lastIndex);
    await expect(tracks.last()).toHaveAttribute('aria-current', 'true');
    await expect(panel.locator('[aria-current="true"]')).toHaveCount(1);
    await expect.poll(() => page.locator('#nav-audio').evaluate(audio => audio.currentTime)).toBeGreaterThan(0);
    await page.locator('#nav-audio-toggle').click();
    await expect(tracks.last().locator('.nav-audio-track-status')).toHaveText('已暂停');
    const pausedAt = await page.locator('#nav-audio').evaluate(audio => audio.currentTime);
    await tracks.last().click();
    await expect.poll(() => page.locator('#nav-audio').evaluate(audio => audio.currentTime)).toBeGreaterThan(pausedAt);
    expect(await page.evaluate(() => scrollY)).toBe(before);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();

    const time = await page.evaluate(() => {
        window.testPlayerEvents = [];
        for (const name of ['pause', 'emptied', 'abort']) {
            window.testPlayer.addEventListener(name, () => window.testPlayerEvents.push(name));
        }
        return window.testPlayer.currentTime;
    });
    await page.locator('#nav-links a[href="/all"]').click();
    const frame = page.frameLocator('#freecat-content-frame');
    await expect(frame.locator('#sort-modified')).toBeVisible();
    await expect.poll(() => page.locator('#nav-audio').evaluate(audio => audio.currentTime)).toBeGreaterThan(time);
    expect(await page.evaluate(() => ({
        samePlayer: window.testPlayer === document.getElementById('nav-audio'),
        index: window.testPlayer.dataset.audioIndex,
        events: window.testPlayerEvents
    }))).toEqual({ samePlayer: true, index: lastIndex, events: [] });
    await toggle.click();
    await expect(page.locator('#nav-audio-shuffle')).toHaveAttribute('aria-pressed', 'true');
    await expect(tracks.last()).toHaveAttribute('aria-current', 'true');
    // Pick an exposed area of the frame; on mobile the list intentionally covers the sort toolbar.
    await page.mouse.click(4, page.viewportSize().height - 100);
    await expect(panel).toBeHidden();
    await frame.locator('#sort-modified').click();
    await expect(frame.locator('#sort-modified')).toHaveAttribute('aria-selected', 'true');
});

test('shuffle continues after ending, turns off without interruption and restores with the session', async ({ page }) => {
    const audio = page.locator('#nav-audio');
    const panel = page.locator('#nav-audio-playlist');
    const shuffle = panel.getByRole('button', { name: '随机播放', exact: true });
    const count = await panel.locator('[data-audio-track-index]').count();
    await page.locator('#nav-audio-playlist-toggle').click();
    await expect(shuffle).toHaveAttribute('aria-pressed', 'false');
    const initialIndex = await audio.getAttribute('data-audio-index');
    await shuffle.click();
    await expect(shuffle).toHaveAttribute('aria-pressed', 'true');
    await expect(audio).not.toHaveAttribute('data-audio-index', initialIndex);
    await expect.poll(() => audio.evaluate(el => el.currentTime)).toBeGreaterThan(0);
    const firstRandomIndex = await audio.getAttribute('data-audio-index');
    // Seek the real local WAV to its end so the browser, not the test, emits ended.
    await expect.poll(() => audio.evaluate(el => el.seekable.length ? el.seekable.end(0) : 0)).toBeGreaterThan(59);
    await audio.evaluate(el => { el.currentTime = el.duration - 0.05; });
    await expect(audio).not.toHaveAttribute('data-audio-index', firstRandomIndex);
    await expect.poll(() => audio.evaluate(el => el.currentTime)).toBeGreaterThan(0);
    const randomIndex = await audio.getAttribute('data-audio-index');
    const beforeOff = await audio.evaluate(el => {
        window.shuffleEvents = [];
        for (const name of ['play', 'pause', 'emptied']) el.addEventListener(name, () => window.shuffleEvents.push(name));
        return el.currentTime;
    });
    await shuffle.click();
    await expect(shuffle).toHaveAttribute('aria-pressed', 'false');
    await expect(audio).toHaveAttribute('data-audio-index', randomIndex);
    expect(await audio.evaluate(el => el.currentTime)).toBeGreaterThanOrEqual(beforeOff);
    expect(await audio.evaluate(el => el.paused)).toBe(false);
    expect(await page.evaluate(() => window.shuffleEvents)).toEqual([]);
    await audio.evaluate(el => { el.currentTime = el.duration - 0.05; });
    await expect(audio).toHaveAttribute('data-audio-index', String((Number(randomIndex) + 1) % count));
    await expect.poll(() => audio.evaluate(el => el.currentTime)).toBeGreaterThan(0);

    await shuffle.click();
    await expect.poll(() => audio.evaluate(el => el.currentTime)).toBeGreaterThan(0);
    await page.locator('#nav-audio-toggle').click();
    const savedIndex = await audio.getAttribute('data-audio-index');
    await page.reload();
    await expect(audio).toHaveAttribute('data-audio-index', savedIndex);
    expect(await audio.evaluate(el => el.paused)).toBe(true);
    await page.locator('#nav-audio-playlist-toggle').click();
    await expect(shuffle).toHaveAttribute('aria-pressed', 'true');
    expect(await shuffle.evaluate(el => getComputedStyle(el).fontFamily)).toBe(
        await panel.locator('.nav-audio-track').first().evaluate(el => getComputedStyle(el).fontFamily));
});

test('the disclosure works with the keyboard and stays within narrow headers and viewports', async ({ page }) => {
    const toggle = page.locator('#nav-audio-playlist-toggle');
    const panel = page.locator('#nav-audio-playlist');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toBeVisible();
    await page.keyboard.press('Tab');
    const shuffle = panel.getByRole('button', { name: '随机播放', exact: true });
    await expect(shuffle).toBeFocused();
    await page.keyboard.press('Space');
    await expect(shuffle).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Tab');
    await expect(panel.locator('[data-audio-track-index]').first()).toBeFocused();
    await page.keyboard.press('Enter');
    await expect.poll(() => page.locator('#nav-audio').evaluate(audio => audio.currentTime)).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await expect(panel).toBeHidden();
    for (const width of [320, 360, 390, 767, 768, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        await toggle.click();
        const bounds = await panel.boundingBox();
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
        expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
        expect(await panel.evaluate(el => el.scrollWidth <= el.clientWidth), `song panel at ${width}px`).toBe(true);
        const headerFits = await page.locator('header').evaluate(header => {
            const brand = header.querySelector('.freecat-header-brand').getBoundingClientRect();
            const nav = header.querySelector('#nav-links').getBoundingClientRect();
            const tools = header.querySelector('.freecat-header-tools').getBoundingClientRect();
            return brand.right <= nav.left && nav.right <= tools.left && tools.right <= innerWidth;
        });
        expect(headerFits, `header at ${width}px`).toBe(true);
        await page.keyboard.press('Escape');
    }
});

async function setDarkTheme(page, dark) {
    if (await page.locator('html').evaluate(el => el.classList.contains('dark')) !== dark) {
        await page.locator('#theme-toggle').click();
    }
    await expect.poll(() => page.locator('html').evaluate(el => el.classList.contains('dark'))).toBe(dark);
    await expect(page.locator('html')).not.toHaveClass(/theme-transitioning/);
}

test('the playlist icon stays neutral on hover and while expanded in both themes', async ({ page }) => {
    const toggle = page.locator('#nav-audio-playlist-toggle');
    const appearance = () => toggle.evaluate(el => {
        const style = getComputedStyle(el);
        return { color: style.color, background: style.backgroundColor, transform: style.transform, transition: style.transitionDuration };
    });
    for (const dark of [false, true]) {
        await setDarkTheme(page, dark);
        await page.mouse.move(0, page.viewportSize().height - 1);
        const idle = await appearance();
        expect(idle.background).toBe('rgba(0, 0, 0, 0)');
        expect(idle.transition).toBe('0s');
        await toggle.hover();
        expect(await appearance()).toEqual(idle);
        await toggle.click();
        expect(await appearance()).toEqual(idle);
        await page.keyboard.press('Escape');
        await expect(toggle).toBeFocused();
        expect(await toggle.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
    }
});

test('only the last grid row loses its bottom separators, including incomplete rows and re-sorting', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.evaluate(() => document.fonts.ready);
    for (const width of [390, 759, 760, 1119, 1120, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const columns = width < 760 ? 1 : width < 1120 ? 2 : 3;
        const boundaries = await page.locator('#posts-list').evaluate((list, columns) => {
            const cards = Array.from(list.children);
            const cases = [];
            // Reuse the real rendered cards to cover every full/partial row remainder.
            for (let count = 1; count <= Math.min(cards.length, 9); count++) {
                list.replaceChildren(...cards.slice(0, count));
                const finalRowStart = Math.floor((count - 1) / columns) * columns;
                cases.push(Array.from(list.children).every((card, index) =>
                    getComputedStyle(card).borderBottomWidth === (index >= finalRowStart ? '0px' : '1px')));
            }
            list.replaceChildren(...cards);
            return { columns: getComputedStyle(list).gridTemplateColumns.split(' ').length, cases };
        }, columns);
        expect(boundaries.columns).toBe(columns);
        expect(boundaries.cases, `row endings at ${width}px`).not.toContain(false);
        for (const sort of ['#sort-modified', '#sort-date']) {
            await page.locator(sort).click();
            const borders = await page.locator('#posts-list').evaluate((list, columns) => {
                const cards = Array.from(list.children);
                const finalRowStart = Math.floor((cards.length - 1) / columns) * columns;
                return cards.every((card, index) =>
                    getComputedStyle(card).borderBottomWidth === (index >= finalRowStart ? '0px' : '1px'));
            }, columns);
            expect(borders, `${sort} at ${width}px`).toBe(true);
        }
    }
});

async function tabSkin(list) {
    return list.evaluate(el => {
        const shell = getComputedStyle(el);
        const tab = getComputedStyle(el.querySelector('[role="tab"]'));
        const selected = getComputedStyle(el, '::before');
        return {
            background: shell.backgroundColor, padding: shell.padding, radius: shell.borderRadius,
            tabPadding: tab.padding, tabHeight: tab.minHeight, font: tab.font,
            indicatorTop: selected.top, indicatorBottom: selected.bottom,
            indicatorBorder: selected.border, indicatorBackground: selected.backgroundColor
        };
    });
}

test('reading and sorting tabs share one compact theme-aware skin and stable panel sizing', async ({ page }) => {
    await page.route(`**${readingUrl}`, route => route.fulfill({ contentType: 'text/html', body: readingPage }));
    for (const dark of [false, true]) {
        await page.goto('/all');
        await setDarkTheme(page, dark);
        const allSkin = await tabSkin(page.locator('.freecat-tabs'));
        expect(allSkin.padding).toBe('2px');
        expect(allSkin.indicatorTop).toBe('2px');
        await page.locator('#sort-modified').click();
        await expect(page.locator('#sort-modified')).toHaveAttribute('aria-selected', 'true');
        await page.goto(readingUrl);
        await setDarkTheme(page, dark);
        const reading = page.locator('.freecat-post-reading-panel');
        expect(await tabSkin(reading.locator('.freecat-tabs'))).toEqual(allSkin);
        if (page.viewportSize().width >= 1280) {
            const before = await reading.boundingBox();
            await reading.locator('#reading-updates').click();
            await expect(reading.locator('#reading-updates-panel')).toBeVisible();
            const after = await reading.boundingBox();
            expect(after.width).toBeCloseTo(before.width, 1);
            expect(after.height).toBeCloseTo(before.height, 1);
            const overflow = await reading.locator('.freecat-post-latest-update-body').evaluate(el => getComputedStyle(el).overflowY);
            expect(overflow).toBe('auto');
        } else {
            await expect(reading.locator('.freecat-tabs')).toBeHidden();
        }
    }
});
