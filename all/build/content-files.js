const path = require('path');

const CONTENT_FILE_EXTENSIONS = new Set([
    '.md',
    '.markdown',
    '.mdown',
    '.mkd',
    '.mkdn',
    '.txt',
    '.text'
]);

const MARKDOWN_FILE_EXTENSIONS = new Set([
    '.md',
    '.markdown',
    '.mdown',
    '.mkd',
    '.mkdn'
]);

function contentFileExtension(file) {
    return path.extname(String(file || '')).toLowerCase();
}

function isContentFile(file) {
    return CONTENT_FILE_EXTENSIONS.has(contentFileExtension(file));
}

function isMarkdownContentFile(file) {
    return MARKDOWN_FILE_EXTENSIONS.has(contentFileExtension(file));
}

function contentFileSlug(file) {
    return path.basename(file, path.extname(file));
}

module.exports = {
    CONTENT_FILE_EXTENSIONS,
    MARKDOWN_FILE_EXTENSIONS,
    contentFileExtension,
    isContentFile,
    isMarkdownContentFile,
    contentFileSlug
};
