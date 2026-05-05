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

function ensureCleanDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        return;
    }

    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
        fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
    }
}

module.exports = { copyDir, ensureCleanDir };
