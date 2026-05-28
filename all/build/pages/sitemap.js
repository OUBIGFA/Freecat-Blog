const fs = require('fs');
const path = require('path');
const seo = require('../seo.js');

function xmlEscape(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function encodePath(p) {
    return String(p).split('/').map(seg => encodeURIComponent(seg)).join('/');
}

function visiblePosts(posts) {
    return posts.filter(post => !post.noindex);
}

function generateSitemap({ posts, siteConfig, outputDir }) {
    const baseUrl = seo.normalizeBaseUrl(siteConfig);
    if (!baseUrl) {
        console.log('⚠️  site_url is not configured; skipping sitemap.xml');
        return;
    }
    console.log('🗺️ Generating sitemap.xml...');

    const indexedPosts = visiblePosts(posts);
    const latestMod = indexedPosts.length
        ? indexedPosts.reduce((max, p) => Math.max(max, p.modifiedDate.valueOf()), 0)
        : null;
    const latestModIso = latestMod ? new Date(latestMod).toISOString().slice(0, 10) : null;

    const lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ];

    lines.push('  <url>');
    lines.push(`    <loc>${xmlEscape(baseUrl + '/')}</loc>`);
    if (latestModIso) lines.push(`    <lastmod>${latestModIso}</lastmod>`);
    lines.push('    <priority>1.0</priority>');
    lines.push('    <changefreq>weekly</changefreq>');
    lines.push('  </url>');

    lines.push('  <url>');
    lines.push(`    <loc>${xmlEscape(baseUrl + '/about.html')}</loc>`);
    lines.push('    <priority>0.8</priority>');
    lines.push('  </url>');

    lines.push('  <url>');
    lines.push(`    <loc>${xmlEscape(baseUrl + '/all.html')}</loc>`);
    if (latestModIso) lines.push(`    <lastmod>${latestModIso}</lastmod>`);
    lines.push('    <priority>0.5</priority>');
    lines.push('  </url>');

    indexedPosts.forEach(post => {
        lines.push('  <url>');
        lines.push(`    <loc>${xmlEscape(baseUrl + encodePath(post.link))}</loc>`);
        lines.push(`    <lastmod>${post.modifiedDate.format('YYYY-MM-DD')}</lastmod>`);
        lines.push(`    <priority>${post.pinned ? '0.9' : '0.7'}</priority>`);
        lines.push('  </url>');
    });

    lines.push('</urlset>');
    fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), lines.join('\n'));
    console.log('  Generated: sitemap.xml');
}

function generateRobotsTxt({ siteConfig, seoConfig = {}, outputDir }) {
    console.log('🤖 Generating robots.txt...');
    const baseUrl = seo.normalizeBaseUrl(siteConfig);
    let robots = 'User-agent: *\nAllow: /\n';

    if (seoConfig.allow_ai_crawlers !== false) {
        const aiAgents = [
            'Googlebot',
            'Google-Extended',
            'OAI-SearchBot',
            'GPTBot',
            'ChatGPT-User',
            'PerplexityBot',
            'ClaudeBot',
            'Claude-User',
            'Claude-SearchBot'
        ];
        robots += '\n';
        robots += aiAgents.map(agent => `User-agent: ${agent}\nAllow: /\n`).join('\n');
    }

    if (baseUrl) robots += `\nSitemap: ${baseUrl}/sitemap.xml\n`;
    fs.writeFileSync(path.join(outputDir, 'robots.txt'), robots);
    console.log('  Generated: robots.txt');
}

function generateLlmsTxt({ posts, siteConfig, seoConfig = {}, outputDir }) {
    if (seoConfig.enable_llms_txt === false) return;
    const baseUrl = seo.normalizeBaseUrl(siteConfig);
    if (!baseUrl) {
        console.log('⚠️  site_url is not configured; skipping llms.txt');
        return;
    }

    console.log('🤖 Generating llms.txt...');
    const lines = [
        `# ${seo.text(siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog')}`,
        '',
        seo.defaultDescription(siteConfig, seoConfig),
        '',
        '## Core Pages',
        `- Home: ${baseUrl}/`,
        `- All Articles: ${baseUrl}/all.html`,
        `- About: ${baseUrl}/about.html`,
        '',
        '## Articles'
    ];

    visiblePosts(posts).slice(0, 50).forEach(post => {
        lines.push(`- ${post.title}: ${baseUrl}${encodePath(post.link)} - ${seo.truncate(seo.articleSummary(post), 180)}`);
    });

    fs.writeFileSync(path.join(outputDir, 'llms.txt'), lines.join('\n'));
    console.log('  Generated: llms.txt');
}

