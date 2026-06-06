const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const postJs = fs.readFileSync(path.join(__dirname, '../src/assets/post.js'), 'utf-8');
const postCss = fs.readFileSync(path.join(__dirname, '../src/assets/post.css'), 'utf-8');
const mainJs = fs.readFileSync(path.join(__dirname, '../src/assets/main.js'), 'utf-8');
const postTemplate = fs.readFileSync(path.join(__dirname, '../src/template_post.html'), 'utf-8');
const indexTemplate = fs.readFileSync(path.join(__dirname, '../src/template_index.html'), 'utf-8');
const searchTemplate = fs.readFileSync(path.join(__dirname, '../src/template_index_search.html'), 'utf-8');
const headBase = fs.readFileSync(path.join(__dirname, '../src/partials/head-base.html'), 'utf-8');
const header = fs.readFileSync(path.join(__dirname, '../src/partials/header.html'), 'utf-8');
const homeSidebar = fs.readFileSync(path.join(__dirname, '../src/partials/home-sidebar.html'), 'utf-8');
const transitionsCss = fs.readFileSync(path.join(__dirname, '../src/assets/transitions.css'), 'utf-8');
const allTemplate = fs.readFileSync(path.join(__dirname, '../src/template_index_all.html'), 'utf-8');
const updateSortControl = fs.readFileSync(path.join(__dirname, '../src/partials/update-sort-control.html'), 'utf-8');
const aboutTemplate = fs.readFileSync(path.join(__dirname, '../src/template_index_About.html'), 'utf-8');
const notFoundTemplate = fs.readFileSync(path.join(__dirname, '../src/template_index_404.html'), 'utf-8');
const buildJs = fs.readFileSync(path.join(__dirname, '../build.js'), 'utf-8');
const paginationJs = fs.readFileSync(path.join(__dirname, '../build/pagination.js'), 'utf-8');
const seoJs = fs.readFileSync(path.join(__dirname, '../build/seo.js'), 'utf-8');
const tailwindBuild = fs.readFileSync(path.join(__dirname, '../build/tailwind.js'), 'utf-8');
const notoSubsetScript = fs.readFileSync(path.join(__dirname, '../tools/generate-noto-subset.py'), 'utf-8');
const mediaPlayerJs = fs.readFileSync(path.join(__dirname, '../src/assets/media-player.js'), 'utf-8');
const mediaPlayerCss = fs.readFileSync(path.join(__dirname, '../src/assets/media-player.css'), 'utf-8');
const videoPlayerJs = fs.readFileSync(path.join(__dirname, '../src/assets/video-player.js'), 'utf-8');
const videoPlayerCss = fs.readFileSync(path.join(__dirname, '../src/assets/video-player.css'), 'utf-8');
const shared = require('../src/assets/shared.js');
const postCardTemplate = require('../src/assets/post-card-template.js');
const { renderPostCardForList } = require('../build/pages/index.js');
const { generatePaginationHtml } = require('../build/pagination.js');

function preloadFontHrefs(source) {
    return [...source.matchAll(/<link\s+rel="preload"\s+href="([^"]+)"\s+as="font"\s+type="font\/woff2"\s+crossorigin\s*\/?>/g)]
        .map(match => match[1]);
}

