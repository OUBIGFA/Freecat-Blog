const { escapeHtml } = require('../shared/shared.js');
const { renderIcon } = require('./icons.js');

function renderCopyButton(options = {}) {
    const className = options.className ? ' ' + escapeHtml(options.className) : '';
    // Existing callers pass trusted build-time data attributes through inputAttrs.
    const attrs = options.inputAttrs || '';
    const label = escapeHtml(options.ariaLabel || '复制');
    return '<button type="button" class="t-btn-icon copy-btn-container' + className + '" data-copy-button data-state="idle" aria-label="' + label + '" title="' + escapeHtml(options.title || options.ariaLabel || '复制') + '"' + attrs + '>' +
        '<span class="clipboard" aria-hidden="true">' + renderIcon('copy') + '</span>' +
        '<span class="clipboard-check" aria-hidden="true">' + renderIcon('check') + '</span>' +
        '<span class="copy-btn-text' + (options.text ? '' : ' sr-only') + '" role="status" aria-live="polite">' + escapeHtml(options.text || '') + '</span>' +
        '</button>';
}

module.exports = { renderCopyButton };
