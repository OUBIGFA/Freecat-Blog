const fs = require('fs');
const path = require('path');
const shared = require('../src/assets/shared.js');
const seo = require('./seo.js');
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
    const reloadScrollGuard = `try {
            var navEntries = performance && performance.getEntriesByType ? performance.getEntriesByType('navigation') : null;
            var isReload = navEntries && navEntries[0] && navEntries[0].type === 'reload';
            if (isReload && 'scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
                var resetReloadScroll = function () {
                    if (window.scrollY !== 0) window.scrollTo(0, 0);
                };
                resetReloadScroll();
                requestAnimationFrame(resetReloadScroll);
                setTimeout(resetReloadScroll, 0);
                setTimeout(resetReloadScroll, 50);
                window.addEventListener('DOMContentLoaded', resetReloadScroll, { once: true });
                window.addEventListener('pageshow', resetReloadScroll, { once: true });
                window.addEventListener('load', resetReloadScroll, { once: true });
            }
        } catch (e) {}`;
    let defaultTheme = 'system';
    if (siteConfig.theme_dark === true) defaultTheme = 'dark';
    else if (siteConfig.theme_light === true) defaultTheme = 'light';
    else if (siteConfig.theme_system === true || siteConfig.default_theme === 'system') defaultTheme = 'system';
    else if (siteConfig.default_theme) defaultTheme = siteConfig.default_theme;

    if (defaultTheme === 'dark') {
        return `(function () {
            ${reloadScrollGuard}
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
            ${reloadScrollGuard}
            var saved = localStorage.getItem('theme');
            if (saved === 'dark') {
                document.documentElement.classList.add('dark');
            }
        })();`;
    }
    // system 默认
    return `(function () {
            ${reloadScrollGuard}
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

function shouldRenderSocialPlatform(platform, siteConfig) {
    if (!platform.enabled) return false;
    if (platform.name !== 'rss') return true;

    const rawUrl = String(platform.url || '').trim();
    if (/^https?:\/\//i.test(rawUrl)) return true;
    return !!seo.normalizeBaseUrl(siteConfig);
}

function generateSocialLinks(socialConfig, siteConfig) {
    const platforms = SOCIAL_PLATFORM_ORDER.map(name => ({
        name,
        enabled: socialConfig[`${name}_enabled`],
        iconUrl: socialConfig[`${name}_icon_url`],
        iconSvg: socialConfig[`${name}_icon`],
        url: socialConfig[`${name}_url`]
    }));

    const enabled = platforms.filter(platform => shouldRenderSocialPlatform(platform, siteConfig));
    if (enabled.length === 0) return '<!-- No social links enabled -->';

    return enabled.map(platform => {
        const capitalizedName = platform.name.charAt(0).toUpperCase() + platform.name.slice(1);
        const rawUrl = String(platform.url || '').trim();
        // 放行 http(s) / mailto / tel / 同站根相对路径（单 / 开头但非 //）；其它（含 javascript:）一律置为 #
        const safeHref = /^(https?:|mailto:|tel:)/i.test(rawUrl) || /^\/(?!\/)/.test(rawUrl)
            ? shared.escapeHtml(rawUrl)
            : '#';
        const safeAria = shared.escapeHtml(capitalizedName);
        // 图标渲染：用户在 Control/social_社交媒体.md 填了 *_icon_url 且是合法 URL（http(s) / 同站根路径）→ 渲染成 <img>；
        // 否则回退到 SOCIAL_DEFAULTS 提供的内置 SVG（platform.iconSvg）。
        const rawIconUrl = String(platform.iconUrl || '').trim();
        const isSafeIconUrl = rawIconUrl && (/^https?:\/\//i.test(rawIconUrl) || /^\/(?!\/)/.test(rawIconUrl));
        const iconHtml = isSafeIconUrl
            ? `<img src="${shared.escapeHtml(rawIconUrl)}" alt="${safeAria}" class="w-full h-full object-contain" loading="lazy" />`
            : platform.iconSvg;
        return `<a class="block w-6 h-6 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-[color,opacity] duration-300 ease-out hover:opacity-95"
                href="${safeHref}"
                aria-label="${safeAria}"
                target="_blank"
                rel="noopener noreferrer">
                ${iconHtml}
            </a>`;
    }).join('\n            ');
}

function generateDiscoveryLinks(siteConfig) {
    if (!seo.normalizeBaseUrl(siteConfig)) return '';
    const title = escapeText(siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog');
    return [
        `<!-- RSS / 站内搜索自动发现：让 RSS 阅读器与浏览器自动识别站点的订阅与搜索能力 -->`,
        `<link rel="alternate" type="application/rss+xml" title="${title}" href="/feed.xml" />`,
        `<link rel="search" type="application/opensearchdescription+xml" title="${title}" href="/opensearch.xml" />`
    ].join('\n');
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

// 字符串安全替换：把用户内容直接当字面量塞进模板。
//
// JS 的 String.prototype.replace(needle, str) 会把第二参数里的
// $&、$$、$`、$'、$1–$9 解释为反向引用 / 替换字面量。当 value 来自
// 用户文章（数学公式、价格表、随手写的 $1）时会被静默破坏。
// 改用函数形式后，返回值原样写入，绝不解析。
//
// marker 支持字符串（替换首个匹配）或带 /g 的正则（替换全部）。
function replacePlaceholder(template, marker, value) {
    const literalValue = value == null ? '' : String(value);
    return template.replace(marker, () => literalValue);
}

