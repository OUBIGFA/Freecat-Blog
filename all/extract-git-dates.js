const fs = require('fs');
const path = require('path');
const { collect } = require('./build/git-dates.js');

/**
 * 生成 git-dates.json 快照。
 *
 * 注意：从 v2 起，build.js 已不再依赖此快照——它会在每次 build 时
 * 直接从 git 实时提取提交时间。本脚本仅保留为：
 *   1. 调试 / 排查用（人类可读地查看每篇文章的最后提交时间）；
 *   2. 在 git 不可用环境（如某些 serverless build runner）作为兜底输入。
 *
 * 这里直接复用 build/git-dates.js 中的 collect() 实现，
 * 避免出现"提取脚本"与"构建消费侧"两条并行逻辑导致的不一致。
 */

console.log('📅 正在提取 Git 提交时间数据...');

const repoRoot = path.join(__dirname, '..');
const postsDir = path.join(repoRoot, 'writing');
const outputFile = path.join(__dirname, 'git-dates.json');

const dates = collect({ repoRoot, postsDir });

if (dates.source !== 'git') {
    console.error('❌ 无法访问 git，提取中止。');
    process.exit(1);
}

fs.writeFileSync(outputFile, JSON.stringify(dates.raw, null, 2), 'utf-8');
console.log(`\n✅ Git 提交时间数据已保存到: ${path.basename(outputFile)}`);
console.log(`  共提取 ${Object.keys(dates.raw).length} 个文件的时间数据\n`);
