const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const {
    collectLatestUpdates,
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

    const update = extractLatestUpdateFromDiff(diff, currentRaw);
    assert.deepEqual(
        update.items,
        ['Earlier body update.', 'Final body update.', 'Final second paragraph.']
    );
    assert.deepEqual(
        update.targets.map(target => target.text),
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

test('latest update extraction keeps markdown target updates', () => {
    const currentRaw = [
        '---',
        'title: Example',
        'show_latest_update: true',
        '---',
        '',
        '![](/image/new-cover.png)',
        '',
        '![封面](/image/cover.png "Hero")',
        '',
        '![](/image/titled-target.png "Hero")',
        '',
        '[](https://example.com/empty-link)',
        '',
        '[](https://example.com/titled-empty-link "Hero")',
        '',
        '[普通链接](https://example.com)'
    ].join('\n');
    const diff = [
        '@@ -5,0 +6,9 @@',
        '+![](/image/new-cover.png)',
        '+',
        '+![封面](/image/cover.png "Hero")',
        '+',
        '+![](/image/titled-target.png "Hero")',
        '+',
        '+[](https://example.com/empty-link)',
        '+',
        '+[](https://example.com/titled-empty-link "Hero")',
        '+',
        '+[普通链接](https://example.com)'
    ].join('\n');

    const update = extractLatestUpdateFromDiff(diff, currentRaw);
    assert.deepEqual(
        update.items,
        [
            '/image/new-cover.png',
            '封面',
            '/image/titled-target.png',
            'https://example.com/empty-link',
            'https://example.com/titled-empty-link',
            '普通链接'
        ]
    );
    assert.deepEqual(
        update.targets.map(target => target.text),
        [
            '![](/image/new-cover.png)',
            '![封面](/image/cover.png "Hero")',
            '![](/image/titled-target.png "Hero")',
            '[](https://example.com/empty-link)',
            '[](https://example.com/titled-empty-link "Hero")',
            '[普通链接](https://example.com)'
        ]
    );
});

test('latest update extraction keeps markdown target updates inside formatted text', () => {
    assert.deepEqual(
        plainParagraphs(['- 文案 ![](/image/list.png)']),
        ['文案 /image/list.png']
    );
    assert.deepEqual(
        plainParagraphs(['> 文案 [](https://example.com/quote)']),
        ['文案 https://example.com/quote']
    );
    assert.deepEqual(
        plainParagraphs(['| 列 | 图 |', '| --- | --- |', '| 文案 | ![](/image/table.png) |']),
        ['/image/table.png']
    );
    assert.deepEqual(
        plainParagraphs(['| 图 |', '| --- |', '| ![标题](/image/table-title.png) |']),
        ['图 标题']
    );
});

test('latest update extraction ignores working tree whitespace-only body changes', (t) => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'freecat-latest-update-'));
    t.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));

    const postsDir = path.join(repoRoot, 'writing');
    const file = 'Example.md';
    const filePath = path.join(postsDir, file);
    fs.mkdirSync(postsDir, { recursive: true });
    fs.writeFileSync(filePath, [
        '---',
        'title: Example',
        'show_latest_update: false',
        '---',
        '',
        'Committed body update.'
    ].join('\n'), 'utf-8');

    execFileSync('git', ['init'], { cwd: repoRoot, stdio: 'ignore' });
    execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: repoRoot });
    execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: repoRoot });
    execFileSync('git', ['add', '.'], { cwd: repoRoot });
    execFileSync('git', ['commit', '-m', 'initial'], { cwd: repoRoot, stdio: 'ignore' });

    fs.writeFileSync(filePath, [
        '---',
        'title: Example',
        'show_latest_update: true',
        '---',
        '',
        'Committed body update. '
    ].join('\n'), 'utf-8');

    assert.deepEqual(
        collectLatestUpdates({ repoRoot, postsDir })[file],
        {
            items: ['Committed body update.'],
            targets: [{ text: 'Committed body update.', line: 6 }],
            source: 'commit',
            commit: execFileSync('git', ['rev-parse', '--short=12', 'HEAD'], { cwd: repoRoot, encoding: 'utf-8' }).trim()
        }
    );
});
