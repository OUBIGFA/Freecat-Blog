const test = require('node:test');
const assert = require('node:assert/strict');
const { initShellRouter } = require('../src/assets/shell-router.js');

// 执行真实外壳同步逻辑，覆盖普通滚动条、覆盖式滚动条及正文文档切换。
function createLayoutHarness() {
    const shellStyles = new Map();
    const listeners = new Map();
    const location = new URL('https://example.com/posts/article/');
    const observers = [];
    const frameRoot = { clientWidth: 1425, style: { setProperty() {} }, getBoundingClientRect() { return { width: this.layoutWidth ?? this.clientWidth }; } };
    const frame = {
        contentWindow: { innerWidth: 1440, location },
        contentDocument: { documentElement: frameRoot, readyState: 'complete', title: 'Article' },
        addEventListener(name, fn) { listeners.set(`frame:${name}`, fn); }
    };
    const window = {
        location,
        innerWidth: 1440,
        history: { state: { freecatShell: true, freecatShellIndex: 0 } },
        addEventListener(name, fn) { listeners.set(name, fn); },
        ResizeObserver: class {
            constructor(callback) { this.callback = callback; observers.push(this); }
            observe(target) { this.target = target; }
            disconnect() { this.target = null; }
        }
    };
    const document = {
        documentElement: { style: { setProperty(name, value) { shellStyles.set(name, value); } } },
        querySelector() { return { getBoundingClientRect() { return { height: 73 }; } }; },
        addEventListener() {}
    };
    initShellRouter({
        shared: require('../shared/shared.js'),
        window, document, contentFrame: frame,
        runtime: { setNavigate() {}, setSyncFrameHistory() {} },
        resolveThemeIsDark: () => false,
        syncFrameTheme() {}
    });
    return { shellStyles, listeners, observers, frame, frameRoot };
}

test('shell header reserves the current native scrollbar width on load and resize', () => {
    const h = createLayoutHarness();
    assert.equal(h.shellStyles.get('--freecat-frame-scrollbar-width'), '15px');
    h.frameRoot.clientWidth = 1420;
    h.listeners.get('resize')();
    assert.equal(h.shellStyles.get('--freecat-frame-scrollbar-width'), '20px');
    h.frameRoot.clientWidth = 1440;
    h.listeners.get('resize')();
    assert.equal(h.shellStyles.get('--freecat-frame-scrollbar-width'), '0px');
});

test('shell observes the new article after navigation and keeps header offsets intact', () => {
    const h = createLayoutHarness();
    const styles = new Map();
    const nextRoot = {
        clientWidth: 1423,
        getBoundingClientRect() { return { width: this.clientWidth }; },
        style: { setProperty(name, value) { styles.set(name, value); } }
    };
    h.frame.contentDocument = { documentElement: nextRoot, readyState: 'complete', title: 'Next' };
    h.listeners.get('frame:load')();
    assert.equal(h.observers[0].target, nextRoot);
    assert.equal(h.shellStyles.get('--freecat-frame-scrollbar-width'), '17px');
    assert.equal(styles.get('--freecat-page-top-offset'), '97px');
    nextRoot.clientWidth = 1440;
    h.observers[0].callback();
    assert.equal(h.shellStyles.get('--freecat-frame-scrollbar-width'), '0px');
});

test('shell reserves a stable scrollbar gutter even when clientWidth includes it', () => {
    const h = createLayoutHarness();
    h.frameRoot.clientWidth = 1440;
    h.frameRoot.layoutWidth = 1425;
    h.listeners.get('resize')();
    assert.equal(h.shellStyles.get('--freecat-frame-scrollbar-width'), '15px');
});
