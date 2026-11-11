/* global window, self */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(root || {});
    } else {
        root.FreecatPlatform = factory(root);
    }
}(typeof self !== 'undefined' ? self : this, function (root) {
    function storageFacade(runtimeRoot, name) {
        return {
            getItem(key) {
                try {
                    // 浏览器可能在读取 storage 属性时就拒绝访问，必须一起捕获。
                    const storage = runtimeRoot[name];
                    return storage ? storage.getItem(key) : null;
                } catch (err) {
                    return null;
                }
            },
            setItem(key, value) {
                try {
                    const storage = runtimeRoot[name];
                    if (storage) storage.setItem(key, value);
                } catch (err) {}
            },
            removeItem(key) {
                try {
                    const storage = runtimeRoot[name];
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
            localStorage: storageFacade(runtimeRoot, 'localStorage'),
            sessionStorage: storageFacade(runtimeRoot, 'sessionStorage'),
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
