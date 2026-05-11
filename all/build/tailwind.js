const fs = require('fs');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

/**
 * 构建期编译 Tailwind CSS。
 *
 * 设计：
 *   - 先生成所有 HTML（含 partials / 通过 JS 模板渲染的卡片），再扫描 dist/**\/*.html
 *     得到真实使用到的 class 集合 —— 既覆盖 buildtime 模板，也覆盖运行时 JS 字符串模板。
 *   - 同时扫 src/**\/*.{html,js} 与 build/**\/*.js（pagination.js / markdown.js / post-card-template.js
 *     这些会拼出含 Tailwind class 的 HTML 字符串，必须纳入 content scan，否则 PurgeCSS 会清掉它们）。
 *   - 默认 minify。开发模式可关闭。
 */
async function buildTailwindCss({ contentGlobs, outputPath, minify = true }) {
    const inputCss = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;

    const config = {
        darkMode: 'class',
        content: { files: contentGlobs },
        // Tailwind 主题配置（颜色 / 字体 / 圆角等）
        // 之前 CDN 模式下这部分由 src/assets/tailwind.config.js 注入到 runtime；
        // 改本地编译后统一在这里维护。
        theme: {
            extend: {
                colors: {
                    'primary': '#1e293b',
                    'background-light': '#f6f6f8',
                    'background-dark': '#101622',
                    'card-dark': '#1A2332',
                },
                fontFamily: {
                    'display': ['Inter', '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'Roboto', "'PingFang SC'", "'Hiragino Sans GB'", "'Microsoft YaHei'", "'微软雅黑'", 'sans-serif']
                },
                borderRadius: {
                    'DEFAULT': '0.25rem',
                    'lg': '0.5rem',
                    'xl': '0.75rem',
                    'full': '9999px'
                },
            },
        },
        plugins: [
            require('@tailwindcss/forms'),
            require('@tailwindcss/container-queries')
        ],
        // 安全网：模板里有些动态拼接的 class 在不同地方组合，
        // 用 safelist 防止 JIT 漏识别。这里只保留确实会动态产生的少量类名。
        safelist: [
            'dark',
            'animate-fade-in-up',
            'delay-150',
            'delay-300',
        ],
    };

    const plugins = [tailwindcss(config), autoprefixer()];
    if (minify) plugins.push(cssnano({ preset: 'default' }));

    const result = await postcss(plugins).process(inputCss, { from: undefined });
    fs.writeFileSync(outputPath, result.css);
    return { size: result.css.length };
}

module.exports = { buildTailwindCss };
