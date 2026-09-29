const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { renderIcon } = require('../build/icons.js');
const { createEngine } = require('../build/template-engine.js');
const { SOCIAL_DEFAULTS } = require('../build/social-defaults.js');

test('bundled icons render as standalone SVG without external asset references', () => {
    const directory = path.join(__dirname, '../src/assets/icons/tabler');
    const names = fs.readdirSync(directory).filter(file => file.endsWith('.svg'));
    assert.equal(names.length, 16);
    for (const file of names) {
        const svg = renderIcon(file.slice(0, -4));
        assert.match(svg, /^<svg\b/);
        assert.match(svg, /aria-hidden="true"/);
        assert.match(svg, /stroke="currentColor"/);
        assert.doesNotMatch(svg, /<(?:script|image|use)\b|(?:href|src)="https?:/i);
    }
    assert.match(fs.readFileSync(path.join(directory, 'LICENSE.txt'), 'utf8'), /MIT License/);
    assert.throws(() => renderIcon('../outside'), /Invalid icon name/);
});

test('site templates inline the local navigation and social icons', () => {
    const engine = createEngine({
        templatesDir: path.join(__dirname, '../src'),
        partialsDir: path.join(__dirname, '../src/partials'),
        siteConfig: { site_name: 'Blog', site_url: 'https://example.com' },
        socialConfig: SOCIAL_DEFAULTS
    });
    const html = engine.loadTemplate('template_index.html');
    assert.doesNotMatch(html, /<!-- HEADER_\w+_ICON -->/);
    assert.match(html, /class="freecat-theme-sun"/);
    assert.match(html, /class="freecat-theme-moon"/);
    const footer = html.match(/<footer class="freecat-site-footer[\s\S]*?<\/footer>/)[0];
    assert.match(footer, /<svg\b/);
    assert.doesNotMatch(footer, /<img\b|<use\b/);
});
