const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'assets', 'post.css'), 'utf8');

test('visual article blocks do not keep independent vertical margins', () => {
    assert.match(css, /\.prose table,\s*\.prose \.code-block-container,\s*\.prose figure\.post-image,[\s\S]*?margin-top: 0 !important;[\s\S]*?margin-bottom: 0 !important;/);
});

test('markdown gap owns spacing before visual blocks and scales by line count', () => {
    assert.match(css, /\.prose \.markdown-gap \{[\s\S]*?--md-gap-lines: 0;[\s\S]*?--md-gap-size: 0\.28lh;[\s\S]*?height: var\(--md-gap-size\) !important;/);
    assert.match(css, /\.prose \.markdown-gap\+:is\(table, \.code-block-container, figure\.post-image/);
});
