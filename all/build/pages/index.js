const fs = require('fs');
const path = require('path');
const shared = require('../../src/assets/shared.js');
const postCardTemplate = require('../../src/assets/post-card-template.js');
const { generatePaginationHtml } = require('../pagination.js');

/**
 * 渲染分页首页（index.html + page/N/index.html）。
 */
function renderPostCardForList(post) {
    const tags = Array.isArray(post.tag) ? post.tag : (post.tag ? [post.tag] : []);
    // 首页 / 全部页 使用带 dark hover 的 tag 风格（与原有视觉一致）
    const tagsHtml = tags.map(t => shared.renderTagSpan(t, { darkHover: true })).join('');

    return postCardTemplate.renderPostCard({
        link: post.link,
        titleHtml: shared.processTitleHtml(post.title),
        excerptHtml: post.excerpt,
        date: post.date.tz('Asia/Shanghai').format('YYYY-MM-DD'),
        modifiedDate: post.modifiedDate.tz('Asia/Shanghai').format('YYYY-MM-DD'),
        tagsHtml,
        cover: post.cover,
        pinned: post.pinned
    });
}

function renderViewAllLink(totalPages) {
    if (totalPages <= 1) return '';
    return `
            <a href="/all.html" class="flex items-center gap-2 h-10 text-gray-700 dark:text-gray-300 -mb-2">
                <span class="text-sm font-bold">View All</span>
                <svg class="text-xl t-btn-arrow-next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path></svg>
            </a>`;
}

function generateAll({ posts, template, postsPerPage, outputDir }) {
    const totalPages = postsPerPage === 0 ? 1 : Math.ceil(posts.length / postsPerPage);

    for (let page = 1; page <= totalPages; page++) {
        const start = (page - 1) * postsPerPage;
        const pagePosts = postsPerPage === 0 ? posts : posts.slice(start, start + postsPerPage);

        const postsHtml = pagePosts.map(renderPostCardForList).join('');
        const paginationBtns = generatePaginationHtml(page, totalPages);

        const outputHtml = template
            .replace('<!-- POSTS_LIST_PLACEHOLDER -->', postsHtml)
            .replace('<!-- PAGINATION_BUTTONS_PLACEHOLDER -->', paginationBtns)
            .replace('<!-- PAGINATION_PLACEHOLDER -->', renderViewAllLink(totalPages));

        if (page === 1) {
            fs.writeFileSync(path.join(outputDir, 'index.html'), outputHtml);
        } else {
            const pageDir = path.join(outputDir, 'page', String(page));
            if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
            // 分页页面位于 /page/N/index.html，比 dist 根多一层目录。
            // partials/head-base.html 与 partials/scripts-end.html 里的资源
            // 用的是 ./assets/... 这种相对路径，对根目录 index.html 解析为
            // /assets/...（OK），但在 /page/N/ 下会被解析成 /page/N/assets/...
            // 直接刷新该 URL 时 CSS/JS 全部 404，首屏崩溃；
            // 这里把这些相对引用矫正成 ../../assets/...，让刷新也能正常加载。
            const adjustedHtml = outputHtml.replace(/(['"])\.\/assets\//g, '$1../../assets/');
            fs.writeFileSync(path.join(pageDir, 'index.html'), adjustedHtml);
        }
    }
}

module.exports = { generateAll, renderPostCardForList };
