const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { layoutMetricsJs } = require('../test-support/assets.js');

function style() {
    const values = new Map();
    return {
        setProperty: (key, value) => values.set(key, value),
        getPropertyValue: key => values.get(key) || '',
        removeProperty: key => values.delete(key)
    };
}

// 使用真实测量模块，输入不同屏幕与内容高度；不依赖浏览器字体的固定像素。
function createHarness() {
    const frames = new Map();
    const events = new Map();
    const observers = [];
    let nextFrame = 0;
    const content = { scrollHeight: 1000 };
    const sidebar = {
        style: style(),
        querySelector: () => content,
        getBoundingClientRect: () => ({ top: 137, left: 24, width: 230 })
    };
    const window = {
        innerWidth: 1920, innerHeight: 1080,
        requestAnimationFrame(fn) { frames.set(++nextFrame, fn); return nextFrame; },
        addEventListener(name, fn) {
            if (!events.has(name)) events.set(name, []);
            events.get(name).push(fn);
        },
        getComputedStyle: () => ({ paddingTop: '6px' })
    };
    const document = {
        documentElement: { style: style() },
        getElementById: () => null,
        querySelector: selector => ({
            '.freecat-home-sidebar': sidebar,
            '.freecat-home-sidebar-content': content,
            '.freecat-site-footer': { offsetHeight: 100 }
        })[selector] || null
    };
    const context = { ResizeObserver: class {
        constructor(callback) { observers.push(callback); }
        observe() {}
    } };
    vm.runInNewContext(layoutMetricsJs, context);
    context.FreecatLayoutMetrics.init({ window, document, framed: true });
    function flush() {
        while (frames.size) {
            const callbacks = [...frames.values()];
            frames.clear();
            callbacks.forEach(fn => fn());
        }
    }
    flush();
    return {
        window, content, sidebar, observers, flush,
        resize() { events.get('resize').forEach(fn => fn()); flush(); },
        scale: () => Number(sidebar.style.getPropertyValue('--freecat-sidebar-scale'))
    };
}

test('all sidebar content fits above the footer without paging or clipping', () => {
    const h = createHarness();
    assert.equal(h.scale(), (1080 - 137 - 6 - 100 - 24) / 1000);
    assert.ok(137 + 6 + h.content.scrollHeight * h.scale() <= 1080 - 100 - 24);
    h.content.scrollHeight = 500;
    h.observers[0](); h.flush();
    assert.equal(h.scale(), 1, 'short sidebars are not enlarged');
});

test('sidebar scale stays stable when window height shrinks and updates on a larger screen', () => {
    const h = createHarness();
    const original = h.scale();
    h.window.innerHeight = 720; h.resize();
    assert.equal(h.scale(), original);
    h.window.innerHeight = 1200; h.resize();
    assert.ok(h.scale() > original);
    h.content.scrollHeight = 1400;
    h.observers[0](); h.flush();
    assert.ok(137 + 6 + 1400 * h.scale() <= 1200 - 100 - 24);
    h.window.innerWidth = 1024; h.resize();
    assert.equal(h.sidebar.style.getPropertyValue('--freecat-sidebar-scale'), '');
});
