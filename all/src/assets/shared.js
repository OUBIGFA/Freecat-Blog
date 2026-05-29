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
            '<span class="' + tagSpanClass + 'relative z-10 inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer hover:brightness-95' + extraClass + ' transition-[filter] duration-200 ease-out whitespace-nowrap" ' +
            'style="background: ' + colors.bg + '; color: ' + colors.text + ';"' + dataAttrs + ' ' +
            "onclick=\"event.preventDefault(); event.stopPropagation(); window.location.href='/search.html?tag=" + encodedForClick + "';\">" +
            visibleText +
            '</span>'
        );
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
        IMG_FALLBACK_ATTR,
        copyText
    };
}));
