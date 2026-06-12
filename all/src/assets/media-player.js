(function (root) {
    'use strict';

    const template = root.FreecatMediaPlayerTemplate;
    if (!template) throw new Error('FreecatMediaPlayerTemplate not loaded - ensure media-player-template.js loads before media-player.js');
    const {
        renderPlayerChrome,
        formatTime,
        escapeHtml,
        icons
    } = template;
    const { play: PLAY_ICON, pause: PAUSE_ICON, volume: VOLUME_ICON, mute: MUTE_ICON } = icons;

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
