(function () {
    'use strict';

    // Control icons are shared with the audio player so the two players look identical.
    const PLAY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><path d="M9 8.48216V15.518L15.0307 12.0001L9 8.48216ZM7.75194 5.43872L18.2596 11.5682C18.4981 11.7073 18.5787 12.0135 18.4396 12.252C18.3961 12.3265 18.3341 12.3885 18.2596 12.432L7.75194 18.5615C7.51341 18.7006 7.20725 18.62 7.06811 18.3815C7.0235 18.305 7 18.2181 7 18.1296V5.87061C7 5.59446 7.22386 5.37061 7.5 5.37061C7.58853 5.37061 7.67547 5.39411 7.75194 5.43872Z"></path></svg>`;
    const PAUSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><path d="M15 7C15 6.44772 15.4477 6 16 6C16.5523 6 17 6.44772 17 7V17C17 17.5523 16.5523 18 16 18C15.4477 18 15 17.5523 15 17V7ZM7 7C7 6.44772 7.44772 6 8 6C8.55228 6 9 6.44772 9 7V17C9 17.5523 8.55228 18 8 18C7.44772 18 7 17.5523 7 17V7Z"></path></svg>`;
    const VOLUME_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M6.60282 10.0001L10 7.22056V16.7796L6.60282 14.0001H3V10.0001H6.60282ZM2 16.0001H5.88889L11.1834 20.3319C11.2727 20.405 11.3846 20.4449 11.5 20.4449C11.7761 20.4449 12 20.2211 12 19.9449V4.05519C12 3.93977 11.9601 3.8279 11.887 3.73857C11.7121 3.52485 11.3971 3.49335 11.1834 3.66821L5.88889 8.00007H2C1.44772 8.00007 1 8.44778 1 9.00007V15.0001C1 15.5524 1.44772 16.0001 2 16.0001ZM23 12C23 15.292 21.5539 18.2463 19.2622 20.2622L17.8445 18.8444C19.7758 17.1937 21 14.7398 21 12C21 9.26016 19.7758 6.80629 17.8445 5.15557L19.2622 3.73779C21.5539 5.75368 23 8.70795 23 12ZM18 12C18 10.0883 17.106 8.38548 15.7133 7.28673L14.2842 8.71584C15.3213 9.43855 16 10.64 16 12C16 13.36 15.3213 14.5614 14.2842 15.2841L15.7133 16.7132C17.106 15.6145 18 13.9116 18 12Z"></path></svg>`;
    const MUTE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M10 7.22056L6.60282 10.0001H3V14.0001H6.60282L10 16.7796V7.22056ZM5.88889 16.0001H2C1.44772 16.0001 1 15.5524 1 15.0001V9.00007C1 8.44778 1.44772 8.00007 2 8.00007H5.88889L11.1834 3.66821C11.3971 3.49335 11.7121 3.52485 11.887 3.73857C11.9601 3.8279 12 3.93977 12 4.05519V19.9449C12 20.2211 11.7761 20.4449 11.5 20.4449C11.3846 20.4449 11.2727 20.405 11.1834 20.3319L5.88889 16.0001ZM20.4142 12.0001L23.9497 15.5356L22.5355 16.9498L19 13.4143L15.4645 16.9498L14.0503 15.5356L17.5858 12.0001L14.0503 8.46454L15.4645 7.05032L19 10.5859L22.5355 7.05032L23.9497 8.46454L20.4142 12.0001Z"></path></svg>`;
    // Title icon: a video camera (the audio player uses a microphone here).
    const TITLE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M3 3.9934C3 3.44476 3.44495 3 3.9934 3H20.0066C20.5552 3 21 3.44495 21 3.9934V20.0066C21 20.5552 20.5551 21 20.0066 21H3.9934C3.44476 21 3 20.5551 3 20.0066V3.9934ZM10.6219 8.41459C10.5562 8.37078 10.479 8.34741 10.4 8.34741C10.1791 8.34741 10 8.52649 10 8.74741V15.2526C10 15.3316 10.0234 15.4088 10.0672 15.4745C10.1897 15.6583 10.4381 15.708 10.6219 15.5855L15.5008 12.3329C15.5447 12.3036 15.5824 12.2659 15.6117 12.2221C15.7342 12.0383 15.6845 11.7899 15.5008 11.6674L10.6219 8.41459Z"></path></svg>`;
    const FULLSCREEN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M8 3V5H4V9H2V3H8ZM2 21V15H4V19H8V21H2ZM22 21H16V19H20V15H22V21ZM22 9H20V5H16V3H22V9Z"></path></svg>`;
    const BIG_PLAY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="2rem" height="2rem"><path d="M19.376 12.4161L8.77735 19.4818C8.54759 19.635 8.23715 19.5729 8.08397 19.3432C8.02922 19.261 8 19.1645 8 19.0658V4.93433C8 4.65818 8.22386 4.43433 8.5 4.43433C8.59871 4.43433 8.69522 4.46355 8.77735 4.5183L19.376 11.584C19.6057 11.7372 19.6678 12.0477 19.5146 12.2774C19.478 12.3323 19.4309 12.3795 19.376 12.4161Z"></path></svg>`;

    // Video file extensions. Audio owns mp3/m4a/wav/ogg/aac/flac/opus, so we use .ogv
    // (not .ogg) and otherwise distinct extensions — the two players never collide.
    const VIDEO_EXT_RE = /\.(?:mp4|webm|ogv|mov|m4v|m3u8)(?:[?#]|$)/i;
    // Emoji that force video detection. Use literal alternation (not a character class)
    // so the surrogate-pair emoji match correctly without the /u flag.
    const VIDEO_EMOJI_STRIP_RE = /🎬|🎥|📹/g;
    function hasVideoEmoji(text) {
        return text.indexOf('🎬') !== -1 || text.indexOf('🎥') !== -1 || text.indexOf('📹') !== -1;
    }

    const VIDEO_EMOJI_SAFE_RE = /\u{1f3ac}|\u{1f3a5}|\u{1f4f9}/gu;

    function hasVideoEmojiSafe(text) {
        VIDEO_EMOJI_SAFE_RE.lastIndex = 0;
        return VIDEO_EMOJI_SAFE_RE.test(text);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoPlayers);
    } else {
        initVideoPlayers();
    }

    function initVideoPlayers() {
        // Entry A — quote syntax, mirrors the audio player: >[title](video.mp4)
        document.querySelectorAll('blockquote').forEach(blockquote => {
            const link = blockquote.querySelector('a');
            if (!link) return;
            const text = link.textContent.trim();
            const url = link.href;
            if (!isVideoLink(text, url)) return;
            const player = createVideoPlayer(cleanTitle(text), url);
            blockquote.parentNode.replaceChild(player, blockquote);
        });

        // Entry B — image syntax produced by markdown.js: ![title](video.mp4)
        document.querySelectorAll('figure.video-player[data-video-src]').forEach(figure => {
            const url = figure.getAttribute('data-video-src') || '';
            if (!url) return;
            const title = figure.getAttribute('data-video-title') || '';
            const player = createVideoPlayer(cleanTitle(title), url);
            figure.parentNode.replaceChild(player, figure);
        });
    }

    function isVideoLink(text, url) {
        if (hasVideoEmojiSafe(text)) return true;
        return VIDEO_EXT_RE.test(url);
    }

    function cleanTitle(title) {
        return String(title || '').replace(VIDEO_EMOJI_SAFE_RE, '').trim();
    }

    function createVideoPlayer(title, videoUrl) {
        const container = document.createElement('div');
        container.className = 'video-player-container';

        const titleRow = title
            ? `
            <div class="video-player-title">
                <div class="video-player-title-left">
                    <span class="video-player-icon flex items-center justify-center">${TITLE_ICON}</span>
                    <span>${escapeHtml(title)}</span>
                </div>
                <span class="video-time">
                    <span class="video-current-time">0:00</span>
                    <span> / </span>
                    <span class="video-duration">0:00</span>
                </span>
            </div>`
            : `
            <div class="video-player-title">
                <div class="video-player-title-left"></div>
                <span class="video-time">
                    <span class="video-current-time">0:00</span>
                    <span> / </span>
                    <span class="video-duration">0:00</span>
                </span>
            </div>`;

        container.innerHTML = `
            <div class="video-player-stage">
                <video class="video-player-video" preload="metadata" playsinline></video>
                <button class="video-player-overlay" type="button" aria-label="Play">
                    <span class="video-player-overlay-icon flex items-center justify-center">${BIG_PLAY_ICON}</span>
                </button>
            </div>
            ${titleRow}
            <div class="video-progress-container" role="slider" tabindex="0" aria-label="Video progress"
                aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00">
                <div class="video-progress-bar"></div>
                <div class="video-progress-thumb"></div>
                <div class="video-progress-tooltip">0:00</div>
            </div>
            <div class="video-controls">
                <div class="video-controls-left">
                    <button class="video-play-btn" aria-label="Play/Pause">
                        <span class="video-play-icon flex items-center justify-center">${PLAY_ICON}</span>
                    </button>
                    <div class="video-volume-control">
                        <button class="video-volume-btn" aria-label="Volume control">
                            ${VOLUME_ICON}
                        </button>
                        <div class="video-volume-slider-wrapper">
                            <input type="range" class="video-volume-slider" min="0" max="1" step="0.01" value="0.6">
                        </div>
                    </div>
                </div>
                <div class="video-controls-right">
                    <div class="video-speed-control">
                        <button class="video-speed-btn" aria-label="Playback speed">1.0x</button>
                        <div class="video-speed-dropdown t-dropdown" data-origin="bottom-right">
                            <div class="video-speed-option" data-speed="0.5">0.5x</div>
                            <div class="video-speed-option" data-speed="0.75">0.75x</div>
                            <div class="video-speed-option active" data-speed="1">1.0x</div>
                            <div class="video-speed-option" data-speed="1.25">1.25x</div>
                            <div class="video-speed-option" data-speed="1.5">1.5x</div>
                            <div class="video-speed-option" data-speed="1.75">1.75x</div>
                            <div class="video-speed-option" data-speed="2">2.0x</div>
                        </div>
                    </div>
                    <button class="video-fullscreen-btn" aria-label="Fullscreen">
                        ${FULLSCREEN_ICON}
                    </button>
                </div>
            </div>
        `;

        const stage = container.querySelector('.video-player-stage');
        const video = container.querySelector('video');
        const overlay = container.querySelector('.video-player-overlay');
        const playBtn = container.querySelector('.video-play-btn');
        const playIcon = container.querySelector('.video-play-icon');
        const progressContainer = container.querySelector('.video-progress-container');
        const progressBar = container.querySelector('.video-progress-bar');
        const progressThumb = container.querySelector('.video-progress-thumb');
        const progressTooltip = container.querySelector('.video-progress-tooltip');
        const currentTimeEl = container.querySelector('.video-current-time');
        const durationEl = container.querySelector('.video-duration');
        const volumeBtn = container.querySelector('.video-volume-btn');
        const volumeSlider = container.querySelector('.video-volume-slider');
        const speedBtn = container.querySelector('.video-speed-btn');
        const speedDropdown = container.querySelector('.video-speed-dropdown');
        const speedOptions = container.querySelectorAll('.video-speed-option');
        const fullscreenBtn = container.querySelector('.video-fullscreen-btn');

        attachSource(video, videoUrl);

        // Initial volume — matches the audio player so the volume slider looks identical.
        video.volume = 0.6;
        let lastVolume = 0.6;

        function togglePlay() {
            if (video.paused) video.play();
            else video.pause();
        }

        playBtn.addEventListener('click', togglePlay);
        overlay.addEventListener('click', togglePlay);
        video.addEventListener('click', togglePlay);

        video.addEventListener('play', () => {
            container.classList.add('is-playing');
            playIcon.innerHTML = PAUSE_ICON;
            // Only one media element plays at a time across the whole page.
            document.querySelectorAll('video, audio').forEach(other => {
                if (other !== video && !other.paused) other.pause();
            });
        });

        video.addEventListener('pause', () => {
            container.classList.remove('is-playing');
            playIcon.innerHTML = PLAY_ICON;
        });

        function setProgressUi(time) {
            const duration = Number.isFinite(video.duration) ? video.duration : 0;
            const progress = duration > 0 ? (time / duration) * 100 : 0;
            const clampedProgress = Math.max(0, Math.min(100, progress));
            const formattedTime = formatTime(time);

            progressBar.style.width = clampedProgress + '%';
            progressThumb.style.left = clampedProgress + '%';
            currentTimeEl.textContent = formattedTime;
            progressContainer.setAttribute('aria-valuemax', String(Math.floor(duration)));
            progressContainer.setAttribute('aria-valuenow', String(Math.floor(time)));
            progressContainer.setAttribute('aria-valuetext', `${formattedTime} / ${formatTime(duration)}`);
        }

        function updateVideoAspectRatio() {
            const width = video.videoWidth;
            const height = video.videoHeight;
            if (width > 0 && height > 0) {
                stage.style.setProperty('--video-aspect-ratio', `${width} / ${height}`);
            }
        }

        video.addEventListener('timeupdate', () => setProgressUi(video.currentTime));
        video.addEventListener('loadedmetadata', () => {
            updateVideoAspectRatio();
            durationEl.textContent = formatTime(video.duration);
            setProgressUi(video.currentTime);
        });

        // Progress bar drag / click / keyboard — identical behavior to the audio player.
        let isDragging = false;

        progressContainer.addEventListener('pointerdown', (e) => {
            isDragging = true;
            progressContainer.classList.add('is-dragging');
            progressContainer.setPointerCapture(e.pointerId);
            updateProgress(e, { playAfterSeek: true });
        });

        progressContainer.addEventListener('pointermove', (e) => {
            if (isDragging) updateProgress(e, { playAfterSeek: true });
        });

        progressContainer.addEventListener('pointerup', (e) => {
            isDragging = false;
            progressContainer.classList.remove('is-dragging');
            if (progressContainer.hasPointerCapture(e.pointerId)) {
                progressContainer.releasePointerCapture(e.pointerId);
            }
        });

        progressContainer.addEventListener('pointercancel', () => {
            isDragging = false;
            progressContainer.classList.remove('is-dragging');
        });

        progressContainer.addEventListener('keydown', (e) => {
            if (!video.duration) return;

            const step = e.shiftKey ? 10 : 5;
            let nextTime = video.currentTime;

            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') nextTime -= step;
            else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') nextTime += step;
            else if (e.key === 'Home') nextTime = 0;
            else if (e.key === 'End') nextTime = video.duration;
            else return;

            e.preventDefault();
            seekToTime(nextTime, { playAfterSeek: false });
        });

        function updateProgress(e, options = {}) {
            const rect = progressContainer.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            seekToTime(pos * video.duration, options);
        }

        function seekToTime(time, { playAfterSeek = false } = {}) {
            if (!video.duration) return;
            const nextTime = Math.max(0, Math.min(video.duration, time));
            video.currentTime = nextTime;
            setProgressUi(nextTime);
            if (playAfterSeek) video.play();
        }

        progressContainer.addEventListener('mousemove', (e) => {
            if (!video.duration) return;
            const rect = progressContainer.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            progressTooltip.textContent = formatTime(pos * video.duration);
            progressTooltip.style.left = (pos * 100) + '%';
            progressTooltip.classList.add('visible');
        });

        progressContainer.addEventListener('mouseleave', () => {
            progressTooltip.classList.remove('visible');
        });

        // Volume control
        volumeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isMuted = !video.muted;
            video.muted = isMuted;

            if (isMuted) {
                volumeBtn.innerHTML = MUTE_ICON;
                volumeSlider.value = 0;
                volumeSlider.style.setProperty('--volume-percent', '0%');
                volumeBtn.style.opacity = '0.5';
            } else {
                volumeBtn.innerHTML = VOLUME_ICON;
                volumeSlider.value = lastVolume;
                volumeSlider.style.setProperty('--volume-percent', (lastVolume * 100) + '%');
                volumeBtn.style.opacity = '1';
            }
        });

        volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            video.volume = volume;
            lastVolume = volume;

            if (volume > 0) {
                video.muted = false;
                volumeBtn.innerHTML = VOLUME_ICON;
                volumeBtn.style.opacity = '1';
            } else {
                video.muted = true;
                volumeBtn.innerHTML = MUTE_ICON;
                volumeBtn.style.opacity = '0.5';
            }

            volumeSlider.style.setProperty('--volume-percent', (volume * 100) + '%');
        });

        volumeSlider.addEventListener('click', (e) => e.stopPropagation());

        const dropdownCloseMs = 150;

        function openSpeedDropdown() {
            speedDropdown.classList.remove('is-closing');
            speedDropdown.classList.add('is-open');
        }

        function closeSpeedDropdown() {
            speedDropdown.classList.remove('is-open');
            speedDropdown.classList.add('is-closing');
            setTimeout(() => speedDropdown.classList.remove('is-closing'), dropdownCloseMs);
        }

        speedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (speedDropdown.classList.contains('is-open')) closeSpeedDropdown();
            else openSpeedDropdown();
        });

        document.addEventListener('click', () => closeSpeedDropdown());

        speedOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const speed = parseFloat(option.dataset.speed);
                video.playbackRate = speed;
                speedBtn.textContent = speed + 'x';
                speedOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                closeSpeedDropdown();
            });
        });

        // Fullscreen — prefer the video element so it works on iOS (webkitEnterFullscreen).
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
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

    // Wire up the video source. Plain files play natively; .m3u8 (HLS) uses native
    // playback on Safari and otherwise lazy-loads hls.js from a CDN only when needed.
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
        loadHlsJs().then((Hls) => {
            if (Hls && Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src; // last-resort fallback
            }
        });
    }

    function loadHlsJs() {
        if (window.Hls) return Promise.resolve(window.Hls);
        if (loadHlsJs._promise) return loadHlsJs._promise;
        loadHlsJs._promise = new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
            script.onload = () => resolve(window.Hls || null);
            script.onerror = () => resolve(null);
            document.head.appendChild(script);
        });
        return loadHlsJs._promise;
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
})();
