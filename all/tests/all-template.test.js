const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const template = fs.readFileSync(
    path.join(__dirname, '..', 'src', 'template_index_all.html'),
    'utf8'
);

test('all page uses a single update-sort switch', () => {
    assert.match(template, /data-update-sort-switch/);
    assert.match(template, /role="switch"/);
    assert.match(template, /aria-checked="false"/);
    assert.match(template, />按更新排序</);
    assert.doesNotMatch(template, /data-sort-mode=/);
    assert.doesNotMatch(template, /freecat-all-sort/);
    assert.doesNotMatch(template, />按时间排序</);
});
