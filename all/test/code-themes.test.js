const test = require('node:test');
const assert = require('node:assert/strict');
const postcss = require('postcss');
const { createCodeThemeCss } = require('../build/code-themes.js');

// 检查生成 CSS 的实际主题属性，覆盖普通 token、语义强调及 diff。
function declarations(css, selector) {
    const values = {};
    postcss.parse(css).walkRules(rule => {
        if (rule.selectors.includes(selector)) rule.walkDecls(d => { values[d.prop] = d.value.trim(); });
    });
    return values;
}

test('local themes retain light and dark token colors, emphasis and diff backgrounds', () => {
    const css = createCodeThemeCss();
    for (const scope of ['html:not(.dark)', 'html.dark']) {
        const rule = selector => declarations(css, `${scope} .prose ${selector}`);
        for (const token of ['keyword', 'string', 'number', 'comment', 'meta', 'title.function_']) {
            assert.ok(rule(`.hljs-${token}`).color, `${scope}: ${token}`);
        }
        assert.equal(rule('.hljs-emphasis')['font-style'], 'italic');
        assert.equal(rule('.hljs-strong')['font-weight'], 'bold');
        assert.ok(rule('.hljs-addition')['background-color']);
        assert.ok(rule('.hljs-deletion')['background-color']);
    }
    assert.notEqual(declarations(css, 'html.dark .prose .hljs-keyword').color,
        declarations(css, 'html:not(.dark) .prose .hljs-keyword').color);
    assert.doesNotMatch(css, /https?:\/\/.*(?:\.css|\.js)["')]/);
});

test('configured themes supply their background and base text to the blog frame', () => {
    const css = createCodeThemeCss({ code_theme_light: 'atom-one-light', code_theme_dark: 'nord' });
    const light = declarations(css, 'html:not(.dark) .prose .code-block-container');
    const dark = declarations(css, 'html.dark .prose .code-block-container');
    assert.equal(light['--code-surface'].toLowerCase(), 'color-mix(in srgb, #fafafa 98%, #111827)');
    assert.equal(light['--code-text'].toLowerCase(), '#383a42');
    assert.equal(dark['--code-surface'].toLowerCase(), '#2e3440');
    assert.equal(dark['--code-text'].toLowerCase(), '#d8dee9');
    assert.equal(declarations(css, 'html.dark .prose .hljs-subst').color.toLowerCase(), '#d8dee9');
    assert.match(css, /Copyright \(c\) 2017-present Arctic Ice Studio/);
    const atomDark = createCodeThemeCss({ code_theme_dark: 'atom-one-dark' });
    assert.equal(declarations(atomDark, 'html.dark .prose .code-block-container')['--code-surface'], '#282c34');
});

test('unknown theme configuration fails clearly', () => {
    assert.throws(() => createCodeThemeCss({ code_theme_light: 'missing-theme' }), /Unsupported code theme: missing-theme/);
});
