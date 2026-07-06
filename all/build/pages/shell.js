const fs = require('fs');
const path = require('path');
const shared = require('../../shared/shared.js');
const seo = require('../seo.js');
const { replacePlaceholders } = require('../template-engine.js');

/**
 * 生成外壳页 shell.html（服务于 `/shell`）。
 *
 * 外壳是一份常驻、永不导航的顶层文档：顶栏（含音频播放器与 <audio>）+ 满视口 iframe。
 * 正文页在 iframe 内做真实整页导航，外壳不被销毁 → 顶栏音频真正无缝不断。
 *
 * SEO 取舍（2026-07 调整）：`/` 不再由外壳占据 —— 空壳首页曾导致搜索引擎
 * 在 `/` 上读不到任何内容，加上 /home canonical 归并到 `/`，整个首页簇
 * 在索引里等于消失。现在 `/` 直出真实首页内容（build/pages/index.js），
 * 外壳退到 /shell 并标记 noindex：它只是真人浏览器的运行时容器，
 * 由 SHELL_BOOTSTRAP_SCRIPT 在内容页上按需 fetch('/shell') 换壳启用。
 */
function generate({ template, siteConfig, seoConfig, outputDir }) {
    console.log('🪟 Generating shell page (shell.html)...');

    const title = siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog';
    const seoHead = seo.renderHeadTags({
        title,
        description: seo.defaultDescription(siteConfig, seoConfig),
        canonicalPath: '/shell',
        siteConfig,
        seoConfig,
        image: seo.defaultImage(siteConfig, seoConfig),
        noindex: true
    });

    const html = replacePlaceholders(template, [
        ['<!-- SHELL_SEO_HEAD -->', seoHead],
        ['<!-- SHELL_JSONLD -->', '']
    ]);

    fs.writeFileSync(path.join(outputDir, 'shell.html'), html, 'utf-8');
    console.log('  Generated: shell.html (shell)');
}

module.exports = { generate };
