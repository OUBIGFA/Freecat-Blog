const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const katex = require('katex');
const matter = require('gray-matter');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const postCardTemplate = require(path.join(__dirname, 'src', 'assets', 'post-card-template.js'));

// 配置 dayjs 支持时区
dayjs.extend(utc);
dayjs.extend(timezone);
// 设置默认时区为北京时间（Asia/Shanghai）
dayjs.tz.setDefault('Asia/Shanghai');

// === 读取预生成的 Git 提交时间数据 ===
// extract-git-dates.js 会在构建前生成这个文件
// 这种方式比运行时调用 git 命令更可靠，尤其是在 Vercel 等 CI/CD 平台上
let gitDatesCache = {};
try {
    const gitDatesFile = path.join(__dirname, 'git-dates.json');
    if (fs.existsSync(gitDatesFile)) {
        gitDatesCache = JSON.parse(fs.readFileSync(gitDatesFile, 'utf-8'));
        console.log(`📅 已加载 ${Object.keys(gitDatesCache).length} 个文件的 Git 提交时间数据`);
    } else {
        console.log('⚠️  未找到 git-dates.json，将使用文件系统时间');
    }
} catch (err) {
    console.log('⚠️  读取 git-dates.json 失败，将使用文件系统时间');
}

// 工具函数：从缓存中获取文件的最后修改时间
function getGitLastModifiedDate(filename) {
    if (gitDatesCache[filename]) {
        return dayjs(gitDatesCache[filename]);
    }
    return null;
}

// === 配置 marked 选项 ===
const renderer = new marked.Renderer();
const linkRenderer = renderer.link;
renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text);
    return html.replace(/^<a /, '<a target="_blank" ');
};

