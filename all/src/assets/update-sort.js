/* update-sort.js
 * 「按更新排序」开关：列表就地重排 + URL 参数同步（含外壳历史）。
 * 依赖全局：无（所有依赖经 init 注入）。
 * init() 返回 { initUpdateSortControls }，搜索页渲染结果后会再次调用以绑定新开关。
 */
(function (root) {
    'use strict';

    function init(deps) {
        const win = deps.window;
        const doc = deps.document;
        const runtime = deps.runtime;
        const syncParentFrameHistory = deps.syncParentFrameHistory;
        const prefersReducedMotion = deps.prefersReducedMotion;

        const updateSortParam = 'updateSort';
        const updateSortValue = 'modified';

        function getSwitches() {
            return doc.querySelectorAll('[data-update-sort-switch]');
        }

        function isUpdateSortUrlEnabled() {
            const params = new URLSearchParams(win.location.search);
            return params.get(updateSortParam) === updateSortValue;
        }

        // URL 同步：把当前开关状态写进 ?updateSort=modified，并同步外壳历史。
        function syncUpdateSortUrl(options = {}) {
            const params = new URLSearchParams(win.location.search);
            const useModifiedSort = Array.from(getSwitches()).some((updateSortSwitch) => {
                return updateSortSwitch.getAttribute('aria-checked') === 'true';
            });

            if (useModifiedSort) {
                params.set(updateSortParam, updateSortValue);
            } else {
                params.delete(updateSortParam);
            }

            const query = params.toString();
            const nextUrl = win.location.pathname + (query ? `?${query}` : '') + win.location.hash;
            const currentUrl = win.location.pathname + win.location.search + win.location.hash;

            const method = options.replace ? 'replaceState' : 'pushState';
            if (nextUrl !== currentUrl) {
                win.history[method](win.history.state || {}, '', nextUrl);
            }

            syncParentFrameHistory({ push: !options.replace });
        }

        function getListForSwitch(updateSortSwitch) {
            const explicitTarget = updateSortSwitch.closest('[data-update-sort-controls]')?.dataset.updateSortTarget;
            if (explicitTarget) return doc.querySelector(explicitTarget);
            return doc.getElementById('posts-list') || doc.getElementById('search-results');
        }

        const getCardDelay = (index) => `${Math.min(index, 10) * 50}ms`;

        // 列表重排：按 data-sort-* 字段就地排序卡片并重放入场动画。
        function sortListCards(list, mode, options = {}) {
            const cards = Array.from(list.querySelectorAll('.post-card')).map((card, index) => ({ card, index }));
            const sortedCards = cards.sort((a, b) => {
                const pinnedDelta = mode === 'date'
                    ? Number(b.card.dataset.sortPinned || 0) - Number(a.card.dataset.sortPinned || 0)
                    : 0;
                const field = mode === 'modified' ? 'sortModified' : 'sortDate';
                const delta = pinnedDelta || Number(b.card.dataset[field] || 0) - Number(a.card.dataset[field] || 0);
                return delta || a.index - b.index;
            });

            sortedCards.forEach(({ card }, index) => {
                card.style.animationDelay = getCardDelay(index);
                list.appendChild(card);
                if (options.animate !== false && !prefersReducedMotion()) {
                    card.classList.remove('animate-fade-in-up');
                }
            });

            if (options.animate === false || prefersReducedMotion()) return;

            void list.offsetWidth;
            sortedCards.forEach(({ card }) => {
                card.classList.add('animate-fade-in-up');
            });
        }

        function setUpdateSortMode(updateSortSwitch, useModifiedSort, options = {}) {
            const list = getListForSwitch(updateSortSwitch);
            const mode = useModifiedSort ? 'modified' : 'date';
            updateSortSwitch.setAttribute('aria-checked', String(useModifiedSort));

            if (list) sortListCards(list, mode, options);
            if (options.syncUrl !== false) syncUpdateSortUrl(options);
        }

        function bindSwitch(updateSortSwitch) {
            if (isUpdateSortUrlEnabled()) {
                setUpdateSortMode(updateSortSwitch, true, { animate: false, syncUrl: false });
            } else if (updateSortSwitch.getAttribute('aria-checked') === 'true') {
                setUpdateSortMode(updateSortSwitch, true, { animate: false, syncUrl: false });
            }

            if (updateSortSwitch.dataset.updateSortReady === 'true') return;
            updateSortSwitch.dataset.updateSortReady = 'true';

            updateSortSwitch.addEventListener('click', () => {
                const useModifiedSort = updateSortSwitch.getAttribute('aria-checked') !== 'true';
                setUpdateSortMode(updateSortSwitch, useModifiedSort, { replace: true });
            });
        }

        function initUpdateSortControls() {
            const switches = getSwitches();
            if (!switches.length) return;
            runtime.setSyncUpdateSortUrl(syncUpdateSortUrl);
            switches.forEach(bindSwitch);
        }

        return { initUpdateSortControls };
    }

    root.FreecatUpdateSort = { init };
}(typeof self !== 'undefined' ? self : this));
