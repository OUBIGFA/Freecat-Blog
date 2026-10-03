const { defineConfig } = require('@playwright/test');
const path = require('node:path');

module.exports = defineConfig({
    testDir: './browser-tests',
    outputDir: path.resolve(__dirname, '../.test/browser-tests'),
    fullyParallel: false,
    workers: 1,
    timeout: 20000,
    reporter: 'list',
    use: {
        baseURL: 'http://127.0.0.1:4173',
        headless: true,
        // Use the local Edge installation on Windows; never occupy a desktop.
        channel: process.platform === 'win32' ? 'msedge' : undefined,
        trace: 'retain-on-failure'
    },
    projects: [
        { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
        { name: 'mobile', use: { viewport: { width: 390, height: 844 } } }
    ]
});
