function firstDefined(...values) {
    return values.find(value => value !== undefined && value !== null);
}

function toInteger(value) {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeTags(value) {
    if (Array.isArray(value)) {
        return value.map(tag => String(tag == null ? '' : tag).trim()).filter(Boolean);
    }
    if (value == null || value === '') return [];
    const tag = String(value).trim();
    return tag ? [tag] : [];
}

function normalizePostTags(post = {}) {
    return normalizeTags(firstDefined(post.tags, post.tag, []));
}

function normalizePostFrontmatter(data = {}) {
    return {
        show: data.show,
        title: data.title,
        description: data.description,
        summary: data.summary,
        date: data.date,
        updated: firstDefined(data.updated, data.date_updated),
        cover: data.cover || '',
        coverWidth: toInteger(data.cover_width),
        coverHeight: toInteger(data.cover_height),
        tags: normalizeTags(firstDefined(data.tags, data.tag, [])),
        pinned: data.pinned === true,
        author: data.author || '',
        authorUrl: firstDefined(data.author_url, data.authorUrl, ''),
        noindex: data.noindex === true,
        faq: data.faq,
        enableImageCaptions: data.show_image_captions === true
            || data.enable_image_captions === true
            || data.enableImageCaptions === true
    };
}

module.exports = { normalizePostFrontmatter, normalizePostTags };
