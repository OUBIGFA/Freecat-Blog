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
    if (raw.startsWith('/')) return `${baseUrl}${shared.encodeSitePath(raw)}`;
    return `${baseUrl}/${shared.encodeSitePath(raw.replace(/^\.?\//, ''))}`;
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
    if (siteConfig && siteConfig.hero_avatar_configured && siteConfig.hero_avatar) {
        return siteConfig.hero_avatar;
    }
    return seoConfig.site_default_image || siteConfig.hero_avatar || siteConfig.site_favicon || '';
}

function getAuthor(siteConfig, seoConfig, post) {
    const name = text(post && post.author) || text(seoConfig.site_author) || text(siteConfig.site_name) || 'FreeCat';
    const url = text(post && post.authorUrl) || text(seoConfig.site_author_url);
    const author = { '@type': 'Person', name };
    const absoluteAuthorUrl = absoluteUrl(siteConfig, url);
    if (absoluteAuthorUrl) author.url = absoluteAuthorUrl;
    const sameAs = collectAuthorSameAs(seoConfig);
    if (sameAs.length) author.sameAs = sameAs;
    return author;
}

function collectAuthorSameAs(seoConfig) {
    const raw = seoConfig && seoConfig.site_author_sameas;
    if (!raw) return [];
    const list = Array.isArray(raw)
        ? raw
        : String(raw).split(/[\r\n,]+/);
    const seen = new Set();
    const result = [];
    list.forEach(entry => {
        const value = text(entry);
        if (!/^https?:\/\//i.test(value)) return;
        if (seen.has(value)) return;
        seen.add(value);
        result.push(value);
    });
    return result;
}

function countWords(content) {
    const clean = stripMarkdown(String(content || ''));
    if (!clean) return 0;
    // 中文按字符计、英文按单词计：分别统计后相加，更贴近实际阅读量
    const cjk = (clean.match(/[㐀-鿿豈-﫿]/g) || []).length;
    const words = (clean.replace(/[㐀-鿿豈-﫿]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
    return cjk + words;
}

function estimateReadingTime(content) {
    const total = countWords(content);
    if (!total) return 0;
    // 中文 500 字/分钟、英文 250 词/分钟混合估算；按平均 400 取整
    const minutes = Math.max(1, Math.round(total / 400));
    return minutes;
}

function toIsoDuration(minutes) {
    const m = Math.max(1, parseInt(minutes, 10) || 0);
    return `PT${m}M`;
}

function renderHeadTags({
    title,
    description,
    canonicalPath,
    siteConfig,
    seoConfig,
    type = 'website',
    image = '',
    imageWidth = 0,
    imageHeight = 0,
    noindex = false,
    tags = [],
    publishedTime = '',
    modifiedTime = '',
    author = '',
    pagination = null
}) {
    const desc = truncate(description || defaultDescription(siteConfig, seoConfig));
    const canonical = pageUrl(siteConfig, canonicalPath);
    const ogImage = absoluteUrl(siteConfig, image || defaultImage(siteConfig, seoConfig));
    const siteName = text(siteConfig.site_title || siteConfig.site_name);
    const locale = text(seoConfig.site_language || 'zh-CN').replace('-', '_');
    const authorName = text(author) || text(seoConfig.site_author) || text(siteConfig.site_name);
    const lines = [];

    lines.push(`<meta name="description" content="${escapeAttr(desc)}" />`);
    if (noindex) lines.push('<meta name="robots" content="noindex,follow" />');
    if (canonical) lines.push(`<link rel="canonical" href="${escapeAttr(canonical)}" />`);
    if (pagination && pagination.prevUrl) {
        lines.push(`<link rel="prev" href="${escapeAttr(pagination.prevUrl)}" />`);
    }
    if (pagination && pagination.nextUrl) {
        lines.push(`<link rel="next" href="${escapeAttr(pagination.nextUrl)}" />`);
    }
    if (tags.length) lines.push(`<meta name="keywords" content="${escapeAttr(tags.join(', '))}" />`);
    if (authorName) lines.push(`<meta name="author" content="${escapeAttr(authorName)}" />`);

    lines.push(`<meta property="og:type" content="${type === 'article' ? 'article' : 'website'}" />`);
    if (canonical) lines.push(`<meta property="og:url" content="${escapeAttr(canonical)}" />`);
    lines.push(`<meta property="og:title" content="${escapeAttr(title)}" />`);
    lines.push(`<meta property="og:description" content="${escapeAttr(desc)}" />`);
    if (siteName) lines.push(`<meta property="og:site_name" content="${escapeAttr(siteName)}" />`);
    if (locale) lines.push(`<meta property="og:locale" content="${escapeAttr(locale)}" />`);
    if (ogImage) {
        lines.push(`<meta property="og:image" content="${escapeAttr(ogImage)}" />`);
        const w = parseInt(imageWidth, 10);
        const h = parseInt(imageHeight, 10);
        // 仅在调用方显式给出 frontmatter cover_width / cover_height 时输出尺寸；
        // 没给就不输出 —— 避免方形头像被谎报成 1200x630 后社交平台裁切异常。
        if (w > 0 && h > 0) {
            lines.push(`<meta property="og:image:width" content="${escapeAttr(w)}" />`);
            lines.push(`<meta property="og:image:height" content="${escapeAttr(h)}" />`);
        }
        lines.push(`<meta property="og:image:alt" content="${escapeAttr(title)}" />`);
    }
    if (publishedTime) lines.push(`<meta property="article:published_time" content="${escapeAttr(publishedTime)}" />`);
    if (modifiedTime) lines.push(`<meta property="article:modified_time" content="${escapeAttr(modifiedTime)}" />`);
    if (type === 'article' && authorName) {
        lines.push(`<meta property="article:author" content="${escapeAttr(authorName)}" />`);
    }
    tags.forEach(tag => lines.push(`<meta property="article:tag" content="${escapeAttr(tag)}" />`));

    lines.push('<meta name="twitter:card" content="summary_large_image" />');
    if (canonical) lines.push(`<meta name="twitter:url" content="${escapeAttr(canonical)}" />`);
    lines.push(`<meta name="twitter:title" content="${escapeAttr(title)}" />`);
    lines.push(`<meta name="twitter:description" content="${escapeAttr(desc)}" />`);
    if (ogImage) {
        lines.push(`<meta name="twitter:image" content="${escapeAttr(ogImage)}" />`);
        lines.push(`<meta name="twitter:image:alt" content="${escapeAttr(title)}" />`);
    }

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
            <summary class="cursor-pointer text-base font-extrabold text-[#1e293b] dark:text-slate-200">${escapeAttr(item.question)}</summary>
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
    const wordCount = countWords(post.content || '');
    const readingMinutes = estimateReadingTime(post.content || '');
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

    if (wordCount > 0) article.wordCount = wordCount;
    if (readingMinutes > 0) article.timeRequired = toIsoDuration(readingMinutes);

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

function renderAboutJsonLd({ siteConfig, seoConfig, aboutConfig, canonical }) {
    const baseUrl = normalizeBaseUrl(siteConfig);
    if (!baseUrl || !canonical) return '';

    const author = getAuthor(siteConfig, seoConfig);
    const heroSubtitle = stripHtml(
        (aboutConfig && aboutConfig.about_hero_subtitle) ||
        siteConfig.hero_subtitle ||
        defaultDescription(siteConfig, seoConfig)
    );
    const heroTitle = text(
        (aboutConfig && aboutConfig.about_hero_title) ||
        siteConfig.hero_title ||
        siteConfig.site_title ||
        'About'
    );
    const personImage = absoluteUrl(
        siteConfig,
        (aboutConfig && aboutConfig.about_hero_avatar) ||
        siteConfig.hero_avatar ||
        defaultImage(siteConfig, seoConfig)
    );

    const person = {
        '@type': 'Person',
        '@id': `${canonical}#person`,
        name: author.name,
        description: truncate(heroSubtitle, 320)
    };
    if (author.url) person.url = author.url;
    if (author.sameAs && author.sameAs.length) person.sameAs = author.sameAs;
    if (personImage) person.image = personImage;

    const aboutPage = {
        '@type': 'AboutPage',
        '@id': `${canonical}#aboutpage`,
        url: canonical,
        name: heroTitle,
        description: truncate(heroSubtitle),
        inLanguage: seoConfig.site_language || 'zh-CN',
        mainEntity: { '@id': `${canonical}#person` },
        isPartOf: { '@id': `${baseUrl}/#website` }
    };

    const breadcrumb = {
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
            { '@type': 'ListItem', position: 2, name: 'About', item: canonical }
        ]
    };

    return jsonLdScript({
        '@context': 'https://schema.org',
        '@graph': [aboutPage, person, breadcrumb]
    });
}

function articleSummary(post) {
    if (post.summary) return post.summary;
    if (post.excerpt) return post.excerpt;
    return truncate(stripMarkdown(post.content || ''), 160);
}

module.exports = {
    absoluteUrl,
    articleSummary,
    collectAuthorSameAs,
    countWords,
    defaultDescription,
    defaultImage,
    estimateReadingTime,
    getAuthor,
    jsonLdScript,
    normalizeBaseUrl,
    normalizeFaq,
    pageUrl,
    renderAboutJsonLd,
    renderArticleJsonLd,
    renderFaqHtml,
    renderHeadTags,
    renderWebsiteJsonLd,
    stripHtml,
    text,
    toIsoDuration,
    truncate
};