// 自定义图片渲染：添加 onerror 兜底处理
renderer.image = (href, title, text) => {
    // 兜底图片路径
    const fallbackSrc = '/image/404.png';
    // 转义属性值中的引号
    const safeHref = (href || '').replace(/"/g, '&quot;');
    const safeAlt = (text || '').replace(/"/g, '&quot;');
    const safeTitle = title ? ` title="${title.replace(/"/g, '&quot;')}"` : '';
    const caption = (title && title.trim()) ? title.trim() : (text || '').trim();
    const enableCaption = Boolean(activePostOptions && activePostOptions.enableImageCaptions);

    // 生成带有 onerror 的图片标签
    // onerror 会在图片加载失败时立即触发，并在显示兜底图的同时显示动效图标
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

// 自定义代码块渲染
renderer.code = (code, language) => {


    // 简单的 HTML 转义
    const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const langClass = language ? `language-${language}` : '';
    const langLabel = language ? `<span class="text-xs font-mono text-slate-500 uppercase tracking-wider">${language}</span>` : '<span class="text-lg font-mono text-slate-300 dark:text-slate-600 tracking-[2px]">•••</span>';

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
                <button class="fold-toggle-btn group relative flex items-center justify-center rounded-full size-10 bg-[#f8fafc] dark:bg-gray-800 text-[#111318] dark:text-slate-200 border border-slate-200 dark:border-gray-700 hover:text-primary dark:hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md" aria-label="Toggle code fold">
                    <span class="fold-icon-expand text-xl transition-transform duration-300 group-hover:scale-110 text-gray-600 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M18.2072 9.0428 12.0001 2.83569 5.793 9.0428 7.20721 10.457 12.0001 5.66412 16.793 10.457 18.2072 9.0428ZM5.79285 14.9572 12 21.1643 18.2071 14.9572 16.7928 13.543 12 18.3359 7.20706 13.543 5.79285 14.9572Z"></path></svg>
                    </span>
                    <span class="fold-icon-collapse hidden text-xl transition-transform duration-300 group-hover:scale-110 text-gray-600 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M5.79285 5.20718 12 11.4143 18.2071 5.20718 16.7928 3.79297 12 8.58586 7.20706 3.79297 5.79285 5.20718ZM18.2072 18.7928 12.0001 12.5857 5.793 18.7928 7.20721 20.207 12.0001 15.4141 16.793 20.207 18.2072 18.7928Z"></path></svg>
                    </span>
                </button>
            </div>
        </div>
    </div>`;
};

const katexOptions = {
    throwOnError: false,
    strict: 'ignore'
};

const mathBlockExtension = {
    name: 'mathBlock',
    level: 'block',
    start(src) {
        const index = src.indexOf('$$');
        return index >= 0 ? index : undefined;
    },
    tokenizer(src) {
        const blockMatch = /^\$\$\s*\r?\n([\s\S]+?)\r?\n\$\$(?:\s*\r?\n|$)/.exec(src);
        if (blockMatch) {
            return {
                type: 'mathBlock',
                raw: blockMatch[0],
                text: blockMatch[1].trim()
            };
        }

        const oneLineMatch = /^\$\$([\s\S]+?)\$\$(?:\s*\r?\n|$)/.exec(src);
        if (oneLineMatch) {
            return {
                type: 'mathBlock',
                raw: oneLineMatch[0],
                text: oneLineMatch[1].trim()
            };
        }
    },
    renderer(token) {
        return katex.renderToString(token.text, { ...katexOptions, displayMode: true }) + '\n';
    }
};

function tokenizeInlineMath(src) {
    if (!src || src[0] !== '$' || src[1] === '$') return;

    for (let i = 1; i < src.length; i++) {
        const ch = src[i];
        if (ch === '\n') return;
        if (ch === '\\') {
            i++;
            continue;
        }
        if (ch === '$') {
            const raw = src.slice(0, i + 1);
            const text = src.slice(1, i);
            if (!text.trim()) return;
            return { raw, text };
        }
    }
}

const mathInlineExtension = {
    name: 'mathInline',
    level: 'inline',
    start(src) {
        const index = src.indexOf('$');
        return index >= 0 ? index : undefined;
    },
    tokenizer(src) {
        const tokenized = tokenizeInlineMath(src);
        if (!tokenized) return;
        return {
            type: 'mathInline',
            raw: tokenized.raw,
            text: tokenized.text
        };
    },
    renderer(token) {
        return katex.renderToString(token.text, { ...katexOptions, displayMode: false });
    }
};

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

    for (const id of unreferenced) {
        assignFootnoteNumberIfMissing(id);
    }

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

const footnoteRefExtension = {
    name: 'footnoteRef',
    level: 'inline',
    start(src) {
        const index = src.indexOf('[^');
        return index >= 0 ? index : undefined;
    },
    tokenizer(src) {
        const match = /^\[\^([^\]\s]+?)\]/.exec(src);
        if (!match) return;
        return {
            type: 'footnoteRef',
            raw: match[0],
            id: match[1]
        };
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

function parseMarkdown(content, { includeFootnotesSection = true, enableImageCaptions = false } = {}) {
    const prepared = prepareMarkdownSpacing(content || '');
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

const calloutBlockExtension = {
    name: 'calloutBlock',
    level: 'block',
    start(src) {
        const index = src.search(/^>\s*\[!/m);
        return index >= 0 ? index : undefined;
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

        return {
            type: 'calloutBlock',
            raw,
            calloutType: type,
            title,
            text
        };
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

marked.use({
    renderer,
    extensions: [footnoteRefExtension, calloutBlockExtension, mathBlockExtension, mathInlineExtension],
    mangle: false,
    headerIds: false
});

// 配置 marked 支持换行符转换为 HTML <br> 标签
marked.setOptions({
    breaks: true,  // 支持换行符转换为 <br>
    gfm: true      // 支持 GitHub 风格 Markdown
});

// === 配置 ===
const DEFAULT_POSTS_PER_PAGE = 8;
const DIRS = {
    posts: path.join(__dirname, '..', 'writing'),
    assets: path.join(__dirname, 'src', 'assets'),
    images: path.join(__dirname, 'image'),
    output: path.join(__dirname, 'dist'),
    templates: path.join(__dirname, 'src'),
    control: path.join(__dirname, '..', 'Control')
};

// 工具函数：在 Control 目录中根据关键字寻找配置文件
function findConfigPath(keyword, defaultName) {
    if (!fs.existsSync(DIRS.control)) return path.join(DIRS.control, defaultName);
    const files = fs.readdirSync(DIRS.control);
    const match = files.find(f => f.toLowerCase().includes(keyword.toLowerCase()) && f.endsWith('.md'));
    return match ? path.join(DIRS.control, match) : path.join(DIRS.control, defaultName);
}

// 工具函数：归复制目录
// Parse key: value configs without front matter.
function parseLooseConfig(raw) {
    const data = {};
    const lines = raw.split(/\r?\n/);

    for (const line of lines) {
        if (!line.trim()) continue;
        const separatorIndex = line.indexOf(':');
        if (separatorIndex <= 0) continue;

        const key = line.slice(0, separatorIndex).trim();
        if (!key || key.startsWith('_')) continue;

        let value = line.slice(separatorIndex + 1).trim();
        if (/^(true|false)$/i.test(value)) {
            value = value.toLowerCase() === 'true';
        } else if (/^-?\d+(\.\d+)?$/.test(value)) {
            value = Number(value);
        }

        data[key] = value;
    }

    return data;
}

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 工具函数：将文本转换为 slug 友好的 ID
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s]+/g, '-')
        .replace(/[^\w\u4e00-\u9fa5\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

// 工具函数：从 Markdown 内容中提取标题并生成目录
function extractHeadingsAndGenerateTOC(content) {
    // 匹配 H1-H6 标题的正则表达式
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length; // 1-6
        const text = match[2].trim().replace(/\*\*/g, '');
        const id = slugify(text) || `heading-${headings.length}`;
        headings.push({ level, text, id });
    }

    if (headings.length === 0) {
        return { toc: '', headings: [] };
    }

    // 统计所有出现的标题层级
    const uniqueLevels = [...new Set(headings.map(h => h.level))].sort((a, b) => a - b);
    // 仅显示前两个层级
    const targetLevels = uniqueLevels.slice(0, 2);
    const minLevel = uniqueLevels[0];

    // 生成目录 HTML
    let tocHtml = '';
    let firstL1 = true;
    headings.forEach(h => {
        // 仅处理目标层级的标题，其他层级忽略
        if (!targetLevels.includes(h.level)) return;

        // 样式：最小层级（最高级）pl-4，其它（次级）pl-8
        const isSecondLevel = h.level > minLevel;
        const paddingClass = isSecondLevel ? 'pl-8' : 'pl-4';

        // 所有项统一使用 py-1，确保 L1->L2 和 L2->L2 间距紧凑
        const pyClass = 'py-1';

        // 为非首个的第一层级项添加 mt-2，以保持大层级之间的分隔
        let mtClass = '';
        if (!isSecondLevel) {
            if (!firstL1) {
                mtClass = ' mt-4';
            }
            firstL1 = false;
        }

        tocHtml += `<a class="${paddingClass} ${pyClass}${mtClass} text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors flex" href="#${h.id}">${autoSpacing(h.text)}</a>\n`;
    });

    return { toc: tocHtml, headings };
}

// 工具函数：为 HTML 中的标题添加 ID（无装饰符号），并按层级应用不同字体大小
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


// 工具函数：转义正则表达式特殊字符
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// === 0. 初始化清理与目录创建 ===
if (fs.existsSync(DIRS.output)) fs.rmSync(DIRS.output, { recursive: true, force: true });
fs.mkdirSync(DIRS.output);
fs.mkdirSync(path.join(DIRS.output, 'posts'));

// === 1. 资产搬运 (Asset Pipeline) ===
console.log('📦 Moving assets and configs...');

if (fs.existsSync(DIRS.assets)) {
    copyDir(DIRS.assets, path.join(DIRS.output, 'assets'));
}
if (fs.existsSync(DIRS.images)) {
    copyDir(DIRS.images, path.join(DIRS.output, 'image'));
}

// B. 读取 Tailwind Config 内容用于注入
let tailwindConfigContent = '';
const configPath = path.join(DIRS.assets, 'tailwind.config.js');
if (fs.existsSync(configPath)) {
    tailwindConfigContent = fs.readFileSync(configPath, 'utf-8');
}

// === 2. 读取站点配置 ===
console.log('⚙️ Loading site configuration...');
const siteConfigPath = findConfigPath('site', 'site.md');
let siteConfig = {
    site_title: 'FreeCat Blog',
    site_name: 'FreeCat',
    footer_copyright: '© FreeCat | Curiosity is the best motivation.',
    hero_title: 'Hi, I\'m FreeCat.Building Blog & writing.',
    hero_subtitle: 'Always maintain a strong curiosity and be willing to explore a world of freedom, experiencing a life of liberty.',
    hero_avatar: '/image/freecat.png',
    posts_per_page: DEFAULT_POSTS_PER_PAGE,
    default_theme: 'system',    // 可选值：'system', 'light', 'dark'
    site_logo_icon: '', // 网站图标，可以是 SVG 代码或图片 URL
    site_favicon: '/image/freecat_web_icon.png',
    site_url: '' // 网站正式域名
};

if (fs.existsSync(siteConfigPath)) {
    const siteConfigRaw = fs.readFileSync(siteConfigPath, 'utf-8');
    const { data: configData } = matter(siteConfigRaw);
    const fallbackData = Object.keys(configData).length ? {} : parseLooseConfig(siteConfigRaw);
    // 合并默认配置和用户配置
    siteConfig = { ...siteConfig, ...configData, ...fallbackData };
    console.log(`  Loaded configuration from: ${path.basename(siteConfigPath)}`);
} else {
    console.log('  site.md not found, using defaults');
}
if (!siteConfig.site_favicon) siteConfig.site_favicon = '/image/freecat_web_icon.png';
if (!siteConfig.hero_avatar) siteConfig.hero_avatar = '/image/freecat.png';

// === 读取社交媒体配置 ===
const rawPostsPerPage = siteConfig.posts_per_page;
const parsedPostsPerPage = rawPostsPerPage === '' || rawPostsPerPage == null
    ? Number.NaN
    : Number(rawPostsPerPage);
const POSTS_PER_PAGE = Number.isFinite(parsedPostsPerPage) && parsedPostsPerPage >= 0
    ? Math.floor(parsedPostsPerPage)
    : DEFAULT_POSTS_PER_PAGE;

console.log('📱 Loading social media configuration...');
const socialConfigPath = findConfigPath('social', 'social.md');
let socialConfig = {
    twitter_enabled: true,
    twitter_icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.3499 5.55005C13.7681 5.55005 12.4786 6.81809 12.4504 8.39658L12.4223 9.97162C12.4164 10.3029 12.143 10.5667 11.8117 10.5608C11.7881 10.5604 11.7646 10.5586 11.7413 10.5554L10.1805 10.3426C8.12699 10.0625 6.15883 9.11736 4.27072 7.54411C3.67275 10.8538 4.84 13.1472 7.65342 14.916L9.40041 16.0142C9.68095 16.1906 9.7654 16.561 9.58903 16.8415C9.54861 16.9058 9.49636 16.9619 9.43504 17.0067L7.84338 18.1696C8.78973 18.229 9.68938 18.1875 10.435 18.0387C15.1526 17.0973 18.2897 13.547 18.2897 7.69109C18.2897 7.213 17.2774 5.55005 15.3499 5.55005ZM10.4507 8.3609C10.4983 5.69584 12.6735 3.55005 15.3499 3.55005C16.7132 3.55005 17.9465 4.10683 18.8348 5.0054C19.5462 5.00005 20.1514 5.17991 21.5035 4.35967C21.1693 6.00005 21.0034 6.71201 20.2897 7.69109C20.2897 15.3326 15.5926 19.0489 10.8264 20C7.5587 20.6522 2.80646 19.5815 1.44531 18.1587C2.13874 18.1054 4.95928 17.802 6.58895 16.6092C5.20994 15.6987 -0.278631 12.4681 3.32772 3.78642C5.02119 5.76307 6.73797 7.10855 8.47807 7.82286C9.63548 8.29798 9.91978 8.2885 10.4507 8.3609Z"></path></svg>',
    twitter_url: 'https://x.com/home',
    instagram_enabled: true,
    instagram_icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.001 9C10.3436 9 9.00098 10.3431 9.00098 12C9.00098 13.6573 10.3441 15 12.001 15C13.6583 15 15.001 13.6569 15.001 12C15.001 10.3427 13.6579 9 12.001 9ZM12.001 7C14.7614 7 17.001 9.2371 17.001 12C17.001 14.7605 14.7639 17 12.001 17C9.24051 17 7.00098 14.7629 7.00098 12C7.00098 9.23953 9.23808 7 12.001 7ZM18.501 6.74915C18.501 7.43926 17.9402 7.99917 17.251 7.99917C16.5609 7.99917 16.001 7.4384 16.001 6.74915C16.001 6.0599 16.5617 5.5 17.251 5.5C17.9393 5.49913 18.501 6.0599 18.501 6.74915ZM12.001 4C9.5265 4 9.12318 4.00655 7.97227 4.0578C7.18815 4.09461 6.66253 4.20007 6.17416 4.38967C5.74016 4.55799 5.42709 4.75898 5.09352 5.09255C4.75867 5.4274 4.55804 5.73963 4.3904 6.17383C4.20036 6.66332 4.09493 7.18811 4.05878 7.97115C4.00703 9.0752 4.00098 9.46105 4.00098 12C4.00098 14.4745 4.00753 14.8778 4.05877 16.0286C4.0956 16.8124 4.2012 17.3388 4.39034 17.826C4.5591 18.2606 4.7605 18.5744 5.09246 18.9064C5.42863 19.2421 5.74179 19.4434 6.17187 19.6094C6.66619 19.8005 7.19148 19.9061 7.97212 19.9422C9.07618 19.9939 9.46203 20 12.001 20C14.4755 20 14.8788 19.9934 16.0296 19.9422C16.8117 19.9055 17.3385 19.7996 17.827 19.6106C18.2604 19.4423 18.5752 19.2402 18.9074 18.9085C19.2436 18.5718 19.4445 18.2594 19.6107 17.8283C19.8013 17.3358 19.9071 16.8098 19.9432 16.0289C19.9949 14.9248 20.001 14.5389 20.001 12C20.001 9.52552 19.9944 9.12221 19.9432 7.97137C19.9064 7.18906 19.8005 6.66149 19.6113 6.17318C19.4434 5.74038 19.2417 5.42635 18.9084 5.09255C18.573 4.75715 18.2616 4.55693 17.8271 4.38942C17.338 4.19954 16.8124 4.09396 16.0298 4.05781C14.9258 4.00605 14.5399 4 12.001 4ZM12.001 2C14.7176 2 15.0568 2.01 16.1235 2.06C17.1876 2.10917 17.9135 2.2775 18.551 2.525C19.2101 2.77917 19.7668 3.1225 20.3226 3.67833C20.8776 4.23417 21.221 4.7925 21.476 5.45C21.7226 6.08667 21.891 6.81333 21.941 7.8775C21.9885 8.94417 22.001 9.28333 22.001 12C22.001 14.7167 21.991 15.0558 21.941 16.1225C21.8918 17.1867 21.7226 17.9125 21.476 18.55C21.2218 19.2092 20.8776 19.7658 20.3226 20.3217C19.7668 20.8767 19.2076 21.22 18.551 21.475C17.9135 21.7217 17.1876 21.89 16.1235 21.94C15.0568 21.9875 14.7176 22 12.001 22C9.28431 22 8.94514 21.99 7.87848 21.94C6.81431 21.8908 6.08931 21.7217 5.45098 21.475C4.79264 21.2208 4.23514 20.8767 3.67931 20.3217C3.12348 19.7658 2.78098 19.2067 2.52598 18.55C2.27848 17.9125 2.11098 17.1867 2.06098 16.1225C2.01348 15.0558 2.00098 14.7167 2.00098 12C2.00098 9.28333 2.01098 8.94417 2.06098 7.8775C2.11014 6.8125 2.27848 6.0875 2.52598 5.45C2.78014 4.79167 3.12348 4.23417 3.67931 3.67833C4.23514 3.1225 4.79348 2.78 5.45098 2.525C6.08848 2.2775 6.81348 2.11 7.87848 2.06C8.94514 2.0125 9.28431 2 12.001 2Z"></path></svg>',
    instagram_url: 'https://www.instagram.com',
    github_enabled: true,
    github_icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5.88401 18.6533C5.58404 18.4526 5.32587 18.1975 5.0239 17.8369C4.91473 17.7065 4.47283 17.1524 4.55811 17.2583C4.09533 16.6833 3.80296 16.417 3.50156 16.3089C2.9817 16.1225 2.7114 15.5499 2.89784 15.0301C3.08428 14.5102 3.65685 14.2399 4.17672 14.4263C4.92936 14.6963 5.43847 15.1611 6.12425 16.0143C6.03025 15.8974 6.46364 16.441 6.55731 16.5529C6.74784 16.7804 6.88732 16.9182 6.99629 16.9911C7.20118 17.1283 7.58451 17.1874 8.14709 17.1311C8.17065 16.7489 8.24136 16.3783 8.34919 16.0358C5.38097 15.3104 3.70116 13.3952 3.70116 9.63971C3.70116 8.40085 4.0704 7.28393 4.75917 6.3478C4.5415 5.45392 4.57433 4.37284 5.06092 3.15636C5.1725 2.87739 5.40361 2.66338 5.69031 2.57352C5.77242 2.54973 5.81791 2.53915 5.89878 2.52673C6.70167 2.40343 7.83573 2.69705 9.31449 3.62336C10.181 3.41879 11.0885 3.315 12.0012 3.315C12.9129 3.315 13.8196 3.4186 14.6854 3.62277C16.1619 2.69 17.2986 2.39649 18.1072 2.52651C18.1919 2.54013 18.2645 2.55783 18.3249 2.57766C18.6059 2.66991 18.8316 2.88179 18.9414 3.15636C19.4279 4.37256 19.4608 5.45344 19.2433 6.3472C19.9342 7.28337 20.3012 8.39208 20.3012 9.63971C20.3012 13.3968 18.627 15.3048 15.6588 16.032C15.7837 16.447 15.8496 16.9105 15.8496 17.4121C15.8496 18.0765 15.8471 18.711 15.8424 19.4225C15.8412 19.6127 15.8397 19.8159 15.8375 20.1281C16.2129 20.2109 16.5229 20.5077 16.6031 20.9089C16.7114 21.4504 16.3602 21.9773 15.8186 22.0856C14.6794 22.3134 13.8353 21.5538 13.8353 20.5611C13.8353 20.4708 13.836 20.3417 13.8375 20.1145C13.8398 19.8015 13.8412 19.599 13.8425 19.4094C13.8471 18.7019 13.8496 18.0716 13.8496 17.4121C13.8496 16.7148 13.6664 16.2602 13.4237 16.051C12.7627 15.4812 13.0977 14.3973 13.965 14.2999C16.9314 13.9666 18.3012 12.8177 18.3012 9.63971C18.3012 8.68508 17.9893 7.89571 17.3881 7.23559C17.1301 6.95233 17.0567 6.54659 17.199 6.19087C17.3647 5.77663 17.4354 5.23384 17.2941 4.57702L17.2847 4.57968C16.7928 4.71886 16.1744 5.0198 15.4261 5.5285C15.182 5.69438 14.8772 5.74401 14.5932 5.66413C13.7729 5.43343 12.8913 5.315 12.0012 5.315C11.111 5.315 10.2294 5.43343 9.40916 5.66413C9.12662 5.74359 8.82344 5.69492 8.57997 5.53101C7.8274 5.02439 7.2056 4.72379 6.71079 4.58376C6.56735 5.23696 6.63814 5.77782 6.80336 6.19087C6.94565 6.54659 6.87219 6.95233 6.61423 7.23559C6.01715 7.8912 5.70116 8.69376 5.70116 9.63971C5.70116 12.8116 7.07225 13.9683 10.023 14.2999C10.8883 14.3971 11.2246 15.4769 10.5675 16.0482C10.3751 16.2156 10.1384 16.7802 10.1384 17.4121V20.5611C10.1384 21.5474 9.30356 22.2869 8.17878 22.09C7.63476 21.9948 7.27093 21.4766 7.36613 20.9326C7.43827 20.5204 7.75331 20.2116 8.13841 20.1276V19.1381C7.22829 19.1994 6.47656 19.0498 5.88401 18.6533Z"></path></svg>',
    github_url: 'https://github.com',
    behance_enabled: false,
    behance_icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 11C8.60457 11 9.5 10.1046 9.5 9C9.5 7.89543 8.60457 7 7.5 7H3V11H7.5ZM8.5 13H3V17H8.5C9.60457 17 10.5 16.1046 10.5 15C10.5 13.8954 9.60457 13 8.5 13ZM10.5632 11.5725C11.7239 12.2726 12.5 13.5457 12.5 15C12.5 17.2091 10.7091 19 8.5 19H1V5H7.5C9.70914 5 11.5 6.79086 11.5 9C11.5 9.97964 11.1478 10.877 10.5632 11.5725ZM15.5 6H21V7.5H15.5V6ZM23 14.5H15.5V14.75C15.5 16.2688 16.7312 17.5 18.25 17.5C19.3187 17.5 20.245 16.8904 20.7001 16H22.8338C22.2851 18.0169 20.4407 19.5 18.25 19.5C15.6266 19.5 13.5 17.3734 13.5 14.75V13.25C13.5 10.6266 15.6266 8.5 18.25 8.5C20.8734 8.5 23 10.6266 23 13.25V14.5ZM20.8965 12.5C20.57 11.3457 19.5088 10.5 18.25 10.5C16.9912 10.5 15.93 11.3457 15.6035 12.5H20.8965Z"></path></svg>',
    behance_url: 'https://www.behance.net/for_you',
    tiktok_enabled: false,
    tiktok_icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8.24537V15.5C16 19.0899 13.0899 22 9.5 22C5.91015 22 3 19.0899 3 15.5C3 11.9101 5.91015 9 9.5 9C10.0163 9 10.5185 9.06019 11 9.17393V12.3368C10.5454 12.1208 10.0368 12 9.5 12C7.567 12 6 13.567 6 15.5C6 17.433 7.567 19 9.5 19C11.433 19 13 17.433 13 15.5V2H16C16 4.76142 18.2386 7 21 7V10C19.1081 10 17.3696 9.34328 16 8.24537Z"></path></svg>',
    tiktok_url: 'https://www.tiktok.com',
    facebook_enabled: false,
    facebook_icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5H16.5L17.5 9.5H14V7.5C14 6.47062 14 5.5 16 5.5H17.5V2.1401C17.1743 2.09685 15.943 2 14.6429 2C11.9284 2 10 3.65686 10 6.69971V9.5H7V13.5H10V22H14V13.5Z"></path></svg>',
    facebook_url: 'https://www.facebook.com/'
};

if (fs.existsSync(socialConfigPath)) {
    const socialConfigRaw = fs.readFileSync(socialConfigPath, 'utf-8');
    const { data: socialData } = matter(socialConfigRaw);
    const fallbackData = Object.keys(socialData).length ? {} : parseLooseConfig(socialConfigRaw);
    // 合并默认配置和用户配置
    socialConfig = { ...socialConfig, ...socialData, ...fallbackData };
    console.log(`  Loaded configuration from: ${path.basename(socialConfigPath)}`);
} else {
    console.log('  social.md not found, using defaults');
}

// === 读取关于页面配置 ===
console.log('👤 Loading about page configuration...');
const aboutConfigPath = findConfigPath('about', 'about.md');
let aboutConfig = {
    about_hero_title: '',
    about_hero_subtitle: '',
    about_hero_avatar: '/image/freecat.png'
};

if (fs.existsSync(aboutConfigPath)) {
    const aboutConfigRaw = fs.readFileSync(aboutConfigPath, 'utf-8');
    const { data: aboutData } = matter(aboutConfigRaw);
    const fallbackData = Object.keys(aboutData).length ? {} : parseLooseConfig(aboutConfigRaw);
    aboutConfig = { ...aboutConfig, ...aboutData, ...fallbackData };
    console.log(`  Loaded configuration from: ${path.basename(aboutConfigPath)}`);
} else {
    console.log('  about.md not found, using defaults');
}

// 工具函数：自动换行处理
function autoLineBreak(text) {
    if (!text) return '';
    // 在句号后自动插入 <br />
    // 注意：需要配合 autoSpacing 函数使用以保证间距正文
    return text
        .replace(/([\.。])\s*(?=[^ \.。\n\r\t<])/g, '$1<br />');
}

// 工具函数：生成主题初始化脚本
function generateThemeScript() {
    // 根据配置文件确定默认主题模式
    let defaultTheme = 'system';
    if (siteConfig.theme_dark === true) {
        defaultTheme = 'dark';
    } else if (siteConfig.theme_light === true) {
        defaultTheme = 'light';
    } else if (siteConfig.theme_system === true || siteConfig.default_theme === 'system') {
        defaultTheme = 'system';
    } else if (siteConfig.default_theme) {
        defaultTheme = siteConfig.default_theme; // 直接使用配置值
    }

    if (defaultTheme === 'dark') {
        // 深色模式为默认，除非用户选择浅色
        return `(function () {
            var saved = localStorage.getItem('theme');
            if (saved === 'light') {
                // 用户选择了浅色模式
            } else {
                document.documentElement.classList.add('dark');
            }
        })();`;
    } else if (defaultTheme === 'light') {
        // 浅色模式为默认，除非用户选择深色
        return `(function () {
            var saved = localStorage.getItem('theme');
            if (saved === 'dark') {
                document.documentElement.classList.add('dark');
            }
        })();`;
    } else {
        // 跟随系统（默认）
        return `(function () {
            var saved = localStorage.getItem('theme');
            var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (saved === 'dark' || (!saved && prefersDark)) {
                document.documentElement.classList.add('dark');
            }
        })();`;
    }
}

// 工具函数：生成网站 Logo 图标
function generateLogoIcon() {
    const defaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><title>quill-pen-ai-fill</title><path d="m4.713 7.128l-.246.566a.506.506 0 0 1-.934 0l-.246-.566a4.36 4.36 0 0 0-2.22-2.25l-.759-.339a.53.53 0 0 1 0-.963l.717-.319A4.37 4.37 0 0 0 3.276.931L3.53.32a.506.506 0 0 1 .942 0l.253.61a4.37 4.37 0 0 0 2.25 2.327l.718.32a.53.53 0 0 1 0 .962l-.76.338a4.36 4.36 0 0 0-2.219 2.251m-1.65 14.485C4.09 15.422 6.312 1.997 21 1.997c-1.496 3-2.5 4.5-3.5 5.5l-1 1l1.5 1c-1 3-4 6.5-8 7q-4.003.5-5.002 5.5H3z"/></svg>`;

    if (siteConfig.site_logo_icon && siteConfig.site_logo_icon.trim().startsWith('http')) {
        return `<img src="${siteConfig.site_logo_icon}" class="w-full h-full object-contain" alt="Logo" />`;
    }
    return defaultIcon;
}

// 工具函数：应用站点配置到模板
function applySiteConfig(template) {
    return template
        .replace(/<!-- SITE_TITLE -->/g, autoSpacing(siteConfig.site_title))
        .replace(/<!-- SITE_NAME -->/g, autoSpacing(siteConfig.site_name))
        .replace(/<!-- FOOTER_COPYRIGHT -->/g, autoSpacing(siteConfig.footer_copyright))
        .replace(/<!-- HERO_TITLE -->/g, autoLineBreak(autoSpacing(siteConfig.hero_title)))
        .replace(/<!-- HERO_SUBTITLE -->/g, autoLineBreak(autoSpacing(siteConfig.hero_subtitle)))
        .replace(/<!-- HERO_AVATAR -->/g, siteConfig.hero_avatar)
        .replace(/<!-- SITE_FAVICON -->/g, siteConfig.site_favicon)
        .replace(/<!-- SITE_LOGO_ICON -->/g, generateLogoIcon())
        .replace(/<!-- THEME_SCRIPT -->/g, generateThemeScript())
        .replace(/<!-- SOCIAL_LINKS -->/g, generateSocialLinks())
        .replace(/<!-- SITE_URL -->/g, siteConfig.site_url || '');
}

// === 3. 读取并注入 Tailwind Config ===
let tplIndex = fs.readFileSync(path.join(DIRS.templates, 'template_index.html'), 'utf-8');
tplIndex = tplIndex.replace('/* TAILWIND_CONFIG_PLACEHOLDER */', tailwindConfigContent);
tplIndex = applySiteConfig(tplIndex);

// 读取文章模板
let tplPost = fs.readFileSync(path.join(DIRS.templates, 'template_post.html'), 'utf-8');
tplPost = tplPost.replace('/* TAILWIND_CONFIG_PLACEHOLDER */', tailwindConfigContent);
tplPost = applySiteConfig(tplPost);

// 读取所有文章页模板
let tplIndexAll = fs.readFileSync(path.join(DIRS.templates, 'template_index_all.html'), 'utf-8');
tplIndexAll = tplIndexAll.replace('/* TAILWIND_CONFIG_PLACEHOLDER */', tailwindConfigContent);
tplIndexAll = applySiteConfig(tplIndexAll);

// 读取搜索页模板
let tplSearch = fs.readFileSync(path.join(DIRS.templates, 'template_index_search.html'), 'utf-8');
tplSearch = tplSearch.replace('/* TAILWIND_CONFIG_PLACEHOLDER */', tailwindConfigContent);
tplSearch = applySiteConfig(tplSearch);

// 读取关于页模板
let tplAbout = fs.readFileSync(path.join(DIRS.templates, 'template_index_About.html'), 'utf-8');
tplAbout = tplAbout.replace('/* TAILWIND_CONFIG_PLACEHOLDER */', tailwindConfigContent);
tplAbout = applySiteConfig(tplAbout);

// 关于页面配置如果为空则使用 fallback 值
const finalAboutTitle = aboutConfig.about_hero_title || siteConfig.hero_title;
const finalAboutSubtitle = aboutConfig.about_hero_subtitle || siteConfig.hero_subtitle;
const finalAboutAvatar = aboutConfig.about_hero_avatar || siteConfig.hero_avatar;

tplAbout = tplAbout
    .replace(/<!-- ABOUT_HERO_TITLE -->/g, autoLineBreak(autoSpacing(finalAboutTitle)))
    .replace(/<!-- ABOUT_HERO_SUBTITLE -->/g, autoLineBreak(autoSpacing(finalAboutSubtitle)))
    .replace(/<!-- ABOUT_HERO_AVATAR -->/g, finalAboutAvatar);

// 工具函数：生成社交媒体链接 HTML
function generateSocialLinks() {
    const platforms = [
        { name: 'twitter', enabled: socialConfig.twitter_enabled, icon: socialConfig.twitter_icon, url: socialConfig.twitter_url },
        { name: 'instagram', enabled: socialConfig.instagram_enabled, icon: socialConfig.instagram_icon, url: socialConfig.instagram_url },
        { name: 'github', enabled: socialConfig.github_enabled, icon: socialConfig.github_icon, url: socialConfig.github_url },
        { name: 'behance', enabled: socialConfig.behance_enabled, icon: socialConfig.behance_icon, url: socialConfig.behance_url },
        { name: 'tiktok', enabled: socialConfig.tiktok_enabled, icon: socialConfig.tiktok_icon, url: socialConfig.tiktok_url },
        { name: 'facebook', enabled: socialConfig.facebook_enabled, icon: socialConfig.facebook_icon, url: socialConfig.facebook_url }
    ];

    const enabledPlatforms = platforms.filter(p => p.enabled);

    if (enabledPlatforms.length === 0) {
        return '<!-- No social links enabled -->';
    }

    return enabledPlatforms.map(platform => {
        const capitalizedName = platform.name.charAt(0).toUpperCase() + platform.name.slice(1);
        return `<a class="text-[#616f89] dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-400 transition-colors block w-6 h-6"
                href="${platform.url}"
                aria-label="${capitalizedName}"
                target="_blank"
                rel="noopener noreferrer">
                ${platform.icon}
            </a>`;
    }).join('\n            ');
}

// === 4. 处理文章逻辑 ===
// 哈希函数：根据标签名生成唯一色相
function hashTagColor(tagName) {
    let hash = 0;
    const str = (tagName || 'default').toLowerCase();
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    // 返回 HSL 格式的颜色配置对齐
    return {
        bg: `hsl(${hue}, 70%, 95%)`,
        bgDark: `hsl(${hue}, 50%, 20%)`,
        text: `hsl(${hue}, 70%, 35%)`,
        textDark: `hsl(${hue}, 60%, 75%)`
    };
}

// 工具函数：处理标题中文 | 分隔符样式
function processTitleHtml(title) {
    if (!title) return '';
    // 将 | 符号用 span 标签包裹以应用样式
    return title.replace(/\|/g, '<span class="font-normal mx-[1px]">|</span>');
}

// 移除 Markdown 标记，返回纯文本 (用于摘要)
function stripMarkdown(text) {
    if (!text) return '';

    // 1. 移除 Obsidian Callouts (如 [!TIP] 整个块)
    // 匹配以 > [! 开头的行，以及后续所有连续以 > 开头的行
    let clean = text.replace(/^>\s*\[![^\]]+\](?:\r?\n>[^\r?\n]*)*\r?\n?/gm, '');

    // 2. 检查音频链接并记录，然后移除它们
    // 获取所有 Markdown 链接并检查是否指向音频文件
    const allLinksRegex = /\[([^\]]*?)\]\s*\([^\)]+?\)/gi; // 捕获 label
    let hasAudio = false;
    const audioExtensions = ['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac', '.opus'];

    clean = clean.replace(allLinksRegex, (match, label) => {
        const urlLower = match.toLowerCase();
        const hasAudioExt = audioExtensions.some(ext => urlLower.includes(ext));

        // 如果链接文本包含 🎵 或者链接指向音频格式，则标记 hasAudio 并从摘要中移除该链接
        if (label.includes('🎵') || hasAudioExt) {
            hasAudio = true;
            return '';
        }
        return match;
    });

    // 3. 移除其他 Markdown 标记
    clean = clean
        .replace(/`{3}[\s\S]*?`{3}/g, '')               // 移除代码
        .replace(/!\[.*?\]\(.*?\)/g, '')                 // 移除图片
        .replace(/^\s*([-*+]|\d+\.)\s+(\[[x ]\]\s+)?/gm, '') // 移除列表和任务列表标记
        .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')   // 移除 Obsidian Wiki Links 带别名
        .replace(/\[\[([^\]]+)\]\]/g, '$1')              // 移除 Obsidian Wiki Links
        .replace(/==([^=]+)==/g, '$1')                   // 移除 Obsidian 高亮
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')               // 移除链接，仅保留文字
        .replace(/^\s*>+\s?/gm, '')                       // 移除引用标记
        .replace(/^\s*([-*_])(?:\s*\1){2,}\s*$/gm, '')    // 移除水平分割线
        .replace(/^\s*#+\s+/gm, '')                      // 移除标题标记
        .replace(/^\|?[\s\-|:]+\|?\s*$/gm, '')            // 移除表格分隔线
        .replace(/\|/g, ' ')                              // 移除表格内部 pipe
        .replace(/\$\$[\s\S]*?\$\$/g, '')                 // 移除块级公式
        .replace(/\$[^$]*?\$/g, '')                       // 移除行内公式
        .replace(/`(.+?)`/g, '$1')                        // 移除行内代码
        .replace(/(\*\*+|__+|~~+|\*|_)/g, '')             // 移除加粗、斜体等
        .replace(/<[^>]+>/g, '')                          // 移除 HTML 标签
        .replace(/\[\^.+?\]/g, '')                        // 移除注脚
        .replace(/\n+/g, ' ')                             // 换行符转空格
        .replace(/\s+/g, ' ')                             // 压缩多余空格
        .trim();

    // 4. 如果包含音频，在摘要开头加上音符 emoji
    if (hasAudio) {
        clean = '🎶 ' + clean;
    }

    return clean;
}

