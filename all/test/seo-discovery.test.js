const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dayjs = require('dayjs');
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));
const { parseHTML, DOMParser } = require('linkedom');
const indexPage = require('../build/pages/index.js');
const { generateSitemap, generateRobotsTxt } = require('../build/pages/sitemap.js');

// Capture generated artifacts in memory; do not create temporary files in source directories.
function capture(t) {
    const files = new Map();
    t.mock.method(fs, 'writeFileSync', (file, data) => files.set(path.normalize(file), data));
    t.mock.method(fs, 'mkdirSync', () => {});
    return files;
}

const siteConfig = { site_url: 'https://example.com', site_title: 'Blog' };
const template = '<html><head><title>Blog</title><!-- HOME_SEO_HEAD --></head><body><!-- POSTS_LIST_PLACEHOLDER --><!-- PAGINATION_BUTTONS_PLACEHOLDER --></body></html>';
const posts = [1, 2, 3].map(id => ({ title: 'Article ' + id, link: '/posts/' + id + '/', excerpt: 'Summary', tags: [], date: dayjs('2026-01-01'), modifiedDate: dayjs('2026-01-02'), noindex: id === 3 }));

test('pagination is indexable and sitemap covers each page without exposing noindex articles', t => {
    const files = capture(t);
    const options = { posts, siteConfig, seoConfig: {}, outputDir: '/virtual', postsPerPage: 1, template };
    indexPage.generateAll(options);
    generateSitemap(options);
    const { document } = parseHTML(files.get(path.normalize('/virtual/page/2/index.html')));
    assert.doesNotMatch(document.querySelector('meta[name=robots]')?.content || '', /noindex/);
    assert.equal(document.querySelector('link[rel=canonical]').getAttribute('href'), 'https://example.com/page/2/');
    const sitemap = new DOMParser().parseFromString(files.get(path.normalize('/virtual/sitemap.xml')), 'text/xml');
    assert.deepEqual(Array.from(sitemap.querySelectorAll('loc'), node => node.textContent).sort(), [
        'https://example.com/', 'https://example.com/about', 'https://example.com/all',
        'https://example.com/page/2/', 'https://example.com/page/3/',
        'https://example.com/posts/1/', 'https://example.com/posts/2/'
    ].sort());
});

test('empty blogs still generate their homepage', t => {
    const files = capture(t);
    indexPage.generateAll({ posts: [], postsPerPage: 8, siteConfig, seoConfig: {}, template, outputDir: '/virtual' });
    assert.ok(files.has(path.normalize('/virtual/index.html')));
});

test('disabling AI crawlers leaves Google Search allowed and actually disallows AI agents', t => {
    const files = capture(t);
    generateRobotsTxt({ siteConfig, seoConfig: { allow_ai_crawlers: false }, outputDir: '/virtual' });
    const robots = files.get(path.normalize('/virtual/robots.txt'));
    assert.match(robots, /User-agent: \*\nAllow: \/\n/);
    assert.match(robots, /User-agent: GPTBot\nDisallow: \/\n/);
    assert.doesNotMatch(robots, /User-agent: Googlebot\nDisallow/);
});
