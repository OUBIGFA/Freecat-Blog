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
    const IMG_FALLBACK_ATTR = (shared && shared.IMG_FALLBACK_ATTR) ||
        "onerror=\"if(this.dataset.fallbackApplied!=='true'){this.dataset.fallbackApplied='true';this.removeAttribute('srcset');this.src='/image/404.png';}\"";

    const escapeHtml = (shared && shared.escapeHtml) || function (text) {
        if (text == null) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    function renderPostCard(post) {
        const link = escapeHtml(post.link || '#');
        const titleHtml = post.titleHtml || '';
        const excerptHtml = post.excerptHtml || '';
        const date = escapeHtml(post.date || '');
        const modifiedDate = escapeHtml(post.modifiedDate || '');
        const tagsHtml = post.tagsHtml || '';
        const cover = escapeHtml(post.cover || '');
        const pinned = !!post.pinned;

        const imageDiv = cover
            ? `<div class="w-full h-48 md:h-full md:w-[40%] md:max-w-[480px] rounded-lg md:order-last overflow-hidden">
                <img src="${cover}"
                    alt="Cover"
                    class="w-full h-full object-cover"
                    ${IMG_FALLBACK_ATTR}
                    loading="lazy" />
               </div>`
            : '';

        const pinnedBadge = pinned
            ? `<div class="absolute -top-2 -left-2 md:-top-3 md:-left-3 z-10 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-500/30">
                <svg class="text-base md:text-xl drop-shadow-sm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M22.3126 10.1753L20.8984 11.5895L20.1913 10.8824L15.9486 15.125L15.2415 18.6606L13.8273 20.0748L9.58466 15.8321L4.63492 20.7819L3.2207 19.3677L8.17045 14.4179L3.92781 10.1753L5.34202 8.76107L8.87756 8.05396L13.1202 3.81132L12.4131 3.10422L13.8273 1.69L22.3126 10.1753Z"></path></svg>
               </div>`
            : '';

        const modifiedBlock = modifiedDate
            ? `<div class="flex items-center gap-1.5 text-primary/60 dark:text-gray-500 font-medium">
                <svg class="text-sm md:text-base" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M6.93912 14.0328C6.7072 14.6563 6.51032 15.2331 6.33421 15.8155C7.29345 15.1189 8.43544 14.6767 9.75193 14.5121C12.2652 14.198 14.4976 12.5385 15.6279 10.4537L14.1721 8.99888L15.5848 7.58417C15.9185 7.25004 16.2521 6.91614 16.5858 6.58248C17.0151 6.15312 17.5 5.35849 18.0129 4.2149C12.4197 5.08182 8.99484 8.50647 6.93912 14.0328ZM17 8.99739L18 9.99669C17 12.9967 14 15.9967 10 16.4967C7.33146 16.8303 5.66421 18.6636 4.99824 21.9967H3C4 15.9967 6 1.99669 21 1.99669C20.0009 4.99402 19.0018 6.99313 18.0027 7.99402C17.6662 8.33049 17.3331 8.66382 17 8.99739Z"></path></svg>
                <span>${modifiedDate}</span>
               </div>`
            : '';

        const tagsBlock = tagsHtml
            ? `<div class="tags-fit flex items-center gap-2 flex-nowrap min-w-0 flex-1">
                ${tagsHtml}
               </div>`
            : '';

        return `
        <a href="${link}" class="post-card block mb-6 md:mb-10 group cursor-pointer">
            <div class="relative flex flex-col md:flex-row items-stretch justify-between gap-6 md:gap-8 rounded-2xl bg-white dark:bg-card-dark p-5 md:p-8 shadow-sm transition-[box-shadow,border-color] duration-300 ease-out group-hover:shadow-2xl group-hover:shadow-gray-400/20 dark:group-hover:shadow-black/40 md:h-80">
                ${pinnedBadge}
                ${imageDiv}
                <div class="flex min-w-0 flex-1 flex-col justify-between overflow-hidden">
                    <div class="flex flex-col gap-3 md:gap-4">
                        <div class="flex flex-wrap items-center gap-3 md:gap-4 text-[#616f89] dark:text-gray-400 text-[10px] md:text-xs font-semibold">
                            <div class="flex items-center gap-1.5">
                                <svg class="text-sm md:text-base" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M7 3V1H9V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V9H20V5H17V7H15V5H9V7H7V5H4V19H10V21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7ZM17 12C14.7909 12 13 13.7909 13 16C13 18.2091 14.7909 20 17 20C19.2091 20 21 18.2091 21 16C21 13.7909 19.2091 12 17 12ZM11 16C11 12.6863 13.6863 10 17 10C20.3137 10 23 12.6863 23 16C23 19.3137 20.3137 22 17 22C13.6863 22 11 19.3137 11 16ZM16 13V16.4142L18.2929 18.7071L19.7071 17.2929L18 15.5858V13H16Z"></path></svg>
                                <span>${date}</span>
                            </div>
                            ${modifiedBlock}
                            ${tagsBlock}
                        </div>
                        <h3 class="text-[#111318] dark:text-slate-200 text-xl md:text-3xl font-black leading-tight line-clamp-2">
                            ${titleHtml}
                        </h3>
                        <p class="text-[#616f89] dark:text-gray-400 text-sm md:text-lg font-normal leading-relaxed line-clamp-3 md:line-clamp-3">${excerptHtml}</p>
                    </div>
                </div>
            </div>
        </a>`;
    }

    return { renderPostCard };
}));
