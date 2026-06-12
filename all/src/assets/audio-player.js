(function () {
    'use strict';

    const mediaPlayer = window.FreecatMediaPlayer;
    if (!mediaPlayer) throw new Error('FreecatMediaPlayer not loaded before audio-player.js');
    const template = window.FreecatMediaPlayerTemplate;
    if (!template) throw new Error('FreecatMediaPlayerTemplate not loaded before audio-player.js');

    const AUDIO_EMOJI_RE = /\u{1f3b5}/gu;

    window.FreecatAudioPlayer = {
        init: initAudioPlayers
    };

    initAudioPlayers();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAudioPlayers, { once: true });
    }

    function initAudioPlayers(root) {
        const scope = root && root.querySelectorAll ? root : document;
        scope.querySelectorAll('.audio-player-container[data-audio-src], figure.audio-player[data-audio-src]').forEach(function (node) {
            const audioUrl = node.getAttribute('data-audio-src') || '';
            if (!audioUrl) return;
            const title = cleanTitle(node.getAttribute('data-audio-title') || '');
            if (node.matches && node.matches('figure.audio-player[data-audio-src]')) {
                const audioPlayer = createAudioPlayer(title, audioUrl);
                node.parentNode.replaceChild(audioPlayer, node);
                return;
            }
            hydrateAudioPlayer(node);
        });
    }

    function cleanTitle(title) {
        return String(title || '').replace(AUDIO_EMOJI_RE, '').trim();
    }

    function createAudioPlayer(title, audioUrl) {
        const container = document.createElement('div');
        container.innerHTML = template.renderAudioPlayer({ title, src: audioUrl });
        const player = container.firstElementChild;
        if (!player) return container;
        return hydrateAudioPlayer(player);
    }

    function hydrateAudioPlayer(container) {
        if (container.dataset.audioHydrated === 'true') return container;
        container.dataset.audioHydrated = 'true';
        const audio = container.querySelector('audio');
        mediaPlayer.hydrateMediaControls(container, audio, { kind: 'audio' });
        return container;
    }

})();
