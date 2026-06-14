const path = require('path');
const fontkit = require('fontkit');

const DESKTOP_TITLE_FONT_SIZE_PX = 34;
const DESKTOP_HOME_CONTENT_WIDTH_PX = 1100;
const DESKTOP_HOME_INNER_PADDING_X_PX = 28;
const DESKTOP_CARD_PADDING_X_PX = 64 * 2;
const DESKTOP_CARD_GRID_GAP_PX = 56;
const DESKTOP_COVER_COLUMN_MIN_PX = 360;
const DESKTOP_COVER_COLUMN_RATIO = 0.43;
const DESKTOP_TITLE_SINGLE_LINE_SAFETY_PX = 48;
const SEPARATOR_INLINE_MARGIN_PX = 2;

let fontCache = null;

function loadFonts() {
    if (fontCache) return fontCache;
    const rootDir = path.join(__dirname, '..');
    fontCache = {
        figtreeRegular: fontkit.openSync(path.join(rootDir, 'fonts', 'freecat-figtree-regular.ttf')),
        figtreeExtraBold: fontkit.openSync(path.join(rootDir, 'fonts', 'freecat-figtree-extra-bold.ttf')),
        notoExtraBold: fontkit.openSync(path.join(rootDir, 'fonts', 'freecat-noto-sans-sc-extra-bold.ttf'))
    };
    return fontCache;
}

function supportsCodePoint(font, codePoint) {
    const glyph = font.glyphForCodePoint(codePoint);
    return !!glyph && glyph.id !== 0;
}

function selectFontForCodePoint(codePoint, fonts, weight) {
    const figtree = weight === 400 ? fonts.figtreeRegular : fonts.figtreeExtraBold;
    if (supportsCodePoint(figtree, codePoint)) return figtree;
    if (supportsCodePoint(fonts.notoExtraBold, codePoint)) return fonts.notoExtraBold;
    return figtree;
}

function measureRun(font, text) {
    if (!text) return 0;
    return font.layout(text).positions.reduce((sum, position) => sum + position.xAdvance, 0);
}

function measurePostCardTitleWidth(title) {
    const fonts = loadFonts();
    const text = String(title || '');
    let widthUnits = 0;
    let runText = '';
    let runFont = null;

    function flushRun() {
        if (!runText || !runFont) return;
        widthUnits += measureRun(runFont, runText) / runFont.unitsPerEm;
        runText = '';
        runFont = null;
    }

    for (const char of text) {
        const codePoint = char.codePointAt(0);
        const isSeparator = char === '|';
        const font = selectFontForCodePoint(codePoint, fonts, isSeparator ? 400 : 800);
        if (font !== runFont) flushRun();
        runFont = font;
        runText += char;
        if (isSeparator) {
            flushRun();
            widthUnits += SEPARATOR_INLINE_MARGIN_PX / DESKTOP_TITLE_FONT_SIZE_PX;
        }
    }
    flushRun();

    return widthUnits * DESKTOP_TITLE_FONT_SIZE_PX;
}

function desktopTitleColumnWidth(hasCover) {
    const cardWidth = DESKTOP_HOME_CONTENT_WIDTH_PX - (DESKTOP_HOME_INNER_PADDING_X_PX * 2);
    const gridWidth = cardWidth - DESKTOP_CARD_PADDING_X_PX;
    if (!hasCover) return gridWidth;

    const coverColumnWidth = Math.max(
        DESKTOP_COVER_COLUMN_MIN_PX,
        gridWidth * DESKTOP_COVER_COLUMN_RATIO
    );
    return gridWidth - coverColumnWidth - DESKTOP_CARD_GRID_GAP_PX;
}

function getDesktopPreviewLinesForTitle(title, options = {}) {
    const titleWidth = measurePostCardTitleWidth(title);
    const availableWidth = desktopTitleColumnWidth(!!options.hasCover);
    return titleWidth <= availableWidth - DESKTOP_TITLE_SINGLE_LINE_SAFETY_PX ? 7 : 5;
}

function getDesktopTitleLayout(title, options = {}) {
    const previewLines = getDesktopPreviewLinesForTitle(title, options);
    return {
        singleLine: previewLines === 7,
        previewLines
    };
}

module.exports = {
    desktopTitleColumnWidth,
    getDesktopTitleLayout,
    getDesktopPreviewLinesForTitle,
    measurePostCardTitleWidth
};
