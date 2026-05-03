const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Git 提交时间数据源
 *
 * 设计目标：构建时即时、可靠地拿到每篇文章的最后提交时间，
 * 避免之前"先 npm run extract-dates 生成快照、再 npm run build 消费"
 * 流程导致的快照过期问题（编辑 → 提交 → build 仍显示旧时间）。
 *
 * 工作流程：
 *   1. 优先：直接对目标目录跑一次 `git log`，解析出 file → 最新提交时间映射；
 *   2. 兜底：git 不可用 / 仓库 / 浅克隆等场景下，尝试读取已有的 git-dates.json；
 *   3. 最终兜底：调用方在 get(file) 拿不到时回落到 fs.statSync(mtime)。
 */

/**
 * 用单次 `git log` 解析出 <相对路径, ISO 时间> 映射。
 * 由于 git log 默认按时间倒序输出，每个文件第一次出现的就是最新提交时间。
 *
 * @param {string} repoRoot     git 仓库根目录
 * @param {string} targetDir    需要扫描的子目录的相对路径（相对于 repoRoot）
 * @returns {Object<string,string>}  key 是相对于 repoRoot 的路径
 */
function extractFromGit(repoRoot, targetDir) {
    const map = {};

    // -c core.quotepath=false 让中文文件名直接输出，不会被转义为 \xxx
    // --no-renames 关闭重命名跟踪，避免拿到旧路径
    // 自定义分隔符 "@@COMMIT@@" 可靠地区分每条 commit 记录
    const cmd = `git -c core.quotepath=false log --no-renames --name-only --pretty=format:"@@COMMIT@@%cI" -- "${targetDir}"`;

    let output;
    try {
        output = execSync(cmd, {
            encoding: 'utf-8',
            cwd: repoRoot,
            stdio: ['pipe', 'pipe', 'pipe'],
            maxBuffer: 32 * 1024 * 1024
        });
    } catch (err) {
        throw new Error(`git log failed: ${err.message}`);
    }

    // 输出形如：
    //   @@COMMIT@@2025-05-03T10:28:33+08:00
    //   writing/A.md
    //   writing/B.md
    //   @@COMMIT@@2025-05-02T12:14:21+08:00
    //   writing/C.md
    const blocks = output.split('@@COMMIT@@').filter(Boolean);
    for (const block of blocks) {
        const lines = block.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        if (lines.length === 0) continue;
        const ts = lines[0];
        for (let i = 1; i < lines.length; i++) {
            const file = lines[i];
            // git log 倒序输出，第一次见到的时间即最新提交时间
            if (!map[file]) map[file] = ts;
        }
    }

    return map;
}

/**
 * 在构建期即时收集 git 提交时间。
 *
 * @param {object}  opts
 * @param {string}  opts.repoRoot       git 仓库根目录（绝对路径）
 * @param {string}  opts.postsDir       文章目录（绝对路径）
 * @param {string} [opts.fallbackJson]  可选的 JSON 兜底文件路径（仅在 git 失败时使用）
 * @returns {{ get: (filename: string) => string|null, raw: object, source: string }}
 */
function collect({ repoRoot, postsDir, fallbackJson }) {
    const postsDirRelToRepo = path.relative(repoRoot, postsDir).replace(/\\/g, '/');

    // 1) 主路径：直接从 git log 提取
    try {
        const gitMap = extractFromGit(repoRoot, postsDirRelToRepo);

        // 把 "writing/A.md" 这种相对路径，归一化到 build 流水线消费侧用的 "A.md"（仅文件名）
        const cache = {};
        for (const [relPath, ts] of Object.entries(gitMap)) {
            const filename = path.posix.basename(relPath);
            // 同名时取更新的时间（理论上不会冲突，因为 git log 已经是按时间倒序）
            if (!cache[filename]) cache[filename] = ts;
        }

        const count = Object.keys(cache).length;
        console.log(`📅 已从 git 实时提取 ${count} 个文件的最后提交时间`);

        return {
            raw: cache,
            source: 'git',
            get(filename) {
                return cache[filename] || null;
            }
        };
    } catch (err) {
        console.log(`⚠️  无法从 git 实时提取提交时间（${err.message}），尝试 JSON 兜底`);
    }

    // 2) 兜底路径：读取预生成的 JSON（如果有）
    let cache = {};
    if (fallbackJson && fs.existsSync(fallbackJson)) {
        try {
            cache = JSON.parse(fs.readFileSync(fallbackJson, 'utf-8'));
            console.log(`📅 已从 ${path.basename(fallbackJson)} 加载 ${Object.keys(cache).length} 个文件的提交时间`);
        } catch (err) {
            console.log(`⚠️  读取 ${path.basename(fallbackJson)} 失败：${err.message}`);
        }
    } else {
        console.log('⚠️  未找到 git-dates.json 兜底文件，将完全依赖文件系统 mtime');
    }

    return {
        raw: cache,
        source: 'json',
        get(filename) {
            return cache[filename] || null;
        }
    };
}

/**
 * 兼容旧 API：仅从 JSON 加载（保留给可能直接调用的脚本使用）。
 * 新代码请使用 collect()。
 */
function load(jsonPath) {
    let cache = {};
    try {
        if (fs.existsSync(jsonPath)) {
            cache = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
            console.log(`📅 已加载 ${Object.keys(cache).length} 个文件的 Git 提交时间数据（来自 JSON 快照）`);
        } else {
            console.log('⚠️  未找到 git-dates.json，将使用文件系统时间');
        }
    } catch (err) {
        console.log('⚠️  读取 git-dates.json 失败，将使用文件系统时间');
    }

    return {
        raw: cache,
        source: 'json',
        get(filename) {
            return cache[filename] || null;
        }
    };
}

module.exports = { collect, load, extractFromGit };
