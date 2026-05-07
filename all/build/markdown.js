const { marked } = require('marked');
const katex = require('katex');

/**
 * Markdown 处理：marked 渲染器自定义、扩展、空格处理、TOC、stripMarkdown 等。
 * 对外仅暴露 setup() / parseMarkdown() / autoSpacing() / autoSpacingHtml() /
 * applyParagraphAlignment() / extractHeadingsAndGenerateTOC() / addHeadingIds() /
 * stripMarkdown() / slugify()。
 */

// ===== slugify =====
function slugify(text) {
    return String(text)
        .toLowerCase()
        .trim()
        .replace(/[\s]+/g, '-')
        .replace(/[^\w一-龥\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// ===== 空格 / 中英混排处理 =====
function autoSpacing(text) {
    if (!text) return '';
    const west = 'a-zA-Z0-9$%.';
    let processed = text
        .replace(new RegExp(`([\\u4e00-\\u9fa5])([${west}])`, 'g'), '$1 $2')
        .replace(new RegExp(`([${west}])([\\u4e00-\\u9fa5])`, 'g'), '$1 $2');
    return processed.replace(/ {2,}/g, ' ');
}

function getFenceMarker(line) {
    const match = /^ {0,3}(`{3,}|~{3,})/.exec(line || '');
    return match ? match[1] : '';
}

function closesFence(marker, openingMarker) {
    return Boolean(marker && openingMarker && marker[0] === openingMarker[0] && marker.length >= openingMarker.length);
}

function preserveFencedCodeBlocks(content, transform) {
    if (!content) return '';
    const blocks = [];
    const placeholderPrefix = '__CODE_BLOCK_';
    const placeholderSuffix = '__';
    const lines = String(content).split(/\r?\n/);
    const output = [];
    let currentBlock = null;
    let openingMarker = '';

    function pushBlock(blockLines) {
        const key = `${placeholderPrefix}${blocks.length}${placeholderSuffix}`;
        blocks.push(blockLines.join('\n'));
        output.push(key);
    }

    for (const line of lines) {
        const marker = getFenceMarker(line);
        if (currentBlock) {
            currentBlock.push(line);
            if (closesFence(marker, openingMarker)) {
                pushBlock(currentBlock);
                currentBlock = null;
                openingMarker = '';
            }
            continue;
        }

        if (marker) {
            currentBlock = [line];
            openingMarker = marker;
            continue;
        }

        output.push(line);
    }

    if (currentBlock) pushBlock(currentBlock);

    const processed = transform(output.join('\n'));
    return processed.replace(new RegExp(`${placeholderPrefix}(\\d+)${placeholderSuffix}`, 'g'), (m, idx) => blocks[Number(idx)]);
}

function createMarkdownGapMarker(blankLineCount) {
    const lines = Math.max(0, Number(blankLineCount) || 0);
    const gapSize = (0.28 + lines * 0.14).toFixed(2);
    return `<div class="markdown-gap" data-md-gap-lines="${lines}" aria-hidden="true" style="--md-gap-lines:${lines};--md-gap-size:${gapSize}lh"></div>`;
}

function isStandaloneVisualBlockLine(line) {
    const trimmed = String(line || '').trim();
    if (!trimmed) return false;
    if (/^!\[[^\]]*\]\([^)]+\)\s*$/.test(trimmed)) return true;
    if (/^<(?:figure|picture|img|video|iframe|table|center)\b/i.test(trimmed)) return true;
    if (/^<div\b[^>]*\b(?:mermaid|post-image|markdown-media)\b/i.test(trimmed)) return true;
    return false;
}

function shouldPreserveMarkdownGap(_prevLine, nextLine) {
    return isStandaloneVisualBlockLine(nextLine);
}

function preserveMarkdownGaps(content) {
    if (!content) return '';
    const lines = String(content).split(/\r?\n/);
    const output = [];
    let inFence = false;
    let fenceMarker = '';

    function appendVisualGapAfterLine(line, nextLine) {
        if (line.trim() && nextLine && nextLine.trim() && shouldPreserveMarkdownGap(line, nextLine)) {
            output.push(createMarkdownGapMarker(0));
        }
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const nextLine = i + 1 < lines.length ? lines[i + 1] : '';

        const marker = getFenceMarker(line);
        if (marker) {
            const wasInFence = inFence;
            if (!inFence) {
                inFence = true;
                fenceMarker = marker;
            } else if (closesFence(marker, fenceMarker)) {
                inFence = false;
                fenceMarker = '';
            }
            output.push(line);
            if (wasInFence && !inFence) appendVisualGapAfterLine(line, nextLine);
            continue;
        }

        if (inFence || line.trim() !== '') {
            output.push(line);
            if (!inFence) appendVisualGapAfterLine(line, nextLine);
            continue;
        }

        const blankStart = i;
        while (i + 1 < lines.length && lines[i + 1].trim() === '') i++;
        const blankLineCount = i - blankStart + 1;
        const prevLine = output.length ? output[output.length - 1] : '';
        const nextNonBlankLine = i + 1 < lines.length ? lines[i + 1] : '';

        if (prevLine.trim() && nextNonBlankLine.trim() && shouldPreserveMarkdownGap(prevLine, nextNonBlankLine)) {
            output.push('');
            output.push(createMarkdownGapMarker(blankLineCount));
            output.push('');
        } else {
            for (let j = 0; j < blankLineCount; j++) output.push('');
        }
    }

    return output.join('\n');
}

function prepareMarkdownSpacing(content) {
    if (!content) return '';
    return preserveFencedCodeBlocks(content, (text) => {
        return text
            // 移除标题中的加粗符号
            .replace(/^(#{1,6}\s+)(.*)$/gm, (m, prefix, body) => prefix + body.replace(/\*\*\*|\*\*/g, ''))
            // 智能处理粗体/斜体/删除线前后的空格
            .replace(/(\*\*\*|\*\*|___|__|~~)(.+?)\1/g, (match, marker, inner, offset, fullStr) => {
                const prevChar = fullStr[offset - 1];
                const nextChar = fullStr[offset + match.length];
                const isPunctuation = /[.,;!?:，。；！？：()\[\]{}（）【】“”‘’"']/;

                let prefix = '';
                let suffix = '';
                if (prevChar && !/\s/.test(prevChar) && !isPunctuation.test(prevChar)) prefix = ' ';
                if (nextChar && !/\s/.test(nextChar) && !isPunctuation.test(nextChar)) suffix = ' ';
                return prefix + match + suffix;
            })
            .replace(/([^\n])\n(!\[[^\]]*\]\([^)]+\))/g, '$1\n\n$2')
            .replace(/\]\(([^)\s]+)\s+'([^']+)'\)/g, ']($1 "$2")')
            // 中英文及数字间自动空格
            .replace(/([一-龥])([a-zA-Z0-9$%.])/g, '$1 $2')
            .replace(/([a-zA-Z0-9$%.])([一-龥])/g, '$1 $2')
            .replace(/\] \(http/g, '](http')
            // 缩进 - 列表转换为 * 列表，避免被误识别为 Setext 标题。
            // 这里只能匹配同一行内的空格/Tab，不能用 \s；\s 会吞掉换行，
            // 导致普通列表块的第一项被误改成另一种列表标记。
            .replace(/^([ \t]{2,})-\s/gm, '$1* ');
    });
}

function detectTextType(text) {
    if (!text) return 'mixed';
    const cleanText = String(text).replace(/<[^>]+>/g, '').replace(/&[a-z0-9]+;/gi, '').trim();
    if (!cleanText) return 'mixed';

    const cjkRegex = /[一-龥　-〿＀-￯]/;
    const latinRegex = /[a-zA-Z]/;
    const numberRegex = /[0-9]/;

    let hasCJK = false, hasLatin = false, hasNumber = false;
    for (const ch of cleanText) {
        if (cjkRegex.test(ch)) hasCJK = true;
        if (latinRegex.test(ch)) hasLatin = true;
        if (numberRegex.test(ch)) hasNumber = true;
    }

    if (hasCJK && !hasLatin && !hasNumber) return 'cjk';
    if (!hasCJK) return 'latin';
    return 'mixed';
}

function applyParagraphAlignment(html) {
    if (!html) return '';
    return html.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi, (match, attrs, content) => {
        const textType = detectTextType(content);
        const alignClass = textType === 'cjk' ? 'text-justify-cjk' : 'text-align-left';

        if (attrs.includes('class=')) {
            attrs = attrs.replace(/class="([^"]*)"/, `class="$1 ${alignClass}"`);
            attrs = attrs.replace(/class='([^']*)'/, `class='$1 ${alignClass}'`);
        } else {
            attrs = ` class="${alignClass}"${attrs}`;
        }
        return `<p${attrs}>${content}</p>`;
    });
}

function autoSpacingHtml(html) {
    if (!html) return '';
    const preBlocks = [];
    const prePlaceholderPrefix = '__PRE_BLOCK_';
    const prePlaceholderSuffix = '__';
    const htmlWithPlaceholders = html.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, (match) => {
        const key = `${prePlaceholderPrefix}${preBlocks.length}${prePlaceholderSuffix}`;
        preBlocks.push(match);
        return key;
    });

    const west = 'a-zA-Z0-9$%.';
    let res = htmlWithPlaceholders
        .replace(new RegExp(`([\\u4e00-\\u9fa5])((?:<[^>]+>)+)([${west}])`, 'g'), '$1 $2$3')
        .replace(new RegExp(`([${west}])((?:<[^>]+>)+)([\\u4e00-\\u9fa5])`, 'g'), '$1$2 $3');

    res = res.replace(/(<(?!\/)[^>]+>)\s+/g, '$1').replace(/\s+(<\/[^>]+>)/g, '$1');
    res = res.replace(/>([^<]+)</g, (m, p1) => '>' + autoSpacing(p1) + '<');
    res = res.replace(/ {2,}/g, ' ');

    return res.replace(new RegExp(`${prePlaceholderPrefix}(\\d+)${prePlaceholderSuffix}`, 'g'), (m, idx) => preBlocks[Number(idx)]);
}

function normalizeImageHref(href) {
    const raw = String(href || '').trim();
    if (!raw) return '';
    if (/^(?:https?:)?\/\//i.test(raw) || /^(?:data|blob):/i.test(raw) || raw.startsWith('/')) return raw;

    const normalized = raw.replace(/\\/g, '/');
    const imagePathMatch = /^(?:\.\.\/|\.\/)*all\/image\/(.+)$/i.exec(normalized);
    if (imagePathMatch) return `/image/${imagePathMatch[1]}`;

    return raw;
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

function extractHeadingsAndGenerateTOC(content) {
    const sanitized = content
        .replace(/^([ \t]*)(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\2[^\n]*$/gm, '')
        .replace(/`[^`\n]*`/g, '');

    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings = [];
    const usedHeadingIds = new Set();
    let match;

    while ((match = headingRegex.exec(sanitized)) !== null) {
        const level = match[1].length;
        const text = match[2].trim().replace(/\*\*/g, '');
        const id = createUniqueHeadingId(slugify(text), usedHeadingIds, `heading-${headings.length}`);
        headings.push({ level, text, id });
    }

    if (headings.length === 0) return { toc: '', headings: [] };

    const uniqueLevels = [...new Set(headings.map(h => h.level))].sort((a, b) => a - b);
    const targetLevels = uniqueLevels.slice(0, 2);
    const minLevel = uniqueLevels[0];

    let tocHtml = '';
    let firstL1 = true;
    headings.forEach(h => {
        if (!targetLevels.includes(h.level)) return;
        const isSecondLevel = h.level > minLevel;
        const paddingClass = isSecondLevel ? 'pl-8' : 'pl-4';
        const pyClass = 'py-1';

        let mtClass = '';
        if (!isSecondLevel) {
            if (!firstL1) mtClass = ' mt-4';
            firstL1 = false;
        }

        tocHtml += `<a class="${paddingClass} ${pyClass}${mtClass} text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex" href="#${h.id}">${autoSpacing(h.text)}</a>\n`;
    });

    return { toc: tocHtml, headings };
}

function addHeadingIds(html, headings) {
    const uniqueLevels = [...new Set(headings.map(h => h.level))].sort((a, b) => a - b);
    const minLevel = uniqueLevels[0] || 1;
    let headingIndex = 0;

    return html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/gi, (match, level, innerHtml) => {
        const h = headings[headingIndex++];
        if (!h) return match;
        const visualDepth = Math.min(Math.max(h.level - minLevel + 1, 1), 4);
        return `<h${h.level} id="${h.id}" class="article-heading article-heading-depth-${visualDepth} article-heading-source-h${h.level} scroll-mt-24">${innerHtml}</h${h.level}>`;
    });
}

// ===== Markdown → 纯文本（用于摘要 / 搜索索引） =====
function stripMarkdown(text) {
    if (!text) return '';

    let clean = text.replace(/^>\s*\[![^\]]+\](?:\r?\n>[^\r?\n]*)*\r?\n?/gm, '');

    const allLinksRegex = /\[([^\]]*?)\]\s*\([^\)]+?\)/gi;
    let hasAudio = false;
    const audioExtensions = ['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac', '.opus'];

    clean = clean.replace(allLinksRegex, (match, label) => {
        const urlLower = match.toLowerCase();
        const hasAudioExt = audioExtensions.some(ext => urlLower.includes(ext));
        if (label.includes('🎵') || hasAudioExt) {
            hasAudio = true;
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
        .replace(/\[\^.+?\]/g, '')
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (hasAudio) clean = '🎶 ' + clean;
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
        return `<div class="callout callout-${token.calloutType}" data-callout="${token.calloutType}"><div class="callout-title"><span class="callout-icon">${svgIcon}</span><span class="callout-title-inner">${token.title}</span></div><div class="callout-content">${innerHtml}</div></div>\n`;
    }
};

// ===== marked 自定义渲染器 =====
function buildRenderer() {
    const renderer = new marked.Renderer();
    const linkRenderer = renderer.link;
    renderer.link = (href, title, text) => {
        const html = linkRenderer.call(renderer, href, title, text);
        return html.replace(/^<a /, '<a target="_blank" ');
    };

    renderer.image = (href, title, text) => {
        const fallbackSrc = '/image/404.png';
        const safeHref = normalizeImageHref(href).replace(/"/g, '&quot;');
        const safeAlt = (text || '').replace(/"/g, '&quot;');
        const safeTitle = title ? ` title="${title.replace(/"/g, '&quot;')}"` : '';
        const caption = (title && title.trim()) ? title.trim() : (text || '').trim();
        const enableCaption = Boolean(activePostOptions && activePostOptions.enableImageCaptions);

        return `
    <figure class="post-image relative w-full">
        <span class="loader absolute top-12 left-12 z-10" style="display:none"></span>
        <img src="${safeHref}" alt="${safeAlt}"${safeTitle}
            onerror="if(this.dataset.fallbackApplied!=='true'){
                this.dataset.fallbackApplied='true';
                this.removeAttribute('srcset');
                this.src='${fallbackSrc}';
                const loader = this.previousElementSibling;
                if(loader && loader.classList.contains('loader')) loader.style.display='block';
            }"
            loading="lazy" />
        ${(enableCaption && caption) ? `<figcaption class="image-caption block text-center text-sm text-slate-500 dark:text-slate-400">${caption.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</figcaption>` : ''}
    </figure>`;
    };

    const paragraphRenderer = renderer.paragraph;
    renderer.paragraph = (text) => {
        const trimmed = String(text || '').trim();
        if (/^<figure\b[^>]*\bpost-image\b[^>]*>[\s\S]*<\/figure>$/i.test(trimmed)) {
            return trimmed + '\n';
        }
        return paragraphRenderer.call(renderer, text);
    };

    renderer.code = (code, language) => {
        const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        const langClass = language ? `language-${language}` : '';
        const langLabel = language
            ? `<span class="text-xs font-mono text-slate-500 uppercase tracking-wider">${language}</span>`
            : '<span class="text-lg font-mono text-slate-300 dark:text-slate-600 tracking-[2px]">•••</span>';

        return `
    <div class="code-block-container group my-6 rounded-xl bg-[#f8fafc] dark:bg-transparent overflow-hidden border border-slate-200/50 dark:border-slate-700/50 code-fold">
        <div class="flex items-center justify-between px-5 py-2.5 bg-[#f1f5f9] dark:bg-[#0f172a] border-b border-slate-200/50 dark:border-slate-700/50">
            ${langLabel.replace('text-slate-500', 'text-slate-500 dark:text-slate-400')}
            <label class="copy-btn-container">
                <input type="checkbox" class="copy-checkbox">
                <div class="clipboard">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM5.00242 8L5.00019 20H14.9998V8H5.00242ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6Z"></path></svg>
                </div>
                <div class="clipboard-check">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M10.0007 15.1709L19.1931 5.97852L20.6073 7.39273L10.0007 17.9993L3.63672 11.6354L5.05093 10.2212L10.0007 15.1709Z"></path></svg>
                </div>
            </label>
        </div>
        <div class="code-wrapper relative">
            <div class="code-content px-8 py-7 bg-[#f8fafc] dark:bg-transparent overflow-x-auto transition-all duration-300 ease-in-out">
                <pre class="!m-0 !p-0 !bg-transparent"><code class="${langClass} font-mono text-sm leading-relaxed text-slate-900 dark:text-slate-300 font-medium">${escapedCode}</code></pre>
            </div>
            <div class="code-fold-controls hidden absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc] via-40% dark:from-background-dark dark:via-background-dark dark:via-40% to-transparent items-end justify-center pb-2 z-10 transition-opacity duration-300">
                <button class="t-btn-icon fold-toggle-btn group relative flex items-center justify-center rounded-full size-10 bg-[#f8fafc] dark:bg-gray-800 text-[#111318] dark:text-slate-200 border border-slate-200 dark:border-gray-700 hover:text-primary dark:hover:text-primary" aria-label="Toggle code fold">
                    <span class="fold-icon-expand text-xl text-gray-600 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M18.2072 9.0428 12.0001 2.83569 5.793 9.0428 7.20721 10.457 12.0001 5.66412 16.793 10.457 18.2072 9.0428ZM5.79285 14.9572 12 21.1643 18.2071 14.9572 16.7928 13.543 12 18.3359 7.20706 13.543 5.79285 14.9572Z"></path></svg>
                    </span>
                    <span class="fold-icon-collapse hidden text-xl text-gray-600 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M5.79285 5.20718 12 11.4143 18.2071 5.20718 16.7928 3.79297 12 8.58586 7.20706 3.79297 5.79285 5.20718ZM18.2072 18.7928 12.0001 12.5857 5.793 18.7928 7.20721 20.207 12.0001 15.4141 16.793 20.207 18.2072 18.7928Z"></path></svg>
                    </span>
                </button>
            </div>
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

function parseMarkdown(content, { includeFootnotesSection = true, enableImageCaptions = false } = {}) {
    setup();
    const prepared = prepareMarkdownSpacing(preserveMarkdownGaps(content || ''));
    const { markdown, defs } = extractFootnoteDefinitions(prepared);
    const previousContext = activeFootnoteContext;
    const previousPostOptions = activePostOptions;
    activePostOptions = { enableImageCaptions };
    activeFootnoteContext = createFootnoteContext(defs);
    const html = marked.parse(markdown);
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
    stripMarkdown,
    slugify
};
