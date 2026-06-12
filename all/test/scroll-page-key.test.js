const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const shared = require('../shared/shared.js');
const { createEngine } = require('../build/template-engine.js');

const { normalizeScrollPageKey } = shared;

// 滚动 key 必须与部署平台无关：Cloudflare Pages 会把 *.html 308 重定向成
// 无后缀路径（/home.html → /home），Vercel 则按原样返回 .html。
// 同一逻辑页面的所有 URL 形态必须归一为同一个 key，
// 否则外壳写入的恢复请求与 iframe 实际地址对不上，返回首页会被重置回顶部。

test('all home aliases normalize to the same scroll key', () => {
    for (const alias of ['/', '/index', '/index.html', '/home', '/home.html']) {
        assert.equal(normalizeScrollPageKey(alias, ''), '/', `${alias} maps to /`);
    }
});

test('cloudflare and vercel url forms of the same page share one scroll key', () => {
    assert.equal(
        normalizeScrollPageKey('/home', ''),
        normalizeScrollPageKey('/home.html', ''),
        'home content key matches across platforms'
    );
    assert.equal(
        normalizeScrollPageKey('/posts/foo', ''),
        normalizeScrollPageKey('/posts/foo.html', ''),
        'post key matches across platforms'
    );
    assert.equal(
        normalizeScrollPageKey('/page/2/', ''),
        normalizeScrollPageKey('/page/2/index.html', ''),
        'directory index key matches across platforms'
    );
});

test('scroll keys keep the query string and distinct pages stay distinct', () => {
    assert.equal(normalizeScrollPageKey('/home.html', '?updateSort=modified'), '/?updateSort=modified');
    assert.equal(normalizeScrollPageKey('/search.html', '?q=cat'), '/search?q=cat');
    assert.notEqual(normalizeScrollPageKey('/posts/foo', ''), normalizeScrollPageKey('/posts/bar', ''));
    assert.equal(normalizeScrollPageKey('/page/2/', ''), '/page/2/', 'extensionless paths pass through');
});

test('inline head guard embeds the exact shared normalizer', () => {
    const engine = createEngine({
        templatesDir: path.join(__dirname, '..', 'src'),
        partialsDir: path.join(__dirname, '..', 'src', 'partials'),
        siteConfig: { site_title: 'FreeCat Blog', site_name: 'FreeCat', site_url: '' },
        seoConfig: { site_language: 'zh-CN' },
        socialConfig: {},
        assetVersion: '',
        tagMenuItemsHtml: ''
    });
    for (const template of ['template_index.html', 'template_post.html', 'template_shell.html']) {
        const html = engine.loadTemplate(template);
        assert.equal(html.includes(normalizeScrollPageKey.toString()), true, `${template} inlines the shared normalizer source`);
        assert.equal(html.includes('var shellRestorePageKey = normalizeScrollPageKey(window.location.pathname, window.location.search);'), true, `${template} derives the guard key from the normalizer`);
    }
});

test('shell cold loads translate their navigation type into the restore handshake', () => {
    const engine = createEngine({
        templatesDir: path.join(__dirname, '..', 'src'),
        partialsDir: path.join(__dirname, '..', 'src', 'partials'),
        siteConfig: { site_title: 'FreeCat Blog', site_name: 'FreeCat', site_url: '' },
        seoConfig: { site_language: 'zh-CN' },
        socialConfig: {},
        assetVersion: '',
        tagMenuItemsHtml: ''
    });
    const html = engine.loadTemplate('template_shell.html');

    // 外壳跨文档返回（bfcache 失效、外站返回、会话恢复）navType=back_forward，
    // 必须在 <head> 解析期写入恢复请求，iframe 内容页加载后才知道要恢复滚动。
    const guardStart = html.indexOf('if (window.__FREECAT_SHELL_DOCUMENT__) {');
    assert.notEqual(guardStart, -1, 'guard has a shell-document branch');
    const shellBranch = html.slice(guardStart, html.indexOf('var hasShellRestoreRequest', guardStart));
    assert.equal(shellBranch.includes("if (navType === 'back_forward')"), true, 'back_forward cold loads write a restore request');
    assert.equal(shellBranch.includes('shellRestoreRequests[shellRestorePageKey] = Date.now();'), true, 'request is keyed by the normalized public path');
    assert.equal(shellBranch.includes("navType === 'navigate' || navType === 'reload'"), true, 'fresh visits clear stale requests for the landing page');
    assert.equal(shellBranch.includes('delete shellRestoreRequests[shellRestorePageKey];'), true, 'stale request removal targets the same key');

    // 守卫写请求必须先于 iframe 创建，否则内容页读不到请求。
    assert.equal(guardStart < html.indexOf('id="freecat-content-frame"'), true, 'shell branch runs before the content iframe is parsed');
    // 外壳自身永不滚动，置顶重置只属于内容页/独立页。
    assert.equal(html.includes('var shouldResetInitialScroll = !window.__FREECAT_SHELL_DOCUMENT__ &&'), true, 'initial scroll reset skips the shell document');
    // 外壳标记脚本必须先于守卫执行，分支判定才可靠。
    assert.equal(html.indexOf('__FREECAT_SHELL_DOCUMENT__ = true') < guardStart, true, 'shell marker is set before the guard reads it');
});
