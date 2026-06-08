const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const { TAILWIND_SAFELIST, getTailwindContentGlobs } = require('../build/tailwind-sources.js');

test('tailwind content sources include generated html, browser assets, shared templates, and build renderers', () => {
    const dirs = {
        output: path.join('site', 'dist'),
        assets: path.join('site', 'src', 'assets'),
        shared: path.join('site', 'shared'),
        build: path.join('site', 'build')
    };

    const globs = getTailwindContentGlobs(dirs).map(value => value.replace(/\\/g, '/'));

    assert.deepEqual(globs, [
        'site/dist/**/*.html',
        'site/src/assets/**/*.{html,js,css}',
        'site/shared/**/*.js',
        'site/build/**/*.js'
    ]);
    assert.equal(TAILWIND_SAFELIST.includes('animate-fade-in-up'), true);
});
