<div align="center">
  <img src="all/image/freecat.png" alt="Freecat Blog Preview" width="120">

  <h1>Freecat Blog</h1>

  <p>本地写作、GitHub 备份、免费部署的个人博客模板</p>

  <p>简体中文 | <a href="README.en.md">English</a></p>

  <p>
    <img src="https://img.shields.io/badge/platform-Web-2563eb" alt="Platform">
    <img src="https://img.shields.io/badge/Node-20-339933" alt="Node">
    <img src="https://img.shields.io/badge/deploy-Cloudflare%20%7C%20Vercel-f97316" alt="Deploy">
    <img src="https://img.shields.io/badge/license-MIT-111827" alt="License">
  </p>

  <p>
    <a href="https://freecat-blog.pages.dev">演示站点 01</a> |
    <a href="https://freecat-blog-op.pages.dev">演示站点 02</a>
  </p>
</div>

## Freecat Blog 是什么

一个把本地 Markdown 文章自动发布成网站的个人博客模板：不买服务器、不维护后台、不写代码。文章原稿存在你的电脑和 GitHub 仓库里，随时可以备份、迁移、换平台。

```text
本地电脑：在 writing/ 写文章，在 Control/ 改网站信息
        ↓
GitHub Desktop 同步到 GitHub（自动备份）
        ↓
Cloudflare Pages / Vercel 自动构建
        ↓
博客网站自动更新
```

![01](all/image/Tutorial/00a.png)

![02](all/image/Tutorial/00b.png)

![03](all/image/Tutorial/00c.png)

![04](all/image/Tutorial/00d.png)

你会得到：

* 自动生成首页、文章页、归档页、搜索页、About 页
* 文章支持标签、封面、摘要、置顶、显示/隐藏；不写元数据也能直接发文
* Markdown 渲染数学公式、图表、流程图、甘特图；文章可嵌音频、视频和外部网页
* 中英混排间距自动优化，超长代码块自动折叠
* 内置 SEO 与 AI 检索支持，可生成 Sitemap、RSS、llms.txt，详见 `Control/SEO_搜索优化.md`
* 改网站名、头像、社交链接、主题，全程零代码
* 无多余动效与视觉干扰，为可阅读性设计的极简阅读体验

## 记住三个文件夹

| 文件夹 | 是否经常改 | 作用 |
| --- | --- | --- |
| `writing/` | 要 | 放文章，一个 Markdown 文件就是一篇 |
| `Control/` | 要 | 改网站名称、头像、首页介绍、社交链接 |
| `all/` | 不要 | 构建工程目录，部署平台从这里构建，别动它 |

**写文章去 `writing/`，改网站信息去 `Control/`，部署根目录填 `all`。**

## 部署

全程两件事：把模板复制成自己的 GitHub 仓库 → 连接到部署平台。免费，约 10 分钟。

### 准备

| 工具 / 账号 | 是否必需 | 用途 | 地址 |
| --- | --- | --- | --- |
| GitHub 账号 | 必需 | 保存博客仓库 | <https://github.com/signup> |
| GitHub Desktop | 必需 | 把本地改动同步到 GitHub | <https://desktop.github.com/download> |
| Markdown 编辑器 | 必需 | 写文章、改配置，推荐 Obsidian | <https://obsidian.md/zh> |
| Cloudflare 账号 | 推荐 | 免费部署博客网站 | <https://dash.cloudflare.com/sign-up> |
| Vercel 账号 | 可选 | 另一种免费部署方式 | <https://vercel.com/signup> |

Cloudflare Pages 和 Vercel 二选一，完全新手用 Cloudflare Pages。

### 第 1 步：创建自己的 GitHub 仓库

1. 登录 GitHub，打开 <https://github.com/new/import>，按下表填写：

