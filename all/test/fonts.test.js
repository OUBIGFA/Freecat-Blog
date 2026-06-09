const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const crypto = require('node:crypto');

test('production build refreshes font subsets after pages are generated', () => {
    const buildJs = fs.readFileSync(path.join(__dirname, '..', 'build.js'), 'utf-8');

    assert.match(buildJs, /buildArticleFontSubset\(\{\s*rootDir:\s*__dirname,\s*refresh:\s*true\s*\}\);/);
    assert.doesNotMatch(buildJs, /Checking generated font subsets/);
});

test('font subset refresh checks the manifest before spawning Python', () => {
    const fontsJs = fs.readFileSync(path.join(__dirname, '..', 'build', 'fonts.js'), 'utf-8');
    const cacheCheckIndex = fontsJs.indexOf('fontSubsetRefreshPlan(rootDir)');
    const spawnIndex = fontsJs.indexOf('runPythonExecutable(activePython, rootDir, scriptArgs)');

    assert.notEqual(cacheCheckIndex, -1);
    assert.notEqual(spawnIndex, -1);
    assert.ok(cacheCheckIndex < spawnIndex);
    assert.match(fontsJs, /Font subset manifest covers the current text; skipping refresh/);
    assert.doesNotMatch(fontsJs, /fontSubsetInputSignature/);
});

test('font subset build validates existing files without refreshing by default', () => {
    const modulePath = path.join(__dirname, '../build/fonts.js');
    const rootDir = path.join(__dirname, '..');
    const originalSpawnSync = childProcess.spawnSync;
    const originalExistsSync = fs.existsSync;
    const originalLog = console.log;
    const calls = [];
    const logs = [];

    delete require.cache[require.resolve(modulePath)];
    childProcess.spawnSync = (...args) => {
        calls.push(args);
        return { status: 0, stdout: '', stderr: '' };
    };
    fs.existsSync = (file) => {
        const normalized = String(file).replace(/\\/g, '/');
        if (normalized.includes('/build/font-subsets-manifest.json')) return false;
        if (normalized.includes('/src/assets/fonts/freecat-ui-noto-sans-sc-')) return true;
        if (normalized.includes('/src/assets/fonts/freecat-noto-sans-sc-')) return true;
        if (normalized.includes('/src/assets/fonts/freecat-figtree-')) return true;
        return originalExistsSync(file);
    };
    console.log = (message) => logs.push(String(message));

    try {
        const { buildArticleFontSubset } = require(modulePath);
        assert.doesNotThrow(() => buildArticleFontSubset({ rootDir }));
        assert.equal(calls.length, 0);
        assert.equal(
            logs.some(message => message.includes('skipping refresh')),
            true
        );
    } finally {
        childProcess.spawnSync = originalSpawnSync;
        fs.existsSync = originalExistsSync;
        console.log = originalLog;
        delete require.cache[require.resolve(modulePath)];
    }
});

test('font subset build reports missing generated files in default mode', () => {
    const modulePath = path.join(__dirname, '../build/fonts.js');
    const rootDir = path.join(__dirname, '..');
    const originalExistsSync = fs.existsSync;
    const originalLog = console.log;

    delete require.cache[require.resolve(modulePath)];
    fs.existsSync = (file) => {
        const normalized = String(file).replace(/\\/g, '/');
        if (normalized.includes('/src/assets/fonts/freecat-ui-noto-sans-sc-regular-subset.woff2')) return false;
        if (normalized.includes('/src/assets/fonts/freecat-ui-noto-sans-sc-')) return true;
        if (normalized.includes('/src/assets/fonts/freecat-noto-sans-sc-')) return true;
        if (normalized.includes('/src/assets/fonts/freecat-figtree-')) return true;
        return originalExistsSync(file);
    };
    console.log = () => {};

    try {
        const { buildArticleFontSubset } = require(modulePath);
        assert.throws(
            () => buildArticleFontSubset({ rootDir }),
            /Missing generated font subset files/
        );
    } finally {
        fs.existsSync = originalExistsSync;
        console.log = originalLog;
        delete require.cache[require.resolve(modulePath)];
    }
});

