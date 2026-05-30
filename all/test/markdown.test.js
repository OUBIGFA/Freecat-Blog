const test = require('node:test');
const assert = require('node:assert/strict');

const { parseMarkdown, extractHeadingsAndGenerateTOC } = require('../build/markdown.js');

test('callout titles are rendered as text', () => {
    const html = parseMarkdown('> [!note] <img src=x onerror=alert(1)>\\n> content');

    assert.equal(html.includes('<span class="callout-title-inner"><img'), false);
    assert.equal(html.includes('&lt;img src=x onerror=alert(1)&gt;'), true);
});

test('image alt, title, and caption are rendered as text', () => {
    const html = parseMarkdown('![<img src=x>](/image/freecat.png "<b>caption</b>")', {
        enableImageCaptions: true
    });

    assert.equal(html.includes('alt="<img src=x>"'), false);
    assert.equal(html.includes('title="<b>caption</b>"'), false);
    assert.equal(html.includes('<figcaption class="image-caption block text-center text-sm text-slate-500 dark:text-slate-400"><b>caption</b></figcaption>'), false);
    assert.equal(html.includes('alt="&lt;img src=x&gt;"'), true);
    assert.equal(html.includes('title="&lt;b&gt;caption&lt;/b&gt;"'), true);
    assert.equal(html.includes('&lt;b&gt;caption&lt;/b&gt;'), true);
});

test('markdown images render the loading spinner element', () => {
    const html = parseMarkdown('![Freecat](/image/freecat.png)');

    assert.equal(html.includes('class="post-image-loader"'), true);
    assert.equal(html.includes('<span class="loader"></span>'), true);
});

test('inline-code headings keep their own text in the table of contents', () => {
    const { headings, toc } = extractHeadingsAndGenerateTOC([
        '### `site_网站属性.md`',
        '',
        '常改的几项：网站名称、网站描述、首页标题、头像、网站图标、默认主题、每页显示文章数量、底部版权文字。',
        '',
        '### `social_社交媒体.md`',
        '',
        '每个社交平台一般有三类字段。'
    ].join('\n'));

    assert.deepEqual(headings.map(heading => heading.text), [
        'site_网站属性.md',
        'social_社交媒体.md'
    ]);
    assert.equal(toc.includes('常改的几项'), false);
    assert.equal(toc.includes('每个社交平台一般有三类字段'), false);
});
