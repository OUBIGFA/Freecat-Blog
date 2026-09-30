const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parseHTML } = require('linkedom');
const { renderCopyButton } = require('../build/copy-button.js');
const mediaTemplate = require('../shared/media-player-template.js');

function browser(html, wide = true) {
    const { window, document } = parseHTML(html);
    let focused;
    window.HTMLElement.prototype.focus = function () { focused = this; };
    const frames = [];
    window.requestAnimationFrame = fn => frames.push(fn);
    const desktop = { matches: wide, addEventListener(_type, listener) { this.onChange = listener; } };
    window.matchMedia = () => desktop;
    const context = vm.createContext({ window, document, self: window, CustomEvent: window.CustomEvent,
        URLSearchParams, setTimeout, clearTimeout, console });
    return { window, document, context, focused: () => focused,
        resize(wide) { desktop.matches = wide; desktop.onChange?.(); },
        run(file) { vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/assets', file), 'utf8'), context); },
        flush() { frames.splice(0).forEach(fn => fn()); } };
}

test('tabs switch panels with arrow keys and keep one tab in the keyboard sequence', () => {
    const h = browser('<div data-tabs><div role="tablist"><button id="a" role="tab" aria-selected="true" aria-controls="pa">目录</button><button id="b" role="tab" aria-selected="false" aria-controls="pb">最近更新</button></div><div id="pa" role="tabpanel"></div><div id="pb" role="tabpanel" hidden></div></div>');
    h.run('tabs.js');
    h.window.FreecatTabs.init(h.document.querySelector('[data-tabs]'));
    const event = new h.window.Event('keydown', { bubbles: true, cancelable: true });
    event.key = 'ArrowRight';
    h.document.getElementById('a').dispatchEvent(event);
    assert.equal(h.document.getElementById('a').getAttribute('aria-selected'), 'false');
    assert.equal(h.document.getElementById('b').getAttribute('aria-selected'), 'true');
    assert.equal(h.document.getElementById('a').getAttribute('tabindex'), '-1');
    assert.equal(h.document.getElementById('b').getAttribute('tabindex'), '0');
    assert.equal(h.document.getElementById('pa').hidden, true);
    assert.equal(h.document.getElementById('pb').hidden, false);
    assert.equal(h.focused().id, 'b');
});

test('a single reading tab stays visible and selected on desktop', () => {
    const h = browser('<aside data-tabs data-tabs-desktop><div role="tablist"><button id="toc" role="tab" aria-selected="true" aria-controls="toc-panel">目录</button></div><div id="toc-panel" role="tabpanel" data-desktop-only>目录内容</div></aside>');
    h.run('tabs.js');
    const list = h.document.querySelector('[role="tablist"]');
    const tab = h.document.getElementById('toc');
    const panel = h.document.getElementById('toc-panel');
    assert.equal(list.hidden, false);
    assert.equal(tab.getAttribute('aria-selected'), 'true');
    assert.equal(tab.getAttribute('tabindex'), '0');
    assert.equal(panel.hidden, false);
    assert.equal(panel.getAttribute('aria-labelledby'), 'toc');
    const event = new h.window.Event('keydown', { bubbles: true, cancelable: true });
    event.key = 'ArrowRight';
    tab.dispatchEvent(event);
    assert.equal(h.focused(), tab);
    assert.equal(panel.hidden, false);
    h.resize(false);
    assert.equal(list.hidden, true);
    h.resize(true);
    assert.equal(list.hidden, false);
    assert.equal(panel.hidden, false);
});

test('reading tabs hide the mobile TOC and preserve the selected desktop panel after resizing', () => {
    const h = browser('<aside data-tabs data-tabs-desktop><div role="tablist"><button id="toc" role="tab" aria-selected="true" aria-controls="toc-panel">目录</button><button id="updates" role="tab" aria-selected="false" aria-controls="updates-panel">最近更新</button></div><div id="toc-panel" role="tabpanel" data-desktop-only>目录内容</div><div id="updates-panel" role="tabpanel" hidden><details><summary>最近更新</summary>更新内容</details></div></aside>', false);
    h.run('tabs.js');
    const toc = h.document.getElementById('toc-panel');
    const updates = h.document.getElementById('updates-panel');
    assert.equal(toc.hidden, true);
    assert.equal(updates.hidden, false);
    assert.equal(h.document.querySelector('[role="tablist"]').hidden, true);
    assert.equal(updates.querySelector('details').open, false);
    h.resize(true);
    assert.equal(toc.hidden, false);
    assert.equal(updates.hidden, true);
    h.document.getElementById('updates').click();
    h.resize(false);
    h.resize(true);
    assert.equal(toc.hidden, true);
    assert.equal(updates.hidden, false);
    assert.equal(updates.querySelector('details').open, true);
});

test('sort tabs reorder the real list and restore the URL choice without duplicating posts', () => {
    const h = browser('<div data-tabs data-update-sort-controls><div role="tablist"><button id="date" role="tab" data-sort-mode="date" aria-selected="true" aria-controls="posts-list">All posts</button><button id="modified" role="tab" data-sort-mode="modified" aria-selected="false" aria-controls="posts-list">按更新排序</button></div></div><div id="posts-list" role="tabpanel"><article class="post-card" id="older" data-sort-date="1" data-sort-modified="3"></article><article class="post-card" id="newer" data-sort-date="2" data-sort-modified="2"></article></div>');
    const location = new URL('https://example.com/all?updateSort=modified');
    h.window.location = location;
    h.window.history = { replaceState(_state, _unused, url) { location.href = new URL(url, location).href; } };
    h.run('tabs.js'); h.run('update-sort.js');
    h.window.FreecatUpdateSort.init({ window: h.window, document: h.document, framed: false,
        runtime: { setSyncUpdateSortUrl() {} }, syncParentFrameHistory() {}, prefersReducedMotion: () => true }).initUpdateSortControls();
    const list = h.document.getElementById('posts-list');
    assert.equal(h.document.getElementById('modified').getAttribute('aria-selected'), 'true');
    assert.equal(list.firstElementChild.id, 'older');
    h.document.getElementById('date').click();
    assert.equal(list.firstElementChild.id, 'newer');
    assert.equal(list.children.length, 2);
    assert.equal(location.search, '');
    assert.equal(list.hidden, false);
    assert.equal(list.getAttribute('aria-labelledby'), 'date');
});

test('copy confirms success only after the clipboard resolves', async () => {
    const h = browser('<div class="code-block-container">' + renderCopyButton({ className: 'code-copy-btn', ariaLabel: '复制代码', text: '复制' }) + '<pre><code>const x = 1;</code></pre></div>');
    let resolveCopy;
    const copied = [];
    h.run('code-copy.js');
    h.window.FreecatCodeCopy.init({ document: h.document, copyText(text) { copied.push(text); return new Promise(resolve => { resolveCopy = resolve; }); } });
    const button = h.document.querySelector('button');
    assert.ok(button, 'copy is a native keyboard-accessible button');
    button.click();
    assert.notEqual(button.dataset.state, 'copied');
    resolveCopy(); await Promise.resolve();
    assert.equal(button.dataset.state, 'copied');
    assert.equal(button.querySelector('[role="status"]').textContent, '已复制');
    assert.deepEqual(copied, ['const x = 1;']);
});

test('copy failure never reports success and allows another attempt', async () => {
    const h = browser('<div class="code-block-container">' + renderCopyButton({ text: '复制' }) + '<pre><code>retry me</code></pre></div>');
    h.run('code-copy.js');
    let reject = true;
    h.window.FreecatCodeCopy.init({ document: h.document, copyText: () => reject ? Promise.reject(new Error('denied')) : Promise.resolve() });
    const button = h.document.querySelector('button');
    button.click();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(button.dataset.state, 'error');
    assert.equal(button.hasAttribute('aria-busy'), false);
    reject = false;
    button.click();
    await Promise.resolve();
    assert.equal(button.dataset.state, 'copied');
});

function mediaBrowser() {
    const h = browser(mediaTemplate.renderAudioPlayer({ title: '本地音频', src: '/sample.wav' }));
    h.window.FreecatMediaPlayerTemplate = mediaTemplate;
    const media = h.document.querySelector('audio');
    // The DOM implementation has no decoder; only the media boundary is substituted.
    Object.assign(media, { duration: 120, currentTime: 0, paused: true, muted: false, playbackRate: 1,
        play() { this.paused = false; this.dispatchEvent(new h.window.Event('play')); return Promise.resolve(); },
        pause() { this.paused = true; this.dispatchEvent(new h.window.Event('pause')); } });
    h.run('media-player.js');
    h.window.FreecatMediaPlayer.hydrateMediaControls(h.document.querySelector('.media-player-container'), media);
    media.dispatchEvent(new h.window.Event('loadedmetadata'));
    h.media = media;
    h.key = (target, key) => {
        const event = new h.window.Event('keydown', { bubbles: true, cancelable: true });
        event.key = key;
        target.dispatchEvent(event);
    };
    return h;
}

test('speed menu supports keyboard selection, announces the choice and returns focus', () => {
    const h = mediaBrowser();
    const trigger = h.document.querySelector('.media-speed-btn');
    const menu = h.document.querySelector('.media-speed-dropdown');
    h.key(trigger, 'ArrowDown');
    assert.equal(trigger.getAttribute('aria-expanded'), 'true');
    assert.equal(h.focused().dataset.speed, '1');
    h.key(h.focused(), 'ArrowDown');
    assert.equal(h.focused().dataset.speed, '1.25');
    h.focused().click();
    assert.equal(h.media.playbackRate, 1.25);
    assert.equal(menu.querySelector('[aria-checked="true"]').dataset.speed, '1.25');
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(h.focused(), trigger);
    h.key(trigger, 'ArrowDown');
    h.key(h.focused(), 'Escape');
    assert.equal(menu.inert, true);
    assert.equal(h.focused(), trigger);
});

test('unmuting after dragging volume to zero restores an audible volume', () => {
    const h = mediaBrowser();
    const slider = h.document.querySelector('.media-volume-slider');
    const mute = h.document.querySelector('.media-volume-btn');
    slider.value = '0.3';
    slider.dispatchEvent(new h.window.Event('input'));
    slider.value = '0';
    slider.dispatchEvent(new h.window.Event('input'));
    mute.click();
    assert.equal(h.media.muted, false);
    assert.equal(h.media.volume, 0.3);
    assert.equal(mute.getAttribute('aria-label'), '静音');
});

test('seeking preserves pause state and rejects an unknown or infinite duration', () => {
    const h = mediaBrowser();
    const progress = h.document.querySelector('.media-progress-container');
    progress.getBoundingClientRect = () => ({ left: 0, width: 200 });
    progress.setPointerCapture = () => {};
    progress.hasPointerCapture = () => false;
    const seek = () => {
        const event = new h.window.Event('pointerdown');
        Object.assign(event, { clientX: 100, button: 0, pointerId: 1 });
        progress.dispatchEvent(event);
        progress.dispatchEvent(new h.window.Event('pointerup'));
    };
    seek();
    assert.equal(h.media.currentTime, 60);
    assert.equal(h.media.paused, true);
    h.key(progress, 'End');
    assert.equal(h.media.currentTime, 120);
    h.media.duration = Infinity;
    seek();
    assert.equal(h.media.currentTime, 120);
});
