/**
 * 社交媒体配置默认值。把曾经在 build.js 内联的庞大 SVG 字符串集中放在此处，
 * Control/social_社交媒体.md 中的字段会覆盖这里的默认值。
 */
const { renderIcon } = require('./icons.js');

const TWITTER_ICON = renderIcon('brand-twitter');
const INSTAGRAM_ICON = renderIcon('brand-instagram');
const GITHUB_ICON = renderIcon('brand-github');
const BEHANCE_ICON = renderIcon('brand-behance');
const TIKTOK_ICON = renderIcon('brand-tiktok');
const FACEBOOK_ICON = renderIcon('brand-facebook');
const RSS_ICON = renderIcon('rss');

const SOCIAL_DEFAULTS = {
    twitter_enabled: true,
    twitter_icon: TWITTER_ICON,
    twitter_url: 'https://x.com/home',
    instagram_enabled: true,
    instagram_icon: INSTAGRAM_ICON,
    instagram_url: 'https://www.instagram.com',
    github_enabled: true,
    github_icon: GITHUB_ICON,
    github_url: 'https://github.com',
    behance_enabled: false,
    behance_icon: BEHANCE_ICON,
    behance_url: 'https://www.behance.net/for_you',
    tiktok_enabled: false,
    tiktok_icon: TIKTOK_ICON,
    tiktok_url: 'https://www.tiktok.com',
    facebook_enabled: false,
    facebook_icon: FACEBOOK_ICON,
    facebook_url: 'https://www.facebook.com/',
    rss_enabled: true,
    rss_icon: RSS_ICON,
    rss_url: '/feed.xml'
};

// 平台顺序（与原 build.js 保持一致；rss 作为站内订阅入口放最后，避免抢占主社交位）
const SOCIAL_PLATFORM_ORDER = ['twitter', 'instagram', 'github', 'behance', 'tiktok', 'facebook', 'rss'];

module.exports = { SOCIAL_DEFAULTS, SOCIAL_PLATFORM_ORDER };
