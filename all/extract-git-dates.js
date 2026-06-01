const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { collectFromGit, collectPublishDates, loadSnapshot } = require('./build/git-dates.js');

dayjs.extend(utc);
dayjs.extend(timezone);

console.log('Extracting article date snapshots...');

const repoRoot = path.join(__dirname, '..');
const postsDir = path.join(repoRoot, 'writing');
const datesFile = path.join(__dirname, 'git-dates.json');

function normalizePath(filePath) {
    return String(filePath || '').replace(/\\/g, '/');
}

function validatePostId(file, value) {
    const id = String(value == null ? '' : value).trim();
    if (!/^\d{16}$/.test(id)) {
        throw new Error(`Invalid post id for "${file}" in ${path.basename(datesFile)}: "${id}".`);
    }
    return id;
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

function makePostIdFactory(existingIds) {
    const used = new Set(Object.values(existingIds || {}).filter(Boolean));
    const first = dayjs().tz('Asia/Shanghai');
    let index = 0;

    return function nextPostId() {
        let id = '';
        do {
            const current = first.add(Math.floor(index / 99), 'second');
            const suffix = String((index % 99) + 1).padStart(2, '0');
            id = `${current.format('YYYYMMDDHHmmss')}${suffix}`;
            index += 1;
        } while (used.has(id));
        used.add(id);
        return id;
    };
}

function nextSequentialPostId(id) {
    const timestamp = id.slice(0, 14);
    const suffix = Number(id.slice(14));
    if (suffix < 99) {
        return `${timestamp}${String(suffix + 1).padStart(2, '0')}`;
    }

    const parsed = dayjs(
        `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}` +
        `T${timestamp.slice(8, 10)}:${timestamp.slice(10, 12)}:${timestamp.slice(12, 14)}`
    );
    return `${parsed.add(1, 'second').format('YYYYMMDDHHmmss')}01`;
}

function claimPostId(id, file, usedIds, reservedIds) {
    let candidate = id;
    while (usedIds.has(candidate) || (candidate !== id && reservedIds.has(candidate))) {
        const existingFile = usedIds.get(candidate);
        if (existingFile) {
            console.warn(`Duplicate post id "${candidate}" for "${existingFile}" and "${file}". Reassigning "${file}" to the next available id.`);
        }
        candidate = nextSequentialPostId(candidate);
    }
    usedIds.set(candidate, file);
    return candidate;
}

function collectPostIdSnapshots(files, existingIds) {
    const nextPostId = makePostIdFactory(existingIds);
    const ids = {};
    const usedIds = new Map();
    const planned = files.map(file => {
        const history = historicalBasenames(file);
        const idSource = history.find(name => existingIds[name]);
        const id = idSource ? validatePostId(idSource, existingIds[idSource]) : nextPostId();
        return { file, id };
    });
    const reservedIds = new Set(
        planned
            .filter(item => item.id)
            .map(item => item.id)
    );

    planned.forEach(({ file, id }) => {
        ids[file] = claimPostId(id, file, usedIds, reservedIds);
    });

    return ids;
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
const postIdSnapshots = collectPostIdSnapshots(Object.keys(sorted), existingPostIds);
const sortedPostIds = Object.fromEntries(
    Object.entries(postIdSnapshots).sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN'))
);

fs.writeFileSync(datesFile, `${JSON.stringify({
    modified: sorted,
    published: sortedPublishDates,
    post_ids: sortedPostIds
}, null, 2)}\n`, 'utf-8');

console.log(`Saved ${Object.keys(sorted).length} article modified dates to ${path.basename(datesFile)}.`);
console.log(`Saved ${Object.keys(sortedPublishDates).length} article publish dates to ${path.basename(datesFile)}.`);
console.log(`Saved ${Object.keys(sortedPostIds).length} article post ids to ${path.basename(datesFile)}.`);
