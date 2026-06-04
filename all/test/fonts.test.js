const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');

test('font subset build falls back to the existing subset when fontTools is unavailable', () => {
    const modulePath = path.join(__dirname, '../build/fonts.js');
    const originalSpawnSync = childProcess.spawnSync;
    const warnings = [];
    const originalWarn = console.warn;
    const originalLog = console.log;

    delete require.cache[require.resolve(modulePath)];
    childProcess.spawnSync = () => ({
        status: 1,
        stdout: '',
        stderr: 'ModuleNotFoundError: No module named \'fontTools\''
    });
    console.warn = (message) => warnings.push(String(message));
    console.log = () => {};

    try {
        const { buildArticleFontSubset } = require(modulePath);
        assert.doesNotThrow(() => buildArticleFontSubset({ rootDir: path.join(__dirname, '..') }));
        assert.equal(
            warnings.some(message => message.includes('Using the existing generated subset instead')),
            true
        );
    } finally {
        childProcess.spawnSync = originalSpawnSync;
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
        assert.doesNotThrow(() => buildArticleFontSubset({ rootDir }));

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
