const test = require('node:test');
const assert = require('node:assert/strict');
const { parseHTML, DOMParser } = require('linkedom');
const shared = require('../shared/shared.js');
const { generateShellBootstrapScript } = require('../build/template-engine.js');

const ARTICLE = '<html lang="zh-CN"><head><title>Article</title><link rel="canonical" href="https://example.com/posts/1/"/><meta name="description" content="Article summary"/><script type="application/ld+json">{"@type":"BlogPosting"}</script></head><body><button id="nav-audio-toggle">Play</button><article><h1>Article</h1><p>Full article text</p></article></body></html>';
const SHELL = '<html><head><title>Shell</title><link rel="canonical" href="https://example.com/shell"/><meta name="robots" content="noindex,follow"/></head><body data-freecat-shell-root="true"><iframe id="freecat-content-frame"></iframe></body></html>';

// Run the generated script against a real DOM; isolate only network and document replacement.
async function runBootstrap({ userAgent = 'Chrome', framed = false, action, response = SHELL, ok = true, url = 'https://example.com/posts/1/' } = {}) {
    const { document } = parseHTML(ARTICLE);
    const calls = { fetch: [], writes: [], warnings: [], redirects: [], prevented: 0 };
    const listeners = new Map();
    document.addEventListener = (type, callback) => listeners.set(type, callback);
    document.open = () => {};
    document.write = html => calls.writes.push(html);
    document.close = () => {};
    const window = { location: new URL(url), FreecatShared: shared };
    window.location.replace = value => calls.redirects.push(value);
    window.self = window;
    window.top = framed ? {} : window;
    const fetch = async url => {
        calls.fetch.push(url);
        return { ok, status: ok ? 200 : 503, text: async () => response };
    };
    const log = { warn: (...args) => calls.warnings.push(args) };
    new Function('window', 'document', 'navigator', 'fetch', 'DOMParser', 'AbortSignal', 'console', generateShellBootstrapScript())(
        window, document, { userAgent }, fetch, DOMParser, AbortSignal, log
    );
    if (action && listeners.has('click')) {
        await listeners.get('click')({
            isTrusted: action === 'play', button: 0,
            target: document.getElementById('nav-audio-toggle'),
            preventDefault() { calls.prevented++; }, stopImmediatePropagation() {}
        });
    }
    await new Promise(resolve => setImmediate(resolve));
    return { ...calls, document, window };
}

test('first render retains the same complete article for all user agents', async () => {
    for (const userAgent of ['Chrome', 'Googlebot', 'Google-InspectionTool', 'Unrecognized renderer']) {
        const result = await runBootstrap({ userAgent });
        assert.equal(result.fetch.length, 0);
        assert.equal(result.writes.length, 0);
        assert.equal(result.document.querySelector('article').textContent, 'ArticleFull article text');
    }
});

test('legacy shared hash URLs open the matching article without requiring audio playback', async () => {
    const result = await runBootstrap({ url: 'https://example.com/#/posts/1/' });
    assert.deepEqual(result.redirects, ['/posts/1/']);
    assert.equal(result.fetch.length, 0);
    const external = await runBootstrap({ url: 'https://example.com/#//other.example/post' });
    assert.deepEqual(external.redirects, []);
});

test('the first playback click reaches the original player without rewriting the document', async () => {
    const result = await runBootstrap({ action: 'play' });
    assert.deepEqual(result.fetch, []);
    assert.equal(result.prevented, 0);
    assert.deepEqual(result.writes, []);
    assert.equal(result.document.querySelector('article').textContent, 'ArticleFull article text');
    assert.equal(result.document.querySelector('link[rel=canonical]').getAttribute('href'), 'https://example.com/posts/1/');
    assert.equal(JSON.parse(result.document.querySelector('script[type="application/ld+json"]').textContent)['@type'], 'BlogPosting');
});

test('synthetic clicks and embedded article documents cannot replace the document', async () => {
    for (const options of [{ action: 'synthetic' }, { action: 'play', framed: true }]) {
        const result = await runBootstrap(options);
        assert.equal(result.fetch.length, 0);
        assert.equal(result.writes.length, 0);
    }
});

test('playback does not depend on fetching a shell document', async () => {
    for (const options of [{ ok: false }, { response: ARTICLE }]) {
        const result = await runBootstrap({ action: 'play', ...options });
        assert.equal(result.writes.length, 0);
        assert.equal(result.fetch.length, 0);
        assert.equal(result.warnings.length, 0);
        assert.ok(result.document.querySelector('article'));
    }
});
