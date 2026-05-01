const fs = require('fs');
const path = require('path');

/**
 * 加载预生成的 Git 提交时间映射（由 extract-git-dates.js 在构建前生成）。
 * 这种"先生成再消费"的方式比运行时调用 git 命令更可靠，尤其是在 CI/CD 平台上。
 *
 * @param {string} jsonPath  git-dates.json 的绝对路径
 * @returns {{ get: (filename: string) => any, raw: object }}
 */
function load(jsonPath) {
    let cache = {};
    try {
        if (fs.existsSync(jsonPath)) {
            cache = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
            console.log(`📅 已加载 ${Object.keys(cache).length} 个文件的 Git 提交时间数据`);
        } else {
            console.log('⚠️  未找到 git-dates.json，将使用文件系统时间');
        }
    } catch (err) {
        console.log('⚠️  读取 git-dates.json 失败，将使用文件系统时间');
    }

    return {
        raw: cache,
        get(filename) {
            return cache[filename] || null;
        }
    };
}

module.exports = { load };
