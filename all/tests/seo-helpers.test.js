const test = require('node:test');
const assert = require('node:assert/strict');

const seo = require('../build/seo');

test('SEO head omits canonical URL when site_url is not configured', () => {
    const html = seo.renderHeadTags({
        title: 'Example',
        description: 'A short description',
        canonicalPath: '/example.html',
        siteConfig: { site_title: 'FreeCat Blog', site_url: '' },
        seoConfig: { site_language: 'zh-CN' }
    });

    assert.match(html, /<meta name="description" content="A short description" \/>/);
    assert.doesNotMatch(html, /rel="canonical"/);
    assert.doesNotMatch(html, /property="og:url"/);
});

test('SEO head emits absolute canonical URLs and noindex when requested', () => {
    const html = seo.renderHeadTags({
        title: 'Search - FreeCat Blog',
        description: 'Search articles',
        canonicalPath: '/search.html',
        siteConfig: { site_title: 'FreeCat Blog', site_url: 'https://example.com/' },
        seoConfig: { site_language: 'zh-CN' },
        noindex: true
    });

    assert.match(html, /<meta name="robots" content="noindex,follow" \/>/);
    assert.match(html, /<link rel="canonical" href="https:\/\/example\.com\/search\.html" \/>/);
    assert.match(html, /<meta property="og:url" content="https:\/\/example\.com\/search\.html" \/>/);
});

test('FAQ frontmatter normalizes into visible FAQ and JSON-LD data', () => {
    const faq = seo.normalizeFaq([
        { question: 'What is FreeCat?', answer: 'A static blog template.' },
        { question: '', answer: 'Ignored.' }
    ]);
    const html = seo.renderFaqHtml(faq);
    const jsonLd = seo.renderArticleJsonLd({
        post: {
            title: 'FreeCat',
            excerpt: 'A static blog template.',
            date: { toISOString: () => '2026-01-01T00:00:00.000Z' },
            modifiedDate: { toISOString: () => '2026-01-02T00:00:00.000Z' }
        },
        siteConfig: { site_title: 'FreeCat Blog', site_name: 'FreeCat', site_url: 'https://example.com' },
        seoConfig: { site_language: 'zh-CN', site_author: 'FreeCat' },
        canonical: 'https://example.com/posts/freecat.html',
        ogImage: '',
        tags: ['free'],
        faqItems: faq
    });

    assert.equal(faq.length, 1);
    assert.match(html, /<section class="article-faq/);
    assert.match(jsonLd, /"@type":"FAQPage"/);
    assert.match(jsonLd, /"@type":"BlogPosting"/);
    assert.match(jsonLd, /"@type":"BreadcrumbList"/);
});

