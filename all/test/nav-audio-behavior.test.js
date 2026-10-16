const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { parseHTML } = require('linkedom');
const { createEngine } = require('../build/template-engine.js');
const navAudio = require('../src/assets/nav-audio.js');

const tracks = [
    { src: 'https://example.com/one.mp3', title: '第一首' },
    { src: 'https://example.com/two.mp3', title: 'Second song' },
    { src: 'https://example.com/three.mp3', title: '第三首' }
];
const STATE_KEY = 'freecat-nav-audio-state-v1';

// Exercise generated controls and the real controller; only media, timers and layout need browser stand-ins.
function harness({ savedState, playlist = tracks } = {}) {
    const engine = createEngine({
        templatesDir: path.join(__dirname, '../src'), partialsDir: path.join(__dirname, '../src/partials'),
        siteConfig: { nav_audio: playlist.map(track => `![${track.title}](${track.src})`).join(',') },
        seoConfig: {}, socialConfig: {}
    });
    const { document } = parseHTML(`<html><body><header>${engine.applySiteConfig('<!-- NAV_AUDIO_BUTTON -->')}</header><main><article><details open>Reading state</details></article><button id="outside">Outside</button></main></body></html>`);
    const get = id => document.getElementById(id);
    const audio = get('nav-audio');
    const control = get('nav-audio-control');
    const panel = get('nav-audio-playlist');
    const toggle = get('nav-audio-playlist-toggle');
    const buttons = [...panel.querySelectorAll('[data-audio-track-index]')];
    const timers = new Map();
    const session = new Map();
    const local = new Map();
    let timerId = 0;
    let focused = null;
    Object.defineProperty(document, 'activeElement', { get: () => focused });
    document.querySelectorAll('button, input').forEach(el => {
        el.focus = () => { focused = el; el.dispatchEvent(new document.defaultView.Event('focusin', { bubbles: true })); };
        el.blur = () => { focused = null; };
    });
    control.matches = () => false;
    get('nav-audio-volume').parentElement.matches = () => false;
    const calls = { play: 0, loads: 0, closeTags: 0, closeSearch: 0 };
    const playResults = [];
    audio.currentTime = 0;
    audio.duration = 90;
    audio.paused = true;
    audio.ended = false;
    const emit = (target, name, properties = {}) => {
        const event = new target.ownerDocument.defaultView.Event(name, { bubbles: true, cancelable: true });
        Object.assign(event, properties);
        target.dispatchEvent(event);
        return event;
    };
    audio.load = () => { calls.loads++; audio.currentTime = 0; audio.paused = true; audio.ended = false; emit(audio, 'emptied'); };
    audio.play = () => {
        calls.play++;
        if (playResults.length) return playResults.shift();
        audio.paused = false;
        emit(audio, 'playing');
        return Promise.resolve();
    };
    audio.pause = () => { audio.paused = true; emit(audio, 'pause'); };
    const storage = map => ({ getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value) });
    if (savedState) session.set(STATE_KEY, JSON.stringify({
        playlistKey: playlist.map(track => track.src).join('\n'), updatedAt: Date.now(), ...savedState
    }));
    const window = {
        scrollY: 1600, addEventListener() {},
        setTimeout(fn, delay) { const id = ++timerId; timers.set(id, { fn, delay }); return id; },
        clearTimeout(id) { timers.delete(id); }
    };
    const frame = document.createElement('iframe');
    frame.contentDocument = parseHTML('<html><body><button>Article action</button></body></html>').document;
    navAudio.init({ window, document, platform: { sessionStorage: storage(session), localStorage: storage(local) },
        navAudio: audio, navAudioToggle: get('nav-audio-toggle'), isShell: true, contentFrame: frame,
        closeTagMenu() { calls.closeTags++; }, closeHeaderSearch() { calls.closeSearch++; }
    });
    return { document, window, get, audio, panel, toggle, buttons, control, calls, frame, emit, playResults, local,
        saved: () => JSON.parse(session.get(STATE_KEY)),
        flushTimers() { for (const [id, timer] of [...timers]) if (timer.delay === 0) { timers.delete(id); timer.fn(); } }
    };
}

