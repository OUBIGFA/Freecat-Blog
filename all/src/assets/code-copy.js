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

        doc.addEventListener('change', function (e) {
            if (!e.target.classList.contains('copy-checkbox')) return;
            var checkbox = e.target;
            if (!checkbox.checked) return;

            var container = checkbox.closest('.code-block-container');
            if (!container) {
                checkbox.checked = false;
                return;
            }

            var codeElement = container.querySelector('.code-content code') ||
                container.querySelector('pre code') ||
                container.querySelector('code');
            if (!codeElement) {
                checkbox.checked = false;
                return;
            }

            var code = codeElement.textContent || '';
            copyText(code).then(function () {
                setTimeout(function () {
                    checkbox.checked = false;
                }, 1000);
            }).catch(function (err) {
                console.error('Failed to copy:', err);
                checkbox.checked = false;
            });
        });
    }

    window.FreecatCodeCopy = {
        init: init
    };
})();
