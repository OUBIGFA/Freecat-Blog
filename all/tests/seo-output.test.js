const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const dayjs = require('dayjs');

const { generateSitemap, generateRobotsTxt, generateLlmsTxt, generateFeed } = require('../build/pages/sitemap');

function tempDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'freecat-seo-'));
}

const posts = [
    {
        title: 'Visible Post',
        link: '/posts/Visible Post.html',
        modifiedDate: dayjs('2026-05-01T00:00:00Z'),
        date: dayjs('2026-04-01T00:00:00Z'),
        pinned: false,
        excerpt: 'Visible excerpt',
        content: 'Visible content'
    },
    {
        title: 'Hidden Post',
        link: '/posts/hidden.html',
        modifiedDate: dayjs('2026-05-02T00:00:00Z'),
        date: dayjs('2026-04-02T00:00:00Z'),
        noindex: true,
        excerpt: 'Hidden excerpt',
        content: 'Hidden content'
    }
];

test('sitemap, robots, llms.txt, and feed use SEO config and skip noindex posts', () => {
    const outputDir = tempDir();
    const siteConfig = { site_title: 'FreeCat Blog', site_name: 'FreeCat', site_url: 'https://example.com' };
    const seoConfig = {
        site_description: 'A static blog.',
        site_language: 'zh-CN',
        allow_ai_crawlers: true,
        enable_llms_txt: true
    };

    generateSitemap({ posts, siteConfig, seoConfig, outputDir });
    generateRobotsTxt({ siteConfig, seoConfig, outputDir });
    generateLlmsTxt({ posts, siteConfig, seoConfig, outputDir });
    generateFeed({ posts, siteConfig, seoConfig, outputDir });

    const sitemap = fs.readFileSync(path.join(outputDir, 'sitemap.xml'), 'utf8');
    const robots = fs.readFileSync(path.join(outputDir, 'robots.txt'), 'utf8');
    const llms = fs.readFileSync(path.join(outputDir, 'llms.txt'), 'utf8');
    const feed = fs.readFileSync(path.join(outputDir, 'feed.xml'), 'utf8');

    assert.match(sitemap, /https:\/\/example\.com\/posts\/Visible%20Post\.html/);
    assert.doesNotMatch(sitemap, /hidden\.html/);
    assert.match(robots, /User-agent: OAI-SearchBot/);
    assert.match(robots, /User-agent: Claude-SearchBot/);
    assert.match(robots, /User-agent: PerplexityBot/);
    assert.match(robots, /Sitemap: https:\/\/example\.com\/sitemap\.xml/);
    assert.match(llms, /Visible Post/);
    assert.doesNotMatch(llms, /Hidden Post/);
    assert.match(feed, /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom">/);
    assert.doesNotMatch(feed, /Hidden Post/);
});

