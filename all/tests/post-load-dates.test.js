const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');

const { loadPosts } = require('../build/pages/post');
const { collectFromGit, loadSnapshot, MISSING_GIT_DATE_CODE } = require('../build/git-dates');

function makeDateStore(values) {
    return {
        get(filename) {
            return values[filename] || null;
        },
        assertHas(filename) {
            const value = this.get(filename);
            if (!value) throw new Error(`Missing date for ${filename}`);
            return value;
        }
    };
}

test('posts without frontmatter use the stored publish date snapshot', () => {
    const postsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'freecat-posts-'));
    fs.writeFileSync(path.join(postsDir, 'plain.md'), '# Plain\n\nBody', 'utf-8');

    const posts = loadPosts({
        postsDir,
        gitDates: makeDateStore({ 'plain.md': '2026-05-20T10:00:00+08:00' }),
        postDates: makeDateStore({ 'plain.md': '2024-01-02T03:04:05+08:00' })
    });

    assert.equal(posts.length, 1);
    assert.equal(posts[0].date.toISOString(), '2024-01-01T19:04:05.000Z');
    assert.equal(posts[0].modifiedDate.toISOString(), '2026-05-20T02:00:00.000Z');
});

test('frontmatter date overrides the stored publish date snapshot', () => {
    const postsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'freecat-posts-'));
    fs.writeFileSync(path.join(postsDir, 'dated.md'), [
        '---',
        'title: Dated',
        'date: 2025-03-04',
        '---',
        '',
        'Body'
    ].join('\n'), 'utf-8');

    const posts = loadPosts({
        postsDir,
        gitDates: makeDateStore({ 'dated.md': '2026-05-20T10:00:00+08:00' }),
        postDates: makeDateStore({ 'dated.md': '2024-01-02T03:04:05+08:00' })
    });

    assert.equal(posts.length, 1);
    assert.equal(posts[0].date.format('YYYY-MM-DD'), '2025-03-04');
});

test('legacy snapshots fall back to git dates instead of file checkout times', () => {
    const postsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'freecat-posts-'));
    fs.writeFileSync(path.join(postsDir, 'legacy.md'), '# Legacy\n\nBody', 'utf-8');

    const posts = loadPosts({
        postsDir,
        gitDates: makeDateStore({ 'legacy.md': '2023-07-08T09:10:11+08:00' }),
        postDates: makeDateStore({})
    });

    assert.equal(posts.length, 1);
    assert.equal(posts[0].date.toISOString(), '2023-07-08T01:10:11.000Z');
});

test('missing git modified date is a skippable build condition', () => {
    const postsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'freecat-posts-'));
    const snapshotPath = path.join(postsDir, 'git-dates.json');

    fs.writeFileSync(path.join(postsDir, 'missing.md'), '# Missing\n\nBody', 'utf-8');
    fs.writeFileSync(snapshotPath, JSON.stringify({ modified: {}, published: {} }), 'utf-8');

    const gitDates = loadSnapshot({ snapshotPath, section: 'modified' });
    const postDates = loadSnapshot({ snapshotPath, required: false, section: 'published' });

    assert.throws(
        () => loadPosts({ postsDir, gitDates, postDates }),
        err => err && err.code === MISSING_GIT_DATE_CODE && err.filename === 'missing.md'
    );
});

test('posts missing git dates can be skipped during deploy builds', () => {
    const postsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'freecat-posts-'));
    const snapshotPath = path.join(postsDir, 'git-dates.json');

    fs.writeFileSync(path.join(postsDir, 'ready.md'), '# Ready\n\nBody', 'utf-8');
    fs.writeFileSync(path.join(postsDir, 'new.md'), '# New\n\nBody', 'utf-8');
    fs.writeFileSync(snapshotPath, JSON.stringify({
        modified: { 'ready.md': '2026-05-20T10:00:00+08:00' },
        published: { 'ready.md': '2026-05-20T10:00:00+08:00' }
    }), 'utf-8');

    const gitDates = loadSnapshot({ snapshotPath, section: 'modified' });
    const postDates = loadSnapshot({ snapshotPath, required: false, section: 'published' });
    const posts = loadPosts({ postsDir, gitDates, postDates, skipMissingGitDates: true });

    assert.equal(posts.length, 1);
    assert.equal(posts[0].slug, 'ready');
});

test('date extraction can fall back to file modified time for articles without git history', () => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'freecat-repo-'));
    const postsDir = path.join(repoRoot, 'writing');
    fs.mkdirSync(postsDir);

    fs.writeFileSync(path.join(postsDir, 'new.md'), '# New\n\nBody', 'utf-8');

    const dates = collectFromGit({ repoRoot, postsDir, fallbackMissingToFileStat: true });
    const value = dates.get('new.md');

    assert.match(value, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(Number.isNaN(Date.parse(value)), false);
});
