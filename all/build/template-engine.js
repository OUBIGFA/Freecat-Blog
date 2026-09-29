const fs = require('fs');
const path = require('path');
const shared = require('../shared/shared.js');
const seo = require('./seo.js');
const { autoSpacing, parseImageStyleAudioList } = require('./markdown.js');
const { SOCIAL_PLATFORM_ORDER } = require('./social-defaults.js');
const { renderIcon } = require('./icons.js');

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
    // 初始滚动守卫，内联进每个页面（含外壳）的 <head>：
    //   - 内容页/独立页：全新访问（navigate/reload）时把初始滚动钉在顶部，
    //     有锚点或外壳恢复请求时让位。
    //   - 外壳文档（window.__FREECAT_SHELL_DOCUMENT__，由 template_shell.html
    //     首个脚本在本守卫之前设置）：自身不滚动，只把本次跨文档导航类型
    //     翻译成 iframe 的滚动恢复握手 —— back_forward（浏览器返回/前进、
    //     bfcache 失效后的跨文档返回）写入恢复请求；navigate/reload 是全新
    //     访问，清掉同 key 的残留请求，避免旧请求让新访问错误恢复。
    //     必须在 <head> 解析期完成，保证先于 iframe 内容页读取 sessionStorage。
    const initialScrollGuard = `if (window.self !== window.top) { try { document.documentElement.classList.add('freecat-framed'); } catch (e) {} }
        try {
            var navEntries = performance && performance.getEntriesByType ? performance.getEntriesByType('navigation') : null;
            var navType = navEntries && navEntries[0] && navEntries[0].type;
            var hasAnchorTarget = window.location.hash && window.location.hash.length > 1;
            var normalizeScrollPageKey = ${shared.normalizeScrollPageKey.toString()};
            var shellRestorePageKey = normalizeScrollPageKey(window.location.pathname, window.location.search);
            var shellRestoreRequests = null;
            try {
                shellRestoreRequests = JSON.parse(sessionStorage.getItem('freecat-scroll-restore-requests-v1') || '{}');
            } catch (e) {
                shellRestoreRequests = null;
            }
            if (!shellRestoreRequests || typeof shellRestoreRequests !== 'object') shellRestoreRequests = {};
            if (window.__FREECAT_SHELL_DOCUMENT__) {
                try {
                    if (navType === 'back_forward') {
                        shellRestoreRequests[shellRestorePageKey] = Date.now();
                        sessionStorage.setItem('freecat-scroll-restore-requests-v1', JSON.stringify(shellRestoreRequests));
                    } else if ((navType === 'navigate' || navType === 'reload') && shellRestoreRequests[shellRestorePageKey]) {
                        delete shellRestoreRequests[shellRestorePageKey];
                        sessionStorage.setItem('freecat-scroll-restore-requests-v1', JSON.stringify(shellRestoreRequests));
                    }
                } catch (e) {}
            }
            var hasShellRestoreRequest = !!shellRestoreRequests[shellRestorePageKey];
            var shouldResetInitialScroll = !window.__FREECAT_SHELL_DOCUMENT__ && !hasAnchorTarget && !hasShellRestoreRequest && (!navType || navType === 'navigate' || navType === 'reload');
            if (shouldResetInitialScroll && 'scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
                var userScrollIntent = false;
                var cancelInitialScrollReset = function () {
                    userScrollIntent = true;
                    window.removeEventListener('wheel', cancelInitialScrollReset);
                    window.removeEventListener('touchstart', cancelInitialScrollReset);
                    window.removeEventListener('pointerdown', cancelInitialScrollReset);
                    window.removeEventListener('keydown', cancelInitialScrollReset);
                };
                var resetInitialScroll = function () {
                    if (userScrollIntent) return;
                    if (window.scrollY !== 0) window.scrollTo(0, 0);
                };
                window.addEventListener('wheel', cancelInitialScrollReset, { passive: true });
                window.addEventListener('touchstart', cancelInitialScrollReset, { passive: true });
                window.addEventListener('pointerdown', cancelInitialScrollReset, { passive: true });
                window.addEventListener('keydown', cancelInitialScrollReset);
                resetInitialScroll();
                requestAnimationFrame(resetInitialScroll);
                setTimeout(resetInitialScroll, 0);
                setTimeout(resetInitialScroll, 50);
                window.addEventListener('DOMContentLoaded', resetInitialScroll, { once: true });
                window.addEventListener('pageshow', resetInitialScroll, { once: true });
                window.addEventListener('load', resetInitialScroll, { once: true });
            }
        } catch (e) {}`;
    let defaultTheme = 'system';
    if (siteConfig.theme_dark === true) defaultTheme = 'dark';
    else if (siteConfig.theme_light === true) defaultTheme = 'light';
    else if (siteConfig.theme_system === true || siteConfig.default_theme === 'system') defaultTheme = 'system';
    else if (siteConfig.default_theme) defaultTheme = siteConfig.default_theme;

    if (defaultTheme === 'dark') {
        return `(function () {
            ${initialScrollGuard}
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
            ${initialScrollGuard}
            var saved = localStorage.getItem('theme');
            if (saved === 'dark') {
                document.documentElement.classList.add('dark');
            }
        })();`;
    }
    // system 默认
    return `(function () {
            ${initialScrollGuard}
            var saved = localStorage.getItem('theme');
            var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (saved === 'dark' || (!saved && prefersDark)) {
                document.documentElement.classList.add('dark');
            }
        })();`;
}

