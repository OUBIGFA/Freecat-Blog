const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { collectFromGit, collectPublishDates, loadSnapshot } = require('./build/git-dates.js');
const { collectPostIdSnapshots } = require('./build/post-id-snapshots.js');
const { collectLatestUpdates } = require('./build/latest-updates.js');

console.log('Extracting article date snapshots...');

const repoRoot = path.join(__dirname, '..');
const postsDir = path.join(repoRoot, 'writing');
const datesFile = path.join(__dirname, 'git-dates.json');

function normalizePath(filePath) {
    return String(filePath || '').replace(/\\/g, '/');
}

function historicalBasenames(file) {
    const relativePath = normalizePath(path.relative(repoRoot, path.join(postsDir, file)));
    let output = '';
    try {
        output = execFileSync('git', [
            '-c',
            'core.quotepath=false',
            'log',
            '--follow',
            '--name-only',
            '--pretty=format:',
            '--',
            relativePath
        ], {
            cwd: repoRoot,
            encoding: 'utf-8',
            stdio: ['ignore', 'pipe', 'ignore'],
            maxBuffer: 8 * 1024 * 1024
        });
    } catch (err) {
        return [file];
    }

    const names = output
        .split(/\r?\n/)
        .map(line => path.posix.basename(normalizePath(line.trim())))
        .filter(Boolean);
    return Array.from(new Set([file, ...names]));
}

function readOnlinePostIds() {
    let output = '';
    try {
        execFileSync('git', [
            'fetch',
            '--quiet',
            'origin',
            'main'
        ], {
            cwd: repoRoot,
            stdio: ['ignore', 'ignore', 'ignore'],
            maxBuffer: 8 * 1024 * 1024,
            timeout: 10000
        });
    } catch (err) {}

    try {
        output = execFileSync('git', [
            'show',
            'origin/main:all/git-dates.json'
        ], {
            cwd: repoRoot,
            encoding: 'utf-8',
            stdio: ['ignore', 'pipe', 'ignore'],
            maxBuffer: 8 * 1024 * 1024
        });
    } catch (err) {
        return {};
    }

    try {
        const parsed = JSON.parse(output);
        return parsed && typeof parsed.post_ids === 'object' && parsed.post_ids ? parsed.post_ids : {};
    } catch (err) {
        return {};
    }
}

const dates = collectFromGit({ repoRoot, postsDir, fallbackMissingToFileStat: true });
const sorted = Object.fromEntries(
    Object.entries(dates.raw).sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN'))
);

const existingPublishDates = loadSnapshot({
    snapshotPath: datesFile,
    required: false,
    label: 'post publish date',
    section: 'published'
}).raw;
const publishDates = collectPublishDates({ repoRoot, postsDir, existing: existingPublishDates });
const sortedPublishDates = Object.fromEntries(
    Object.entries(publishDates.raw).sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN'))
);

const existingPostIds = loadSnapshot({
    snapshotPath: datesFile,
    required: false,
    label: 'post id',
    section: 'post_ids'
}).raw;
const onlinePostIds = readOnlinePostIds();
const postIdSnapshots = collectPostIdSnapshots(Object.keys(sorted), existingPostIds, {
    datesFilename: path.basename(datesFile),
    historicalBasenames,
    onlineIds: onlinePostIds
});
const sortedPostIds = Object.fromEntries(
    Object.entries(postIdSnapshots).sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN'))
);

const latestUpdates = collectLatestUpdates({ repoRoot, postsDir });
const sortedLatestUpdates = Object.fromEntries(
    Object.entries(latestUpdates).sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN'))
);

fs.writeFileSync(datesFile, `${JSON.stringify({
    modified: sorted,
    published: sortedPublishDates,
    post_ids: sortedPostIds,
    latest_updates: sortedLatestUpdates
}, null, 2)}\n`, 'utf-8');

console.log(`Saved ${Object.keys(sorted).length} article modified dates to ${path.basename(datesFile)}.`);
console.log(`Saved ${Object.keys(sortedPublishDates).length} article publish dates to ${path.basename(datesFile)}.`);
console.log(`Saved ${Object.keys(sortedPostIds).length} article post ids to ${path.basename(datesFile)}.`);
console.log(`Saved ${Object.keys(sortedLatestUpdates).length} article latest updates to ${path.basename(datesFile)}.`);
