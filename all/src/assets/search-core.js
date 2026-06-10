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
    const { escapeHtml, processTitleHtml, renderTagSpan, normalizeTagKey } = shared;

    // 列表入场动画的错峰延迟（与 main.js applyStaggeredAnimations 共用同一决策）。
    function getStaggerDelayMs(index, delayStep = 50) {
        return Math.min(index, 10) * delayStep;
    }

    // 列表排序：置顶优先，其余按发布时间倒序。
    function sortPostsForListing(posts) {
        return posts.slice().sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.date) - new Date(a.date);
        });
    }

    // 搜索函数：支持精确匹配和模糊匹配；isTagSearch 时按标签精确匹配。
    function searchPosts(query, posts, isTagSearch = false) {
        if (!query.trim()) return [];
        const q = query.toLowerCase().trim();
        const isUntaggedSearch = isTagSearch && q === '__untagged__';

        const filtered = posts.filter(post => {
            const tags = (post.tags || [])
                .map(t => String(t || '').trim())
                .filter(Boolean);

            if (isUntaggedSearch) {
                return tags.length === 0;
            }

            const lowerTags = tags.map(t => t.toLowerCase());

            if (isTagSearch) {
                return lowerTags.includes(q);
            }

            const title = (post.title || '').toLowerCase();
            const excerpt = (post.excerpt || '').toLowerCase();
            const content = (post.content || '').toLowerCase();
            const tagsStr = lowerTags.join(' ');

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

        const sorted = sortPostsForListing(filtered);
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
        return sortPostsForListing(posts);
    }

    // 标签 HTML：直接复用 shared.renderTagSpan，保持与构建期一致
    function generateTagsHtml(tags) {
        if (!tags) return '';
        return tags.map(tag => renderTagSpan(tag, { withDataAttrs: true, escapeText: true })).join('');
    }

    function buildSearchResultCardData(post, index, options = {}) {
        return {
            link: post.link,
            titleHtml: processTitleHtml(escapeHtml(post.title)),
            excerptHtml: escapeHtml(post.preview || post.excerpt),
            date: post.date,
            modifiedDate: post.modifiedDate,
            sortDate: post.sortDate,
            sortModifiedDate: post.sortModifiedDate,
            tagsHtml: generateTagsHtml(post.tags),
            cover: post.cover,
            coverWidth: post.coverWidth,
            coverHeight: post.coverHeight,
            pinned: post.pinned,
            animationDelay: getStaggerDelayMs(index),
            layout: options.layout
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

        async function loadSearchIndex() {
            if (searchIndex) return searchIndex;
            try {
                const response = await platform.fetch('/search-index.json');
                searchIndex = await response.json();
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
        searchPosts,
        getPostsByTag,
        generateTagsHtml,
        buildSearchResultCardData,
        renderSearchResultCards,
        createIndexLoaders
    };
}));
