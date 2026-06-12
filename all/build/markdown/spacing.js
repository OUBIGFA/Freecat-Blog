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
    return preserveMarkdownLinkTargets(text, (safeText) => {
        let processed = safeText
            .replace(new RegExp(`([\\u4e00-\\u9fa5])([${west}])`, 'g'), '$1 $2')
            .replace(new RegExp(`([${west}])([\\u4e00-\\u9fa5])`, 'g'), '$1 $2');
        return processed.replace(/ {2,}/g, ' ');
    });
}

function preserveMarkdownLinkTargets(text, transform) {
    const input = String(text || '');
    const protectedValues = [];

    function protect(value) {
        const key = `\uE000MD${protectedValues.length}\uE001`;
        protectedValues.push(value);
        return key;
    }

    const protectedText = input
        .replace(/(\]|\]\[[^\]\n]*\])\((<[^>\n]+>|[^)\s\n]+)(?=(?:\s+(?:"[^"\n]*"|'[^'\n]*'|\([^)\n]*\)))?\))/g, (match, prefix, target) => {
            return match.replace(target, protect(target));
        })
        .replace(/<((?:https?:)?\/\/[^<>\s]+)>/gi, (match, target) => `<${protect(target)}>`)
        .replace(/(?:https?:)?\/\/[^\s<>()]+/gi, (match) => protect(match));

    return transform(protectedText).replace(/\uE000MD(\d+)\uE001/g, (match, idx) => protectedValues[Number(idx)]);
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
    const visualLines = Math.max(0, lines - 1);
    const gapSize = (visualLines * 0.62).toFixed(2);
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

function shouldPreserveAdjacentMarkdownGap(prevLine, nextLine) {
    return isStandaloneVisualBlockLine(prevLine) || isStandaloneVisualBlockLine(nextLine);
}

function isMarkdownListItemLine(line) {
    return /^ {0,3}(?:[-+*]|\d+[.)])\s+\S/.test(String(line || ''));
}

function isIndentedMarkdownContinuationLine(line) {
    return /^(?:\t| {2,})\S/.test(String(line || ''));
}

function isFootnoteDefinitionLine(line) {
    return /^ {0,3}\[\^[^\]]+\]:/.test(String(line || ''));
}

function shouldKeepNativeMarkdownBlankLine(prevLine, nextLine) {
    return isIndentedMarkdownContinuationLine(nextLine)
        || (isMarkdownListItemLine(nextLine) && (isMarkdownListItemLine(prevLine) || isIndentedMarkdownContinuationLine(prevLine)))
        || isFootnoteDefinitionLine(prevLine)
        || isFootnoteDefinitionLine(nextLine);
}

function preserveMarkdownGaps(content) {
    if (!content) return '';
    const lines = String(content).split(/\r?\n/);
    const output = [];
    let inFence = false;
    let fenceMarker = '';

    function appendVisualGapAfterLine(line, nextLine) {
        if (line.trim() && nextLine && nextLine.trim() && shouldPreserveAdjacentMarkdownGap(line, nextLine)) {
            output.push('');
            output.push(createMarkdownGapMarker(0));
            output.push('');
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

        if (blankLineCount > 1 && prevLine.trim() && nextNonBlankLine.trim() && !shouldKeepNativeMarkdownBlankLine(prevLine, nextNonBlankLine)) {
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
        return preserveMarkdownLinkTargets(text, (safeText) => safeText
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
            .replace(/^([ \t]{2,})-\s/gm, '$1* '));
    });
}

function splitMarkdownTableRow(line) {
    let value = String(line || '').replace(/^\s*\|/, '').replace(/\|\s*$/, '');
    const cells = [];
    let current = '';
    let escaped = false;

    for (const ch of value) {
        if (escaped) {
            current += ch;
            escaped = false;
            continue;
        }
        if (ch === '\\') {
            current += ch;
            escaped = true;
            continue;
        }
        if (ch === '|') {
            cells.push(current);
            current = '';
            continue;
        }
        current += ch;
    }
    cells.push(current);
    return cells;
}

function isMarkdownTableDelimiterRow(line) {
    const cells = splitMarkdownTableRow(line);
    return cells.length > 1 && cells.every(cell => /^:?-+:?$/.test(cell.trim()));
}

function markdownCellDisplayWidth(value) {
    return Array.from(String(value || '').replace(/\\\|/g, '|')).reduce((width, ch) => {
        return width + (/[\u3400-\u9fff\uf900-\ufaff]/.test(ch) ? 2 : 1);
    }, 0);
}

function collectMarkdownTableColumnWidths(content) {
    const lines = String(content || '').split(/\r?\n/);
    const tables = [];
    let inFence = false;
    let fenceMarker = '';

    for (let i = 0; i < lines.length - 1; i++) {
        const marker = getFenceMarker(lines[i]);
        if (marker) {
            if (!inFence) {
                inFence = true;
                fenceMarker = marker;
            } else if (closesFence(marker, fenceMarker)) {
                inFence = false;
                fenceMarker = '';
            }
            continue;
        }
        if (inFence) continue;

        if (!lines[i].includes('|') || !isMarkdownTableDelimiterRow(lines[i + 1])) continue;

        const tableLines = [lines[i], lines[i + 1]];
        let j = i + 2;
        while (j < lines.length && lines[j].trim() && lines[j].includes('|')) {
            tableLines.push(lines[j]);
            j++;
        }

        const columnCount = splitMarkdownTableRow(lines[i + 1]).length;
        const widths = Array(columnCount).fill(1);
        for (const tableLine of tableLines) {
            const cells = splitMarkdownTableRow(tableLine);
            for (let column = 0; column < columnCount; column++) {
                widths[column] = Math.max(widths[column], markdownCellDisplayWidth(cells[column] || ''));
            }
        }

        const total = widths.reduce((sum, width) => sum + width, 0);
        if (total > 0) {
            tables.push(widths.map(width => `${(width / total * 100).toFixed(3)}%`));
        }
        i = j - 1;
    }

    return tables;
}

function renderMarkdownTableColgroup(widths) {
    return `<colgroup>${widths.map(width => `<col style="width:${width}">`).join('')}</colgroup>`;
}

function applyMarkdownTableColumnWidths(html, tableColumnWidths) {
    let index = 0;
    return String(html || '').replace(/<table([^>]*)>/g, (match, attrs) => {
        const widths = tableColumnWidths[index++];
        if (!widths || !widths.length) return match;
        return `<table${attrs} data-md-table-widths="${widths.join(',')}">${renderMarkdownTableColgroup(widths)}`;
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

module.exports = {
    slugify,
    autoSpacing,
    autoSpacingHtml,
    applyParagraphAlignment,
    collectMarkdownTableColumnWidths,
    applyMarkdownTableColumnWidths,
    preserveMarkdownGaps,
    prepareMarkdownSpacing
};
