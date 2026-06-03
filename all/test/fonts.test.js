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
