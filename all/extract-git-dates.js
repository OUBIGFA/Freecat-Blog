const fs = require('fs');
const path = require('path');
const { collectFromGit } = require('./build/git-dates.js');

console.log('Extracting article modified dates from Git history...');

const repoRoot = path.join(__dirname, '..');
const postsDir = path.join(repoRoot, 'writing');
const outputFile = path.join(__dirname, 'git-dates.json');

const dates = collectFromGit({ repoRoot, postsDir });
const sorted = Object.fromEntries(
    Object.entries(dates.raw).sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN'))
);

fs.writeFileSync(outputFile, `${JSON.stringify(sorted, null, 2)}\n`, 'utf-8');

console.log(`Saved ${Object.keys(sorted).length} article modified dates to ${path.basename(outputFile)}.`);
