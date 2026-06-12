const test = require('node:test');
const assert = require('node:assert/strict');

const shared = require('../shared/shared.js');
const scrollMemory = require('../src/assets/scroll-memory.js');

// scroll-memory 行为测试：用假窗口环境驱动真实模块，
// 验证"保存 → 恢复请求 → 恢复/重试/取消"的可观察行为，
// 不断言内部实现细节。恢复重试间隔为 80ms，等待时间据此设置。

const POSITIONS_KEY = 'freecat-scroll-positions-v1';
const REQUESTS_KEY = 'freecat-scroll-restore-requests-v1';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createHarness(options = {}) {
    const {
        pathname = '/posts/foo.html',
        search = '',
        hash = '',
        scrollHeight = 4000,
        innerHeight = 800,
        positions = null,
        requests = null,
        navigationType = 'navigate'
    } = options;

    const store = new Map();
    if (positions) store.set(POSITIONS_KEY, JSON.stringify(positions));
    if (requests) store.set(REQUESTS_KEY, JSON.stringify(requests));

    const windowListeners = new Map();
    const documentListeners = new Map();

    function addListener(map, type, fn) {
        if (!map.has(type)) map.set(type, []);
        map.get(type).push(fn);
    }

    const harness = {
        scrollHeight,
        readStore(key) {
            const raw = store.get(key);
            return raw ? JSON.parse(raw) : null;
        },
        fireWindow(type, event) {
            (windowListeners.get(type) || []).slice().forEach((fn) => fn(event));
        },
        fireDocument(type) {
            (documentListeners.get(type) || []).slice().forEach((fn) => fn());
        }
    };

    const win = {
        scrollX: 0,
        scrollY: 0,
        innerHeight,
        location: { pathname, search, hash },
        history: { scrollRestoration: 'auto' },
        performance: {
            getEntriesByType(type) {
                return type === 'navigation' ? [{ type: navigationType }] : [];
            }
        },
        requestAnimationFrame(fn) { return setTimeout(fn, 0); },
        setTimeout(fn, ms) { return setTimeout(fn, ms); },
        clearTimeout(id) { clearTimeout(id); },
        scrollTo(x, y) {
            win.scrollX = x;
            win.scrollY = y;
        },
        addEventListener(type, fn) { addListener(windowListeners, type, fn); },
        removeEventListener(type, fn) {
            const fns = windowListeners.get(type) || [];
            const index = fns.indexOf(fn);
            if (index !== -1) fns.splice(index, 1);
        }
    };

    const doc = {
        fonts: null,
        visibilityState: 'visible',
        get scrollingElement() {
            return { scrollHeight: harness.scrollHeight };
        },
        addEventListener(type, fn) { addListener(documentListeners, type, fn); }
    };

    const platform = {
        sessionStorage: {
            getItem: (key) => (store.has(key) ? store.get(key) : null),
            setItem: (key, value) => { store.set(key, String(value)); },
            removeItem: (key) => { store.delete(key); }
        }
    };

    const runtime = {
        saveScrollPosition: null,
        freezeScrollSaves: null,
        setSaveScrollPosition(fn) { runtime.saveScrollPosition = fn; },
        setFreezeScrollSaves(fn) { runtime.freezeScrollSaves = fn; }
    };

    harness.window = win;
    harness.document = doc;
    harness.runtime = runtime;
    harness.init = () => scrollMemory.init({ window: win, document: doc, platform, runtime, shared });
    return harness;
}

test('init switches browser scroll restoration to manual', () => {
    const harness = createHarness();
    harness.init();
    assert.equal(harness.window.history.scrollRestoration, 'manual');
});

test('pagehide saves the current position under the normalized page key', () => {
    const harness = createHarness({ pathname: '/posts/foo.html' });
    harness.init();
    harness.window.scrollY = 1234;
    harness.fireWindow('pagehide');

    const saved = harness.readStore(POSITIONS_KEY);
    assert.equal(saved['/posts/foo'].y, 1234, 'position stored under the .html-stripped key');
});

