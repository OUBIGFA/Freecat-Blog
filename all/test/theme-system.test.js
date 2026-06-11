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

function createHarness() {
    const localStorage = createMemoryStorage();
    const timers = [];
    let reflowCount = 0;

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
    const root = {
        setTimeout(fn, ms) { timers.push({ fn, ms, cleared: false }); return timers.length; },
        clearTimeout(id) { if (timers[id - 1]) timers[id - 1].cleared = true; }
    };
    const platform = {
        localStorage,
        mediaQuery() { return false; }
    };

    const themeSystem = themeSystemModule.createThemeSystem({
        document: doc,
        window: root,
        platform,
        contentFrame: null,
        getCssDurationMs: () => 240
    });

    return {
        themeSystem,
        html,
        themeToggleBtn,
        localStorage,
        timers,
        activeTimers: () => timers.filter(t => !t.cleared),
        reflows: () => reflowCount
    };
}

test('animated theme switch arms the transition class then removes it after the timer', () => {
    const h = createHarness();
    h.localStorage.setItem('theme', 'dark');

    h.themeSystem.applyTheme({ animate: true });

    assert.equal(h.html.classList.contains('dark'), true);
    assert.equal(h.html.classList.contains('theme-transitioning'), true);
    assert.equal(h.reflows(), 1, 'arming the transition forces exactly one reflow');
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
