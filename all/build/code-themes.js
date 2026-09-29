const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');

const THEMES = new Set(['github', 'github-dark', 'atom-one-light', 'atom-one-dark', 'nord']);

function scopedTheme(name, dark) {
    if (!THEMES.has(name)) throw new Error(`Unsupported code theme: ${name}. Choose ${[...THEMES].join(', ')}.`);
    const source = postcss.parse(fs.readFileSync(require.resolve(`highlight.js/styles/${name}.css`), 'utf8'));
    const scope = dark ? 'html.dark' : 'html:not(.dark)';
    const output = postcss.root();
    output.append(postcss.comment({ text: `highlight.js theme: ${name}` }));
    source.each(rule => {
        // 随生成主题保留作者与许可证说明。
        if (rule.type === 'comment') { output.append(rule.clone()); return; }
        if (rule.type !== 'rule') return;
        // 容器的尺寸与留白仍由博客控制；主题的完整语法颜色、强调和 diff 背景保留。
        if (rule.selector === 'pre code.hljs' || rule.selector === 'code.hljs') return;
        if (rule.selectors.includes('.hljs')) {
            const surface = postcss.rule({ selector: `${scope} .prose .code-block-container` });
            rule.walkDecls(declaration => {
                if (declaration.prop === 'color') surface.append({ prop: '--code-text', value: declaration.value });
                if (declaration.prop === 'background' || declaration.prop === 'background-color') {
                    // 近白底只提示代码区域，语法 token 仍使用主题原色。
                    const value = dark ? declaration.value : `color-mix(in srgb, ${declaration.value.trim()} 98%, #111827)`;
                    surface.append({ prop: '--code-surface', value });
                }
            });
            output.append(surface);
        }
        const tokenSelectors = rule.selectors.filter(selector => selector !== '.hljs');
        if (!tokenSelectors.length) return;
        const scoped = rule.clone();
        scoped.selectors = tokenSelectors.map(selector => `${scope} .prose ${selector}`);
        output.append(scoped);
    });
    return output.toString();
}

// 深浅主题独立配置，所有颜色在构建期写成本地样式。
function createCodeThemeCss(siteConfig = {}) {
    const light = String(siteConfig.code_theme_light || 'github').trim();
    const dark = String(siteConfig.code_theme_dark || 'github-dark').trim();
    return scopedTheme(light, false) + '\n' + scopedTheme(dark, true);
}

function writeCodeThemeAssets(assetsDir, siteConfig) {
    fs.writeFileSync(path.join(assetsDir, 'code-highlight.css'), createCodeThemeCss(siteConfig), 'utf8');
    const packageRoot = path.dirname(require.resolve('highlight.js/package.json'));
    fs.copyFileSync(path.join(packageRoot, 'LICENSE'), path.join(assetsDir, 'highlightjs-LICENSE.txt'));
}

module.exports = { createCodeThemeCss, writeCodeThemeAssets };
