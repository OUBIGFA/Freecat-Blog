/* post.js
 * 文章页专属交互逻辑（曾经全部内联在 template_post.html）。
 *   - 代码块复制按钮 (.copy-btn / .copy-btn-container input)
 *   - 代码块折叠 (.code-fold-controls / .fold-toggle-btn)
 *   - Back-to-top / Scroll-to-bottom / Floating Go Back
 *   - Share button（Web Share API + 剪贴板兜底）
 *   - TOC 锚点点击：history.replaceState + footer-safe 滚动定位
 *   - highlight.js 全文初始化
 */
(function () {
    'use strict';

    // shared.js 在 main.js / post.js 之前加载（template_post.html 中
    // <script src="../assets/shared.js"> 已先于本文件）。
    // 直接断言其存在，缺失 = 加载顺序被破坏，应早失败。
    var shared = window.FreecatShared;
    if (!shared) throw new Error('FreecatShared not loaded — ensure shared.js loads before post.js');
    var copyToClipboard = shared.copyText;
    var CODE_COLLAPSED_HEIGHT = 400;

    function resetCodeControlsPosition(controls) {
        if (!controls) return;
        controls.classList.remove('code-controls-opening');
        controls.classList.remove('code-controls-viewport-bottom');
        controls.classList.remove('code-controls-outside');
        controls.classList.remove('code-controls-pinned-bottom');
        controls.style.removeProperty('--code-controls-top');
        controls.style.removeProperty('--code-controls-left');
        controls.style.width = '';
        controls.style.maxWidth = '';
    }

    function setCollapsedCodeControlsLayout(controls) {
        if (!controls) return;
        controls.classList.remove('absolute', 'bottom-0', 'h-20', 'bg-gradient-to-t');
        controls.classList.add('flex', 'justify-center', 'py-2', 'border-t', 'border-slate-200/50', 'dark:border-slate-700/50', 'bg-slate-50/50', 'dark:bg-transparent');
    }

    function setExpandedCodeControlsLayout(controls) {
        if (!controls) return;
        controls.classList.remove('absolute', 'bottom-0', 'h-20', 'bg-gradient-to-t');
        controls.classList.add('flex', 'justify-center', 'py-2', 'border-t', 'border-slate-200/50', 'dark:border-slate-700/50', 'bg-slate-50/50', 'dark:bg-transparent');
    }

    function getCodeControlsTarget(block, finalContentHeight) {
        var controls = block.querySelector('.code-fold-controls');
        var codeWrapper = block.querySelector('.code-wrapper');
        if (!controls || !codeWrapper) return null;

        var wrapperRect = codeWrapper.getBoundingClientRect();
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        var controlsHeight = controls.offsetHeight || 34;
        var wrapperBottom = typeof finalContentHeight === 'number'
            ? wrapperRect.top + finalContentHeight
            : wrapperRect.bottom;

        var preferredTop = viewportHeight - controlsHeight - 16;
        var preferredBottom = viewportHeight - 16;
        var minTop = wrapperRect.top + 12;
        var maxBottom = wrapperBottom - 16;
        var mode = 'viewport';
        var releaseGap = 72;
        var top = preferredTop;
        if (preferredTop < minTop) {
            top = minTop;
            mode = 'top';
        } else if (controls.classList.contains('code-controls-pinned-bottom')) {
            mode = wrapperBottom > viewportHeight + releaseGap ? 'viewport' : 'pinned-bottom';
        } else if (preferredBottom > maxBottom) {
            mode = 'pinned-bottom';
        }

        return {
            top: top,
            left: wrapperRect.left + wrapperRect.width / 2,
            maxWidth: Math.max(0, Math.min(wrapperRect.width - 24, viewportWidth - 32)),
            mode: mode
        };
    }

    function setStylePropertyIfChanged(el, name, value) {
        if (el.style.getPropertyValue(name) !== value) {
            el.style.setProperty(name, value);
        }
    }

    function setStyleValueIfChanged(el, name, value) {
        if (el.style[name] !== value) {
            el.style[name] = value;
        }
    }

    function applyCodeControlsPosition(block, forceTop) {
        var controls = block.querySelector('.code-fold-controls');
        var target = getCodeControlsTarget(block);
        if (!controls || !target) return;

        var left = Math.round(target.left) + 'px';
        var top = Math.round(target.top) + 'px';
        var maxWidth = Math.round(target.maxWidth) + 'px';

        if (target.mode === 'viewport' && !forceTop) {
            controls.classList.remove('code-controls-outside');
            controls.classList.remove('code-controls-pinned-bottom');
            if (!controls.classList.contains('code-controls-viewport-bottom')) {
                setStyleValueIfChanged(controls, 'width', 'max-content');
                setStyleValueIfChanged(controls, 'maxWidth', maxWidth);
                setStylePropertyIfChanged(controls, '--code-controls-left', left);
                controls.style.removeProperty('--code-controls-top');
                controls.classList.add('code-controls-viewport-bottom');
            }
        } else {
            if (target.mode === 'pinned-bottom' && !forceTop) {
                controls.classList.remove('code-controls-viewport-bottom');
                controls.classList.remove('code-controls-outside');
                setStyleValueIfChanged(controls, 'width', 'max-content');
                setStyleValueIfChanged(controls, 'maxWidth', maxWidth);
                controls.style.removeProperty('--code-controls-top');
                controls.classList.add('code-controls-pinned-bottom');
                return;
            }
            controls.classList.remove('code-controls-outside');
            controls.classList.remove('code-controls-pinned-bottom');
            setStyleValueIfChanged(controls, 'width', 'max-content');
            setStyleValueIfChanged(controls, 'maxWidth', maxWidth);
            setStylePropertyIfChanged(controls, '--code-controls-left', left);
            setStylePropertyIfChanged(controls, '--code-controls-top', top);
            if (controls.classList.contains('code-controls-viewport-bottom')) {
                controls.classList.remove('code-controls-viewport-bottom');
            }
        }
    }

    var codeControlsRaf = 0;

    function updateCodeControlsPositions() {
        codeControlsRaf = 0;
        document.querySelectorAll('.code-block-container.expanded-code').forEach(function (block) {
            applyCodeControlsPosition(block);
        });
    }

    function scheduleCodeControlsUpdate() {
        if (codeControlsRaf) return;
        codeControlsRaf = window.requestAnimationFrame(updateCodeControlsPositions);
    }

    function getExpandedCodeHeight(container, content) {
        var wasCollapsed = container.classList.contains('collapsed-code');
        var wasExpanded = container.classList.contains('expanded-code');
        var previousMaxHeight = content.style.maxHeight;

        container.classList.remove('collapsed-code');
        container.classList.add('expanded-code');
        content.style.maxHeight = 'none';

        var height = content.scrollHeight;

        content.style.maxHeight = previousMaxHeight;
        if (wasCollapsed) container.classList.add('collapsed-code');
        if (!wasExpanded) container.classList.remove('expanded-code');

        return height;
    }

    function settleExpandedCodeHeight(content, container) {
        var done = false;
        var finish = function (event) {
            if (event && event.target !== content) return;
            if (event && event.propertyName !== 'max-height') return;
            if (done) return;
            done = true;
            content.removeEventListener('transitionend', finish);
            if (container.classList.contains('expanded-code')) {
                content.style.maxHeight = 'none';
                container.classList.remove('code-expanding');
            }
        };

        content.addEventListener('transitionend', finish);
        setTimeout(finish, 420);
    }

    // 复制按钮 + 折叠按钮统一委托
    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.copy-btn');
        if (btn) {
            var container = btn.closest('.code-block-container');
            if (!container) return;

            var codeEl = container.querySelector('.code-content code') ||
                container.querySelector('pre code') ||
                container.querySelector('code');
            if (!codeEl) return;

            var textToCopy = codeEl.textContent || codeEl.innerText || '';

            copyToClipboard(textToCopy).then(function () {
                btn.style.transition = 'transform 0.1s ease-out';
                btn.style.transform = 'scale(0.92)';
                setTimeout(function () {
                    btn.style.transition = 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    btn.style.transform = 'scale(1)';
                }, 50);
            }).catch(function (err) {
                console.error('Copy failed:', err);
            });
            return;
        }

        var codeNavBtn = e.target.closest('.code-nav-btn');
        if (codeNavBtn) {
            var navContainer = codeNavBtn.closest('.code-block-container');
            if (!navContainer) return;

            var direction = codeNavBtn.getAttribute('data-code-nav');
            var rect = navContainer.getBoundingClientRect();
            var targetY = direction === 'bottom'
                ? window.pageYOffset + rect.bottom - window.innerHeight + 96
                : window.pageYOffset + rect.top - 88;
            var scrollingElement = document.scrollingElement || document.documentElement;
            var maxScroll = Math.max(0, scrollingElement.scrollHeight - window.innerHeight);
            if (targetY < 0) targetY = 0;
            if (targetY > maxScroll) targetY = maxScroll;

            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
            return;
        }

        var foldBtn = e.target.closest('.fold-toggle-btn');
        if (foldBtn) {
            var foldContainer = foldBtn.closest('.code-block-container');
            var wrapper = foldContainer.querySelector('.code-content');
            var controls = foldContainer.querySelector('.code-fold-controls');
            var isFolded = foldContainer.classList.contains('collapsed-code');
            var expandIcon = foldBtn.querySelector('.fold-icon-expand');
            var collapseIcon = foldBtn.querySelector('.fold-icon-collapse');

            if (isFolded) {
                var startHeight = wrapper.getBoundingClientRect().height || CODE_COLLAPSED_HEIGHT;
                var targetHeight = getExpandedCodeHeight(foldContainer, wrapper);

                wrapper.style.maxHeight = startHeight + 'px';
                wrapper.offsetHeight; // force reflow

                var openingTarget = null;
                if (controls) {
                    var currentRect = controls.getBoundingClientRect();
                    controls.style.setProperty('--code-controls-top', currentRect.top + 'px');
                    controls.style.setProperty('--code-controls-left', (currentRect.left + currentRect.width / 2) + 'px');
                }
                foldContainer.classList.add('code-expanding');
                foldContainer.classList.remove('collapsed-code');
                foldContainer.classList.add('expanded-code');
                if (controls) {
                    setExpandedCodeControlsLayout(controls);
                    openingTarget = getCodeControlsTarget(foldContainer, targetHeight);
                    if (openingTarget) {
                        controls.style.width = 'max-content';
                        controls.style.maxWidth = openingTarget.maxWidth + 'px';
                        controls.style.setProperty('--code-controls-left', openingTarget.left + 'px');
                        if (openingTarget.mode === 'pinned-bottom') {
                            controls.classList.remove('code-controls-opening');
                            controls.classList.remove('code-controls-viewport-bottom');
                            controls.classList.remove('code-controls-outside');
                            controls.classList.add('code-controls-pinned-bottom');
                            controls.style.removeProperty('--code-controls-top');
                        } else {
                            controls.classList.remove('code-controls-pinned-bottom');
                            controls.classList.remove('code-controls-viewport-bottom');
                            controls.classList.remove('code-controls-outside');
                            controls.classList.add('code-controls-opening');
                        }
                    }
                }

                if (expandIcon) expandIcon.classList.add('hidden');
                if (collapseIcon) collapseIcon.classList.remove('hidden');

                window.requestAnimationFrame(function () {
                    wrapper.style.maxHeight = targetHeight + 'px';
                    if (controls && openingTarget && openingTarget.mode !== 'pinned-bottom') {
                        controls.style.setProperty('--code-controls-top', openingTarget.top + 'px');
                        controls.style.setProperty('--code-controls-left', openingTarget.left + 'px');
                    }
                });
                setTimeout(function () {
                    if (!foldContainer.classList.contains('expanded-code') || !controls) return;
                    controls.classList.remove('code-controls-opening');
                    applyCodeControlsPosition(foldContainer);
                }, 320);
                settleExpandedCodeHeight(wrapper, foldContainer);
            } else {
                wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
                wrapper.offsetHeight; // force reflow
                foldContainer.classList.add('collapsed-code');
                foldContainer.classList.remove('expanded-code');
                foldContainer.classList.remove('code-expanding');
                if (controls) controls.classList.remove('code-controls-opening');
                resetCodeControlsPosition(controls);
                wrapper.style.maxHeight = CODE_COLLAPSED_HEIGHT + 'px';
                setCollapsedCodeControlsLayout(controls);

                if (expandIcon) expandIcon.classList.remove('hidden');
                if (collapseIcon) collapseIcon.classList.add('hidden');

                var rect = foldContainer.getBoundingClientRect();
                if (rect.top < 0) {
                    window.scrollTo({
                        top: window.scrollY + rect.top - 100,
                        behavior: 'smooth'
                    });
                }
            }
        }
    });

    // 初始化代码块折叠检测：长代码块默认折叠
    function initCodeFolding() {
        var blocks = document.querySelectorAll('.code-block-container.code-fold');
        blocks.forEach(function (block) {
            var content = block.querySelector('.code-content');
            var controls = block.querySelector('.code-fold-controls');

            if (content.scrollHeight > 500) {
                block.classList.add('collapsed-code');
                block.classList.remove('expanded-code');
                content.style.maxHeight = CODE_COLLAPSED_HEIGHT + 'px';
                controls.classList.remove('hidden');
                setCollapsedCodeControlsLayout(controls);
            } else {
                block.classList.remove('code-fold');
                block.classList.remove('expanded-code');
                resetCodeControlsPosition(controls);
            }
        });
        scheduleCodeControlsUpdate();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCodeFolding);
    } else {
        initCodeFolding();
    }

    window.addEventListener('scroll', scheduleCodeControlsUpdate, { passive: true });
    window.addEventListener('resize', scheduleCodeControlsUpdate);

    // 代码块折叠辅助样式（.collapsed-code .code-content / .code-fold-controls）
    // 已挪到 transitions.css，不再运行时注入。

    // Back-to-top / Scroll-to-bottom / Floating Go Back
    var backToTopBtn = document.getElementById('back-to-top');
    var scrollToBottomBtn = document.getElementById('scroll-to-bottom');
    var floatingGoBackBtn = document.getElementById('floating-go-back');

    // 计算"文章容器底部"对应的滚动位置：
    //   目标 = <main> 下第一层包装 div（class="...pb-36 lg:pb-48" 那层）的底边对齐到视口底边。
    //   这一层是用户视觉/语义上的「文章容器」，它包含：
    //     - <article>（文章 header / 正文 / Share 按钮）
    //     - 右侧 sticky TOC + 浮动按钮列
    //     - 自身的 pb-36/lg:pb-48（文章块到 footer 的过渡留白，仍属"文章容器"边界内）
    //   只取 <article> 会停在 Share 按钮底部 —— 漏掉容器自带的底部留白；
    //   取 document 末端则会跨进 footer。这一层正好是视觉上的「文章块结束」。
    //
    //   所有高度都用 getBoundingClientRect() 实时读取，不缓存任何数值，
    //   自适应文章长度 / 内嵌图片 / 字体回流 / pb-tokens 调整。
    //   最后用文档可滚动上限 clamp，避免越界。
    function getArticleBottomScrollY() {
        // 优先取最外层包装 div（含底部留白）；找不到时逐级回退
        var container = document.querySelector('main > div')
            || document.querySelector('main')
            || document.querySelector('article');

        var scrollingElement = document.scrollingElement || document.documentElement;
        var docHeight = scrollingElement ? scrollingElement.scrollHeight : 0;
        var maxScroll = Math.max(0, docHeight - window.innerHeight);

        if (!container) {
            return maxScroll;
        }

        var rect = container.getBoundingClientRect();
        var containerBottomAbs = rect.bottom + window.pageYOffset;
        var target = containerBottomAbs - window.innerHeight;

        // clamp：上限是文档实际可滚动的最大位置，下限是 0
        if (target > maxScroll) target = maxScroll;
        if (target < 0) target = 0;
        return target;
    }

    function scrollToArticleBottom(behavior) {
        window.scrollTo({
            top: getArticleBottomScrollY(),
            behavior: behavior || 'smooth'
        });
    }

    function toggleNavButtons() {
        var scrollY = window.scrollY;
        var show = scrollY > 500;

        function setVisibility(btn) {
            if (!btn) return;
            // 仅切换 .is-hidden —— 由 .t-floating-nav 处理 opacity / transform 过渡。
            // 不再用 Tailwind 的 invisible（visibility:hidden）做硬切，
            // 否则元素在 opacity 还没淡出完时就被 visibility 一刀切，看起来很突兀。
            btn.classList.toggle('is-hidden', !show);
        }

        setVisibility(backToTopBtn);
        setVisibility(scrollToBottomBtn);
        setVisibility(floatingGoBackBtn);
    }

    if (backToTopBtn || scrollToBottomBtn || floatingGoBackBtn) {
        window.addEventListener('scroll', toggleNavButtons);

        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                var tocContainer = document.getElementById('toc-container');
                if (tocContainer) {
                    tocContainer.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }

        if (scrollToBottomBtn) {
            scrollToBottomBtn.addEventListener('click', function () {
                var startY = window.scrollY;
                var startTime = performance.now();
                var lastTarget = getArticleBottomScrollY();
                var distance = Math.abs(lastTarget - startY);
                var duration = Math.min(2200, Math.max(700, distance * 0.35));

                function easeOutCubic(t) {
                    return 1 - Math.pow(1 - t, 3);
                }

                function animate(now) {
                    var target = getArticleBottomScrollY();
                    if (Math.abs(target - lastTarget) > 1) {
                        lastTarget = target;
                    }

                    var elapsed = now - startTime;
                    var t = Math.min(1, elapsed / duration);
                    var eased = easeOutCubic(t);
                    var nextY = startY + (lastTarget - startY) * eased;
                    window.scrollTo(0, nextY);

                    var remaining = Math.abs(window.scrollY - lastTarget);
                    if (t < 1 || remaining > 1) {
                        if (t >= 1) {
                            // 目标在动画期间变远了（图片/公式/图表加载），继续用当前位置作为新起点平滑补齐。
                            startY = window.scrollY;
                            startTime = now;
                            distance = Math.abs(lastTarget - startY);
                            duration = Math.min(900, Math.max(240, distance * 0.45));
                        }
                        requestAnimationFrame(animate);
                    }
                }

                requestAnimationFrame(animate);
            });
        }

        if (floatingGoBackBtn) {
            floatingGoBackBtn.addEventListener('click', function () {
                if (document.referrer && document.referrer.includes(window.location.host)) {
                    history.back();
                } else {
                    window.location.href = '/';
                }
            });
        }
    }

    // Share Button: Web Share API → 剪贴板兜底
    // 视觉反馈完全交给 CSS（data-state 切换 + opacity crossfade），
    // JS 不再注入内联 transform / transition，避免和 .t-btn 系统冲突。
    var shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
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

        function copyUrlToClipboard(url) {
            copyToClipboard(url).then(function () {
                flashShareState('copied', 'Copied');
            }).catch(function (err) {
                console.error('Copy failed:', err);
                flashShareState('error', 'Copy failed');
            });
        }
    }

    // TOC History Optimization & Last Item Sync
    function parsePixelValue(value, fallback) {
        if (!value) return fallback;
        var parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
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
        if (!header) return 100;

        var headerBottom = header.getBoundingClientRect().bottom;
        var safeGap = 20;
        if (window.getComputedStyle && document.documentElement) {
            safeGap = parsePixelValue(
                window.getComputedStyle(document.documentElement).getPropertyValue('--freecat-header-safe-gap'),
                safeGap
            );
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

    document.querySelectorAll('nav a[href^="#"]').forEach(function (anchor) {
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

    // highlight.js 初始化
    function initHighlight() {
        if (window.hljs) window.hljs.highlightAll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHighlight);
    } else {
        initHighlight();
    }
})();
