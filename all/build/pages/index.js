const fs = require('fs');
const path = require('path');
const shared = require('../../src/assets/shared.js');
const postCardTemplate = require('../../src/assets/post-card-template.js');
const { generatePaginationHtml } = require('../pagination.js');
const seo = require('../seo.js');

/**
 * 渲染分页首页（index.html + page/N/index.html）。
 */
function renderPostCardForList(post, index = 0) {
    const tags = Array.isArray(post.tag) ? post.tag : (post.tag ? [post.tag] : []);
    // 首页 / 全部页 使用带 dark hover 的 tag 风格（与原有视觉一致）
    const tagsHtml = tags.map(t => shared.renderTagSpan(t, { darkHover: true })).join('');

    return postCardTemplate.renderPostCard({
        link: post.link,
        // titleHtml / excerptHtml 字段语义为"已安全的 HTML 片段"，由调用方 escape；
        // 对 title 先 escape 再 processTitleHtml（| 替换为 <span>），顺序不能反
        titleHtml: shared.processTitleHtml(shared.escapeHtml(post.title)),
        excerptHtml: shared.escapeHtml(post.preview || post.excerpt),
        date: post.date.tz('Asia/Shanghai').format('YYYY-MM-DD'),
        modifiedDate: post.modifiedDate.tz('Asia/Shanghai').format('YYYY-MM-DD'),
        sortDate: post.date.valueOf(),
        sortModifiedDate: post.modifiedDate.valueOf(),
        tagsHtml,
        cover: post.cover,
        coverPlaceholder: post.coverPlaceholder,
        coverWidth: post.coverWidth,
        coverHeight: post.coverHeight,
        pinned: post.pinned,
        animationDelay: index * 120
    });
}

function generateAll({ posts, template, postsPerPage, siteConfig, seoConfig, outputDir, recentPostsSidebarHtml }) {
    const totalPages = postsPerPage === 0 ? 1 : Math.ceil(posts.length / postsPerPage);

    for (let page = 1; page <= totalPages; page++) {
        const start = (page - 1) * postsPerPage;
        const pagePosts = postsPerPage === 0 ? posts : posts.slice(start, start + postsPerPage);

        const postsHtml = pagePosts.map(renderPostCardForList).join('');
        const paginationBtns = generatePaginationHtml(page, totalPages);
        const title = page === 1
            ? (siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog')
            : `${siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog'} - Page ${page}`;
        const canonicalPath = page === 1 ? '/' : `/page/${page}/`;
        const seoHead = seo.renderHeadTags({
            title,
            description: seo.defaultDescription(siteConfig, seoConfig),
            canonicalPath,
            siteConfig,
            seoConfig,
            image: seo.defaultImage(siteConfig, seoConfig)
        });
        const jsonLd = page === 1 ? seo.renderWebsiteJsonLd({ siteConfig, seoConfig }) : '';

        const outputHtml = template
            .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${shared.escapeHtml(title)}</title>`)
            .replace('<!-- HOME_SEO_HEAD -->', () => seoHead)
            .replace('<!-- HOME_JSONLD -->', () => jsonLd)
            .replace('<!-- POSTS_LIST_PLACEHOLDER -->', () => postsHtml)
            .replace('<!-- PAGINATION_BUTTONS_PLACEHOLDER -->', () => paginationBtns)
            .replace('<!-- PAGINATION_PLACEHOLDER -->', () => '')
            .replace('<!-- RECENT_POSTS_SIDEBAR_PLACEHOLDER -->', () => recentPostsSidebarHtml || '');

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
