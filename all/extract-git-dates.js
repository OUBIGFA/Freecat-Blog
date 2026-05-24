const fs = require('fs');
const path = require('path');
const { collectFromGit, collectPublishDates, loadSnapshot } = require('./build/git-dates.js');

console.log('Extracting article date snapshots...');

const repoRoot = path.join(__dirname, '..');
const postsDir = path.join(repoRoot, 'writing');
const datesFile = path.join(__dirname, 'git-dates.json');

const dates = collectFromGit({ repoRoot, postsDir, fallbackMissingToFileStat: true });
const sorted = Object.fromEntries(
    Object.entries(dates.raw).sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN'))
);

const existingPublishDates = loadSnapshot({
    snapshotPath: datesFile,
    required: false,
    label: 'post publish date',
    section: 'published'
}).raw;
const publishDates = collectPublishDates({ repoRoot, postsDir, existing: existingPublishDates });
const sortedPublishDates = Object.fromEntries(
    Object.entries(publishDates.raw).sort(([a], [b]) => a.localeCompare(b, 'zh-Hans-CN'))
);

fs.writeFileSync(datesFile, `${JSON.stringify({
    modified: sorted,
    published: sortedPublishDates
}, null, 2)}\n`, 'utf-8');

console.log(`Saved ${Object.keys(sorted).length} article modified dates to ${path.basename(datesFile)}.`);
console.log(`Saved ${Object.keys(sortedPublishDates).length} article publish dates to ${path.basename(datesFile)}.`);
