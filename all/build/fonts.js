const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const SYSTEM_PYTHON = process.env.PYTHON || 'python';
const CACHE_VERSION = 2;
const TEXT_INPUT_EXTENSIONS = new Set(['.html', '.js', '.md', '.markdown', '.mdown', '.mkd', '.mkdn', '.txt', '.text']);

const NOTO_FONT_WEIGHTS = [
    ['regular', 'freecat-noto-sans-sc-regular.woff2'],
    ['medium', 'freecat-noto-sans-sc-medium.ttf'],
    ['semi-bold', 'freecat-noto-sans-sc-semi-bold.ttf'],
    ['extra-bold', 'freecat-noto-sans-sc-extra-bold.ttf']
];
const FIGTREE_FONT_WEIGHTS = [
    ['regular', 'freecat-figtree-regular.ttf'],
    ['semi-bold', 'freecat-figtree-semi-bold.ttf'],
    ['extra-bold', 'freecat-figtree-extra-bold.ttf']
];
const FONT_FAMILIES = [
    {
        key: 'figtree',
        prefix: 'freecat-figtree',
        weights: FIGTREE_FONT_WEIGHTS
    },
    {
        key: 'uiNotoSansSc',
        prefix: 'freecat-ui-noto-sans-sc',
        weights: NOTO_FONT_WEIGHTS
    },
    {
        key: 'articleNotoSansSc',
        prefix: 'freecat-noto-sans-sc',
        weights: NOTO_FONT_WEIGHTS
    }
];

function isTextInputFile(filePath) {
    return TEXT_INPUT_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function walkFiles(root, filter) {
    if (!fs.existsSync(root)) return [];

    const files = [];
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        const entryPath = path.join(root, entry.name);
        if (entry.isDirectory()) {
            files.push(...walkFiles(entryPath, filter));
        } else if (entry.isFile() && (!filter || filter(entryPath))) {
            files.push(entryPath);
        }
    }
    return files;
}

function fontSubsetManifestFile(rootDir) {
    return path.join(rootDir, 'build', 'font-subsets-manifest.json');
}

// Cloudflare Pages 的构建缓存只保留包管理器自身的缓存与特定框架的产物目录，
// 无法持久化自定义目录；该缓存仅对会保留 node_modules 的平台（如 Vercel）和本地构建生效。
function fontSubsetCacheDir(rootDir) {
    return path.join(rootDir, 'node_modules', '.cache', 'freecat-font-subsets');
}

function cachedFontSubsetManifestFile(rootDir) {
    return path.join(fontSubsetCacheDir(rootDir), 'font-subsets-manifest.json');
}

function cachedFontSubsetFile(rootDir, familyPrefix, weightName) {
    return path.join(fontSubsetCacheDir(rootDir), 'fonts', `${familyPrefix}-${weightName}-subset.woff2`);
}

function copyFileIfExists(source, target) {
    if (!fs.existsSync(source)) return false;
    try {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(source, target);
        return true;
    } catch {
        return false;
    }
}

function restoreCachedFontSubsets(rootDir) {
    const manifestRestored = copyFileIfExists(cachedFontSubsetManifestFile(rootDir), fontSubsetManifestFile(rootDir));
    let fontsRestored = 0;

    for (const family of FONT_FAMILIES) {
        for (const [name] of family.weights) {
            const outputFile = path.join(rootDir, 'src', 'assets', 'fonts', `${family.prefix}-${name}-subset.woff2`);
            if (copyFileIfExists(cachedFontSubsetFile(rootDir, family.prefix, name), outputFile)) {
                fontsRestored++;
            }
        }
    }

    if (manifestRestored || fontsRestored > 0) {
        console.log(`   Restored cached font subsets: ${fontsRestored} file(s).`);
    }
}

