const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const postJs = fs.readFileSync(path.join(__dirname, '../src/assets/post.js'), 'utf-8');
const postCss = fs.readFileSync(path.join(__dirname, '../src/assets/post.css'), 'utf-8');
const transitionsCss = fs.readFileSync(path.join(__dirname, '../src/assets/transitions.css'), 'utf-8');
const postCardTemplate = require('../src/assets/post-card-template.js');

test('external embeds keep placeholders until visible content or fallback link is ready', () => {
    assert.match(postJs, /function hasVisibleTwitterEmbed\(figure\)/);
    assert.match(postJs, /rect\.width > 0 && rect\.height >= 120/);
    assert.match(postJs, /if \(attempts >= 80\) \{\s*replaceFailedTwitterEmbed\(figure\);/);
    assert.doesNotMatch(postJs, /if \(iframe \|\| attempts >= 80\) \{\s*markExternalEmbedReady\(figure\);/);
    assert.doesNotMatch(postJs, /window\.setTimeout\(function \(\) \{\s*markExternalEmbedReady\(figure\);\s*\}, 2200\);/);
});

test('post card cover placeholders render the shared loading spinner', () => {
    const html = postCardTemplate.renderPostCard({
        link: '/posts/example.html',
        titleHtml: 'Example',
        cover: '/image/example.png',
        date: '2026-05-30'
    });

    assert.equal(html.includes('class="lazy-image-frame'), true);
    assert.equal(html.includes('data-src="/image/example.png"'), true);
    assert.equal(html.includes('class="placeholder-loader"'), true);
    assert.equal(html.includes('<span class="loader"></span>'), true);
});

test('top two present article heading ranks render full-width divider rules', () => {
    assert.match(postCss, /\.prose \.article-heading-rank-1::after,\s*\.prose \.article-heading-rank-2::after\s*\{/);
    assert.doesNotMatch(postCss, /\.prose \.article-heading::after\s*\{/);
    assert.doesNotMatch(postCss, /\.prose \.article-heading-depth-1::after/);
    assert.doesNotMatch(postCss, /\.prose \.article-heading-depth-2::after/);
    assert.match(postCss, /width:\s*100%;/);
    assert.match(postCss, /height:\s*1px;/);
    assert.match(postCss, /background:\s*var\(--article-heading-rule\);/);
});

test('markdown horizontal rules render as thick article dividers', () => {
    const hrBlocks = postCss.match(/(?:\.dark )?\.prose>hr\s*\{[^}]*\}/g) || [];

    assert.match(postCss, /\.prose>hr\s*\{[\s\S]*height:\s*3px\s*!important;/);
    assert.match(postCss, /\.prose>hr\s*\{[\s\S]*background:\s*#e2e8f0\s*!important;/);
    assert.match(postCss, /\.dark \.prose>hr\s*\{[\s\S]*background:\s*#475569\s*!important;/);
    assert.doesNotMatch(postCss, /\.prose hr\s*\{[\s\S]*border-top:\s*2px solid/);
    assert.doesNotMatch(postCss, /\.prose hr\s*\{[\s\S]*height:\s*1px\s*!important;/);
    assert.equal(hrBlocks.some((block) => /border-radius:/.test(block)), false);
});

test('fixed header has a stable css height before runtime measurement', () => {
    assert.match(transitionsCss, /header\.fixed\s*\{[\s\S]*height:\s*var\(--freecat-header-height\);/);
    assert.match(transitionsCss, /header\.fixed\s+\.header-blur-target\s*\{[\s\S]*height:\s*100%;/);
    assert.doesNotMatch(transitionsCss, /(?:^|\n)header\s*\{[\s\S]*height:\s*var\(--freecat-header-height\);/);
});

test('root scroller disables browser scroll anchoring during async layout changes', () => {
    assert.match(transitionsCss, /html\s*\{[\s\S]*overflow-anchor:\s*none;/);
});
