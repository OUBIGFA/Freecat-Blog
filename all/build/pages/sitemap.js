const fs = require('fs');
const path = require('path');

function generateSitemap({ posts, siteConfig, outputDir }) {
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
    fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemap);
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
