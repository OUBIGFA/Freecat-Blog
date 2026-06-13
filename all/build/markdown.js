const { marked } = require('marked');
const katex = require('katex');
const hljs = require('highlight.js');
const { renderCopyButton } = require('./copy-button.js');

/**
 * Markdown 处理：marked 渲染器自定义、扩展、空格处理、TOC、stripMarkdown 等。
 * 对外仅暴露 setup() / parseMarkdown() / autoSpacing() / autoSpacingHtml() /
 * applyParagraphAlignment() / extractHeadingsAndGenerateTOC() / addHeadingIds() /
 * stripMarkdown() / slugify()。
 */

// ===== 代码块构建期折叠 / 占位尺寸常量 =====
// 与 post-code.css 保持一致：pre code 字号 0.9rem(14.4px) × 行高 1.72 ≈ 24.77px/行，
// .code-content 上下 padding 共 1.35rem × 2 = 43.2px（border-box）。
// 折叠阈值沿用旧运行时逻辑（内容高度 > 500px 折叠到 400px）。
const CODE_LINE_HEIGHT_PX = 24.77;
const CODE_CONTENT_PADDING_PX = 43.2;
const CODE_FOLD_MIN_PX = 500;
const CODE_COLLAPSED_MAX_HEIGHT_PX = 400;
const CODE_BLOCK_CHROME_PX = 41; // 容器上下边框 2px + 头部行（min-height 38px + 底边框 1px）
const CODE_COLLAPSED_CONTROLS_PX = 54; // 折叠态控件行（按钮约 28px + 上下 margin 0.7rem/0.9rem）


const {
    slugify,
    autoSpacing,
    autoSpacingHtml,
    applyParagraphAlignment,
    collectMarkdownTableColumnWidths,
    applyMarkdownTableColumnWidths,
    preserveMarkdownGaps,
    prepareMarkdownSpacing
} = require('./markdown/spacing.js');

const {
    normalizeImageHref,
    escapeHtml,
    decodeBasicHtmlEntities,
    escapeRenderedText,
    isLikelyImageUrl,
    normalizeMultilineVideoImages,
    hasVideoMarker,
    hasAudioMarker,
    isAudioUrl,
    parseImageStyleAudio,
    parseImageStyleAudioList,
    isVideoUrl,
    renderExternalEmbed,
    renderVideoEmbed,
    renderAudioEmbed,
    extractSingleRenderedLink
} = require('./markdown/media.js');

function parseImageDimensions(title) {
    const raw = String(title == null ? '' : title);
    if (!raw) return { width: '', height: '', cleanTitle: '' };

    // 1) "width=W height=H" 显式写法（顺序可能与文档约定相反，宽松一点）
    const explicit = raw.match(/\b(width|w)\s*=\s*(\d{2,5})[\s,]*\b(height|h)\s*=\s*(\d{2,5})\b/i)
        || raw.match(/\b(height|h)\s*=\s*(\d{2,5})[\s,]*\b(width|w)\s*=\s*(\d{2,5})\b/i);
    if (explicit) {
        const isWidthFirst = /^(width|w)/i.test(explicit[1]);
        const width = isWidthFirst ? explicit[2] : explicit[4];
        const height = isWidthFirst ? explicit[4] : explicit[2];
        const cleanTitle = raw.replace(explicit[0], '').replace(/\s{2,}/g, ' ').trim();
        return { width, height, cleanTitle };
    }

    // 2) "WxH" 紧凑写法
    const compact = raw.match(/\b(\d{2,5})\s*[x×]\s*(\d{2,5})\b/);
    if (compact) {
        const cleanTitle = raw.replace(compact[0], '').replace(/\s{2,}/g, ' ').trim();
        return { width: compact[1], height: compact[2], cleanTitle };
    }

    return { width: '', height: '', cleanTitle: raw.trim() };
}

// ===== TOC 与标题 ID =====
function createUniqueHeadingId(rawId, usedIds, fallbackId) {
    const baseId = rawId || fallbackId;
    let nextId = baseId;
    let suffix = 2;

    while (usedIds.has(nextId)) {
        nextId = `${baseId}-${suffix}`;
        suffix++;
    }

    usedIds.add(nextId);
    return nextId;
}

