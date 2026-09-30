/* global self */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./shared.js'));
    } else {
        root.FreecatMediaPlayerTemplate = factory(root.FreecatShared);
    }
}(typeof self !== 'undefined' ? self : this, function (shared) {
    'use strict';

    if (!shared || typeof shared.escapeHtml !== 'function') {
        throw new Error('FreecatShared not loaded - ensure shared.js loads before media-player-template.js');
    }

    const escapeHtml = shared.escapeHtml;

    // Tabler Icons (MIT) stay in the local asset tree; masks follow the active theme.
    function mediaIcon(name) {
        return `<span class="media-control-icon" aria-hidden="true" style="--media-icon:url('/assets/icons/tabler/${name}.svg')"></span>`;
    }
    const PLAY_ICON = mediaIcon('player-play');
    const PAUSE_ICON = mediaIcon('player-pause');
    const VOLUME_ICON = mediaIcon('volume');
    const MUTE_ICON = mediaIcon('volume-3');
    const AUDIO_TITLE_ICON = mediaIcon('music');
    const VIDEO_TITLE_ICON = mediaIcon('movie');
    const FULLSCREEN_ICON = mediaIcon('arrows-maximize');
    const BIG_PLAY_ICON = PLAY_ICON;
    const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    function speedLabel(speed) {
        return speed === 1 ? '1.0x' : speed + 'x';
    }

    function renderSpeedOptions(kind) {
        return SPEEDS.map((speed) => (
            '<button type="button" class="media-speed-option ' + kind + '-speed-option' + (speed === 1 ? ' active' : '') + '" role="menuitemradio" aria-checked="' + (speed === 1) + '" tabindex="-1" data-speed="' + speed + '">' + mediaIcon('check') + '<span>' + speedLabel(speed) + '</span></button>'
        )).join('');
    }

    function renderPlayerChrome(options) {
        const kind = options.kind;
        const title = String(options.title || '');
        const titleIcon = options.titleIcon || '';
        const escapedTitle = escapeHtml(title);
        const progressLabel = options.progressLabel || '播放进度';
        const extraRightControls = options.extraRightControls || '';
        const mediaElementHtml = options.mediaElementHtml || '';
        const titleText = title
            ? '<span>' + escapedTitle + '</span>'
            : '';

        return `
            <div class="media-player-title ${kind}-player-title">
                <div class="media-player-title-left ${kind}-player-title-left">
                    ${title ? `<span class="media-player-icon ${kind}-player-icon flex items-center justify-center">${titleIcon}</span>` : ''}
                    ${titleText}
                </div>
                <span class="media-time ${kind}-time">
                    <span class="media-current-time ${kind}-current-time">0:00</span>
                    <span> / </span>
                    <span class="media-duration ${kind}-duration">0:00</span>
                </span>
            </div>
            <div class="media-progress-container ${kind}-progress-container" role="slider" tabindex="0" aria-label="${escapeHtml(progressLabel)}"
                aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00" aria-disabled="true">
                <div class="media-progress-bar ${kind}-progress-bar"></div>
                <div class="media-progress-thumb ${kind}-progress-thumb"></div>
                <div class="media-progress-tooltip ${kind}-progress-tooltip" aria-hidden="true">0:00</div>
            </div>
            <div class="media-controls ${kind}-controls">
                <div class="media-controls-left ${kind}-controls-left">
                    <button type="button" class="media-play-btn ${kind}-play-btn" aria-label="播放" title="播放">
                        <span class="media-play-icon ${kind}-play-icon flex items-center justify-center">${PLAY_ICON}</span>
                    </button>
                    <div class="media-volume-control ${kind}-volume-control">
                        <button type="button" class="media-volume-btn ${kind}-volume-btn" aria-label="静音" title="静音">
                            ${VOLUME_ICON}
                        </button>
                        <div class="media-volume-slider-wrapper ${kind}-volume-slider-wrapper">
                            <input type="range" class="media-volume-slider ${kind}-volume-slider" aria-label="音量" min="0" max="1" step="0.01" value="0.6">
                        </div>
                    </div>
                </div>
                <div class="media-controls-right ${kind}-controls-right">
                    <div class="media-speed-control ${kind}-speed-control">
                        <button type="button" class="media-speed-btn ${kind}-speed-btn" aria-label="播放速度：1.0x" title="播放速度" aria-haspopup="menu" aria-expanded="false">1.0x</button>
                        <div class="media-speed-dropdown ${kind}-speed-dropdown" role="menu" aria-label="播放速度" inert>
                            ${renderSpeedOptions(kind)}
                        </div>
                    </div>
                    ${extraRightControls}
                </div>
            </div>
            <p class="media-status" role="status" hidden></p>
            ${mediaElementHtml}`;
    }

    function getAudioType(url) {
        const urlLower = String(url || '').toLowerCase();
        if (urlLower.includes('.mp3')) return 'audio/mpeg';
        if (urlLower.includes('.m4a')) return 'audio/mp4';
        if (urlLower.includes('.wav')) return 'audio/wav';
        if (urlLower.includes('.ogg')) return 'audio/ogg';
        if (urlLower.includes('.aac')) return 'audio/aac';
        if (urlLower.includes('.flac')) return 'audio/flac';
        if (urlLower.includes('.opus')) return 'audio/opus';
        return 'audio/mpeg';
    }

    function renderAudioPlayer(options) {
        const src = String((options && (options.src || options.audioUrl)) || '');
        const title = String((options && options.title) || '');
        const safeSrc = escapeHtml(src);
        const safeTitle = escapeHtml(title);

        return `<div class="audio-player-container media-player-container" data-audio-src="${safeSrc}" data-audio-title="${safeTitle}">
            ${renderPlayerChrome({
                kind: 'audio',
                title,
                titleIcon: AUDIO_TITLE_ICON,
                progressLabel: '音频进度',
                mediaElementHtml: `
                <audio preload="metadata">
                    <source src="${safeSrc}" type="${getAudioType(src)}">
                    Your browser does not support the audio element.
                </audio>`
            })}
        </div>`;
    }

    function renderVideoPlayer(options) {
        const src = String((options && (options.src || options.videoUrl)) || '');
        const title = String((options && options.title) || '');
        const safeSrc = escapeHtml(src);
        const safeTitle = escapeHtml(title);

        return `<div class="video-player-container media-player-container" data-video-src="${safeSrc}" data-video-title="${safeTitle}">
            <div class="video-player-stage">
                <video class="video-player-video" preload="metadata" playsinline></video>
                <button class="video-player-overlay" type="button" aria-label="播放视频">
                    <span class="video-player-overlay-icon flex items-center justify-center">${BIG_PLAY_ICON}</span>
                </button>
            </div>
            ${renderPlayerChrome({
                kind: 'video',
                title,
                titleIcon: VIDEO_TITLE_ICON,
                progressLabel: '视频进度',
                extraRightControls: `<button type="button" class="media-fullscreen-btn video-fullscreen-btn" aria-label="全屏" title="全屏">${FULLSCREEN_ICON}</button>`
            })}
        </div>`;
    }

    return {
        renderPlayerChrome,
        renderAudioPlayer,
        renderVideoPlayer,
        getAudioType,
        formatTime,
        escapeHtml,
        icons: {
            play: PLAY_ICON,
            pause: PAUSE_ICON,
            volume: VOLUME_ICON,
            mute: MUTE_ICON,
            audioTitle: AUDIO_TITLE_ICON,
            videoTitle: VIDEO_TITLE_ICON,
            fullscreen: FULLSCREEN_ICON,
            bigPlay: BIG_PLAY_ICON
        }
    };
}));
