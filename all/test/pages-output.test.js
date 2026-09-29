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
const searchPage = require('../build/pages/search.js');
const allPage = require('../build/pages/all.js');

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
        content: 'Demo body content for full text search.',
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

test('all articles retain title text, dates, tags and covers in the reading layout', (t) => {
    const writes = new Map();
    t.mock.method(fs, 'writeFileSync', (filePath, html) => writes.set(path.basename(filePath), html));
    t.mock.method(console, 'log', () => {});
    const { engine, siteConfig, seoConfig } = createTestEngine();
    allPage.generate({
        posts: [
            { ...createPost(), title: '完整标题 <阅读> & 设计', pinned: true, cover: '/cover.jpg', coverWidth: 1200, coverHeight: 800 },
            { ...createPost(), title: '没有封面的文章', link: '/posts/no-cover/', tags: ['<标签>'] }
        ],
        template: engine.loadTemplate('template_index_all.html'),
        siteConfig, seoConfig, outputDir: 'dist'
    });
    const html = writes.get('all.html');
    const entries = html.match(/<a\b[^>]*class="post-card [\s\S]*?<\/a>/g) || [];
    assert.equal(entries.length, 2);
    assert.match(entries[0], /<h3[^>]*>完整标题 &lt;阅读&gt; &amp; 设计<\/h3>/);
    assert.match(entries[0], /<time datetime="2026-06-01">2026-06-01<\/time>/);
    assert.match(entries[0], /更新于 2026-06-02/);
    assert.match(entries[0], /data-sort-pinned="1"/);
    assert.equal((entries[0].match(/<img /g) || []).length, 1);
    assert.match(entries[0], /data-src="\/cover.jpg"/);
    assert.match(entries[1], /href="\/posts\/no-cover\/"/);
    assert.match(entries[1], /&lt;标签&gt;/);
    assert.doesNotMatch(entries[1], /<img /);
    assert.doesNotMatch(entries.join(''), /style="[^"]*line-clamp|post-card-pinned-badge/);
});

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

    const indexHtml = writes.get('index.html');
    const homeHtml = writes.get('home.html');
    const shellHtml = writes.get('shell.html');

    assert.ok(indexHtml, 'index.html is generated as the crawlable homepage with real content');
    assert.ok(homeHtml, 'home.html is generated as the iframe default content page');
    assert.ok(shellHtml, 'shell.html is generated as the persistent shell');

    // `/` 是规范首页：真实内容直出，携带 WebSite 结构化数据，可被搜索引擎完整读取
    assert.match(indexHtml, /<link rel="canonical" href="https:\/\/example\.com\/" \/>/);
    assert.match(indexHtml, /"@type":"WebSite"/);
    assert.match(indexHtml, /\/posts\/demo-post\//);
    assert.match(indexHtml, /Demo Post/);
    assert.match(indexHtml, /class="post-card home-post-entry/);
    assert.doesNotMatch(indexHtml, /data-site-search/);
    assert.match(indexHtml, /id="search-toggle"/);
    assert.doesNotMatch(indexHtml, /<!-- HOME_POST_COUNT -->/);
    assert.doesNotMatch(indexHtml, /<meta name="robots" content="noindex/);
    assert.doesNotMatch(indexHtml, /data-freecat-shell-root="true"/);

    // /home 与 / 是同一份首页内容，canonical 归并到 /
    assert.equal(homeHtml, indexHtml, 'home.html serves the same homepage document as index.html');

    // 外壳退到 /shell：纯运行时容器，noindex，不再承载结构化数据
    assert.match(shellHtml, /data-freecat-shell-root="true"/);
    assert.match(shellHtml, /id="freecat-content-frame"/);
    assert.match(shellHtml, /src="\/home"/);
    assert.match(shellHtml, /<meta name="robots" content="noindex,follow" \/>/);
    assert.doesNotMatch(shellHtml, /"@type":"WebSite"/);
});

test('generated search indexes contain build-time search fields', (t) => {
    const writes = new Map();
    t.mock.method(fs, 'writeFileSync', (filePath, content) => {
        writes.set(path.basename(filePath), content);
    });
    t.mock.method(console, 'log', () => {});

    const { engine, siteConfig, seoConfig } = createTestEngine();

    searchPage.generate({
        posts: [createPost()],
        template: engine.loadTemplate('template_index_search.html'),
        siteConfig,
        seoConfig,
        outputDir: 'dist',
        recentPostsSidebarHtml: ''
    });

    const searchIndex = JSON.parse(writes.get('search-index.json'));
    const tagIndex = JSON.parse(writes.get('tag-index.json'));

    assert.equal(searchIndex[0].content, undefined, 'raw searchable content is folded into searchText at build time');
    assert.match(searchIndex[0].searchText, /demo body content/, 'searchText contains the preprocessed article body');
    assert.deepEqual(searchIndex[0].lowerTags, ['demo'], 'lowerTags is precomputed for exact tag matching');
    assert.equal(searchIndex[0].mobileExcerptHtml, undefined, 'mobile excerpt html is not precomputed');
    assert.equal(searchIndex[0].desktopTitleSingleLine, true, 'safe one-line desktop titles are fixed at build time');
    assert.equal(searchIndex[0].desktopTitleLines, undefined, 'desktop title text is not pre-split');
    assert.equal(searchIndex[0].desktopPreviewLines, 7, 'safe one-line desktop titles get a seven-line preview');
    assert.equal(tagIndex.sorted, true, 'tag indexes are emitted in display order');
    assert.equal(tagIndex.posts[0].searchText, undefined, 'tag index keeps only display fields');
    assert.equal(tagIndex.posts[0].lowerTags, undefined, 'tag index avoids duplicate search-only fields');
    assert.equal(tagIndex.posts[0].mobileExcerptHtml, undefined, 'tag index does not keep precomputed mobile excerpt html');
    assert.equal(tagIndex.posts[0].desktopTitleSingleLine, true, 'tag index keeps the desktop title mode');
    assert.equal(tagIndex.posts[0].desktopTitleLines, undefined, 'tag index does not keep pre-split title text');
    assert.equal(tagIndex.posts[0].desktopPreviewLines, 7, 'tag index keeps desktop preview line count');
});
