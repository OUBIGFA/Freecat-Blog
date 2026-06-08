/* floating-nav.js
 * 浮动导航按钮：返回、回到顶部和滚到底部的布局与行为。
 */
(function () {
    'use strict';

    function init(options = {}) {
        const win = options.window || globalThis.window;
        const document = options.document || win.document;
        const window = win;
        const runtime = options.runtime;
        const FRAMED = !!options.framed;
        const navigateWithinSite = options.navigateWithinSite;

        if (!runtime || typeof runtime.syncUpdateSortUrl !== 'function') {
            throw new Error('FreecatFloatingNav requires runtime.syncUpdateSortUrl');
        }
        if (typeof navigateWithinSite !== 'function') {
            throw new Error('FreecatFloatingNav requires navigateWithinSite');
        }
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
                let startTime = window.performance.now();
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
                        window.requestAnimationFrame(animate);
                    }
                }

                window.requestAnimationFrame(animate);
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

    window.FreecatFloatingNav = {
        init: init
    };
})();