| 字段 | 填写值 |
| --- | --- |
| `Your old repository's clone URL` | `https://github.com/OUBIGFA/Freecat-Blog` |
| `Owner` | 你的 GitHub 账号 |
| `Repository name` | 自己起一个，例如 `my-freecat-blog` |
| `Privacy` | 选 `Private` |

2. 点 `Begin import`，等几十秒到几分钟，看到 `Your new repository ... is ready` 就成功了。点进新仓库，确认能看到 `all/`、`Control/`、`writing/` 文件夹。
3. 打开 GitHub Desktop，点 `File` → `Clone repository`，选刚导入的仓库，选一个好找的本地位置，点 `Clone`。

![GitHub Desktop clone](all/image/Tutorial/10.png)

### 第 2 步：部署到 Cloudflare Pages（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，点创建应用程序。

![Cloudflare step 1](all/image/Tutorial/01.png)

2. 选 Pages。

![Cloudflare step 2](all/image/Tutorial/02.png)

3. 选「导入现有 Git 仓库」。

![Cloudflare step 3](all/image/Tutorial/03.png)

4. 选你自己的博客仓库。

![Cloudflare step 4](all/image/Tutorial/04.png)

5. 项目名称随意起，关键参数按下表填：

| Cloudflare 中文界面 | English UI | 填写值 |
| --- | --- | --- |
| 框架预设 | Framework preset | `None` / 不选预设 |
| 根目录（高级） | Root directory (advanced) > Path | `all` |
| 构建命令 | Build command | `npm run build` |
| 构建输出目录 | Build output directory | `dist` |
| 环境变量（建议填写） | Environment variables | `NODE_VERSION` = `20` |

![Cloudflare step 5](all/image/Tutorial/05.png)

6. 点 `Save and Deploy`，等 1-3 分钟。

> 建议在项目设置里启用 `Build cache（构建缓存）`：依赖缓存命中后安装只要几秒；文章新增字符后，字体子集也只要几秒到几十秒就能增量扩充，无需 Python 环境。

7. 构建完成后，打开 Cloudflare 给的默认网址（形如 `xxx.pages.dev`）确认。

![Cloudflare step 6](all/image/Tutorial/06.png)

**常见坑**：

* 根目录没填 `all`：平台从仓库根目录找 `package.json`，多半构建失败
* 输出目录填成 `all/dist`：根目录已经是 `all`，直接写 `dist`
* 随便选了框架预设：本项目不属于 Next.js、Nuxt、Astro 这类框架，预设选 `None / 无`
* 网站没更新：先看后台最新构建是否成功，再 `Ctrl + F5` 强刷，多半只是浏览器缓存

