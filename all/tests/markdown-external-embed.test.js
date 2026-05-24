const test = require('node:test');
const assert = require('node:assert/strict');

const { parseMarkdown } = require('../build/markdown');

test('external page image syntax renders as a generic embed instead of a broken image', () => {
    const html = parseMarkdown('![](https://x.com/i/status/1930080468529230100)');

    assert.match(html, /class="external-embed external-embed-twitter"/);
    assert.match(html, /<blockquote class="twitter-tweet">/);
    assert.doesNotMatch(html, /<img\b[^>]*x\.com\/i\/status/);
});

test('known video page image syntax renders an iframe embed', () => {
    const html = parseMarkdown('![](https://www.youtube.com/watch?v=dQw4w9WgXcQ)');

    assert.match(html, /class="external-embed external-embed-youtube"/);
    assert.match(html, /src="https:\/\/www\.youtube\.com\/embed\/dQw4w9WgXcQ"/);
});

test('unknown external page image syntax falls back to a link card', () => {
    const html = parseMarkdown('![Example](https://example.com/page)');

    assert.match(html, /class="external-embed external-embed-link"/);
    assert.match(html, /href="https:\/\/example\.com\/page"/);
    assert.match(html, />Example<\/a>/);
});
