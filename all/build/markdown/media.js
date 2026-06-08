function normalizeImageHref(href) {
    const raw = String(href || '').trim();
    if (!raw) return '';
    if (/^(?:https?:)?\/\//i.test(raw) || /^(?:data|blob):/i.test(raw) || raw.startsWith('/')) return raw;

    const normalized = raw.replace(/\\/g, '/');
    const imagePathMatch = /^(?:\.\.\/|\.\/)*all\/image\/(.+)$/i.exec(normalized);
    if (imagePathMatch) return `/image/${imagePathMatch[1]}`;

    return raw;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function decodeBasicHtmlEntities(value) {
    return String(value || '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
}

function escapeRenderedText(value) {
    return escapeHtml(decodeBasicHtmlEntities(value));
}

function isLikelyImageUrl(href) {
    const raw = String(href || '').trim();
    if (!raw) return false;
    if (/^(?:data|blob):/i.test(raw)) return true;
    if (!/^(?:https?:)?\/\//i.test(raw)) return true;

    const imageExtensions = /^(?:avif|gif|jpe?g|png|svg|webp|bmp|ico|tiff?)$/i;

    try {
        const url = new URL(raw, 'https://example.com');
        if (/\.(?:avif|gif|jpe?g|png|svg|webp|bmp|ico|tiff?)(?:$|[?#])/i.test(url.pathname)) return true;

        for (const [key, value] of url.searchParams.entries()) {
            const normalizedKey = key.toLowerCase();
            if ((normalizedKey === 'format' || normalizedKey === 'fm' || normalizedKey === 'type') && imageExtensions.test(value)) {
                return true;
            }
        }

        return false;
    } catch (err) {
        return false;
    }
}

function normalizeEmbedUrl(href) {
    const raw = String(href || '').trim();
    if (!raw || !/^(?:https?:)?\/\//i.test(raw)) return '';
    return raw.startsWith('//') ? `https:${raw}` : raw;
}

const MEDIA_RULES = {
    video: {
        // 视频直链识别：mp4/webm/ogv/mov/m4v/m3u8。故意避开 .ogg（归音频）。
        extensionRe: /\.(?:mp4|webm|ogv|mov|m4v|m3u8)(?:$|[?#])/i,
        markerRe: /\u{1f3ac}|\u{1f3a5}|\u{1f4f9}/u,
        markerGlobalRe: /\u{1f3ac}|\u{1f3a5}|\u{1f4f9}/gu
    },
    audio: {
        extensionRe: /\.(?:mp3|m4a|wav|ogg|aac|flac|opus)(?:$|[?#])/i,
        markerRe: /\u{1f3b5}/u,
        markerGlobalRe: /\u{1f3b5}/gu
    }
};

function mediaRule(kind) {
    return MEDIA_RULES[kind] || MEDIA_RULES.video;
}

function hasMediaMarker(kind, text) {
    return mediaRule(kind).markerRe.test(String(text || ''));
}

function cleanMediaTitle(kind, text) {
    return String(text || '').replace(mediaRule(kind).markerGlobalRe, '').trim();
}

function pickMediaUrl(kind, href, { force = false } = {}) {
    const raw = String(href || '').trim();
    if (!raw) return '';
    const { extensionRe } = mediaRule(kind);
    if (/^(?:data|blob):/i.test(raw) && extensionRe.test(raw)) return raw;
    const candidates = raw.split(/[\s<>]+/).map(part => part.trim()).filter(Boolean);
    for (const candidate of candidates) {
        try {
            const url = new URL(candidate, 'https://example.com');
            if (extensionRe.test(url.pathname)) return candidate;
        } catch (err) {
            if (extensionRe.test(candidate)) return candidate;
        }
    }
    if (force) return candidates[0] || raw;
    return '';
}

function normalizeMultilineVideoImages(content) {
    if (!content) return '';
    return String(content).replace(/!\[([^\]]*)\]\(([\s\S]*?)\)/g, (match, alt, target) => {
        const videoUrl = pickVideoUrl(target);
        if (!videoUrl || !/\r?\n/.test(target)) return match;
        return `![${alt}](${videoUrl})`;
    });
}

function hasVideoMarker(text) {
    return hasMediaMarker('video', text);
}

function hasAudioMarker(text) {
    return hasMediaMarker('audio', text);
}

function cleanAudioTitle(text) {
    return cleanMediaTitle('audio', text);
}

function pickAudioUrl(href, { force = false } = {}) {
    return pickMediaUrl('audio', href, { force });
}

function isAudioUrl(href) {
    return Boolean(pickAudioUrl(href));
}

function parseImageStyleAudio(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;

    const match = /^!\[([^\]]*)\]\(([\s\S]*?)\)$/.exec(raw);
    if (!match) return null;

    const title = cleanAudioTitle(match[1]);
    const force = hasAudioMarker(match[1]);
    const src = pickAudioUrl(match[2], { force });
    if (!src) return null;

    return { src, title };
}

function parseImageStyleAudioList(value) {
    const raw = String(value || '').trim();
    if (!raw) return [];

    const playlist = [];
    const imageRe = /!\[([^\]]*)\]\(([\s\S]*?)\)/g;
    let match;
    while ((match = imageRe.exec(raw))) {
        const audio = parseImageStyleAudio(match[0]);
        if (audio) playlist.push(audio);
    }
    if (playlist.length) return playlist;

    return raw.split(',')
        .map(part => part.trim())
        .filter(Boolean)
        .map(part => {
            const src = pickAudioUrl(part, { force: true });
            return src ? { src, title: '' } : null;
        })
        .filter(Boolean);
}

function pickVideoUrl(href, { force = false } = {}) {
    return pickMediaUrl('video', href, { force });
}

function isVideoUrl(href) {
    return Boolean(pickVideoUrl(href));
}

function getExternalEmbed(url) {
    let parsed;
    try {
        parsed = new URL(url);
    } catch (err) {
        return null;
    }

    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    const providers = [
        {
            name: 'youtube',
            match: () => host === 'youtube.com' || host === 'youtu.be',
            render() {
                const id = host === 'youtu.be'
                    ? parsed.pathname.split('/').filter(Boolean)[0]
                    : parsed.searchParams.get('v') || /^\/embed\/([^/?#]+)/.exec(parsed.pathname)?.[1];
                if (!id) return null;
                const safeId = encodeURIComponent(id);
                return `<iframe class="external-embed-frame" src="https://www.youtube.com/embed/${safeId}" title="Embedded video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
            }
        },
        {
            name: 'vimeo',
            match: () => host === 'vimeo.com' || host === 'player.vimeo.com',
            render() {
                const id = /^\/(?:video\/)?(\d+)/.exec(parsed.pathname)?.[1];
                if (!id) return null;
                return `<iframe class="external-embed-frame" src="https://player.vimeo.com/video/${id}" title="Embedded video" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
            }
        },
        {
            name: 'twitter',
            match: () => ['x.com', 'twitter.com', 'mobile.twitter.com'].includes(host) && /\/status(?:es)?\/\d+/i.test(parsed.pathname),
            render() {
                const href = escapeHtml(url);
                return `<blockquote class="twitter-tweet"><a href="${href}"></a></blockquote>`;
            }
        }
    ];

    for (const provider of providers) {
        if (!provider.match()) continue;
        const html = provider.render();
        if (html) return { provider: provider.name, html };
    }

    return null;
}

function renderExternalEmbed(href, text) {
    const url = normalizeEmbedUrl(href);
    if (!url) return '';
    const embed = getExternalEmbed(url);
    const safeUrl = escapeHtml(url);
    const label = String(text || '').trim() || url;
    const safeLabel = escapeHtml(label);
    const placeholder = '<img class="external-embed-placeholder" src="/image/404.png" alt="" loading="lazy" decoding="async" aria-hidden="true" />';
    const loader = '<div class="external-embed-loader placeholder-loader" aria-hidden="true"><span class="loader"></span></div>';

    if (embed) {
        return `
    <figure class="external-embed external-embed-${embed.provider} external-embed-loading" data-embed-provider="${embed.provider}" data-embed-url="${safeUrl}">
        ${placeholder}
        ${loader}
        <div class="external-embed-content">${embed.html}</div>
    </figure>`;
    }

    return `
    <figure class="external-embed external-embed-link external-embed-loading" data-embed-provider="link">
        ${placeholder}
        ${loader}
        <div class="external-embed-content"><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeLabel}</a></div>
    </figure>`;
}

function renderMediaLoadingChrome(kind, safeSrc, fallbackLabel, { fullscreen = false } = {}) {
    const label = fallbackLabel || safeSrc;
    const fullscreenControl = fullscreen
        ? '<span class="media-player-loading-fullscreen"></span>'
        : '';
    return `
        <div class="media-player-loading-chrome">
            <div class="media-player-loading-title">
                <a class="${kind}-player-fallback" href="${safeSrc}" target="_blank" rel="noopener noreferrer">${label}</a>
                <span class="media-time">
                    <span>0:00</span>
                    <span> / </span>
                    <span>0:00</span>
                </span>
            </div>
            <div class="media-player-loading-progress"></div>
            <div class="media-player-loading-controls">
                <div class="media-player-loading-controls-left">
                    <span class="media-player-loading-play"></span>
                    <span class="media-player-loading-volume"></span>
                </div>
                <div class="media-player-loading-controls-right">
                    <span class="media-player-loading-speed">1.0x</span>
                    ${fullscreenControl}
                </div>
            </div>
        </div>`;
}

// 视频播放器占位：图片语法 ![标题](视频.mp4) 命中视频直链时产出。
// 客户端 video-player.js 会读取 data-* 把它替换成自定义播放器；
// 内部的 <a> 是无 JS 时的优雅降级（仍可点开直链）。
function renderVideoEmbed(href, text, { force = false } = {}) {
    const src = pickVideoUrl(href, { force });
    if (!src) return '';
    const safeSrc = escapeHtml(src);
    const safeTitle = escapeRenderedText(cleanMediaTitle('video', text));
    const fallbackLabel = safeTitle || safeSrc;
    return `
    <figure class="video-player video-player-loading media-player-container" data-video-src="${safeSrc}" data-video-title="${safeTitle}">
        <div class="video-player-stage" aria-hidden="true">
            <div class="video-player-loading-overlay">
                <span class="video-player-loading-icon"></span>
            </div>
        </div>
        ${renderMediaLoadingChrome('video', safeSrc, fallbackLabel, { fullscreen: true })}
    </figure>`;
}

// 音频播放器占位：和视频一致，图片语法 ![标题](音频.mp3) 命中音频直链时产出。
// 客户端 audio-player.js 会读取 data-* 把它替换成自定义播放器；
// 内部的 <a> 是无 JS 时的优雅降级（仍可点开直链）。
function renderAudioEmbed(href, text, { force = false } = {}) {
    const src = pickAudioUrl(href, { force });
    if (!src) return '';
    const safeSrc = escapeHtml(src);
    const safeTitle = escapeRenderedText(cleanAudioTitle(text));
    const fallbackLabel = safeTitle || safeSrc;
    return `
    <figure class="audio-player audio-player-loading media-player-container" data-audio-src="${safeSrc}" data-audio-title="${safeTitle}">
        ${renderMediaLoadingChrome('audio', safeSrc, fallbackLabel)}
    </figure>`;
}

function stripRenderedHtmlTags(html) {
    return decodeBasicHtmlEntities(String(html || '').replace(/<[^>]*>/g, '').trim());
}

function extractSingleRenderedLink(html) {
    const trimmed = String(html || '').trim();
    const match = /^<p>\s*<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>\s*<\/p>$/i.exec(trimmed);
    if (!match) return null;
    return {
        href: decodeBasicHtmlEntities(match[1]),
        text: stripRenderedHtmlTags(match[2])
    };
}

// 解析图片 markdown title 中的尺寸标记。
//   ![alt](src "1200x800")           → width=1200, height=800, cleanTitle=''
//   ![alt](src "Cover 1200x800")     → width=1200, height=800, cleanTitle='Cover'
//   ![alt](src "width=1200 height=800") → 同上
//   ![alt](src "Caption")            → cleanTitle='Caption'，无尺寸
// 仅识别 2–5 位整数像素，避免误吞捕获普通 "10x" / 年份等噪声。
// 大小写不敏感；× / x 都接受。

module.exports = {
    normalizeImageHref,
    escapeHtml,
    decodeBasicHtmlEntities,
    escapeRenderedText,
    isLikelyImageUrl,
    normalizeEmbedUrl,
    normalizeMultilineVideoImages,
    hasVideoMarker,
    hasAudioMarker,
    cleanAudioTitle,
    pickAudioUrl,
    isAudioUrl,
    parseImageStyleAudio,
    parseImageStyleAudioList,
    pickVideoUrl,
    isVideoUrl,
    getExternalEmbed,
    renderExternalEmbed,
    renderMediaLoadingChrome,
    renderVideoEmbed,
    renderAudioEmbed,
    stripRenderedHtmlTags,
    extractSingleRenderedLink
};
