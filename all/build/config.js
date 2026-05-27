const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

/**
 * 在 Control 目录中按关键字查找配置文件。返回第一个文件名（小写）含关键字且以 .md 结尾的文件路径。
 * 找不到时返回 null（调用方决定使用默认值）。
 */
function findConfigPath(controlDir, keyword) {
    if (!fs.existsSync(controlDir)) return null;
    const files = fs.readdirSync(controlDir);
    const match = files.find(f =>
        f.toLowerCase().includes(keyword.toLowerCase()) && f.endsWith('.md')
    );
    return match ? path.join(controlDir, match) : null;
}

/**
 * 解析无 frontmatter 的 key: value 配置。空行/注释跳过；
 * "true"/"false" 自动转 boolean，纯数字自动转 Number；
 * 以下划线开头的 key 视为注释跳过。
 */
function parseLooseConfig(raw) {
    const data = {};
    const lines = String(raw || '').split(/\r?\n/);

    for (const line of lines) {
        if (!line.trim()) continue;
        const separatorIndex = line.indexOf(':');
        if (separatorIndex <= 0) continue;

        const key = line.slice(0, separatorIndex).trim();
        if (!key || key.startsWith('_')) continue;

        let value = line.slice(separatorIndex + 1).trim();
        if (/^(true|false)$/i.test(value)) {
            value = value.toLowerCase() === 'true';
        } else if (/^-?\d+(\.\d+)?$/.test(value)) {
            value = Number(value);
        }

        data[key] = value;
    }

    return data;
}

/**
 * 加载某个 Control 配置文件并 merge 到 defaults 上。
 *   - 优先按 YAML frontmatter 解析；
 *   - frontmatter 为空则按 key:value 宽松解析；
 *   - 文件不存在则直接返回 defaults。
 *
 * @param {string} controlDir  Control 目录绝对路径
 * @param {string} keyword     匹配文件名的关键字（如 "site"）
 * @param {string} label       日志标签（仅控制台输出用）
 * @param {object} defaults    默认配置对象
 */
function loadConfig(controlDir, keyword, label, defaults) {
    const configPath = findConfigPath(controlDir, keyword);
    let result = { ...defaults };

    if (configPath) {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const { data } = matter(raw);
        const fallbackData = Object.keys(data).length ? {} : parseLooseConfig(raw);
        result = { ...result, ...data, ...fallbackData };
        console.log(`  Loaded configuration from: ${path.basename(configPath)}`);
    } else {
        console.log(`  ${label} not found, using defaults`);
    }

    return result;
}

module.exports = { loadConfig };
