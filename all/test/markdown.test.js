const test = require('node:test');
const assert = require('node:assert/strict');

const { parseMarkdown } = require('../build/markdown.js');

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
