const test = require('node:test');
const assert = require('node:assert/strict');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const { parseMarkdown } = require('../build/markdown');
const { renderPostPage } = require('../build/pages/post');

function createPost(content) {
    return {
        title: 'Diagram Test',
        slug: 'diagram-test',
        date: dayjs('2026-01-01T00:00:00+08:00'),
        modifiedDate: dayjs('2026-01-02T00:00:00+08:00'),
        excerpt: 'Diagram test.',
        preview: 'Diagram test.',
        summary: 'Diagram test.',
        cover: '',
        tag: [],
        link: '/posts/diagram-test.html',
        showCover: false,
        pinned: false,
        enableImageCaptions: false,
        noindex: false,
        faq: [],
        content
    };
}

test('mermaid fenced code renders as a diagram block instead of a code block', () => {
    const html = parseMarkdown('```mermaid\ngraph TD\n  A --> B\n```');

    assert.match(html, /class="diagram-block mermaid-block/);
    assert.match(html, /data-mermaid-source="/);
    assert.match(html, /graph TD/);
    assert.doesNotMatch(html, /code-block-container/);
});

test('echarts fenced code validates JSON and stores options safely', () => {
    const html = parseMarkdown('```echarts\n{"series":[{"type":"pie","data":[1]}]}\n```');

    assert.match(html, /class="diagram-block echarts-block/);
    assert.match(html, /data-chart-options="/);
    assert.doesNotMatch(html, /data-chart-error=/);
    assert.doesNotMatch(html, /code-block-container/);
});

test('invalid echarts JSON is marked for client-side error display', () => {
    const html = parseMarkdown('```echarts\n{invalid json}\n```');

    assert.match(html, /class="diagram-block echarts-block/);
    assert.match(html, /data-chart-error="/);
});

test('post pages load Mermaid and ECharts only when diagrams are present', () => {
    const template = [
        '<html><head><!-- POST_HIGHLIGHT_CSS --><!-- POST_KATEX_CSS --><!-- POST_HIGHLIGHT_JS --></head><body>',
        '<!-- CONTENT_PLACEHOLDER --><!-- POST_CHART_JS --><!-- POST_AUDIO_CSS --><!-- POST_AUDIO_JS -->',
        '<!-- TITLE_PLACEHOLDER --><!-- TITLE_H1_PLACEHOLDER --><!-- TAGS_PLACEHOLDER --><!-- DATE_PLACEHOLDER -->',
        '<!-- DATE_ISO_PLACEHOLDER --><!-- MODIFIED_PLACEHOLDER --><!-- COVER_PLACEHOLDER --><!-- TOC_PLACEHOLDER -->',
        '<!-- POST_SEO_HEAD --><!-- POST_JSONLD -->',
        '</body></html>'
    ].join('');

    const html = renderPostPage({
        post: createPost('```mermaid\ngraph TD\nA-->B\n```\n\n```echarts\n{"series":[]}\n```'),
        template,
        siteConfig: { site_title: 'FreeCat Blog', site_name: 'FreeCat', site_url: 'https://example.com' },
        seoConfig: { site_language: 'zh-CN', site_author: 'FreeCat', site_default_image: '/image/freecat.png' }
    });

    assert.match(html, /vditor@3\.11\.2\/dist\/js\/mermaid\/mermaid\.min\.js/);
    assert.match(html, /echarts@5\/dist\/echarts\.min\.js/);
});
