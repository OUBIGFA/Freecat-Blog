const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

function runPython(rootDir, args) {
    return spawnSync('python', args, {
        cwd: rootDir,
        encoding: 'utf-8',
        stdio: 'pipe',
        env: {
            ...process.env,
            PYTHONIOENCODING: 'utf-8'
        }
    });
}

function commandOutput(result) {
    return [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
}

function isMissingFontTools(result) {
    return /No module named ['"]fontTools['"]/.test(commandOutput(result));
}

function installFontTools(rootDir) {
    return runPython(rootDir, [
        '-m',
        'pip',
        'install',
        '--user',
        '--disable-pip-version-check',
        '--no-input',
        'fonttools',
        'brotli'
    ]);
}

function useExistingSubsetIfAvailable(rootDir, output) {
    const expectedSubsets = [
        ...[
            'thin',
            'extra-light',
            'light',
            'regular',
            'medium',
            'semi-bold',
            'bold',
            'extra-bold',
            'black'
        ].map(weight => path.join(rootDir, 'src', 'assets', 'fonts', `freecat-noto-sans-sc-${weight}-subset.woff2`)),
        ...[
            'regular',
            'medium',
            'extra-bold'
        ].map(weight => path.join(rootDir, 'src', 'assets', 'fonts', `freecat-figtree-${weight}-subset.woff2`))
    ];

    if (!expectedSubsets.every(file => fs.existsSync(file))) return false;

    console.warn('⚠️ Could not refresh the article Chinese font subset. Using the existing generated subset instead.');
    if (output) console.warn(output);
    return true;
}

function buildArticleFontSubset({ rootDir }) {
    const scriptPath = path.join(rootDir, 'tools', 'generate-noto-subset.py');
    let result = runPython(rootDir, [scriptPath]);

    if (result.status === 0) {
        process.stdout.write(result.stdout);
        if (result.stderr) process.stderr.write(result.stderr);
        return;
    }

    if (isMissingFontTools(result)) {
        console.log('   Python fontTools is missing; installing it for this build...');
        const installResult = installFontTools(rootDir);
        if (installResult.status === 0) {
            result = runPython(rootDir, [scriptPath]);
            if (result.status === 0) {
                process.stdout.write(result.stdout);
                if (result.stderr) process.stderr.write(result.stderr);
                return;
            }
        } else if (useExistingSubsetIfAvailable(rootDir, commandOutput(installResult))) {
            return;
        }
    }

    const output = commandOutput(result);
    if (useExistingSubsetIfAvailable(rootDir, output)) return;

    throw new Error(
        'Could not generate the article Chinese font subset. ' +
        'Install Python fontTools and brotli, then run npm run fonts:subset.\n' +
        output
    );
}

module.exports = { buildArticleFontSubset };
