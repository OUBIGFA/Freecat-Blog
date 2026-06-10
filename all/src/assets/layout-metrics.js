/* layout-metrics.js
 * 页面布局测量：顶栏高度同步、首页 hero 高度测量、侧栏底部清理。
 * 依赖全局：无（所有依赖经 init 注入）。
 * 由 main.js 在 DOMContentLoaded 后调用 init() 装配。
 */
(function (root) {
    'use strict';

    function init(deps) {
        const win = deps.window;
        const doc = deps.document;
        const framed = !!deps.framed;

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
            scheduleHomeSidebarFooterAvoid();
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
        // [Fix] 首页 / 搜索页：fixed sidebar 始终铺满视口高度。
        // footer 自身层级更高，会自然盖在 sidebar 背景之上；这里仅清理旧版
        // 动态避让逻辑可能留下的 inline bottom，避免无感分页后高度卡住。
        // ============================================================
        let sidebarFooterAvoidFrame = 0;
        function updateHomeSidebarFooterAvoid() {
            sidebarFooterAvoidFrame = 0;
            const sidebar = doc.querySelector('.freecat-home-sidebar');
            if (!sidebar) return;
            sidebar.style.bottom = '';
        }
        function scheduleHomeSidebarFooterAvoid() {
            if (sidebarFooterAvoidFrame) return;
            sidebarFooterAvoidFrame = win.requestAnimationFrame(updateHomeSidebarFooterAvoid);
        }

        // 初始测量 + 持续监听（从 main.js 的装配段整体迁入）。
        updateContentTopOffset();
        observeHeaderOffsetChanges();
        observeHomeHeroContentChanges();
        scheduleHomeHeroMeasure();
        scheduleHomeSidebarFooterAvoid();

        win.addEventListener('resize', updateContentTopOffset);
        win.addEventListener('resize', scheduleHomeSidebarFooterAvoid);
        win.addEventListener('scroll', scheduleHomeSidebarFooterAvoid, { passive: true });
        win.addEventListener('load', updateContentTopOffset);
        win.addEventListener('load', scheduleHomeSidebarFooterAvoid);
        win.requestAnimationFrame(() => {
            updateContentTopOffset();
            win.requestAnimationFrame(updateContentTopOffset);
        });
        if (doc.fonts && doc.fonts.ready) {
            doc.fonts.ready.then(() => {
                updateContentTopOffset();
                scheduleHomeHeroMeasure();
            });
        }

        return {
            updateContentTopOffset,
            scheduleHomeHeroMeasure,
            scheduleHomeSidebarFooterAvoid
        };
    }

    root.FreecatLayoutMetrics = { init };
}(typeof self !== 'undefined' ? self : this));
