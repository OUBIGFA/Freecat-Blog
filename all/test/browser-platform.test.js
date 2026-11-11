const test = require('node:test');
const assert = require('node:assert/strict');

const platformModule = require('../src/assets/browser-platform.js');

function createMemoryStorage() {
    const store = new Map();
    return {
        getItem(key) {
            return store.has(key) ? store.get(key) : null;
        },
        setItem(key, value) {
            store.set(key, String(value));
        },
        removeItem(key) {
            store.delete(key);
        }
    };
}

test('denied storage getters do not prevent browser features from initializing', async () => {
    const runtimeRoot = {
        get localStorage() { throw new Error('Storage access denied'); },
        get sessionStorage() { throw new Error('Storage access denied'); },
        fetch: async () => new Response('available'),
        matchMedia: () => ({ matches: true })
    };
    const platform = platformModule.createPlatform(runtimeRoot);
    for (const storage of [platform.localStorage, platform.sessionStorage]) {
        assert.equal(storage.getItem('theme'), null);
        assert.doesNotThrow(() => storage.setItem('theme', 'dark'));
        assert.doesNotThrow(() => storage.removeItem('theme'));
        assert.deepEqual(storage.readJson('state', {}), {});
    }
    assert.equal(await (await platform.fetch('/search-index.json')).text(), 'available');
    assert.equal(platform.mediaQuery('(prefers-color-scheme: dark)'), true);
});

test('browser platform can be built from replaceable storage, fetch, and media query seams', async () => {
    const localStorage = createMemoryStorage();
    const sessionStorage = createMemoryStorage();
    const seen = [];
    const platform = platformModule.createPlatform({
        localStorage,
        sessionStorage,
        fetch(url, options) {
            seen.push({ url, options });
            return Promise.resolve({ ok: true, text: () => Promise.resolve('ok') });
        },
        matchMedia(query) {
            return { matches: query === '(prefers-reduced-motion: reduce)' };
        }
    });

    platform.localStorage.setItem('theme', 'dark');
    platform.sessionStorage.writeJson('state', { page: 2 });
    const response = await platform.fetch('/page/2/', { credentials: 'same-origin' });

    assert.equal(platform.localStorage.getItem('theme'), 'dark');
    assert.deepEqual(platform.sessionStorage.readJson('state', {}), { page: 2 });
    assert.equal(platform.mediaQuery('(prefers-reduced-motion: reduce)'), true);
    assert.equal(await response.text(), 'ok');
    assert.deepEqual(seen, [{ url: '/page/2/', options: { credentials: 'same-origin' } }]);
});
