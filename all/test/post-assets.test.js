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
    notoSubsetScript,
    mediaPlayerJs,
    mediaPlayerCss,
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
    assert.match(mediaPlayerJs, /function hydrateMediaControls\(container,\s*media/);
    assert.match(mediaPlayerCss, /\.media-progress-container\s*\{/);
    assert.match(mediaPlayerCss, /\.media-player-loading-chrome\s*\{/);
    assert.match(mediaPlayerCss, /\.media-player-loading-progress::before\s*\{/);
    assert.match(mediaPlayerCss, /\.media-player-loading-controls-left,\s*\.media-player-loading-controls-right\s*\{/);
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

    const notoFaces = [...renderPostFontFaceCss('2026053115300001').matchAll(/@font-face\s*\{[\s\S]*?\}/g)]
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

test('article headings keep peer spacing after standalone post images', () => {
    assert.equal(postCss.includes('.prose figure.post-image+h3:not(.article-heading),'), true);
    assert.equal(postCss.includes('.prose figure.post-image+h3,'), false);
    assert.equal(postCss.includes('.prose .relative.w-full.inline-block+h3:not(.article-heading),'), true);
    assert.equal(postCss.includes('.prose .relative.w-full.inline-block+h3,'), false);
    assert.match(postCss, /\.prose :where\([^)]*figure\.post-image[^)]*\)\+\.article-heading-depth-2,\s*\.prose \.markdown-gap\+\.article-heading-depth-2[\s\S]*margin-block-start:\s*var\(--article-space-heading-peer-2\)\s*!important;/);
});

test('article heading spacing covers media embeds and link cards', () => {
    const resetRule = postCss.match(/\.prose p,[\s\S]*?\{\s*margin:\s*0\s*!important;\s*\}/)?.[0] || '';
    const flowRule = postCss.match(/\.prose :is\([^{}]*figure\.external-embed[\s\S]*?margin-block-start:\s*var\(--article-space-flow\)\s*!important;\s*\}/)?.[0] || '';
    const headingContentRule = postCss.match(/\.prose \.article-heading-depth-1\+:is\([^{}]*figure\.external-embed[\s\S]*?margin-block-start:\s*var\(--article-space-heading-to-content\)\s*!important;\s*\}/)?.[0] || '';
    const headingPeerRule = postCss.match(/\.prose :where\([^{}]*figure\.external-embed[\s\S]*?\)\+\.article-heading-depth-2,[\s\S]*?margin-block-start:\s*var\(--article-space-heading-peer-2\)\s*!important;\s*\}/)?.[0] || '';

    for (const selector of [
        '.relative.w-full.inline-block',
        'figure.post-image',
        'figure.external-embed',
        '.media-player-container'
    ]) {
        assert.equal(resetRule.includes(selector), true);
        assert.equal(flowRule.includes(selector), true);
        assert.equal(headingContentRule.includes(selector), true);
        assert.equal(headingPeerRule.includes(selector), true);
    }
    assert.doesNotMatch(headingContentRule, /\+:where\(/);
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