function stripHeadingMarkdown(rawText) {
    let text = String(rawText || '').trim();

    text = text
        .replace(/\s+#+\s*$/g, '')
        .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
        .replace(/\[\[([^\]]+)\]\]/g, '$1')
        .replace(/\[\^.+?\]/g, '')
        .replace(/!\[([^\]]*?)\]\([^)]*?\)/g, '$1')
        .replace(/\[([^\]]*?)\]\([^)]*?\)/g, '$1')
        .replace(/\[([^\]]*?)\]\[[^\]]*?\]/g, '$1')
        .replace(/\[([^\]]*?)\]\s*\[\]/g, '$1')
        .replace(/\[([^\]]*?)\]/g, '$1')
        .replace(/`([^`]+?)`/g, '$1')
        .replace(/\$([^$\n]+?)\$/g, '$1')
        .replace(/==([^=]+)==/g, '$1')
        .replace(/~~([^~]+)~~/g, '$1')
        .replace(/(\*\*+|__+)(.*?)\1/g, '$2')
        .replace(/(?<!\w)(\*|_)([^*_]+?)\1(?!\w)/g, '$2')
        .replace(/<((?:https?:)?\/\/[^<>\s]+)>/gi, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/\\([\\`*{}\[\]()#+\-.!_|>~])/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();

    return text;
}

function extractHeadingsAndGenerateTOC(content) {
    const sanitized = content
        .replace(/^([ \t]*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[^\n]*$/gm, '');

    const headingRegex = /^(#{1,6})[ \t]+([^\r\n]+)$/gm;
    const headings = [];
    const usedHeadingIds = new Set();
    let match;

    while ((match = headingRegex.exec(sanitized)) !== null) {
        const level = match[1].length;
        const text = stripHeadingMarkdown(match[2]) || match[2].trim();
        const id = createUniqueHeadingId(slugify(text), usedHeadingIds, `heading-${headings.length}`);
        headings.push({ level, text, id });
    }

    if (headings.length === 0) return { toc: '', headings: [] };

    const uniqueLevels = [...new Set(headings.map(h => h.level))].sort((a, b) => a - b);
    // 自适应层级 rank：按文章实际出现的标题层级从浅到深，依次映射为 rank 1..N。
    // 例如文章只用 h3/h4/h5，则 h3→rank1, h4→rank2, h5→rank3，避免与 h3/h4/h5 全局深度
    // 一一绑定，让间距系统按"本文里真实的层级关系"产生黄金梯级。
    const levelToRank = new Map();
    uniqueLevels.forEach((level, idx) => levelToRank.set(level, idx + 1));
    headings.forEach(h => { h.rank = levelToRank.get(h.level); });
    const totalRanks = uniqueLevels.length;
    const targetLevels = uniqueLevels.slice(0, 2);
    const minLevel = uniqueLevels[0];

    let tocHtml = '';
    let firstL1 = true;
    headings.forEach(h => {
        if (!targetLevels.includes(h.level)) return;
        const isSecondLevel = h.level > minLevel;
        const paddingClass = isSecondLevel ? 'pl-8' : 'pl-4';
        const pyClass = 'py-0.5';

        let mtClass = '';
        if (!isSecondLevel) {
            if (!firstL1) mtClass = ' mt-2';
            firstL1 = false;
        }

        tocHtml += `<a class="${paddingClass} ${pyClass}${mtClass} text-sm leading-snug text-slate-600 dark:text-slate-400 hover:text-[#1e293b] dark:hover:text-slate-200 transition-colors flex" href="#${h.id}">${autoSpacing(h.text)}</a>\n`;
    });

    return { toc: tocHtml, headings, totalRanks };
}

function addHeadingIds(html, headings) {
    let headingIndex = 0;

    return html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/gi, (match, level, innerHtml) => {
        const h = headings[headingIndex++];
        if (!h) return match;
        const sourceLevel = Math.min(Math.max(h.level || Number(level), 1), 6);
        const renderedLevel = Math.min(Math.max(h.renderedLevel || Number(level), 1), 6);
        const rank = Math.min(Math.max(h.rank || sourceLevel, 1), 6);
        return `<h${renderedLevel} id="${h.id}" class="article-heading article-heading-depth-${sourceLevel} article-heading-rank-${rank} article-heading-source-h${sourceLevel} scroll-mt-24">${innerHtml}</h${renderedLevel}>`;
    });
}

// ===== Markdown → 纯文本（用于摘要 / 搜索索引） =====
function normalizeStrippedMarkdownWhitespace(text, { preserveLineBreaks = false } = {}) {
    const normalized = String(text || '').replace(/\r\n?/g, '\n');
    if (preserveLineBreaks) {
        return normalized
            .replace(/[^\S\n]+/g, ' ')
            .replace(/[ \t]*\n[ \t]*/g, '\n')
            .replace(/\n{2,}/g, '\n')
            .trim();
    }

    return normalized
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function stripMarkdown(text, options = {}) {
    if (!text) return '';
    const preserveLineBreaks = Boolean(options && options.preserveLineBreaks);

    let clean = text.replace(/^>\s*\[![^\]]+\](?:\r?\n>[^\r?\n]*)*\r?\n?/gm, '');

    // 同时吃掉可选的前导 `!`，这样图片语法 ![](视频.mp4) 被剥离后不会残留 `!`。
    const allLinksRegex = /!?\[([^\]]*?)\]\s*\([^\)]+?\)/gi;
    let hasAudio = false;
    let hasVideo = false;
    clean = clean.replace(allLinksRegex, (match, label) => {
        if (hasAudioMarker(label) || isAudioUrl(match)) {
            hasAudio = true;
            return '';
        }
        if (hasVideoMarker(label) || isVideoUrl(match)) {
            hasVideo = true;
            return '';
        }
        return match;
    });

    clean = clean
        .replace(/`{3}[\s\S]*?`{3}/g, '')
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/^\s*([-*+]|\d+\.)\s+(\[[x ]\]\s+)?/gm, '')
        .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
        .replace(/\[\[([^\]]+)\]\]/g, '$1')
        .replace(/==([^=]+)==/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/^\s*>+\s?/gm, '')
        .replace(/^\s*([-*_])(?:\s*\1){2,}\s*$/gm, '')
        .replace(/^\s*#+\s+/gm, '')
        .replace(/^\|?[\s\-|:]+\|?\s*$/gm, '')
        .replace(/\|/g, ' ')
        .replace(/\$\$[\s\S]*?\$\$/g, '')
        .replace(/\$[^$]*?\$/g, '')
        .replace(/`(.+?)`/g, '$1')
        .replace(/(\*\*+|__+|~~+|\*|_)/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\[\^.+?\]/g, '');

    clean = normalizeStrippedMarkdownWhitespace(clean, { preserveLineBreaks });

    if (hasAudio) clean = '🎶 ' + clean;
    else if (hasVideo) clean = '🎬 ' + clean;
    return clean;
}

