/* global window, self */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.FreecatLazyImages = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    function createLazyImageController(options) {
        const doc = options.document;
        const root = options.window;
        const ImageCtor = options.Image || root.Image;
        const fallback = options.fallback || '/image/404.png';
        let observer = null;

        function loadDeferredImage(img) {
            const realSrc = img && img.dataset ? img.dataset.src : '';
            if (!realSrc || img.dataset.imageLoadStarted === 'true') return;
            img.dataset.imageLoadStarted = 'true';
            img.dataset.imageObserved = 'false';

            const probe = new ImageCtor();
            probe.onload = () => {
                img.src = realSrc;
                img.classList.remove('post-image-placeholder');
                img.classList.add('post-image-loaded');
                img.removeAttribute('data-src');
            };
            probe.onerror = () => {
                img.dataset.fallbackApplied = 'true';
                img.classList.add('post-image-failed');
                img.removeAttribute('data-src');
            };
            probe.src = realSrc;
        }

        function getObserver() {
            if (observer || !('IntersectionObserver' in root)) return observer;
            observer = new root.IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    observer.unobserve(entry.target);
                    loadDeferredImage(entry.target);
                });
            }, { rootMargin: '320px 0px' });
            return observer;
        }

        function unobserveDeferredImages(scope = doc) {
            if (!observer || !scope) return;
            const images = scope.matches && scope.matches('img[data-src]')
                ? [scope]
                : Array.from(scope.querySelectorAll ? scope.querySelectorAll('img[data-src]') : []);
            images.forEach((img) => {
                observer.unobserve(img);
                img.dataset.imageObserved = 'false';
            });
        }

        function initDeferredImages() {
            const images = Array.from(doc.querySelectorAll('img[data-src]'))
                .filter((img) => img.dataset.imageLoadStarted !== 'true' && img.dataset.imageObserved !== 'true');
            if (!images.length) return;

            if (!('IntersectionObserver' in root)) {
                images.forEach(loadDeferredImage);
                return;
            }

            const activeObserver = getObserver();
            images.forEach((img) => {
                img.dataset.imageObserved = 'true';
                activeObserver.observe(img);
            });
        }

        function installFallbackHandler() {
            doc.addEventListener('error', (event) => {
                const target = event.target;
                if (!target || target.tagName !== 'IMG') return;
                if (target.dataset.fallbackApplied === 'true') return;
                if (target.src && target.src.indexOf(fallback) !== -1) return;
                target.dataset.fallbackApplied = 'true';
                target.removeAttribute('srcset');
                target.src = fallback;
            }, true);
        }

        return { initDeferredImages, installFallbackHandler, unobserveDeferredImages };
    }

    return { createLazyImageController };
}));