test('font subset refresh falls back to the existing subset when fontTools is unavailable', () => {
    const modulePath = path.join(__dirname, '../build/fonts.js');
    const originalSpawnSync = childProcess.spawnSync;
    const originalExistsSync = fs.existsSync;
    const warnings = [];
    const originalWarn = console.warn;
    const originalLog = console.log;

    delete require.cache[require.resolve(modulePath)];
    childProcess.spawnSync = () => ({
        status: 1,
        stdout: '',
        stderr: 'ModuleNotFoundError: No module named \'fontTools\''
    });
    fs.existsSync = (file) => {
        const normalized = String(file).replace(/\\/g, '/');
        if (normalized.includes('/build/font-subsets-manifest.json')) return false;
        if (normalized.includes('/src/assets/fonts/freecat-ui-noto-sans-sc-')) return true;
        if (normalized.includes('/src/assets/fonts/freecat-noto-sans-sc-')) return true;
        if (normalized.includes('/src/assets/fonts/freecat-figtree-')) return true;
        return originalExistsSync(file);
    };
    console.warn = (message) => warnings.push(String(message));
    console.log = () => {};

    try {
        const { buildArticleFontSubset } = require(modulePath);
        assert.doesNotThrow(() => buildArticleFontSubset({ rootDir: path.join(__dirname, '..'), refresh: true }));
        assert.equal(
            warnings.some(message => message.includes('Using the existing generated subsets instead')),
            true
        );
    } finally {
        childProcess.spawnSync = originalSpawnSync;
        fs.existsSync = originalExistsSync;
        console.warn = originalWarn;
        console.log = originalLog;
        delete require.cache[require.resolve(modulePath)];
    }
});

test('font subset build installs fontTools in a local venv when system Python is managed', () => {
    const modulePath = path.join(__dirname, '../build/fonts.js');
    const rootDir = path.join(__dirname, '..');
    const originalSpawnSync = childProcess.spawnSync;
    const originalExistsSync = require('node:fs').existsSync;
    const originalMkdirSync = require('node:fs').mkdirSync;
    const originalLog = console.log;
    const calls = [];
    const logs = [];

    delete require.cache[require.resolve(modulePath)];
    require('node:fs').existsSync = (file) => {
        if (String(file).replace(/\\/g, '/').includes('/build/font-subsets-manifest.json')) return false;
        if (String(file).includes('freecat-fonttools-venv')) return false;
        return originalExistsSync(file);
    };
    require('node:fs').mkdirSync = () => {};
    childProcess.spawnSync = (command, args) => {
        calls.push({ command: String(command), args });
        if (calls.length === 1) {
            return {
                status: 1,
                stdout: '',
                stderr: 'ModuleNotFoundError: No module named \'fontTools\''
            };
        }
        return { status: 0, stdout: '', stderr: '' };
    };
    console.log = (message) => logs.push(String(message));

    try {
        const { buildArticleFontSubset } = require(modulePath);
        assert.doesNotThrow(() => buildArticleFontSubset({ rootDir, refresh: true }));

        const pipInstall = calls.find(call => call.args.includes('pip') && call.args.includes('install'));
        assert.ok(pipInstall, 'expected fontTools install command');
        assert.equal(pipInstall.args.includes('--user'), false);
        assert.equal(pipInstall.command.includes('freecat-fonttools-venv'), true);
        assert.equal(
            logs.some(message => message.includes('local build environment')),
            true
        );
    } finally {
        childProcess.spawnSync = originalSpawnSync;
        require('node:fs').existsSync = originalExistsSync;
        require('node:fs').mkdirSync = originalMkdirSync;
        console.log = originalLog;
        delete require.cache[require.resolve(modulePath)];
    }
});

function sourceHash() {
    return crypto.createHash('sha256').update(Buffer.from('font-source')).digest('hex');
}

function expectedManifest(rootDir, supported) {
    const families = {
        'freecat-figtree': ['regular', 'semi-bold', 'extra-bold'],
        'freecat-ui-noto-sans-sc': ['regular', 'medium', 'semi-bold', 'extra-bold'],
        'freecat-noto-sans-sc': ['regular', 'medium', 'semi-bold', 'extra-bold']
    };
    const manifest = { version: 2, families: {} };
    for (const [prefix, weights] of Object.entries(families)) {
        manifest.families[prefix] = { requested: supported, subsets: {} };
        for (const weight of weights) {
            manifest.families[prefix].subsets[weight] = {
                source: `fonts/${prefix}-${weight}`,
                sourceSha256: sourceHash(),
                output: `src/assets/fonts/${prefix}-${weight}-subset.woff2`,
                supported,
                unsupported: []
            };
        }
    }
    return JSON.stringify(manifest);
}

