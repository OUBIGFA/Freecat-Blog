const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// 只隔离启动时的构建与监听；请求路径解析直接运行预览入口中的实现。
function createResolver() {
    const rootDir = path.join(__dirname, '..');
    const distDir = path.join(rootDir, 'dist');
    const files = new Set([
        'index.html', 'about.html', 'posts/demo/index.html', 'assets/tailwind.css',
        'assets/main.js', 'assets/fonts/freecat-noto-sans-sc-regular-subset.woff2'
    ].map(file => path.join(distDir, file)));
    const context = vm.createContext({
        __dirname: rootDir, URL, process, console,
        require(name) {
            if (name === 'child_process') return { spawnSync: () => ({ status: 0 }) };
            if (name === 'http') return { createServer: () => ({ on() {}, listen() {} }) };
            if (name === 'fs') return { existsSync: file => files.has(file), statSync: () => ({ isFile: () => true }) };
            return require(name);
        }
    });
    vm.runInContext(fs.readFileSync(path.join(rootDir, 'preview.js'), 'utf8'), context);
    return { resolve: context.resolveFilePath, distDir };
}

test('preview rejects malformed URLs without throwing or returning the homepage', () => {
    const { resolve } = createResolver();
    for (const url of ['//[', '/%', '/%E0%A4%A', '/%00', '/assets/%GG']) {
        assert.equal(resolve(url), null, url);
    }
});

test('preview retains homepage, clean URLs, article directories and asset query strings', () => {
    const { resolve, distDir } = createResolver();
    for (const [url, file] of [
        ['/', 'index.html'], ['/about', 'about.html'],
        ['/posts/demo/', 'posts/demo/index.html'], ['/assets/main.js?v=123', 'assets/main.js']
    ]) assert.equal(resolve(url), path.join(distDir, file));
    assert.equal(resolve('/missing'), null);
});
