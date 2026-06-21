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
    mediaPlayerJs,
    mediaPlayerCss,
    mediaPlayerTemplateJs,
    videoPlayerJs,
    videoPlayerCss,
    shared,
    postCardTemplate,
    renderCopyButton,
    renderPostFontPreloads,
    renderPostFontFaceCss,
    renderPostCardForList,
    generatePaginationHtml,
    preloadFontHrefs,
    fontFaceSrcUrls
} = require('../test-support/assets.js');

test('external embeds keep placeholders until visible content or fallback link is ready', () => {
    assert.match(postJs, /function hasVisibleTwitterEmbed\(figure\)/);
    assert.match(postJs, /rect\.width > 0 && rect\.height >= 120/);
    assert.match(postJs, /function requestTwitterEmbedRender\(figure\)/);
    assert.match(postJs, /window\.twttr\.widgets\.load\(figure\);/);
    assert.match(postJs, /var safeUrl = shared\.escapeHtml\(url\);/);
    assert.doesNotMatch(postJs, /function escapeHtmlText\(value\)/);
    assert.match(postJs, /if \(isFailedTwitterEmbed\(figure\)\) \{\s*replaceFailedTwitterEmbed\(figure\);/);
    assert.match(postJs, /if \(attempts >= 80\) \{\s*requestTwitterEmbedRender\(figure\);\s*attempts = 0;/);
    assert.doesNotMatch(postJs, /if \(attempts >= 80\) \{\s*replaceFailedTwitterEmbed\(figure\);/);
    assert.doesNotMatch(postJs, /if \(iframe \|\| attempts >= 80\) \{\s*markExternalEmbedReady\(figure\);/);
    assert.doesNotMatch(postJs, /window\.setTimeout\(function \(\) \{\s*markExternalEmbedReady\(figure\);\s*\}, 2200\);/);
});

test('post share fallback reuses shared clipboard helper', () => {
    assert.match(postJs, /shared\.copyText\(url\)\.then/);
    assert.doesNotMatch(postJs, /copyToClipboard\(url\)/);
});

test('article body copy button reuses the code copy control', () => {
    const copyButton = renderCopyButton({
        className: 'freecat-post-copy-btn',
        inputAttrs: ' data-copy-source="#freecat-article-copy-source" data-copy-target="#freecat-article-body"',
        ariaLabel: '复制正文',
        title: '复制正文'
    });

    assert.match(postTemplate, /<!-- POST_COPY_BUTTON_PLACEHOLDER -->/);
    assert.match(postTemplate, /<!-- POST_COPY_SOURCE_PLACEHOLDER -->/);
    assert.match(postTemplate, /id="freecat-article-body"/);
    assert.match(postCss, /\.freecat-post-copy-btn\s*\{[\s\S]*margin-left:\s*auto;/);
    assert.match(copyButton, /class="t-btn-icon copy-btn-container freecat-post-copy-btn"/);
    assert.match(copyButton, /data-copy-source="#freecat-article-copy-source"/);
    assert.match(copyButton, /data-copy-target="#freecat-article-body"/);
    assert.match(copyButton, /class="copy-checkbox"/);
    assert.match(codeCopyJs, /function textFromSource\(checkbox\)/);
    assert.match(codeCopyJs, /JSON\.parse\(target\.textContent/);
    assert.match(codeCopyJs, /function textFromTarget\(checkbox\)/);
    assert.match(codeCopyJs, /function textFromCodeBlock\(checkbox\)/);
});

test('copy button success state reuses the search count slide motion pattern', () => {
    assert.match(postCss, /\.copy-btn-container \.clipboard\s*\{[\s\S]*transform:\s*translateY\(0\) scale\(1\);[\s\S]*transform 180ms ease-out/);
    assert.match(postCss, /\.copy-btn-container \.clipboard-check\s*\{[\s\S]*transform:\s*translateY\(0\.25rem\) scale\(0\.96\);[\s\S]*transform 180ms ease-out/);
    assert.match(postCss, /\.copy-btn-container input:checked~\.clipboard\s*\{[\s\S]*opacity:\s*0;[\s\S]*transform:\s*translateY\(-0\.25rem\) scale\(0\.94\);/);
    assert.match(postCss, /\.copy-btn-container input:checked~\.clipboard-check\s*\{[\s\S]*opacity:\s*1;[\s\S]*transform:\s*translateY\(0\) scale\(1\);/);
});

test('article table of contents uses requested Chinese and Latin font assets', () => {
    assert.match(postTemplate, /class="freecat-post-toc-title\b[\s\S]*>\s*目录\s*</);
    assert.doesNotMatch(postTemplate, /class="text-sm font-bold tracking-wider[^"]*">\s*目录\s*</);
    assert.match(typographyCss, /\.freecat-post-toc-title\s*\{[\s\S]*font-family:\s*"Freecat Tag Noto Sans SC",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*500;/);
    assert.match(typographyCss, /#toc-container a\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"[\s\S]*font-weight:\s*400;/);
});

test('article latest update panel mirrors the toc on the left when there is room', () => {
    assert.match(postTemplate, /<!-- LATEST_UPDATE_PLACEHOLDER -->/);
    assert.match(typographyCss, /\.freecat-sidebar-recent-heading\s*\{[\s\S]*font-family:\s*"Freecat Figtree", Inter/);
    assert.match(typographyCss, /\.freecat-sidebar-recent-heading\s*\{[\s\S]*font-weight:\s*800;/);
    assert.match(postCss, /\.freecat-post-latest-update-shell\s*\{[\s\S]*display:\s*none;/);
    assert.match(postCss, /@media \(min-width:\s*1600px\)\s*\{[\s\S]*\.freecat-post-latest-update-shell\s*\{[\s\S]*display:\s*block;/);
    assert.match(postCss, /\.freecat-post-latest-update-panel\s*\{[\s\S]*right:\s*calc\(50% \+ 498px\);/);
    assert.match(postCss, /#latest-update-container\s*\{[\s\S]*overflow-y:\s*auto !important;/);
    assert.match(postCss, /#latest-update-container\s*\{[\s\S]*direction:\s*rtl;/);
    assert.match(postCss, /\.freecat-post-latest-update-content\s*\{[\s\S]*direction:\s*ltr;/);
    assert.match(postCss, /\.freecat-post-latest-update-content\s*\{[\s\S]*background:\s*var\(--freecat-post-latest-update-block-bg\);/);
    assert.doesNotMatch(postCss, /\.freecat-post-latest-update-content\s*\{[\s\S]*border:\s*1px solid/);
    assert.match(postCss, /\.freecat-post-latest-update-title-note\s*\{[\s\S]*font-family:\s*"Freecat Figtree",\s*"Freecat Noto Sans SC"/);
    assert.match(postCss, /\.freecat-post-latest-update-title-note\s*\{[\s\S]*font-size:\s*0\.75rem;/);
    assert.match(postCss, /\.freecat-post-latest-update-title-note\s*\{[\s\S]*font-weight:\s*400;/);
    assert.match(postCss, /\.freecat-post-latest-update-body\s*\{[\s\S]*padding:\s*0\.35rem 0;/);
    assert.doesNotMatch(postCss, /freecat-post-latest-update-body\s*\{[\s\S]*border-right:/);
    assert.doesNotMatch(postCss, /freecat-post-latest-update-date/);
    assert.match(postCss, /\.freecat-post-latest-update-link\s*\{[\s\S]*text-overflow:\s*ellipsis;/);
    assert.match(postCss, /\.freecat-post-latest-update-link\s*\{[\s\S]*-webkit-line-clamp:\s*3;/);
    assert.match(postCss, /\.freecat-post-latest-update-link\s*\{[\s\S]*white-space:\s*normal;/);
    assert.match(postJs, /function initLatestUpdateAnchors\(\)\s*\{/);
    assert.match(postJs, /\.freecat-post-latest-update-link\[href\^="#"\]/);
    assert.match(postJs, /h1,h2,h3,h4,h5,h6,p,li,tr,td,th,blockquote,figcaption,figure,\.callout,pre code/);
    assert.match(postJs, /ul,ol,table/);
    assert.match(postJs, /findLatestUpdateTarget\(this\.getAttribute\('data-latest-update-text'\)\)/);
    assert.match(postJs, /getTocTargetScrollY\(targetElement,\s*article\)/);
    assert.match(floatingNavJs, /\.freecat-post-latest-update-panel/);
    assert.match(floatingNavJs, /getElementById\('latest-update-container'\)/);
});

test('article toc anchor scrolling respects the shell header offset when framed', () => {
    assert.match(postJs, /function getRootPixelValue\(name,\s*fallback\)\s*\{/);
    assert.match(postJs, /getRootPixelValue\('--freecat-page-top-offset',\s*0\)/);
    assert.match(postJs, /document\.documentElement\.classList\.contains\('freecat-framed'\)/);
    assert.match(postJs, /return Math\.max\(0,\s*shellOffset,\s*headerHeight \+ safeGap\);/);
});

test('article video players default to 16:9 before metadata and then use real video ratio', () => {
    assert.match(videoPlayerCss, /\.video-player-stage\s*\{[\s\S]*aspect-ratio:\s*var\(--video-aspect-ratio,\s*16\s*\/\s*9\);/);
    assert.match(videoPlayerCss, /\.video-player-video\s*\{[\s\S]*height:\s*100%;[\s\S]*object-fit:\s*contain;/);
    assert.match(videoPlayerCss, /\.video-player-loading-overlay\s*\{[\s\S]*position:\s*absolute;[\s\S]*inset:\s*0;/);
    assert.match(videoPlayerJs, /function updateVideoAspectRatio\(\)\s*\{[\s\S]*video\.videoWidth[\s\S]*video\.videoHeight[\s\S]*stage\.style\.setProperty\('--video-aspect-ratio',\s*`\$\{width\} \/ \$\{height\}`\);[\s\S]*\}/);
    assert.match(videoPlayerJs, /onLoadedMetadata:\s*updateVideoAspectRatio/);
    assert.match(mediaPlayerTemplateJs, /function renderPlayerChrome\(options\)\s*\{/);
    assert.match(mediaPlayerTemplateJs, /function renderAudioPlayer\(options\)\s*\{/);
    assert.match(mediaPlayerTemplateJs, /function renderVideoPlayer\(options\)\s*\{/);
    assert.match(mediaPlayerJs, /FreecatMediaPlayerTemplate/);
    assert.match(mediaPlayerJs, /function hydrateMediaControls\(container,\s*media/);
    assert.match(mediaPlayerCss, /\.media-progress-container\s*\{/);
    assert.match(mediaPlayerCss, /\.media-player-loading-chrome\s*\{/);
    assert.match(mediaPlayerCss, /\.media-player-loading-progress::before\s*\{/);
    assert.match(mediaPlayerCss, /\.media-player-loading-controls-left,\s*\.media-player-loading-controls-right\s*\{/);
    assert.match(mediaPlayerTemplateJs, /data-origin="bottom-center"/);
    assert.match(mediaPlayerCss, /\.media-speed-dropdown\s*\{[\s\S]*left:\s*50%;[\s\S]*transform:\s*translateX\(-50%\) scale\(0\.97\);[\s\S]*transform-origin:\s*bottom center;/);
    assert.match(mediaPlayerCss, /\.media-speed-dropdown\.is-open\s*\{[\s\S]*transform:\s*translateX\(-50%\) scale\(1\);/);
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

test('article body links can wrap while keeping continuous underlines', () => {
    const rule = postCss.match(/\.prose a\s*\{[\s\S]*?\}/)?.[0] || '';

    assert.match(rule, /white-space:\s*normal\s*!important;/);
    assert.match(rule, /overflow-wrap:\s*anywhere\s*!important;/);
    assert.match(rule, /text-decoration-skip-ink:\s*none\s*!important;/);
    assert.doesNotMatch(rule, /white-space:\s*nowrap\s*!important;/);
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

test('article Chinese font weights use standard emphasis values', () => {
    assert.match(postCss, /\.prose \.callout-title\s*\{[\s\S]*font-weight:\s*600\s*!important;/);
    assert.match(postCss, /\.prose summary\s*\{[\s\S]*font-weight:\s*600;/);
    assert.match(postCss, /\.post-title\s*\{[\s\S]*font-weight:\s*600\s*!important;/);
    assert.match(postCss, /\.prose \.article-heading\s*\{[\s\S]*font-weight:\s*600\s*!important;/);
    assert.match(postCss, /\.prose \.article-heading-rank-1\s*\{[\s\S]*font-weight:\s*700\s*!important;/);
    assert.match(postCss, /\.prose strong,\s*\.prose b\s*\{[\s\S]*font-weight:\s*600\s*!important;/);
    assert.match(postCss, /\.prose li>strong:first-child\s*\{[\s\S]*font-weight:\s*600\s*!important;/);
    assert.doesNotMatch(postCss, /\.prose strong\s*\{[\s\S]*font-weight:\s*700\s*!important;/);
    assert.doesNotMatch(postTemplate, /class="post-title[^"]*\bfont-black\b/);
    assert.doesNotMatch(postTemplate, /\bprose-strong:/);

    const notoFaces = [...renderPostFontFaceCss('2026053115300001').matchAll(/@font-face\s*\{[\s\S]*?\}/g)]
        .map(match => match[0])
        .filter(block => block.includes('font-family: "Freecat Noto Sans SC"'));

    assert.equal(
        notoFaces.some(block => block.includes('freecat-noto-sans-sc-semi-bold-subset.woff2') && /font-weight:\s*600/.test(block)),
        true
    );
    assert.equal(
        notoFaces.some(block => block.includes('freecat-noto-sans-sc-extra-bold-subset.woff2') && /font-weight:\s*750 849/.test(block)),
        true
    );
});

test('article headings use one and a half times the body reading size across breakpoints', () => {
    assert.match(postCss, /\.post-title\s*\{[\s\S]*font-size:\s*1\.75rem\s*!important;/);
    assert.match(postCss, /@media \(min-width: 768px\)\s*\{[\s\S]*\.post-title\s*\{[\s\S]*font-size:\s*2\.5rem\s*!important;/);
    assert.match(postCss, /\.prose\s*\{[\s\S]*--article-body-size:\s*1\.0625rem;/);
    assert.match(postCss, /@media \(min-width: 768px\)\s*\{[\s\S]*\.prose\s*\{[\s\S]*--article-body-size:\s*1\.1875rem;/);

    for (let level = 1; level <= 6; level += 1) {
        assert.match(postCss, new RegExp(`--article-heading-h${level}:\\s*calc\\(var\\(--article-body-size\\) \\* 1\\.5\\);`));
    }

    assert.doesNotMatch(postCss, /--article-heading-h[1-6]:\s*var\(--article-body-size\);/);
});

test('markdown image blocks center without shrinking regular images', () => {
    const centerRule = postCss.match(/#freecat-article-body\.prose \.markdown-image-block\s*\{[\s\S]*?\}/)?.[0] || '';
    const postImageRule = postCss.match(/\.prose figure\.post-image\s*\{[\s\S]*?\}/)?.[0] || '';
    const externalRule = postCss.match(/\.prose figure\.external-embed\s*\{[\s\S]*?\}/)?.[0] || '';
    const imageRule = postCss.match(/\.prose img\s*\{[\s\S]*?\}/)?.[0] || '';

    assert.match(centerRule, /margin-inline:\s*auto\s*!important;/);
    assert.match(postImageRule, /width:\s*100%;/);
    assert.match(imageRule, /width:\s*100%\s*!important;/);
    assert.doesNotMatch(postImageRule, /max-width:\s*(?:max-content|fit-content|none)/);
    assert.doesNotMatch(postImageRule, /width:\s*auto/);
    assert.match(externalRule, /margin:\s*0 0 2rem 0\s*!important;/);
    assert.doesNotMatch(externalRule, /margin(?:-inline)?:\s*auto/);
});

test('article body blocks with zero blank lines share compact group rhythm', () => {
    const listPaddingRules = [...postCss.matchAll(/\.prose ul,\s*\.prose ol\s*\{[\s\S]*?\}/g)]
        .map(match => match[0]);
    const ordinaryBodyBlocks = ':is(p, ul, ol, dl, blockquote, table, .code-block-container, .relative.w-full.inline-block, figure.post-image, figure.external-embed, details, .callout, .diagram-block, .media-player-container, .katex-display, center, .mermaid, pre, .footnotes, iframe, video, picture, .audio-player)';
    const compactGroupRule = postCss.match(/\.prose :is\([^{}]*figure\.external-embed[\s\S]*?\)\+:is\([^{}]*figure\.external-embed[\s\S]*?\)\s*\{[\s\S]*?\}/)?.[0] || '';
    const attachedBlockRule = postCss.match(/#freecat-article-body\.prose>\.markdown-attached-block:not\(\.article-heading\)\s*\{[\s\S]*?\}/)?.[0] || '';
    const extraGapRule = postCss.match(/\.prose \.markdown-gap\+:is\([^{}]*figure\.external-embed[\s\S]*?\)\s*\{[\s\S]*?\}/)?.[0] || '';
    const groupedListRule = postCss.match(/#freecat-article-body\.prose>\.markdown-list-lead\+\.markdown-attached-list\s*\{[\s\S]*?\}/)?.[0] || '';

    assert.match(postCss, /--article-space-group:\s*0\.42rem;/);
    assert.match(postCss, /--article-space-list-attach:\s*0\.32rem;/);
    assert.match(postCss, /--article-space-list-item:\s*0\.62rem;/);
    assert.equal(listPaddingRules.some(rule => /padding-left:\s*1\.7em\s*!important;/.test(rule)), true);
    assert.match(postCss, /\.prose li\s*\{[\s\S]*margin:\s*0 0 var\(--article-space-list-item\)\s*!important;[\s\S]*line-height:\s*1\.72\s*!important;/);
    assert.equal(postCss.includes(`.prose ${ordinaryBodyBlocks}+${ordinaryBodyBlocks} {`), true);
    assert.match(compactGroupRule, /margin-block-start:\s*var\(--article-space-flow\)\s*!important;/);
    assert.match(attachedBlockRule, /margin-block-start:\s*var\(--article-space-group\)\s*!important;/);
    assert.doesNotMatch(postCss, /#freecat-article-body\.prose>\.markdown-attached-block\s*\{/);
    assert.match(extraGapRule, /margin-block-start:\s*var\(--article-space-flow\)\s*!important;/);
    assert.match(groupedListRule, /margin-block-start:\s*var\(--article-space-list-attach\)\s*!important;/);
    assert.match(groupedListRule, /margin-inline-start:\s*var\(--article-list-indent\)\s*!important;/);
    assert.match(groupedListRule, /padding:\s*0 0 0\.18rem 1\.5rem\s*!important;/);
    assert.doesNotMatch(postCss, /--article-space-list-after/);
    assert.doesNotMatch(postCss, /--article-space-list-group-before/);
    assert.doesNotMatch(postCss, />:is\([^{}]*\)\+:is\(ul, ol\)/);
    assert.doesNotMatch(postCss, /markdown-attached-list\+p/);
    assert.doesNotMatch(postCss, /p\.markdown-list-lead/);
    assert.doesNotMatch(postCss, /p:has\(\+ ul\)/);
    assert.doesNotMatch(groupedListRule, /-\d/);
    assert.doesNotMatch(groupedListRule, /background:/);
    assert.doesNotMatch(groupedListRule, /border-left:/);
});

test('article headings keep peer spacing after any preceding body block', () => {
    assert.equal(postCss.includes('.prose figure.post-image+h3:not(.article-heading),'), true);
    assert.equal(postCss.includes('.prose figure.post-image+h3,'), false);
    assert.equal(postCss.includes('.prose .relative.w-full.inline-block+h3:not(.article-heading),'), true);
    assert.equal(postCss.includes('.prose .relative.w-full.inline-block+h3,'), false);

    const articleBodyBlock = ':where(:not(.markdown-gap):not(.article-heading):not(hr):not(script):not(style):not(template))';
    assert.equal(postCss.includes(`#freecat-article-body.prose>${articleBodyBlock}+.article-heading-depth-2,`), true);
    assert.equal(postCss.includes(`#freecat-article-body.prose>${articleBodyBlock}+.markdown-gap+.article-heading-depth-2,`), true);
    assert.match(postCss, /#freecat-article-body\.prose>:where\(:not\(\.markdown-gap\):not\(\.article-heading\):not\(hr\):not\(script\):not\(style\):not\(template\)\)\+\.article-heading-depth-2,[\s\S]*?margin-block-start:\s*var\(--article-space-heading-peer-2\)\s*!important;/);
    assert.doesNotMatch(postCss, /\.prose :where\([^{}]*figure\.post-image[^{}]*\)\+\.article-heading-depth-2/);
});

test('underlined headings include the divider in their own box', () => {
    const headingRule = postCss.match(/\.prose:not\(:has\(\.article-heading-rank-2\)\) \.article-heading-rank-1,\s*\.prose \.article-heading-rank-2\s*\{[\s\S]*?\}/)?.[0] || '';
    const dividerRule = postCss.match(/\.prose:not\(:has\(\.article-heading-rank-2\)\) \.article-heading-rank-1::after,\s*\.prose \.article-heading-rank-2::after\s*\{[\s\S]*?\}/)?.[0] || '';

    assert.match(headingRule, /padding-bottom:\s*calc\(0\.72rem \+ 2px\)\s*!important;/);
    assert.match(dividerRule, /position:\s*absolute;/);
    assert.match(dividerRule, /bottom:\s*0;/);
    assert.match(dividerRule, /left:\s*0;/);
    assert.match(dividerRule, /right:\s*0;/);
    assert.doesNotMatch(dividerRule, /margin-top:/);
    assert.doesNotMatch(postCss, /article-space-group-after-heading-rule/);
    assert.doesNotMatch(postCss, /\.article-heading-rank-2\+\.markdown-attached-block/);
});

test('article heading spacing uses generic body adjacency around headings', () => {
    const resetRule = postCss.match(/\.prose p,[\s\S]*?\{\s*margin:\s*0\s*!important;\s*\}/)?.[0] || '';
    const flowRule = postCss.match(/\.prose :is\([^{}]*figure\.external-embed[\s\S]*?margin-block-start:\s*var\(--article-space-flow\)\s*!important;\s*\}/)?.[0] || '';
    const articleBodyBlock = ':where(:not(.markdown-gap):not(.article-heading):not(hr):not(script):not(style):not(template))';

    for (const selector of [
        '.relative.w-full.inline-block',
        'figure.post-image',
        'figure.external-embed',
        '.diagram-block',
        '.media-player-container'
    ]) {
        assert.equal(resetRule.includes(selector), true);
        assert.equal(flowRule.includes(selector), true);
    }
    assert.equal(postCss.includes(`#freecat-article-body.prose>.article-heading-depth-1+${articleBodyBlock},`), true);
    assert.equal(postCss.includes(`#freecat-article-body.prose>.article-heading-depth-1+.markdown-gap+${articleBodyBlock},`), true);
    assert.equal(postCss.includes(`#freecat-article-body.prose>.article-heading-depth-5+${articleBodyBlock},`), true);
    assert.equal(postCss.includes(`#freecat-article-body.prose>.article-heading-depth-5+.markdown-gap+${articleBodyBlock},`), true);
    assert.equal(postCss.includes(`#freecat-article-body.prose>${articleBodyBlock}+.article-heading-depth-5,`), true);
    assert.equal(postCss.includes(`#freecat-article-body.prose>${articleBodyBlock}+.markdown-gap+.article-heading-depth-5,`), true);
    assert.match(postCss, /#freecat-article-body\.prose>\.article-heading-depth-5\+:where\(:not\(\.markdown-gap\):not\(\.article-heading\):not\(hr\):not\(script\):not\(style\):not\(template\)\),[\s\S]*?margin-block-start:\s*var\(--article-space-heading-to-content\)\s*!important;/);
    assert.doesNotMatch(postCss, /\.article-heading-depth-5\+:is\([^{}]*figure\.external-embed/);
    assert.doesNotMatch(postCss, /figure\.external-embed[^{}]*\)\+\.article-heading-depth-5/);
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

test('markdown horizontal rule spacing stays centered around any adjacent element', () => {
    const headingSpacingAt = postCss.indexOf('#freecat-article-body.prose>.article-heading-depth-5+:where');
    const dividerSpacingAt = postCss.indexOf('#freecat-article-body.prose>:not(.markdown-gap)+hr,');

    assert.match(postCss, /--article-space-divider:\s*80px;/);
    assert.doesNotMatch(postCss, /--article-space-divider-(?:before|after):/);
    assert.match(postCss, /\.prose>hr\s*\{[^}]*margin:\s*0\s*!important;/);
    assert.equal(dividerSpacingAt > headingSpacingAt, true);
    assert.match(postCss, /#freecat-article-body\.prose>:not\(\.markdown-gap\)\+hr,\s*#freecat-article-body\.prose>\.markdown-gap\+hr,\s*#freecat-article-body\.prose>hr\+:not\(\.markdown-gap\),\s*#freecat-article-body\.prose>hr\+\.markdown-gap\+:not\(\.markdown-gap\)\s*\{[\s\S]*margin-block-start:\s*var\(--article-space-divider\)\s*!important;/);
    assert.doesNotMatch(postCss, /\.prose\.prose/);
    assert.doesNotMatch(postCss, /hr\+\.article-heading-depth-/);
    assert.doesNotMatch(postCss, /hr\+\.markdown-gap\+\.article-heading-depth-/);
    assert.doesNotMatch(postCss, /hr\+\.article-heading\b/);
    assert.doesNotMatch(postCss, /hr\+\.markdown-gap\+\.article-heading\b/);
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
    const quoteParagraphRule = postCss.match(/\.prose blockquote p\s*\{[\s\S]*?\}/)?.[0] || '';
    const finalQuoteRule = postCss.match(/\.prose blockquote\s*\{[\s\S]*?\}/)?.[0] || '';
    const lastChildRule = postCss.match(/\.prose blockquote > :last-child\s*\{[\s\S]*?\}/)?.[0] || '';
    const nestedQuoteRule = postCss.match(/\.prose blockquote blockquote\s*\{[\s\S]*?\}/)?.[0] || '';
    const thirdLevelQuoteRule = postCss.match(/\.prose blockquote blockquote blockquote\s*\{[\s\S]*?\}/)?.[0] || '';

    assert.match(quoteParagraphRule, /color:\s*var\(--article-quote-text\)\s*!important;/);
    assert.match(finalQuoteRule, /padding:\s*0 0 0 1em\s*!important;/);
    assert.match(finalQuoteRule, /border-left:\s*2px solid var\(--article-quote-border\)\s*!important;/);
    assert.match(finalQuoteRule, /color:\s*var\(--article-quote-text\)\s*!important;/);
    assert.match(finalQuoteRule, /font-style:\s*normal\s*!important;/);
    assert.match(finalQuoteRule, /background:\s*transparent\s*!important;/);
    assert.match(lastChildRule, /margin-bottom:\s*0\s*!important;/);
    assert.match(nestedQuoteRule, /margin-left:\s*0\.8em\s*!important;/);
    assert.match(nestedQuoteRule, /padding:\s*0 0 0 1em\s*!important;/);
    assert.match(nestedQuoteRule, /border-left-width:\s*2px\s*!important;/);
    assert.match(nestedQuoteRule, /border-left-color:\s*var\(--article-quote-border\)\s*!important;/);
    assert.match(nestedQuoteRule, /background:\s*transparent\s*!important;/);
    assert.match(thirdLevelQuoteRule, /margin-left:\s*0\.8em\s*!important;/);
    assert.match(thirdLevelQuoteRule, /border-left-color:\s*var\(--article-quote-border\)\s*!important;/);
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

test('syntax highlighting happens at build time, never on the client', () => {
    const postPageJs = fs.readFileSync(path.join(__dirname, '../build/pages/post.js'), 'utf-8');
    const buildMarkdownJs = fs.readFileSync(path.join(__dirname, '../build/markdown.js'), 'utf-8');

    assert.match(buildMarkdownJs, /require\('highlight\.js'\)/);
    assert.doesNotMatch(postPageJs, /highlight\.min\.js/);
    assert.match(postPageJs, /highlight\.js\/11\.9\.0\/styles\/github\.min\.css/, 'token color stylesheet still ships');
    assert.doesNotMatch(postTemplate, /POST_HIGHLIGHT_JS/);
    assert.doesNotMatch(postJs, /highlightAll/);
    assert.doesNotMatch(postJs, /window\.hljs/);
});

test('code block visibility is contained so offscreen blocks skip style and layout work', () => {
    assert.match(postCodeCss, /\.prose \.code-block-container\s*\{[\s\S]*content-visibility:\s*auto;[\s\S]*contain-intrinsic-size:\s*auto 500px;/);
    assert.match(postCodeCss, /\.prose \.code-block-container\.expanded-code,\s*\.prose \.code-block-container\.code-expanding\s*\{[\s\S]*content-visibility:\s*visible;/);
    // 折叠判定在构建期完成：运行时 init 不允许再逐块强制重排
    assert.doesNotMatch(codeFoldingJs, /content\.scrollHeight > 500/);
    assert.match(codeFoldingJs, /function initCodeFolding\(\)\s*\{\s*scheduleCodeControlsUpdate\(\);\s*\}/);
});

test('code folding uses a smooth height transition with fading mask cleanup', () => {
    const codeContentRule = postCodeCss.match(/\.prose \.code-content\s*\{[\s\S]*?\n\}/)?.[0] || '';
    const codeMaskRule = postCodeCss.match(/\.prose \.code-content::after\s*\{[\s\S]*?\n\}/)?.[0] || '';
    const collapsedMaskRule = postCodeCss.match(/\.prose \.collapsed-code \.code-content::after\s*\{[\s\S]*?\n\}/)?.[0] || '';
    const openingControlsRule = postCodeCss.match(/\.prose \.code-fold-controls\.code-controls-opening\s*\{[\s\S]*?\n\}/)?.[0] || '';
    const reducedMotionRule = postCodeCss.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\.prose \.fold-toggle-btn[\s\S]*?\n\}/)?.[0] || '';

    assert.match(postTemplate, /href="\/assets\/post-code\.css"/);
    assert.match(postTemplate, /src="\/assets\/code-folding\.js" defer><\/script>[\s\S]*src="\/assets\/post\.js" defer/);
    assert.match(postJs, /var codeFolding = window\.FreecatCodeFolding;/);
    assert.doesNotMatch(postJs, /CODE_COLLAPSED_HEIGHT/);
    assert.match(codeFoldingJs, /function setCodeControlsInlineLayout\(controls\)/);
    assert.doesNotMatch(codeFoldingJs, /function setCollapsedCodeControlsLayout\(controls\)/);
    assert.doesNotMatch(codeFoldingJs, /function setExpandedCodeControlsLayout\(controls\)/);
    assert.match(codeFoldingJs, /var CODE_FOLD_TRANSITION_MS = 420;/);
    assert.match(codeFoldingJs, /setTimeout\(finish, CODE_FOLD_TRANSITION_MS \+ 80\);/);
    assert.match(codeFoldingJs, /function settleCollapsedCodeHeight\(content, container\)/);
    assert.match(codeFoldingJs, /foldContainer\.classList\.add\('code-collapsing'\)/);
    assert.match(codeFoldingJs, /container\.classList\.remove\('code-collapsing'\)/);
    assert.match(codeFoldingJs, /var content = block\.querySelector\('\.code-content'\);/);
    assert.match(codeFoldingJs, /var contentRect = content \? content\.getBoundingClientRect\(\) : wrapperRect;/);
    assert.match(codeFoldingJs, /\? contentRect\.top \+ finalContentHeight\s*:\s*contentRect\.bottom;/);
    assert.match(codeFoldingJs, /if \(mode === 'pinned-bottom'\) \{\s*top = Math\.max\(minTop, maxBottom - controlsHeight\);/);
    assert.doesNotMatch(codeFoldingJs, /if \(openingTarget\.mode === 'pinned-bottom'\) \{[\s\S]*?controls\.classList\.add\('code-controls-pinned-bottom'\);[\s\S]*?controls\.style\.removeProperty\('--code-controls-top'\);[\s\S]*?\} else \{/);
    assert.match(codeFoldingJs, /controls\.classList\.remove\('code-controls-pinned-bottom'\);[\s\S]*controls\.classList\.add\('code-controls-opening'\);/);
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

test('article code block styles live in the post-code asset', () => {
    assert.match(postTemplate, /href="\/assets\/post-code\.css"/);
    assert.match(postCodeCss, /\/\* ===== Refined code block surface ===== \*\//);
    assert.match(postCodeCss, /\.prose \.code-content\s*\{/);
    assert.match(postCodeCss, /\.prose \.collapsed-code \.code-content\s*\{[\s\S]*overflow-y:\s*hidden !important;/);
    assert.doesNotMatch(postCss, /Refined code block surface/);
    assert.doesNotMatch(postCss, /\.prose \.code-content\s*\{/);
    assert.doesNotMatch(transitionsCss, /collapsed-code \.code-content/);
    assert.doesNotMatch(transitionsCss, /collapsed-code \.code-fold-controls/);
});
