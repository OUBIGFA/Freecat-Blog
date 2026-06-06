const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { loadConfig } = require('../build/config.js');

test('site config accepts unquoted markdown audio values', () => {
    const config = loadConfig(
        path.join(__dirname, 'fixtures', 'config-loose'),
        'site',
        'site_网站属性.md',
        { nav_audio: '', nav_audio_autoplay: true }
    );

    assert.equal(
        config.nav_audio,
        '![🎵纸飞机](https://lz.qaiu.top/parser?url=https://share.feijipan.com/s/D1bleFCJ)'
    );
    assert.equal(config.nav_audio_autoplay, false);
});
