const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const { findConfigPath, loadConfig } = require('../build/config.js');

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

test('config lookup recognizes content files beyond lowercase .md', (t) => {
    t.mock.method(fs, 'existsSync', () => true);
    t.mock.method(fs, 'readdirSync', () => [
        'combined.name.with.embedded.md.md',
        'site_网站属性.MARKDOWN',
        'social_社交媒体.txt'
    ]);

    assert.equal(
        path.basename(findConfigPath('Control', 'combined.name.with.embedded.md')),
        'combined.name.with.embedded.md.md'
    );
    assert.equal(path.basename(findConfigPath('Control', 'site')), 'site_网站属性.MARKDOWN');
    assert.equal(path.basename(findConfigPath('Control', 'social')), 'social_社交媒体.txt');
});
