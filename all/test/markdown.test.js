const test = require('node:test');
const assert = require('node:assert/strict');

const { parseMarkdown, extractHeadingsAndGenerateTOC, parseImageStyleAudio, parseImageStyleAudioList, stripMarkdown } = require('../build/markdown.js');

test('callout titles are rendered as text', () => {
    const html = parseMarkdown('> [!note] <img src=x onerror=alert(1)>\\n> content');

    assert.equal(html.includes('<span class="callout-title-inner"><img'), false);
    assert.equal(html.includes('&lt;img src=x onerror=alert(1)&gt;'), true);
});

test('heading ranks follow the largest levels present in each article', () => {
    const { headings } = extractHeadingsAndGenerateTOC([
        '### Top visible level',
        '##### Deep level',
        '#### Second visible level'
    ].join('\n'));

    assert.deepEqual(headings.map(heading => ({ level: heading.level, rank: heading.rank })), [
        { level: 3, rank: 1 },
        { level: 5, rank: 3 },
        { level: 4, rank: 2 }
    ]);
});

test('image alt, title, and caption are rendered as text', () => {
    const html = parseMarkdown('![<img src=x>](/image/freecat.png "<b>caption</b>")', {
        enableImageCaptions: true
    });

    assert.equal(html.includes('alt="<img src=x>"'), false);
    assert.equal(html.includes('title="<b>caption</b>"'), false);
    assert.equal(html.includes('<figcaption class="image-caption block text-center text-sm text-slate-500 dark:text-slate-400"><b>caption</b></figcaption>'), false);
    assert.equal(html.includes('alt="&lt;img src=x&gt;"'), true);
    assert.equal(html.includes('title="&lt;b&gt;caption&lt;/b&gt;"'), true);
    assert.equal(html.includes('&lt;b&gt;caption&lt;/b&gt;'), true);
});

test('markdown images render the loading spinner element', () => {
    const html = parseMarkdown('![Freecat](/image/freecat.png)');

    assert.equal(html.includes('class="post-image-loader placeholder-loader"'), true);
    assert.equal(html.includes('<span class="loader"></span>'), true);
});

test('markdown image syntax renders direct video URLs as complete video players', () => {
    const html = parseMarkdown('![Demo](https://example.com/video.mp4?download=1)');

    assert.match(html, /class="video-player-container media-player-container"/);
    assert.equal(html.includes('class="video-player-stage"'), true);
    assert.equal(html.includes('class="media-play-btn video-play-btn"'), true);
    assert.equal(html.includes('class="media-player-loading-chrome"'), false);
    assert.equal(html.includes('data-video-src="https://example.com/video.mp4?download=1"'), true);
    assert.equal(html.includes('data-video-title="Demo"'), true);
    assert.equal(html.includes('class="post-image-loader placeholder-loader"'), false);
});

test('video emoji forces image-link syntax to render as a video player', () => {
    const html = parseMarkdown('![🎬 Demo](https://example.com/watch?id=1)');

    assert.match(html, /class="video-player-container media-player-container"/);
    assert.equal(html.includes('data-video-src="https://example.com/watch?id=1"'), true);
    assert.equal(html.includes('data-video-title="Demo"'), true);
    assert.equal(html.includes('🎬'), false);
});

test('multiline media image syntax picks the video URL for the video player', () => {
    const html = parseMarkdown([
        '![](https://example.com/cover.jpg',
        'https://example.com/playlist/master.m3u8',
        'https://example.com/video.mp4)'
    ].join('\n'));

    assert.match(html, /class="video-player-container media-player-container"/);
    assert.equal(html.includes('data-video-src="https://example.com/playlist/master.m3u8"'), true);
    assert.equal(html.includes('https://example.com/cover.jpg'), false);
});

test('stripMarkdown can preserve source line breaks for card previews', () => {
    const source = [
        '# 标题',
        '第一行 **加粗**',
        '第二行 [链接](https://example.com)',
        '',
        '- 第三行'
    ].join('\n');

    assert.equal(stripMarkdown(source), '标题 第一行 加粗 第二行 链接 第三行');
    assert.equal(
        stripMarkdown(source, { preserveLineBreaks: true }),
        ['标题', '第一行 加粗', '第二行 链接', '第三行'].join('\n')
    );
});

test('blockquote video links render the complete player before client scripts run', () => {
    const html = parseMarkdown('> [🎬 Demo](https://example.com/video.mp4)');

    assert.match(html, /class="video-player-container media-player-container"/);
    assert.equal(html.includes('class="video-player-stage"'), true);
    assert.equal(html.includes('class="media-play-btn video-play-btn"'), true);
    assert.equal(html.includes('class="media-player-loading-chrome"'), false);
    assert.equal(html.includes('data-video-src="https://example.com/video.mp4"'), true);
    assert.equal(html.includes('<blockquote>'), false);
});

