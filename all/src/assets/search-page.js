/* search-page.js
 * 搜索页（search.html）专属：从 URL ?q= 或 ?tag= 读取并渲染完整结果列表。
 * 依赖全局：无（所有依赖经 init 注入）。
 */
(function (root) {
    'use strict';

    function init(deps) {
        const win = deps.window;
        const doc = deps.document;
        const searchCore = deps.searchCore;
        const loadSearchIndex = deps.loadSearchIndex;
        const loadTagIndex = deps.loadTagIndex;
        const { initDeferredImages, unobserveDeferredImages } = deps.lazyImages;
        const fitTagRows = deps.fitTagRows;
        const initUpdateSortControls = deps.initUpdateSortControls;

        function setSearchResultsCount(count) {
            const resultsCountDisplay = doc.getElementById('results-count');
            if (!resultsCountDisplay) return;
            resultsCountDisplay.classList.remove('hidden');
            const value = resultsCountDisplay.querySelector('.freecat-results-count-value');
            if (value) {
                value.textContent = String(count);
            } else {
                resultsCountDisplay.textContent = String(count);
            }
            resultsCountDisplay.dataset.countReady = 'true';
            resultsCountDisplay.setAttribute('aria-label', `${count} results`);
        }

        function setSearchHeaderMode(hasSearchTerm) {
            const emptyPrompt = doc.getElementById('search-empty-prompt');
            const activeQuery = doc.getElementById('search-active-query');
            const resultsCountDisplay = doc.getElementById('results-count');
            if (emptyPrompt) emptyPrompt.classList.toggle('hidden', hasSearchTerm);
            if (activeQuery) activeQuery.classList.toggle('hidden', !hasSearchTerm);
            if (resultsCountDisplay && !hasSearchTerm) {
                resultsCountDisplay.classList.add('hidden');
                resultsCountDisplay.dataset.countReady = 'false';
                resultsCountDisplay.setAttribute('aria-label', 'Loading results');
            }
        }

        function getSearchPageLocationKey() {
            return win.location.pathname + win.location.search;
        }

        // 在搜索页渲染完整结果卡片
        function renderSearchPageResults(results, searchResultsContainer) {
            if (!searchResultsContainer) return;

            const html = searchCore.renderSearchResultCards(results);

            unobserveDeferredImages(searchResultsContainer);
            searchResultsContainer.innerHTML = html;
            fitTagRows();
            initDeferredImages();
            initUpdateSortControls();
        }

        async function initSearchPageResults() {
            const searchResultsContainer = doc.getElementById('search-results');
            const currentQueryDisplay = doc.getElementById('current-query');
            const noResultsDisplay = doc.getElementById('no-results');
            if (!searchResultsContainer || !currentQueryDisplay) return false;

            const locationKey = getSearchPageLocationKey();
            const urlParams = new URLSearchParams(win.location.search);
            const query = urlParams.get('q');
            const tag = urlParams.get('tag');

            if (!query && !tag) {
                setSearchHeaderMode(false);
                currentQueryDisplay.textContent = '';
                return true;
            }

            setSearchHeaderMode(true);
            const searchTerm = query || tag;
            const isTagSearch = !!tag;
            const isUntaggedSearch = isTagSearch && searchTerm === '__untagged__';

            if (isUntaggedSearch) {
                currentQueryDisplay.textContent = '未打标签';
            } else if (isTagSearch) {
                currentQueryDisplay.textContent = `# ${searchTerm} `;
            } else {
                currentQueryDisplay.textContent = searchTerm;
            }

            const loadResults = isTagSearch
                ? loadTagIndex().then(index => {
                    const results = searchCore.getPostsByTag(searchTerm, index);
                    if (results.length || index) return results;
                    return loadSearchIndex().then(posts => searchCore.searchPosts(searchTerm, posts, true));
                })
                : loadSearchIndex().then(posts => searchCore.searchPosts(searchTerm, posts, false));

            const results = await loadResults;
            // 等待索引期间用户可能已离开 / 软导航走人，丢弃过期渲染。
            if (locationKey !== getSearchPageLocationKey()) return false;
            if (doc.getElementById('search-results') !== searchResultsContainer) return false;

            setSearchResultsCount(results.length);

            if (results.length === 0) {
                unobserveDeferredImages(searchResultsContainer);
                searchResultsContainer.innerHTML = '';
                if (noResultsDisplay) noResultsDisplay.classList.remove('hidden');
            } else {
                if (noResultsDisplay) noResultsDisplay.classList.add('hidden');
                renderSearchPageResults(results, searchResultsContainer);
            }
            return true;
        }

        initSearchPageResults();
    }

    root.FreecatSearchPage = { init };
}(typeof self !== 'undefined' ? self : this));
