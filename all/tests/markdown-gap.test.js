const test = require('node:test');
const assert = require('node:assert/strict');

const { parseMarkdown } = require('../build/markdown');

function extractGapLines(html) {
    return Array.from(html.matchAll(/class="markdown-gap"[^>]*data-md-gap-lines="(\d+)"/g), (match) => Number(match[1]));
}

test('adjacent image lines do not create an explicit markdown gap', () => {
    const html = parseMarkdown('![a](/a.png)\n![b](/b.png)');

    assert.equal((html.match(/<figure class="post-image/g) || []).length, 2);
    assert.deepEqual(extractGapLines(html), []);
});

test('blank markdown lines between image blocks are preserved as counted spacing', () => {
    const oneBlankLine = parseMarkdown('![a](/a.png)\n\n![b](/b.png)');
    const twoBlankLines = parseMarkdown('![a](/a.png)\n\n\n![b](/b.png)');

    assert.deepEqual(extractGapLines(oneBlankLine), [1]);
    assert.deepEqual(extractGapLines(twoBlankLines), [2]);
});

test('blank lines after a visual block do not add extra spacing before headings', () => {
    const html = parseMarkdown('![a](/a.png)\n\n## Heading');

    assert.deepEqual(extractGapLines(html), []);
    assert.match(html, /<h2>Heading<\/h2>/);
});

test('blank lines inside fenced code blocks are not converted to article spacing', () => {
    const html = parseMarkdown('```txt\nfirst\n\nsecond\n```\n\n![b](/b.png)');

    assert.equal((html.match(/class="markdown-gap"/g) || []).length, 1);
    assert.match(html, /first\n\nsecond/);
});

test('shorter fence markers inside longer fenced code blocks do not end the block', () => {
    const markdown = '````md\n```txt\n\n![not-an-image](/inside.png)\n```\n````\n\n![real](/real.png)';
    const html = parseMarkdown(markdown);

    assert.equal((html.match(/class="markdown-gap"/g) || []).length, 1);
    assert.match(html, /!\[not-an-image\]\(\/inside\.png\)/);
});
