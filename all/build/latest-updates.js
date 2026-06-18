const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { stripMarkdown } = require('./markdown.js');
const { isContentFile } = require('./content-files.js');

const WORD_UNDERSCORE_TOKEN = 'FREECATWORDUNDERSCORETOKEN';

function normalizePath(filePath) {
    return String(filePath || '').replace(/\\/g, '/');
}

function frontmatterEndLine(raw) {
    const lines = String(raw || '').split(/\r?\n/);
    if (!/^---\s*$/.test(lines[0] || '')) return 0;

    for (let i = 1; i < lines.length; i += 1) {
        if (/^(---|\.\.\.)\s*$/.test(lines[i] || '')) return i + 1;
    }

    return 0;
}

function parseNewLineStart(header) {
    const match = /\+(\d+)(?:,\d+)?/.exec(String(header || ''));
    return match ? Number(match[1]) : 0;
}

function isNoiseLine(line) {
    const text = String(line || '').trim();
    return !text
        || /^(```|~~~)/.test(text)
        || /^[-*_]{3,}$/.test(text)
        || /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(text);
}

function extractAddedHunks(diff, currentRaw) {
    const frontmatterEnd = frontmatterEndLine(currentRaw);
    const hunks = [];
    let current = null;
    let nextNewLine = 0;

    function flush() {
        if (current && current.some(line => !isNoiseLine(line))) {
            hunks.push(current);
        }
        current = null;
    }

    for (const line of String(diff || '').split(/\r?\n/)) {
        if (line.startsWith('@@')) {
            flush();
            current = [];
            nextNewLine = parseNewLineStart(line);
            continue;
        }

        if (!current) continue;

        if (line.startsWith('+') && !line.startsWith('+++')) {
            if (nextNewLine > frontmatterEnd) current.push(line.slice(1));
            nextNewLine += 1;
            continue;
        }

        if (line.startsWith('-') && !line.startsWith('---')) continue;
        if (line.startsWith('\\ No newline')) continue;
        nextNewLine += 1;
    }

    flush();
    return hunks;
}

function plainParagraphs(lines) {
    const text = lines.join('\n');
    return text
        .split(/\n{2,}/)
        .map(paragraph => paragraph.replace(/([A-Za-z0-9])_([A-Za-z0-9])/g, `$1${WORD_UNDERSCORE_TOKEN}$2`))
        .map(paragraph => stripMarkdown(paragraph, { preserveLineBreaks: false }))
        .map(paragraph => paragraph.replace(new RegExp(WORD_UNDERSCORE_TOKEN, 'g'), '_'))
        .map(paragraph => paragraph.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .filter(paragraph => !isNoiseLine(paragraph));
}

function limitParagraphs(paragraphs, options = {}) {
    const maxItems = Number(options.maxItems) > 0 ? Number(options.maxItems) : 0;
    const selected = paragraphs
        .map(paragraph => String(paragraph == null ? '' : paragraph).trim())
        .filter(Boolean);

    return maxItems > 0 ? selected.slice(0, maxItems) : selected;
}

function extractLatestUpdateFromDiff(diff, currentRaw, options = {}) {
    const hunks = extractAddedHunks(diff, currentRaw);
    const paragraphs = hunks.flatMap(hunk => plainParagraphs(hunk));
    return { items: limitParagraphs(paragraphs, options) };
}

function gitOutput(repoRoot, args, options = {}) {
    return execFileSync('git', args, {
        cwd: repoRoot,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', options.quiet ? 'ignore' : 'pipe'],
        maxBuffer: options.maxBuffer || 16 * 1024 * 1024
    });
}

function readCommitFile(repoRoot, commit, relativePath) {
    try {
        return gitOutput(repoRoot, ['show', `${commit}:${relativePath}`], { quiet: true });
    } catch (err) {
        return '';
    }
}

function collectWorkingTreeUpdate({ repoRoot, relativePath, currentRaw, options }) {
    let diff = '';
    try {
        diff = gitOutput(repoRoot, [
            '-c',
            'core.quotepath=false',
            'diff',
            '--unified=0',
            '--no-ext-diff',
            'HEAD',
            '--',
            relativePath
        ], { quiet: true });
    } catch (err) {
        return null;
    }

    const update = extractLatestUpdateFromDiff(diff, currentRaw, options);
    return update.items.length > 0 ? { ...update, source: 'working-tree' } : null;
}

function collectCommittedUpdate({ repoRoot, relativePath, options }) {
    let log = '';
    try {
        log = gitOutput(repoRoot, [
            '-c',
            'core.quotepath=false',
            'log',
            '--format=%H',
            '--follow',
            '--',
            relativePath
        ], { quiet: true });
    } catch (err) {
        return null;
    }

    for (const commit of log.split(/\r?\n/).map(line => line.trim()).filter(Boolean)) {
        let diff = '';
        try {
            diff = gitOutput(repoRoot, [
                '-c',
                'core.quotepath=false',
                'show',
                '--format=',
                '--unified=0',
                '--no-ext-diff',
                commit,
                '--',
                relativePath
            ], { quiet: true });
        } catch (err) {
            continue;
        }

        const currentRaw = readCommitFile(repoRoot, commit, relativePath);
        const update = extractLatestUpdateFromDiff(diff, currentRaw, options);
        if (update.items.length > 0) {
            return { ...update, source: 'commit', commit: commit.slice(0, 12) };
        }
    }

    return null;
}

function collectLatestUpdates({ repoRoot, postsDir, options = {} }) {
    const updates = {};
    const files = fs.readdirSync(postsDir).filter(isContentFile);

    for (const file of files) {
        const filePath = path.join(postsDir, file);
        const relativePath = normalizePath(path.relative(repoRoot, filePath));
        const currentRaw = fs.readFileSync(filePath, 'utf-8');
        const update = collectWorkingTreeUpdate({ repoRoot, relativePath, currentRaw, options })
            || collectCommittedUpdate({ repoRoot, relativePath, options });

        if (update && update.items.length > 0) updates[file] = update;
    }

    return updates;
}

module.exports = {
    collectLatestUpdates,
    extractAddedHunks,
    extractLatestUpdateFromDiff,
    frontmatterEndLine,
    limitParagraphs,
    plainParagraphs
};
