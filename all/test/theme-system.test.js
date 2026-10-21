const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');

const { createEngine } = require('../build/template-engine.js');
const { createPlatform } = require('../src/assets/browser-platform.js');
const themeSystemModule = require('../src/assets/theme-system.js');

function themeBootstrap(siteConfig) {
    return createEngine({
        templatesDir: path.join(__dirname, '..', 'src'),
        partialsDir: path.join(__dirname, '..', 'src', 'partials'),
        siteConfig,
        socialConfig: {}
    }).applySiteConfig('<!-- THEME_SCRIPT -->');
}

function runThemeBootstrap(siteConfig, window, document) {
    vm.runInNewContext(themeBootstrap(siteConfig), {
        window,
        document,
        get localStorage() { return window.localStorage; },
        sessionStorage: createMemoryStorage(),
        // Back/forward skips the unrelated initial-scroll reset in the shared head script.
        performance: { getEntriesByType: () => [{ type: 'back_forward' }] },
        history: {}
    });
}

function createMemoryStorage() {
    const store = new Map();
    return {
        getItem(key) {
            return store.has(key) ? store.get(key) : null;
        },
        setItem(key, value) {
            store.set(key, String(value));
        },
        removeItem(key) {
            store.delete(key);
        }
    };
}

function createClassList() {
    const set = new Set();
    return {
        contains(cls) { return set.has(cls); },
        add(cls) { set.add(cls); },
        remove(cls) { set.delete(cls); },
        toggle(cls, force) {
            const want = force === undefined ? !set.has(cls) : !!force;
            if (want) set.add(cls); else set.delete(cls);
            return want;
        }
    };
}

function createHarness(options = {}) {
    const localStorage = options.localStorage === undefined ? createMemoryStorage() : options.localStorage;
    if (options.savedTheme != null) localStorage.setItem('theme', options.savedTheme);
    let systemPrefersDark = !!options.systemPrefersDark;
    const systemListeners = [];
    const colorScheme = { get matches() { return systemPrefersDark; } };
    if (options.legacyMediaQuery) {
        colorScheme.addListener = listener => systemListeners.push(listener);
    } else {
        colorScheme.addEventListener = (type, listener) => {
            assert.equal(type, 'change');
            systemListeners.push(listener);
        };
    }
    const timers = [];
    const rafQueue = [];
    let reflowCount = 0;
    const viewTransitions = [];
    const frameApplyThemeCalls = [];
    const html = {
        classList: createClassList(),
        get offsetWidth() {
            reflowCount++;
            return 0;
        }
    };
    const buttonListeners = new Map();
    const themeToggleBtn = {
        dataset: {},
        addEventListener(type, listener) { buttonListeners.set(type, listener); },
        click() { buttonListeners.get('click')(); }
    };
    const doc = {
        documentElement: html,
        body: {},
        getElementById(id) { return id === 'theme-toggle' ? themeToggleBtn : null; },
        querySelectorAll() { return []; }
    };
    if (options.viewTransition) {
        doc.startViewTransition = (callback) => {
            viewTransitions.push(callback);
            callback();
            return {};
        };
    }
    const root = {
        localStorage,
        location: { pathname: '/theme-test', search: '', hash: '' },
        matchMedia: options.noMatchMedia ? undefined : query => (
            query === '(prefers-color-scheme: dark)' ? colorScheme : { matches: false }
        ),
        setTimeout(fn, ms) { timers.push({ fn, ms, cleared: false }); return timers.length; },
        clearTimeout(id) { if (timers[id - 1]) timers[id - 1].cleared = true; },
        requestAnimationFrame(fn) { rafQueue.push(fn); return rafQueue.length; }
    };
    root.self = root.top = root;
    const platform = createPlatform(root);
    const contentFrame = typeof options.contentFrame === 'object' ? options.contentFrame : options.contentFrame ? {
        contentWindow: {
            FreecatRuntime: {
                applyTheme(nextOptions) {
                    frameApplyThemeCalls.push(nextOptions);
                }
            }
        }
    } : null;

    if (options.siteConfig) runThemeBootstrap(options.siteConfig, root, doc);
    const initialDark = html.classList.contains('dark');
    const themeSystem = themeSystemModule.createThemeSystem({
        document: doc,
        window: root,
        platform,
        contentFrame,
        getCssDurationMs: () => 240
    });

    return {
        themeSystem,
        root,
        doc,
        html,
        initialDark,
        setSystemPrefersDark(value) {
            systemPrefersDark = value;
            systemListeners.forEach(listener => listener({ matches: value }));
        },
        themeToggleBtn,
        localStorage,
        timers,
        activeTimers: () => timers.filter(t => !t.cleared),
        reflows: () => reflowCount,
        viewTransitions,
        frameApplyThemeCalls,
        flushRaf: () => {
            const pending = rafQueue.splice(0, rafQueue.length);
            pending.forEach(fn => fn());
        },
        pendingRafCount: () => rafQueue.length
    };
}

