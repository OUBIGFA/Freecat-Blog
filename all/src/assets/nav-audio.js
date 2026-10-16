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
        const navAudioPlaylistToggle = document.getElementById('nav-audio-playlist-toggle');
        const navAudioPlaylist = document.getElementById('nav-audio-playlist');
        const trackButtons = navAudioPlaylist ? Array.from(navAudioPlaylist.querySelectorAll('[data-audio-track-index]')) : [];
        const idleIcon = navAudioToggle.querySelector('.nav-audio-icon-idle');
        const playingIcon = navAudioToggle.querySelector('.nav-audio-icon-playing');
        const playlist = readNavAudioPlaylist();
        const playlistKey = playlist.map(track => track.src).join('\n');
        let currentIndex = 0;
        let pendingSeekTime = null;
        let requestedPlayback = false;
        let playbackRequestId = 0;
        let playlistOpen = false;
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

        // Disclosure buttons keep native Tab/Enter/Space behavior; this is not an ARIA menu.
        function setNavAudioPlaylistOpen(open) {
            if (!navAudioPlaylistToggle || !navAudioPlaylist) return;
            playlistOpen = open;
            navAudioPlaylistToggle.setAttribute('aria-expanded', String(open));
            navAudioPlaylist.hidden = !open;
            if (navAudioControl) navAudioControl.dataset.playlistOpen = String(open);
            if (open) {
                // The shell reveals interactive content before its load event; bind the current document now.
                bindNavAudioFramePointerDown();
                setNavAudioVolumeOpen(false);
                const list = navAudioPlaylist.querySelector('.nav-audio-track-list');
                const active = trackButtons[currentIndex];
                // Scroll only the song list, never the article behind the fixed header.
                if (list && active) list.scrollTop = Math.max(0, active.offsetTop - list.offsetTop);
            }
        }

        function setNavAudioVolumeOpen(open) {
            if (!navAudioControl) return;
            if (volumeHideTimer) {
                window.clearTimeout(volumeHideTimer);
                volumeHideTimer = 0;
            }
            const shouldOpen = open && requestedPlayback && !navAudio.ended && !playlistOpen;
            navAudioControl.dataset.volumeOpen = shouldOpen ? 'true' : 'false';
            if (navAudioVolume) navAudioVolume.tabIndex = shouldOpen ? 0 : -1;
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

        function isNavAudioEventTarget(target) {
            return target instanceof document.defaultView.Node
                && (
                    navAudioControl.contains(target)
                    || (navAudioVolumeWrapper && navAudioVolumeWrapper.contains(target))
                );
        }

        function closeNavAudioVolumeNow() {
            if (!navAudioControl || navAudioControl.dataset.volumeOpen !== 'true') return;
            navAudioVolumePointerInside = false;
            if (document.activeElement instanceof document.defaultView.HTMLElement && navAudioControl.contains(document.activeElement)) {
                document.activeElement.blur();
            }
            setNavAudioVolumeOpen(false);
        }

        function closeNavAudioOnOutsideInteraction(event) {
            if (!navAudioControl || isNavAudioEventTarget(event.target)) return;
            setNavAudioPlaylistOpen(false);
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
                navAudioFramePointerDownDocument.removeEventListener('pointerdown', closeNavAudioOnOutsideInteraction, true);
                navAudioFramePointerDownDocument.removeEventListener('focusin', closeNavAudioOnOutsideInteraction);
            }
            navAudioFramePointerDownDocument = frameDocument;
            navAudioFramePointerDownDocument.addEventListener('pointerdown', closeNavAudioOnOutsideInteraction, true);
            navAudioFramePointerDownDocument.addEventListener('focusin', closeNavAudioOnOutsideInteraction);
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
            // Loading another source invalidates any pending play() promise for the old one.
            playbackRequestId++;
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
            navAudioToggle.title = `${isPlaying ? '暂停' : '播放'}：${playlist[currentIndex].title}`;
            trackButtons.forEach(button => {
                const isCurrent = Number(button.dataset.audioTrackIndex) === currentIndex;
                button.setAttribute('aria-current', String(isCurrent));
                const status = button.querySelector('.nav-audio-track-status');
                if (status) status.textContent = isCurrent ? (isPlaying ? '播放中' : '已暂停') : '';
            });
            if (idleIcon) idleIcon.classList.toggle('hidden', isPlaying);
            if (playingIcon) playingIcon.classList.toggle('hidden', !isPlaying);
        }

        function playNavAudio() {
            const requestId = ++playbackRequestId;
            if (errorSkipTimer) {
                window.clearTimeout(errorSkipTimer);
                errorSkipTimer = 0;
            }
            requestedPlayback = true;
            syncNavAudioState();
            saveNavAudioState(true);
            const playResult = navAudio.play();
            if (playResult && typeof playResult.catch === 'function') {
                playResult.catch(error => {
                    // Rapid selection can reject an older play() with AbortError; it must not skip the new song.
                    if (requestId === playbackRequestId) handleNavAudioPlaybackFailure(error);
                });
            }
        }

        function stopNavAudioRequest() {
            playbackRequestId++;
            requestedPlayback = false;
            syncNavAudioState();
            saveNavAudioState(true);
        }

        function pauseNavAudio() {
            playbackRequestId++;
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
            const failedRequestId = playbackRequestId;
            errorSkipTimer = window.setTimeout(() => {
                errorSkipTimer = 0;
                if (!requestedPlayback || failedRequestId !== playbackRequestId) return;
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

        if (navAudioPlaylistToggle) {
            navAudioPlaylistToggle.addEventListener('click', () => {
                closeTagMenu();
                closeHeaderSearch(true);
                setNavAudioPlaylistOpen(!playlistOpen);
            });
        }
        trackButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = Number(button.dataset.audioTrackIndex);
                if (index === currentIndex && requestedPlayback) return;
                failedTrackIndexes.clear();
                // Selecting the paused current song resumes it; selecting another starts it from zero.
                if (index !== currentIndex) setNavAudioTrack(index, { currentTime: 0 });
                playNavAudio();
            });
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
            navAudioControl.addEventListener('keydown', event => {
                if (event.key !== 'Escape' || !playlistOpen) return;
                event.preventDefault();
                event.stopPropagation();
                setNavAudioPlaylistOpen(false);
                navAudioPlaylistToggle.focus({ preventScroll: true });
            });
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

        document.addEventListener('pointerdown', closeNavAudioOnOutsideInteraction, true);
        document.addEventListener('focusin', closeNavAudioOnOutsideInteraction);
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