function saveCachedFontSubsets(rootDir) {
    const manifestSaved = copyFileIfExists(fontSubsetManifestFile(rootDir), cachedFontSubsetManifestFile(rootDir));
    let fontsSaved = 0;

    for (const family of FONT_FAMILIES) {
        for (const [name] of family.weights) {
            const outputFile = path.join(rootDir, 'src', 'assets', 'fonts', `${family.prefix}-${name}-subset.woff2`);
            if (copyFileIfExists(outputFile, cachedFontSubsetFile(rootDir, family.prefix, name))) {
                fontsSaved++;
            }
        }
    }

    if (manifestSaved || fontsSaved > 0) {
        console.log(`   Saved cached font subsets: ${fontsSaved} file(s).`);
    }
}

function decodeBasicHtmlEntities(text) {
    const named = {
        amp: '&',
        lt: '<',
        gt: '>',
        quot: '"',
        apos: "'",
        nbsp: ' '
    };

    return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
        const normalized = entity.toLowerCase();
        if (normalized.startsWith('#x')) return String.fromCodePoint(Number.parseInt(normalized.slice(2), 16));
        if (normalized.startsWith('#')) return String.fromCodePoint(Number.parseInt(normalized.slice(1), 10));
        return Object.hasOwn(named, normalized) ? named[normalized] : match;
    });
}

function stripHtmlToVisibleText(text) {
    return decodeBasicHtmlEntities(
        text
            .replace(/<!--[\s\S]*?-->/g, ' ')
            .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
    );
}

function readTextForFont(filePath, { visualHtml = false } = {}) {
    const text = fs.readFileSync(filePath, 'utf-8');
    if (visualHtml && path.extname(filePath).toLowerCase() === '.html') return stripHtmlToVisibleText(text);
    return text;
}

function collectCodepoints(files, { includeAscii = false, visualHtml = false } = {}) {
    const codepoints = new Set();
    for (const file of files) {
        const text = readTextForFont(file, { visualHtml });
        for (const char of text) {
            const codepoint = char.codePointAt(0);
            if ((includeAscii && codepoint >= 0x20) || (!includeAscii && codepoint > 0x7F)) {
                codepoints.add(codepoint);
            }
        }
    }
    return codepoints;
}

function codepointsToSortedArray(codepoints) {
    return [...codepoints].sort((a, b) => a - b);
}

function codepointArrayIncludesAll(available, requested) {
    const availableSet = new Set(available || []);
    return requested.every(codepoint => availableSet.has(codepoint));
}

function iterUiHtmlFiles(rootDir) {
    const distDir = path.join(rootDir, 'dist');
    return walkFiles(distDir, file => {
        if (path.extname(file).toLowerCase() !== '.html') return false;
        return !path.relative(distDir, file).replace(/\\/g, '/').startsWith('posts/');
    });
}

function iterPostPages(rootDir) {
    const postsDir = path.join(rootDir, 'dist', 'posts');
    return walkFiles(postsDir, file => {
        if (path.extname(file).toLowerCase() !== '.html') return false;
        const relative = path.relative(postsDir, file).replace(/\\/g, '/');
        return /^[^/]+\/index\.html$/.test(relative);
    });
}

function figtreeTextSources(rootDir) {
    const repoRoot = path.resolve(rootDir, '..');
    return [
        path.join(repoRoot, 'writing'),
        path.join(repoRoot, 'Control'),
        path.join(rootDir, 'src'),
        path.join(rootDir, 'build'),
        path.join(rootDir, 'dist')
    ];
}

function requestedCodepointsByFamily(rootDir) {
    return {
        'freecat-figtree': collectCodepoints(
            figtreeTextSources(rootDir).flatMap(source => walkFiles(source, isTextInputFile)),
            { includeAscii: true, visualHtml: false }
        ),
        'freecat-ui-noto-sans-sc': collectCodepoints(iterUiHtmlFiles(rootDir), { includeAscii: false, visualHtml: true }),
        'freecat-noto-sans-sc': collectCodepoints(iterPostPages(rootDir), { includeAscii: false, visualHtml: true })
    };
}

function sha256File(filePath) {
    const hash = crypto.createHash('sha256');
    hash.update(fs.readFileSync(filePath));
    return hash.digest('hex');
}

