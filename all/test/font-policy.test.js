const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const fontkit = require('fontkit');
const { renderPostFontFaceCss } = require('../build/pages/post.js');

const root = path.join(__dirname, '..');

test('site CSS uses bundled families for text, code and keyboard hints', () => {
    const cssDir = path.join(root, 'src/assets');
    for (const file of fs.readdirSync(cssDir).filter(name => name.endsWith('.css'))) {
        const css = postcss.parse(fs.readFileSync(path.join(cssDir, file), 'utf8'));
        css.walkDecls(/^(?:font|font-family)$/, declaration => {
            const stack = declaration.value.trim();
            if (stack === 'inherit') return;
            assert.match(stack, /"Freecat [^"]+"/, file + ': ' + declaration.value);
            assert.doesNotMatch(stack, /(?:Inter|Roboto|Cascadia Code|SFMono-Regular|Consolas|ui-monospace|-apple-system|BlinkMacSystemFont|Segoe UI|PingFang SC|Hiragino Sans GB|Microsoft YaHei|微软雅黑)/, file + ': ' + declaration.value);
        });
    }
});

test('bundled code font provides equal-width glyphs and is available to article pages', () => {
    const fonts = path.join(root, 'src/assets/fonts');
    const faces = renderPostFontFaceCss('any-article', 'test-version');
    const homeHead = fs.readFileSync(path.join(root, 'src/partials/head-base.html'), 'utf8');
    assert.match(fs.readFileSync(path.join(fonts, 'JETBRAINS-MONO-OFL.txt'), 'utf8'), /SIL OPEN FONT LICENSE Version 1.1/);
    for (const weight of ['regular', 'semi-bold']) {
        const filename = 'freecat-jetbrains-mono-' + weight + '.woff2';
        const font = fontkit.create(fs.readFileSync(path.join(fonts, filename)));
        assert.equal(font.glyphForCodePoint(87).advanceWidth, font.glyphForCodePoint(105).advanceWidth);
        assert.ok(faces.includes(filename), 'Article page must load ' + filename);
        assert.ok(homeHead.includes(filename), 'Site pages must load ' + filename);
    }
});
