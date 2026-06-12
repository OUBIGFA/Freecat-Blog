const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const test = require('node:test');
const assert = require('node:assert/strict');

const { createBundler, APP_BUNDLE_URL, POST_BUNDLE_URL, SITE_CSS_BUNDLE_URL, POST_CSS_BUNDLE_URL } = require('../build/bundle.js');
const { createEngine } = require('../build/template-engine.js');

const SRC_DIR = path.join(__dirname, '..', 'src');

function createRealBundler() {
    return createBundler({
        templatesDir: SRC_DIR,
        partialsDir: path.join(SRC_DIR, 'partials'),
        assetsDir: path.join(SRC_DIR, 'assets'),
        sharedDir: path.join(__dirname, '..', 'shared')
    });
}

function createBundledEngine(bundler) {
    return createEngine({
        templatesDir: SRC_DIR,
        partialsDir: path.join(SRC_DIR, 'partials'),
        siteConfig: {
            site_title: 'FreeCat Blog',
            site_name: 'FreeCat',
            site_url: 'https://example.com',
            site_favicon: '/image/freecat.png',
            hero_avatar: '/image/freecat.png'
        },
        seoConfig: { site_language: 'zh-CN' },
        socialConfig: {},
        assetVersion: 'test-version',
        tagMenuItemsHtml: '',
        htmlTransform: bundler.rewriteHtml
    });
}

test('bundler derives script and style order from the declaring templates', () => {
    const bundler = createRealBundler();

    assert.equal(bundler.appScripts[0], '/assets/shared.js', 'shared.js stays first so every module sees FreecatShared');
    assert.equal(bundler.appScripts[bundler.appScripts.length - 1], '/assets/main.js', 'main.js stays last as the composition root');
    assert.ok(bundler.appScripts.indexOf('/assets/post-card-template.js') < bundler.appScripts.indexOf('/assets/search-core.js'),
        'post-card-template loads before search-core which consumes it');

    assert.deepEqual(bundler.postScripts, ['/assets/code-folding.js', '/assets/post.js'], 'post-only scripts come from template_post.html');
    assert.deepEqual(bundler.siteStyles, ['/assets/transitions.css', '/assets/tailwind.css', '/assets/typography.css'], 'site css order comes from head-base.html');
    assert.deepEqual(bundler.postStyles, ['/assets/post.css', '/assets/post-code.css'], 'post css order comes from template_post.html');
});

test('loaded templates reference one app bundle instead of the per-module script list', () => {
    const bundler = createRealBundler();
    const engine = createBundledEngine(bundler);
    const html = engine.loadTemplate('template_index.html');

    assert.equal((html.match(/<script src="\/assets\/freecat-app\.js\?v=test-version" defer><\/script>/g) || []).length, 1,
        'exactly one app bundle script tag');
    assert.match(html, /<script src="\/assets\/freecat-app\.js\?v=test-version" defer><\/script>/, 'bundle reference is cache-versioned');
    for (const url of bundler.appScripts) {
        assert.equal(html.includes(`src="${url}?`), false, `individual reference removed: ${url}`);
    }

    assert.match(html, /<link rel="stylesheet" href="\/assets\/freecat-site\.css\?v=test-version" \/>/, 'site css bundle is referenced and versioned');
    for (const url of bundler.siteStyles) {
        assert.equal(html.includes(`href="${url}?`), false, `individual stylesheet removed: ${url}`);
    }
});

test('post template additionally references the post bundles', () => {
    const bundler = createRealBundler();
    const engine = createBundledEngine(bundler);
    const html = engine.loadTemplate('template_post.html');

    assert.match(html, /<script src="\/assets\/freecat-app\.js\?v=test-version" defer><\/script>/);
    assert.match(html, /<script src="\/assets\/freecat-post\.js\?v=test-version" defer><\/script>/);
    assert.equal(html.includes('src="/assets/code-folding.js?'), false);
    assert.equal(html.includes('src="/assets/post.js?'), false);

    assert.match(html, /<link rel="stylesheet" href="\/assets\/freecat-post\.css\?v=test-version" \/>/);
    assert.equal(html.includes('href="/assets/post.css?'), false);
    assert.equal(html.includes('href="/assets/post-code.css?'), false);

    const appBundleAt = html.indexOf('<script src="/assets/freecat-app.js?v=test-version" defer></script>');
    const postBundleAt = html.indexOf('<script src="/assets/freecat-post.js?v=test-version" defer></script>');
    assert.ok(appBundleAt !== -1 && appBundleAt < postBundleAt, 'post bundle executes after the app bundle it depends on');
    const siteCssAt = html.indexOf('<link rel="stylesheet" href="/assets/freecat-site.css?v=test-version" />');
    const postCssAt = html.indexOf('<link rel="stylesheet" href="/assets/freecat-post.css?v=test-version" />');
    assert.ok(siteCssAt !== -1 && siteCssAt < postCssAt, 'post css cascades after the site css bundle');
});

test('js bundles concatenate every module in declared order', (t) => {
    const bundler = createRealBundler();
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'freecat-bundle-'));
    t.after(() => fs.rmSync(outDir, { recursive: true, force: true }));

    bundler.writeJsBundles(outDir);

    const app = fs.readFileSync(path.join(outDir, path.basename(APP_BUNDLE_URL)), 'utf-8');
    let lastIndex = -1;
    for (const url of bundler.appScripts) {
        const markerIndex = app.indexOf(`/* ===== ${url} ===== */`);
        assert.ok(markerIndex > lastIndex, `${url} appears after its predecessor in the bundle`);
        lastIndex = markerIndex;
    }
    assert.match(app, /root\.FreecatShared = factory\(\)/, 'shared module body is embedded');
    assert.match(app, /requireGlobal\('FreecatShared'\)/, 'composition root body is embedded');

    const post = fs.readFileSync(path.join(outDir, path.basename(POST_BUNDLE_URL)), 'utf-8');
    assert.ok(post.indexOf('/* ===== /assets/code-folding.js ===== */') < post.indexOf('/* ===== /assets/post.js ===== */'),
        'post.js can rely on code-folding.js being defined above it');
});

test('css bundles concatenate stylesheets in cascade order', async (t) => {
    const bundler = createRealBundler();
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'freecat-cssbundle-'));
    t.after(() => fs.rmSync(outDir, { recursive: true, force: true }));

    // 模拟构建末段的 dist/assets：tailwind.css 此时已编译完成
    fs.writeFileSync(path.join(outDir, 'transitions.css'), '.a{color:red}', 'utf-8');
    fs.writeFileSync(path.join(outDir, 'tailwind.css'), '.b{color:green}', 'utf-8');
    fs.writeFileSync(path.join(outDir, 'typography.css'), '.c{color:blue}', 'utf-8');
    fs.writeFileSync(path.join(outDir, 'post.css'), '.d{color:black}', 'utf-8');
    fs.writeFileSync(path.join(outDir, 'post-code.css'), '.e{color:white}', 'utf-8');

    await bundler.writeCssBundles(outDir, { minify: false });

    const site = fs.readFileSync(path.join(outDir, path.basename(SITE_CSS_BUNDLE_URL)), 'utf-8');
    assert.ok(site.indexOf('.a{') < site.indexOf('.b{') && site.indexOf('.b{') < site.indexOf('.c{'),
        'site bundle keeps transitions → tailwind → typography cascade order');

    const post = fs.readFileSync(path.join(outDir, path.basename(POST_CSS_BUNDLE_URL)), 'utf-8');
    assert.ok(post.indexOf('.d{') < post.indexOf('.e{'), 'post bundle keeps post → post-code cascade order');
});
