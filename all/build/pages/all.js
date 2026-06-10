const fs = require('fs');
const path = require('path');
const { renderPostCardForList } = require('./index.js');
const postCardTemplate = require('../../shared/post-card-template.js');
const seo = require('../seo.js');
const { replacePlaceholders } = require('../template-engine.js');

/**
 * 生成 all.html（无分页，按已有顺序展示全部文章）。
 */
function generate({ posts, template, siteConfig, seoConfig, outputDir }) {
    console.log('📋 Generating all articles page...');
    const html = posts
        .map((post, index) => renderPostCardForList(post, index, {
            ...postCardTemplate.ALL_PAGE_MOBILE_CARD_OPTIONS,
            animationDelayStep: 50,
            layout: 'compact-grid'
        }))
        .join('');
    const title = `All Articles - ${siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog'}`;
    const seoHead = seo.renderHeadTags({
        title,
        description: `All articles from ${siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog'}.`,
        canonicalPath: '/all.html',
        siteConfig,
        seoConfig,
        image: seo.defaultImage(siteConfig, seoConfig)
    });
    const out = replacePlaceholders(template, [
        ['<!-- ALL_SEO_HEAD -->', seoHead],
        ['<!-- ALL_POSTS_LIST_PLACEHOLDER -->', html]
    ]);
    fs.writeFileSync(path.join(outputDir, 'all.html'), out, 'utf-8');
    console.log('  Generated: all.html');
}

module.exports = { generate };