test('the list opens while paused and closes without changing the article or starting audio', () => {
    const h = harness();
    const article = h.document.querySelector('article');
    h.toggle.click();
    assert.equal(h.panel.hidden, false);
    assert.equal(h.toggle.getAttribute('aria-expanded'), 'true');
    assert.equal(h.calls.play, 0);
    assert.equal(h.calls.closeTags, 1);
    assert.equal(h.calls.closeSearch, 1);
    h.toggle.click();
    assert.equal(h.panel.hidden, true);
    assert.equal(h.document.querySelector('article'), article);
    assert.equal(article.querySelector('details').hasAttribute('open'), true);
    assert.equal(h.window.scrollY, 1600);
});

test('choosing a song starts it at zero, marks only that song and persists the selection', () => {
    const h = harness();
    h.toggle.click();
    h.audio.currentTime = 24;
    h.buttons[1].click();
    assert.equal(h.audio.getAttribute('src'), tracks[1].src);
    assert.equal(h.audio.currentTime, 0);
    assert.equal(h.audio.paused, false);
    assert.equal(h.audio.volume, 0.5);
    assert.equal(h.panel.hidden, false, 'keep the list available for another selection');
    assert.equal(h.panel.querySelectorAll('[aria-current="true"]').length, 1);
    assert.equal(h.buttons[1].getAttribute('aria-current'), 'true');
    assert.equal(h.buttons[1].querySelector('.nav-audio-track-status').textContent, '播放中');
    assert.equal(h.saved().index, 1);
    assert.equal(h.saved().paused, false);
    assert.equal(h.window.scrollY, 1600);
});

test('selecting the current song does not restart it and resumes after pause', () => {
    const h = harness();
    h.buttons[1].click();
    h.audio.currentTime = 24;
    const loads = h.calls.loads;
    h.buttons[1].click();
    assert.equal(h.calls.play, 1);
    assert.equal(h.audio.currentTime, 24);
    h.get('nav-audio-toggle').click();
    assert.equal(h.audio.paused, true);
    assert.equal(h.buttons[1].querySelector('.nav-audio-track-status').textContent, '已暂停');
    h.buttons[1].click();
    assert.equal(h.calls.play, 2);
    assert.equal(h.calls.loads, loads);
    assert.equal(h.audio.currentTime, 24);
});

test('natural progression and wraparound update the same list, including a one-song playlist', () => {
    for (const playlist of [tracks, tracks.slice(0, 1)]) {
        const h = harness({ playlist });
        h.buttons.at(-1).click();
        h.audio.currentTime = 90;
        h.emit(h.audio, 'ended');
        assert.equal(h.audio.getAttribute('src'), playlist[0].src);
        assert.equal(h.audio.currentTime, 0);
        assert.equal(h.buttons[0].getAttribute('aria-current'), 'true');
        assert.equal(h.saved().index, 0);
    }
});

test('restoring a paused session selects the saved song without autoplay', () => {
    const h = harness({ savedState: { index: 2, currentTime: 35, paused: true } });
    h.flushTimers();
    assert.equal(h.audio.getAttribute('src'), tracks[2].src);
    assert.equal(h.audio.currentTime, 35);
    assert.equal(h.buttons[2].getAttribute('aria-current'), 'true');
    assert.equal(h.calls.play, 0);
});

test('an old play rejection cannot skip a newly selected song', async () => {
    const h = harness();
    let reject;
    h.playResults.push(new Promise((_resolve, fail) => { reject = fail; }));
    h.buttons[0].click();
    h.buttons[2].click();
    reject(Object.assign(new Error('old source interrupted'), { name: 'AbortError' }));
    await Promise.resolve();
    h.flushTimers();
    assert.equal(h.audio.getAttribute('src'), tracks[2].src);
    assert.equal(h.calls.play, 2);
    assert.equal(h.audio.paused, false);
});

