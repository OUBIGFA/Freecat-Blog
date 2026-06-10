(function (root) {
    'use strict';

    // 依赖全局：FreecatShared（shared.js，defer 加载顺序在本文件之前）。
    // HTML 转义统一复用 shared.escapeHtml（含引号转义），不再本地实现。
    const shared = root.FreecatShared;
    if (!shared) throw new Error('FreecatShared not loaded — ensure shared.js loads before media-player.js');
    const escapeHtml = shared.escapeHtml;

    const PLAY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><path d="M9 8.48216V15.518L15.0307 12.0001L9 8.48216ZM7.75194 5.43872L18.2596 11.5682C18.4981 11.7073 18.5787 12.0135 18.4396 12.252C18.3961 12.3265 18.3341 12.3885 18.2596 12.432L7.75194 18.5615C7.51341 18.7006 7.20725 18.62 7.06811 18.3815C7.0235 18.305 7 18.2181 7 18.1296V5.87061C7 5.59446 7.22386 5.37061 7.5 5.37061C7.58853 5.37061 7.67547 5.39411 7.75194 5.43872Z"></path></svg>`;
    const PAUSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><path d="M15 7C15 6.44772 15.4477 6 16 6C16.5523 6 17 6.44772 17 7V17C17 17.5523 16.5523 18 16 18C15.4477 18 15 17.5523 15 17V7ZM7 7C7 6.44772 7.44772 6 8 6C8.55228 6 9 6.44772 9 7V17C9 17.5523 8.55228 18 8 18C7.44772 18 7 17.5523 7 17V7Z"></path></svg>`;
    const VOLUME_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M6.60282 10.0001L10 7.22056V16.7796L6.60282 14.0001H3V10.0001H6.60282ZM2 16.0001H5.88889L11.1834 20.3319C11.2727 20.405 11.3846 20.4449 11.5 20.4449C11.7761 20.4449 12 20.2211 12 19.9449V4.05519C12 3.93977 11.9601 3.8279 11.887 3.73857C11.7121 3.52485 11.3971 3.49335 11.1834 3.66821L5.88889 8.00007H2C1.44772 8.00007 1 8.44778 1 9.00007V15.0001C1 15.5524 1.44772 16.0001 2 16.0001ZM23 12C23 15.292 21.5539 18.2463 19.2622 20.2622L17.8445 18.8444C19.7758 17.1937 21 14.7398 21 12C21 9.26016 19.7758 6.80629 17.8445 5.15557L19.2622 3.73779C21.5539 5.75368 23 8.70795 23 12ZM18 12C18 10.0883 17.106 8.38548 15.7133 7.28673L14.2842 8.71584C15.3213 9.43855 16 10.64 16 12C16 13.36 15.3213 14.5614 14.2842 15.2841L15.7133 16.7132C17.106 15.6145 18 13.9116 18 12Z"></path></svg>`;
    const MUTE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M10 7.22056L6.60282 10.0001H3V14.0001H6.60282L10 16.7796V7.22056ZM5.88889 16.0001H2C1.44772 16.0001 1 15.5524 1 15.0001V9.00007C1 8.44778 1.44772 8.00007 2 8.00007H5.88889L11.1834 3.66821C11.3971 3.49335 11.7121 3.52485 11.887 3.73857C11.9601 3.8279 12 3.93977 12 4.05519V19.9449C12 20.2211 11.7761 20.4449 11.5 20.4449C11.3846 20.4449 11.2727 20.405 11.1834 20.3319L5.88889 16.0001ZM20.4142 12.0001L23.9497 15.5356L22.5355 16.9498L19 13.4143L15.4645 16.9498L14.0503 15.5356L17.5858 12.0001L14.0503 8.46454L15.4645 7.05032L19 10.5859L22.5355 7.05032L23.9497 8.46454L20.4142 12.0001Z"></path></svg>`;
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
            `<div class="media-speed-option ${kind}-speed-option${speed === 1 ? ' active' : ''}" data-speed="${speed}">${speedLabel(speed)}</div>`
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
            ? `<span>${escapedTitle}</span>`
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

    function hydrateMediaControls(container, media, options = {}) {
        const kind = options.kind || 'media';
        const playBtn = container.querySelector('.media-play-btn');
        const playIcon = container.querySelector('.media-play-icon');
        const progressContainer = container.querySelector('.media-progress-container');
        const progressBar = container.querySelector('.media-progress-bar');
        const progressThumb = container.querySelector('.media-progress-thumb');
        const progressTooltip = container.querySelector('.media-progress-tooltip');
        const currentTimeEl = container.querySelector('.media-current-time');
        const durationEl = container.querySelector('.media-duration');
        const volumeBtn = container.querySelector('.media-volume-btn');
        const volumeSlider = container.querySelector('.media-volume-slider');
        const speedBtn = container.querySelector('.media-speed-btn');
        const speedDropdown = container.querySelector('.media-speed-dropdown');
        const speedOptions = container.querySelectorAll('.media-speed-option');
        if (!playBtn || !progressContainer || !media) return { togglePlay: function () {} };

        media.volume = 0.6;
        volumeSlider.style.setProperty('--volume-percent', '60%');
        let lastVolume = 0.6;

        function playMedia() {
            const promise = media.play();
            if (promise && typeof promise.catch === 'function') promise.catch(function () {});
        }

        function togglePlay() {
            if (media.paused) playMedia();
            else media.pause();
        }

        function setPlayIcon(isPlaying) {
            playIcon.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
        }

        playBtn.addEventListener('click', togglePlay);

        media.addEventListener('play', function () {
            setPlayIcon(true);
            document.querySelectorAll('video, audio').forEach(function (other) {
                if (other !== media && !other.paused) other.pause();
            });
            if (typeof options.onPlay === 'function') options.onPlay();
        });

        media.addEventListener('pause', function () {
            setPlayIcon(false);
            if (typeof options.onPause === 'function') options.onPause();
        });

        function setProgressUi(time) {
            const duration = Number.isFinite(media.duration) ? media.duration : 0;
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

        media.addEventListener('timeupdate', function () {
            setProgressUi(media.currentTime);
        });

        media.addEventListener('loadedmetadata', function () {
            durationEl.textContent = formatTime(media.duration);
            setProgressUi(media.currentTime);
            if (typeof options.onLoadedMetadata === 'function') options.onLoadedMetadata();
        });

        let isDragging = false;

        function seekToTime(time, playAfterSeek) {
            if (!media.duration) return;
            const nextTime = Math.max(0, Math.min(media.duration, time));
            media.currentTime = nextTime;
            setProgressUi(nextTime);
            if (playAfterSeek) playMedia();
        }

        function updateProgress(event, playAfterSeek) {
            const rect = progressContainer.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
            seekToTime(pos * media.duration, playAfterSeek);
        }

        progressContainer.addEventListener('pointerdown', function (event) {
            isDragging = true;
            progressContainer.classList.add('is-dragging');
            progressContainer.setPointerCapture(event.pointerId);
            updateProgress(event, true);
        });

        progressContainer.addEventListener('pointermove', function (event) {
            if (isDragging) updateProgress(event, true);
        });

        progressContainer.addEventListener('pointerup', function (event) {
            isDragging = false;
            progressContainer.classList.remove('is-dragging');
            if (progressContainer.hasPointerCapture(event.pointerId)) {
                progressContainer.releasePointerCapture(event.pointerId);
            }
        });

        progressContainer.addEventListener('pointercancel', function () {
            isDragging = false;
            progressContainer.classList.remove('is-dragging');
        });

        progressContainer.addEventListener('keydown', function (event) {
            if (!media.duration) return;

            const step = event.shiftKey ? 10 : 5;
            let nextTime = media.currentTime;

            if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') nextTime -= step;
            else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') nextTime += step;
            else if (event.key === 'Home') nextTime = 0;
            else if (event.key === 'End') nextTime = media.duration;
            else return;

            event.preventDefault();
            seekToTime(nextTime, false);
        });

        progressContainer.addEventListener('mousemove', function (event) {
            if (!media.duration) return;
            const rect = progressContainer.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
            progressTooltip.textContent = formatTime(pos * media.duration);
            progressTooltip.style.left = (pos * 100) + '%';
            progressTooltip.classList.add('visible');
        });

        progressContainer.addEventListener('mouseleave', function () {
            progressTooltip.classList.remove('visible');
        });

        function setVolumeUi(volume, muted) {
            volumeSlider.value = muted ? 0 : volume;
            volumeSlider.style.setProperty('--volume-percent', (muted ? 0 : volume * 100) + '%');
            volumeBtn.innerHTML = muted || volume === 0 ? MUTE_ICON : VOLUME_ICON;
            volumeBtn.style.opacity = muted || volume === 0 ? '0.5' : '1';
        }

        volumeBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            media.muted = !media.muted;
            setVolumeUi(lastVolume, media.muted);
        });

        volumeSlider.addEventListener('input', function (event) {
            const volume = parseFloat(event.target.value);
            media.volume = volume;
            lastVolume = volume;
            media.muted = volume === 0;
            setVolumeUi(volume, media.muted);
        });

        volumeSlider.addEventListener('click', function (event) {
            event.stopPropagation();
        });

        const dropdownCloseMs = 150;

        function openSpeedDropdown() {
            speedDropdown.classList.remove('is-closing');
            speedDropdown.classList.add('is-open');
        }

        function closeSpeedDropdown() {
            speedDropdown.classList.remove('is-open');
            speedDropdown.classList.add('is-closing');
            setTimeout(function () {
                speedDropdown.classList.remove('is-closing');
            }, dropdownCloseMs);
        }

        speedBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            if (speedDropdown.classList.contains('is-open')) closeSpeedDropdown();
            else openSpeedDropdown();
        });

        document.addEventListener('click', closeSpeedDropdown);

        speedOptions.forEach(function (option) {
            option.addEventListener('click', function (event) {
                event.stopPropagation();
                const speed = parseFloat(option.dataset.speed);
                media.playbackRate = speed;
                speedBtn.textContent = option.textContent;
                speedOptions.forEach(function (item) {
                    item.classList.remove('active');
                });
                option.classList.add('active');
                closeSpeedDropdown();
            });
        });

        return {
            togglePlay,
            setProgressUi,
            kind
        };
    }

    root.FreecatMediaPlayer = {
        renderPlayerChrome,
        hydrateMediaControls,
        formatTime,
        escapeHtml,
        icons: {
            play: PLAY_ICON,
            pause: PAUSE_ICON,
            volume: VOLUME_ICON,
            mute: MUTE_ICON
        }
    };
}(window));