想用自己的域名：在 Cloudflare Pages 项目里绑定自定义域名即可。免费域名可参考[免费域名申请指南](https://blog.freeorg.dpdns.org/posts/%E5%85%8D%E8%B4%B9%E5%9F%9F%E5%90%8D%E7%94%B3%E8%AF%B7%E6%8C%87%E5%8D%97.html)，DNSHE 自动续期项目：<https://github.com/OUBIGFA/dnshe-auto-renew>。

### 备选：部署到 Vercel

已经在用 Vercel 的直接选它，只需要改一处 Root Directory。

1. 登录 [Vercel](https://vercel.com/)，点 `Add New...` → `Project`。
2. 连接 GitHub，选你的博客仓库。
3. 在导入页面找到 `Root Directory`，点右侧 `Edit`。

![Vercel root directory edit](all/image/Tutorial/11.png)

4. 在弹窗里勾选 `all` 文件夹，点 `Continue`。

![Vercel root directory select all](all/image/Tutorial/12.png)

5. 其余设置全部保持默认，直接点 `Deploy`。

> 最常踩的坑：Root Directory 没选 `all`，或手动展开 `Build and Output Settings` 覆盖了构建设置——Vercel 读不到仓库里的 `all/vercel.json`，部署出来全站 404。构建命令、输出目录、页面地址规则都由 `all/vercel.json` 自动接管。

Vercel 会自动复用构建缓存（含字体子集）：文章没新增字符时，后续部署直接跳过字体生成。别在项目设置里清空 Build Cache，除非确实想强制重新生成。

绑定自定义域名：项目设置 → `Domains`，按提示改解析。

## 写文章：`writing/`

一个 `.md` 文件就是一篇文章。自带的示例文章可以打开看格式、复制当模板，也可以删掉。用 Obsidian 或 VS Code 打开仓库直接写都行。

新文章开头通常长这样：

```md
---
title: 我的第一篇文章
date: 2026-01-01
tag:
  - 随笔
cover:
show_image_captions: true
description:
pinned: false
show: true
copy_content: false
---

这里开始写正文。
```

| 字段 | 作用 | 例子 |
| --- | --- | --- |
| `title` | 文章标题，留空则用文件名 | `我的第一篇文章` |
| `date` | 发布日期 | `2026-01-01` |
| `tag` | 标签，可写多个 | `- 随笔` |
| `cover` | 封面图链接，留空则无封面 | `https://...` |
| `show_image_captions` | 是否显示图片说明文字 | `true` / `false` |
| `description` | 摘要，留空会自动截取 | `一段简短介绍` |
| `pinned` | 是否置顶 | `true` / `false` |
| `show` | 是否在网站上展示 | `true` / `false` |
| `copy_content` | 是否在文章页显示复制正文按钮 | `true` / `false` |

## 改网站：`Control/`

| 文件 | 负责什么 |
| --- | --- |
| `site_网站属性.md` | 网站标题、站点名、首页介绍、头像、主题 |
| `SEO_搜索优化.md` | 正式域名、SEO 摘要、作者信息、AI 爬虫和 llms.txt |
| `social_社交媒体.md` | 社交媒体图标、主页链接、联系方式、推广链接 |
| `about_关于页面.md` | About 页面的标题、介绍和头像 |

编辑时记住四点：

* 冒号后面留一个空格，如 `site_name: FreeCat`
* 不想填的字段可以留空，但别删整行
* `_01`、`_02` 这类下划线开头的行是说明文字，别改字段名
* 改完必须用 GitHub Desktop 提交并同步，线上网站才会更新

三个常用文件的具体配置：

* `site_网站属性.md`：常改网站名称、描述、首页标题、头像、网站图标、默认主题、每页文章数、底部版权。主题的 `theme_system` / `theme_light` / `theme_dark` 只能有一个为 `true`，全为 `false` 时回退跟随系统
* `social_社交媒体.md`：每个平台三类字段——启用开关（`github_enabled: true`）、自定义图标（`github_icon_url:`，留空走默认）、主页链接（`github_url: https://github.com`）；用不到的平台把 `*_enabled` 改成 `false`
* `about_关于页面.md`：`about_hero_title`、`about_hero_subtitle`、`about_hero_avatar` 分别是 About 页的标题、介绍、头像，留空则用首页对应内容

## 日常更新（5 步）

1. 在 `writing/` 新增或修改文章。
2. 需要的话，在 `Control/` 改网站信息。
3. 保存文件。
4. 打开 GitHub Desktop，写一句提交说明，点 `Commit to main`。
5. 点 `Push origin`。

![GitHub Desktop commit](all/image/Tutorial/08.png)

![GitHub Desktop push](all/image/Tutorial/09.png)

同步后平台自动重新构建，1-3 分钟后刷新网站即可看到新内容。

## 音视频播放器

文章里写「文件直链」（不是网盘分享页），自动生成播放器：

```md
![I Still Believe](https://xxxx.mp3)
![这是示例视频](https://example.com/video.mp4)
```

链接没有音视频后缀时，在标题里加 🎵 或 🎬 强制识别：

```md
![🎵I Still Believe](https://xxxx)
![🎬这是示例视频](https://example.com/video)
```

支持格式：

* 音频：`.mp3`、`.m4a`、`.wav`、`.ogg`、`.aac`、`.flac`、`.opus`
* 视频：`.mp4`、`.webm`、`.mov`、`.m4v`、`.ogv`、`.m3u8`

判断链接能不能用：粘到浏览器地址栏，能直接播放或下载就可以用；打开是网盘页、登录页、提取码页就不行，可先用[网盘直链获取工具](https://link.gimhoy.com/)、[分享链接转直链工具](https://lz.qaiu.top/)或[小飞机云盘](https://www.feijipan.com)转换。直链可能失效，播放器突然不能播时，重新转换一次链接即可。

## 模板更新同步

仓库自带工作流 `.github/workflows/sync-upstream.yml`，每周二北京时间凌晨 02:17 自动从主仓库 [OUBIGFA/Freecat-Blog](https://github.com/OUBIGFA/Freecat-Blog) 同步模板文件，提交到你的 `main` 分支，平台随后自动重建。

**第一次用之前**：打开你仓库的 `Actions` 标签，按 GitHub 提示启用 workflows，并确认 Actions 权限允许写入，否则同步完成后无法自动提交。

| 范围 | 内容 |
| --- | --- |
| 会同步 | `all/`、`README.md`、`README.en.md` |
| 会保留 | `all/git-dates.json`、`all/build/font-subsets-manifest.json`、`all/src/assets/fonts/` |
| 不会动 | `Control/`、`writing/`、`.github/`、`.gitignore` |

你写的文章和网站配置不会被模板更新覆盖；改过 `all/` 里的模板、样式或构建脚本则可能被覆盖，新手别动 `all/`。

想立刻手动同步：仓库 → `Actions` → `Sync upstream template files` → `Run workflow`。上游没变化时会跳过提交；Actions 定时触发延迟几分钟属正常。

> 构建出问题时：去主仓库复制最新的 [sync-upstream](https://github.com/OUBIGFA/Freecat-Blog/blob/main/.github/workflows/sync-upstream.yml) 或 [update-git-dates.yml](https://github.com/OUBIGFA/FreeBlog_BIGFA/blob/main/.github/workflows/update-git-dates.yml) 工作流文件到你的仓库，手动运行一次。它只同步构建文件，不会覆盖你的设置和文章。想用新功能时，从主仓库 [Control 文件夹](https://github.com/OUBIGFA/Freecat-Blog/tree/main/Control) 复制对应控制参数到你仓库的 `Control/`。

## 常见问题

**要会编程吗？** 不用，日常只写 Markdown、改配置文件。

**Cloudflare 和 Vercel 选哪个？** 完全新手选 Cloudflare Pages，已在用 Vercel 的选 Vercel。内容都在 GitHub，随时能换。

**必须买域名吗？** 不用，两个平台都先给默认网址。

**部署最容易填错哪里？** 根目录填 `all`，输出目录填 `dist`，别写成 `all/dist`。

**本地改完网站没变化？** 依次检查：文件已保存 → GitHub Desktop 已 Push → 平台已触发新构建 → 浏览器强制刷新。

**`.gitignore` 怎么用？** 一份「不上传清单」：加一行如 `drafts/`，GitHub Desktop 就会自动忽略它。只对没提交过的新文件生效，已提交的文件隐藏不了。

**示例文章能删吗？** 能，删掉后提交同步即可。

**能直接改 `all/` 吗？** 新手不建议，`all/` 是模板工程目录，自动同步上游时这里的改动可能被覆盖。

## 本地预览（可选）

只写文章不需要本地构建，平台会自动处理。想在本机提前预览：装 [Node.js 20+](https://nodejs.org/)，然后：

```bash
cd all
npm install
npm run preview
```

会先完整构建，再打开 `http://127.0.0.1:4173/`。构建产物在 `all/dist/`，不用手动改，也不用提交到 GitHub。

## 许可证

本项目使用 MIT License。