test('external embeds keep placeholders until visible content or fallback link is ready', () => {
    assert.match(postJs, /function hasVisibleTwitterEmbed\(figure\)/);
    assert.match(postJs, /rect\.width > 0 && rect\.height >= 120/);
    assert.match(postJs, /function requestTwitterEmbedRender\(figure\)/);
    assert.match(postJs, /window\.twttr\.widgets\.load\(figure\);/);
    assert.match(postJs, /if \(isFailedTwitterEmbed\(figure\)\) \{\s*replaceFailedTwitterEmbed\(figure\);/);
    assert.match(postJs, /if \(attempts >= 80\) \{\s*requestTwitterEmbedRender\(figure\);\s*attempts = 0;/);
    assert.doesNotMatch(postJs, /if \(attempts >= 80\) \{\s*replaceFailedTwitterEmbed\(figure\);/);
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

test('post card text uses build-time Figtree and Noto Sans SC font assets', () => {
    const html = postCardTemplate.renderPostCard({
        link: '/posts/example.html',
        titleHtml: 'Example title',
        excerptHtml: 'Freecat 示例摘要',
        date: '2026-05-30',
        modifiedDate: '2026-05-31',
        tagsHtml: shared.renderTagSpan('中文Tag')
    });

    assert.doesNotMatch(headBase, /Freecat Google Sans|freecat-google-sans/);
    assert.doesNotMatch(postCss, /Freecat Google Sans|freecat-google-sans/);
    assert.doesNotMatch(headBase, /Freecat DM Sans|freecat-dm-sans/);
    assert.doesNotMatch(postCss, /Freecat DM Sans|freecat-dm-sans/);
    assert.match(headBase, /font-family:\s*"Freecat Figtree"/);
    assert.match(headBase, /freecat-figtree-regular-subset\.woff2/);
    assert.match(headBase, /freecat-figtree-semi-bold-subset\.woff2/);
    assert.match(headBase, /freecat-figtree-extra-bold-subset\.woff2/);
    assert.match(headBase, /font-family:\s*"Freecat Tag Figtree"/);
    assert.match(headBase, /font-family:\s*"Freecat Noto Sans SC"/);
    assert.match(headBase, /freecat-noto-sans-sc-regular-subset\.woff2/);
    assert.match(headBase, /font-family:\s*"Freecat Tag Noto Sans SC"/);
    assert.match(headBase, /freecat-noto-sans-sc-medium-subset\.woff2/);
    assert.match(headBase, /freecat-noto-sans-sc-semi-bold-subset\.woff2/);
    assert.match(headBase, /font-family:\s*"Freecat Post Card Noto Sans SC"/);
    assert.match(headBase, /freecat-noto-sans-sc-extra-bold-subset\.woff2/);
    assert.match(headBase, /\.post-card-title\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Post Card Noto Sans SC"/);
    assert.match(headBase, /\.post-card-excerpt\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"/);
    assert.match(headBase, /\.post-card-excerpt\s*\{[\s\S]*font-weight:\s*400;/);
    assert.match(headBase, /\.freecat-date-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree"/);
    assert.match(headBase, /\.freecat-published-date-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree"[\s\S]*font-weight:\s*600;/);
    assert.match(headBase, /\.freecat-tag-text\s*\{[\s\S]*font-family:\s*"Freecat Tag Figtree",\s*"Freecat Tag Noto Sans SC"[\s\S]*font-weight:\s*500;/);
    assert.match(headBase, /\.freecat-nav-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree"[\s\S]*font-weight:\s*600;/);
    assert.match(headBase, /\.freecat-go-back-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree"[\s\S]*font-weight:\s*800;/);
    assert.match(headBase, /\.freecat-search-input\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*400;/);
    assert.match(headBase, /\.freecat-update-sort-label\s*\{[\s\S]*font-family:\s*"Freecat Tag Noto Sans SC",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*500;/);
    assert.match(headBase, /\.freecat-brand-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*800;/);
    assert.match(headBase, /\.freecat-footer-copyright\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*400;/);
    assert.match(postCss, /\.freecat-date-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree"/);
    assert.match(postCss, /\.freecat-published-date-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree"[\s\S]*font-weight:\s*600;/);
    assert.match(postCss, /\.freecat-tag-text\s*\{[\s\S]*font-family:\s*"Freecat Tag Figtree",\s*"Freecat Tag Noto Sans SC"[\s\S]*font-weight:\s*500;/);
    assert.match(postCss, /\.freecat-nav-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree"[\s\S]*font-weight:\s*600;/);
    assert.match(postCss, /\.freecat-go-back-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree"[\s\S]*font-weight:\s*800;/);
    assert.match(postCss, /\.freecat-search-input\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*400;/);
    assert.match(postCss, /\.freecat-brand-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*800;/);
    assert.match(postCss, /\.freecat-footer-copyright\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*400;/);
    assert.match(notoSubsetScript, /ROOT \/ "dist"/);
    assert.doesNotMatch(notoSubsetScript, /ROOT \/ "dist" \/ "posts"/);
    assert.match(notoSubsetScript, /FIGTREE_FONT_WEIGHTS/);
    assert.doesNotMatch(notoSubsetScript, /PUBLISHED_DATE_CODEPOINTS/);

    assert.equal((html.match(/class="post-card-excerpt\b/g) || []).length, 2);
    assert.equal((html.match(/class="post-card-title\b/g) || []).length, 2);
    assert.match(html, /<h3 class="post-card-title[^"]*\bfont-black\b/);
    assert.match(html, /class="freecat-published-date-text">2026-05-30<\/span>/);
    assert.match(html, /class="freecat-date-text">2026-05-31<\/span>/);
    assert.match(html, /\bfreecat-tag-text\b/);
    assert.doesNotMatch(html, /\bfont-black\b[^"]*"[^>]*>中文Tag/);
    assert.match(html, /\bfreecat-tag-text\b[^"]*\bfont-medium\b/);
    assert.doesNotMatch(html, /<h3 class="[^"]*\bpost-card-excerpt\b/);
    assert.match(postTemplate, /<time class="freecat-published-date-text"/);
    assert.match(postTemplate, /最后编辑:\s*<span class="freecat-date-text">/);
    assert.match(header, /<input[^>]+id="search-input"[^>]+class="freecat-search-input\b/);
    assert.match(tailwindBuild, /'display':\s*\["'Freecat Figtree'",\s*"'Freecat Noto Sans SC'"/);
    assert.doesNotMatch(headBase, /font-display:\s*swap;/);
    assert.doesNotMatch(postCss, /font-display:\s*swap;/);
});

test('tag text preserves authored English casing', () => {
    const html = shared.renderTagSpan('iOS Dev');

    assert.match(html, />iOS Dev<\/span>/);
    assert.doesNotMatch(html, /\buppercase\b/);
});

test('sidebar and about text use build-time Figtree and Noto Sans SC font classes', () => {
    assert.match(headBase, /\.freecat-sidebar-slogan,\s*\.freecat-about-title\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*800;/);
    assert.match(headBase, /\.freecat-sidebar-description,\s*\.freecat-sidebar-recent-link,\s*\.freecat-about-description\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*400;/);
    assert.match(headBase, /\.freecat-sidebar-recent-heading\s*\{[\s\S]*font-family:\s*"Freecat Figtree"[\s\S]*font-weight:\s*800;/);

    assert.match(homeSidebar, /class="freecat-sidebar-slogan\b/);
    assert.doesNotMatch(homeSidebar, /freecat-sidebar-slogan[^"]*\bfont-semibold\b/);
    assert.match(homeSidebar, /class="freecat-sidebar-description\b/);
    assert.doesNotMatch(homeSidebar, /freecat-sidebar-description[^"]*\bfont-normal\b/);

    assert.match(aboutTemplate, /class="freecat-about-title\b/);
    assert.doesNotMatch(aboutTemplate, /freecat-about-title[^"]*\bfont-black\b/);
    assert.match(aboutTemplate, /class="freecat-about-description\b/);
    assert.doesNotMatch(aboutTemplate, /freecat-about-description[^"]*\bfont-normal\b/);

    assert.match(buildJs, /class="freecat-sidebar-recent-link\b/);
    assert.match(buildJs, /DEFAULT_RECENT_POSTS_LIMIT\s*=\s*8;/);
    assert.match(buildJs, /class="freecat-sidebar-recent-link[^"]*\btext-sm\b/);
    assert.doesNotMatch(buildJs, /class="freecat-sidebar-recent-link[^"]*\btext-\[13px\]\b/);
    assert.match(buildJs, /class="freecat-sidebar-recent-heading\b[\s\S]*>\s*Update\s*</);
    assert.match(buildJs, /class="freecat-sidebar-recent-heading[^"]*\btext-sm\b[\s\S]*>\s*Update\s*</);
    assert.doesNotMatch(buildJs, /class="freecat-sidebar-recent-heading[^"]*\btext-\[13px\]\b/);
    assert.doesNotMatch(buildJs, />\s*最近更新\s*</);
});

test('header brand link only uses content-sized click target', () => {
    const brandLinkClass = header.match(/<a href="\/" class="([^"]*)">[\s\S]*?freecat-brand-text/)?.[1] || '';

    assert.match(brandLinkClass, /\binline-flex\b/);
    assert.match(brandLinkClass, /\bshrink-0\b/);
    assert.doesNotMatch(brandLinkClass, /\bflex-1\b/);
});

test('go back and update sort labels use requested font assets', () => {
    for (const template of [postTemplate, searchTemplate, allTemplate]) {
        assert.match(template, /class="freecat-go-back-text text-sm">Go Back<\/span>/);
        assert.doesNotMatch(template, /<span class="text-sm font-bold">Go Back<\/span>/);
    }

    assert.match(updateSortControl, /class="freecat-update-sort-label">按更新排序<\/span>/);
    assert.match(allTemplate, /<!-- INCLUDE:update-sort-control -->/);
    assert.match(searchTemplate, /<!-- INCLUDE:update-sort-control -->/);
    assert.doesNotMatch(updateSortControl, /<span>按更新排序<\/span>/);
});

test('article table of contents uses requested Chinese and Latin font assets', () => {
    assert.match(postTemplate, /class="freecat-post-toc-title\b[\s\S]*>\s*目录\s*</);
    assert.doesNotMatch(postTemplate, /class="text-sm font-bold tracking-wider[^"]*">\s*目录\s*</);
    assert.match(postCss, /\.freecat-post-toc-title\s*\{[\s\S]*font-family:\s*"Freecat Tag Noto Sans SC",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*500;/);
    assert.match(postCss, /#toc-container a\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*400;/);
});

test('pagination text uses requested regular and active font weights', () => {
    const html = generatePaginationHtml(1, 2);

    assert.match(headBase, /\.freecat-pagination-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*400;[\s\S]*font-variant-numeric:\s*normal;[\s\S]*font-feature-settings:\s*normal;/);
    assert.match(headBase, /\.freecat-pagination-strong\s*\{[\s\S]*font-family:\s*"Freecat Figtree"[\s\S]*font-weight:\s*800;[\s\S]*font-variant-numeric:\s*normal;[\s\S]*font-feature-settings:\s*normal;/);
    assert.match(paginationJs, /aria-label="Pagination" class="freecat-pagination-text\b/);
    assert.match(html, /<nav aria-label="Pagination" class="freecat-pagination-text\b/);
    assert.match(html, /aria-current="page" class="[^"]*\bfreecat-pagination-strong\b[^"]*\bfont-extrabold\b/);
    assert.doesNotMatch(html, /aria-current="page" class="[^"]*\bfont-semibold\b/);
    assert.match(html, /<input[^>]+class="freecat-pagination-text\b/);
    assert.match(html, /<input[^>]+\bborder-b\b/);
    assert.match(html, /<input[^>]+\bfocus:border-transparent\b/);
    assert.match(html, /<input[^>]+\bfocus:ring-slate-300\/60\b/);
    assert.doesNotMatch(html, /\btabular-nums\b/);
    assert.match(html, />\s*跳至\s*<\/span>/);
    assert.match(html, />Prev<\/span>/);
    assert.match(html, />Next<\/span>/);
});

test('site text does not request unsupported bold weight', () => {
    const sources = [
        postCss,
        mainJs,
        searchTemplate,
        notFoundTemplate,
        seoJs,
        paginationJs
    ].join('\n');

    assert.doesNotMatch(sources, /\bfont-bold\b/);
    assert.doesNotMatch(sources, /font-weight:\s*700\b/);
});

test('only pages that render post cards preload post-card font assets', () => {
    const compactHtml = postCardTemplate.renderPostCard({
        link: '/posts/example.html',
        titleHtml: 'Example',
        excerptHtml: 'Example excerpt',
        date: '2026-05-30',
        layout: 'compact-grid'
    });

    assert.match(compactHtml, /post-card-layout-compact-grid/);
    assert.doesNotMatch(allTemplate, /\.freecat-all-page #posts-list \.post-card h3/);

    const sharedFontPreloads = [
        '/assets/fonts/freecat-figtree-regular-subset.woff2',
        '/assets/fonts/freecat-figtree-semi-bold-subset.woff2',
        '/assets/fonts/freecat-figtree-extra-bold-subset.woff2',
        '/assets/fonts/freecat-noto-sans-sc-regular-subset.woff2',
        '/assets/fonts/freecat-noto-sans-sc-medium-subset.woff2',
        '/assets/fonts/freecat-noto-sans-sc-semi-bold-subset.woff2',
        '/assets/fonts/freecat-noto-sans-sc-extra-bold-subset.woff2'
    ];

    assert.deepEqual(preloadFontHrefs(headBase), sharedFontPreloads);

    for (const template of [indexTemplate, allTemplate, searchTemplate]) {
        const hrefs = preloadFontHrefs(template);
        assert.deepEqual(hrefs, []);
        assert.equal(hrefs.includes('./assets/fonts/freecat-google-sans-regular-subset.woff2'), false);
        assert.equal(hrefs.some(href => href.includes('freecat-dm-sans')), false);
        assert.equal(hrefs.some(href => href.includes('freecat-figtree-medium')), false);
    }

    assert.deepEqual(preloadFontHrefs(aboutTemplate), []);
    assert.deepEqual(preloadFontHrefs(notFoundTemplate), []);
});

test('article video players default to 16:9 before metadata and then use real video ratio', () => {
    assert.match(videoPlayerCss, /\.video-player-stage\s*\{[\s\S]*aspect-ratio:\s*var\(--video-aspect-ratio,\s*16\s*\/\s*9\);/);
    assert.match(videoPlayerCss, /\.video-player-video\s*\{[\s\S]*height:\s*100%;[\s\S]*object-fit:\s*contain;/);
    assert.match(videoPlayerCss, /\.video-player-loading-overlay\s*\{[\s\S]*position:\s*absolute;[\s\S]*inset:\s*0;/);
    assert.match(videoPlayerJs, /function updateVideoAspectRatio\(\)\s*\{[\s\S]*video\.videoWidth[\s\S]*video\.videoHeight[\s\S]*stage\.style\.setProperty\('--video-aspect-ratio',\s*`\$\{width\} \/ \$\{height\}`\);[\s\S]*\}/);
    assert.match(videoPlayerJs, /onLoadedMetadata:\s*updateVideoAspectRatio/);
    assert.match(mediaPlayerJs, /function hydrateMediaControls\(container,\s*media/);
    assert.match(mediaPlayerCss, /\.media-progress-container\s*\{/);
    assert.match(mediaPlayerCss, /\.media-player-loading-chrome\s*\{/);
    assert.match(mediaPlayerCss, /\.media-player-loading-progress::before\s*\{/);
    assert.match(mediaPlayerCss, /\.media-player-loading-controls-left,\s*\.media-player-loading-controls-right\s*\{/);
});

test('all-page compact cards use native two-line excerpt ellipsis', () => {
    const excerpt = 'Long excerpt '.repeat(40);
    const html = postCardTemplate.renderPostCard({
        link: '/posts/example.html',
        titleHtml: 'Example',
        excerptHtml: excerpt,
        date: '2026-05-30',
        layout: 'compact-grid'
    });

    assert.match(html, /<p class="post-card-excerpt[^"]*\bmin-h-\[3\.3em\][^"]*" style="[^"]*-webkit-line-clamp:2/);
    assert.match(html, /overflow-wrap:break-word/);
    assert.equal(html.includes(excerpt), true);
    assert.doesNotMatch(html, /data-excerpt-overflow/);
    assert.doesNotMatch(headBase, /post-card-excerpt-clamp/);
    assert.doesNotMatch(html, /-webkit-line-clamp:9/);
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

test('search page result count reserves space before rendering the numeric badge', () => {
    assert.match(mainJs, /function setSearchResultsCount\(count\)\s*\{/);
    assert.match(mainJs, /value\.textContent\s*=\s*String\(count\);/);
    assert.match(mainJs, /resultsCountDisplay\.dataset\.countReady\s*=\s*'true';/);
    assert.match(mainJs, /setSearchResultsCount\(results\.length\);/);
    assert.doesNotMatch(mainJs, /resultsCountDisplay\.textContent\s*=\s*`\(\$\{results\.length\} results\)`;/);
    assert.match(searchTemplate, /id="results-count" class="freecat-results-count" data-count-ready="false"/);
    assert.match(searchTemplate, /class="freecat-results-count-icon"[\s\S]*M24 12L18\.3431 17\.6568/);
    assert.match(searchTemplate, /class="freecat-results-count-value"/);
    assert.match(transitionsCss, /\.freecat-results-count\s*\{[\s\S]*width:\s*1\.25rem;[\s\S]*height:\s*1\.25rem;[\s\S]*background:\s*rgba\(148,\s*163,\s*184,\s*0\.18\);[\s\S]*color:\s*#475569;/);
    assert.match(transitionsCss, /\.freecat-results-count\[data-count-ready="true"\]\s+\.freecat-results-count-value\s*\{[\s\S]*opacity:\s*1;/);
});

test('search page soft navigation re-renders against the current page before restoring scroll', () => {
    assert.match(mainJs, /async function initSearchPageResults\(\)\s*\{/);
    assert.match(mainJs, /const searchPageReady = initSearchPageResults\(\);/);
    assert.match(mainJs, /if \(pageReady && typeof pageReady\.then === 'function'\) \{\s*await pageReady;/);
    assert.match(mainJs, /if \(document\.getElementById\('search-results'\) !== searchResultsContainer\) return false;/);
    assert.match(mainJs, /renderSearchPageResults\(results,\s*searchResultsContainer\);/);
    assert.doesNotMatch(mainJs, /renderSearchPageResults\(results\);/);
});

test('nav audio defaults to half volume and exposes the matching volume slider while playing', () => {
    assert.match(mainJs, /const DEFAULT_NAV_AUDIO_VOLUME = 0\.5;/);
    assert.match(mainJs, /const NAV_AUDIO_VOLUME_HIDE_DELAY_MS = 2000;/);
    assert.match(mainJs, /navAudio\.volume = nextVolume;/);
    assert.match(mainJs, /navAudioVolume\.style\.setProperty\('--volume-percent', `\$\{nextVolume \* 100\}%`\);/);
    assert.match(mainJs, /if \(navAudioControl\) navAudioControl\.dataset\.playing = isPlaying \? 'true' : 'false';/);
    assert.match(mainJs, /navAudioVolumeWrapper\.addEventListener\('pointerenter', \(\) => setNavAudioVolumeOpen\(true\)\);/);
    assert.match(mainJs, /navAudioVolumeWrapper\.addEventListener\('pointerleave', scheduleNavAudioVolumeClose\);/);
    assert.match(transitionsCss, /\.nav-audio-control\[data-playing="true"\]\[data-volume-open="true"\] \.nav-audio-volume-slider-wrapper\s*\{[\s\S]*width:\s*80px;[\s\S]*opacity:\s*1;/);
    assert.match(transitionsCss, /\.nav-audio-volume-slider\s*\{[\s\S]*height:\s*4px;[\s\S]*background:\s*linear-gradient\(to right, #475569 0%, #475569 var\(--volume-percent, 50%\), #cbd5e1 var\(--volume-percent, 50%\), #cbd5e1 100%\);/);
    assert.match(transitionsCss, /\.nav-audio-volume-slider::-webkit-slider-thumb\s*\{[\s\S]*width:\s*12px;[\s\S]*height:\s*12px;[\s\S]*border:\s*2px solid white;/);
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
    const html = postCardTemplate.renderPostCard({
        link: '/posts/example.html',
        titleHtml: 'Example',
        excerptHtml: 'Example excerpt',
        date: '2026-05-30',
        tagsHtml: '<span>Free</span>',
        mobileTagsInline: true,
        layout: 'compact-grid'
    });

    assert.match(html, /post-card-layout-compact-grid/);
    assert.match(html, /tags-inline-mobile/);
    assert.match(html, /overflow-visible/);
});

test('second-largest article heading rank renders the divider rule when multiple ranks exist', () => {
    assert.match(postCss, /\.prose:not\(:has\(\.article-heading-rank-2\)\) \.article-heading-rank-1::after,\s*\.prose \.article-heading-rank-2::after\s*\{/);
    assert.doesNotMatch(postCss, /\.prose \.article-heading::after\s*\{/);
    assert.doesNotMatch(postCss, /\.prose \.article-heading-depth-1::after/);
    assert.doesNotMatch(postCss, /\.prose \.article-heading-depth-2::after/);
    assert.match(postCss, /width:\s*100%;/);
    assert.match(postCss, /height:\s*2px;/);
    assert.match(postCss, /background:\s*var\(--article-heading-rule\);/);
});

test('single-rank articles keep a thick divider on their only heading level', () => {
    assert.match(postCss, /\.prose:not\(:has\(\.article-heading-rank-2\)\) \.article-heading-rank-1::after,\s*\.prose \.article-heading-rank-2::after\s*\{[\s\S]*height:\s*2px;/);
    assert.doesNotMatch(postCss, /\.prose \.article-heading-rank-1::after\s*\{[\s\S]*height:\s*2px;/);
    assert.doesNotMatch(postCss, /\.prose \.article-heading-rank-1::after,\s*\.prose \.article-heading-rank-2::after\s*\{[\s\S]*height:\s*1px;/);
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

test('Figtree uses generated subsets for regular, semi-bold, and extra-bold weights', () => {
    const figtreeFaces = [...headBase.matchAll(/@font-face\s*\{[\s\S]*?\}/g)]
        .map(match => match[0])
        .filter(block => block.includes('font-family: "Freecat Figtree"'));
    const weights = [
        ['regular', '400'],
        ['semi-bold', '600'],
        ['extra-bold', '800 1000']
    ];

    assert.equal(figtreeFaces.length, weights.length);
    for (const [name, weight] of weights) {
        const face = figtreeFaces.find(block => block.includes(`freecat-figtree-${name}-subset.woff2`)) || '';
        const subsetFont = path.join(__dirname, `../src/assets/fonts/freecat-figtree-${name}-subset.woff2`);
        const sourceFont = path.join(__dirname, `../fonts/freecat-figtree-${name}.ttf`);
        const fullAssetFont = path.join(__dirname, `../src/assets/fonts/freecat-figtree-${name}.ttf`);

        assert.match(face, new RegExp(`font-weight:\\s*${weight}`));
        assert.match(face, /font-display:\s*block/);
        assert.equal(fs.existsSync(sourceFont), true);
        assert.equal(fs.existsSync(subsetFont), true);
        assert.equal(fs.existsSync(fullAssetFont), false);
        assert.ok(fs.statSync(subsetFont).size < fs.statSync(sourceFont).size);
    }

    assert.equal(fs.existsSync(path.join(__dirname, '../src/assets/fonts/freecat-dm-sans-regular-subset.woff2')), false);
    assert.equal(fs.existsSync(path.join(__dirname, '../src/assets/fonts/freecat-dm-sans-medium-subset.woff2')), false);
    assert.equal(fs.existsSync(path.join(__dirname, '../src/assets/fonts/freecat-dm-sans-black-subset.woff2')), false);
    assert.equal(fs.existsSync(path.join(__dirname, '../src/assets/fonts/freecat-figtree-medium-subset.woff2')), false);
});

test('article Chinese font uses generated Noto Sans SC subsets for available weights', () => {
    const notoFaces = [...postCss.matchAll(/@font-face\s*\{[\s\S]*?\}/g)]
        .map(match => match[0])
        .filter(block => block.includes('font-family: "Freecat Noto Sans SC"'));
    const weights = [
        ['regular', '350 449'],
        ['medium', '450 549'],
        ['semi-bold', '550 649'],
        ['extra-bold', '750 849']
    ];
    const unusedWeights = ['thin', 'extra-light', 'light', 'bold', 'black'];

    assert.equal(notoFaces.length, weights.length);
    for (const [name, weight] of weights) {
        const face = notoFaces.find(block => block.includes(`freecat-noto-sans-sc-${name}-subset.woff2`)) || '';
        const subsetFont = path.join(__dirname, `../src/assets/fonts/freecat-noto-sans-sc-${name}-subset.woff2`);
        const fullAssetFont = path.join(__dirname, `../src/assets/fonts/freecat-noto-sans-sc-${name}.woff2`);

        assert.match(face, new RegExp(`font-weight:\\s*${weight}`));
        assert.doesNotMatch(face, /unicode-range/);
        assert.match(face, /font-display:\s*block/);
        assert.equal(fs.existsSync(subsetFont), true);
        assert.equal(fs.existsSync(fullAssetFont), false);
        assert.ok(fs.statSync(subsetFont).size < 1024 * 1024);
    }
    for (const name of unusedWeights) {
        assert.equal(notoFaces.some(block => block.includes(`freecat-noto-sans-sc-${name}-subset.woff2`)), false);
        assert.equal(fs.existsSync(path.join(__dirname, `../src/assets/fonts/freecat-noto-sans-sc-${name}-subset.woff2`)), false);
    }

    assert.deepEqual(preloadFontHrefs(postTemplate), [
        '/assets/fonts/freecat-figtree-regular-subset.woff2',
        '/assets/fonts/freecat-figtree-semi-bold-subset.woff2',
        '/assets/fonts/freecat-figtree-extra-bold-subset.woff2',
        '/assets/fonts/freecat-noto-sans-sc-regular-subset.woff2',
        '/assets/fonts/freecat-noto-sans-sc-medium-subset.woff2',
        '/assets/fonts/freecat-noto-sans-sc-semi-bold-subset.woff2',
        '/assets/fonts/freecat-noto-sans-sc-extra-bold-subset.woff2'
    ]);
});

test('article Chinese font weight ranges cover title and bold text rules', () => {
    assert.match(postCss, /\.post-title\s*\{[\s\S]*font-weight:\s*600\s*!important;/);
    assert.match(postCss, /\.prose \.article-heading\s*\{[\s\S]*font-weight:\s*600\s*!important;/);
    assert.match(postCss, /\.prose:has\(\.article-heading-rank-2\) \.article-heading-rank-1\s*\{[\s\S]*font-weight:\s*800\s*!important;/);
    assert.doesNotMatch(postCss, /\.prose:has\(\.article-heading-rank-2\) \.article-heading-rank-1\s*\{[\s\S]*font-weight:\s*700\s*!important;/);
    assert.match(postCss, /\.prose strong,\s*\.prose b\s*\{[\s\S]*font-weight:\s*760\s*!important;/);
    assert.match(postCss, /\.prose li>strong:first-child\s*\{[\s\S]*font-weight:\s*800\s*!important;/);
    assert.doesNotMatch(postCss, /\.prose strong\s*\{[\s\S]*font-weight:\s*700\s*!important;/);
    assert.doesNotMatch(postTemplate, /class="post-title[^"]*\bfont-black\b/);
    assert.doesNotMatch(postTemplate, /\bprose-strong:/);

    const notoFaces = [...postCss.matchAll(/@font-face\s*\{[\s\S]*?\}/g)]
        .map(match => match[0])
        .filter(block => block.includes('font-family: "Freecat Noto Sans SC"'));

    assert.equal(
        notoFaces.some(block => block.includes('freecat-noto-sans-sc-semi-bold-subset.woff2') && /font-weight:\s*550 649/.test(block)),
        true
    );
    assert.equal(
        notoFaces.some(block => block.includes('freecat-noto-sans-sc-extra-bold-subset.woff2') && /font-weight:\s*750 849/.test(block)),
        true
    );
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
    assert.doesNotMatch(postCss, /\.prose\.prose/);
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

test('nested article blockquotes stay quiet and aligned', () => {
    const finalQuoteRule = postCss.match(/\.prose blockquote\s*\{[\s\S]*?\}/)?.[0] || '';
    const nestedQuoteRule = postCss.match(/\.prose blockquote blockquote\s*\{[\s\S]*?\}/)?.[0] || '';
    const thirdLevelQuoteRule = postCss.match(/\.prose blockquote blockquote blockquote\s*\{[\s\S]*?\}/)?.[0] || '';

    assert.match(finalQuoteRule, /border-left:\s*2px solid #cbd5e1\s*!important;/);
    assert.match(finalQuoteRule, /background:\s*transparent\s*!important;/);
    assert.match(nestedQuoteRule, /margin-left:\s*0\.7em\s*!important;/);
    assert.match(nestedQuoteRule, /border-left-width:\s*1px\s*!important;/);
    assert.match(nestedQuoteRule, /background:\s*transparent\s*!important;/);
    assert.match(thirdLevelQuoteRule, /margin-left:\s*0\.65em\s*!important;/);
    assert.match(thirdLevelQuoteRule, /background:\s*transparent\s*!important;/);
    assert.doesNotMatch(nestedQuoteRule, /background(?:-color)?:\s*#(?:f1f5f9|e2e8f0|0f172a|0b1220)/);
});

test('mermaid diagrams use the official renderer and broad diagram styling', () => {
    const postPageJs = fs.readFileSync(path.join(__dirname, '../build/pages/post.js'), 'utf-8');

    assert.match(postPageJs, /cdn\.jsdelivr\.net\/npm\/mermaid@11\.15\.0\/dist\/mermaid\.min\.js/);
    assert.doesNotMatch(postPageJs, /vditor@/);
    assert.match(postJs, /window\.mermaid\.run\(\{ nodes: mermaidBlocks \}\)/);
    assert.doesNotMatch(postJs, /function renderGanttBlock/);
    assert.doesNotMatch(postJs, /function buildGanttSvg/);
    assert.doesNotMatch(postCss, /\.freecat-gantt/);
    assert.match(postJs, /\^classDiagram\(\?:-v2\)\?\\b/);
    assert.match(postJs, /\^stateDiagram\(\?:-v2\)\?\\b/);
    assert.match(postJs, /\^erDiagram\\b/);
    assert.match(postJs, /\^mindmap\\b/);
    assert.match(postCss, /\.mermaid-block\[data-mermaid-kind="class"\]/);
    assert.match(postCss, /\.mermaid-block\[data-mermaid-kind="timeline"\]/);
});

test('markdown diagram blocks center rendered chart content', () => {
    const diagramBlockRule = postCss.match(/\.prose \.diagram-block\s*\{[\s\S]*?\}/)?.[0] || '';
    const diagramContentRule = postCss.match(/\.prose \.diagram-block > \.mermaid,[\s\S]*?\.prose \.diagram-block \.echarts-canvas\s*\{[\s\S]*?\}/)?.[0] || '';
    const diagramSvgRule = postCss.match(/\.prose \.diagram-block svg\s*\{[\s\S]*?\}/)?.[0] || '';

    assert.match(diagramBlockRule, /justify-content:\s*center;/);
    assert.match(diagramContentRule, /margin-inline:\s*auto\s*!important;/);
    assert.match(diagramSvgRule, /display:\s*block;/);
    assert.match(postCss, /\.prose [\s\S]*?\.diagram-block,[\s\S]*?\.katex-display/);
});

test('mermaid light theme avoids heavy sequence and gantt blocks', () => {
    const sequenceNumberBgRule = postCss.match(/\.mermaid-block \.freecat-mermaid-sequence-number-bg\s*\{[\s\S]*?\}/)?.[0] || '';
    const sequenceNumberRule = postCss.match(/\.mermaid-block \.freecat-mermaid-sequence-number\s*\{[\s\S]*?\}/)?.[0] || '';

    assert.match(postJs, /taskBkgColor:\s*isDark \? '#4b5563' : '#dce6f2'/);
    assert.match(postJs, /taskTextColor:\s*isDark \? '#ffffff' : '#233044'/);
    assert.match(postJs, /rect\.setAttribute\('class', 'freecat-mermaid-sequence-number-bg'\)/);
    assert.match(sequenceNumberBgRule, /fill:\s*#334155\s*!important;/);
    assert.match(sequenceNumberBgRule, /stroke:\s*none\s*!important;/);
    assert.match(sequenceNumberBgRule, /stroke-width:\s*0\s*!important;/);
    assert.match(sequenceNumberRule, /fill:\s*#ffffff\s*!important;/);
    assert.match(sequenceNumberRule, /stroke:\s*none\s*!important;/);
    assert.match(sequenceNumberRule, /stroke-width:\s*0\s*!important;/);
    assert.match(postCss, /\.mermaid-block\[data-mermaid-kind="gantt"\] \.task\s*\{[\s\S]*fill:\s*#dce6f2\s*!important;[\s\S]*stroke:\s*#9aa8bc\s*!important;/);
    assert.match(postCss, /\.mermaid-block\[data-mermaid-kind="gantt"\] \.taskText,[\s\S]*\.taskTextOutsideRight,[\s\S]*\.taskTextOutsideLeft\s*\{[\s\S]*fill:\s*#233044\s*!important;/);
});

test('fixed header has a stable css height before runtime measurement', () => {
    assert.match(transitionsCss, /header\.fixed\s*\{[\s\S]*height:\s*var\(--freecat-header-height\);/);
    assert.match(transitionsCss, /header\.fixed\s+\.header-blur-target\s*\{[\s\S]*height:\s*100%;/);
    assert.doesNotMatch(transitionsCss, /(?:^|\n)header\s*\{[\s\S]*height:\s*var\(--freecat-header-height\);/);
});

test('root scroller disables browser scroll anchoring during async layout changes', () => {
    assert.match(transitionsCss, /html\s*\{[\s\S]*overflow-anchor:\s*none;/);
});

test('floating nav hides when it touches visible content blocks including toc', () => {
    assert.match(mainJs, /function touchesVisibleContentEdge\(\)/);
    assert.match(mainJs, /\.freecat-post-toc-panel/);
    assert.match(mainJs, /rectsTouch\(panelRect,\s*targetRect\)/);
    assert.match(mainJs, /window\.addEventListener\('scroll',\s*scheduleFloatingNavLayout,\s*\{\s*passive:\s*true\s*\}\)/);
});

test('code folding uses a smooth height transition with fading mask cleanup', () => {
    const codeContentRule = postCss.match(/\.prose \.code-content\s*\{[\s\S]*?\n\}/)?.[0] || '';
    const codeMaskRule = postCss.match(/\.prose \.code-content::after\s*\{[\s\S]*?\n\}/)?.[0] || '';
    const collapsedMaskRule = postCss.match(/\.prose \.collapsed-code \.code-content::after\s*\{[\s\S]*?\n\}/)?.[0] || '';
    const openingControlsRule = postCss.match(/\.prose \.code-fold-controls\.code-controls-opening\s*\{[\s\S]*?\n\}/)?.[0] || '';
    const reducedMotionRule = postCss.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\.prose \.fold-toggle-btn[\s\S]*?\n\}/)?.[0] || '';

    assert.match(postJs, /var CODE_FOLD_TRANSITION_MS = 420;/);
    assert.match(postJs, /setTimeout\(finish, CODE_FOLD_TRANSITION_MS \+ 80\);/);
    assert.match(postJs, /function settleCollapsedCodeHeight\(content, container\)/);
    assert.match(postJs, /foldContainer\.classList\.add\('code-collapsing'\)/);
    assert.match(postJs, /container\.classList\.remove\('code-collapsing'\)/);
    assert.match(postJs, /var content = block\.querySelector\('\.code-content'\);/);
    assert.match(postJs, /var contentRect = content \? content\.getBoundingClientRect\(\) : wrapperRect;/);
    assert.match(postJs, /\? contentRect\.top \+ finalContentHeight\s*:\s*contentRect\.bottom;/);
    assert.match(postJs, /if \(mode === 'pinned-bottom'\) \{\s*top = Math\.max\(minTop, maxBottom - controlsHeight\);/);
    assert.doesNotMatch(postJs, /if \(openingTarget\.mode === 'pinned-bottom'\) \{[\s\S]*?controls\.classList\.add\('code-controls-pinned-bottom'\);[\s\S]*?controls\.style\.removeProperty\('--code-controls-top'\);[\s\S]*?\} else \{/);
    assert.match(postJs, /controls\.classList\.remove\('code-controls-pinned-bottom'\);[\s\S]*controls\.classList\.add\('code-controls-opening'\);/);
    assert.match(codeContentRule, /--code-fold-duration:\s*420ms;/);
    assert.match(codeContentRule, /--code-fold-ease:\s*cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\);/);
    assert.match(codeContentRule, /max-height var\(--code-fold-duration\) var\(--code-fold-ease\)/);
    assert.doesNotMatch(codeContentRule, /padding-bottom\s+\d+ms/);
    assert.match(codeMaskRule, /opacity:\s*0;/);
    assert.match(codeMaskRule, /transition:\s*opacity 260ms cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\);/);
    assert.match(collapsedMaskRule, /opacity:\s*1;/);
    assert.match(openingControlsRule, /top 420ms cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)/);
    assert.match(reducedMotionRule, /transition:\s*none !important;/);
});

test('history navigation restores saved scroll positions after bfcache expires', () => {
    assert.match(mainJs, /function initScrollPositionMemory\(\)/);
    assert.match(mainJs, /sessionStorage\.setItem\(storageKey,\s*JSON\.stringify\(positions\)\)/);
    assert.match(mainJs, /getNavigationType\(\)\s*===\s*'back_forward'/);
    assert.match(mainJs, /window\.addEventListener\('pagehide',\s*saveScrollPosition\)/);
    assert.match(mainJs, /if \(window\.location\.hash\) return;/);
    assert.match(mainJs, /initScrollPositionMemory\(\);/);
});

test('go back preserves the update sort switch state in history entries', () => {
    assert.match(mainJs, /const updateSortParam = 'updateSort';/);
    assert.match(mainJs, /params\.get\(updateSortParam\)\s*===\s*updateSortValue/);
    assert.match(mainJs, /window\.FreecatSyncUpdateSortUrl = syncUpdateSortUrl;/);
    assert.match(mainJs, /syncCurrentHistoryEntry\(\);[\s\S]*window\.history\.back\(\);/);
    assert.match(mainJs, /url\.searchParams\.set\('updateSort',\s*'modified'\);/);
    assert.match(mainJs, /initDeferredImages\(\);\s*initUpdateSortControls\(\);/);
});

test('post cards render the audio glyph for music-prefixed excerpts', () => {
    const html = postCardTemplate.renderPostCard({
        link: '/posts/example/',
        titleHtml: 'Example',
        excerptHtml: '🎶 这是一篇带音频的文章摘要',
        date: '2026-05-30'
    });

    assert.equal(html.includes('class="post-card-media-icon'), true);
    assert.equal(html.includes('M4 12H7C8.10457 12 9 12.8954 9 14V19'), true);
    assert.equal(html.includes('🎶'), false);
    assert.equal(html.includes('这是一篇带音频的文章摘要'), true);
});

test('post cards render the video glyph for film-prefixed excerpts', () => {
    const html = postCardTemplate.renderPostCard({
        link: '/posts/example/',
        titleHtml: 'Example',
        excerptHtml: '🎬 这是一篇带视频的文章摘要',
        date: '2026-05-30'
    });

    assert.equal(html.includes('class="post-card-media-icon'), true);
    assert.equal(html.includes('M12 22C6.47715 22 2 17.5228 2 12'), true);
    assert.equal(html.includes('🎬'), false);
    assert.equal(html.includes('这是一篇带视频的文章摘要'), true);
});

test('post cards without a media prefix render no media glyph', () => {
    const html = postCardTemplate.renderPostCard({
        link: '/posts/example/',
        titleHtml: 'Example',
        excerptHtml: '普通文章摘要，没有音视频',
        date: '2026-05-30'
    });

    assert.equal(html.includes('post-card-media-icon'), false);
    assert.equal(html.includes('普通文章摘要，没有音视频'), true);
});
