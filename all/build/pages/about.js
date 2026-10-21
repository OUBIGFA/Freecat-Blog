const fs = require('fs');
const path = require('path');
const shared = require('../../shared/shared.js');
const { autoSpacing } = require('../markdown.js');
const { autoLineBreak, replacePlaceholders } = require('../template-engine.js');
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

    const isHomepage = siteConfig.home_page === 'about';
    const siteTitle = siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog';
    const title = isHomepage ? siteTitle : `About - ${siteTitle}`;
    // 保留 /about 旧链接；作为首页时统一 canonical 到 /，不制造两个可收录副本。
    const canonicalPath = isHomepage ? '/' : '/about';
    const canonical = seo.pageUrl(siteConfig, canonicalPath);
    const seoHead = seo.renderHeadTags({
        title,
        description: seo.stripHtml(finalSubtitle || seo.defaultDescription(siteConfig, seoConfig)),
        canonicalPath,
        siteConfig,
        seoConfig,
        image: finalAvatar || seo.defaultImage(siteConfig, seoConfig)
    });
    const jsonLd = seo.renderAboutJsonLd({ siteConfig, seoConfig, aboutConfig, canonical }) +
        (isHomepage ? seo.renderWebsiteJsonLd({ siteConfig, seoConfig }) : '');

    const html = replacePlaceholders(template, [
        [/<title>[\s\S]*?<\/title>/, `<title>${shared.escapeHtml(title)}</title>`],
        ['<!-- ABOUT_SEO_HEAD -->', seoHead],
        ['<!-- ABOUT_JSONLD -->', jsonLd],
        [/<!-- ABOUT_HERO_TITLE -->/g, autoLineBreak(shared.escapeHtml(autoSpacing(finalTitle)))],
        [/<!-- ABOUT_HERO_SUBTITLE -->/g, autoLineBreak(shared.escapeHtml(autoSpacing(finalSubtitle)))],
        [/<!-- ABOUT_HERO_AVATAR -->/g, shared.escapeHtml(String(finalAvatar || ''))]
    ]);

    fs.writeFileSync(path.join(outputDir, 'about.html'), html, 'utf-8');
    if (isHomepage) {
        fs.writeFileSync(path.join(outputDir, 'index.html'), html, 'utf-8');
        fs.writeFileSync(path.join(outputDir, 'home.html'), html, 'utf-8');
    }
    console.log('  Generated: about.html' + (isHomepage ? ', index.html, home.html' : ''));
}

module.exports = { generate };
