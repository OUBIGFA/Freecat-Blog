const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { assertSafeCleanDirTarget } = require('../build/fs-utils.js');

test('clean directory guard only allows the configured build output folder', () => {
    const projectDir = path.join(__dirname, '..');

    assert.doesNotThrow(() => {
        assertSafeCleanDirTarget(path.join(projectDir, 'dist'), { within: projectDir, allowedName: 'dist' });
    });

    assert.throws(() => {
        assertSafeCleanDirTarget(projectDir, { within: projectDir, allowedName: 'dist' });
    }, /Refusing to clean unexpected directory/);

    assert.throws(() => {
        assertSafeCleanDirTarget(path.join(projectDir, '..', 'dist'), { within: projectDir, allowedName: 'dist' });
    }, /Refusing to clean directory outside/);
});
