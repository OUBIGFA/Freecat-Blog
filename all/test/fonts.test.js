const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');

test('production build refreshes font subsets after pages are generated', () => {
    const buildJs = fs.readFileSync(path.join(__dirname, '..', 'build.js'), 'utf-8');

    assert.match(buildJs, /buildArticleFontSubset\(\{\s*rootDir:\s*__dirname,\s*refresh:\s*true\s*\}\);/);
    assert.doesNotMatch(buildJs, /Checking generated font subsets/);
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
