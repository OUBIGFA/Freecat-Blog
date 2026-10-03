const test = require('node:test');
const assert = require('node:assert/strict');
const { parseHTML } = require('linkedom');
const shared = require('../shared/shared.js');
const router = require('../src/assets/shell-router.js');
const navAudio = require('../src/assets/nav-audio.js');

// Real DOM and player controller; only media decoding, frame loading and browser history are simulated.
function harness() {
    const { document } = parseHTML('<html lang="zh-CN"><head><title>Original article</title><link rel="canonical" href="https://example.com/posts/one/"/><meta name="robots" content="index,follow"/></head><body><div class="page-wrapper"><header class="fixed"><button id="nav-audio-toggle" data-audio-src="/song.mp3">Play</button><audio id="nav-audio"></audio></header><main><article><h1>Original article</h1><details open>Reading state</details><a href="/posts/two/">Next article</a></article></main><footer>Footer</footer></div></body></html>');
    const original = document.querySelector('article');
    const audio = document.getElementById('nav-audio');
    const calls = { play: 0, pause: 0, saves: [], frozen: 0, frames: [], history: [], reload: 0 };
    audio.paused = true;
    audio.load = () => {};
    audio.pause = () => { audio.paused = true; calls.pause++; };
    audio.play = () => { audio.paused = false; calls.play++; return Promise.resolve(); };
    const events = new Map();
    const window = {
        location: new URL('https://example.com/posts/one/'), scrollY: 1600, innerWidth: 1280,
        addEventListener: (name, fn) => events.set(name, fn), setTimeout, clearTimeout,
        scrollTo(x, y) { this.scrollY = y; },
        history: { state: {} }
    };
    window.location.reload = () => calls.reload++;
    for (const method of ['pushState', 'replaceState']) window.history[method] = (state, title, url) => {
        window.history.state = state;
        window.location.href = new URL(url, window.location.href).href;
        calls.history.push({ method, url });
    };
    const storage = new Map();
    const platform = { sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) }, localStorage: { getItem: () => null } };
    const runtime = {
        setNavigate(fn) { this.navigate = fn; }, setSyncFrameHistory(fn) { this.sync = fn; },
        saveScrollPosition() { calls.saves.push({ url: window.location.pathname, y: window.scrollY }); },
        freezeScrollSaves() { calls.frozen++; }
    };
    const frame = router.createContentFrame(document);
    document.querySelector('header').getBoundingClientRect = () => ({ height: 73 });
    navAudio.init({ window, document, platform, navAudioToggle: document.getElementById('nav-audio-toggle'), navAudio: audio, isShell: true, contentFrame: frame, closeTagMenu() {}, closeHeaderSearch() {} });
    router.initShellRouter({ window, document, platform, runtime, shared, contentFrame: frame, initialContent: true, resolveThemeIsDark: () => false, syncFrameTheme() {} });
    function prepare(route, noindex = false) {
        const { document: child } = parseHTML('<html lang="zh-CN"><head><title>' + route + '</title><link rel="canonical" href="https://example.com' + route + '"/><meta name="robots" content="' + (noindex ? 'noindex,follow' : 'index,follow') + '"/></head><body><article><h1>Next</h1></article></body></html>');
        child.documentElement.getBoundingClientRect = () => ({ width: 1265 });
        frame.contentDocument = child;
        frame.contentWindow = { innerWidth: 1280, location: new URL('https://example.com' + route), scrollTo() {} };
        frame.contentWindow.location.replace = url => calls.frames.push(url);
        return child;
    }
    function complete(route, noindex = false) {
        prepare(route, noindex);
        frame.dispatchEvent(new document.defaultView.Event('load'));
    }
    return { document, original, audio, window, frame, calls, runtime, complete, prepare, events, storage };
}

test('the first page commits when its DOM is ready without waiting for media load', () => {
    const h = harness();
    h.runtime.navigate('/posts/two/');
    const child = h.prepare('/posts/two/');
    h.runtime.sync({ readyDocument: child });
    assert.equal(h.window.location.pathname, '/posts/two/');
    assert.equal(h.frame.style.visibility, '');
    assert.equal(h.document.getElementById('nav-audio') === h.audio, true);
});

test('repeated first clicks do not restart a pending frame navigation', () => {
    const h = harness();
    h.runtime.navigate('/posts/two/');
    h.prepare('/posts/two/');
    h.runtime.navigate('/posts/two/');
    h.runtime.navigate('/posts/two/');
    assert.deepEqual(h.calls.frames, []);
});

