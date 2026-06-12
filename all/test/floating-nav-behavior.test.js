const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { floatingNavJs } = require('../test-support/assets.js');

function createFloatingNavHarness({ framed, parentHistoryState = null, historyState = null } = {}) {
    const calls = {
        navigate: [],
        parentBack: 0,
        selfBack: 0,
        syncUpdateSortUrl: 0
    };
    const listeners = {};
    const linkListeners = {};
    const floatingGoBackBtn = {
        classList: { remove() {} },
        addEventListener(type, listener) {
            listeners[type] = listener;
        }
    };
    const goBackLink = {
        addEventListener(type, listener) {
            linkListeners[type] = listener;
        }
    };
    const floatingNavPanel = {
        isConnected: true,
        classList: { toggle() {} },
        setAttribute() {},
        contains() { return false; },
        getBoundingClientRect() {
            return { width: 48, height: 144, top: 80, right: 1240, bottom: 224, left: 1192 };
        }
    };
    const document = {
        referrer: '',
        body: { dataset: { page: 'post' } },
        fonts: null,
        getElementById(id) {
            if (id === 'floating-go-back') return floatingGoBackBtn;
            return null;
        },
        querySelector(selector) {
            if (selector === '.freecat-floating-nav-panel') return floatingNavPanel;
            return null;
        },
        querySelectorAll(selector) {
            if (selector === '[data-go-back]') return [goBackLink];
            return [];
        }
    };
    const window = {
        document,
        innerWidth: 1280,
        innerHeight: 720,
        location: {
            origin: 'https://example.test',
            href: 'https://example.test/posts/example/',
            pathname: '/posts/example/',
            search: ''
        },
        history: {
            state: historyState,
            back() {
                calls.selfBack += 1;
            }
        },
        parent: {
            history: {
                state: parentHistoryState,
                back() {
                    calls.parentBack += 1;
                }
            }
        },
        performance: {
            now() { return 0; }
        },
        requestAnimationFrame(callback) {
            callback(0);
            return 1;
        },
        addEventListener() {},
        scrollTo() {}
    };

    const context = { window, globalThis: window };
    vm.runInNewContext(floatingNavJs, context);
    window.FreecatFloatingNav.init({
        window,
        document,
        runtime: {
            syncUpdateSortUrl() {
                calls.syncUpdateSortUrl += 1;
            }
        },
        framed,
        navigateWithinSite(url, options) {
            calls.navigate.push([url, options]);
        }
    });

    return {
        calls,
        clickFloatingGoBack() {
            listeners.click();
        },
        clickTextGoBack() {
            linkListeners.click({
                preventDefault() {
                    calls.preventDefault = (calls.preventDefault || 0) + 1;
                }
            });
        }
    };
}

test('framed direct URL go back uses the home fallback instead of leaving the site', () => {
    const harness = createFloatingNavHarness({
        framed: true,
        parentHistoryState: { freecatShell: true, freecatShellIndex: 0 }
    });

    harness.clickFloatingGoBack();

    assert.equal(harness.calls.parentBack, 0);
    assert.equal(harness.calls.navigate.length, 1);
    assert.equal(harness.calls.navigate[0][0], '/');
    assert.equal(harness.calls.navigate[0][1].replace, true);
});

test('legacy framed shell state without an index is treated as a direct URL entry', () => {
    const harness = createFloatingNavHarness({
        framed: true,
        parentHistoryState: { freecatShell: true }
    });

    harness.clickFloatingGoBack();

    assert.equal(harness.calls.parentBack, 0);
    assert.equal(harness.calls.navigate.length, 1);
    assert.equal(harness.calls.navigate[0][0], '/');
    assert.equal(harness.calls.navigate[0][1].replace, true);
});

test('framed in-site history entries go back through the parent shell', () => {
    const harness = createFloatingNavHarness({
        framed: true,
        parentHistoryState: { freecatShell: true, freecatShellIndex: 1 }
    });

    harness.clickFloatingGoBack();

    assert.equal(harness.calls.parentBack, 1);
    assert.deepEqual(harness.calls.navigate, []);
});

test('text go back links reuse the same home fallback as the floating go back button', () => {
    const harness = createFloatingNavHarness({
        framed: true,
        parentHistoryState: { freecatShell: true, freecatShellIndex: 0 }
    });

    harness.clickTextGoBack();

    assert.equal(harness.calls.preventDefault, 1);
    assert.equal(harness.calls.parentBack, 0);
    assert.equal(harness.calls.navigate.length, 1);
    assert.equal(harness.calls.navigate[0][0], '/');
    assert.equal(harness.calls.navigate[0][1].replace, true);
});
