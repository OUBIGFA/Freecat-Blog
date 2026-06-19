const test = require('node:test');
const assert = require('node:assert/strict');

const { parseMarkdown, extractHeadingsAndGenerateTOC, addHeadingIds, parseImageStyleAudio, parseImageStyleAudioList, stripMarkdown } = require('../build/markdown.js');
const { renderPostContent } = require('../build/pages/post-content.js');

test('callout titles are rendered as text', () => {
    const html = parseMarkdown('> [!note] <img src=x onerror=alert(1)>\\n> content');

    assert.equal(html.includes('<span class="callout-title-inner"><img'), false);
    assert.equal(html.includes('&lt;img src=x onerror=alert(1)&gt;'), true);
});

test('raw html in article markdown is preserved', () => {
    const html = parseMarkdown('<section class="native-html"><h2>Raw HTML</h2><p>Custom block</p></section>\n\nText');

    assert.equal(html.includes('<section class="native-html"><h2>Raw HTML</h2><p>Custom block</p></section>'), true);
    assert.equal(html.includes('&lt;section'), false);
});

test('raw html headings do not steal markdown heading ids', () => {
    const { html, toc } = renderPostContent({
        post: {
            content: '<h2 class="native-heading">Raw HTML</h2>\n\n## Markdown Heading',
            faq: []
        }
    });

    assert.match(toc, /href="#markdown-heading">Markdown Heading<\/a>/);
    assert.match(html, /<h2 class="native-heading">Raw HTML<\/h2>/);
    assert.doesNotMatch(html, /id="markdown-heading"[^>]*>Raw HTML/);
    assert.doesNotMatch(html, /<h2[^>]*class="[^"]*article-heading[^"]*"[^>]*>Raw HTML<\/h2>/);
    assert.match(html, /<h3 id="markdown-heading"[^>]*>Markdown Heading<\/h3>/);
});

