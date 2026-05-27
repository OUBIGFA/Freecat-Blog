const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const matter = require('gray-matter');
const shared = require('../../src/assets/shared.js');
const { autoSpacing, autoSpacingHtml, applyParagraphAlignment, parseMarkdown, extractHeadingsAndGenerateTOC, addHeadingIds, stripMarkdown } = require('../markdown.js');
const seo = require('../seo.js');

const ARTICLE_EXTENSIONS = new Set(['.md', '.markdown', '.txt']);

function isArticleFile(file) {
    return ARTICLE_EXTENSIONS.has(path.extname(file).toLowerCase());
}

function fileSlug(file) {
    return path.basename(file, path.extname(file));
}

function hasYamlFrontmatter(raw) {
    return /^---(?:\r?\n|$)/.test(String(raw || ''));
}

function removeEmptyTocAside(html, toc) {
    if (String(toc || '').trim()) return html;

    return html.replace(
        /\s*<aside\b[^>]*\bgroup\/toc\b[\s\S]*?<\/aside>/,
        '\n                        <div class="w-64 flex-shrink-0" aria-hidden="true"></div>'
    );
}

/**
 * 读取 writing/ 目录下的所有 Markdown 文章并归一化为 post 对象数组。
 * 跳过 frontmatter 标记 show: false 的文件。已按"置顶在前 + 时间倒序"排序。
 */
function loadPosts({ postsDir, gitDates, postDates, skipMissingGitDates = false }) {
    const postFiles = fs.readdirSync(postsDir).filter(isArticleFile);
    const posts = [];

    postFiles.forEach(file => {
        const filePath = path.join(postsDir, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const slug = fileSlug(file);
        const ext = path.extname(file).toLowerCase();
        const isMarkdown = ext === '.md' || ext === '.markdown';
        const hasMetadata = hasYamlFrontmatter(raw);
        const { data, content } = matter(raw);
        const enableImageCaptions = data.show_image_captions === true || data.enable_image_captions === true || data.enableImageCaptions === true;

        if (data.show === false) {
            console.log(`  跳过文章: ${file}`);
            return;
        }

        const storedModifiedDate = gitDates && typeof gitDates.get === 'function' ? gitDates.get(file) : null;
        if (!storedModifiedDate) {
            if (skipMissingGitDates) {
                console.log(`  Skipping article until git-dates workflow updates snapshot: ${file}`);
                return;
            }
            if (gitDates && typeof gitDates.assertHas === 'function') gitDates.assertHas(file);
            throw new Error(`Missing Git modified date for "${file}".`);
        }

        const storedPublishDate = postDates && typeof postDates.get === 'function' ? postDates.get(file) : null;
        const publishDate = data.date ? dayjs(data.date) : dayjs(storedPublishDate || storedModifiedDate || fs.statSync(filePath).birthtime);

        let modifiedDate;
        if (data.updated) modifiedDate = dayjs(data.updated);
        else if (data.date_updated) modifiedDate = dayjs(data.date_updated);
        else modifiedDate = dayjs(storedModifiedDate);

        const cleanContent = stripMarkdown(content);
        const previewRaw = data.description || cleanContent;
        const excerptRaw = data.description || (cleanContent.slice(0, 160) + (cleanContent.length > 160 ? '...' : ''));
        const titleRaw = (data.title && String(data.title).trim()) ? data.title : slug;
        const faqItems = seo.normalizeFaq(data.faq);

        posts.push({
            title: autoSpacing(titleRaw),
            slug,
            date: publishDate,
            modifiedDate,
            excerpt: autoSpacing(excerptRaw),
            preview: autoSpacing(previewRaw),
            summary: data.summary ? autoSpacing(data.summary) : '',
            cover: isMarkdown && hasMetadata ? (data.cover || '') : '',
            coverPlaceholder: isMarkdown && hasMetadata && !data.cover,
            // 可选 frontmatter：cover_width / cover_height（整数像素）
            // 给 <img> 写 width/height 属性，预留盒子，消除首屏 CLS。
            coverWidth: parseInt(data.cover_width, 10) || 0,
            coverHeight: parseInt(data.cover_height, 10) || 0,
            tag: data.tag || data.tags || [],
            link: `/posts/${slug}.html`,
            pinned: data.pinned === true,
            enableImageCaptions,
            author: data.author || '',
            authorUrl: data.author_url || data.authorUrl || '',
            noindex: data.noindex === true,
            faq: faqItems,
            content,
            rawTitle: data.title
        });
    });

    posts.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.date.valueOf() - a.date.valueOf();
    });

    return posts;
}

/**
 * 渲染单篇文章详情页 HTML。
 */
