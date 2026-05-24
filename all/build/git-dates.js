const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MISSING_GIT_DATE_CODE = 'MISSING_GIT_DATE';

class MissingGitDateError extends Error {
    constructor(filename) {
        super(
            `Missing Git modified date for "${filename}". ` +
            'Wait for the GitHub Actions git-dates update to finish, or run "cd all && npm run extract-dates" and commit all/git-dates.json.'
        );
        this.name = 'MissingGitDateError';
        this.code = MISSING_GIT_DATE_CODE;
        this.filename = filename;
    }
}

function normalizePath(filePath) {
    return String(filePath || '').replace(/\\/g, '/');
}

function normalizeDateMap(raw) {
    const map = {};
    if (!raw || typeof raw !== 'object') return map;

    for (const [key, value] of Object.entries(raw)) {
        if (!value) continue;
        map[path.posix.basename(normalizePath(key))] = String(value);
    }

    return map;
}

function listPostFiles(postsDir) {
    const articleExtensions = new Set(['.md', '.markdown', '.txt']);
    return fs.readdirSync(postsDir).filter(file => articleExtensions.has(path.extname(file).toLowerCase()));
}

function readSnapshot(snapshotPath, section) {
    if (!fs.existsSync(snapshotPath)) return null;
    const raw = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
    if (section && raw && typeof raw === 'object' && raw[section] && typeof raw[section] === 'object') {
        return normalizeDateMap(raw[section]);
    }
    if (section) return {};
    return normalizeDateMap(raw);
}

function makeDateStore(cache, source) {
    return {
        raw: cache,
        source,
        get(filename) {
            return cache[filename] || cache[path.basename(filename)] || null;
        },
        assertHas(filename) {
            const value = this.get(filename);
            if (!value) {
                throw new MissingGitDateError(filename);
            }
            return value;
        }
    };
}

function loadSnapshot({ snapshotPath, required = true, label = 'Git modified date', section = '' }) {
    const cache = readSnapshot(snapshotPath, section);

    if (!cache) {
        if (!required) return makeDateStore({}, 'none');
        throw new Error(
            `Missing ${path.basename(snapshotPath)}. ` +
            'This project now requires all/git-dates.json for production builds. ' +
            'Wait for the GitHub Actions git-dates update to finish, or run "cd all && npm run extract-dates" and commit the generated file.'
        );
    }

    console.log(`Loaded ${label} snapshot for ${Object.keys(cache).length} article files.`);
    return makeDateStore(cache, 'snapshot');
}

function extractFromGit(repoRoot, targetDir) {
    const map = {};
    const normalizedTarget = normalizePath(targetDir);
    const cmd = `git -c core.quotepath=false log --no-renames --name-only --pretty=format:"@@COMMIT@@%cI" -- "${normalizedTarget}"`;

    const output = execSync(cmd, {
        cwd: repoRoot,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        maxBuffer: 32 * 1024 * 1024
    });

    const blocks = output.split('@@COMMIT@@').filter(Boolean);
    for (const block of blocks) {
        const lines = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        if (lines.length === 0) continue;

        const timestamp = lines[0];
        for (let i = 1; i < lines.length; i++) {
            const filename = path.posix.basename(normalizePath(lines[i]));
            if (filename && !map[filename]) map[filename] = timestamp;
        }
    }

    return map;
}

function extractFirstFromGit(repoRoot, targetDir) {
    const map = {};
    const normalizedTarget = normalizePath(targetDir);
    const cmd = `git -c core.quotepath=false log --reverse --no-renames --name-only --pretty=format:"@@COMMIT@@%cI" -- "${normalizedTarget}"`;

    const output = execSync(cmd, {
        cwd: repoRoot,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        maxBuffer: 32 * 1024 * 1024
    });

    const blocks = output.split('@@COMMIT@@').filter(Boolean);
    for (const block of blocks) {
        const lines = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        if (lines.length === 0) continue;

        const timestamp = lines[0];
        for (let i = 1; i < lines.length; i++) {
            const filename = path.posix.basename(normalizePath(lines[i]));
            if (filename && !map[filename]) map[filename] = timestamp;
        }
    }

    return map;
}

function fileModifiedAt(filePath) {
    return fs.statSync(filePath).mtime.toISOString();
}

function collectFromGit({ repoRoot, postsDir, fallbackMissingToFileStat = false }) {
    const postsDirRelToRepo = normalizePath(path.relative(repoRoot, postsDir));
    const postFiles = listPostFiles(postsDir);
    const postFileSet = new Set(postFiles);
    let gitMap = {};
    try {
        gitMap = extractFromGit(repoRoot, postsDirRelToRepo);
    } catch (err) {
        if (!fallbackMissingToFileStat) throw err;
    }
    const cache = {};

    for (const [filename, timestamp] of Object.entries(gitMap)) {
        if (postFileSet.has(filename)) cache[filename] = timestamp;
    }

    const missing = postFiles.filter(file => !cache[file]);
    if (missing.length > 0) {
        if (fallbackMissingToFileStat) {
            for (const file of missing) {
                cache[file] = fileModifiedAt(path.join(postsDir, file));
            }
            return makeDateStore(cache, 'git+filesystem');
        }

        throw new Error(
            `Could not extract Git dates for ${missing.length} article file(s): ${missing.slice(0, 5).join(', ')}` +
            (missing.length > 5 ? ', ...' : '')
        );
    }

    return makeDateStore(cache, 'git');
}

function collectPublishDates({ repoRoot, postsDir, existing = {} }) {
    const postFiles = listPostFiles(postsDir);
    const normalizedExisting = normalizeDateMap(existing);
    const postsDirRelToRepo = repoRoot ? normalizePath(path.relative(repoRoot, postsDir)) : '';
    const firstGitDates = repoRoot ? extractFirstFromGit(repoRoot, postsDirRelToRepo) : {};
    const cache = {};

    for (const file of postFiles) {
        const existingDate = normalizedExisting[file];
        if (existingDate) {
            cache[file] = existingDate;
            continue;
        }

        const fileCreatedAt = fs.statSync(path.join(postsDir, file)).birthtime.toISOString();
        cache[file] = process.env.GITHUB_ACTIONS === 'true'
            ? (firstGitDates[file] || fileCreatedAt)
            : fileCreatedAt;
    }

    return makeDateStore(cache, 'filesystem');
}

module.exports = {
    collectPublishDates,
    collectFromGit,
    extractFirstFromGit,
    extractFromGit,
    loadSnapshot,
    MissingGitDateError,
    MISSING_GIT_DATE_CODE,
    normalizeDateMap
};
