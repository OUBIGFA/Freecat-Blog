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

    var shared = (typeof window !== 'undefined' && window.FreecatShared) || null;

    function copyToClipboard(text) {
        if (shared && typeof shared.copyText === 'function') {
            return shared.copyText(text);
        }
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        return new Promise(function (resolve, reject) {
            try {
                document.execCommand('copy') ? resolve() : reject();
            } catch (err) {
                reject(err);
            } finally {
                textarea.remove();
            }
        });
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

        var foldBtn = e.target.closest('.fold-toggle-btn');
        if (foldBtn) {
            var foldContainer = foldBtn.closest('.code-block-container');
            var wrapper = foldContainer.querySelector('.code-content');
            var controls = foldContainer.querySelector('.code-fold-controls');
            var isFolded = foldContainer.classList.contains('collapsed-code');
            var expandIcon = foldBtn.querySelector('.fold-icon-expand');
            var collapseIcon = foldBtn.querySelector('.fold-icon-collapse');

            if (isFolded) {
                foldContainer.classList.remove('collapsed-code');
                wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
                controls.classList.remove('absolute', 'bottom-0', 'h-20', 'bg-gradient-to-t');
                controls.classList.add('flex', 'justify-center', 'py-2', 'border-t', 'border-slate-200/50', 'dark:border-slate-700/50', 'bg-slate-50/50', 'dark:bg-transparent');

                if (expandIcon) expandIcon.classList.add('hidden');
                if (collapseIcon) collapseIcon.classList.remove('hidden');

                setTimeout(function () {
                    wrapper.style.maxHeight = 'none';
                }, 300);
            } else {
                wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
                wrapper.offsetHeight; // force reflow
                foldContainer.classList.add('collapsed-code');
                wrapper.style.maxHeight = '400px';
                controls.classList.add('absolute', 'bottom-0', 'h-20', 'bg-gradient-to-t');
                controls.classList.remove('py-4', 'border-t', 'border-slate-200/50', 'dark:border-slate-700/50', 'bg-slate-50/50', 'dark:bg-transparent');

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
                content.style.maxHeight = '400px';
                controls.classList.remove('hidden');
            } else {
                block.classList.remove('code-fold');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCodeFolding);
    } else {
        initCodeFolding();
    }

    // 折叠相关辅助样式动态注入（避免侵入主样式表）
    var foldStyles = '.collapsed-code .code-content{overflow-y:hidden!important;}.collapsed-code .code-fold-controls{display:flex!important;}';
    var styleSheet = document.createElement('style');
    styleSheet.innerText = foldStyles;
    document.head.appendChild(styleSheet);

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
