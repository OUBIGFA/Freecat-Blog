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
function createHarness({ width = 1920, height = 1080, post = false } = {}) {
    const frames = new Map();
    const events = new Map();
    const observers = [];
    let nextFrame = 0;
    const content = { scrollHeight: 1000 };
    const recent = { open: false, querySelector: () => recentSummary, addEventListener() {} };
    const recentSummary = { tabIndex: 0 };
    const sidebar = {
        style: style(),
        querySelector: () => content,
        get scrollHeight() { return content.scrollHeight; },
        getBoundingClientRect: () => ({ top: 137, left: 24, width: 230 })
    };
    const window = {
        innerWidth: width, innerHeight: height,
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
            '.freecat-home-sidebar': post ? null : sidebar,
            '.freecat-home-sidebar-content': post ? null : content,
            '.freecat-post-reading-panel': post ? sidebar : null,
            '.freecat-home-recent-details': post ? null : recent,
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
        window, content, sidebar, observers, flush, recent,
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

for (const post of [false, true]) {
test(`${post ? 'article' : 'home'} sidebar scale stays stable when window height shrinks and updates on a larger screen`, () => {
    const h = createHarness({ post });
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
}

test('home recent updates start closed on mobile and remain open on desktop', () => {
    const h = createHarness({ width: 390 });
    assert.equal(h.recent.open, false);
    h.recent.open = true;
    h.resize();
    assert.equal(h.recent.open, true, 'same breakpoint resizing preserves the reader choice');
    h.window.innerWidth = 1440; h.resize();
    assert.equal(h.recent.open, true);
    h.window.innerWidth = 390; h.resize();
    assert.equal(h.recent.open, false);
    assert.equal(createHarness().recent.open, true);
});

test('article reading navigation fits above the footer and refits when the selected panel changes', () => {
    const h = createHarness({ post: true, height: 720 });
    assert.equal(h.scale(), 0.453, 'the entire reading navigation reserves footer space');
    h.content.scrollHeight = 1500;
    h.observers.forEach(callback => callback()); h.flush();
    assert.equal(h.scale(), 0.302, 'a longer updates panel also fits');
    h.content.scrollHeight = 300;
    h.observers.forEach(callback => callback()); h.flush();
    assert.equal(h.scale(), 1, 'short panels retain their natural size');
    h.window.innerWidth = 1279; h.resize();
    assert.equal(h.sidebar.style.getPropertyValue('--freecat-sidebar-scale'), '');
    h.window.innerWidth = 1280; h.resize();
    assert.equal(h.scale(), 1, 'desktop scaling resumes at the shared breakpoint');
});