// 自动在中英文/数字之间添加空格 (Pangu Space)
// 自动在中英文/数字之间添加空格，避免处理 HTML 标签内部
function autoSpacing(text) {
    if (!text) return '';
    // 西文字符包括英文、数字等
    const west = 'a-zA-Z0-9$%.';
    let processed = text
        .replace(new RegExp(`([\\u4e00-\\u9fa5])([${west}])`, 'g'), '$1 $2')
        .replace(new RegExp(`([${west}])([\\u4e00-\\u9fa5])`, 'g'), '$1 $2');
    return processed.replace(/ {2,}/g, ' ');
}

// Markdown 预处理：在保护代码块的前提下进行空格处理
function preserveFencedCodeBlocks(content, transform) {
    if (!content) return '';
    const blocks = [];
    const placeholderPrefix = '__CODE_BLOCK_';
    const placeholderSuffix = '__';

    const replaced = content.replace(/```[\s\S]*?```/g, (match) => {
        const key = `${placeholderPrefix}${blocks.length}${placeholderSuffix}`;
        blocks.push(match);
        return key;
    });

    const processed = transform(replaced);
    return processed.replace(new RegExp(`${placeholderPrefix}(\\d+)${placeholderSuffix}`, 'g'), (match, index) => {
        return blocks[Number(index)];
    });
}