test('theme_dark remains dark when runtime starts on a light system', () => {
    const h = createHarness({ siteConfig: { theme_dark: true } });
    assert.equal(h.initialDark, true);

    h.themeSystem.applyTheme();

    assert.equal(h.html.classList.contains('dark'), true);
    assert.equal(h.themeToggleBtn.dataset.uiState, 'dark');
    assert.equal(h.localStorage.getItem('theme'), null, 'the site default is not a saved user choice');
});

const defaultThemeCases = [
    ['dark', { theme_dark: true }, 'dark'],
    ['light', { theme_light: true }, 'light'],
    ['system', { theme_system: true }, 'system'],
    ['all disabled', { theme_dark: false, theme_light: false, theme_system: false }, 'system'],
    ['unset', {}, 'system'],
    ['legacy dark', { default_theme: 'dark' }, 'dark'],
    ['legacy light', { default_theme: 'light' }, 'light'],
    ['legacy system', { default_theme: 'system' }, 'system'],
    ['invalid legacy', { default_theme: '</script><script>throw new Error("invalid")</script>' }, 'system'],
    ['dark flag priority', { theme_dark: true, theme_light: true, theme_system: true }, 'dark'],
    ['light flag priority', { theme_light: true, theme_system: true, default_theme: 'dark' }, 'light'],
    ['system flag priority', { theme_system: true, default_theme: 'dark' }, 'system']
];

for (const [label, siteConfig, defaultTheme] of defaultThemeCases) {
    test(`head and runtime agree on ${label} default and saved preference priority`, () => {
        for (const savedTheme of [null, 'dark', 'light', 'system', 'invalid', '']) {
            for (const systemPrefersDark of [false, true]) {
                const h = createHarness({ siteConfig, savedTheme, systemPrefersDark });
                const mode = ['dark', 'light', 'system'].includes(savedTheme) ? savedTheme : defaultTheme;
                const expectedDark = mode === 'dark' || (mode === 'system' && systemPrefersDark);
                const context = `saved=${JSON.stringify(savedTheme)}, systemDark=${systemPrefersDark}`;
                assert.equal(h.initialDark, expectedDark, `head: ${context}`);
                h.themeSystem.applyTheme();
                assert.equal(h.html.classList.contains('dark'), expectedDark, `runtime: ${context}`);
                assert.equal(h.themeToggleBtn.dataset.uiState, expectedDark ? 'dark' : 'light', context);
                assert.equal(h.localStorage.getItem('theme'), savedTheme, 'initialization must not overwrite storage');
            }
        }
    });
}

test('runtime without a bootstrap default keeps following the system', () => {
    const h = createHarness({ systemPrefersDark: true });
    h.themeSystem.applyTheme();
    assert.equal(h.html.classList.contains('dark'), true);
    h.setSystemPrefersDark(false);
    assert.equal(h.html.classList.contains('dark'), false);
});

