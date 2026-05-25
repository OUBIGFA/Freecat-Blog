const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('global header links View All after About', () => {
    const header = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'partials', 'header.html'),
        'utf8'
    );

    const aboutIndex = header.indexOf('href="/about.html">About</a>');
    const viewAllIndex = header.indexOf('href="/all.html">View All</a>');

    assert.ok(aboutIndex >= 0);
    assert.ok(viewAllIndex > aboutIndex);
});

test('global header shows View All as a mobile icon link', () => {
    const header = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'partials', 'header.html'),
        'utf8'
    );

    assert.match(header, /<a href="\/all\.html" aria-label="View All"\s+class="[^"]*md:hidden[^"]*">[\s\S]*M20\.0833 15\.1999/);
});

test('global header places tag menu between search and theme controls', () => {
    const header = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'partials', 'header.html'),
        'utf8'
    );

    const searchIndex = header.indexOf('id="search-toggle"');
    const tagIndex = header.indexOf('id="tag-menu-toggle"');
    const themeIndex = header.indexOf('id="theme-toggle"');

    assert.ok(searchIndex >= 0);
    assert.ok(tagIndex > searchIndex);
    assert.ok(themeIndex > tagIndex);
    assert.match(header, /id="tag-menu"[\s\S]*data-tag-menu-items/);
});

test('homepage builder does not inject a View All button above posts', () => {
    const indexBuilder = fs.readFileSync(
        path.join(__dirname, '..', 'build', 'pages', 'index.js'),
        'utf8'
    );

    assert.doesNotMatch(indexBuilder, /renderViewAllLink/);
    assert.match(indexBuilder, /\.replace\('<!-- PAGINATION_PLACEHOLDER -->', \(\) => ''\)/);
});
