/**
 * 开发模式：监听源文件变化触发 rebuild。
 *
 * 设计：
 *   - 第一次启动先 NO_MINIFY=1 跑一次 build（构建期短）
 *   - 然后用 fs.watch 监听 ../writing、../Control、./src、./build、./build.js
 *   - 200ms debounce，合并同一批改动只触发一次 rebuild
 *   - rebuild 失败不退出 watch，方便开发期反复改
 *
 * 启动：node dev.js  （或 npm run dev）
 * 关闭：Ctrl+C
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = __dirname;
const watchTargets = [
    path.join(root, '..', 'writing'),
    path.join(root, '..', 'Control'),
    path.join(root, 'src'),
    path.join(root, 'build'),
    path.join(root, 'build.js')
];

let pending = null;
let running = null;

function runBuild() {
    if (running) {
        // 当前 build 还在跑，标记一下让它结束后再触发一次
        pending = pending || setTimeout(() => { pending = null; runBuild(); }, 50);
        return;
    }
    const child = spawn(process.execPath, [path.join(root, 'build.js')], {
        stdio: 'inherit',
        env: { ...process.env, NO_MINIFY: '1' }
    });
    running = child;
    const start = Date.now();
    child.on('exit', (code) => {
        running = null;
        const dur = ((Date.now() - start) / 1000).toFixed(2);
        console.log(`\n⏱️  build ${code === 0 ? 'ok' : `failed (code ${code})`} in ${dur}s\n`);
    });
}

function watchTarget(target) {
    if (!fs.existsSync(target)) return;
    const stat = fs.statSync(target);
    const opts = { recursive: stat.isDirectory() };
    try {
        fs.watch(target, opts, (event, filename) => {
            if (filename && filename.endsWith('.tmp')) return;
            schedule();
        });
        console.log(`👀 watching: ${path.relative(root, target) || '.'}`);
    } catch (err) {
        console.warn(`⚠️  fs.watch failed for ${target}: ${err.message}`);
    }
}

let debounceTimer = null;
function schedule() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        debounceTimer = null;
        runBuild();
    }, 200);
}

console.log('🔁 dev mode: building + watching...\n');
runBuild();
watchTargets.forEach(watchTarget);

process.on('SIGINT', () => {
    if (running) running.kill();
    process.exit(0);
});
