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

    function toggleNavButtons() {
        var scrollY = window.scrollY;
        var show = scrollY > 500;

        function setVisibility(btn, slideClass) {
            if (!btn) return;
            if (show) {
                btn.classList.remove('opacity-0', 'invisible', slideClass);
                btn.classList.add('opacity-100', 'visible', 'translate-x-0');
            } else {
                btn.classList.add('opacity-0', 'invisible', slideClass);
                btn.classList.remove('opacity-100', 'visible', 'translate-x-0');
            }
        }

        setVisibility(backToTopBtn, 'translate-x-4');
        setVisibility(scrollToBottomBtn, 'translate-x-4');
        setVisibility(floatingGoBackBtn, 'translate-x-4');
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
                var article = document.querySelector('article');
                if (article) {
                    var articleBottom = article.offsetTop + article.offsetHeight;
                    var articleEndScrollY = articleBottom - window.innerHeight + 60;
                    window.scrollTo({
                        top: Math.max(0, articleEndScrollY),
                        behavior: 'smooth'
                    });
                } else {
                    window.scrollTo({
                        top: document.documentElement.scrollHeight,
                        behavior: 'smooth'
                    });
                }
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
    var shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
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
                var btnText = shareBtn.querySelector('span');
                var originalText = btnText.textContent;
                btnText.textContent = 'Link copied!';
                shareBtn.style.transition = 'transform 0.15s ease-out';
                shareBtn.style.transform = 'scale(0.95)';
                setTimeout(function () {
                    shareBtn.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    shareBtn.style.transform = 'scale(1)';
                }, 100);
                setTimeout(function () {
                    btnText.textContent = originalText;
                }, 2000);
            }).catch(function (err) {
                console.error('Copy failed:', err);
                var btnText = shareBtn.querySelector('span');
                var originalText = btnText.textContent;
                btnText.textContent = 'Copy failed';
                setTimeout(function () {
                    btnText.textContent = originalText;
                }, 2000);
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