test('a queued playback failure cannot override manual selection or restart after pause', async () => {
    for (const selectAnother of [false, true]) {
        const h = harness();
        h.playResults.push(Promise.reject(new Error('unavailable song')));
        h.buttons[0].click();
        await Promise.resolve();
        if (selectAnother) h.buttons[2].click();
        else h.get('nav-audio-toggle').click();
        h.flushTimers();
        assert.equal(h.calls.play, selectAnother ? 2 : 1);
        assert.equal(h.audio.getAttribute('src'), tracks[selectAnother ? 2 : 0].src);
        assert.equal(h.get('nav-audio-toggle').getAttribute('aria-pressed'), String(selectAnother));
    }
});

test('playback policy rejection stops instead of cycling through songs', async () => {
    const h = harness();
    h.playResults.push(Promise.reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' })));
    h.buttons[1].click();
    await Promise.resolve();
    h.flushTimers();
    assert.equal(h.calls.play, 1);
    assert.equal(h.buttons[1].getAttribute('aria-current'), 'true');
    assert.equal(h.get('nav-audio-toggle').getAttribute('aria-pressed'), 'false');
});

test('unavailable songs advance once each and stop after the whole playlist fails', async () => {
    const h = harness();
    h.audio.play = () => { h.calls.play++; return Promise.reject(new Error('unavailable')); };
    h.buttons[0].click();
    for (let i = 0; i < tracks.length; i++) { await Promise.resolve(); h.flushTimers(); }
    assert.equal(h.calls.play, tracks.length);
    assert.equal(h.get('nav-audio-toggle').getAttribute('aria-pressed'), 'false');
});

test('outside pointer, outside focus and Escape close the disclosure; Escape restores focus', () => {
    const h = harness();
    for (const event of ['pointerdown', 'focusin']) {
        h.toggle.click();
        h.emit(h.get('outside'), event);
        assert.equal(h.panel.hidden, true);
        assert.equal(h.toggle.getAttribute('aria-expanded'), 'false');
    }
    h.toggle.click();
    h.buttons[1].focus();
    const escape = h.emit(h.buttons[1], 'keydown', { key: 'Escape' });
    assert.equal(escape.defaultPrevented, true);
    assert.equal(h.panel.hidden, true);
    assert.equal(h.document.activeElement, h.toggle);
    assert.equal(h.window.scrollY, 1600);
});

test('frame interactions close the list and the binding follows subsequent navigations', () => {
    const h = harness();
    const oldDocument = h.frame.contentDocument;
    h.toggle.click();
    h.emit(oldDocument.querySelector('button'), 'pointerdown');
    assert.equal(h.panel.hidden, true);
    const next = parseHTML('<html><body><button>Next article</button></body></html>').document;
    h.frame.contentDocument = next;
    // A new frame can already be interactive while images/media still delay its load event.
    h.toggle.click();
    h.emit(oldDocument.querySelector('button'), 'pointerdown');
    assert.equal(h.panel.hidden, false, 'the detached document no longer controls the header');
    h.emit(next.querySelector('button'), 'focusin');
    assert.equal(h.panel.hidden, true);
    h.toggle.click();
    h.frame.contentDocument = oldDocument;
    h.emit(h.frame, 'load');
    h.emit(oldDocument.querySelector('button'), 'pointerdown');
    assert.equal(h.panel.hidden, true);
});

test('volume stays independent of the list and is retained when selecting another song', () => {
    const h = harness();
    h.buttons[0].click();
    h.emit(h.control, 'pointerenter');
    assert.equal(h.control.dataset.volumeOpen, 'true');
    h.toggle.click();
    h.emit(h.control, 'pointerenter');
    assert.equal(h.control.dataset.volumeOpen, 'false');
    const volume = h.get('nav-audio-volume');
    volume.value = '0.3';
    h.emit(volume, 'input');
    h.buttons[2].click();
    assert.equal(h.audio.volume, 0.3);
    assert.equal(h.local.get('freecat-nav-audio-volume-v1'), '0.3');
});
