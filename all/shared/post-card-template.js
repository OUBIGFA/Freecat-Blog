/* global window, self */
/**
 * 文章卡片渲染（首页 / 全部 / 搜索 三处共用）。
 * 同时支持 Node 构建期 (require) 与浏览器期 (window.PostCardTemplate)。
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        const shared = require('./shared.js');
        module.exports = factory(shared);
    } else {
        root.PostCardTemplate = factory(root.FreecatShared);
    }
}(typeof self !== 'undefined' ? self : this, function (shared) {
    // 不做运行时回退：shared 缺失说明加载顺序被破坏，应早失败（与 main.js 约定一致）。
    if (!shared || typeof shared.escapeHtml !== 'function') {
        throw new Error('FreecatShared not loaded — ensure shared.js loads before post-card-template.js');
    }
    const { escapeHtml, encodeSitePath } = shared;

    const clampStyle = (lines, options = {}) => {
        const overflowWrap = options.overflowWrap || 'anywhere';
        return `display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:${lines};overflow:hidden;text-overflow:ellipsis;overflow-wrap:${overflowWrap};`;
    };

    const plainTextFromHtml = (html) => String(html || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

    // 文章卡片的媒体标记：构建期 stripMarkdown()（build/markdown.js）会给含
    // 音频 / 视频的摘要文本加上 🎶 / 🎬 前缀。这里把该前缀从摘要里摘出来，改成
    // 行内 SVG 图标渲染，避免媒体标记以 emoji 字形出现在正文文本中。
    const MEDIA_ICON_SVG = {
        audio: '<svg class="post-card-media-icon mr-1 inline-block h-[1em] w-[1em] align-[-0.125em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 12H7C8.10457 12 9 12.8954 9 14V19C9 20.1046 8.10457 21 7 21H4C2.89543 21 2 20.1046 2 19V12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12V19C22 20.1046 21.1046 21 20 21H17C15.8954 21 15 20.1046 15 19V14C15 12.8954 15.8954 12 17 12H20C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12Z"></path></svg>',
        video: '<svg class="post-card-media-icon mr-1 inline-block h-[1em] w-[1em] align-[-0.125em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM10.6219 8.41459C10.5562 8.37078 10.479 8.34741 10.4 8.34741C10.1791 8.34741 10 8.52649 10 8.74741V15.2526C10 15.3316 10.0234 15.4088 10.0672 15.4745C10.1897 15.6583 10.4381 15.708 10.6219 15.5854L15.5008 12.3328C15.5447 12.3035 15.5824 12.2658 15.6117 12.2219C15.7343 12.0381 15.6846 11.7897 15.5008 11.6672L10.6219 8.41459Z"></path></svg>'
    };

    // 从摘要 HTML 开头解析媒体前缀，返回行内图标 HTML 与去掉前缀后的正文。
    function splitMediaPrefix(html) {
        const match = /^\s*(🎶|🎬)\s*/.exec(html);
        if (!match) return { iconHtml: '', body: html };
        const type = match[1] === '🎶' ? 'audio' : 'video';
        return { iconHtml: MEDIA_ICON_SVG[type], body: html.slice(match[0].length) };
    }

    function renderPostCard(post) {
        const layout = post.layout || 'default';
        const link = escapeHtml(encodeSitePath(post.link || '#'));
        const titleHtml = post.titleHtml || '';
        const excerptHtml = post.excerptHtml || '';
        const { iconHtml: mediaIconHtml, body: excerptBodyHtml } = splitMediaPrefix(excerptHtml);
        const date = escapeHtml(post.date || '');
        const modifiedDate = escapeHtml(post.modifiedDate || '');
        const sortDate = Number(post.sortDate) || 0;
        const sortModifiedDate = Number(post.sortModifiedDate) || sortDate;
        const tagsHtml = post.tagsHtml || '';
        const mobileTagsInline = post.mobileTagsInline === true;
        const cover = escapeHtml(post.cover || '');
        const imageSrc = cover;
        const pinned = !!post.pinned;
        const animationDelay = Math.max(0, Number(post.animationDelay) || 0);
        const titleText = plainTextFromHtml(titleHtml);
        const desktopPreviewLines = titleText.length >= 24 ? 3 : 4;
        // 给 <img> 写 width/height 以预留盒子，消除卡片图片加载的 CLS。
        // 来自 frontmatter cover_width / cover_height（构建期注入）；
        // 客户端搜索结果场景由 search-index.json 透传同名字段。
        const coverWidth = parseInt(post.coverWidth, 10) || 0;
        const coverHeight = parseInt(post.coverHeight, 10) || 0;
        const coverDimAttrs = (coverWidth > 0 && coverHeight > 0)
            ? ` width="${coverWidth}" height="${coverHeight}"`
            : '';

        const imageMarkup = imageSrc
            ? `<img src="/image/404.png"${cover ? ` data-src="${cover}"` : ''}
                    alt="Cover"
                    class="w-full h-full object-cover"${coverDimAttrs}
                    loading="lazy" decoding="async" />${cover ? '<div class="placeholder-loader" aria-hidden="true"><span class="loader"></span></div>' : ''}`
            : '';
        const mobileImageBlock = imageMarkup
            ? `<div class="lazy-image-frame mt-8 h-[196px] shrink-0 rounded-2xl overflow-hidden sm:h-[216px]">
                        ${imageMarkup}
                    </div>`
            : '';
        const desktopImageBlock = imageMarkup
            ? `<div class="lazy-image-frame col-start-2 row-start-1 h-full rounded-2xl overflow-hidden">
                        ${imageMarkup}
                    </div>`
            : '';

        const pinnedBadge = pinned
            ? `<div class="absolute -top-2 -left-2 md:-top-3 md:-left-3 z-10 flex items-center justify-center w-7 h-7 md:w-[34px] md:h-[34px] rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                <svg class="text-sm md:text-[17px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M22.3126 10.1753L20.8984 11.5895L20.1913 10.8824L15.9486 15.125L15.2415 18.6606L13.8273 20.0748L9.58466 15.8321L4.63492 20.7819L3.2207 19.3677L8.17045 14.4179L3.92781 10.1753L5.34202 8.76107L8.87756 8.05396L13.1202 3.81132L12.4131 3.10422L13.8273 1.69L22.3126 10.1753Z"></path></svg>
               </div>`
            : '';

        const modifiedBlock = modifiedDate
            ? `<div class="flex items-center gap-1.5 text-primary/60 dark:text-gray-500 font-medium">
                <svg class="text-sm md:text-base" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M6.93912 14.0328C6.7072 14.6563 6.51032 15.2331 6.33421 15.8155C7.29345 15.1189 8.43544 14.6767 9.75193 14.5121C12.2652 14.198 14.4976 12.5385 15.6279 10.4537L14.1721 8.99888L15.5848 7.58417C15.9185 7.25004 16.2521 6.91614 16.5858 6.58248C17.0151 6.15312 17.5 5.35849 18.0129 4.2149C12.4197 5.08182 8.99484 8.50647 6.93912 14.0328ZM17 8.99739L18 9.99669C17 12.9967 14 15.9967 10 16.4967C7.33146 16.8303 5.66421 18.6636 4.99824 21.9967H3C4 15.9967 6 1.99669 21 1.99669C20.0009 4.99402 19.0018 6.99313 18.0027 7.99402C17.6662 8.33049 17.3331 8.66382 17 8.99739Z"></path></svg>
                <span class="freecat-date-text">${modifiedDate}</span>
               </div>`
            : '';

        const desktopDateBlock = `<div class="flex items-center gap-1.5 text-[#657188] dark:text-gray-400 font-semibold">
            <svg class="text-base" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M7 3V1H9V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V9H20V5H17V7H15V5H9V7H7V5H4V19H10V21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7ZM17 12C14.7909 12 13 13.7909 13 16C13 18.2091 14.7909 20 17 20C19.2091 20 21 18.2091 21 16C21 13.7909 19.2091 12 17 12ZM11 16C11 12.6863 13.6863 10 17 10C20.3137 10 23 12.6863 23 16C23 19.3137 20.3137 22 17 22C13.6863 22 11 19.3137 11 16ZM16 13V16.4142L18.2929 18.7071L19.7071 17.2929L18 15.5858V13H16Z"></path></svg>
                <span class="freecat-published-date-text">${date}</span>
        </div>`;

        const tagsBlock = tagsHtml
            ? `<div class="tags-fit flex items-center gap-2 flex-nowrap min-w-0 flex-1">
                ${tagsHtml}
               </div>`
            : '';
        const mobileInlineTagsBlock = mobileTagsInline && tagsBlock ? tagsBlock : '';
        const mobileFooterTagsBlock = !mobileTagsInline && tagsBlock
            ? `<div class="mt-3 shrink-0">
                        <div class="flex min-h-5 items-center">${tagsBlock}</div>
                    </div>`
            : '';

        if (layout === 'compact-grid') {
            const compactExcerptLines = imageMarkup ? 2 : 9;
            const compactExcerptMinHeight = imageMarkup ? 'min-h-[3.3em]' : 'min-h-[12.995rem]';
            const compactImageHeight = mobileTagsInline
                ? 'h-[clamp(11.25rem,14.5vw,13.25rem)] max-[480px]:h-[11.5rem]'
                : 'h-[clamp(8.75rem,12vw,10.75rem)] max-[480px]:h-36';
            const compactImageBlock = imageMarkup
                ? `<div class="lazy-image-frame mt-4 ${compactImageHeight} shrink-0 rounded-lg overflow-hidden">
                        ${imageMarkup}
                    </div>`
                : '';

            return `
        <a href="${link}" class="post-card post-card-layout-compact-grid ${imageMarkup ? 'has-cover' : 'has-no-cover'} ${mobileTagsInline ? 'tags-inline-mobile' : ''} animate-fade-in-up block h-full min-w-0 group cursor-pointer" style="animation-delay: ${animationDelay}ms" data-sort-date="${sortDate}" data-sort-modified="${sortModifiedDate}" data-sort-pinned="${pinned ? '1' : '0'}">
            <div class="relative flex h-full min-h-0 ${imageMarkup ? '' : 'min-h-[clamp(21rem,27vw,23.4rem)] max-[480px]:min-h-[18.5rem]'} flex-col rounded-lg bg-white dark:bg-card-dark p-4 sm:p-5 shadow-none">
                ${pinnedBadge}
                <div class="shrink-0">
                    <h3 class="post-card-title text-[#1e293b] dark:text-slate-200 text-[20px] max-[480px]:text-[18px] font-semibold leading-[1.24] min-h-[3.1rem] max-[480px]:min-h-[2.8rem]" style="${clampStyle(2)}">${titleHtml}</h3>
                    <div class="mt-2.5 flex min-h-[1.625rem] flex-wrap items-center gap-x-3.5 gap-y-1.5 overflow-visible text-[#657188] dark:text-gray-400 text-xs font-semibold">
                        <div class="flex items-center gap-2">
                            <svg class="text-base" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M7 3V1H9V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V9H20V5H17V7H15V5H9V7H7V5H4V19H10V21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7ZM17 12C14.7909 12 13 13.7909 13 16C13 18.2091 14.7909 20 17 20C19.2091 20 21 18.2091 21 16C21 13.7909 19.2091 12 17 12ZM11 16C11 12.6863 13.6863 10 17 10C20.3137 10 23 12.6863 23 16C23 19.3137 20.3137 22 17 22C13.6863 22 11 19.3137 11 16ZM16 13V16.4142L18.2929 18.7071L19.7071 17.2929L18 15.5858V13H16Z"></path></svg>
                            <span class="freecat-published-date-text">${date}</span>
                        </div>
                        ${modifiedBlock}
                        ${mobileInlineTagsBlock}
                    </div>
                </div>
                <div class="mt-4 shrink-0">
                    <p class="post-card-excerpt text-[#63718a] dark:text-gray-400 text-[14px] font-normal leading-[1.65] ${compactExcerptMinHeight}" style="${clampStyle(compactExcerptLines, { overflowWrap: 'break-word' })}">${mediaIconHtml}${excerptBodyHtml}</p>
                </div>
                ${compactImageBlock}
                ${mobileFooterTagsBlock}
            </div>
        </a>`;
        }

        return `
        <a href="${link}" class="post-card ${imageMarkup ? 'has-cover' : 'has-no-cover'} ${mobileTagsInline ? 'tags-inline-mobile' : ''} animate-fade-in-up block mb-8 md:mb-10 group cursor-pointer" style="animation-delay: ${animationDelay}ms" data-sort-date="${sortDate}" data-sort-modified="${sortModifiedDate}" data-sort-pinned="${pinned ? '1' : '0'}">
            <div class="relative rounded-2xl bg-white dark:bg-card-dark px-9 pt-9 pb-4 shadow-none group-hover:shadow-2xl group-hover:shadow-gray-400/20 dark:group-hover:shadow-black/40 lg:h-[390px] lg:px-16 lg:py-12">
                ${pinnedBadge}
                <div class="flex h-full min-w-0 flex-col lg:hidden">
                    <div class="shrink-0">
                        <h3 class="post-card-title text-[#1e293b] dark:text-slate-200 text-[24px] font-black leading-tight" style="${clampStyle(2)}">${titleHtml}</h3>
                        <div class="mt-3 flex flex-wrap items-center gap-4 text-[#657188] dark:text-gray-400 text-xs font-semibold">
                            <div class="flex items-center gap-2">
                                <svg class="text-base" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M7 3V1H9V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V9H20V5H17V7H15V5H9V7H7V5H4V19H10V21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7ZM17 12C14.7909 12 13 13.7909 13 16C13 18.2091 14.7909 20 17 20C19.2091 20 21 18.2091 21 16C21 13.7909 19.2091 12 17 12ZM11 16C11 12.6863 13.6863 10 17 10C20.3137 10 23 12.6863 23 16C23 19.3137 20.3137 22 17 22C13.6863 22 11 19.3137 11 16ZM16 13V16.4142L18.2929 18.7071L19.7071 17.2929L18 15.5858V13H16Z"></path></svg>
                                <span class="freecat-published-date-text">${date}</span>
                            </div>
                            ${modifiedBlock}
                            ${mobileInlineTagsBlock}
                        </div>
                    </div>
                    <div class="mt-7 shrink-0">
                        <p class="post-card-excerpt text-[#63718a] dark:text-gray-400 text-[14px] font-normal leading-7" style="${clampStyle(3)}">${mediaIconHtml}${excerptBodyHtml}</p>
                    </div>
                    ${mobileImageBlock}
                    ${mobileFooterTagsBlock}
                </div>
                <div class="hidden h-full min-w-0 ${imageMarkup ? 'grid-cols-[minmax(0,1fr)_minmax(360px,43%)]' : 'grid-cols-1'} grid-rows-[1fr_auto] gap-x-14 lg:grid">
                    <div class="row-start-1 flex min-h-0 flex-col">
                        <h3 class="post-card-title text-[#1e293b] dark:text-slate-200 text-[34px] font-black leading-tight" style="${clampStyle(2)}">${titleHtml}</h3>
                        <p class="post-card-excerpt mt-8 text-[#63718a] dark:text-gray-400 text-[16px] font-normal leading-[1.78]" style="${clampStyle(desktopPreviewLines)}">${mediaIconHtml}${excerptBodyHtml}</p>
                    </div>
                    ${desktopImageBlock}
                    <div class="col-start-1 row-start-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div class="flex min-h-5 items-center gap-5 text-xs">
                            ${desktopDateBlock}
                            ${modifiedBlock}
                            ${tagsBlock}
                        </div>
                    </div>
                </div>
            </div>
        </a>`;
    }

    return { renderPostCard };
}));