test('markdown image syntax renders direct audio URLs as complete audio players', () => {
    const html = parseMarkdown('![Audio](https://example.com/audio.ogg)');

    assert.doesNotMatch(html, /class="video-player-container media-player-container"/);
    assert.match(html, /class="audio-player-container media-player-container"/);
    assert.equal(html.includes('class="media-play-btn audio-play-btn"'), true);
    assert.equal(html.includes('class="media-player-loading-chrome"'), false);
    assert.equal(html.includes('data-audio-src="https://example.com/audio.ogg"'), true);
    assert.equal(html.includes('data-audio-title="Audio"'), true);
    assert.equal(html.includes('<audio preload="auto">'), true);
});

test('audio emoji forces image-link syntax to render as an audio player', () => {
    const html = parseMarkdown('![🎵 Audio](https://example.com/listen?id=1)');

    assert.match(html, /class="audio-player-container media-player-container"/);
    assert.equal(html.includes('data-audio-src="https://example.com/listen?id=1"'), true);
    assert.equal(html.includes('data-audio-title="Audio"'), true);
    assert.equal(html.includes('🎵'), false);
});

test('image-style audio parser keeps emoji-forced audio behavior reusable', () => {
    const audio = parseImageStyleAudio('![🎵 Audio](https://example.com/listen?id=1)');

    assert.deepEqual(audio, {
        src: 'https://example.com/listen?id=1',
        title: 'Audio'
    });
});

test('image-style audio list parser accepts comma-separated audio values', () => {
    const audio = parseImageStyleAudioList([
        '![🎵 First](https://example.com/listen?id=1)',
        '![🎵 Second](https://example.com/listen?id=2)'
    ].join(','));

    assert.deepEqual(audio, [
        { src: 'https://example.com/listen?id=1', title: 'First' },
        { src: 'https://example.com/listen?id=2', title: 'Second' }
    ]);
});

test('markdown horizontal rules keep optional blank-line gap markers on both sides', () => {
    const compactHtml = parseMarkdown('A\n\n---\n\nB');
    const expandedHtml = parseMarkdown('A\n\n\n---\n\n\nB');

    assert.match(compactHtml, /<p>A<\/p>\s*<hr>\s*<p>B<\/p>/);
    assert.equal(compactHtml.includes('class="markdown-gap"'), false);
    assert.match(expandedHtml, /<p>A<\/p>\s*<div class="markdown-gap"[^>]*data-md-gap-lines="2"[^>]*><\/div>\s*<hr>\s*<div class="markdown-gap"[^>]*data-md-gap-lines="2"[^>]*><\/div>\s*<p>B<\/p>/);
});

test('blank lines outside blockquotes keep visual gap markers', () => {
    const html = parseMarkdown('> 🔗 https://example.com\n\n\n##### Next');

    assert.match(html, /<\/blockquote>\s*<div class="markdown-gap"[^>]*data-md-gap-lines="2"[^>]*><\/div>\s*<h5>Next<\/h5>/);
});

test('blank lines inside list structure stay native markdown', () => {
    const html = parseMarkdown('- First\n\n\n- Second');

    assert.equal(html.includes('class="markdown-gap"'), false);
    assert.match(html, /<ul>\s*<li>[\s\S]*First[\s\S]*<\/li>\s*<li>[\s\S]*Second[\s\S]*<\/li>\s*<\/ul>/);
});

test('markdown tables preserve source column proportions as col widths', () => {
    const html = parseMarkdown([
        '| A  | B          | C |',
        '| -- | ---------- | - |',
        '| x  | y          | z |'
    ].join('\n'));

    assert.match(html, /<table data-md-table-widths="21\.053%,63\.158%,15\.789%">/);
    assert.match(html, /<colgroup><col style="width:21\.053%"><col style="width:63\.158%"><col style="width:15\.789%"><\/colgroup>/);
});

test('code blocks are syntax-highlighted at build time with hljs token markup', () => {
    const html = parseMarkdown([
        '```js',
        'const total = items.length;',
        '```'
    ].join('\n'));

    assert.match(html, /<pre><code class="hljs language-js">/);
    assert.match(html, /<span class="hljs-keyword">const<\/span>/);
    assert.doesNotMatch(html, /<code class="language-js">const total/);
});

