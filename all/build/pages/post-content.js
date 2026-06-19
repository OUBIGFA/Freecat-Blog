const { autoSpacingHtml, applyParagraphAlignment, parseMarkdown, extractHeadingsAndGenerateTOC, addHeadingIds } = require('../markdown.js');
const seo = require('../seo.js');

function renderPostContent({ post, includeHeadingIds = true, includeFaq = true } = {}) {
    const { toc, headings } = extractHeadingsAndGenerateTOC(post.content);
    let contentHtml = parseMarkdown(post.content, {
        enableImageCaptions: post.enableImageCaptions,
        markMarkdownHeadings: includeHeadingIds
    });

    if (includeHeadingIds) {
        const articleHeadings = headings.map(h => ({ ...h, renderedLevel: Math.min(h.level + 1, 6) }));
        contentHtml = addHeadingIds(contentHtml, articleHeadings);
    }

    let finalContentHtml = autoSpacingHtml(contentHtml);
    finalContentHtml = applyParagraphAlignment(finalContentHtml);
    if (includeFaq) finalContentHtml += seo.renderFaqHtml(post.faq || []);

    return { html: finalContentHtml, toc, headings };
}

module.exports = { renderPostContent };
