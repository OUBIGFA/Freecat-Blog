/* code-copy.js
 * 代码块复制按钮：独立于页面列表、搜索和文章逻辑。
 */
(function () {
    'use strict';

    function init(options) {
        var doc = options && options.document;
        var copyText = options && options.copyText;
        if (!doc || typeof copyText !== 'function') {
            throw new Error('FreecatCodeCopy requires document and copyText');
        }

        function querySelector(selector) {
            if (!selector) return '';
            var target = null;
            try {
                target = doc.querySelector(selector);
            } catch (err) {
                target = null;
            }
            return target;
        }

        function textFromSource(checkbox) {
            var target = querySelector(checkbox.getAttribute('data-copy-source'));
            if (!target) return '';
            if (target.type === 'application/json') {
                try {
                    return JSON.parse(target.textContent || '""');
                } catch (err) {
                    return '';
                }
            }
            return target.textContent || '';
        }

        function textFromTarget(checkbox) {
            var target = querySelector(checkbox.getAttribute('data-copy-target'));
            if (!target) return '';
            return target.innerText || target.textContent || '';
        }

        function textFromCodeBlock(checkbox) {
            var container = checkbox.closest('.code-block-container');
            if (!container) return '';

            var codeElement = container.querySelector('.code-content code') ||
                container.querySelector('pre code') ||
                container.querySelector('code');
            return codeElement ? (codeElement.textContent || '') : '';
        }

        // Native buttons preserve Enter/Space activation and show success only after writing.
        doc.addEventListener('click', function (e) {
            var button = e.target.closest('[data-copy-button]');
            if (!button || button.getAttribute('aria-busy') === 'true') return;
            var label = button.querySelector('[role="status"]');
            if (!button.hasAttribute('data-copy-label')) {
                button.setAttribute('data-copy-label', label.textContent);
                button.setAttribute('data-copy-aria', button.getAttribute('aria-label'));
            }
            clearTimeout(button.copyResetTimer);
            var text = textFromSource(button) || textFromTarget(button) || textFromCodeBlock(button);
            button.dataset.state = 'copying';
            button.setAttribute('aria-busy', 'true');

            function feedback(state, message) {
                button.dataset.state = state;
                button.removeAttribute('aria-busy');
                button.setAttribute('aria-label', message);
                label.textContent = message;
                button.copyResetTimer = setTimeout(function () {
                    button.dataset.state = 'idle';
                    button.setAttribute('aria-label', button.getAttribute('data-copy-aria'));
                    label.textContent = button.getAttribute('data-copy-label');
                }, 1800);
            }
            if (!text) { feedback('error', '没有可复制的内容'); return; }
            // Keep the clipboard call within the user gesture for browser permission checks.
            try {
                copyText(text).then(function () {
                    feedback('copied', '已复制');
                }).catch(function () {
                    feedback('error', '复制失败，请重试');
                });
            } catch (err) {
                feedback('error', '复制失败，请重试');
            }
        });
    }

    window.FreecatCodeCopy = {
        init: init
    };
})();
