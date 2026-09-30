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
        const speedOptions = Array.from(container.querySelectorAll('.media-speed-option'));
        const status = container.querySelector('.media-status');
        if (!playBtn || !progressContainer || !media) return { togglePlay: function () {} };

        media.volume = 0.6;
        let lastVolume = 0.6;
        setVolumeUi(media.volume, media.muted);

        function showError() {
            status.textContent = '播放失败，请重试或检查媒体链接';
            status.hidden = false;
        }

        function playMedia() {
            status.hidden = true;
            const promise = media.play();
            if (promise && typeof promise.catch === 'function') promise.catch(function (error) {
                // A pause or source change may cancel play without a resource failure.
                if (error.name !== 'AbortError') showError();
            });
        }

        function togglePlay() {
            if (media.paused) playMedia();
            else media.pause();
        }

        function setPlayIcon(isPlaying) {
            playIcon.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
            const label = isPlaying ? '暂停' : '播放';
            playBtn.setAttribute('aria-label', label);
            playBtn.title = label;
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
        media.addEventListener('ended', function () { setPlayIcon(false); });
        media.addEventListener('error', showError);

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
            progressContainer.setAttribute('aria-disabled', String(duration <= 0));
        }

        media.addEventListener('timeupdate', function () {
            setProgressUi(media.currentTime);
        });

        function updateDuration() {
            durationEl.textContent = formatTime(media.duration);
            setProgressUi(media.currentTime);
        }
        media.addEventListener('durationchange', updateDuration);
        media.addEventListener('loadedmetadata', function () {
            updateDuration();
            if (typeof options.onLoadedMetadata === 'function') options.onLoadedMetadata();
        });
        updateDuration();

        let isDragging = false;

        function canSeek() { return Number.isFinite(media.duration) && media.duration > 0; }

        function seekToTime(time) {
            if (!canSeek()) return;
            const nextTime = Math.max(0, Math.min(media.duration, time));
            media.currentTime = nextTime;
            setProgressUi(nextTime);
        }

        function updateProgress(event) {
            const rect = progressContainer.getBoundingClientRect();
            if (!rect.width) return;
            const pos = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
            seekToTime(pos * media.duration);
            showProgressTooltip(pos);
        }

        progressContainer.addEventListener('pointerdown', function (event) {
            if (event.button !== 0 || !canSeek()) return;
            isDragging = true;
            progressContainer.focus({ preventScroll: true });
            progressContainer.classList.add('is-dragging');
            progressContainer.setPointerCapture(event.pointerId);
            updateProgress(event);
        });

        progressContainer.addEventListener('pointermove', function (event) {
            if (isDragging) updateProgress(event);
        });

        progressContainer.addEventListener('pointerup', function (event) {
            isDragging = false;
            progressContainer.classList.remove('is-dragging');
            progressTooltip.classList.remove('visible');
            if (progressContainer.hasPointerCapture(event.pointerId)) {
                progressContainer.releasePointerCapture(event.pointerId);
            }
        });

        progressContainer.addEventListener('pointercancel', function () {
            isDragging = false;
            progressContainer.classList.remove('is-dragging');
            progressTooltip.classList.remove('visible');
        });

        progressContainer.addEventListener('keydown', function (event) {
            if (!canSeek()) return;

            const step = event.shiftKey ? 10 : 5;
            let nextTime = media.currentTime;

            if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') nextTime -= step;
            else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') nextTime += step;
            else if (event.key === 'Home') nextTime = 0;
            else if (event.key === 'End') nextTime = media.duration;
            else return;

            event.preventDefault();
            seekToTime(nextTime);
            showProgressTooltip(media.currentTime / media.duration);
        });

        function showProgressTooltip(pos) {
            if (!canSeek()) return;
            progressTooltip.textContent = formatTime(pos * media.duration);
            progressTooltip.style.left = 'clamp(2rem, ' + (pos * 100) + '%, calc(100% - 2rem))';
            progressTooltip.classList.add('visible');
        }

        progressContainer.addEventListener('mousemove', function (event) {
            const rect = progressContainer.getBoundingClientRect();
            if (!rect.width) return;
            const pos = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
            showProgressTooltip(pos);
        });

        progressContainer.addEventListener('mouseleave', function () {
            progressTooltip.classList.remove('visible');
        });
        progressContainer.addEventListener('blur', function () { progressTooltip.classList.remove('visible'); });

        function setVolumeUi(volume, muted) {
            volumeSlider.value = muted ? 0 : volume;
            volumeSlider.style.setProperty('--volume-percent', (muted ? 0 : volume * 100) + '%');
            volumeBtn.innerHTML = muted || volume === 0 ? MUTE_ICON : VOLUME_ICON;
            const label = muted || volume === 0 ? '取消静音' : '静音';
            volumeBtn.setAttribute('aria-label', label);
            volumeBtn.title = label;
            volumeSlider.setAttribute('aria-valuetext', Math.round((muted ? 0 : volume) * 100) + '%');
        }

        volumeBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            const silent = media.muted || media.volume === 0;
            if (silent && media.volume === 0) media.volume = lastVolume;
            media.muted = !silent;
            setVolumeUi(media.volume, media.muted);
        });

        volumeSlider.addEventListener('input', function (event) {
            const volume = parseFloat(event.target.value);
            media.volume = volume;
            if (volume > 0) lastVolume = volume;
            media.muted = volume === 0;
            setVolumeUi(volume, media.muted);
        });

        volumeSlider.addEventListener('click', function (event) {
            event.stopPropagation();
        });
        media.addEventListener('volumechange', function () {
            if (media.volume > 0) lastVolume = media.volume;
            setVolumeUi(media.volume, media.muted);
        });

        function openSpeedDropdown() {
            speedDropdown.inert = false;
            speedBtn.setAttribute('aria-expanded', 'true');
            speedDropdown.classList.add('is-open');
            const selected = speedOptions.find(option => option.getAttribute('aria-checked') === 'true');
            if (selected) selected.focus();
        }

        function closeSpeedDropdown() {
            speedDropdown.inert = true;
            speedBtn.setAttribute('aria-expanded', 'false');
            speedDropdown.classList.remove('is-open');
        }

        speedBtn.addEventListener('click', function (event) {
            event.stopPropagation();
            if (speedDropdown.classList.contains('is-open')) closeSpeedDropdown();
            else openSpeedDropdown();
        });
        speedBtn.addEventListener('keydown', function (event) {
            if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
            event.preventDefault();
            openSpeedDropdown();
        });

        document.addEventListener('click', function (event) {
            if (!speedBtn.contains(event.target) && !speedDropdown.contains(event.target)) closeSpeedDropdown();
        });
        document.addEventListener('focusin', function (event) {
            if (!speedBtn.contains(event.target) && !speedDropdown.contains(event.target)) closeSpeedDropdown();
        });
        speedDropdown.addEventListener('keydown', function (event) {
            const current = speedOptions.indexOf(event.target.closest('.media-speed-option'));
            let next;
            if (event.key === 'Escape') {
                event.preventDefault();
                closeSpeedDropdown();
                speedBtn.focus();
                return;
            }
            if (event.key === 'Tab') {
                // Restore the trigger before the browser advances to the next control.
                speedBtn.focus();
                closeSpeedDropdown();
                return;
            }
            if (event.key === 'ArrowDown') next = (current + 1) % speedOptions.length;
            else if (event.key === 'ArrowUp') next = (current + speedOptions.length - 1) % speedOptions.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = speedOptions.length - 1;
            else return;
            event.preventDefault();
            speedOptions[next].focus();
        });

        function updateSpeedUi() {
            speedOptions.forEach(function (item) {
                const selected = Number(item.dataset.speed) === media.playbackRate;
                item.classList.toggle('active', selected);
                item.setAttribute('aria-checked', String(selected));
                if (selected) speedBtn.textContent = item.textContent;
            });
            speedBtn.setAttribute('aria-label', '播放速度：' + speedBtn.textContent);
        }
        media.addEventListener('ratechange', updateSpeedUi);

        speedOptions.forEach(function (option) {
            option.addEventListener('click', function (event) {
                event.stopPropagation();
                const speed = parseFloat(option.dataset.speed);
                media.playbackRate = speed;
                updateSpeedUi();
                closeSpeedDropdown();
                speedBtn.focus();
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
