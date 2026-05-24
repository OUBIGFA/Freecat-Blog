const test = require('node:test');
const assert = require('node:assert/strict');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const { renderPostPage } = require('../build/pages/post');

function createBasePost(overrides = {}) {
    return {
        title: 'Article Title',
        slug: 'article-title',
        date: dayjs('2026-01-01T00:00:00+08:00'),
        modifiedDate: dayjs('2026-01-02T00:00:00+08:00'),
        excerpt: 'Article summary.',
        preview: 'Article summary.',
        summary: 'Article summary.',
        cover: '',
        tag: [],
        link: '/posts/article-title.html',
        showCover: false,
        pinned: false,
        enableImageCaptions: false,
        noindex: false,
        faq: [],
        content: 'Body text.',
        ...overrides
    };
}

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

test('post page loads external embed scripts only when needed', () => {
    const template = [
        '<html><head><title><!-- TITLE_PLACEHOLDER --></title><!-- POST_SEO_HEAD --><!-- POST_JSONLD --></head><body>',
        '<h1><!-- TITLE_H1_PLACEHOLDER --></h1>',
        '<time datetime="<!-- DATE_ISO_PLACEHOLDER -->"><!-- DATE_PLACEHOLDER --></time>',
        '<div><!-- CONTENT_PLACEHOLDER --></div>',
        '<!-- TAGS_PLACEHOLDER --><!-- MODIFIED_PLACEHOLDER --><!-- COVER_PLACEHOLDER --><!-- TOC_PLACEHOLDER -->',
        '<!-- POST_HIGHLIGHT_CSS --><!-- POST_KATEX_CSS --><!-- POST_HIGHLIGHT_JS --><!-- POST_CHART_JS -->',
        '</body></html>'
    ].join('');
    const post = {
        title: 'Embed Post',
        slug: 'embed-post',
        date: dayjs('2026-01-01T00:00:00+08:00'),
        modifiedDate: dayjs('2026-01-02T00:00:00+08:00'),
        excerpt: 'Embed summary.',
        preview: 'Embed summary.',
        summary: 'Embed summary.',
        cover: '',
        tag: [],
        link: '/posts/embed-post.html',
        showCover: false,
        pinned: false,
        enableImageCaptions: false,
        noindex: false,
        faq: [],
        content: '![](https://x.com/i/status/1930080468529230100)'
    };

    const html = renderPostPage({
        post,
        template,
        siteConfig: { site_title: 'FreeCat Blog', site_name: 'FreeCat', site_url: 'https://example.com' },
        seoConfig: { site_language: 'zh-CN', site_author: 'FreeCat', site_default_image: '/image/freecat.png' }
    });

    assert.match(html, /platform\.twitter\.com\/widgets\.js/);
});

test('post page hides the table of contents block when the article has no headings', () => {
    const template = [
        '<html><head><title><!-- TITLE_PLACEHOLDER --></title><!-- POST_SEO_HEAD --><!-- POST_JSONLD --></head><body>',
        '<h1><!-- TITLE_H1_PLACEHOLDER --></h1>',
        '<time datetime="<!-- DATE_ISO_PLACEHOLDER -->"><!-- DATE_PLACEHOLDER --></time>',
        '<div><!-- CONTENT_PLACEHOLDER --></div>',
        '<aside class="w-64 flex-shrink-0 sticky top-32 h-[calc(100vh-300px)] self-start relative group/toc lg:mt-[68px]">',
        '<h3>目录</h3><div id="toc-container"><nav><!-- TOC_PLACEHOLDER --></nav></div>',
        '</aside>',
        '<!-- TAGS_PLACEHOLDER --><!-- MODIFIED_PLACEHOLDER --><!-- COVER_PLACEHOLDER -->',
        '<!-- POST_HIGHLIGHT_CSS --><!-- POST_KATEX_CSS --><!-- POST_HIGHLIGHT_JS --><!-- POST_CHART_JS -->',
        '</body></html>'
    ].join('');

    const htmlWithoutHeadings = renderPostPage({
        post: createBasePost({ content: 'Only body text.' }),
        template,
        siteConfig: { site_title: 'FreeCat Blog', site_name: 'FreeCat', site_url: 'https://example.com' },
        seoConfig: { site_language: 'zh-CN', site_author: 'FreeCat', site_default_image: '/image/freecat.png' }
    });
    const htmlWithHeadings = renderPostPage({
        post: createBasePost({ content: '## Section\n\nBody text.' }),
        template,
        siteConfig: { site_title: 'FreeCat Blog', site_name: 'FreeCat', site_url: 'https://example.com' },
        seoConfig: { site_language: 'zh-CN', site_author: 'FreeCat', site_default_image: '/image/freecat.png' }
    });

    assert.doesNotMatch(htmlWithoutHeadings, /<aside\b[^>]*group\/toc/);
    assert.doesNotMatch(htmlWithoutHeadings, /id="toc-container"/);
    assert.match(htmlWithoutHeadings, /aria-hidden="true"/);
    assert.match(htmlWithHeadings, /<aside\b[^>]*group\/toc/);
    assert.match(htmlWithHeadings, /href="#section"/);
});