for (const legacyMediaQuery of [false, true]) {
    test(`system preference changes respect the active mode (${legacyMediaQuery ? 'legacy' : 'modern'} media listener)`, () => {
        for (const [siteConfig, savedTheme, mode] of [
            [{ theme_system: true }, null, 'system'],
            [{ theme_dark: true }, null, 'dark'],
            [{ theme_light: true }, null, 'light'],
            [{ theme_dark: true }, 'system', 'system'],
            [{ theme_system: true }, 'dark', 'dark'],
            [{ theme_system: true }, 'light', 'light']
        ]) {
            const h = createHarness({ siteConfig, savedTheme, legacyMediaQuery });
            h.themeSystem.applyTheme();
            h.setSystemPrefersDark(true);
            assert.equal(h.html.classList.contains('dark'), mode !== 'light');
            h.setSystemPrefersDark(false);
            assert.equal(h.html.classList.contains('dark'), mode === 'dark');
            assert.equal(h.localStorage.getItem('theme'), savedTheme);
        }
    });
}

test('re-application observes changed or removed saved choices without losing the site default', () => {
    const h = createHarness({ siteConfig: { theme_dark: true } });
    h.themeSystem.applyTheme();
    h.themeSystem.bindThemeToggle();
    h.themeToggleBtn.click();
    assert.equal(h.localStorage.getItem('theme'), 'light');
    assert.equal(h.html.classList.contains('dark'), false);
    h.setSystemPrefersDark(true);
    assert.equal(h.html.classList.contains('dark'), false, 'a saved light choice does not follow the system');

    // main.js invokes applyTheme on storage and persisted pageshow events.
    h.localStorage.setItem('theme', 'dark');
    h.themeSystem.applyTheme();
    assert.equal(h.html.classList.contains('dark'), true);
    h.localStorage.setItem('theme', 'system');
    h.themeSystem.applyTheme();
    h.setSystemPrefersDark(false);
    assert.equal(h.html.classList.contains('dark'), false);
    h.localStorage.removeItem('theme');
    h.themeSystem.applyTheme();
    assert.equal(h.html.classList.contains('dark'), true, 'removing the user choice restores the configured dark default');
});

test('head and runtime fall back to the configured mode when storage reads fail', () => {
    const localStorage = {
        getItem() { throw new Error('Storage denied'); },
        setItem() { throw new Error('Storage denied'); }
    };
    for (const [siteConfig, systemPrefersDark, expectedDark] of [
        [{ theme_dark: true }, false, true],
        [{ theme_light: true }, true, false],
        [{ theme_system: true }, true, true],
        [{ theme_system: true }, false, false]
    ]) {
        const h = createHarness({ siteConfig, systemPrefersDark, localStorage });
        assert.equal(h.initialDark, expectedDark);
        h.themeSystem.applyTheme();
        assert.equal(h.html.classList.contains('dark'), expectedDark);
    }
});

test('head handles denial of the localStorage property itself', () => {
    const h = createHarness();
    Object.defineProperty(h.root, 'localStorage', {
        get() { throw new Error('SecurityError'); }
    });
    assert.doesNotThrow(() => runThemeBootstrap({ theme_dark: true }, h.root, h.doc));
    assert.equal(h.html.classList.contains('dark'), true);
});

for (const storageFailure of ['read and write', 'write', 'silent write', 'unavailable']) {
    test(`a ${storageFailure} storage failure still allows temporary toggles and iframe synchronization`, () => {
        const store = createMemoryStorage();
        store.setItem('theme', 'light');
        const localStorage = storageFailure === 'unavailable' ? null : {
            getItem(key) {
                if (storageFailure === 'read and write') throw new Error('Storage denied');
                return store.getItem(key);
            },
            setItem() {
                if (storageFailure !== 'silent write') throw new Error('Quota exceeded');
            }
        };
        const frame = createHarness({ siteConfig: { theme_system: true }, localStorage });
        const shell = createHarness({
            siteConfig: { theme_system: true },
            localStorage,
            contentFrame: { contentWindow: { FreecatRuntime: frame.themeSystem } }
        });
        frame.themeSystem.applyTheme();
        shell.themeSystem.applyTheme();
        shell.themeSystem.bindThemeToggle();
        shell.themeToggleBtn.click();
        assert.equal(shell.html.classList.contains('dark'), true);
        assert.equal(frame.html.classList.contains('dark'), true, 'the frame receives the unsaved choice');
        shell.themeSystem.applyTheme();
        frame.themeSystem.applyTheme();
        shell.setSystemPrefersDark(false);
        frame.setSystemPrefersDark(false);
        assert.equal(shell.html.classList.contains('dark'), true, 'the choice survives re-application');
        assert.equal(frame.html.classList.contains('dark'), true, 'the frame keeps the temporary manual choice');
        shell.themeToggleBtn.click();
        assert.equal(shell.html.classList.contains('dark'), false);
        assert.equal(frame.html.classList.contains('dark'), false);
        assert.equal(store.getItem('theme'), 'light', 'failed persistence does not claim to save the choice');
    });
}

