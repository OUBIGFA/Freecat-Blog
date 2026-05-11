const shared = require('../src/assets/shared.js');
const { stripMarkdown } = require('./markdown.js');

function text(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

function escapeAttr(value) {
    return shared.escapeHtml(text(value));
}

function stripHtml(value) {
    return text(String(value || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ''));
}

function truncate(value, max = 160) {
    const clean = text(value);
    if (clean.length <= max) return clean;
    return clean.slice(0, Math.max(0, max - 1)).trimEnd() + '…';
}

function normalizeBaseUrl(siteConfig) {
    const raw = text(siteConfig && siteConfig.site_url);
    if (!/^https?:\/\//i.test(raw)) return '';
    return raw.replace(/\/+$/, '');
}

function absoluteUrl(siteConfig, url) {
    const raw = text(url);
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^\/\//.test(raw)) return `https:${raw}`;

    const baseUrl = normalizeBaseUrl(siteConfig);
    if (!baseUrl) return '';
    if (raw.startsWith('/')) return `${baseUrl}${raw}`;
    return `${baseUrl}/${raw.replace(/^\.?\//, '')}`;
}

function pageUrl(siteConfig, path) {
    return absoluteUrl(siteConfig, path || '/');
}

function jsonLdScript(data) {
    const json = JSON.stringify(data).replace(/<\/script/gi, '<\\/script');
    return `<script type="application/ld+json">${json}</script>`;
}

function defaultDescription(siteConfig, seoConfig) {
    return truncate(seoConfig.site_description || siteConfig.hero_subtitle || siteConfig.site_title || siteConfig.site_name);
}

function defaultImage(siteConfig, seoConfig) {
    return seoConfig.site_default_image || siteConfig.hero_avatar || siteConfig.site_favicon || '';
}

function getAuthor(siteConfig, seoConfig, post) {
    const name = text(post && post.author) || text(seoConfig.site_author) || text(siteConfig.site_name) || 'FreeCat';
    const url = text(post && post.authorUrl) || text(seoConfig.site_author_url);
    const author = { '@type': 'Person', name };
    const absoluteAuthorUrl = absoluteUrl(siteConfig, url);
    if (absoluteAuthorUrl) author.url = absoluteAuthorUrl;
    return author;
}

function renderHeadTags({
    title,
    description,
    canonicalPath,
    siteConfig,
    seoConfig,
    type = 'website',
    image = '',
    noindex = false,
    tags = [],
    publishedTime = '',
    modifiedTime = ''
}) {
    const desc = truncate(description || defaultDescription(siteConfig, seoConfig));
    const canonical = pageUrl(siteConfig, canonicalPath);
    const ogImage = absoluteUrl(siteConfig, image || defaultImage(siteConfig, seoConfig));
    const siteName = text(siteConfig.site_title || siteConfig.site_name);
    const locale = text(seoConfig.site_language || 'zh-CN').replace('-', '_');
    const lines = [];

    lines.push(`<meta name="description" content="${escapeAttr(desc)}" />`);
    if (noindex) lines.push('<meta name="robots" content="noindex,follow" />');
    if (canonical) lines.push(`<link rel="canonical" href="${escapeAttr(canonical)}" />`);
    if (tags.length) lines.push(`<meta name="keywords" content="${escapeAttr(tags.join(', '))}" />`);

    lines.push(`<meta property="og:type" content="${type === 'article' ? 'article' : 'website'}" />`);
    if (canonical) lines.push(`<meta property="og:url" content="${escapeAttr(canonical)}" />`);
    lines.push(`<meta property="og:title" content="${escapeAttr(title)}" />`);
    lines.push(`<meta property="og:description" content="${escapeAttr(desc)}" />`);
    if (siteName) lines.push(`<meta property="og:site_name" content="${escapeAttr(siteName)}" />`);
    if (locale) lines.push(`<meta property="og:locale" content="${escapeAttr(locale)}" />`);
    if (ogImage) lines.push(`<meta property="og:image" content="${escapeAttr(ogImage)}" />`);
    if (publishedTime) lines.push(`<meta property="article:published_time" content="${escapeAttr(publishedTime)}" />`);
    if (modifiedTime) lines.push(`<meta property="article:modified_time" content="${escapeAttr(modifiedTime)}" />`);
    tags.forEach(tag => lines.push(`<meta property="article:tag" content="${escapeAttr(tag)}" />`));

    lines.push('<meta name="twitter:card" content="summary_large_image" />');
    if (canonical) lines.push(`<meta name="twitter:url" content="${escapeAttr(canonical)}" />`);
    lines.push(`<meta name="twitter:title" content="${escapeAttr(title)}" />`);
    lines.push(`<meta name="twitter:description" content="${escapeAttr(desc)}" />`);
    if (ogImage) lines.push(`<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`);

    return lines.join('\n    ');
}

function renderWebsiteJsonLd({ siteConfig, seoConfig }) {
    const baseUrl = normalizeBaseUrl(siteConfig);
    if (!baseUrl) return '';

    const siteName = text(siteConfig.site_title || siteConfig.site_name);
    const author = getAuthor(siteConfig, seoConfig);
    const graph = [
        {
            '@type': 'WebSite',
            '@id': `${baseUrl}/#website`,
            url: `${baseUrl}/`,
            name: siteName,
            description: defaultDescription(siteConfig, seoConfig),
            inLanguage: seoConfig.site_language || 'zh-CN',
            publisher: { '@id': `${baseUrl}/#publisher` },
            potentialAction: {
                '@type': 'SearchAction',
                target: `${baseUrl}/search.html?q={search_term_string}`,
                'query-input': 'required name=search_term_string'
            }
        },
        {
            '@type': author.url ? 'Person' : 'Organization',
            '@id': `${baseUrl}/#publisher`,
            name: author.name
        }
    ];
    if (author.url) graph[1].url = author.url;

    return jsonLdScript({ '@context': 'https://schema.org', '@graph': graph });
}

function normalizeFaq(rawFaq) {
    if (!Array.isArray(rawFaq)) return [];
    return rawFaq
        .map(item => ({
            question: text(item && item.question),
            answer: text(item && item.answer)
        }))
        .filter(item => item.question && item.answer);
}

function renderFaqHtml(faqItems) {
    if (!faqItems.length) return '';
    const itemsHtml = faqItems.map(item => `
        <details class="faq-item rounded-lg border border-slate-200 dark:border-slate-700 px-5 py-4">
            <summary class="cursor-pointer text-base font-bold text-[#1e293b] dark:text-slate-200">${escapeAttr(item.question)}</summary>
            <p class="mt-3 text-base leading-8 text-slate-600 dark:text-slate-300">${escapeAttr(item.answer)}</p>
        </details>`).join('\n');
    return `
        <section class="article-faq mt-16">
            <h2 id="faq" class="article-heading article-heading-depth-1 article-heading-source-h2 scroll-mt-24">常见问题</h2>
            <div class="mt-6 space-y-4">
                ${itemsHtml}
            </div>
        </section>`;
}

function renderArticleJsonLd({ post, siteConfig, seoConfig, canonical, ogImage, tags, faqItems }) {
    const baseUrl = normalizeBaseUrl(siteConfig);
    const author = getAuthor(siteConfig, seoConfig, post);
    const publisher = baseUrl
        ? { '@id': `${baseUrl}/#publisher` }
        : { '@type': 'Organization', name: text(siteConfig.site_name || siteConfig.site_title || 'FreeCat') };
    const article = {
        '@type': 'BlogPosting',
        headline: post.title,
        description: truncate(post.excerpt),
        datePublished: post.date.toISOString(),
        dateModified: post.modifiedDate.toISOString(),
        inLanguage: seoConfig.site_language || 'zh-CN',
        author,
        publisher
    };

    if (canonical) {
        article['@id'] = `${canonical}#article`;
        article.url = canonical;
        article.mainEntityOfPage = { '@type': 'WebPage', '@id': canonical };
    }
    if (ogImage) article.image = [ogImage];
    if (tags.length) article.keywords = tags.join(', ');

    const graph = [article];

    if (baseUrl && canonical) {
        graph.push({
            '@type': 'BreadcrumbList',
            '@id': `${canonical}#breadcrumb`,
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
                { '@type': 'ListItem', position: 2, name: post.title, item: canonical }
            ]
        });
    }

    if (faqItems.length) {
        graph.push({
            '@type': 'FAQPage',
            mainEntity: faqItems.map(item => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer }
            }))
        });
        if (canonical) graph[graph.length - 1]['@id'] = `${canonical}#faq`;
    }

    return jsonLdScript({ '@context': 'https://schema.org', '@graph': graph });
}

function articleSummary(post) {
    if (post.summary) return post.summary;
    if (post.excerpt) return post.excerpt;
    return truncate(stripMarkdown(post.content || ''), 160);
}

module.exports = {
    absoluteUrl,
    articleSummary,
    defaultDescription,
    defaultImage,
    getAuthor,
    jsonLdScript,
    normalizeBaseUrl,
    normalizeFaq,
    pageUrl,
    renderArticleJsonLd,
    renderFaqHtml,
    renderHeadTags,
    renderWebsiteJsonLd,
    stripHtml,
    text,
    truncate
};
