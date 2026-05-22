const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '../src/assets/post.css'), 'utf8');

test('mermaid edge label keeps an opaque outer block and transparent inner text nodes', () => {
    assert.match(css, /\.mermaid-block \.labelBkg\s*\{[^}]*background-color:\s*#f8fafc !important;/s);
    assert.match(css, /\.mermaid-block \.labelBkg\s*\{[^}]*border:\s*1px solid #94a3b8 !important;/s);
    assert.match(css, /\.dark \.mermaid-block \.labelBkg\s*\{[^}]*background-color:\s*#1e293b !important;/s);
    assert.match(css, /\.dark \.mermaid-block \.labelBkg\s*\{[^}]*border-color:\s*#64748b !important;/s);
    assert.match(css, /\.mermaid-block \.labelBkg \*\s*\{[^}]*background:\s*transparent !important;/s);
});