test('a changed saved preference supersedes a temporary choice after a failed write', () => {
    const store = createMemoryStorage();
    store.setItem('theme', 'light');
    const h = createHarness({
        siteConfig: { theme_dark: true },
        localStorage: {
            getItem: key => store.getItem(key),
            setItem() { throw new Error('Quota exceeded'); }
        }
    });
    h.themeSystem.applyTheme();
    h.themeSystem.bindThemeToggle();
    h.themeToggleBtn.click();
    assert.equal(h.html.classList.contains('dark'), true);

    store.setItem('theme', 'system');
    h.themeSystem.applyTheme();
    assert.equal(h.html.classList.contains('dark'), false, 'a new stored selection wins over the old temporary choice');
    h.setSystemPrefersDark(true);
    assert.equal(h.html.classList.contains('dark'), true);
});

test('missing matchMedia falls back to light only for system mode', () => {
    for (const [siteConfig, expectedDark] of [
        [{ theme_dark: true }, true],
        [{ theme_light: true }, false],
        [{ theme_system: true }, false]
    ]) {
        const h = createHarness({ siteConfig, noMatchMedia: true });
        assert.equal(h.initialDark, expectedDark);
        h.themeSystem.applyTheme();
        assert.equal(h.html.classList.contains('dark'), expectedDark);
    }
});

test('animated theme switch uses the page-cover transition instead of the native view transition', () => {
    const h = createHarness({ viewTransition: true });
    h.localStorage.setItem('theme', 'dark');

    h.themeSystem.applyTheme({ animate: true });

    assert.equal(h.html.classList.contains('dark'), true);
    assert.equal(h.html.classList.contains('theme-transitioning'), true);
    assert.equal(h.html.classList.contains('theme-transition-from-light'), true);
    assert.equal(h.viewTransitions.length, 0, 'theme switching avoids the crash-prone native API');
    assert.equal(h.reflows(), 0, 'theme switching does not force layout before changing state');
    assert.equal(h.activeTimers().length, 1);
    assert.equal(h.activeTimers()[0].ms, 360, 'cleanup runs at duration + buffer');

    h.activeTimers()[0].fn();
    assert.equal(h.html.classList.contains('theme-transitioning'), false);
    assert.equal(h.html.classList.contains('theme-transition-from-light'), false);
});

test('shell theme switch syncs iframe state with unified transition suppression', () => {
    const h = createHarness({ viewTransition: true, contentFrame: true });
    h.localStorage.setItem('theme', 'dark');

    h.themeSystem.applyTheme({ animate: true });

    assert.equal(h.viewTransitions.length, 0, 'shell transition does not use the native view transition API');
    assert.deepEqual(
        h.frameApplyThemeCalls,
        [{ animate: false, suppressTransitions: true, transientTheme: null }],
        'framed content syncs theme state without its own animation, with element transitions suppressed in one place'
    );
});

test('suppressed instant apply flips state under theme-instant and releases it after first painted frame', () => {
    const h = createHarness();
    h.localStorage.setItem('theme', 'dark');

    h.themeSystem.applyTheme({ animate: false, suppressTransitions: true });

    assert.equal(h.html.classList.contains('dark'), true);
    assert.equal(h.html.classList.contains('theme-instant'), true, 'element transitions suppressed during the flip');
    assert.equal(h.html.classList.contains('theme-transitioning'), false, 'no page-cover overlay for instant sync');
    assert.equal(h.timers.length, 0, 'no cleanup timer — release rides on rAF');

    h.flushRaf();
    assert.equal(h.html.classList.contains('theme-instant'), true, 'still suppressed before the new colors have painted');
    h.flushRaf();
    assert.equal(h.html.classList.contains('theme-instant'), false, 'released after the painted frame');
});

