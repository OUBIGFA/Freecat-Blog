const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { seamlessPaginationJs } = require('../test-support/assets.js');

// 浏览器和网络只提供事件边界；实际导航、列表更新和历史写入均执行生产代码。
function createPaginationHarness({ framed = false } = {}) {
    const listeners = new Map();
    const timers = new Map();
    const requests = new Map();
    const history = [];
    const parentHistory = [];
    let timerId = 0;
    function element(html = '') {
        const classes = new Set();
        return {
            innerHTML: html,
            classList: {
                add: name => classes.add(name),
                remove: name => classes.delete(name),
                contains: name => classes.has(name)
            },
            addEventListener: (name, listener) => listeners.set(name, listener),
            contains: () => false
        };
    }
    const posts = element('Initial page');
    const pagination = element();
    const location = new URL('https://example.com/');
    const documents = new Map([
        ['<p>Second page</p>', { 'posts-list': element('<p>Second page</p>'), 'pagination-buttons': element('Page 2') }],
        ['<p>Third page</p>', { 'posts-list': element('<p>Third page</p>'), 'pagination-buttons': element('Page 3') }]
    ]);
    const context = vm.createContext({
        URL, AbortController, console: { error() {} },
        setTimeout(callback, delay) { timers.set(++timerId, { callback, delay }); return timerId; },
        clearTimeout(id) { timers.delete(id); },
        DOMParser: class {
            parseFromString(html) { return { getElementById: id => documents.get(html)[id] }; }
        }
    });
    vm.runInContext(seamlessPaginationJs, context);
    context.FreecatSeamlessPagination.init({
        shared: require('../shared/shared.js'),
        window: {
            location, scrollTo() {},
            history: {
                state: {},
                pushState: (state, title, url) => history.push({ method: 'push', url }),
                replaceState: (state, title, url) => history.push({ method: 'replace', url })
            }
        },
        document: {
            getElementById: id => id === 'posts-list' ? posts : pagination,
            addEventListener() {}
        },
        platform: {
            fetch(url) {
                return new Promise((resolve, reject) => requests.set(url, { resolve, reject }));
            }
        },
        lazyImages: { initDeferredImages() {}, unobserveDeferredImages() {} },
        fitTagRows() {}, applyStaggeredAnimations() {},
        syncParentFrameHistory: options => parentHistory.push(options),
        getCssDurationMs: () => 200, framed
    });
    function click(page, modifiers = {}) {
        let prevented = false;
        const link = {
            href: `https://example.com/page/${page}/`,
            getAttribute: name => name === 'href' ? `/page/${page}/` : null,
            classList: { contains: () => false }
        };
        listeners.get('click')({
            target: { closest: () => link }, button: 0,
            preventDefault() { prevented = true; }, ...modifiers
        });
        return prevented;
    }
    async function respond(page, { fail = false } = {}) {
        const request = requests.get(`/page/${page}/`);
        if (fail) request.reject(new Error('Offline'));
        else request.resolve(new Response(page === 2 ? '<p>Second page</p>' : '<p>Third page</p>'));
        await new Promise(resolve => setImmediate(resolve));
    }
    return { posts, pagination, history, parentHistory, location, timers, requests, click, respond };
}

test('rapid pagination keeps the last selected page when responses arrive out of order', async () => {
    const h = createPaginationHarness();
    h.click(2);
    h.click(3);
    await h.respond(3);
    await h.respond(2);
    assert.equal(h.posts.innerHTML, '<p>Third page</p>');
    assert.equal(h.pagination.innerHTML, 'Page 3');
    assert.deepEqual(h.history, [{ method: 'push', url: 'https://example.com/page/3/' }]);
    assert.equal(h.parentHistory.length, 1);
});

test('an obsolete pagination failure does not navigate away from the newer page', async () => {
    const h = createPaginationHarness();
    h.click(2);
    h.click(3);
    await h.respond(3);
    await h.respond(2, { fail: true });
    assert.equal(h.location.href, 'https://example.com/');
    assert.equal(h.posts.innerHTML, '<p>Third page</p>');
});

test('an obsolete pagination timer cannot fade out a completed navigation', async () => {
    const h = createPaginationHarness();
    h.click(2);
    h.click(3);
    await h.respond(3);
    for (const { callback, delay } of h.timers.values()) if (delay === 100) callback();
    assert.equal(h.posts.classList.contains('page-transitioning-out'), false);
    await h.respond(2);
});

test('the current pagination failure still falls back to the requested page', async () => {
    const h = createPaginationHarness();
    h.click(2);
    await h.respond(2, { fail: true });
    assert.equal(h.location.href, 'https://example.com/page/2/');
});

test('pagination inside the shell replaces iframe history and pushes one parent entry', async () => {
    const h = createPaginationHarness({ framed: true });
    h.click(2);
    await h.respond(2);
    assert.deepEqual(h.history, [{ method: 'replace', url: 'https://example.com/page/2/' }]);
    assert.equal(h.parentHistory.length, 1);
    assert.equal(h.parentHistory[0].push, true);
});

test('modified pagination clicks retain native new-tab and new-window behavior', () => {
    const h = createPaginationHarness();
    for (const modifiers of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
        assert.equal(h.click(2, modifiers), false);
    }
    assert.equal(h.requests.size, 0);
});
