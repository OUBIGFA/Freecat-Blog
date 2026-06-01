const fs = require('fs');
const path = require('path');

/**
 * 生成 dist/404.html。
 *
 * 关键点：
 *   - 不依赖 site_url，任何配置下都生成（404 是站点基础设施）
 *   - head 含 noindex,follow，避免被 Google 误判为 soft 404 影响其它页面收录
 *   - Vercel / Cloudflare Pages 都自动识别根目录 404.html 作为 404 响应页
 *
 * 模板由 build.js 在调用前用 createEngine 注入了 partials 与 SITE_* 占位，
 * 因此此处只负责写出。
 */
function normalizeNotFoundAssetUrls(html) {
    return String(html || '').replace(/(["'])\.\/assets\//g, '$1/assets/');
}

function generateNotFoundPage({ template, outputDir }) {
    console.log('🚫 Generating 404.html...');
    fs.writeFileSync(path.join(outputDir, '404.html'), normalizeNotFoundAssetUrls(template), 'utf-8');
    console.log('  Generated: 404.html');
}

module.exports = { generateNotFoundPage, normalizeNotFoundAssetUrls };