function generateShellBootstrapScript() {
    // Keep the initial document identical for visitors and renderers. Only a real
    // playback click opts into the persistent shell; no user-agent sniffing.
    return `(function () {
        if (window.self !== window.top || window.__FREECAT_SHELL_DOCUMENT__) return;
        // Keep old shared hash links working after removing the automatic shell upgrade.
        var entryPath = window.location.pathname;
        var legacy = (window.location.hash || "").slice(1);
        if ((entryPath === "/" || entryPath === "/index.html" || entryPath === "/index") && legacy.startsWith("/") && !legacy.startsWith("//")) {
            var target = new URL(legacy, window.location.origin);
            if (target.origin === window.location.origin) {
                window.location.replace(target.pathname + target.search + target.hash);
                return;
            }
        }
        var loading = false;
        document.addEventListener("click", function (event) {
            var toggle = event.target.closest && event.target.closest("#nav-audio-toggle");
            if (!toggle || !event.isTrusted || event.button !== 0) return;
            // Already playing in an independent page (autoplay): keep pause usable.
            if (toggle.getAttribute("aria-pressed") === "true") return;
            if (!window.FreecatShared) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            if (loading) return;
            loading = true;
            var originalUrl = window.location.href;
            fetch("/shell", { credentials: "same-origin", signal: AbortSignal.timeout(8000) })
                .then(function (response) {
                    if (!response.ok) throw new Error("HTTP " + response.status);
                    return response.text();
                })
                .then(function (htmlText) {
                    if (window.location.href !== originalUrl) return;
                    var shell = new DOMParser().parseFromString(htmlText, "text/html");
                    if (!shell.body || shell.body.getAttribute("data-freecat-shell-root") !== "true") {
                        throw new Error("Invalid shell response");
                    }
                    window.FreecatShared.syncPageMetadata(shell, document);
                    // Preserve the article reading position when enabling background music.
                    if (window.FreecatRuntime) window.FreecatRuntime.saveScrollPosition();
                    window.__FREECAT_START_NAV_AUDIO__ = true;
                    window.__FREECAT_SHELL_INITIAL_SCROLL__ = window.scrollY || 0;
                    document.open();
                    document.write("<!DOCTYPE html>" + shell.documentElement.outerHTML);
                    document.close();
                })
                .catch(function (error) {
                    console.warn("Continuous audio unavailable; using the page player.", error);
                    // A synthetic click reaches the existing page player without re-entering here.
                    toggle.click();
                })
                .finally(function () { loading = false; });
        }, true);
    })();`;
}

function generateLogoIcon(siteConfig) {
    const defaultIcon = renderIcon('feather');

    const logoUrl = siteConfig.site_logo_icon && String(siteConfig.site_logo_icon).trim();
    if (logoUrl && /^https?:\/\//i.test(logoUrl)) {
        // 安全：仅 http/https，shared.escapeHtml 转义属性值
        return `<img src="${shared.escapeHtml(logoUrl)}" class="w-full h-full object-contain" alt="Logo" />`;
    }
    return defaultIcon;
}

