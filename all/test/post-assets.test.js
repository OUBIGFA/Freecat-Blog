const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const postJs = fs.readFileSync(path.join(__dirname, '../src/assets/post.js'), 'utf-8');
const postCardTemplate = require('../src/assets/post-card-template.js');

test('external embeds keep placeholders until visible content or fallback link is ready', () => {
    assert.match(postJs, /function hasVisibleTwitterEmbed\(figure\)/);
    assert.match(postJs, /rect\.width > 0 && rect\.height >= 120/);
    assert.match(postJs, /if \(attempts >= 80\) \{\s*replaceFailedTwitterEmbed\(figure\);/);
    assert.doesNotMatch(postJs, /if \(iframe \|\| attempts >= 80\) \{\s*markExternalEmbedReady\(figure\);/);
    assert.doesNotMatch(postJs, /window\.setTimeout\(function \(\) \{\s*markExternalEmbedReady\(figure\);\s*\}, 2200\);/);
});

test('post card cover placeholders render the shared loading spinner', () => {
    const html = postCardTemplate.renderPostCard({
        link: '/posts/example.html',
        titleHtml: 'Example',
        cover: '/image/example.png',
        date: '2026-05-30'
    });

    assert.equal(html.includes('class="lazy-image-frame'), true);
    assert.equal(html.includes('data-src="/image/example.png"'), true);
    assert.equal(html.includes('class="placeholder-loader"'), true);
    assert.equal(html.includes('<span class="loader"></span>'), true);
});
