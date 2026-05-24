const test = require('node:test');
const assert = require('node:assert/strict');

const packageJson = require('../package.json');

test('deploy build does not update git date snapshots', () => {
    assert.equal(packageJson.scripts.build, 'node build.js');
    assert.equal(packageJson.scripts['build:with-dates'], 'node extract-git-dates.js && node build.js');
});
