const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { mock } = require('node:test');
const dayjs = require('dayjs');
const { createEngine } = require('../build/template-engine.js');
const indexPage = require('../build/pages/index.js');
const aboutPage = require('../build/pages/about.js');
const { renderPostPage } = require('../build/pages/post.js');
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

// Render alternate settings through production generators, capturing writes in memory.
// Do not modify the user's Control files or place fixture pages in dist.
function configuredPages() {
    const siteConfig = { site_title: 'Configured Blog', site_name: 'FreeCat', site_url: 'https://example.com',
        hero_title: 'Blog', hero_subtitle: 'Article list', home_page: 'about', theme_dark: true, show_share_button: false };
    const engine = createEngine({ templatesDir: path.join(__dirname, '../src'),
        partialsDir: path.join(__dirname, '../src/partials'), siteConfig, seoConfig: {}, socialConfig: {} });
    const posts = [1, 2].map(id => ({ title: `Article ${id}`, link: `/posts/option-${id}/`,
        content: 'Article body', excerpt: 'Article summary', tags: [], date: dayjs('2026-01-01'), modifiedDate: dayjs('2026-01-02') }));
    const common = { siteConfig, seoConfig: {}, posts, postsPerPage: 1, outputDir: '/virtual',
        aboutConfig: { about_hero_title: 'About me', about_hero_subtitle: 'Personal introduction' } };
    const pages = new Map();
    const writer = mock.method(fs, 'writeFileSync', (file, html) => {
        const name = path.relative('/virtual', file).replaceAll('\\', '/');
        pages.set('/' + name.replace(/index\.html$/, '').replace(/\.html$/, ''), html);
    });
    const mkdir = mock.method(fs, 'mkdirSync', () => {});
    try {
        indexPage.generateAll({ ...common, template: engine.loadTemplate('template_index.html') });
        aboutPage.generate({ ...common, template: engine.loadTemplate('template_index_About.html') });
    } finally {
        writer.mock.restore();
        mkdir.mock.restore();
    }
    for (const post of posts) {
        pages.set(post.link, renderPostPage({ ...common, post, template: engine.loadTemplate('template_post.html') }));
    }
    return pages;
}


function gate() {
    let release;
    const promise = new Promise(resolve => { release = resolve; });
    return { promise, release };
}

test.beforeEach(async ({ page }) => {
    // External services must not determine whether the local navigation tests pass.
    await page.route(/^https:\/\//, route => route.abort());
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

test('About homepage preserves list pagination, theme and share settings through persistent navigation', async ({ page }, testInfo) => {
    const pages = configuredPages();
    await page.route('http://127.0.0.1:4173/**', route => {
        const html = pages.get(new URL(route.request().url()).pathname);
        return html ? route.fulfill({ contentType: 'text/html; charset=utf-8', body: html }) : route.continue();
    });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('.freecat-about-title')).toHaveText('About me');
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('#posts-list')).toHaveCount(0);
    await page.locator('#nav-links a[href="/blog"]').click();
    const frame = page.frameLocator('#freecat-content-frame');
    await expect(frame.locator('#posts-list .post-card')).toHaveCount(1);
    await expect(frame.locator('html')).toHaveClass(/dark/);
    await expect(page).toHaveURL(/\/blog$/);
    await frame.locator('a[aria-label="Next page"]').click();
    await expect(page).toHaveURL(/\/page\/2\/$/);
    await expect(frame.locator('#posts-list')).toContainText('Article 2');
    if (testInfo.project.name === 'desktop') {
        await frame.locator('input[aria-label="Jump to page"]').fill('1');
        await frame.locator('input[aria-label="Jump to page"]').press('Enter');
    } else {
        await frame.locator('a[aria-label="Prev page"]').click();
    }
    await expect(page).toHaveURL(/\/blog$/);
    await expect(frame.locator('#posts-list')).toContainText('Article 1');
    await frame.locator('#posts-list .post-card').click();
    await expect(frame.locator('article h1')).toHaveText('Article 1');
    await expect(frame.locator('#share-btn')).toHaveCount(0);
    await expect(frame.locator('.freecat-post-end [data-go-back]')).toBeVisible();
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
    await expect(frame.locator('html')).not.toHaveClass(/\bdark\b/);
    await page.locator('.freecat-header-brand').click();
    await expect(page).toHaveURL('http://127.0.0.1:4173/');
    await expect(frame.locator('.freecat-about-title')).toHaveText('About me');
    await page.reload();
    await expect(page.locator('.freecat-about-title')).toHaveText('About me');
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/);
});
