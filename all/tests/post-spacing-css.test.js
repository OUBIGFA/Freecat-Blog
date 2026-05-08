const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'assets', 'post.css'), 'utf8');
const rhythmStart = css.lastIndexOf('/* Normal Markdown article rhythm:');
assert.notEqual(rhythmStart, -1, 'missing final normal markdown rhythm layer');
const rhythm = css.slice(rhythmStart);

const remFor = (token) => {
    const match = rhythm.match(new RegExp(`--${token}: ([0-9.]+)rem;`));
    assert.ok(match, `missing ${token}`);
    return Number(match[1]);
};

test('final rhythm uses normal markdown scale values', () => {
    assert.equal(remFor('article-space-tight'), 0.42);
    assert.equal(remFor('article-space-flow'), 1.2);
    assert.equal(remFor('article-space-heading-to-content'), 0.85);
    assert.equal(remFor('article-space-heading-parent-child'), 1.35);
    assert.equal(remFor('article-space-heading-peer-1'), 3.8);
    assert.equal(remFor('article-space-heading-peer-2'), 2.8);
    assert.equal(remFor('article-space-heading-peer-3'), 2.35);
    assert.equal(remFor('article-space-heading-peer-4'), 1.9);
    assert.equal(remFor('article-space-divider-before'), 2.5);
    assert.equal(remFor('article-space-divider-after'), 1.7);
});

test('heading ownership and section hierarchy remain ordered', () => {
    assert.ok(remFor('article-space-heading-to-content') < remFor('article-space-flow'));
    assert.ok(remFor('article-space-flow') < remFor('article-space-heading-peer-4'));
    assert.ok(remFor('article-space-heading-peer-4') < remFor('article-space-heading-peer-3'));
    assert.ok(remFor('article-space-heading-peer-3') < remFor('article-space-heading-peer-2'));
    assert.ok(remFor('article-space-heading-peer-2') < remFor('article-space-heading-peer-1'));
});

test('final rhythm explicitly resets old margins that previously stacked with markdown gaps', () => {
    assert.doesNotMatch(rhythm, /calc\(var\(--article-rhythm\) \*/);
    assert.match(rhythm, /\.prose p,[\s\S]*?\.prose table,[\s\S]*?\.prose \.article-heading,[\s\S]*?\.prose \.article-heading-depth-1,[\s\S]*?margin-block: 0 !important;/);
    assert.match(rhythm, /\.prose li \{[\s\S]*?margin: 0 0 var\(--article-space-tight\) !important;/);
    assert.match(rhythm, /\.prose li > p \{[\s\S]*?margin-block: 0 !important;/);
});

test('generic content flow excludes headings so headings keep semantic spacing', () => {
    assert.match(rhythm, /\.prose :where\(p, ul, ol, dl, blockquote, table,[\s\S]*?\)\+:where\(p, ul, ol, dl, blockquote, table,[\s\S]*?\) \{[\s\S]*?margin-block-start: var\(--article-space-flow\) !important;/);
    assert.match(rhythm, /\.prose\.prose :is\(p, ul, ol, dl, blockquote, table,[\s\S]*?\)\+:is\(p, ul, ol, dl, blockquote, table,[\s\S]*?\) \{[\s\S]*?margin-block-start: var\(--article-space-flow\) !important;/);
    assert.doesNotMatch(rhythm, /\.prose\.prose :where\(p, ul, ol, dl, blockquote, table,[\s\S]*?\)\+:where\(p, ul, ol, dl, blockquote, table,/);
    assert.doesNotMatch(rhythm, /:where\(p, ul, ol, dl, blockquote, hr, \.article-heading/);
    assert.match(rhythm, /\.prose \.article-heading-depth-2\+:where\(p, ul, ol, dl, blockquote, table,[\s\S]*?margin-block-start: var\(--article-space-heading-to-content\) !important;/);
    assert.match(rhythm, /\.prose :where\(p, ul, ol, dl, blockquote, table,[\s\S]*?\)\+\.article-heading-depth-2,[\s\S]*?margin-block-start: var\(--article-space-heading-peer-2\) !important;/);
});

test('markdown gaps and dividers participate without adding hidden paragraph spacing', () => {
    assert.match(rhythm, /\.prose \.markdown-gap \{[\s\S]*?--md-gap-size: 0lh;[\s\S]*?height: var\(--md-gap-size\) !important;/);
    assert.match(rhythm, /\.prose \.markdown-gap\+:where\(p, ul, ol, dl, blockquote, table,[\s\S]*?margin-block-start: var\(--article-space-flow\) !important;/);
    assert.match(rhythm, /\.prose \.markdown-gap\+\.article-heading-depth-2,[\s\S]*?margin-block-start: var\(--article-space-heading-peer-2\) !important;/);
    assert.doesNotMatch(rhythm, /background: linear-gradient/);
    assert.match(rhythm, /\.prose hr \{[\s\S]*?background: #d8e0eb !important;/);
    assert.match(rhythm, /\.dark \.prose hr \{[\s\S]*?background: #475569 !important;/);
    assert.match(rhythm, /\.prose :where\(p, ul, ol, dl, blockquote, \.article-heading,[\s\S]*?\)\+hr,[\s\S]*?margin-block-start: var\(--article-space-divider-before\) !important;/);
    assert.match(rhythm, /\.prose hr\+:where\(p, ul, ol, dl, blockquote, table,[\s\S]*?margin-block-start: var\(--article-space-divider-after\) !important;/);
});
