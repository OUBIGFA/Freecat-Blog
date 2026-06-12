(function () {
    'use strict';

    const mediaPlayer = window.FreecatMediaPlayer;
    if (!mediaPlayer) throw new Error('FreecatMediaPlayer not loaded before video-player.js');
    const template = window.FreecatMediaPlayerTemplate;
    if (!template) throw new Error('FreecatMediaPlayerTemplate not loaded before video-player.js');

    const VIDEO_EXT_RE = /\.(?:mp4|webm|ogv|mov|m4v|m3u8)(?:[?#]|$)/i;
    const VIDEO_EMOJI_RE = /\u{1f3ac}|\u{1f3a5}|\u{1f4f9}/gu;

    window.FreecatVideoPlayer = {
        init: initVideoPlayers
    };

    initVideoPlayers();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoPlayers, { once: true });
    }

    function initVideoPlayers(root) {
        const scope = root && root.querySelectorAll ? root : document;
        scope.querySelectorAll('blockquote').forEach(function (blockquote) {
            const link = blockquote.querySelector('a');
            if (!link) return;
            const text = link.textContent.trim();
            const url = link.href;
            if (!isVideoLink(text, url)) return;
            const player = createVideoPlayer(cleanTitle(text), url);
            blockquote.parentNode.replaceChild(player, blockquote);
        });

        scope.querySelectorAll('.video-player-container[data-video-src], figure.video-player[data-video-src]').forEach(function (node) {
            const url = node.getAttribute('data-video-src') || '';
            if (!url) return;
            const title = cleanTitle(node.getAttribute('data-video-title') || '');
            if (node.matches && node.matches('figure.video-player[data-video-src]')) {
                const player = createVideoPlayer(title, url);
                node.parentNode.replaceChild(player, node);
                return;
            }
            hydrateVideoPlayer(node, url);
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
        container.innerHTML = template.renderVideoPlayer({ title, src: videoUrl });
        const player = container.firstElementChild;
        if (!player) return container;
        return hydrateVideoPlayer(player, videoUrl);
    }

    function hydrateVideoPlayer(container, videoUrl) {
        if (container.dataset.videoHydrated === 'true') return container;
        container.dataset.videoHydrated = 'true';
        const stage = container.querySelector('.video-player-stage');
        const video = container.querySelector('video');
        const overlay = container.querySelector('.video-player-overlay');
        const fullscreenBtn = container.querySelector('.video-fullscreen-btn');
        if (!stage || !video || !overlay || !fullscreenBtn) return container;

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
