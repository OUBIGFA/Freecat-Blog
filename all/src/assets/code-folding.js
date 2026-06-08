/* code-folding.js
 * 文章长代码块折叠、展开和代码块内导航。
 */
(function () {
    'use strict';

    var CODE_COLLAPSED_HEIGHT = 400;
    var CODE_FOLD_TRANSITION_MS = 420;

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

    function setCodeControlsInlineLayout(controls) {
        if (!controls) return;
        controls.classList.remove('absolute', 'bottom-0', 'h-20', 'bg-gradient-to-t');
        controls.classList.add('flex', 'justify-center', 'py-2', 'border-t', 'border-slate-200/50', 'dark:border-slate-700/50', 'bg-slate-50/50', 'dark:bg-transparent');
    }

    function getCodeControlsTarget(block, finalContentHeight) {
        var controls = block.querySelector('.code-fold-controls');
        var codeWrapper = block.querySelector('.code-wrapper');
        if (!controls || !codeWrapper) return null;

        var content = block.querySelector('.code-content');
        var wrapperRect = codeWrapper.getBoundingClientRect();
        var contentRect = content ? content.getBoundingClientRect() : wrapperRect;
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        var controlsHeight = controls.offsetHeight || 34;
        var wrapperBottom = typeof finalContentHeight === 'number'
            ? contentRect.top + finalContentHeight
            : contentRect.bottom;

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
        if (mode === 'pinned-bottom') {
            top = Math.max(minTop, maxBottom - controlsHeight);
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
        setTimeout(finish, CODE_FOLD_TRANSITION_MS + 80);
    }

    function settleCollapsedCodeHeight(content, container) {
        var done = false;
        var finish = function (event) {
            if (event && event.target !== content) return;
            if (event && event.propertyName !== 'max-height') return;
            if (done) return;
            done = true;
            content.removeEventListener('transitionend', finish);
            if (container.classList.contains('collapsed-code')) {
                container.classList.remove('code-collapsing');
            }
        };

        content.addEventListener('transitionend', finish);
        setTimeout(finish, CODE_FOLD_TRANSITION_MS + 80);
    }

    // 代码块导航和折叠按钮统一委托
    document.addEventListener('click', function (e) {
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
                    setCodeControlsInlineLayout(controls);
                    openingTarget = getCodeControlsTarget(foldContainer, targetHeight);
                    if (openingTarget) {
                        controls.style.width = 'max-content';
                        controls.style.maxWidth = openingTarget.maxWidth + 'px';
                        controls.style.setProperty('--code-controls-left', openingTarget.left + 'px');
                        controls.classList.remove('code-controls-pinned-bottom');
                        controls.classList.remove('code-controls-viewport-bottom');
                        controls.classList.remove('code-controls-outside');
                        controls.classList.add('code-controls-opening');
                    }
                }

                if (expandIcon) expandIcon.classList.add('hidden');
                if (collapseIcon) collapseIcon.classList.remove('hidden');

                window.requestAnimationFrame(function () {
                    wrapper.style.maxHeight = targetHeight + 'px';
                    if (controls && openingTarget) {
                        controls.style.setProperty('--code-controls-top', openingTarget.top + 'px');
                        controls.style.setProperty('--code-controls-left', openingTarget.left + 'px');
                    }
                });
                setTimeout(function () {
                    if (!foldContainer.classList.contains('expanded-code') || !controls) return;
                    controls.classList.remove('code-controls-opening');
                    applyCodeControlsPosition(foldContainer);
                }, CODE_FOLD_TRANSITION_MS);
                settleExpandedCodeHeight(wrapper, foldContainer);
            } else {
                wrapper.style.maxHeight = wrapper.scrollHeight + 'px';
                wrapper.offsetHeight; // force reflow
                foldContainer.classList.add('code-collapsing');
                foldContainer.classList.add('collapsed-code');
                foldContainer.classList.remove('expanded-code');
                foldContainer.classList.remove('code-expanding');
                if (controls) controls.classList.remove('code-controls-opening');
                resetCodeControlsPosition(controls);
                wrapper.style.maxHeight = CODE_COLLAPSED_HEIGHT + 'px';
                setCodeControlsInlineLayout(controls);

                if (expandIcon) expandIcon.classList.remove('hidden');
                if (collapseIcon) collapseIcon.classList.add('hidden');
                settleCollapsedCodeHeight(wrapper, foldContainer);

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
                setCodeControlsInlineLayout(controls);
            } else {
                block.classList.remove('code-fold');
                block.classList.remove('expanded-code');
                resetCodeControlsPosition(controls);
            }
        });
        scheduleCodeControlsUpdate();
    }

    window.addEventListener('scroll', scheduleCodeControlsUpdate, { passive: true });
    window.addEventListener('resize', scheduleCodeControlsUpdate);

    window.FreecatCodeFolding = {
        init: initCodeFolding,
        scheduleControlsUpdate: scheduleCodeControlsUpdate
    };
})();
