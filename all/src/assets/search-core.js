/* search-core.js
 * 搜索核心逻辑：过滤、排序、标签索引读取、结果卡片渲染、索引按需加载。
 * UMD：构建期 / Node 测试可 require，浏览器期暴露 window.FreecatSearchCore。
 * 依赖：FreecatShared（shared.js）、PostCardTemplate（post-card-template.js），
 *       二者在 scripts-end.html 中均先于本文件加载。
 * 纯逻辑与渲染均为纯函数，便于在 Node 中做行为测试（test/search-core.test.js）。
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(
            require('../../shared/shared.js'),
            require('../../shared/post-card-template.js')
        );
    } else {
        root.FreecatSearchCore = factory(root.FreecatShared, root.PostCardTemplate);
    }
}(typeof self !== 'undefined' ? self : this, function (shared, postCardTemplate) {
    if (!shared || typeof shared.escapeHtml !== 'function') {
        throw new Error('FreecatShared not loaded — ensure shared.js loads before search-core.js');
    }
    if (!postCardTemplate || typeof postCardTemplate.renderPostCard !== 'function') {
        throw new Error('PostCardTemplate not loaded — ensure post-card-template.js loads before search-core.js');
    }
    if (!postCardTemplate.ALL_PAGE_MOBILE_CARD_OPTIONS) {
        throw new Error('PostCardTemplate missing all-page mobile card options');
    }
    const { escapeHtml, escapeHtmlWithLineBreaks, processTitleHtml, renderTagSpan, normalizeTagKey } = shared;

    // 列表入场动画的错峰延迟（与 main.js applyStaggeredAnimations 共用同一决策）。
    function getStaggerDelayMs(index, delayStep = 50) {
        return Math.min(index, 10) * delayStep;
    }

    function getPostSortDate(post) {
        const numeric = Number(post && post.sortDate);
        if (Number.isFinite(numeric) && numeric > 0) return numeric;
        const parsed = Date.parse((post && post.date) || '');
        return Number.isFinite(parsed) ? parsed : 0;
    }

    // 列表排序：置顶优先，其余按发布时间倒序。
    function sortPostsForListing(posts) {
        return posts.slice().sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return getPostSortDate(b) - getPostSortDate(a);
        });
    }

    function normalizeSearchTags(tags) {
        return (Array.isArray(tags) ? tags : [])
            .map(t => String(t || '').trim())
            .filter(Boolean);
    }

    function buildSearchText(post, tags) {
        return [
            post && post.title,
            post && post.excerpt,
            post && post.content,
            tags.join(' ')
        ]
            .map(value => String(value || '').toLowerCase())
            .join(' ')
            .trim();
    }

    function getLowerTags(post) {
        if (post && Array.isArray(post.lowerTags)) return post.lowerTags;
        return normalizeSearchTags(post && post.tags).map(tag => tag.toLowerCase());
    }

    function getSearchText(post, lowerTags) {
        if (post && typeof post.searchText === 'string') return post.searchText;
        return buildSearchText(post || {}, lowerTags || getLowerTags(post));
    }

    // 构建期写入索引的规整字段，浏览器端直接复用，避免每次输入都重复处理全文。
    function createSearchIndexFields(post) {
        const tags = normalizeSearchTags(post && post.tags);
        return {
            searchText: buildSearchText(post || {}, tags),
            lowerTags: tags.map(tag => tag.toLowerCase())
        };
    }

    // 搜索函数：支持精确匹配和模糊匹配；isTagSearch 时按标签精确匹配。
    function searchPosts(query, posts, isTagSearch = false) {
        const rawQuery = String(query || '').trim();
        if (!rawQuery) return [];
        const q = rawQuery.toLowerCase();
        const isUntaggedSearch = isTagSearch && q === '__untagged__';

        const filtered = posts.filter(post => {
            const lowerTags = getLowerTags(post);

            if (isUntaggedSearch) {
                return lowerTags.length === 0;
            }

            if (isTagSearch) {
                return lowerTags.includes(q);
            }

            const searchText = getSearchText(post, lowerTags);

            // 精确匹配优先
            if (searchText.includes(q)) {
                return true;
            }

            // 模糊匹配
            const words = q.split(/\s+/);
            return words.every(word => searchText.includes(word));
        });

        const sorted = posts && posts.freecatPresorted === true
            ? filtered
            : sortPostsForListing(filtered);
        return isTagSearch ? sorted : sorted.slice(0, 20);
    }

    // 从 tag-index.json 结构中取出某标签下的全部文章并排序。
    function getPostsByTag(tag, index) {
        if (!index || !Array.isArray(index.posts)) return [];
        const key = normalizeTagKey(tag);
        const postIndexes = key === '__untagged__'
            ? (index.untagged || [])
            : ((index.tags && index.tags[key] && index.tags[key].posts) || []);
        const posts = postIndexes
            .map(i => index.posts[i])
            .filter(Boolean);
        return index.sorted === true ? posts : sortPostsForListing(posts);
    }

    // 标签 HTML：直接复用 shared.renderTagSpan，保持与构建期一致。
    // themed：深浅配色由构建期 CSS 变量 + .dark .tag-span 规则承担，随主题即时切换。
    function generateTagsHtml(tags) {
        if (!tags) return '';
        return tags.map(tag => renderTagSpan(tag, { themed: true, escapeText: true })).join('');
    }

    function buildSearchResultCardData(post, index, options = {}) {
        const cardOptions = { ...options };
        return {
            link: post.link,
            titleHtml: processTitleHtml(escapeHtml(post.title)),
            excerptHtml: escapeHtmlWithLineBreaks(post.preview || post.excerpt),
            date: post.date,
            modifiedDate: post.modifiedDate,
            sortDate: post.sortDate,
            sortModifiedDate: post.sortModifiedDate,
            tagsHtml: generateTagsHtml(post.tags),
            cover: post.cover,
            coverWidth: post.coverWidth,
            coverHeight: post.coverHeight,
            desktopTitleSingleLine: post.desktopTitleSingleLine,
            desktopPreviewLines: post.desktopPreviewLines,
            pinned: post.pinned,
            animationDelay: getStaggerDelayMs(index),
            mobileTagsInline: postCardTemplate.ALL_PAGE_MOBILE_CARD_OPTIONS.mobileTagsInline,
            layout: cardOptions.layout
        };
    }

    function renderSearchResultCards(results, options = {}) {
        return results
            .map((post, index) => postCardTemplate.renderPostCard(buildSearchResultCardData(post, index, options)))
            .join('');
    }

    // 搜索 / 标签索引的按需加载与缓存。main.js 创建一份，
    // 顶栏搜索与搜索页共用，避免同页重复拉取。
    function createIndexLoaders({ platform }) {
        let searchIndex = null;
        let tagIndex = null;

        function markPresorted(posts) {
            if (Array.isArray(posts) && posts.freecatPresorted !== true) {
                Object.defineProperty(posts, 'freecatPresorted', {
                    value: true,
                    configurable: true
                });
            }
            return posts;
        }

        async function loadSearchIndex() {
            if (searchIndex) return searchIndex;
            try {
                const response = await platform.fetch('/search-index.json');
                searchIndex = markPresorted(await response.json());
                return searchIndex;
            } catch (err) {
                console.error('Failed to load search index:', err);
                return [];
            }
        }

        async function loadTagIndex() {
            if (tagIndex) return tagIndex;
            try {
                const response = await platform.fetch('/tag-index.json');
                tagIndex = await response.json();
                return tagIndex;
            } catch (err) {
                console.error('Failed to load tag index:', err);
                return null;
            }
        }

        return { loadSearchIndex, loadTagIndex };
    }

    return {
        getStaggerDelayMs,
        sortPostsForListing,
        createSearchIndexFields,
        searchPosts,
        getPostsByTag,
        generateTagsHtml,
        buildSearchResultCardData,
        renderSearchResultCards,
        createIndexLoaders
    };
}));
