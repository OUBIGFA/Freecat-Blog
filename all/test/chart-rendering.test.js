const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { postJs } = require('../test-support/assets.js');

// 驱动文章模块的公开初始化路径，检查字体等待、原生主题和作者配置优先级。
function harness({ dark = false, authorOptions = {} } = {}) {
    let resolveFonts;
    const fontReady = new Promise(resolve => { resolveFonts = resolve; });
    const calls = { fonts: [], mermaid: [], charts: [] };
    const diagram = { textContent: 'flowchart LR; A[开始] --> B[结束]', getAttribute: () => '', setAttribute() {} };
    const mermaid = { getAttribute: () => '', querySelector: () => null, closest: () => diagram };
    const canvas = {};
    const echarts = {
        textContent: '',
        getAttribute: name => name === 'data-chart-options' ? Buffer.from(JSON.stringify(authorOptions)).toString('base64') : '',
        querySelector: () => canvas
    };
    const document = {
        readyState: 'complete',
        documentElement: { classList: { contains: () => dark } },
        fonts: { load(font, text) { calls.fonts.push({ font, text }); return fontReady; } },
        querySelectorAll: selector => ({
            '.diagram-block': [diagram, echarts],
            '.mermaid-block .mermaid': [mermaid],
            '.echarts-block': [echarts]
        })[selector] || [],
        querySelector: () => null,
        getElementById: () => null,
        addEventListener() {}
    };
    const window = {
        FreecatShared: {}, FreecatCodeFolding: { init() {} },
        atob: value => Buffer.from(value, 'base64').toString('binary'),
        addEventListener() {},
        requestAnimationFrame(fn) { return setImmediate(fn); },
        mermaid: {
            initialize: config => calls.mermaid.push(config),
            run: () => Promise.resolve()
        },
        echarts: {
            getInstanceByDom: () => null,
            init(_, theme, renderOptions) {
                const chart = { theme, renderOptions, setOption(options) { this.options = options; } };
                calls.charts.push(chart);
                return chart;
            }
        }
    };
    vm.runInNewContext(postJs, { window, document, console, Uint8Array });
    return { calls, resolveFonts, flush: () => new Promise(resolve => setImmediate(resolve)) };
}

test('diagrams wait for their fonts and use native layout with readable Gantt canvas', async () => {
    const h = harness();
    assert.equal(h.calls.fonts.length, 2);
    assert.equal(h.calls.mermaid.length, 0);
    assert.equal(h.calls.charts.length, 0);
    h.resolveFonts(); await h.flush();
    const config = h.calls.mermaid[0];
    assert.equal(config.gantt.useWidth, 1200);
    assert.equal(config.gantt.fontSize, 15);
    assert.equal(config.theme, 'base');
    assert.equal(config.themeVariables.primaryColor, 'transparent');
    assert.equal(config.themeVariables.titleColor, '#233044');
    assert.notEqual(config.themeVariables.doneTaskBkgColor, config.themeVariables.activeTaskBkgColor);
    assert.notEqual(config.themeVariables.critBkgColor, config.themeVariables.taskBkgColor);
});

test('chart theme keeps authored data and sizing while using bundled fonts', async () => {
    const authorOptions = {
        color: ['#123456'], animation: true,
        textStyle: { fontSize: 22, fontFamily: 'serif' },
        series: [{ type: 'bar', data: [1, 2, 3], label: { fontFamily: 'Arial' } }]
    };
    const h = harness({ dark: true, authorOptions });
    h.resolveFonts(); await h.flush();
    const chart = h.calls.charts[0];
    assert.equal(chart.theme.darkMode, true);
    assert.equal(chart.theme.textStyle.color, '#dbe4f0');
    assert.equal(chart.renderOptions.renderer, 'svg');
    assert.equal(chart.options.color[0], '#123456');
    assert.equal(chart.options.textStyle.fontFamily, '"Freecat Figtree", "Freecat Noto Sans SC", "Freecat Noto Emoji", "Freecat Noto Symbols", sans-serif');
    assert.equal(chart.options.series[0].label.fontFamily, chart.options.textStyle.fontFamily);
    assert.equal(chart.theme.title.textStyle.fontFamily, chart.options.textStyle.fontFamily);
    assert.equal(chart.options.textStyle.fontSize, 22);
    assert.equal(chart.options.animation, true);
    assert.deepEqual(Array.from(chart.options.series[0].data), [1, 2, 3]);
});
