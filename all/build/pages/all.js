const fs = require('fs');
const path = require('path');
const { renderPostCardForList } = require('./index.js');

/**
 * 生成 all.html（无分页，按已有顺序展示全部文章）。
 */
function generate({ posts, template, outputDir }) {
    console.log('📋 Generating all articles page...');
    const html = posts.map(renderPostCardForList).join('');
    const out = template.replace('<!-- ALL_POSTS_LIST_PLACEHOLDER -->', html);
    fs.writeFileSync(path.join(outputDir, 'all.html'), out);
    console.log('  Generated: all.html');
}

module.exports = { generate };
