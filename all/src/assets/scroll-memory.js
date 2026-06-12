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
        // 恢复重试窗口：懒加载图片/字体会让页面高度迟到，目标位置在内容
        // 长出来之前会被 clamp 在顶部附近，窗口必须盖住慢网下的内容增长；
        // 用户一旦主动滚动会立即取消重试，所以放宽窗口不会与用户抢滚动条。
        const restoreTimeoutMs = 8000;
        const restoreIntervalMs = 80;
        let saveFrame = 0;
        let restoreTimer = 0;
        // 恢复进行中暂停保存：恢复重试期间的中间滚动位置（含文档被替换时的
        // pagehide）一旦写回存储，会污染下一次加载要恢复的目标值。
        let restoreInProgress = false;
        // 冻结保存：文档被替换/卸载的销毁窗口里，scroll/visibilitychange/
        // pagehide 仍可能触发兜底保存，而此时的滚动读数不再可信（引擎可能
        // 已重置视口），一旦写库会覆盖滚动事件持续存好的真实位置。外壳在
        // 发起替换/自身卸载前冻结旧文档的保存；bfcache 复活（pageshow）解冻。
        let savesFrozen = false;

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

        // 外壳在返回/前进（popstate）以及自身 back_forward 冷加载时写入恢复
        // 请求；前进点击由外壳主动清除。这里的时间窗只做垃圾回收 —— 兜住
        // "返回导航被中断、请求未被消费"的遗留项，因此可以放得足够宽，
        // 保证慢网下 iframe 加载完成时请求仍然有效；过期项就地清除。
        const restoreRequestWindowMs = 30000;

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
            if (savesFrozen || restoreInProgress) return;
            const positions = readPositions();
            positions[getPageKey()] = {
                x: window.scrollX || window.pageXOffset || 0,
                y: window.scrollY || window.pageYOffset || 0,
                time: Date.now()
            };
            writePositions(prunePositions(positions));
        }

        function freezeScrollSaves() {
            savesFrozen = true;
        }

        runtime.setSaveScrollPosition(saveScrollPosition);
        runtime.setFreezeScrollSaves(freezeScrollSaves);

        function scheduleSaveScrollPosition() {
            if (saveFrame) return;
            saveFrame = window.requestAnimationFrame(saveScrollPosition);
        }

        function getNavigationType() {
            const perf = window.performance;
            const entries = perf && perf.getEntriesByType
                ? perf.getEntriesByType('navigation')
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
            let cancelled = false;
            restoreInProgress = true;

            function clampTargetY() {
                const scrollingElement = document.scrollingElement || document.documentElement;
                const maxY = scrollingElement
                    ? Math.max(0, scrollingElement.scrollHeight - window.innerHeight)
                    : targetY;
                return Math.min(targetY, maxY);
            }

            // 用户一旦主动滚动/按键，立即停止重试并放弃 load / fonts 的再锚定，
            // 否则加长的恢复窗口会反过来与用户抢滚动条。
            const cancelEvents = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
            function cancelRestore() {
                cancelled = true;
                restoreInProgress = false;
                if (restoreTimer) {
                    window.clearTimeout(restoreTimer);
                    restoreTimer = 0;
                }
                cancelEvents.forEach((type) => window.removeEventListener(type, cancelRestore));
            }
            cancelEvents.forEach((type) => window.addEventListener(type, cancelRestore, { passive: true }));

            function attemptRestore() {
                restoreTimer = 0;
                if (cancelled) return;
                restoreInProgress = true;
                window.scrollTo(targetX, clampTargetY());
                const currentY = window.scrollY || window.pageYOffset || 0;
                const reachedTarget = Math.abs(currentY - targetY) <= 2;
                const timedOut = Date.now() - start >= restoreTimeoutMs;
                if (reachedTarget || timedOut) {
                    restoreInProgress = false;
                    return;
                }
                restoreTimer = window.setTimeout(attemptRestore, restoreIntervalMs);
            }

            // load / fonts.ready 迟到时只在没有进行中的重试链时再锚定，
            // 避免多条重试链并行、定时器互相覆盖泄漏。
            function triggerRestore() {
                if (cancelled || restoreTimer) return;
                attemptRestore();
            }

            if (restoreTimer) window.clearTimeout(restoreTimer);
            window.requestAnimationFrame(triggerRestore);
            window.addEventListener('load', triggerRestore, { once: true });
            if (document.fonts && document.fonts.ready) document.fonts.ready.then(triggerRestore);
        }

        if (window.history && 'scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
        if (isHistoryRestore() || hasShellRestoreRequest()) restoreScrollPosition();

        window.addEventListener('scroll', scheduleSaveScrollPosition, { passive: true });
        window.addEventListener('pagehide', saveScrollPosition);
        window.addEventListener('beforeunload', saveScrollPosition);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') saveScrollPosition();
        });
        window.addEventListener('pageshow', (event) => {
            savesFrozen = false;
            if (isHistoryRestore(event) || hasShellRestoreRequest()) restoreScrollPosition();
        });
    }

    return { init };
}));
