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
    renderPostFontPreloads,
    renderPostFontFaceCss,
    renderPostCardForList,
    generatePaginationHtml,
    preloadFontHrefs,
    fontFaceSrcUrls
} = require('../test-support/assets.js');

test('main animation checks reuse a single reduced-motion helper', () => {
    assert.equal((themeSystemJs.match(/function prefersReducedMotion\(\)/g) || []).length, 1);
    assert.equal((mainJs.match(/function prefersReducedMotion\(\)/g) || []).length, 0);
    assert.doesNotMatch(mainJs, /const prefersReducedMotion = \(\) =>/);
});

test('theme switching uses css transitions and syncs the shell iframe', () => {
    assert.doesNotMatch(mainJs, /document\.startViewTransition/);
    assert.match(themeSystemJs, /function syncFrameTheme\(isDark, options = \{\}\)\s*\{/);
    assert.match(themeSystemJs, /contentFrame\.contentWindow\.FreecatRuntime/);
    assert.match(themeSystemJs, /frameRuntime\.applyTheme\(\{\s*animate:\s*!!options\.animate\s*\}\);/);
    assert.match(themeSystemJs, /contentFrame\.contentWindow\.FreecatApplyTheme/);
    assert.match(themeSystemJs, /frameDoc\.documentElement\.classList\.toggle\('dark', isDark\);/);
    assert.match(runtimeJs, /setApplyTheme\(fn\)\s*\{[\s\S]*FreecatApplyTheme/);
    assert.match(mainJs, /runtime\.setApplyTheme\(applyTheme\);/);
    assert.match(shellRouterJs, /syncFrameTheme\(resolveThemeIsDark\(\)\);/);
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

test('shell router uses clean history URLs for framed navigation', () => {
    assert.match(mainJs, /function navigateWithinSite\(url, options = \{\}\)\s*\{/);
    assert.match(runtimeJs, /setNavigate\(fn\)\s*\{[\s\S]*FreecatNavigate/);
    assert.equal(mainJs.includes("navigateWithinSite(`/search.html?q=${encodeURIComponent(searchInput.value.trim())}`);"), true);
    assert.match(shellRouterJs, /function publicPathToContentPath\(raw\)\s*\{/);
    assert.match(shellRouterJs, /function contentPathToPublicPath\(raw\)\s*\{/);
    assert.match(shellRouterJs, /window\.history\[method\]\(state,\s*'',\s*publicPath\);/);
    assert.match(shellRouterJs, /window\.addEventListener\('popstate',\s*\(\)\s*=>\s*syncFrameToLocation\(\{\s*restoreScroll:\s*true\s*\}\)\);/);
    assert.doesNotMatch(shellRouterJs, /window\.addEventListener\('hashchange'/);
    assert.doesNotMatch(shellRouterJs, /function pathToHash\(/);
});

test('framed pages delegate same-origin links to the parent shell but keep anchors local', () => {
    assert.match(mainJs, /function initFramedNavigationBridge\(\)\s*\{/);
    assert.match(mainJs, /shellRouter\.initFramedNavigationBridge\(\{\s*window,\s*document,\s*runtime\s*\}\);/);
    assert.match(shellRouterJs, /runtime\.saveScrollPosition\(\);/);
    assert.match(shellRouterJs, /rawHref\.charAt\(0\) === '#'/);
    assert.match(shellRouterJs, /runtime\.navigate\(url\.pathname \+ url\.search \+ url\.hash\);/);
    assert.match(mainJs, /if \(FRAMED\) initFramedNavigationBridge\(\);/);
});

test('nav audio defaults to half volume and exposes the matching volume slider while playing', () => {
    assert.match(mainJs, /const navAudioController = window\.FreecatNavAudio;/);
    assert.match(mainJs, /if \(!FRAMED\) initNavAudioButton\(\);/);
    assert.match(navAudioJs, /const DEFAULT_NAV_AUDIO_VOLUME = 0\.5;/);
    assert.match(navAudioJs, /const NAV_AUDIO_VOLUME_HIDE_DELAY_MS = 1000;/);
    assert.match(navAudioJs, /navAudio\.volume = nextVolume;/);
    assert.match(navAudioJs, /navAudioVolume\.style\.setProperty\('--volume-percent', `\$\{nextVolume \* 100\}%`\);/);
    assert.match(navAudioJs, /if \(navAudioControl\) navAudioControl\.dataset\.playing = isPlaying \? 'true' : 'false';/);
    assert.match(navAudioJs, /let navAudioVolumePointerInside = false;/);
    const shouldKeepVolumeBlock = navAudioJs.match(/function shouldKeepNavAudioVolumeOpen\(\) \{[\s\S]*?\n        \}/)?.[0] || '';
    assert.equal(navAudioJs.includes('function shouldKeepNavAudioVolumeOpen()'), true);
    assert.equal(navAudioJs.includes('return navAudioVolumePointerInside'), true);
    assert.equal(navAudioJs.includes("navAudioControl.matches(':hover')"), true);
    assert.equal(navAudioJs.includes("navAudioControl.matches(':focus-within')"), true);
    assert.doesNotMatch(shouldKeepVolumeBlock, /focus-within/);
    assert.equal(navAudioJs.includes("navAudioVolumeWrapper.matches(':hover')"), true);
    assert.match(navAudioJs, /if \(shouldKeepNavAudioVolumeOpen\(\)\) \{\s*setNavAudioVolumeOpen\(true\);/);
    assert.match(navAudioJs, /navAudioVolumeWrapper\.addEventListener\('pointerenter', \(\) => \{\s*navAudioVolumePointerInside = true;\s*setNavAudioVolumeOpen\(true\);\s*\}\);/);
    assert.match(navAudioJs, /navAudioVolumeWrapper\.addEventListener\('pointerleave', \(\) => \{\s*navAudioVolumePointerInside = false;\s*scheduleNavAudioVolumeClose\(\);\s*\}\);/);
    assert.equal(navAudioJs.includes('function closeNavAudioVolumeOnOutsidePointerDown(event)'), true);
    assert.match(navAudioJs, /if \(!navAudioControl \|\| navAudioControl\.dataset\.volumeOpen !== 'true'\) return;/);
    assert.match(navAudioJs, /if \(isNavAudioVolumeEventTarget\(event\.target\)\) return;/);
    assert.match(navAudioJs, /document\.activeElement instanceof HTMLElement && navAudioControl\.contains\(document\.activeElement\)/);
    assert.match(navAudioJs, /document\.activeElement\.blur\(\);/);
    assert.match(navAudioJs, /navAudioVolumePointerInside = false;[\s\S]*document\.activeElement\.blur\(\);[\s\S]*setNavAudioVolumeOpen\(false\);/);
    assert.match(navAudioJs, /function bindNavAudioFramePointerDown\(\)/);
    assert.match(navAudioJs, /navAudioFramePointerDownDocument\.addEventListener\('pointerdown', closeNavAudioVolumeNow, true\);/);
    assert.match(navAudioJs, /contentFrame\.addEventListener\('load', bindNavAudioFramePointerDown\);/);
    assert.match(navAudioJs, /document\.addEventListener\('pointerdown', closeNavAudioVolumeOnOutsidePointerDown, true\);/);
    assert.doesNotMatch(transitionsCss, /\.nav-audio-control\[data-playing="true"\]:focus-within \.nav-audio-volume-slider-wrapper/);
    assert.match(transitionsCss, /\.nav-audio-control\[data-playing="true"\]:hover \.nav-audio-volume-slider-wrapper,\s*\.nav-audio-control\[data-playing="true"\]\[data-volume-open="true"\] \.nav-audio-volume-slider-wrapper/);
    assert.match(transitionsCss, /\.nav-audio-control\[data-playing="true"\]\[data-volume-open="true"\] \.nav-audio-volume-slider-wrapper\s*\{[\s\S]*width:\s*80px;[\s\S]*opacity:\s*1;/);
    assert.match(transitionsCss, /\.nav-audio-volume-slider\s*\{[\s\S]*height:\s*4px;[\s\S]*background:\s*linear-gradient\(to right, #475569 0%, #475569 var\(--volume-percent, 50%\), #cbd5e1 var\(--volume-percent, 50%\), #cbd5e1 100%\);/);
    assert.match(transitionsCss, /\.nav-audio-volume-slider::-webkit-slider-thumb\s*\{[\s\S]*width:\s*12px;[\s\S]*height:\s*12px;[\s\S]*border:\s*2px solid white;/);
});

test('fixed header has a stable css height before runtime measurement', () => {
    assert.match(transitionsCss, /header\.fixed\s*\{[\s\S]*height:\s*var\(--freecat-header-height\);/);
    assert.match(transitionsCss, /header\.fixed\s+\.header-blur-target\s*\{[\s\S]*height:\s*100%;/);
    assert.doesNotMatch(transitionsCss, /(?:^|\n)header\s*\{[\s\S]*height:\s*var\(--freecat-header-height\);/);
});

test('header offset sync ignores impossible measured heights', () => {
    assert.match(mainJs, /function normalizeHeaderHeight\(measuredHeight\)\s*\{/);
    assert.match(mainJs, /height <= 120 \? height : fallbackHeight/);
    assert.match(mainJs, /const fallbackHeight = window\.innerWidth < 768 \? 61 : 73;/);
    assert.match(shellRouterJs, /function normalizeHeaderHeight\(measuredHeight\)\s*\{/);
    assert.match(shellRouterJs, /height <= 120 \? height : fallbackHeight/);
    assert.match(shellRouterJs, /const h = normalizeHeaderHeight\(Math\.ceil\(headerEl\.getBoundingClientRect\(\)\.height\)\);/);
});

test('root scroller disables browser scroll anchoring during async layout changes', () => {
    assert.match(transitionsCss, /html\s*\{[\s\S]*overflow-anchor:\s*none;/);
});

test('floating nav hides when it touches visible content blocks including toc', () => {
    assert.match(floatingNavJs, /function touchesVisibleContentEdge\(\)/);
    assert.match(floatingNavJs, /\.freecat-post-toc-panel/);
    assert.match(floatingNavJs, /rectsTouch\(panelRect,\s*targetRect\)/);
    assert.match(floatingNavJs, /window\.addEventListener\('scroll',\s*scheduleFloatingNavLayout,\s*\{\s*passive:\s*true\s*\}\)/);
});

test('floating nav ignores blank pagination wrapper space on home page', () => {
    assert.match(floatingNavJs, /function getFloatingNavCollisionRects\(target\)/);
    assert.match(floatingNavJs, /target\.id !== 'pagination-buttons'/);
    assert.match(floatingNavJs, /Array\.from\(target\.children\)[\s\S]*\.map\(\(child\) => child\.getBoundingClientRect\(\)\)[\s\S]*\.filter\(isVisibleRect\)/);
    assert.match(floatingNavJs, /contentRects\.length \? contentRects : \[target\.getBoundingClientRect\(\)\]/);
});

test('floating nav does not hide against home list layout wrappers', () => {
    assert.match(floatingNavJs, /const isHomePage = document\.body && document\.body\.dataset\.page === 'home';/);
    assert.match(floatingNavJs, /isHomePage \? null : '\.freecat-home-posts-inner'/);
    assert.match(floatingNavJs, /isHomePage \? null : '#posts-list'/);
    assert.match(floatingNavJs, /\.filter\(Boolean\)\.join\(','\)/);
});

test('history navigation restores saved scroll positions after bfcache expires', () => {
    assert.match(mainJs, /function initScrollPositionMemory\(\)/);
    assert.match(mainJs, /scrollMemory\.init\(\{\s*window,\s*document,\s*platform,\s*runtime\s*\}\);/);
    assert.match(scrollMemoryJs, /platform\.sessionStorage\.setItem\(storageKey,\s*JSON\.stringify\(positions\)\)/);
    assert.match(scrollMemoryJs, /getNavigationType\(\) === 'back_forward'/);
    assert.match(scrollMemoryJs, /window\.addEventListener\('pagehide',\s*saveScrollPosition\)/);
    assert.match(scrollMemoryJs, /runtime\.setSaveScrollPosition\(saveScrollPosition\);/);
    assert.match(runtimeJs, /setSaveScrollPosition\(fn\)\s*\{[\s\S]*FreecatSaveScrollPosition/);
    assert.match(scrollMemoryJs, /if \(window\.location\.hash\) \{\s*finishPendingStateRestore\(\);\s*return;\s*\}/);
    assert.match(mainJs, /initScrollPositionMemory\(\);/);
});

test('shell history back marks framed pages for scroll restoration', () => {
    assert.match(scrollMemoryJs, /const restoreRequestStorageKey = 'freecat-scroll-restore-requests-v1';/);
    assert.match(scrollMemoryJs, /function consumeShellRestoreRequest\(\)\s*\{/);
    assert.match(scrollMemoryJs, /const hasShellRestoreRequest = consumeShellRestoreRequest\(\);[\s\S]*if \(isHistoryRestore\(\) \|\| hasShellRestoreRequest\) restoreScrollPosition\(\);/);
    assert.match(shellRouterJs, /const SCROLL_RESTORE_REQUEST_KEY = 'freecat-scroll-restore-requests-v1';/);
    assert.match(shellRouterJs, /function requestFrameScrollRestore\(path\)\s*\{/);
    assert.match(shellRouterJs, /if \(options\.restoreScroll\) requestFrameScrollRestore\(target\);/);
    assert.match(shellRouterJs, /syncFrameToLocation\(\{\s*restoreScroll:\s*true\s*\}\)/);
});

test('go back preserves the update sort switch state in history entries', () => {
    assert.match(mainJs, /const updateSortParam = 'updateSort';/);
    assert.match(mainJs, /params\.get\(updateSortParam\)\s*===\s*updateSortValue/);
    assert.match(mainJs, /runtime\.setSyncUpdateSortUrl\(syncUpdateSortUrl\);/);
    assert.match(runtimeJs, /setSyncUpdateSortUrl\(fn\)\s*\{[\s\S]*FreecatSyncUpdateSortUrl/);
    assert.match(mainJs, /applyTheme\(\);\s*initUpdateSortControls\(\);\s*initScrollPositionMemory\(\);/);
    assert.match(headBase, /html\.freecat-state-restore-pending body\s*\{[\s\S]*visibility:\s*hidden;/);
    assert.match(scrollMemoryJs, /document\.documentElement\.classList\.remove\('freecat-state-restore-pending'\);/);
    assert.match(mainJs, /function syncParentFrameHistory\(options = \{\}\)\s*\{/);
    assert.match(mainJs, /syncParentFrameHistory\(\{\s*push:\s*!options\.replace\s*\}\);/);
    assert.match(runtimeJs, /setSyncFrameHistory\(fn\)\s*\{[\s\S]*FreecatSyncFrameHistory/);
    assert.match(floatingNavJs, /syncCurrentHistoryEntry\(\);[\s\S]*canGoBackWithinSite\(\)[\s\S]*window\.history\.back\(\);/);
    assert.match(floatingNavJs, /url\.searchParams\.set\('updateSort',\s*'modified'\);/);
    assert.match(mainJs, /setUpdateSortMode\(updateSortSwitch,\s*useModifiedSort,\s*\{\s*replace:\s*true\s*\}\);/);
    assert.match(mainJs, /initDeferredImages\(\);\s*initUpdateSortControls\(\);/);
});

test('home soft pagination syncs shell history and saved scroll before post navigation', () => {
    assert.match(mainJs, /function getPaginationFetchUrl\(rawUrl\)\s*\{/);
    assert.match(mainJs, /url\.pathname === '\/' \|\| url\.pathname === '\/index\.html' \|\| url\.pathname === '\/index'/);
    assert.match(mainJs, /return '\/home\.html' \+ url\.search;/);
    assert.match(mainJs, /platform\.fetch\(getPaginationFetchUrl\(url\),\s*\{\s*credentials:\s*'same-origin'/);
    assert.match(mainJs, /window\.history\.pushState\(\{\s*\.\.\.\(window\.history\.state \|\| \{\}\),\s*freecatSoftNav:\s*true\s*\},\s*'',\s*url\);/);
    assert.match(mainJs, /syncParentFrameHistory\(\{\s*push:\s*true\s*\}\);/);
    assert.match(shellRouterJs, /runtime\.saveScrollPosition\(\);[\s\S]*runtime\.navigate\(url\.pathname \+ url\.search \+ url\.hash\);/);
});

test('header search opens a blank overlay and closes from blank space', () => {
    assert.match(mainJs, /function ensureSearchResultsOverlay\(\)\s*\{/);
    assert.match(mainJs, /const offset = header \? header\.offsetHeight : 0;/);
    assert.doesNotMatch(mainJs, /header\.offsetHeight \+ 12/);
    assert.doesNotMatch(mainJs, /rect\.bottom \+ 12/);
    assert.match(mainJs, /overlay\.id = 'search-results-overlay';/);
    assert.doesNotMatch(mainJs, /overlay\.className = '[^']*t-panel-slide/);
    assert.match(transitionsCss, /#search-results-overlay\s*\{[\s\S]*transform:\s*none !important;[\s\S]*transition:\s*none !important;/);
    assert.match(mainJs, /requestAnimationFrame\(\(\) => \{\s*searchContainer\.dataset\.open = 'true';\s*ensureSearchResultsOverlay\(\);/);
    assert.match(mainJs, /if \(e\.target === overlay\) \{\s*closeHeaderSearch\(true\);/);
    assert.match(mainJs, /const resultsContent = overlay && overlay\.querySelector\('\[data-search-results-content\]'\);/);
    assert.match(mainJs, /if \(!resultsContent \|\| !resultsContent\.contains\(e\.target\)\) \{\s*closeHeaderSearch\(true\);/);
    assert.match(mainJs, /const keepBlankOverlay = searchContainer[\s\S]*document\.body\.classList\.contains\('search-active'\)/);
    assert.match(mainJs, /overlay\.innerHTML = '';\s*updateSearchOverlayOffset\(overlay\);\s*overlay\.dataset\.open = 'true';/);
    assert.match(mainJs, /<div data-search-results-content class="max-w-\[1200px\]/);
});

test('direct URL entries use the home fallback for go back controls', () => {
    assert.match(floatingNavJs, /function hasSameOriginReferrer\(\)\s*\{/);
    assert.match(floatingNavJs, /new URL\(document\.referrer\)\.origin === window\.location\.origin/);
    assert.match(floatingNavJs, /function canGoBackWithinSite\(\)\s*\{/);
    assert.match(floatingNavJs, /window\.history\.state && window\.history\.state\.freecatSoftNav/);
    assert.match(floatingNavJs, /window\.history\.state && window\.history\.state\.freecatShell/);
    assert.match(floatingNavJs, /window\.parent\.history\.state\.freecatShell/);
    assert.match(floatingNavJs, /window\.parent\.history\.back\(\);[\s\S]*navigateWithinSite\(getUpdateSortFallbackUrl\(\),\s*\{\s*replace:\s*true\s*\}\);[\s\S]*return;[\s\S]*if \(canGoBackWithinSite\(\)\)/);
    assert.match(floatingNavJs, /\|\| hasSameOriginReferrer\(\);/);
    assert.match(floatingNavJs, /if \(canGoBackWithinSite\(\)\) \{\s*window\.history\.back\(\);/);
    assert.doesNotMatch(floatingNavJs, /window\.history\.length > 1/);
});

test('shell template bootstraps clean URLs without hash routing', () => {
    const shellTemplate = fs.readFileSync(path.join(__dirname, '../src/template_shell.html'), 'utf-8');

    assert.match(shellTemplate, /window\.__FREECAT_SHELL_DOCUMENT__ = true/);
    assert.equal(shellTemplate.includes("raw = legacyHash.replace(/^#/, '');"), true);
    assert.match(shellTemplate, /history\.replaceState\(history\.state,\s*'',\s*raw\)/);
    assert.match(shellTemplate, /url\.pathname === '\/home\.html'/);
    assert.doesNotMatch(shellTemplate, /String\(window\.location\.hash \|\| ''\)\.replace\(\/^#\/,\s*''\)/);
});

test('main delegates copy and floating navigation to focused assets', () => {
    assert.match(scriptsEnd, /src="\/assets\/code-copy\.js" defer><\/script>[\s\S]*src="\/assets\/floating-nav\.js" defer><\/script>[\s\S]*src="\/assets\/main\.js" defer/);
    assert.match(postTemplate, /src="\/assets\/code-copy\.js" defer><\/script>[\s\S]*src="\/assets\/floating-nav\.js" defer><\/script>[\s\S]*src="\/assets\/main\.js" defer/);
    assert.match(mainJs, /window\.FreecatCodeCopy/);
    assert.match(mainJs, /window\.FreecatFloatingNav/);
    assert.doesNotMatch(mainJs, /copy-checkbox/);
    assert.doesNotMatch(mainJs, /function touchesVisibleContentEdge/);
    assert.match(codeCopyJs, /checkbox\.getAttribute\('data-copy-source'\)/);
    assert.match(codeCopyJs, /checkbox\.getAttribute\('data-copy-target'\)/);
    assert.match(codeCopyJs, /textFromSource\(checkbox\) \|\| textFromTarget\(checkbox\) \|\| textFromCodeBlock\(checkbox\)/);
    assert.match(floatingNavJs, /function touchesVisibleContentEdge\(\)/);
});
