const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Shanghai');

const { createEngine } = require('../build/template-engine.js');
const indexPage = require('../build/pages/index.js');
const shellPage = require('../build/pages/shell.js');

function createTestEngine() {
    const siteConfig = {
        site_title: 'FreeCat Blog',
        site_name: 'FreeCat',
        site_url: 'https://example.com',
        site_favicon: '/image/freecat.png',
        hero_avatar: '/image/freecat.png'
    };
    const seoConfig = {
        site_language: 'zh-CN',
        site_description: 'A stable test blog'
    };

    return {
        siteConfig,
        seoConfig,
        engine: createEngine({
            templatesDir: path.join(__dirname, '..', 'src'),
            partialsDir: path.join(__dirname, '..', 'src', 'partials'),
            siteConfig,
            seoConfig,
            socialConfig: {},
            assetVersion: 'test-version',
            tagMenuItemsHtml: ''
        })
    };
}

function createPost() {
    return {
        title: 'Demo Post',
        preview: 'Demo preview',
        excerpt: 'Demo excerpt',
        date: dayjs.tz('2026-06-01T09:00:00+08:00'),
        modifiedDate: dayjs.tz('2026-06-02T09:00:00+08:00'),
        link: '/posts/demo-post/',
        tags: ['Demo'],
        cover: '',
        coverWidth: 0,
        coverHeight: 0,
        pinned: false
    };
}

test('generated home content and shell output keep separate roles', (t) => {
    const writes = new Map();
    t.mock.method(fs, 'writeFileSync', (filePath, html) => {
        writes.set(path.basename(filePath), html);
    });
    t.mock.method(console, 'log', () => {});

    const { engine, siteConfig, seoConfig } = createTestEngine();

    indexPage.generateAll({
        posts: [createPost()],
        template: engine.loadTemplate('template_index.html'),
        postsPerPage: 10,
        siteConfig,
        seoConfig,
        outputDir: 'dist',
        recentPostsSidebarHtml: ''
    });
    shellPage.generate({
        template: engine.loadTemplate('template_shell.html'),
        siteConfig,
        seoConfig,
        outputDir: 'dist'
    });

    const homeHtml = writes.get('home.html');
    const shellHtml = writes.get('index.html');

    assert.ok(homeHtml, 'home.html is generated as the real homepage content');
    assert.ok(shellHtml, 'index.html is generated as the persistent shell');

    assert.match(homeHtml, /<link rel="canonical" href="https:\/\/example\.com\/" \/>/);
    assert.match(homeHtml, /"@type":"WebSite"/);
    assert.match(homeHtml, /\/posts\/demo-post\//);
    assert.match(homeHtml, /Demo Post/);
    assert.doesNotMatch(homeHtml, /data-freecat-shell-root="true"/);

    assert.match(shellHtml, /data-freecat-shell-root="true"/);
    assert.match(shellHtml, /id="freecat-content-frame"/);
    assert.match(shellHtml, /src="\/home"/);
    assert.match(shellHtml, /"@type":"WebSite"/);
});
