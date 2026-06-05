(function () {
    'use strict';

    const mediaPlayer = window.FreecatMediaPlayer;
    if (!mediaPlayer) throw new Error('FreecatMediaPlayer not loaded before audio-player.js');

    const TITLE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25rem" height="1.25rem"><path d="M11 21V19.9291C7.60771 19.4439 5 16.5265 5 13V8C5 4.13401 8.13401 1 12 1C15.866 1 19 4.13401 19 8V13C19 16.5265 16.3923 19.4439 13 19.9291V21H17V23H7V21H11ZM12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9ZM12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z"></path></svg>`;
    const AUDIO_EMOJI_RE = /\u{1f3b5}/gu;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudioPlayers);
    } else {
        initAudioPlayers();
    }

    function initAudioPlayers() {
        document.querySelectorAll('figure.audio-player[data-audio-src]').forEach(function (figure) {
            const audioUrl = figure.getAttribute('data-audio-src') || '';
            if (!audioUrl) return;
            const title = cleanTitle(figure.getAttribute('data-audio-title') || '');
            const audioPlayer = createAudioPlayer(title, audioUrl);
            figure.parentNode.replaceChild(audioPlayer, figure);
        });
    }

    function cleanTitle(title) {
        return String(title || '').replace(AUDIO_EMOJI_RE, '').trim();
    }

    function createAudioPlayer(title, audioUrl) {
        const container = document.createElement('div');
        container.className = 'audio-player-container media-player-container';
        container.innerHTML = mediaPlayer.renderPlayerChrome({
            kind: 'audio',
            title,
            titleIcon: TITLE_ICON,
            progressLabel: 'Audio progress',
            mediaElementHtml: `
                <audio preload="auto">
                    <source src="${mediaPlayer.escapeHtml(audioUrl)}" type="${getAudioType(audioUrl)}">
                    Your browser does not support the audio element.
                </audio>`
        });
        return hydrateAudioPlayer(container);
    }

    function hydrateAudioPlayer(container) {
        if (container.dataset.audioHydrated === 'true') return container;
        container.dataset.audioHydrated = 'true';
        const audio = container.querySelector('audio');
        mediaPlayer.hydrateMediaControls(container, audio, { kind: 'audio' });
        return container;
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
})();
