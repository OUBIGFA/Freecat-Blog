(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.FreecatScrollMemory = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    function init({ window, document, platform, runtime }) {
        const storageKey = 'freecat-scroll-positions-v1';
        const restoreRequestStorageKey = 'freecat-scroll-restore-requests-v1';
        const maxEntries = 80;
        const restoreTimeoutMs = 2500;
        const restoreIntervalMs = 80;
        let saveFrame = 0;
        let restoreTimer = 0;

        function finishPendingStateRestore() {
            document.documentElement.classList.remove('freecat-state-restore-pending');
        }

        function getPageKey() {
            return window.location.pathname + window.location.search;
        }

        function readPositions() {
            try {
                const raw = platform.sessionStorage.getItem(storageKey);
                const parsed = raw ? JSON.parse(raw) : {};
                return parsed && typeof parsed === 'object' ? parsed : {};
            } catch (e) {
                return {};
            }
        }

        function writePositions(positions) {
            try {
                platform.sessionStorage.setItem(storageKey, JSON.stringify(positions));
            } catch (e) {}
        }

        function consumeShellRestoreRequest() {
            try {
                const raw = platform.sessionStorage.getItem(restoreRequestStorageKey);
                const requests = raw ? JSON.parse(raw) : {};
                if (!requests || typeof requests !== 'object') return false;

                const pageKey = getPageKey();
                if (!requests[pageKey]) return false;

                delete requests[pageKey];
                if (Object.keys(requests).length) {
                    platform.sessionStorage.setItem(restoreRequestStorageKey, JSON.stringify(requests));
                } else {
                    platform.sessionStorage.removeItem(restoreRequestStorageKey);
                }
                return true;
            } catch (e) {
                return false;
            }
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

        runtime.setSaveScrollPosition(saveScrollPosition);

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
            if (!saved || typeof saved.y !== 'number') {
                finishPendingStateRestore();
                return;
            }
            if (window.location.hash) {
                finishPendingStateRestore();
                return;
            }

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
                    finishPendingStateRestore();
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
        const hasShellRestoreRequest = consumeShellRestoreRequest();
        if (isHistoryRestore() || hasShellRestoreRequest) restoreScrollPosition();
        else finishPendingStateRestore();

        window.addEventListener('scroll', scheduleSaveScrollPosition, { passive: true });
        window.addEventListener('pagehide', saveScrollPosition);
        window.addEventListener('beforeunload', saveScrollPosition);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') saveScrollPosition();
        });
        window.addEventListener('pageshow', (event) => {
            const hasShellRestoreRequest = consumeShellRestoreRequest();
            if (isHistoryRestore(event) || hasShellRestoreRequest) restoreScrollPosition();
        });
    }

    return { init };
}));
