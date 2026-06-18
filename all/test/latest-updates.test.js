const test = require('node:test');
const assert = require('node:assert/strict');
const {
    extractLatestUpdateFromDiff,
    plainParagraphs
} = require('../build/latest-updates.js');

test('latest update extraction ignores frontmatter and keeps body changes in article order', () => {
    const currentRaw = [
        '---',
        'title: Example',
        'show_latest_update: true',
        '---',
        '',
        'Intro',
        'Earlier body update.',
        '',
        'Final body update.',
        '',
        'Final second paragraph.'
    ].join('\n');
    const diff = [
        '@@ -1,3 +1,4 @@',
        ' ---',
        ' title: Example',
        '+show_latest_update: true',
        ' ---',
        '@@ -5,0 +7,1 @@',
        '+Earlier body update.',
        '@@ -7,0 +10,3 @@',
        '+Final body update.',
        '+',
        '+Final second paragraph.'
    ].join('\n');

    assert.deepEqual(
        extractLatestUpdateFromDiff(diff, currentRaw).items,
        ['Earlier body update.', 'Final body update.', 'Final second paragraph.']
    );
});

test('latest update extraction keeps long items for native ellipsis rendering', () => {
    const longUpdate = 'Long body update '.repeat(40).trim();
    const currentRaw = [
        '---',
        'title: Example',
        '---',
        '',
        longUpdate
    ].join('\n');
    const diff = [
        '@@ -4,0 +5,1 @@',
        `+${longUpdate}`
    ].join('\n');

    assert.deepEqual(
        extractLatestUpdateFromDiff(diff, currentRaw).items,
        [longUpdate]
    );
});

test('latest update paragraphs strip markdown before snapshotting', () => {
    assert.deepEqual(
        plainParagraphs(['### 标题', '', '- **新增** [链接](https://example.com) 和 show_latest_update 字段']),
        ['标题', '新增 链接 和 show_latest_update 字段']
    );
});
