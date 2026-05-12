<div align="center">
  <img src="all/image/freecat_web_icon.png" width="120" alt="Freecat Blog Preview">
  <h1>Freecat Blog</h1>
  <p>本地写作、GitHub 备份、免费部署的个人博客模板</p>
  <p>简体中文 | <a href="README.en.md">English</a></p>
  <p>
    <img alt="Platform" src="https://img.shields.io/badge/platform-Web-2563eb">
    <img alt="Node" src="https://img.shields.io/badge/Node-20-339933">
    <img alt="Deploy" src="https://img.shields.io/badge/deploy-Cloudflare%20%7C%20Vercel-f97316">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-111827">
  </p>
  <p>
    <a href="https://freecat-blog.pages.dev">演示站点 01</a> |
    <a href="https://freecat-blog-test.pages.dev">演示站点 02</a>
  </p>
</div>

> 这是一份给零编程基础用户准备的上手文档。按顺序做完，你会得到一个可以长期写作、自动发布、免费托管的个人博客。

## 目录

- [一、Freecat Blog 是什么](#一freecat-blog-是什么)
- [二、你只需要记住三个文件夹](#二你只需要记住三个文件夹)
- [三、准备工作](#三准备工作)
- [四、快速部署](#四快速部署)
- [五、写文章和改网站](#五写文章和改网站)
- [六、日常更新流程](#六日常更新流程)
- [七、进阶功能](#七进阶功能)
- [八、模板更新同步](#八模板更新同步)
- [九、常见问题](#九常见问题)
- [许可证](#许可证)

---

## 一、Freecat Blog 是什么

Freecat Blog 是一个把本地 Markdown 文章自动发布成网站的个人博客模板。

它的工作方式很简单：

```text
本地电脑：在 writing/ 写文章，在 Control/ 改网站信息
        ↓
GitHub Desktop 同步到 GitHub
        ↓
Cloudflare Pages / Vercel 自动构建
        ↓
博客网站自动更新
```

你的文章和配置同时保存在本地电脑和 GitHub 上。Cloudflare Pages / Vercel 只负责把它们生成网页并发布，所以以后换平台也不会丢内容。

![01](all/image/Tutorial/00a.png)
![02](all/image/Tutorial/00b.png)
![03](all/image/Tutorial/00c.png)

适合这些人：

- 想拥有个人博客，但不想买服务器、不想维护后台
- 想用 Markdown、Obsidian、VS Code 等工具写文章
- 想把文章文件掌握在自己手里
- 想免费部署，并且未来还能切换平台

你能得到：

- 自动生成首页、文章页、归档页、搜索页、About 页
- 文章支持标签、封面、摘要、置顶、显示/隐藏
- 自动优化中英混排、数字单位间距、代码块、数学公式
- 文章里放音频直链即可生成播放器
- 不写代码也能改网站名、头像、社交链接和主题

---

## 二、你只需要记住三个文件夹

| 文件夹 | 是否经常改 | 作用 |
| --- | --- | --- |
| `writing/` | 要 | 放博客文章。一篇 Markdown 文件就是一篇文章 |
| `Control/` | 要 | 改网站名称、头像、首页介绍、社交链接、About 页面 |
| `all/` | 一般不要 | 网站构建工程。部署平台会进入这里运行构建命令 |

记住这句话就够：

**写文章去 `writing/`，改网站信息去 `Control/`，部署时根目录填 `all`。**

---

## 三、准备工作

| 工具 / 账号 | 是否必需 | 用途 | 地址 |
| --- | --- | --- | --- |
| GitHub 账号 | 必需 | 保存博客仓库 | <https://github.com/signup> |
| GitHub Desktop | 必需 | 把本地改动同步到 GitHub | <https://desktop.github.com/download> |
| Markdown 编辑器 | 必需 | 写文章和改配置，推荐 Obsidian | <https://obsidian.md/zh> |
| Cloudflare 账号 | 推荐 | 免费部署博客网站 | <https://dash.cloudflare.com/sign-up> |
| Vercel 账号 | 可选 | 另一种免费部署方式 | <https://vercel.com/signup> |

Cloudflare Pages 和 Vercel 二选一即可。完全新手建议先用 Cloudflare Pages。

---

## 四、快速部署

整个部署分两步：

1. 把 Freecat Blog 复制成你自己的 GitHub 仓库。
2. 把这个仓库连接到 Cloudflare Pages 或 Vercel。

### 步骤 1：创建自己的 GitHub 仓库

1. 登录 GitHub。
2. 打开 <https://github.com/new/import>。
3. 按下表填写：

| 字段 | 填写值 |
| --- | --- |
| `Your old repository's clone URL` | `https://github.com/OUBIGFA/Freecat-Blog` |
| `Owner` | 你的 GitHub 账号 |
| `Repository name` | 自己起一个仓库名，例如 `my-freecat-blog` |
| `Privacy` | 建议选 `Private` |

4. 点击 `Begin import`，等待导入完成。
5. 打开 GitHub Desktop，点击 `File` → `Clone repository`。
6. 选择刚导入的仓库，下载到你的电脑。

![GitHub Desktop clone](all/image/Tutorial/10.png)

导入完成后，你电脑上就有一个完整的 Freecat Blog 项目文件夹。

### 步骤 2：部署到 Cloudflare Pages

Cloudflare Pages 是推荐方案。关键是构建参数要填对。

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 创建应用程序。

![Cloudflare step 1](all/image/Tutorial/01.png)

3. 选择 Pages。

![Cloudflare step 2](all/image/Tutorial/02.png)

4. 选择「导入现有 Git 仓库」。

![Cloudflare step 3](all/image/Tutorial/03.png)

5. 选择你自己的博客仓库。

![Cloudflare step 4](all/image/Tutorial/04.png)

6. 按下表填写构建参数：

| Cloudflare 中文界面 | Cloudflare English UI | 填写值 |
| --- | --- | --- |
| 框架预设 | Framework preset | `None` / `无` / 不选预设 |
| 根目录（高级） | Root directory (advanced) > Path | `all` |
| 构建命令 | Build command | `npm run build` |
| 构建输出目录 | Build output directory | `dist` |
| 环境变量（建议填写） | Environment variables | `NODE_VERSION` = `20` |

![Cloudflare step 5](all/image/Tutorial/05.png)

> 最常见错误：输出目录填 `dist`，不要填 `all/dist`。因为根目录已经切到 `all` 了。

7. 点击 `Save and Deploy`，等待 1-3 分钟。
8. 构建完成后，打开 Cloudflare 给出的默认网址，例如 `xxx.pages.dev`。

![Cloudflare step 6](all/image/Tutorial/06.png)

如果想使用自己的域名，可以在 Cloudflare Pages 项目中绑定自定义域名。

- 免费域名教程：[免费域名申请指南](https://blog.freeorg.dpdns.org/posts/%E5%85%8D%E8%B4%B9%E5%9F%9F%E5%90%8D%E7%94%B3%E8%AF%B7%E6%8C%87%E5%8D%97.html)
- DNSHE 自动续期项目：<https://github.com/OUBIGFA/dnshe-auto-renew>

### 备选：部署到 Vercel

如果你已经在用 Vercel，也可以直接选择它。

1. 登录 [Vercel](https://vercel.com/)。
2. 点击 `Add New...` → `Project`。
3. 连接 GitHub，选择你的博客仓库。
4. 按下表填写：

| 字段 | 填写值 |
| --- | --- |
| Framework Preset | 保持默认，或选择静态/其他类型 |
| Root Directory | `all` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | `20` |

5. 点击 `Deploy`。

绑定自定义域名时，进入项目设置里的 `Domains`，按提示配置解析即可。

---

## 五、写文章和改网站

### 写文章：使用 `writing/`

`writing/` 是你最常用的文件夹。每一篇 `.md` 文件就是一篇文章。

项目自带了几篇示例文章。你可以打开学习格式，也可以复制成模板或删除。

新文章开头通常这样写：

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
| `title` | 文章标题，留空则使用文件名 | `我的第一篇文章` |
| `date` | 发布日期 | `2026-01-01` |
| `tag` | 文章标签，可以写多个 | `- 随笔` |
| `cover` | 封面图片链接，留空则没有封面 | `https://...` |
| `show_cover` | 是否在文章页显示封面 | `true` / `false` |
| `show_image_captions` | 是否显示图片说明文字 | `true` / `false` |
| `description` | 文章摘要，留空会自动截取 | `一段简短介绍` |
| `pinned` | 是否置顶 | `true` / `false` |
| `show` | 是否在网站上展示 | `true` / `false` |

### 插入音频播放器

在文章中使用引用格式加音频直链，可以自动生成播放器：

```md
>[这是示例音频](https://example.com/audio.m4a)
```

如果链接没有明显音频后缀，可以在标题里加音乐符号强制识别：

```md
>[🎵这是示例音频](https://example.com/audio)
```

支持格式：`.mp3`、`.m4a`、`.wav`、`.ogg`、`.aac`、`.flac`、`.opus`。

### 改网站：使用 `Control/`

`Control/` 是网站控制台。想把模板改成自己的博客，重点改这里。

| 文件 | 负责什么 |
| --- | --- |
| `site_网站属性.md` | 网站标题、站点名、首页介绍、头像、主题 |
| `SEO_搜索优化.md` | 正式域名、SEO 摘要、作者信息、AI 爬虫和 llms.txt |
| `social_社交媒体.md` | 社交媒体图标、主页链接、联系方式、推广链接 |
| `about_关于页面.md` | About 页面的标题、介绍和头像 |

编辑时记住 4 点：

- 冒号后面保留一个空格，例如 `site_name: FreeCat`
- 不想填的字段可以留空，但不要删掉整行
- `_01`、`_02` 这类下划线开头的行是说明文字，不要改字段名
- 改完必须用 GitHub Desktop 提交并同步，线上网站才会更新

---

## 六、日常更新流程

部署成功后，以后写文章、改网站只需要这 5 步：

1. 在 `writing/` 里新增或修改文章。
2. 如果需要，在 `Control/` 里修改网站信息。
3. 保存文件。
4. 打开 GitHub Desktop，写一句提交说明，点击 `Commit to main`。
5. 点击 `Push origin`。

![GitHub Desktop commit](all/image/Tutorial/08.png)

![GitHub Desktop push](all/image/Tutorial/09.png)

同步成功后，Cloudflare Pages 或 Vercel 会自动重新构建。等 1-3 分钟刷新网站即可看到新内容。

---

## 七、进阶功能

### 配合 Obsidian 写作

你可以直接用 Obsidian 打开这个博客仓库，并在 `writing/` 目录下写文章。

好处：

- 文章都在本地，方便管理
- 可以使用 Obsidian 的双链、标签、搜索
- 写完后用 GitHub Desktop 同步，网站自动发布

### 本地预览和构建

如果你只想写文章和部署，不需要在本地构建，部署平台会自动处理。

如果想在电脑上提前检查网站，需要先安装 [Node.js 20+](https://nodejs.org/)，然后：

```bash
cd all
npm install
npm run build
```

构建产物在 `all/dist/`，不需要手动修改，也不需要提交到 GitHub。

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
│   └── dist/               # 构建产物，本地生成，不需要手动改
├── README.md
└── README.en.md
```

---

## 八、模板更新同步

Freecat Blog 会继续修 bug、加功能、优化样式。仓库自带一个 GitHub Actions 工作流：

`.github/workflows/sync-upstream.yml`

它会在每周二北京时间凌晨 02:17 自动从主仓库 [OUBIGFA/Freecat-Blog](https://github.com/OUBIGFA/Freecat-Blog) 同步模板文件，然后提交到你的 `main` 分支。Cloudflare Pages / Vercel 会跟着自动重新构建。

同步范围：

- 会同步：`all/`、`README.md`、`README.en.md`
- 会保留：`all/git-dates.json`
- 不会动：`Control/`、`writing/`、`.github/`、`.gitignore`

也就是说，你自己的文章和网站配置不会被模板更新覆盖。

如果想立刻同步一次：

1. 打开你的 GitHub 仓库。
2. 点击顶部 `Actions`。
3. 左侧选择 `Sync upstream template files`。
4. 右上角点击 `Run workflow` → `Run workflow`。

注意：

- 如果上游模板文件没有变化，工作流会跳过提交，不会产生空提交。
- 第一次打开 `Actions` 标签时，如果 GitHub 提示需要启用工作流，按提示确认即可。
- 如果你改过 `all/` 里的模板、样式或构建脚本，自动同步可能覆盖这些改动。新手通常不需要改 `all/`。

---

## 九、常见问题

**Q：我必须会编程吗？**

不用。日常只需要写 Markdown 文章和改配置文件。

**Q：我主要应该改哪些地方？**

写文章改 `writing/`，改网站信息改 `Control/`。新手一般不要改 `all/`。

**Q：必须买域名吗？**

不用。Cloudflare Pages 和 Vercel 都会先提供默认网址。

**Q：Cloudflare Pages 和 Vercel 选哪个？**

完全新手推荐 Cloudflare Pages。已经在用 Vercel 的用户可以选 Vercel。内容都在 GitHub，以后可以迁移。

**Q：部署时最容易填错哪里？**

`Root Directory` 必须是 `all`，`Output Directory` 必须是 `dist`，不要写成 `all/dist`。

**Q：本地改完后网站没变化怎么办？**

按顺序检查：文件是否保存 → GitHub Desktop 是否已经 Push → Cloudflare Pages / Vercel 是否触发新构建 → 浏览器是否需要强制刷新。

**Q：可以把示例文章删掉吗？**

可以。示例文章都在 `writing/` 里，删除后提交同步即可。

---

## 许可证

本项目使用 MIT License。
