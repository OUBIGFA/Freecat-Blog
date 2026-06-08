(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.FreecatNavAudio = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    function init({
        window,
        document,
        platform,
        navAudioToggle,
        navAudio,
        isShell,
        contentFrame,
        closeTagMenu,
        closeHeaderSearch
    }) {
        if (!navAudioToggle || !navAudio) return;

        const STATE_KEY = 'freecat-nav-audio-state-v1';
        const VOLUME_KEY = 'freecat-nav-audio-volume-v1';
        const DEFAULT_NAV_AUDIO_VOLUME = 0.5;
        const STATE_SAVE_INTERVAL_MS = 1500;
        const NAV_AUDIO_VOLUME_HIDE_DELAY_MS = 1000;
        const navAudioControl = document.getElementById('nav-audio-control');
        const navAudioVolume = document.getElementById('nav-audio-volume');
        const navAudioVolumeWrapper = navAudioVolume
            ? navAudioVolume.closest('.nav-audio-volume-slider-wrapper')
            : null;
        const idleIcon = navAudioToggle.querySelector('.nav-audio-icon-idle');
        const playingIcon = navAudioToggle.querySelector('.nav-audio-icon-playing');
        const playlist = readNavAudioPlaylist();
        const playlistKey = playlist.map(track => track.src).join('\n');
        let currentIndex = 0;
        let pendingSeekTime = null;
        let requestedPlayback = false;
        let lastStateSave = 0;
        let currentVolume = readSavedNavAudioVolume();
        let errorSkipTimer = 0;
        let volumeHideTimer = 0;
        let navAudioVolumePointerInside = false;
        const failedTrackIndexes = new Set();

        if (!playlist.length) return;

        function readNavAudioPlaylist() {
            const rawPlaylist = navAudioToggle.dataset.audioPlaylist || '';
            if (rawPlaylist) {
                try {
                    const parsed = JSON.parse(rawPlaylist);
                    if (Array.isArray(parsed)) {
                        return parsed
                            .map(track => ({
                                src: String(track && track.src || '').trim(),
                                title: String(track && track.title || 'Audio').trim() || 'Audio'
                            }))
                            .filter(track => track.src);
                    }
                } catch (err) {}
            }

            const fallbackSrc = String(navAudioToggle.dataset.audioSrc || navAudio.getAttribute('src') || '').trim();
            if (!fallbackSrc) return [];
            return [{
                src: fallbackSrc,
                title: String(navAudioToggle.dataset.audioTitle || navAudio.dataset.audioTitle || 'Audio').trim() || 'Audio'
            }];
        }

        function clampTrackIndex(index) {
            const value = Number(index);
            if (!Number.isFinite(value) || value < 0) return 0;
            return Math.min(playlist.length - 1, Math.floor(value));
        }

        function getSavedNavAudioState() {
            try {
                const raw = platform.sessionStorage.getItem(STATE_KEY);
                const state = raw ? JSON.parse(raw) : null;
                if (!state || state.playlistKey !== playlistKey) return null;
                return state;
            } catch (err) {
                return null;
            }
        }

        function readSavedNavAudioVolume() {
            try {
                const saved = platform.localStorage.getItem(VOLUME_KEY);
                const volume = saved == null ? DEFAULT_NAV_AUDIO_VOLUME : Number(saved);
                return Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : DEFAULT_NAV_AUDIO_VOLUME;
            } catch (err) {
                return DEFAULT_NAV_AUDIO_VOLUME;
            }
        }

        function saveNavAudioVolume(volume) {
            try {
                platform.localStorage.setItem(VOLUME_KEY, String(volume));
            } catch (err) {}
        }

        function syncNavAudioVolumeUi(volume) {
            const nextVolume = Math.max(0, Math.min(1, Number(volume) || 0));
            navAudio.volume = nextVolume;
            navAudio.muted = nextVolume === 0;
            if (navAudioVolume) {
                navAudioVolume.value = String(nextVolume);
                navAudioVolume.style.setProperty('--volume-percent', `${nextVolume * 100}%`);
            }
        }

        function setNavAudioVolumeOpen(open) {
            if (!navAudioControl) return;
            if (volumeHideTimer) {
                window.clearTimeout(volumeHideTimer);
                volumeHideTimer = 0;
            }
            const shouldOpen = open && requestedPlayback && !navAudio.ended;
            navAudioControl.dataset.volumeOpen = shouldOpen ? 'true' : 'false';
        }

        function shouldKeepNavAudioVolumeOpen() {
            return navAudioVolumePointerInside
                || navAudioControl.matches(':hover')
                || (navAudioVolumeWrapper && navAudioVolumeWrapper.matches(':hover'));
        }

        function scheduleNavAudioVolumeClose() {
            if (!navAudioControl) return;
            if (volumeHideTimer) window.clearTimeout(volumeHideTimer);
            volumeHideTimer = window.setTimeout(() => {
                volumeHideTimer = 0;
                if (shouldKeepNavAudioVolumeOpen()) {
                    setNavAudioVolumeOpen(true);
                    return;
                }
                setNavAudioVolumeOpen(false);
            }, NAV_AUDIO_VOLUME_HIDE_DELAY_MS);
        }

        function isNavAudioVolumeEventTarget(target) {
            return target instanceof Node
                && (
                    navAudioControl.contains(target)
                    || (navAudioVolumeWrapper && navAudioVolumeWrapper.contains(target))
                );
        }

        function closeNavAudioVolumeNow() {
            if (!navAudioControl || navAudioControl.dataset.volumeOpen !== 'true') return;
            navAudioVolumePointerInside = false;
            if (document.activeElement instanceof HTMLElement && navAudioControl.contains(document.activeElement)) {
                document.activeElement.blur();
            }
            setNavAudioVolumeOpen(false);
        }

        function closeNavAudioVolumeOnOutsidePointerDown(event) {
            if (!navAudioControl || navAudioControl.dataset.volumeOpen !== 'true') return;
            if (isNavAudioVolumeEventTarget(event.target)) return;
            closeNavAudioVolumeNow();
        }

        let navAudioFramePointerDownDocument = null;

        function bindNavAudioFramePointerDown() {
            if (!isShell || !contentFrame) return;
            let frameDocument;
            try {
                frameDocument = contentFrame.contentDocument;
            } catch (err) {
                return;
            }
            if (!frameDocument || frameDocument === navAudioFramePointerDownDocument) return;
            if (navAudioFramePointerDownDocument) {
                navAudioFramePointerDownDocument.removeEventListener('pointerdown', closeNavAudioVolumeNow, true);
            }
            navAudioFramePointerDownDocument = frameDocument;
            navAudioFramePointerDownDocument.addEventListener('pointerdown', closeNavAudioVolumeNow, true);
        }

        function getContinuousTime(state) {
            if (!state) return 0;
            const baseTime = Number(state.currentTime) || 0;
            if (state.paused === true) return baseTime;
            const updatedAt = Number(state.updatedAt) || Date.now();
            return Math.max(0, baseTime + (Date.now() - updatedAt) / 1000);
        }

        function saveNavAudioState(force = false) {
            const now = Date.now();
            if (!force && now - lastStateSave < STATE_SAVE_INTERVAL_MS) return;
            lastStateSave = now;
            try {
                platform.sessionStorage.setItem(STATE_KEY, JSON.stringify({
                    playlistKey,
                    index: currentIndex,
                    currentTime: Number(navAudio.currentTime) || 0,
                    paused: !requestedPlayback,
                    updatedAt: now
                }));
            } catch (err) {}
        }

        function applyPendingSeek() {
            if (pendingSeekTime === null) return;
            try {
                const duration = Number(navAudio.duration);
                const maxTime = Number.isFinite(duration) && duration > 0
                    ? Math.max(0, duration - 0.25)
                    : pendingSeekTime;
                navAudio.currentTime = Math.max(0, Math.min(pendingSeekTime, maxTime));
                pendingSeekTime = null;
            } catch (err) {}
        }

        function setNavAudioTrack(index, options = {}) {
            currentIndex = clampTrackIndex(index);
            const track = playlist[currentIndex];
            if (!track) return;

            navAudio.dataset.audioTitle = track.title;
            navAudio.dataset.audioIndex = String(currentIndex);
            navAudioToggle.dataset.audioSrc = track.src;
            navAudioToggle.dataset.audioTitle = track.title;

            if (navAudio.getAttribute('src') !== track.src) {
                navAudio.setAttribute('src', track.src);
                navAudio.load();
            }

            if (typeof options.currentTime === 'number' && options.currentTime >= 0) {
                pendingSeekTime = options.currentTime;
                applyPendingSeek();
            } else {
                pendingSeekTime = null;
            }
        }

        function syncNavAudioState() {
            const isPlaying = requestedPlayback && !navAudio.ended;
            if (navAudioControl) navAudioControl.dataset.playing = isPlaying ? 'true' : 'false';
            if (!isPlaying) {
                setNavAudioVolumeOpen(false);
            } else if (navAudioControl && (navAudioControl.matches(':hover') || navAudioControl.matches(':focus-within'))) {
                setNavAudioVolumeOpen(true);
            }
            navAudioToggle.dataset.playing = isPlaying ? 'true' : 'false';
            navAudioToggle.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
            navAudioToggle.setAttribute('aria-label', isPlaying ? 'Pause audio' : 'Play audio');
            if (idleIcon) idleIcon.classList.toggle('hidden', isPlaying);
            if (playingIcon) playingIcon.classList.toggle('hidden', !isPlaying);
        }

        function playNavAudio() {
            requestedPlayback = true;
            syncNavAudioState();
            saveNavAudioState(true);
            const playResult = navAudio.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(handleNavAudioPlaybackFailure);
            }
        }

        function stopNavAudioRequest() {
            requestedPlayback = false;
            syncNavAudioState();
            saveNavAudioState(true);
        }

        function pauseNavAudio() {
            requestedPlayback = false;
            navAudio.pause();
            syncNavAudioState();
            saveNavAudioState(true);
        }

        function playNextNavAudioTrack() {
            setNavAudioTrack((currentIndex + 1) % playlist.length, { currentTime: 0 });
            playNavAudio();
        }

        function handleNavAudioPlaybackFailure(error) {
            if (!requestedPlayback) {
                syncNavAudioState();
                return;
            }
            if (error && error.name === 'NotAllowedError') {
                stopNavAudioRequest();
                return;
            }
            if (errorSkipTimer) return;
            errorSkipTimer = window.setTimeout(() => {
                errorSkipTimer = 0;
                failedTrackIndexes.add(currentIndex);
                if (failedTrackIndexes.size >= playlist.length) {
                    stopNavAudioRequest();
                    return;
                }
                playNextNavAudioTrack();
            }, 0);
        }

        const savedState = getSavedNavAudioState();
        if (savedState) {
            currentIndex = clampTrackIndex(savedState.index);
            requestedPlayback = savedState.paused !== true;
            setNavAudioTrack(currentIndex, { currentTime: getContinuousTime(savedState) });
        } else {
            setNavAudioTrack(0);
        }

        navAudioToggle.addEventListener('click', () => {
            closeTagMenu();
            closeHeaderSearch(true);
            if (requestedPlayback) pauseNavAudio();
            else {
                failedTrackIndexes.clear();
                playNavAudio();
            }
        });

        if (navAudioVolume) {
            navAudioVolume.addEventListener('click', (event) => {
                event.stopPropagation();
            });
            navAudioVolume.addEventListener('input', (event) => {
                currentVolume = Math.max(0, Math.min(1, Number(event.target.value) || 0));
                syncNavAudioVolumeUi(currentVolume);
                saveNavAudioVolume(currentVolume);
                saveNavAudioState(true);
            });
        }

        if (navAudioControl) {
            navAudioControl.dataset.volumeOpen = 'false';
            navAudioControl.addEventListener('pointerenter', () => setNavAudioVolumeOpen(true));
            navAudioControl.addEventListener('pointerleave', scheduleNavAudioVolumeClose);
            navAudioControl.addEventListener('focusin', () => setNavAudioVolumeOpen(true));
            navAudioControl.addEventListener('focusout', scheduleNavAudioVolumeClose);
        }

        if (navAudioVolumeWrapper) {
            navAudioVolumeWrapper.addEventListener('pointerenter', () => {
                navAudioVolumePointerInside = true;
                setNavAudioVolumeOpen(true);
            });
            navAudioVolumeWrapper.addEventListener('pointerleave', () => {
                navAudioVolumePointerInside = false;
                scheduleNavAudioVolumeClose();
            });
        }

        document.addEventListener('pointerdown', closeNavAudioVolumeOnOutsidePointerDown, true);
        if (isShell && contentFrame) {
            contentFrame.addEventListener('load', bindNavAudioFramePointerDown);
            bindNavAudioFramePointerDown();
        }

        navAudio.addEventListener('ended', () => {
            if (requestedPlayback) {
                playNextNavAudioTrack();
                return;
            }
            syncNavAudioState();
            saveNavAudioState(true);
        });

        navAudio.addEventListener('loadedmetadata', applyPendingSeek);
        navAudio.addEventListener('durationchange', applyPendingSeek);
        navAudio.addEventListener('error', () => handleNavAudioPlaybackFailure(navAudio.error));
        navAudio.addEventListener('timeupdate', () => saveNavAudioState());
        ['play', 'playing', 'pause', 'emptied'].forEach((eventName) => {
            navAudio.addEventListener(eventName, () => {
                if (eventName === 'playing') failedTrackIndexes.clear();
                syncNavAudioState();
                saveNavAudioState(eventName !== 'timeupdate');
            });
        });
        window.addEventListener('pagehide', () => saveNavAudioState(true));
        window.addEventListener('beforeunload', () => saveNavAudioState(true));
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') saveNavAudioState(true);
        });

        syncNavAudioVolumeUi(currentVolume);
        syncNavAudioState();

        if (requestedPlayback || (!savedState && navAudioToggle.dataset.audioAutoplay === 'true')) {
            window.setTimeout(playNavAudio, 0);
        }
    }

    return { init };
}));