test('suppressed instant re-apply with unchanged state does not arm theme-instant', () => {
    const h = createHarness();
    h.localStorage.setItem('theme', 'dark');
    h.themeSystem.applyTheme({ animate: false, suppressTransitions: true });
    h.flushRaf();
    h.flushRaf();

    h.themeSystem.applyTheme({ animate: false, suppressTransitions: true });

    assert.equal(h.html.classList.contains('theme-instant'), false, 'idempotent re-apply skips suppression');
    assert.equal(h.pendingRafCount(), 0, 'no pending release frames');
});

test('animated theme switch keeps the same page-cover path when view transitions are disabled', () => {
    const h = createHarness({ viewTransition: true });
    h.localStorage.setItem('theme', 'dark');

    h.themeSystem.applyTheme({ animate: true, viewTransition: false });

    assert.equal(h.viewTransitions.length, 0);
    assert.equal(h.html.classList.contains('dark'), true);
    assert.equal(h.html.classList.contains('theme-transitioning'), true);
});

test('animated theme switch suppresses element transitions without a forced reflow fallback', () => {
    const h = createHarness();
    h.localStorage.setItem('theme', 'dark');

    h.themeSystem.applyTheme({ animate: true });

    assert.equal(h.html.classList.contains('dark'), true);
    assert.equal(h.html.classList.contains('theme-transitioning'), true);
    assert.equal(h.reflows(), 0, 'fallback does not force layout before changing state');
    assert.equal(h.activeTimers().length, 1);
    assert.equal(h.activeTimers()[0].ms, 360, 'cleanup runs at duration + buffer');

    h.activeTimers()[0].fn();
    assert.equal(h.html.classList.contains('theme-transitioning'), false);
});

test('animated re-application with unchanged state does not restart the transition', () => {
    // 复现场景：外壳通过 syncFrameTheme 已切换 iframe 主题后，iframe 又收到同一次
    // 切换触发的 storage 事件。重复的 animated applyTheme 不应再次强制重排或重启过渡。
    const h = createHarness();
    h.localStorage.setItem('theme', 'dark');
    h.themeSystem.applyTheme({ animate: true });
    h.activeTimers()[0].fn();
    const reflowsBefore = h.reflows();
    const timersBefore = h.timers.length;

    h.themeSystem.applyTheme({ animate: true });

    assert.equal(h.html.classList.contains('dark'), true);
    assert.equal(h.html.classList.contains('theme-transitioning'), false, 'no transition restart');
    assert.equal(h.reflows(), reflowsBefore, 'no extra forced reflow');
    assert.equal(h.timers.length, timersBefore, 'no extra cleanup timer');
    assert.equal(h.themeToggleBtn.dataset.uiState, 'dark', 'button state still synced');
});

test('animated switch still runs when the resolved theme actually changes', () => {
    const h = createHarness();
    h.localStorage.setItem('theme', 'dark');
    h.themeSystem.applyTheme({ animate: true });
    h.activeTimers()[0].fn();

    h.localStorage.setItem('theme', 'light');
    h.themeSystem.applyTheme({ animate: true });

    assert.equal(h.html.classList.contains('dark'), false);
    assert.equal(h.html.classList.contains('theme-transitioning'), true);
});

test('boot-time apply (no animate) sets state without arming the transition', () => {
    const h = createHarness();
    h.localStorage.setItem('theme', 'dark');

    h.themeSystem.applyTheme();

    assert.equal(h.html.classList.contains('dark'), true);
    assert.equal(h.html.classList.contains('theme-transitioning'), false);
    assert.equal(h.timers.length, 0);
    assert.equal(h.themeToggleBtn.dataset.uiState, 'dark');
});