function prepareMarkdownSpacing(content) {
    if (!content) return '';
    // 在进行 marked 解析前对 Markdown 内容进行预处理
    return preserveFencedCodeBlocks(content, (text) => {
        return text
            // 移除标题中的加粗符号 (**)
            .replace(/^(#{1,6}\s+)(.*)$/gm, (match, prefix, content) => {
                return prefix + content.replace(/\*\*\*|\*\*/g, '');
            })
            // 智能处理粗体/斜体/删除线前后的空格
            .replace(/(\*\*\*|\*\*|___|__|~~)(.+?)\1/g, (match, marker, inner, offset, fullStr) => {
                const prevChar = fullStr[offset - 1];
                const nextChar = fullStr[offset + match.length];

                // 标点符号列表：如果相邻字符是标点，不添加空格
                const isPunctuation = /[.,;!?:，。；！？：()\[\]{}（）【】“”‘’"']/;

                let prefix = '';
                let suffix = '';

                // 前方添加空格：如果前一个字符存在、不是空白且不是标点
                if (prevChar && !/\s/.test(prevChar) && !isPunctuation.test(prevChar)) {
                    prefix = ' ';
                }

                // 后方添加空格：如果后一个字符存在、不是空白且不是标点
                if (nextChar && !/\s/.test(nextChar) && !isPunctuation.test(nextChar)) {
                    suffix = ' ';
                }

                return prefix + match + suffix;
            })
            .replace(/([^\n])\n(!\[[^\]]*\]\([^)]+\))/g, '$1\n\n$2')
            .replace(/\]\(([^)\s]+)\s+'([^']+)'\)/g, ']($1 "$2")')
            // 中英文及数字间自动空格
            .replace(/([\u4e00-\u9fa5])([a-zA-Z0-9$%.])/g, '$1 $2')
            .replace(/([a-zA-Z0-9$%.])([\u4e00-\u9fa5])/g, '$1 $2')
            // 修复 Markdown 链接语法
            .replace(/\] \(http/g, '](http')
            // 修复：将缩进的 - 列表转换为 * 列表，防止被误识别为 Setext 标题 (例如 - 优势\n     - 内容)
            // 匹配 2 个或更多空格开头的 - 列表项，替换为 *
            .replace(/^(\s{2,})-\s/gm, '$1* ');
    });
}

