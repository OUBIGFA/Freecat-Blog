const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Shanghai');

const { loadPosts, generateAll } = require('../build/pages/post.js');

const MODIFIED_AT = '2026-05-31T10:00:00+08:00';
const PUBLISHED_AT = '2026-05-31T09:00:00+08:00';

function article({ title = 'Stable Title', date = '2026-05-31', body = 'Body' } = {}) {
    return `---
title: ${title}
date: ${date}
show: true
---
${body}
`;
}

function mockArticleFiles(t, files) {
    t.mock.method(fs, 'readdirSync', () => Object.keys(files));
    t.mock.method(fs, 'readFileSync', (filePath) => {
        const file = path.basename(filePath);
        if (!Object.prototype.hasOwnProperty.call(files, file)) {
            throw new Error(`Unexpected file read: ${filePath}`);
        }
        return files[file];
    });
}

function dateStore() {
    return {
        get() {
            return MODIFIED_AT;
        },
        assertHas() {
            return MODIFIED_AT;
        }
    };
}

function publishStore() {
    return {
        get() {
            return PUBLISHED_AT;
        }
    };
}

function mapStore(values) {
    return {
        raw: values,
        get(file) {
            return values[file] || null;
        }
    };
}

function loadMockPosts({ postIds = { 'Original Title.md': '2026053115300001' } } = {}) {
    return loadPosts({
        postsDir: 'writing',
        gitDates: dateStore(),
        postDates: publishStore(),
        postIds: mapStore(postIds)
    });
}

test('snapshot post id controls the public post link instead of the filename', (t) => {
    mockArticleFiles(t, {
        'Original Title.md': article()
    });

    const [post] = loadMockPosts();

    assert.equal(post.postId, '2026053115300001');
    assert.equal(post.slug, 'Original Title');
    assert.equal(post.link, '/posts/2026053115300001');
});

test('renaming a file does not change the fixed public post link', (t) => {
    let files = {
        'Original Title.md': article()
    };
    mockArticleFiles(t, files);

    const [beforeRename] = loadMockPosts();
    delete files['Original Title.md'];
    files['Renamed Title.md'] = article({ title: 'Renamed Title' });
    const [afterRename] = loadMockPosts({
        postIds: { 'Renamed Title.md': '2026053115300001' }
    });

    assert.equal(afterRename.link, beforeRename.link);
    assert.equal(afterRename.postId, beforeRename.postId);
});

test('changing a title does not change the fixed public post link', (t) => {
    const files = {
        'Original Title.md': article({ title: 'Original Title' })
    };
    mockArticleFiles(t, files);

    const [beforeTitleChange] = loadMockPosts();
    files['Original Title.md'] = article({ title: 'Updated Title' });
    const [afterTitleChange] = loadMockPosts();

    assert.equal(afterTitleChange.title, 'Updated Title');
    assert.equal(afterTitleChange.link, beforeTitleChange.link);
});

test('missing snapshot post id fails with a clear message', (t) => {
    mockArticleFiles(t, {
        'Missing Id.md': article()
    });

    assert.throws(
        () => loadMockPosts({ postIds: {} }),
        /Missing post id for "Missing Id\.md"/
    );
});

test('duplicate snapshot post ids fail before pages are generated', (t) => {
    mockArticleFiles(t, {
        'First.md': article(),
        'Second.md': article()
    });

    assert.throws(
        () => loadMockPosts({
            postIds: {
                'First.md': '2026053115300001',
                'Second.md': '2026053115300001'
            }
        }),
        /Duplicate post id "2026053115300001"/
    );
});

test('generateAll writes only the fixed post id page', (t) => {
    mockArticleFiles(t, {
        'Original Title.md': article()
    });
    const [post] = loadMockPosts();
    const writes = new Map();

    t.mock.method(fs, 'mkdirSync', () => {});
    t.mock.method(fs, 'writeFileSync', (filePath, content) => {
        writes.set(path.normalize(filePath), String(content));
    });

    generateAll({
        posts: [post],
        template: '<!doctype html><html><head><!-- POST_SEO_HEAD --><!-- POST_JSONLD --></head><body><!-- TITLE_PLACEHOLDER --><!-- TITLE_H1_PLACEHOLDER --><!-- TAGS_PLACEHOLDER --><!-- DATE_PLACEHOLDER --><!-- DATE_ISO_PLACEHOLDER --><!-- MODIFIED_PLACEHOLDER --><!-- CONTENT_PLACEHOLDER --><!-- TOC_PLACEHOLDER --><!-- POST_HIGHLIGHT_CSS --><!-- POST_KATEX_CSS --><!-- POST_HIGHLIGHT_JS --><!-- POST_CHART_JS --><!-- POST_AUDIO_CSS --><!-- POST_AUDIO_JS --></body></html>',
        siteConfig: { site_name: 'Example', site_title: 'Example', site_url: 'https://example.com' },
        seoConfig: {},
        outputDir: 'dist'
    });

    const fixedPath = path.normalize(path.join('dist', 'posts', '2026053115300001', 'index.html'));

    assert.equal(writes.has(fixedPath), true);
    assert.equal(writes.size, 1);
});
