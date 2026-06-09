const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const SYSTEM_PYTHON = process.env.PYTHON || 'python';
const CACHE_VERSION = 1;
const TEXT_INPUT_EXTENSIONS = new Set(['.html', '.js', '.md', '.markdown', '.mdown', '.mkd', '.mkdn', '.txt', '.text']);

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

function fontSubsetCacheFile(rootDir) {
    return path.join(rootDir, 'node_modules', '.cache', 'freecat-font-subsets-cache.json');
}

function normalizeTextInputForSignature(text) {
    return text.replace(/([?&]v=)[^"'<>\s&]+/g, '$1__asset_version__');
}

function hashFile(hash, rootDir, filePath) {
    const relative = path.relative(rootDir, filePath).replace(/\\/g, '/');
    const isText = isTextInputFile(filePath);
    const content = isText
        ? Buffer.from(normalizeTextInputForSignature(fs.readFileSync(filePath, 'utf-8')), 'utf-8')
        : fs.readFileSync(filePath);
    hash.update(relative);
    hash.update('\0');
    hash.update(String(content.length));
    hash.update('\0');
    hash.update(content);
    hash.update('\0');
}

function fontSubsetInputFiles(rootDir) {
    const repoRoot = path.resolve(rootDir, '..');
    const roots = [
        path.join(repoRoot, 'writing'),
        path.join(repoRoot, 'Control'),
        path.join(rootDir, 'src'),
        path.join(rootDir, 'build'),
        path.join(rootDir, 'dist'),
        path.join(rootDir, 'tools')
    ];
    const files = roots.flatMap(source => walkFiles(source, isTextInputFile));

    files.push(...walkFiles(path.join(rootDir, 'fonts'), file => ['.woff2', '.woff', '.ttf', '.otf'].includes(path.extname(file).toLowerCase())));

    return [...new Set(files)]
        .filter(file => !path.relative(rootDir, file).replace(/\\/g, '/').startsWith('src/assets/fonts/'))
        .sort((a, b) => a.localeCompare(b));
}

function fontSubsetInputSignature(rootDir) {
    const hash = crypto.createHash('sha256');
    hash.update(`cache-version:${CACHE_VERSION}\0`);

    for (const file of fontSubsetInputFiles(rootDir)) {
        hashFile(hash, rootDir, file);
    }

    return hash.digest('hex');
}

function readFontSubsetCache(rootDir) {
    const cacheFile = fontSubsetCacheFile(rootDir);
    if (!fs.existsSync(cacheFile)) return null;

    try {
        return JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    } catch {
        return null;
    }
}

function writeFontSubsetCache(rootDir, signature) {
    const cacheFile = fontSubsetCacheFile(rootDir);
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
    fs.writeFileSync(cacheFile, `${JSON.stringify({ version: CACHE_VERSION, signature }, null, 2)}\n`, 'utf-8');
}

function canReuseFontSubsetCache(rootDir, signature) {
    const cache = readFontSubsetCache(rootDir);
    return cache && cache.version === CACHE_VERSION && cache.signature === signature && missingFontSubsets(rootDir).length === 0;
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
    const subsets = [
        ...[
            'regular',
            'medium',
            'semi-bold',
            'extra-bold'
        ].map(weight => path.join(rootDir, 'src', 'assets', 'fonts', `freecat-ui-noto-sans-sc-${weight}-subset.woff2`)),
        ...[
            'regular',
            'semi-bold',
            'extra-bold'
        ].map(weight => path.join(rootDir, 'src', 'assets', 'fonts', `freecat-figtree-${weight}-subset.woff2`))
    ];

    for (const weight of ['regular', 'medium', 'semi-bold', 'extra-bold']) {
        subsets.push(path.join(rootDir, 'src', 'assets', 'fonts', `freecat-noto-sans-sc-${weight}-subset.woff2`));
    }

    return subsets;
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

function buildArticleFontSubset({ rootDir, refresh = false }) {
    if (!refresh) {
        validateExistingFontSubsets(rootDir);
        console.log('   Generated font subsets are present; skipping refresh.');
        return;
    }

    const inputSignature = fontSubsetInputSignature(rootDir);
    if (canReuseFontSubsetCache(rootDir, inputSignature)) {
        console.log('   Font subset inputs are unchanged; skipping refresh.');
        return;
    }

    const scriptPath = path.join(rootDir, 'tools', 'generate-noto-subset.py');
    const venvPython = fontToolsPython(rootDir);
    let activePython = fs.existsSync(venvPython) ? venvPython : SYSTEM_PYTHON;
    let result = runPythonExecutable(activePython, rootDir, [scriptPath]);

    if (result.status === 0) {
        process.stdout.write(result.stdout);
        if (result.stderr) process.stderr.write(result.stderr);
        writeFontSubsetCache(rootDir, inputSignature);
        return;
    }

    if (isMissingFontTools(result)) {
        console.log('   Python fontTools is missing; installing it into the local build environment...');
        const installResult = installFontTools(rootDir);
        if (installResult.status === 0) {
            activePython = fontToolsPython(rootDir);
            result = runPythonExecutable(activePython, rootDir, [scriptPath]);
            if (result.status === 0) {
                process.stdout.write(result.stdout);
                if (result.stderr) process.stderr.write(result.stderr);
                writeFontSubsetCache(rootDir, inputSignature);
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

module.exports = { buildArticleFontSubset, expectedFontSubsets, validateExistingFontSubsets };