function readFontSubsetManifest(rootDir) {
    const manifestFile = fontSubsetManifestFile(rootDir);
    if (!fs.existsSync(manifestFile)) return null;

    try {
        return JSON.parse(fs.readFileSync(manifestFile, 'utf-8'));
    } catch {
        return null;
    }
}

function subsetEntryCoversRequest(entry, requested) {
    return codepointArrayIncludesAll([...(entry.supported || []), ...(entry.unsupported || [])], requested);
}

function fontSubsetRefreshPlan(rootDir) {
    const manifest = readFontSubsetManifest(rootDir);
    const requestedByFamily = requestedCodepointsByFamily(rootDir);
    const stale = [];
    const targets = [];

    function markStale(family, weightName, reason) {
        stale.push(weightName ? `${family.prefix} ${weightName}: ${reason}` : `${family.prefix}: ${reason}`);
        if (weightName) targets.push(`${family.prefix}:${weightName}`);
    }

    if (!manifest || manifest.version !== CACHE_VERSION) {
        return {
            reusable: false,
            stale: ['missing manifest'],
            targets: FONT_FAMILIES.flatMap(family => family.weights.map(([name]) => `${family.prefix}:${name}`))
        };
    }

    for (const family of FONT_FAMILIES) {
        const familyManifest = manifest.families && manifest.families[family.prefix];
        const requested = codepointsToSortedArray(requestedByFamily[family.prefix] || new Set());
        if (!familyManifest || !familyManifest.subsets) {
            stale.push(`${family.prefix}: missing family manifest`);
            targets.push(...family.weights.map(([name]) => `${family.prefix}:${name}`));
            continue;
        }

        for (const [name, sourceName] of family.weights) {
            const outputFile = path.join(rootDir, 'src', 'assets', 'fonts', `${family.prefix}-${name}-subset.woff2`);
            const sourceFile = path.join(rootDir, 'fonts', sourceName);
            const entry = familyManifest.subsets[name];
            if (!entry) {
                markStale(family, name, 'missing manifest entry');
                continue;
            }
            if (!fs.existsSync(outputFile)) {
                markStale(family, name, 'missing output');
                continue;
            }
            if (!fs.existsSync(sourceFile)) {
                markStale(family, name, 'missing source');
                continue;
            }
            if (entry.sourceSha256 !== sha256File(sourceFile)) {
                markStale(family, name, 'source changed');
                continue;
            }
            if (!subsetEntryCoversRequest(entry, requested)) {
                markStale(family, name, 'new characters');
            }
        }
    }

    return { reusable: stale.length === 0, stale, targets };
}

function runPythonExecutable(executable, rootDir, args) {
    return spawnSync(executable, args, {
        cwd: rootDir,
        encoding: 'utf-8',
        stdio: 'pipe',
        env: {
            ...process.env,
            PYTHONIOENCODING: 'utf-8'
        }
    });
}

function runSystemPython(rootDir, args) {
    return runPythonExecutable(SYSTEM_PYTHON, rootDir, args);
}