// ===== marked 渲染器 / 扩展（callout / footnote / math） =====
function normalizeCalloutType(rawType) {
    const type = String(rawType || '').trim().toLowerCase();
    return type || 'note';
}

function getDefaultCalloutTitle(type) {
    if (!type) return 'NOTE';
    return String(type).toUpperCase();
}

let activeFootnoteContext = null;
let activePostOptions = null;

function extractFootnoteDefinitions(markdown) {
    const defs = new Map();
    const lines = String(markdown || '').split(/\r?\n/);
    const kept = [];

    for (let i = 0; i < lines.length; i++) {
        const match = /^\[\^([^\]]+)\]:(?:\s*(.*))?$/.exec(lines[i]);
        if (!match) {
            kept.push(lines[i]);
            continue;
        }

        const rawId = (match[1] || '').trim();
        const id = rawId || String(defs.size + 1);
        const defLines = [];
        const first = (match[2] || '').trimEnd();
        if (first) defLines.push(first);

        i++;
        while (i < lines.length) {
            const line = lines[i];
            const isIndented = /^(?:\t| {2,})/.test(line);
            if (isIndented) {
                defLines.push(line.replace(/^(?:\t| {2,})/, ''));
                i++;
                continue;
            }

            if (line.trim() === '') {
                const next = lines[i + 1];
                if (next != null && /^(?:\t| {2,})/.test(next)) {
                    defLines.push('');
                    i++;
                    continue;
                }
            }
            break;
        }

        defs.set(id, defLines.join('\n').trim());
        i--;
    }

    return { markdown: kept.join('\n'), defs };
}

function createFootnoteContext(defs) {
    return {
        defs,
        order: [],
        numberById: new Map(),
        refCountById: new Map()
    };
}

function getOrAssignFootnoteNumber(id) {
    const ctx = activeFootnoteContext;
    if (!ctx) return null;
    if (ctx.numberById.has(id)) return ctx.numberById.get(id);
    const nextNumber = ctx.order.length + 1;
    ctx.numberById.set(id, nextNumber);
    ctx.order.push(id);
    return nextNumber;
}

