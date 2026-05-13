<div>![Freecat Blog Preview](all/image/freecat_web_icon.png)   

# Freecat Blog

本地写作、GitHub 备份、免费部署的个人博客模板

简体中文 | [English](README.en.md)

     ![Platform](https://img.shields.io/badge/platform-Web-2563eb)     ![Node](https://img.shields.io/badge/Node-20-339933)     ![Deploy](https://img.shields.io/badge/deploy-Cloudflare%20%7C%20Vercel-f97316)     ![License](https://img.shields.io/badge/license-MIT-111827)   

     [演示站点 01](https://freecat-blog.pages.dev) |     [演示站点 02](https://freecat-blog-test.pages.dev)   

</div>

> 一份写给零编程基础用户的上手文档。按顺序做完，你会得到一个能长期写作、自动发布、免费托管的个人博客。

## 最短部署路径预览

1. 用 GitHub Importer 创建自己的私人博客仓库
2. 用 GitHub Desktop 拉到本地
3. 本地打开项目，写一篇文章
4. 提交并同步到 GitHub
5. 去 Cloudflare Pages 或 Vercel 导入仓库构建
6. 等部署完成，打开默认网址确认

### 就这三件事

- 内容在本地，不锁死在任何平台。
- GitHub 负责备份，顺便通知部署平台更新。
- 部署平台只管生成网站，不是你的写作后台。

## 目录

- [一、Freecat Blog 是什么](#%E4%B8%80freecat-blog-%E6%98%AF%E4%BB%80%E4%B9%88)
- [二、你只需要记住三个文件夹](#%E4%BA%8C%E4%BD%A0%E5%8F%AA%E9%9C%80%E8%A6%81%E8%AE%B0%E4%BD%8F%E4%B8%89%E4%B8%AA%E6%96%87%E4%BB%B6%E5%A4%B9)
- [三、准备工作](#%E4%B8%89%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C)
- [四、快速部署](#%E5%9B%9B%E5%BF%AB%E9%80%9F%E9%83%A8%E7%BD%B2)
- [五、写文章和改网站](#%E4%BA%94%E5%86%99%E6%96%87%E7%AB%A0%E5%92%8C%E6%94%B9%E7%BD%91%E7%AB%99)
- [六、日常更新流程](#%E5%85%AD%E6%97%A5%E5%B8%B8%E6%9B%B4%E6%96%B0%E6%B5%81%E7%A8%8B)
- [七、进阶功能](#%E4%B8%83%E8%BF%9B%E9%98%B6%E5%8A%9F%E8%83%BD)
- [八、模板更新同步](#%E5%85%AB%E6%A8%A1%E6%9D%BF%E6%9B%B4%E6%96%B0%E5%90%8C%E6%AD%A5)
- [九、常见问题](#%E4%B9%9D%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)
- [许可证](#%E8%AE%B8%E5%8F%AF%E8%AF%81)

---

## 一、Freecat Blog 是什么

Freecat Blog 是一个把本地 Markdown 文章自动发布成网站的个人博客模板。

工作方式是这样：

```text
本地电脑：在 writing/ 写文章，在 Control/ 改网站信息
        ↓
GitHub Desktop 同步到 GitHub
        ↓
Cloudflare Pages / Vercel 自动构建
        ↓
博客网站自动更新
```

文章和配置同时存在本地和 GitHub 上，Cloudflare Pages / Vercel 只负责生成网页并发布，所以以后换平台也不会丢内容。

![01](all/image/Tutorial/00a.png)
![02](all/image/Tutorial/00b.png)
![03](all/image/Tutorial/00c.png)

适合这样几类人：

- 想拥有个人博客，但不想买服务器、不想维护后台
- 想用 Markdown、Obsidian、VS Code 等工具写文章
- 想把文章文件掌握在自己手里
- 想免费部署，未来还能切换平台

你会拿到这些功能：

- 自动生成首页、文章页、归档页、搜索页、About 页
- 文章支持标签、封面、摘要、置顶、显示/隐藏
- 自动优化中英混排、数字单位间距、代码块、数学公式
- 文章里放音频直链就能自动生成播放器
- 不写代码就能改网站名、头像、社交链接和主题

---

## 二、你只需要记住三个文件夹

| 文件夹 | 是否经常改 | 作用 |
| --- | --- | --- |
| `writing/` | 要 | 放博客文章。一篇 Markdown 文件就是一篇文章 |
| `Control/` | 要 | 改网站名称、头像、首页介绍、社交链接、About 页面 |
| `all/` | 一般不要 | 网站构建工程。部署平台会进入这里运行构建命令 |

记住这一句就够。

**写文章去** `writing/`，改网站信息去 `Control/`，部署时根目录填 `all`。

---

## 三、准备工作

| 工具 / 账号 | 是否必需 | 用途 | 地址 |
| --- | --- | --- | --- |
| GitHub 账号 | 必需 | 保存博客仓库 | <https://github.com/signup> |
| GitHub Desktop | 必需 | 把本地改动同步到 GitHub | <https://desktop.github.com/download> |
| Markdown 编辑器 | 必需 | 写文章和改配置，推荐 Obsidian | <https://obsidian.md/zh> |
| Cloudflare 账号 | 推荐 | 免费部署博客网站 | <https://dash.cloudflare.com/sign-up> |
| Vercel 账号 | 可选 | 另一种免费部署方式 | <https://vercel.com/signup> |

Cloudflare Pages 和 Vercel 二选一就行。完全新手先用 Cloudflare Pages。

---

## 四、快速部署

整个部署分两步。

1. 把 Freecat Blog 复制成你自己的 GitHub 仓库。
2. 把这个仓库连接到 Cloudflare Pages 或 Vercel。

### 步骤 1：创建自己的 GitHub 仓库

1. 登录 GitHub。
2. 打开 <https://github.com/new/import>。
3. 按下表填写各项。

| 字段 | 填写值 |
| --- | --- |
| `Your old repository's clone URL` | `https://github.com/OUBIGFA/Freecat-Blog` |
| `Owner` | 你的 GitHub 账号 |
| `Repository name` | 自己起一个仓库名，例如 `my-freecat-blog` |
| `Privacy` | 选 `Private` |

1. 点 `Begin import`，等导入完成。
2. 打开 GitHub Desktop，点 `File` → `Clone repository`。
3. 选刚导入的仓库，下载到本地。

![GitHub Desktop clone](all/image/Tutorial/10.png)

导入完成后，电脑上就有一个完整的 Freecat Blog 项目文件夹。

### 步骤 2：部署到 Cloudflare Pages

Cloudflare Pages 是推荐方案，构建参数要填对。

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 创建应用程序。

![Cloudflare step 1](all/image/Tutorial/01.png)

1. 选 Pages。

![Cloudflare step 2](all/image/Tutorial/02.png)

1. 选「导入现有 Git 仓库」。

![Cloudflare step 3](all/image/Tutorial/03.png)

1. 选你自己的博客仓库。

![Cloudflare step 4](all/image/Tutorial/04.png)

1. 按下表填写构建参数。

| Cloudflare 中文界面 | Cloudflare English UI | 填写值 |
| --- | --- | --- |
| 框架预设 | Framework preset | `None` / `无` / 不选预设 |
| 根目录（高级） | Root directory (advanced) > Path | `all` |
| 构建命令 | Build command | `npm run build` |
| 构建输出目录 | Build output directory | `dist` |
| 环境变量（建议填写） | Environment variables | `NODE_VERSION` = `20` |

![Cloudflare step 5](all/image/Tutorial/05.png)

> 最常踩的坑是输出目录写成 `all/dist`。正确写 `dist`，因为根目录已经切到 `all` 了。

1. 点 `Save and Deploy`，等 1-3 分钟。
2. 构建完成后，打开 Cloudflare 给的默认网址，例如 `xxx.pages.dev`。

![Cloudflare step 6](all/image/Tutorial/06.png)

想用自己的域名，在 Cloudflare Pages 项目里绑定自定义域名就行。

- 免费域名教程：[免费域名申请指南](https://blog.freeorg.dpdns.org/posts/%E5%85%8D%E8%B4%B9%E5%9F%9F%E5%90%8D%E7%94%B3%E8%AF%B7%E6%8C%87%E5%8D%97.html)
- DNSHE 自动续期项目：<https://github.com/OUBIGFA/dnshe-auto-renew>

### 备选：部署到 Vercel

已经在用 Vercel 的，可以直接选它。

1. 登录 [Vercel](https://vercel.com/)。
2. 点 `Add New...` → `Project`。
3. 连接 GitHub，选你的博客仓库。
4. 按下表填写。

| 字段 | 填写值 |
| --- | --- |
| Framework Preset | 保持默认，或选择静态/其他类型 |
| Root Directory | `all` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | `20` |

1. 点 `Deploy`。

绑定自定义域名时，进项目设置里的 `Domains`，按提示改解析即可。

---

## 五、写文章和改网站

### 写文章：使用 `writing/`

`writing/` 是日常用得最多的文件夹，一个 `.md` 文件就是一篇文章。

项目自带几篇示例文章，可以打开看格式、复制成模板，也可以删掉。

新文章开头通常长这样。

```md
---
title: 我的第一篇文章
date: 2026-01-01
tag:
  - 随笔
cover:
show_cover: false
show_image_captions: true
description:
pinned: false
show: true
---

这里开始写正文。
```

常用字段：

| 字段 | 作用 | 例子 |
| --- | --- | --- |
| `title` | 文章标题，留空则用文件名 | `我的第一篇文章` |
| `date` | 发布日期 | `2026-01-01` |
| `tag` | 文章标签，可以写多个 | `- 随笔` |
| `cover` | 封面图片链接，留空则没有封面 | `https://...` |
| `show_cover` | 是否在文章页显示封面 | `true` / `false` |
| `show_image_captions` | 是否显示图片说明文字 | `true` / `false` |
| `description` | 文章摘要，留空会自动截取 | `一段简短介绍` |
| `pinned` | 是否置顶 | `true` / `false` |
| `show` | 是否在网站上展示 | `true` / `false` |

### 插入音频播放器

在文章里用引用格式 + 音频直链，会自动生成播放器。

```md
>[这是示例音频](https://example.com/audio.m4a)
```

链接没有明显音频后缀的话，在标题里加音乐符号强制识别。

```md
>[🎵这是示例音频](https://example.com/audio)
```

支持格式：`.mp3`、`.m4a`、`.wav`、`.ogg`、`.aac`、`.flac`、`.opus`。

### 改网站：使用 `Control/`

`Control/` 是网站控制台。想把模板改成自己的博客，主要改这里。

| 文件 | 负责什么 |
| --- | --- |
| `site_网站属性.md` | 网站标题、站点名、首页介绍、头像、主题 |
| `SEO_搜索优化.md` | 正式域名、SEO 摘要、作者信息、AI 爬虫和 llms.txt |
| `social_社交媒体.md` | 社交媒体图标、主页链接、联系方式、推广链接 |
| `about_关于页面.md` | About 页面的标题、介绍和头像 |

编辑时记住四点：

- 冒号后面留一个空格，比如 `site_name: FreeCat`
- 不想填的字段可以留空，但别删整行
- `_01`、`_02` 这类下划线开头的行是说明文字，别改字段名
- 改完必须用 GitHub Desktop 提交并同步，线上网站才会更新

---

## 六、日常更新流程

部署成功后，以后写文章、改网站只要这 5 步。

1. 在 `writing/` 里新增或修改文章。
2. 需要的话，在 `Control/` 里修改网站信息。
3. 保存文件。
4. 打开 GitHub Desktop，写一句提交说明，点 `Commit to main`。
5. 点 `Push origin`。

![GitHub Desktop commit](all/image/Tutorial/08.png)

![GitHub Desktop push](all/image/Tutorial/09.png)

同步成功后，Cloudflare Pages 或 Vercel 会自动重新构建。等 1-3 分钟刷新网站，就能看到新内容。

---

## 七、进阶功能

### 配合 Obsidian 写作

可以用 Obsidian 直接打开这个博客仓库，在 `writing/` 目录里写文章。

几个好处：

- 文章都在本地，方便管理
- 可以用上 Obsidian 的双链、标签、搜索
- 写完后用 GitHub Desktop 同步，网站自动发布

### 本地预览和构建

只是写文章和部署的话，不用本地构建，平台会自动处理。

想在本机提前预览网站，先装 [Node.js 20+](https://nodejs.org/)，然后跑这几个命令：

```bash
cd all
npm install
npm run build
```

构建产物在 `all/dist/`，不用手动改，也不用提交到 GitHub。

### 项目结构

```text
Freecat-Blog/
├── Control/                # 网站基础配置，新手主要改这里
│   ├── site_网站属性.md
│   ├── SEO_搜索优化.md
│   ├── social_社交媒体.md
│   └── about_关于页面.md
├── writing/                # 文章 Markdown 源文件，新手主要写这里
├── all/                    # 构建工程目录，部署平台进入这里构建
│   ├── src/                # 页面模板
│   ├── image/              # 图片资源
│   ├── build/              # 构建辅助脚本
│   ├── build.js            # 主构建脚本
│   ├── package.json        # 构建依赖和命令
│   └── dist/               # 构建产物，本地生成，不用手动改
├── README.md
└── README.en.md
```

---

## 八、模板更新同步

Freecat Blog 会持续修 bug、加功能、优化样式。仓库自带一个 GitHub Actions 工作流：`.github/workflows/sync-upstream.yml`。

每周二北京时间凌晨 02:17，它会自动从主仓库 [OUBIGFA/Freecat-Blog](https://github.com/OUBIGFA/Freecat-Blog) 同步模板文件，提交到你的 `main` 分支。Cloudflare Pages / Vercel 会跟着自动重建。

同步范围：

- 会同步：`all/`、`README.md`、`README.en.md`
- 会保留：`all/git-dates.json`
- 不会动：`Control/`、`writing/`、`.github/`、`.gitignore`

也就是说，你写的文章和网站配置不会被模板更新覆盖。

想立刻手动触发一次同步：

1. 打开你的 GitHub 仓库。
2. 点顶部 `Actions`。
3. 左侧选 `Sync upstream template files`。
4. 右上角点 `Run workflow` → `Run workflow`。

几个细节：

- 上游模板没变化时，工作流会跳过提交，不会产生空提交。
- 第一次打开 `Actions` 标签，GitHub 可能提示要启用工作流，按提示确认即可。
- 改过 `all/` 里的模板、样式或构建脚本的话，自动同步可能覆盖这些改动。新手通常别动 `all/`。

---

## 九、常见问题

**Q：我必须会编程吗？**

不用。日常只要写 Markdown 文章和改配置文件。

**Q：我主要应该改哪些地方？**

写文章改 `writing/`，改网站信息改 `Control/`。新手一般别动 `all/`。

**Q：必须买域名吗？**

不用。Cloudflare Pages 和 Vercel 都会先给一个默认网址。

**Q：Cloudflare Pages 和 Vercel 选哪个？**

完全新手选 Cloudflare Pages，已经在用 Vercel 的选 Vercel。内容都在 GitHub 上，以后想换平台也容易。

**Q：部署时最容易填错哪里？**

`Root Directory` 必须是 `all`，`Output Directory` 必须是 `dist`，别写成 `all/dist`。

**Q：本地改完后网站没变化怎么办？**

按顺序检查：文件是否保存 → GitHub Desktop 是否已经 Push → Cloudflare Pages / Vercel 是否触发新构建 → 浏览器是否需要强制刷新。

**Q：可以把示例文章删掉吗？**

可以。示例都在 `writing/` 里，删掉后提交同步就行。

---

## 许可证

本项目使用 MIT License。

