const fs = require('node:fs');
const path = require('node:path');
const { parseHTML, DOMParser } = require('linkedom');
const seo = require('./seo.js');
const { getTotalPages } = require('./pagination.js');

/** Check the actual deployable HTML and discovery files, after minification. */
function auditSeoOutput({ outputDir, siteConfig, posts, postsPerPage = 8 }) {
    const base = seo.normalizeBaseUrl(siteConfig);
    if (!base) return { skipped: true, pages: 0, articles: 0 };
    const fail = message => { throw new Error('SEO 检查失败：' + message); };
    function read(file) {
        try { return fs.readFileSync(path.join(outputDir, file), 'utf-8'); }
        catch { return fail('缺少生成文件 ' + file); }
    }
    function page(route) {
        const file = route.endsWith('/') ? route + 'index.html' : route.endsWith('.html') ? route : route + '.html';
        const html = read(file.slice(1));
        const { document } = parseHTML(html);
        return { html, document };
    }
    const indexed = posts.filter(post => !post.noindex);
    const routes = ['/', '/about', '/all', ...indexed.map(post => post.link)];
    for (let n = 2; n <= getTotalPages(posts.length, postsPerPage); n++) routes.push('/page/' + n + '/');
    const expectedUrls = routes.map(route => seo.pageUrl(siteConfig, route));
    const documents = new Map();
    for (const route of routes) {
        const { html, document } = page(route);
        documents.set(route, document);
        const canonical = document.head.querySelectorAll('link[rel="canonical"]');
        if (canonical.length !== 1 || canonical[0].getAttribute('href') !== seo.pageUrl(siteConfig, route)) fail(route + ' canonical 不匹配');
        if (!document.title.trim() || !document.head.querySelector('meta[name="description"]')?.content.trim()) fail(route + ' 缺少标题或摘要');
        if (!document.documentElement.lang) fail(route + ' 缺少语言');
        const charset = document.head.querySelector('meta[charset]');
        if (!charset || Buffer.byteLength(html.slice(0, html.indexOf('charset'))) > 1024) fail(route + ' 字符编码声明必须放在页面开头');
        const blocked = [...document.head.querySelectorAll('meta[name="robots"]')].some(node => node.content.includes('noindex'));
        if (blocked) fail(route + ' 意外禁止收录');
        const graph = [];
        for (const node of document.querySelectorAll('script[type="application/ld+json"]')) {
            let data;
            try { data = JSON.parse(node.textContent); } catch { fail(route + ' 结构化数据无效'); }
            graph.push(...(data['@graph'] || [data]));
        }
        if (route.startsWith('/posts/')) {
            const article = document.querySelector('article');
            if (!article?.querySelector('h1')?.textContent.trim() || !article.textContent.trim()) fail(route + ' 缺少静态文章正文');
            if (!graph.some(node => node['@type'] === 'BlogPosting' && node.url === seo.pageUrl(siteConfig, route))) fail(route + ' 缺少匹配的文章结构化数据');
        }
    }
    // Every published article needs a plain HTML link, not only a search interaction.
    const archiveLinks = new Set(Array.from(documents.get('/all').querySelectorAll('a[href]'), node => new URL(node.getAttribute('href'), base).href));
    for (const post of indexed) if (!archiveLinks.has(seo.pageUrl(siteConfig, post.link))) fail(post.link + ' 未出现在文章归档链接中');
    for (const route of ['/search', '/shell', '/404.html', ...posts.filter(post => post.noindex).map(post => post.link)]) {
        const { document } = page(route);
        if (![...document.head.querySelectorAll('meta[name="robots"]')].some(node => node.content.includes('noindex'))) fail(route + ' 应禁止收录');
    }
    const sitemap = new DOMParser().parseFromString(read('sitemap.xml'), 'text/xml');
    const urls = Array.from(sitemap.querySelectorAll('loc'), node => node.textContent);
    if (new Set(urls).size !== urls.length || urls.length !== expectedUrls.length || expectedUrls.some(url => !urls.includes(url))) fail('站点地图与可收录页面不一致');
    const robots = read('robots.txt');
    const groups = robots.split('User-agent:').map(group => group.trim());
    const ordinary = groups.find(group => group.startsWith('*')) || '';
    if (!ordinary.includes('Allow: /') || ordinary.includes('Disallow: /') || !robots.includes('Sitemap: ' + base + '/sitemap.xml')) fail('robots.txt 阻止抓取或缺少站点地图');
    return { pages: routes.length, articles: indexed.length };
}

module.exports = { auditSeoOutput };
