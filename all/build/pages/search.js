const fs = require('fs');
const path = require('path');
const { stripMarkdown } = require('../markdown.js');
const seo = require('../seo.js');
const shared = require('../../src/assets/shared.js');

// 搜索索引每篇文章正文的截断字符数（够命中关键词，又不会让 index 文件爆炸）
const SEARCH_CONTENT_MAX_CHARS = 1500;

/**
 * 生成搜索索引 (search-index.json) + 搜索页 (search.html)。
 */
function generate({ posts, template, siteConfig, seoConfig, outputDir, recentPostsSidebarHtml }) {
    console.log('🔍 Generating search index...');
    const searchIndex = posts.map(post => {
        const stripped = stripMarkdown(post.content);
        const truncated = stripped.length > SEARCH_CONTENT_MAX_CHARS
            ? stripped.slice(0, SEARCH_CONTENT_MAX_CHARS)
            : stripped;
        return {
            title: post.title,
            slug: post.slug,
            postId: post.postId,
            date: post.date.tz('Asia/Shanghai').format('YYYY-MM-DD'),
            excerpt: post.excerpt,
            preview: post.preview || post.excerpt,
            content: truncated,
            tags: Array.isArray(post.tag) ? post.tag : (post.tag ? [post.tag] : []),
            link: shared.encodeSitePath(post.link),
            cover: post.cover,
            coverPlaceholder: post.coverPlaceholder,
            coverWidth: post.coverWidth || 0,
            coverHeight: post.coverHeight || 0,
            pinned: post.pinned,
            modifiedDate: post.modifiedDate.tz('Asia/Shanghai').format('YYYY-MM-DD')
        };
    });
    const tagPosts = searchIndex.map(post => {
        const { content, ...summary } = post;
        return summary;
    });
    const tagIndex = {
        posts: tagPosts,
        tags: {},
        untagged: []
    };

    tagPosts.forEach((post, index) => {
        const tags = Array.isArray(post.tags) ? post.tags : [];
        const seenKeys = new Set();
        tags.forEach(tag => {
            const label = String(tag == null ? '' : tag).trim();
            if (!label) return;
            const key = shared.normalizeTagKey(label);
            if (seenKeys.has(key)) return;
            seenKeys.add(key);
            if (!tagIndex.tags[key]) {
                tagIndex.tags[key] = { label, posts: [] };
            }
            tagIndex.tags[key].posts.push(index);
        });
        if (!seenKeys.size) {
            tagIndex.untagged.push(index);
        }
    });

    // 不保留缩进，节省体积
    fs.writeFileSync(
        path.join(outputDir, 'search-index.json'),
        JSON.stringify(searchIndex)
    );
    console.log('  Generated: search-index.json');
    fs.writeFileSync(
        path.join(outputDir, 'tag-index.json'),
        JSON.stringify(tagIndex)
    );
    console.log('  Generated: tag-index.json');

    console.log('🔎 Generating search page...');
    const title = `Search - ${siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog'}`;
    const seoHead = seo.renderHeadTags({
        title,
        description: `Search articles from ${siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog'}.`,
        canonicalPath: '/search.html',
        siteConfig,
        seoConfig,
        image: seo.defaultImage(siteConfig, seoConfig),
        noindex: true
    });
    fs.writeFileSync(path.join(outputDir, 'search.html'), template
        .replace('<!-- SEARCH_SEO_HEAD -->', () => seoHead)
        .replace('<!-- RECENT_POSTS_SIDEBAR_PLACEHOLDER -->', () => recentPostsSidebarHtml || ''));
    console.log('  Generated: search.html');
}

module.exports = { generate };
