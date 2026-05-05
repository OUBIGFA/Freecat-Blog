const fs = require('fs');
const path = require('path');
const shared = require('../src/assets/shared.js');
const { autoSpacing } = require('./markdown.js');
const { SOCIAL_PLATFORM_ORDER } = require('./social-defaults.js');

/**
 * 模板引擎：partial 注入、SITE_* 占位替换、Logo / Theme / Social 渲染。
 *
 * 占位约定：
 *   <!-- INCLUDE:name -->                  → 注入 src/partials/{name}.html（递归支持）
 *   <!-- SITE_TITLE -->, <!-- SITE_NAME --> 等 → 由 applySiteConfig 替换
 *
 * 核心导出：
 *   - createEngine({ partialsDir, siteConfig, socialConfig })
 *       .loadTemplate(filename)  → 读取并完成所有静态替换的 HTML 字符串
 *       .applySiteConfig(html)   → 仅替换 SITE_* 占位（用于已经手动 read 的字符串）
 */

// 文本节点 / 属性值通用转义。autoSpacing/autoLineBreak 之后调用。
function escapeText(value) {
    return shared.escapeHtml(value == null ? '' : String(value));
}

// URL 字段：保留原样（不破坏 ?a=b&c=d 中的 &），但去掉危险的 javascript:/data: scheme。
function safeUrl(value) {
    const raw = String(value == null ? '' : value).trim();
    if (!raw) return '';
    // 仅允许 http/https/相对路径/根路径，其它（javascript:、data:、file: 等）拒绝
    if (/^(https?:)?\/\//i.test(raw)) return raw;
    if (raw.startsWith('/') || raw.startsWith('./') || raw.startsWith('../')) return raw;
    if (/^[a-zA-Z]/.test(raw) && !raw.includes(':')) return raw; // 普通文件名
    return '';
}

function autoLineBreak(text) {
    if (!text) return '';
    return text.replace(/([\.。])\s*(?=[^ \.。\n\r\t<])/g, '$1<br />');
}

function generateThemeScript(siteConfig) {
    let defaultTheme = 'system';
    if (siteConfig.theme_dark === true) defaultTheme = 'dark';
    else if (siteConfig.theme_light === true) defaultTheme = 'light';
    else if (siteConfig.theme_system === true || siteConfig.default_theme === 'system') defaultTheme = 'system';
    else if (siteConfig.default_theme) defaultTheme = siteConfig.default_theme;

    if (defaultTheme === 'dark') {
        return `(function () {
            var saved = localStorage.getItem('theme');
            if (saved === 'light') {
                // 用户选择了浅色模式
            } else {
                document.documentElement.classList.add('dark');
            }
        })();`;
    }
    if (defaultTheme === 'light') {
        return `(function () {
            var saved = localStorage.getItem('theme');
            if (saved === 'dark') {
                document.documentElement.classList.add('dark');
            }
        })();`;
    }
    // system 默认
    return `(function () {
            var saved = localStorage.getItem('theme');
            var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (saved === 'dark' || (!saved && prefersDark)) {
                document.documentElement.classList.add('dark');
            }
        })();`;
}

function generateLogoIcon(siteConfig) {
    const defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><title>quill-pen-ai-fill</title><path d="m4.713 7.128l-.246.566a.506.506 0 0 1-.934 0l-.246-.566a4.36 4.36 0 0 0-2.22-2.25l-.759-.339a.53.53 0 0 1 0-.963l.717-.319A4.37 4.37 0 0 0 3.276.931L3.53.32a.506.506 0 0 1 .942 0l.253.61a4.37 4.37 0 0 0 2.25 2.327l.718.32a.53.53 0 0 1 0 .962l-.76.338a4.36 4.36 0 0 0-2.219 2.251m-1.65 14.485C4.09 15.422 6.312 1.997 21 1.997c-1.496 3-2.5 4.5-3.5 5.5l-1 1l1.5 1c-1 3-4 6.5-8 7q-4.003.5-5.002 5.5H3z"/></svg>`;

    const logoUrl = siteConfig.site_logo_icon && String(siteConfig.site_logo_icon).trim();
    if (logoUrl && /^https?:\/\//i.test(logoUrl)) {
        // 安全：仅 http/https，shared.escapeHtml 转义属性值
        return `<img src="${shared.escapeHtml(logoUrl)}" class="w-full h-full object-contain" alt="Logo" />`;
    }
    return defaultIcon;
}

function generateSocialLinks(socialConfig) {
    const platforms = SOCIAL_PLATFORM_ORDER.map(name => ({
        name,
        enabled: socialConfig[`${name}_enabled`],
        icon: socialConfig[`${name}_icon`],
        url: socialConfig[`${name}_url`]
    }));

    const enabled = platforms.filter(p => p.enabled);
    if (enabled.length === 0) return '<!-- No social links enabled -->';

    return enabled.map(platform => {
        const capitalizedName = platform.name.charAt(0).toUpperCase() + platform.name.slice(1);
        const rawUrl = String(platform.url || '').trim();
        // 仅放行 http(s) / mailto / tel；其它（含 javascript:）一律置为 #
        const safeHref = /^(https?:|mailto:|tel:)/i.test(rawUrl) ? shared.escapeHtml(rawUrl) : '#';
        const safeAria = shared.escapeHtml(capitalizedName);
        // platform.icon 来自 social-defaults.js（受信任的 SVG 字符串）或用户配置的 URL；
        // 若用户配置 *_icon 为 URL，generateSocialLinks 不在此处理图片（保持现有行为）
        return `<a class="block w-6 h-6 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors duration-150"
                href="${safeHref}"
                aria-label="${safeAria}"
                target="_blank"
                rel="noopener noreferrer">
                ${platform.icon}
            </a>`;
    }).join('\n            ');
}

function injectPartials(html, partialsCache, partialsDir) {
    // 反复替换直到没有 INCLUDE 占位（支持 partial 内嵌套 INCLUDE）
    const placeholderRe = /<!--\s*INCLUDE:([a-zA-Z0-9_\-]+)\s*-->/g;
    let prev = null;
    let current = html;
    let depth = 0;
    while (prev !== current) {
        prev = current;
        current = current.replace(placeholderRe, (match, name) => {
            if (partialsCache.has(name)) return partialsCache.get(name);
            const file = path.join(partialsDir, `${name}.html`);
            if (!fs.existsSync(file)) {
                console.warn(`⚠️  partial not found: ${name} (${file})`);
                partialsCache.set(name, match);
                return match;
            }
            const content = fs.readFileSync(file, 'utf-8');
            partialsCache.set(name, content);
            return content;
        });
        depth++;
        if (depth > 10) {
            throw new Error('partial inclusion exceeded depth 10 — possible cyclic include');
        }
    }
    return current;
}

function loadPartialsCache(partialsDir) {
    const cache = new Map();
    if (!fs.existsSync(partialsDir)) return cache;
    for (const name of fs.readdirSync(partialsDir)) {
        if (!name.endsWith('.html')) continue;
        const key = name.replace(/\.html$/, '');
        cache.set(key, fs.readFileSync(path.join(partialsDir, name), 'utf-8'));
    }
    return cache;
}

function createEngine({ templatesDir, partialsDir, siteConfig, socialConfig }) {
    const themeScript = generateThemeScript(siteConfig);
    const logoIcon = generateLogoIcon(siteConfig);
    const socialLinks = generateSocialLinks(socialConfig);
    const partialsCache = loadPartialsCache(partialsDir);

    function applySiteConfig(template) {
        // 文本字段（出现在 HTML 文本节点 / title / meta content 中）必须 escape
        // URL 字段走 safeUrl 拦截危险 scheme，再做属性转义
        // hero_title / hero_subtitle 经过 autoSpacing → escapeText → autoLineBreak（后者只插 <br/>，安全）
        const safeFavicon = escapeText(safeUrl(siteConfig.site_favicon));
        const safeAvatar = escapeText(safeUrl(siteConfig.hero_avatar));
        const safeUrlField = escapeText(safeUrl(siteConfig.site_url));
        return template
            .replace(/<!-- SITE_TITLE -->/g, escapeText(autoSpacing(siteConfig.site_title)))
            .replace(/<!-- SITE_NAME -->/g, escapeText(autoSpacing(siteConfig.site_name)))
            .replace(/<!-- FOOTER_COPYRIGHT -->/g, escapeText(autoSpacing(siteConfig.footer_copyright)))
            .replace(/<!-- HERO_TITLE -->/g, autoLineBreak(escapeText(autoSpacing(siteConfig.hero_title))))
            .replace(/<!-- HERO_SUBTITLE -->/g, autoLineBreak(escapeText(autoSpacing(siteConfig.hero_subtitle))))
            .replace(/<!-- HERO_AVATAR -->/g, safeAvatar)
            .replace(/<!-- SITE_FAVICON -->/g, safeFavicon)
            .replace(/<!-- SITE_LOGO_ICON -->/g, logoIcon)
            .replace(/<!-- THEME_SCRIPT -->/g, themeScript)
            .replace(/<!-- SOCIAL_LINKS -->/g, socialLinks)
            .replace(/<!-- SITE_URL -->/g, safeUrlField);
    }

    function loadTemplate(filename) {
        let tpl = fs.readFileSync(path.join(templatesDir, filename), 'utf-8');
        tpl = injectPartials(tpl, partialsCache, partialsDir);
        tpl = applySiteConfig(tpl);
        return tpl;
    }

    return { loadTemplate, applySiteConfig, generateSocialLinks: () => socialLinks, shared };
}

module.exports = { createEngine, generateThemeScript, generateLogoIcon, generateSocialLinks, injectPartials, autoLineBreak };
