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

const { loadPosts, generateAll, renderPostPage } = require('../build/pages/post.js');

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
    assert.equal(post.link, '/posts/2026053115300001/');
});

test('article loader keeps plain-text preview line breaks after removing markdown', (t) => {
    mockArticleFiles(t, {
        'Original Title.md': article({
            body: [
                '![封面图][cover]',
                '<video src="https://example.com/demo.mp4">fallback text</video>',
                '| 名称 | 地址 |',
                '| --- | --- |',
                '| 很长的表格内容 | https://example.com/large |',
                '第一行 **加粗**',
                '第二行 [链接](https://example.com)',
                '- 第三行',
                '<[https://linux.do/t/topic/462102](https://linux.do/t/topic/462102)>',
                '<https://search.google.com/search-console>',
                '[cover]: https://example.com/cover.png'
            ].join('\n')
        })
    });

    const [post] = loadMockPosts();

    assert.equal(
        post.preview,
        [
            '第一行 加粗',
            '第二行 链接',
            '第三行',
            'https://linux.do/t/topic/462102',
            'https://search.google.com/search-console'
        ].join('\n')
    );
    assert.equal(post.excerpt.includes('https://linux.do/t/topic/462102'), true);
});

test('article loader recognizes robust content filenames and extensions', (t) => {
    mockArticleFiles(t, {
        'combined.name.with.embedded.md.md': article({ title: 'Nested Markdown Name' }),
        'Uppercase Format.MARKDOWN': article({ title: 'Uppercase Format' }),
        'Plain Text Post.text': article({ title: 'Plain Text Post' }),
        'Ignored.docx': article({ title: 'Ignored' })
    });

    const posts = loadMockPosts({
        postIds: {
            'combined.name.with.embedded.md.md': '2026053115300001',
            'Uppercase Format.MARKDOWN': '2026053115300002',
            'Plain Text Post.text': '2026053115300003'
        }
    });

    assert.deepEqual(posts.map(post => post.slug).sort(), [
        'Plain Text Post',
        'Uppercase Format',
        'combined.name.with.embedded.md'
    ]);
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

test('missing snapshot post id skips only that article', (t) => {
    mockArticleFiles(t, {
        'Missing Id.md': article({ title: 'Missing Id' }),
        'Included.md': article({ title: 'Included' })
    });

    const posts = loadMockPosts({
        postIds: {
            'Included.md': '2026053115300002'
        }
    });

    assert.deepEqual(posts.map(post => post.slug), ['Included']);
    assert.equal(posts[0].link, '/posts/2026053115300002/');
});

test('incomplete article snapshots skip only those articles', (t) => {
    mockArticleFiles(t, {
        'Missing Id.md': article({ title: 'Missing Id' }),
        'Missing Date.md': article({ title: 'Missing Date' }),
        'Included.md': article({ title: 'Included' })
    });

    const posts = loadPosts({
        postsDir: 'writing',
        gitDates: mapStore({
            'Included.md': MODIFIED_AT
        }),
        postDates: publishStore(),
        postIds: mapStore({
            'Missing Date.md': '2026053115300001',
            'Included.md': '2026053115300002'
        }),
        skipMissingGitDates: true
    });

    assert.deepEqual(posts.map(post => post.slug), ['Included']);
    assert.equal(posts[0].link, '/posts/2026053115300002/');
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
        template: '<!doctype html><html><head><!-- POST_SEO_HEAD --><!-- POST_JSONLD --></head><body><!-- TITLE_PLACEHOLDER --><!-- TITLE_H1_PLACEHOLDER --><!-- TAGS_PLACEHOLDER --><!-- DATE_PLACEHOLDER --><!-- DATE_ISO_PLACEHOLDER --><!-- MODIFIED_PLACEHOLDER --><!-- CONTENT_PLACEHOLDER --><!-- TOC_PLACEHOLDER --><!-- POST_HIGHLIGHT_CSS --><!-- POST_KATEX_CSS --><!-- POST_HIGHLIGHT_JS --><!-- POST_CHART_JS --><!-- POST_MEDIA_CSS --><!-- POST_MEDIA_JS --><!-- POST_AUDIO_CSS --><!-- POST_AUDIO_JS --><!-- POST_VIDEO_CSS --><!-- POST_VIDEO_JS --></body></html>',
        siteConfig: { site_name: 'Example', site_title: 'Example', site_url: 'https://example.com' },
        seoConfig: {},
        outputDir: 'dist'
    });

    const fixedPath = path.normalize(path.join('dist', 'posts', '2026053115300001', 'index.html'));

    assert.equal(writes.has(fixedPath), true);
    assert.equal(writes.size, 1);
});

