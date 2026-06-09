const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const repoRoot = path.join(__dirname, '..', '..');

function readWorkflow(name) {
    return fs.readFileSync(path.join(repoRoot, '.github', 'workflows', name), 'utf-8');
}

test('article snapshot workflow commits generated font subsets', () => {
    const workflow = readWorkflow('update-git-dates.yml');

    assert.match(workflow, /Generate font subsets/);
    assert.match(workflow, /npm run build/);
    assert.match(workflow, /python -m pip install --disable-pip-version-check fonttools brotli/);
    assert.doesNotMatch(workflow, /cache:\s*pip/);
    assert.match(workflow, /all\/build\/font-subsets-manifest\.json/);
    assert.match(workflow, /all\/src\/assets\/fonts/);
    assert.match(workflow, /chore: update article snapshots and font subsets/);
});

test('upstream sync preserves local generated font subsets', () => {
    const workflow = readWorkflow('sync-upstream.yml');

    assert.match(workflow, /font-subsets-manifest\.json/);
    assert.match(workflow, /all\/src\/assets\/fonts/);
    assert.match(workflow, /save_local_generated_state/);
    assert.match(workflow, /restore_local_generated_state/);
});
