const test = require('node:test');
const assert = require('node:assert/strict');
const {
    fs,
    path,
    readProjectFile,
    postJs,
    postCss,
    postCodeCss,
    mainJs,
    codeCopyJs,
    codeFoldingJs,
    floatingNavJs,
    runtimeJs,
    scrollMemoryJs,
    navAudioJs,
    shellRouterJs,
    typographyCss,
    themeSystemJs,
    postTemplate,
    indexTemplate,
    searchTemplate,
    headBase,
    scriptsEnd,
    header,
    homeSidebar,
    transitionsCss,
    allTemplate,
    updateSortControl,
    aboutTemplate,
    notFoundTemplate,
    buildJs,
    paginationJs,
    seoJs,
    tailwindBuild,
    fontsJs,
    mediaPlayerJs,
    mediaPlayerCss,
    videoPlayerJs,
    videoPlayerCss,
    shared,
    postCardTemplate,
    renderPostFontPreloads,
    renderPostFontFaceCss,
    renderPostCardForList,
    generatePaginationHtml,
    preloadFontHrefs,
    fontFaceSrcUrls
} = require('../test-support/assets.js');

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

test('post cards omit image markup when no real cover is provided', () => {
    const html = postCardTemplate.renderPostCard({
        link: '/posts/example.html',
        titleHtml: 'Example',
        excerptHtml: 'Example excerpt',
        date: '2026-05-30',
        cover: '',
        coverPlaceholder: true
    });

    assert.match(html, /class="post-card post-card-layout-compact-grid has-no-cover\b/);
    assert.doesNotMatch(html, /<img\b/);
    assert.doesNotMatch(html, /data-src="\/image\/404\.png"/);
    assert.doesNotMatch(html, /lazy-image-frame mt-8/);
    assert.doesNotMatch(html, /lazy-image-frame col-start-2 row-start-1/);
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
    assert.match(headBase, /freecat-ui-noto-sans-sc-regular-subset\.woff2/);
    assert.match(headBase, /font-family:\s*"Freecat Tag Noto Sans SC"/);
    assert.match(headBase, /freecat-ui-noto-sans-sc-medium-subset\.woff2/);
    assert.match(headBase, /freecat-ui-noto-sans-sc-semi-bold-subset\.woff2/);
    assert.match(headBase, /font-family:\s*"Freecat Post Card Noto Sans SC"/);
    assert.match(headBase, /freecat-ui-noto-sans-sc-extra-bold-subset\.woff2/);
    assert.match(headBase, /href="\/assets\/typography\.css"/);
    assert.match(postTemplate, /href="\/assets\/typography\.css"/);
    assert.match(typographyCss, /\.post-card-title\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Post Card Noto Sans SC"/);
    assert.doesNotMatch(typographyCss, /\.post-card-title-line\s*\{/);
    assert.match(typographyCss, /\.post-card-excerpt\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"/);
    assert.match(typographyCss, /\.post-card-excerpt\s*\{[\s\S]*font-weight:\s*400;/);
    assert.match(typographyCss, /\.freecat-date-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree"/);
    assert.match(typographyCss, /\.freecat-published-date-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree"[\s\S]*font-weight:\s*600;/);
    assert.match(typographyCss, /\.freecat-tag-text\s*\{[\s\S]*font-family:\s*"Freecat Tag Figtree",\s*"Freecat Tag Noto Sans SC"[\s\S]*font-weight:\s*500;/);
    assert.match(typographyCss, /\.tags-fit\s*\{[\s\S]*max-width:\s*100%;[\s\S]*overflow:\s*hidden;/);
    assert.match(typographyCss, /\.tags-fit-inner\s*\{[\s\S]*width:\s*max-content;[\s\S]*transform-origin:\s*left center;/);
    assert.match(typographyCss, /\.tags-fit-inner \.freecat-tag-text\s*\{[\s\S]*flex:\s*0 0 auto;/);
    assert.match(mainJs, /const inner = container\.querySelector\('\.tags-fit-inner'\) \|\| container;/);
    assert.match(mainJs, /container\.style\.width = '';/);
    assert.match(mainJs, /const available = container\.clientWidth;/);
    assert.match(mainJs, /inner\.style\.transform = `scale\(\$\{scale\}\)`;/);
    assert.match(mainJs, /window\.addEventListener\('resize',\s*fitTagRows,\s*\{\s*passive:\s*true\s*\}\);/);
    assert.match(readProjectFile('shared', 'post-card-template.js'), /flex-nowrap items-center gap-x-3\.5/);
    assert.match(typographyCss, /\.freecat-nav-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree"[\s\S]*font-weight:\s*600;/);
    assert.match(typographyCss, /\.freecat-go-back-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree"[\s\S]*font-weight:\s*800;/);
    assert.match(typographyCss, /\.freecat-search-input\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*400;/);
    assert.match(typographyCss, /\.freecat-update-sort-label\s*\{[\s\S]*font-family:\s*"Freecat Tag Noto Sans SC",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*500;/);
    assert.match(typographyCss, /\.freecat-brand-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*800;/);
    assert.match(typographyCss, /\.freecat-footer-copyright\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*400;/);
    assert.doesNotMatch(postCss, /\.freecat-date-text\s*\{/);
    assert.doesNotMatch(postCss, /\.freecat-published-date-text\s*\{/);
    assert.doesNotMatch(postCss, /\.freecat-tag-text\s*\{/);
    assert.doesNotMatch(postCss, /\.freecat-nav-text\s*\{/);
    assert.doesNotMatch(postCss, /\.freecat-go-back-text\s*\{/);
    assert.doesNotMatch(postCss, /\.freecat-search-input\s*\{/);
    assert.doesNotMatch(postCss, /\.freecat-brand-text\s*\{/);
    assert.doesNotMatch(postCss, /\.freecat-footer-copyright\s*\{/);
    assert.match(fontsJs, /iterUiHtmlFiles/);
    assert.match(fontsJs, /iterPostPages/);
    assert.match(fontsJs, /FIGTREE_FONT_WEIGHTS/);
    assert.doesNotMatch(fontsJs, /PUBLISHED_DATE_CODEPOINTS/);
    assert.match(postTemplate, /<!-- POST_FONT_PRELOADS -->/);
    assert.match(postTemplate, /<!-- POST_FONT_FACE_CSS -->/);
    assert.doesNotMatch(postCss, /freecat-noto-sans-sc-regular-subset\.woff2/);

    assert.equal((html.match(/<p class="post-card-excerpt\b/g) || []).length, 2);
    assert.equal((html.match(/class="post-card-title(?:\s|")/g) || []).length, 2);
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
    assert.match(typographyCss, /\.freecat-sidebar-slogan,\s*\.freecat-about-title\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*800;/);
    assert.match(typographyCss, /\.freecat-sidebar-description,\s*\.freecat-sidebar-recent-link,\s*\.freecat-about-description\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*400;/);
    assert.match(typographyCss, /\.freecat-sidebar-recent-heading\s*\{[\s\S]*font-family:\s*"Freecat Figtree"[\s\S]*font-weight:\s*800;/);

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

test('about social links follow the home sidebar reveal rhythm', () => {
    assert.match(transitionsCss, /\.freecat-about-social > a\s*\{[\s\S]*animation-delay:\s*calc\(150ms \+ \(var\(--freecat-social-index,\s*0\) \* 50ms\)\);/);
    assert.doesNotMatch(transitionsCss, /\.freecat-about-social > a\s*\{[\s\S]*animation-delay:\s*calc\(380ms/);
    assert.match(aboutTemplate, /class="freecat-about-social[^"]*\bmt-8\b[^"]*\bmd:mt-10\b/);
    assert.doesNotMatch(aboutTemplate, /class="freecat-about-social[^"]*\bmt-10\b[^"]*\bmd:mt-14\b/);
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
    assert.match(allTemplate, /class="[^"]*\bfreecat-list-toolbar\b/);
    assert.match(searchTemplate, /class="[^"]*\bfreecat-list-toolbar\b/);
    assert.match(transitionsCss, /@media \(max-width: 480px\)\s*\{[\s\S]*\.freecat-list-toolbar\s*\{[\s\S]*margin-bottom:\s*1\.25rem\s*!important;[\s\S]*padding-top:\s*0\.5rem\s*!important;[\s\S]*padding-bottom:\s*0\.75rem\s*!important;/);
    assert.match(transitionsCss, /@media \(max-width: 480px\)\s*\{[\s\S]*\.freecat-list-toolbar \[data-update-sort-controls\]\s*\{[\s\S]*flex-wrap:\s*nowrap\s*!important;/);
    assert.doesNotMatch(allTemplate, /\.freecat-all-page \[data-all-toolbar\]\s*\{/);
    assert.doesNotMatch(updateSortControl, /<span>按更新排序<\/span>/);
});

test('default mobile post cards use the all-page card shell', () => {
    const dateValue = {
        tz: () => ({ format: () => '2026-05-30' }),
        valueOf: () => 1780135781000
    };
    const modifiedDateValue = {
        tz: () => ({ format: () => '2026-05-31' }),
        valueOf: () => 1780222181000
    };
    const html = renderPostCardForList({
        link: '/posts/example.html',
        title: 'Example',
        excerpt: 'Example excerpt',
        cover: '/image/example.png',
        date: dateValue,
        modifiedDate: modifiedDateValue,
        tag: ['Free']
    });

    assert.match(html, /class="post-card post-card-layout-compact-grid has-cover tags-inline-mobile animate-fade-in-up block h-full min-w-0 lg:mb-10/);
    assert.match(html, /post-card[^"]*\btags-inline-mobile\b/);
    assert.equal(html.indexOf('<span>2026-05-31</span>') < html.indexOf('Free'), true);
    assert.match(html, /lazy-image-frame mt-4 h-\[clamp\(11\.25rem,14\.5vw,13\.25rem\)\] max-\[480px\]:h-\[11\.5rem\]/);
    assert.doesNotMatch(html, /\bmb-8\b/);
    assert.doesNotMatch(html, /\bmd:mb-10\b/);
});

test('desktop home card uses safe single-line titles for seven-line previews', () => {
    const dateValue = {
        tz: () => ({ format: () => '2026-05-30' }),
        valueOf: () => 1780135781000
    };
    const modifiedDateValue = {
        tz: () => ({ format: () => '2026-05-31' }),
        valueOf: () => 1780222181000
    };
    const basePost = {
        link: '/posts/example.html',
        excerpt: 'Example excerpt '.repeat(20),
        cover: '/image/example.png',
        date: dateValue,
        modifiedDate: modifiedDateValue,
        tag: ['Free']
    };

    const shortTitleHtml = renderPostCardForList({
        ...basePost,
        title: '为什么坐月子是陋习'
    });
    const nearEdgeHtml = renderPostCardForList({
        ...basePost,
        title: 'ChatGPT image 2.0 视觉指南'
    });
    const longTitleHtml = renderPostCardForList({
        ...basePost,
        title: 'Freecat Blog 免费博客构建指南 | 本地写作 + GitHub 备份 + 免费部署'
    });

    for (const html of [shortTitleHtml, nearEdgeHtml, longTitleHtml]) {
        assert.match(html, /<div class="post-card-default-desktop-panel\b/);
        assert.match(html, /<div class="post-card-default-desktop-grid">/);
        assert.match(html, /<div class="post-card-default-desktop-copy">/);
        assert.match(html, /<div class="post-card-default-desktop-footer\b/);
        assert.equal(html.includes('lg:h-[430px]'), false);
        assert.doesNotMatch(html, /post-card-title-line/);
        assert.match(html, /<p class="post-card-excerpt mt-5[^"]*"/);
    }

    assert.match(typographyCss, /\.post-card-default-desktop-panel\s*\{[\s\S]*display:\s*none;/);
    assert.match(typographyCss, /@media \(min-width:\s*1024px\)\s*\{[\s\S]*\.post-card-default-desktop-panel\s*\{[\s\S]*height:\s*430px;[\s\S]*padding:\s*3rem 4rem;/);
    assert.match(typographyCss, /\.post-card\.has-cover \.post-card-default-desktop-grid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\) minmax\(360px,\s*43%\);/);

    assert.match(shortTitleHtml, /<h3 class="post-card-title[^"]*" style="[^"]*white-space:nowrap;[^"]*">为什么坐月子是陋习<\/h3>/);
    assert.match(shortTitleHtml, /<p class="post-card-excerpt mt-5[^"]*" style="[^"]*-webkit-line-clamp:7/);

    assert.match(nearEdgeHtml, /<h3 class="post-card-title[^"]*" style="[^"]*-webkit-line-clamp:2[^"]*">ChatGPT image 2\.0 视觉指南<\/h3>/);
    assert.match(nearEdgeHtml, /<p class="post-card-excerpt mt-5[^"]*" style="[^"]*-webkit-line-clamp:5/);

    assert.match(longTitleHtml, /<h3 class="post-card-title[^"]*" style="[^"]*-webkit-line-clamp:2[^"]*">Freecat Blog 免费博客构建指南/);
    assert.match(longTitleHtml, /<p class="post-card-excerpt mt-5[^"]*" style="[^"]*-webkit-line-clamp:5/);
    assert.doesNotMatch(longTitleHtml, /row-start-1[^>]+-webkit-line-clamp:7/);
});

test('pinned post cards render the pin badge in every card layout', () => {
    const defaultHtml = postCardTemplate.renderPostCard({
        link: '/posts/pinned.html',
        titleHtml: 'Pinned',
        excerptHtml: 'Pinned excerpt',
        date: '2026-05-30',
        pinned: true
    });
    const compactHtml = postCardTemplate.renderPostCard({
        link: '/posts/pinned.html',
        titleHtml: 'Pinned',
        excerptHtml: 'Pinned excerpt',
        date: '2026-05-30',
        pinned: true,
        layout: 'compact-grid'
    });
    const normalHtml = postCardTemplate.renderPostCard({
        link: '/posts/normal.html',
        titleHtml: 'Normal',
        excerptHtml: 'Normal excerpt',
        date: '2026-05-30',
        pinned: false
    });

    assert.equal((defaultHtml.match(/post-card-pinned-badge/g) || []).length, 2);
    assert.match(defaultHtml, /lg:hidden[\s\S]*post-card-pinned-badge[\s\S]*lg:block[\s\S]*post-card-pinned-badge/);
    assert.match(defaultHtml, /\bpost-card-pinned animate-fade-in-up\b/);
    assert.match(defaultHtml, /post-card-pinned-badge absolute -top-2 -left-2 md:-top-3 md:-left-3\b/);
    assert.doesNotMatch(defaultHtml, /post-card-pinned-badge absolute top-0 left-0\b/);
    assert.equal((compactHtml.match(/post-card-pinned-badge/g) || []).length, 1);
    assert.match(compactHtml, /\bpost-card-pinned animate-fade-in-up\b/);
    assert.equal(compactHtml.includes('data-sort-pinned="1"'), true);
    assert.equal(normalHtml.includes('post-card-pinned-badge'), false);
    assert.doesNotMatch(normalHtml, /\bpost-card-pinned animate-fade-in-up\b/);
    assert.match(typographyCss, /\.freecat-post-card-list\s*\{[\s\S]*--freecat-post-card-pin-overhang:\s*0\.5rem;[\s\S]*--freecat-post-card-mobile-height:\s*27rem;[\s\S]*padding-top:\s*var\(--freecat-post-card-pin-overhang\);[\s\S]*width:\s*calc\(100% \+ var\(--freecat-post-card-pin-overhang\)\);[\s\S]*overflow:\s*visible;/);
    assert.match(typographyCss, /@media \(min-width:\s*768px\)\s*\{[\s\S]*\.freecat-post-card-list\s*\{[\s\S]*--freecat-post-card-pin-overhang:\s*0\.75rem;/);
    assert.match(typographyCss, /@media \(max-width:\s*1023px\)\s*\{[\s\S]*\.freecat-post-card-list\s*\{[\s\S]*display:\s*grid;[\s\S]*grid-auto-rows:\s*var\(--freecat-post-card-mobile-height\);[\s\S]*row-gap:\s*1\.25rem;/);
    assert.match(typographyCss, /\.freecat-post-card-list \.post-card\s*\{[\s\S]*height:\s*var\(--freecat-post-card-mobile-height\);/);
    assert.match(typographyCss, /\.freecat-post-card-list \.post-card\.has-cover \.lazy-image-frame\s*\{[\s\S]*flex:\s*1 1 auto;[\s\S]*height:\s*auto;[\s\S]*min-height:\s*0;/);
    assert.match(typographyCss, /\.freecat-post-card-list \.post-card\.has-cover \.post-card-excerpt-lines-4\s*\{[\s\S]*min-height:\s*88px;/);
    assert.doesNotMatch(typographyCss, /\.post-card-pinned\s*\{[\s\S]*box-sizing:\s*content-box;/);
});

test('home mobile hero uses safe side padding instead of a fixed text width', () => {
    const homeLayoutStyle = readProjectFile('src/partials/home-layout-style.html');
    const balancedTitleIndex = homeLayoutStyle.indexOf('text-wrap: balance;');
    const subtitleWrapIndex = homeLayoutStyle.lastIndexOf('.freecat-home-sidebar-hero-text h2');

    assert.match(homeLayoutStyle, /--freecat-mobile-hero-safe-inline:\s*clamp\(20px,\s*5vw,\s*36px\);/);
    assert.match(homeLayoutStyle, /\.freecat-home-sidebar\s*\{[\s\S]*padding:\s*calc\(var\(--freecat-page-top-offset,\s*96px\) \+ 12px\) var\(--freecat-mobile-hero-safe-inline\) clamp\(8px,\s*2vw,\s*14px\);/);
    assert.match(homeLayoutStyle, /\.freecat-home-sidebar-hero-text\s*\{[\s\S]*width:\s*100%;[\s\S]*max-width:\s*none;[\s\S]*margin-inline:\s*auto;/);
    assert.equal(balancedTitleIndex > -1, true);
    assert.equal(subtitleWrapIndex > balancedTitleIndex, true);
    assert.match(homeLayoutStyle.slice(subtitleWrapIndex), /\.freecat-home-sidebar-hero-text h2\s*\{[\s\S]*text-wrap:\s*wrap;/);
    assert.doesNotMatch(homeLayoutStyle, /max-width:\s*min\(100%,\s*19rem\)/);
});

test('home and search mobile lists use the all-page single-column card gap with a home boundary gap', () => {
    const homeLayoutStyle = readProjectFile('src/partials/home-layout-style.html');

    assert.match(homeLayoutStyle, /\.freecat-home-posts\s*\{[\s\S]*padding:\s*clamp\(12px,\s*3\.5vw,\s*18px\) 0\.875rem 48px;/);
    assert.match(homeLayoutStyle, /\.freecat-home-posts #posts-list,\s*\.freecat-home-posts #search-results\s*\{[\s\S]*display:\s*grid;[\s\S]*grid-template-columns:\s*1fr;[\s\S]*row-gap:\s*1\.25rem;/);
    assert.match(indexTemplate, /<div id="posts-list" class="freecat-post-card-list">/);
    assert.match(searchTemplate, /<div id="search-results" class="freecat-post-card-list">/);
});

test('home, all and search cards share the all-page mobile card contract', () => {
    assert.deepEqual(postCardTemplate.ALL_PAGE_MOBILE_CARD_OPTIONS, {
        mobileTagsInline: true
    });
    assert.match(readProjectFile('build', 'pages', 'index.js'), /const \{ ALL_PAGE_MOBILE_CARD_OPTIONS \} = postCardTemplate;/);
    assert.match(readProjectFile('build', 'pages', 'index.js'), /mobileTagsInline:\s*ALL_PAGE_MOBILE_CARD_OPTIONS\.mobileTagsInline/);
    assert.match(readProjectFile('build', 'pages', 'all.js'), /\.\.\.postCardTemplate\.ALL_PAGE_MOBILE_CARD_OPTIONS/);
    assert.match(readProjectFile('src', 'assets', 'search-core.js'), /postCardTemplate\.ALL_PAGE_MOBILE_CARD_OPTIONS/);
    assert.doesNotMatch(readProjectFile('src', 'assets', 'search-core.js'), /ALL_PAGE_MOBILE_CARD_OPTIONS\s*\|\|/);
    assert.match(readProjectFile('shared', 'post-card-template.js'), /function renderAllPageMobileCardInner/);
});

test('all page compact cards keep mobile height and desktop cover area stable', () => {
    assert.match(allTemplate, /<div id="posts-list" class="freecat-post-card-list">/);
    assert.match(allTemplate, /\.freecat-all-page #posts-list\s*\{[\s\S]*--freecat-all-card-height:\s*27rem;[\s\S]*grid-auto-rows:\s*var\(--freecat-all-card-height\);/);
    assert.match(allTemplate, /\.freecat-all-page #posts-list \.post-card\s*\{[\s\S]*height:\s*var\(--freecat-all-card-height\);/);
    assert.match(allTemplate, /\.freecat-all-page #posts-list \.post-card > div\s*\{[\s\S]*height:\s*100%;/);
    assert.match(allTemplate, /\.freecat-all-page #posts-list \.post-card\.has-cover \.lazy-image-frame\s*\{[\s\S]*flex:\s*1 1 auto;[\s\S]*height:\s*auto;[\s\S]*min-height:\s*0;/);
    assert.match(allTemplate, /\.freecat-all-page #posts-list \.post-card\.has-cover \.post-card-excerpt-lines-4\s*\{[\s\S]*min-height:\s*88px;/);
    assert.match(allTemplate, /@media \(min-width:\s*1024px\)\s*\{[\s\S]*\.freecat-all-page #posts-list\s*\{[\s\S]*--freecat-all-card-height:\s*clamp\(31rem,\s*30vw,\s*32rem\);[\s\S]*grid-auto-rows:\s*var\(--freecat-all-card-height\);/);
    assert.match(allTemplate, /@media \(min-width:\s*1024px\)\s*\{[\s\S]*\.freecat-all-page #posts-list \.post-card,[\s\S]*\.freecat-all-page #posts-list \.post-card > div\s*\{[\s\S]*height:\s*var\(--freecat-all-card-height\);/);
    assert.doesNotMatch(allTemplate, /@media \(min-width:\s*1024px\)\s*\{[\s\S]*grid-auto-rows:\s*auto;/);
    assert.doesNotMatch(allTemplate, /--freecat-all-cover-excerpt-height/);
    assert.match(allTemplate, /@media \(min-width:\s*1024px\)\s*\{[\s\S]*\.freecat-all-page #posts-list \.post-card > div\s*\{[\s\S]*justify-content:\s*flex-start;/);
    assert.match(allTemplate, /@media \(min-width:\s*1024px\)\s*\{[\s\S]*\.freecat-all-page #posts-list \.post-card\.has-cover \.lazy-image-frame\s*\{[\s\S]*flex:\s*1 1 auto;[\s\S]*width:\s*100%;[\s\S]*height:\s*auto;[\s\S]*min-height:\s*0;/);
    assert.doesNotMatch(allTemplate, /\.freecat-all-page #posts-list \.post-card\.has-cover \.lazy-image-frame\s*\{[\s\S]*aspect-ratio:\s*16 \/ 9;/);
    assert.match(allTemplate, /@media \(min-width:\s*1024px\)\s*\{[\s\S]*\.freecat-all-page #posts-list \.post-card\.has-no-cover \.post-card-excerpt-lines-13\s*\{[\s\S]*-webkit-line-clamp:\s*16;[\s\S]*max-height:\s*352px;/);
    assert.doesNotMatch(allTemplate, /\.post-card\.has-no-cover \.post-card-excerpt-lines-13\s*\{[\s\S]*max-height:\s*none;/);
    assert.doesNotMatch(allTemplate, /\.post-card\.has-no-cover \.post-card-excerpt-lines-13\s*\{[\s\S]*min-height:\s*calc/);
});

test('pagination text uses requested regular and active font weights', () => {
    const html = generatePaginationHtml(1, 2);

    assert.match(typographyCss, /\.freecat-pagination-text\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*400;[\s\S]*font-variant-numeric:\s*normal;[\s\S]*font-feature-settings:\s*normal;/);
    assert.match(typographyCss, /\.freecat-pagination-strong\s*\{[\s\S]*font-family:\s*"Freecat Figtree"[\s\S]*font-weight:\s*800;[\s\S]*font-variant-numeric:\s*normal;[\s\S]*font-feature-settings:\s*normal;/);
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
        postCodeCss,
        mainJs,
        codeCopyJs,
        codeFoldingJs,
        floatingNavJs,
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
        '/assets/fonts/freecat-ui-noto-sans-sc-regular-subset.woff2',
        '/assets/fonts/freecat-ui-noto-sans-sc-medium-subset.woff2',
        '/assets/fonts/freecat-ui-noto-sans-sc-semi-bold-subset.woff2',
        '/assets/fonts/freecat-ui-noto-sans-sc-extra-bold-subset.woff2'
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

test('post font preloads and font faces use the same versioned urls', () => {
    const postId = '2026053115300001';
    const preloads = new Set(preloadFontHrefs(renderPostFontPreloads(postId, 'test-version')));
    const fontFaces = new Set(fontFaceSrcUrls(renderPostFontFaceCss(postId, 'test-version')));

    assert.deepEqual(preloads, fontFaces);
    assert.equal([...preloads].every(href => href.endsWith('?v=test-version')), true);
});

test('all-page compact cards use shared native excerpt ellipsis by cover state', () => {
    const excerpt = 'Long excerpt '.repeat(40);
    const withCoverHtml = postCardTemplate.renderPostCard({
        link: '/posts/example.html',
        titleHtml: 'Example',
        excerptHtml: excerpt,
        date: '2026-05-30',
        cover: '/image/example.png',
        layout: 'compact-grid'
    });
    const withoutCoverHtml = postCardTemplate.renderPostCard({
        link: '/posts/plain.html',
        titleHtml: 'Plain',
        excerptHtml: excerpt,
        date: '2026-05-30',
        layout: 'compact-grid'
    });

    assert.match(withCoverHtml, /\bpost-card-excerpt-limited\b/);
    assert.match(withoutCoverHtml, /\bpost-card-excerpt-limited\b/);
    assert.match(withCoverHtml, /\bpost-card-excerpt-lines-4\b/);
    assert.doesNotMatch(withCoverHtml, /\bpost-card-excerpt-lines-2\b/);
    assert.match(withoutCoverHtml, /\bpost-card-excerpt-lines-13\b/);
    assert.doesNotMatch(withoutCoverHtml, /\bpost-card-excerpt-lines-16\b/);
    assert.doesNotMatch(withoutCoverHtml, /\bpost-card-excerpt-lines-9\b/);
    assert.doesNotMatch(withCoverHtml, /class="post-card-excerpt-line"/);
    assert.doesNotMatch(withoutCoverHtml, /class="post-card-excerpt-line"/);
    assert.doesNotMatch(withCoverHtml, /<p class="post-card-excerpt[^"]*" style=/);
    assert.doesNotMatch(withoutCoverHtml, /<p class="post-card-excerpt[^"]*" style=/);
    assert.equal(withCoverHtml.includes(excerpt), true);
    assert.equal(withoutCoverHtml.includes(excerpt), true);
    assert.match(typographyCss, /\.post-card-excerpt-limited\s*\{[\s\S]*-webkit-box-orient:\s*vertical;[\s\S]*text-overflow:\s*ellipsis;[\s\S]*line-height:\s*22px;/);
    assert.doesNotMatch(typographyCss, /\.post-card-excerpt-limited::before/);
    assert.doesNotMatch(typographyCss, /\.post-card-excerpt-limited::after/);
    assert.match(typographyCss, /\.post-card-excerpt-lines-4\s*\{[\s\S]*-webkit-line-clamp:\s*4;[\s\S]*max-height:\s*88px;/);
    assert.doesNotMatch(typographyCss, /\.post-card-excerpt-lines-2\b/);
    assert.match(typographyCss, /\.post-card-excerpt-lines-13\s*\{[\s\S]*-webkit-line-clamp:\s*13;[\s\S]*max-height:\s*286px;/);
    assert.doesNotMatch(typographyCss, /\.post-card-excerpt-lines-16\b/);
    assert.doesNotMatch(typographyCss, /\.post-card-excerpt-lines-9\b/);
    assert.doesNotMatch(withCoverHtml, /data-excerpt-overflow/);
    assert.doesNotMatch(withoutCoverHtml, /data-excerpt-overflow/);
    assert.doesNotMatch(headBase, /post-card-excerpt-clamp/);
});

test('mobile no-cover compact cards use thirteen excerpt rows by default', () => {
    const post = {
        title: 'Plain',
        preview: 'Long excerpt '.repeat(60),
        excerpt: 'Long excerpt '.repeat(60),
        date: { tz: () => ({ format: () => '2026-05-30' }), valueOf: () => 1 },
        modifiedDate: { tz: () => ({ format: () => '2026-05-31' }), valueOf: () => 2 },
        tags: [],
        link: '/posts/plain/',
        cover: ''
    };
    const html = renderPostCardForList(post, 0, {
        layout: 'compact-grid'
    });
    const coveredHtml = renderPostCardForList({
        ...post,
        cover: '/image/example.png'
    }, 0, {
        layout: 'compact-grid'
    });

    assert.match(html, /\bpost-card-excerpt-lines-13\b/);
    assert.doesNotMatch(html, /\bpost-card-excerpt-lines-9\b/);
    assert.doesNotMatch(html, /\bpost-card-excerpt-lines-16\b/);
    assert.doesNotMatch(coveredHtml, /\bpost-card-excerpt-lines-13\b/);
    assert.doesNotMatch(readProjectFile('build', 'pages', 'all.js'), /compactNoCoverExcerptLines/);
    assert.doesNotMatch(readProjectFile('build', 'pages', 'index.js'), /compactNoCoverExcerptLines/);
});

test('mobile no-cover compact excerpts keep full text under a thirteen-row cap', () => {
    const excerpt = Array.from({ length: 10 }, (_, index) => `第${index + 1}行`).join('\n');
    const html = postCardTemplate.renderPostCard({
        link: '/posts/plain.html',
        titleHtml: 'Plain',
        excerptHtml: shared.escapeHtmlWithLineBreaks(excerpt),
        date: '2026-05-30',
        layout: 'compact-grid'
    });

    assert.match(html, /\bpost-card-excerpt-lines-13\b/);
    assert.doesNotMatch(html, /\bpost-card-excerpt-lines-9\b/);
    assert.doesNotMatch(html, /class="post-card-excerpt-line"/);
    assert.match(html, /第10行/);
    assert.match(typographyCss, /\.post-card-excerpt-lines-13\s*\{[\s\S]*-webkit-line-clamp:\s*13;/);
});

test('post card excerpts render line breaks consistently across card layouts', () => {
    const multilinePreview = '第一行\n第二行 <b>不能执行</b>';
    const defaultHtml = renderPostCardForList({
        title: 'Example',
        preview: multilinePreview,
        excerpt: multilinePreview,
        date: { tz: () => ({ format: () => '2026-05-30' }), valueOf: () => 1 },
        modifiedDate: { tz: () => ({ format: () => '2026-05-31' }), valueOf: () => 2 },
        tags: [],
        link: '/posts/example/',
        cover: ''
    });
    const compactHtml = renderPostCardForList({
        title: 'Example',
        preview: multilinePreview,
        excerpt: multilinePreview,
        date: { tz: () => ({ format: () => '2026-05-30' }), valueOf: () => 1 },
        modifiedDate: { tz: () => ({ format: () => '2026-05-31' }), valueOf: () => 2 },
        tags: [],
        link: '/posts/example/',
        cover: ''
    }, 0, { layout: 'compact-grid' });

    assert.equal((defaultHtml.match(/第一行<br>第二行 &lt;b&gt;不能执行&lt;\/b&gt;/g) || []).length, 2);
    assert.equal((compactHtml.match(/第一行<br>第二行 &lt;b&gt;不能执行&lt;\/b&gt;/g) || []).length, 1);
    assert.doesNotMatch(defaultHtml, /class="post-card-excerpt-line"/);
    assert.doesNotMatch(compactHtml, /class="post-card-excerpt-line"/);
});

test('mobile post cards reuse the all-page compact layout', () => {
    const html = postCardTemplate.renderPostCard({
        link: '/posts/example.html',
        titleHtml: 'Example',
        excerptHtml: 'Example excerpt',
        cover: '/image/example.png',
        date: '2026-05-30',
        modifiedDate: '2026-05-31',
        tagsHtml: '<span>Free</span>'
    });

    assert.match(html, /<div class="relative flex h-full min-h-0\s+flex-col rounded-lg bg-white[\s\S]*\blg:hidden\b/);
    assert.match(html, /lazy-image-frame mt-4 h-\[clamp\(11\.25rem,14\.5vw,13\.25rem\)\] max-\[480px\]:h-\[11\.5rem\]/);
    assert.doesNotMatch(html, /lazy-image-frame mt-8 h-\[196px\]/);
    assert.doesNotMatch(html, /<div class="mt-3 shrink-0">\s*<div class="flex min-h-5 items-center">/);
    assert.match(html, /post-card[^"]*\btags-inline-mobile\b/);
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

test('list cards always use the shared all-page mobile tag row', () => {
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
    });

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
    const postId = '2026053115300001';
    const fontCss = renderPostFontFaceCss(postId, 'test-version');
    const notoFaces = [...fontCss.matchAll(/@font-face\s*\{[\s\S]*?\}/g)]
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

        assert.match(face, new RegExp(`font-weight:\\s*${weight}`));
        assert.match(face, new RegExp(`/assets/fonts/freecat-noto-sans-sc-${name}-subset\\.woff2\\?v=test-version`));
        assert.doesNotMatch(face, /unicode-range/);
        assert.match(face, /font-display:\s*block/);
    }
    for (const name of unusedWeights) {
        assert.equal(notoFaces.some(block => block.includes(`freecat-noto-sans-sc-${name}-subset.woff2`)), false);
    }

    assert.deepEqual(preloadFontHrefs(renderPostFontPreloads(postId, 'test-version')), [
        '/assets/fonts/freecat-figtree-regular-subset.woff2?v=test-version',
        '/assets/fonts/freecat-figtree-semi-bold-subset.woff2?v=test-version',
        '/assets/fonts/freecat-figtree-extra-bold-subset.woff2?v=test-version',
        '/assets/fonts/freecat-noto-sans-sc-regular-subset.woff2?v=test-version',
        '/assets/fonts/freecat-noto-sans-sc-medium-subset.woff2?v=test-version',
        '/assets/fonts/freecat-noto-sans-sc-semi-bold-subset.woff2?v=test-version',
        '/assets/fonts/freecat-noto-sans-sc-extra-bold-subset.woff2?v=test-version'
    ]);
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
