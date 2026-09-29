const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function fixture(t, change = () => {}) {
    const files = new Map();
    const base = 'https://example.com';
    const urls = ['/', '/about', '/all', '/posts/1/'];
    for (const route of [...urls, '/search', '/shell', '/404.html']) {
        const hidden = !urls.includes(route);
        const body = route === '/posts/1/'
            ? '<article><h1>Article</h1><p>Full text</p></article><script type="application/ld+json">{"@type":"BlogPosting","url":"https://example.com/posts/1/"}</script>'
            : '<main><h1>Blog</h1><a href="/posts/1/">Article</a></main>';
        const html = '<html lang="zh-CN"><head><meta charset="utf-8"/><title>Blog ' + route + '</title><meta name="description" content="Summary"/><meta name="robots" content="' + (hidden ? 'noindex,follow' : 'index,follow') + '"/><link rel="canonical" href="' + base + route + '"/></head><body>' + body + '</body></html>';
        const file = route.endsWith('/') ? route + 'index.html' : route.endsWith('.html') ? route : route + '.html';
        files.set(path.resolve('/virtual', '.' + file), html);
    }
    files.set(path.resolve('/virtual/sitemap.xml'), '<urlset>' + urls.map(url => '<url><loc>' + base + url + '</loc></url>').join('') + '</urlset>');
    files.set(path.resolve('/virtual/robots.txt'), ['User-agent: *', 'Allow: /', '', 'Sitemap: https://example.com/sitemap.xml', ''].join(String.fromCharCode(10)));
    change(files);
    t.mock.method(fs, 'readFileSync', file => {
        const value = files.get(path.resolve(file));
        if (value === undefined) throw new Error('Missing ' + file);
        return value;
    });
    return { outputDir: '/virtual', siteConfig: { site_url: base }, posts: [{ link: '/posts/1/' }], postsPerPage: 8 };
}

test('build audit accepts complete, linked, indexable articles', t => {
    const { auditSeoOutput } = require('../build/seo-audit.js');
    assert.equal(auditSeoOutput(fixture(t)).articles, 1);
});

for (const failure of ['noindex', 'canonical', 'missing-article', 'sitemap', 'unlinked']) {
    test('build audit rejects ' + failure + ' regressions', t => {
        const { auditSeoOutput } = require('../build/seo-audit.js');
        const options = fixture(t, files => {
            const article = path.resolve('/virtual/posts/1/index.html');
            if (failure === 'noindex') files.set(article, files.get(article).replace('index,follow', 'noindex,follow'));
            if (failure === 'canonical') files.set(article, files.get(article).replace('href="https://example.com/posts/1/"', 'href="https://example.com/shell"'));
            if (failure === 'missing-article') files.set(article, files.get(article).replace('<article><h1>Article</h1><p>Full text</p></article>', '<iframe></iframe>'));
            if (failure === 'sitemap') files.set(path.resolve('/virtual/sitemap.xml'), '<urlset/>');
            if (failure === 'unlinked') files.set(path.resolve('/virtual/all.html'), files.get(path.resolve('/virtual/all.html')).replace('<a href="/posts/1/">Article</a>', ''));
        });
        assert.throws(() => auditSeoOutput(options), /SEO/);
    });
}
