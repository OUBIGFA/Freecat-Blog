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
        assetVersion: ''
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
