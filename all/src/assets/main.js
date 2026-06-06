document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // 共享工具：构建期 build.js 与浏览器期共用，避免重复实现
    // shared.js 必须先于 main.js 加载（partials/scripts-end.html 与
    // template_post.html 的 <script> 顺序已保证这点）。
    // 不再保留运行时回退 —— 真正缺失说明加载顺序被人破坏，应早失败。
    // ============================================================
    const shared = window.FreecatShared;
    if (!shared) throw new Error('FreecatShared not loaded — ensure shared.js loads before main.js');
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
    const themeToggleBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;

    const imageFallback = '/image/404.png';
    let deferredImageObserver = null;

    function loadDeferredImage(img) {
        const realSrc = img && img.dataset ? img.dataset.src : '';
        if (!realSrc || img.dataset.imageLoadStarted === 'true') return;
        img.dataset.imageLoadStarted = 'true';
        img.dataset.imageObserved = 'false';

        const probe = new Image();
        probe.onload = () => {
            img.src = realSrc;
            img.classList.remove('post-image-placeholder');
            img.classList.add('post-image-loaded');
            img.removeAttribute('data-src');
        };
        probe.onerror = () => {
            img.dataset.fallbackApplied = 'true';
            img.classList.add('post-image-failed');
            img.removeAttribute('data-src');
        };
        probe.src = realSrc;
    }

    function getDeferredImageObserver() {
        if (deferredImageObserver || !('IntersectionObserver' in window)) {
            return deferredImageObserver;
        }

        deferredImageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                deferredImageObserver.unobserve(entry.target);
                loadDeferredImage(entry.target);
            });
        }, { rootMargin: '320px 0px' });

        return deferredImageObserver;
    }

    function unobserveDeferredImages(root = document) {
        if (!deferredImageObserver || !root) return;
        const images = root.matches && root.matches('img[data-src]')
            ? [root]
            : Array.from(root.querySelectorAll ? root.querySelectorAll('img[data-src]') : []);
        images.forEach((img) => {
            deferredImageObserver.unobserve(img);
            img.dataset.imageObserved = 'false';
        });
    }

    function initDeferredImages() {
        const images = Array.from(document.querySelectorAll('img[data-src]'))
            .filter((img) => img.dataset.imageLoadStarted !== 'true' && img.dataset.imageObserved !== 'true');
        if (!images.length) return;

        if (!('IntersectionObserver' in window)) {
            images.forEach(loadDeferredImage);
            return;
        }

        const observer = getDeferredImageObserver();
        images.forEach((img) => {
            img.dataset.imageObserved = 'true';
            observer.observe(img);
        });
    }

    initDeferredImages();

    document.addEventListener('error', (e) => {
        const target = e.target;
        if (!target || target.tagName !== 'IMG') return;
        if (target.dataset.fallbackApplied === 'true') return;
        if (target.src && target.src.indexOf(imageFallback) !== -1) return;
        target.dataset.fallbackApplied = 'true';
        target.removeAttribute('srcset');
        target.src = imageFallback;
    }, true);

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
        const storageKey = 'freecat-scroll-positions-v1';
        const maxEntries = 80;
        const restoreTimeoutMs = 2500;
        const restoreIntervalMs = 80;
        let saveFrame = 0;
        let restoreTimer = 0;

        function getPageKey() {
            return window.location.pathname + window.location.search;
        }

        function readPositions() {
            try {
                const raw = sessionStorage.getItem(storageKey);
                const parsed = raw ? JSON.parse(raw) : {};
                return parsed && typeof parsed === 'object' ? parsed : {};
            } catch (e) {
                return {};
            }
        }

        function writePositions(positions) {
            try {
                sessionStorage.setItem(storageKey, JSON.stringify(positions));
            } catch (e) {}
        }

        function prunePositions(positions) {
            const entries = Object.entries(positions)
                .filter(([, value]) => value && typeof value === 'object')
                .sort((a, b) => (b[1].time || 0) - (a[1].time || 0));
            return Object.fromEntries(entries.slice(0, maxEntries));
        }

        function saveScrollPosition() {
            saveFrame = 0;
            const positions = readPositions();
            positions[getPageKey()] = {
                x: window.scrollX || window.pageXOffset || 0,
                y: window.scrollY || window.pageYOffset || 0,
                time: Date.now()
            };
            writePositions(prunePositions(positions));
        }

        function scheduleSaveScrollPosition() {
            if (saveFrame) return;
            saveFrame = window.requestAnimationFrame(saveScrollPosition);
        }

        function getNavigationType() {
            const entries = performance && performance.getEntriesByType
                ? performance.getEntriesByType('navigation')
                : null;
            return entries && entries[0] && entries[0].type;
        }

        function isHistoryRestore(event) {
            if (event && event.persisted) return true;
            return getNavigationType() === 'back_forward';
        }

        function restoreScrollPosition() {
            const saved = readPositions()[getPageKey()];
            if (!saved || typeof saved.y !== 'number') return;
            if (window.location.hash) return;

            const start = Date.now();
            const targetX = typeof saved.x === 'number' ? saved.x : 0;
            const targetY = Math.max(0, saved.y);

            function clampTargetY() {
                const scrollingElement = document.scrollingElement || document.documentElement;
                const maxY = scrollingElement
                    ? Math.max(0, scrollingElement.scrollHeight - window.innerHeight)
                    : targetY;
                return Math.min(targetY, maxY);
            }

            function attemptRestore() {
                window.scrollTo(targetX, clampTargetY());
                const currentY = window.scrollY || window.pageYOffset || 0;
                const reachedTarget = Math.abs(currentY - targetY) <= 2;
                const timedOut = Date.now() - start >= restoreTimeoutMs;
                if (reachedTarget || timedOut) {
                    restoreTimer = 0;
                    return;
                }
                restoreTimer = window.setTimeout(attemptRestore, restoreIntervalMs);
            }

            if (restoreTimer) window.clearTimeout(restoreTimer);
            requestAnimationFrame(attemptRestore);
            window.addEventListener('load', attemptRestore, { once: true });
            if (document.fonts && document.fonts.ready) document.fonts.ready.then(attemptRestore);
        }

        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        if (isHistoryRestore()) restoreScrollPosition();

        window.addEventListener('scroll', scheduleSaveScrollPosition, { passive: true });
        window.addEventListener('pagehide', saveScrollPosition);
        window.addEventListener('beforeunload', saveScrollPosition);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') saveScrollPosition();
        });
        window.addEventListener('pageshow', (event) => {
            if (isHistoryRestore(event)) restoreScrollPosition();
        });
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
            const sync = window.FreecatSyncUpdateSortUrl;
            if (typeof sync === 'function') sync({ replace: true });
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
                || hasSameOriginReferrer();
        }

        function goBackOrHome() {
            syncCurrentHistoryEntry();
            if (canGoBackWithinSite()) {
                window.history.back();
                return;
            }

            window.location.href = getUpdateSortFallbackUrl();
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
            return document.querySelectorAll([
                'article',
                '.freecat-post-toc-panel',
                '.freecat-home-sidebar',
                '.freecat-home-posts-inner',
                '.layout-content-container',
                '[data-all-toolbar]',
                '#posts-list',
                '#pagination-buttons'
            ].join(','));
        }

        function touchesVisibleContentEdge() {
            const panelRect = floatingNavPanel.getBoundingClientRect();
            if (!isVisibleRect(panelRect)) return false;

            return Array.from(getFloatingNavCollisionTargets()).some((target) => {
                if (target === floatingNavPanel || floatingNavPanel.contains(target)) return false;
                const targetRect = target.getBoundingClientRect();
                return isVisibleRect(targetRect) && rectsTouch(panelRect, targetRect);
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


    const THEME_TRANSITION_CLASS = 'theme-transitioning';
    const THEME_VIEW_TRANSITION_CLASS = 'theme-view-transitioning';
    let themeTransitionTimer = 0;

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function resolveThemeIsDark() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    }

    function setThemeState(isDark) {
        if (isDark) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        if (themeToggleBtn) {
            themeToggleBtn.dataset.uiState = isDark ? 'dark' : 'light';
        }

        // 更新标签颜色
        updateTagColors();
    }

    function finishThemeTransition() {
        window.clearTimeout(themeTransitionTimer);
        themeTransitionTimer = 0;
        html.classList.remove(THEME_TRANSITION_CLASS);
    }

    function startThemeTransition() {
        html.classList.add(THEME_TRANSITION_CLASS);
        window.clearTimeout(themeTransitionTimer);
        themeTransitionTimer = window.setTimeout(
            finishThemeTransition,
            getCssDurationMs('--theme-transition-dur', 360) + 120
        );
    }


    // 统一主题应用逻辑
    function applyTheme(options = {}) {
        const isDark = resolveThemeIsDark();
        const shouldAnimate = !!options.animate && document.body && !prefersReducedMotion();

        if (!shouldAnimate) {
            setThemeState(isDark);
            return;
        }

        if (typeof document.startViewTransition === 'function') {
            html.classList.add(THEME_VIEW_TRANSITION_CLASS);
            const transition = document.startViewTransition(() => {
                setThemeState(isDark);
            });
            transition.finished
                .catch(() => { })
                .finally(() => {
                    html.classList.remove(THEME_VIEW_TRANSITION_CLASS);
                });
            return;
        }

        startThemeTransition();
        // 确保统一过渡类先生效，再切换深浅色，避免局部 transition 各走各的时长。
        void html.offsetWidth;
        setThemeState(isDark);
    }

    // 标签颜色更新函数
    function updateTagColors() {
        const isDark = html.classList.contains('dark');
        document.querySelectorAll('.tag-span').forEach(tag => {
            const bg = tag.getAttribute(isDark ? 'data-bg-dark' : 'data-bg-light');
            const text = tag.getAttribute(isDark ? 'data-text-dark' : 'data-text-light');
            if (bg && text) {
                tag.style.background = bg;
                tag.style.color = text;
            }
        });
    }

    // 初始执行
    applyTheme();
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
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const willBeDark = !html.classList.contains('dark');
            localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
            applyTheme({ animate: true });
        });
    }

    // 核心：处理 bfcache (由于浏览器缓存页面，点击“后退”时可能不会重新触发 DOMContentLoaded)
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
            const p = fetch(url, { credentials: 'same-origin', signal: ac.signal })
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

                // 更新浏览器地址栏
                window.history.pushState({}, '', url);

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
        const navigate = window.FreecatNavigate;
        if (typeof navigate === 'function') {
            navigate(url, options);
            return;
        }
        window.location.href = url;
    }
    // 顶栏搜索的遮罩 / 输入框定位 / overlay 样式已挪到 transitions.css，
    // 这里不再运行时注入。

    // 按需加载搜索索引
    async function loadSearchIndex() {
        if (searchIndex) return searchIndex;
        try {
            const response = await fetch('/search-index.json');
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
            const response = await fetch('/tag-index.json');
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
            if (nextUrl === window.location.pathname + window.location.search + window.location.hash) return;

            const method = options.replace ? 'replaceState' : 'pushState';
            window.history[method](window.history.state || {}, '', nextUrl);
        };
        window.FreecatSyncUpdateSortUrl = syncUpdateSortUrl;

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
                setUpdateSortMode(updateSortSwitch, useModifiedSort);
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
        if (!navAudioToggle || !navAudio) return;

        const STATE_KEY = 'freecat-nav-audio-state-v1';
        const VOLUME_KEY = 'freecat-nav-audio-volume-v1';
        const DEFAULT_NAV_AUDIO_VOLUME = 0.5;
        const STATE_SAVE_INTERVAL_MS = 1500;
        const NAV_AUDIO_VOLUME_HIDE_DELAY_MS = 1000;
        const navAudioControl = document.getElementById('nav-audio-control');
        const navAudioVolume = document.getElementById('nav-audio-volume');
        const navAudioVolumeWrapper = navAudioVolume
            ? navAudioVolume.closest('.nav-audio-volume-slider-wrapper')
            : null;
        const idleIcon = navAudioToggle.querySelector('.nav-audio-icon-idle');
        const playingIcon = navAudioToggle.querySelector('.nav-audio-icon-playing');
        const playlist = readNavAudioPlaylist();
        const playlistKey = playlist.map(track => track.src).join('\n');
        let currentIndex = 0;
        let pendingSeekTime = null;
        let requestedPlayback = false;
        let lastStateSave = 0;
        let currentVolume = readSavedNavAudioVolume();
        let errorSkipTimer = 0;
        let volumeHideTimer = 0;
        let navAudioVolumePointerInside = false;
        const failedTrackIndexes = new Set();

        if (!playlist.length) return;

        function readNavAudioPlaylist() {
            const rawPlaylist = navAudioToggle.dataset.audioPlaylist || '';
            if (rawPlaylist) {
                try {
                    const parsed = JSON.parse(rawPlaylist);
                    if (Array.isArray(parsed)) {
                        return parsed
                            .map(track => ({
                                src: String(track && track.src || '').trim(),
                                title: String(track && track.title || 'Audio').trim() || 'Audio'
                            }))
                            .filter(track => track.src);
                    }
                } catch (err) {}
            }

            const fallbackSrc = String(navAudioToggle.dataset.audioSrc || navAudio.getAttribute('src') || '').trim();
            if (!fallbackSrc) return [];
            return [{
                src: fallbackSrc,
                title: String(navAudioToggle.dataset.audioTitle || navAudio.dataset.audioTitle || 'Audio').trim() || 'Audio'
            }];
        }

        function clampTrackIndex(index) {
            const value = Number(index);
            if (!Number.isFinite(value) || value < 0) return 0;
            return Math.min(playlist.length - 1, Math.floor(value));
        }

        function getSavedNavAudioState() {
            try {
                const raw = sessionStorage.getItem(STATE_KEY);
                const state = raw ? JSON.parse(raw) : null;
                if (!state || state.playlistKey !== playlistKey) return null;
                return state;
            } catch (err) {
                return null;
            }
        }

        function readSavedNavAudioVolume() {
            try {
                const saved = localStorage.getItem(VOLUME_KEY);
                const volume = saved == null ? DEFAULT_NAV_AUDIO_VOLUME : Number(saved);
                return Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : DEFAULT_NAV_AUDIO_VOLUME;
            } catch (err) {
                return DEFAULT_NAV_AUDIO_VOLUME;
            }
        }

        function saveNavAudioVolume(volume) {
            try {
                localStorage.setItem(VOLUME_KEY, String(volume));
            } catch (err) {}
        }

        function syncNavAudioVolumeUi(volume) {
            const nextVolume = Math.max(0, Math.min(1, Number(volume) || 0));
            navAudio.volume = nextVolume;
            navAudio.muted = nextVolume === 0;
            if (navAudioVolume) {
                navAudioVolume.value = String(nextVolume);
                navAudioVolume.style.setProperty('--volume-percent', `${nextVolume * 100}%`);
            }
        }

        function setNavAudioVolumeOpen(open) {
            if (!navAudioControl) return;
            if (volumeHideTimer) {
                window.clearTimeout(volumeHideTimer);
                volumeHideTimer = 0;
            }
            const shouldOpen = open && requestedPlayback && !navAudio.ended;
            navAudioControl.dataset.volumeOpen = shouldOpen ? 'true' : 'false';
        }

        function shouldKeepNavAudioVolumeOpen() {
            return navAudioVolumePointerInside
                || navAudioControl.matches(':hover')
                || (navAudioVolumeWrapper && navAudioVolumeWrapper.matches(':hover'));
        }

        function scheduleNavAudioVolumeClose() {
            if (!navAudioControl) return;
            if (volumeHideTimer) window.clearTimeout(volumeHideTimer);
            volumeHideTimer = window.setTimeout(() => {
                volumeHideTimer = 0;
                if (shouldKeepNavAudioVolumeOpen()) {
                    setNavAudioVolumeOpen(true);
                    return;
                }
                setNavAudioVolumeOpen(false);
            }, NAV_AUDIO_VOLUME_HIDE_DELAY_MS);
        }

        function isNavAudioVolumeEventTarget(target) {
            return target instanceof Node
                && (
                    navAudioControl.contains(target)
                    || (navAudioVolumeWrapper && navAudioVolumeWrapper.contains(target))
                );
        }

        function closeNavAudioVolumeOnOutsidePointerDown(event) {
            if (!navAudioControl || navAudioControl.dataset.volumeOpen !== 'true') return;
            if (isNavAudioVolumeEventTarget(event.target)) return;
            navAudioVolumePointerInside = false;
            if (document.activeElement instanceof HTMLElement && navAudioControl.contains(document.activeElement)) {
                document.activeElement.blur();
            }
            setNavAudioVolumeOpen(false);
        }

        function getContinuousTime(state) {
            if (!state) return 0;
            const baseTime = Number(state.currentTime) || 0;
            if (state.paused === true) return baseTime;
            const updatedAt = Number(state.updatedAt) || Date.now();
            return Math.max(0, baseTime + (Date.now() - updatedAt) / 1000);
        }

        function saveNavAudioState(force = false) {
            const now = Date.now();
            if (!force && now - lastStateSave < STATE_SAVE_INTERVAL_MS) return;
            lastStateSave = now;
            try {
                sessionStorage.setItem(STATE_KEY, JSON.stringify({
                    playlistKey,
                    index: currentIndex,
                    currentTime: Number(navAudio.currentTime) || 0,
                    paused: !requestedPlayback,
                    updatedAt: now
                }));
            } catch (err) {}
        }

        function applyPendingSeek() {
            if (pendingSeekTime === null) return;
            try {
                const duration = Number(navAudio.duration);
                const maxTime = Number.isFinite(duration) && duration > 0
                    ? Math.max(0, duration - 0.25)
                    : pendingSeekTime;
                navAudio.currentTime = Math.max(0, Math.min(pendingSeekTime, maxTime));
                pendingSeekTime = null;
            } catch (err) {}
        }

        function setNavAudioTrack(index, options = {}) {
            currentIndex = clampTrackIndex(index);
            const track = playlist[currentIndex];
            if (!track) return;

            navAudio.dataset.audioTitle = track.title;
            navAudio.dataset.audioIndex = String(currentIndex);
            navAudioToggle.dataset.audioSrc = track.src;
            navAudioToggle.dataset.audioTitle = track.title;

            if (navAudio.getAttribute('src') !== track.src) {
                navAudio.setAttribute('src', track.src);
                navAudio.load();
            }

            if (typeof options.currentTime === 'number' && options.currentTime >= 0) {
                pendingSeekTime = options.currentTime;
                applyPendingSeek();
            } else {
                pendingSeekTime = null;
            }
        }

        function syncNavAudioState() {
            const isPlaying = requestedPlayback && !navAudio.ended;
            if (navAudioControl) navAudioControl.dataset.playing = isPlaying ? 'true' : 'false';
            if (!isPlaying) {
                setNavAudioVolumeOpen(false);
            } else if (navAudioControl && (navAudioControl.matches(':hover') || navAudioControl.matches(':focus-within'))) {
                setNavAudioVolumeOpen(true);
            }
            navAudioToggle.dataset.playing = isPlaying ? 'true' : 'false';
            navAudioToggle.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
            navAudioToggle.setAttribute('aria-label', isPlaying ? 'Pause audio' : 'Play audio');
            if (idleIcon) idleIcon.classList.toggle('hidden', isPlaying);
            if (playingIcon) playingIcon.classList.toggle('hidden', !isPlaying);
        }

        function playNavAudio() {
            requestedPlayback = true;
            syncNavAudioState();
            saveNavAudioState(true);
            const playResult = navAudio.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(handleNavAudioPlaybackFailure);
            }
        }

        function stopNavAudioRequest() {
            requestedPlayback = false;
            syncNavAudioState();
            saveNavAudioState(true);
        }

        function pauseNavAudio() {
            requestedPlayback = false;
            navAudio.pause();
            syncNavAudioState();
            saveNavAudioState(true);
        }

        function playNextNavAudioTrack() {
            setNavAudioTrack((currentIndex + 1) % playlist.length, { currentTime: 0 });
            playNavAudio();
        }

        function handleNavAudioPlaybackFailure(error) {
            if (!requestedPlayback) {
                syncNavAudioState();
                return;
            }
            if (error && error.name === 'NotAllowedError') {
                stopNavAudioRequest();
                return;
            }
            if (errorSkipTimer) return;
            errorSkipTimer = window.setTimeout(() => {
                errorSkipTimer = 0;
                failedTrackIndexes.add(currentIndex);
                if (failedTrackIndexes.size >= playlist.length) {
                    stopNavAudioRequest();
                    return;
                }
                playNextNavAudioTrack();
            }, 0);
        }

        const savedState = getSavedNavAudioState();
        if (savedState) {
            currentIndex = clampTrackIndex(savedState.index);
            requestedPlayback = savedState.paused !== true;
            setNavAudioTrack(currentIndex, { currentTime: getContinuousTime(savedState) });
        } else {
            setNavAudioTrack(0);
        }

        navAudioToggle.addEventListener('click', () => {
            closeTagMenu();
            closeHeaderSearch(true);
            if (requestedPlayback) pauseNavAudio();
            else {
                failedTrackIndexes.clear();
                playNavAudio();
            }
        });

        if (navAudioVolume) {
            navAudioVolume.addEventListener('click', (event) => {
                event.stopPropagation();
            });
            navAudioVolume.addEventListener('input', (event) => {
                currentVolume = Math.max(0, Math.min(1, Number(event.target.value) || 0));
                syncNavAudioVolumeUi(currentVolume);
                saveNavAudioVolume(currentVolume);
                saveNavAudioState(true);
            });
        }

        if (navAudioControl) {
            navAudioControl.dataset.volumeOpen = 'false';
            navAudioControl.addEventListener('pointerenter', () => setNavAudioVolumeOpen(true));
            navAudioControl.addEventListener('pointerleave', scheduleNavAudioVolumeClose);
            navAudioControl.addEventListener('focusin', () => setNavAudioVolumeOpen(true));
            navAudioControl.addEventListener('focusout', scheduleNavAudioVolumeClose);
        }

        if (navAudioVolumeWrapper) {
            navAudioVolumeWrapper.addEventListener('pointerenter', () => {
                navAudioVolumePointerInside = true;
                setNavAudioVolumeOpen(true);
            });
            navAudioVolumeWrapper.addEventListener('pointerleave', () => {
                navAudioVolumePointerInside = false;
                scheduleNavAudioVolumeClose();
            });
        }

        document.addEventListener('pointerdown', closeNavAudioVolumeOnOutsidePointerDown, true);

        navAudio.addEventListener('ended', () => {
            if (requestedPlayback) {
                playNextNavAudioTrack();
                return;
            }
            syncNavAudioState();
            saveNavAudioState(true);
        });

        navAudio.addEventListener('loadedmetadata', applyPendingSeek);
        navAudio.addEventListener('durationchange', applyPendingSeek);
        navAudio.addEventListener('error', () => handleNavAudioPlaybackFailure(navAudio.error));
        navAudio.addEventListener('timeupdate', () => saveNavAudioState());
        ['play', 'playing', 'pause', 'emptied'].forEach((eventName) => {
            navAudio.addEventListener(eventName, () => {
                if (eventName === 'playing') failedTrackIndexes.clear();
                syncNavAudioState();
                saveNavAudioState(eventName !== 'timeupdate');
            });
        });
        window.addEventListener('pagehide', () => saveNavAudioState(true));
        window.addEventListener('beforeunload', () => saveNavAudioState(true));
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') saveNavAudioState(true);
        });

        syncNavAudioVolumeUi(currentVolume);
        syncNavAudioState();

        if (requestedPlayback || (!savedState && navAudioToggle.dataset.audioAutoplay === 'true')) {
            window.setTimeout(playNavAudio, 0);
        }
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

    initNavAudioButton();

    function initSoftNavigation() {
        if (!window.fetch || !window.DOMParser || !window.history || !history.pushState) return;

        const managedHeadSelector = 'style[data-soft-nav-head]';
        const scrollStorageKey = 'freecat-soft-nav-scroll-v1';
        const maxScrollEntries = 80;
        const softNavTransitionClass = 'soft-nav-transitioning';
        const softNavCoverDelayMs = 120;
        const softNavStylesheetTimeoutMs = 1200;
        const softNavScriptTimeoutMs = 2500;
        const softNavPageCacheMax = 12;
        const idlePrefetchLimit = 3;
        const softNavState = {
            seq: 0,
            scrollFrame: 0,
            currentKey: getUrlKey(window.location.href),
            loadedScripts: new Set(Array.from(document.querySelectorAll('script[src]')).map(script => normalizeUrl(script.src))),
            pageCache: new Map(),
            coverTimer: 0,
            coverVisible: false,
            idlePrefetchFrame: 0
        };

        function normalizeUrl(value) {
            try {
                return new URL(value, window.location.href).href;
            } catch (err) {
                return '';
            }
        }

        function getUrlKey(value) {
            const url = new URL(value, window.location.href);
            return url.pathname + url.search;
        }

        function touchSoftPageCache(key, value) {
            if (softNavState.pageCache.has(key)) softNavState.pageCache.delete(key);
            softNavState.pageCache.set(key, value);
            while (softNavState.pageCache.size > softNavPageCacheMax) {
                const oldestKey = softNavState.pageCache.keys().next().value;
                softNavState.pageCache.delete(oldestKey);
            }
        }

        function cacheSoftPageHtmlByKey(key, htmlText) {
            if (!htmlText) return;
            touchSoftPageCache(key, htmlText);
        }

        function cacheSoftPageHtml(url, htmlText) {
            cacheSoftPageHtmlByKey(getUrlKey(url), htmlText);
        }

        function cacheCurrentDocument() {
            try {
                cacheSoftPageHtmlByKey(softNavState.currentKey, '<!DOCTYPE html>\n' + document.documentElement.outerHTML);
            } catch (err) {}
        }

        function fetchSoftPage(url) {
            const key = getUrlKey(url.href);
            if (softNavState.pageCache.has(key)) {
                const cached = softNavState.pageCache.get(key);
                touchSoftPageCache(key, cached);
                return Promise.resolve(cached);
            }

            const request = fetch(url.href, { credentials: 'same-origin' })
                .then(response => {
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    return response.text();
                })
                .then(htmlText => {
                    cacheSoftPageHtml(url.href, htmlText);
                    return htmlText;
                })
                .catch(err => {
                    softNavState.pageCache.delete(key);
                    throw err;
                });
            touchSoftPageCache(key, request);
            return request;
        }

        function readSoftScrollPositions() {
            try {
                const raw = sessionStorage.getItem(scrollStorageKey);
                const parsed = raw ? JSON.parse(raw) : {};
                return parsed && typeof parsed === 'object' ? parsed : {};
            } catch (err) {
                return {};
            }
        }

        function writeSoftScrollPositions(positions) {
            try {
                sessionStorage.setItem(scrollStorageKey, JSON.stringify(positions));
            } catch (err) {}
        }

        function pruneSoftScrollPositions(positions) {
            const entries = Object.entries(positions)
                .filter(([, value]) => value && typeof value === 'object')
                .sort((a, b) => (b[1].time || 0) - (a[1].time || 0));
            return Object.fromEntries(entries.slice(0, maxScrollEntries));
        }

        function saveSoftScrollPosition(key = softNavState.currentKey) {
            const positions = readSoftScrollPositions();
            positions[key] = {
                x: window.scrollX || window.pageXOffset || 0,
                y: window.scrollY || window.pageYOffset || 0,
                time: Date.now()
            };
            writeSoftScrollPositions(pruneSoftScrollPositions(positions));
        }

        function scheduleSoftScrollSave() {
            if (softNavState.scrollFrame) return;
            softNavState.scrollFrame = window.requestAnimationFrame(() => {
                softNavState.scrollFrame = 0;
                saveSoftScrollPosition();
            });
        }

        function restoreSoftScrollPosition(url) {
            const saved = readSoftScrollPositions()[getUrlKey(url.href)];
            if (!saved || typeof saved.y !== 'number') {
                window.scrollTo(0, 0);
                return;
            }

            const targetX = typeof saved.x === 'number' ? saved.x : 0;
            const targetY = Math.max(0, saved.y);
            const start = Date.now();

            function clampTargetY() {
                const scrollingElement = document.scrollingElement || document.documentElement;
                const maxY = scrollingElement
                    ? Math.max(0, scrollingElement.scrollHeight - window.innerHeight)
                    : targetY;
                return Math.min(targetY, maxY);
            }

            function attemptRestore() {
                window.scrollTo(targetX, clampTargetY());
                const currentY = window.scrollY || window.pageYOffset || 0;
                if (Math.abs(currentY - targetY) <= 2 || Date.now() - start > 1800) return;
                window.setTimeout(attemptRestore, 80);
            }

            requestAnimationFrame(attemptRestore);
        }

        function isSameDocumentHashOnly(url) {
            return url.origin === window.location.origin
                && url.pathname === window.location.pathname
                && url.search === window.location.search
                && url.hash;
        }

        function isNavigableSoftUrl(url) {
            if (url.origin !== window.location.origin) return false;
            if (isSameDocumentHashOnly(url)) return false;
            if (/\/assets\//.test(url.pathname)) return false;
            if (/\.(?:avif|webp|png|jpe?g|gif|svg|ico|pdf|zip|mp3|m4a|wav|ogg|mp4|webm|xml|json|txt)(?:$|[?#])/i.test(url.pathname)) return false;
            return true;
        }

        function shouldSoftNavigateLink(link, event) {
            if (!link || event.defaultPrevented) return false;
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
            if (link.target && link.target.toLowerCase() !== '_self') return false;
            if (link.hasAttribute('download')) return false;
            if (link.closest('[data-no-soft-nav]')) return false;

            const url = new URL(link.href, window.location.href);
            return isNavigableSoftUrl(url);
        }

        function syncAttributes(target, source) {
            Array.from(target.attributes).forEach(attr => target.removeAttribute(attr.name));
            Array.from(source.attributes).forEach(attr => target.setAttribute(attr.name, attr.value));
        }

        function getPageShell(doc) {
            const header = doc.querySelector('body > div > header') || doc.querySelector('header');
            return header ? header.parentElement : null;
        }

        function isCriticalSoftStylesheet(link) {
            const href = normalizeUrl(link.getAttribute('href'));
            if (!href) return false;
            const url = new URL(href, window.location.href);
            if (url.origin !== window.location.origin) return false;
            return /\/assets\/(?:tailwind|transitions|post|media-player|audio-player|video-player)\.css$/i.test(url.pathname);
        }

        function ensureStylesheet(link, options = {}) {
            const href = normalizeUrl(link.getAttribute('href'));
            if (!href) return Promise.resolve();
            const exists = Array.from(document.querySelectorAll('link[rel~="stylesheet"][href]'))
                .some(existing => normalizeUrl(existing.href) === href);
            if (exists) return Promise.resolve();

            const waitForLoad = options.waitForLoad !== false;
            return new Promise(resolve => {
                const clone = link.cloneNode(true);
                let done = false;
                let timer = 0;
                const finish = () => {
                    if (done) return;
                    done = true;
                    if (timer) window.clearTimeout(timer);
                    resolve();
                };
                clone.onload = finish;
                clone.onerror = finish;
                document.head.appendChild(clone);
                if (!waitForLoad) {
                    finish();
                    return;
                }
                timer = window.setTimeout(finish, softNavStylesheetTimeoutMs);
            });
        }

        function syncInlineHeadStyles(newDoc) {
            document.querySelectorAll(managedHeadSelector).forEach(style => style.remove());
            const existingStyles = new Set(Array.from(document.head.querySelectorAll('style')).map(style => style.textContent));
            Array.from(newDoc.head.querySelectorAll('style')).forEach(style => {
                if (existingStyles.has(style.textContent)) return;
                const clone = style.cloneNode(true);
                clone.setAttribute('data-soft-nav-head', 'true');
                document.head.appendChild(clone);
            });
        }

        function syncHead(newDoc) {
            document.title = newDoc.title || document.title;
            syncInlineHeadStyles(newDoc);
            const waits = [];
            Array.from(newDoc.head.querySelectorAll('link[rel~="stylesheet"][href]')).forEach(link => {
                const shouldWait = isCriticalSoftStylesheet(link);
                const ready = ensureStylesheet(link, { waitForLoad: shouldWait });
                if (shouldWait) waits.push(ready);
            });
            return Promise.all(waits);
        }

        function shouldReduceSoftNavMotion() {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        function waitForFrame() {
            return new Promise(resolve => requestAnimationFrame(() => resolve()));
        }

        function showSoftNavCover() {
            softNavState.coverTimer = 0;
            softNavState.coverVisible = true;
            document.documentElement.classList.add(softNavTransitionClass);
        }

        function scheduleSoftNavCover() {
            if (softNavState.coverTimer) window.clearTimeout(softNavState.coverTimer);
            softNavState.coverVisible = false;
            softNavState.coverTimer = window.setTimeout(showSoftNavCover, softNavCoverDelayMs);
        }

        function cancelSoftNavCoverTimer() {
            if (!softNavState.coverTimer) return;
            window.clearTimeout(softNavState.coverTimer);
            softNavState.coverTimer = 0;
        }

        async function finishSoftNavSwap() {
            cancelSoftNavCoverTimer();
            if (!softNavState.coverVisible) {
                document.documentElement.classList.remove(softNavTransitionClass);
                return;
            }
            await waitForFrame();
            document.documentElement.classList.remove(softNavTransitionClass);
            softNavState.coverVisible = false;
        }

        function getTargetScripts(newDoc) {
            return Array.from(newDoc.querySelectorAll('script[src]'))
                .map(script => script.getAttribute('src'))
                .filter(Boolean)
                .map(src => normalizeUrl(src))
                .filter(Boolean);
        }

        function ensureScript(src) {
            if (softNavState.loadedScripts.has(src)) return Promise.resolve();

            return new Promise(resolve => {
                const script = document.createElement('script');
                let done = false;
                let timer = 0;
                const finish = (loaded) => {
                    if (done) return;
                    done = true;
                    if (timer) window.clearTimeout(timer);
                    if (loaded) softNavState.loadedScripts.add(src);
                    resolve();
                };
                script.src = src;
                script.async = false;
                script.onload = () => finish(true);
                script.onerror = () => finish(false);
                timer = window.setTimeout(() => finish(false), softNavScriptTimeoutMs);
                document.body.appendChild(script);
            });
        }

        function loadTargetScripts(targetScripts, seq) {
            targetScripts.reduce((chain, scriptSrc) => chain.then(() => {
                if (seq !== softNavState.seq) return null;
                return ensureScript(scriptSrc);
            }), Promise.resolve()).then(() => {
                if (seq !== softNavState.seq) return;
                if (window.FreecatPostPage && typeof window.FreecatPostPage.initHighlight === 'function') {
                    window.FreecatPostPage.initHighlight();
                }
            }).catch(err => {
                console.error('Soft navigation script loading failed:', err);
            });
        }

        function scrollAfterNavigation(url, options) {
            if (options && options.preserveScroll) return;
            if (options && options.restoreScroll) {
                restoreSoftScrollPosition(url);
                return;
            }
            if (url.hash) {
                const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
                if (target) {
                    window.requestAnimationFrame(() => target.scrollIntoView());
                    return;
                }
            }
            window.scrollTo(0, 0);
        }

        function runPageReady(newDoc) {
            updateContentTopOffset();
            scheduleHomeHeroMeasure();
            scheduleHomeSidebarFooterAvoid();
            initDeferredImages();
            initFloatingNavButtons();
            fitTagRows();
            initUpdateSortControls();
            const searchPageReady = initSearchPageResults();
            document.dispatchEvent(new CustomEvent('freecat:page-ready', {
                detail: { url: window.location.href }
            }));
            requestAnimationFrame(() => {
                updateContentTopOffset();
                scheduleHomeSidebarFooterAvoid();
            });
            scheduleIdleLinkPrefetch();
            return searchPageReady;
        }

        async function softNavigate(targetHref, options = {}) {
            const seq = ++softNavState.seq;
            const url = new URL(targetHref, window.location.href);
            cacheCurrentDocument();
            saveSoftScrollPosition();
            closeHeaderSearch(true);
            closeTagMenu();
            scheduleSoftNavCover();

            try {
                const htmlText = await fetchSoftPage(url);
                if (seq !== softNavState.seq) return;

                const newDoc = new DOMParser().parseFromString(htmlText, 'text/html');
                const currentHeader = document.querySelector('body > div > header') || document.querySelector('header');
                const currentShell = currentHeader && currentHeader.parentElement;
                const newHeader = newDoc.querySelector('body > div > header') || newDoc.querySelector('header');
                const newShell = getPageShell(newDoc);
                if (!currentHeader || !currentShell || !newHeader || !newShell || !newDoc.body) {
                    throw new Error('Soft navigation target is missing the expected page shell');
                }

                const targetScripts = getTargetScripts(newDoc);
                await syncHead(newDoc);
                if (seq !== softNavState.seq) return;

                syncAttributes(document.body, newDoc.body);
                syncAttributes(currentShell, newShell);
                unobserveDeferredImages(currentShell);
                Array.from(currentShell.childNodes).forEach(node => {
                    if (node !== currentHeader) node.remove();
                });
                Array.from(newShell.childNodes).forEach(node => {
                    if (node === newHeader || node.nodeName === 'SCRIPT') return;
                    currentShell.appendChild(document.importNode(node, true));
                });

                if (options.history !== 'none') {
                    const method = options.history === 'replace' ? 'replaceState' : 'pushState';
                    history[method]({ freecatSoftNav: true }, '', url.href);
                }
                softNavState.currentKey = getUrlKey(url.href);

                scrollAfterNavigation(url, options);
                const pageReady = runPageReady(newDoc);

                loadTargetScripts(targetScripts, seq);

                if (newDoc.getElementById('search-results') && pageReady && typeof pageReady.then === 'function') {
                    await pageReady;
                }
                if (seq !== softNavState.seq) return;

                requestAnimationFrame(() => {
                    updateContentTopOffset();
                    scheduleHomeSidebarFooterAvoid();
                });
            } finally {
                if (seq === softNavState.seq) await finishSoftNavSwap();
            }
        }

        window.FreecatNavigate = function (targetHref, options = {}) {
            return softNavigate(targetHref, options).catch(err => {
                console.error('Soft navigation failed:', err);
                window.location.href = new URL(targetHref, window.location.href).href;
            });
        };

        function prefetchSoftLink(link) {
            if (!link || link.target && link.target.toLowerCase() !== '_self') return;
            if (link.hasAttribute('download')) return;
            if (link.closest('[data-no-soft-nav]')) return;
            const url = new URL(link.href, window.location.href);
            if (!isNavigableSoftUrl(url)) return;
            if (getUrlKey(url.href) === softNavState.currentKey) return;
            fetchSoftPage(url).catch(() => {});
        }

        function handleSoftLinkPrefetch(event) {
            const link = event.target.closest && event.target.closest('a[href]');
            prefetchSoftLink(link);
        }

        function scheduleIdleLinkPrefetch() {
            if (softNavState.idlePrefetchFrame) return;
            const run = () => {
                softNavState.idlePrefetchFrame = 0;
                const seen = new Set();
                const links = Array.from(document.querySelectorAll('.post-card[href], header a[href]'))
                    .filter(link => {
                        const key = getUrlKey(link.href);
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return key !== softNavState.currentKey;
                    })
                    .slice(0, idlePrefetchLimit);
                links.forEach(prefetchSoftLink);
            };

            if ('requestIdleCallback' in window) {
                softNavState.idlePrefetchFrame = window.requestIdleCallback(run, { timeout: 1800 });
            } else {
                softNavState.idlePrefetchFrame = window.setTimeout(run, 700);
            }
        }

        document.addEventListener('click', event => {
            const link = event.target.closest && event.target.closest('a[href]');
            if (!shouldSoftNavigateLink(link, event)) return;

            event.preventDefault();
            softNavigate(link.href).catch(err => {
                console.error('Soft navigation failed:', err);
                window.location.href = link.href;
            });
        });
        ['mouseover', 'focusin', 'touchstart'].forEach(eventName => {
            document.addEventListener(eventName, handleSoftLinkPrefetch, { passive: true });
        });

        window.addEventListener('popstate', () => {
            saveSoftScrollPosition();
            softNavigate(window.location.href, { history: 'none', restoreScroll: true }).catch(() => {
                window.location.reload();
            });
        });

        window.addEventListener('scroll', scheduleSoftScrollSave, { passive: true });
        window.addEventListener('pagehide', () => saveSoftScrollPosition());
        window.addEventListener('beforeunload', () => saveSoftScrollPosition());
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') saveSoftScrollPosition();
        });
        cacheCurrentDocument();
        scheduleIdleLinkPrefetch();
    }

    initSoftNavigation();

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

        if (window.matchMedia('(min-width: 768px)').matches) {
            avatarTriggerArea.addEventListener('mousemove', handleMove);
            avatarTriggerArea.addEventListener('mouseleave', handleReset);
        }
    }

});
