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
    //   把 <main> 下第一层包装 div（max-w-[1600px] + pb-36/lg:pb-48 那一层）
    //   的底边对齐到视口底边 —— 它包含了 <article> + 侧边栏 + 底部留白，
    //   是用户视觉上的"文章版块结束 / footer 开始"的分界。
    //   读取的是元素的 getBoundingClientRect().bottom（实时尺寸），
    //   不依赖任何写死的高度数值，自适应文章长度 / 内嵌图片 / pb-tokens 调整。
    function getArticleBottomScrollY() {
        var container = document.querySelector('main > div')
            || document.querySelector('main article');
        if (!container) {
            // 兜底：意外找不到容器时，退回整页底部，避免按钮失效
            var scrollingElement = document.scrollingElement || document.documentElement;
            var scrollHeight = scrollingElement ? scrollingElement.scrollHeight : 0;
            return Math.max(0, scrollHeight - window.innerHeight);
        }
        var rect = container.getBoundingClientRect();
        var containerBottomAbs = rect.bottom + window.pageYOffset;
        return Math.max(0, containerBottomAbs - window.innerHeight);
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
            if (show) {
                btn.classList.remove('opacity-0', 'invisible');
                btn.classList.add('opacity-100', 'visible');
            } else {
                btn.classList.add('opacity-0', 'invisible');
                btn.classList.remove('opacity-100', 'visible');
            }
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
                scrollToArticleBottom('smooth');

                // Images, embedded content, or custom fonts can change page height during
                // the smooth scroll. Re-target the real bottom after layout settles.
                window.setTimeout(function () {
                    scrollToArticleBottom('auto');
                }, 450);
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
    document.querySelectorAll('nav a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            var targetId = this.getAttribute('href').substring(1);
            var targetElement = document.getElementById(targetId);
            var article = document.querySelector('article');

            if (targetElement && article) {
                var headerOffset = 100;
                var articleBottom = article.offsetTop + article.offsetHeight;
                var headingScrollY = targetElement.offsetTop - headerOffset;
                var articleEndScrollY = articleBottom - window.innerHeight + 60;
                var finalScrollY = Math.min(headingScrollY, articleEndScrollY);

                window.scrollTo({
                    top: Math.max(0, finalScrollY),
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