function commandOutput(result) {
    return [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
}

function isMissingFontTools(result) {
    return /No module named ['"]fontTools['"]/.test(commandOutput(result));
}

function fontToolsVenvDir(rootDir) {
    return path.join(rootDir, 'node_modules', '.cache', 'freecat-fonttools-venv');
}

function fontToolsPython(rootDir) {
    const venvDir = fontToolsVenvDir(rootDir);
    return process.platform === 'win32'
        ? path.join(venvDir, 'Scripts', 'python.exe')
        : path.join(venvDir, 'bin', 'python');
}

function installFontTools(rootDir) {
    const venvDir = fontToolsVenvDir(rootDir);
    const cacheDir = path.dirname(venvDir);
    const venvPython = fontToolsPython(rootDir);

    fs.mkdirSync(cacheDir, { recursive: true });
    if (!fs.existsSync(venvPython)) {
        const createResult = runSystemPython(rootDir, ['-m', 'venv', venvDir]);
        if (createResult.status !== 0) return createResult;
    }

    return runPythonExecutable(venvPython, rootDir, [
        '-m',
        'pip',
        'install',
        '--disable-pip-version-check',
        '--no-input',
        'fonttools',
        'brotli'
    ]);
}

function expectedFontSubsets(rootDir) {
    return FONT_FAMILIES.flatMap(family => family.weights.map(([weight]) => (
        path.join(rootDir, 'src', 'assets', 'fonts', `${family.prefix}-${weight}-subset.woff2`)
    )));
}

function missingFontSubsets(rootDir) {
    return expectedFontSubsets(rootDir).filter(file => !fs.existsSync(file));
}

function validateExistingFontSubsets(rootDir) {
    const missing = missingFontSubsets(rootDir);
    if (missing.length === 0) return;

    throw new Error(
        'Missing generated font subset files. ' +
        'Run npm run fonts:subset to refresh them:\n' +
        missing.map(file => `- ${path.relative(rootDir, file)}`).join('\n')
    );
}

function useExistingSubsetIfAvailable(rootDir, output) {
    if (missingFontSubsets(rootDir).length > 0) return false;

    console.warn('Could not refresh the generated font subsets. Using the existing generated subsets instead.');
    if (output) console.warn(output);
    return true;
}

function formatFontSubsetRefreshReasons(stale) {
    return `${stale.slice(0, 3).join('; ')}${stale.length > 3 ? '; ...' : ''}`;
}

function buildArticleFontSubset({ rootDir, refresh = false }) {
    if (!refresh) {
        validateExistingFontSubsets(rootDir);
        console.log('   Generated font subsets are present; skipping refresh.');
        return;
    }

    restoreCachedFontSubsets(rootDir);

    const refreshPlan = fontSubsetRefreshPlan(rootDir);
    if (refreshPlan.reusable) {
        console.log('   Font subset manifest covers the current text; skipping refresh.');
        saveCachedFontSubsets(rootDir);
        return;
    }
    if (refreshPlan.targets && refreshPlan.targets.length > 0) {
        console.log(`   Refreshing ${refreshPlan.targets.length} stale font subset(s).`);
        console.log(`   Font subset refresh reason(s): ${formatFontSubsetRefreshReasons(refreshPlan.stale)}`);
    }

    const scriptPath = path.join(rootDir, 'tools', 'generate-noto-subset.py');
    const scriptArgs = [
        scriptPath,
        ...(refreshPlan.targets || []).flatMap(target => ['--target', target])
    ];
    const venvPython = fontToolsPython(rootDir);
    let activePython = fs.existsSync(venvPython) ? venvPython : SYSTEM_PYTHON;
    let result = runPythonExecutable(activePython, rootDir, scriptArgs);

    if (result.status === 0) {
        process.stdout.write(result.stdout);
        if (result.stderr) process.stderr.write(result.stderr);
        saveCachedFontSubsets(rootDir);
        return;
    }

    if (isMissingFontTools(result)) {
        console.log('   Python fontTools is missing; installing it into the local build environment...');
        const installResult = installFontTools(rootDir);
        if (installResult.status === 0) {
            activePython = fontToolsPython(rootDir);
            result = runPythonExecutable(activePython, rootDir, scriptArgs);
            if (result.status === 0) {
                process.stdout.write(result.stdout);
                if (result.stderr) process.stderr.write(result.stderr);
                saveCachedFontSubsets(rootDir);
                return;
            }
        } else if (useExistingSubsetIfAvailable(rootDir, commandOutput(installResult))) {
            return;
        }
    }

    const output = commandOutput(result);
    if (useExistingSubsetIfAvailable(rootDir, output)) return;

    throw new Error(
        'Could not generate the article Chinese font subset. ' +
        'Install Python fontTools and brotli, then run npm run fonts:subset.\n' +
        output
    );
}

if (require.main === module) {
    buildArticleFontSubset({ rootDir: path.resolve(__dirname, '..'), refresh: true });
}

module.exports = {
    buildArticleFontSubset,
    expectedFontSubsets,
    validateExistingFontSubsets,
    fontSubsetRefreshPlan,
    fontSubsetCacheDir,
    fontToolsVenvDir
};
