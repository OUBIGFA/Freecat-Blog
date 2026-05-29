const test = require('node:test');
const assert = require('node:assert/strict');

const {
    generateSitemap,
    generateLlmsTxt,
    generateFeed,
    generateOpenSearchXml
} = require('../build/pages/sitemap.js');

test('site_url-less discovery outputs stay quiet', () => {
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));

    try {
        const options = {
            posts: [],
            siteConfig: { site_url: '' },
            seoConfig: {},
            outputDir: __dirname
        };

        generateSitemap(options);
        generateLlmsTxt(options);
        generateFeed(options);
        generateOpenSearchXml(options);
    } finally {
        console.log = originalLog;
    }

    assert.deepEqual(logs, []);
});
