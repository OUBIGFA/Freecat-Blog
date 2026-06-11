const fs = require('fs');
const path = require('path');
const shared = require('../../shared/shared.js');
const seo = require('../seo.js');
const { replacePlaceholders } = require('../template-engine.js');

/**
 * 生成外壳页 index.html（服务于 `/`）。
 *
 * 外壳是一份常驻、永不导航的顶层文档：顶栏（含音频播放器与 <audio>）+ 满视口 iframe。
 * 正文页在 iframe 内做真实整页导航，外壳不被销毁 → 顶栏音频真正无缝不断。
 *
 * 当前选择体验优先：`/` 仍是外壳，避免首页先渲染内容再换壳。
 * 外壳作为站点主页（canonical `/`）承载 WebSite 结构化数据；真实首页内容
 * 仍输出到 /home.html，canonical 归并到 `/`，供 iframe、无 JS 和爬虫直达。
 */
function generate({ template, siteConfig, seoConfig, outputDir }) {
    console.log('🪟 Generating shell page (index.html)...');

    const title = siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog';
    const canonicalPath = '/';
    const seoHead = seo.renderHeadTags({
        title,
        description: seo.defaultDescription(siteConfig, seoConfig),
        canonicalPath,
        siteConfig,
        seoConfig,
        image: seo.defaultImage(siteConfig, seoConfig)
    });
    const jsonLd = seo.renderWebsiteJsonLd({ siteConfig, seoConfig });

    const html = replacePlaceholders(template, [
        ['<!-- SHELL_SEO_HEAD -->', seoHead],
        ['<!-- SHELL_JSONLD -->', jsonLd]
    ]);

    fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf-8');
    console.log('  Generated: index.html (shell)');
}

module.exports = { generate };