test('outdated ready notifications and late load events cannot replace the latest destination', () => {
    const h = harness();
    h.runtime.navigate('/posts/two/');
    const oldDocument = h.prepare('/posts/two/');
    h.runtime.navigate('/posts/three/');
    h.runtime.sync({ readyDocument: oldDocument });
    assert.equal(h.original.isConnected, true);
    const nextDocument = h.prepare('/posts/three/');
    h.runtime.sync({ readyDocument: oldDocument });
    assert.equal(h.original.isConnected, true);
    h.runtime.sync({ readyDocument: nextDocument });
    assert.equal(h.window.location.pathname, '/posts/three/');
    h.runtime.navigate('/posts/four/');
    h.frame.dispatchEvent(new h.document.defaultView.Event('load'));
    assert.equal(h.window.location.pathname, '/posts/four/');
    assert.equal(h.calls.history.filter(entry => entry.method === 'pushState').length, 2);
});

test('first play and pause keep the article, reading position, player and metadata intact', () => {
    const h = harness();
    h.document.getElementById('nav-audio-toggle').click();
    assert.equal(h.calls.play, 1);
    assert.equal(h.audio.paused, false);
    assert.equal(h.document.querySelector('article') === h.original, true);
    assert.equal(h.original.querySelector('details').hasAttribute('open'), true);
    assert.equal(h.window.scrollY, 1600);
    assert.equal(h.frame.isConnected, false, 'playback must not load or display an article frame');
    assert.equal(h.document.querySelector('meta[name=robots]').content, 'index,follow');
    h.document.getElementById('nav-audio-toggle').click();
    assert.equal(h.audio.paused, true);
    assert.equal(h.window.scrollY, 1600);
});

test('the first article navigation retains the original player and commits only when content loads', () => {
    const h = harness();
    h.document.getElementById('nav-audio-toggle').click();
    h.runtime.navigate('/posts/two/');
    assert.equal(h.document.querySelector('article') === h.original, true, 'keep the current page visible while loading');
    assert.equal(h.window.location.pathname, '/posts/one/');
    h.complete('/posts/two/');
    assert.equal(h.document.getElementById('nav-audio') === h.audio, true, 'the original audio remains connected');
    assert.equal(h.audio.paused, false);
    assert.equal(h.calls.play, 1, 'navigation never restarts playback');
    assert.equal(h.original.isConnected, false);
    assert.equal(h.window.location.pathname, '/posts/two/');
    assert.equal(h.document.querySelector('link[rel=canonical]').getAttribute('href'), 'https://example.com/posts/two/');
    assert.deepEqual(h.calls.saves.at(-1), { url: '/posts/one/', y: 1600 });
    assert.equal(h.calls.frozen, 1);
    assert.equal(h.calls.history.filter(entry => entry.method === 'pushState').length, 1);
    h.window.location.pathname = '/posts/one/';
    h.events.get('popstate')();
    assert.deepEqual(h.calls.frames, ['/posts/one/']);
    assert.ok(JSON.parse(h.storage.get('freecat-scroll-restore-requests-v1'))['/posts/one/']);
    h.complete('/posts/one/');
    assert.equal(h.document.getElementById('nav-audio') === h.audio, true, 'the original audio remains connected');
    assert.equal(h.audio.paused, false);
});

test('search noindex is replaced when returning to an article without restarting audio', () => {
    const h = harness();
    h.document.getElementById('nav-audio-toggle').click();
    h.runtime.navigate('/search');
    h.complete('/search', true);
    assert.equal(h.document.querySelector('meta[name=robots]').content, 'noindex,follow');
    h.runtime.navigate('/posts/two/');
    h.complete('/posts/two/');
    assert.equal(h.document.querySelector('meta[name=robots]').content, 'index,follow');
    assert.equal(h.calls.play, 1);
    assert.equal(h.audio.paused, false);
    assert.equal(h.document.getElementById('nav-audio') === h.audio, true);
});

test('article links without a trailing slash commit their canonical destination', () => {
    const h = harness();
    h.runtime.navigate('/posts/two');
    assert.equal(h.frame.getAttribute('src'), '/posts/two/');
    h.complete('/posts/two/');
    assert.equal(h.window.location.pathname, '/posts/two/');
    assert.equal(h.document.getElementById('nav-audio') === h.audio, true);
});
