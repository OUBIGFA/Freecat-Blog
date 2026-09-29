const fs = require('fs');
const path = require('path');
const { renderPostCardForList } = require('./index.js');
const seo = require('../seo.js');
const { replacePlaceholders } = require('../template-engine.js');

/**
 * 生成 all.html（无分页，按已有顺序展示全部文章）。
 */
function generate({ posts, template, siteConfig, seoConfig, outputDir }) {
    console.log('📋 Generating all articles page...');
    // 与首页共用阅读条目，三栏只改变排版，不另建标题、日期或标签样式。
    const html = posts
        .map((post, index) => renderPostCardForList(post, index, { layout: 'reading-list' }))
        .join('');
    const title = `All Articles - ${siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog'}`;
    const seoHead = seo.renderHeadTags({
        title,
        description: `All articles from ${siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog'}.`,
        canonicalPath: '/all',
        siteConfig,
        seoConfig,
        image: seo.defaultImage(siteConfig, seoConfig)
    });
    const out = replacePlaceholders(template, [
        ['<!-- ALL_SEO_HEAD -->', seoHead],
        ['<!-- ALL_POST_COUNT -->', String(posts.length)],
        ['<!-- ALL_POSTS_LIST_PLACEHOLDER -->', html]
    ]);
    fs.writeFileSync(path.join(outputDir, 'all.html'), out, 'utf-8');
    console.log('  Generated: all.html');
}

module.exports = { generate };
