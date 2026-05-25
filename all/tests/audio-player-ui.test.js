const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('audio progress uses slider-style track, thumb, and motion states', () => {
    const css = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'assets', 'audio-player.css'),
        'utf8'
    );

    assert.match(css, /\.audio-progress-container::before/);
    assert.match(css, /\.audio-progress-container\.is-dragging::before/);
    assert.match(css, /\.audio-progress-container:hover \.audio-progress-thumb/);
    assert.match(css, /\.audio-progress-container:focus-visible/);
    assert.match(css, /touch-action:\s*none/);
});

test('audio progress exposes slider semantics and pointer dragging', () => {
    const js = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'assets', 'audio-player.js'),
        'utf8'
    );

    assert.match(js, /role="slider"/);
    assert.match(js, /aria-valuetext/);
    assert.match(js, /pointerdown/);
    assert.match(js, /setPointerCapture/);
    assert.match(js, /addEventListener\('keydown'/);
});
