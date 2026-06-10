(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.FreecatShellRouter = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    function initFramedNavigationBridge({ window, document, runtime }) {
        document.addEventListener('click', (event) => {
            const link = event.target.closest && event.target.closest('a[href]');
            if (!link || event.defaultPrevented) return;
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (link.target && link.target.toLowerCase() !== '_self') return;
            if (link.hasAttribute('download')) return;

            const rawHref = link.getAttribute('href') || '';
            const url = new URL(link.href, window.location.href);
            if (url.origin !== window.location.origin) return;
            if (rawHref.charAt(0) === '#' && url.pathname === window.location.pathname && url.search === window.location.search) return;

            event.preventDefault();
            runtime.saveScrollPosition();
            runtime.navigate(url.pathname + url.search + url.hash);
        });
    }

    function initShellRouter({
        window,
        document,
        platform,
        runtime,
        contentFrame,
        closeHeaderSearch,
        closeTagMenu,
        resolveThemeIsDark,
        syncFrameTheme
    }) {
        const frame = contentFrame;
        if (!frame) return;

        const HOME_CONTENT = '/home.html';
        const SCROLL_RESTORE_REQUEST_KEY = 'freecat-scroll-restore-requests-v1';
        const SHELL_HISTORY_INDEX_KEY = 'freecatShellIndex';
        const headerEl = document.querySelector('header.fixed');
        let shellHistoryIndex = 0;
        let pendingFrameTraversal = null;

        function getPublicLocation() {
            return window.location.pathname + window.location.search + window.location.hash;
        }

        function parseSameOriginPath(raw, fallback = '/') {
            const input = String(raw == null ? '' : raw).trim() || fallback;
            let url;
            try {
                url = new URL(input, window.location.origin);
            } catch (err) {
                return fallback;
            }
            if (url.origin !== window.location.origin) return fallback;
            if (!/^\/(?!\/)/.test(url.pathname)) return fallback;
            return url.pathname + url.search + url.hash;
        }

        function isHomePathname(pathname) {
            return pathname === '/' || pathname === '/index.html' || pathname === '/index'
                || pathname === HOME_CONTENT || pathname === '/home';
        }

        function publicPathToContentPath(raw) {
            const path = parseSameOriginPath(raw, '/');
            const url = new URL(path, window.location.origin);
            if (isHomePathname(url.pathname)) {
                return HOME_CONTENT + url.search + url.hash;
            }
            return url.pathname + url.search + url.hash;
        }

        function contentPathToPublicPath(raw) {
            const path = parseSameOriginPath(raw, HOME_CONTENT);
            const url = new URL(path, window.location.origin);
            if (isHomePathname(url.pathname)) {
                return '/' + url.search + url.hash;
            }
            return url.pathname + url.search + url.hash;
        }

        function getFramePath() {
            try {
                const loc = frame.contentWindow.location;
                if (loc.protocol === 'about:' || loc.href === 'about:blank') return '';
                return loc.pathname + loc.search + loc.hash;
            } catch (err) {
                return '';
            }
        }

        function getShellHistoryIndex(state) {
            const index = state && state[SHELL_HISTORY_INDEX_KEY];
            return Number.isInteger(index) && index >= 0 ? index : null;
        }

        function shellState(baseState, index) {
            return { ...(baseState || {}), freecatShell: true, [SHELL_HISTORY_INDEX_KEY]: index };
        }

        function ensureShellHistoryState() {
            const currentState = window.history.state || {};
            const currentIndex = getShellHistoryIndex(currentState);
            shellHistoryIndex = currentIndex == null ? 0 : currentIndex;
            if (!currentState.freecatShell || currentIndex == null) {
                window.history.replaceState(shellState(currentState, shellHistoryIndex), '', getPublicLocation());
            }
        }

        function clearPendingFrameTraversal() {
            if (!pendingFrameTraversal) return;
            window.clearTimeout(pendingFrameTraversal.timer);
            pendingFrameTraversal = null;
        }

        function setFrameLocation(path, options = {}) {
            const target = publicPathToContentPath(path);
            try {
                if (options.replace) {
                    frame.contentWindow.location.replace(target);
                } else {
                    frame.contentWindow.location.assign(target);
                }
            } catch (err) {
                frame.src = target;
            }
        }

        function traverseFrameHistory(delta, target) {
            if (!Number.isInteger(delta) || delta === 0) return false;
            try {
                frame.contentWindow.history.go(delta);
                clearPendingFrameTraversal();
                pendingFrameTraversal = {
                    target,
                    timer: window.setTimeout(() => {
                        if (publicPathToContentPath(getFramePath()) !== target) {
                            setFrameLocation(target, { replace: true });
                        }
                        clearPendingFrameTraversal();
                    }, 1200)
                };
                return true;
            } catch (err) {
                clearPendingFrameTraversal();
                return false;
            }
        }

        function getScrollRestorePageKey(raw) {
            const path = parseSameOriginPath(raw, HOME_CONTENT);
            const url = new URL(path, window.location.origin);
            return url.pathname + url.search;
        }

        function requestFrameScrollRestore(path) {
            try {
                const raw = platform.sessionStorage.getItem(SCROLL_RESTORE_REQUEST_KEY);
                const requests = raw ? JSON.parse(raw) : {};
                const nextRequests = requests && typeof requests === 'object' ? requests : {};
                nextRequests[getScrollRestorePageKey(path)] = Date.now();
                platform.sessionStorage.setItem(SCROLL_RESTORE_REQUEST_KEY, JSON.stringify(nextRequests));
            } catch (err) {}
        }

        function clearFrameScrollRestore(path) {
            try {
                const raw = platform.sessionStorage.getItem(SCROLL_RESTORE_REQUEST_KEY);
                const requests = raw ? JSON.parse(raw) : {};
                if (!requests || typeof requests !== 'object') return;
                const pageKey = getScrollRestorePageKey(path);
                if (!requests[pageKey]) return;
                delete requests[pageKey];
                if (Object.keys(requests).length) {
                    platform.sessionStorage.setItem(SCROLL_RESTORE_REQUEST_KEY, JSON.stringify(requests));
                } else {
                    platform.sessionStorage.removeItem(SCROLL_RESTORE_REQUEST_KEY);
                }
            } catch (err) {}
        }

        function normalizeHeaderHeight(measuredHeight) {
            const fallbackHeight = window.innerWidth < 768 ? 61 : 73;
            const height = Number(measuredHeight);
            return Number.isFinite(height) && height > 0 && height <= 120 ? height : fallbackHeight;
        }

        function syncHistoryToFrame(options = {}) {
            const framePath = getFramePath();
            if (!framePath) return;
            const publicPath = contentPathToPublicPath(framePath);
            if (publicPath === getPublicLocation()) return;
            const method = options.push ? 'pushState' : 'replaceState';
            const nextIndex = options.push ? shellHistoryIndex + 1 : shellHistoryIndex;
            const state = shellState(window.history.state || {}, nextIndex);
            window.history[method](state, '', publicPath);
            shellHistoryIndex = nextIndex;
        }

        function navigateShell(targetHref, options = {}) {
            const contentPath = publicPathToContentPath(targetHref);
            const publicPath = contentPathToPublicPath(contentPath);
            const currentPublicPath = getPublicLocation();
            const shouldPush = publicPath !== currentPublicPath && !options.replace;
            const nextIndex = shouldPush ? shellHistoryIndex + 1 : shellHistoryIndex;
            const state = shellState(window.history.state || {}, nextIndex);
            if (publicPath !== currentPublicPath) {
                const method = options.replace ? 'replaceState' : 'pushState';
                window.history[method](state, '', publicPath);
                shellHistoryIndex = nextIndex;
            }
            if (publicPathToContentPath(getFramePath()) !== contentPath) {
                setFrameLocation(contentPath, { replace: !!options.replace });
            }
        }

        function syncFrameToLocation(options = {}) {
            const framePath = getFramePath();
            if (!framePath) return;
            const target = publicPathToContentPath(getPublicLocation());
            if (publicPathToContentPath(framePath) === target) return;
            if (options.restoreScroll) requestFrameScrollRestore(target);
            if (options.restoreScroll) {
                window.setTimeout(() => clearFrameScrollRestore(target), 15000);
            }
            if (options.restoreScroll && traverseFrameHistory(options.historyDelta, target)) return;
            setFrameLocation(target, { replace: true });
        }

        function syncFrameOffset() {
            if (!headerEl) return;
            let doc;
            try { doc = frame.contentDocument; } catch (err) { return; }
            if (!doc || !doc.documentElement) return;
            const h = normalizeHeaderHeight(Math.ceil(headerEl.getBoundingClientRect().height));
            const gap = window.innerWidth < 768 ? 16 : 24;
            const rs = doc.documentElement.style;
            rs.setProperty('--freecat-header-height', `${h}px`);
            rs.setProperty('--freecat-header-safe-gap', `${gap}px`);
            rs.setProperty('--freecat-page-top-offset', `${h + gap}px`);
        }

        function onFrameLoad() {
            if (pendingFrameTraversal) {
                const target = pendingFrameTraversal.target;
                clearPendingFrameTraversal();
                if (publicPathToContentPath(getFramePath()) !== target) {
                    setFrameLocation(target, { replace: true });
                    return;
                }
            }
            try {
                const t = frame.contentDocument && frame.contentDocument.title;
                if (t) document.title = t;
            } catch (err) {}
            syncFrameTheme(resolveThemeIsDark());
            syncFrameOffset();
            syncHistoryToFrame();
        }

        function onShellLinkClick(event) {
            const link = event.target.closest && event.target.closest('a[href]');
            if (!link || event.defaultPrevented) return;
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (link.target && link.target.toLowerCase() !== '_self') return;
            if (link.hasAttribute('download')) return;
            const url = new URL(link.href, window.location.href);
            if (url.origin !== window.location.origin) return;
            event.preventDefault();
            if (typeof closeHeaderSearch === 'function') closeHeaderSearch(true);
            if (typeof closeTagMenu === 'function') closeTagMenu();
            navigateShell(url.pathname + url.search + url.hash);
        }

        frame.addEventListener('load', onFrameLoad);
        ensureShellHistoryState();
        window.addEventListener('popstate', (event) => {
            const nextIndex = getShellHistoryIndex(event.state);
            const historyDelta = nextIndex == null ? 0 : nextIndex - shellHistoryIndex;
            if (nextIndex != null) shellHistoryIndex = nextIndex;
            syncFrameToLocation({ restoreScroll: true, historyDelta });
        });
        window.addEventListener('resize', syncFrameOffset);
        if (headerEl && typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(syncFrameOffset).observe(headerEl);
        }
        document.addEventListener('click', onShellLinkClick);

        runtime.setNavigate(function (targetHref, options = {}) {
            navigateShell(targetHref, options);
        });
        runtime.setSyncFrameHistory(function (options = {}) {
            syncHistoryToFrame(options);
        });

        try {
            if (frame.contentDocument && frame.contentDocument.readyState === 'complete') onFrameLoad();
            else {
                syncFrameToLocation();
                syncFrameOffset();
            }
        } catch (err) {}
    }

    return { initFramedNavigationBridge, initShellRouter };
}));
