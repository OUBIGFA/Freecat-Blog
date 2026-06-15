const path = require('path');
const { spawnSync } = require('child_process');

function isLocalArticleSnapshotRefreshEnabled(env = process.env) {
    return env.GITHUB_ACTIONS !== 'true'
        && env.CI !== 'true'
        && !env.CF_PAGES
        && !env.VERCEL
        && !env.NETLIFY;
}

function shouldRefreshLocalArticleSnapshots(err, missingSnapshotCode, env = process.env) {
    return !!err
        && err.code === missingSnapshotCode
        && isLocalArticleSnapshotRefreshEnabled(env);
}

function hasSnapshotValue(store, file) {
    return !!(store && typeof store.get === 'function' && store.get(file));
}

function missingArticleSnapshotFiles(files, snapshots = {}) {
    const gitDates = snapshots.gitDates;
    const postIds = snapshots.postIds;

    return (files || []).filter(file => !hasSnapshotValue(gitDates, file) || !hasSnapshotValue(postIds, file));
}

function shouldRefreshIncompleteArticleSnapshots(files, snapshots, env = process.env) {
    return missingArticleSnapshotFiles(files, snapshots).length > 0
        && isLocalArticleSnapshotRefreshEnabled(env);
}

function refreshLocalArticleSnapshots(options = {}) {
    const rootDir = options.rootDir || path.join(__dirname, '..');
    const nodePath = options.nodePath || process.execPath;
    const spawn = options.spawn || spawnSync;
    const logger = options.logger || console;
    const env = options.env || process.env;
    const scriptPath = path.join(rootDir, 'extract-git-dates.js');

    logger.log('Updating article snapshots for local build...');
    const result = spawn(nodePath, [scriptPath], {
        cwd: rootDir,
        stdio: 'inherit',
        env
    });

    if (result.error) throw result.error;
    if (result.status !== 0) {
        throw new Error(`Could not update article snapshots before local build. extract-git-dates exited with ${result.status}.`);
    }
}

module.exports = {
    isLocalArticleSnapshotRefreshEnabled,
    missingArticleSnapshotFiles,
    refreshLocalArticleSnapshots,
    shouldRefreshIncompleteArticleSnapshots,
    shouldRefreshLocalArticleSnapshots
};
