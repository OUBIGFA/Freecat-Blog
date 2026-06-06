const test = require('node:test');
const assert = require('node:assert/strict');

const { defaultImage } = require('../build/seo.js');

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
