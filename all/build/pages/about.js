const fs = require('fs');
const path = require('path');
const shared = require('../../src/assets/shared.js');
const { autoSpacing, applyParagraphAlignment } = require('../markdown.js');
const { autoLineBreak } = require('../template-engine.js');

/**
 * 生成 about.html。
 *
 * About 页面优先使用 about_关于页面.md 中的字段，
 * 缺失时回落到 site_网站属性.md 的 hero_* 字段。
 */
function generate({ template, siteConfig, aboutConfig, outputDir }) {
    console.log('👤 Generating about page...');
    const finalTitle = aboutConfig.about_hero_title || siteConfig.hero_title;
    const finalSubtitle = aboutConfig.about_hero_subtitle || siteConfig.hero_subtitle;
    const finalAvatar = aboutConfig.about_hero_avatar || siteConfig.hero_avatar;

    const html = template
        .replace(/<!-- ABOUT_HERO_TITLE -->/g, autoLineBreak(shared.escapeHtml(autoSpacing(finalTitle))))
        .replace(/<!-- ABOUT_HERO_SUBTITLE -->/g, autoLineBreak(shared.escapeHtml(autoSpacing(finalSubtitle))))
        .replace(/<!-- ABOUT_HERO_AVATAR -->/g, shared.escapeHtml(String(finalAvatar || '')));

    fs.writeFileSync(path.join(outputDir, 'about.html'), html);
    console.log('  Generated: about.html');
}

module.exports = { generate };
