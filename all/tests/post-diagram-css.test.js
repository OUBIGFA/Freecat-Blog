const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '../src/assets/post.css'), 'utf8');

test('mermaid edge label keeps an opaque outer block and transparent inner text nodes', () => {
    assert.match(css, /\.mermaid-block \.labelBkg\s*\{[^}]*background-color:\s*#f8fafc !important;/s);
    assert.match(css, /\.mermaid-block \.labelBkg\s*\{[^}]*border:\s*0\.7px solid #9aa8bc !important;/s);
    assert.match(css, /\.dark \.mermaid-block \.labelBkg\s*\{[^}]*background-color:\s*#172033 !important;/s);
    assert.match(css, /\.dark \.mermaid-block \.labelBkg\s*\{[^}]*border-color:\s*#718096 !important;/s);
    assert.match(css, /\.mermaid-block \.labelBkg \*\s*\{[^}]*background:\s*transparent !important;/s);
});

test('diagram layout wrapper is visually removed while keeping diagrams inside the article column', () => {
    assert.match(css, /\.diagram-block\s*\{[^}]*background:\s*transparent !important;/s);
    assert.match(css, /\.diagram-block\s*\{[^}]*border:\s*0 !important;/s);
    assert.match(css, /\.diagram-block\s*\{[^}]*padding:\s*0 !important;/s);
    assert.match(css, /\.diagram-block\s*\{[^}]*overflow:\s*hidden !important;/s);
    assert.match(css, /\.diagram-block\s*\{[^}]*max-width:\s*100% !important;/s);
    assert.match(css, /\.mermaid-block\[data-mermaid-kind="flowchart"\],\s*\.mermaid-block\[data-mermaid-kind="diagram"\]\s*\{[^}]*width:\s*100% !important;/s);
    assert.doesNotMatch(css, /translateX\(-50%\)/);
    assert.match(css, /\.diagram-block svg\s*\{[^}]*max-width:\s*100% !important;/s);
});

test('flowchart groups and strokes are refined for complex diagrams', () => {
    assert.match(css, /\.mermaid-block g\.cluster rect\s*\{[^}]*stroke-width:\s*0\.5px !important;/s);
    assert.match(css, /\.mermaid-block \.flowchart-link[\s\S]*?stroke-width:\s*0\.75px !important;/s);
    assert.match(css, /\.mermaid-block \.node rect[\s\S]*?stroke-width:\s*0\.55px !important;/s);
    assert.match(css, /\.mermaid-block \.cluster-label div[\s\S]*?border-radius:\s*4px !important;/s);
    assert.match(css, /\.mermaid-block \.freecat-mermaid-cluster-label\s*\{[^}]*pointer-events:\s*none;/s);
    assert.match(css, /\.mermaid-block \.freecat-mermaid-cluster-label div\s*\{[^}]*padding:\s*2px 8px !important;/s);
});

test('sequence numbers have their own fitted badge styling', () => {
    assert.match(css, /\.mermaid-block \.freecat-mermaid-sequence-number-bg\s*\{[^}]*fill:\s*#eef4fb !important;/s);
    assert.match(css, /\.mermaid-block \.freecat-mermaid-sequence-number-bg\s*\{[^}]*stroke-width:\s*0\.55px !important;/s);
    assert.match(css, /\.mermaid-block \.freecat-mermaid-sequence-number\s*\{[^}]*font-size:\s*10px !important;/s);
});

test('gantt keeps the custom renderer while sharing the diagram visual language', () => {
    assert.match(css, /\.freecat-gantt\s*\{[^}]*max-width:\s*100%;/s);
    assert.match(css, /\.freecat-gantt-task\s*\{[^}]*fill:\s*#5f7087;/s);
    assert.match(css, /\.dark \.freecat-gantt-task\s*\{[^}]*fill:\s*#718096;/s);
});
