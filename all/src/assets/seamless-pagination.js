/* seamless-pagination.js
 * 首页无感分页：hover/focus/touch 预取下一页 HTML，点击时就地替换列表。
 * 依赖全局：无（所有依赖经 init 注入）。
 *
 * 优化要点：
 *   - hover / focusin / touchstart 时预取 HTML，并在内存里缓存一份 Promise，
 *     真正点击时直接命中（消除"闲置后第一次点击卡顿"的核心来源）。
 *   - fetch 加 8s AbortController 超时，避免网络抽风时按钮永远转圈。
 *   - 淡出动画延后 100ms 触发：缓存命中时几乎瞬间出结果，主观更"跟手"。
 */
(function (root) {
    'use strict';

    function init(deps) {
        const win = deps.window;
        const doc = deps.document;
        const platform = deps.platform;
        const { initDeferredImages, unobserveDeferredImages } = deps.lazyImages;
        const applyStaggeredAnimations = deps.applyStaggeredAnimations;
        const fitTagRows = deps.fitTagRows;
        const syncParentFrameHistory = deps.syncParentFrameHistory;
        const framed = !!deps.framed;

        const postsList = doc.getElementById('posts-list');
        const paginationContainer = doc.getElementById('pagination-buttons');
        if (!postsList || !paginationContainer) return;

        const pageTransitionInMs = deps.getCssDurationMs('--page-slide-dur', 200);
        const PAGE_FETCH_TIMEOUT_MS = 8000;
        const FADE_DELAY_MS = 100;

        // url -> Promise<htmlText>。失败时自动从 Map 里清掉，允许下次重试。
        // LRU 上限：每条缓存大小约 50–200KB，限制 10 条 ≈ 上限 2MB，
        // 防止用户长时间在分页器上来回悬停导致内存无界增长。
        // 命中时 delete + set 把它移到尾部，淘汰时取首部（Map 的插入序）。
        const pageCache = new Map();
        const PAGE_CACHE_MAX = 10;

        function touchCache(url, value) {
            if (pageCache.has(url)) pageCache.delete(url);
            pageCache.set(url, value);
            while (pageCache.size > PAGE_CACHE_MAX) {
                const oldestKey = pageCache.keys().next().value;
                pageCache.delete(oldestKey);
            }
        }

        function prefetchPage(url) {
            if (pageCache.has(url)) {
                const cached = pageCache.get(url);
                touchCache(url, cached);
                return cached;
            }
            const ac = new AbortController();
            const timer = setTimeout(() => ac.abort(), PAGE_FETCH_TIMEOUT_MS);
            const p = platform.fetch(getPaginationFetchUrl(url), { credentials: 'same-origin', signal: ac.signal })
                .then((r) => {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.text();
                })
                .finally(() => clearTimeout(timer))
                .catch((err) => {
                    pageCache.delete(url);
                    throw err;
                });
            touchCache(url, p);
            return p;
        }

        function getPaginationFetchUrl(rawUrl) {
            const url = new URL(rawUrl, win.location.href);
            if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/index') {
                return '/home' + url.search;
            }
            return url.pathname + url.search;
        }

        function isPaginationLink(link) {
            if (!link) return false;
            if (link.getAttribute('href') === '#') return false;
            if (link.classList.contains('opacity-50')) return false;
            return true;
        }

        // 在 hover / focus / touch 时启动预取——大部分翻页都是先靠近再点击，
        // 这一步把网络等待塞进"靠近 → 点击"的几百毫秒里，点击瞬间命中内存。
        const prefetchHandler = (e) => {
            const link = e.target.closest('a');
            if (!isPaginationLink(link)) return;
            // 预取失败不打断 UI，真正点击时会再次走完整流程并降级。
            prefetchPage(link.href).catch(() => { });
        };
        ['mouseover', 'focusin', 'touchstart'].forEach((evt) => {
            paginationContainer.addEventListener(evt, prefetchHandler, { passive: true });
        });

        // 把取回的整页 HTML 应用到当前列表：替换内容、恢复动画、同步历史。
        function applyFetchedPage(htmlText, url) {
            const parser = new DOMParser();
            const docNext = parser.parseFromString(htmlText, 'text/html');

            const newPosts = docNext.getElementById('posts-list').innerHTML;
            const newPagination = docNext.getElementById('pagination-buttons').innerHTML;

            unobserveDeferredImages(postsList);
            postsList.innerHTML = newPosts;
            paginationContainer.innerHTML = newPagination;
            fitTagRows();
            initDeferredImages();

            postsList.classList.remove('page-transitioning-out');
            postsList.classList.add('page-transitioning-in');
            setTimeout(() => {
                postsList.classList.remove('page-transitioning-in');
            }, pageTransitionInMs + 40);

            applyStaggeredAnimations('#posts-list .post-card');

            // 更新浏览器地址栏，并同步外壳历史；这样从文章页返回时能回到当前分页。
            // 外壳模式下历史条目只能由外壳创建（syncParentFrameHistory push），
            // iframe 自身只 replaceState，否则一次翻页产生两条历史、返回键要按两次。
            const method = framed ? 'replaceState' : 'pushState';
            win.history[method]({ ...(win.history.state || {}), freecatSoftNav: true }, '', url);
            syncParentFrameHistory({ push: true });

            // 翻页后回到页面顶部，对齐进入首页时的初始位置。
            win.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // 核心跳转逻辑复用
        async function navigateTo(url) {
            // 淡出延后触发：缓存命中（< 100ms）时直接跳过整段 transition，
            // 视觉上"秒切"；只有真的需要等网络才让用户看到 fade。
            postsList.classList.remove('page-transitioning-in');
            const fadeTimer = setTimeout(() => {
                postsList.classList.add('page-transitioning-out');
            }, FADE_DELAY_MS);

            try {
                const htmlText = await prefetchPage(url);
                clearTimeout(fadeTimer);
                applyFetchedPage(htmlText, url);
            } catch (err) {
                clearTimeout(fadeTimer);
                postsList.classList.remove('page-transitioning-out');
                console.error('Seamless pagination failed:', err);
                win.location.href = url; // 失败时降级到普通跳转
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
        doc.addEventListener('click', (e) => {
            const active = doc.activeElement;
            if (!active || active.tagName !== 'INPUT' || active.getAttribute('type') !== 'number') return;
            if (!paginationContainer.contains(active)) return;
            if (paginationContainer.contains(e.target)) return;
            active.blur();
        });
    }

    root.FreecatSeamlessPagination = { init };
}(typeof self !== 'undefined' ? self : this));
