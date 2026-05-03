/**
 * Freecat-Blog 构建编排器
 *
 * 整体流程：
 *   1. 清理 dist 并搬运 assets / image
 *   2. 加载站点 / 社交 / 关于页面三份配置（Control/*.md）
 *   3. 准备模板引擎（注入 partials + tailwind config + SITE_*）
 *   4. 依次生成：post 详情页 → 分页首页 → all.html → search.html + 索引 → about.html → sitemap/robots
 *
 * 各步骤的实际逻辑都拆在 build/*.js 中，本文件仅做编排。
 */

const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Shanghai');

const gitDatesModule = require('./build/git-dates.js');
const { loadConfig } = require('./build/config.js');
const { SOCIAL_DEFAULTS } = require('./build/social-defaults.js');
const { createEngine } = require('./build/template-engine.js');
const { copyDir, ensureCleanDir } = require('./build/fs-utils.js');
const postPage = require('./build/pages/post.js');
const indexPage = require('./build/pages/index.js');
const allPage = require('./build/pages/all.js');
const searchPage = require('./build/pages/search.js');
const aboutPage = require('./build/pages/about.js');
const { generateSitemap, generateRobotsTxt } = require('./build/pages/sitemap.js');

// ===== 路径常量 =====
const DEFAULT_POSTS_PER_PAGE = 8;
const DIRS = {
    posts: path.join(__dirname, '..', 'writing'),
    assets: path.join(__dirname, 'src', 'assets'),
    images: path.join(__dirname, 'image'),
    output: path.join(__dirname, 'dist'),
    templates: path.join(__dirname, 'src'),
    partials: path.join(__dirname, 'src', 'partials'),
    control: path.join(__dirname, '..', 'Control')
};

// ===== 1. 清理输出目录 + 搬运静态资源 =====
ensureCleanDir(DIRS.output);
fs.mkdirSync(path.join(DIRS.output, 'posts'));

console.log('📦 Moving assets and configs...');
if (fs.existsSync(DIRS.assets)) copyDir(DIRS.assets, path.join(DIRS.output, 'assets'));
if (fs.existsSync(DIRS.images)) copyDir(DIRS.images, path.join(DIRS.output, 'image'));

// ===== 2. 加载 Tailwind config 内容 + git dates =====
let tailwindConfigContent = '';
const tailwindConfigPath = path.join(DIRS.assets, 'tailwind.config.js');
if (fs.existsSync(tailwindConfigPath)) {
    tailwindConfigContent = fs.readFileSync(tailwindConfigPath, 'utf-8');
}

// 构建时实时从 git 提取最后提交时间，避免依赖手动生成的 git-dates.json 快照过期。
// 在 git 不可用 / 浅克隆等场景下，自动回退到 git-dates.json，再不行就 fs.statSync(mtime)。
const gitDates = gitDatesModule.collect({
    repoRoot: path.join(__dirname, '..'),
    postsDir: DIRS.posts,
    fallbackJson: path.join(__dirname, 'git-dates.json')
});

// ===== 3. 加载配置（site / social / about） =====
console.log('⚙️ Loading site configuration...');
const siteDefaults = {
    site_title: 'FreeCat Blog',
    site_name: 'FreeCat',
    footer_copyright: '© FreeCat | Curiosity is the best motivation.',
    hero_title: 'Hi, I\'m FreeCat.Building Blog & writing.',
    hero_subtitle: 'Always maintain a strong curiosity and be willing to explore a world of freedom, experiencing a life of liberty.',
    hero_avatar: '/image/freecat.png',
    posts_per_page: DEFAULT_POSTS_PER_PAGE,
    default_theme: 'system',
    site_logo_icon: '',
    site_favicon: '/image/freecat_web_icon.png',
    site_url: ''
};
const siteConfig = loadConfig(DIRS.control, 'site', 'site.md', siteDefaults);
if (!siteConfig.site_favicon) siteConfig.site_favicon = '/image/freecat_web_icon.png';
if (!siteConfig.hero_avatar) siteConfig.hero_avatar = '/image/freecat.png';

const rawPostsPerPage = siteConfig.posts_per_page;
const parsedPostsPerPage = rawPostsPerPage === '' || rawPostsPerPage == null
    ? Number.NaN
    : Number(rawPostsPerPage);
const POSTS_PER_PAGE = Number.isFinite(parsedPostsPerPage) && parsedPostsPerPage >= 0
    ? Math.floor(parsedPostsPerPage)
    : DEFAULT_POSTS_PER_PAGE;

console.log('📱 Loading social media configuration...');
const socialConfig = loadConfig(DIRS.control, 'social', 'social.md', SOCIAL_DEFAULTS);

console.log('👤 Loading about page configuration...');
const aboutConfig = loadConfig(DIRS.control, 'about', 'about.md', {
    about_hero_title: '',
    about_hero_subtitle: '',
    about_hero_avatar: '/image/freecat.png'
});

// ===== 4. 模板引擎 =====
const engine = createEngine({
    templatesDir: DIRS.templates,
    partialsDir: DIRS.partials,
    tailwindConfigContent,
    siteConfig,
    socialConfig
});

const tplIndex = engine.loadTemplate('template_index.html');
const tplPost = engine.loadTemplate('template_post.html');
const tplIndexAll = engine.loadTemplate('template_index_all.html');
const tplSearch = engine.loadTemplate('template_index_search.html');
const tplAbout = engine.loadTemplate('template_index_About.html');

// ===== 5. 加载并排序文章 =====
console.log('📝 Processing posts...');
const allPosts = postPage.loadPosts({ postsDir: DIRS.posts, gitDates });

// ===== 6. 生成各页面 =====
postPage.generateAll({ posts: allPosts, template: tplPost, siteConfig, outputDir: DIRS.output });
indexPage.generateAll({ posts: allPosts, template: tplIndex, postsPerPage: POSTS_PER_PAGE, outputDir: DIRS.output });
allPage.generate({ posts: allPosts, template: tplIndexAll, outputDir: DIRS.output });
searchPage.generate({ posts: allPosts, template: tplSearch, outputDir: DIRS.output });
aboutPage.generate({ template: tplAbout, siteConfig, aboutConfig, outputDir: DIRS.output });
generateSitemap({ posts: allPosts, siteConfig, outputDir: DIRS.output });
generateRobotsTxt({ siteConfig, outputDir: DIRS.output });

console.log('🚀 Build Complete: Posts & Index pages generated!');
