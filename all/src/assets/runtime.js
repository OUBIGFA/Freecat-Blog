(function (root) {
    'use strict';

    const services = Object.create(null);

    function setService(name, fn, legacyName) {
        services[name] = typeof fn === 'function' ? fn : null;
        if (legacyName) root[legacyName] = services[name];
    }

    function callService(name, fallback, args) {
        const service = services[name];
        if (typeof service === 'function') return service.apply(root, args);
        if (typeof fallback === 'function' && fallback !== callService) return fallback.apply(root, args);
    }

    root.FreecatRuntime = {
        setNavigate(fn) {
            setService('navigate', fn, 'FreecatNavigate');
        },
        navigate(targetHref, options) {
            const handled = callService('navigate', root.FreecatNavigate, arguments);
            if (handled === undefined && !services.navigate) root.location.href = targetHref;
            return handled;
        },
        setSyncFrameHistory(fn) {
            setService('syncFrameHistory', fn, 'FreecatSyncFrameHistory');
        },
        syncFrameHistory(options) {
            return callService('syncFrameHistory', root.FreecatSyncFrameHistory, arguments);
        },
        setSyncUpdateSortUrl(fn) {
            setService('syncUpdateSortUrl', fn, 'FreecatSyncUpdateSortUrl');
        },
        syncUpdateSortUrl(options) {
            return callService('syncUpdateSortUrl', root.FreecatSyncUpdateSortUrl, arguments);
        },
        setSaveScrollPosition(fn) {
            setService('saveScrollPosition', fn, 'FreecatSaveScrollPosition');
        },
        saveScrollPosition() {
            return callService('saveScrollPosition', root.FreecatSaveScrollPosition, arguments);
        },
        setFreezeScrollSaves(fn) {
            setService('freezeScrollSaves', fn, 'FreecatFreezeScrollSaves');
        },
        freezeScrollSaves() {
            return callService('freezeScrollSaves', root.FreecatFreezeScrollSaves, arguments);
        },
        setApplyTheme(fn) {
            setService('applyTheme', fn, 'FreecatApplyTheme');
        },
        applyTheme(options) {
            return callService('applyTheme', root.FreecatApplyTheme, arguments);
        }
    };
}(typeof window !== 'undefined' ? window : this));
