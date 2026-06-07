const fs = require('fs');
const path = require('path');
const shared = require('../../src/assets/shared.js');
const seo = require('../seo.js');

/**
 * 生成外壳页 index.html（服务于 `/`）。
 *
 * 外壳是一份常驻、永不导航的顶层文档：顶栏（含音频播放器与 <audio>）+ 满视口 iframe。
 * 正文页在 iframe 内做真实整页导航，外壳不被销毁 → 顶栏音频真正无缝不断。
 *
 * SEO：外壳作为站点主页（canonical `/`）承载 WebSite 结构化数据；
 * 正文真实独立页（/home.html、/posts/*.html…）仍各自带 canonical 并进 sitemap，
 * 保证搜索引擎收录的是真实内容页。
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

    const html = template
        .replace('<!-- SHELL_SEO_HEAD -->', () => seoHead)
        .replace('<!-- SHELL_JSONLD -->', () => jsonLd);

    fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf-8');
    console.log('  Generated: index.html (shell)');
}

module.exports = { generate };
