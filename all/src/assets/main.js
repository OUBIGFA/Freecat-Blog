document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // main.js —— 客户端装配根（composition root）。
    // 这里不实现具体功能，只做三件事：
    //   1. 校验依赖的全局模块已按 scripts-end.html 声明的顺序加载（fail-fast）；
    //   2. 提供少量跨模块共享的小工具（动画错峰 / CSS 时长读取 / 标签行缩放）；
    //   3. 按依赖顺序初始化各功能模块并传入依赖。
    //
    // 依赖的全局（均由 partials/scripts-end.html 统一声明加载顺序）：
    //   FreecatShared            shared.js
    //   FreecatPlatform          browser-platform.js
    //   FreecatRuntime           runtime.js
    //   FreecatThemeSystem       theme-system.js
    //   FreecatLazyImages        lazy-images.js
    //   PostCardTemplate         post-card-template.js
    //   FreecatSearchCore        search-core.js
    //   FreecatScrollMemory      scroll-memory.js
    //   FreecatNavAudio          nav-audio.js
    //   FreecatShellRouter       shell-router.js
    //   FreecatCodeCopy          code-copy.js
    //   FreecatFloatingNav       floating-nav.js
    //   FreecatLayoutMetrics     layout-metrics.js
    //   FreecatSeamlessPagination seamless-pagination.js
    //   FreecatUpdateSort        update-sort.js
    //   FreecatHeaderSearch      header-search.js
    //   FreecatSearchPage        search-page.js
    //   FreecatAvatarShadow      avatar-shadow.js
    // 不保留运行时回退 —— 真正缺失说明加载顺序被人破坏，应早失败。
    // ============================================================
    function requireGlobal(name, validate) {
        const value = window[name];
        if (!value || (validate && !validate(value))) {
            throw new Error(`${name} not loaded - check the script order in partials/scripts-end.html`);
        }
        return value;
    }

    const shared = requireGlobal('FreecatShared');
    const platform = requireGlobal('FreecatPlatform');
    const runtime = requireGlobal('FreecatRuntime');
    const searchCore = requireGlobal('FreecatSearchCore');
    const codeCopy = requireGlobal('FreecatCodeCopy', (m) => typeof m.init === 'function');
    const lazyImageFactory = requireGlobal('FreecatLazyImages', (m) => typeof m.createLazyImageController === 'function');
    const themeSystemFactory = requireGlobal('FreecatThemeSystem', (m) => typeof m.createThemeSystem === 'function');
    const scrollMemory = requireGlobal('FreecatScrollMemory', (m) => typeof m.init === 'function');
    const floatingNav = requireGlobal('FreecatFloatingNav', (m) => typeof m.init === 'function');
    const shellRouter = requireGlobal('FreecatShellRouter', (m) => typeof m.initShellRouter === 'function' && typeof m.initFramedNavigationBridge === 'function');
    const layoutMetricsModule = requireGlobal('FreecatLayoutMetrics', (m) => typeof m.init === 'function');
    const seamlessPagination = requireGlobal('FreecatSeamlessPagination', (m) => typeof m.init === 'function');
    const updateSortModule = requireGlobal('FreecatUpdateSort', (m) => typeof m.init === 'function');
    const headerSearchModule = requireGlobal('FreecatHeaderSearch', (m) => typeof m.init === 'function');
    const searchPageModule = requireGlobal('FreecatSearchPage', (m) => typeof m.init === 'function');
    const avatarShadowModule = requireGlobal('FreecatAvatarShadow', (m) => typeof m.init === 'function');

    codeCopy.init({ document, copyText: shared.copyText });

    // 运行上下文判定（外壳 + iframe 架构）：
    //   FRAMED  —— 当前文档被嵌在 iframe 里（即正文内容页），顶栏与音频由外壳负责，
    //              这里要跳过音频初始化与自身上边距测量（上边距由外壳喂入）。
    //   IS_SHELL —— 当前是常驻外壳文档（顶层且含内容 iframe），由它承载顶栏音频并驱动 iframe 路由。
    const FRAMED = window.self !== window.top;
    const contentFrame = document.getElementById('freecat-content-frame');
    const IS_SHELL = !FRAMED && !!contentFrame;

    function syncParentFrameHistory(options = {}) {
        if (!FRAMED) return;
        try {
            const parentRuntime = window.parent && window.parent.FreecatRuntime;
            if (parentRuntime && typeof parentRuntime.syncFrameHistory === 'function') {
                parentRuntime.syncFrameHistory(options);
                return;
            }
            const syncParent = window.parent && window.parent.FreecatSyncFrameHistory;
            if (typeof syncParent === 'function') syncParent(options);
        } catch (err) {}
    }

    const lazyImages = lazyImageFactory.createLazyImageController({
        document,
        window,
        Image,
        fallback: '/image/404.png'
    });
    lazyImages.installFallbackHandler();
    lazyImages.initDeferredImages();

    // ============================================================
    // 跨模块共享的小工具。
    // 共享的动画类（fadeInUp / t-panel-slide 等）在 transitions.css 中静态加载，
    // 这里仅保留运行时工具函数；错峰延迟的计算统一走 searchCore.getStaggerDelayMs。
    // ============================================================
    function applyStaggeredAnimations(selector, delayStep = 50, options = {}) {
        const elements = document.querySelectorAll(selector);
        const replay = options.replay !== false;
        elements.forEach((el, index) => {
            const delay = `${searchCore.getStaggerDelayMs(index, delayStep)}ms`;
            if (!replay && el.classList.contains('animate-fade-in-up')) {
                if (!el.style.animationDelay) el.style.animationDelay = delay;
                return;
            }
            el.classList.remove('animate-fade-in-up');
            el.style.animationDelay = delay;
            void el.offsetWidth;
            el.classList.add('animate-fade-in-up');
        });
    }

    function getCssDurationMs(variableName, fallback) {
        const raw = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
        if (!raw) return fallback;
        if (raw.endsWith('ms')) return parseFloat(raw);
        if (raw.endsWith('s')) return parseFloat(raw) * 1000;
        return fallback;
    }

    function fitTagRows() {
        const containers = document.querySelectorAll('.tags-fit');
        containers.forEach(container => {
            const inner = container.querySelector('.tags-fit-inner') || container;
            container.style.width = '';
            inner.style.transform = 'none';
            inner.style.transformOrigin = 'left center';
            inner.style.willChange = 'transform';
            const available = container.clientWidth;
            const scroll = inner.scrollWidth;
            if (available > 0 && scroll > available) {
                const scale = Math.max(0.1, available / scroll);
                inner.style.transform = `scale(${scale})`;
            }
        });
    }

    // ============================================================
    // 站内导航：默认走 runtime（外壳模式下由 shell-router 驱动 iframe）。
    // 内容页（FRAMED）把导航委托给父级外壳。
    // ============================================================
    function navigateWithinSite(url, options = {}) {
        runtime.navigate(url, options);
    }

    if (FRAMED) {
        runtime.setNavigate(function (targetHref, options = {}) {
            try {
                const parentRuntime = window.parent && window.parent.FreecatRuntime;
                if (parentRuntime && typeof parentRuntime.navigate === 'function') {
                    parentRuntime.navigate(targetHref, options);
                    return;
                }
                const parentNavigate = window.parent && window.parent.FreecatNavigate;
                if (typeof parentNavigate === 'function') {
                    parentNavigate(targetHref, options);
                    return;
                }
            } catch (err) {}
            window.location.href = targetHref;
        });
    }

    // ============================================================
    // 主题系统（深 / 浅 / 系统）
    // ============================================================
    const themeSystem = themeSystemFactory.createThemeSystem({
        document,
        window,
        platform,
        contentFrame,
        getCssDurationMs
    });
    const { applyTheme, prefersReducedMotion, resolveThemeIsDark, syncFrameTheme } = themeSystem;
    runtime.setApplyTheme(applyTheme);
    applyTheme();

    // ============================================================
    // 按依赖顺序装配各功能模块。
    // ============================================================
    const updateSort = updateSortModule.init({
        window,
        document,
        runtime,
        syncParentFrameHistory,
        framed: FRAMED,
        prefersReducedMotion
    });
    const initUpdateSortControls = updateSort.initUpdateSortControls;
    initUpdateSortControls();

    scrollMemory.init({ window, document, platform, runtime });

    const layoutMetrics = layoutMetricsModule.init({ window, document, framed: FRAMED });

    floatingNav.init({ window, document, runtime, framed: FRAMED, navigateWithinSite });

    // 搜索 / 标签索引加载器：顶栏搜索与搜索页共用一份缓存。
    const { loadSearchIndex, loadTagIndex } = searchCore.createIndexLoaders({ platform });

    const headerSearch = headerSearchModule.init({
        window,
        document,
        shared,
        searchCore,
        loadSearchIndex,
        lazyImages,
        getCssDurationMs,
        navigateWithinSite,
        isShell: IS_SHELL,
        contentFrame
    });
    const { closeHeaderSearch, closeTagMenu } = headerSearch;

    // 顶栏音频播放器只在外壳 / 独立页运行；内容页被嵌入 iframe 时由外壳统一承载，
    // 这里跳过，避免出现第二个相互抢占的 <audio>。
    if (!FRAMED) {
        const navAudioController = window.FreecatNavAudio;
        if (!navAudioController || typeof navAudioController.init !== 'function') {
            throw new Error('FreecatNavAudio not loaded - check the script order in partials/scripts-end.html');
        }
        navAudioController.init({
            window,
            document,
            platform,
            navAudioToggle: document.getElementById('nav-audio-toggle'),
            navAudio: document.getElementById('nav-audio'),
            isShell: IS_SHELL,
            contentFrame,
            closeTagMenu,
            closeHeaderSearch
        });
    }

    // [架构] 外壳 + iframe：站内导航改由外壳驱动满视口 iframe 做真实整页加载，
    // 顶栏与 <audio> 常驻外壳、永不被销毁 → 顶栏音频跨页真正无缝不断。
    function initFramedNavigationBridge() {
        shellRouter.initFramedNavigationBridge({ window, document, runtime });
    }
    if (FRAMED) initFramedNavigationBridge();
    if (IS_SHELL) {
        shellRouter.initShellRouter({
            window,
            document,
            platform,
            runtime,
            contentFrame,
            closeHeaderSearch,
            closeTagMenu,
            resolveThemeIsDark,
            syncFrameTheme
        });
    }

    seamlessPagination.init({
        window,
        document,
        platform,
        lazyImages,
        applyStaggeredAnimations,
        fitTagRows,
        syncParentFrameHistory,
        framed: FRAMED,
        getCssDurationMs
    });

    searchPageModule.init({
        window,
        document,
        searchCore,
        loadSearchIndex,
        loadTagIndex,
        lazyImages,
        fitTagRows,
        initUpdateSortControls
    });

    avatarShadowModule.init({ window, document, platform });

    fitTagRows();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTagRows);
    window.addEventListener('resize', fitTagRows, { passive: true });

    // Apply staggered animation to existing post cards on load
    if (document.getElementById('posts-list')) {
        applyStaggeredAnimations('.post-card', 50, { replay: false });
    }

    // 监听主题切换按钮
    themeSystem.bindThemeToggle();

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            applyTheme();
            layoutMetrics.updateContentTopOffset();
            layoutMetrics.scheduleHomeHeroMeasure();
            layoutMetrics.scheduleHomeSidebarFooterAvoid();
        }
    });

    // 核心：处理多标签页同步
    window.addEventListener('storage', (event) => {
        if (event.key === 'theme') {
            applyTheme({ animate: true });
        }
    });
});
