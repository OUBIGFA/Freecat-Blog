const { test, expect } = require('@playwright/test');

const articleUrl = '/posts/2026053111535907/';
const ganttSelector = '.pele-block[data-diagram-kind="gantt"]';

// 检查真实 SVG 的文字包围盒，不以配置值或源码字符串代替可见的对齐结果。
async function taskBounds(diagram) {
    return diagram.locator('.pele-task').evaluateAll(tasks => tasks.map(task => {
        const bar = task.querySelector('rect').getBBox();
        const label = task.querySelector('.pele-label').getBBox();
        return {
            name: task.textContent.trim(),
            inside: label.x >= bar.x - 0.5 && label.x + label.width <= bar.x + bar.width + 0.5,
            centered: Math.abs(label.y + label.height / 2 - bar.y - bar.height / 2) < 2
        };
    }));
}

test.beforeEach(async ({ page }) => {
    // Pele、字体和公式均随站托管；外部服务不应决定这些回归测试是否通过。
    await page.route(/^https:\/\//, route => route.abort());
});

test('Gantt task names stay on their bars at desktop and 320px, with working zoom', async ({ page }) => {
    await page.goto(articleUrl);
    const diagram = page.locator(ganttSelector);
    const svg = diagram.locator('.pele-diagram > svg');
    await expect(svg).toBeVisible();
    for (const width of [1280, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await expect.poll(async () => (await taskBounds(diagram)).every(task => task.inside && task.centered)).toBe(true);
        expect((await taskBounds(diagram)).map(task => task.name)).toContain('需求分析');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    const fitted = await svg.getAttribute('viewBox');
    const zoomIn = diagram.getByRole('button', { name: '放大图表', exact: true });
    // 窄屏先看全图，再放大到可读字号；原生缩放不能把文字和色块分开。
    for (let i = 0; i < 5; i++) await zoomIn.click();
    expect(await svg.getAttribute('viewBox')).not.toBe(fitted);
    // 放大后的阅读区不能仍只有全图缩略图的高度，否则手机只能看到一行。
    expect((await svg.boundingBox()).height).toBeGreaterThanOrEqual(240);
    expect(await svg.locator('.pele-task .pele-label').first().evaluate(label => {
        return parseFloat(getComputedStyle(label).fontSize) * label.getScreenCTM().a;
    })).toBeGreaterThanOrEqual(12);
    expect((await taskBounds(diagram)).every(task => task.inside && task.centered)).toBe(true);
    const zoomed = await svg.getAttribute('viewBox');
    await svg.focus();
    await page.keyboard.press('ArrowRight');
    expect(await svg.getAttribute('viewBox')).not.toBe(zoomed);
    await diagram.getByRole('button', { name: '重置图表缩放' }).click();
    await expect(svg).toHaveAttribute('viewBox', fitted);
});

test('local diagrams use real bundled fonts and keep their SVG and zoom across theme changes', async ({ page, context }) => {
    await page.goto(articleUrl);
    const diagrams = page.locator('.pele-diagram > svg');
    await expect(diagrams).toHaveCount(4);
    await expect(page.locator('script[src*="mermaid"]')).toHaveCount(0);
    expect(await page.evaluate(() => typeof window.mermaid)).toBe('undefined');
    // 窄屏会把单词拆到不同 SVG text 节点；不把节点间是否保留空格当作换行契约。
    await expect(page.locator('.pele-block[data-diagram-kind="sequence"]')).toContainText(/Rational\s*thoughts\s*prevail/);
    await expect(page.locator('.pele-block[data-diagram-kind="sequence"]')).not.toContainText('<br');
    await expect(page.locator('.katex').first()).toBeVisible();

    // Chromium 返回实际用于渲染的字体，不只检查 CSS 字体栈声明。
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument');
    for (const selector of ['.pele-task .pele-label', '.pele-axis text']) {
        const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
        const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
        expect(fonts.length).toBeGreaterThan(0);
        expect(fonts.every(font => font.isCustomFont)).toBe(true);
        expect(await page.locator(selector).first().evaluate(el => getComputedStyle(el).fontVariantNumeric)).toBe('normal');
    }
    await cdp.detach();

    const gantt = page.locator(ganttSelector);
    await gantt.getByRole('button', { name: '放大图表', exact: true }).click();
    const before = await page.evaluate(() => {
        window.chartTestNodes = [...document.querySelectorAll('.pele-diagram > svg')];
        return {
            viewBoxes: window.chartTestNodes.map(svg => svg.getAttribute('viewBox')),
            fill: getComputedStyle(document.querySelector('.pele-task rect')).fill
        };
    });
    await page.locator('#theme-toggle').click();
    await expect.poll(() => page.locator('.pele-task rect').first().evaluate(el => getComputedStyle(el).fill)).not.toBe(before.fill);
    expect(await page.evaluate(() => ({
        same: window.chartTestNodes.every((svg, i) => svg === document.querySelectorAll('.pele-diagram > svg')[i]),
        viewBoxes: window.chartTestNodes.map(svg => svg.getAttribute('viewBox'))
    }))).toEqual({ same: true, viewBoxes: before.viewBoxes });
});

// 只替换已由生产 Markdown 管线编码的输入；页面、资产、字体与初始化仍走真实构建产物。
async function changeDiagramSource(page, index, change) {
    await page.route(`**${articleUrl}`, async route => {
        const response = await route.fetch();
        const html = await response.text();
        const encoded = [...html.matchAll(/data-diagram-source="([^"]+)"/g)][index][1];
        const source = Buffer.from(encoded, 'base64').toString('utf8');
        const replacement = Buffer.from(change(source)).toString('base64');
        await route.fulfill({ response, body: html.replace(`data-diagram-source="${encoded}"`, `data-diagram-source="${replacement}"`) });
    });
}

test('Gantt detection accepts comments and author YAML without changing task placement', async ({ page }) => {
    await changeDiagramSource(page, 2, source => '---\nconfig:\n  gantt:\n    useWidth: 1500\n---\n%% 注释\n' + source);
    await page.goto(articleUrl);
    const diagram = page.locator(ganttSelector);
    const svg = diagram.locator('.pele-diagram > svg');
    await expect(svg).toBeVisible();
    const width = await svg.getAttribute('width');
    expect(Number(width)).toBeGreaterThanOrEqual(1500);
    await page.setViewportSize({ width: 320, height: 900 });
    await expect(svg).toHaveAttribute('width', width);
    expect((await taskBounds(diagram)).every(task => task.inside && task.centered)).toBe(true);
});

test('invalid diagrams show an alert without silently switching engines or breaking siblings', async ({ page }) => {
    await changeDiagramSource(page, 0, () => 'flowchart LR\n A -->');
    await page.goto(articleUrl);
    await expect(page.locator('.pele-block.diagram-error [role="alert"]')).toHaveText('图表渲染失败，请检查图表语法或刷新重试。');
    await expect(page.locator('.pele-diagram > svg')).toHaveCount(3);
    await expect(page.locator('script[src*="mermaid"]')).toHaveCount(0);
});

