const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const postJs = fs.readFileSync(path.join(__dirname, '../src/assets/post.js'), 'utf-8');
const postCss = fs.readFileSync(path.join(__dirname, '../src/assets/post.css'), 'utf-8');
const mainJs = fs.readFileSync(path.join(__dirname, '../src/assets/main.js'), 'utf-8');
const searchTemplate = fs.readFileSync(path.join(__dirname, '../src/template_index_search.html'), 'utf-8');
const transitionsCss = fs.readFileSync(path.join(__dirname, '../src/assets/transitions.css'), 'utf-8');
const allTemplate = fs.readFileSync(path.join(__dirname, '../src/template_index_all.html'), 'utf-8');
const postCardTemplate = require('../src/assets/post-card-template.js');
const { renderPostCardForList } = require('../build/pages/index.js');

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

test('mobile post cards remove the image-to-tags divider and extend the cover', () => {
    const html = postCardTemplate.renderPostCard({
        link: '/posts/example.html',
        titleHtml: 'Example',
        excerptHtml: 'Example excerpt',
        cover: '/image/example.png',
        date: '2026-05-30',
        modifiedDate: '2026-05-31',
        tagsHtml: '<span>Free</span>'
    });

    assert.match(html, /lazy-image-frame mt-8 h-\[196px\]/);
    assert.doesNotMatch(html, /lazy-image-frame mt-8 h-\[180px\]/);
    assert.match(html, /<div class="mt-3 shrink-0">\s*<div class="flex min-h-5 items-center">/);
    assert.doesNotMatch(html, /<div class="mt-3 shrink-0 border-t/);
    assert.doesNotMatch(html, /<div class="mt-4 shrink-0 border-t/);
});

test('all-page cards can opt out of order-based entrance delay', () => {
    const dateValue = {
        tz: () => ({ format: () => '2026-05-31' }),
        valueOf: () => 1780222181000
    };
    const html = renderPostCardForList({
        link: '/posts/example/',
        title: 'Example',
        excerpt: 'Example excerpt',
        date: dateValue,
        modifiedDate: dateValue
    }, 8, { animationDelayStep: 0 });

    assert.match(html, /animation-delay:\s*0ms/);
    assert.doesNotMatch(html, /animation-delay:\s*(?:560|960)ms/);
});

test('search page result count renders as the untagged-style numeric badge', () => {
    assert.match(mainJs, /resultsCountDisplay\.textContent\s*=\s*String\(results\.length\);/);
    assert.doesNotMatch(mainJs, /resultsCountDisplay\.textContent\s*=\s*`\(\$\{results\.length\} results\)`;/);
    assert.match(searchTemplate, /id="results-count"[\s\S]*background:\s*rgba\(148,\s*163,\s*184,\s*0\.18\);\s*color:\s*#475569;/);
});

test('all-page cards can reuse the metadata row for mobile tags', () => {
    const dateValue = {
        tz: () => ({ format: () => '2026-05-30' }),
        valueOf: () => 1780135781000
    };
    const modifiedDateValue = {
        tz: () => ({ format: () => '2026-05-31' }),
        valueOf: () => 1780222181000
    };
    const html = renderPostCardForList({
        link: '/posts/example/',
        title: 'Example',
        excerpt: 'Example excerpt',
        date: dateValue,
        modifiedDate: modifiedDateValue,
        tag: ['Free'],
        cover: '/image/example.png'
    }, 0, { mobileTagsInline: true });

    assert.match(html, /post-card[^"]*\btags-inline-mobile\b/);
    assert.equal(html.indexOf('<span>2026-05-31</span>') < html.indexOf('Free'), true);
    assert.doesNotMatch(html, /<div class="mt-4 shrink-0 border-t/);
});

test('all-page inline mobile tags are not clipped by the metadata row', () => {
    assert.match(allTemplate, /\.post-card\.tags-inline-mobile h3 \+ div\s*\{[\s\S]*overflow:\s*visible;/);
    assert.match(allTemplate, /\.post-card\.tags-inline-mobile \.tags-fit\s*\{[\s\S]*overflow:\s*visible;/);
    assert.match(allTemplate, /\.post-card\.tags-inline-mobile \.tags-fit\s*\{[\s\S]*transform-origin:\s*left center;/);
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

test('largest present article heading divider is thicker than the second largest', () => {
    assert.match(postCss, /\.prose \.article-heading-rank-1::after\s*\{[\s\S]*height:\s*2px;/);
    assert.match(postCss, /\.prose \.article-heading-rank-1::after,\s*\.prose \.article-heading-rank-2::after\s*\{[\s\S]*height:\s*1px;/);
});

test('article heading links inherit the heading color', () => {
    assert.match(postCss, /\.prose \.article-heading a,\s*\.prose \.article-heading a:hover\s*\{[\s\S]*color:\s*inherit\s*!important;/);
});

test('article heading links drop the body link underline', () => {
    assert.match(postCss, /\.prose \.article-heading a,\s*\.prose \.article-heading a:hover\s*\{[\s\S]*text-decoration:\s*none\s*!important;/);
});

test('article heading links are prefixed with a currentColor link icon', () => {
    const beforeBlock = postCss.match(/\.prose \.article-heading a::before\s*\{[\s\S]*?\}/);
    assert.ok(beforeBlock, 'expected a .prose .article-heading a::before rule');
    const rule = beforeBlock[0];
    // 图标用 mask + currentColor 渲染，跟随标题颜色（含深色模式）
    assert.match(rule, /background-color:\s*currentColor;/);
    assert.match(rule, /mask:\s*url\("data:image\/svg\+xml,/);
    assert.match(rule, /content:\s*""/);
});

test('markdown horizontal rules render as thick article dividers', () => {
    const hrBlocks = postCss.match(/(?:\.dark )?\.prose>hr\s*\{[^}]*\}/g) || [];

    assert.match(postCss, /\.prose>hr\s*\{[\s\S]*height:\s*3px\s*!important;/);
    assert.match(postCss, /\.prose>hr\s*\{[\s\S]*background:\s*#d8e0eb\s*!important;/);
    assert.match(postCss, /\.dark \.prose>hr\s*\{[\s\S]*background:\s*#475569\s*!important;/);
    assert.doesNotMatch(postCss, /\.prose hr\s*\{[\s\S]*border-top:\s*2px solid/);
    assert.doesNotMatch(postCss, /\.prose hr\s*\{[\s\S]*height:\s*1px\s*!important;/);
    assert.equal(hrBlocks.some((block) => /border-radius:/.test(block)), false);
});

test('markdown horizontal rule spacing is centered and preserves blank-line gaps', () => {
    assert.match(postCss, /--article-space-divider:\s*80px;/);
    assert.doesNotMatch(postCss, /--article-space-divider-(?:before|after):/);
    assert.match(postCss, /\.prose>hr\s*\{[^}]*margin:\s*0\s*!important;/);
    assert.match(postCss, /\.prose>:not\(\.markdown-gap\)\+hr\s*,/);
    assert.match(postCss, /\.prose \.markdown-gap\+hr\s*\{[\s\S]*margin-block-start:\s*var\(--article-space-divider\)\s*!important;/);
    assert.match(postCss, /\.prose>hr\+:not\(\.markdown-gap\)\s*,/);
    assert.match(postCss, /\.prose>hr\+\.markdown-gap\+:not\(\.markdown-gap\)\s*\{[\s\S]*margin-block-start:\s*var\(--article-space-divider\)\s*!important;/);
    assert.match(postCss, /\.prose\.prose>:not\(\.markdown-gap\)\+hr\s*,/);
    assert.match(postCss, /\.prose\.prose \.markdown-gap\+hr\s*\{[\s\S]*margin-block-start:\s*var\(--article-space-divider\)\s*!important;/);
    assert.match(postCss, /\.prose\.prose>hr\+:not\(\.markdown-gap\)\s*,/);
    assert.match(postCss, /\.prose\.prose>hr\+\.markdown-gap\+:not\(\.markdown-gap\)\s*\{[\s\S]*margin-block-start:\s*var\(--article-space-divider\)\s*!important;/);
    assert.doesNotMatch(postCss, /hr\+\.article-heading-depth-/);
    assert.doesNotMatch(postCss, /hr\+\.markdown-gap\+\.article-heading-depth-/);
});

test('markdown tables use horizontal rules without vertical borders', () => {
    const tableRule = postCss.match(/\.prose table\s*\{[\s\S]*?\}/)?.[0] || '';
    const cellRule = postCss.match(/\.prose th,\s*\.prose td\s*\{[\s\S]*?\}/)?.[0] || '';
    const headerRule = postCss.match(/\.prose th\s*\{[\s\S]*?\}/)?.[0] || '';

    assert.match(postCss, /\.prose table\s*\{[\s\S]*background-color:\s*#f0f1f4\s*!important;/);
    assert.match(postCss, /\.prose table\s*\{[\s\S]*border-collapse:\s*separate\s*!important;/);
    assert.match(postCss, /\.prose table\s*\{[\s\S]*border-spacing:\s*1\.2em 0\s*!important;/);
    assert.match(postCss, /\.dark \.prose table\s*\{[\s\S]*background-color:\s*#151c2a\s*!important;/);
    assert.doesNotMatch(tableRule, /border-bottom:\s*2px solid/);
    assert.match(cellRule, /padding:\s*0\.75em 0\s*!important;/);
    assert.match(cellRule, /border:\s*0\s*!important;/);
    assert.match(cellRule, /border-bottom:\s*1px solid #d8dee8\s*!important;/);
    assert.match(headerRule, /border-bottom:\s*2px solid #c6cfdb\s*!important;/);
    assert.match(postCss, /\.prose tbody tr:last-child th,\s*\.prose tbody tr:last-child td\s*\{[\s\S]*border-bottom:\s*0\s*!important;/);
    assert.match(postCss, /\.prose table:not\(:has\(tbody tr\)\) thead th,\s*\.prose table:has\(tbody tr:only-child\) thead th\s*\{[\s\S]*border-bottom:\s*0\s*!important;/);
    assert.doesNotMatch(cellRule, /border:\s*1px solid/);
});

test('fixed header has a stable css height before runtime measurement', () => {
    assert.match(transitionsCss, /header\.fixed\s*\{[\s\S]*height:\s*var\(--freecat-header-height\);/);
    assert.match(transitionsCss, /header\.fixed\s+\.header-blur-target\s*\{[\s\S]*height:\s*100%;/);
    assert.doesNotMatch(transitionsCss, /(?:^|\n)header\s*\{[\s\S]*height:\s*var\(--freecat-header-height\);/);
});

test('root scroller disables browser scroll anchoring during async layout changes', () => {
    assert.match(transitionsCss, /html\s*\{[\s\S]*overflow-anchor:\s*none;/);
});

test('history navigation restores saved scroll positions after bfcache expires', () => {
    assert.match(mainJs, /function initScrollPositionMemory\(\)/);
    assert.match(mainJs, /sessionStorage\.setItem\(storageKey,\s*JSON\.stringify\(positions\)\)/);
    assert.match(mainJs, /getNavigationType\(\)\s*===\s*'back_forward'/);
    assert.match(mainJs, /window\.addEventListener\('pagehide',\s*saveScrollPosition\)/);
    assert.match(mainJs, /if \(window\.location\.hash\) return;/);
    assert.match(mainJs, /initScrollPositionMemory\(\);/);
});
