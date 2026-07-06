const fs = require('fs');
const path = require('path');
const shared = require('../../shared/shared.js');
const postCardTemplate = require('../../shared/post-card-template.js');
const { generatePaginationHtml } = require('../pagination.js');
const seo = require('../seo.js');
const { replacePlaceholders } = require('../template-engine.js');
const { normalizePostTags } = require('../article-model.js');
const { getDesktopTitleLayout } = require('../post-card-title-layout.js');
const { ALL_PAGE_MOBILE_CARD_OPTIONS } = postCardTemplate;

/**
 * 渲染分页首页（index.html + page/N/index.html）。
 */
function getCardAnimationDelay(index, step = 50) {
    return Math.min(index, 10) * step;
}

function renderPostCardForList(post, index = 0, options = {}) {
    const cardOptions = { ...options };
    const tags = normalizePostTags(post);
    // 首页 / 全部页 使用带 dark hover 的 tag 风格（与原有视觉一致）
    const tagsHtml = tags.map(t => shared.renderTagSpan(t, { darkHover: true })).join('');
    const animationDelayStep = Number.isFinite(Number(cardOptions.animationDelayStep))
        ? Number(cardOptions.animationDelayStep)
        : 50;
    const previewText = post.preview || post.excerpt;
    const desktopTitleLayout = cardOptions.layout === 'compact-grid'
        ? null
        : getDesktopTitleLayout(post.title, { hasCover: !!post.cover });

    return postCardTemplate.renderPostCard({
        link: post.link,
        // titleHtml / excerptHtml 字段语义为"已安全的 HTML 片段"，由调用方 escape；
        // 对 title 先 escape 再 processTitleHtml（| 替换为 <span>），顺序不能反
        titleHtml: shared.processTitleHtml(shared.escapeHtml(post.title)),
        desktopTitleSingleLine: desktopTitleLayout ? desktopTitleLayout.singleLine : undefined,
        desktopPreviewLines: desktopTitleLayout ? desktopTitleLayout.previewLines : undefined,
        excerptHtml: shared.escapeHtmlWithLineBreaks(previewText),
        date: post.date.tz('Asia/Shanghai').format('YYYY-MM-DD'),
        modifiedDate: post.modifiedDate.tz('Asia/Shanghai').format('YYYY-MM-DD'),
        sortDate: post.date.valueOf(),
        sortModifiedDate: post.modifiedDate.valueOf(),
        tagsHtml,
        cover: post.cover,
        coverWidth: post.coverWidth,
        coverHeight: post.coverHeight,
        pinned: post.pinned,
        animationDelay: getCardAnimationDelay(index, animationDelayStep),
        mobileTagsInline: ALL_PAGE_MOBILE_CARD_OPTIONS.mobileTagsInline,
        layout: cardOptions.layout
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
        // 分页页（page > 1）打 noindex,follow：让爬虫顺着链接发现文章页本身,
        // 但不让分页页与首页产生重复内容信号互相稀释排名。
        const isPagination = page > 1;
        const pagination = isPagination
            ? {
                prevUrl: seo.pageUrl(siteConfig, page === 2 ? '/' : `/page/${page - 1}/`),
                nextUrl: page < totalPages ? seo.pageUrl(siteConfig, `/page/${page + 1}/`) : ''
            }
            : (totalPages > 1 ? { nextUrl: seo.pageUrl(siteConfig, '/page/2/') } : null);
        const seoHead = seo.renderHeadTags({
            title,
            description: seo.defaultDescription(siteConfig, seoConfig),
            canonicalPath,
            siteConfig,
            seoConfig,
            image: seo.defaultImage(siteConfig, seoConfig),
            noindex: isPagination,
            pagination
        });
        const jsonLd = page === 1 ? seo.renderWebsiteJsonLd({ siteConfig, seoConfig }) : '';

        const outputHtml = replacePlaceholders(template, [
            [/<title>[\s\S]*?<\/title>/, `<title>${shared.escapeHtml(title)}</title>`],
            ['<!-- HOME_SEO_HEAD -->', seoHead],
            ['<!-- HOME_JSONLD -->', jsonLd],
            ['<!-- POSTS_LIST_PLACEHOLDER -->', postsHtml],
            ['<!-- PAGINATION_BUTTONS_PLACEHOLDER -->', paginationBtns],
            ['<!-- PAGINATION_PLACEHOLDER -->', ''],
            ['<!-- RECENT_POSTS_SIDEBAR_PLACEHOLDER -->', recentPostsSidebarHtml || '']
        ]);

        if (page === 1) {
            // 首页内容同一份 HTML 落两个地址：
            //   /     (index.html) —— 站点规范首页，内容直出，爬虫与无 JS 访客直接读到文章列表；
            //   /home (home.html)  —— 外壳 iframe 的默认内容页，canonical 归并到 /。
            // 真人浏览器访问任一地址时，由 SHELL_BOOTSTRAP_SCRIPT 换壳升级为外壳（顶栏音频无缝）体验。
            fs.writeFileSync(path.join(outputDir, 'index.html'), outputHtml, 'utf-8');
            fs.writeFileSync(path.join(outputDir, 'home.html'), outputHtml, 'utf-8');
        } else {
            const pageDir = path.join(outputDir, 'page', String(page));
            if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
            fs.writeFileSync(path.join(pageDir, 'index.html'), outputHtml, 'utf-8');
        }
    }
}

module.exports = { generateAll, renderPostCardForList };
