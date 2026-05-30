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
        root.PostCardTemplate = factory(root.FreecatShared || {});
    }
}(typeof self !== 'undefined' ? self : this, function (shared) {
    const escapeHtml = (shared && shared.escapeHtml) || function (text) {
        if (text == null) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const clampStyle = (lines) =>
        `display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:${lines};overflow:hidden;text-overflow:ellipsis;overflow-wrap:anywhere;`;

    const plainTextFromHtml = (html) => String(html || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();

    function renderPostCard(post) {
        const encodeSitePath = (shared && shared.encodeSitePath) || function (url) { return url; };
        const link = escapeHtml(encodeSitePath(post.link || '#'));
        const titleHtml = post.titleHtml || '';
        const excerptHtml = post.excerptHtml || '';
        const date = escapeHtml(post.date || '');
        const modifiedDate = escapeHtml(post.modifiedDate || '');
        const sortDate = Number(post.sortDate) || 0;
        const sortModifiedDate = Number(post.sortModifiedDate) || sortDate;
        const tagsHtml = post.tagsHtml || '';
        const cover = escapeHtml(post.cover || '');
        const coverPlaceholder = post.coverPlaceholder === true;
        const imageSrc = cover || (coverPlaceholder ? '/image/404.png' : '');
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
            ? `<div class="lazy-image-frame mt-8 h-[180px] shrink-0 rounded-2xl overflow-hidden sm:h-[200px]">
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
                <span>${modifiedDate}</span>
               </div>`
            : '';

        const desktopDateBlock = `<div class="flex items-center gap-1.5 text-[#657188] dark:text-gray-400 font-semibold">
            <svg class="text-base" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M7 3V1H9V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V9H20V5H17V7H15V5H9V7H7V5H4V19H10V21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7ZM17 12C14.7909 12 13 13.7909 13 16C13 18.2091 14.7909 20 17 20C19.2091 20 21 18.2091 21 16C21 13.7909 19.2091 12 17 12ZM11 16C11 12.6863 13.6863 10 17 10C20.3137 10 23 12.6863 23 16C23 19.3137 20.3137 22 17 22C13.6863 22 11 19.3137 11 16ZM16 13V16.4142L18.2929 18.7071L19.7071 17.2929L18 15.5858V13H16Z"></path></svg>
            <span>${date}</span>
        </div>`;

        const tagsBlock = tagsHtml
            ? `<div class="tags-fit flex items-center gap-2 flex-nowrap min-w-0 flex-1">
                ${tagsHtml}
               </div>`
            : '';

        return `
        <a href="${link}" class="post-card ${imageMarkup ? 'has-cover' : 'has-no-cover'} animate-fade-in-up block mb-8 md:mb-10 group cursor-pointer" style="animation-delay: ${animationDelay}ms" data-sort-date="${sortDate}" data-sort-modified="${sortModifiedDate}" data-sort-pinned="${pinned ? '1' : '0'}">
            <div class="relative rounded-2xl bg-white dark:bg-card-dark px-9 pt-9 pb-4 shadow-sm group-hover:shadow-2xl group-hover:shadow-gray-400/20 dark:group-hover:shadow-black/40 lg:h-[390px] lg:px-16 lg:py-12">
                ${pinnedBadge}
                <div class="flex h-full min-w-0 flex-col lg:hidden">
                    <div class="shrink-0">
                        <h3 class="text-[#1e293b] dark:text-slate-200 text-[24px] font-black leading-tight" style="${clampStyle(2)}">${titleHtml}</h3>
                        <div class="mt-3 flex flex-wrap items-center gap-4 text-[#657188] dark:text-gray-400 text-xs font-semibold">
                            <div class="flex items-center gap-2">
                                <svg class="text-base" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M7 3V1H9V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V9H20V5H17V7H15V5H9V7H7V5H4V19H10V21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7ZM17 12C14.7909 12 13 13.7909 13 16C13 18.2091 14.7909 20 17 20C19.2091 20 21 18.2091 21 16C21 13.7909 19.2091 12 17 12ZM11 16C11 12.6863 13.6863 10 17 10C20.3137 10 23 12.6863 23 16C23 19.3137 20.3137 22 17 22C13.6863 22 11 19.3137 11 16ZM16 13V16.4142L18.2929 18.7071L19.7071 17.2929L18 15.5858V13H16Z"></path></svg>
                                <span>${date}</span>
                            </div>
                            ${modifiedBlock}
                        </div>
                    </div>
                    <div class="mt-7 shrink-0">
                        <p class="text-[#63718a] dark:text-gray-400 text-[14px] font-normal leading-7" style="${clampStyle(3)}">${excerptHtml}</p>
                    </div>
                    ${mobileImageBlock}
                    <div class="mt-4 shrink-0 border-t border-slate-200 dark:border-slate-700 pt-3">
                        <div class="flex min-h-5 items-center">${tagsBlock}</div>
                    </div>
                </div>
                <div class="hidden h-full min-w-0 ${imageMarkup ? 'grid-cols-[minmax(0,1fr)_minmax(360px,43%)]' : 'grid-cols-1'} grid-rows-[1fr_auto] gap-x-14 lg:grid">
                    <div class="row-start-1 flex min-h-0 flex-col">
                        <h3 class="text-[#1e293b] dark:text-slate-200 text-[34px] font-black leading-tight" style="${clampStyle(2)}">${titleHtml}</h3>
                        <p class="mt-8 text-[#63718a] dark:text-gray-400 text-[16px] font-normal leading-[1.78]" style="${clampStyle(desktopPreviewLines)}">${excerptHtml}</p>
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
