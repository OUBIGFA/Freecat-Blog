document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // 共享工具：构建期 build.js 与浏览器期共用，避免重复实现
    // shared.js 必须先于 main.js 加载（partials/scripts-end.html 与
    // template_post.html 的 <script> 顺序已保证这点）。
    // 不再保留运行时回退 —— 真正缺失说明加载顺序被人破坏，应早失败。
    // ============================================================
    const shared = window.FreecatShared;
    if (!shared) throw new Error('FreecatShared not loaded — ensure shared.js loads before main.js');
    const platform = window.FreecatPlatform;
    if (!platform) throw new Error('FreecatPlatform not loaded — ensure browser-platform.js loads before main.js');
    const runtime = window.FreecatRuntime;
    if (!runtime) throw new Error('FreecatRuntime not loaded - ensure runtime.js loads before main.js');
    const { escapeHtml, processTitleHtml, renderTagSpan, copyText } = shared;

    // ============================================================
    // [Feature] 代码块复制按钮（首页/全部/搜索页可能也有代码片段）
    // ============================================================

    document.addEventListener('change', (e) => {
        if (!e.target.classList.contains('copy-checkbox')) return;
        const checkbox = e.target;
        if (!checkbox.checked) return;

        const container = checkbox.closest('.code-block-container');
        if (!container) {
            checkbox.checked = false;
            return;
        }

        const codeElement = container.querySelector('.code-content code') ||
            container.querySelector('pre code') ||
            container.querySelector('code');
        if (!codeElement) {
            checkbox.checked = false;
            return;
        }

        const code = codeElement.textContent || '';
        copyText(code).then(() => {
            setTimeout(() => {
                checkbox.checked = false;
            }, 1000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            checkbox.checked = false;
        });
    });
    const html = document.documentElement;

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

    const lazyImageFactory = window.FreecatLazyImages;
    if (!lazyImageFactory || typeof lazyImageFactory.createLazyImageController !== 'function') {
        throw new Error('FreecatLazyImages not loaded - ensure lazy-images.js loads before main.js');
    }
    const lazyImages = lazyImageFactory.createLazyImageController({
        document,
        window,
        Image,
        fallback: '/image/404.png'
    });
    const { initDeferredImages, unobserveDeferredImages } = lazyImages;
    lazyImages.installFallbackHandler();
    initDeferredImages();

    // ============================================================
    // [Feature] 全局动画样式 + 通用工具
    // 注：所有共享的动画类（fadeInUp / t-panel-slide / t-dropdown /
    //     page-transitioning-* / icon-breathe / body.search-active 遮罩）
    //     已迁移到 src/assets/transitions.css，由 head-base.html 静态加载。
    //     这里仅保留运行时工具函数。
    // ============================================================
    function applyStaggeredAnimations(selector, delayStep = 120, options = {}) {
        const elements = document.querySelectorAll(selector);
        const replay = options.replay !== false;
        elements.forEach((el, index) => {
            const delay = `${getStaggerDelayMs(index, delayStep)}ms`;
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

    function getStaggerDelayMs(index, delayStep = 120) {
        return Math.min(index, 10) * delayStep;
    }

    function getCssDurationMs(variableName, fallback) {
        const raw = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
        if (!raw) return fallback;
        if (raw.endsWith('ms')) return parseFloat(raw);
        if (raw.endsWith('s')) return parseFloat(raw) * 1000;
        return fallback;
    }

    function initScrollPositionMemory() {
        const scrollMemory = window.FreecatScrollMemory;
        if (!scrollMemory || typeof scrollMemory.init !== 'function') {
            throw new Error('FreecatScrollMemory not loaded - ensure scroll-memory.js loads before main.js');
        }
        scrollMemory.init({ window, document, platform, runtime });
    }

    function initFloatingNavButtons() {
        const floatingNavPanel = document.querySelector('.freecat-floating-nav-panel');
        const backToTopBtn = document.getElementById('back-to-top');
        const scrollToBottomBtn = document.getElementById('scroll-to-bottom');
        const floatingGoBackBtn = document.getElementById('floating-go-back');
        const goBackLinks = document.querySelectorAll('[data-go-back]');

        if (!backToTopBtn && !scrollToBottomBtn && !floatingGoBackBtn && !goBackLinks.length) return;

        function getUpdateSortFallbackUrl() {
            const controls = document.querySelector('[data-update-sort-controls]');
            const activeSwitch = controls ? controls.querySelector('[data-update-sort-switch]') : null;
            if (!activeSwitch || activeSwitch.getAttribute('aria-checked') !== 'true') return '/';

            const url = new URL('/', window.location.origin);
            url.searchParams.set('updateSort', 'modified');
            return url.pathname + url.search;
        }

        function syncCurrentHistoryEntry() {
            runtime.syncUpdateSortUrl({ replace: true });
        }

        function hasSameOriginReferrer() {
            if (!document.referrer) return false;
            try {
                return new URL(document.referrer).origin === window.location.origin;
            } catch (err) {
                return false;
            }
        }

        function canGoBackWithinSite() {
            return !!(window.history.state && window.history.state.freecatSoftNav)
                || !!(window.history.state && window.history.state.freecatShell)
                || hasSameOriginReferrer();
        }

        function goBackOrHome() {
            syncCurrentHistoryEntry();
            if (FRAMED) {
                try {
                    if (window.parent && window.parent.history && window.parent.history.state && window.parent.history.state.freecatShell) {
                        window.parent.history.back();
                        return;
                    }
                } catch (err) {}
                navigateWithinSite(getUpdateSortFallbackUrl(), { replace: true });
                return;
            }
            if (canGoBackWithinSite()) {
                window.history.back();
                return;
            }

            navigateWithinSite(getUpdateSortFallbackUrl());
        }

        let floatingNavLayoutFrame = 0;

        function isVisibleRect(rect) {
            return rect.width > 0
                && rect.height > 0
                && rect.bottom > 0
                && rect.right > 0
                && rect.top < window.innerHeight
                && rect.left < window.innerWidth;
        }

        function rectsTouch(a, b) {
            return a.left <= b.right
                && a.right >= b.left
                && a.top <= b.bottom
                && a.bottom >= b.top;
        }

        function getFloatingNavCollisionTargets() {
            const isHomePage = document.body && document.body.dataset.page === 'home';
            return document.querySelectorAll([
                'article',
                '.freecat-post-toc-panel',
                isHomePage ? null : '.freecat-home-sidebar',
                isHomePage ? null : '.freecat-home-posts-inner',
                '.layout-content-container',
                '[data-all-toolbar]',
                isHomePage ? null : '#posts-list',
                '#pagination-buttons'
            ].filter(Boolean).join(','));
        }

        function getFloatingNavCollisionRects(target) {
            if (target.id !== 'pagination-buttons') return [target.getBoundingClientRect()];

            const contentRects = Array.from(target.children)
                .map((child) => child.getBoundingClientRect())
                .filter(isVisibleRect);

            return contentRects.length ? contentRects : [target.getBoundingClientRect()];
        }

        function touchesVisibleContentEdge() {
            const panelRect = floatingNavPanel.getBoundingClientRect();
            if (!isVisibleRect(panelRect)) return false;

            return Array.from(getFloatingNavCollisionTargets()).some((target) => {
                if (target === floatingNavPanel || floatingNavPanel.contains(target)) return false;
                return getFloatingNavCollisionRects(target).some((targetRect) => {
                    return isVisibleRect(targetRect) && rectsTouch(panelRect, targetRect);
                });
            });
        }

        function updateFloatingNavLayout() {
            floatingNavLayoutFrame = 0;
            if (!floatingNavPanel || !floatingNavPanel.isConnected) return;

            const shouldHide = window.innerWidth < 1024 || touchesVisibleContentEdge();

            floatingNavPanel.classList.toggle('is-layout-hidden', shouldHide);
            floatingNavPanel.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
            if ('inert' in floatingNavPanel) floatingNavPanel.inert = shouldHide;
        }

        function scheduleFloatingNavLayout() {
            if (floatingNavLayoutFrame) return;
            floatingNavLayoutFrame = window.requestAnimationFrame(updateFloatingNavLayout);
        }

        function getContainerBottomScrollY() {
            const container = document.querySelector('[data-floating-nav-container]')
                || document.querySelector('main > div')
                || document.querySelector('main')
                || document.querySelector('article')
                || document.querySelector('.layout-container')
                || document.body;
            const scrollingElement = document.scrollingElement || document.documentElement;
            const docHeight = scrollingElement ? scrollingElement.scrollHeight : 0;
            const maxScroll = Math.max(0, docHeight - window.innerHeight);

            if (!container) return maxScroll;

            const rect = container.getBoundingClientRect();
            let target = rect.bottom + window.pageYOffset - window.innerHeight;
            if (target > maxScroll) target = maxScroll;
            if (target < 0) target = 0;
            return target;
        }

        [backToTopBtn, scrollToBottomBtn, floatingGoBackBtn].forEach((btn) => {
            if (btn) btn.classList.remove('is-hidden');
        });

        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const tocContainer = document.getElementById('toc-container');
                if (tocContainer) tocContainer.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        if (scrollToBottomBtn) {
            scrollToBottomBtn.addEventListener('click', () => {
                let startY = window.scrollY;
                let startTime = performance.now();
                let lastTarget = getContainerBottomScrollY();
                let distance = Math.abs(lastTarget - startY);
                let duration = Math.min(2200, Math.max(700, distance * 0.35));

                function easeOutCubic(t) {
                    return 1 - Math.pow(1 - t, 3);
                }

                function animate(now) {
                    const target = getContainerBottomScrollY();
                    if (Math.abs(target - lastTarget) > 1) lastTarget = target;

                    const elapsed = now - startTime;
                    const t = Math.min(1, elapsed / duration);
                    const nextY = startY + (lastTarget - startY) * easeOutCubic(t);
                    window.scrollTo(0, nextY);

                    const remaining = Math.abs(window.scrollY - lastTarget);
                    if (t < 1 || remaining > 1) {
                        if (t >= 1) {
                            startY = window.scrollY;
                            startTime = now;
                            distance = Math.abs(lastTarget - startY);
                            duration = Math.min(900, Math.max(240, distance * 0.45));
                        }
                        requestAnimationFrame(animate);
                    }
                }

                requestAnimationFrame(animate);
            });
        }

        if (floatingGoBackBtn) {
            floatingGoBackBtn.addEventListener('click', () => {
                goBackOrHome();
            });
        }

        goBackLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                goBackOrHome();
            });
        });

        updateFloatingNavLayout();
        window.addEventListener('scroll', scheduleFloatingNavLayout, { passive: true });
        window.addEventListener('resize', scheduleFloatingNavLayout);
        window.addEventListener('load', scheduleFloatingNavLayout);
        window.addEventListener('pageshow', scheduleFloatingNavLayout);
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(scheduleFloatingNavLayout);
        }
    }

    // ============================================================
    // [Fix] 固定顶栏遮挡内容：按实际 header 高度动态同步内容区上边距
    // 安全间距与 transitions.css 中 --freecat-header-safe-gap 的下限保持一致：
    // 移动端 ≥16px，桌面 ≥24px，避免 hero 内容紧贴顶栏。
    // ============================================================
    function updateContentTopOffset() {
        // 内容页被嵌入 iframe 时，自身顶栏已隐藏，上边距改由外壳按其顶栏实测高度喂入，
        // 这里直接跳过，避免用 0 高度的隐藏顶栏把外壳喂的值覆盖掉。
        if (FRAMED) return;
        const header = document.querySelector('header.fixed');
        if (!header) return;
        const headerHeight = Math.ceil(header.getBoundingClientRect().height);
        const extraGap = window.innerWidth < 768 ? 16 : 24;
        const topOffset = `${headerHeight + extraGap}px`;
        const rootStyle = document.documentElement.style;
        const headerHeightValue = `${headerHeight}px`;
        const extraGapValue = `${extraGap}px`;
        if (rootStyle.getPropertyValue('--freecat-header-height') !== headerHeightValue) {
            rootStyle.setProperty('--freecat-header-height', headerHeightValue);
        }
        if (rootStyle.getPropertyValue('--freecat-header-safe-gap') !== extraGapValue) {
            rootStyle.setProperty('--freecat-header-safe-gap', extraGapValue);
        }
        if (rootStyle.getPropertyValue('--freecat-page-top-offset') !== topOffset) {
            rootStyle.setProperty('--freecat-page-top-offset', topOffset);
        }
        const targets = document.querySelectorAll('.layout-container.page-blur-target, main.page-blur-target');
        targets.forEach((el) => {
            if (el.style.marginTop) el.style.marginTop = '';
        });
        scheduleHomeHeroMeasure();
        scheduleHomeSidebarFooterAvoid();
    }

    function observeHeaderOffsetChanges() {
        const header = document.querySelector('header.fixed');
        if (!header || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(() => updateContentTopOffset());
        observer.observe(header);
    }

    let homeHeroMeasureFrame = 0;

    function updateHomeHeroMeasuredHeight() {
        homeHeroMeasureFrame = 0;

        const heroBg = document.querySelector('.freecat-hero-bg');
        const heroSection = document.getElementById('hero-section');
        if (!heroBg || !heroSection) return;

        const heroContent = heroSection.firstElementChild || heroSection;
        const measuredHeight = Math.ceil(heroContent.getBoundingClientRect().height);
        if (measuredHeight <= 0) return;

        document.documentElement.style.setProperty('--freecat-hero-measured-height', `${measuredHeight}px`);
    }

    function scheduleHomeHeroMeasure() {
        if (homeHeroMeasureFrame) return;
        homeHeroMeasureFrame = requestAnimationFrame(updateHomeHeroMeasuredHeight);
    }

    function observeHomeHeroContentChanges() {
        const heroSection = document.getElementById('hero-section');
        if (!heroSection || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(() => scheduleHomeHeroMeasure());
        observer.observe(heroSection);
        if (heroSection.firstElementChild) {
            observer.observe(heroSection.firstElementChild);
        }
    }

    // ============================================================
    // [Fix] 首页 / 搜索页：fixed sidebar 始终铺满视口高度。
    // footer 自身层级更高，会自然盖在 sidebar 背景之上；这里仅清理旧版
    // 动态避让逻辑可能留下的 inline bottom，避免无感分页后高度卡住。
    // ============================================================
    let sidebarFooterAvoidFrame = 0;
    function updateHomeSidebarFooterAvoid() {
        sidebarFooterAvoidFrame = 0;
        const sidebar = document.querySelector('.freecat-home-sidebar');
        if (!sidebar) return;
        sidebar.style.bottom = '';
    }
    function scheduleHomeSidebarFooterAvoid() {
        if (sidebarFooterAvoidFrame) return;
        sidebarFooterAvoidFrame = requestAnimationFrame(updateHomeSidebarFooterAvoid);
    }

    // ============================================================
    // [Feature] 主题系统（深 / 浅 / 系统）+ 标签颜色随主题更新
    // === 1. 主题系统核心逻辑 ===
    // ============================================================
    // (使用已声明的 themeToggleBtn 和 html)


    const themeSystemFactory = window.FreecatThemeSystem;
    if (!themeSystemFactory || typeof themeSystemFactory.createThemeSystem !== 'function') {
        throw new Error('FreecatThemeSystem not loaded - ensure theme-system.js loads before main.js');
    }
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
    initUpdateSortControls();
    initScrollPositionMemory();
    updateContentTopOffset();
    observeHeaderOffsetChanges();
    initFloatingNavButtons();
    observeHomeHeroContentChanges();
    scheduleHomeHeroMeasure();
    scheduleHomeSidebarFooterAvoid();
    // Apply staggered animation to existing post cards on load
    if (document.getElementById('posts-list')) {
        applyStaggeredAnimations('.post-card', 120, { replay: false });
    }

    // 监听主题切换按钮
    themeSystem.bindThemeToggle();

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            applyTheme();
            updateContentTopOffset();
            scheduleHomeHeroMeasure();
            scheduleHomeSidebarFooterAvoid();
        }
    });

    // 核心：处理多标签页同步
    window.addEventListener('storage', (event) => {
        if (event.key === 'theme') {
            applyTheme({ animate: true });
        }
    });

    window.addEventListener('resize', updateContentTopOffset);
    window.addEventListener('resize', scheduleHomeSidebarFooterAvoid);
    window.addEventListener('scroll', scheduleHomeSidebarFooterAvoid, { passive: true });
    window.addEventListener('load', updateContentTopOffset);
    window.addEventListener('load', scheduleHomeSidebarFooterAvoid);
    requestAnimationFrame(() => {
        updateContentTopOffset();
        requestAnimationFrame(updateContentTopOffset);
    });
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            updateContentTopOffset();
            scheduleHomeHeroMeasure();
        });
    }

    // ============================================================
    // [Feature] 无感分页（点击/跳转输入框 → 异步抓取下一页 HTML 并替换）
    // 3. 无感分页实现
    //
    // 优化要点：
    //   - hover / focusin / touchstart 时预取 HTML，并在内存里缓存一份 Promise，
    //     真正点击时直接命中（消除"闲置后第一次点击卡顿"的核心来源）。
    //   - fetch 加 8s AbortController 超时，避免网络抽风时按钮永远转圈。
    //   - 淡出动画延后 100ms 触发：缓存命中时几乎瞬间出结果，主观更"跟手"。
    // ============================================================
    const postsList = document.getElementById('posts-list');
    const paginationContainer = document.getElementById('pagination-buttons');
    const pageTransitionInMs = getCssDurationMs('--page-slide-dur', 200);
    const PAGE_FETCH_TIMEOUT_MS = 8000;
    const FADE_DELAY_MS = 100;

    if (postsList && paginationContainer) {
        // url -> Promise<htmlText>。失败时自动从 Map 里清掉，允许下次重试。
        // LRU 上限：每条缓存大小约 50–200KB，限制 10 条 ≈ 上限 2MB，
        // 防止用户长时间在分页器上来回悬停导致内存无界增长。
        // 命中时 delete + set 把它移到尾部，淘汰时取首部（Map 的插入序）。
        const pageCache = new Map();
        const PAGE_CACHE_MAX = 10;

        function touchCache(url, value) {
            if (pageCache.has(url)) pageCache.delete(url);
            pageCache.set(url, value);
            while (pageCache.size > PAGE_CACHE_MAX) {
                const oldestKey = pageCache.keys().next().value;
                pageCache.delete(oldestKey);
            }
        }

        function prefetchPage(url) {
            if (pageCache.has(url)) {
                const cached = pageCache.get(url);
                touchCache(url, cached);
                return cached;
            }
            const ac = new AbortController();
            const timer = setTimeout(() => ac.abort(), PAGE_FETCH_TIMEOUT_MS);
            const p = platform.fetch(url, { credentials: 'same-origin', signal: ac.signal })
                .then((r) => {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.text();
                })
                .finally(() => clearTimeout(timer))
                .catch((err) => {
                    pageCache.delete(url);
                    throw err;
                });
            touchCache(url, p);
            return p;
        }

        function isPaginationLink(link) {
            if (!link) return false;
            if (link.getAttribute('href') === '#') return false;
            if (link.classList.contains('opacity-50')) return false;
            return true;
        }

        // 在 hover / focus / touch 时启动预取——大部分翻页都是先靠近再点击，
        // 这一步把网络等待塞进"靠近 → 点击"的几百毫秒里，点击瞬间命中内存。
        const prefetchHandler = (e) => {
            const link = e.target.closest('a');
            if (!isPaginationLink(link)) return;
            // 预取失败不打断 UI，真正点击时会再次走完整流程并降级。
            prefetchPage(link.href).catch(() => { });
        };
        ['mouseover', 'focusin', 'touchstart'].forEach((evt) => {
            paginationContainer.addEventListener(evt, prefetchHandler, { passive: true });
        });

        // 核心跳转逻辑复用
        async function navigateTo(url) {
            // 淡出延后触发：缓存命中（< 100ms）时直接跳过整段 transition，
            // 视觉上"秒切"；只有真的需要等网络才让用户看到 fade。
            postsList.classList.remove('page-transitioning-in');
            const fadeTimer = setTimeout(() => {
                postsList.classList.add('page-transitioning-out');
            }, FADE_DELAY_MS);

            try {
                const htmlText = await prefetchPage(url);
                clearTimeout(fadeTimer);

                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');

                const newPosts = doc.getElementById('posts-list').innerHTML;
                const newPagination = doc.getElementById('pagination-buttons').innerHTML;

                // 更新内容
                unobserveDeferredImages(postsList);
                postsList.innerHTML = newPosts;
                paginationContainer.innerHTML = newPagination;
                fitTagRows();
                initDeferredImages();

                // 恢复显示
                postsList.classList.remove('page-transitioning-out');
                postsList.classList.add('page-transitioning-in');
                setTimeout(() => {
                    postsList.classList.remove('page-transitioning-in');
                }, pageTransitionInMs + 40);

                // Trigger staggered animation for new content
                applyStaggeredAnimations('#posts-list .post-card');

                // 更新浏览器地址栏，并同步外壳历史；这样从文章页返回时能回到当前分页。
                window.history.pushState({ ...(window.history.state || {}), freecatSoftNav: true }, '', url);
                syncParentFrameHistory({ push: true });

                // 翻页后回到页面顶部，对齐进入首页时的初始位置。
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (err) {
                clearTimeout(fadeTimer);
                postsList.classList.remove('page-transitioning-out');
                console.error('Seamless pagination failed:', err);
                window.location.href = url; // 失败时降级到普通跳转
            }
        }

        // 监听点击（上一页、下一页、数字页码）
        paginationContainer.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link || link.getAttribute('href') === '#' || link.classList.contains('opacity-50')) return;

            e.preventDefault();
            navigateTo(link.href);
        });

        // 监听输入框的回车跳转
        paginationContainer.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' && e.key === 'Enter') {
                const input = e.target;
                const val = parseInt(input.value);
                const max = parseInt(input.getAttribute('max'));
                if (val >= 1 && val <= max) {
                    const url = val === 1 ? '/' : `/page/${val}/`;
                    navigateTo(url);
                }
            }
        });
        // Mobile: blur pagination input when tapping outside to avoid zoom lock.
        document.addEventListener('click', (e) => {
            const active = document.activeElement;
            if (!active || active.tagName !== 'INPUT' || active.getAttribute('type') !== 'number') return;
            if (!paginationContainer.contains(active)) return;
            if (paginationContainer.contains(e.target)) return;
            active.blur();
        });
    }

    // ============================================================
    // [Feature] 顶栏搜索：滑入式输入 + 实时过滤 + overlay 结果展示
    // === 4. 搜索功能实现 ===
    // ============================================================
    const searchToggle = document.getElementById('search-toggle');
    const searchClose = document.getElementById('search-close');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const navLinks = document.getElementById('nav-links');
    const tagMenuToggle = document.getElementById('tag-menu-toggle');
    const tagMenu = document.getElementById('tag-menu');
    const tagMenuItems = tagMenu ? tagMenu.querySelector('[data-tag-menu-items]') : null;
    const navAudioToggle = document.getElementById('nav-audio-toggle');
    const navAudio = document.getElementById('nav-audio');

    let searchIndex = null;
    let tagIndex = null;
    let tagMenuBuilt = false;
    const dropdownCloseMs = getCssDurationMs('--dropdown-close-dur', 150);
    const panelCloseMs = getCssDurationMs('--panel-close-dur', 350);

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
    // 顶栏搜索的遮罩 / 输入框定位 / overlay 样式已挪到 transitions.css，
    // 这里不再运行时注入。

    // 按需加载搜索索引
    async function loadSearchIndex() {
        if (searchIndex) return searchIndex;
        try {
            const response = await platform.fetch('/search-index.json');
            searchIndex = await response.json();
            return searchIndex;
        } catch (err) {
            console.error('Failed to load search index:', err);
            return [];
        }
    }

    async function loadTagIndex() {
        if (tagIndex) return tagIndex;
        try {
            const response = await platform.fetch('/tag-index.json');
            tagIndex = await response.json();
            return tagIndex;
        } catch (err) {
            console.error('Failed to load tag index:', err);
            return null;
        }
    }

    function getPostsByTag(tag, index) {
        if (!index || !Array.isArray(index.posts)) return [];
        const key = shared.normalizeTagKey(tag);
        const postIndexes = key === '__untagged__'
            ? (index.untagged || [])
            : ((index.tags && index.tags[key] && index.tags[key].posts) || []);
        const posts = postIndexes
            .map(i => index.posts[i])
            .filter(Boolean);
        return sortPostsForListing(posts);
    }

    function sortPostsForListing(posts) {
        return posts.slice().sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.date) - new Date(a.date);
        });
    }

    function initUpdateSortControls() {
        const switches = document.querySelectorAll('[data-update-sort-switch]');
        if (!switches.length) return;

        const updateSortParam = 'updateSort';
        const updateSortValue = 'modified';
        const isUpdateSortUrlEnabled = () => {
            const params = new URLSearchParams(window.location.search);
            return params.get(updateSortParam) === updateSortValue;
        };
        const syncUpdateSortUrl = (options = {}) => {
            const params = new URLSearchParams(window.location.search);
            const useModifiedSort = Array.from(switches).some((updateSortSwitch) => {
                return updateSortSwitch.getAttribute('aria-checked') === 'true';
            });

            if (useModifiedSort) {
                params.set(updateSortParam, updateSortValue);
            } else {
                params.delete(updateSortParam);
            }

            const query = params.toString();
            const nextUrl = window.location.pathname + (query ? `?${query}` : '') + window.location.hash;
            const currentUrl = window.location.pathname + window.location.search + window.location.hash;

            const method = options.replace ? 'replaceState' : 'pushState';
            if (nextUrl !== currentUrl) {
                window.history[method](window.history.state || {}, '', nextUrl);
            }

            syncParentFrameHistory({ push: !options.replace });
        };
        runtime.setSyncUpdateSortUrl(syncUpdateSortUrl);

        const getListForSwitch = (updateSortSwitch) => {
            const explicitTarget = updateSortSwitch.closest('[data-update-sort-controls]')?.dataset.updateSortTarget;
            if (explicitTarget) return document.querySelector(explicitTarget);
            return document.getElementById('posts-list') || document.getElementById('search-results');
        };
        const getCardDelay = (index) => `${Math.min(index, 10) * 70}ms`;
        const setUpdateSortMode = (updateSortSwitch, useModifiedSort, options = {}) => {
            const list = getListForSwitch(updateSortSwitch);
            const mode = useModifiedSort ? 'modified' : 'date';
            updateSortSwitch.setAttribute('aria-checked', String(useModifiedSort));

            if (!list) {
                if (options.syncUrl !== false) syncUpdateSortUrl(options);
                return;
            }

            const cards = Array.from(list.querySelectorAll('.post-card')).map((card, index) => ({ card, index }));
            const sortedCards = cards.sort((a, b) => {
                const pinnedDelta = mode === 'date'
                    ? Number(b.card.dataset.sortPinned || 0) - Number(a.card.dataset.sortPinned || 0)
                    : 0;
                const field = mode === 'modified' ? 'sortModified' : 'sortDate';
                const delta = pinnedDelta || Number(b.card.dataset[field] || 0) - Number(a.card.dataset[field] || 0);
                return delta || a.index - b.index;
            });

            sortedCards.forEach(({ card }, index) => {
                card.style.animationDelay = getCardDelay(index);
                list.appendChild(card);
                if (options.animate !== false && !prefersReducedMotion()) {
                    card.classList.remove('animate-fade-in-up');
                }
            });

            if (options.syncUrl !== false) syncUpdateSortUrl(options);
            if (options.animate === false || prefersReducedMotion()) return;

            void list.offsetWidth;
            sortedCards.forEach(({ card }) => {
                card.classList.add('animate-fade-in-up');
            });
        };

        switches.forEach(updateSortSwitch => {
            if (isUpdateSortUrlEnabled()) {
                setUpdateSortMode(updateSortSwitch, true, { animate: false, syncUrl: false });
            } else if (updateSortSwitch.getAttribute('aria-checked') === 'true') {
                setUpdateSortMode(updateSortSwitch, true, { animate: false, syncUrl: false });
            }

            if (updateSortSwitch.dataset.updateSortReady === 'true') return;
            updateSortSwitch.dataset.updateSortReady = 'true';

            updateSortSwitch.addEventListener('click', () => {
                const useModifiedSort = updateSortSwitch.getAttribute('aria-checked') !== 'true';
                setUpdateSortMode(updateSortSwitch, useModifiedSort, { replace: true });
            });
        });
    }

    // 搜索函数：支持精确匹配和模糊匹配
    function searchPosts(query, posts, isTagSearch = false) {
        if (!query.trim()) return [];
        const q = query.toLowerCase().trim();
        const isUntaggedSearch = isTagSearch && q === '__untagged__';

        const filtered = posts.filter(post => {
            const tags = (post.tags || [])
                .map(t => String(t || '').trim())
                .filter(Boolean);

            if (isUntaggedSearch) {
                return tags.length === 0;
            }

            const lowerTags = tags.map(t => t.toLowerCase());

            if (isTagSearch) {
                return lowerTags.includes(q);
            }

            const title = (post.title || '').toLowerCase();
            const excerpt = (post.excerpt || '').toLowerCase();
            const content = (post.content || '').toLowerCase();
            const tagsStr = lowerTags.join(' ');

            // 精确匹配优先
            if (title.includes(q) || excerpt.includes(q) || content.includes(q) || tagsStr.includes(q)) {
                return true;
            }

            // 模糊匹配
            const words = q.split(/\s+/);
            return words.every(word =>
                title.includes(word) || excerpt.includes(word) || content.includes(word) || tagsStr.includes(word)
            );
        });

        const sorted = sortPostsForListing(filtered);
        return isTagSearch ? sorted : sorted.slice(0, 20);
    }

    function closeHeaderSearch(immediate = false) {
        if (!searchContainer || !searchToggle) return;
        searchContainer.dataset.open = 'false';
        searchToggle.dataset.uiState = 'idle';
        document.body.classList.remove('search-active');
        if (searchInput) {
            searchInput.value = '';
            searchInput.blur();
        }
        closeSearchResults(immediate);
        const finishClose = () => {
            searchContainer.classList.add('hidden');
            searchContainer.classList.remove('flex');
        };
        if (immediate) {
            finishClose();
        } else {
            setTimeout(finishClose, panelCloseMs);
        }
    }

    // 顶栏「查看标签」菜单已在构建期预渲染进 header（点击即展开，零网络 / 零计算）。
    // 标签聚合与菜单 HTML 统一走 shared，构建期与浏览器期同源，避免两端实现漂移。
    function renderTagMenu(tags) {
        if (!tagMenuItems) return;
        tagMenuItems.innerHTML = shared.renderTagMenuItemsHtml(tags);
    }

    async function buildTagMenu() {
        if (tagMenuBuilt) return;
        // 预渲染已就位：菜单项已在 DOM 中，直接复用，无需任何请求或渲染。
        if (tagMenuItems && tagMenuItems.querySelector('.tag-menu-item')) {
            tagMenuBuilt = true;
            return;
        }
        // 兜底：仅当预渲染缺失时才拉取索引补齐（此路径不阻塞菜单展开）。
        const posts = await loadSearchIndex();
        renderTagMenu(shared.collectMenuTags(posts));
        tagMenuBuilt = true;
    }

    function setTagMenuOpen(open) {
        if (!tagMenu || !tagMenuToggle) return;
        tagMenuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        tagMenu.classList.toggle('is-open', open);
        tagMenu.classList.remove('is-closing');
    }

    function closeTagMenu() {
        if (!tagMenu || !tagMenuToggle || !tagMenu.classList.contains('is-open')) return;
        tagMenuToggle.setAttribute('aria-expanded', 'false');
        tagMenu.classList.remove('is-open');
        tagMenu.classList.add('is-closing');
        setTimeout(() => tagMenu.classList.remove('is-closing'), dropdownCloseMs);
    }

    function initNavAudioButton() {
        const navAudioController = window.FreecatNavAudio;
        if (!navAudioController || typeof navAudioController.init !== 'function') {
            throw new Error('FreecatNavAudio not loaded - ensure nav-audio.js loads before main.js');
        }
        navAudioController.init({
            window,
            document,
            platform,
            navAudioToggle,
            navAudio,
            isShell: IS_SHELL,
            contentFrame,
            closeTagMenu,
            closeHeaderSearch
        });
    }
    if (tagMenuToggle && tagMenu) {
        tagMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = !tagMenu.classList.contains('is-open');
            if (!willOpen) {
                closeTagMenu();
                return;
            }
            closeHeaderSearch(true);
            setTagMenuOpen(true);   // 立即展开：标签项已在 DOM 中（构建期预渲染）
            buildTagMenu();         // 兜底补齐；预渲染就位时为同步空操作，不阻塞展开
        });

        tagMenu.addEventListener('click', (e) => {
            if (e.target.closest('a')) closeTagMenu();
        });

        document.addEventListener('click', (e) => {
            if (!tagMenu.classList.contains('is-open')) return;
            if (tagMenu.contains(e.target) || tagMenuToggle.contains(e.target)) return;
            closeTagMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeTagMenu();
        });
    }

    // 顶栏音频播放器只在外壳 / 独立页运行；内容页被嵌入 iframe 时由外壳统一承载，
    // 这里跳过，避免出现第二个相互抢占的 <audio>。
    if (!FRAMED) initNavAudioButton();

    // ============================================================
    // [架构] 外壳 + iframe：站内导航改由外壳驱动满视口 iframe 做真实整页加载，
    // 顶栏与 <audio> 常驻外壳、永不被销毁 → 顶栏音频跨页真正无缝不断。
    // （旧的全站软导航实现已整体移除：站内链接默认走真实导航，外壳模式下由本路由驱动 iframe。）
    // ============================================================
    function initFramedNavigationBridge() {
        const shellRouter = window.FreecatShellRouter;
        if (!shellRouter || typeof shellRouter.initFramedNavigationBridge !== 'function') {
            throw new Error('FreecatShellRouter not loaded - ensure shell-router.js loads before main.js');
        }
        shellRouter.initFramedNavigationBridge({ window, document, runtime });
    }

    function initShellRouter() {
        const shellRouter = window.FreecatShellRouter;
        if (!shellRouter || typeof shellRouter.initShellRouter !== 'function') {
            throw new Error('FreecatShellRouter not loaded - ensure shell-router.js loads before main.js');
        }
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

    if (FRAMED) initFramedNavigationBridge();
    if (IS_SHELL) initShellRouter();
    // 搜索 UI 切换
    if (searchToggle && searchContainer && navLinks) {
        searchContainer.classList.add('t-panel-slide');
        searchContainer.dataset.open = 'false';
        searchToggle.dataset.uiState = 'idle';
        searchToggle.addEventListener('click', async () => {
            closeTagMenu();
            searchContainer.classList.remove('hidden');
            searchContainer.classList.add('flex');
            searchToggle.dataset.uiState = 'active';
            document.body.classList.add('search-active');
            requestAnimationFrame(() => {
                searchContainer.dataset.open = 'true';
            });
            searchInput.focus();
            await loadSearchIndex();
        });

        if (searchClose) {
            searchClose.addEventListener('click', () => closeHeaderSearch());
        }

        // 实时搜索
        let searchTimeout;
        let searchRequestSeq = 0;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const requestSeq = ++searchRequestSeq;
            searchTimeout = setTimeout(async () => {
                const query = searchInput.value;
                if (query.length >= 2) {
                    const posts = searchIndex || await loadSearchIndex();
                    const searchIsStillOpen = searchContainer.dataset.open === 'true' || searchContainer.classList.contains('flex');
                    if (requestSeq !== searchRequestSeq || searchInput.value !== query || !searchIsStillOpen) return;
                    const results = searchPosts(query, posts);
                    displaySearchResults(results, query);
                } else {
                    searchRequestSeq += 1;
                    closeSearchResults();
                }
            }, 200);
        });

        // 按 ESC 关闭搜索
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeHeaderSearch();
            }
            // 按 Enter 跳转到搜索页
            if (e.key === 'Enter' && searchInput.value.trim()) {
                navigateWithinSite(`/search.html?q=${encodeURIComponent(searchInput.value.trim())}`);
            }
        });

        // 点击外部关闭搜索
        document.addEventListener('click', (e) => {
            const isSearchActive = searchContainer.dataset.open === 'true' || searchContainer.classList.contains('flex');
            if (!isSearchActive) return;

            const overlay = document.getElementById('search-results-overlay');

            // 1. 如果点击了背景遮罩层（overlay 本身）
            if (e.target === overlay) {
                closeHeaderSearch();
                return;
            }

            // 2. 如果容器内没有显示结果（即还没有 overlay），且点击了搜索区域之外的地方
            const clickedInsideSearch = searchContainer.contains(e.target) || searchToggle.contains(e.target);
            if (!clickedInsideSearch && !overlay) {
                closeHeaderSearch();
                return;
            }

            // 3. 如果显示了 overlay，点击了 overlay 内部但非结果卡片区域
            if (overlay && overlay.contains(e.target)) {
                // 检查是否点击在结果列表容器（居中限制宽度的那个 div）之外
                const resultsWrapper = overlay.querySelector('.max-w-\\[1200px\\]');
                if (resultsWrapper && !resultsWrapper.contains(e.target)) {
                    closeHeaderSearch();
                }
            }
        });
    }

    // === 5. 搜索结果渲染辅助函数 ===
    // 标签 HTML：直接复用 shared.renderTagSpan，保持与构建期一致
    function generateTagsHtml(tags) {
        if (!tags) return '';
        if (!renderTagSpan) return ''; // shared.js 未加载，理论上不会发生
        return tags.map(tag => renderTagSpan(tag, { withDataAttrs: true, escapeText: true })).join('');
    }

    function buildSearchResultCardData(post, index, options = {}) {
        return {
            link: post.link,
            titleHtml: processTitleHtml(escapeHtml(post.title)),
            excerptHtml: escapeHtml(post.preview || post.excerpt),
            date: post.date,
            modifiedDate: post.modifiedDate,
            sortDate: post.sortDate,
            sortModifiedDate: post.sortModifiedDate,
            tagsHtml: generateTagsHtml(post.tags),
            cover: post.cover,
            coverPlaceholder: post.coverPlaceholder,
            coverWidth: post.coverWidth,
            coverHeight: post.coverHeight,
            pinned: post.pinned,
            animationDelay: getStaggerDelayMs(index),
            layout: options.layout
        };
    }

    function renderSearchResultCards(results, options = {}) {
        const renderer = window.PostCardTemplate && typeof window.PostCardTemplate.renderPostCard === 'function';
        if (!renderer) return '';
        return results
            .map((post, index) => window.PostCardTemplate.renderPostCard(buildSearchResultCardData(post, index, options)))
            .join('');
    }

    // 显示搜索结果覆盖层
    function updateSearchOverlayOffset(overlay) {
        const header = document.querySelector('header');
        let offset = header ? header.offsetHeight + 12 : 0;
        const searchBox = document.getElementById('search-container');
        if (searchBox && !searchBox.classList.contains('hidden')) {
            const rect = searchBox.getBoundingClientRect();
            offset = Math.max(offset, rect.bottom + 12);
        }
        overlay.style.top = `${offset}px`;
        overlay.style.height = `calc(100vh - ${offset}px)`;
    }


    function fitTagRows() {
        const containers = document.querySelectorAll('.tags-fit');
        containers.forEach(container => {
            container.style.transform = 'none';
            container.style.transformOrigin = 'left center';
            container.style.willChange = 'transform';
            const available = container.clientWidth;
            const scroll = container.scrollWidth;
            if (available > 0 && scroll > available) {
                const scale = Math.max(0.1, available / scroll);
                container.style.transform = `scale(${scale})`;
            }
        });
    }

    function displaySearchResults(results, query) {
        let overlay = document.getElementById('search-results-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'search-results-overlay';
            overlay.className = 'fixed inset-x-0 bottom-0 z-40 bg-white/85 dark:bg-[#0b0f1a]/85 backdrop-blur-2xl backdrop-saturate-150 overflow-y-auto t-panel-slide';
            overlay.dataset.open = 'false';
            document.body.appendChild(overlay);
        }
        updateSearchOverlayOffset(overlay);
        overlay.dataset.open = 'true';

        unobserveDeferredImages(overlay);
        if (results.length === 0) {
            overlay.innerHTML = `
                <div class="max-w-[1200px] mx-auto px-6 sm:px-8 py-10 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                        class="inline-block w-16 h-16 text-gray-300 dark:text-gray-600 mb-4">
                        <path d="M2.39732 1.86908L4.15967 0.107422L23.2796 19.2273L21.5176 20.9897L18.0309 17.5031C16.4909 18.7351 14.5379 19.5 12.4 19.5C7.43168 19.5 3.4 15.4683 3.4 10.5C3.4 8.36211 4.16493 6.40911 5.39686 4.86908L2.39732 1.86908ZM6.81106 6.28332C5.95212 7.4458 5.4 8.91211 5.4 10.5C5.4 14.3675 8.5325 17.5 12.4 17.5C13.9879 17.5 15.4542 16.9479 16.6167 16.0889L6.81106 6.28332ZM12.4 1.5C17.3683 1.5 21.4 5.53168 21.4 10.5C21.4 12.4458 20.7888 14.2542 19.7556 15.7349L18.3115 14.2908C19.0606 13.2168 19.4 11.9035 19.4 10.5C19.4 6.6325 16.2675 3.5 12.4 3.5C10.9965 3.5 9.6832 3.83942 8.6092 4.58849L7.16511 3.14441C8.6458 2.11119 10.4542 1.5 12.4 1.5Z"/>
                    </svg>
                    <p class="text-gray-500 dark:text-gray-400 text-lg">No results found for "<strong>${escapeHtml(query)}</strong>"</p>
                    <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Try different keywords</p>
                </div>
            `;
            return;
        }

        const resultsHtml = renderSearchResultCards(results);

        overlay.innerHTML = `
            <div class="max-w-[1200px] mx-auto px-5 sm:px-6 md:px-8 pt-2 pb-10 md:pt-4 md:pb-12">
                <div class="hidden md:flex md:flex-row md:items-center md:justify-between gap-2 mb-12">
                    <h2 class="text-lg md:text-xl font-extrabold text-[#1e293b] dark:text-slate-200 flex items-center">
                        Results for "${escapeHtml(query)}"
                        <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(${results.length} found)</span>
                    </h2>
                    <a href="/search.html?q=${encodeURIComponent(query)}" class="text-sm text-primary hover:underline">View all</a>
                </div>
                ${resultsHtml}
            </div >
            `;
        initDeferredImages();
    }

    function closeSearchResults(immediate = false) {
        const overlay = document.getElementById('search-results-overlay');
        if (!overlay) return;
        overlay.dataset.open = 'false';
        if (immediate) {
            overlay.remove();
            return;
        }
        setTimeout(() => {
            if (overlay.dataset.open === 'false') {
                overlay.remove();
            }
        }, panelCloseMs);
    }

    window.addEventListener('resize', () => {
        const overlay = document.getElementById('search-results-overlay');
        if (overlay) updateSearchOverlayOffset(overlay);
    });

    // HTML 转义函数：复用 shared.escapeHtml（已在文件顶部解构）。

    // ============================================================
    // [Feature] 搜索页（search.html）专属：从 URL ?q= 或 ?tag= 读取并渲染结果
    // === 5. 搜索页专属逻辑 ===
    // ============================================================
    // 如果在搜索页，从 URL 参数读取查询并执行搜索
    initUpdateSortControls();

    function setSearchResultsCount(count) {
        const resultsCountDisplay = document.getElementById('results-count');
        if (!resultsCountDisplay) return;
        const value = resultsCountDisplay.querySelector('.freecat-results-count-value');
        if (value) {
            value.textContent = String(count);
        } else {
            resultsCountDisplay.textContent = String(count);
        }
        resultsCountDisplay.dataset.countReady = 'true';
        resultsCountDisplay.setAttribute('aria-label', `${count} results`);
    }

    function getSearchPageLocationKey() {
        return window.location.pathname + window.location.search;
    }

    async function initSearchPageResults() {
        const searchResultsContainer = document.getElementById('search-results');
        const currentQueryDisplay = document.getElementById('current-query');
        const noResultsDisplay = document.getElementById('no-results');
        if (!searchResultsContainer || !currentQueryDisplay) return false;

        const locationKey = getSearchPageLocationKey();
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        const tag = urlParams.get('tag');

        if (query || tag) {
            const searchTerm = query || tag;
            const isTagSearch = !!tag;
            const isUntaggedSearch = isTagSearch && searchTerm === '__untagged__';

            if (currentQueryDisplay) {
                if (isUntaggedSearch) {
                    currentQueryDisplay.textContent = '未打标签';
                } else if (isTagSearch) {
                    currentQueryDisplay.textContent = `# ${searchTerm} `;
                } else {
                    currentQueryDisplay.textContent = searchTerm;
                }
            }

            // 同步到搜索输入框 (仅对普通搜索同步)
            // if (searchInput && query) searchInput.value = query;

            const loadResults = isTagSearch
                ? loadTagIndex().then(index => {
                    const results = getPostsByTag(searchTerm, index);
                    if (results.length || index) return results;
                    return loadSearchIndex().then(searchIndex => searchPosts(searchTerm, searchIndex, true));
                })
                : loadSearchIndex().then(index => searchPosts(searchTerm, index, false));

            const results = await loadResults;
            if (locationKey !== getSearchPageLocationKey()) return false;
            if (document.getElementById('search-results') !== searchResultsContainer) return false;

            setSearchResultsCount(results.length);

            if (results.length === 0) {
                unobserveDeferredImages(searchResultsContainer);
                searchResultsContainer.innerHTML = '';
                if (noResultsDisplay) noResultsDisplay.classList.remove('hidden');
            } else {
                if (noResultsDisplay) noResultsDisplay.classList.add('hidden');
                renderSearchPageResults(results, searchResultsContainer);
            }
            return true;
        } else {
            currentQueryDisplay.textContent = '...';
            const searchQueryDisplay = document.getElementById('search-query-display');
            if (searchQueryDisplay) {
                searchQueryDisplay.innerHTML = '<p class="text-sm text-gray-600 dark:text-gray-400">Enter a search term in the search box above.</p>';
            }
            return true;
        }
    }

    // 在搜索页渲染完整结果卡片
    function renderSearchPageResults(results, searchResultsContainer = document.getElementById('search-results')) {
        if (!searchResultsContainer) return;

        const html = renderSearchResultCards(results);

        unobserveDeferredImages(searchResultsContainer);
        searchResultsContainer.innerHTML = html;
        fitTagRows();
        initDeferredImages();
        initUpdateSortControls();
    }


    initSearchPageResults();
    fitTagRows();

    // ============================================================
    // [Feature] 头像光影动效（首页 hero / 关于页 hero）
    // === 6. 头像动效阴影 (Avatar Dynamic Shadow) ===
    // ============================================================
    const heroAvatar = document.getElementById('hero-avatar');
    const avatarTriggerArea = document.getElementById('avatar-trigger-area');
    if (heroAvatar && avatarTriggerArea) {
        let avatarShadowFrame = null;
        let isAvatarShadowResetting = true;
        // 取计算后的 box-shadow 作为基线；若 CSS 未声明则为 'none'，
        // 此时不能直接和 dynamicShadow 拼成 "none, ..."（非法 CSS），
        // 需要把基线归零，渲染时只输出动态部分。
        const rawBaseShadow = window.getComputedStyle(heroAvatar).boxShadow;
        const baseAvatarShadow = rawBaseShadow && rawBaseShadow !== 'none' ? rawBaseShadow : '';
        const currentShadow = { x: 0, y: 0, blur: 10, alpha: 0 };
        const targetShadow = { x: 0, y: 0, blur: 10, alpha: 0 };

        const renderAvatarShadow = () => {
            if (currentShadow.alpha <= 0.01) {
                heroAvatar.style.boxShadow = baseAvatarShadow || '';
                return;
            }

            const glowAlpha = (currentShadow.alpha * 0.5).toFixed(3);
            const dynamicShadow = [
                `${currentShadow.x.toFixed(2)}px ${(currentShadow.y - 5).toFixed(2)}px ${currentShadow.blur.toFixed(2)}px rgba(186, 66, 255, ${glowAlpha})`,
                `${currentShadow.x.toFixed(2)}px ${(currentShadow.y + 5).toFixed(2)}px ${currentShadow.blur.toFixed(2)}px rgba(0, 225, 255, ${glowAlpha})`
            ].join(', ');

            heroAvatar.style.boxShadow = baseAvatarShadow
                ? `${baseAvatarShadow}, ${dynamicShadow}`
                : dynamicShadow;
        };

        const animateAvatarShadow = () => {
            avatarShadowFrame = null;
            const ease = isAvatarShadowResetting ? 0.055 : 0.22;

            currentShadow.x += (targetShadow.x - currentShadow.x) * ease;
            currentShadow.y += (targetShadow.y - currentShadow.y) * ease;
            currentShadow.blur += (targetShadow.blur - currentShadow.blur) * ease;
            currentShadow.alpha += (targetShadow.alpha - currentShadow.alpha) * ease;

            const isSettled = Math.abs(currentShadow.x - targetShadow.x) < 0.04
                && Math.abs(currentShadow.y - targetShadow.y) < 0.04
                && Math.abs(currentShadow.blur - targetShadow.blur) < 0.04
                && Math.abs(currentShadow.alpha - targetShadow.alpha) < 0.004;

            if (isSettled) {
                currentShadow.x = targetShadow.x;
                currentShadow.y = targetShadow.y;
                currentShadow.blur = targetShadow.blur;
                currentShadow.alpha = targetShadow.alpha;
            }

            renderAvatarShadow();

            if (!isSettled) {
                avatarShadowFrame = window.requestAnimationFrame(animateAvatarShadow);
            }
        };

        const startAvatarShadowAnimation = () => {
            heroAvatar.style.transition = 'none';
            if (!avatarShadowFrame) {
                avatarShadowFrame = window.requestAnimationFrame(animateAvatarShadow);
            }
        };

        const handleMove = (e) => {
            const rect = heroAvatar.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = centerX - e.clientX;
            const dy = centerY - e.clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            isAvatarShadowResetting = false;
            targetShadow.x = dx / 15;
            targetShadow.y = dy / 15;
            targetShadow.blur = 10 + distance / 30;
            targetShadow.alpha = 1;
            startAvatarShadowAnimation();
        };

        const handleReset = () => {
            isAvatarShadowResetting = true;
            targetShadow.x = 0;
            targetShadow.y = 0;
            targetShadow.blur = 10;
            targetShadow.alpha = 0;
            startAvatarShadowAnimation();
        };

        if (platform.mediaQuery('(min-width: 768px)')) {
            avatarTriggerArea.addEventListener('mousemove', handleMove);
            avatarTriggerArea.addEventListener('mouseleave', handleReset);
        }
    }

});
