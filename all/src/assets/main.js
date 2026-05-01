document.addEventListener('DOMContentLoaded', () => {
    // 0. 代码块复制功能
    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        return new Promise((resolve, reject) => {
            try {
                document.execCommand('copy') ? resolve() : reject(new Error('Copy failed'));
            } catch (err) {
                reject(err);
            } finally {
                textarea.remove();
            }
        });
    }

    document.addEventListener('change', (e) => {
        if (!e.target.classList.contains('copy-checkbox')) return;
        const checkbox = e.target;
        if (!checkbox.checked) return;

        const container = checkbox.closest('.code-block-container');
        if (!container) {
            checkbox.checked = false;
            return;
        }

        const codeElement = container.querySelector('.code-content code') ||
            container.querySelector('pre code') ||
            container.querySelector('code');
        if (!codeElement) {
            checkbox.checked = false;
            return;
        }

        const code = codeElement.textContent || '';
        copyText(code).then(() => {
            setTimeout(() => {
                checkbox.checked = false;
            }, 1000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            checkbox.checked = false;
        });
    });
    const themeToggleBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;

    function normalizeMermaidBlocks() {
        const selector = [
            'pre > code.language-mermaid',
            'pre > code.lang-mermaid',
            'pre > code.mermaid'
        ].join(',');
        const mermaidCodeBlocks = document.querySelectorAll(selector);

        mermaidCodeBlocks.forEach((code) => {
            if (code.closest('.mermaid')) return;

            const sourceCode = code.textContent || '';
            const mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid';
            mermaidDiv.setAttribute('data-mermaid-source', sourceCode);
            mermaidDiv.textContent = sourceCode;

            const container = code.closest('.code-block-container');
            if (container) {
                container.replaceWith(mermaidDiv);
                return;
            }

            const pre = code.closest('pre');
            if (pre) {
                pre.replaceWith(mermaidDiv);
                return;
            }

            code.replaceWith(mermaidDiv);
        });
    }

    function getBeautifulMermaidApi() {
        return window.beautifulMermaid || window.__mermaid || null;
    }

    function getBeautifulMermaidTheme() {
        const isDark = html.classList.contains('dark');
        return {
            bg: isDark ? '#101622' : '#f6f6f8',
            fg: isDark ? '#e2e8f0' : '#111318',
            line: isDark ? '#8b9bb3' : '#475569',
            accent: isDark ? '#38bdf8' : '#2563eb',
            muted: isDark ? '#94a3b8' : '#64748b',
            surface: isDark ? '#1A2332' : '#ffffff',
            border: isDark ? '#2a3648' : '#d7dde5',
            font: 'Inter, ui-sans-serif, system-ui, sans-serif',
            padding: 32,
            nodeSpacing: 28,
            layerSpacing: 46,
            transparent: true
        };
    }

    async function initMermaid() {
        const api = getBeautifulMermaidApi();
        if (!api || typeof api.renderMermaid !== 'function') return;

        normalizeMermaidBlocks();

        const mermaidDivs = document.querySelectorAll('.mermaid');
        const theme = getBeautifulMermaidTheme();

        for (const div of mermaidDivs) {
            let sourceCode = div.getAttribute('data-mermaid-source');
            if (!sourceCode) {
                sourceCode = div.innerText;
                div.setAttribute('data-mermaid-source', sourceCode);
            }

            try {
                const svg = await api.renderMermaid(sourceCode, theme);
                div.innerHTML = svg;
                div.removeAttribute('data-processed');
            } catch (err) {
                console.error('Beautiful Mermaid rendering error:', err);
                div.innerHTML = `<pre class="mermaid-error">Mermaid 渲染失败，请检查图表语法。</pre>`;
            }
        }
    }
    // Replace broken images with fallback.
    document.addEventListener('error', (e) => {
        const target = e.target;
        if (!target || target.tagName !== 'IMG') return;
        const fallback = '/image/404.png';
        if (target.dataset.fallbackApplied === 'true') return;
        if (target.src && target.src.indexOf(fallback) !== -1) return;
        target.dataset.fallbackApplied = 'true';
        target.removeAttribute('srcset');
        target.src = fallback;
    }, true);

    // === Animation Utilities ===
    const animationStyleId = 'global-animation-styles';
    function ensureAnimationStyles() {
        if (document.getElementById(animationStyleId)) return;
        const style = document.createElement('style');
        style.id = animationStyleId;
        style.textContent = `
            :root {
                --dropdown-open-dur: 250ms;
                --dropdown-close-dur: 150ms;
                --dropdown-pre-scale: 0.97;
                --dropdown-closing-scale: 0.99;
                --dropdown-ease: cubic-bezier(0.22, 1, 0.36, 1);
                --panel-open-dur: 400ms;
                --panel-close-dur: 350ms;
                --panel-translate-y: 32px;
                --panel-blur: 2px;
                --panel-ease: cubic-bezier(0.22, 1, 0.36, 1);
                --page-slide-dur: 200ms;
                --page-fade-dur: 200ms;
                --page-slide-distance: 8px;
                --page-blur: 3px;
                --page-slide-ease: cubic-bezier(0.22, 1, 0.36, 1);
                --page-fade-ease: cubic-bezier(0.22, 1, 0.36, 1);
                --icon-swap-dur: 200ms;
                --icon-swap-blur: 2px;
                --icon-swap-start-scale: 0.25;
                --icon-swap-ease: ease-in-out;
            }
            @keyframes fadeInUp {
                from { opacity: 0; transform: translate3d(0, 10px, 0); }
                to { opacity: 1; transform: translate3d(0, 0, 0); }
            }
            .animate-fade-in-up {
                animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                opacity: 0;
            }
            .t-panel-slide {
                transform: translateY(var(--panel-translate-y));
                opacity: 0;
                filter: blur(var(--panel-blur));
                pointer-events: none;
                transition:
                    transform var(--panel-close-dur) var(--panel-ease),
                    opacity var(--panel-close-dur) var(--panel-ease),
                    filter var(--panel-close-dur) var(--panel-ease);
                will-change: transform, opacity, filter;
            }
            .t-panel-slide[data-open="true"] {
                transform: translateY(0);
                opacity: 1;
                filter: blur(0);
                pointer-events: auto;
                transition:
                    transform var(--panel-open-dur) var(--panel-ease),
                    opacity var(--panel-open-dur) var(--panel-ease),
                    filter var(--panel-open-dur) var(--panel-ease);
            }
            .t-dropdown {
                transform-origin: top right;
                transform: scale(var(--dropdown-pre-scale));
                opacity: 0;
                pointer-events: none;
                transition:
                    transform var(--dropdown-open-dur) var(--dropdown-ease),
                    opacity var(--dropdown-open-dur) var(--dropdown-ease);
                will-change: transform, opacity;
            }
            .t-dropdown[data-origin="top-left"] { transform-origin: top left; }
            .t-dropdown[data-origin="top-center"] { transform-origin: top center; }
            .t-dropdown[data-origin="top-right"] { transform-origin: top right; }
            .t-dropdown[data-origin="bottom-left"] { transform-origin: bottom left; }
            .t-dropdown[data-origin="bottom-center"] { transform-origin: bottom center; }
            .t-dropdown[data-origin="bottom-right"] { transform-origin: bottom right; }
            .t-dropdown.is-open {
                transform: scale(1);
                opacity: 1;
                pointer-events: auto;
            }
            .t-dropdown.is-closing {
                transform: scale(var(--dropdown-closing-scale));
                opacity: 0;
                pointer-events: none;
                transition:
                    transform var(--dropdown-close-dur) var(--dropdown-ease),
                    opacity var(--dropdown-close-dur) var(--dropdown-ease);
            }
            .page-transitioning-out {
                opacity: 0;
                transform: translateX(calc(var(--page-slide-distance) * -1));
                filter: blur(var(--page-blur));
                transition:
                    opacity var(--page-fade-dur) var(--page-fade-ease),
                    transform var(--page-slide-dur) var(--page-slide-ease),
                    filter var(--page-slide-dur) var(--page-slide-ease);
            }
            .page-transitioning-in {
                animation: pageSlideIn var(--page-slide-dur) var(--page-slide-ease) both;
            }
            @keyframes pageSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(var(--page-slide-distance));
                    filter: blur(var(--page-blur));
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                    filter: blur(0);
                }
            }
            .icon-breathe {
                transition:
                    transform var(--icon-swap-dur) var(--icon-swap-ease),
                    opacity var(--icon-swap-dur) var(--icon-swap-ease),
                    filter var(--icon-swap-dur) var(--icon-swap-ease);
                will-change: transform, opacity, filter;
            }
            body.search-active {
                overflow: hidden !important;
            }
            body.search-active .page-blur-target {
                filter: blur(4px);
                opacity: 0.22;
                pointer-events: none;
                transition:
                    filter var(--page-slide-dur) var(--page-slide-ease),
                    opacity var(--page-fade-dur) var(--page-fade-ease);
                position: relative;
            }
            body.search-active .page-blur-target::before {
                content: '';
                position: fixed;
                inset: 0;
                background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.62) 0%, rgba(255, 255, 255, 0.94) 100%);
                pointer-events: none;
                z-index: 1;
            }
            .dark body.search-active .page-blur-target::before,
            .dark.search-active .page-blur-target::before {
                background: radial-gradient(ellipse at center, rgba(8, 12, 20, 0.5) 0%, rgba(8, 12, 20, 0.82) 100%);
            }
            body.search-active .header-blur-target {
                opacity: 0;
                pointer-events: none;
                transition: opacity var(--page-fade-dur) var(--page-fade-ease);
            }
            body.search-active header {
                transition: height var(--page-slide-dur) var(--page-slide-ease);
            }
            #search-results-overlay {
                backdrop-filter: blur(10px);
                overflow-y: auto;
                pointer-events: auto;
                transition:
                    opacity var(--panel-open-dur) var(--panel-ease),
                    transform var(--panel-open-dur) var(--panel-ease),
                    filter var(--panel-open-dur) var(--panel-ease);
            }
            @media (prefers-reduced-motion: reduce) {
                .animate-fade-in-up { animation: none !important; opacity: 1 !important; }
                .t-panel-slide,
                .t-dropdown,
                .page-transitioning-out,
                .page-transitioning-in,
                .icon-breathe,
                #search-results-overlay,
                body.search-active .page-blur-target,
                body.search-active .header-blur-target,
                body.search-active header {
                    transition: none !important;
                    animation: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function applyStaggeredAnimations(selector, delayStep = 120) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            el.classList.remove('animate-fade-in-up'); // Reset if exists
            void el.offsetWidth; // Trigger reflow
            el.classList.add('animate-fade-in-up');
            el.style.animationDelay = `${index * delayStep}ms`;
        });
    }

    function getCssDurationMs(variableName, fallback) {
        const raw = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
        if (!raw) return fallback;
        if (raw.endsWith('ms')) return parseFloat(raw);
        if (raw.endsWith('s')) return parseFloat(raw) * 1000;
        return fallback;
    }

    // === 1. 主题系统核心逻辑 ===
    // (使用已声明的 themeToggleBtn 和 html)


    // 统一主题应用逻辑
    function applyTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);

        if (isDark) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        if (themeToggleBtn) {
            themeToggleBtn.dataset.uiState = isDark ? 'dark' : 'light';
        }

        // 更新标签颜色
        updateTagColors();

        // 更新 Mermaid 主题 (如果已加载)
        if (getBeautifulMermaidApi()) {
            initMermaid();
        }
    }

    // 标签颜色更新函数
    function updateTagColors() {
        const isDark = html.classList.contains('dark');
        document.querySelectorAll('.tag-span').forEach(tag => {
            const bg = tag.getAttribute(isDark ? 'data-bg-dark' : 'data-bg-light');
            const text = tag.getAttribute(isDark ? 'data-text-dark' : 'data-text-light');
            if (bg && text) {
                tag.style.background = bg;
                tag.style.color = text;
            }
        });
    }

    // 初始执行
    applyTheme();
    ensureAnimationStyles(); // Ensure global animation styles are present

    // Apply staggered animation to existing post cards on load
    if (document.getElementById('posts-list')) {
        applyStaggeredAnimations('.post-card');
    }

    // 监听主题切换按钮
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const willBeDark = !html.classList.contains('dark');
            localStorage.setItem('theme', willBeDark ? 'dark' : 'light');
            applyTheme();
        });
    }

    // 核心：处理 bfcache (由于浏览器缓存页面，点击“后退”时可能不会重新触发 DOMContentLoaded)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            applyTheme();
        }
    });

    // 核心：处理多标签页同步
    window.addEventListener('storage', (event) => {
        if (event.key === 'theme') {
            applyTheme();
        }
    });

    // 确保 Mermaid 在合适时机初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMermaid);
    } else {
        initMermaid();
    }

    // 3. 无感分页实现
    const postsList = document.getElementById('posts-list');
    const paginationContainer = document.getElementById('pagination-buttons');
    const pageTransitionInMs = getCssDurationMs('--page-slide-dur', 200);

    if (postsList && paginationContainer) {
        // 核心跳转逻辑复用
        async function navigateTo(url) {
            try {
                // 添加加载动画效果 - Faster transition
                postsList.classList.remove('page-transitioning-in');
                postsList.classList.add('page-transitioning-out');

                const response = await fetch(url);
                const htmlText = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, 'text/html');

                const newPosts = doc.getElementById('posts-list').innerHTML;
                const newPagination = doc.getElementById('pagination-buttons').innerHTML;

                // 更新内容
                postsList.innerHTML = newPosts;
                paginationContainer.innerHTML = newPagination;
                fitTagRows();

                // 恢复显示
                postsList.classList.remove('page-transitioning-out');
                postsList.classList.add('page-transitioning-in');
                setTimeout(() => {
                    postsList.classList.remove('page-transitioning-in');
                }, pageTransitionInMs + 40);

                // Trigger staggered animation for new content
                applyStaggeredAnimations('#posts-list .post-card');

                // 更新浏览器地址栏
                window.history.pushState({}, '', url);

                // 平滑滚动回到列表顶部
                const viewAllHeader = document.getElementById('view-all-header');
                const scrollTarget = viewAllHeader || postsList;

                if (scrollTarget) {
                    const offset = window.innerWidth < 768 ? 70 : 120; // Account for fixed header + spacing
                    const top = scrollTarget.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            } catch (err) {
                console.error('Seamless pagination failed:', err);
                window.location.href = url; // 失败时降级到普通跳转
            }
        }

        // 监听点击（上一页、下一页、数字页码）
        paginationContainer.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link || link.getAttribute('href') === '#' || link.classList.contains('opacity-50')) return;

            e.preventDefault();
            navigateTo(link.href);
        });

        // 监听输入框的回车跳转
        paginationContainer.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' && e.key === 'Enter') {
                const input = e.target;
                const val = parseInt(input.value);
                const max = parseInt(input.getAttribute('max'));
                if (val >= 1 && val <= max) {
                    const url = val === 1 ? '/' : `/page/${val}/`;
                    navigateTo(url);
                }
            }
        });
        // Mobile: blur pagination input when tapping outside to avoid zoom lock.
        document.addEventListener('click', (e) => {
            const active = document.activeElement;
            if (!active || active.tagName !== 'INPUT' || active.getAttribute('type') !== 'number') return;
            if (!paginationContainer.contains(active)) return;
            if (paginationContainer.contains(e.target)) return;
            active.blur();
        });
    }

    // === 4. 搜索功能实现 ===
    const searchToggle = document.getElementById('search-toggle');
    const searchClose = document.getElementById('search-close');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const navLinks = document.getElementById('nav-links');

    let searchIndex = null;
    const dropdownCloseMs = getCssDurationMs('--dropdown-close-dur', 150);
    const panelCloseMs = getCssDurationMs('--panel-close-dur', 350);
    const searchBlurStyleId = 'search-blur-style';
    function ensureSearchBlurStyles() {
        if (document.getElementById(searchBlurStyleId)) return;
        const style = document.createElement('style');
        style.id = searchBlurStyleId;
        style.textContent = `
            /* Header Expansion & Transition - Snappy 0.2s */
            body.search-active {
                overflow: hidden !important;
            }
            header {
                overflow: visible;
            }

            /* Center Search Box & Scale Up */
            .search-active #search-container {
                position: fixed;
                top: 1.25rem;
                left: 50%;
                right: auto;
                transform: translateX(-50%);
                width: min(720px, calc(100vw - 2rem));
                max-width: 720px;
                justify-content: center;
                z-index: 80;
                padding: 0.375rem;
                background: rgba(255, 255, 255, 0.96);
                border: 1px solid rgba(226, 232, 240, 0.95);
                box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
                backdrop-filter: blur(18px);
            }
            .dark .search-active #search-container {
                background: rgba(15, 23, 42, 0.92);
                border-color: rgba(51, 65, 85, 0.95);
                box-shadow: 0 24px 60px rgba(2, 6, 23, 0.45);
            }
            
            /* Blur & Hide other elements - Optimized Performance 0.2s */
            .search-active .page-blur-target {
                filter: blur(4px);
                opacity: 0.18;
                pointer-events: none;
                transition: filter 0.2s cubic-bezier(0.2, 0, 0, 1), opacity 0.2s cubic-bezier(0.2, 0, 0, 1);
                position: relative;
            }
            
            /* 白色渐变遮罩层 - 浅色模式更白、更实 */
            .search-active .page-blur-target::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(
                    ellipse at center,
                    rgba(255, 255, 255, 0.65) 0%,
                    rgba(255, 255, 255, 0.95) 100%
                );
                pointer-events: none;
                z-index: 1;
            }
            
            .dark .search-active .page-blur-target::before {
                background: radial-gradient(
                    ellipse at center,
                    rgba(0, 0, 0, 0.45) 0%,
                    rgba(0, 0, 0, 0.8) 100%
                );
            }
            .search-active .header-blur-target {
                opacity: 1;
                pointer-events: auto;
            }

            /* Adjust Search Results Position */
             #search-results-overlay {
                position: fixed;
                inset-inline: 0;
                bottom: 0;
                backdrop-filter: blur(10px);
                background-color: rgba(255, 255, 255, 0.8) !important;
                overflow-y: auto;
                pointer-events: auto;
            }
            .dark #search-results-overlay {
                background-color: rgba(11, 15, 26, 0.8) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 按需加载搜索索引
    async function loadSearchIndex() {
        if (searchIndex) return searchIndex;
        try {
            const response = await fetch('/search-index.json');
            searchIndex = await response.json();
            return searchIndex;
        } catch (err) {
            console.error('Failed to load search index:', err);
            return [];
        }
    }

    // 搜索函数：支持精确匹配和模糊匹配
    function searchPosts(query, posts, isTagSearch = false) {
        if (!query.trim()) return [];
        const q = query.toLowerCase().trim();

        const filtered = posts.filter(post => {
            const tags = (post.tags || []).map(t => t.toLowerCase());

            if (isTagSearch) {
                return tags.includes(q);
            }

            const title = (post.title || '').toLowerCase();
            const excerpt = (post.excerpt || '').toLowerCase();
            const content = (post.content || '').toLowerCase();
            const tagsStr = tags.join(' ');

            // 精确匹配优先
            if (title.includes(q) || excerpt.includes(q) || content.includes(q) || tagsStr.includes(q)) {
                return true;
            }

            // 模糊匹配
            const words = q.split(/\s+/);
            return words.every(word =>
                title.includes(word) || excerpt.includes(word) || content.includes(word) || tagsStr.includes(word)
            );
        });

        // 统一排序逻辑：按置顶、日期降序
        return filtered.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.date) - new Date(a.date);
        }).slice(0, isTagSearch ? 100 : 20); // 标签搜索显示更多
    }

    // 搜索 UI 切换
    if (searchToggle && searchContainer && navLinks) {
        searchContainer.classList.add('t-panel-slide');
        searchContainer.dataset.open = 'false';
        searchToggle.dataset.uiState = 'idle';
        ensureSearchBlurStyles();
        searchToggle.addEventListener('click', async () => {
            searchContainer.classList.remove('hidden');
            searchContainer.classList.add('flex');
            searchToggle.dataset.uiState = 'active';
            document.body.classList.add('search-active');
            requestAnimationFrame(() => {
                searchContainer.dataset.open = 'true';
            });
            searchInput.focus();
            await loadSearchIndex();
        });

        const hideSearch = (immediate = false) => {
            searchContainer.dataset.open = 'false';
            searchToggle.dataset.uiState = 'idle';
            document.body.classList.remove('search-active');
            searchInput.value = ''; // 自动清除内容
            searchInput.blur();
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
        };

        if (searchClose) {
            searchClose.addEventListener('click', hideSearch);
        }

        // 实时搜索
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                const query = searchInput.value;
                if (query.length >= 2) {
                    const results = searchPosts(query, searchIndex || []);
                    displaySearchResults(results, query);
                } else {
                    closeSearchResults();
                }
            }, 200);
        });

        // 按 ESC 关闭搜索
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                hideSearch();
            }
            // 按 Enter 跳转到搜索页
            if (e.key === 'Enter' && searchInput.value.trim()) {
                window.location.href = `/search.html?q=${encodeURIComponent(searchInput.value.trim())}`;
            }
        });

        // 点击外部关闭搜索
        document.addEventListener('click', (e) => {
            const isSearchActive = searchContainer.dataset.open === 'true' || searchContainer.classList.contains('flex');
            if (!isSearchActive) return;

            const overlay = document.getElementById('search-results-overlay');

            // 1. 如果点击了背景遮罩层（overlay 本身）
            if (e.target === overlay) {
                hideSearch();
                return;
            }

            // 2. 如果容器内没有显示结果（即还没有 overlay），且点击了搜索区域之外的地方
            const clickedInsideSearch = searchContainer.contains(e.target) || searchToggle.contains(e.target);
            if (!clickedInsideSearch && !overlay) {
                hideSearch();
                return;
            }

            // 3. 如果显示了 overlay，点击了 overlay 内部但非结果卡片区域
            if (overlay && overlay.contains(e.target)) {
                // 检查是否点击在结果列表容器（居中限制宽度的那个 div）之外
                const resultsWrapper = overlay.querySelector('.max-w-\\[1200px\\]');
                if (resultsWrapper && !resultsWrapper.contains(e.target)) {
                    hideSearch();
                }
            }
        });
    }

    // === 5. 搜索结果渲染辅助函数 ===
    // 统一生成带样式的标签 HTML，确保与 build.js 逻辑一致
    function generateTagsHtml(tags) {
        if (!tags) return '';
        function hashTagColor(tagName) {
            let hash = 0;
            const str = (tagName || 'default').toLowerCase();
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }
            const hue = Math.abs(hash % 360);
            return {
                bg: `hsl(${hue}, 70%, 95%)`,
                bgDark: `hsl(${hue}, 50%, 20%)`,
                text: `hsl(${hue}, 70%, 35%)`,
                textDark: `hsl(${hue}, 60%, 75%)`
            };
        }

        return (tags || []).map(tag => {
            const colors = hashTagColor(tag);
            // 使用直接内联样式确保标签有颜色和悬停效果
            return `<span class="tag-span relative z-10 inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer hover:brightness-95 transition-[filter] duration-200 ease-out whitespace-nowrap" 
                style="background: ${colors.bg}; color: ${colors.text};" 
                data-bg-light="${colors.bg}" data-text-light="${colors.text}" data-bg-dark="${colors.bgDark}" data-text-dark="${colors.textDark}"
                onclick="event.preventDefault(); event.stopPropagation(); window.location.href='/search.html?tag=' + encodeURIComponent('${tag.replace(/'/g, "\\'")}');">${escapeHtml(tag)}</span>`;
        }).join('');
    }

    // 显示搜索结果覆盖层
    function updateSearchOverlayOffset(overlay) {
        const header = document.querySelector('header');
        let offset = header ? header.offsetHeight + 8 : 0;
        const searchBox = document.getElementById('search-container');
        if (searchBox && !searchBox.classList.contains('hidden')) {
            const rect = searchBox.getBoundingClientRect();
            offset = Math.max(offset, rect.bottom + 16);
        }
        overlay.style.top = `${offset}px`;
        overlay.style.height = `calc(100vh - ${offset}px)`;
    }


    function fitTagRows() {
        const containers = document.querySelectorAll('.tags-fit');
        containers.forEach(container => {
            container.style.transform = 'none';
            container.style.transformOrigin = 'left center';
            container.style.willChange = 'transform';
            const available = container.clientWidth;
            const scroll = container.scrollWidth;
            if (available > 0 && scroll > available) {
                const scale = Math.max(0.1, available / scroll);
                container.style.transform = `scale(${scale})`;
            }
        });
    }

    function displaySearchResults(results, query) {
        let overlay = document.getElementById('search-results-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'search-results-overlay';
            overlay.className = 'fixed inset-x-0 bottom-0 z-40 bg-white/85 dark:bg-[#0b0f1a]/85 backdrop-blur-2xl backdrop-saturate-150 overflow-y-auto t-panel-slide';
            overlay.dataset.open = 'false';
            document.body.appendChild(overlay);
        }
        updateSearchOverlayOffset(overlay);
        overlay.dataset.open = 'true';

        if (results.length === 0) {
            overlay.innerHTML = `
                <div class="max-w-[1200px] mx-auto px-6 sm:px-8 py-10 text-center">
                    <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">search_off</span>
                    <p class="text-gray-500 dark:text-gray-400 text-lg">No results found for "<strong>${escapeHtml(query)}</strong>"</p>
                    <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Try different keywords</p>
                </div>
            `;
            return;
        }

        const renderer = window.PostCardTemplate && typeof window.PostCardTemplate.renderPostCard === 'function';
        const resultsHtml = results.map(post => {
            const tagsHtml = generateTagsHtml(post.tags);
            if (renderer) {
                return window.PostCardTemplate.renderPostCard({
                    link: post.link,
                    titleHtml: escapeHtml(post.title).replace(/\|/g, '<span class="font-normal mx-[1px]">|</span>'),
                    excerptHtml: escapeHtml(post.excerpt),
                    date: post.date,
                    modifiedDate: post.modifiedDate,
                    tagsHtml,
                    cover: post.cover,
                    pinned: post.pinned
                });
            }

            return `
            <a href="${post.link}" class="post-card block mb-6 md:mb-10 group cursor-pointer">
                    <div class="relative flex flex-col md:flex-row items-stretch justify-between gap-6 md:gap-8 rounded-2xl bg-white dark:bg-card-dark p-5 md:p-8 shadow-sm transition-shadow duration-300 ease-out group-hover:shadow-2xl group-hover:shadow-gray-400/20 dark:group-hover:shadow-black/40 md:h-80">
                        <div class="flex min-w-0 flex-1 flex-col justify-between overflow-hidden">
                            <div class="flex flex-col gap-3 md:gap-4">
                                <div class="flex flex-wrap items-center gap-3 md:gap-4 text-[#616f89] dark:text-gray-400 text-[10px] md:text-xs font-semibold">
                                    <div class="flex items-center gap-1.5">
                                        <span class="material-symbols-outlined text-sm md:text-base">calendar_today</span>
                                        <span>${post.date}</span>
                                    </div>
                                    <div class="flex flex-wrap gap-2">
                                        ${tagsHtml}
                                    </div>
                                </div>
                                <h3 class="text-[#111318] dark:text-slate-200 text-xl md:text-3xl font-black leading-tight line-clamp-2">
                                    ${escapeHtml(post.title).replace(/\|/g, '<span class="font-normal mx-[1px]">|</span>')}
                                </h3>
                                <p class="text-[#616f89] dark:text-gray-400 text-sm md:text-lg font-normal leading-relaxed line-clamp-3 md:line-clamp-3">${escapeHtml(post.excerpt)}</p>
                            </div>
                        </div>
                    </div>
            </a>`;
        }).join('');

        overlay.innerHTML = `
            <div class="max-w-[1200px] mx-auto px-5 sm:px-6 md:px-8 pt-2 pb-10 md:pt-4 md:pb-12">
                <div class="hidden md:flex md:flex-row md:items-center md:justify-between gap-2 mb-12">
                    <h2 class="text-lg md:text-xl font-bold text-[#111318] dark:text-slate-200 flex items-center">
                        Results for "${escapeHtml(query)}"
                        <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(${results.length} found)</span>
                    </h2>
                    <a href="/search.html?q=${encodeURIComponent(query)}" class="text-sm text-primary hover:underline">View all -></a>
                </div>
                ${resultsHtml}
            </div >
            `;
        // Animate search overlay results
        setTimeout(() => applyStaggeredAnimations('#search-results-overlay .post-card'), 0);
    }

    function closeSearchResults(immediate = false) {
        const overlay = document.getElementById('search-results-overlay');
        if (!overlay) return;
        overlay.dataset.open = 'false';
        if (immediate) {
            overlay.remove();
            return;
        }
        setTimeout(() => {
            if (overlay.dataset.open === 'false') {
                overlay.remove();
            }
        }, panelCloseMs);
    }

    window.addEventListener('resize', () => {
        const overlay = document.getElementById('search-results-overlay');
        if (overlay) updateSearchOverlayOffset(overlay);
    });

    // HTML 转义函数
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // === 5. 搜索页专属逻辑 ===
    // 如果在搜索页，从 URL 参数读取查询并执行搜索
    const searchResultsContainer = document.getElementById('search-results');
    const currentQueryDisplay = document.getElementById('current-query');
    const noResultsDisplay = document.getElementById('no-results');
    const resultsCountDisplay = document.getElementById('results-count');

    if (searchResultsContainer && currentQueryDisplay) {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        const tag = urlParams.get('tag');

        if (query || tag) {
            const searchTerm = query || tag;
            const isTagSearch = !!tag;

            if (currentQueryDisplay) {
                currentQueryDisplay.textContent = isTagSearch ? `# ${searchTerm} ` : searchTerm;
            }

            // 同步到搜索输入框 (仅对普通搜索同步)
            // if (searchInput && query) searchInput.value = query;

            // 加载索引并搜索
            loadSearchIndex().then(index => {
                const results = searchPosts(searchTerm, index, isTagSearch);

                if (resultsCountDisplay) {
                    resultsCountDisplay.textContent = `(${results.length} results)`;
                }

                if (results.length === 0) {
                    searchResultsContainer.innerHTML = '';
                    if (noResultsDisplay) noResultsDisplay.classList.remove('hidden');
                } else {
                    if (noResultsDisplay) noResultsDisplay.classList.add('hidden');
                    renderSearchPageResults(results);
                    // Animate search page results
                    setTimeout(() => applyStaggeredAnimations('#search-results .post-card'), 0);
                }
            });
        } else {
            currentQueryDisplay.textContent = '...';
            document.getElementById('search-query-display').innerHTML = '<p class="text-sm text-gray-600 dark:text-gray-400">Enter a search term in the search box above.</p>';
        }
    }

    // 在搜索页渲染完整结果卡片
    function renderSearchPageResults(results) {
        if (!searchResultsContainer) return;

        const renderer = window.PostCardTemplate && typeof window.PostCardTemplate.renderPostCard === 'function';
        const html = results.map(post => {
            const tagsHtml = generateTagsHtml(post.tags);
            if (renderer) {
                return window.PostCardTemplate.renderPostCard({
                    link: post.link,
                    titleHtml: escapeHtml(post.title).replace(/\|/g, '<span class="font-normal mx-[1px]">|</span>'),
                    excerptHtml: escapeHtml(post.excerpt),
                    date: post.date,
                    modifiedDate: post.modifiedDate,
                    tagsHtml,
                    cover: post.cover,
                    pinned: post.pinned
                });
            }

            return `
            < a href = "${post.link}" class="block mb-6 md:mb-10 group cursor-pointer" >
                <div class="relative flex flex-col md:flex-row items-stretch justify-between gap-6 md:gap-8 rounded-2xl bg-white dark:bg-card-dark p-5 md:p-8 shadow-sm transition-shadow duration-300 ease-out group-hover:shadow-2xl group-hover:shadow-gray-400/20 dark:group-hover:shadow-black/40 md:h-80">
                    <div class="flex min-w-0 flex-1 flex-col justify-between overflow-hidden">
                        <div class="flex flex-col gap-3 md:gap-4">
                            <div class="flex flex-wrap items-center gap-3 md:gap-4 text-[#616f89] dark:text-gray-400 text-[10px] md:text-xs font-semibold">
                                <div class="flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-sm md:text-base">calendar_today</span>
                                    <span>${post.date}</span>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    ${tagsHtml}
                                </div>
                            </div>
                            <h3 class="text-[#111318] dark:text-slate-200 text-xl md:text-3xl font-black leading-tight line-clamp-2">
                                ${escapeHtml(post.title).replace(/\|/g, '<span class="font-normal mx-[1px]">|</span>')}
                            </h3>
                            <p class="text-[#616f89] dark:text-gray-400 text-sm md:text-lg font-normal leading-relaxed line-clamp-3 md:line-clamp-3">${escapeHtml(post.excerpt)}</p>
                        </div>
                    </div>
                </div>
            </a > `;
        }).join('');

        searchResultsContainer.innerHTML = html;
        fitTagRows();
    }


    fitTagRows();

    // === 6. 头像动效阴影 (Avatar Dynamic Shadow) ===
    const heroAvatar = document.getElementById('hero-avatar');
    const avatarTriggerArea = document.getElementById('avatar-trigger-area');
    if (heroAvatar && avatarTriggerArea) {
        let isReset = true;
        let isSmoothPhase = false;
        let smoothTimer = null;

        // 检测当前是否为深色模式
        const isDarkMode = () => document.documentElement.classList.contains('dark');

        const handleMove = (e) => {
            const rect = heroAvatar.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const dx = centerX - mouseX;
            const dy = centerY - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 保持原有灵敏度逻辑，但限制在区域内
            if (isReset) {
                isReset = false;
                isSmoothPhase = true;
                if (smoothTimer) clearTimeout(smoothTimer);
                // 200ms 的平滑过渡期，掩饰突变
                smoothTimer = setTimeout(() => {
                    isSmoothPhase = false;
                }, 200);
            }

            const moveFactor = 15;
            const blurFactor = 30;
            const baseBlur = 10;

            const shadowX = dx / moveFactor;
            const shadowY = dy / moveFactor;
            const blur = baseBlur + distance / blurFactor;

            // 在平滑期与普通期之间切换过渡效果
            if (isSmoothPhase) {
                heroAvatar.style.transition = 'box-shadow 0.2s ease-out';
            } else {
                heroAvatar.style.transition = 'none';
            }

            // 使用紫色和青色双层阴影效果 (全局统一)
            heroAvatar.style.boxShadow = `${shadowX}px ${shadowY - 5}px ${blur}px rgba(186, 66, 255, 0.5), ${shadowX}px ${shadowY + 5}px ${blur}px rgba(0, 225, 255, 0.5)`;
        };

        const handleReset = () => {
            if (!isReset) {
                isReset = true;
                isSmoothPhase = false;
                if (smoothTimer) clearTimeout(smoothTimer);

                heroAvatar.style.transition = 'box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                heroAvatar.style.boxShadow = '';
            }
        };

        // 只在桌面端启用头像阴影动效
        if (window.matchMedia('(min-width: 768px)').matches) {
            avatarTriggerArea.addEventListener('mousemove', handleMove);
            avatarTriggerArea.addEventListener('mouseleave', handleReset);
        }
    }
});
