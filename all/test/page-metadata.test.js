const test = require('node:test');
const assert = require('node:assert/strict');
const { parseHTML } = require('linkedom');
const { syncPageMetadata, syncNavigation } = require('../shared/shared.js');

test('navigation distinguishes the current page from its article section', () => {
    const { document } = parseHTML('<html><body><nav id="nav-links"><a href="/">Home</a><a href="/all">Posts</a><a href="/about">About</a></nav></body></html>');
    for (const [pathname, href, state] of [['/', '/', 'page'], ['/all.html', '/all', 'page'], ['/about/', '/about', 'page'], ['/posts/example/', '/all', 'location'], ['/page/2/', '/all', 'location']]) {
        syncNavigation(document, pathname);
        const active = document.querySelectorAll('[aria-current]');
        assert.equal(active.length, 1);
        assert.equal(active[0].getAttribute('href'), href);
        assert.equal(active[0].getAttribute('aria-current'), state);
    }
    syncNavigation(document, '/search');
    assert.equal(document.querySelector('[aria-current]'), null);
    document.querySelector('a[href="/all"]').setAttribute('href', '/blog');
    syncNavigation(document, '/page/2/');
    assert.equal(document.querySelector('[aria-current]').getAttribute('href'), '/blog');
});

test('navigation replaces stale indexing metadata but keeps styles and site verification', () => {
    const { document: target } = parseHTML('<html><head><title>Shell</title><meta name="robots" content="noindex"/><link rel="canonical" href="https://example.com/shell"/><meta property="og:title" content="Shell"/><script type="application/ld+json">{}</script><meta name="google-site-verification" content="keep"/><link rel="stylesheet" href="/app.css"/></head></html>');
    const { document: source } = parseHTML('<html lang="zh-CN"><head><title>Article</title><link rel="canonical" href="https://example.com/posts/1/"/><meta name="description" content="Article summary"/><meta property="og:title" content="Article"/><script type="application/ld+json">{"@type":"BlogPosting"}</script></head></html>');
    syncPageMetadata(target, source);
    syncPageMetadata(target, source);
    assert.equal(target.title, 'Article');
    assert.equal(target.documentElement.lang, 'zh-CN');
    assert.equal(target.querySelector('meta[name=robots]'), null);
    assert.equal(target.querySelectorAll('link[rel=canonical]').length, 1);
    assert.equal(target.querySelector('link[rel=canonical]').getAttribute('href'), 'https://example.com/posts/1/');
    assert.equal(target.querySelector('meta[property="og:title"]').content, 'Article');
    assert.equal(target.querySelector('meta[name=google-site-verification]').content, 'keep');
    assert.ok(target.querySelector('link[rel=stylesheet]'));
    source.head.insertAdjacentHTML('beforeend', '<meta name="robots" content="noindex,follow"/>');
    syncPageMetadata(target, source);
    assert.equal(target.querySelector('meta[name=robots]').content, 'noindex,follow');
});
