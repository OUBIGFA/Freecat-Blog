const test = require('node:test');
const assert = require('node:assert/strict');

const { extractHeadingsAndGenerateTOC, addHeadingIds } = require('../build/markdown');

test('TOC links map to unique generated heading ids when titles repeat', () => {
    const markdown = [
        '# Intro',
        '',
        'Text',
        '',
        '## Repeat',
        '',
        'Text',
        '',
        '## Repeat',
        '',
        'Text',
        '',
        '# Intro'
    ].join('\n');

    const { toc, headings } = extractHeadingsAndGenerateTOC(markdown);

    assert.deepEqual(headings.map((heading) => heading.id), [
        'intro',
        'repeat',
        'repeat-2',
        'intro-2'
    ]);
    assert.match(toc, /href="#repeat"/);
    assert.match(toc, /href="#repeat-2"/);
    assert.match(toc, /href="#intro-2"/);
});

test('rendered heading ids stay aligned with the generated TOC order', () => {
    const html = '<h1>Intro</h1>\n<p>Text</p>\n<h2>Repeat</h2>\n<h2>Repeat</h2>';
    const headings = [
        { level: 1, text: 'Intro', id: 'intro' },
        { level: 2, text: 'Repeat', id: 'repeat' },
        { level: 2, text: 'Repeat', id: 'repeat-2' }
    ];

    const rendered = addHeadingIds(html, headings);

    assert.match(rendered, /<h1 id="intro"/);
    assert.match(rendered, /<h2 id="repeat"/);
    assert.match(rendered, /<h2 id="repeat-2"/);
});

test('article heading visual depth follows the original markdown level', () => {
    const html = '<h3>First visible section</h3>\n<p>Text</p>\n<h4>Child section</h4>';
    const headings = [
        { level: 3, text: 'First visible section', id: 'first-visible-section' },
        { level: 4, text: 'Child section', id: 'child-section' }
    ];

    const rendered = addHeadingIds(html, headings);

    assert.match(rendered, /<h3 id="first-visible-section" class="[^"]*article-heading-depth-3/);
    assert.match(rendered, /<h4 id="child-section" class="[^"]*article-heading-depth-4/);
    assert.doesNotMatch(rendered, /article-heading-depth-1/);
});

test('rendered heading tag can shift for page semantics without changing visual source level', () => {
    const html = '<h3>Section</h3>';
    const headings = [
        { level: 3, renderedLevel: 4, text: 'Section', id: 'section' }
    ];

    const rendered = addHeadingIds(html, headings);

    assert.match(rendered, /<h4 id="section" class="[^"]*article-heading-depth-3[^"]*article-heading-source-h3/);
});
