const fs = require('node:fs');
const path = require('node:path');
const { escapeHtml } = require('../shared/shared.js');

// Tabler Icons / MIT, revision 74929e50416e2b7c0abb8368cdc74bdcb2560ab6.
// https://github.com/tabler/tabler-icons — license ships beside the local SVG files.
// Build-time inlining keeps header/footer icons independent of CDN or runtime requests.
const iconCache = new Map();

function renderIcon(name, className = '') {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) throw new Error(`Invalid icon name: ${name}`);
    if (!iconCache.has(name)) {
        const source = fs.readFileSync(path.join(__dirname, '../src/assets/icons/tabler', `${name}.svg`), 'utf8');
        iconCache.set(name, source.replace(/<!--[\s\S]*?-->/g, '').trim()
            .replace(/\bwidth="24"/, 'width="20"')
            .replace(/\bheight="24"/, 'height="20"'));
    }
    const classAttribute = className ? ` class="${escapeHtml(className)}"` : '';
    return iconCache.get(name).replace('<svg', `<svg aria-hidden="true" focusable="false"${classAttribute}`);
}

module.exports = { renderIcon };