function withFontSubsetFileMocks(html, manifest, callback) {
    const rootDir = path.join('X:', 'freecat');
    const modulePath = path.join(__dirname, '../build/fonts.js');
    const originalSpawnSync = childProcess.spawnSync;
    const originalExistsSync = fs.existsSync;
    const originalReadFileSync = fs.readFileSync;
    const originalReaddirSync = fs.readdirSync;
    const originalLog = console.log;
    const calls = [];
    const logs = [];

    function normalized(file) {
        return String(file).replace(/\\/g, '/');
    }

    function dirent(name, type) {
        return {
            name,
            isDirectory: () => type === 'dir',
            isFile: () => type === 'file'
        };
    }

    delete require.cache[require.resolve(modulePath)];
    childProcess.spawnSync = (...args) => {
        calls.push(args);
        return { status: 0, stdout: '', stderr: '' };
    };
    fs.existsSync = (file) => {
        const current = normalized(file);
        if (current.includes('/build/font-subsets-manifest.json')) return true;
        if (current.includes('/src/assets/fonts/') && current.endsWith('-subset.woff2')) return true;
        if (current.includes('/fonts/') && /\.(woff2|ttf)$/.test(current)) return true;
        if (current === normalized(path.join(rootDir, 'dist'))) return true;
        if (current === normalized(path.join(rootDir, 'dist', 'posts'))) return true;
        if (current === normalized(path.join(rootDir, 'dist', 'posts', 'post-1'))) return true;
        if (current === normalized(path.join(rootDir, 'src'))) return true;
        if (current === normalized(path.join(rootDir, 'build'))) return true;
        if (current === normalized(path.join(rootDir, '..', 'writing'))) return true;
        if (current === normalized(path.join(rootDir, '..', 'Control'))) return true;
        return originalExistsSync(file);
    };
    fs.readdirSync = (dir, options) => {
        const current = normalized(dir);
        assert.equal(options && options.withFileTypes, true);
        if (current === normalized(path.join(rootDir, 'dist'))) return [dirent('posts', 'dir'), dirent('index.html', 'file')];
        if (current === normalized(path.join(rootDir, 'dist', 'posts'))) return [dirent('post-1', 'dir')];
        if (current === normalized(path.join(rootDir, 'dist', 'posts', 'post-1'))) return [dirent('index.html', 'file')];
        if (
            current === normalized(path.join(rootDir, 'src')) ||
            current === normalized(path.join(rootDir, 'build')) ||
            current === normalized(path.join(rootDir, '..', 'writing')) ||
            current === normalized(path.join(rootDir, '..', 'Control'))
        ) {
            return [];
        }
        return originalReaddirSync(dir, options);
    };
    fs.readFileSync = (file, encoding) => {
        const current = normalized(file);
        if (current.includes('/build/font-subsets-manifest.json')) return manifest;
        if (current.includes('/fonts/') && /\.(woff2|ttf)$/.test(current)) return Buffer.from('font-source');
        if (current.endsWith('/dist/index.html')) return html;
        if (current.endsWith('/dist/posts/post-1/index.html')) return html;
        return originalReadFileSync(file, encoding);
    };
    console.log = (message) => logs.push(String(message));

    try {
        const { buildArticleFontSubset } = require(modulePath);
        callback({ buildArticleFontSubset, rootDir, calls, logs });
    } finally {
        childProcess.spawnSync = originalSpawnSync;
        fs.existsSync = originalExistsSync;
        fs.readFileSync = originalReadFileSync;
        fs.readdirSync = originalReaddirSync;
        console.log = originalLog;
        delete require.cache[require.resolve(modulePath)];
    }
}

test('font subset refresh skips Python when the manifest covers current text', () => {
    const asciiCoverage = Array.from({ length: 95 }, (_, index) => index + 32);
    const manifest = expectedManifest('unused', asciiCoverage);

    withFontSubsetFileMocks('<html><body>Plain ASCII</body></html>', manifest, ({ buildArticleFontSubset, rootDir, calls, logs }) => {
        assert.doesNotThrow(() => buildArticleFontSubset({ rootDir, refresh: true }));
        assert.equal(calls.length, 0);
        assert.equal(
            logs.some(message => message.includes('manifest covers the current text')),
            true
        );
    });
});

test('font subset refresh only asks Python to rebuild stale subsets', () => {
    const asciiCoverage = Array.from({ length: 95 }, (_, index) => index + 32);
    const manifest = expectedManifest('unused', asciiCoverage);

    withFontSubsetFileMocks('<html><body>新增汉字</body></html>', manifest, ({ buildArticleFontSubset, rootDir, calls }) => {
        assert.doesNotThrow(() => buildArticleFontSubset({ rootDir, refresh: true }));
        assert.equal(calls.length, 1);
        const args = calls[0][1];
        assert.equal(args.filter(arg => arg === '--target').length, 11);
        assert.equal(args.includes('freecat-figtree:regular'), true);
        assert.equal(args.includes('freecat-ui-noto-sans-sc:regular'), true);
        assert.equal(args.includes('freecat-noto-sans-sc:regular'), true);
    });
});

