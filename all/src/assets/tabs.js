/* Local Ink UI Tabs adaptation: one sliding indicator, roving focus and linked panels.
 * Source: https://ink-ui.com/docs/components/tabs (default variant).
 * Kept framework-free to share the existing static page bundles.
 */
(function (window) {
    'use strict';
    const controllers = new WeakMap();

    function init(group) {
        if (controllers.has(group)) return controllers.get(group);
        const doc = group.ownerDocument;
        const list = group.querySelector('[role="tablist"]');
        const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
        const panels = Array.from(new Set(tabs.map(tab => doc.getElementById(tab.getAttribute('aria-controls'))))).filter(Boolean);
        const desktop = group.hasAttribute('data-tabs-desktop') ? window.matchMedia('(min-width: 1280px)') : null;
        let active = tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0];
        let wide = !desktop || desktop.matches;

        function measure() {
            if (!active || list.hidden) return;
            list.style.setProperty('--tab-left', active.offsetLeft + 'px');
            list.style.setProperty('--tab-width', active.offsetWidth + 'px');
        }

        function render() {
            list.hidden = !wide || tabs.length < 2;
            tabs.forEach(tab => {
                tab.setAttribute('aria-selected', String(tab === active));
                tab.setAttribute('tabindex', tab === active ? '0' : '-1');
            });
            panels.forEach(panel => {
                const selected = panel.id === active.getAttribute('aria-controls');
                panel.hidden = wide ? !selected : panel.hasAttribute('data-desktop-only');
                if (wide && selected) panel.setAttribute('aria-labelledby', active.id);
                // Below the sidebar breakpoint, latest updates remain a native disclosure.
                if (!wide) panel.removeAttribute('aria-labelledby');
            });
            measure();
            group.dispatchEvent(new window.CustomEvent('freecat:tabs-layout'));
        }

        function select(tab, emit = true) {
            if (!tabs.includes(tab)) return;
            const changed = tab !== active;
            active = tab;
            render();
            if (emit && changed) group.dispatchEvent(new window.CustomEvent('freecat:tab-change', { detail: { tab } }));
        }

        list.addEventListener('click', event => {
            const tab = event.target.closest('[role="tab"]');
            if (tab) select(tab);
        });
        list.addEventListener('keydown', event => {
            const current = tabs.indexOf(event.target.closest('[role="tab"]'));
            if (current < 0) return;
            let next;
            if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
            else if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length;
            else if (event.key === 'Home') next = 0;
            else if (event.key === 'End') next = tabs.length - 1;
            else return;
            event.preventDefault();
            select(tabs[next]);
            tabs[next].focus();
        });

        function setDisclosureMode() {
            if (!desktop) return;
            panels.forEach(panel => {
                const details = panel.querySelector('details');
                if (details) details.open = wide;
            });
        }
        if (desktop) desktop.addEventListener('change', () => {
            wide = desktop.matches;
            setDisclosureMode();
            render();
        });
        window.addEventListener('resize', measure);
        if (doc.fonts) doc.fonts.ready.then(measure);
        if (window.ResizeObserver) new window.ResizeObserver(measure).observe(list);
        const controller = { select };
        controllers.set(group, controller);
        setDisclosureMode();
        render();
        return controller;
    }

    window.FreecatTabs = { init };
    function initAll() { window.document.querySelectorAll('[data-tabs]').forEach(init); }
    if (window.document.readyState === 'loading') window.document.addEventListener('DOMContentLoaded', initAll, { once: true });
    else initAll();
}(window));
