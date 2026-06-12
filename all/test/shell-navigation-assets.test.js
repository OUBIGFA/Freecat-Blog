const test = require('node:test');
const assert = require('node:assert/strict');
const {
    fs,
    path,
    mainJs,
    floatingNavJs,
    runtimeJs,
    scrollMemoryJs,
    navAudioJs,
    shellRouterJs,
    themeSystemJs,
    headerSearchJs,
    searchPageJs,
    seamlessPaginationJs,
    updateSortJs,
    layoutMetricsJs,
    postTemplate,
    searchTemplate,
    headBase,
    scriptsEnd,
    transitionsCss,
    codeCopyJs
} = require('../test-support/assets.js');

test('main animation checks reuse a single reduced-motion helper', () => {
    assert.equal((themeSystemJs.match(/function prefersReducedMotion\(\)/g) || []).length, 1);
    assert.equal((mainJs.match(/function prefersReducedMotion\(\)/g) || []).length, 0);
    assert.doesNotMatch(mainJs, /const prefersReducedMotion = \(\) =>/);
});

test('theme switching uses one page-cover transition and syncs the shell iframe', () => {
    assert.doesNotMatch(themeSystemJs, /startViewTransition/);
    assert.match(themeSystemJs, /function syncFrameTheme\(isDark, options = \{\}\)\s*\{/);
    assert.match(themeSystemJs, /contentFrame\.contentWindow\.FreecatRuntime/);
    assert.match(themeSystemJs, /frameRuntime\.applyTheme\(\{\s*animate:\s*!!options\.animate,\s*suppressTransitions:\s*!!options\.suppressTransitions\s*\}\);/);
    assert.match(themeSystemJs, /contentFrame\.contentWindow\.FreecatApplyTheme/);
    assert.match(themeSystemJs, /syncFrameTheme\(isDark,\s*\{\s*animate:\s*false,\s*suppressTransitions:\s*true\s*\}\);/);
    assert.match(themeSystemJs, /frameDoc\.documentElement\.classList\.toggle\('dark', isDark\);/);
    assert.match(transitionsCss, /@keyframes themeCoverFade/);
    assert.match(transitionsCss, /html\.theme-transitioning::before/);
    assert.match(transitionsCss, /z-index:\s*2147483647/);
    assert.match(transitionsCss, /html\.theme-transitioning \*/);
    // iframe 内容页接受外壳同步时的无遮罩统一抑制（不能再各元素独立过渡）
    assert.match(transitionsCss, /html\.theme-instant \*/);
    assert.doesNotMatch(transitionsCss, /html\.theme-instant::before/);
    assert.match(transitionsCss, /transition:\s*none !important/);
    assert.doesNotMatch(transitionsCss, /html\.theme-transitioning \.prose/);
    assert.doesNotMatch(transitionsCss, /html\.theme-transitioning \.hljs/);
    assert.doesNotMatch(transitionsCss, /transition-property:\s*[\s\S]*color,[\s\S]*background-color,[\s\S]*border-color/);
    assert.doesNotMatch(transitionsCss, /box-shadow !important/);
    assert.match(runtimeJs, /setApplyTheme\(fn\)\s*\{[\s\S]*FreecatApplyTheme/);
    assert.match(mainJs, /runtime\.setApplyTheme\(applyTheme\);/);
    assert.match(shellRouterJs, /syncFrameTheme\(resolveThemeIsDark\(\)\);/);
});

test('search page result count reserves space before rendering the numeric badge', () => {
    assert.match(searchPageJs, /function setSearchResultsCount\(count\)\s*\{/, 'search-page.js owns the results-count badge');
    assert.match(searchPageJs, /value\.textContent\s*=\s*String\(count\);/, 'count writes into the reserved value span');
    assert.match(searchPageJs, /resultsCountDisplay\.dataset\.countReady\s*=\s*'true';/, 'countReady flips after the number is set');
    assert.match(searchPageJs, /setSearchResultsCount\(results\.length\);/, 'badge updates from real result counts');
    assert.doesNotMatch(searchPageJs, /resultsCountDisplay\.textContent\s*=\s*`\(\$\{results\.length\} results\)`;/, 'no legacy "(N results)" text format');
    assert.match(searchTemplate, /id="results-count" class="freecat-results-count" data-count-ready="false"/);
    assert.match(searchTemplate, /class="freecat-results-count-icon"[\s\S]*M24 12L18\.3431 17\.6568/);
    assert.match(searchTemplate, /class="freecat-results-count-value"/);
    assert.match(transitionsCss, /\.freecat-results-count\s*\{[\s\S]*width:\s*1\.25rem;[\s\S]*height:\s*1\.25rem;[\s\S]*background:\s*rgba\(148,\s*163,\s*184,\s*0\.18\);[\s\S]*color:\s*#475569;/);
    assert.match(transitionsCss, /\.freecat-results-count\[data-count-ready="true"\]\s+\.freecat-results-count-value\s*\{[\s\S]*opacity:\s*1;/);
});

test('shell router uses clean history URLs for framed navigation', () => {
    assert.match(mainJs, /function navigateWithinSite\(url, options = \{\}\)\s*\{/, 'main.js owns the navigateWithinSite entry point');
    assert.match(runtimeJs, /setNavigate\(fn\)\s*\{[\s\S]*FreecatNavigate/);
    assert.equal(headerSearchJs.includes("navigateWithinSite(`/search?q=${encodeURIComponent(searchInput.value.trim())}`);"), true, 'header search Enter key routes through navigateWithinSite');
    assert.match(headerSearchJs, /if \(e\.key === 'Enter' && searchInput\.value\.trim\(\)\) \{[\s\S]*?e\.preventDefault\(\);[\s\S]*?navigateWithinSite\(`\/search\?q=\$\{encodeURIComponent\(searchInput\.value\.trim\(\)\)\}`\);[\s\S]*?closeHeaderSearch\(true\);[\s\S]*?\}/, 'Enter closes the panel after navigating');
    assert.match(shellRouterJs, /function publicPathToContentPath\(raw\)\s*\{/);
    assert.match(shellRouterJs, /function contentPathToPublicPath\(raw\)\s*\{/);
    assert.match(shellRouterJs, /function ensureShellHistoryState\(\)\s*\{/);
    assert.match(shellRouterJs, /frame\.contentWindow\.location\.replace\(target\);/, 'iframe navigations replace, never add joint history entries');
    assert.match(shellRouterJs, /window\.history\[method\]\(shellState\(window\.history\.state\),\s*'',\s*publicPath\);/);
    assert.match(shellRouterJs, /syncFrameToLocation\(\{\s*restoreScroll:\s*true\s*\}\);/);
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
    assert.match(mainJs, /const navAudioController = window\.FreecatNavAudio;/, 'main.js wires nav audio explicitly');
    assert.match(mainJs, /if \(!FRAMED\) \{[\s\S]*?navAudioController\.init\(\{/, 'framed content pages skip the nav audio player');
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

test('header tag menu closes on pointerdown inside the shell iframe', () => {
    assert.match(headerSearchJs, /function closeHeaderPanelsFromFramePointerDown\(\)\s*\{[\s\S]*closeTagMenu\(\);[\s\S]*closeHeaderSearch\(true\);[\s\S]*\}/, 'iframe pointerdown collapses both header panels');
    assert.match(headerSearchJs, /function bindHeaderFramePointerDown\(\)\s*\{/, 'header-search.js owns the frame pointerdown binding');
    assert.match(headerSearchJs, /headerFramePointerDownDocument\.addEventListener\('pointerdown', closeHeaderPanelsFromFramePointerDown, true\);/, 'binds in capture phase on the frame document');
    assert.match(headerSearchJs, /contentFrame\.addEventListener\('load', bindHeaderFramePointerDown\);/, 'rebinds after every frame navigation');
    assert.match(headerSearchJs, /if \(isShell && contentFrame\) \{[\s\S]*bindHeaderFramePointerDown\(\);[\s\S]*\}/, 'binding only runs in the shell document');
});

test('header tag menu uses a restrained close feedback', () => {
    assert.match(transitionsCss, /\.tag-menu-panel\.is-closing\s*\{[\s\S]*transform:\s*translateY\(-2px\) scale\(var\(--dropdown-closing-scale\)\);[\s\S]*filter:\s*blur\(0\.35px\);/);
    assert.match(transitionsCss, /\.tag-menu-panel\.is-closing\s*\{[\s\S]*filter var\(--dropdown-close-dur\) ease-out;/);
    assert.match(transitionsCss, /\.tag-menu-panel\.is-closing \.tag-menu-item\s*\{[\s\S]*opacity:\s*0;[\s\S]*transform:\s*translateY\(-2px\);[\s\S]*opacity 90ms ease-out,/);
});

test('header tag menu item feedback stays light and responsive', () => {
    assert.match(transitionsCss, /\.tag-menu-panel\.is-open \.tag-menu-item\s*\{[\s\S]*background-color 220ms cubic-bezier\(0\.22, 1, 0\.36, 1\),[\s\S]*transition-delay:[\s\S]*0ms,[\s\S]*0ms,[\s\S]*0ms;/);
    assert.match(transitionsCss, /\.tag-menu-panel\.is-open \.tag-menu-item:hover,[\s\S]*\.tag-menu-panel\.is-open \.tag-menu-item:focus-visible\s*\{[\s\S]*background-color:\s*rgba\(148, 163, 184, 0\.1\);/);
    assert.match(transitionsCss, /\.dark \.tag-menu-panel\.is-open \.tag-menu-item:hover,[\s\S]*\.dark \.tag-menu-panel\.is-open \.tag-menu-item:focus-visible\s*\{[\s\S]*background-color:\s*rgba\(148, 163, 184, 0\.12\);/);
    assert.doesNotMatch(transitionsCss, /\.tag-menu-item:hover[\s\S]*slate-800/);
});

test('header tag menu count badges share the widest build-time width', () => {
    assert.match(transitionsCss, /\.tag-menu-count\s*\{[\s\S]*inline-size:\s*calc\(\(var\(--tag-menu-count-digits, 1\) \* 1ch\) \+ 1rem\);/);
    assert.doesNotMatch(transitionsCss, /\.tag-menu-count\s*\{[\s\S]*font-variant-numeric:/);
});

test('untagged count badge has a stronger dark theme contrast', () => {
    assert.match(transitionsCss, /\.tag-menu-count-untagged\s*\{[\s\S]*background:\s*rgba\(148, 163, 184, 0\.18\);[\s\S]*color:\s*#475569;/);
    assert.match(transitionsCss, /\.dark \.tag-menu-count-untagged\s*\{[\s\S]*background:\s*rgba\(203, 213, 225, 0\.24\);[\s\S]*color:\s*#f8fafc;/);
});

test('fixed header has a stable css height before runtime measurement', () => {
    assert.match(transitionsCss, /header\.fixed\s*\{[\s\S]*height:\s*var\(--freecat-header-height\);/);
    assert.match(transitionsCss, /header\.fixed\s+\.header-blur-target\s*\{[\s\S]*height:\s*100%;/);
    assert.doesNotMatch(transitionsCss, /(?:^|\n)header\s*\{[\s\S]*height:\s*var\(--freecat-header-height\);/);
});

test('mobile fixed header lets the brand title shrink before nav buttons overflow', () => {
    assert.match(transitionsCss, /@media \(max-width:\s*767px\)\s*\{[\s\S]*header\.fixed\s*\{[\s\S]*padding-left:\s*0\.5rem\s*!important;[\s\S]*padding-right:\s*0\.5rem\s*!important;/);
    assert.match(transitionsCss, /header\.fixed\s+\.header-blur-target\s*>\s*a:first-child\s*\{[\s\S]*flex:\s*1 1 auto;[\s\S]*max-width:\s*none;[\s\S]*min-width:\s*0;/);
    assert.match(transitionsCss, /header\.fixed\s+\.header-blur-target\s*>\s*div:first-of-type\s*\{[\s\S]*flex:\s*0 0 auto;[\s\S]*gap:\s*0\.375rem;/);
});

test('header offset sync ignores impossible measured heights', () => {
    assert.match(layoutMetricsJs, /function normalizeHeaderHeight\(measuredHeight\)\s*\{/, 'layout-metrics.js owns header height normalization');
    assert.match(layoutMetricsJs, /height <= 120 \? height : fallbackHeight/, 'measured heights above 120px fall back');
    assert.match(layoutMetricsJs, /const fallbackHeight = win\.innerWidth < 768 \? 61 : 73;/, 'fallback heights differ between mobile and desktop');
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
    assert.match(floatingNavJs, /'\.post-card'/);
    assert.match(floatingNavJs, /isHomePage \? null : '\.freecat-home-posts-inner'/);
    assert.match(floatingNavJs, /isHomePage \? null : '#posts-list'/);
    assert.match(floatingNavJs, /\.filter\(Boolean\)\.join\(','\)/);
});

test('history navigation restores saved scroll positions after bfcache expires', () => {
    assert.match(mainJs, /scrollMemory\.init\(\{\s*window,\s*document,\s*platform,\s*runtime,\s*shared\s*\}\);/, 'main.js wires scroll memory with explicit deps');
    assert.match(scrollMemoryJs, /platform\.sessionStorage\.setItem\(storageKey,\s*JSON\.stringify\(positions\)\)/);
    assert.match(scrollMemoryJs, /getNavigationType\(\) === 'back_forward'/);
    assert.match(scrollMemoryJs, /window\.addEventListener\('pagehide',\s*saveScrollPosition\)/);
    assert.match(scrollMemoryJs, /runtime\.setSaveScrollPosition\(saveScrollPosition\);/);
    assert.match(runtimeJs, /setSaveScrollPosition\(fn\)\s*\{[\s\S]*FreecatSaveScrollPosition/);
    assert.match(scrollMemoryJs, /if \(window\.location\.hash\) \{\s*return;\s*\}/);
});

test('shell history back marks framed pages for scroll restoration', () => {
    assert.match(scrollMemoryJs, /const restoreRequestStorageKey = 'freecat-scroll-restore-requests-v1';/);
    assert.match(scrollMemoryJs, /function hasShellRestoreRequest\(\)\s*\{/);
    assert.match(scrollMemoryJs, /if \(isHistoryRestore\(\) \|\| hasShellRestoreRequest\(\)\) restoreScrollPosition\(\);/);
    assert.match(scrollMemoryJs, /if \(isHistoryRestore\(event\) \|\| hasShellRestoreRequest\(\)\) restoreScrollPosition\(\);/, 'pageshow re-checks the restore request');
    assert.match(shellRouterJs, /const SCROLL_RESTORE_REQUEST_KEY = 'freecat-scroll-restore-requests-v1';/);
    assert.match(shellRouterJs, /function requestFrameScrollRestore\(path\)\s*\{/);
    assert.match(shellRouterJs, /if \(options\.restoreScroll\) \{[\s\S]*?requestFrameScrollRestore\(target\);[\s\S]*?clearFrameScrollRestore\(target\)[\s\S]*?\}/);
    assert.match(shellRouterJs, /window\.addEventListener\('popstate', \(\) => \{\s*syncFrameToLocation\(\{\s*restoreScroll:\s*true\s*\}\);\s*\}\);/);
});

test('scroll restore keys stay platform independent across shell, frame and head guard', () => {
    // Cloudflare Pages 会把 *.html 308 重定向成无后缀路径（/home.html → /home），
    // 三个消费方必须共用 shared.normalizeScrollPageKey，否则恢复请求 key 与
    // iframe 实际地址对不上，返回首页会被重置回顶部。
    assert.match(scrollMemoryJs, /return shared\.normalizeScrollPageKey\(window\.location\.pathname, window\.location\.search\);/, 'frame pages derive scroll keys from the shared normalizer');
    assert.match(shellRouterJs, /return shared\.normalizeScrollPageKey\(url\.pathname, url\.search\);/, 'shell restore requests derive keys from the shared normalizer');
    assert.match(shellRouterJs, /initShellRouter\(\{\s*window,\s*document,\s*platform,\s*runtime,\s*shared,/, 'shell router declares the shared dependency');
    assert.match(mainJs, /shellRouter\.initShellRouter\(\{\s*window,\s*document,\s*platform,\s*runtime,\s*shared,/, 'main.js injects shared into the shell router');
});

test('go back preserves the update sort switch state in history entries', () => {
    assert.match(updateSortJs, /const updateSortParam = 'updateSort';/, 'update-sort.js owns the URL parameter');
    assert.match(updateSortJs, /params\.get\(updateSortParam\)\s*===\s*updateSortValue/, 'switch state restores from the URL');
    assert.match(updateSortJs, /runtime\.setSyncUpdateSortUrl\(syncUpdateSortUrl\);/, 'URL sync is exposed through the runtime bridge');
    assert.match(runtimeJs, /setSyncUpdateSortUrl\(fn\)\s*\{[\s\S]*FreecatSyncUpdateSortUrl/);
    assert.match(mainJs, /applyTheme\(\);[\s\S]*?initUpdateSortControls\(\);[\s\S]*?scrollMemory\.init\(/, 'theme applies before sort controls and scroll memory init');
    assert.doesNotMatch(headBase, /freecat-state-restore-pending/);
    assert.doesNotMatch(postTemplate, /freecat-state-restore-pending/);
    assert.match(mainJs, /function syncParentFrameHistory\(options = \{\}\)\s*\{/, 'main.js owns the parent-frame history bridge');
    assert.match(updateSortJs, /syncParentFrameHistory\(\{\s*push:\s*!options\.replace\s*\}\);/, 'sort toggles sync the shell history');
    assert.match(runtimeJs, /setSyncFrameHistory\(fn\)\s*\{[\s\S]*FreecatSyncFrameHistory/);
    assert.match(floatingNavJs, /syncCurrentHistoryEntry\(\);[\s\S]*canGoBackWithinSite\(\)[\s\S]*window\.history\.back\(\);/);
    assert.match(floatingNavJs, /url\.searchParams\.set\('updateSort',\s*'modified'\);/);
    assert.match(updateSortJs, /setUpdateSortMode\(updateSortSwitch,\s*useModifiedSort,\s*\{\s*replace:\s*true\s*\}\);/, 'manual toggles replace instead of pushing history');
    assert.match(searchPageJs, /initDeferredImages\(\);\s*initUpdateSortControls\(\);/, 'search page re-binds sort controls after rendering results');
});

test('home soft pagination syncs shell history and saved scroll before post navigation', () => {
    assert.match(seamlessPaginationJs, /function getPaginationFetchUrl\(rawUrl\)\s*\{/, 'seamless-pagination.js owns the fetch URL mapping');
    assert.match(seamlessPaginationJs, /url\.pathname === '\/' \|\| url\.pathname === '\/index\.html' \|\| url\.pathname === '\/index'/, 'home aliases map to home');
    assert.match(seamlessPaginationJs, /return '\/home' \+ url\.search;/, 'home content is fetched from /home');
    assert.match(seamlessPaginationJs, /platform\.fetch\(getPaginationFetchUrl\(url\),\s*\{\s*credentials:\s*'same-origin'/, 'page fetches keep same-origin credentials');
    assert.match(seamlessPaginationJs, /const method = framed \? 'replaceState' : 'pushState';/, 'framed pagination replaces instead of pushing iframe history');
    assert.match(seamlessPaginationJs, /win\.history\[method\]\(\{\s*\.\.\.\(win\.history\.state \|\| \{\}\),\s*freecatSoftNav:\s*true\s*\},\s*'',\s*url\);/, 'soft navigation marks history entries');
    assert.match(seamlessPaginationJs, /syncParentFrameHistory\(\{\s*push:\s*true\s*\}\);/, 'pagination pushes into the shell history');
    assert.match(shellRouterJs, /runtime\.saveScrollPosition\(\);[\s\S]*runtime\.navigate\(url\.pathname \+ url\.search \+ url\.hash\);/);
});

test('header search opens a blank overlay and closes from blank space', () => {
    assert.match(headerSearchJs, /function ensureSearchResultsOverlay\(\)\s*\{/, 'header-search.js owns the results overlay');
    assert.match(headerSearchJs, /const offset = header \? header\.offsetHeight : 0;/, 'overlay sits flush under the header');
    assert.doesNotMatch(headerSearchJs, /header\.offsetHeight \+ 12/);
    assert.doesNotMatch(headerSearchJs, /rect\.bottom \+ 12/);
    assert.match(headerSearchJs, /overlay\.id = 'search-results-overlay';/);
    assert.doesNotMatch(headerSearchJs, /overlay\.className = '[^']*t-panel-slide/, 'overlay never slides as a panel');
    assert.match(transitionsCss, /#search-results-overlay\s*\{[\s\S]*transform:\s*none !important;[\s\S]*transition:\s*none !important;/);
    assert.match(headerSearchJs, /requestAnimationFrame\(\(\) => \{\s*if \(!searchContainer\.classList\.contains\('flex'\) \|\| !doc\.body\.classList\.contains\('search-active'\)\) return;\s*searchContainer\.dataset\.open = 'true';\s*ensureSearchResultsOverlay\(\);/, 'blank overlay appears as soon as search opens');
    assert.match(headerSearchJs, /if \(e\.target === overlay\) \{\s*closeHeaderSearch\(true\);/, 'clicking the blank overlay closes search');
    assert.match(headerSearchJs, /const resultsContent = overlay && overlay\.querySelector\('\[data-search-results-content\]'\);/);
    assert.match(headerSearchJs, /if \(!resultsContent \|\| !resultsContent\.contains\(e\.target\)\) \{\s*closeHeaderSearch\(true\);/);
    assert.match(headerSearchJs, /const keepBlankOverlay = searchContainer[\s\S]*doc\.body\.classList\.contains\('search-active'\)/);
    assert.match(headerSearchJs, /overlay\.innerHTML = '';\s*updateSearchOverlayOffset\(overlay\);\s*overlay\.dataset\.open = 'true';/);
    assert.match(headerSearchJs, /<div data-search-results-content class="max-w-\[1200px\]/);
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
    assert.match(shellTemplate, /data-freecat-shell-root="true"/);
    assert.equal(shellTemplate.includes("raw = legacyHash.replace(/^#/, '');"), true);
    assert.match(shellTemplate, /history\.replaceState\(history\.state,\s*'',\s*raw\)/);
    assert.match(shellTemplate, /url\.pathname === '\/home\.html'/);
    assert.doesNotMatch(shellTemplate, /String\(window\.location\.hash \|\| ''\)\.replace\(\/^#\/,\s*''\)/);
});

test('main delegates copy and floating navigation to focused assets', () => {
    assert.match(scriptsEnd, /src="\/assets\/code-copy\.js" defer><\/script>[\s\S]*src="\/assets\/floating-nav\.js" defer><\/script>[\s\S]*src="\/assets\/main\.js" defer/, 'script order keeps main.js last');
    assert.match(postTemplate, /<!-- INCLUDE:scripts-end -->/, 'post template reuses the single script list partial');
    assert.doesNotMatch(postTemplate, /src="\/assets\/main\.js"/, 'post template must not duplicate the shared script list');
    assert.match(mainJs, /requireGlobal\('FreecatCodeCopy'/, 'main.js fails fast when code-copy.js is missing');
    assert.match(mainJs, /requireGlobal\('FreecatFloatingNav'/, 'main.js fails fast when floating-nav.js is missing');
    assert.doesNotMatch(mainJs, /copy-checkbox/, 'copy控件实现不再出现在 main.js');
    assert.doesNotMatch(mainJs, /function touchesVisibleContentEdge/, 'floating nav 实现不再出现在 main.js');
    assert.match(codeCopyJs, /checkbox\.getAttribute\('data-copy-source'\)/);
    assert.match(codeCopyJs, /checkbox\.getAttribute\('data-copy-target'\)/);
    assert.match(codeCopyJs, /textFromSource\(checkbox\) \|\| textFromTarget\(checkbox\) \|\| textFromCodeBlock\(checkbox\)/);
    assert.match(floatingNavJs, /function touchesVisibleContentEdge\(\)/);
});
