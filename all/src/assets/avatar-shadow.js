/* avatar-shadow.js
 * 头像光影动效（首页 hero / 关于页 hero）：鼠标接近时双色光晕跟随。
 * 依赖全局：无（所有依赖经 init 注入）。仅桌面端（min-width: 768px）启用。
 */
(function (root) {
    'use strict';

    function init(deps) {
        const win = deps.window;
        const doc = deps.document;
        const platform = deps.platform;

        const heroAvatar = doc.getElementById('hero-avatar');
        const avatarTriggerArea = doc.getElementById('avatar-trigger-area');
        if (!heroAvatar || !avatarTriggerArea) return;

        let avatarShadowFrame = null;
        let isAvatarShadowResetting = true;
        // 取计算后的 box-shadow 作为基线；若 CSS 未声明则为 'none'，
        // 此时不能直接和 dynamicShadow 拼成 "none, ..."（非法 CSS），
        // 需要把基线归零，渲染时只输出动态部分。
        const rawBaseShadow = win.getComputedStyle(heroAvatar).boxShadow;
        const baseAvatarShadow = rawBaseShadow && rawBaseShadow !== 'none' ? rawBaseShadow : '';
        const currentShadow = { x: 0, y: 0, blur: 10, alpha: 0 };
        const targetShadow = { x: 0, y: 0, blur: 10, alpha: 0 };

        const renderAvatarShadow = () => {
            if (currentShadow.alpha <= 0.01) {
                heroAvatar.style.boxShadow = baseAvatarShadow || '';
                return;
            }

            const glowAlpha = (currentShadow.alpha * 0.5).toFixed(3);
            const dynamicShadow = [
                `${currentShadow.x.toFixed(2)}px ${(currentShadow.y - 5).toFixed(2)}px ${currentShadow.blur.toFixed(2)}px rgba(186, 66, 255, ${glowAlpha})`,
                `${currentShadow.x.toFixed(2)}px ${(currentShadow.y + 5).toFixed(2)}px ${currentShadow.blur.toFixed(2)}px rgba(0, 225, 255, ${glowAlpha})`
            ].join(', ');

            heroAvatar.style.boxShadow = baseAvatarShadow
                ? `${baseAvatarShadow}, ${dynamicShadow}`
                : dynamicShadow;
        };

        const animateAvatarShadow = () => {
            avatarShadowFrame = null;
            const ease = isAvatarShadowResetting ? 0.055 : 0.22;

            currentShadow.x += (targetShadow.x - currentShadow.x) * ease;
            currentShadow.y += (targetShadow.y - currentShadow.y) * ease;
            currentShadow.blur += (targetShadow.blur - currentShadow.blur) * ease;
            currentShadow.alpha += (targetShadow.alpha - currentShadow.alpha) * ease;

            const isSettled = Math.abs(currentShadow.x - targetShadow.x) < 0.04
                && Math.abs(currentShadow.y - targetShadow.y) < 0.04
                && Math.abs(currentShadow.blur - targetShadow.blur) < 0.04
                && Math.abs(currentShadow.alpha - targetShadow.alpha) < 0.004;

            if (isSettled) {
                currentShadow.x = targetShadow.x;
                currentShadow.y = targetShadow.y;
                currentShadow.blur = targetShadow.blur;
                currentShadow.alpha = targetShadow.alpha;
            }

            renderAvatarShadow();

            if (!isSettled) {
                avatarShadowFrame = win.requestAnimationFrame(animateAvatarShadow);
            }
        };

        const startAvatarShadowAnimation = () => {
            heroAvatar.style.transition = 'none';
            if (!avatarShadowFrame) {
                avatarShadowFrame = win.requestAnimationFrame(animateAvatarShadow);
            }
        };

        const handleMove = (e) => {
            const rect = heroAvatar.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = centerX - e.clientX;
            const dy = centerY - e.clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            isAvatarShadowResetting = false;
            targetShadow.x = dx / 15;
            targetShadow.y = dy / 15;
            targetShadow.blur = 10 + distance / 30;
            targetShadow.alpha = 1;
            startAvatarShadowAnimation();
        };

        const handleReset = () => {
            isAvatarShadowResetting = true;
            targetShadow.x = 0;
            targetShadow.y = 0;
            targetShadow.blur = 10;
            targetShadow.alpha = 0;
            startAvatarShadowAnimation();
        };

        if (platform.mediaQuery('(min-width: 768px)')) {
            avatarTriggerArea.addEventListener('mousemove', handleMove);
            avatarTriggerArea.addEventListener('mouseleave', handleReset);
        }
    }

    root.FreecatAvatarShadow = { init };
}(typeof self !== 'undefined' ? self : this));
