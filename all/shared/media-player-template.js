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

    const PLAY_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><path d="M9 8.48216V15.518L15.0307 12.0001L9 8.48216ZM7.75194 5.43872L18.2596 11.5682C18.4981 11.7073 18.5787 12.0135 18.4396 12.252C18.3961 12.3265 18.3341 12.3885 18.2596 12.432L7.75194 18.5615C7.51341 18.7006 7.20725 18.62 7.06811 18.3815C7.0235 18.305 7 18.2181 7 18.1296V5.87061C7 5.59446 7.22386 5.37061 7.5 5.37061C7.58853 5.37061 7.67547 5.39411 7.75194 5.43872Z"></path></svg>';
    const PAUSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><path d="M15 7C15 6.44772 15.4477 6 16 6C16.5523 6 17 6.44772 17 7V17C17 17.5523 16.5523 18 16 18C15.4477 18 15 17.5523 15 17V7ZM7 7C7 6.44772 7.44772 6 8 6C8.55228 6 9 6.44772 9 7V17C9 17.5523 8.55228 18 8 18C7.44772 18 7 17.5523 7 17V7Z"></path></svg>';
    const VOLUME_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M6.60282 10.0001L10 7.22056V16.7796L6.60282 14.0001H3V10.0001H6.60282ZM2 16.0001H5.88889L11.1834 20.3319C11.2727 20.405 11.3846 20.4449 11.5 20.4449C11.7761 20.4449 12 20.2211 12 19.9449V4.05519C12 3.93977 11.9601 3.8279 11.887 3.73857C11.7121 3.52485 11.3971 3.49335 11.1834 3.66821L5.88889 8.00007H2C1.44772 8.00007 1 8.44778 1 9.00007V15.0001C1 15.5524 1.44772 16.0001 2 16.0001ZM23 12C23 15.292 21.5539 18.2463 19.2622 20.2622L17.8445 18.8444C19.7758 17.1937 21 14.7398 21 12C21 9.26016 19.7758 6.80629 17.8445 5.15557L19.2622 3.73779C21.5539 5.75368 23 8.70795 23 12ZM18 12C18 10.0883 17.106 8.38548 15.7133 7.28673L14.2842 8.71584C15.3213 9.43855 16 10.64 16 12C16 13.36 15.3213 14.5614 14.2842 15.2841L15.7133 16.7132C17.106 15.6145 18 13.9116 18 12Z"></path></svg>';
    const MUTE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M10 7.22056L6.60282 10.0001H3V14.0001H6.60282L10 16.7796V7.22056ZM5.88889 16.0001H2C1.44772 16.0001 1 15.5524 1 15.0001V9.00007C1 8.44778 1.44772 8.00007 2 8.00007H5.88889L11.1834 3.66821C11.3971 3.49335 11.7121 3.52485 11.887 3.73857C11.9601 3.8279 12 3.93977 12 4.05519V19.9449C12 20.2211 11.7761 20.4449 11.5 20.4449C11.3846 20.4449 11.2727 20.405 11.1834 20.3319L5.88889 16.0001ZM20.4142 12.0001L23.9497 15.5356L22.5355 16.9498L19 13.4143L15.4645 16.9498L14.0503 15.5356L17.5858 12.0001L14.0503 8.46454L15.4645 7.05032L19 10.5859L22.5355 7.05032L23.9497 8.46454L20.4142 12.0001Z"></path></svg>';
    const AUDIO_TITLE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M11 21V19.9291C7.60771 19.4439 5 16.5265 5 13V8C5 4.13401 8.13401 1 12 1C15.866 1 19 4.13401 19 8V13C19 16.5265 16.3923 19.4439 13 19.9291V21H17V23H7V21H11ZM12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9ZM12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z"></path></svg>';
    const VIDEO_TITLE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M3 3.9934C3 3.44476 3.44495 3 3.9934 3H20.0066C20.5552 3 21 3.44495 21 3.9934V20.0066C21 20.5552 20.5551 21 20.0066 21H3.9934C3.44476 21 3 20.5551 3 20.0066V3.9934ZM10.6219 8.41459C10.5562 8.37078 10.479 8.34741 10.4 8.34741C10.1791 8.34741 10 8.52649 10 8.74741V15.2526C10 15.3316 10.0234 15.4088 10.0672 15.4745C10.1897 15.6583 10.4381 15.708 10.6219 15.5855L15.5008 12.3329C15.5447 12.3036 15.5824 12.2659 15.6117 12.2221C15.7342 12.0383 15.6845 11.7899 15.5008 11.6674L10.6219 8.41459Z"></path></svg>';
    const FULLSCREEN_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M8 3V5H4V9H2V3H8ZM2 21V15H4V19H8V21H2ZM22 21H16V19H20V15H22V21ZM22 9H20V5H16V3H22V9Z"></path></svg>';
    const BIG_PLAY_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="2rem" height="2rem"><path d="M19.376 12.4161L8.77735 19.4818C8.54759 19.635 8.23715 19.5729 8.08397 19.3432C8.02922 19.261 8 19.1645 8 19.0658V4.93433C8 4.65818 8.22386 4.43433 8.5 4.43433C8.59871 4.43433 8.69522 4.46355 8.77735 4.5183L19.376 11.584C19.6057 11.7372 19.6678 12.0477 19.5146 12.2774C19.478 12.3323 19.4309 12.3795 19.376 12.4161Z"></path></svg>';
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
            '<div class="media-speed-option ' + kind + '-speed-option' + (speed === 1 ? ' active' : '') + '" data-speed="' + speed + '">' + speedLabel(speed) + '</div>'
        )).join('');
    }

    function renderPlayerChrome(options) {
        const kind = options.kind;
        const title = String(options.title || '');
        const titleIcon = options.titleIcon || '';
        const escapedTitle = escapeHtml(title);
        const progressLabel = options.progressLabel || 'Media progress';
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
                aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00">
                <div class="media-progress-bar ${kind}-progress-bar"></div>
                <div class="media-progress-thumb ${kind}-progress-thumb"></div>
                <div class="media-progress-tooltip ${kind}-progress-tooltip">0:00</div>
            </div>
            <div class="media-controls ${kind}-controls">
                <div class="media-controls-left ${kind}-controls-left">
                    <button class="media-play-btn ${kind}-play-btn" aria-label="Play/Pause">
                        <span class="media-play-icon ${kind}-play-icon flex items-center justify-center">${PLAY_ICON}</span>
                    </button>
                    <div class="media-volume-control ${kind}-volume-control">
                        <button class="media-volume-btn ${kind}-volume-btn" aria-label="Volume control">
                            ${VOLUME_ICON}
                        </button>
                        <div class="media-volume-slider-wrapper ${kind}-volume-slider-wrapper">
                            <input type="range" class="media-volume-slider ${kind}-volume-slider" min="0" max="1" step="0.01" value="0.6">
                        </div>
                    </div>
                </div>
                <div class="media-controls-right ${kind}-controls-right">
                    <div class="media-speed-control ${kind}-speed-control">
                        <button class="media-speed-btn ${kind}-speed-btn" aria-label="Playback speed">1.0x</button>
                        <div class="media-speed-dropdown ${kind}-speed-dropdown t-dropdown" data-origin="bottom-center">
                            ${renderSpeedOptions(kind)}
                        </div>
                    </div>
                    ${extraRightControls}
                </div>
            </div>
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
                progressLabel: 'Audio progress',
                mediaElementHtml: `
                <audio preload="auto">
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
                <button class="video-player-overlay" type="button" aria-label="Play">
                    <span class="video-player-overlay-icon flex items-center justify-center">${BIG_PLAY_ICON}</span>
                </button>
            </div>
            ${renderPlayerChrome({
                kind: 'video',
                title,
                titleIcon: VIDEO_TITLE_ICON,
                progressLabel: 'Video progress',
                extraRightControls: `<button class="media-fullscreen-btn video-fullscreen-btn" aria-label="Fullscreen">${FULLSCREEN_ICON}</button>`
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