function assignFootnoteNumberIfMissing(id) {
    const ctx = activeFootnoteContext;
    if (!ctx) return null;
    if (ctx.numberById.has(id)) return ctx.numberById.get(id);
    const nextNumber = ctx.numberById.size + 1;
    ctx.numberById.set(id, nextNumber);
    return nextNumber;
}

function renderFootnotesSection() {
    const ctx = activeFootnoteContext;
    if (!ctx || !ctx.defs || ctx.defs.size === 0) return '';

    const referenced = ctx.order.slice();
    const unreferenced = [];
    for (const id of ctx.defs.keys()) {
        if (!ctx.numberById.has(id)) unreferenced.push(id);
    }

    for (const id of unreferenced) assignFootnoteNumberIfMissing(id);

    const finalIds = referenced.concat(unreferenced);

    function appendBackRefsInline(contentHtml, backRefsHtml) {
        if (!backRefsHtml) return contentHtml;
        if (!contentHtml) return backRefsHtml;
        if (/<\/p>\s*$/.test(contentHtml)) {
            return contentHtml.replace(/<\/p>\s*$/, `${backRefsHtml}</p>`);
        }
        return contentHtml + backRefsHtml;
    }

    const itemsHtml = finalIds.map((id) => {
        const safeId = slugify(String(id));
        const content = ctx.defs.get(id) || '';
        const previousContext = activeFootnoteContext;
        activeFootnoteContext = null;
        const contentHtml = content ? marked.parse(prepareMarkdownSpacing(content)).trim() : '';
        activeFootnoteContext = previousContext;
        const refCount = ctx.refCountById.get(id) || 0;
        const backRefs = refCount > 0
            ? Array.from({ length: refCount }, (_, idx) => {
                const refId = `fnref-${safeId}-${idx + 1}`;
                return `<a class="footnote-backref" href="#${refId}" aria-label="Back to reference ${idx + 1}">&#8617;</a>`;
            }).join('')
            : '';
        const backRefsHtml = backRefs ? `<span class="footnote-backrefs">${backRefs}</span>` : '';
        const finalContentHtml = appendBackRefsInline(contentHtml, backRefsHtml);
        return `<li id="fn-${safeId}">${finalContentHtml}</li>`;
    }).join('');

    return `<section class="footnotes"><hr><ol>${itemsHtml}</ol></section>\n`;
}

function tokenizeInlineMath(src) {
    if (!src || src[0] !== '$' || src[1] === '$') return;
    for (let i = 1; i < src.length; i++) {
        const ch = src[i];
        if (ch === '\n') return;
        if (ch === '\\') { i++; continue; }
        if (ch === '$') {
            const raw = src.slice(0, i + 1);
            const text = src.slice(1, i);
            if (!text.trim()) return;
            return { raw, text };
        }
    }
}

const KATEX_OPTIONS = { throwOnError: false, strict: 'ignore' };

const mathBlockExtension = {
    name: 'mathBlock',
    level: 'block',
    start(src) {
        const idx = src.indexOf('$$');
        return idx >= 0 ? idx : undefined;
    },
    tokenizer(src) {
        const blockMatch = /^\$\$\s*\r?\n([\s\S]+?)\r?\n\$\$(?:\s*\r?\n|$)/.exec(src);
        if (blockMatch) return { type: 'mathBlock', raw: blockMatch[0], text: blockMatch[1].trim() };
        const oneLineMatch = /^\$\$([\s\S]+?)\$\$(?:\s*\r?\n|$)/.exec(src);
        if (oneLineMatch) return { type: 'mathBlock', raw: oneLineMatch[0], text: oneLineMatch[1].trim() };
    },
    renderer(token) {
        return katex.renderToString(token.text, { ...KATEX_OPTIONS, displayMode: true }) + '\n';
    }
};

const mathInlineExtension = {
    name: 'mathInline',
    level: 'inline',
    start(src) {
        const idx = src.indexOf('$');
        return idx >= 0 ? idx : undefined;
    },
    tokenizer(src) {
        const tokenized = tokenizeInlineMath(src);
        if (!tokenized) return;
        return { type: 'mathInline', raw: tokenized.raw, text: tokenized.text };
    },
    renderer(token) {
        return katex.renderToString(token.text, { ...KATEX_OPTIONS, displayMode: false });
    }
};

