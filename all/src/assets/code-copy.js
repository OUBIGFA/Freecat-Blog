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

        function resetCheckbox(checkbox) {
            checkbox.checked = false;
        }

        doc.addEventListener('change', function (e) {
            if (!e.target.classList.contains('copy-checkbox')) return;
            var checkbox = e.target;
            if (!checkbox.checked) return;

            var text = textFromSource(checkbox) || textFromTarget(checkbox) || textFromCodeBlock(checkbox);
            if (!text) {
                resetCheckbox(checkbox);
                return;
            }

            copyText(text).then(function () {
                setTimeout(function () {
                    resetCheckbox(checkbox);
                }, 1000);
            }).catch(function (err) {
                console.error('Failed to copy:', err);
                resetCheckbox(checkbox);
            });
        });
    }

    window.FreecatCodeCopy = {
        init: init
    };
})();