const NAV_AUDIO_IDLE_ICON = renderIcon('player-play');
const NAV_AUDIO_PLAYING_ICON = renderIcon('player-pause');

function parseBooleanControl(value) {
    if (value === true) return true;
    if (typeof value === 'string') return /^(true|yes|y|1|是|开启|开)$/i.test(value.trim());
    return false;
}

function getNavAudioPlaylist(siteConfig) {
    return parseImageStyleAudioList(siteConfig && siteConfig.nav_audio)
        .map(audio => {
            const src = normalizeNavAudioSrc(safeUrl(audio.src));
            if (!src) return null;
            return {
                src,
                title: audio.title || 'Audio'
            };
        })
        .filter(Boolean);
}

function normalizeNavAudioSrc(src) {
    if (!src) return '';
    try {
        const url = new URL(src);
        if (url.hostname.toLowerCase() === 'share.feijipan.com' && /^\/s\//i.test(url.pathname)) {
            return `https://lz.qaiu.top/parser?url=${encodeURIComponent(src)}`;
        }
    } catch (err) {}
    return src;
}

function generateNavAudioButton(siteConfig) {
    const playlist = getNavAudioPlaylist(siteConfig);
    const audio = playlist[0];
    if (!audio) return '';

    const safeSrc = escapeText(audio.src);
    const safeTitle = escapeText(audio.title);
    const safePlaylist = escapeText(JSON.stringify(playlist));
    const autoplay = parseBooleanControl(siteConfig.nav_audio_autoplay) ? 'true' : 'false';
    return `<div id="nav-audio-control" class="nav-audio-control" data-playing="false">
                <button type="button" aria-label="Play audio" aria-pressed="false"
                    class="freecat-header-action"
                    id="nav-audio-toggle"
                    data-audio-src="${safeSrc}"
                    data-audio-title="${safeTitle}"
                    data-audio-playlist="${safePlaylist}"
                    data-audio-autoplay="${autoplay}">
                    <span class="nav-audio-icon nav-audio-icon-idle" aria-hidden="true">${NAV_AUDIO_IDLE_ICON}</span>
                    <span class="nav-audio-icon nav-audio-icon-playing hidden" aria-hidden="true">${NAV_AUDIO_PLAYING_ICON}</span>
                </button>
                <div class="nav-audio-volume-slider-wrapper">
                    <input type="range" id="nav-audio-volume" class="nav-audio-volume-slider" min="0" max="1" step="0.01" value="0.5" aria-label="Audio volume">
                </div>
                <audio id="nav-audio" preload="auto" src="${safeSrc}" data-audio-title="${safeTitle}" data-audio-index="0"></audio>
            </div>`;
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

    return enabled.map((platform, index) => {
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
        return `<a class="freecat-social-link"
                href="${safeHref}"
                aria-label="${safeAria}"
                target="_blank"
                rel="noopener noreferrer"
                style="--freecat-social-index:${index}">
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

function parseAttributes(rawAttributes) {
    const attrs = {};
    const attrRe = /([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>]+))/g;
    let match;
    while ((match = attrRe.exec(rawAttributes))) {
        attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
    }
    return attrs;
}

function generateHtmlMarker(rawValue, expectedName) {
    const raw = String(rawValue || '').trim();
    if (!raw) return '';

    const metaMatch = raw.match(/^<meta\s+([^>]*?)\/?>$/i);
    if (!metaMatch) return '';

    const attrs = parseAttributes(metaMatch[1]);
    if (String(attrs.name || '').toLowerCase() !== expectedName.toLowerCase()) return '';

    const content = String(attrs.content || '').trim();
    if (!content) return '';

    return `<meta name="${shared.escapeHtml(expectedName)}" content="${shared.escapeHtml(content)}" />`;
}

function generateSearchEngineHtmlMarkers(seoConfig) {
    return [
        generateHtmlMarker(seoConfig.google_html_marker, 'google-site-verification'),
        generateHtmlMarker(seoConfig.bing_html_marker, 'msvalidate.01')
    ].filter(Boolean).join('\n');
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

function replacePlaceholders(template, replacements) {
    return replacements.reduce((out, [marker, value]) => {
        const resolvedValue = typeof value === 'function' ? value() : value;
        return replacePlaceholder(out, marker, resolvedValue);
    }, template);
}

function versionAssetUrls(html, assetVersion) {
    if (!assetVersion) return html;
    const encodedVersion = encodeURIComponent(String(assetVersion));
    const versionedHtml = html.replace(
        /((?:href|src)=["'](?:\/assets\/|\.\/assets\/|\.\.\/assets\/)[^"'\?#]+)(\?[^"']*)?(["'])/g,
        (match, assetPath, query, quote) => {
            const separator = query ? `${query}&` : '?';
            return `${assetPath}${separator}v=${encodedVersion}${quote}`;
        }
    );
    return versionedHtml.replace(
        /(url\(["']?(?:\/assets\/|\.\/assets\/|\.\.\/assets\/)[^"'\)\?#]+)(\?[^"'\)]*)?(["']?\))/g,
        (match, assetPath, query, close) => {
            const separator = query ? `${query}&` : '?';
            return `${assetPath}${separator}v=${encodedVersion}${close}`;
        }
    );
}

function createEngine({ templatesDir, partialsDir, siteConfig, seoConfig = {}, socialConfig, assetVersion, tagMenuItemsHtml = '', htmlTransform }) {
    const themeScript = generateThemeScript(siteConfig);
    const logoIcon = generateLogoIcon(siteConfig);
    const socialLinks = generateSocialLinks(socialConfig, siteConfig);
    const discoveryLinks = generateDiscoveryLinks(siteConfig);
    const searchEngineHtmlMarkers = generateSearchEngineHtmlMarkers(seoConfig);
    const navAudioButton = generateNavAudioButton(siteConfig);
    const shellBootstrapScript = generateShellBootstrapScript();
    const partialsCache = loadPartialsCache(partialsDir);
    const headerIcons = {
        HEADER_SEARCH_ICON: renderIcon('search'),
        HEADER_TAG_ICON: renderIcon('tag'),
        HEADER_SUN_ICON: renderIcon('sun', 'freecat-theme-sun'),
        HEADER_MOON_ICON: renderIcon('moon', 'freecat-theme-moon'),
        HEADER_CLOSE_ICON: renderIcon('x')
    };

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
        for (const [marker, svg] of Object.entries(headerIcons)) {
            // 同一图标可同时用于导航入口和展开后的搜索栏。
            out = replacePlaceholder(out, new RegExp('<!-- ' + marker + ' -->', 'g'), svg);
        }
        out = replacePlaceholder(out, /<!-- NAV_AUDIO_BUTTON -->/g, navAudioButton);
        out = replacePlaceholder(out, /<!-- THEME_SCRIPT -->/g, themeScript);
        out = replacePlaceholder(out, /<!-- SHELL_BOOTSTRAP_SCRIPT -->/g, shellBootstrapScript);
        out = replacePlaceholder(out, /<!-- SOCIAL_LINKS -->/g, socialLinks);
        out = replacePlaceholder(out, /<!-- TAG_MENU_ITEMS -->/g, tagMenuItemsHtml);
        out = replacePlaceholder(out, /<!-- DISCOVERY_LINKS -->/g, discoveryLinks);
        out = replacePlaceholder(out, /<!-- SEARCH_ENGINE_HTML_MARKERS -->/g, searchEngineHtmlMarkers);
        out = replacePlaceholder(out, /<!-- SITE_LANGUAGE -->/g, escapeText(seoConfig.site_language || 'zh-CN'));
        out = replacePlaceholder(out, /<!-- SITE_URL -->/g, safeUrlField);
        return out;
    }

    function loadTemplate(filename) {
        let tpl = fs.readFileSync(path.join(templatesDir, filename), 'utf-8');
        tpl = injectPartials(tpl, partialsCache, partialsDir);
        // 构建期 HTML 改写钩子（如 build/bundle.js 把多条资源引用合并为单条 bundle 引用）。
        // 必须在 versionAssetUrls 之前执行，改写后的引用才能拿到 ?v= 版本号。
        if (typeof htmlTransform === 'function') tpl = htmlTransform(tpl);
        tpl = applySiteConfig(tpl);
        tpl = versionAssetUrls(tpl, assetVersion);
        return tpl;
    }

    return { loadTemplate, applySiteConfig, generateSocialLinks: () => socialLinks, shared };
}

module.exports = { createEngine, autoLineBreak, replacePlaceholder, replacePlaceholders, generateShellBootstrapScript };
