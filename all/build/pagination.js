/**
 * 高级分页 UI HTML 生成。曾经定义在 build.js 的 for 循环里，现在提到顶层。
 *
 * @param {number} currentPage  当前页码（1 起）
 * @param {number} totalPages   总页数
 * @returns {string} 分页器 HTML 字符串（仅 1 页时返回空串）
 */
function generatePaginationHtml(currentPage, totalPages) {
    if (totalPages <= 1) return '';

    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);
        if (currentPage <= 3) end = 4;
        if (currentPage >= totalPages - 2) start = totalPages - 3;
        if (start > 2) pages.push('...');
        for (let i = start; i <= end; i++) {
            if (!pages.includes(i)) pages.push(i);
        }
        if (end < totalPages - 1) pages.push('...');
        if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    const prevLink = currentPage === 1 ? null : (currentPage === 2 ? '/' : `/page/${currentPage - 1}/`);
    const nextLink = currentPage === totalPages ? null : `/page/${currentPage + 1}/`;

    let html = `<div class="flex flex-col md:flex-row items-center gap-4 md:gap-6 mt-12 mb-20">`;
    html += `<div class="flex items-center gap-1 md:gap-2">`;

    html += `
            <a href="${prevLink || '#'}" class="t-btn t-btn-primary group flex items-center gap-2 px-2 md:px-4 h-10 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 ${!prevLink ? 'is-disabled' : 'hover:bg-primary hover:text-slate-50 hover:border-primary'}" title="Previous Page">
                <span class="text-xl t-btn-arrow-prev">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path></svg>
                </span>
                <span class="hidden md:inline text-sm font-bold">Prev</span>
            </a>`;

    pages.forEach(p => {
        if (p === '...') {
            html += `<span class="px-2 text-gray-400 font-medium">···</span>`;
        } else {
            const link = p === 1 ? '/' : `/page/${p}/`;
            const isActive = p === currentPage;
            // Active 页码：已是被激活状态（scale-105 + 主色），不再 hover 抬升
            // Inactive 页码：使用 .t-btn 标准 hover 抬升
            const variantClass = isActive
                ? 'bg-primary text-slate-50 border-primary scale-105 cursor-default pointer-events-none'
                : 't-btn t-btn-primary border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary';
            html += `
                    <a href="${link}" class="${variantClass} flex shrink-0 items-center justify-center w-10 h-10 p-0 rounded-full border font-bold text-sm">
                        ${p}
                    </a>`;
        }
    });

    html += `
            <a href="${nextLink || '#'}" class="t-btn t-btn-primary group flex items-center gap-2 px-2 md:px-4 h-10 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 ${!nextLink ? 'is-disabled' : 'hover:bg-primary hover:text-slate-50 hover:border-primary'}" title="Next Page">
                <span class="hidden md:inline text-sm font-bold">Next</span>
                <span class="text-xl t-btn-arrow-next">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path></svg>
                </span>
                </a>`;

    html += `</div>`;

    html += `
            <div class="flex items-center gap-3 pl-0 md:pl-6 border-none md:border-l border-gray-200 dark:border-gray-800">
                <span class="hidden md:inline text-xs font-bold text-gray-400 uppercase tracking-widest">Jump to</span>
                <div class="relative group">
                    <input type="number" min="1" max="${totalPages}" placeholder="${currentPage}"
                        class="w-16 h-10 px-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-center text-base md:text-sm font-bold focus:outline-none focus:ring-0 focus:border-gray-200 dark:focus:border-gray-700 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        onfocus="this.placeholder=''" onblur="this.placeholder='${currentPage}'">
                </div>
                <span class="hidden md:inline text-xs font-bold text-gray-400 uppercase tracking-widest">of ${totalPages}</span>
            </div>
        `;

    html += `</div>`;
    return html;
}

module.exports = { generatePaginationHtml };
