const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { createEngine } = require('../build/template-engine.js');
const shared = require('../src/assets/shared.js');

function createTestEngine(siteUrl, options = {}) {
    return createEngine({
        templatesDir: path.join(__dirname, '..', 'src'),
        partialsDir: path.join(__dirname, '..', 'src', 'partials'),
        siteConfig: {
            site_title: 'FreeCat Blog',
            site_name: 'FreeCat',
            site_url: siteUrl || '',
            site_favicon: '/image/freecat_web_icon.png',
            hero_avatar: '/image/freecat.png'
        },
        seoConfig: { site_language: 'zh-CN' },
        socialConfig: options.socialConfig || {},
        assetVersion: '',
        tagMenuItemsHtml: options.tagMenuItemsHtml || ''
    });
}

test('discovery links are omitted when site_url is empty', () => {
    const engine = createTestEngine('');
    const html = engine.applySiteConfig('<!-- DISCOVERY_LINKS -->');
    const indexHtml = engine.loadTemplate('template_index.html');
    const postHtml = engine.loadTemplate('template_post.html');

    assert.equal(html, '');
    assert.equal(indexHtml.includes('feed.xml'), false);
    assert.equal(indexHtml.includes('opensearch.xml'), false);
    assert.equal(postHtml.includes('feed.xml'), false);
    assert.equal(postHtml.includes('opensearch.xml'), false);
});

test('discovery links are included when site_url is configured', () => {
    const html = createTestEngine('https://example.com').loadTemplate('template_index.html');

    assert.equal(html.includes('type="application/rss+xml"'), true);
    assert.equal(html.includes('type="application/opensearchdescription+xml"'), true);
});

test('tag labels are escaped by default', () => {
    const html = shared.renderTagSpan('<img src=x onerror=alert(1)>');

    assert.equal(html.includes('<img src=x'), false);
    assert.equal(html.includes('&lt;img src=x onerror=alert(1)&gt;'), true);
});

test('tag click query is pre-encoded for inline handlers', () => {
    const html = shared.renderTagSpan("x');alert(1);//");

    assert.equal(html.includes("x');alert(1);//"), false);
    assert.equal(html.includes('x%27)%3Balert(1)%3B%2F%2F'), true);
});

test('404 template includes the theme bootstrap only once', () => {
    const html = createTestEngine('https://example.com').loadTemplate('template_index_404.html');
    const count = (html.match(/localStorage\.getItem\('theme'\)/g) || []).length;

    assert.equal(count, 1);
});

test('relative RSS social link is hidden when site_url is empty', () => {
    const html = createTestEngine('', {
        socialConfig: {
            rss_enabled: true,
            rss_url: '/feed.xml',
            rss_icon: '<svg></svg>'
        }
    }).applySiteConfig('<!-- SOCIAL_LINKS -->');

    assert.equal(html.includes('/feed.xml'), false);
});

test('relative RSS social link is shown when site_url is configured', () => {
    const html = createTestEngine('https://example.com', {
        socialConfig: {
            rss_enabled: true,
            rss_url: '/feed.xml',
            rss_icon: '<svg></svg>'
        }
    }).applySiteConfig('<!-- SOCIAL_LINKS -->');

    assert.equal(html.includes('/feed.xml'), true);
});

test('external RSS social link is shown without site_url', () => {
    const html = createTestEngine('', {
        socialConfig: {
            rss_enabled: true,
            rss_url: 'https://feeds.example.com/freecat.xml',
            rss_icon: '<svg></svg>'
        }
    }).applySiteConfig('<!-- SOCIAL_LINKS -->');

    assert.equal(html.includes('https://feeds.example.com/freecat.xml'), true);
});

test('collectMenuTags counts tags, sorts by frequency then name, and tracks untagged', () => {
    const posts = [
        { tags: ['JS', 'CSS'] },
        { tags: 'js' },          // 大小写归并 + 字符串形态
        { tags: ['CSS'] },
        { tags: [] },            // 未打标签
        { tags: null }           // 未打标签
    ];
    const list = shared.collectMenuTags(posts);

    // 未打标签固定置顶
    assert.equal(list[0].untagged, true);
    assert.equal(list[0].count, 2);
    // js 出现 2 次（含字符串那篇），css 出现 2 次；同频按名称升序 → css 在 js 前
    const tagged = list.filter(t => !t.untagged);
    assert.deepEqual(tagged.map(t => t.label), ['CSS', 'JS']);
    assert.equal(tagged[0].count, 2);
    assert.equal(tagged[1].count, 2);
});

test('renderTagMenuItemsHtml escapes labels, encodes hrefs and renders counts', () => {
    const html = shared.renderTagMenuItemsHtml(shared.collectMenuTags([
        { tags: ['<b>x</b>'] }
    ]));

    assert.equal(html.includes('class="tag-menu-item'), true);
    assert.equal(html.includes('--tag-menu-index:0;'), true);
    assert.equal(html.includes('<b>x</b>'), false);              // 标签文本被转义
    assert.equal(html.includes('&lt;b&gt;x&lt;/b&gt;'), true);
    assert.equal(html.includes('tag=%3Cb%3Ex%3C%2Fb%3E'), true); // href 编码
});

test('renderTagMenuItemsHtml falls back to empty hint when no tags', () => {
    assert.equal(shared.renderTagMenuItemsHtml([]).includes('No tags yet'), true);
});

test('engine pre-renders tag menu items into the header placeholder', () => {
    const tagMenuItemsHtml = shared.renderTagMenuItemsHtml(shared.collectMenuTags([
        { tags: ['Alpha'] }
    ]));
    const html = createTestEngine('https://example.com', { tagMenuItemsHtml })
        .loadTemplate('template_index.html');

    assert.equal(html.includes('<!-- TAG_MENU_ITEMS -->'), false); // 占位符已被替换
    assert.equal(html.includes('class="tag-menu-item'), true);     // 标签项已预渲染进页面
    assert.equal(html.includes('Loading tags...'), false);         // 不再有加载占位
});

