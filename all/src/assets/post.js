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

    function initMermaidBlocks() {
        renderMermaidBlocks();
        observeMermaidThemeChanges();
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
                axisFormat: '%m-%d',
                topPadding: 48,
                leftPadding: 96,
                gridLineStartPadding: 24,
                fontSize: 12,
                barHeight: 18,
                barGap: 6
            }
        };
    }

    function renderMermaidBlocks() {
        var blocks = Array.prototype.slice.call(document.querySelectorAll('.mermaid-block .mermaid'));
        if (!blocks.length) return;
        var mermaidBlocks = prepareMermaidBlocks(blocks);
        if (!mermaidBlocks.length) return;
        if (!window.mermaid) {
            mermaidBlocks.forEach(function (block) {
                renderChartError(block.closest('.diagram-block') || block, 'Mermaid library was not loaded.');
            });
            return;
        }
        if (mermaidRenderState.rendering) {
            mermaidRenderState.pending = true;
            return;
        }
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
            fontFamily: '"Freecat Figtree", "Freecat Noto Sans SC", Inter, ui-sans-serif, system-ui, sans-serif',
            fontSize: '14px',
            background: 'transparent',
            primaryColor: 'transparent',
            primaryTextColor: isDark ? '#e7edf6' : '#0f172a',
            primaryBorderColor: isDark ? '#516176' : '#94a3b8',
            lineColor: isDark ? '#94a3b8' : '#64748b',
            secondaryColor: 'transparent',
            tertiaryColor: 'transparent',
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

    function observeMermaidThemeChanges() {
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
            requestAnimationFrame(renderMermaidBlocks);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }

    function getDiagramAvailableWidth(container) {
        if (!container) return 0;
        var style = window.getComputedStyle ? window.getComputedStyle(container) : null;
        var paddingLeft = style ? parseFloat(style.paddingLeft) || 0 : 0;
        var paddingRight = style ? parseFloat(style.paddingRight) || 0 : 0;
        var innerWidth = container.clientWidth - paddingLeft - paddingRight;
        return Math.max(240, Math.floor(innerWidth));
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
            var kind = container ? container.getAttribute('data-mermaid-kind') : '';
            var width = getSvgViewBoxWidth(svg);
            var availableWidth = getDiagramAvailableWidth(container);
            var finalWidth = width;
            if (kind === 'gantt' && availableWidth > 0) {
                finalWidth = availableWidth;
            } else if (availableWidth > 0 && width > 0) {
                finalWidth = Math.min(width, availableWidth);
            } else {
                finalWidth = availableWidth || width;
            }
            if (finalWidth > 0) svg.style.width = finalWidth + 'px';
            svg.style.maxWidth = '100%';
            if (container) {
                container.scrollLeft = 0;
                container.scrollTop = 0;
            }
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

        var charts = [];
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
                var chart = window.echarts.init(canvas, null, { renderer: 'svg' });
                chart.setOption(options);
                charts.push(chart);
            } catch (err) {
                renderChartError(block, err && err.message);
            }
        });

        if (charts.length) {
            window.addEventListener('resize', function () {
                charts.forEach(function (chart) { chart.resize(); });
            });
        }
    }

    function initDiagramBlocks() {
        initMermaidBlocks();
        initEchartsBlocks();
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
                flashShareState('copied', 'Copied');
            }).catch(function (err) {
                console.error('Copy failed:', err);
                flashShareState('error', 'Copy failed');
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
        document.querySelectorAll('nav a[href^="#"]').forEach(function (anchor) {
            if (anchor.getAttribute('data-toc-ready') === 'true') return;
            anchor.setAttribute('data-toc-ready', 'true');
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                var targetId = this.getAttribute('href').substring(1);
                var targetElement = document.getElementById(targetId);
                var article = document.querySelector('article');

                if (targetElement && article) {
                    window.scrollTo({
                        top: getTocTargetScrollY(targetElement, article),
                        behavior: 'smooth'
                    });
                    history.replaceState(null, null, '#' + targetId);
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
        codeFolding.init();
        initShareButton();
        initTocAnchors();
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
