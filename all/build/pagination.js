/**
 * 极简分页 UI HTML 生成。
 *
 * 设计原则：
 *   - 排版优先于装饰：去掉胶囊/填充，当前页用 1.5px 短下划线标记
 *   - 唯一动效：颜色 / 边框色的 150ms 过渡
 *   - 发丝线分组：导航与「跳至」之间用 1px × 14px 分隔
 *
 * 兼容性：
 *   - 仍输出 <a>，main.js 用 closest('a') 拦截点击
 *   - 禁用态用 `opacity-50 pointer-events-none`，main.js 检测 `opacity-50` 即跳过
 *   - 输入框保留 type=number 与 max 属性，main.js 监听 Enter
 *
 * @param {number} currentPage  当前页码（1 起）
 * @param {number} totalPages   总页数
 * @returns {string} 分页器 HTML（仅 1 页时返回空串）
 */
function generatePaginationHtml(currentPage, totalPages) {
    if (totalPages <= 1) return '';

    // -------- 计算可见页码序列 --------
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

    // -------- 复用样式片段 --------
    const baseLink   = 'inline-flex items-center justify-center min-w-8 h-8 rounded-sm transition-colors duration-150';
    const muted      = 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white';
    const disabled   = 'opacity-50 pointer-events-none cursor-not-allowed';

    const edgeBtn = (href, label, side, isDisabled) => {
        const arrow = side === 'prev'
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><polyline points="15 6 9 12 15 18"/></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="12" height="12"><polyline points="9 6 15 12 9 18"/></svg>`;
        const text = `<span class="hidden md:inline">${label}</span>`;
        const inner = side === 'prev' ? `${arrow}${text}` : `${text}${arrow}`;
        return `<a href="${href || '#'}" class="${baseLink} ${muted} gap-1.5 px-2 ${isDisabled ? disabled : ''}" aria-label="${label} page" ${isDisabled ? 'aria-disabled="true"' : ''}>${inner}</a>`;
    };

    // -------- 构建 HTML --------
    let html = `<nav aria-label="Pagination" class="flex items-center gap-4 md:gap-7 mt-12 mb-20 text-sm select-none">`;

    // 导航组
    html += `<div class="flex items-center gap-0.5">`;
    html += edgeBtn(prevLink, 'Prev', 'prev', !prevLink);

    pages.forEach(p => {
        if (p === '...') {
            html += `<span class="px-1.5 text-gray-300 dark:text-gray-600 tracking-widest cursor-default" aria-hidden="true">…</span>`;
        } else {
            const link = p === 1 ? '/' : `/page/${p}/`;
            const isActive = p === currentPage;
            if (isActive) {
                // 当前页：加粗 + 1.5px 短下划线（用 inline span，避免 CSS 改造）
                html += `<a href="${link}" aria-current="page" class="${baseLink} relative font-semibold text-gray-900 dark:text-white tabular-nums">${p}<span class="absolute left-2 right-2 bottom-1 h-[1.5px] bg-current rounded-sm" aria-hidden="true"></span></a>`;
            } else {
                html += `<a href="${link}" class="${baseLink} ${muted} tabular-nums">${p}</a>`;
            }
        }
    });

    html += edgeBtn(nextLink, 'Next', 'next', !nextLink);
    html += `</div>`;

    // 发丝线分隔（仅桌面）
    html += `<span class="hidden md:block w-px h-3.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true"></span>`;

    // 跳至区
    html += `
        <div class="hidden md:flex items-baseline gap-2 text-xs text-gray-400 dark:text-gray-500 tracking-wide">
            <span>跳至</span>
            <input type="number" min="1" max="${totalPages}" placeholder="${currentPage}"
                class="w-11 h-6 px-1.5 bg-transparent text-[13px] text-gray-900 dark:text-white text-center tabular-nums border-0 border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:border-gray-900 dark:focus:border-white transition-colors duration-150 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                aria-label="Jump to page"
                onfocus="this.placeholder=''" onblur="this.placeholder='${currentPage}'">
            <span>/ ${totalPages}</span>
        </div>`;

    html += `</nav>`;
    return html;
}

module.exports = { generatePaginationHtml };