function versionAssetUrls(html, assetVersion) {
    if (!assetVersion) return html;
    const encodedVersion = encodeURIComponent(String(assetVersion));
    return html.replace(
        /((?:href|src)=["'](?:\.\/|\.\.\/)assets\/[^"'\?#]+)(\?[^"']*)?(["'])/g,
        (match, assetPath, query, quote) => {
            const separator = query ? `${query}&` : '?';
            return `${assetPath}${separator}v=${encodedVersion}${quote}`;
        }
    );
}

function createEngine({ templatesDir, partialsDir, siteConfig, seoConfig = {}, socialConfig, assetVersion, tagMenuItemsHtml = '' }) {
    const themeScript = generateThemeScript(siteConfig);
    const logoIcon = generateLogoIcon(siteConfig);
    const socialLinks = generateSocialLinks(socialConfig, siteConfig);
    const discoveryLinks = generateDiscoveryLinks(siteConfig);
    const partialsCache = loadPartialsCache(partialsDir);

    function applySiteConfig(template) {
        // 文本字段（出现在 HTML 文本节点 / title / meta content 中）必须 escape
        // URL 字段走 safeUrl 拦截危险 scheme，再做属性转义
        // hero_title / hero_subtitle 经过 autoSpacing → escapeText → autoLineBreak（后者只插 <br/>，安全）
        // 所有 replace 通过 replacePlaceholder 走函数形式，避免用户内容里的 $& / $1 被解释。
        const safeFavicon = escapeText(safeUrl(siteConfig.site_favicon));
        const safeAvatar = escapeText(safeUrl(siteConfig.hero_avatar));
        const safeUrlField = escapeText(safeUrl(siteConfig.site_url));
        let out = template;
        out = replacePlaceholder(out, /<!-- SITE_TITLE -->/g, escapeText(autoSpacing(siteConfig.site_title)));
        out = replacePlaceholder(out, /<!-- SITE_NAME -->/g, escapeText(autoSpacing(siteConfig.site_name)));
        out = replacePlaceholder(out, /<!-- FOOTER_COPYRIGHT -->/g, escapeText(autoSpacing(siteConfig.footer_copyright)));
        out = replacePlaceholder(out, /<!-- HERO_TITLE -->/g, autoLineBreak(escapeText(autoSpacing(siteConfig.hero_title))));
        out = replacePlaceholder(out, /<!-- HERO_SUBTITLE -->/g, autoLineBreak(escapeText(autoSpacing(siteConfig.hero_subtitle))));
        out = replacePlaceholder(out, /<!-- HERO_AVATAR -->/g, safeAvatar);
        out = replacePlaceholder(out, /<!-- SITE_FAVICON -->/g, safeFavicon);
        out = replacePlaceholder(out, /<!-- SITE_LOGO_ICON -->/g, logoIcon);
        out = replacePlaceholder(out, /<!-- THEME_SCRIPT -->/g, themeScript);
        out = replacePlaceholder(out, /<!-- SOCIAL_LINKS -->/g, socialLinks);
        out = replacePlaceholder(out, /<!-- TAG_MENU_ITEMS -->/g, tagMenuItemsHtml);
        out = replacePlaceholder(out, /<!-- DISCOVERY_LINKS -->/g, discoveryLinks);
        out = replacePlaceholder(out, /<!-- SITE_LANGUAGE -->/g, escapeText(seoConfig.site_language || 'zh-CN'));
        out = replacePlaceholder(out, /<!-- SITE_URL -->/g, safeUrlField);
        return out;
    }

    function loadTemplate(filename) {
        let tpl = fs.readFileSync(path.join(templatesDir, filename), 'utf-8');
        tpl = injectPartials(tpl, partialsCache, partialsDir);
        tpl = applySiteConfig(tpl);
        tpl = versionAssetUrls(tpl, assetVersion);
        return tpl;
    }

    return { loadTemplate, applySiteConfig, generateSocialLinks: () => socialLinks, shared };
}

module.exports = { createEngine, autoLineBreak };
