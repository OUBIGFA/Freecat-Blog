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
    // 无遮罩的过渡抑制类：外壳同步 iframe 主题时用它统一压住 iframe 里
    // 所有元素自身的颜色过渡（遮罩淡出由外壳文档负责，iframe 不再各切各的）。
    const THEME_INSTANT_CLASS = 'theme-instant';

    function createThemeSystem(options) {
        const doc = options.document;
        const root = options.window;
        const platform = options.platform;
        const contentFrame = options.contentFrame;
        const getCssDurationMs = options.getCssDurationMs;
        const html = doc.documentElement;
        const themeToggleBtn = doc.getElementById('theme-toggle');
        // 与 head 共用构建期默认模式；旧页面未提供时保持跟随系统。
        const defaultTheme = root.__FREECAT_DEFAULT_THEME__ || 'system';
        let transientTheme = null;
        let themeTransitionTimer = 0;

        function prefersReducedMotion() {
            return platform.mediaQuery('(prefers-reduced-motion: reduce)');
        }

        function resolveThemeMode() {
            const savedTheme = platform.localStorage.getItem('theme');
            // storage 后续发生变化时让位给新选择，保留原有跨标签页同步语义。
            if (transientTheme && transientTheme.savedTheme !== savedTheme) transientTheme = null;
            const theme = transientTheme ? transientTheme.value : savedTheme;
            return theme === 'dark' || theme === 'light' || theme === 'system' ? theme : defaultTheme;
        }

        function retainUnsavedTheme(theme) {
            // storageFacade 会吞掉写入异常，必须读回确认；失败仅在当前文档保留选择。
            const savedTheme = platform.localStorage.getItem('theme');
            transientTheme = theme && theme !== savedTheme ? { value: theme, savedTheme } : null;
        }

        function resolveThemeIsDark() {
            const theme = resolveThemeMode();
            return theme === 'dark' || (theme === 'system' && platform.mediaQuery('(prefers-color-scheme: dark)'));
        }

        function setThemeState(isDark) {
            html.classList.toggle('dark', isDark);
            if (themeToggleBtn) themeToggleBtn.dataset.uiState = isDark ? 'dark' : 'light';
            // 标签深浅配色由构建期写入的 CSS 变量（--tag-bg-dark 等）+
            // transitions.css 的主题规则承担，这里不再遍历 DOM 改写内联样式。
        }

        function syncFrameTheme(isDark, options = {}) {
            if (!contentFrame || !contentFrame.contentWindow) return;
            try {
                const frameRuntime = contentFrame.contentWindow.FreecatRuntime;
                if (frameRuntime && typeof frameRuntime.applyTheme === 'function') {
                    frameRuntime.applyTheme({
                        animate: !!options.animate,
                        suppressTransitions: !!options.suppressTransitions,
                        transientTheme: transientTheme ? transientTheme.value : null
                    });
                    return;
                }
                const applyFrameTheme = contentFrame.contentWindow.FreecatApplyTheme;
                if (typeof applyFrameTheme === 'function') {
                    applyFrameTheme({
                        animate: !!options.animate,
                        suppressTransitions: !!options.suppressTransitions,
                        transientTheme: transientTheme ? transientTheme.value : null
                    });
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

        // 统一控制的"瞬时切换"：先压住所有元素自身的过渡，再翻转主题状态；
        // 等带着新配色的首帧渲染完成（双 rAF）后恢复 —— 恢复瞬间没有属性变化，
        // 不会触发任何补间。用于 iframe 内容页接受外壳同步的场景。
        function runInstantThemeChange(updateThemeState) {
            html.classList.add(THEME_INSTANT_CLASS);
            updateThemeState();
            root.requestAnimationFrame(() => {
                root.requestAnimationFrame(() => {
                    html.classList.remove(THEME_INSTANT_CLASS);
                });
            });
        }

        function applyTheme(options = {}) {
            // 外壳同步不可持久化的选择，iframe 不再依赖一次失败的 storage 写入。
            if (options.transientTheme !== undefined) retainUnsavedTheme(options.transientTheme);
            const isDark = resolveThemeIsDark();
            // 状态未变时不重启过渡：同一次切换里 iframe 先经 syncFrameTheme 应用主题，
            // 随后又收到外壳写 localStorage 触发的 storage 事件；重复的 animated
            // 调用只需幂等地校准状态，避免多余的全文档强制重排推迟首帧。
            const alreadyApplied = html.classList.contains('dark') === isDark;
            const shouldAnimate = !!options.animate && !alreadyApplied && doc.body && !prefersReducedMotion();

            if (!shouldAnimate) {
                const applyState = () => {
                    setThemeState(isDark);
                    syncFrameTheme(isDark);
                };
                if (options.suppressTransitions && !alreadyApplied && doc.body
                    && typeof root.requestAnimationFrame === 'function') {
                    runInstantThemeChange(applyState);
                } else {
                    applyState();
                }
                return;
            }

            const fromDark = html.classList.contains('dark');
            runAnimatedThemeChange(() => {
                setThemeState(isDark);
                syncFrameTheme(isDark, { animate: false, suppressTransitions: true });
            }, fromDark);
        }

        function bindThemeToggle() {
            if (!themeToggleBtn) return;
            themeToggleBtn.addEventListener('click', () => {
                const willBeDark = !html.classList.contains('dark');
                const theme = willBeDark ? 'dark' : 'light';
                platform.localStorage.setItem('theme', theme);
                retainUnsavedTheme(theme);
                applyTheme({ animate: true });
            });
        }

        // 始终监听，用户清除已保存选择后也能恢复系统跟随；显式模式不受系统变化影响。
        if (typeof root.matchMedia === 'function') {
            const colorScheme = root.matchMedia('(prefers-color-scheme: dark)');
            const followSystemTheme = () => {
                if (resolveThemeMode() !== 'system') return;
                const framed = root.self !== root.top;
                applyTheme({ animate: !framed, suppressTransitions: framed });
            };
            if (typeof colorScheme.addEventListener === 'function') colorScheme.addEventListener('change', followSystemTheme);
            else if (typeof colorScheme.addListener === 'function') colorScheme.addListener(followSystemTheme);
        }

        return {
            applyTheme,
            bindThemeToggle,
            prefersReducedMotion,
            resolveThemeIsDark,
            syncFrameTheme
        };
    }

    return { createThemeSystem };
}));
