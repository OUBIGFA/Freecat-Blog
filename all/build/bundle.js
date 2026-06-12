const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const cssnano = require('cssnano');

/**
 * 构建期资源合并（bundle）。
 *
 * 目标：把每个页面的十几个 <script>/<link> 引用在构建期合并为少量 bundle 文件，
 * 减少浏览器请求数与逐文件解析开销；运行时行为与逐文件加载完全一致。
 *
 * 顺序的唯一声明处不变：
 *   - 全站脚本顺序     → src/partials/scripts-end.html（本模块解析它得到串接顺序）
 *   - 文章页追加脚本   → src/template_post.html 中 INCLUDE:scripts-end 之后的 <script>
 *   - 全站样式顺序     → src/partials/head-base.html 中的 <link rel="stylesheet">
 *   - 文章页追加样式   → src/template_post.html 的样式清单去掉全站部分后的剩余项
 *
 * 产出：
 *   - dist/assets/freecat-app.js    全站脚本串接（每页 19 个请求 → 1 个）
 *   - dist/assets/freecat-post.js   文章页专属脚本串接（code-folding + post）
 *   - dist/assets/freecat-site.css  transitions + tailwind + typography
 *   - dist/assets/freecat-post.css  post + post-code
 *
 * 条件加载的媒体播放器（media/audio/video-player）与第三方 CDN 脚本不参与合并，
 * 保持原有按需加载策略。
 */

const APP_BUNDLE_URL = '/assets/freecat-app.js';
const POST_BUNDLE_URL = '/assets/freecat-post.js';
const SITE_CSS_BUNDLE_URL = '/assets/freecat-site.css';
const POST_CSS_BUNDLE_URL = '/assets/freecat-post.css';

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function scriptTagPattern(url) {
    return new RegExp('[ \\t]*<script src="' + escapeRegExp(url) + '" defer><\\/script>\\r?\\n?');
}

function styleTagPattern(url) {
    return new RegExp('[ \\t]*<link rel="stylesheet" href="' + escapeRegExp(url) + '" \\/>\\r?\\n?');
}

function parseScriptUrls(html) {
    const urls = [];
    const re = /<script src="(\/assets\/[^"?]+\.js)" defer><\/script>/g;
    let match;
    while ((match = re.exec(html))) urls.push(match[1]);
    return urls;
}

function parseStyleUrls(html) {
    const urls = [];
    const re = /<link rel="stylesheet" href="(\/assets\/[^"?]+\.css)" \/>/g;
    let match;
    while ((match = re.exec(html))) urls.push(match[1]);
    return urls;
}

// 把一组引用改写为单个 bundle 引用：组内第一项替换为 bundle 标签，其余删除。
// 组内第一项不存在时不做任何改写（该页面没引入这组资源）。
function rewriteGroup(html, urls, bundleTag, tagPattern) {
    if (!urls.length) return html;
    const firstPattern = tagPattern(urls[0]);
    const firstMatch = firstPattern.exec(html);
    if (!firstMatch) return html;
    const indent = (firstMatch[0].match(/^[ \t]*/) || [''])[0];
    let out = html.replace(firstPattern, `${indent}${bundleTag}\n`);
    for (const url of urls.slice(1)) {
        out = out.replace(tagPattern(url), '');
    }
    return out;
}

function createBundler({ templatesDir, partialsDir, assetsDir, sharedDir }) {
    const scriptsEndHtml = fs.readFileSync(path.join(partialsDir, 'scripts-end.html'), 'utf-8');
    const headBaseHtml = fs.readFileSync(path.join(partialsDir, 'head-base.html'), 'utf-8');
    const postTemplateHtml = fs.readFileSync(path.join(templatesDir, 'template_post.html'), 'utf-8');

    const appScripts = parseScriptUrls(scriptsEndHtml);
    if (appScripts.length < 2) {
        throw new Error('bundle: scripts-end.html script list parse failed — bundle order source is broken');
    }
    // 文章页专属脚本 = post 模板里 scripts-end 注入点之后声明的 <script>
    const postScripts = parseScriptUrls(
        postTemplateHtml.slice(postTemplateHtml.indexOf('INCLUDE:scripts-end'))
    );
    const siteStyles = parseStyleUrls(headBaseHtml);
    if (siteStyles.length < 2) {
        throw new Error('bundle: head-base.html stylesheet list parse failed — bundle order source is broken');
    }
    const postStyles = parseStyleUrls(postTemplateHtml).filter(url => !siteStyles.includes(url));

    function resolveAssetFile(url) {
        const name = url.replace(/^\/assets\//, '');
        for (const dir of [assetsDir, sharedDir]) {
            const file = path.join(dir, name);
            if (fs.existsSync(file)) return file;
        }
        throw new Error(`bundle: cannot resolve source file for ${url}`);
    }

    function rewriteHtml(html) {
        let out = html;
        out = rewriteGroup(out, siteStyles, `<link rel="stylesheet" href="${SITE_CSS_BUNDLE_URL}" />`, styleTagPattern);
        out = rewriteGroup(out, postStyles, `<link rel="stylesheet" href="${POST_CSS_BUNDLE_URL}" />`, styleTagPattern);
        out = rewriteGroup(out, appScripts, `<script src="${APP_BUNDLE_URL}" defer></script>`, scriptTagPattern);
        out = rewriteGroup(out, postScripts, `<script src="${POST_BUNDLE_URL}" defer></script>`, scriptTagPattern);
        return out;
    }

    function concatJs(urls) {
        const header = '/* Generated at build time by build/bundle.js — 串接顺序来自 scripts-end.html / template_post.html，勿手改 */';
        const parts = urls.map(url => `/* ===== ${url} ===== */\n${fs.readFileSync(resolveAssetFile(url), 'utf-8')}`);
        return [header, ...parts].join('\n;\n');
    }

    function writeJsBundles(outputAssetsDir) {
        fs.writeFileSync(path.join(outputAssetsDir, path.basename(APP_BUNDLE_URL)), concatJs(appScripts), 'utf-8');
        if (postScripts.length) {
            fs.writeFileSync(path.join(outputAssetsDir, path.basename(POST_BUNDLE_URL)), concatJs(postScripts), 'utf-8');
        }
    }

    // CSS 必须在 Tailwind 编译完成后合并（tailwind.css 只存在于 dist/assets）。
    async function writeCssBundles(outputAssetsDir, { minify = true } = {}) {
        async function bundleCss(urls, outName) {
            const css = urls
                .map(url => fs.readFileSync(path.join(outputAssetsDir, path.basename(url)), 'utf-8'))
                .join('\n');
            const out = minify
                ? (await postcss([cssnano({ preset: 'default' })]).process(css, { from: undefined })).css
                : css;
            fs.writeFileSync(path.join(outputAssetsDir, outName), out, 'utf-8');
            return out.length;
        }

        const sizes = {};
        sizes[path.basename(SITE_CSS_BUNDLE_URL)] = await bundleCss(siteStyles, path.basename(SITE_CSS_BUNDLE_URL));
        if (postStyles.length) {
            sizes[path.basename(POST_CSS_BUNDLE_URL)] = await bundleCss(postStyles, path.basename(POST_CSS_BUNDLE_URL));
        }
        return sizes;
    }

    return {
        appScripts,
        postScripts,
        siteStyles,
        postStyles,
        rewriteHtml,
        writeJsBundles,
        writeCssBundles
    };
}

module.exports = {
    createBundler,
    APP_BUNDLE_URL,
    POST_BUNDLE_URL,
    SITE_CSS_BUNDLE_URL,
    POST_CSS_BUNDLE_URL
};