test('a fresh shell restore request restores the saved position on load', async () => {
    const harness = createHarness({
        positions: { '/posts/foo': { x: 0, y: 1500, time: Date.now() } },
        requests: { '/posts/foo': Date.now() }
    });
    harness.init();
    await sleep(60);
    assert.equal(harness.window.scrollY, 1500, 'restored to the saved offset');
});

test('navigation type back_forward restores without a shell request', async () => {
    const harness = createHarness({
        navigationType: 'back_forward',
        positions: { '/posts/foo': { x: 0, y: 900, time: Date.now() } }
    });
    harness.init();
    await sleep(60);
    assert.equal(harness.window.scrollY, 900);
});

test('an expired restore request is ignored and pruned', async () => {
    const harness = createHarness({
        positions: { '/posts/foo': { x: 0, y: 1500, time: Date.now() } },
        requests: { '/posts/foo': Date.now() - 120000 }
    });
    harness.init();
    await sleep(60);
    assert.equal(harness.window.scrollY, 0, 'no restore from an expired request');
    assert.equal(harness.readStore(REQUESTS_KEY), null, 'expired request entry is pruned');
});

test('a restore request for another page does not move this one', async () => {
    const harness = createHarness({
        positions: { '/posts/foo': { x: 0, y: 1500, time: Date.now() } },
        requests: { '/posts/bar': Date.now() }
    });
    harness.init();
    await sleep(60);
    assert.equal(harness.window.scrollY, 0);
});

test('restore keeps retrying until late content makes the page tall enough', async () => {
    const harness = createHarness({
        scrollHeight: 1000,
        positions: { '/posts/foo': { x: 0, y: 1500, time: Date.now() } },
        requests: { '/posts/foo': Date.now() }
    });
    harness.init();
    await sleep(120);
    assert.equal(harness.window.scrollY, 200, 'clamped to the short page bottom while content loads');

    harness.scrollHeight = 4000;
    await sleep(200);
    assert.equal(harness.window.scrollY, 1500, 'reaches the target once content grew');
});

test('user input cancels pending restore retries', async () => {
    const harness = createHarness({
        scrollHeight: 1000,
        positions: { '/posts/foo': { x: 0, y: 1500, time: Date.now() } },
        requests: { '/posts/foo': Date.now() }
    });
    harness.init();
    await sleep(120);
    harness.fireWindow('wheel');
    harness.window.scrollY = 50;

    harness.scrollHeight = 4000;
    await sleep(200);
    assert.equal(harness.window.scrollY, 50, 'no retry fights the user after manual scrolling');
});

test('saves are suppressed while a restore is still retrying', async () => {
    const harness = createHarness({
        scrollHeight: 1000,
        positions: { '/posts/foo': { x: 0, y: 1500, time: Date.now() } },
        requests: { '/posts/foo': Date.now() }
    });
    harness.init();
    await sleep(120);
    harness.fireWindow('pagehide');

    const saved = harness.readStore(POSITIONS_KEY);
    assert.equal(saved['/posts/foo'].y, 1500, 'intermediate clamped position must not overwrite the restore target');
});

test('frozen documents ignore the teardown zero-scroll write, pageshow lifts the freeze', () => {
    const harness = createHarness();
    harness.init();
    harness.window.scrollY = 1234;
    harness.fireWindow('pagehide');
    assert.equal(harness.readStore(POSITIONS_KEY)['/posts/foo'].y, 1234, 'baseline save works');

    // 模拟外壳替换文档：冻结后浏览器把滚动重置为 0 并触发销毁期 pagehide
    harness.runtime.freezeScrollSaves();
    harness.window.scrollY = 0;
    harness.fireWindow('pagehide');
    assert.equal(harness.readStore(POSITIONS_KEY)['/posts/foo'].y, 1234, 'teardown zero write is blocked');

    // bfcache 复活：pageshow 解冻，保存恢复正常
    harness.fireWindow('pageshow', {});
    harness.window.scrollY = 777;
    harness.fireWindow('pagehide');
    assert.equal(harness.readStore(POSITIONS_KEY)['/posts/foo'].y, 777, 'saves resume after pageshow');
});
