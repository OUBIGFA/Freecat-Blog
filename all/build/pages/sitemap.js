const fs = require('fs');
const path = require('path');

// XML attribute/text escape
function xmlEscape(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// 对路径里的中文/特殊字符做百分号编码（保留 / 与已经合法的字符）
function encodePath(p) {
    return String(p).split('/').map(seg => encodeURIComponent(seg)).join('/');
}

function generateSitemap({ posts, siteConfig, outputDir }) {
    if (!siteConfig.site_url) {
        console.log('⚠️  未配置 site_url，跳过生成 sitemap.xml');
        return;
    }
    console.log('🗺️ Generating sitemap.xml...');
    const baseUrl = siteConfig.site_url.replace(/\/$/, '');

    // 取最新文章的修改时间作为首页 / all 页的 lastmod
    let latestMod = null;
    if (posts.length) {
        latestMod = posts.reduce((max, p) => {
            const v = p.modifiedDate.valueOf();
            return v > max ? v : max;
        }, 0);
    }
    const latestModIso = latestMod ? new Date(latestMod).toISOString().slice(0, 10) : null;

    const lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ];

    // 首页
    lines.push('  <url>');
    lines.push(`    <loc>${xmlEscape(baseUrl + '/')}</loc>`);
    if (latestModIso) lines.push(`    <lastmod>${latestModIso}</lastmod>`);
    lines.push('    <priority>1.0</priority>');
    lines.push('    <changefreq>weekly</changefreq>');
    lines.push('  </url>');

    // about
    lines.push('  <url>');
    lines.push(`    <loc>${xmlEscape(baseUrl + '/about.html')}</loc>`);
    lines.push('    <priority>0.8</priority>');
    lines.push('  </url>');

    // all
    lines.push('  <url>');
    lines.push(`    <loc>${xmlEscape(baseUrl + '/all.html')}</loc>`);
    if (latestModIso) lines.push(`    <lastmod>${latestModIso}</lastmod>`);
    lines.push('    <priority>0.5</priority>');
    lines.push('  </url>');

    posts.forEach(post => {
        const encodedLink = encodePath(post.link);
        lines.push('  <url>');
        lines.push(`    <loc>${xmlEscape(baseUrl + encodedLink)}</loc>`);
        lines.push(`    <lastmod>${post.modifiedDate.format('YYYY-MM-DD')}</lastmod>`);
        lines.push(`    <priority>${post.pinned ? '0.9' : '0.7'}</priority>`);
        lines.push('  </url>');
    });

    lines.push('</urlset>');
    fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), lines.join('\n'));
    console.log('  Generated: sitemap.xml');
}

function generateRobotsTxt({ siteConfig, outputDir }) {
    console.log('🤖 Generating robots.txt...');
    let robots = 'User-agent: *\nAllow: /\n';
    if (siteConfig.site_url) {
        robots += `Sitemap: ${siteConfig.site_url.replace(/\/$/, '')}/sitemap.xml\n`;
    }
    fs.writeFileSync(path.join(outputDir, 'robots.txt'), robots);
    console.log('  Generated: robots.txt');
}

module.exports = { generateSitemap, generateRobotsTxt };