function renderPostPage({ post, template, siteConfig, seoConfig }) {
    const { toc, headings } = extractHeadingsAndGenerateTOC(post.content);
    let contentHtml = parseMarkdown(post.content, { enableImageCaptions: post.enableImageCaptions });
    const articleHeadings = headings.map(h => ({ ...h, renderedLevel: Math.min(h.level + 1, 6) }));
    contentHtml = addHeadingIds(contentHtml, articleHeadings);

    const safeTitle = shared.escapeHtml(post.title);

    const tags = Array.isArray(post.tag) ? post.tag : (post.tag ? [post.tag] : []);
    const tagsHtml = tags.map(t => shared.renderTagSpan(t)).join('\n');
    let finalContentHtml = autoSpacingHtml(contentHtml);
    finalContentHtml = applyParagraphAlignment(finalContentHtml);
    finalContentHtml += seo.renderFaqHtml(post.faq || []);

    const canonical = seo.pageUrl(siteConfig, post.link);
    const rawCover = String(post.cover || '');
    const ogImage = seo.absoluteUrl(siteConfig, rawCover || seo.defaultImage(siteConfig, seoConfig));

    // 按需加载：扫描渲染后的 HTML，只为真正用到的特性引入对应 CSS/JS
    const needsHighlight = /<pre[^>]*><code/i.test(finalContentHtml);
    const needsKatex = /class="katex/i.test(finalContentHtml);
    const needsMermaid = /data-diagram-type="mermaid"|class="(?:[^"]*\s)?mermaid-block(?:\s[^"]*)?"/i.test(finalContentHtml);
    const needsEcharts = /class="(?:[^"]*\s)?echarts-block(?:\s[^"]*)?"|data-chart-options=/i.test(finalContentHtml);
    const needsTwitterEmbed = /data-embed-provider="twitter"/i.test(finalContentHtml);
    // 音频播放器：在 markdown 渲染结果里检测 🎵 标记或音频后缀链接。
    // audio-player.js 自身还要求链接在 <blockquote> 中，没匹配上时只是 no-op；
    // 因此即便误判命中，副作用仅是多下载一份 JS+CSS（约 25KB），没有功能问题。
    const needsAudioPlayer = /🎵|<a [^>]*href="[^"]*\.(?:mp3|m4a|wav|ogg|aac|flac|opus)\b/i.test(finalContentHtml);

    const chartJs = [
        needsMermaid ? '<script src="https://cdn.jsdelivr.net/npm/vditor@3.11.2/dist/js/mermaid/mermaid.min.js"></script>' : '',
        needsEcharts ? '<script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>' : ''
    ].filter(Boolean).join('\n    ');
    const highlightCss = needsHighlight
        ? '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css" />'
        : '';
    const katexCss = needsKatex
        ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" />'
        : '';
    const highlightJs = needsHighlight
        ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js" defer></script>'
        : '';
    const audioCss = needsAudioPlayer
        ? '<link rel="stylesheet" href="../assets/audio-player.css" />'
        : '';
    const audioJs = needsAudioPlayer
        ? '<script src="../assets/audio-player.js"></script>'
        : '';
    const embedJs = needsTwitterEmbed
        ? '<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'
        : '';

    const pageTitle = `${post.title} - ${siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog'}`;
    const seoHead = seo.renderHeadTags({
        title: pageTitle,
        description: seo.articleSummary(post),
        canonicalPath: post.link,
        siteConfig,
        seoConfig,
        type: 'article',
        image: rawCover || seo.defaultImage(siteConfig, seoConfig),
        noindex: post.noindex,
        tags,
        publishedTime: post.date.toISOString(),
        modifiedTime: post.modifiedDate.toISOString()
    });
    const jsonLd = seo.renderArticleJsonLd({ post, siteConfig, seoConfig, canonical, ogImage, tags, faqItems: post.faq || [] });

    const html = template
        .replace(/<!-- TITLE_PLACEHOLDER -->/g, () => safeTitle)
        .replace(/<!-- TITLE_H1_PLACEHOLDER -->/g, () => shared.processTitleHtml(safeTitle))
        .replace('<!-- TAGS_PLACEHOLDER -->', () => tagsHtml)
        .replace('<!-- DATE_PLACEHOLDER -->', () => post.date.tz('Asia/Shanghai').format('YYYY-MM-DD'))
        .replace('<!-- DATE_ISO_PLACEHOLDER -->', () => post.date.toISOString())
        .replace('<!-- MODIFIED_PLACEHOLDER -->', () => post.modifiedDate.tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm'))
        .replace('<!-- CONTENT_PLACEHOLDER -->', () => finalContentHtml)
        .replace('<!-- TOC_PLACEHOLDER -->', () => toc)
        .replace('<!-- POST_SEO_HEAD -->', () => seoHead)
        .replace('<!-- POST_HIGHLIGHT_CSS -->', () => highlightCss)
        .replace('<!-- POST_KATEX_CSS -->', () => katexCss)
        .replace('<!-- POST_HIGHLIGHT_JS -->', () => highlightJs)
        .replace('<!-- POST_CHART_JS -->', () => [chartJs, embedJs].filter(Boolean).join('\n    '))
        .replace('<!-- POST_AUDIO_CSS -->', () => audioCss)
        .replace('<!-- POST_AUDIO_JS -->', () => audioJs)
        .replace('<!-- POST_JSONLD -->', () => jsonLd);

    return removeEmptyTocAside(html, toc);
}

function generateAll({ posts, template, siteConfig, seoConfig, outputDir }) {
    console.log('📄 Generating post pages...');
    posts.forEach(post => {
        const html = renderPostPage({ post, template, siteConfig, seoConfig });
        const outFile = path.join(outputDir, 'posts', `${post.slug}.html`);
        fs.writeFileSync(outFile, html);
        console.log(`  Generated: posts/${post.slug}.html`);
    });
}

module.exports = { loadPosts, renderPostPage, generateAll };
