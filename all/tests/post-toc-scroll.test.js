const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createElementStub() {
    return {
        style: {},
        classList: {
            add() {},
            remove() {},
            toggle() {}
        },
        appendChild() {},
        remove() {},
        setAttribute() {},
        focus() {},
        select() {}
    };
}

function createTocHarness() {
    const listeners = new Map();
    const scrollCalls = [];
    const anchor = {
        addEventListener(type, handler) {
            listeners.set(type, handler);
        },
        getAttribute(name) {
            return name === 'href' ? '#target-heading' : null;
        }
    };
    const article = {
        offsetTop: 400,
        offsetHeight: 2600,
        getBoundingClientRect() {
            return { top: 400, bottom: 3000 };
        }
    };
    const heading = {
        offsetTop: 1200,
        getBoundingClientRect() {
            return { top: 1600, bottom: 1640 };
        }
    };
    const header = {
        getBoundingClientRect() {
            return { bottom: 80 };
        }
    };
    const documentElement = { style: {}, scrollHeight: 3600 };
    const document = {
        readyState: 'complete',
        body: { appendChild() {} },
        head: { appendChild() {} },
        documentElement,
        scrollingElement: documentElement,
        createElement: createElementStub,
        execCommand() {
            return true;
        },
        addEventListener() {},
        getElementById(id) {
            return id === 'target-heading' ? heading : null;
        },
        querySelector(selector) {
            if (selector === 'article') return article;
            if (selector === 'header.fixed') return header;
            return null;
        },
        querySelectorAll(selector) {
            if (selector === 'nav a[href^="#"]') return [anchor];
            return [];
        }
    };
    const window = {
        document,
        navigator: {},
        innerHeight: 800,
        pageYOffset: 0,
        scrollY: 0,
        location: { href: 'https://example.test/post.html', host: 'example.test' },
        history: {
            replaceState(_state, _title, url) {
                window.location.href = 'https://example.test/post.html' + url;
            },
            back() {}
        },
        addEventListener() {},
        setTimeout(fn) {
            fn();
            return 1;
        },
        clearTimeout() {},
        requestAnimationFrame(fn) {
            fn(0);
            return 1;
        },
        scrollTo(arg) {
            scrollCalls.push(arg);
            const top = typeof arg === 'number' ? arguments[1] : arg.top;
            window.scrollY = top;
            window.pageYOffset = top;
        },
        getComputedStyle() {
            return {
                getPropertyValue(name) {
                    return name === '--freecat-header-safe-gap' ? '24px' : '';
                }
            };
        }
    };
    document.defaultView = window;

    return { window, document, listeners, scrollCalls };
}

test('TOC click scrolls to the heading absolute page position with the live header offset', () => {
    const harness = createTocHarness();
    const scriptPath = path.join(__dirname, '..', 'src', 'assets', 'post.js');
    const source = fs.readFileSync(scriptPath, 'utf8');

    vm.runInNewContext(source, {
        window: harness.window,
        document: harness.document,
        navigator: harness.window.navigator,
        history: harness.window.history,
        performance: { now: () => 0 },
        requestAnimationFrame: harness.window.requestAnimationFrame,
        setTimeout: harness.window.setTimeout,
        clearTimeout: harness.window.clearTimeout,
        console
    });

    const clickHandler = harness.listeners.get('click');
    assert.equal(typeof clickHandler, 'function');

    clickHandler.call({
        getAttribute(name) {
            return name === 'href' ? '#target-heading' : null;
        }
    }, {
        preventDefault() {}
    });

    assert.equal(harness.scrollCalls[0].top, 1496);
    assert.equal(harness.scrollCalls[0].behavior, 'smooth');
    assert.equal(harness.window.location.href, 'https://example.test/post.html#target-heading');
});