const footnoteRefExtension = {
    name: 'footnoteRef',
    level: 'inline',
    start(src) {
        const idx = src.indexOf('[^');
        return idx >= 0 ? idx : undefined;
    },
    tokenizer(src) {
        const m = /^\[\^([^\]\s]+?)\]/.exec(src);
        if (!m) return;
        return { type: 'footnoteRef', raw: m[0], id: m[1] };
    },
    renderer(token) {
        if (!activeFootnoteContext) return token.raw;
        const id = String(token.id || '').trim();
        if (!id) return token.raw;
        const number = getOrAssignFootnoteNumber(id);
        const safeId = slugify(id);
        const nextRefCount = (activeFootnoteContext.refCountById.get(id) || 0) + 1;
        activeFootnoteContext.refCountById.set(id, nextRefCount);
        const refId = `fnref-${safeId}-${nextRefCount}`;
        return `<sup id="${refId}" class="footnote-ref"><a href="#fn-${safeId}">${number}</a></sup>`;
    }
};

const calloutBlockExtension = {
    name: 'calloutBlock',
    level: 'block',
    start(src) {
        const idx = src.search(/^>\s*\[!/m);
        return idx >= 0 ? idx : undefined;
    },
    tokenizer(src) {
        const headerMatch = /^>\s*\[!([A-Za-z]+)\][+-]?(?:[ \t]+(.*))?[ \t]*(?:\r?\n|$)/.exec(src);
        if (!headerMatch) return;

        const lines = src.split(/\r?\n/);
        let consumedLineCount = 1;
        for (let i = 1; i < lines.length; i++) {
            if (!/^>/.test(lines[i])) break;
            consumedLineCount++;
        }

        const type = normalizeCalloutType(headerMatch[1]);
        const explicitTitle = (headerMatch[2] || '').trim();
        const title = explicitTitle || getDefaultCalloutTitle(type);

        const bodyLines = [];
        for (let i = 1; i < consumedLineCount; i++) {
            bodyLines.push(lines[i].replace(/^>\s?/, ''));
        }

        const raw = lines.slice(0, consumedLineCount).join('\n') + '\n';
        const text = bodyLines.join('\n').trim();
        return { type: 'calloutBlock', raw, calloutType: type, title, text };
    },
    renderer(token) {
        const innerHtml = token.text ? marked.parse(prepareMarkdownSpacing(token.text)) : '';
        const iconMap = {
            note: '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2zm1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>',
            tip: '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M9 21h6v-1a3 3 0 00-3-3 3 3 0 00-3 3v1zm3-19a7 7 0 00-7 7c0 2.86 1.61 4.32 3 6h8c1.39-1.68 3-3.14 3-6a7 7 0 00-7-7z"/></svg>',
            important: '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm1 15h-2v-2h2zm0-4h-2V9h2z"/></svg>',
            warning: '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V9h2v5z"/></svg>',
            caution: '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5a7 7 0 017 7 7 7 0 11-7-7zm1 10h-2v-2h2zm0-4h-2V7h2z"/></svg>'
        };
        const svgIcon = iconMap[token.calloutType] || iconMap.note;
        const safeTitle = escapeRenderedText(token.title);
        return `<div class="callout callout-${token.calloutType}" data-callout="${token.calloutType}"><div class="callout-title"><span class="callout-icon">${svgIcon}</span><span class="callout-title-inner">${safeTitle}</span></div><div class="callout-content">${innerHtml}</div></div>\n`;
    }
};

// ===== marked 自定义渲染器 =====
function isExternalLinkHref(href) {
    const raw = String(href == null ? '' : href).trim();
    if (!raw) return false;
    // 锚点 / 相对路径 / 同站绝对路径都视为内部链接，不开新页签
    if (raw.startsWith('#') || raw.startsWith('/') || raw.startsWith('./') || raw.startsWith('../')) return false;
    // mailto / tel / sms 等也不开新页签（OS 接管）
    if (/^(mailto:|tel:|sms:)/i.test(raw)) return false;
    return /^(https?:)?\/\//i.test(raw);
}

function buildRenderer() {
    const renderer = new marked.Renderer();
    const linkRenderer = renderer.link;
    renderer.link = (href, title, text) => {
        const html = linkRenderer.call(renderer, href, title, text);
        // 仅给外链开 _blank，并补 rel=noopener noreferrer 防 tab-nabbing
        // 注：marked 已对 href 做了 URL 规范化，此处用渲染前的 href 判定是否外链
        if (!isExternalLinkHref(href)) return html;
        return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ');
    };

    renderer.image = (href, title, text) => {
        if (isVideoUrl(href) || hasVideoMarker(text)) return renderVideoEmbed(href, text, { force: hasVideoMarker(text) });
        if (isAudioUrl(href) || hasAudioMarker(text)) return renderAudioEmbed(href, text, { force: hasAudioMarker(text) });
        if (!isLikelyImageUrl(href)) return renderExternalEmbed(href, text);

        const fallbackSrc = '/image/404.png';
        const safeHref = escapeHtml(normalizeImageHref(href));
        const safeAlt = escapeRenderedText(text || '');

        // 从 markdown 图片 title 中解析尺寸，写入 width/height 属性，
        // 让浏览器在加载图片前就预留盒子，消除 CLS（Core Web Vitals）。
        // 支持两种写法：![alt](src "1200x800") 或 ![alt](src "Title 1200x800")
        // 也支持 width=1200 height=800 的形式。提取后从可见 title / caption 中剥离。
        const dims = parseImageDimensions(title);
        const visibleTitle = dims.cleanTitle;
        const safeTitle = visibleTitle ? ` title="${escapeRenderedText(visibleTitle)}"` : '';
        const caption = visibleTitle || (text || '').trim();
        const enableCaption = Boolean(activePostOptions && activePostOptions.enableImageCaptions);

        return `
    <figure class="post-image relative w-full">
        <img class="post-image-img post-image-placeholder" src="${fallbackSrc}" data-src="${safeHref}" alt="${safeAlt}"${safeTitle} loading="lazy" decoding="async" />
        <div class="post-image-loader placeholder-loader" aria-hidden="true"><span class="loader"></span></div>
        ${(enableCaption && caption) ? `<figcaption class="image-caption block text-center text-sm text-slate-500 dark:text-slate-400">${escapeRenderedText(caption)}</figcaption>` : ''}
    </figure>`;
    };

    const blockquoteRenderer = renderer.blockquote;
    renderer.blockquote = (quote) => {
        const renderedLink = extractSingleRenderedLink(quote);
        if (renderedLink && (isVideoUrl(renderedLink.href) || hasVideoMarker(renderedLink.text))) {
            return renderVideoEmbed(renderedLink.href, renderedLink.text, { force: hasVideoMarker(renderedLink.text) });
        }
        return blockquoteRenderer.call(renderer, quote);
    };

    const paragraphRenderer = renderer.paragraph;
    renderer.paragraph = (text) => {
        const trimmed = String(text || '').trim();
        if (/^<figure\b[^>]*\bpost-image\b[^>]*>[\s\S]*<\/figure>$/i.test(trimmed)) {
            return trimmed + '\n';
        }
        if (/^<figure\b[^>]*\bexternal-embed\b[^>]*>[\s\S]*<\/figure>$/i.test(trimmed)) {
            return trimmed + '\n';
        }
        if (/^<figure\b[^>]*\bvideo-player\b[^>]*>[\s\S]*<\/figure>$/i.test(trimmed)) {
            return trimmed + '\n';
        }
        if (/^<figure\b[^>]*\baudio-player\b[^>]*>[\s\S]*<\/figure>$/i.test(trimmed)) {
            return trimmed + '\n';
        }
        return paragraphRenderer.call(renderer, text);
    };

    function normalizeCodeLanguage(language) {
        return String(language || '').trim().split(/\s+/)[0].toLowerCase();
    }

    function getMermaidDiagramKind(source) {
        const firstLine = String(source || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean)[0] || '';
        if (/^sequenceDiagram\b/i.test(firstLine)) return 'sequence';
        if (/^gantt\b/i.test(firstLine)) return 'gantt';
        if (/^(?:graph|flowchart)\b/i.test(firstLine)) return 'flowchart';
        if (/^classDiagram(?:-v2)?\b/i.test(firstLine)) return 'class';
        if (/^stateDiagram(?:-v2)?\b/i.test(firstLine)) return 'state';
        if (/^erDiagram\b/i.test(firstLine)) return 'er';
        if (/^journey\b/i.test(firstLine)) return 'journey';
        if (/^pie\b/i.test(firstLine)) return 'pie';
        if (/^gitGraph\b/i.test(firstLine)) return 'git';
        if (/^mindmap\b/i.test(firstLine)) return 'mindmap';
        if (/^timeline\b/i.test(firstLine)) return 'timeline';
        if (/^quadrantChart\b/i.test(firstLine)) return 'quadrant';
        if (/^xychart-beta\b/i.test(firstLine)) return 'xychart';
        if (/^block-beta\b/i.test(firstLine)) return 'block';
        if (/^packet-beta\b/i.test(firstLine)) return 'packet';
        if (/^architecture-beta\b/i.test(firstLine)) return 'architecture';
        return 'diagram';
    }

    function base64EncodeUtf8(value) {
        return Buffer.from(String(value || ''), 'utf8').toString('base64');
    }

    // ===== 代码块：构建期高亮 + 构建期折叠判定 =====
    // 高亮在构建期完成（与曾经的运行时 CDN 同版本 highlight.js@11.9.0），
    // 浏览器不再加载 highlight.min.js、不再在主线程同步高亮全文代码块 ——
    // 这是大文章打开卡顿的最大来源（上百个代码块逐个高亮 + DOM 重建）。
    function highlightCodeHtml(code, normalizedLanguage) {
        if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
            return hljs.highlight(code, { language: normalizedLanguage, ignoreIllegals: true }).value;
        }
        if (!normalizedLanguage) {
            return hljs.highlightAuto(code).value;
        }
        // 未注册的语言：保持纯转义文本（与运行时 highlightAll 对未知语言的行为一致）
        return escapeHtml(code);
    }

    renderer.code = (code, language) => {
        const normalizedLanguage = normalizeCodeLanguage(language);
        const escapedCode = escapeHtml(code);

        if (normalizedLanguage === 'mermaid') {
            const kind = getMermaidDiagramKind(code);
            return `
    <div class="diagram-block mermaid-block my-6" data-diagram-type="mermaid" data-mermaid-kind="${kind}">
        <div class="mermaid" data-mermaid-source="${base64EncodeUtf8(code)}" role="img" aria-label="Mermaid ${kind} diagram">${escapedCode}</div>
    </div>`;
        }

        if (normalizedLanguage === 'echarts' || normalizedLanguage === 'chart') {
            let error = '';
            try {
                JSON.parse(String(code || ''));
            } catch (err) {
                error = err && err.message ? err.message : 'Invalid JSON';
            }
            const errorAttr = error ? ` data-chart-error="${escapeHtml(error)}"` : '';
            return `
    <div class="diagram-block echarts-block my-6"${errorAttr} data-chart-options="${base64EncodeUtf8(code)}">
        <div class="echarts-canvas" role="img" aria-label="ECharts chart"></div>
    </div>`;
        }

        const langClass = language ? ` language-${escapeHtml(language)}` : '';
        const langLabel = language
            ? `<span class="code-language-label">${escapeHtml(language)}</span>`
            : '<span class="code-language-label">code</span>';

        // 折叠判定也在构建期完成，运行时不再对每个代码块读 scrollHeight
        //（那会造成上百次强制同步重排，是大文章打开卡顿的另一来源）。
        // pre-wrap 下实际渲染行数 ≥ 源码行数，因此「源码行高度估算 > 500px → 折叠」
        // 不会误折短代码；个别短行数但换行很多的块保持展开，影响可忽略。
        const lineCount = String(code || '').split('\n').length;
        const contentHeightPx = CODE_CONTENT_PADDING_PX + lineCount * CODE_LINE_HEIGHT_PX;
        const folded = contentHeightPx > CODE_FOLD_MIN_PX;
        // contain-intrinsic-size 占位高度：让视口外代码块在 content-visibility: auto
        // 下保持准确的滚动条与锚点定位（渲染过一次后浏览器用 auto 记忆的真实尺寸）。
        const intrinsicHeightPx = Math.round(CODE_BLOCK_CHROME_PX + (folded
            ? CODE_COLLAPSED_MAX_HEIGHT_PX + CODE_COLLAPSED_CONTROLS_PX
            : contentHeightPx));
        const containerClass = folded
            ? 'code-block-container group code-fold collapsed-code'
            : 'code-block-container group';
        const contentStyle = folded ? ` style="max-height:${CODE_COLLAPSED_MAX_HEIGHT_PX}px"` : '';
        // 折叠控件只为长代码块输出；类名等价于旧运行时 initCodeFolding +
        // setCodeControlsInlineLayout 处理后的最终状态（构建期直接产出终态）。
        const controlsHtml = folded ? `
            <div class="code-fold-controls flex left-0 w-full items-end justify-center py-2 pb-2 z-10 border-t border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-transparent transition-opacity duration-300">
                <button class="code-nav-btn code-nav-top" type="button" data-code-nav="top" aria-label="Scroll to code block top">
                    <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M12 13.9142L16.7929 18.7071L18.2071 17.2929L12 11.0858L5.79289 17.2929L7.20711 18.7071L12 13.9142ZM6 7L18 7V9L6 9L6 7Z"></path></svg></span>
                </button>
                <button class="t-btn-icon fold-toggle-btn group relative flex items-center justify-center rounded-full size-10 bg-[#f8fafc] dark:bg-gray-800 text-[#1e293b] dark:text-slate-200 border border-slate-200 dark:border-gray-700 hover:text-primary dark:hover:text-primary" aria-label="Toggle code fold">
                    <span class="fold-icon-expand text-xl text-gray-600 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M18.2072 9.0428 12.0001 2.83569 5.793 9.0428 7.20721 10.457 12.0001 5.66412 16.793 10.457 18.2072 9.0428ZM5.79285 14.9572 12 21.1643 18.2071 14.9572 16.7928 13.543 12 18.3359 7.20706 13.543 5.79285 14.9572Z"></path></svg>
                    </span>
                    <span class="fold-icon-collapse hidden text-xl text-gray-600 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M5.79285 5.20718 12 11.4143 18.2071 5.20718 16.7928 3.79297 12 8.58586 7.20706 3.79297 5.79285 5.20718ZM18.2072 18.7928 12.0001 12.5857 5.793 18.7928 7.20721 20.207 12.0001 15.4141 16.793 20.207 18.2072 18.7928Z"></path></svg>
                    </span>
                </button>
                <button class="code-nav-btn code-nav-bottom" type="button" data-code-nav="bottom" aria-label="Scroll to code block bottom">
                    <span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M12 10.0858L7.20711 5.29291L5.79289 6.70712L12 12.9142L18.2071 6.70712L16.7929 5.29291L12 10.0858ZM18 17L6 17L6 15L18 15V17Z"></path></svg></span>
                </button>
            </div>` : '';

        return `
    <div class="${containerClass}" style="contain-intrinsic-size: auto ${intrinsicHeightPx}px">
        <div class="flex items-center justify-between">
            ${langLabel}
            ${renderCopyButton()}
        </div>
        <div class="code-wrapper relative">
            <div class="code-content"${contentStyle}>
                <pre><code class="hljs${langClass}">${highlightCodeHtml(code, normalizedLanguage)}</code></pre>
            </div>${controlsHtml}
        </div>
    </div>`;
    };

    return renderer;
}

