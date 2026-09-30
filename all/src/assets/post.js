/* post.js
 * 文章页专属交互逻辑（曾经全部内联在 template_post.html）。
 *   - 代码块折叠辅助按钮 (.code-fold-controls / .fold-toggle-btn)
 *   - Share button（Web Share API + 剪贴板兜底）
 *   - TOC 锚点点击：history.replaceState + footer-safe 滚动定位
 * 代码高亮与折叠判定已移到构建期（build/markdown.js），运行时不再处理。
 */
(function () {
    'use strict';

    // shared.js 在 main.js / post.js 之前加载（template_post.html 中
    // <script src="/assets/shared.js"> 已先于本文件）。
    // 直接断言其存在，缺失 = 加载顺序被破坏，应早失败。
    var shared = window.FreecatShared;
    if (!shared) throw new Error('FreecatShared not loaded — ensure shared.js loads before post.js');
    var codeFolding = window.FreecatCodeFolding;
    if (!codeFolding || typeof codeFolding.init !== 'function') {
        throw new Error('FreecatCodeFolding not loaded - ensure code-folding.js loads before post.js');
    }

    function decodeBase64Utf8(value) {
        try {
            var binary = window.atob(value || '');
            var bytes = new Uint8Array(binary.length);
            for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            if (window.TextDecoder) return new TextDecoder('utf-8').decode(bytes);
            return decodeURIComponent(escape(binary));
        } catch (err) {
            return '';
        }
    }

    function renderChartError(container, message) {
        container.classList.add('diagram-error');
        container.innerHTML = '<p>Chart render failed. Please check the chart syntax.</p>';
        if (message) container.setAttribute('title', message);
    }

    var mermaidRenderState = {
        rendering: false,
        pending: false,
        observed: false
    };

    var echartsCharts = [];
    var echartsResizeBound = false;
    var diagramFontFamily = '"Freecat Figtree", "Freecat Noto Sans SC", "Freecat Noto Emoji", "Freecat Noto Symbols", sans-serif';

    function initMermaidBlocks() {
        renderMermaidBlocks();
        observeDiagramThemeChanges();
    }

    // 把 base64 源码还原进各 mermaid 块，并给容器标注图类型；返回待渲染块列表。
    function prepareMermaidBlocks(blocks) {
        var mermaidBlocks = [];
        blocks.forEach(function (block) {
            var source = decodeBase64Utf8(block.getAttribute('data-mermaid-source'));
            if (source) {
                block.textContent = source;
                block.removeAttribute('data-processed');
                var kind = getMermaidDiagramKind(source);
                var container = block.closest('.diagram-block');
                if (container) container.setAttribute('data-mermaid-kind', kind);
            }
            mermaidBlocks.push(block);
        });
        return mermaidBlocks;
    }

    function buildMermaidConfig() {
        return {
            startOnLoad: false,
            securityLevel: 'loose',
            theme: 'base',
            themeVariables: getMermaidThemeVariables(),
            flowchart: {
                htmlLabels: true,
                useMaxWidth: false,
                nodeSpacing: 34,
                rankSpacing: 48,
                curve: 'basis'
            },
            sequence: {
                showSequenceNumbers: true,
                actorMargin: 64,
                messageMargin: 44,
                boxMargin: 10,
                noteMargin: 10,
                mirrorActors: true
            },
            gantt: {
                useMaxWidth: false,
                // 原始时间轴容纳短任务标签；显示时连同文字等比适配正文。
                useWidth: 1200,
                axisFormat: '%m-%d',
                topPadding: 48,
                leftPadding: 96,
                gridLineStartPadding: 24,
                fontSize: 15,
                barHeight: 24,
                barGap: 6
            }
        };
    }

    function renderMermaidBlocks() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll('.mermaid-block .mermaid'));
        if (!blocks.length) return;
        if (!window.mermaid) {
            blocks.forEach(function (block) {
                renderChartError(block.closest('.diagram-block') || block, 'Mermaid library was not loaded.');
            });
            return;
        }
        if (mermaidRenderState.rendering) {
            mermaidRenderState.pending = true;
            return;
        }
        // 正在渲染时只排队，不能先清空原 SVG；主题切换完成后再还原源码。
        var mermaidBlocks = prepareMermaidBlocks(blocks);
        mermaidRenderState.rendering = true;
        mermaidRenderState.pending = false;

        try {
            window.mermaid.initialize(buildMermaidConfig());
            var result = window.mermaid.run({ nodes: mermaidBlocks });
            var finish = function () {
                polishMermaidSvg(mermaidBlocks);
                applyMermaidSvgSizes(mermaidBlocks);
                mermaidRenderState.rendering = false;
                if (mermaidRenderState.pending) {
                    mermaidRenderState.pending = false;
                    requestAnimationFrame(renderMermaidBlocks);
                }
            };
            if (result && typeof result.catch === 'function') {
                result.then(finish).catch(function (err) {
                    mermaidRenderState.rendering = false;
                    mermaidBlocks.forEach(function (block) {
                        if (!block.querySelector('svg')) {
                            renderChartError(block.closest('.diagram-block') || block, err && err.message);
                        }
                    });
                });
            } else {
                finish();
            }
        } catch (err) {
            mermaidRenderState.rendering = false;
            mermaidBlocks.forEach(function (block) {
                renderChartError(block.closest('.diagram-block') || block, err && err.message);
            });
        }
    }

    function getMermaidDiagramKind(source) {
        var firstLine = String(source || '').split(/\r?\n/).map(function (line) {
            return line.trim();
        }).filter(Boolean)[0] || '';
        if (/^sequenceDiagram\b/i.test(firstLine)) return 'sequence';
        if (/^gantt\b/i.test(firstLine)) return 'gantt';
        if (/^(?:graph|flowchart)\b/i.test(firstLine)) return 'flowchart';
        if (/^classDiagram(?:-v2)?\b/i.test(firstLine)) return 'class';
        if (/^stateDiagram(?:-v2)?\b/i.test(firstLine)) return 'state';
        if (/^erDiagram\b/i.test(firstLine)) return 'er';
        if (/^journey\b/i.test(firstLine)) return 'journey';
        if (/^pie\b/i.test(firstLine)) return 'pie';
        if (/^gitGraph\b/i.test(firstLine)) return 'git';
        if (/^mindmap\b/i.test(firstLine)) return 'mindmap';
        if (/^timeline\b/i.test(firstLine)) return 'timeline';
        if (/^quadrantChart\b/i.test(firstLine)) return 'quadrant';
        if (/^xychart-beta\b/i.test(firstLine)) return 'xychart';
        if (/^block-beta\b/i.test(firstLine)) return 'block';
        if (/^packet-beta\b/i.test(firstLine)) return 'packet';
        if (/^architecture-beta\b/i.test(firstLine)) return 'architecture';
        return 'diagram';
    }

    function getMermaidThemeVariables() {
        var root = document.documentElement;
        var isDark = !!(root && root.classList && root.classList.contains && root.classList.contains('dark'));
        return {
            fontFamily: diagramFontFamily,
            fontSize: '16px',
            darkMode: isDark,
            background: isDark ? '#101622' : '#ffffff',
            primaryColor: 'transparent',
            primaryTextColor: isDark ? '#e7edf6' : '#0f172a',
            primaryBorderColor: isDark ? '#516176' : '#94a3b8',
            lineColor: isDark ? '#94a3b8' : '#64748b',
            secondaryColor: 'transparent',
            tertiaryColor: 'transparent',
            textColor: isDark ? '#e7edf6' : '#233044',
            titleColor: isDark ? '#e7edf6' : '#233044',
            actorBkg: 'transparent',
            actorBorder: isDark ? '#516176' : '#94a3b8',
            actorTextColor: isDark ? '#e5edf6' : '#0f172a',
            noteBkgColor: isDark ? '#2b2818' : '#fff7c2',
            noteBorderColor: isDark ? '#7a6f3a' : '#d8ca70',
            noteTextColor: isDark ? '#f4efd2' : '#1f2937',
            sequenceNumberColor: '#ffffff',
            signalColor: isDark ? '#8da0b6' : '#334155',
            signalTextColor: isDark ? '#e5edf6' : '#0f172a',
            edgeLabelBackground: isDark ? '#1e293b' : '#f8fafc',
            labelBoxBkgColor: 'transparent',
            labelBoxBorderColor: isDark ? '#516176' : '#94a3b8',
            labelTextColor: isDark ? '#e5edf6' : '#0f172a',
            loopTextColor: isDark ? '#e5edf6' : '#0f172a',
            activationBkgColor: isDark ? '#202b3e' : '#f1f5f9',
            activationBorderColor: isDark ? '#4b5d77' : '#cbd5e1',
            sectionBkgColor: isDark ? '#172033' : '#f8fafc',
            altSectionBkgColor: isDark ? '#111827' : '#ffffff',
            gridColor: isDark ? '#2f3d51' : '#d7dee8',
            taskBkgColor: isDark ? '#4b5563' : '#dce6f2',
            taskTextColor: isDark ? '#ffffff' : '#233044',
            taskTextOutsideColor: isDark ? '#dbe4f0' : '#233044',
            taskTextDarkColor: isDark ? '#e7edf6' : '#233044',
            taskBorderColor: isDark ? '#6b7280' : '#9aa8bc',
            activeTaskBkgColor: isDark ? '#5f6c7d' : '#c9d8e8',
            activeTaskBorderColor: isDark ? '#8b96a7' : '#8fa1b8',
            doneTaskBkgColor: isDark ? '#253247' : '#e6edf5',
            doneTaskBorderColor: isDark ? '#475569' : '#b8c5d6',
            critBkgColor: isDark ? '#665f4a' : '#eadfb8',
            critBorderColor: isDark ? '#8c805f' : '#c8b773',
            todayLineColor: isDark ? '#b77b55' : '#8b6f4e'
        };
    }

    function polishMermaidSvg(blocks) {
        blocks.forEach(function (block) {
            var svg = block.querySelector('svg');
            if (!svg || typeof svg.createSVGRect === 'undefined') return;
            fitMermaidRects(svg.querySelectorAll('.node rect, rect.labelBox'), 14, 10);
            normalizeMermaidActorBoxes(svg);
            fitMermaidLabelBackgrounds(svg);
            positionMermaidClusterLabels(svg);
            fitMermaidSequenceNumbers(svg);
        });
    }

    function fitMermaidRects(rects, padX, padY) {
        Array.prototype.forEach.call(rects, function (rect) {
            var parent = rect.parentNode;
            if (!parent || typeof parent.querySelector !== 'function') return;
            var text = parent.querySelector('text');
            if (!text || typeof text.getBBox !== 'function') return;
            try {
                var textBox = text.getBBox();
                var rectBox = rect.getBBox();
                var width = Math.max(rectBox.width, textBox.width + padX * 2);
                var height = Math.max(rectBox.height, textBox.height + padY * 2);
                var centerX = rectBox.x + rectBox.width / 2;
                var centerY = rectBox.y + rectBox.height / 2;
                rect.setAttribute('x', centerX - width / 2);
                rect.setAttribute('y', centerY - height / 2);
                rect.setAttribute('width', width);
                rect.setAttribute('height', height);
                rect.setAttribute('rx', 4);
                rect.setAttribute('ry', 4);
            } catch (err) {
                // Some browsers defer SVG bbox calculation for hidden nodes.
            }
        });
    }

    function normalizeMermaidActorBoxes(svg) {
        var actorEdgesByCenter = {};
        Array.prototype.forEach.call(svg.querySelectorAll('rect.actor'), function (rect) {
            var height = parseFloat(rect.getAttribute('height'));
            var x = parseFloat(rect.getAttribute('x'));
            var width = parseFloat(rect.getAttribute('width'));
            var y = parseFloat(rect.getAttribute('y'));
            if (!Number.isFinite(height) || !Number.isFinite(x) || !Number.isFinite(width) || !Number.isFinite(y)) return;
            var targetHeight = 38;
            var centerY = y + height / 2;
            var nextY = centerY - targetHeight / 2;
            var centerX = Math.round(x + width / 2);
            rect.setAttribute('y', centerY - targetHeight / 2);
            rect.setAttribute('height', targetHeight);
            rect.setAttribute('rx', 4);
            rect.setAttribute('ry', 4);
            if (!actorEdgesByCenter[centerX]) actorEdgesByCenter[centerX] = {};
            if (rect.classList.contains('actor-top')) actorEdgesByCenter[centerX].topBottom = nextY + targetHeight;
            if (rect.classList.contains('actor-bottom')) actorEdgesByCenter[centerX].bottomTop = nextY;
        });

        Array.prototype.forEach.call(svg.querySelectorAll('.actor-line'), function (line) {
            var x1 = parseFloat(line.getAttribute('x1'));
            var x2 = parseFloat(line.getAttribute('x2'));
            if (!Number.isFinite(x1) || !Number.isFinite(x2) || Math.round(x1) !== Math.round(x2)) return;
            var edges = actorEdgesByCenter[Math.round(x1)];
            if (!edges) return;
            if (Number.isFinite(edges.topBottom)) line.setAttribute('y1', edges.topBottom);
            if (Number.isFinite(edges.bottomTop)) line.setAttribute('y2', edges.bottomTop);
        });
    }

    function fitMermaidLabelBackgrounds(svg) {
        Array.prototype.forEach.call(svg.querySelectorAll('.edgeLabel'), function (label) {
            Array.prototype.forEach.call(label.querySelectorAll('rect.freecat-mermaid-label-bg'), function (rect) {
                rect.remove();
            });

            var labelGroup = label.querySelector('g.label');
            var foreignObject = label.querySelector('foreignObject');
            var labelBkg = label.querySelector('.labelBkg');
            if (!labelGroup || !foreignObject || !labelBkg || !(label.textContent || '').trim()) return;

            var padX = 7;
            var padY = 4;
            var currentWidth = parseFloat(foreignObject.getAttribute('width')) || 0;
            var currentHeight = parseFloat(foreignObject.getAttribute('height')) || 0;
            if (!currentWidth || !currentHeight) return;

            var width = Math.ceil(currentWidth + padX * 2);
            var height = Math.ceil(currentHeight + padY * 2);
            foreignObject.setAttribute('width', width);
            foreignObject.setAttribute('height', height);
            labelGroup.setAttribute('transform', 'translate(' + (-width / 2) + ', ' + (-height / 2) + ')');

            labelBkg.style.padding = padY + 'px ' + padX + 'px';
            labelBkg.style.boxSizing = 'border-box';
            labelBkg.style.display = 'flex';
            labelBkg.style.alignItems = 'center';
            labelBkg.style.justifyContent = 'center';
            labelBkg.style.width = '100%';
            labelBkg.style.height = '100%';
        });
    }

    function positionMermaidClusterLabels(svg) {
        Array.prototype.forEach.call(svg.querySelectorAll('g.cluster'), function (cluster) {
            var rect = cluster.querySelector('rect');
            var label = cluster.querySelector('.cluster-label');
            var foreignObject = label ? label.querySelector('foreignObject') : null;
            if (!rect || !label || !foreignObject || !(label.textContent || '').trim()) return;

            var x = parseFloat(rect.getAttribute('x'));
            var y = parseFloat(rect.getAttribute('y'));
            if (!Number.isFinite(x) || !Number.isFinite(y)) return;

            var currentWidth = parseFloat(foreignObject.getAttribute('width')) || 0;
            var currentHeight = parseFloat(foreignObject.getAttribute('height')) || 0;
            if (currentWidth > 0) foreignObject.setAttribute('width', Math.ceil(currentWidth + 16));
            if (currentHeight > 0) foreignObject.setAttribute('height', Math.ceil(currentHeight + 4));

            label.classList.add('freecat-mermaid-cluster-label');
            label.setAttribute('transform', 'translate(' + (x + 14) + ', ' + (y + 8) + ')');
        });
    }

    function fitMermaidSequenceNumbers(svg) {
        Array.prototype.forEach.call(svg.querySelectorAll('rect.freecat-mermaid-sequence-number-bg'), function (rect) {
            rect.remove();
        });

        Array.prototype.forEach.call(svg.querySelectorAll('text.sequenceNumber'), function (text) {
            if (!text.textContent || !text.textContent.trim() || typeof text.getBBox !== 'function') return;
            try {
                // Mermaid hardcodes sans-serif here; measure the badge with the bundled font.
                text.setAttribute('font-family', diagramFontFamily);
                var box = text.getBBox();
                var padX = 4;
                var padY = 2;
                var size = Math.max(18, Math.ceil(Math.max(box.width + padX * 2, box.height + padY * 2)));
                var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('class', 'freecat-mermaid-sequence-number-bg');
                rect.setAttribute('x', Math.round(box.x + box.width / 2 - size / 2));
                rect.setAttribute('y', Math.round(box.y + box.height / 2 - size / 2));
                rect.setAttribute('width', size);
                rect.setAttribute('height', size);
                rect.setAttribute('rx', Math.round(size / 2));
                rect.setAttribute('ry', Math.round(size / 2));
                text.parentNode.insertBefore(rect, text);
                text.classList.add('freecat-mermaid-sequence-number');
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dominant-baseline', 'central');
                text.setAttribute('x', Math.round(box.x + box.width / 2));
                text.setAttribute('y', Math.round(box.y + box.height / 2));
            } catch (err) {
                // Some browsers defer SVG bbox calculation for hidden nodes.
            }
        });
    }

    function observeDiagramThemeChanges() {
        if (typeof MutationObserver === 'undefined' || !document.documentElement) return;
        if (mermaidRenderState.observed) return;
        mermaidRenderState.observed = true;
        // 只在深/浅状态真正翻转时重渲染：主题切换过程中 html 上还会增删
        // theme-transitioning / theme-instant 等辅助类，不能每次 class 变化都
        // 触发一轮 mermaid 全量重渲染。
        var lastIsDark = document.documentElement.classList.contains('dark');
        var observer = new MutationObserver(function (mutations) {
            var changed = mutations.some(function (mutation) {
                return mutation.type === 'attributes' && mutation.attributeName === 'class';
            });
            if (!changed) return;
            var isDark = document.documentElement.classList.contains('dark');
            if (isDark === lastIsDark) return;
            lastIsDark = isDark;
            requestAnimationFrame(function () {
                renderMermaidBlocks();
                initEchartsBlocks();
            });
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }

    function getDiagramAvailableWidth(container) {
        if (!container) return 0;
        var style = window.getComputedStyle ? window.getComputedStyle(container) : null;
        var paddingLeft = style ? parseFloat(style.paddingLeft) || 0 : 0;
        var paddingRight = style ? parseFloat(style.paddingRight) || 0 : 0;
        var innerWidth = container.clientWidth - paddingLeft - paddingRight;
        return Math.max(1, Math.floor(innerWidth));
    }

    function getSvgViewBoxWidth(svg) {
        var viewBox = String(svg.getAttribute('viewBox') || '').trim().split(/\s+/).map(Number);
        if (viewBox.length === 4 && Number.isFinite(viewBox[2]) && viewBox[2] > 0) {
            return Math.ceil(viewBox[2]);
        }
        var attrWidth = parseFloat(svg.getAttribute('width'));
        if (Number.isFinite(attrWidth) && attrWidth > 0) return Math.ceil(attrWidth);
        return 0;
    }

    function applyMermaidSvgSizes(blocks) {
        blocks.forEach(function (block) {
            var svg = block.querySelector('svg');
            if (!svg) return;
            var container = block.closest('.diagram-block');
            var width = getSvgViewBoxWidth(svg);
            var availableWidth = getDiagramAvailableWidth(container);
            // 保持布局比例，整张图缩进正文宽度，不增加内部滚动条。
            var finalWidth = Math.min(width || availableWidth, availableWidth);
            if (finalWidth > 0) svg.style.width = finalWidth + 'px';
            svg.style.maxWidth = '100%';
        });
    }

    function initMarkdownSizing() {
        var mathBlocks = Array.prototype.slice.call(document.querySelectorAll('.prose .katex-display'));
        var diagrams = Array.prototype.slice.call(document.querySelectorAll('.mermaid-block .mermaid'));
        if (!mathBlocks.length && !diagrams.length) return;
        var frame = 0;
        function fit() {
            frame = 0;
            applyMermaidSvgSizes(diagrams);
            mathBlocks.forEach(function (block) {
                var formula = block.querySelector('.katex');
                if (!formula) return;
                // zoom 同时缩小公式和占位高度，避免裁切或残留一整块空白。
                formula.style.zoom = '1';
                var naturalWidth = formula.getBoundingClientRect().width;
                if (naturalWidth > 0) formula.style.zoom = String(Math.min(1, block.clientWidth / naturalWidth));
            });
        }
        function schedule() {
            if (!frame) frame = window.requestAnimationFrame(fit);
        }
        schedule();
        window.addEventListener('resize', schedule);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    }

    // 主题只提供默认视觉值，作者的轴、数据系列、颜色和交互配置仍由 setOption 优先应用。
    function getEchartsTheme(isDark) {
        var text = isDark ? '#dbe4f0' : '#334155';
        var muted = isDark ? '#a4b1c3' : '#64748b';
        var rule = isDark ? '#334155' : '#dce2ea';
        var axis = {
            axisLine: { lineStyle: { color: rule } },
            axisTick: { show: false },
            axisLabel: { color: muted, fontSize: 13 },
            splitLine: { lineStyle: { color: rule, type: 'dashed' } },
            nameTextStyle: { color: muted }
        };
        return {
            darkMode: isDark,
            color: isDark
                ? ['#91b4d4', '#93b9aa', '#b3a2c8', '#cfb587', '#cd9d96', '#8dbec4']
                : ['#557fa3', '#668e7d', '#8e7da7', '#ac8c56', '#ad776f', '#568f97'],
            backgroundColor: 'transparent',
            textStyle: { color: text, fontFamily: diagramFontFamily, fontSize: 15 },
            title: { textStyle: { color: text, fontFamily: diagramFontFamily, fontSize: 18, fontWeight: 500 }, subtextStyle: { color: muted, fontFamily: diagramFontFamily } },
            legend: { textStyle: { color: muted }, inactiveColor: rule },
            tooltip: { backgroundColor: isDark ? '#182232' : '#ffffff', borderColor: rule, textStyle: { color: text } },
            categoryAxis: axis, valueAxis: axis, timeAxis: axis, logAxis: axis,
            line: { lineStyle: { width: 2 }, symbolSize: 6 },
            bar: { itemStyle: { borderWidth: 0 } }
        };
    }

    // Chart options may contain nested labels; the site font policy applies at every level.
    function useBundledChartFonts(options) {
        if (!options || typeof options !== 'object') return;
        Object.keys(options).forEach(function (key) {
            if (key === 'fontFamily') options[key] = diagramFontFamily;
            else useBundledChartFonts(options[key]);
        });
    }

    function initEchartsBlocks() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll('.echarts-block'));
        if (!blocks.length) return;
        if (!window.echarts) {
            blocks.forEach(function (block) {
                renderChartError(block, 'ECharts library was not loaded.');
            });
            return;
        }

        echartsCharts = [];
        blocks.forEach(function (block) {
            var error = block.getAttribute('data-chart-error');
            if (error) {
                renderChartError(block, error);
                return;
            }

            var optionsText = decodeBase64Utf8(block.getAttribute('data-chart-options'));
            var options;
            try {
                options = JSON.parse(optionsText);
            } catch (err) {
                renderChartError(block, err && err.message);
                return;
            }

            var canvas = block.querySelector('.echarts-canvas');
            if (!canvas) return;
            try {
                var previousChart = window.echarts.getInstanceByDom(canvas);
                if (previousChart) previousChart.dispose();
                var isDark = document.documentElement.classList.contains('dark');
                var theme = getEchartsTheme(isDark);
                var chart = window.echarts.init(canvas, theme, { renderer: 'svg' });
                // Keep authored data, colors and sizes while enforcing the bundled font set.
                useBundledChartFonts(options);
                chart.setOption(Object.assign({ backgroundColor: 'transparent', animation: false }, options, {
                    textStyle: Object.assign({}, theme.textStyle, options.textStyle)
                }));
                echartsCharts.push(chart);
            } catch (err) {
                renderChartError(block, err && err.message);
            }
        });

        if (echartsCharts.length && !echartsResizeBound) {
            echartsResizeBound = true;
            window.addEventListener('resize', function () {
                echartsCharts.forEach(function (chart) { chart.resize(); });
            });
        }
    }

    function initDiagramBlocks() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll('.diagram-block'));
        if (!blocks.length) return;
        var render = function () {
            initMermaidBlocks();
            initEchartsBlocks();
        };
        // SVG 创建前字体可能尚未被使用；显式加载图表所需字形，避免 ready 提前完成。
        var fonts = document.fonts;
        if (!fonts || typeof fonts.load !== 'function') { render(); return; }
        var labels = blocks.map(function (block) {
            return block.textContent || decodeBase64Utf8(block.getAttribute('data-chart-options'));
        }).join('');
        Promise.all([
            fonts.load('15px "Freecat Figtree"', labels),
            fonts.load('15px "Freecat Noto Sans SC"', labels)
        ]).then(render, function (error) {
            // 字体请求失败时沿用浏览器字体回退，图表数据仍须可用。
            console.warn('Chart font loading failed; using browser fallback fonts.', error);
            render();
        });
    }

    function initShareButton() {
        // Share Button: Web Share API → 剪贴板兜底
        // 视觉反馈完全交给 CSS（data-state 切换 + opacity crossfade），
        // JS 不再注入内联 transform / transition，避免和 .t-btn 系统冲突。
        var shareBtn = document.getElementById('share-btn');
        if (!shareBtn || shareBtn.getAttribute('data-share-ready') === 'true') return;

        shareBtn.setAttribute('data-share-ready', 'true');
        var shareLabel = shareBtn.querySelector('.share-btn-label');
        var shareDefaultText = shareLabel ? shareLabel.textContent : 'Share';
        var shareResetTimer = 0;
        var SHARE_FEEDBACK_MS = 1800;

        function setShareState(state, labelText) {
            if (state) {
                shareBtn.setAttribute('data-state', state);
            } else {
                shareBtn.removeAttribute('data-state');
            }
            if (shareLabel) {
                shareLabel.textContent = labelText;
            }
        }

        function flashShareState(state, labelText) {
            setShareState(state, labelText);
            if (shareResetTimer) clearTimeout(shareResetTimer);
            shareResetTimer = window.setTimeout(function () {
                setShareState(null, shareDefaultText);
            }, SHARE_FEEDBACK_MS);
        }

        function copyUrlToClipboard(url) {
            shared.copyText(url).then(function () {
                flashShareState('copied', '链接已复制');
            }).catch(function (err) {
                console.error('Copy failed:', err);
                flashShareState('error', '复制失败');
            });
        }

        shareBtn.addEventListener('click', function () {
            var articleUrl = window.location.href;
            var titleEl = document.querySelector('.post-title');
            var articleTitle = (titleEl && titleEl.textContent) || document.title;

            if (navigator.share) {
                navigator.share({ title: articleTitle, url: articleUrl }).catch(function () {
                    copyUrlToClipboard(articleUrl);
                });
            } else {
                copyUrlToClipboard(articleUrl);
            }
        });
    }

    // TOC History Optimization & Last Item Sync
    function parsePixelValue(value, fallback) {
        if (!value) return fallback;
        var parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function getRootPixelValue(name, fallback) {
        if (!window.getComputedStyle || !document.documentElement) return fallback;
        return parsePixelValue(
            window.getComputedStyle(document.documentElement).getPropertyValue(name),
            fallback
        );
    }

    function getCurrentScrollY() {
        return window.pageYOffset || window.scrollY || 0;
    }

    function getElementPageTop(element) {
        var rect = element.getBoundingClientRect();
        return rect.top + getCurrentScrollY();
    }

    function getDocumentMaxScrollY() {
        var scrollingElement = document.scrollingElement || document.documentElement;
        var scrollHeight = scrollingElement ? scrollingElement.scrollHeight : 0;
        return Math.max(0, scrollHeight - window.innerHeight);
    }

    function getTocHeaderOffset() {
        var header = document.querySelector('header.fixed');
        var safeGap = getRootPixelValue('--freecat-header-safe-gap', 20);
        var shellOffset = getRootPixelValue('--freecat-page-top-offset', 0);
        var headerHeight = getRootPixelValue('--freecat-header-height', 0);
        if (!header) return Math.max(100, shellOffset, headerHeight + safeGap);

        var headerBottom = header.getBoundingClientRect().bottom;
        if (document.documentElement.classList.contains('freecat-framed') || headerBottom <= 0) {
            return Math.max(0, shellOffset, headerHeight + safeGap);
        }

        return Math.max(0, headerBottom + safeGap);
    }

    function getArticleEndScrollY(article) {
        if (!article) return getDocumentMaxScrollY();

        var articleBottom = article.getBoundingClientRect().bottom + getCurrentScrollY();
        return articleBottom - window.innerHeight + 60;
    }

    function getTocTargetScrollY(targetElement, article) {
        var headingScrollY = getElementPageTop(targetElement) - getTocHeaderOffset();
        var footerSafeScrollY = getArticleEndScrollY(article);
        var maxScrollY = getDocumentMaxScrollY();
        var finalScrollY = Math.min(headingScrollY, footerSafeScrollY, maxScrollY);
        return Math.max(0, finalScrollY);
    }

    function initTocAnchors() {
        var toc = document.querySelector('.freecat-post-toc');
        if (!toc || toc.getAttribute('data-reading-ready') === 'true') return;
        toc.setAttribute('data-reading-ready', 'true');
        var wideScreen = window.matchMedia('(min-width: 1280px)');
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        var container = document.getElementById('toc-container');
        var nav = container.querySelector('nav');
        var article = document.querySelector('article');
        var links = Array.prototype.slice.call(toc.querySelectorAll('nav a[href^="#"]'));
        var sections = links.map(function (link) {
            return { link: link, heading: document.getElementById(link.getAttribute('href').substring(1)) };
        }).filter(function (section) { return section.heading; });
        var activeLink = null;
        var scrollFrame = 0;
        var layoutDirty = true;
        var headerOffset = 0;
        // The TOC is desktop-only; Tabs owns disclosure and panel visibility.
        var readingPanel = document.querySelector('.freecat-post-reading-panel');
        if (readingPanel) readingPanel.addEventListener('freecat:tabs-layout', scheduleTocMeasure);

        function scheduleTocMeasure() {
            layoutDirty = true;
            scheduleCurrentSection();
        }

        function updateCurrentSection() {
            scrollFrame = 0;
            if (!wideScreen.matches || (readingPanel && container.closest("[hidden]"))) return;
            var measured = layoutDirty;
            // 章节位置仅在布局变化时测量；滚动帧用缓存查找，避免长文反复触发布局读取。
            if (layoutDirty) {
                headerOffset = getTocHeaderOffset() + 24;
                sections.forEach(function (section) { section.top = getElementPageTop(section.heading); });
                layoutDirty = false;
            }
            var threshold = getCurrentScrollY() + headerOffset;
            var low = 0;
            var high = sections.length - 1;
            while (low <= high) {
                var middle = Math.floor((low + high) / 2);
                if (sections[middle].top <= threshold) low = middle + 1;
                else high = middle - 1;
            }
            var current = sections[Math.max(0, high)];
            if (getCurrentScrollY() >= getDocumentMaxScrollY() - 2) current = sections[sections.length - 1];
            if (!current) return;
            var changed = current.link !== activeLink;
            if (!changed && !measured) return;

            var linkTop = current.link.offsetTop;
            var linkHeight = current.link.offsetHeight;
            var viewTop = container.scrollTop;
            var viewHeight = container.clientHeight;
            if (changed) {
                if (activeLink) activeLink.removeAttribute('aria-current');
                activeLink = current.link;
                activeLink.setAttribute('aria-current', 'location');
            }
            // 复用同一根指示条，由 CSS 连续过渡位置，不在各链接间销毁、重建。
            nav.style.setProperty('--toc-active-top', (linkTop + 8) + 'px');
            nav.style.setProperty('--toc-active-height', Math.max(0, linkHeight - 16) + 'px');
            // 只移动到可见边缘，避免整段目录突然居中；读者操作目录时不抢滚动。
            if (wideScreen.matches && !toc.matches(':hover, :focus-within')) {
                var targetTop = viewTop;
                if (linkTop < viewTop + 24) targetTop = linkTop - 24;
                else if (linkTop + linkHeight > viewTop + viewHeight - 24) targetTop = linkTop + linkHeight - viewHeight + 24;
                if (Math.abs(targetTop - viewTop) > 1) container.scrollTo({
                    top: Math.max(0, targetTop),
                    behavior: reducedMotion.matches ? 'instant' : 'smooth'
                });
            }
        }

        function scheduleCurrentSection() {
            if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateCurrentSection);
        }

        wideScreen.addEventListener('change', scheduleTocMeasure);
        window.addEventListener('scroll', scheduleCurrentSection, { passive: true });
        window.addEventListener('resize', scheduleTocMeasure);
        // 图片、字体、表格及代码块展开会改变章节位置，统一让缓存失效。
        if (typeof ResizeObserver === 'function' && article) {
            var layoutObserver = new ResizeObserver(scheduleTocMeasure);
            layoutObserver.observe(article);
            layoutObserver.observe(nav);
        }
        if (document.fonts) document.fonts.ready.then(scheduleTocMeasure);
        scheduleTocMeasure();

        links.forEach(function (anchor) {
            if (anchor.getAttribute('data-toc-ready') === 'true') return;
            anchor.setAttribute('data-toc-ready', 'true');
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                var targetId = this.getAttribute('href').substring(1);
                var targetElement = document.getElementById(targetId);
                var article = document.querySelector('article');

                if (targetElement && article) {
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus({ preventScroll: true });
                    window.scrollTo({
                        top: getTocTargetScrollY(targetElement, article),
                        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
                    });
                    history.replaceState(null, null, '#' + targetId);
                }
            });
        });
    }

    function normalizeLatestUpdateText(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function imageCandidateText(candidate) {
        var parts = [];
        candidate.querySelectorAll('img').forEach(function (image) {
            [
                image.getAttribute('alt'),
                image.getAttribute('title'),
                image.getAttribute('data-src') || image.getAttribute('src')
            ].filter(Boolean).forEach(function (value) {
                parts.push(value);
            });
        });
        return parts.join(' ');
    }

    function linkCandidateText(candidate) {
        var parts = [];
        candidate.querySelectorAll('a[href]').forEach(function (anchor) {
            var href = anchor.getAttribute('href');
            if (href) parts.push(href);
        });
        return parts.join(' ');
    }

    function embedCandidateText(candidate) {
        var parts = [];
        candidate.querySelectorAll('[data-embed-url]').forEach(function (embed) {
            var url = embed.getAttribute('data-embed-url');
            if (url) parts.push(url);
        });
        return parts.join(' ');
    }

    function latestUpdateCandidateText(candidate) {
        return normalizeLatestUpdateText([
            candidate.textContent,
            imageCandidateText(candidate),
            linkCandidateText(candidate),
            embedCandidateText(candidate)
        ].filter(Boolean).join(' '));
    }

    function findLatestUpdateTarget(text) {
        var needle = normalizeLatestUpdateText(text);
        var article = document.querySelector('article');
        if (!needle || !article) return null;

        var fallbackNeedle = needle.length > 40 ? needle.slice(0, 40) : needle;
        var candidateGroups = [
            'h1,h2,h3,h4,h5,h6,p,li,tr,td,th,blockquote,figcaption,figure,.callout,pre code',
            'ul,ol,table'
        ];

        for (var groupIndex = 0; groupIndex < candidateGroups.length; groupIndex += 1) {
            var candidates = article.querySelectorAll(candidateGroups[groupIndex]);
            for (var i = 0; i < candidates.length; i += 1) {
                var candidate = candidates[i];
                var haystack = latestUpdateCandidateText(candidate);
                if (!haystack) continue;
                if (haystack.indexOf(needle) !== -1 || haystack.indexOf(fallbackNeedle) !== -1) {
                    return candidate;
                }
            }
        }

        return null;
    }

    function initLatestUpdateAnchors() {
        document.querySelectorAll('.freecat-post-latest-update-link[href^="#"]').forEach(function (anchor) {
            if (anchor.getAttribute('data-latest-update-ready') === 'true') return;
            anchor.setAttribute('data-latest-update-ready', 'true');
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                var article = document.querySelector('article');
                var targetId = this.getAttribute('href').substring(1);
                var targetElement = document.getElementById(targetId) || findLatestUpdateTarget(this.getAttribute('data-latest-update-text'));

                if (targetElement && article) {
                    if (!targetElement.id) targetElement.id = targetId;
                    var updateDetails = this.closest('.freecat-post-latest-update-shell');
                    if (updateDetails && !window.matchMedia('(min-width: 1280px)').matches) updateDetails.open = false;
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus({ preventScroll: true });
                    window.scrollTo({
                        top: getTocTargetScrollY(targetElement, article),
                        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
                    });
                    history.replaceState(null, null, '#' + targetElement.id);
                }
            });
        });
    }

    function replaceFailedTwitterEmbed(figure) {
        var url = figure && figure.getAttribute('data-embed-url');
        if (!url) return;
        var safeUrl = shared.escapeHtml(url);
        figure.className = 'external-embed external-embed-link';
        figure.setAttribute('data-embed-provider', 'link');
        figure.innerHTML = '<a href="' + safeUrl + '" target="_blank" rel="noopener noreferrer">' + safeUrl + '</a>';
        markExternalEmbedReady(figure);
    }

    function markExternalEmbedReady(figure) {
        if (!figure) return;
        figure.classList.remove('external-embed-loading');
        figure.classList.add('external-embed-ready');
    }

    function hasVisibleTwitterEmbed(figure) {
        if (!figure) return false;
        var iframe = figure.querySelector('iframe');
        if (!iframe) return false;
        var rect = iframe.getBoundingClientRect();
        return rect.width > 0 && rect.height >= 120;
    }

    function requestTwitterEmbedRender(figure) {
        if (!figure || !window.twttr || !window.twttr.widgets || typeof window.twttr.widgets.load !== 'function') return false;
        window.twttr.widgets.load(figure);
        return true;
    }

    function initExternalEmbedPlaceholders() {
        document.querySelectorAll('figure.external-embed-loading').forEach(function (figure) {
            var provider = figure.getAttribute('data-embed-provider');
            if (provider === 'link') {
                window.requestAnimationFrame(function () {
                    if (!figure.querySelector('a[href]')) return;
                    markExternalEmbedReady(figure);
                });
                return;
            }

            if (provider !== 'twitter') {
                var frame = figure.querySelector('iframe');
                if (!frame) {
                    return;
                }
                frame.addEventListener('load', function () {
                    markExternalEmbedReady(figure);
                }, { once: true });
                return;
            }

            var attempts = 0;
            var requestedRender = requestTwitterEmbedRender(figure);
            var timer = window.setInterval(function () {
                attempts++;
                if (!figure.classList.contains('external-embed-loading')) {
                    window.clearInterval(timer);
                    return;
                }

                if (hasVisibleTwitterEmbed(figure)) {
                    markExternalEmbedReady(figure);
                    window.clearInterval(timer);
                    return;
                }

                if (isFailedTwitterEmbed(figure)) {
                    replaceFailedTwitterEmbed(figure);
                    window.clearInterval(timer);
                    return;
                }

                if (!requestedRender) {
                    requestedRender = requestTwitterEmbedRender(figure);
                }

                if (attempts >= 80) {
                    requestTwitterEmbedRender(figure);
                    attempts = 0;
                }
            }, 100);
        });
    }

    function isFailedTwitterEmbed(figure) {
        if (!figure) return false;
        var text = (figure.textContent || '').replace(/\s+/g, ' ').trim();
        if (/^Not found$/i.test(text)) return true;
        var iframe = figure.querySelector('iframe');
        if (!iframe) return false;
        var rect = iframe.getBoundingClientRect();
        if (rect.height > 0 && rect.height < 120) return true;
        return text && /not found/i.test(text) && rect.height < 180;
    }

    function fallbackFailedTwitterEmbeds() {
        document.querySelectorAll('figure.external-embed-twitter[data-embed-url]').forEach(function (figure) {
            if (isFailedTwitterEmbed(figure)) replaceFailedTwitterEmbed(figure);
        });
    }

    function initTwitterEmbedFallback() {
        if (!document.querySelector('figure.external-embed-twitter[data-embed-url]')) return;
        [1800, 4000, 8000].forEach(function (delay) {
            window.setTimeout(fallbackFailedTwitterEmbeds, delay);
        });
    }

    function initPostPage() {
        initDiagramBlocks();
        initMarkdownSizing();
        codeFolding.init();
        initShareButton();
        initTocAnchors();
        initLatestUpdateAnchors();
        initExternalEmbedPlaceholders();
        initTwitterEmbedFallback();
    }

    window.FreecatPostPage = {
        init: initPostPage
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPostPage);
    } else {
        initPostPage();
    }
})();
