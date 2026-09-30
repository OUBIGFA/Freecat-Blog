const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const fontkit = require('fontkit');
const { parseHTML } = require('linkedom');
const { renderPostFontFaceCss } = require('../build/pages/post.js');

const root = path.join(__dirname, '..');

// Font policy covers inline template styles as well as shared stylesheets.
function sourceStyles(directory) {
    const sources = [];
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) sources.push(...sourceStyles(file));
        else if (entry.name.endsWith('.css')) sources.push({ file, css: fs.readFileSync(file, 'utf8') });
        else if (entry.name.endsWith('.html')) {
            const { document } = parseHTML(fs.readFileSync(file, 'utf8'));
            for (const style of document.querySelectorAll('style')) {
                sources.push({ file, css: style.textContent.replace(/<!--[\s\S]*?-->/g, '') });
            }
            for (const element of document.querySelectorAll('[style]')) {
                sources.push({ file, css: ':root {' + element.getAttribute('style') + '}' });
            }
        }
    }
    return sources;
}

test('site CSS uses bundled families for text, code and keyboard hints', () => {
    for (const { file, css: source } of sourceStyles(path.join(root, 'src'))) {
        const css = postcss.parse(source);
        css.walkDecls(/^(?:font|font-family)$/, declaration => {
            if (declaration.parent.type === 'atrule' && declaration.parent.name === 'font-face') return;
            const stack = declaration.value.trim();
            if (stack === 'inherit') return;
            assert.match(stack, /"Freecat (?:(?:Tag )?Figtree|JetBrains Mono)"/, file + ': local Latin font missing from ' + stack);
            assert.match(stack, /"Freecat (?:(?:Tag|Post Card) )?Noto Sans SC"/, file + ': local Chinese font missing from ' + stack);
            assert.match(stack, /"Freecat Noto Emoji"/, file + ': local symbols font missing from ' + stack);
            assert.match(stack, /"Freecat Noto Symbols"/, file + ': local non-emoji symbols font missing from ' + stack);
            assert.doesNotMatch(stack, /(?:Inter|Roboto|Cascadia Code|SFMono-Regular|Consolas|ui-monospace|-apple-system|BlinkMacSystemFont|Segoe UI|PingFang SC|Hiragino Sans GB|Microsoft YaHei|微软雅黑)/, file + ': ' + declaration.value);
        });
    }
});

test('emoji and backlink symbols have a bundled font on site and article pages', () => {
    const font = fontkit.create(fs.readFileSync(path.join(root, 'src/assets/fonts/freecat-noto-emoji.ttf')));
    for (const codepoint of [0x21a9, 0x2705, 0x1f3b5, 0x1f4cb, 0x1f6e0]) {
        assert.ok(font.hasGlyphForCodePoint(codepoint), 'Missing symbol U+' + codepoint.toString(16));
    }
    assert.match(renderPostFontFaceCss('article', 'version'), /freecat-noto-emoji\.ttf\?v=version/);
    assert.match(fs.readFileSync(path.join(root, 'src/partials/head-base.html'), 'utf8'), /freecat-noto-emoji\.ttf/);
    const symbols = fontkit.create(fs.readFileSync(path.join(root, 'src/assets/fonts/freecat-noto-symbols.ttf')));
    assert.ok(symbols.hasGlyphForCodePoint(0x2715), 'Missing multiplication X symbol');
    assert.match(renderPostFontFaceCss('article', 'version'), /freecat-noto-symbols\.ttf\?v=version/);
});

test('all site styles keep the bundled fonts default digit forms', () => {
    for (const { file, css } of sourceStyles(path.join(root, 'src'))) {
        postcss.parse(css).walkDecls(/^(?:font-variant-numeric|font-feature-settings)$/, declaration => {
            assert.equal(declaration.value, 'normal', file + ': ' + declaration.toString());
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
