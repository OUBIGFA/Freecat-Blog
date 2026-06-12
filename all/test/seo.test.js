const test = require('node:test');
const assert = require('node:assert/strict');

const { defaultImage, renderHeadTags } = require('../build/seo.js');

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
