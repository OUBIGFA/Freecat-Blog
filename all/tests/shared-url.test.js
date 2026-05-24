const test = require('node:test');
const assert = require('node:assert/strict');

const shared = require('../src/assets/shared.js');

test('encodeSitePath encodes internal paths and keeps query strings intact', () => {
    const encoded = shared.encodeSitePath('/posts/国内银联卡 + 86 手机号.html?from=search#top');

    assert.equal(
        encoded,
        '/posts/%E5%9B%BD%E5%86%85%E9%93%B6%E8%81%94%E5%8D%A1%20%2B%2086%20%E6%89%8B%E6%9C%BA%E5%8F%B7.html?from=search#top'
    );
});

test('encodeSitePath does not double-encode already encoded paths', () => {
    assert.equal(
        shared.encodeSitePath('/posts/%E5%9B%BD%E5%86%85%E9%93%B6%E8%81%94%E5%8D%A1%20%2B%2086.html'),
        '/posts/%E5%9B%BD%E5%86%85%E9%93%B6%E8%81%94%E5%8D%A1%20%2B%2086.html'
    );
});

test('encodeSitePath leaves absolute URLs unchanged', () => {
    assert.equal(shared.encodeSitePath('https://example.com/a b.html'), 'https://example.com/a b.html');
});