test('code blocks without a known language stay escaped plain text', () => {
    const autoHtml = parseMarkdown([
        '```',
        'just some words & <tags>',
        '```'
    ].join('\n'));
    const unknownHtml = parseMarkdown([
        '```not-a-real-lang',
        'plain <body> text',
        '```'
    ].join('\n'));

    assert.match(autoHtml, /<pre><code class="hljs">/);
    assert.equal(autoHtml.includes('&lt;tags&gt;'), true, 'auto-detected output keeps HTML escaped');
    assert.match(unknownHtml, /<pre><code class="hljs language-not-a-real-lang">plain &lt;body&gt; text/);
    assert.doesNotMatch(unknownHtml, /class="hljs-/);
});

test('long code blocks ship pre-collapsed from the build instead of runtime measurement', () => {
    const longCode = Array.from({ length: 30 }, (_, i) => `line(${i});`).join('\n');
    const html = parseMarkdown('```js\n' + longCode + '\n```');

    assert.match(html, /class="code-block-container group code-fold collapsed-code"/);
    assert.match(html, /<div class="code-content" style="max-height:400px">/);
    assert.match(html, /class="code-fold-controls flex /);
    assert.doesNotMatch(html, /code-fold-controls hidden/);
    assert.match(html, /style="contain-intrinsic-size: auto \d+px"/);
});

test('short code blocks stay expanded without fold controls', () => {
    const html = parseMarkdown('```js\nconst a = 1;\nconst b = 2;\n```');

    assert.match(html, /class="code-block-container group"/);
    assert.doesNotMatch(html, /collapsed-code/);
    assert.doesNotMatch(html, /code-fold-controls/);
    assert.doesNotMatch(html, /max-height:400px/);
    assert.match(html, /style="contain-intrinsic-size: auto \d+px"/);
});

test('mermaid code blocks render as diagram containers with detected kinds', () => {
    const sequenceHtml = parseMarkdown([
        '```mermaid',
        'sequenceDiagram',
        '    Alice->>Bob: Hello',
        '```'
    ].join('\n'));
    const ganttHtml = parseMarkdown([
        '```mermaid',
        'gantt',
        '    title Release',
        '    Build :2026-06-01, 2d',
        '```'
    ].join('\n'));
    const classHtml = parseMarkdown([
        '```mermaid',
        'classDiagram',
        '    Animal <|-- Cat',
        '```'
    ].join('\n'));

    assert.match(sequenceHtml, /class="diagram-block mermaid-block my-6"/);
    assert.match(sequenceHtml, /data-mermaid-kind="sequence"/);
    assert.match(sequenceHtml, /data-mermaid-source="/);
    assert.doesNotMatch(sequenceHtml, /<pre><code/);
    assert.match(ganttHtml, /data-mermaid-kind="gantt"/);
    assert.match(classHtml, /data-mermaid-kind="class"/);
});

test('markdown image syntax keeps non-image URLs in the external embed flow with a placeholder', () => {
    const html = parseMarkdown('![](https://x.com/i/status/1930080468529230100)');

    assert.equal(html.includes('class="external-embed external-embed-twitter external-embed-loading"'), true);
    assert.equal(html.includes('src="/image/404.png"'), true);
    assert.equal(html.includes('class="external-embed-placeholder"'), true);
    assert.equal(html.includes('class="external-embed-loader placeholder-loader"'), true);
    assert.equal(html.includes('class="external-embed-content"><blockquote class="twitter-tweet"'), true);
    assert.equal(html.includes('data-embed-url="https://x.com/i/status/1930080468529230100"'), true);
});

test('markdown image syntax renders unknown non-image URLs as ready link cards', () => {
    const html = parseMarkdown('![Example](https://example.com/article)');

    assert.equal(html.includes('class="external-embed external-embed-link external-embed-ready"'), true);
    assert.equal(html.includes('src="/image/404.png"'), false);
    assert.equal(html.includes('class="external-embed-placeholder"'), false);
    assert.equal(html.includes('class="external-embed-loader placeholder-loader"'), false);
    assert.equal(html.includes('class="external-embed-content"><a href="https://example.com/article"'), true);
});

test('inline-code headings keep their own text in the table of contents', () => {
    const { headings, toc } = extractHeadingsAndGenerateTOC([
        '### `site_网站属性.md`',
        '',
        '常改的几项：网站名称、网站描述、首页标题、头像、网站图标、默认主题、每页显示文章数量、底部版权文字。',
        '',
        '### `social_社交媒体.md`',
        '',
        '每个社交平台一般有三类字段。'
    ].join('\n'));

    assert.deepEqual(headings.map(heading => heading.text), [
        'site_网站属性.md',
        'social_社交媒体.md'
    ]);
    assert.equal(toc.includes('常改的几项'), false);
    assert.equal(toc.includes('每个社交平台一般有三类字段'), false);
});
