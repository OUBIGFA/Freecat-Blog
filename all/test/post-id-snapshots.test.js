const test = require('node:test');
const assert = require('node:assert/strict');
const {
    collectPostIdSnapshots
} = require('../build/post-id-snapshots.js');

const quietLogger = { warn() {} };

test('post id snapshots reuse the online id for the same article history', () => {
    const ids = collectPostIdSnapshots(['新标题.md'], {}, {
        onlineIds: {
            '旧标题.md': '2026010101010101'
        },
        historicalBasenames(file) {
            return [file, '旧标题.md'];
        },
        logger: quietLogger
    });

    assert.equal(ids['新标题.md'], '2026010101010101');
});

test('online post id ownership wins over a conflicting local snapshot', () => {
    const ids = collectPostIdSnapshots(['本地草稿.md'], {
        '本地草稿.md': '2026010101010101'
    }, {
        onlineIds: {
            '线上文章.md': '2026010101010101'
        },
        historicalBasenames(file) {
            return [file];
        },
        logger: quietLogger
    });

    assert.equal(ids['本地草稿.md'], '2026010101010102');
});

test('online snapshot wins over stale local id for the same filename', () => {
    const ids = collectPostIdSnapshots(['同名文章.md'], {
        '同名文章.md': '2026010101010101'
    }, {
        onlineIds: {
            '同名文章.md': '2026010101010199'
        },
        historicalBasenames(file) {
            return [file];
        },
        logger: quietLogger
    });

    assert.equal(ids['同名文章.md'], '2026010101010199');
});
