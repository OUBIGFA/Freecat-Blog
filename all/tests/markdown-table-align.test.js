const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { parseMarkdown } = require('../build/markdown');

test('markdown table alignment syntax renders align attributes', () => {
    const html = parseMarkdown([
        '| Left | Center | Right |',
        '| :--- | :---: | ---: |',
        '| A | B | C |'
    ].join('\n'));

    assert.match(html, /<th align="left">Left<\/th>/);
    assert.match(html, /<th align="center">Center<\/th>/);
    assert.match(html, /<th align="right">Right<\/th>/);
    assert.match(html, /<td align="left">A<\/td>/);
    assert.match(html, /<td align="center">B<\/td>/);
    assert.match(html, /<td align="right">C<\/td>/);
});

test('markdown syntax document uses real alignment markers in the alignment table example', () => {
    const markdown = fs.readFileSync(path.join(__dirname, '../../writing/Markdown语法文档.md'), 'utf8');
    const tableStart = markdown.indexOf('| 左对齐 | 居中对齐 | 右对齐 |');
    assert.notEqual(tableStart, -1);

    const tableSnippet = markdown.slice(tableStart, tableStart + 120);
    assert.match(tableSnippet, /\| :--- \| :---: \| ---: \|/);
});
