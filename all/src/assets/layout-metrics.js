/* layout-metrics.js
 * 页面布局测量：顶栏对齐、首页 hero 高度测量、侧栏完整显示。
 * 依赖全局：无（所有依赖经 init 注入）。
 * 由 main.js 在 DOMContentLoaded 后调用 init() 装配。
 */
(function (root) {
    'use strict';

    function init(deps) {
        const win = deps.window;
        const doc = deps.document;
        const framed = !!deps.framed;
        const recent = doc.querySelector('.freecat-home-recent-details');
        let recentIsDesktop = null;

        // 只在跨越布局断点时重置，手机横竖屏切换保留读者的展开选择。
        function syncHomeRecentDisclosure() {
            if (!recent) return;
            const desktop = win.innerWidth >= 1280;
            if (desktop !== recentIsDesktop) {
                recent.open = desktop;
                recentIsDesktop = desktop;
            }
            recent.querySelector('summary').tabIndex = desktop ? -1 : 0;
        }

        // ============================================================
        // [Fix] 固定顶栏遮挡内容：按实际 header 高度动态同步内容区上边距
        // 安全间距与 transitions.css 中 --freecat-header-safe-gap 的下限保持一致：
        // 移动端 ≥16px，桌面 ≥24px，避免 hero 内容紧贴顶栏。
        // ============================================================
        function normalizeHeaderHeight(measuredHeight) {
            const fallbackHeight = win.innerWidth < 768 ? 61 : 73;
            const height = Number(measuredHeight);
            return Number.isFinite(height) && height > 0 && height <= 120 ? height : fallbackHeight;
        }

        function updateContentTopOffset() {
            // 内容页被嵌入 iframe 时，自身顶栏已隐藏，上边距改由外壳按其顶栏实测高度喂入，
            // 这里直接跳过，避免用 0 高度的隐藏顶栏把外壳喂的值覆盖掉。
            if (framed) return;
            const header = doc.querySelector('header.fixed');
            if (!header) return;
            const headerHeight = normalizeHeaderHeight(Math.ceil(header.getBoundingClientRect().height));
            const extraGap = win.innerWidth < 768 ? 16 : 24;
            const topOffset = `${headerHeight + extraGap}px`;
            const rootStyle = doc.documentElement.style;
            const headerHeightValue = `${headerHeight}px`;
            const extraGapValue = `${extraGap}px`;
            if (rootStyle.getPropertyValue('--freecat-header-height') !== headerHeightValue) {
                rootStyle.setProperty('--freecat-header-height', headerHeightValue);
            }
            if (rootStyle.getPropertyValue('--freecat-header-safe-gap') !== extraGapValue) {
                rootStyle.setProperty('--freecat-header-safe-gap', extraGapValue);
            }
            if (rootStyle.getPropertyValue('--freecat-page-top-offset') !== topOffset) {
                rootStyle.setProperty('--freecat-page-top-offset', topOffset);
            }
            const targets = doc.querySelectorAll('.layout-container.page-blur-target, main.page-blur-target');
            targets.forEach((el) => {
                if (el.style.marginTop) el.style.marginTop = '';
            });
            scheduleHomeHeroMeasure();
            scheduleSidebarFooterAvoid();
        }

        function observeHeaderOffsetChanges() {
            const header = doc.querySelector('header.fixed');
            if (!header || typeof ResizeObserver === 'undefined') return;
            const observer = new ResizeObserver(() => updateContentTopOffset());
            observer.observe(header);
        }

        let homeHeroMeasureFrame = 0;

        function updateHomeHeroMeasuredHeight() {
            homeHeroMeasureFrame = 0;

            const heroBg = doc.querySelector('.freecat-hero-bg');
            const heroSection = doc.getElementById('hero-section');
            if (!heroBg || !heroSection) return;

            const heroContent = heroSection.firstElementChild || heroSection;
            const measuredHeight = Math.ceil(heroContent.getBoundingClientRect().height);
            if (measuredHeight <= 0) return;

            doc.documentElement.style.setProperty('--freecat-hero-measured-height', `${measuredHeight}px`);
        }

        function scheduleHomeHeroMeasure() {
            if (homeHeroMeasureFrame) return;
            homeHeroMeasureFrame = win.requestAnimationFrame(updateHomeHeroMeasuredHeight);
        }

        function observeHomeHeroContentChanges() {
            const heroSection = doc.getElementById('hero-section');
            if (!heroSection || typeof ResizeObserver === 'undefined') return;
            const observer = new ResizeObserver(() => scheduleHomeHeroMeasure());
            observer.observe(heroSection);
            if (heroSection.firstElementChild) {
                observer.observe(heroSection.firstElementChild);
            }
        }

        // ============================================================
        // 按完整窗口的高度等比缩放侧栏；保留页脚空间，文章列表仍在侧栏内滚动。
        // 记录本次访问的最大高度，手动缩小窗口不会反复缩放侧栏。
        // ============================================================
        let sidebarFooterAvoidFrame = 0;
        let sidebarMaxViewportHeight = win.innerHeight;
        const readingPanel = doc.querySelector('.freecat-post-reading-panel');
        const sidebar = doc.querySelector('.freecat-home-sidebar') || readingPanel;
        // 首页缩放内层；文章页现有面板已包含切换按钮和列表，可直接整体缩放。
        const sidebarContent = doc.querySelector('.freecat-home-sidebar-content') || readingPanel;
        function updateSidebarFooterAvoid() {
            sidebarFooterAvoidFrame = 0;
            if (!sidebar) return;
            sidebar.style.bottom = '';
            if (win.innerWidth < 1280) {
                sidebar.style.removeProperty('--freecat-sidebar-scale');
                sidebar.style.removeProperty('--freecat-sidebar-viewport-height');
                return;
            }
            const content = sidebarContent;
            if (!content) return;
            sidebarMaxViewportHeight = Math.max(sidebarMaxViewportHeight, win.innerHeight);
            // 滚动列表的高度也沿用最大窗口，避免缩矮窗口时改变比例。
            const viewportHeight = `${sidebarMaxViewportHeight}px`;
            if (readingPanel && sidebar.style.getPropertyValue('--freecat-sidebar-viewport-height') !== viewportHeight) {
                sidebar.style.setProperty('--freecat-sidebar-viewport-height', viewportHeight);
            }
            if (!content.scrollHeight) return;
            const footer = doc.querySelector('.freecat-site-footer');
            const padding = parseFloat(win.getComputedStyle(sidebar).paddingTop) || 0;
            const available = Math.max(1, sidebarMaxViewportHeight - sidebar.getBoundingClientRect().top
                - padding - (footer ? footer.offsetHeight : 0) - 24);
            const value = String(Math.min(1, available / content.scrollHeight));
            if (sidebar.style.getPropertyValue('--freecat-sidebar-scale') !== value) {
                sidebar.style.setProperty('--freecat-sidebar-scale', value);
            }
        }
        function scheduleSidebarFooterAvoid() {
            if (sidebarFooterAvoidFrame) return;
            sidebarFooterAvoidFrame = win.requestAnimationFrame(updateSidebarFooterAvoid);
        }

        // 初始测量 + 持续监听（从 main.js 的装配段整体迁入）。
        syncHomeRecentDisclosure();
        if (recent) recent.addEventListener('toggle', () => {
            if (recentIsDesktop && !recent.open) recent.open = true;
            scheduleSidebarFooterAvoid();
        });
        updateContentTopOffset();
        observeHeaderOffsetChanges();
        observeHomeHeroContentChanges();
        scheduleHomeHeroMeasure();
        scheduleSidebarFooterAvoid();

        if (sidebarContent && typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(scheduleSidebarFooterAvoid).observe(sidebarContent);
        }

        win.addEventListener('resize', syncHomeRecentDisclosure);
        win.addEventListener('resize', updateContentTopOffset);
        win.addEventListener('resize', scheduleSidebarFooterAvoid);
        win.addEventListener('load', updateContentTopOffset);
        win.addEventListener('load', scheduleSidebarFooterAvoid);
        win.requestAnimationFrame(() => {
            updateContentTopOffset();
            win.requestAnimationFrame(updateContentTopOffset);
        });
        if (doc.fonts && doc.fonts.ready) {
            doc.fonts.ready.then(() => {
                updateContentTopOffset();
                scheduleHomeHeroMeasure();
                scheduleSidebarFooterAvoid();
            });
        }

        return {
            updateContentTopOffset,
            scheduleHomeHeroMeasure,
            scheduleSidebarFooterAvoid
        };
    }

    root.FreecatLayoutMetrics = { init };
}(typeof self !== 'undefined' ? self : this));
