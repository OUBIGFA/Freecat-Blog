(function () {
    'use strict';

    const mediaPlayer = window.FreecatMediaPlayer;
    if (!mediaPlayer) throw new Error('FreecatMediaPlayer not loaded before video-player.js');

    const TITLE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M3 3.9934C3 3.44476 3.44495 3 3.9934 3H20.0066C20.5552 3 21 3.44495 21 3.9934V20.0066C21 20.5552 20.5551 21 20.0066 21H3.9934C3.44476 21 3 20.5551 3 20.0066V3.9934ZM10.6219 8.41459C10.5562 8.37078 10.479 8.34741 10.4 8.34741C10.1791 8.34741 10 8.52649 10 8.74741V15.2526C10 15.3316 10.0234 15.4088 10.0672 15.4745C10.1897 15.6583 10.4381 15.708 10.6219 15.5855L15.5008 12.3329C15.5447 12.3036 15.5824 12.2659 15.6117 12.2221C15.7342 12.0383 15.6845 11.7899 15.5008 11.6674L10.6219 8.41459Z"></path></svg>`;
    const FULLSCREEN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M8 3V5H4V9H2V3H8ZM2 21V15H4V19H8V21H2ZM22 21H16V19H20V15H22V21ZM22 9H20V5H16V3H22V9Z"></path></svg>`;
    const BIG_PLAY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="2rem" height="2rem"><path d="M19.376 12.4161L8.77735 19.4818C8.54759 19.635 8.23715 19.5729 8.08397 19.3432C8.02922 19.261 8 19.1645 8 19.0658V4.93433C8 4.65818 8.22386 4.43433 8.5 4.43433C8.59871 4.43433 8.69522 4.46355 8.77735 4.5183L19.376 11.584C19.6057 11.7372 19.6678 12.0477 19.5146 12.2774C19.478 12.3323 19.4309 12.3795 19.376 12.4161Z"></path></svg>`;
    const VIDEO_EXT_RE = /\.(?:mp4|webm|ogv|mov|m4v|m3u8)(?:[?#]|$)/i;
    const VIDEO_EMOJI_RE = /\u{1f3ac}|\u{1f3a5}|\u{1f4f9}/gu;

    initVideoPlayers();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoPlayers, { once: true });
    }

    function initVideoPlayers() {
        document.querySelectorAll('blockquote').forEach(function (blockquote) {
            const link = blockquote.querySelector('a');
            if (!link) return;
            const text = link.textContent.trim();
            const url = link.href;
            if (!isVideoLink(text, url)) return;
            const player = createVideoPlayer(cleanTitle(text), url);
            blockquote.parentNode.replaceChild(player, blockquote);
        });

        document.querySelectorAll('figure.video-player[data-video-src]').forEach(function (figure) {
            const url = figure.getAttribute('data-video-src') || '';
            if (!url) return;
            const title = cleanTitle(figure.getAttribute('data-video-title') || '');
            const player = createVideoPlayer(title, url);
            figure.parentNode.replaceChild(player, figure);
        });
    }

    function isVideoLink(text, url) {
        VIDEO_EMOJI_RE.lastIndex = 0;
        return VIDEO_EMOJI_RE.test(text) || VIDEO_EXT_RE.test(url);
    }

    function cleanTitle(title) {
        VIDEO_EMOJI_RE.lastIndex = 0;
        return String(title || '').replace(VIDEO_EMOJI_RE, '').trim();
    }

    function createVideoPlayer(title, videoUrl) {
        const container = document.createElement('div');
        container.className = 'video-player-container media-player-container';
        container.innerHTML = `
            <div class="video-player-stage">
                <video class="video-player-video" preload="metadata" playsinline></video>
                <button class="video-player-overlay" type="button" aria-label="Play">
                    <span class="video-player-overlay-icon flex items-center justify-center">${BIG_PLAY_ICON}</span>
                </button>
            </div>
            ${mediaPlayer.renderPlayerChrome({
                kind: 'video',
                title,
                titleIcon: TITLE_ICON,
                progressLabel: 'Video progress',
                extraRightControls: `<button class="media-fullscreen-btn video-fullscreen-btn" aria-label="Fullscreen">${FULLSCREEN_ICON}</button>`
            })}`;

        const stage = container.querySelector('.video-player-stage');
        const video = container.querySelector('video');
        const overlay = container.querySelector('.video-player-overlay');
        const fullscreenBtn = container.querySelector('.video-fullscreen-btn');

        attachSource(video, videoUrl);

        function updateVideoAspectRatio() {
            const width = video.videoWidth;
            const height = video.videoHeight;
            if (width > 0 && height > 0) {
                stage.style.setProperty('--video-aspect-ratio', `${width} / ${height}`);
            }
        }

        const controls = mediaPlayer.hydrateMediaControls(container, video, {
            kind: 'video',
            onPlay: function () { container.classList.add('is-playing'); },
            onPause: function () { container.classList.remove('is-playing'); },
            onLoadedMetadata: updateVideoAspectRatio
        });

        overlay.addEventListener('click', controls.togglePlay);
        video.addEventListener('click', controls.togglePlay);

        fullscreenBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            if (document.fullscreenElement) {
                if (document.exitFullscreen) document.exitFullscreen();
                return;
            }
            if (video.requestFullscreen) video.requestFullscreen();
            else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
            else if (stage.requestFullscreen) stage.requestFullscreen();
            else if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen();
        });

        return container;
    }

    function attachSource(video, src) {
        const isHls = /\.m3u8(?:[?#]|$)/i.test(src);
        if (!isHls) {
            video.src = src;
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            return;
        }
        loadHlsJs().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        });
    }

    function loadHlsJs() {
        if (window.Hls) return Promise.resolve(window.Hls);
        if (loadHlsJs._promise) return loadHlsJs._promise;
        loadHlsJs._promise = new Promise(function (resolve) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
            script.onload = function () { resolve(window.Hls || null); };
            script.onerror = function () { resolve(null); };
            document.head.appendChild(script);
        });
        return loadHlsJs._promise;
    }
})();
