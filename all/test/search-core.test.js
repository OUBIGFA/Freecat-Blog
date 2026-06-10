const test = require('node:test');
const assert = require('node:assert/strict');
const { searchCore } = require('../test-support/assets.js');

// search-core.js 是 UMD 纯逻辑模块：这里直接 require 后用真实输入输出做行为测试，
// 不再对客户端源码做正则断言（避免一重构测试就红）。

const POSTS = [
    { title: 'Hello World', excerpt: 'first post', content: 'alpha beta', tags: ['Tech'], date: '2026-01-01', link: '/posts/a/' },
    { title: 'CSS 布局指南', excerpt: 'layout tricks', content: 'grid flex', tags: ['CSS', 'Tech'], date: '2026-02-01', link: '/posts/b/' },
    { title: 'Pinned Notice', excerpt: 'site news', content: 'announcement', tags: [], date: '2025-12-01', pinned: true, link: '/posts/c/' },
    { title: 'Old Article', excerpt: 'archive', content: 'history alpha', tags: ['Life'], date: '2024-06-01', link: '/posts/d/' }
];

test('searchPosts matches title, excerpt, content and tags case-insensitively', () => {
    assert.deepEqual(
        searchCore.searchPosts('hello', POSTS).map(p => p.link),
        ['/posts/a/'],
        'title match should return the matching post'
    );
    assert.deepEqual(
        searchCore.searchPosts('ARCHIVE', POSTS).map(p => p.link),
        ['/posts/d/'],
        'excerpt match should be case-insensitive'
    );
    assert.deepEqual(
        searchCore.searchPosts('css', POSTS).map(p => p.link),
        ['/posts/b/'],
        'tag text should be searchable in keyword mode'
    );
});

test('searchPosts falls back to fuzzy all-words matching across fields', () => {
    // “grid 布局” 没有任何字段整串包含，但 grid 在 content、布局 在 title —— 应命中。
    assert.deepEqual(
        searchCore.searchPosts('grid 布局', POSTS).map(p => p.link),
        ['/posts/b/'],
        'every word must match in some field'
    );
    assert.deepEqual(searchCore.searchPosts('grid missing-word', POSTS), [],
        'a word with no match anywhere should reject the post');
});

test('searchPosts returns empty results for blank queries', () => {
    assert.deepEqual(searchCore.searchPosts('', POSTS), []);
    assert.deepEqual(searchCore.searchPosts('   ', POSTS), []);
});

test('searchPosts in tag mode matches tags exactly and supports the untagged sentinel', () => {
    assert.deepEqual(
        searchCore.searchPosts('tech', POSTS, true).map(p => p.link).sort(),
        ['/posts/a/', '/posts/b/'],
        'tag mode matches the whole tag, case-insensitively'
    );
    assert.deepEqual(searchCore.searchPosts('Te', POSTS, true), [],
        'tag mode must not substring-match');
    assert.deepEqual(
        searchCore.searchPosts('__untagged__', POSTS, true).map(p => p.link),
        ['/posts/c/'],
        'the __untagged__ sentinel returns posts without tags'
    );
});

test('sortPostsForListing puts pinned posts first, then newest by date', () => {
    const sorted = searchCore.sortPostsForListing(POSTS);
    assert.deepEqual(
        sorted.map(p => p.link),
        ['/posts/c/', '/posts/b/', '/posts/a/', '/posts/d/'],
        'pinned first, remaining posts in reverse-date order'
    );
    assert.notEqual(sorted, POSTS, 'sorting must not mutate the input array');
});

test('searchPosts caps keyword results at 20 but never caps tag results', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({
        title: `Bulk ${i}`, excerpt: 'bulk', content: '', tags: ['Bulk'],
        date: `2026-03-${String((i % 28) + 1).padStart(2, '0')}`, link: `/posts/bulk-${i}/`
    }));
    assert.equal(searchCore.searchPosts('bulk', many).length, 20, 'keyword search caps at 20');
    assert.equal(searchCore.searchPosts('bulk', many, true).length, 30, 'tag search returns all');
});

test('getPostsByTag reads the tag index and sorts the resulting posts', () => {
    const index = {
        posts: [
            { title: 'A', date: '2026-01-01', link: '/posts/a/', tags: ['x'] },
            { title: 'B', date: '2026-02-01', link: '/posts/b/', tags: ['x'] },
            { title: 'C', date: '2025-01-01', link: '/posts/c/', tags: [] }
        ],
        tags: { x: { posts: [0, 1] } },
        untagged: [2]
    };

    assert.deepEqual(
        searchCore.getPostsByTag('X', index).map(p => p.link),
        ['/posts/b/', '/posts/a/'],
        'tag lookup is key-normalized and date-sorted'
    );
    assert.deepEqual(
        searchCore.getPostsByTag('__untagged__', index).map(p => p.link),
        ['/posts/c/'],
        'untagged sentinel reads the untagged list'
    );
    assert.deepEqual(searchCore.getPostsByTag('x', null), [], 'missing index yields no results');
});

test('renderSearchResultCards renders escaped post-card markup with staggered delays', () => {
    const html = searchCore.renderSearchResultCards([
        { title: 'Hello <b>World</b>', excerpt: 'safe & sound', tags: ['Tech'], date: '2026-01-01', link: '/posts/a/', cover: '/image/example.png' },
        { title: 'Second', excerpt: 'two', tags: [], date: '2026-02-01', link: '/posts/b/' }
    ]);

    assert.match(html, /class="post-card\b/, 'results render through the shared post-card template');
    assert.equal(html.includes('Hello &lt;b&gt;World&lt;/b&gt;'), true, 'title HTML is escaped');
    assert.equal(html.includes('safe &amp; sound'), true, 'excerpt HTML is escaped');
    assert.equal(html.includes('<b>World</b>'), false, 'raw HTML must not pass through');
    assert.match(html, /animation-delay:\s*0ms/, 'first card starts immediately');
    assert.match(html, /animation-delay:\s*50ms/, 'second card is staggered by 50ms');
    assert.match(html, /freecat-tag-text/, 'tags render through shared.renderTagSpan');
    assert.match(html, /post-card[^"]*\btags-inline-mobile\b/, 'search results use the all-page mobile tag placement');
    assert.match(html, /lazy-image-frame mt-4 h-\[clamp\(11\.25rem,14\.5vw,13\.25rem\)\] max-\[480px\]:h-\[11\.5rem\]/, 'search results use the all-page mobile cover height');
});

test('getStaggerDelayMs grows per index and clamps at the 10th element', () => {
    assert.equal(searchCore.getStaggerDelayMs(0), 0);
    assert.equal(searchCore.getStaggerDelayMs(3), 150);
    assert.equal(searchCore.getStaggerDelayMs(25), 500, 'delay clamps at index 10');
    assert.equal(searchCore.getStaggerDelayMs(2, 100), 200, 'step is configurable');
});
