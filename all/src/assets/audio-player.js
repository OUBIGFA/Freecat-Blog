(function () {
    'use strict';

    const PLAY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><path d="M9 8.48216V15.518L15.0307 12.0001L9 8.48216ZM7.75194 5.43872L18.2596 11.5682C18.4981 11.7073 18.5787 12.0135 18.4396 12.252C18.3961 12.3265 18.3341 12.3885 18.2596 12.432L7.75194 18.5615C7.51341 18.7006 7.20725 18.62 7.06811 18.3815C7.0235 18.305 7 18.2181 7 18.1296V5.87061C7 5.59446 7.22386 5.37061 7.5 5.37061C7.58853 5.37061 7.67547 5.39411 7.75194 5.43872Z"></path></svg>`;
    const PAUSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.5rem" height="1.5rem"><path d="M15 7C15 6.44772 15.4477 6 16 6C16.5523 6 17 6.44772 17 7V17C17 17.5523 16.5523 18 16 18C15.4477 18 15 17.5523 15 17V7ZM7 7C7 6.44772 7.44772 6 8 6C8.55228 6 9 6.44772 9 7V17C9 17.5523 8.55228 18 8 18C7.44772 18 7 17.5523 7 17V7Z"></path></svg>`;
    const VOLUME_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M6.60282 10.0001L10 7.22056V16.7796L6.60282 14.0001H3V10.0001H6.60282ZM2 16.0001H5.88889L11.1834 20.3319C11.2727 20.405 11.3846 20.4449 11.5 20.4449C11.7761 20.4449 12 20.2211 12 19.9449V4.05519C12 3.93977 11.9601 3.8279 11.887 3.73857C11.7121 3.52485 11.3971 3.49335 11.1834 3.66821L5.88889 8.00007H2C1.44772 8.00007 1 8.44778 1 9.00007V15.0001C1 15.5524 1.44772 16.0001 2 16.0001ZM23 12C23 15.292 21.5539 18.2463 19.2622 20.2622L17.8445 18.8444C19.7758 17.1937 21 14.7398 21 12C21 9.26016 19.7758 6.80629 17.8445 5.15557L19.2622 3.73779C21.5539 5.75368 23 8.70795 23 12ZM18 12C18 10.0883 17.106 8.38548 15.7133 7.28673L14.2842 8.71584C15.3213 9.43855 16 10.64 16 12C16 13.36 15.3213 14.5614 14.2842 15.2841L15.7133 16.7132C17.106 15.6145 18 13.9116 18 12Z"></path></svg>`;
    const MUTE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M10 7.22056L6.60282 10.0001H3V14.0001H6.60282L10 16.7796V7.22056ZM5.88889 16.0001H2C1.44772 16.0001 1 15.5524 1 15.0001V9.00007C1 8.44778 1.44772 8.00007 2 8.00007H5.88889L11.1834 3.66821C11.3971 3.49335 11.7121 3.52485 11.887 3.73857C11.9601 3.8279 12 3.93977 12 4.05519V19.9449C12 20.2211 11.7761 20.4449 11.5 20.4449C11.3846 20.4449 11.2727 20.405 11.1834 20.3319L5.88889 16.0001ZM20.4142 12.0001L23.9497 15.5356L22.5355 16.9498L19 13.4143L15.4645 16.9498L14.0503 15.5356L17.5858 12.0001L14.0503 8.46454L15.4645 7.05032L19 10.5859L22.5355 7.05032L23.9497 8.46454L20.4142 12.0001Z"></path></svg>`;
    const TITLE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M11 21V19.9291C7.60771 19.4439 5 16.5265 5 13V8C5 4.13401 8.13401 1 12 1C15.866 1 19 4.13401 19 8V13C19 16.5265 16.3923 19.4439 13 19.9291V21H17V23H7V21H11ZM12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9ZM12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z"></path></svg>`;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudioPlayers);
    } else {
        initAudioPlayers();
    }

    function initAudioPlayers() {
        document.querySelectorAll('figure.audio-player[data-audio-src]').forEach(figure => {
            const audioUrl = figure.getAttribute('data-audio-src') || '';
            if (!audioUrl) return;
            const title = figure.getAttribute('data-audio-title') || '';
            const audioPlayer = createAudioPlayer(title, audioUrl);
            figure.parentNode.replaceChild(audioPlayer, figure);
        });
    }

    function createAudioPlayer(title, audioUrl) {
        // Remove the trigger emoji 🎵 from the title and trim whitespace
        const cleanTitle = title.replace(/🎵/g, '').trim();
        const container = document.createElement('div');
        container.className = 'audio-player-container';

        container.innerHTML = `
            <div class="audio-player-title">
                <div class="audio-player-title-left">
                    <span class="audio-player-icon flex items-center justify-center">${TITLE_ICON}</span>
                    <span>${escapeHtml(cleanTitle)}</span>
                </div>
                <span class="audio-time">
                    <span class="audio-current-time">0:00</span>
                    <span> / </span>
                    <span class="audio-duration">0:00</span>
                </span>
            </div>
            <div class="audio-progress-container" role="slider" tabindex="0" aria-label="Audio progress"
                aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00">
                <div class="audio-progress-bar"></div>
                <div class="audio-progress-thumb"></div>
                <div class="audio-progress-tooltip">0:00</div>
            </div>
            <div class="audio-controls">
                <div class="audio-controls-left">
                    <button class="audio-play-btn" aria-label="Play/Pause">
                        <span class="audio-play-icon flex items-center justify-center">${PLAY_ICON}</span>
                    </button>
                    <div class="audio-volume-control">
                        <button class="audio-volume-btn" aria-label="Volume control">
                            ${VOLUME_ICON}
                        </button>
                        <div class="audio-volume-slider-wrapper">
                            <input type="range" class="audio-volume-slider" min="0" max="1" step="0.01" value="0.6">
                        </div>
                    </div>
                </div>
                <div class="audio-controls-right">
                    <div class="audio-speed-control">
                        <button class="audio-speed-btn" aria-label="Playback speed">1.0x</button>
                        <div class="audio-speed-dropdown t-dropdown" data-origin="bottom-right">
                            <div class="audio-speed-option" data-speed="0.5">0.5x</div>
                            <div class="audio-speed-option" data-speed="0.75">0.75x</div>
                            <div class="audio-speed-option active" data-speed="1">1.0x</div>
                            <div class="audio-speed-option" data-speed="1.25">1.25x</div>
                            <div class="audio-speed-option" data-speed="1.5">1.5x</div>
                            <div class="audio-speed-option" data-speed="1.75">1.75x</div>
                            <div class="audio-speed-option" data-speed="2">2.0x</div>
                        </div>
                    </div>
                </div>
            </div>
            <audio preload="auto">
                <source src="${escapeHtml(audioUrl)}" type="${getAudioType(audioUrl)}">
                Your browser does not support the audio element.
            </audio>
        `;

        // Get elements
        const audio = container.querySelector('audio');
        const playBtn = container.querySelector('.audio-play-btn');
        const playIcon = container.querySelector('.audio-play-icon');
        const progressContainer = container.querySelector('.audio-progress-container');
        const progressBar = container.querySelector('.audio-progress-bar');
        const progressThumb = container.querySelector('.audio-progress-thumb');
        const progressTooltip = container.querySelector('.audio-progress-tooltip');
        const currentTimeEl = container.querySelector('.audio-current-time');
        const durationEl = container.querySelector('.audio-duration');
        const volumeBtn = container.querySelector('.audio-volume-btn');
        const volumeWrapper = container.querySelector('.audio-volume-slider-wrapper');
        const volumeSlider = container.querySelector('.audio-volume-slider');
        const speedBtn = container.querySelector('.audio-speed-btn');
        const speedDropdown = container.querySelector('.audio-speed-dropdown');
        const speedOptions = container.querySelectorAll('.audio-speed-option');

        // Set initial volume
        audio.volume = 0.6;
        let lastVolume = 0.6;

        // Play/Pause functionality
        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
            } else {
                audio.pause();
            }
        });

        // Listen for playing state to update UI and pause others
        audio.addEventListener('play', () => {
            playIcon.innerHTML = PAUSE_ICON;
            // Pause all other audio elements on the page
            document.querySelectorAll('audio').forEach(otherAudio => {
                if (otherAudio !== audio && !otherAudio.paused) {
                    otherAudio.pause();
                }
            });
        });

        // Listen for pause state to update UI
        audio.addEventListener('pause', () => {
            playIcon.innerHTML = PLAY_ICON;
        });

        // Update progress bar
        function setProgressUi(time) {
            const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
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

        audio.addEventListener('timeupdate', () => {
            setProgressUi(audio.currentTime);
        });

        // Set duration when metadata is loaded
        audio.addEventListener('loadedmetadata', () => {
            durationEl.textContent = formatTime(audio.duration);
            setProgressUi(audio.currentTime);
        });

        // Progress bar click and drag to seek
        let isDragging = false;

        progressContainer.addEventListener('pointerdown', (e) => {
            isDragging = true;
            progressContainer.classList.add('is-dragging');
            progressContainer.setPointerCapture(e.pointerId);
            updateProgress(e, { playAfterSeek: true });
        });

        progressContainer.addEventListener('pointermove', (e) => {
            if (isDragging) {
                updateProgress(e, { playAfterSeek: true });
            }
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
            if (!audio.duration) return;

            const step = e.shiftKey ? 10 : 5;
            let nextTime = audio.currentTime;

            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                nextTime -= step;
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                nextTime += step;
            } else if (e.key === 'Home') {
                nextTime = 0;
            } else if (e.key === 'End') {
                nextTime = audio.duration;
            } else {
                return;
            }

            e.preventDefault();
            seekToTime(nextTime, { playAfterSeek: false });
        });

        function updateProgress(e, options = {}) {
            const rect = progressContainer.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            seekToTime(pos * audio.duration, options);
        }

        function seekToTime(time, { playAfterSeek = false } = {}) {
            if (!audio.duration) return;
            const nextTime = Math.max(0, Math.min(audio.duration, time));
            audio.currentTime = nextTime;
            setProgressUi(nextTime);
            if (playAfterSeek) audio.play();
        }

        // Progress bar hover tooltip
        progressContainer.addEventListener('mousemove', (e) => {
            if (!audio.duration) return;
            const rect = progressContainer.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const time = pos * audio.duration;
            progressTooltip.textContent = formatTime(time);
            progressTooltip.style.left = (pos * 100) + '%';
            progressTooltip.classList.add('visible');
        });

        progressContainer.addEventListener('mouseleave', () => {
            progressTooltip.classList.remove('visible');
        });

        // Volume control
        volumeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isMuted = !audio.muted;
            audio.muted = isMuted;

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
            audio.volume = volume;
            lastVolume = volume;

            if (volume > 0) {
                audio.muted = false;
                volumeBtn.innerHTML = VOLUME_ICON;
                volumeBtn.style.opacity = '1';
            } else {
                audio.muted = true;
                volumeBtn.innerHTML = MUTE_ICON;
                volumeBtn.style.opacity = '0.5';
            }

            // Update slider color
            volumeSlider.style.setProperty('--volume-percent', (volume * 100) + '%');
        });

        volumeSlider.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        const dropdownCloseMs = 150;

        function openSpeedDropdown() {
            speedDropdown.classList.remove('is-closing');
            speedDropdown.classList.add('is-open');
        }

        function closeSpeedDropdown() {
            speedDropdown.classList.remove('is-open');
            speedDropdown.classList.add('is-closing');
            setTimeout(() => {
                speedDropdown.classList.remove('is-closing');
            }, dropdownCloseMs);
        }

        // Speed control
        speedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (speedDropdown.classList.contains('is-open')) {
                closeSpeedDropdown();
            } else {
                openSpeedDropdown();
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            closeSpeedDropdown();
        });

        speedOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const speed = parseFloat(option.dataset.speed);
                audio.playbackRate = speed;
                speedBtn.textContent = speed + 'x';

                // Update active state
                speedOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                closeSpeedDropdown();
            });
        });

        return container;
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

    function getAudioType(url) {
        const urlLower = url.toLowerCase();
        if (urlLower.includes('.mp3')) return 'audio/mpeg';
        if (urlLower.includes('.m4a')) return 'audio/mp4';
        if (urlLower.includes('.wav')) return 'audio/wav';
        if (urlLower.includes('.ogg')) return 'audio/ogg';
        if (urlLower.includes('.aac')) return 'audio/aac';
        if (urlLower.includes('.flac')) return 'audio/flac';
        if (urlLower.includes('.opus')) return 'audio/opus';
        return 'audio/mpeg'; // Default
    }
})();