test('font subset refresh reuses restored build cache before spawning Python', () => {
    const asciiCoverage = Array.from({ length: 95 }, (_, index) => index + 32);
    const manifest = expectedManifest('unused', asciiCoverage);
    const modulePath = path.join(__dirname, '../build/fonts.js');
    const rootDir = path.join('X:', 'freecat');
    const originalSpawnSync = childProcess.spawnSync;
    const originalExistsSync = fs.existsSync;
    const originalReadFileSync = fs.readFileSync;
    const originalReaddirSync = fs.readdirSync;
    const originalCopyFileSync = fs.copyFileSync;
    const originalMkdirSync = fs.mkdirSync;
    const originalLog = console.log;
    const calls = [];
    const copied = [];
    const logs = [];

    function normalized(file) {
        return String(file).replace(/\\/g, '/');
    }

    function dirent(name, type) {
        return {
            name,
            isDirectory: () => type === 'dir',
            isFile: () => type === 'file'
        };
    }

    delete require.cache[require.resolve(modulePath)];
    childProcess.spawnSync = (...args) => {
        calls.push(args);
        return { status: 0, stdout: '', stderr: '' };
    };
    fs.existsSync = (file) => {
        const current = normalized(file);
        if (current.includes('/node_modules/.cache/freecat-font-subsets/font-subsets-manifest.json')) return true;
        if (current.includes('/node_modules/.cache/freecat-font-subsets/fonts/') && current.endsWith('-subset.woff2')) return true;
        if (current.includes('/build/font-subsets-manifest.json')) return true;
        if (current.includes('/src/assets/fonts/') && current.endsWith('-subset.woff2')) return true;
        if (current.includes('/fonts/') && /\.(woff2|ttf)$/.test(current)) return true;
        if (current === normalized(path.join(rootDir, 'dist'))) return true;
        if (current === normalized(path.join(rootDir, 'dist', 'posts'))) return true;
        if (current === normalized(path.join(rootDir, 'src'))) return true;
        if (current === normalized(path.join(rootDir, 'build'))) return true;
        if (current === normalized(path.join(rootDir, '..', 'writing'))) return true;
        if (current === normalized(path.join(rootDir, '..', 'Control'))) return true;
        return originalExistsSync(file);
    };
    fs.readdirSync = (dir, options) => {
        const current = normalized(dir);
        if (options && options.withFileTypes) {
            if (current === normalized(path.join(rootDir, 'dist'))) return [dirent('index.html', 'file'), dirent('posts', 'dir')];
            if (current === normalized(path.join(rootDir, 'dist', 'posts'))) return [];
            if (
                current === normalized(path.join(rootDir, 'src')) ||
                current === normalized(path.join(rootDir, 'build')) ||
                current === normalized(path.join(rootDir, '..', 'writing')) ||
                current === normalized(path.join(rootDir, '..', 'Control'))
            ) return [];
        }
        return originalReaddirSync(dir, options);
    };
    fs.readFileSync = (file, encoding) => {
        const current = normalized(file);
        if (current.includes('/build/font-subsets-manifest.json')) return manifest;
        if (current.includes('/fonts/') && /\.(woff2|ttf)$/.test(current)) return Buffer.from('font-source');
        if (current.endsWith('/dist/index.html')) return '<html><body>Plain ASCII</body></html>';
        return originalReadFileSync(file, encoding);
    };
    fs.copyFileSync = (source, target) => {
        copied.push([normalized(source), normalized(target)]);
    };
    fs.mkdirSync = () => {};
    console.log = (message) => logs.push(String(message));

    try {
        const { buildArticleFontSubset } = require(modulePath);
        assert.doesNotThrow(() => buildArticleFontSubset({ rootDir, refresh: true }));
        assert.equal(calls.length, 0);
        assert.equal(copied.some(([source]) => source.includes('/node_modules/.cache/freecat-font-subsets/')), true);
        assert.equal(logs.some(message => message.includes('Restored cached font subsets')), true);
        assert.equal(logs.some(message => message.includes('manifest covers the current text')), true);
    } finally {
        childProcess.spawnSync = originalSpawnSync;
        fs.existsSync = originalExistsSync;
        fs.readFileSync = originalReadFileSync;
        fs.readdirSync = originalReaddirSync;
        fs.copyFileSync = originalCopyFileSync;
        fs.mkdirSync = originalMkdirSync;
        console.log = originalLog;
        delete require.cache[require.resolve(modulePath)];
    }
});