let _setupDone = false;
function setup() {
    if (_setupDone) return;
    marked.use({
        renderer: buildRenderer(),
        extensions: [footnoteRefExtension, calloutBlockExtension, mathBlockExtension, mathInlineExtension],
        mangle: false,
        headerIds: false
    });
    marked.setOptions({ breaks: true, gfm: true });
    _setupDone = true;
}

// ⚠️ 非线程安全：parseMarkdown 通过模块级全局 (activeFootnoteContext / activePostOptions)
// 把脚注上下文和图片标题选项穿透给 marked 扩展。函数内部用 try-finally 风格的
// previous-restore 保护「同步嵌套调用」（如 callout 内嵌 markdown），但若未来
// 引入 worker / 并行渲染多篇文章，这两个全局会被串扰。
// 真要并行的话，需要把 ctx 塞进 marked 扩展的 tokenizer/renderer 闭包参数里。
function parseMarkdown(content, { includeFootnotesSection = true, enableImageCaptions = false } = {}) {
    setup();
    const normalizedContent = normalizeMultilineVideoImages(content || '');
    const tableColumnWidths = collectMarkdownTableColumnWidths(normalizedContent);
    const prepared = prepareMarkdownSpacing(preserveMarkdownGaps(normalizedContent));
    const { markdown, defs } = extractFootnoteDefinitions(prepared);
    const previousContext = activeFootnoteContext;
    const previousPostOptions = activePostOptions;
    activePostOptions = { enableImageCaptions };
    activeFootnoteContext = createFootnoteContext(defs);
    const html = applyMarkdownTableColumnWidths(marked.parse(markdown), tableColumnWidths);
    const footnotesHtml = includeFootnotesSection ? renderFootnotesSection() : '';
    activeFootnoteContext = previousContext;
    activePostOptions = previousPostOptions;
    return html + footnotesHtml;
}

module.exports = {
    setup,
    parseMarkdown,
    autoSpacing,
    autoSpacingHtml,
    applyParagraphAlignment,
    extractHeadingsAndGenerateTOC,
    addHeadingIds,
    parseImageStyleAudio,
    parseImageStyleAudioList,
    stripMarkdown,
    slugify
};
