const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const crypto = require('node:crypto');

test('production build refreshes font subsets after pages are generated', () => {
    const buildJs = fs.readFileSync(path.join(__dirname, '..', 'build.js'), 'utf-8');

    assert.match(buildJs, /buildArticleFontSubset\(\{\s*rootDir:\s*__dirname,\s*refresh:\s*true\s*\}\);/);
    assert.doesNotMatch(buildJs, /Checking committed font subsets/);
});

test('font subset refresh checks the manifest before running the subsetter', () => {
    const fontsJs = fs.readFileSync(path.join(__dirname, '..', 'build', 'fonts.js'), 'utf-8');
    const cacheCheckIndex = fontsJs.indexOf('fontSubsetRefreshPlan(rootDir)');
    const runIndex = fontsJs.indexOf('runFontSubsetter(rootDir, refreshPlan.targets)');

    assert.notEqual(cacheCheckIndex, -1);
    assert.notEqual(runIndex, -1);
    assert.ok(cacheCheckIndex < runIndex);
    assert.match(fontsJs, /Font subset manifest covers the known text; skipping refresh/);
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

test('font subset refresh falls back to the existing subsets when the subsetter fails', () => {
    const modulePath = path.join(__dirname, '../build/fonts.js');
    const originalSpawnSync = childProcess.spawnSync;
    const originalExistsSync = fs.existsSync;
    const originalCopyFileSync = fs.copyFileSync;
    const originalMkdirSync = fs.mkdirSync;
    const warnings = [];
    const originalWarn = console.warn;
    const originalLog = console.log;

    delete require.cache[require.resolve(modulePath)];
    childProcess.spawnSync = () => ({
        status: 1,
        stdout: '',
        stderr: "Error: Cannot find module 'subset-font'"
    });
    fs.existsSync = (file) => {
        const normalized = String(file).replace(/\\/g, '/');
        if (normalized.includes('/build/font-subsets-manifest.json')) return false;
        if (normalized.includes('/src/assets/fonts/freecat-ui-noto-sans-sc-')) return true;
        if (normalized.includes('/src/assets/fonts/freecat-noto-sans-sc-')) return true;
        if (normalized.includes('/src/assets/fonts/freecat-figtree-')) return true;
        return originalExistsSync(file);
    };
    fs.copyFileSync = () => {};
    fs.mkdirSync = () => {};
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
        fs.copyFileSync = originalCopyFileSync;
        fs.mkdirSync = originalMkdirSync;
        console.warn = originalWarn;
        console.log = originalLog;
        delete require.cache[require.resolve(modulePath)];
    }
});

test('font caches always live in node_modules/.cache regardless of build platform', () => {
    const modulePath = path.join(__dirname, '../build/fonts.js');
    const rootDir = path.join('X:', 'freecat');
    const previousCfPages = process.env.CF_PAGES;
    const previousNpmCache = process.env.npm_config_cache;

    delete require.cache[require.resolve(modulePath)];
    // Cloudflare Pages 无法持久化自定义缓存目录，缓存路径不得因 CF_PAGES 而改变。
    process.env.CF_PAGES = '1';
    process.env.npm_config_cache = path.join('X:', 'cloudflare', '.npm');

    try {
        const { fontSubsetCacheDir } = require(modulePath);
        assert.equal(
            fontSubsetCacheDir(rootDir),
            path.join(rootDir, 'node_modules', '.cache', 'freecat-font-subsets')
        );
    } finally {
        if (previousCfPages === undefined) delete process.env.CF_PAGES;
        else process.env.CF_PAGES = previousCfPages;
        if (previousNpmCache === undefined) delete process.env.npm_config_cache;
        else process.env.npm_config_cache = previousNpmCache;
        delete require.cache[require.resolve(modulePath)];
    }
});

function sourceHash() {
    return crypto.createHash('sha256').update(Buffer.from('font-source')).digest('hex');
}

function codepointsForTest(text) {
    return [...new Set([...text].map(char => char.codePointAt(0)))].sort((a, b) => a - b);
}

function expectedManifest(rootDir, supported) {
    const families = {
        'freecat-figtree': ['regular', 'semi-bold', 'extra-bold'],
        'freecat-ui-noto-sans-sc': ['regular', 'medium', 'semi-bold', 'extra-bold'],
        'freecat-noto-sans-sc': ['regular', 'medium', 'semi-bold', 'extra-bold']
    };
    const supportedByFamily = Array.isArray(supported)
        ? Object.fromEntries(Object.keys(families).map(prefix => [prefix, supported]))
        : supported;
    const manifest = { version: 4, families: {} };
    for (const [prefix, weights] of Object.entries(families)) {
        const familySupported = supportedByFamily[prefix] || [];
        manifest.families[prefix] = { requested: familySupported, subsets: {} };
        for (const weight of weights) {
            manifest.families[prefix].subsets[weight] = {
                source: `fonts/${prefix}-${weight}`,
                sourceSha256: sourceHash(),
                output: `src/assets/fonts/${prefix}-${weight}-subset.woff2`,
                supported: familySupported,
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
        if (current === normalized(path.join(rootDir, 'src'))) return [dirent('source.js', 'file')];
        if (current === normalized(path.join(rootDir, 'build'))) return [dirent('build.js', 'file')];
        if (current === normalized(path.join(rootDir, '..', 'writing'))) return [dirent('post.md', 'file')];
        if (current === normalized(path.join(rootDir, '..', 'Control'))) return [dirent('config.md', 'file')];
        return originalReaddirSync(dir, options);
    };
    fs.readFileSync = (file, encoding) => {
        const current = normalized(file);
        if (current.includes('/build/font-subsets-manifest.json')) return manifest;
        if (current.includes('/fonts/') && /\.(woff2|ttf)$/.test(current)) return Buffer.from('font-source');
        if (current.endsWith('/src/source.js')) return 'SourceOnlyZ';
        if (current.endsWith('/build/build.js')) return 'BuildOnlyZ';
        if (current.endsWith('/writing/post.md')) return 'WritingOnlyZ';
        if (current.endsWith('/Control/config.md')) return 'ControlOnlyZ';
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

test('font subset refresh skips the subsetter when the manifest covers known text', () => {
    const visibleCoverage = codepointsForTest('Plain ASCII');
    const manifest = expectedManifest('unused', {
        'freecat-figtree': visibleCoverage,
        'freecat-ui-noto-sans-sc': [],
        'freecat-noto-sans-sc': []
    });

    withFontSubsetFileMocks('<html><body>Plain ASCII</body></html>', manifest, ({ buildArticleFontSubset, rootDir, calls, logs }) => {
        assert.doesNotThrow(() => buildArticleFontSubset({ rootDir, refresh: true }));
        assert.equal(calls.length, 0);
        assert.equal(
            logs.some(message => message.includes('manifest covers the known text')),
            true
        );
    });
});

test('font subset refresh keeps previously generated characters after pages shrink', () => {
    const manifest = expectedManifest('unused', {
        'freecat-figtree': codepointsForTest('Plain ASCII Older Title'),
        'freecat-ui-noto-sans-sc': codepointsForTest('旧字符'),
        'freecat-noto-sans-sc': codepointsForTest('旧字符')
    });

    withFontSubsetFileMocks('<html><body>Plain ASCII</body></html>', manifest, ({ buildArticleFontSubset, rootDir, calls, logs }) => {
        assert.doesNotThrow(() => buildArticleFontSubset({ rootDir, refresh: true }));
        assert.equal(calls.length, 0);
        assert.equal(
            logs.some(message => message.includes('manifest covers the known text')),
            true
        );
    });
});

test('font subset refresh does not restore cache over current reusable subsets', () => {
    const visibleCoverage = codepointsForTest('Plain ASCII');
    const manifest = expectedManifest('unused', {
        'freecat-figtree': visibleCoverage,
        'freecat-ui-noto-sans-sc': [],
        'freecat-noto-sans-sc': []
    });
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
        assert.equal(
            copied.some(([source]) => source.includes('/node_modules/.cache/freecat-font-subsets/')),
            false
        );
        assert.equal(
            copied.some(([, target]) => target.includes('/node_modules/.cache/freecat-font-subsets/')),
            true
        );
        assert.equal(logs.some(message => message.includes('Restored cached font subsets')), false);
        assert.equal(logs.some(message => message.includes('Saved cached font subsets')), true);
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

test('font subset refresh ignores source and config text outside generated pages', () => {
    const visibleCoverage = codepointsForTest('Visible text');
    const manifest = expectedManifest('unused', {
        'freecat-figtree': visibleCoverage,
        'freecat-ui-noto-sans-sc': [],
        'freecat-noto-sans-sc': []
    });

    withFontSubsetFileMocks(
        '<html><!-- HiddenSourceZ --><script>BuildOnlyZ</script><style>.x{font-family:ControlOnlyZ}</style><body>Visible text</body></html>',
        manifest,
        ({ buildArticleFontSubset, rootDir, calls }) => {
            assert.doesNotThrow(() => buildArticleFontSubset({ rootDir, refresh: true }));
            assert.equal(calls.length, 0);
        }
    );
});

test('font subset refresh only asks the subsetter to rebuild stale subsets', () => {
    const asciiCoverage = Array.from({ length: 95 }, (_, index) => index + 32);
    const manifest = expectedManifest('unused', asciiCoverage);

    withFontSubsetFileMocks('<html><body>新增汉字</body></html>', manifest, ({ buildArticleFontSubset, rootDir, calls }) => {
        assert.doesNotThrow(() => buildArticleFontSubset({ rootDir, refresh: true }));
        assert.equal(calls.length, 1);
        const args = calls[0][1];
        assert.match(String(args[0]).replace(/\\/g, '/'), /\/build\/font-subsetter\.js$/);
        assert.equal(args.filter(arg => arg === '--target').length, 11);
        assert.equal(args.includes('freecat-figtree:regular'), true);
        assert.equal(args.includes('freecat-ui-noto-sans-sc:regular'), true);
        assert.equal(args.includes('freecat-noto-sans-sc:regular'), true);
    });
});

test('font subset refresh reuses restored build cache before running the subsetter', () => {
    const visibleCoverage = codepointsForTest('Plain ASCII');
    const manifest = expectedManifest('unused', {
        'freecat-figtree': visibleCoverage,
        'freecat-ui-noto-sans-sc': [],
        'freecat-noto-sans-sc': []
    });
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
    let restoredSubsets = false;

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
        if (current.includes('/src/assets/fonts/') && current.endsWith('-subset.woff2')) return restoredSubsets;
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
        if (normalized(target).includes('/src/assets/fonts/')) restoredSubsets = true;
    };
    fs.mkdirSync = () => {};
    console.log = (message) => logs.push(String(message));

    try {
        const { buildArticleFontSubset } = require(modulePath);
        assert.doesNotThrow(() => buildArticleFontSubset({ rootDir, refresh: true }));
        assert.equal(calls.length, 0);
        assert.equal(copied.some(([source]) => source.includes('/node_modules/.cache/freecat-font-subsets/')), true);
        assert.equal(logs.some(message => message.includes('Restored cached font subsets')), true);
        assert.equal(logs.some(message => message.includes('manifest covers the known text')), true);
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

test('font subsetter generates woff2 subsets that cover the requested text', async () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'freecat-font-subsetter-'));
    const originalLog = console.log;
    console.log = () => {};

    try {
        const rootDir = path.join(sandbox, 'all');
        fs.mkdirSync(path.join(rootDir, 'fonts'), { recursive: true });
        fs.mkdirSync(path.join(rootDir, 'dist'), { recursive: true });
        fs.copyFileSync(
            path.join(__dirname, '..', 'fonts', 'freecat-figtree-regular.ttf'),
            path.join(rootDir, 'fonts', 'freecat-figtree-regular.ttf')
        );
        fs.writeFileSync(path.join(rootDir, 'dist', 'index.html'), '<html><body>Subset OK 123</body></html>', 'utf-8');

        const { generateFontSubsets } = require('../build/font-subsetter.js');
        await generateFontSubsets({ rootDir, targets: { 'freecat-figtree': new Set(['regular']) } });

        const outputFile = path.join(rootDir, 'src', 'assets', 'fonts', 'freecat-figtree-regular-subset.woff2');
        assert.ok(fs.existsSync(outputFile), 'expected the generated subset file to exist');

        const fontkit = require('fontkit');
        const subsetCmap = new Set(fontkit.create(fs.readFileSync(outputFile)).characterSet);
        for (const char of 'Subset OK 123') {
            assert.ok(subsetCmap.has(char.codePointAt(0)), `expected the subset to keep a glyph for "${char}"`);
        }

        const manifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'build', 'font-subsets-manifest.json'), 'utf-8'));
        assert.equal(manifest.version, 4);
        const entry = manifest.families['freecat-figtree'].subsets.regular;
        assert.equal(entry.source, 'fonts/freecat-figtree-regular.ttf');
        assert.equal(entry.output, 'src/assets/fonts/freecat-figtree-regular-subset.woff2');
        assert.ok(entry.supported.includes('S'.codePointAt(0)));
        assert.equal(typeof entry.sourceSha256, 'string');
    } finally {
        console.log = originalLog;
        fs.rmSync(sandbox, { recursive: true, force: true });
    }
});