test('markdown parser restores render options after an error', () => {
    assert.throws(
        () => parseMarkdown('```js\nconst x = 1;\n```', { getHighlightHtml() { throw new Error('forced highlight failure'); } }),
        /forced highlight failure/
    );

    const imageHtml = parseMarkdown('![Alt](/image/freecat.png "Caption")');

    assert.equal(imageHtml.includes('<figcaption'), false);
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

test('heading attributes are preserved when article heading classes are added', () => {
    const markdown = [
        '### AI测试集',
        '#### ARC-AGI-3',
        '',
        '### 智能体工具',
        '',
        '#### [Understand-Anything](https://github.com/Lum1104/Understand-Anything)'
    ].join('\n');
    const { headings } = extractHeadingsAndGenerateTOC(markdown);
    const html = addHeadingIds(parseMarkdown(markdown, { markMarkdownHeadings: true }), headings);

    assert.match(
        html,
        /<h4 id="arc-agi-3" class="markdown-attached-block article-heading article-heading-depth-4 article-heading-rank-2 article-heading-source-h4 scroll-mt-24">ARC-AGI-3<\/h4>/
    );
    assert.match(
        html,
        /<h4 id="understand-anything" class="article-heading article-heading-depth-4 article-heading-rank-2 article-heading-source-h4 scroll-mt-24"><a[^>]+>Understand-Anything<\/a><\/h4>/
    );
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

test('markdown image syntax marks every rendered block for unified centering', () => {
    const imageHtml = parseMarkdown('![](/image/freecat.png)');
    const externalHtml = parseMarkdown('![](https://x.com/i/status/1751646488948814314)');
    const videoHtml = parseMarkdown('![](https://example.com/video.mp4)');
    const audioHtml = parseMarkdown('![](https://example.com/audio.ogg)');
    const blockquoteVideoHtml = parseMarkdown('> [🎬 Demo](https://example.com/video.mp4)');

    assert.match(imageHtml, /<figure class="post-image markdown-image-block relative w-full">/);
    assert.match(externalHtml, /<figure class="external-embed external-embed-twitter external-embed-loading markdown-image-block"/);
    assert.match(videoHtml, /class="video-player-container media-player-container markdown-image-block"/);
    assert.match(audioHtml, /class="audio-player-container media-player-container markdown-image-block"/);
    assert.doesNotMatch(blockquoteVideoHtml, /markdown-image-block/);
});

test('markdown image syntax renders direct video URLs as complete video players', () => {
    const html = parseMarkdown('![Demo](https://example.com/video.mp4?download=1)');

    assert.match(html, /class="video-player-container media-player-container markdown-image-block"/);
    assert.equal(html.includes('class="video-player-stage"'), true);
    assert.equal(html.includes('class="media-play-btn video-play-btn"'), true);
    assert.equal(html.includes('class="media-player-loading-chrome"'), false);
    assert.equal(html.includes('data-video-src="https://example.com/video.mp4?download=1"'), true);
    assert.equal(html.includes('data-video-title="Demo"'), true);
    assert.equal(html.includes('class="post-image-loader placeholder-loader"'), false);
});

test('video emoji forces image-link syntax to render as a video player', () => {
    const html = parseMarkdown('![🎬 Demo](https://example.com/watch?id=1)');

    assert.match(html, /class="video-player-container media-player-container markdown-image-block"/);
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

    assert.match(html, /class="video-player-container media-player-container markdown-image-block"/);
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

test('stripMarkdown keeps link text for inline, angle-wrapped, autolink, and reference links', () => {
    const source = [
        '<[https://linux.do/t/topic/462102](https://linux.do/t/topic/462102)>',
        '[XXX](YYYYY)',
        '<https://search.google.com/search-console>',
        '<mail@example.com>',
        '[参考链接][ref]',
        '',
        '[ref]: https://example.com'
    ].join('\n');

    assert.equal(
        stripMarkdown(source, { preserveLineBreaks: true }),
        [
            'https://linux.do/t/topic/462102',
            'XXX',
            'https://search.google.com/search-console',
            'mail@example.com',
            '参考链接'
        ].join('\n')
    );
});

test('stripMarkdown ignores large preview blocks while keeping surrounding text', () => {
    const source = [
        '开头正文',
        '![封面图](https://example.com/cover.png)',
        '![参考图][img]',
        '<video src="https://example.com/demo.mp4">fallback text</video>',
        '<iframe src="https://example.com/embed"></iframe>',
        '| 名称 | 地址 |',
        '| --- | --- |',
        '| 很长的表格内容 | https://example.com/large |',
        '[img]: https://example.com/ref.png',
        '[普通链接](https://example.com/image.png)',
        '结尾正文'
    ].join('\n');

    assert.equal(
        stripMarkdown(source, { preserveLineBreaks: true }),
        ['开头正文', '普通链接', '结尾正文'].join('\n')
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
    assert.match(html, /class="audio-player-container media-player-container markdown-image-block"/);
    assert.equal(html.includes('class="media-play-btn audio-play-btn"'), true);
    assert.equal(html.includes('class="media-player-loading-chrome"'), false);
    assert.equal(html.includes('data-audio-src="https://example.com/audio.ogg"'), true);
    assert.equal(html.includes('data-audio-title="Audio"'), true);
    assert.equal(html.includes('<audio preload="auto">'), true);
});

test('audio emoji forces image-link syntax to render as an audio player', () => {
    const html = parseMarkdown('![🎵 Audio](https://example.com/listen?id=1)');

    assert.match(html, /class="audio-player-container media-player-container markdown-image-block"/);
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

test('markdown horizontal rules suppress optional blank-line gap markers on both sides', () => {
    const compactHtml = parseMarkdown('A\n\n---\n\nB');
    const expandedHtml = parseMarkdown('A\n\n\n---\n\n\nB');
    const unevenHtml = parseMarkdown('A\n\n\n---\n\nB');

    assert.match(compactHtml, /<p>A<\/p>\s*<hr>\s*<p>B<\/p>/);
    assert.equal(compactHtml.includes('class="markdown-gap"'), false);
    assert.match(expandedHtml, /<p>A<\/p>\s*<hr>\s*<p>B<\/p>/);
    assert.equal(expandedHtml.includes('class="markdown-gap"'), false);
    assert.match(unevenHtml, /<p>A<\/p>\s*<hr>\s*<p>B<\/p>/);
    assert.equal(unevenHtml.includes('class="markdown-gap"'), false);
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

test('only source blocks with zero blank lines are marked as one body group', () => {
    const directHtml = parseMarkdown([
        '第一段',
        '> 引用内容',
        '第二段',
        '```js',
        'const value = 1;',
        '```'
    ].join('\n'));
    const singleBlankHtml = parseMarkdown([
        '第一段',
        '',
        '第二段'
    ].join('\n'));
    const doubleBlankHtml = parseMarkdown([
        '第一段',
        '',
        '',
        '第二段',
        '',
        '',
        '> 引用内容'
    ].join('\n'));

    assert.equal(directHtml.includes('class="markdown-gap"'), false);
    assert.match(directHtml, /<p>第一段<\/p>\s*<blockquote class="markdown-attached-block">/);
    assert.match(directHtml, /<\/blockquote>\s*<p class="markdown-attached-block">第二段<\/p>/);
    assert.match(directHtml, /<div class="code-block-container group markdown-attached-block"/);
    assert.equal(singleBlankHtml.includes('markdown-attached-block'), false);
    assert.equal(singleBlankHtml.includes('class="markdown-gap"'), false);
    assert.match(singleBlankHtml, /<p>第一段<\/p>\s*<p>第二段<\/p>/);
    assert.equal((doubleBlankHtml.match(/class="markdown-gap"/g) || []).length, 2);
    assert.equal(doubleBlankHtml.includes('markdown-attached-block'), false);
    assert.match(doubleBlankHtml, /<p>第一段<\/p>\s*<div class="markdown-gap"[^>]*><\/div>\s*<p>第二段<\/p>/);
    assert.match(doubleBlankHtml, /<p>第二段<\/p>\s*<div class="markdown-gap"[^>]*><\/div>\s*<blockquote>/);
});

test('paragraph-led lists are marked only when the list is directly attached', () => {
    const compactHtml = parseMarkdown('这类基因突变主要涉及两类基因\n- 促进细胞生长的基因\n- 抑制细胞生长的基因');
    const expandedHtml = parseMarkdown('这类基因突变主要涉及两类基因\n\n- 促进细胞生长的基因');
    const orderedHtml = parseMarkdown('现代医学治疗癌症\n1. 局部肿瘤\n2. 全身治疗');
    const nestedListHtml = parseMarkdown('- 父级\n  - 子级');

    assert.match(compactHtml, /<p class="markdown-list-lead">[\s\S]*<\/p>\s*<ul class="markdown-attached-list">/);
    assert.match(orderedHtml, /<p class="markdown-list-lead">[\s\S]*<\/p>\s*<ol class="markdown-attached-list">/);
    assert.equal(expandedHtml.includes('markdown-list-lead'), false);
    assert.equal(expandedHtml.includes('markdown-attached-list'), false);
    assert.equal(nestedListHtml.includes('markdown-list-lead'), false);
    assert.equal(nestedListHtml.includes('markdown-attached-list'), false);
});

test('attached list markers stay on their own lead paragraph across nearby paragraphs', () => {
    const html = parseMarkdown([
        '这种基因突变主要涉及两类基因：',
        '- 促进细胞生长的基因',
        '- 抑制细胞生长的基因',
        '',
        '癌细胞的扩散也是一个渐进的过程。',
        '',
        '现代医学治疗癌症，完全是根据肿瘤的生长和扩散状况量身定制的：',
        '- 局部肿瘤',
        '- 全身性系统治疗'
    ].join('\n'));

    assert.match(html, /<p class="markdown-list-lead">这种[\s\S]*?<\/p>\s*<ul class="markdown-attached-list">/);
    assert.match(html, /<p>癌细胞的扩散也是一个渐进的过程。<\/p>\s*<p class="markdown-list-lead">现代医学治疗癌症/);
    assert.equal((html.match(/class="markdown-list-lead"/g) || []).length, 2);
    assert.equal((html.match(/class="markdown-attached-list"/g) || []).length, 2);
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

    assert.equal(html.includes('class="external-embed external-embed-twitter external-embed-loading markdown-image-block"'), true);
    assert.equal(html.includes('src="/image/404.png"'), true);
    assert.equal(html.includes('class="external-embed-placeholder"'), true);
    assert.equal(html.includes('class="external-embed-loader placeholder-loader"'), true);
    assert.equal(html.includes('class="external-embed-content"><blockquote class="twitter-tweet"'), true);
    assert.equal(html.includes('data-embed-url="https://x.com/i/status/1930080468529230100"'), true);
});

test('markdown image syntax renders unknown non-image URLs as ready link cards', () => {
    const html = parseMarkdown('![Example](https://example.com/article)');

    assert.equal(html.includes('class="external-embed external-embed-link external-embed-ready markdown-image-block"'), true);
    assert.equal(html.includes('src="/image/404.png"'), false);
    assert.equal(html.includes('class="external-embed-placeholder"'), false);
    assert.equal(html.includes('class="external-embed-loader placeholder-loader"'), false);
    assert.equal(html.includes('class="external-embed-content"><a href="https://example.com/article"'), true);
});

test('markdown image syntax renders image resource URLs without extensions as images', () => {
    const googleThumbnailHtml = parseMarkdown('![美国纳指历史趋势图](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFswDLYwh-h2EQ2KuTTnlitYwx-qseXtx7F4idCEFg2A&s=10)');
    const genericThumbnailHtml = parseMarkdown('![Preview](https://cdn.example.com/thumbnail?id=abc123&w=1200)');
    const nestedSourceHtml = parseMarkdown('![Preview](https://cdn.example.com/proxy?src=https%3A%2F%2Fassets.example.com%2Fchart.webp)');

    for (const html of [googleThumbnailHtml, genericThumbnailHtml, nestedSourceHtml]) {
        assert.equal(html.includes('class="post-image markdown-image-block relative w-full"'), true);
        assert.equal(html.includes('class="external-embed external-embed-link'), false);
    }

    assert.equal(googleThumbnailHtml.includes('data-src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFswDLYwh-h2EQ2KuTTnlitYwx-qseXtx7F4idCEFg2A&amp;s=10"'), true);
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
