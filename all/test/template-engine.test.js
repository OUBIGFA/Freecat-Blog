const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { createEngine } = require('../build/template-engine.js');
const shared = require('../shared/shared.js');

function preloadFontHrefs(source) {
    return [...source.matchAll(/<link\s+rel="preload"\s+href="([^"]+)"\s+as="font"\s+type="font\/woff2"\s+crossorigin\s*\/?>/g)]
        .map(match => match[1]);
}

function fontFaceSrcUrls(source) {
    return [...source.matchAll(/src:\s*url\("([^"]+)"\)\s*format\("woff2"\)/g)]
        .map(match => match[1]);
}

function createTestEngine(siteUrl, options = {}) {
    return createEngine({
        templatesDir: path.join(__dirname, '..', 'src'),
        partialsDir: path.join(__dirname, '..', 'src', 'partials'),
        siteConfig: {
            site_title: 'FreeCat Blog',
            site_name: 'FreeCat',
            site_url: siteUrl || '',
            site_favicon: '/image/freecat.png',
            hero_avatar: '/image/freecat.png',
            ...(options.siteConfig || {})
        },
        seoConfig: { site_language: 'zh-CN' },
        socialConfig: options.socialConfig || {},
        assetVersion: options.assetVersion || '',
        tagMenuItemsHtml: options.tagMenuItemsHtml || ''
    });
}

test('discovery links are omitted when site_url is empty', () => {
    const engine = createTestEngine('');
    const html = engine.applySiteConfig('<!-- DISCOVERY_LINKS -->');
    const indexHtml = engine.loadTemplate('template_index.html');
    const postHtml = engine.loadTemplate('template_post.html');

    assert.equal(html, '');
    assert.equal(indexHtml.includes('feed.xml'), false);
    assert.equal(indexHtml.includes('opensearch.xml'), false);
    assert.equal(postHtml.includes('feed.xml'), false);
    assert.equal(postHtml.includes('opensearch.xml'), false);
});

test('discovery links are included when site_url is configured', () => {
    const html = createTestEngine('https://example.com').loadTemplate('template_index.html');

    assert.equal(html.includes('type="application/rss+xml"'), true);
    assert.equal(html.includes('type="application/opensearchdescription+xml"'), true);
});

test('tag labels are escaped by default', () => {
    const html = shared.renderTagSpan('<img src=x onerror=alert(1)>');

    assert.equal(html.includes('<img src=x'), false);
    assert.equal(html.includes('&lt;img src=x onerror=alert(1)&gt;'), true);
});

test('tag click query is pre-encoded for inline handlers', () => {
    const html = shared.renderTagSpan("x');alert(1);//");

    assert.equal(html.includes("x');alert(1);//"), false);
    assert.equal(html.includes('x%27)%3Balert(1)%3B%2F%2F'), true);
    assert.equal(html.includes('window.FreecatNavigate'), true);
    assert.equal(html.includes("window.location.href='/search.html?tag=x%27)%3Balert(1)%3B%2F%2F'"), true);
});

test('404 template includes the theme bootstrap only once', () => {
    const html = createTestEngine('https://example.com').loadTemplate('template_index_404.html');
    const count = (html.match(/localStorage\.getItem\('theme'\)/g) || []).length;

    assert.equal(count, 1);
});

test('content templates include the shell bootstrap for direct clean URLs', () => {
    const engine = createTestEngine('https://example.com');
    const indexHtml = engine.loadTemplate('template_index.html');
    const postHtml = engine.loadTemplate('template_post.html');

    for (const html of [indexHtml, postHtml]) {
        assert.equal(html.includes('window.__FREECAT_SHELL_DOCUMENT__'), true);
        assert.equal(html.includes("fetch('/', { credentials: 'same-origin' })"), true);
        assert.equal(html.includes('id="freecat-content-frame"'), true);
        assert.equal(html.includes('document.write(htmlText)'), true);
    }
});

test('browser platform and theme modules load before main script', () => {
    const html = createTestEngine('https://example.com').loadTemplate('template_index.html');
    const sharedIndex = html.indexOf('/assets/shared.js');
    const platformIndex = html.indexOf('/assets/browser-platform.js');
    const themeIndex = html.indexOf('/assets/theme-system.js');
    const lazyImageIndex = html.indexOf('/assets/lazy-images.js');
    const mainIndex = html.indexOf('/assets/main.js');

    assert.ok(sharedIndex > -1);
    assert.ok(platformIndex > sharedIndex);
    assert.ok(themeIndex > platformIndex);
    assert.ok(lazyImageIndex > themeIndex);
    assert.ok(mainIndex > lazyImageIndex);
});

test('shell template marks itself and keeps direct paths clean', () => {
    const html = createTestEngine('https://example.com').loadTemplate('template_shell.html');

    assert.equal(html.includes('window.__FREECAT_SHELL_DOCUMENT__ = true'), true);
    assert.equal(html.includes("history.replaceState(history.state, '', raw)"), true);
    assert.equal(html.includes("url.pathname === '/home.html'"), true);
    assert.equal(html.includes('window.location.hash'), true);
});

test('404 page uses root asset paths so nested missing URLs render correctly', () => {
    const html = createTestEngine('https://example.com').loadTemplate('template_index_404.html');

    assert.equal(html.includes('href="./assets/'), false);
    assert.equal(html.includes('src="./assets/'), false);
    assert.equal(html.includes('href="/assets/tailwind.css'), true);
    assert.equal(html.includes('src="/assets/main.js'), true);
});

test('root asset urls receive the build asset version', () => {
    const html = createTestEngine('https://example.com', { assetVersion: 'test-version' }).loadTemplate('template_post.html');

    assert.equal(html.includes('href="/assets/post.css?v=test-version"'), true);
    assert.equal(html.includes('href="/assets/tailwind.css?v=test-version"'), true);
    assert.equal(html.includes('src="/assets/main.js?v=test-version"'), true);
});

test('shared font preloads and font faces use the same versioned urls', () => {
    const html = createTestEngine('https://example.com', { assetVersion: 'test-version' }).loadTemplate('template_index.html');
    const preloads = new Set(preloadFontHrefs(html));
    const fontFaces = new Set(fontFaceSrcUrls(html));

    assert.deepEqual(preloads, fontFaces);
    assert.equal([...preloads].every(href => href.endsWith('?v=test-version')), true);
});

test('theme bootstrap prevents initial restored scroll on normal entry and reload', () => {
    const html = createTestEngine('https://example.com').loadTemplate('template_index.html');

    assert.equal(html.includes("navType === 'navigate' || navType === 'reload'"), true);
    assert.equal(html.includes("history.scrollRestoration = 'manual'"), true);
    assert.equal(html.includes('window.scrollTo(0, 0)'), true);
});

test('theme bootstrap keeps shell back restoration from being reset to top', () => {
    const html = createTestEngine('https://example.com').loadTemplate('template_index.html');

    assert.equal(html.includes("sessionStorage.getItem('freecat-scroll-restore-requests-v1')"), true);
    assert.equal(html.includes("new URLSearchParams(window.location.search).get('updateSort') === 'modified'"), true);
    assert.equal(html.includes("document.documentElement.classList.add('freecat-state-restore-pending')"), true);
    assert.equal(html.includes('var hasShellRestoreRequest = !!(shellRestoreRequests && shellRestoreRequests[shellRestorePageKey]);'), true);
    assert.equal(html.includes('!hasShellRestoreRequest && (!navType || navType ==='), true);
});

test('theme bootstrap does not reset scroll after user starts scrolling', () => {
    const html = createTestEngine('https://example.com').loadTemplate('template_post.html');

    assert.equal(html.includes('var userScrollIntent = false'), true);
    assert.equal(html.includes('var cancelInitialScrollReset = function ()'), true);
    assert.equal(html.includes('if (userScrollIntent) return;'), true);
    assert.equal(html.includes("window.addEventListener('wheel', cancelInitialScrollReset, { passive: true })"), true);
    assert.equal(html.includes("window.addEventListener('touchstart', cancelInitialScrollReset, { passive: true })"), true);
    assert.equal(html.includes("window.addEventListener('pointerdown', cancelInitialScrollReset, { passive: true })"), true);
    assert.equal(html.includes("window.addEventListener('keydown', cancelInitialScrollReset)"), true);
});

test('theme bootstrap keeps hash targets eligible for native anchor scrolling', () => {
    const html = createTestEngine('https://example.com').loadTemplate('template_index.html');

    assert.equal(html.includes('window.location.hash'), true);
    assert.equal(html.includes('!hasAnchorTarget'), true);
});

test('relative RSS social link is hidden when site_url is empty', () => {
    const html = createTestEngine('', {
        socialConfig: {
            rss_enabled: true,
            rss_url: '/feed.xml',
            rss_icon: '<svg></svg>'
        }
    }).applySiteConfig('<!-- SOCIAL_LINKS -->');

    assert.equal(html.includes('/feed.xml'), false);
});

test('relative RSS social link is shown when site_url is configured', () => {
    const html = createTestEngine('https://example.com', {
        socialConfig: {
            rss_enabled: true,
            rss_url: '/feed.xml',
            rss_icon: '<svg></svg>'
        }
    }).applySiteConfig('<!-- SOCIAL_LINKS -->');

    assert.equal(html.includes('/feed.xml'), true);
});

test('external RSS social link is shown without site_url', () => {
    const html = createTestEngine('', {
        socialConfig: {
            rss_enabled: true,
            rss_url: 'https://feeds.example.com/freecat.xml',
            rss_icon: '<svg></svg>'
        }
    }).applySiteConfig('<!-- SOCIAL_LINKS -->');

    assert.equal(html.includes('https://feeds.example.com/freecat.xml'), true);
});

test('collectMenuTags counts tags, sorts by frequency then name, and tracks untagged', () => {
    const posts = [
        { tags: ['JS', 'CSS'] },
        { tags: 'js' },          // 大小写归一 + 字符串形式
        { tags: ['CSS'] },
        { tags: [] },            // 未打标签
        { tags: null }           // 未打标签
    ];
    const list = shared.collectMenuTags(posts);

    // 未打标签固定置顶
    assert.equal(list[0].untagged, true);
    assert.equal(list[0].count, 2);
    // js 出现 2 次（含字符串那篇），css 出现 2 次；同频按名称升序：css → js
    const tagged = list.filter(t => !t.untagged);
    assert.deepEqual(tagged.map(t => t.label), ['CSS', 'JS']);
    assert.equal(tagged[0].count, 2);
    assert.equal(tagged[1].count, 2);
});

test('collectMenuTags puts English labels before Chinese labels when counts match', () => {
    const list = shared.collectMenuTags([
        { tags: ['生活'] },
        { tags: ['Alpha'] },
        { tags: ['工具'] },
        { tags: ['Beta'] }
    ]);

    assert.deepEqual(list.map(t => t.label), ['Alpha', 'Beta', '工具', '生活']);
});

test('normalizeTagKey keeps tag matching consistent across menu and search page', () => {
    assert.equal(shared.normalizeTagKey('  JavaScript  '), 'javascript');
    assert.equal(shared.normalizeTagKey(null), '');
});

test('renderTagMenuItemsHtml escapes labels, encodes hrefs and renders counts', () => {
    const html = shared.renderTagMenuItemsHtml(shared.collectMenuTags([
        { tags: ['<b>x</b>'] }
    ]));

    assert.equal(html.includes('class="tag-menu-item'), true);
    assert.equal(html.includes('--tag-menu-index:0;'), true);
    assert.equal(html.includes('<b>x</b>'), false);              // 标签文本被转义
    assert.equal(html.includes('&lt;b&gt;x&lt;/b&gt;'), true);
    assert.equal(html.includes('tag=%3Cb%3Ex%3C%2Fb%3E'), true); // href 编码
});

test('renderTagMenuItemsHtml falls back to empty hint when no tags', () => {
    assert.equal(shared.renderTagMenuItemsHtml([]).includes('No tags yet'), true);
});

test('engine pre-renders tag menu items into the header placeholder', () => {
    const tagMenuItemsHtml = shared.renderTagMenuItemsHtml(shared.collectMenuTags([
        { tags: ['Alpha'] }
    ]));
    const html = createTestEngine('https://example.com', { tagMenuItemsHtml })
        .loadTemplate('template_index.html');

    assert.equal(html.includes('<!-- TAG_MENU_ITEMS -->'), false); // 占位符已被替换
    assert.equal(html.includes('class="tag-menu-item'), true);     // 标签项已预渲染进页面
    assert.equal(html.includes('Loading tags...'), false);         // 不再有加载占位
});

test('nav audio button is omitted when nav_audio is empty', () => {
    const html = createTestEngine('https://example.com').loadTemplate('template_index.html');

    assert.equal(html.includes('id="nav-audio-toggle"'), false);
    assert.equal(html.includes('id="nav-audio"'), false);
});

test('nav audio button renders before search button for image-style audio config', () => {
    const html = createTestEngine('https://example.com', {
        siteConfig: {
            nav_audio: '![🎵中医为何难过科学关](https://lz.qaiu.top/parser?url=https://share.feijipan.com/s/aOWQf7va)',
            nav_audio_autoplay: true
        }
    }).loadTemplate('template_index.html');

    assert.equal(html.includes('id="nav-audio-toggle"'), true);
    assert.equal(html.includes('id="nav-audio-control"'), true);
    assert.equal(html.includes('id="nav-audio-volume"'), true);
    assert.equal(html.includes('value="0.5"'), true);
    assert.equal(html.includes('data-audio-src="https://lz.qaiu.top/parser?url=https://share.feijipan.com/s/aOWQf7va"'), true);
    assert.equal(html.includes('data-audio-title="中医为何难过科学关"'), true);
    assert.equal(html.includes('data-audio-autoplay="true"'), true);
    assert.ok(html.indexOf('id="nav-audio-toggle"') < html.indexOf('id="search-toggle"'));
});

test('nav audio button renders comma-separated audio playlist', () => {
    const html = createTestEngine('https://example.com', {
        siteConfig: {
            nav_audio: [
                '![🎵 First](https://example.com/listen?id=1)',
                '![🎵 Second](https://example.com/listen?id=2)'
            ].join(',')
        }
    }).loadTemplate('template_index.html');

    assert.equal(html.includes('data-audio-src="https://example.com/listen?id=1"'), true);
    assert.equal(html.includes('data-audio-title="First"'), true);
    assert.equal(html.includes('data-audio-playlist="'), true);
    assert.equal(html.includes('&quot;src&quot;:&quot;https://example.com/listen?id=1&quot;'), true);
    assert.equal(html.includes('&quot;src&quot;:&quot;https://example.com/listen?id=2&quot;'), true);
    assert.equal(html.includes('&quot;title&quot;:&quot;Second&quot;'), true);
});

test('nav audio normalizes feijipan share pages to playable parser urls', () => {
    const html = createTestEngine('https://example.com', {
        siteConfig: {
            nav_audio: '![🎵 First](https://share.feijipan.com/s/gmbl4ECj)'
        }
    }).loadTemplate('template_index.html');

    const parserUrl = 'https://lz.qaiu.top/parser?url=https%3A%2F%2Fshare.feijipan.com%2Fs%2Fgmbl4ECj';
    assert.equal(html.includes(`data-audio-src="${parserUrl}"`), true);
    assert.equal(html.includes('&quot;src&quot;:&quot;' + parserUrl + '&quot;'), true);
});
