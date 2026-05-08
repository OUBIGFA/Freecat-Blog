const test = require('node:test');
const assert = require('node:assert/strict');

const { parseMarkdown } = require('../build/markdown');

function extractGapLines(html) {
    return Array.from(html.matchAll(/class="markdown-gap"[^>]*data-md-gap-lines="(\d+)"/g), (match) => Number(match[1]));
}

function extractGapSizes(html) {
    return Array.from(html.matchAll(/class="markdown-gap"[^>]*--md-gap-size:([0-9.]+)lh/g), (match) => Number(match[1]));
}

test('adjacent image lines use the normal zero-line markdown gap', () => {
    const html = parseMarkdown('![a](/a.png)\n![b](/b.png)');

    assert.equal((html.match(/<figure class="post-image/g) || []).length, 2);
    assert.deepEqual(extractGapLines(html), [0]);
    assert.deepEqual(extractGapSizes(html), [0]);
});

test('blank markdown lines between image blocks are preserved as counted spacing', () => {
    const oneBlankLine = parseMarkdown('![a](/a.png)\n\n![b](/b.png)');
    const twoBlankLines = parseMarkdown('![a](/a.png)\n\n\n![b](/b.png)');

    assert.deepEqual(extractGapLines(oneBlankLine), []);
    assert.deepEqual(extractGapLines(twoBlankLines), [2]);
    assert.deepEqual(extractGapSizes(oneBlankLine), []);
    assert.deepEqual(extractGapSizes(twoBlankLines), [0.62]);
});

test('blank lines after a visual block are preserved before headings', () => {
    const html = parseMarkdown('![a](/a.png)\n\n## Heading');

    assert.deepEqual(extractGapLines(html), []);
    assert.match(html, /<h2>Heading<\/h2>/);
});

test('single markdown blank lines between text blocks stay native markdown spacing', () => {
    const html = parseMarkdown('First paragraph.\n\nSecond paragraph.');

    assert.deepEqual(extractGapLines(html), []);
    assert.deepEqual(extractGapSizes(html), []);
    assert.match(html, /<p>First paragraph\.<\/p>/);
    assert.match(html, /<p>Second paragraph\.<\/p>/);
});

test('the first blank line is syntax while extra blanks still add spacing', () => {
    const oneBlankLine = parseMarkdown('## Heading\n\nBody text.');
    const twoBlankLines = parseMarkdown('## Heading\n\n\nBody text.');

    assert.deepEqual(extractGapLines(oneBlankLine), []);
    assert.deepEqual(extractGapSizes(oneBlankLine), []);
    assert.deepEqual(extractGapLines(twoBlankLines), [2]);
    assert.deepEqual(extractGapSizes(twoBlankLines), [0.62]);
});

test('blank lines inside markdown lists keep native list structure', () => {
    const html = parseMarkdown('- First\n\n- Second');

    assert.deepEqual(extractGapLines(html), []);
    assert.equal((html.match(/<ul>/g) || []).length, 1);
    assert.match(html, /<li>[\s\S]*First[\s\S]*<\/li>/);
    assert.match(html, /<li>[\s\S]*Second[\s\S]*<\/li>/);
});

test('blank lines before indented continuations keep native markdown structure', () => {
    const html = parseMarkdown('[^note]: First line\n\n  Continued line\n\nParagraph with note[^note].');

    assert.deepEqual(extractGapLines(html), []);
    assert.match(html, /First line/);
    assert.match(html, /Continued line/);
});

test('blank lines inside fenced code blocks are not converted to article spacing', () => {
    const html = parseMarkdown('```txt\nfirst\n\nsecond\n```\n\n![b](/b.png)');

    assert.equal((html.match(/class="markdown-gap"/g) || []).length, 0);
    assert.match(html, /first\n\nsecond/);
});

test('a code block followed directly by an image uses the same spacing marker path', () => {
    const html = parseMarkdown('```txt\nfirst\n```\n![b](/b.png)');

    assert.deepEqual(extractGapLines(html), [0]);
});

test('an image followed directly by a fenced code block keeps both blocks renderable', () => {
    const html = parseMarkdown('![a](/a.png)\n```json\n{"ok": true}\n```');

    assert.deepEqual(extractGapLines(html), [0]);
    assert.equal((html.match(/<figure class="post-image/g) || []).length, 1);
    assert.equal((html.match(/code-block-container/g) || []).length, 1);
    assert.doesNotMatch(html, /```/);
    assert.doesNotMatch(html, /&lt;div class=&quot;markdown-gap/);
});

test('shorter fence markers inside longer fenced code blocks do not end the block', () => {
    const markdown = '````md\n```txt\n\n![not-an-image](/inside.png)\n```\n````\n\n![real](/real.png)';
    const html = parseMarkdown(markdown);

    assert.equal((html.match(/class="markdown-gap"/g) || []).length, 0);
    assert.match(html, /!\[not-an-image\]\(\/inside\.png\)/);
});

test('extra markdown blank lines create explicit additional spacing only from the second blank', () => {
    const html = parseMarkdown('First paragraph.\n\n\nSecond paragraph.');

    assert.deepEqual(extractGapLines(html), [2]);
    assert.deepEqual(extractGapSizes(html), [0.62]);
    assert.match(html, /<p>First paragraph\.<\/p>/);
    assert.match(html, /<p>Second paragraph\.<\/p>/);
});
