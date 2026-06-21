const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { summarizeMarkdownUpdateText } = require('./markdown.js');
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

function isFenceLine(line) {
    return /^(```+|~~~+)/.test(String(line || '').trim());
}

function extractAddedHunks(diff, currentRaw) {
    return extractAddedHunksWithLines(diff, currentRaw).map(hunk => hunk.map(entry => entry.text));
}

function extractAddedHunksWithLines(diff, currentRaw) {
    const frontmatterEnd = frontmatterEndLine(currentRaw);
    const hunks = [];
    let current = null;
    let nextNewLine = 0;

    function flush() {
        if (current && current.some(entry => !isNoiseLine(entry.text))) {
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
            if (nextNewLine > frontmatterEnd) current.push({ lineNumber: nextNewLine, text: line.slice(1) });
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
        .map(paragraph => summarizeMarkdownUpdateText(paragraph))
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

function plainParagraphEntries(lineEntries) {
    const paragraphs = [];
    let current = [];
    let inFence = false;

    function flush() {
        const codeEntries = fencedCodeParagraphEntries(current);
        const textEntries = codeEntries.length > 0 ? nonFencedLineEntries(current) : current;
        const lines = textEntries.map(entry => entry.text);
        const text = plainParagraphs(lines)[0] || '';
        const target = textEntries.find(entry => !isNoiseLine(entry.text));
        if (text && target) {
            paragraphs.push({
                text,
                target: target.text,
                lineNumber: target.lineNumber
            });
        }
        codeEntries.forEach(entry => paragraphs.push(entry));
        current = [];
    }

    for (const entry of lineEntries) {
        if (isFenceLine(entry.text)) {
            current.push(entry);
            inFence = !inFence;
        } else if (String(entry.text || '').trim() || inFence) {
            current.push(entry);
        } else {
            flush();
        }
    }
    flush();

    return paragraphs;
}

function summarizeCodeUpdateText(lines) {
    return lines
        .map(line => String(line == null ? '' : line).trim())
        .filter(Boolean)
        .join('\n')
        .replace(/\s+/g, ' ')
        .trim();
}

function nonFencedLineEntries(lineEntries) {
    const kept = [];
    let fence = '';

    for (const entry of lineEntries) {
        const match = /^(```+|~~~+)/.exec(String(entry.text || '').trim());
        if (match) {
            const marker = match[1].slice(0, 3);
            if (!fence) fence = marker;
            else if (marker === fence) fence = '';
            continue;
        }

        if (!fence) kept.push(entry);
    }

    return kept;
}

function fencedCodeParagraphEntries(lineEntries) {
    const paragraphs = [];
    let fence = '';
    let current = [];

    function flushCodeBlock() {
        const text = summarizeCodeUpdateText(current.map(entry => entry.text));
        const target = current.find(entry => String(entry.text || '').trim());
        if (text && target) {
            paragraphs.push({
                text,
                target: target.text,
                lineNumber: target.lineNumber
            });
        }
        current = [];
    }

    for (const entry of lineEntries) {
        const text = String(entry.text || '');
        const match = /^(```+|~~~+)/.exec(text.trim());
        if (match) {
            const marker = match[1].slice(0, 3);
            if (!fence) {
                fence = marker;
                current = [];
            } else if (marker === fence) {
                flushCodeBlock();
                fence = '';
            }
            continue;
        }

        if (fence) current.push(entry);
    }

    if (fence) flushCodeBlock();
    return paragraphs;
}

function extractLatestUpdateFromDiff(diff, currentRaw, options = {}) {
    const hunks = extractAddedHunksWithLines(diff, currentRaw);
    const paragraphs = hunks.flatMap(hunk => plainParagraphEntries(hunk));
    const maxItems = Number(options.maxItems) > 0 ? Number(options.maxItems) : 0;
    const selected = maxItems > 0 ? paragraphs.slice(0, maxItems) : paragraphs;
    return {
        items: selected.map(entry => entry.text),
        targets: selected.map(entry => ({
            text: entry.target,
            line: entry.lineNumber
        }))
    };
}

function compactLatestUpdate(update) {
    if (!update || !Array.isArray(update.items) || update.items.length === 0) return update;
    if (!Array.isArray(update.targets) || update.targets.length !== update.items.length) return { items: update.items };

    return {
        items: update.items,
        targets: update.targets
    };
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
            '--ignore-space-at-eol',
            '--no-ext-diff',
            'HEAD',
            '--',
            relativePath
        ], { quiet: true });
    } catch (err) {
        return null;
    }

    const update = extractLatestUpdateFromDiff(diff, currentRaw, options);
    return update.items.length > 0 ? { ...compactLatestUpdate(update), source: 'working-tree' } : null;
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
                '--ignore-space-at-eol',
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
            return { ...compactLatestUpdate(update), source: 'commit', commit: commit.slice(0, 12) };
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
    extractAddedHunksWithLines,
    extractLatestUpdateFromDiff,
    frontmatterEndLine,
    limitParagraphs,
    plainParagraphEntries,
    plainParagraphs
};
