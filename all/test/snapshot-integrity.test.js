const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

test('git date snapshot stays valid JSON without merge conflict markers', () => {
    const snapshotPath = path.join(__dirname, '..', 'git-dates.json');
    const content = fs.readFileSync(snapshotPath, 'utf-8');

    assert.doesNotMatch(content, /^(<<<<<<<|=======|>>>>>>>)/m);
    assert.doesNotThrow(() => JSON.parse(content));
});
