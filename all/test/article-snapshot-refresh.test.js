const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
    isLocalArticleSnapshotRefreshEnabled,
    missingArticleSnapshotFiles,
    refreshLocalArticleSnapshots,
    shouldRefreshIncompleteArticleSnapshots,
    shouldRefreshLocalArticleSnapshots
} = require('../build/article-snapshot-refresh.js');

function store(values) {
    return {
        get(file) {
            return values[file] || null;
        }
    };
}

test('local builds refresh article snapshots when an article date error is raised', () => {
    assert.equal(
        shouldRefreshLocalArticleSnapshots({ code: 'MISSING_GIT_DATE' }, 'MISSING_GIT_DATE', {}),
        true
    );
});

test('local builds refresh article snapshots when an article id is missing', () => {
    const files = ['Existing.md', 'New.md'];
    const snapshots = {
        gitDates: store({
            'Existing.md': '2026-05-31T10:00:00+08:00',
            'New.md': '2026-06-15T10:00:00+08:00'
        }),
        postIds: store({
            'Existing.md': '2026053115300001'
        })
    };

    assert.deepEqual(missingArticleSnapshotFiles(files, snapshots), ['New.md']);
    assert.equal(shouldRefreshIncompleteArticleSnapshots(files, snapshots, {}), true);
});

test('ci and hosted builds keep using committed article snapshots', () => {
    const files = ['New.md'];
    const snapshots = {
        gitDates: store({
            'New.md': '2026-06-15T10:00:00+08:00'
        }),
        postIds: store({})
    };

    assert.equal(isLocalArticleSnapshotRefreshEnabled({ GITHUB_ACTIONS: 'true' }), false);
    assert.equal(isLocalArticleSnapshotRefreshEnabled({ CI: 'true' }), false);
    assert.equal(isLocalArticleSnapshotRefreshEnabled({ CF_PAGES: '1' }), false);
    assert.equal(isLocalArticleSnapshotRefreshEnabled({ VERCEL: '1' }), false);
    assert.equal(isLocalArticleSnapshotRefreshEnabled({ NETLIFY: 'true' }), false);
    assert.equal(
        shouldRefreshLocalArticleSnapshots({ code: 'MISSING_GIT_DATE' }, 'MISSING_GIT_DATE', { GITHUB_ACTIONS: 'true' }),
        false
    );
    assert.equal(shouldRefreshIncompleteArticleSnapshots(files, snapshots, { GITHUB_ACTIONS: 'true' }), false);
});

test('local snapshot refresh invokes the existing extract dates script', () => {
    const calls = [];
    const rootDir = path.join('repo', 'all');

    refreshLocalArticleSnapshots({
        rootDir,
        nodePath: 'node',
        env: { NODE_ENV: 'test' },
        logger: { log() {} },
        spawn(command, args, options) {
            calls.push({ command, args, options });
            return { status: 0 };
        }
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].command, 'node');
    assert.deepEqual(calls[0].args, [path.join(rootDir, 'extract-git-dates.js')]);
    assert.equal(calls[0].options.cwd, rootDir);
    assert.equal(calls[0].options.stdio, 'inherit');
    assert.deepEqual(calls[0].options.env, { NODE_ENV: 'test' });
});

test('local snapshot refresh fails clearly when extraction fails', () => {
    assert.throws(
        () => refreshLocalArticleSnapshots({
            rootDir: path.join('repo', 'all'),
            logger: { log() {} },
            spawn() {
                return { status: 1 };
            }
        }),
        /Could not update article snapshots/
    );
});
