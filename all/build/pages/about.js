const fs = require('fs');
const path = require('path');
const shared = require('../../shared/shared.js');
const { autoSpacing } = require('../markdown.js');
const { autoLineBreak } = require('../template-engine.js');
const seo = require('../seo.js');

/**
 * 生成 about.html。
 *
 * About 页面优先使用 about_关于页面.md 中的字段，
 * 缺失时回落到 site_网站属性.md 的 hero_* 字段。
 */
function generate({ template, siteConfig, seoConfig, aboutConfig, outputDir }) {
    console.log('👤 Generating about page...');
    const finalTitle = aboutConfig.about_hero_title || siteConfig.hero_title;
    const finalSubtitle = aboutConfig.about_hero_subtitle || siteConfig.hero_subtitle;
    const finalAvatar = aboutConfig.about_hero_avatar || siteConfig.hero_avatar;

    const title = `About - ${siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog'}`;
    const canonicalPath = '/about.html';
    const canonical = seo.pageUrl(siteConfig, canonicalPath);
    const seoHead = seo.renderHeadTags({
        title,
        description: seo.stripHtml(finalSubtitle || seo.defaultDescription(siteConfig, seoConfig)),
        canonicalPath,
        siteConfig,
        seoConfig,
        image: finalAvatar || seo.defaultImage(siteConfig, seoConfig)
    });
    const jsonLd = seo.renderAboutJsonLd({ siteConfig, seoConfig, aboutConfig, canonical });

    const html = template
        .replace('<!-- ABOUT_SEO_HEAD -->', () => seoHead)
        .replace('<!-- ABOUT_JSONLD -->', () => jsonLd)
        .replace(/<!-- ABOUT_HERO_TITLE -->/g, () => autoLineBreak(shared.escapeHtml(autoSpacing(finalTitle))))
        .replace(/<!-- ABOUT_HERO_SUBTITLE -->/g, () => autoLineBreak(shared.escapeHtml(autoSpacing(finalSubtitle))))
        .replace(/<!-- ABOUT_HERO_AVATAR -->/g, () => shared.escapeHtml(String(finalAvatar || '')));

    fs.writeFileSync(path.join(outputDir, 'about.html'), html, 'utf-8');
    console.log('  Generated: about.html');
}

module.exports = { generate };
