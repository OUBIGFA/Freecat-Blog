/* global window, self */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.FreecatThemeSystem = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    const THEME_TRANSITION_CLASS = 'theme-transitioning';
    const THEME_TRANSITION_FROM_DARK_CLASS = 'theme-transition-from-dark';
    const THEME_TRANSITION_FROM_LIGHT_CLASS = 'theme-transition-from-light';

    function createThemeSystem(options) {
        const doc = options.document;
        const root = options.window;
        const platform = options.platform;
        const contentFrame = options.contentFrame;
        const getCssDurationMs = options.getCssDurationMs;
        const html = doc.documentElement;
        const themeToggleBtn = doc.getElementById('theme-toggle');
        let themeTransitionTimer = 0;

        function prefersReducedMotion() {
            return platform.mediaQuery('(prefers-reduced-motion: reduce)');
        }

        function resolveThemeIsDark() {
            const savedTheme = platform.localStorage.getItem('theme');
            const systemPrefersDark = platform.mediaQuery('(prefers-color-scheme: dark)');
            return savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
        }

        function updateTagColors() {
            const isDark = html.classList.contains('dark');
            doc.querySelectorAll('.tag-span').forEach(tag => {
                const bg = tag.getAttribute(isDark ? 'data-bg-dark' : 'data-bg-light');
                const text = tag.getAttribute(isDark ? 'data-text-dark' : 'data-text-light');
                if (bg && text) {
                    tag.style.background = bg;
                    tag.style.color = text;
                }
            });
        }

        function setThemeState(isDark) {
            html.classList.toggle('dark', isDark);
            if (themeToggleBtn) themeToggleBtn.dataset.uiState = isDark ? 'dark' : 'light';
            updateTagColors();
        }

        function syncFrameTheme(isDark, options = {}) {
            if (!contentFrame || !contentFrame.contentWindow) return;
            try {
                const frameRuntime = contentFrame.contentWindow.FreecatRuntime;
                if (frameRuntime && typeof frameRuntime.applyTheme === 'function') {
                    frameRuntime.applyTheme({ animate: !!options.animate });
                    return;
                }
                const applyFrameTheme = contentFrame.contentWindow.FreecatApplyTheme;
                if (typeof applyFrameTheme === 'function') {
                    applyFrameTheme({ animate: !!options.animate });
                    return;
                }
            } catch (err) {}

            try {
                const frameDoc = contentFrame.contentDocument;
                if (!frameDoc || !frameDoc.documentElement) return;
                frameDoc.documentElement.classList.toggle('dark', isDark);
                const frameThemeToggle = frameDoc.getElementById('theme-toggle');
                if (frameThemeToggle) frameThemeToggle.dataset.uiState = isDark ? 'dark' : 'light';
            } catch (err) {}
        }

        function finishThemeTransition() {
            root.clearTimeout(themeTransitionTimer);
            themeTransitionTimer = 0;
            html.classList.remove(THEME_TRANSITION_CLASS);
            html.classList.remove(THEME_TRANSITION_FROM_DARK_CLASS);
            html.classList.remove(THEME_TRANSITION_FROM_LIGHT_CLASS);
        }

        function startThemeTransition(fromDark) {
            html.classList.add(THEME_TRANSITION_CLASS);
            html.classList.toggle(THEME_TRANSITION_FROM_DARK_CLASS, !!fromDark);
            html.classList.toggle(THEME_TRANSITION_FROM_LIGHT_CLASS, !fromDark);
            root.clearTimeout(themeTransitionTimer);
            themeTransitionTimer = root.setTimeout(
                finishThemeTransition,
                getCssDurationMs('--theme-transition-dur', 240) + 120
            );
        }

        function runAnimatedThemeChange(updateThemeState, fromDark) {
            startThemeTransition(fromDark);
            updateThemeState();
        }

        function applyTheme(options = {}) {
            const isDark = resolveThemeIsDark();
            // 状态未变时不重启过渡：同一次切换里 iframe 先经 syncFrameTheme 应用主题，
            // 随后又收到外壳写 localStorage 触发的 storage 事件；重复的 animated
            // 调用只需幂等地校准状态，避免多余的全文档强制重排推迟首帧。
            const alreadyApplied = html.classList.contains('dark') === isDark;
            const shouldAnimate = !!options.animate && !alreadyApplied && doc.body && !prefersReducedMotion();

            if (!shouldAnimate) {
                setThemeState(isDark);
                syncFrameTheme(isDark);
                return;
            }

            const fromDark = html.classList.contains('dark');
            runAnimatedThemeChange(() => {
                setThemeState(isDark);
                syncFrameTheme(isDark, { animate: false });
            }, fromDark);
        }

        function bindThemeToggle() {
            if (!themeToggleBtn) return;
            themeToggleBtn.addEventListener('click', () => {
                const willBeDark = !html.classList.contains('dark');
                platform.localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
                applyTheme({ animate: true });
            });
        }

        return {
            applyTheme,
            bindThemeToggle,
            prefersReducedMotion,
            resolveThemeIsDark,
            syncFrameTheme,
            updateTagColors
        };
    }

    return { createThemeSystem };
}));
