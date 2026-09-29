const test = require('node:test');
const assert = require('node:assert/strict');
const { initStandaloneHistory } = require('../src/assets/shell-router.js');

test('standalone back navigation restores content after soft pagination or sorting, but not hash changes', () => {
    let popstate, sync, reloads = 0;
    const location = { pathname: '/', search: '', hash: '', reload() { reloads++; } };
    initStandaloneHistory({
        window: { location, addEventListener(name, listener) { if (name === 'popstate') popstate = listener; } },
        runtime: { setSyncFrameHistory(listener) { sync = listener; } }
    });
    location.hash = '#articles';
    popstate();
    assert.equal(reloads, 0);
    location.pathname = '/page/2/';
    sync();
    location.pathname = '/';
    popstate();
    assert.equal(reloads, 1, 'the first page must replace the second page content');
    location.search = '?updateSort=modified';
    sync();
    location.search = '';
    popstate();
    assert.equal(reloads, 2, 'back restores the original sorting');
});
