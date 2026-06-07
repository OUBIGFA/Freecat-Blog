const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const SYSTEM_PYTHON = process.env.PYTHON || 'python';

function runPythonExecutable(executable, rootDir, args) {
    return spawnSync(executable, args, {
        cwd: rootDir,
        encoding: 'utf-8',
        stdio: 'pipe',
        env: {
            ...process.env,
            PYTHONIOENCODING: 'utf-8'
        }
    });
}

function runSystemPython(rootDir, args) {
    return runPythonExecutable(SYSTEM_PYTHON, rootDir, args);
}

function commandOutput(result) {
    return [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
}

function isMissingFontTools(result) {
    return /No module named ['"]fontTools['"]/.test(commandOutput(result));
}

function fontToolsVenvDir(rootDir) {
    return path.join(rootDir, 'node_modules', '.cache', 'freecat-fonttools-venv');
}

function fontToolsPython(rootDir) {
    const venvDir = fontToolsVenvDir(rootDir);
    return process.platform === 'win32'
        ? path.join(venvDir, 'Scripts', 'python.exe')
        : path.join(venvDir, 'bin', 'python');
}

function installFontTools(rootDir) {
    const venvDir = fontToolsVenvDir(rootDir);
    const cacheDir = path.dirname(venvDir);
    const venvPython = fontToolsPython(rootDir);

    fs.mkdirSync(cacheDir, { recursive: true });
    if (!fs.existsSync(venvPython)) {
        const createResult = runSystemPython(rootDir, ['-m', 'venv', venvDir]);
        if (createResult.status !== 0) return createResult;
    }

    return runPythonExecutable(venvPython, rootDir, [
        '-m',
        'pip',
        'install',
        '--disable-pip-version-check',
        '--no-input',
        'fonttools',
        'brotli'
    ]);
}

function useExistingSubsetIfAvailable(rootDir, output) {
    const expectedSubsets = [
        ...[
            'regular',
            'medium',
            'semi-bold',
            'extra-bold'
        ].map(weight => path.join(rootDir, 'src', 'assets', 'fonts', `freecat-ui-noto-sans-sc-${weight}-subset.woff2`)),
        ...[
            'regular',
            'semi-bold',
            'extra-bold'
        ].map(weight => path.join(rootDir, 'src', 'assets', 'fonts', `freecat-figtree-${weight}-subset.woff2`))
    ];

    for (const weight of ['regular', 'medium', 'semi-bold', 'extra-bold']) {
        expectedSubsets.push(path.join(rootDir, 'src', 'assets', 'fonts', `freecat-noto-sans-sc-${weight}-subset.woff2`));
    }

    if (!expectedSubsets.every(file => fs.existsSync(file))) return false;

    console.warn('⚠️ Could not refresh the generated font subsets. Using the existing generated subsets instead.');
    if (output) console.warn(output);
    return true;
}

function buildArticleFontSubset({ rootDir }) {
    const scriptPath = path.join(rootDir, 'tools', 'generate-noto-subset.py');
    const venvPython = fontToolsPython(rootDir);
    let activePython = fs.existsSync(venvPython) ? venvPython : SYSTEM_PYTHON;
    let result = runPythonExecutable(activePython, rootDir, [scriptPath]);

    if (result.status === 0) {
        process.stdout.write(result.stdout);
        if (result.stderr) process.stderr.write(result.stderr);
        return;
    }

    if (isMissingFontTools(result)) {
        console.log('   Python fontTools is missing; installing it into the local build environment...');
        const installResult = installFontTools(rootDir);
        if (installResult.status === 0) {
            activePython = fontToolsPython(rootDir);
            result = runPythonExecutable(activePython, rootDir, [scriptPath]);
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

if (require.main === module) {
    buildArticleFontSubset({ rootDir: path.resolve(__dirname, '..') });
}

module.exports = { buildArticleFontSubset };
