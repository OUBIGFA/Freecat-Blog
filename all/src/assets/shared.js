/* global window, self */
/**
 * Freecat-Blog 共享工具：构建期 (Node) 与浏览器期 (browser) 共用。
 * 通过 UMD 模式同时暴露 module.exports 和 window.FreecatShared。
 *
 * 这里集中放置原本在 build.js 与 main.js 双向重复的小工具：
 *   - hashTagColor(tag)                  根据标签名生成稳定 HSL 配色
 *   - escapeHtml(text)                   HTML 转义
 *   - escapeAttr(text)                   属性值转义（含单引号），主要给 onclick 用
 *   - processTitleHtml(title)            把标题中的 | 包成 span 以应用样式
 *   - renderTagSpan(tag, opts)           生成标签 <span> HTML（统一首页/全部/文章/搜索四处）
 *   - IMG_FALLBACK_ATTR                  统一的 <img onerror> 兜底字符串
 *   - copyText(text)                     现代 clipboard + 兜底 textarea，浏览器端可用
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.FreecatShared = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
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

    function escapeHtml(text) {
        if (text == null) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttr(text) {
        // 主要给 onclick 内联字符串字面量使用：避免单引号闭合 + 避免 HTML 注入
        return String(text == null ? '' : text)
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '&quot;');
    }

    function encodePathSegment(segment) {
        try {
            return encodeURIComponent(decodeURIComponent(segment));
        } catch (_) {
            return encodeURIComponent(segment);
        }
    }

    function encodeSitePath(url) {
        const raw = String(url == null ? '' : url);
        if (!raw || raw === '#' || /^[a-z][a-z0-9+.-]*:/i.test(raw) || raw.startsWith('//')) return raw;

        const hashIndex = raw.indexOf('#');
        const beforeHash = hashIndex === -1 ? raw : raw.slice(0, hashIndex);
        const hash = hashIndex === -1 ? '' : raw.slice(hashIndex);
        const queryIndex = beforeHash.indexOf('?');
        const pathPart = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);
        const query = queryIndex === -1 ? '' : beforeHash.slice(queryIndex);

        return pathPart.split('/').map(encodePathSegment).join('/') + query + hash;
    }

    function processTitleHtml(title) {
        if (!title) return '';
        return String(title).replace(/\|/g, '<span class="font-normal mx-[1px]">|</span>');
    }

    function encodeTagQueryValue(tag) {
        return encodeURIComponent(String(tag == null ? '' : tag)).replace(/'/g, '%27');
    }

    // 统一的图片兜底 onerror 处理。注意：作为 HTML 属性内联使用，必须是单引号字符串。
    const IMG_FALLBACK_ATTR =
        "onerror=\"if(this.dataset.fallbackApplied!=='true'){" +
        "this.dataset.fallbackApplied='true';" +
        "this.removeAttribute('srcset');" +
        "this.src='/image/404.png';}\"";

    function renderTagSpan(tag, opts) {
        const options = opts || {};
        const colors = hashTagColor(tag);
        const dataAttrs = options.withDataAttrs
            ? ` data-bg-light="${colors.bg}" data-text-light="${colors.text}" data-bg-dark="${colors.bgDark}" data-text-dark="${colors.textDark}"`
            : '';
        const encodedForClick = encodeTagQueryValue(tag);
        const visibleText = options.escapeText === false ? tag : escapeHtml(tag);
        const extraClass = options.darkHover ? ' dark:hover:brightness-110' : '';
        // tag-span 类名仅在 withDataAttrs（即客户端渲染场景）时添加，
        // 这样 main.js 中 updateTagColors 才能在切换主题时找到这些标签。
        const tagSpanClass = options.withDataAttrs ? 'tag-span ' : '';
        return (
            '<span class="' + tagSpanClass + 'relative z-10 inline-flex items-center px-2.5 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-wider cursor-pointer hover:brightness-95' + extraClass + ' transition-[filter] duration-200 ease-out whitespace-nowrap" ' +
            'style="background: ' + colors.bg + '; color: ' + colors.text + ';"' + dataAttrs + ' ' +
            "onclick=\"event.preventDefault(); event.stopPropagation(); window.location.href='/search.html?tag=" + encodedForClick + "';\">" +
            visibleText +
            '</span>'
        );
    }

    // 把任意形态的 tag 字段（数组 / 字符串 / 空）归一为去空白、去空项的字符串数组。
    function normalizeTagList(tags) {
        if (Array.isArray(tags)) {
            return tags.map(function (t) { return String(t == null ? '' : t).trim(); })
                .filter(Boolean);
        }
        if (tags == null || tags === '') return [];
        const single = String(tags).trim();
        return single ? [single] : [];
    }

    function normalizeTagKey(tag) {
        return String(tag == null ? '' : tag).trim().toLowerCase();
    }

    // 聚合标签菜单数据：统计每个标签出现次数 + 未打标签数量，按「次数降序 → 名称」排序。
    // posts 每项读取 post.tags（搜索索引形态）；构建期可先映射成 { tags: post.tag }。
    // 构建期与浏览器期共用，保证顶栏标签菜单两端数据完全一致。
    function collectMenuTags(posts) {
        const tagsByKey = new Map();
        let untaggedCount = 0;
        (posts || []).forEach(function (post) {
            const labels = normalizeTagList(post && post.tags);
            if (!labels.length) {
                untaggedCount += 1;
                return;
            }
            labels.forEach(function (label) {
                const key = normalizeTagKey(label);
                const current = tagsByKey.get(key);
                if (current) {
                    current.count += 1;
                    return;
                }
                tagsByKey.set(key, { label: label, count: 1 });
            });
        });
        const list = Array.from(tagsByKey.values()).sort(function (a, b) {
            if (b.count !== a.count) return b.count - a.count;
            return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
        });
        if (untaggedCount > 0) {
            list.unshift({ label: '未打标签', count: untaggedCount, untagged: true });
        }
        return list;
    }

    // 渲染标签菜单项 HTML 字符串。构建期注入顶栏（预渲染、点击即展开），
    // 浏览器期仅在预渲染缺失时兜底使用，二者输出保持一致。
    function renderTagMenuItemsHtml(tags) {
        if (!tags || !tags.length) {
            return '<p class="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">No tags yet</p>';
        }
        return tags.map(function (tag, index) {
            const isUntagged = !!tag.untagged;
            const colors = isUntagged
                ? { bg: 'rgba(148, 163, 184, 0.18)', text: '#475569' }
                : hashTagColor(tag.label);
            const href = isUntagged
                ? '/search.html?tag=__untagged__'
                : '/search.html?tag=' + encodeURIComponent(tag.label);
            return (
                '<a role="menuitem" href="' + href + '" ' +
                'class="tag-menu-item flex items-center justify-between gap-3 rounded-[4px] px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-400 dark:text-slate-200 dark:hover:bg-slate-800" ' +
                'style="--tag-menu-index:' + index + ';">' +
                '<span class="min-w-0 truncate">' + escapeHtml(tag.label) + '</span>' +
                '<span class="shrink-0 rounded-[4px] px-2 py-0.5 text-[11px] font-semibold" style="background:' + colors.bg + ';color:' + colors.text + ';">' + tag.count + '</span>' +
                '</a>'
            );
        }).join('');
    }

    function copyText(text) {
        if (typeof navigator !== 'undefined' && navigator.clipboard && typeof window !== 'undefined' && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        if (typeof document === 'undefined') return Promise.reject(new Error('No DOM'));
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        return new Promise(function (resolve, reject) {
            try {
                document.execCommand('copy') ? resolve() : reject(new Error('Copy failed'));
            } catch (err) {
                reject(err);
            } finally {
                textarea.remove();
            }
        });
    }

    return {
        hashTagColor,
        escapeHtml,
        escapeAttr,
        encodeSitePath,
        processTitleHtml,
        renderTagSpan,
        normalizeTagKey,
        collectMenuTags,
        renderTagMenuItemsHtml,
        IMG_FALLBACK_ATTR,
        copyText
    };
}));
