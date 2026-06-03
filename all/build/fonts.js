const path = require('path');
const { spawnSync } = require('child_process');

function buildArticleFontSubset({ rootDir }) {
    const scriptPath = path.join(rootDir, 'tools', 'generate-noto-subset.py');
    const result = spawnSync('python', [scriptPath], {
        cwd: rootDir,
        encoding: 'utf-8',
        stdio: 'pipe'
    });

    if (result.status === 0) {
        process.stdout.write(result.stdout);
        if (result.stderr) process.stderr.write(result.stderr);
        return;
    }

    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(
        'Could not generate the article Chinese font subset. ' +
        'Install Python fontTools and brotli, then run npm run fonts:subset.\n' +
        output
    );
}

module.exports = { buildArticleFontSubset };
