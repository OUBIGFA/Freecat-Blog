const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 生成 Git 提交时间映射文件
// 这个脚本在构建前运行，生成一个 JSON 文件，包含所有文章的最后提交时间
// 这样 build.js 就不需要在运行时调用 git 命令了

console.log('📅 正在提取 Git 提交时间数据...');

const writingDir = path.join(__dirname, '..', 'writing');
const outputFile = path.join(__dirname, 'git-dates.json');

const gitDates = {};

try {
    // 读取 writing 目录下的所有 .md 文件
    const files = fs.readdirSync(writingDir).filter(f => f.endsWith('.md'));

    console.log(`  找到 ${files.length} 个文章文件`);

    files.forEach(file => {
        const filePath = path.join(writingDir, file);
        const relativeToRoot = path.relative(path.join(__dirname, '..'), filePath);

        try {
            // 获取文件的最后提交时间
            const gitDate = execSync(
                `git log -1 --format=%cI -- "${relativeToRoot}"`,
                {
                    encoding: 'utf-8',
                    cwd: path.join(__dirname, '..'),
                    stdio: ['pipe', 'pipe', 'ignore']
                }
            ).trim();

            if (gitDate) {
                gitDates[file] = gitDate;
                console.log(`    ${file}: ${gitDate}`);
            } else {
                console.log(`    ${file}: 未找到 Git 记录，将使用文件系统时间`);
            }
        } catch (err) {
            console.log(`    ${file}: Git 获取失败，将使用文件系统时间`);
        }
    });

    // 写入 JSON 文件
    fs.writeFileSync(outputFile, JSON.stringify(gitDates, null, 2), 'utf-8');
    console.log(`\n✅ Git 提交时间数据已保存到: ${path.basename(outputFile)}`);
    console.log(`  共提取 ${Object.keys(gitDates).length} 个文件的时间数据\n`);

} catch (err) {
    console.error('❌ 提取 Git 提交时间失败:', err.message);
    // 生成空的 JSON 文件，让构建继续进行
    fs.writeFileSync(outputFile, '{}', 'utf-8');
    console.log('⚠️  已生成空的时间数据文件，将使用文件系统时间作为兜底\n');
}
