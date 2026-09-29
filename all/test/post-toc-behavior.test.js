const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { postJs } = require('../test-support/assets.js');

// 驱动真实文章模块，验证长目录的跟随行为及滚动帧中的布局读取次数。
function createTocHarness({ reducedMotion = false, wide = true, linkCount = 100 } = {}) {
    const listeners = new Map();
    const frames = new Map();
    const observers = [];
    const scrolls = [];
    const marker = new Map();
    let nextFrame = 0;
    const h = { headingReads: 0, headingShift: 0, usingToc: false };
    function element() {
        const attrs = new Map();
        const events = new Map();
        return {
            hidden: false,
            getAttribute: (name) => attrs.get(name),
            setAttribute: (name, value) => attrs.set(name, value),
            removeAttribute: (name) => attrs.delete(name),
            addEventListener(name, handler) { events.set(name, handler); },
            fire(name) { events.get(name)?.call(this, { preventDefault() {} }); },
            focus() { document.activeElement = this; }
        };
    }
    const links = Array.from({ length: linkCount }, (_, index) => {
        const link = element();
        link.setAttribute('href', `#section-${index}`);
        return Object.assign(link, { offsetTop: index * 40, offsetHeight: 40 });
    });
    const nav = { style: { setProperty: (key, value) => marker.set(key, value) } };
    const container = {
        clientHeight: 200,
        scrollTop: 0,
        querySelector: () => nav,
        scrollTo(options) { scrolls.push(options); this.scrollTop = options.top; }
    };
    const toc = Object.assign(element(), {
        open: false,
        getBoundingClientRect: () => ({ top: 150 }),
        querySelectorAll: () => links,
        matches: () => h.usingToc
    });
    const summary = Object.assign(element(), { offsetHeight: 44 });
    const controls = Object.assign(element(), { offsetHeight: 44 });
    const more = element();
    const collapse = element();
    const media = { matches: wide, addEventListener(name, handler) { this.change = handler; } };
    const article = { getBoundingClientRect: () => ({ bottom: 110000 }) };
    const window = {
        FreecatShared: {},
        FreecatCodeFolding: { init() {} },
        scrollY: 0, pageYOffset: 0, innerHeight: 800,
        getComputedStyle: () => ({ getPropertyValue: () => '' }),
        matchMedia: (query) => query.includes('reduced-motion') ? { matches: reducedMotion, addEventListener() {} } : media,
        scrollTo(options) { h.pageScroll = options; },
        requestAnimationFrame(fn) { frames.set(++nextFrame, fn); return nextFrame; },
        addEventListener(name, fn) { listeners.set(name, fn); }
    };
    const headings = links.map((_, index) => Object.assign(element(), {
        getBoundingClientRect() {
            h.headingReads++;
            return { top: 600 + index * 1000 + h.headingShift - window.scrollY };
        }
    }));
    const document = {
        readyState: 'complete', fonts: null,
        documentElement: { classList: { contains: () => false } },
        scrollingElement: { scrollHeight: 110000 },
        querySelector: (selector) => selector === '.freecat-post-toc' ? toc : selector === 'article' ? article : null,
        querySelectorAll: () => [],
        getElementById: (id) => ({ 'toc-container': container, 'toc-summary': summary,
            'toc-controls': controls, 'toc-more': more, 'toc-collapse': collapse })[id]
            || headings[Number(id.replace('section-', ''))],
        addEventListener() {}
    };
    class ResizeObserver {
        constructor(callback) { this.callback = callback; observers.push(this); }
        observe() {}
    }
    h.flush = () => {
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((fn) => fn());
    };
    h.scroll = (position) => {
        window.scrollY = window.pageYOffset = position;
        listeners.get('scroll')();
    };
    h.open = () => { toc.open = true; toc.fire('toggle'); h.flush(); };
    h.switchWidth = value => { media.matches = value; media.change(); h.flush(); };
    Object.assign(h, { links, scrolls, marker, observers, frames, toc, summary, controls, more, collapse, document });
    vm.runInNewContext(postJs, { window, document, ResizeObserver, history: { replaceState() {} } });
    h.flush();
    return h;
}

test('long-article scrolling coalesces frames and reuses heading measurements', () => {
    const h = createTocHarness();
    assert.equal(h.headingReads, 100);
    for (let i = 0; i < 10; i++) h.scroll(10500 + i);
    assert.equal(h.frames.size, 1);
    h.flush();
    assert.equal(h.headingReads, 100, 'scrolling must not remeasure every heading');
    assert.equal(h.links[10].getAttribute('aria-current'), 'location');
    h.headingShift = 4000;
    h.observers[0].callback();
    h.flush();
    assert.equal(h.headingReads, 200);
    assert.equal(h.links[6].getAttribute('aria-current'), 'location');
});

test('TOC follows smoothly to the nearest visible edge without interrupting manual use', () => {
    const h = createTocHarness();
    h.scroll(10500);
    h.flush();
    assert.equal(h.scrolls.at(-1).behavior, 'smooth');
    assert.equal(h.scrolls.at(-1).top, 264);
    assert.equal(h.marker.get('--toc-active-top'), '408px');
    const count = h.scrolls.length;
    h.usingToc = true;
    h.scroll(20500);
    h.flush();
    assert.equal(h.scrolls.length, count);
    assert.equal(h.links[20].getAttribute('aria-current'), 'location');
});

test('reduced-motion users receive an immediate TOC position update', () => {
    const h = createTocHarness({ reducedMotion: true });
    h.scroll(10500);
    h.flush();
    assert.equal(h.scrolls.at(-1).behavior, 'instant');
});

test('mobile TOC reveals complete entries in batches and collapses all in one action', () => {
    const h = createTocHarness({ wide: false, linkCount: 12 });
    assert.equal(h.toc.open, false);
    assert.equal(h.controls.hidden, true);
    h.open();
    assert.equal(h.links.filter(link => !link.hidden).length, 4);
    h.more.fire('click');
    assert.equal(h.links.filter(link => !link.hidden).length, 9);
    h.more.fire('click');
    assert.equal(h.links.filter(link => !link.hidden).length, 12);
    assert.equal(h.more.hidden, true);
    h.collapse.fire('click');
    assert.equal(h.toc.open, false);
    assert.equal(h.controls.hidden, true);
    assert.equal(h.document.activeElement, h.summary);
    h.open();
    assert.equal(h.links.filter(link => !link.hidden).length, 4);
});

test('short mobile TOC needs no more button and a chapter selection closes it before jumping', () => {
    const h = createTocHarness({ wide: false, linkCount: 3 });
    h.open();
    assert.equal(h.links.filter(link => !link.hidden).length, 3);
    assert.equal(h.more.hidden, true);
    h.links[1].fire('click');
    assert.equal(h.toc.open, false);
    assert.equal(h.controls.hidden, true);
    assert.ok(h.pageScroll.top > 0);
});

test('desktop TOC remains fully open and switching to mobile resets disclosure', () => {
    const h = createTocHarness({ wide: false, linkCount: 12 });
    h.open();
    h.switchWidth(true);
    assert.equal(h.toc.open, true);
    assert.equal(h.controls.hidden, true);
    assert.equal(h.links.filter(link => !link.hidden).length, 12);
    h.switchWidth(false);
    assert.equal(h.toc.open, false);
    h.open();
    assert.equal(h.links.filter(link => !link.hidden).length, 4);
});
