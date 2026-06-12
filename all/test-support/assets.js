const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');

function readProjectFile(...segments) {
    return fs.readFileSync(path.join(projectRoot, ...segments), 'utf-8');
}

function readAsset(name) {
    return readProjectFile('src', 'assets', name);
}

function preloadFontHrefs(source) {
    return [...source.matchAll(/<link\s+rel="preload"\s+href="([^"]+)"\s+as="font"\s+type="font\/woff2"\s+crossorigin\s*\/?>/g)]
        .map(match => match[1]);
}

function fontFaceSrcUrls(source) {
    return [...source.matchAll(/src:\s*url\("([^"]+)"\)\s*format\("woff2"\)/g)]
        .map(match => match[1]);
}

// 惰性加载：每个字段只在测试真正解构 / 访问时才读文件或 require 模块，
// 避免 General Fixture（所有测试一次性吃下全部 50+ 资产）。结果按字段缓存。
const lazyEntries = {
    postJs: () => readAsset('post.js'),
    postCss: () => readAsset('post.css'),
    postCodeCss: () => readAsset('post-code.css'),
    mainJs: () => readAsset('main.js'),
    codeCopyJs: () => readAsset('code-copy.js'),
    codeFoldingJs: () => readAsset('code-folding.js'),
    floatingNavJs: () => readAsset('floating-nav.js'),
    runtimeJs: () => readAsset('runtime.js'),
    scrollMemoryJs: () => readAsset('scroll-memory.js'),
    navAudioJs: () => readAsset('nav-audio.js'),
    shellRouterJs: () => readAsset('shell-router.js'),
    typographyCss: () => readAsset('typography.css'),
    themeSystemJs: () => readAsset('theme-system.js'),
    searchCoreJs: () => readAsset('search-core.js'),
    headerSearchJs: () => readAsset('header-search.js'),
    searchPageJs: () => readAsset('search-page.js'),
    seamlessPaginationJs: () => readAsset('seamless-pagination.js'),
    updateSortJs: () => readAsset('update-sort.js'),
    layoutMetricsJs: () => readAsset('layout-metrics.js'),
    avatarShadowJs: () => readAsset('avatar-shadow.js'),
    postTemplate: () => readProjectFile('src', 'template_post.html'),
    indexTemplate: () => readProjectFile('src', 'template_index.html'),
    searchTemplate: () => readProjectFile('src', 'template_index_search.html'),
    headBase: () => readProjectFile('src', 'partials', 'head-base.html'),
    scriptsEnd: () => readProjectFile('src', 'partials', 'scripts-end.html'),
    header: () => readProjectFile('src', 'partials', 'header.html'),
    homeSidebar: () => readProjectFile('src', 'partials', 'home-sidebar.html'),
    transitionsCss: () => readAsset('transitions.css'),
    allTemplate: () => readProjectFile('src', 'template_index_all.html'),
    updateSortControl: () => readProjectFile('src', 'partials', 'update-sort-control.html'),
    aboutTemplate: () => readProjectFile('src', 'template_index_About.html'),
    notFoundTemplate: () => readProjectFile('src', 'template_index_404.html'),
    buildJs: () => readProjectFile('build.js'),
    paginationJs: () => readProjectFile('build', 'pagination.js'),
    seoJs: () => readProjectFile('build', 'seo.js'),
    tailwindBuild: () => readProjectFile('build', 'tailwind.js'),
    fontsJs: () => readProjectFile('build', 'fonts.js'),
    mediaPlayerJs: () => readAsset('media-player.js'),
    mediaPlayerCss: () => readAsset('media-player.css'),
    mediaPlayerTemplateJs: () => readProjectFile('shared', 'media-player-template.js'),
    videoPlayerJs: () => readAsset('video-player.js'),
    videoPlayerCss: () => readAsset('video-player.css'),
    shared: () => require(path.join(projectRoot, 'shared', 'shared.js')),
    postCardTemplate: () => require(path.join(projectRoot, 'shared', 'post-card-template.js')),
    searchCore: () => require(path.join(projectRoot, 'src', 'assets', 'search-core.js')),
    renderPostFontPreloads: () => require(path.join(projectRoot, 'build', 'pages', 'post.js')).renderPostFontPreloads,
    renderPostFontFaceCss: () => require(path.join(projectRoot, 'build', 'pages', 'post.js')).renderPostFontFaceCss,
    renderCopyButton: () => require(path.join(projectRoot, 'build', 'copy-button.js')).renderCopyButton,
    renderPostCardForList: () => require(path.join(projectRoot, 'build', 'pages', 'index.js')).renderPostCardForList,
    generatePaginationHtml: () => require(path.join(projectRoot, 'build', 'pagination.js')).generatePaginationHtml
};

module.exports = { fs, path, readProjectFile, preloadFontHrefs, fontFaceSrcUrls };

for (const [key, load] of Object.entries(lazyEntries)) {
    let loaded = false;
    let cached;
    Object.defineProperty(module.exports, key, {
        enumerable: true,
        get() {
            if (!loaded) {
                cached = load();
                loaded = true;
            }
            return cached;
        }
    });
}
