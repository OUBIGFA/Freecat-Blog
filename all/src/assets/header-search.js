/* header-search.js
 * 顶栏搜索面板 + 标签菜单：滑入式输入、实时过滤、overlay 结果展示、
 * 预渲染标签菜单的展开/关闭、外壳 iframe 内点击时收起面板。
 * 依赖全局：无（所有依赖经 init 注入）。
 * init() 返回 { closeHeaderSearch, closeTagMenu }，供 nav-audio / shell-router 联动收起。
 */
(function (root) {
    'use strict';

    function init(deps) {
        const win = deps.window;
        const doc = deps.document;
        const shared = deps.shared;
        const searchCore = deps.searchCore;
        const loadSearchIndex = deps.loadSearchIndex;
        const { initDeferredImages, unobserveDeferredImages } = deps.lazyImages;
        const fitTagRows = deps.fitTagRows;
        const navigateWithinSite = deps.navigateWithinSite;
        const isShell = !!deps.isShell;
        const contentFrame = deps.contentFrame;

        const searchToggle = doc.getElementById('search-toggle');
        const searchClose = doc.getElementById('search-close');
        const searchContainer = doc.getElementById('search-container');
        const searchInput = doc.getElementById('search-input');
        const navLinks = doc.getElementById('nav-links');
        const tagMenuToggle = doc.getElementById('tag-menu-toggle');
        const tagMenu = doc.getElementById('tag-menu');
        const tagMenuItems = tagMenu ? tagMenu.querySelector('[data-tag-menu-items]') : null;

        let tagMenuBuilt = false;
        const dropdownCloseMs = deps.getCssDurationMs('--dropdown-close-dur', 150);
        const panelCloseMs = deps.getCssDurationMs('--panel-close-dur', 350);

        // ===== overlay 结果展示 =====

        function ensureSearchResultsOverlay() {
            let overlay = doc.getElementById('search-results-overlay');
            if (!overlay) {
                overlay = doc.createElement('div');
                overlay.id = 'search-results-overlay';
                overlay.className = 'fixed inset-x-0 bottom-0 z-40 bg-white/85 dark:bg-[#0b0f1a]/85 backdrop-blur-2xl backdrop-saturate-150 overflow-y-auto';
                overlay.dataset.open = 'false';
                doc.body.appendChild(overlay);
            }
            updateSearchOverlayOffset(overlay);
            overlay.dataset.open = 'true';
            return overlay;
        }

        function resetSearchResultsOverlay(overlay) {
            overlay.innerHTML = '';
            overlay.dataset.open = 'false';
            if (overlay.dataset.prebuilt === 'true') {
                updateSearchOverlayOffset(overlay);
            } else {
                overlay.remove();
            }
        }

        function updateSearchOverlayOffset(overlay) {
            const header = doc.querySelector('header');
            const offset = header ? header.offsetHeight : 0;
            overlay.style.top = `${offset}px`;
            overlay.style.height = `calc(100vh - ${offset}px)`;
        }

        function displaySearchResults(results, query) {
            const overlay = ensureSearchResultsOverlay();
            unobserveDeferredImages(overlay);
            if (results.length === 0) {
                overlay.innerHTML = `
                    <div data-search-results-content class="freecat-search-results">
                        <div class="freecat-search-results-heading"><h2>没有找到相关文章</h2></div>
                        <p class="freecat-search-hint">试试其他关键词。</p>
                    </div>`;
                return;
            }

            // 与首页共用文章组件和样式，搜索只调整列表宽度与条目间距。
            const resultsHtml = searchCore.renderSearchResultCards(results, { layout: 'reading-list' });
            overlay.innerHTML = `
                <div data-search-results-content class="freecat-search-results">
                    <div class="freecat-search-results-heading">
                        <h2>搜索结果<span class="freecat-search-count">${results.length} 篇</span></h2>
                        <a href="/search?q=${encodeURIComponent(query)}">查看全部</a>
                    </div>
                    <div class="freecat-search-result-list">${resultsHtml}</div>
                </div>`;
            initDeferredImages();
            fitTagRows();
        }

        function closeSearchResults(immediate = false) {
            const overlay = doc.getElementById('search-results-overlay');
            if (!overlay) return;
            const keepBlankOverlay = searchContainer
                && doc.body.classList.contains('search-active')
                && (searchContainer.dataset.open === 'true' || searchContainer.classList.contains('flex'));
            if (keepBlankOverlay) {
                overlay.innerHTML = '';
                updateSearchOverlayOffset(overlay);
                overlay.dataset.open = 'true';
                return;
            }
            overlay.dataset.open = 'false';
            if (immediate) {
                resetSearchResultsOverlay(overlay);
                return;
            }
            setTimeout(() => {
                if (overlay.dataset.open === 'false') {
                    resetSearchResultsOverlay(overlay);
                }
            }, panelCloseMs);
        }

        function closeHeaderSearch(immediate = false) {
            if (!searchContainer || !searchToggle) return;
            searchContainer.dataset.open = 'false';
            searchToggle.dataset.uiState = 'idle';
            doc.body.classList.remove('search-active');
            if (searchInput) {
                searchInput.value = '';
                searchInput.blur();
            }
            closeSearchResults(immediate);
            const finishClose = () => {
                searchContainer.classList.add('hidden');
                searchContainer.classList.remove('flex');
            };
            if (immediate) {
                finishClose();
            } else {
                setTimeout(finishClose, panelCloseMs);
            }
        }

        win.addEventListener('resize', () => {
            const overlay = doc.getElementById('search-results-overlay');
            if (overlay) updateSearchOverlayOffset(overlay);
        });

        // ===== 标签菜单 =====
        // 顶栏「查看标签」菜单已在构建期预渲染进 header（点击即展开，零网络 / 零计算）。
        // 标签聚合与菜单 HTML 统一走 shared，构建期与浏览器期同源，避免两端实现漂移。

        function renderTagMenu(tags) {
            if (!tagMenuItems) return;
            tagMenuItems.innerHTML = shared.renderTagMenuItemsHtml(tags);
        }

        async function buildTagMenu() {
            if (tagMenuBuilt) return;
            // 预渲染已就位：菜单项已在 DOM 中，直接复用，无需任何请求或渲染。
            if (tagMenuItems && tagMenuItems.querySelector('.tag-menu-item')) {
                tagMenuBuilt = true;
                return;
            }
            // 兜底：仅当预渲染缺失时才拉取索引补齐（此路径不阻塞菜单展开）。
            const posts = await loadSearchIndex();
            renderTagMenu(shared.collectMenuTags(posts));
            tagMenuBuilt = true;
        }

        function setTagMenuOpen(open) {
            if (!tagMenu || !tagMenuToggle) return;
            tagMenuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            tagMenu.classList.toggle('is-open', open);
            tagMenu.classList.remove('is-closing');
        }

        function closeTagMenu() {
            if (!tagMenu || !tagMenuToggle || !tagMenu.classList.contains('is-open')) return;
            tagMenuToggle.setAttribute('aria-expanded', 'false');
            tagMenu.classList.remove('is-open');
            tagMenu.classList.add('is-closing');
            setTimeout(() => tagMenu.classList.remove('is-closing'), dropdownCloseMs);
        }

        if (tagMenuToggle && tagMenu) {
            tagMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const willOpen = !tagMenu.classList.contains('is-open');
                if (!willOpen) {
                    closeTagMenu();
                    return;
                }
                closeHeaderSearch(true);
                setTagMenuOpen(true);   // 立即展开：标签项已在 DOM 中（构建期预渲染）
                buildTagMenu();         // 兜底补齐；预渲染就位时为同步空操作，不阻塞展开
            });

            tagMenu.addEventListener('click', (e) => {
                if (e.target.closest('a')) closeTagMenu();
            });

            doc.addEventListener('click', (e) => {
                if (!tagMenu.classList.contains('is-open')) return;
                if (tagMenu.contains(e.target) || tagMenuToggle.contains(e.target)) return;
                closeTagMenu();
            });

            doc.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeTagMenu();
            });
        }

        // ===== 外壳 iframe 内 pointerdown 时收起顶栏面板 =====

        let headerFramePointerDownDocument = null;

        function closeHeaderPanelsFromFramePointerDown() {
            closeTagMenu();
            closeHeaderSearch(true);
        }

        function bindHeaderFramePointerDown() {
            if (!isShell || !contentFrame) return;
            let frameDocument;
            try {
                frameDocument = contentFrame.contentDocument;
            } catch (err) {
                return;
            }
            if (!frameDocument || frameDocument === headerFramePointerDownDocument) return;
            if (headerFramePointerDownDocument) {
                headerFramePointerDownDocument.removeEventListener('pointerdown', closeHeaderPanelsFromFramePointerDown, true);
            }
            headerFramePointerDownDocument = frameDocument;
            headerFramePointerDownDocument.addEventListener('pointerdown', closeHeaderPanelsFromFramePointerDown, true);
        }

        if (isShell && contentFrame) {
            contentFrame.addEventListener('load', bindHeaderFramePointerDown);
            bindHeaderFramePointerDown();
        }

        // ===== 搜索面板交互 =====

        if (searchToggle && searchContainer && navLinks) {
            searchContainer.classList.add('t-panel-slide');
            searchContainer.dataset.open = 'false';
            searchToggle.dataset.uiState = 'idle';
            searchToggle.addEventListener('click', async () => {
                closeTagMenu();
                searchContainer.classList.remove('hidden');
                searchContainer.classList.add('flex');
                searchToggle.dataset.uiState = 'active';
                doc.body.classList.add('search-active');
                requestAnimationFrame(() => {
                    if (!searchContainer.classList.contains('flex') || !doc.body.classList.contains('search-active')) return;
                    searchContainer.dataset.open = 'true';
                    ensureSearchResultsOverlay();
                });
                searchInput.focus();
                await loadSearchIndex();
            });

            if (searchClose) {
                searchClose.addEventListener('click', () => {
                    closeHeaderSearch();
                    searchToggle.focus({ preventScroll: true });
                });
            }

            // 实时搜索
            let searchTimeout;
            let searchRequestSeq = 0;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                const requestSeq = ++searchRequestSeq;
                searchTimeout = setTimeout(async () => {
                    const query = searchInput.value;
                    if (query.length >= 2) {
                        const posts = await loadSearchIndex();
                        const searchIsStillOpen = searchContainer.dataset.open === 'true' || searchContainer.classList.contains('flex');
                        if (requestSeq !== searchRequestSeq || searchInput.value !== query || !searchIsStillOpen) return;
                        const results = searchCore.searchPosts(query, posts);
                        displaySearchResults(results, query);
                    } else {
                        searchRequestSeq += 1;
                        closeSearchResults();
                    }
                }, 200);
            });

            // 按 ESC 关闭搜索
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeHeaderSearch();
                    searchToggle.focus({ preventScroll: true });
                }
                // 按 Enter 跳转到搜索页
                if (e.key === 'Enter' && searchInput.value.trim()) {
                    e.preventDefault();
                    navigateWithinSite(`/search?q=${encodeURIComponent(searchInput.value.trim())}`);
                    closeHeaderSearch(true);
                }
            });

            // 点击外部关闭搜索
            doc.addEventListener('click', (e) => {
                const isSearchActive = searchContainer.dataset.open === 'true' || searchContainer.classList.contains('flex');
                if (!isSearchActive) return;

                const overlay = doc.getElementById('search-results-overlay');

                // 1. 如果点击了背景遮罩层（overlay 本身）
                if (e.target === overlay) {
                    closeHeaderSearch(true);
                    return;
                }

                // 2. 如果容器内没有显示结果（即还没有 overlay），且点击了搜索区域之外的地方
                const clickedInsideSearch = searchContainer.contains(e.target) || searchToggle.contains(e.target);
                if (!clickedInsideSearch) {
                    const resultsContent = overlay && overlay.querySelector('[data-search-results-content]');
                    if (!resultsContent || !resultsContent.contains(e.target)) {
                        closeHeaderSearch(true);
                        return;
                    }
                }
                if (!clickedInsideSearch && !overlay) {
                    closeHeaderSearch(true);
                    return;
                }

                // 3. 如果显示了 overlay，点击了 overlay 内部但非结果卡片区域
                if (overlay && overlay.contains(e.target)) {
                    // 检查是否点击在结果列表容器（居中限制宽度的那个 div）之外
                    const resultsWrapper = overlay.querySelector('.max-w-\\[1200px\\]');
                    if (resultsWrapper && !resultsWrapper.contains(e.target)) {
                        closeHeaderSearch(true);
                    }
                }
            });
        }

        return { closeHeaderSearch, closeTagMenu };
    }

    root.FreecatHeaderSearch = { init };
}(typeof self !== 'undefined' ? self : this));
