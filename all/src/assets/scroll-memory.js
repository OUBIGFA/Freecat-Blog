(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.FreecatScrollMemory = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    function init({ window, document, platform, runtime, shared }) {
        const storageKey = 'freecat-scroll-positions-v1';
        const restoreRequestStorageKey = 'freecat-scroll-restore-requests-v1';
        const maxEntries = 80;
        const restoreTimeoutMs = 2500;
        const restoreIntervalMs = 80;
        let saveFrame = 0;
        let restoreTimer = 0;
        // 恢复进行中暂停保存：恢复重试期间的中间滚动位置（含文档被替换时的
        // pagehide）一旦写回存储，会污染下一次加载要恢复的目标值。
        let restoreInProgress = false;

        // key 必须与外壳 shell-router 写恢复请求时一致，统一走 shared 的
        // 平台无关规范化（Cloudflare Pages 会把 /home.html 重定向成 /home）。
        function getPageKey() {
            return shared.normalizeScrollPageKey(window.location.pathname, window.location.search);
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

        // 外壳在返回/前进时写入恢复请求。返回导航会出现两次加载竞争
        // （浏览器自动恢复 iframe 文档 + 外壳主动 replace），请求在短窗口内
        // 保持有效，保证最终落地的那次加载也能恢复滚动；过期项就地清除。
        const restoreRequestWindowMs = 5000;

        function hasShellRestoreRequest() {
            try {
                const raw = platform.sessionStorage.getItem(restoreRequestStorageKey);
                const requests = raw ? JSON.parse(raw) : {};
                if (!requests || typeof requests !== 'object') return false;

                const pageKey = getPageKey();
                const requestedAt = requests[pageKey];
                if (!requestedAt) return false;

                if (Date.now() - requestedAt <= restoreRequestWindowMs) return true;

                delete requests[pageKey];
                if (Object.keys(requests).length) {
                    platform.sessionStorage.setItem(restoreRequestStorageKey, JSON.stringify(requests));
                } else {
                    platform.sessionStorage.removeItem(restoreRequestStorageKey);
                }
                return false;
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
            if (restoreInProgress) return;
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
                return;
            }
            if (window.location.hash) {
                return;
            }

            const start = Date.now();
            const targetX = typeof saved.x === 'number' ? saved.x : 0;
            const targetY = Math.max(0, saved.y);
            restoreInProgress = true;

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
                    restoreInProgress = false;
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
        if (isHistoryRestore() || hasShellRestoreRequest()) restoreScrollPosition();

        window.addEventListener('scroll', scheduleSaveScrollPosition, { passive: true });
        window.addEventListener('pagehide', saveScrollPosition);
        window.addEventListener('beforeunload', saveScrollPosition);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') saveScrollPosition();
        });
        window.addEventListener('pageshow', (event) => {
            if (isHistoryRestore(event) || hasShellRestoreRequest()) restoreScrollPosition();
        });
    }

    return { init };
}));
