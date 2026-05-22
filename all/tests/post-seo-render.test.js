const test = require('node:test');
const assert = require('node:assert/strict');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const { renderPostPage } = require('../build/pages/post');

test('post page keeps one visible H1 and renders FAQ schema', () => {
    const template = [
        '<html><head><title><!-- TITLE_PLACEHOLDER --></title><!-- POST_SEO_HEAD --><!-- POST_JSONLD --></head><body>',
        '<h1><!-- TITLE_H1_PLACEHOLDER --></h1>',
        '<time datetime="<!-- DATE_ISO_PLACEHOLDER -->"><!-- DATE_PLACEHOLDER --></time>',
        '<div><!-- CONTENT_PLACEHOLDER --></div>',
        '<!-- TAGS_PLACEHOLDER --><!-- MODIFIED_PLACEHOLDER --><!-- COVER_PLACEHOLDER --><!-- TOC_PLACEHOLDER -->',
        '<!-- POST_HIGHLIGHT_CSS --><!-- POST_KATEX_CSS --><!-- POST_HIGHLIGHT_JS -->',
        '</body></html>'
    ].join('');
    const post = {
        title: 'Article Title',
        slug: 'article-title',
        date: dayjs('2026-01-01T00:00:00+08:00'),
        modifiedDate: dayjs('2026-01-02T00:00:00+08:00'),
        excerpt: 'Article summary.',
        preview: 'Article summary.',
        summary: 'Article summary.',
        cover: '',
        tag: ['free'],
        link: '/posts/article-title.html',
        showCover: false,
        pinned: false,
        enableImageCaptions: false,
        noindex: false,
        faq: [{ question: 'What is this?', answer: 'A test article.' }],
        content: '# Markdown H1\n\n## Markdown H2\n\nBody text.'
    };

    const html = renderPostPage({
        post,
        template,
        siteConfig: { site_title: 'FreeCat Blog', site_name: 'FreeCat', site_url: 'https://example.com' },
        seoConfig: { site_language: 'zh-CN', site_author: 'FreeCat', site_default_image: '/image/freecat.png' }
    });

    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /<h2 id="markdown-h1"/);
    assert.match(html, /<h3 id="markdown-h2"/);
    assert.match(html, /datetime="2025-12-31T16:00:00\.000Z"/);
    assert.match(html, /<section class="article-faq/);
    assert.match(html, /"@type":"FAQPage"/);
});
