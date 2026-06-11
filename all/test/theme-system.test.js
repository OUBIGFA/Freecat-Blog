const test = require('node:test');
const assert = require('node:assert/strict');

const themeSystemModule = require('../src/assets/theme-system.js');

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
    const localStorage = createMemoryStorage();
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
    const themeToggleBtn = { dataset: {} };
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
        setTimeout(fn, ms) { timers.push({ fn, ms, cleared: false }); return timers.length; },
        clearTimeout(id) { if (timers[id - 1]) timers[id - 1].cleared = true; },
        requestAnimationFrame(fn) { rafQueue.push(fn); return rafQueue.length; }
    };
    const platform = {
        localStorage,
        mediaQuery() { return false; }
    };
    const contentFrame = options.contentFrame ? {
        contentWindow: {
            FreecatRuntime: {
                applyTheme(nextOptions) {
                    frameApplyThemeCalls.push(nextOptions);
                }
            }
        }
    } : null;

    const themeSystem = themeSystemModule.createThemeSystem({
        document: doc,
        window: root,
        platform,
        contentFrame,
        getCssDurationMs: () => 240
    });

    return {
        themeSystem,
        html,
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
        [{ animate: false, suppressTransitions: true }],
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