// 工具函数：对 HTML 内容进行智能空格处理
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
    // 1. 处理标签与文本的间距，例如：<strong>134</strong>
    // 期望结果：中 <strong>134</strong> 中
    const west = 'a-zA-Z0-9$%.';
    let res = htmlWithPlaceholders
        .replace(new RegExp(`([\\u4e00-\\u9fa5])((?:<[^>]+>)+)([${west}])`, 'g'), '$1 $2$3')
        .replace(new RegExp(`([${west}])((?:<[^>]+>)+)([\\u4e00-\\u9fa5])`, 'g'), '$1$2 $3');

    // 2. 移除标签内部多余的空格（可）
    // 比如 <strong> 134 </strong> -> <strong>134</strong>
    res = res.replace(/(<(?!\/)[^>]+>)\s+/g, '$1') // 移除开始标签后的空格
        .replace(/\s+(<\/[^>]+>)/g, '$1');    // 移除结束标签前的空格

    // 3. 处理标签内部的纯文本 text nodes
    res = res.replace(/>([^<]+)</g, (match, p1) => {
        return '>' + autoSpacing(p1) + '<';
    });

    res = res.replace(/ {2,}/g, ' ');
    return res.replace(new RegExp(`${prePlaceholderPrefix}(\\d+)${prePlaceholderSuffix}`, 'g'), (match, index) => {
        return preBlocks[Number(index)];
    });
}