function generateFeed({ posts, siteConfig, seoConfig = {}, outputDir }) {
    const baseUrl = seo.normalizeBaseUrl(siteConfig);
    if (!baseUrl) {
        console.log('⚠️  site_url is not configured; skipping feed.xml');
        return;
    }

    console.log('📡 Generating feed.xml...');
    const indexedPosts = visiblePosts(posts).slice(0, 30);
    const updated = indexedPosts[0] ? indexedPosts[0].modifiedDate.toISOString() : new Date().toISOString();
    const lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<feed xmlns="http://www.w3.org/2005/Atom">',
        `  <title>${xmlEscape(siteConfig.site_title || siteConfig.site_name || 'FreeCat Blog')}</title>`,
        `  <subtitle>${xmlEscape(seo.defaultDescription(siteConfig, seoConfig))}</subtitle>`,
        `  <link href="${xmlEscape(baseUrl + '/')}" />`,
        `  <link rel="self" href="${xmlEscape(baseUrl + '/feed.xml')}" />`,
        `  <id>${xmlEscape(baseUrl + '/')}</id>`,
        `  <updated>${xmlEscape(updated)}</updated>`
    ];

    indexedPosts.forEach(post => {
        const url = baseUrl + encodePath(post.link);
        lines.push('  <entry>');
        lines.push(`    <title>${xmlEscape(post.title)}</title>`);
        lines.push(`    <link href="${xmlEscape(url)}" />`);
        lines.push(`    <id>${xmlEscape(url)}</id>`);
        lines.push(`    <published>${xmlEscape(post.date.toISOString())}</published>`);
        lines.push(`    <updated>${xmlEscape(post.modifiedDate.toISOString())}</updated>`);
        lines.push(`    <summary>${xmlEscape(seo.articleSummary(post))}</summary>`);
        lines.push('  </entry>');
    });

    lines.push('</feed>');
    fs.writeFileSync(path.join(outputDir, 'feed.xml'), lines.join('\n'));
    console.log('  Generated: feed.xml');
}

/**
 * 生成 OpenSearch 描述文件 (/opensearch.xml)。
 * 让浏览器（Chrome / Edge / Firefox）把站内搜索集成进地址栏。
 * 依赖 site_url —— 缺失时与 sitemap / feed 一致，静默跳过。
 */
function generateOpenSearchXml({ siteConfig, seoConfig = {}, outputDir }) {
    const baseUrl = seo.normalizeBaseUrl(siteConfig);
    if (!baseUrl) {
        console.log('⚠️  site_url is not configured; skipping opensearch.xml');
        return;
    }

    console.log('🔭 Generating opensearch.xml...');
    const shortName = seo.text(siteConfig.site_name || siteConfig.site_title || 'FreeCat Blog');
    const description = seo.truncate(seo.defaultDescription(siteConfig, seoConfig), 1024) || shortName;
    const favicon = seo.absoluteUrl(siteConfig, siteConfig.site_favicon || '/image/freecat_web_icon.png');
    const inputEncoding = 'UTF-8';
    const lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">',
        `  <ShortName>${xmlEscape(shortName)}</ShortName>`,
        `  <Description>${xmlEscape(description)}</Description>`,
        `  <InputEncoding>${inputEncoding}</InputEncoding>`
    ];
    if (favicon) {
        lines.push(`  <Image width="16" height="16" type="image/x-icon">${xmlEscape(favicon)}</Image>`);
    }
    lines.push(`  <Url type="text/html" method="get" template="${xmlEscape(baseUrl + '/search.html?q={searchTerms}')}" />`);
    lines.push(`  <Url type="application/opensearchdescription+xml" rel="self" template="${xmlEscape(baseUrl + '/opensearch.xml')}" />`);
    lines.push('</OpenSearchDescription>');
    fs.writeFileSync(path.join(outputDir, 'opensearch.xml'), lines.join('\n'));
    console.log('  Generated: opensearch.xml');
}

module.exports = { generateSitemap, generateRobotsTxt, generateLlmsTxt, generateFeed, generateOpenSearchXml };
