const test = require('node:test');
const assert = require('node:assert/strict');

const { defaultImage, renderHeadTags } = require('../build/seo.js');
const { normalizeBaseUrl, renderArticleJsonLd } = require('../build/seo.js');

test('canonical base accepts only a valid website origin', () => {
    assert.equal(normalizeBaseUrl({ site_url: ' https://EXAMPLE.com/// ' }), 'https://example.com');
    assert.equal(normalizeBaseUrl({ site_url: '' }), '');
    for (const site_url of ['example.com', 'https://', 'https://example.com/blog', 'https://example.com?x=1', 'https://user:pass@example.com', 'https://example.com/#page']) {
        assert.throws(() => normalizeBaseUrl({ site_url }), /site_url/);
    }
});

test('article structured data uses its chosen summary and defines its publisher', () => {
    const post = { title: 'Article', summary: 'Chosen summary', excerpt: 'Automatic excerpt', date: new Date('2026-01-01'), modifiedDate: new Date('2026-01-02') };
    const html = renderArticleJsonLd({ post, siteConfig: { site_url: 'https://example.com', site_name: 'Author' }, seoConfig: {}, canonical: 'https://example.com/posts/1/', tags: [], faqItems: [] });
    const graph = JSON.parse(html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>')))['@graph'];
    assert.equal(graph[0].description, 'Chosen summary');
    assert.equal(graph[0].publisher.name, 'Author');
});

test('default SEO image uses configured hero avatar when present', () => {
    const siteConfig = {
        hero_avatar: 'https://example.com/avatar.png',
        hero_avatar_configured: true,
        site_favicon: '/image/freecat.png'
    };
    const seoConfig = { site_default_image: '/image/default.png' };

    assert.equal(defaultImage(siteConfig, seoConfig), 'https://example.com/avatar.png');
});

test('default SEO image keeps SEO default when hero avatar is not configured', () => {
    const siteConfig = {
        hero_avatar: '/image/freecat.png',
        hero_avatar_configured: false,
        site_favicon: '/image/freecat.png'
    };
    const seoConfig = { site_default_image: '/image/default.png' };

    assert.equal(defaultImage(siteConfig, seoConfig), '/image/default.png');
});

test('share image metadata keeps a fixed square preview ratio', () => {
    const html = renderHeadTags({
        title: 'Example',
        description: 'Example page',
        canonicalPath: '/',
        siteConfig: {
            site_title: 'Example',
            site_name: 'Example',
            site_url: 'https://example.com',
            hero_avatar: '/image/freecat.png',
            site_favicon: '/image/freecat.png'
        },
        seoConfig: {}
    });

    assert.match(html, /<meta property="og:image:width" content="1200" \/>/);
    assert.match(html, /<meta property="og:image:height" content="1200" \/>/);
});