// 工具函数：检测文本类型（纯中文、纯英文、混排）
// 返回值：'cjk' (纯中文) | 'latin' (纯英文/数字) | 'mixed' (中英混排/含数字的中文)
function detectTextType(text) {
    if (!text) return 'mixed';

    // 去除 HTML 标签后的纯文本
    // 去除 HTML 标签和 HTML 实体后的纯文本
    const cleanText = text.replace(/<[^>]+>/g, '').replace(/&[a-z0-9]+;/gi, '').trim();

    if (!cleanText) return 'mixed';

    // 定义字符类型
    const cjkRegex = /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/; // 中日韩统一表意文字
    const latinRegex = /[a-zA-Z]/; // 英文字母
    const numberRegex = /[0-9]/; // 数字

    let hasCJK = false;
    let hasLatin = false;
    let hasNumber = false;

    for (const char of cleanText) {
        if (cjkRegex.test(char)) hasCJK = true;
        if (latinRegex.test(char)) hasLatin = true;
        if (numberRegex.test(char)) hasNumber = true;
    }

    // 判断逻辑
    // 1. 纯中文（无英文、无数字）→ justify
    // 2. 纯英文或纯数字 -> left
    // 3. 混排（有中文 + 英文/数字）→ left
    if (hasCJK && !hasLatin && !hasNumber) {
        return 'cjk'; // 纯中文
    } else if (!hasCJK) {
        return 'latin'; // 纯英文或数字
    } else {
        return 'mixed'; // 中英混排或含数字
    }
}

// 工具函数：为 HTML 段落应用智能对齐
function applyParagraphAlignment(html) {
    if (!html) return '';

    // 匹配所有 <p> 标签并处理
    return html.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi, (match, attrs, content) => {
        const textType = detectTextType(content);

        // 根据文本类型应用不同的 CSS 类
        let alignClass = '';
        if (textType === 'cjk') {
            alignClass = 'text-justify-cjk'; // 纯中文：两端对齐
        } else {
            alignClass = 'text-align-left'; // 英文或混排左对齐
        }

        // 将对齐类添加到 class 属性
        if (attrs.includes('class=')) {
            // 已有 class 属性，追加类名
            attrs = attrs.replace(/class="([^"]*)"/, `class="$1 ${alignClass}"`);
            attrs = attrs.replace(/class='([^']*)'/, `class='$1 ${alignClass}'`);
        } else {
            // 没有 class 属性，新建一个
            attrs = ` class="${alignClass}"${attrs}`;
        }

        return `<p${attrs}>${content}</p>`;
    });
}

function generateTagsHtml(tags) {
    if (!tags) return '';
    const tagList = Array.isArray(tags) ? tags : [tags];
    return tagList.map((tag) => {
        const colors = hashTagColor(tag);
        return `<span class="relative z-10 inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer hover:brightness-95 transition-[filter] duration-200 ease-out whitespace-nowrap" 
            style="background: ${colors.bg}; color: ${colors.text};"
            onclick="event.preventDefault(); event.stopPropagation(); window.location.href='/search.html?tag=' + encodeURIComponent('${tag.replace(/'/g, "\\'")}');">
            ${tag}
        </span>`;
    }).join('\n');
}

// 为首页卡片生成单个标签的内联样式
function getTagStyle(tagName) {
    const colors = hashTagColor(tagName);
    return `background: ${colors.bg}; color: ${colors.text};`;
}
function getTagStyleDark(tagName) {
    const colors = hashTagColor(tagName);
    const colorsDark = hashTagColor(tagName); // Assuming hashTagColor already returns dark colors
    return `background: ${colorsDark.bgDark}; color: ${colorsDark.textDark};`;
}

console.log('📝 Processing posts...');
const postFiles = fs.readdirSync(DIRS.posts).filter(f => f.endsWith('.md'));
let allPosts = [];

