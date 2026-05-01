const fs = require('fs');
const path = require('path');
const { stripMarkdown } = require('../markdown.js');

/**
 * 生成搜索索引 (search-index.json) + 搜索页 (search.html)。
 */
function generate({ posts, template, outputDir }) {
    console.log('🔍 Generating search index...');
    const searchIndex = posts.map(post => ({
        title: post.title,
        slug: post.slug,
        date: post.date.tz('Asia/Shanghai').format('YYYY-MM-DD'),
        excerpt: post.excerpt,
        content: stripMarkdown(post.content),
        tags: Array.isArray(post.tag) ? post.tag : (post.tag ? [post.tag] : []),
        link: post.link,
        cover: post.cover,
        pinned: post.pinned,
        modifiedDate: post.modifiedDate.tz('Asia/Shanghai').format('YYYY-MM-DD')
    }));

    fs.writeFileSync(
        path.join(outputDir, 'search-index.json'),
        JSON.stringify(searchIndex, null, 2)
    );
    console.log('  Generated: search-index.json');

    console.log('🔎 Generating search page...');
    fs.writeFileSync(path.join(outputDir, 'search.html'), template);
    console.log('  Generated: search.html');
}

module.exports = { generate };
