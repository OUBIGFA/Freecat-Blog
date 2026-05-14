const test = require('node:test');
const assert = require('node:assert/strict');

const { autoSpacing, parseMarkdown } = require('../build/markdown');

test('markdown image URLs keep mixed Chinese, numbers, and latin text intact', () => {
    const markdown = '![cover](https://imghub.469821.xyz/file/image/ChatGPT_Image_2026年5月13日_16_02_34.png)';
    const html = parseMarkdown(markdown);

    assert.match(html, /src="https:\/\/imghub\.469821\.xyz\/file\/image\/ChatGPT_Image_2026年5月13日_16_02_34\.png"/);
    assert.doesNotMatch(html, /2026 年 5 月 13 日/);
});

test('markdown links and bare URLs are protected before auto spacing', () => {
    const linked = autoSpacing('查看[图片](https://example.com/2026年5月13日/fileA.png)和https://example.com/版本2beta');

    assert.equal(linked, '查看[图片](https://example.com/2026年5月13日/fileA.png)和https://example.com/版本2beta');
});

