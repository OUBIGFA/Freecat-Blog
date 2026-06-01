const fs = require('fs');
const path = require('path');

function copyDir(src, dest, options = {}) {
    const ignore = new Set(options.ignore || []);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        if (ignore.has(entry.name)) continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) copyDir(srcPath, destPath, options);
        else fs.copyFileSync(srcPath, destPath);
    }
}

function assertSafeCleanDirTarget(dir, options = {}) {
    const resolved = path.resolve(dir);
    const allowedName = options.allowedName || 'dist';

    if (path.basename(resolved) !== allowedName) {
        throw new Error(`Refusing to clean unexpected directory: ${resolved}`);
    }

    if (options.within) {
        const root = path.resolve(options.within);
        const relative = path.relative(root, resolved);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
            throw new Error(`Refusing to clean directory outside ${root}: ${resolved}`);
        }
    }

    if (resolved === path.parse(resolved).root) {
        throw new Error(`Refusing to clean filesystem root: ${resolved}`);
    }
}

function ensureCleanDir(dir, options = {}) {
    assertSafeCleanDirTarget(dir, options);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        return;
    }

    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
        fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
    }
}

module.exports = { copyDir, ensureCleanDir, assertSafeCleanDirTarget };