postFiles.forEach(file => {
    const filePath = path.join(DIRS.posts, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const slug = file.replace('.md', '');
    const { data, content } = matter(raw);
    const enableImageCaptions = data.show_image_captions === true || data.enable_image_captions === true || data.enableImageCaptions === true;

    // 跳过前置数据中 show: false 的文件
    if (data.show === false) {
        console.log(`  跳过文章: ${file}`);
        return;
    }

    // 获取文件系统时间
    const stats = fs.statSync(filePath);
    // 优先使用 YAML 中的 date，否则使用 birthtime（创建时间）
    const publishDate = data.date ? dayjs(data.date) : dayjs(stats.birthtime);

    // 优先使用 YAML 中的 updated 或 date_updated
    // 其次使用 Git 提交历史（从预生成的 JSON 文件读取）
    // 最后使用文件系统修改时间（仅作为本地开发的最终兜底）
    let modifiedDate;
    if (data.updated) {
        modifiedDate = dayjs(data.updated);
    } else if (data.date_updated) {
        modifiedDate = dayjs(data.date_updated);
    } else {
        // 尝试从预生成的 Git 时间数据中获取最后修改时间
        const gitDate = getGitLastModifiedDate(file);
        if (gitDate) {
            modifiedDate = gitDate;
        } else {
            // 如果 Git 数据不可用，使用文件系统时间作为最终兜底
            modifiedDate = dayjs(stats.mtime);
        }
    }

    // 生成文章摘要：优先使用 description，否则截取正文
    // 注意：必须先移除 Markdown 标记再进行 HTML 标签处理
    const cleanContent = stripMarkdown(content);
    const excerpt = data.description || (cleanContent.slice(0, 150) + (cleanContent.length > 150 ? '...' : ''));

    allPosts.push({
        title: (data.title && String(data.title).trim()) ? data.title : slug,
        slug: slug,
        date: publishDate,
        modifiedDate: modifiedDate,
        excerpt: excerpt,
        cover: data.cover || '',
        tag: data.tag || data.tags || [],
        link: `/posts/${slug}.html`,
        showCover: data.show_cover !== false,    // 默认为 true
        pinned: data.pinned === true, // 置顶参数
        enableImageCaptions,
        content: content,
        rawTitle: data.title, // 原始标题，用于生成 slug 用
    });

    // 对标题和摘要应用空格处理
    const lastPost = allPosts[allPosts.length - 1];
    lastPost.title = autoSpacing(lastPost.title);
    lastPost.excerpt = autoSpacing(lastPost.excerpt);
});

// 排序逻辑：置顶文章优先，然后按时间倒序
allPosts.sort((a, b) => {
    // 置顶文章优先
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // 同为置顶或同为非置顶，按时间倒序
    return b.date.valueOf() - a.date.valueOf();
});

// === 4. 生成文章详情页 ===
console.log('📄 Generating post pages...');

allPosts.forEach(post => {
    // 提取标题生成目录
    const { toc, headings } = extractHeadingsAndGenerateTOC(post.content);

    // 对 Markdown 转为 HTML（先对 Markdown 进行预处理以保证 bold 等标记正确）
    let contentHtml = parseMarkdown(post.content, { enableImageCaptions: post.enableImageCaptions });

    // 为标题添加 ID
    contentHtml = addHeadingIds(contentHtml, headings);

    // 生成封面 HTML（如果有封面且未隐藏）
    const coverHtml = (post.cover && post.showCover) ? `
        <div class="w-full rounded-xl overflow-hidden mb-32 relative">
            <div class="loader absolute top-12 left-12 z-10" style="display:none"></div>
            <img alt="${post.title}" class="w-full h-auto object-cover" src="${post.cover}" 
                onerror="if(this.dataset.fallbackApplied!=='true'){
                    this.dataset.fallbackApplied='true';
                    this.src='/image/404.png';
                    const loader = this.previousElementSibling;
                    if(loader && loader.classList.contains('loader')) loader.style.display='block';
                }" 
                loading="lazy" />
        </div>
    ` : '<div class="mb-24"></div>';

    // 生成标签 HTML
    const tagsHtml = generateTagsHtml(post.tag);

    // 对 HTML 内容进行智能空格处理
    let finalContentHtml = autoSpacingHtml(contentHtml);

    // 根据文本类型为段落应用智能对齐
    finalContentHtml = applyParagraphAlignment(finalContentHtml);

    // 替换模板占位符
    let postHtml = tplPost
        .replace(/<!-- TITLE_PLACEHOLDER -->/g, post.title) // Browser Tab Title (Plain Text)
        .replace(/<!-- TITLE_H1_PLACEHOLDER -->/g, processTitleHtml(post.title)) // H1 Title (Styled HTML)
        .replace('<!-- TAGS_PLACEHOLDER -->', tagsHtml)
        .replace('<!-- DATE_PLACEHOLDER -->', post.date.tz('Asia/Shanghai').format('YYYY-MM-DD'))
        .replace('<!-- MODIFIED_PLACEHOLDER -->', post.modifiedDate.tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm'))
        .replace('<!-- COVER_PLACEHOLDER -->', coverHtml)
        .replace('<!-- CONTENT_PLACEHOLDER -->', finalContentHtml)
        .replace('<!-- TOC_PLACEHOLDER -->', toc)
        .replace(/<!-- POST_DESCRIPTION -->/g, post.excerpt.replace(/"/g, '&quot;'))
        .replace(/<!-- POST_KEYWORDS -->/g, (Array.isArray(post.tag) ? post.tag.join(', ') : post.tag))
        .replace(/<!-- POST_CANONICAL_URL -->/g, (siteConfig.site_url ? `${siteConfig.site_url}${post.link}` : post.link))
        .replace(/<!-- POST_IMAGE -->/g, (post.cover && post.cover.startsWith('http') ? post.cover : (siteConfig.site_url ? `${siteConfig.site_url}${post.cover}` : post.cover)));

    // 写入文件
    fs.writeFileSync(path.join(DIRS.output, 'posts', `${post.slug}.html`), postHtml);
    console.log(`  Generated: posts/${post.slug}.html`);
});

// === 5. 生成分页 (核心 UI 循环) ===
const totalPages = POSTS_PER_PAGE === 0 ? 1 : Math.ceil(allPosts.length / POSTS_PER_PAGE);

for (let page = 1; page <= totalPages; page++) {
    const start = (page - 1) * POSTS_PER_PAGE;
    const pagePosts = POSTS_PER_PAGE === 0
        ? allPosts
        : allPosts.slice(start, start + POSTS_PER_PAGE);

    let postsHtml = '';
    pagePosts.forEach(post => {
        // 处理多标签逻辑
        const tags = Array.isArray(post.tag) ? post.tag : [post.tag];
        const tagsHtml = tags.map(tag => {
            const style = getTagStyle(tag);
            return `<span class="relative z-10 inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer hover:brightness-95 dark:hover:brightness-110 transition-[filter] duration-200 ease-out whitespace-nowrap" 
                style="${style}"
                onclick="event.preventDefault(); event.stopPropagation(); window.location.href='/search.html?tag=' + encodeURIComponent('${tag.replace(/'/g, "\\'")}');">${tag}</span>`;
        }).join('');

        // 注意：此处使用 h-80 为固定高度，比例约为 3:2 自适应
        postsHtml += postCardTemplate.renderPostCard({
            link: post.link,
            titleHtml: processTitleHtml(post.title),
            excerptHtml: post.excerpt,
            date: post.date.tz('Asia/Shanghai').format('YYYY-MM-DD'),
            modifiedDate: post.modifiedDate.tz('Asia/Shanghai').format('YYYY-MM-DD'),
            tagsHtml,
            cover: post.cover,
            pinned: post.pinned
        });
    });

    // 生成高级分页 UI
    function generatePaginationHtml(currentPage, totalPages) {
        if (totalPages <= 1) return '';

        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // 始终显示第一页
            pages.push(1);

            // 计算中间部分的起始和结束
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            // 确保当页码靠近边界时显示至少 3 个页码
            if (currentPage <= 3) end = 4;
            if (currentPage >= totalPages - 2) start = totalPages - 3;

            // 添加左侧省略号
            if (start > 2) pages.push('...');

            // 添加中间数字
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            // 添加右侧省略号
            if (end < totalPages - 1) pages.push('...');

            // 始终显示最后一页
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }

        const prevLink = currentPage === 1 ? null : (currentPage === 2 ? '/' : `/page/${currentPage - 1}/`);
        const nextLink = currentPage === totalPages ? null : `/page/${currentPage + 1}/`;

        let html = `<div class="flex flex-col md:flex-row items-center gap-4 md:gap-6 mt-12 mb-20">`;

        // 分页按钮
        html += `<div class="flex items-center gap-1 md:gap-2">`;

        html += `
            <a href="${prevLink || '#'}" class="group flex items-center gap-2 px-2 md:px-4 h-10 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 ${!prevLink ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:bg-primary hover:text-slate-50 hover:border-primary'} transition-all duration-300 shadow-sm" title="Previous Page">
                <span class="text-xl transition-transform group-hover:-translate-x-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path></svg>
                </span>
                <span class="hidden md:inline text-sm font-bold">Prev</span>
            </a>`;

        // 数字按钮
        pages.forEach(p => {
            if (p === '...') {
                html += `<span class="px-2 text-gray-400 font-medium">···</span>`;
            } else {
                const link = p === 1 ? '/' : `/page/${p}/`;
                const isActive = p === currentPage;
                html += `
                    <a href="${link}" class="flex items-center justify-center min-w-[32px] md:min-w-[40px] h-10 px-1 md:px-3 rounded-xl border font-bold text-sm transition-all duration-300 ${isActive ? 'bg-primary text-slate-50 border-primary shadow-md shadow-primary/20 scale-105' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary'}">
                        ${p}
                    </a>`;
            }
        });

        // Next
        html += `
            <a href="${nextLink || '#'}" class="group flex items-center gap-2 px-2 md:px-4 h-10 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 ${!nextLink ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:bg-primary hover:text-slate-50 hover:border-primary'} transition-all duration-300 shadow-sm" title="Next Page">
                <span class="hidden md:inline text-sm font-bold">Next</span>
                <span class="text-xl transition-transform group-hover:translate-x-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path></svg>
                </span>
                </a>`;

        html += `</div>`; // end buttons group

        // 跳转输入框
        html += `
            <div class="flex items-center gap-3 pl-0 md:pl-6 border-none md:border-l border-gray-200 dark:border-gray-800">
                <span class="hidden md:inline text-xs font-bold text-gray-400 uppercase tracking-widest">Jump to</span>
                <div class="relative group">
                    <input type="number" min="1" max="${totalPages}" placeholder="${currentPage}" 
                        class="w-16 h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-center text-base md:text-sm font-bold focus:outline-none focus:ring-0 focus:border-gray-200 dark:focus:border-gray-700 focus:shadow-md dark:focus:shadow-gray-800 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        onfocus="this.placeholder=''" onblur="this.placeholder='${currentPage}'">
                </div>
                <span class="hidden md:inline text-xs font-bold text-gray-400 uppercase tracking-widest">of ${totalPages}</span>
            </div>
        `;

        html += `</div>`;
        return html;
    }

    const paginationBtns = generatePaginationHtml(page, totalPages);

    let outputHtml = tplIndex
        .replace('<!-- POSTS_LIST_PLACEHOLDER -->', postsHtml)
        .replace('<!-- PAGINATION_BUTTONS_PLACEHOLDER -->', paginationBtns)
        .replace('<!-- PAGINATION_PLACEHOLDER -->', totalPages > 1 ? `
            <a href="/all.html" class="group flex items-center gap-2 px-4 h-10 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-slate-50 hover:border-primary transition-all duration-300 shadow-sm -mb-2">
                <span class="text-sm font-bold">View All</span>
                <svg class="text-xl transition-transform group-hover:translate-x-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em"><path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path></svg>
            </a>` : '');

    if (page === 1) {
        fs.writeFileSync(path.join(DIRS.output, 'index.html'), outputHtml);
    } else {
        const pageDir = path.join(DIRS.output, 'page', String(page));
        if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });
        fs.writeFileSync(path.join(pageDir, 'index.html'), outputHtml);
    }
}

// === 6. 生成所有文章页 (all.html) ===
console.log('📋 Generating all articles page...');

let allPostsHtml = '';
allPosts.forEach(post => {
    // 处理多标签逻辑
    const tags = Array.isArray(post.tag) ? post.tag : [post.tag];
    const tagsHtml = tags.map(tag => {
        const style = getTagStyle(tag);
        return `<span class="relative z-10 inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider cursor-pointer hover:brightness-95 dark:hover:brightness-110 transition-[filter] duration-200 ease-out whitespace-nowrap" 
            style="${style}"
            onclick="event.preventDefault(); event.stopPropagation(); window.location.href='/search.html?tag=' + encodeURIComponent('${tag.replace(/'/g, "\\'")}');">${tag}</span>`;
    }).join('');

    // 注意：此处使用 h-80 为固定高度，比例约为 3:2 自适应
    allPostsHtml += postCardTemplate.renderPostCard({
        link: post.link,
        titleHtml: processTitleHtml(post.title),
        excerptHtml: post.excerpt,
        date: post.date.tz('Asia/Shanghai').format('YYYY-MM-DD'),
        modifiedDate: post.modifiedDate.tz('Asia/Shanghai').format('YYYY-MM-DD'),
        tagsHtml,
        cover: post.cover,
        pinned: post.pinned
    });
});

let allOutputHtml = tplIndexAll
    .replace('<!-- ALL_POSTS_LIST_PLACEHOLDER -->', allPostsHtml);

fs.writeFileSync(path.join(DIRS.output, 'all.html'), allOutputHtml);
console.log('  Generated: all.html');

// === 7. 生成搜索索引 (search-index.json) ===
console.log('🔍 Generating search index...');

const searchIndex = allPosts.map(post => ({
    title: post.title,
    slug: post.slug,
    date: post.date.tz('Asia/Shanghai').format('YYYY-MM-DD'),
    excerpt: post.excerpt,
    content: stripMarkdown(post.content), // Add full content for searching
    tags: Array.isArray(post.tag) ? post.tag : [post.tag],
    link: post.link,
    cover: post.cover,
    pinned: post.pinned,
    modifiedDate: post.modifiedDate.tz('Asia/Shanghai').format('YYYY-MM-DD')
}));

fs.writeFileSync(
    path.join(DIRS.output, 'search-index.json'),
    JSON.stringify(searchIndex, null, 2)
);
console.log('  Generated: search-index.json');

// === 8. 生成搜索页 (search.html) ===
console.log('🔎 Generating search page...');
fs.writeFileSync(path.join(DIRS.output, 'search.html'), tplSearch);
console.log('  Generated: search.html');

// === 9. 生成关于页 (about.html) ===
console.log('👤 Generating about page...');
fs.writeFileSync(path.join(DIRS.output, 'about.html'), tplAbout);
console.log('  Generated: about.html');

// === 10. 生成 Sitemap 和 Robots.txt ===
function generateSitemap(posts) {
    if (!siteConfig.site_url) {
        console.log('⚠️  未配置 site_url，跳过生成 sitemap.xml');
        return;
    }
    console.log('🗺️ Generating sitemap.xml...');
    const baseUrl = siteConfig.site_url.replace(/\/$/, '');
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>${baseUrl}/about.html</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/all.html</loc>
    <priority>0.5</priority>
  </url>
`;

    posts.forEach(post => {
        sitemap += `  <url>
    <loc>${baseUrl}${post.link}</loc>
    <lastmod>${post.modifiedDate.format('YYYY-MM-DD')}</lastmod>
    <priority>0.7</priority>
  </url>\n`;
    });

    sitemap += '</urlset>';
    fs.writeFileSync(path.join(DIRS.output, 'sitemap.xml'), sitemap);
    console.log('  Generated: sitemap.xml');
}

function generateRobotsTxt() {
    console.log('🤖 Generating robots.txt...');
    let robots = 'User-agent: *\nAllow: /\n';
    if (siteConfig.site_url) {
        robots += `Sitemap: ${siteConfig.site_url.replace(/\/$/, '')}/sitemap.xml\n`;
    }
    fs.writeFileSync(path.join(DIRS.output, 'robots.txt'), robots);
    console.log('  Generated: robots.txt');
}

generateSitemap(allPosts);
generateRobotsTxt();

console.log('🚀 Build Complete: Posts & Index pages generated!');