test('post share metadata uses dotted publish date for preview display', () => {
    const post = {
        title: 'Share Date Post',
        tag: [],
        link: '/posts/share-date',
        cover: '/image/cover.png',
        coverWidth: 800,
        coverHeight: 900,
        content: 'Body',
        date: dayjs.tz('2026-05-02T09:00:00+08:00'),
        modifiedDate: dayjs.tz('2026-05-03T09:00:00+08:00'),
        postId: '2026050209000001'
    };
    const html = renderPostPage({
        post,
        template: '<!doctype html><html><head><!-- POST_SEO_HEAD --><!-- POST_JSONLD --></head><body><!-- TITLE_PLACEHOLDER --><!-- TITLE_H1_PLACEHOLDER --><!-- TAGS_PLACEHOLDER --><!-- DATE_PLACEHOLDER --><!-- DATE_ISO_PLACEHOLDER --><!-- MODIFIED_PLACEHOLDER --><!-- CONTENT_PLACEHOLDER --><!-- TOC_PLACEHOLDER --><!-- POST_HIGHLIGHT_CSS --><!-- POST_KATEX_CSS --><!-- POST_CHART_JS --><!-- POST_MEDIA_CSS --><!-- POST_MEDIA_JS --><!-- POST_AUDIO_CSS --><!-- POST_AUDIO_JS --><!-- POST_VIDEO_CSS --><!-- POST_VIDEO_JS --></body></html>',
        siteConfig: { site_name: 'Example', site_title: 'Example Blog', site_url: 'https://example.com' },
        seoConfig: {}
    });

    assert.match(html, /<meta property="article:published_time" content="2026\.05\.02" \/>/);
    assert.match(html, /"datePublished":"\d{4}-\d{2}-\d{2}T/);
    assert.match(html, /<meta property="og:image:width" content="1200" \/>/);
    assert.match(html, /<meta property="og:image:height" content="1200" \/>/);
    assert.doesNotMatch(html, /<meta property="og:image:height" content="900" \/>/);
});

test('post page renders latest update panel only when update snapshot exists', () => {
    const basePost = {
        title: 'Latest Update Post',
        tag: [],
        link: '/posts/latest-update',
        cover: '',
        content: 'Body',
        date: dayjs.tz('2026-05-02T09:00:00+08:00'),
        modifiedDate: dayjs.tz('2026-05-03T09:00:00+08:00'),
        postId: '2026050209000002'
    };
    const template = '<!doctype html><html><head><!-- POST_SEO_HEAD --><!-- POST_JSONLD --></head><body><!-- LATEST_UPDATE_PLACEHOLDER --><!-- CONTENT_PLACEHOLDER --></body></html>';
    const siteConfig = { site_name: 'Example', site_title: 'Example Blog', site_url: 'https://example.com' };

    const withUpdate = renderPostPage({
        post: { ...basePost, latestUpdate: { items: ['最后新增的正文内容'] } },
        template,
        siteConfig,
        seoConfig: {}
    });
    const withoutUpdate = renderPostPage({
        post: basePost,
        template,
        siteConfig,
        seoConfig: {}
    });

    assert.match(withUpdate, /freecat-post-latest-update-panel/);
    assert.match(withUpdate, /class="freecat-sidebar-recent-heading text-sm tracking-wider text-slate-500 dark:text-slate-400 mb-3"/);
    assert.match(withUpdate, /freecat-post-latest-update-content[\s\S]*>\s*Update\s*<[\s\S]*freecat-post-latest-update-body/);
    assert.match(withUpdate, />\s*Update\s*</);
    assert.match(withUpdate, /class="freecat-post-latest-update-title-note">最后更新内容<\/span>/);
    assert.match(withUpdate, /最后新增的正文内容/);
    assert.match(withUpdate, /class="freecat-post-latest-update-link"/);
    assert.match(withUpdate, /href="#latest-update-1"/);
    assert.match(withUpdate, /data-latest-update-text="最后新增的正文内容"/);
    assert.doesNotMatch(withUpdate, /title="最后新增的正文内容"/);
    assert.doesNotMatch(withUpdate, /freecat-post-latest-update-date/);
    assert.doesNotMatch(withoutUpdate, /freecat-post-latest-update-panel/);
    assert.doesNotMatch(withoutUpdate, />\s*Update\s*</);
});

test('post page binds latest update links to rendered table row targets', () => {
    const post = {
        title: 'Latest Update Table Post',
        tag: [],
        link: '/posts/latest-update-table',
        cover: '',
        content: [
            '| 文件夹 | 功能 | 说明 |',
            '| --- | --- | --- |',
            '| `all/` | 构建资源 | 部署平台从这里构建网站 |'
        ].join('\n'),
        date: dayjs.tz('2026-05-02T09:00:00+08:00'),
        modifiedDate: dayjs.tz('2026-05-03T09:00:00+08:00'),
        postId: '2026050209000003',
        latestUpdate: {
            items: [{
                text: 'all/ 构建资源 部署平台从这里构建网站',
                targetText: '| `all/` | 构建资源 | 部署平台从这里构建网站 |'
            }]
        }
    };
    const template = '<!doctype html><html><head><!-- POST_SEO_HEAD --><!-- POST_JSONLD --></head><body><!-- LATEST_UPDATE_PLACEHOLDER --><!-- CONTENT_PLACEHOLDER --></body></html>';
    const html = renderPostPage({
        post,
        template,
        siteConfig: { site_name: 'Example', site_title: 'Example Blog', site_url: 'https://example.com' },
        seoConfig: {}
    });

    assert.match(html, /href="#latest-update-1"/);
    assert.match(html, /<tr id="latest-update-1">[\s\S]*<code>all\/<\/code>[\s\S]*构建资源[\s\S]*部署平台从这里构建网站[\s\S]*<\/tr>/);
});

test('post page binds latest update links to formatted list and table targets', () => {
    const post = {
        title: 'Latest Update Formatted Post',
        tag: [],
        link: '/posts/latest-update-formatted',
        cover: '',
        content: [
            '- **Cloudflare Pages**: fill build settings.',
            '- `theme_system`',
            '',
            '| Field | Notes |',
            '| --- | --- |',
            '| `about_hero_avatar` | About page avatar |',
            '',
            '- Sync: `all/`, `README.md`, `README.en.md`'
        ].join('\n'),
        date: dayjs.tz('2026-05-02T09:00:00+08:00'),
        modifiedDate: dayjs.tz('2026-05-03T09:00:00+08:00'),
        postId: '2026050209000004',
        latestUpdate: {
            items: [
                { text: 'Cloudflare Pages: fill build settings.', targetText: '- **Cloudflare Pages**: fill build settings.' },
                { text: 'theme_system', targetText: '- `theme_system`' },
                { text: 'about_hero_avatar About page avatar', targetText: '| `about_hero_avatar` | About page avatar |' },
                { text: 'Sync: all/, README.md, README.en.md', targetText: '- Sync: `all/`, `README.md`, `README.en.md`' }
            ]
        }
    };
    const template = '<!doctype html><html><head><!-- POST_SEO_HEAD --><!-- POST_JSONLD --></head><body><!-- LATEST_UPDATE_PLACEHOLDER --><!-- CONTENT_PLACEHOLDER --></body></html>';
    const html = renderPostPage({
        post,
        template,
        siteConfig: { site_name: 'Example', site_title: 'Example Blog', site_url: 'https://example.com' },
        seoConfig: {}
    });

    assert.match(html, /href="#latest-update-1"/);
    assert.match(html, /href="#latest-update-2"/);
    assert.match(html, /href="#latest-update-3"/);
    assert.match(html, /href="#latest-update-4"/);
    assert.match(html, /<li id="latest-update-1">[\s\S]*<strong>Cloudflare Pages<\/strong>[\s\S]*fill build settings\.[\s\S]*<\/li>/);
    assert.match(html, /<li id="latest-update-2">[\s\S]*<code>theme_system<\/code>[\s\S]*<\/li>/);
    assert.match(html, /<tr id="latest-update-3">[\s\S]*<code>about_hero_avatar<\/code>[\s\S]*About page avatar[\s\S]*<\/tr>/);
    assert.match(html, /<li id="latest-update-4">[\s\S]*<code>all\/<\/code>[\s\S]*<code>README\.md<\/code>[\s\S]*<\/li>/);
});

test('post page binds latest update links to rendered image targets', () => {
    const post = {
        title: 'Latest Update Image Post',
        tag: [],
        link: '/posts/latest-update-image',
        cover: '',
        content: [
            '![](/image/new-cover.png)',
            '',
            '![封面](/image/cover.png "Hero")'
        ].join('\n'),
        date: dayjs.tz('2026-05-02T09:00:00+08:00'),
        modifiedDate: dayjs.tz('2026-05-03T09:00:00+08:00'),
        postId: '2026050209000005',
        latestUpdate: {
            items: [
                { text: '/image/new-cover.png', targetText: '![](/image/new-cover.png)' },
                { text: '封面', targetText: '![封面](/image/cover.png "Hero")' }
            ]
        }
    };
    const template = '<!doctype html><html><head><!-- POST_SEO_HEAD --><!-- POST_JSONLD --></head><body><!-- LATEST_UPDATE_PLACEHOLDER --><!-- CONTENT_PLACEHOLDER --></body></html>';
    const html = renderPostPage({
        post,
        template,
        siteConfig: { site_name: 'Example', site_title: 'Example Blog', site_url: 'https://example.com' },
        seoConfig: {}
    });

    assert.match(html, /href="#latest-update-1"/);
    assert.match(html, /href="#latest-update-2"/);
    assert.match(html, /<figure id="latest-update-1" class="post-image markdown-image-block[\s\S]*data-src="\/image\/new-cover\.png"[\s\S]*<\/figure>/);
    assert.match(html, /<figure id="latest-update-2" class="post-image markdown-image-block[\s\S]*data-src="\/image\/cover\.png"[\s\S]*<\/figure>/);
    assert.match(html, /<figure id="latest-update-2" class="post-image markdown-image-block[\s\S]*alt="封面"[\s\S]*<\/figure>/);
});

test('post page binds latest update links to rendered empty link targets', () => {
    const post = {
        title: 'Latest Update Empty Link Post',
        tag: [],
        link: '/posts/latest-update-empty-link',
        cover: '',
        content: '[](https://example.com/empty-link)',
        date: dayjs.tz('2026-05-02T09:00:00+08:00'),
        modifiedDate: dayjs.tz('2026-05-03T09:00:00+08:00'),
        postId: '2026050209000006',
        latestUpdate: {
            items: [
                { text: 'https://example.com/empty-link', targetText: '[](https://example.com/empty-link)' }
            ]
        }
    };
    const template = '<!doctype html><html><head><!-- POST_SEO_HEAD --><!-- POST_JSONLD --></head><body><!-- LATEST_UPDATE_PLACEHOLDER --><!-- CONTENT_PLACEHOLDER --></body></html>';
    const html = renderPostPage({
        post,
        template,
        siteConfig: { site_name: 'Example', site_title: 'Example Blog', site_url: 'https://example.com' },
        seoConfig: {}
    });

    assert.match(html, /href="#latest-update-1"/);
    assert.match(html, /data-latest-update-text="https:\/\/example\.com\/empty-link"/);
    assert.match(html, /<p id="latest-update-1"[^>]*>[\s\S]*href="https:\/\/example\.com\/empty-link"[\s\S]*<\/p>/);
});

test('post page loads video player assets only when video content is present', () => {
    const baseTemplate = '<!doctype html><html><head><!-- POST_SEO_HEAD --><!-- POST_JSONLD --><!-- POST_MEDIA_CSS --><!-- POST_VIDEO_CSS --></head><body><!-- TITLE_PLACEHOLDER --><!-- TITLE_H1_PLACEHOLDER --><!-- TAGS_PLACEHOLDER --><!-- DATE_PLACEHOLDER --><!-- DATE_ISO_PLACEHOLDER --><!-- MODIFIED_PLACEHOLDER --><!-- CONTENT_PLACEHOLDER --><!-- TOC_PLACEHOLDER --><!-- POST_HIGHLIGHT_CSS --><!-- POST_KATEX_CSS --><!-- POST_HIGHLIGHT_JS --><!-- POST_CHART_JS --><!-- POST_MEDIA_JS --><!-- POST_AUDIO_CSS --><!-- POST_AUDIO_JS --><!-- POST_VIDEO_JS --></body></html>';
    const siteConfig = { site_name: 'Example', site_title: 'Example', site_url: 'https://example.com' };
    const postBase = {
        title: 'Video Post',
        tag: [],
        link: '/posts/video',
        cover: '',
        date: dayjs.tz(PUBLISHED_AT),
        modifiedDate: dayjs.tz(MODIFIED_AT),
        postId: '2026053115300002'
    };

    const videoHtml = require('../build/pages/post.js').renderPostPage({
        post: { ...postBase, content: '![Demo](https://example.com/video.mp4)' },
        template: baseTemplate,
        siteConfig,
        seoConfig: {}
    });
    const emojiVideoHtml = require('../build/pages/post.js').renderPostPage({
        post: { ...postBase, content: '> [🎬 Demo](https://example.com/watch?id=1)' },
        template: baseTemplate,
        siteConfig,
        seoConfig: {}
    });
    const plainHtml = require('../build/pages/post.js').renderPostPage({
        post: { ...postBase, content: 'Plain body' },
        template: baseTemplate,
        siteConfig,
        seoConfig: {}
    });

    assert.match(videoHtml, /href="\/assets\/video-player\.css"/);
    assert.match(videoHtml, /href="\/assets\/media-player\.css"/);
    assert.match(videoHtml, /src="\/assets\/media-player-template\.js"/);
    assert.match(videoHtml, /src="\/assets\/media-player\.js"/);
    assert.match(videoHtml, /src="\/assets\/video-player\.js"/);
    assert.match(emojiVideoHtml, /href="\/assets\/video-player\.css"/);
    assert.match(emojiVideoHtml, /href="\/assets\/media-player\.css"/);
    assert.match(emojiVideoHtml, /src="\/assets\/media-player-template\.js"/);
    assert.match(emojiVideoHtml, /src="\/assets\/media-player\.js"/);
    assert.match(emojiVideoHtml, /src="\/assets\/video-player\.js"/);
    assert.doesNotMatch(plainHtml, /video-player\.css/);
    assert.doesNotMatch(plainHtml, /video-player\.js/);
    assert.doesNotMatch(plainHtml, /media-player\.css/);
    assert.doesNotMatch(plainHtml, /media-player-template\.js/);
    assert.doesNotMatch(plainHtml, /media-player\.js/);
});

test('post page loads audio player assets only for image-style audio content', () => {
    const baseTemplate = '<!doctype html><html><head><!-- POST_SEO_HEAD --><!-- POST_JSONLD --><!-- POST_MEDIA_CSS --><!-- POST_AUDIO_CSS --></head><body><!-- TITLE_PLACEHOLDER --><!-- TITLE_H1_PLACEHOLDER --><!-- TAGS_PLACEHOLDER --><!-- DATE_PLACEHOLDER --><!-- DATE_ISO_PLACEHOLDER --><!-- MODIFIED_PLACEHOLDER --><!-- CONTENT_PLACEHOLDER --><!-- TOC_PLACEHOLDER --><!-- POST_HIGHLIGHT_CSS --><!-- POST_KATEX_CSS --><!-- POST_HIGHLIGHT_JS --><!-- POST_CHART_JS --><!-- POST_MEDIA_JS --><!-- POST_AUDIO_JS --><!-- POST_VIDEO_CSS --><!-- POST_VIDEO_JS --></body></html>';
    const siteConfig = { site_name: 'Example', site_title: 'Example', site_url: 'https://example.com' };
    const postBase = {
        title: 'Audio Post',
        tag: [],
        link: '/posts/audio',
        cover: '',
        date: dayjs.tz(PUBLISHED_AT),
        modifiedDate: dayjs.tz(MODIFIED_AT),
        postId: '2026053115300003'
    };

    const audioHtml = require('../build/pages/post.js').renderPostPage({
        post: { ...postBase, content: '![Demo](https://example.com/audio.mp3)' },
        template: baseTemplate,
        siteConfig,
        seoConfig: {}
    });
    const quoteAudioHtml = require('../build/pages/post.js').renderPostPage({
        post: { ...postBase, content: '> [Demo](https://example.com/audio.mp3)' },
        template: baseTemplate,
        siteConfig,
        seoConfig: {}
    });

    assert.match(audioHtml, /href="\/assets\/audio-player\.css"/);
    assert.match(audioHtml, /href="\/assets\/media-player\.css"/);
    assert.match(audioHtml, /src="\/assets\/media-player-template\.js"/);
    assert.match(audioHtml, /src="\/assets\/media-player\.js"/);
    assert.match(audioHtml, /src="\/assets\/audio-player\.js"/);
    assert.doesNotMatch(quoteAudioHtml, /audio-player\.css/);
    assert.doesNotMatch(quoteAudioHtml, /audio-player\.js/);
    assert.doesNotMatch(quoteAudioHtml, /media-player\.css/);
    assert.doesNotMatch(quoteAudioHtml, /media-player-template\.js/);
    assert.doesNotMatch(quoteAudioHtml, /media-player\.js/);
});
