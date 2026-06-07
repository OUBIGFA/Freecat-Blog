const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const rootVercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../vercel.json'), 'utf-8'));
const distVercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/vercel.json'), 'utf-8'));
const cloudflareHeaders = fs.readFileSync(path.join(__dirname, '../src/_headers'), 'utf-8');

function headersFor(config, source) {
    const entry = config.headers.find(item => item.source === source);
    assert.ok(entry, `missing header source ${source}`);
    return Object.fromEntries(entry.headers.map(item => [item.key, item.value]));
}

test('root and generated Vercel header configs stay in sync', () => {
    assert.deepEqual(rootVercelConfig, distVercelConfig);
});

test('versioned assets use long immutable cache headers', () => {
    assert.equal(headersFor(rootVercelConfig, '/assets/(.*)')['Cache-Control'], 'public, max-age=31536000, immutable');
    assert.match(cloudflareHeaders, /\/assets\/\*\s+Cache-Control: public, max-age=31536000, immutable/);
});

test('html keeps browser revalidation while allowing cdn cache', () => {
    const rootHeaders = headersFor(rootVercelConfig, '/');

    assert.equal(rootHeaders['Cache-Control'], 'public, max-age=0, must-revalidate');
    assert.equal(rootHeaders['CDN-Cache-Control'], 'public, max-age=86400, stale-while-revalidate=604800');
    assert.equal(rootHeaders['Vercel-CDN-Cache-Control'], 'public, max-age=86400, stale-while-revalidate=604800');
    assert.match(cloudflareHeaders, /CDN-Cache-Control: public, max-age=86400, stale-while-revalidate=604800/);
});
