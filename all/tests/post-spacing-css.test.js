const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'assets', 'post.css'), 'utf8');
const rhythmStart = css.lastIndexOf('/* Normal Markdown article rhythm:');
assert.notEqual(rhythmStart, -1, 'missing final normal markdown rhythm layer');
const rhythm = css.slice(rhythmStart);
const beforeRhythm = css.slice(0, rhythmStart);

const remFor = (token) => {
    const match = rhythm.match(new RegExp(`--${token}: ([0-9.]+)rem;`));
    assert.ok(match, `missing ${token}`);
    return Number(match[1]);
};

test('final rhythm uses normal markdown scale values', () => {
    assert.equal(remFor('article-space-tight'), 0.42);
    assert.equal(remFor('article-space-flow'), 1.2);
    assert.equal(remFor('article-space-heading-to-content'), 1);
    assert.equal(remFor('article-space-heading-parent-child'), 1.59);
    assert.equal(remFor('article-space-heading-peer-1'), 4.47);
    assert.equal(remFor('article-space-heading-peer-2'), 3.29);
    assert.equal(remFor('article-space-heading-peer-3'), 2.76);
    assert.equal(remFor('article-space-heading-peer-4'), 2.24);
    assert.equal(remFor('article-space-heading-peer-5'), 2);
    assert.equal(remFor('article-space-heading-peer-6'), 1.82);
    assert.equal(remFor('article-space-divider-before'), 2.1);
    assert.equal(remFor('article-space-divider-after'), 2.1);
});

test('heading ownership and section hierarchy remain ordered', () => {
    assert.ok(remFor('article-space-heading-to-content') < remFor('article-space-flow'));
    assert.ok(remFor('article-space-flow') < remFor('article-space-heading-peer-6'));
    assert.ok(remFor('article-space-heading-peer-6') < remFor('article-space-heading-peer-5'));
    assert.ok(remFor('article-space-heading-peer-5') < remFor('article-space-heading-peer-4'));
    assert.ok(remFor('article-space-heading-peer-4') < remFor('article-space-heading-peer-3'));
    assert.ok(remFor('article-space-heading-peer-3') < remFor('article-space-heading-peer-2'));
    assert.ok(remFor('article-space-heading-peer-2') < remFor('article-space-heading-peer-1'));
});

test('article heading type scale is derived from the body size and keeps clear hierarchy contrast', () => {
    assert.match(css, /--article-heading-h1: calc\(var\(--article-body-size\) \* 2\.36\);/);
    assert.match(css, /--article-heading-h2: calc\(var\(--article-body-size\) \* 1\.92\);/);
    assert.match(css, /--article-heading-h3: calc\(var\(--article-body-size\) \* 1\.62\);/);
    assert.match(css, /--article-heading-h4: calc\(var\(--article-body-size\) \* 1\.42\);/);
    assert.match(css, /--article-heading-h5: calc\(var\(--article-body-size\) \* 1\.3\);/);
    assert.match(css, /--article-heading-h6: calc\(var\(--article-body-size\) \* 1\.2\);/);
    assert.match(css, /\.prose \.article-heading-depth-3 \{[\s\S]*?font-size: var\(--article-heading-h3\) !important;/);
    assert.match(css, /\.prose \.article-heading-depth-6 \{[\s\S]*?font-size: var\(--article-heading-h6\) !important;/);
});

test('final rhythm explicitly resets old margins that previously stacked with markdown gaps', () => {
    assert.doesNotMatch(rhythm, /calc\(var\(--article-rhythm\) \*/);
    assert.doesNotMatch(css, /Adaptive Golden-Ratio Heading Hierarchy/);
    assert.doesNotMatch(css, /--article-heading-to-body/);
    assert.match(rhythm, /\.prose p,[\s\S]*?\.prose table,[\s\S]*?\.prose \.article-heading,[\s\S]*?\.prose \.article-heading-depth-1,[\s\S]*?margin: 0 !important;/);
    assert.match(rhythm, /\.prose li \{[\s\S]*?margin: 0 0 var\(--article-space-tight\) !important;/);
    assert.match(rhythm, /\.prose li > p \{[\s\S]*?margin: 0 !important;/);
    assert.doesNotMatch(beforeRhythm, /margin-(top|bottom): (0\.618em|1\.618em|2\.618em|1\.75rem|1\.5rem) !important;/);
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
    const hrBlock = rhythm.match(/\.prose hr \{[\s\S]*?\}/)?.[0] || '';
    assert.match(rhythm, /\.prose \.markdown-gap \{[\s\S]*?--md-gap-size: 0lh;[\s\S]*?height: var\(--md-gap-size\) !important;/);
    assert.match(rhythm, /\.prose \.markdown-gap\+:where\(p, ul, ol, dl, blockquote, table,[\s\S]*?margin-block-start: var\(--article-space-flow\) !important;/);
    assert.match(rhythm, /\.prose \.markdown-gap\+\.article-heading-depth-2,[\s\S]*?margin-block-start: var\(--article-space-heading-peer-2\) !important;/);
    assert.doesNotMatch(hrBlock, /background: linear-gradient/);
    assert.match(rhythm, /\.prose hr \{[\s\S]*?background: #d8e0eb !important;/);
    assert.match(rhythm, /\.dark \.prose hr \{[\s\S]*?background: #475569 !important;/);
    assert.match(rhythm, /\.prose :where\(p, ul, ol, dl, blockquote, \.article-heading,[\s\S]*?\)\+hr,[\s\S]*?margin-block-start: var\(--article-space-divider-before\) !important;/);
    assert.match(rhythm, /\.prose hr\+:where\(p, ul, ol, dl, blockquote, table,[\s\S]*?margin-block-start: var\(--article-space-divider-after\) !important;/);
});

test('markdown tables keep transparent row backgrounds', () => {
    assert.match(css, /\.prose thead \{[\s\S]*?background-color: transparent !important;/);
    assert.match(css, /\.dark \.prose thead \{[\s\S]*?background-color: transparent !important;/);
    assert.match(css, /\.prose tbody tr:nth-child\(even\) \{[\s\S]*?background-color: transparent !important;/);
    assert.match(css, /\.dark \.prose tbody tr:nth-child\(even\) \{[\s\S]*?background-color: transparent !important;/);
});
