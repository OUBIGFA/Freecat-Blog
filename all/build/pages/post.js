const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const matter = require('gray-matter');
const shared = require('../../src/assets/shared.js');
const { autoSpacing, autoSpacingHtml, applyParagraphAlignment, parseMarkdown, extractHeadingsAndGenerateTOC, addHeadingIds } = require('../markdown.js');
const { stripMarkdown } = require('../markdown.js');

/**
 * 读取 writing/ 目录下的所有 Markdown 文章并归一化为 post 对象数组。
 * 跳过 frontmatter 标记 show: false 的文件。已按"置顶在前 + 时间倒序"排序。
 */
function loadPosts({ postsDir, gitDates }) {
    const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    const posts = [];

    postFiles.forEach(file => {
        const filePath = path.join(postsDir, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const slug = file.replace('.md', '');
        const { data, content } = matter(raw);
        const enableImageCaptions = data.show_image_captions === true || data.enable_image_captions === true || data.enableImageCaptions === true;

        if (data.show === false) {
            console.log(`  跳过文章: ${file}`);
            return;
        }

        const stats = fs.statSync(filePath);
        const publishDate = data.date ? dayjs(data.date) : dayjs(stats.birthtime);

        let modifiedDate;
        if (data.updated) modifiedDate = dayjs(data.updated);
        else if (data.date_updated) modifiedDate = dayjs(data.date_updated);
        else {
            const gitDate = gitDates.assertHas ? gitDates.assertHas(file) : gitDates.get(file);
            if (!gitDate) {
                throw new Error(`Missing Git modified date for "${file}".`);
            }
            modifiedDate = dayjs(gitDate);
        }

        const cleanContent = stripMarkdown(content);
        const previewRaw = data.description || cleanContent;
        const excerptRaw = data.description || (cleanContent.slice(0, 160) + (cleanContent.length > 160 ? '...' : ''));
        const titleRaw = (data.title && String(data.title).trim()) ? data.title : slug;

        posts.push({
            title: autoSpacing(titleRaw),
            slug,
            date: publishDate,
            modifiedDate,
            excerpt: autoSpacing(excerptRaw),
            preview: autoSpacing(previewRaw),
            cover: data.cover || '',
            tag: data.tag || data.tags || [],
            link: `/posts/${slug}.html`,
            showCover: data.show_cover !== false,
            pinned: data.pinned === true,
            enableImageCaptions,
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
function renderPostPage({ post, template, siteConfig }) {
    const { toc, headings } = extractHeadingsAndGenerateTOC(post.content);
    let contentHtml = parseMarkdown(post.content, { enableImageCaptions: post.enableImageCaptions });
    contentHtml = addHeadingIds(contentHtml, headings);

    const safeCover = shared.escapeHtml(String(post.cover || ''));
    const safeTitle = shared.escapeHtml(post.title);
    const coverHtml = (post.cover && post.showCover)
        ? `
        <div class="w-full rounded-xl overflow-hidden mb-32 relative">
            <div class="loader absolute top-12 left-12 z-10" style="display:none"></div>
            <img alt="${safeTitle}" class="w-full h-auto object-cover" src="${safeCover}"
                onerror="if(this.dataset.fallbackApplied!=='true'){
                    this.dataset.fallbackApplied='true';
                    this.src='/image/404.png';
                    const loader = this.previousElementSibling;
                    if(loader && loader.classList.contains('loader')) loader.style.display='block';
                }"
                loading="lazy" />
        </div>
    `
        : '<div class="mb-24"></div>';

    const tags = Array.isArray(post.tag) ? post.tag : (post.tag ? [post.tag] : []);
    const tagsHtml = tags.map(t => shared.renderTagSpan(t)).join('\n');
    let finalContentHtml = autoSpacingHtml(contentHtml);
    finalContentHtml = applyParagraphAlignment(finalContentHtml);

    const baseUrl = String(siteConfig.site_url || '');
    const canonical = baseUrl ? `${baseUrl}${post.link}` : post.link;
    const rawCover = String(post.cover || '');
    const ogImage = rawCover && /^https?:\/\//i.test(rawCover)
        ? rawCover
        : (baseUrl && rawCover ? `${baseUrl}${rawCover}` : rawCover);

    // 按需加载：扫描渲染后的 HTML，只为真正用到的特性引入对应 CSS/JS
    const needsHighlight = /<pre[^>]*><code/i.test(finalContentHtml);
    const needsKatex = /class="katex/i.test(finalContentHtml);
    const needsMermaid = /class="language-mermaid|class="lang-mermaid|class="mermaid"|<code[^>]*mermaid/i.test(finalContentHtml);

    const headLibs = needsMermaid
        ? '<script src="https://cdn.jsdelivr.net/npm/beautiful-mermaid/dist/beautiful-mermaid.browser.global.js" defer></script>'
        : '';
    const highlightCss = needsHighlight
        ? '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css" />'
        : '';
    const katexCss = needsKatex
        ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" />'
        : '';
    const highlightJs = needsHighlight
        ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js" defer></script>'
        : '';

    // JSON-LD Article schema（结构化数据 → SEO + 富片段）
    const jsonLdObj = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date.toISOString(),
        dateModified: post.modifiedDate.toISOString(),
        author: { '@type': 'Person', name: siteConfig.site_name || 'FreeCat' },
        publisher: { '@type': 'Organization', name: siteConfig.site_name || 'FreeCat' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical }
    };
    if (ogImage) jsonLdObj.image = ogImage;
    if (tags.length) jsonLdObj.keywords = tags.join(', ');
    // JSON.stringify 已经会转义 </script> 中的 / —— 不会，所以单独处理
    const jsonLdJson = JSON.stringify(jsonLdObj).replace(/<\/script/gi, '<\\/script');
    const jsonLd = `<script type="application/ld+json">${jsonLdJson}</script>`;

    return template
        .replace(/<!-- TITLE_PLACEHOLDER -->/g, safeTitle)
        .replace(/<!-- TITLE_H1_PLACEHOLDER -->/g, shared.processTitleHtml(safeTitle))
        .replace('<!-- TAGS_PLACEHOLDER -->', tagsHtml)
        .replace('<!-- DATE_PLACEHOLDER -->', post.date.tz('Asia/Shanghai').format('YYYY-MM-DD'))
        .replace('<!-- MODIFIED_PLACEHOLDER -->', post.modifiedDate.tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm'))
        .replace('<!-- COVER_PLACEHOLDER -->', coverHtml)
        .replace('<!-- CONTENT_PLACEHOLDER -->', finalContentHtml)
        .replace('<!-- TOC_PLACEHOLDER -->', toc)
        .replace(/<!-- POST_DESCRIPTION -->/g, shared.escapeHtml(post.excerpt))
        .replace(/<!-- POST_KEYWORDS -->/g, shared.escapeHtml(Array.isArray(post.tag) ? post.tag.join(', ') : (post.tag || '')))
        .replace(/<!-- POST_CANONICAL_URL -->/g, shared.escapeHtml(canonical))
        .replace(/<!-- POST_IMAGE -->/g, shared.escapeHtml(ogImage))
        .replace('<!-- POST_HEAD_LIBS -->', headLibs)
        .replace('<!-- POST_HIGHLIGHT_CSS -->', highlightCss)
        .replace('<!-- POST_KATEX_CSS -->', katexCss)
        .replace('<!-- POST_HIGHLIGHT_JS -->', highlightJs)
        .replace('<!-- POST_JSONLD -->', jsonLd);
}

function generateAll({ posts, template, siteConfig, outputDir }) {
    console.log('📄 Generating post pages...');
    posts.forEach(post => {
        const html = renderPostPage({ post, template, siteConfig });
        const outFile = path.join(outputDir, 'posts', `${post.slug}.html`);
        fs.writeFileSync(outFile, html);
        console.log(`  Generated: posts/${post.slug}.html`);
    });
}

module.exports = { loadPosts, renderPostPage, generateAll };
