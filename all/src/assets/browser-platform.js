/* global window, self */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(root || {});
    } else {
        root.FreecatPlatform = factory(root);
    }
}(typeof self !== 'undefined' ? self : this, function (root) {
    function storageFacade(storage) {
        return {
            getItem(key) {
                try {
                    return storage ? storage.getItem(key) : null;
                } catch (err) {
                    return null;
                }
            },
            setItem(key, value) {
                try {
                    if (storage) storage.setItem(key, value);
                } catch (err) {}
            },
            removeItem(key) {
                try {
                    if (storage) storage.removeItem(key);
                } catch (err) {}
            },
            readJson(key, fallback) {
                const raw = this.getItem(key);
                if (!raw) return fallback;
                try {
                    const parsed = JSON.parse(raw);
                    return parsed == null ? fallback : parsed;
                } catch (err) {
                    return fallback;
                }
            },
            writeJson(key, value) {
                this.setItem(key, JSON.stringify(value));
            }
        };
    }

    function createPlatform(targetRoot) {
        const runtimeRoot = targetRoot || {};
        return {
            localStorage: storageFacade(runtimeRoot.localStorage),
            sessionStorage: storageFacade(runtimeRoot.sessionStorage),
            fetch(url, options) {
                if (!runtimeRoot.fetch) return Promise.reject(new Error('Fetch unavailable'));
                return runtimeRoot.fetch(url, options);
            },
            mediaQuery(query) {
                return !!(runtimeRoot.matchMedia && runtimeRoot.matchMedia(query).matches);
            }
        };
    }

    const platform = createPlatform(root);
    platform.createPlatform = createPlatform;
    return platform;
}));
