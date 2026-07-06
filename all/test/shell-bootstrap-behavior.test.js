const test = require('node:test');
const assert = require('node:assert/strict');

const { generateShellBootstrapScript } = require('../build/template-engine.js');

const SHELL_HTML = '<!DOCTYPE html><html><body data-freecat-shell-root="true"><iframe id="freecat-content-frame" src="/home"></iframe></body></html>';
const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/**
 * 在最小浏览器 stub 中执行 SHELL_BOOTSTRAP_SCRIPT，记录副作用。
 * 覆盖真实执行路径：UA 分流 → 路径归一化 → fetch 外壳 → 标记校验 → document.write。
 */
async function runBootstrap({
    userAgent,
    pathname,
    search = '',
    hash = '',
    framed = false,
    shellDocument = false,
    fetchBody = SHELL_HTML,
    fetchOk = true
} = {}) {
    const calls = { fetch: [], writes: [], replaceStates: [] };

    const window = {
        location: { pathname, search, hash },
        __FREECAT_SHELL_DOCUMENT__: shellDocument || undefined
    };
    window.self = window;
    window.top = framed ? {} : window;

    const navigator = { userAgent };
    const history = {
        state: null,
        replaceState(state, title, url) {
            calls.replaceStates.push(url);
        }
    };
    const fetchImpl = (url, options) => {
        calls.fetch.push({ url, options });
        return Promise.resolve({
            ok: fetchOk,
            status: fetchOk ? 200 : 500,
            text: () => Promise.resolve(fetchBody)
        });
    };
    const document = {
        open() { calls.writes.push('open'); },
        write(html) { calls.writes.push(html); },
        close() { calls.writes.push('close'); }
    };

    const script = generateShellBootstrapScript();
    new Function('window', 'navigator', 'history', 'fetch', 'document', script)(
        window, navigator, history, fetchImpl, document
    );

    // fetch → text → write 有两层 promise，flush 两轮微任务
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    return calls;
}

test('crawler user agents stay on the static content page for every path', async () => {
    const crawlerAgents = [
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
        'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
        'Google-InspectionTool/1.0',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36 Chrome-Lighthouse'
    ];

    for (const userAgent of crawlerAgents) {
        for (const pathname of ['/', '/home', '/posts/2026053111535901/']) {
            const calls = await runBootstrap({ userAgent, pathname });
            assert.equal(calls.fetch.length, 0, `${userAgent} on ${pathname} must not fetch the shell`);
            assert.equal(calls.writes.length, 0, `${userAgent} on ${pathname} must not rewrite the document`);
        }
    }
});

test('real browsers on the homepage upgrade to the shell fetched from /shell', async () => {
    const calls = await runBootstrap({ userAgent: CHROME_UA, pathname: '/' });

    assert.equal(calls.fetch.length, 1, 'homepage swaps to the shell for real visitors');
    assert.equal(calls.fetch[0].url, '/shell');
    assert.deepEqual(calls.writes, ['open', SHELL_HTML, 'close']);
});

test('homepage aliases normalize the address to / before the shell swap', async () => {
    for (const pathname of ['/index.html', '/index', '/home.html', '/home']) {
        const calls = await runBootstrap({ userAgent: CHROME_UA, pathname });
        assert.deepEqual(calls.replaceStates, ['/'], `${pathname} normalizes to /`);
        assert.equal(calls.fetch.length, 1);
        assert.equal(calls.fetch[0].url, '/shell');
    }
});

test('real browsers on content pages keep swapping to the shell', async () => {
    const calls = await runBootstrap({ userAgent: CHROME_UA, pathname: '/posts/2026053111535901/' });

    assert.equal(calls.fetch.length, 1);
    assert.equal(calls.fetch[0].url, '/shell');
    assert.equal(calls.replaceStates.length, 0, 'content page URLs stay untouched');
    assert.deepEqual(calls.writes, ['open', SHELL_HTML, 'close']);
});

test('framed documents and the shell itself never re-swap', async () => {
    const framedCalls = await runBootstrap({ userAgent: CHROME_UA, pathname: '/posts/x/', framed: true });
    assert.equal(framedCalls.fetch.length, 0, 'iframe content pages never swap');

    const shellCalls = await runBootstrap({ userAgent: CHROME_UA, pathname: '/', shellDocument: true });
    assert.equal(shellCalls.fetch.length, 0, 'the shell document never swaps itself');
});

test('a fetched document without the shell marker is never written', async () => {
    const calls = await runBootstrap({
        userAgent: CHROME_UA,
        pathname: '/',
        fetchBody: '<!DOCTYPE html><html><body>not the shell</body></html>'
    });

    assert.equal(calls.fetch.length, 1);
    assert.equal(calls.writes.length, 0, 'unmarked responses must not replace the document');
});
