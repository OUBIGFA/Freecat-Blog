const test = require('node:test');
const assert = require('node:assert/strict');

const postCardTemplate = require('../src/assets/post-card-template.js');

test('post card omits image containers when no cover is provided', () => {
    const html = postCardTemplate.renderPostCard({
        link: '/posts/plain.html',
        titleHtml: 'Plain Article',
        excerptHtml: 'Plain text article without metadata.',
        date: '2026-05-15',
        modifiedDate: '2026-05-15',
        tagsHtml: '',
        cover: '',
        pinned: false
    });

    assert.doesNotMatch(html, /<img\b/);
    assert.doesNotMatch(html, /h-\[180px\]/);
    assert.doesNotMatch(html, /col-start-2 row-start-1 h-full/);
    assert.match(html, /grid-cols-1/);
});

test('post card renders fallback image when cover placeholder is requested', () => {
    const html = postCardTemplate.renderPostCard({
        link: '/posts/metadata-without-cover.html',
        titleHtml: 'Metadata Article',
        excerptHtml: 'Markdown article with frontmatter but no cover value.',
        date: '2026-05-15',
        modifiedDate: '2026-05-15',
        tagsHtml: '',
        cover: '',
        coverPlaceholder: true,
        pinned: false
    });

    assert.match(html, /<img\b[^>]*src="\/image\/404\.png"/);
    assert.match(html, /h-\[180px\]/);
    assert.match(html, /grid-cols-\[minmax\(0,1fr\)_minmax\(360px,43%\)\]/);
});

test('post card encodes special characters in internal article links', () => {
    const html = postCardTemplate.renderPostCard({
        link: '/posts/国内银联卡 + 86 手机号.html',
        titleHtml: 'Special Link',
        excerptHtml: 'Article with special characters in the filename.',
        date: '2026-05-24',
        modifiedDate: '2026-05-24',
        tagsHtml: '',
        cover: '',
        pinned: false
    });

    assert.match(html, /href="\/posts\/%E5%9B%BD%E5%86%85%E9%93%B6%E8%81%94%E5%8D%A1%20%2B%2086%20%E6%89%8B%E6%9C%BA%E5%8F%B7\.html"/);
    assert.doesNotMatch(html, /href="[^"]*\+[^"]*"/);
});
