<div align="center">
  <img src="all/image/freecat_web_icon.png" width="120" alt="Freecat Blog Preview">
  <h1>Freecat Blog</h1>
  <p>本地写作、GitHub 备份、免费部署的个人博客模板</p>
  <p>
    简体中文 | <a href="README.en.md">English</a>
  </p>
  <p>
    <img alt="Platform" src="https://img.shields.io/badge/platform-Web-2563eb">
    <img alt="Node" src="https://img.shields.io/badge/Node-20-339933">
    <img alt="Deploy" src="https://img.shields.io/badge/deploy-Cloudflare%20%7C%20Vercel-f97316">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-111827">
  </p>
  <p>
    <a href="https://freecat-blog.pages.dev">演示站点</a>
  </p>
</div>

> 这是一份给完全没有编程基础的用户写的教程。**从上往下读，跟着每一步做，就能拥有自己的免费博客。**

## 目录

- [一、这个项目是什么](#%E4%B8%80%E8%BF%99%E4%B8%AA%E9%A1%B9%E7%9B%AE%E6%98%AF%E4%BB%80%E4%B9%88)
- [二、三个最重要的文件夹](#%E4%BA%8C%E4%B8%89%E4%B8%AA%E6%9C%80%E9%87%8D%E8%A6%81%E7%9A%84%E6%96%87%E4%BB%B6%E5%A4%B9)
- [三、准备工作](#%E4%B8%89%E5%87%86%E5%A4%87%E5%B7%A5%E4%BD%9C)
- [四、部署教程：把你的博客挂到网上](#%E5%9B%9B%E9%83%A8%E7%BD%B2%E6%95%99%E7%A8%8B%E6%8A%8A%E4%BD%A0%E7%9A%84%E5%8D%9A%E5%AE%A2%E6%8C%82%E5%88%B0%E7%BD%91%E4%B8%8A)
  - [步骤 1：把项目变成你自己的 GitHub 仓库](#%E6%AD%A5%E9%AA%A4-1%E6%8A%8A%E9%A1%B9%E7%9B%AE%E5%8F%98%E6%88%90%E4%BD%A0%E8%87%AA%E5%B7%B1%E7%9A%84-github-%E4%BB%93%E5%BA%93)
  - [步骤 2：部署到 Cloudflare Pages（推荐）](#%E6%AD%A5%E9%AA%A4-2%E9%83%A8%E7%BD%B2%E5%88%B0-cloudflare-pages%E6%8E%A8%E8%8D%90)
  - [步骤 2 备选：部署到 Vercel](#%E6%AD%A5%E9%AA%A4-2-%E5%A4%87%E9%80%89%E9%83%A8%E7%BD%B2%E5%88%B0-vercel)
- [五、写文章教程：使用 ](#%E4%BA%94%E5%86%99%E6%96%87%E7%AB%A0%E6%95%99%E7%A8%8B%E4%BD%BF%E7%94%A8-writing)`writing/`
- [六、个性化网站：使用 ](#%E5%85%AD%E4%B8%AA%E6%80%A7%E5%8C%96%E7%BD%91%E7%AB%99%E4%BD%BF%E7%94%A8-control)`Control/`
- [七、日常更新博客的 5 个步骤](#%E4%B8%83%E6%97%A5%E5%B8%B8%E6%9B%B4%E6%96%B0%E5%8D%9A%E5%AE%A2%E7%9A%84-5-%E4%B8%AA%E6%AD%A5%E9%AA%A4)
- [八、进阶功能](#%E5%85%AB%E8%BF%9B%E9%98%B6%E5%8A%9F%E8%83%BD)
- [九、常见问题](#%E4%B9%9D%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)
- [许可证](#%E8%AE%B8%E5%8F%AF%E8%AF%81)

---

## 一、这个项目是什么

Freecat Blog 是一个给普通用户准备的个人博客模板。

**一句话总结：把你电脑里的 Markdown 文章自动变成一个免费的网站。**

### 它是怎么工作的

```text
你的电脑：在 writing/ 里写文章 + 在 Control/ 里改网站设置
            ↓
GitHub Desktop 一键同步到 GitHub
            ↓
Cloudflare Pages / Vercel 自动构建
            ↓
你的博客网站自动更新发布
```

你的内容同时保存在**本地电脑**和 **GitHub** 上，部署平台只是帮你把文章生成网页。即使哪天换平台，文章也都还在你自己手里。

![01](all/image/Tutorial/00a.png)
![02](all/image/Tutorial/00b.png)
![03](all/image/Tutorial/00c.png)

### 适合谁

- 想拥有个人博客，但不想买服务器、不想维护后台的人
- 想用 Markdown 写文章的人
- 想把文章文件掌握在自己手里的人
- 想免费部署、未来还能换平台的人
- 想用 Obsidian、VS Code 等任意 Markdown 编辑器写作的人

### 你能得到什么

- 自动生成的首页、文章页、归档页、搜索页、About 页
- 文章支持标签、封面、摘要、置顶、是否展示等字段
- 自动优化中英混排、数字单位间距、代码块、数学公式
- 文章里贴一个音频直链就能生成播放器
- 不用写代码就能改网站名、头像、社交链接

---

## 二、三个最重要的文件夹

整个项目你只需要记住三个文件夹：

| 文件夹 | 你要不要经常改 | 作用 |
| --- | --- | --- |
| `writing/` | **要** | 放你的博客文章，一篇 Markdown 文件就是一篇文章 |
| `Control/` | **要** | 改网站名称、头像、首页介绍、社交链接、About 页面 |
| `all/` | 一般不要 | 网站构建工程，部署平台会进入这里运行构建命令 |

记住这句话：**写文章去** `writing/`，改网站信息去 `Control/`，部署时构建目录填 `all`。

---

## 三、准备工作

开始前只需要这些工具和账号：

| 工具 / 账号 | 是否必需 | 用途 | 获取地址 |
| --- | --- | --- | --- |
| GitHub 账号 | 必需 | 保存你的博客仓库 | <https://github.com/signup> |
| GitHub Desktop | 必需 | 把本地改动同步到 GitHub | <https://desktop.github.com/download> |
| Cloudflare 账号 | 推荐 | 部署博客网站（免费） | <https://dash.cloudflare.com/sign-up> |
| Vercel 账号 | 可选 | 另一种免费部署方式 | <https://vercel.com/signup> |

> Cloudflare Pages 和 Vercel **二选一即可**。完全新手建议先用 Cloudflare Pages。

准备好以上工具，就可以进入下一步部署。

---

## 四、部署教程：把你的博客挂到网上

整个部署只需要两步：**先把项目变成你自己的 GitHub 仓库 → 再连接 Cloudflare/Vercel 自动部署。**

### 步骤 1：把项目变成你自己的 GitHub 仓库

你需要先把 Freecat Blog 复制到你自己的 GitHub 账号下面。**强烈推荐使用「路线 A：GitHub Importer」**——只要 3 个小步骤，比 ZIP 路线还省事，搭出来的仓库还能让自动同步工作流跑得更顺。

| 路线 | 推荐程度 | 适合谁 |
| --- | --- | --- |
| **🌟 路线 A：GitHub Importer 导入** | **强烈推荐** | 所有人。3 步搞定，全程在浏览器和 GitHub Desktop 里点点鼠标 |
| 路线 B：下载 ZIP + 复制粘贴 | 仅备选 | Importer 因网络/账号原因打不开的人 |

> **两条路线只选一条。** 默认走路线 A，遇到打不开 Importer 页面再考虑路线 B。

#### 🌟 路线 A：GitHub Importer 导入（推荐）

**A-1. 打开 GitHub Importer**

1. 登录 GitHub。
2. 打开：<https://github.com/new/import>

**A-2. 填写导入信息**

| 字段 | 填什么 |
| --- | --- |
| `Your old repository's clone URL` | `https://github.com/OUBIGFA/Freecat-Blog` |
| `Owner` | 你的 GitHub 账号 |
| `Repository name` | 你的仓库名，例如 `my-freecat-blog` |
| `Privacy` | 建议选 `Private` |

然后点击 `Begin import`，通常几十秒到几分钟会完成。

**A-3. 用 GitHub Desktop 把仓库下载到本地**

1. 打开 GitHub Desktop 并登录。
2. 点击 `File` → `Clone repository`。
3. 选择你刚导入的仓库。
4. 选择一个本地保存位置。
5. 点击 `Clone`。

完成后，你电脑上就有一个完整的博客项目文件夹了。**跳到下面的「步骤 2」继续部署。**

<details>
<summary><b>📦 路线 B：下载 ZIP + 复制粘贴（仅在 Importer 打不开时使用） — 点击展开</b></summary>

<br>

> 提示：路线 B 步骤更多、更容易出错。除非 `https://github.com/new/import` 在你的网络环境下打不开，否则建议优先走路线 A。

**B-1. 新建你自己的 GitHub 仓库**

1. 打开：<https://github.com/new>
2. 仓库名写 `my-freecat-blog`。
3. 可见性选 `Private`。
4. 勾选 `Add a README file`。
5. 点击 `Create repository`。

**B-2. 下载 Freecat Blog 源码**

1. 打开原项目：<https://github.com/OUBIGFA/Freecat-Blog>
2. 点击 `Code` → `Download ZIP`。
3. 解压下载好的 ZIP。

**B-3. 把你的仓库下载到本地**

1. 打开 GitHub Desktop。
2. 选择你刚新建的仓库。
3. 点击 `Clone` 下载到本地。

**B-4. 复制源码到你的仓库**

1. 打开刚解压出来的 Freecat Blog 文件夹。
2. 进入真正放源码的那一层目录。
3. 复制里面的全部内容。
4. 粘贴到 GitHub Desktop 下载下来的本地仓库文件夹里。
5. 如果提示替换 `README.md`，选择替换。

> **注意：不要把最外层整个文件夹丢进去。** 正确结果是：你的仓库根目录里能直接看到 `all/`、`Control/`、`writing/`、`README.md`。

![10](all/image/Tutorial/10.png)

**B-5. 第一次同步到 GitHub**

1. 回到 GitHub Desktop。
2. 左侧会看到很多新增文件。
3. 提交说明写 `Import Freecat Blog source`。
4. 点击 `Commit to main`。
5. 点击 `Push origin`。

完成后你的 GitHub 仓库里就有了完整的 Freecat Blog 源码。**继续看「步骤 2」。**

</details>

### 步骤 2：部署到 Cloudflare Pages（推荐）

Cloudflare Pages 适合长期稳定运行个人博客。**部署的关键就是填对构建参数。**

**2-1. 进入 Cloudflare Pages**

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 创建应用程序。

![Cloudflare step 1](all/image/Tutorial/01.png)

1. 选择 Pages。

![Cloudflare step 2](all/image/Tutorial/02.png)

1. 选择「导入现有 Git 仓库」。

![Cloudflare step 3](all/image/Tutorial/03.png)

1. 选择你自己的博客仓库。

![Cloudflare step 4](all/image/Tutorial/04.png)

**2-2. 填写构建参数（最关键的一步）**

项目名称可以自由填写。**关键参数严格按下表填写**：

| Cloudflare 中文界面 | Cloudflare English UI | 填写值 |
| --- | --- | --- |
| 框架预设 | Framework preset | `None` / `无` / 不选预设 |
| 根目录（高级） | Root directory (advanced) > Path | `all` |
| 构建命令 | Build command | `npm run build` |
| 构建输出目录 | Build output directory | `dist` |
| 环境变量（选填） | Environment variables | `NODE_VERSION` = `20` |

![Cloudflare step 5](all/image/Tutorial/05.png)

> **常见错误：** `Output directory` 要填 `dist`，**不是** `all/dist`。因为你已经把根目录设成 `all` 了。

然后点击 `Save and Deploy（保存并部署）`，等待构建完成（一般 1–3 分钟）。

**2-3. 访问你的博客**

![Cloudflare step 6](all/image/Tutorial/06.png)

构建完成后，Cloudflare 会给你一个默认网址（类似 `xxx.pages.dev`），打开就能看到自己的博客了 🎉

如果想用自己的域名，可以在 Cloudflare Pages 项目里绑定自定义域名。

- 免费域名教程：[https://blog.freeorg.dpdns.org/posts/免费域名申请指南.html](https://blog.freeorg.dpdns.org/posts/%E5%85%8D%E8%B4%B9%E5%9F%9F%E5%90%8D%E7%94%B3%E8%AF%B7%E6%8C%87%E5%8D%97.html)
- DNSHE 自动续期项目：<https://github.com/OUBIGFA/dnshe-auto-renew>

### 步骤 2 备选：部署到 Vercel

如果你已经在用 Vercel，也可以选这条路。

1. 登录 [Vercel](https://vercel.com/)。
2. 点击 `Add New...` → `Project`。
3. 连接 GitHub，选择你的博客仓库。
4. 按下表填写：

| 字段 | 填写值 |
| --- | --- |
| Framework Preset | 保持默认或选静态构建 |
| Root Directory | `all` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | `20` |

1. 点击 `Deploy`。

绑定自定义域名时，进入项目设置里的 `Domains`，按提示配置解析即可。

---

## 五、写文章教程：使用 `writing/`

部署成功后，你就可以开始写文章了。`writing/` 是你最常用的文件夹，**每一篇 Markdown 文件就是一篇文章**。

项目自带了几篇示例文章。你可以：

- 打开它们学习格式
- 复制一份当模板
- 删除不需要的示例文章
- 新建自己的 `.md` 文件

### 文章模板

新建一个 `.md` 文件，开头（元数据）照下面这样写：

```md
---
title: 这是示例标题
date: 2026-01-01
tag:
  - 随笔
cover: https://XXXXX.com
show_cover: false
show_image_captions: false
description:
pinned: false
show: true
---

这里开始写正文。
```

### 文章字段说明

文件最上方 `---` 包起来的部分叫「Front Matter」，是给系统看的配置。下面是常用字段：

| 字段 | 作用 | 例子 |
| --- | --- | --- |
| `title` | 文章标题，留空则以文件名称为标题 | `我的第一篇文章` |
| `date` | 发布日期 | `2026-01-01` |
| `tag` | 文章标签，可以写多个 | <span style="color: rgb(36, 41, 47); background: rgba(0, 0, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box; font-size: 14.4px; font-weight: 400; font-family: Menlo, Monaco, &quot;Courier New&quot;, monospace; line-height: 18.72px; text-align: start; border-left: 0px none rgb(36, 41, 47); border-right: 0px none rgb(36, 41, 47); border-top: 0px none rgb(36, 41, 47); border-bottom: 0px none rgb(36, 41, 47); border-color: rgb(36, 41, 47); display: inline" class="hljs-bullet">-</span> 随笔 |
| `cover` | 封面图片链接，留空就没有封面 | `https://...` |
| `show_cover` | 是否在文章页显示封面 | `true` 或 `false` |
| `description` | 文章摘要，留空会自动截取 | `一段简短介绍` |
| `pinned` | 是否置顶 | `true` 或 `false` |
| `show` | 是否在网站上展示 | `true` 或 `false` |

写完保存文件，跳到 [第七节](#%E4%B8%83%E6%97%A5%E5%B8%B8%E6%9B%B4%E6%96%B0%E5%8D%9A%E5%AE%A2%E7%9A%84-5-%E4%B8%AA%E6%AD%A5%E9%AA%A4) 用 GitHub Desktop 同步即可。

### 在文章里插入音频播放器

在文章中使用「引用格式」加音频直链，可以自动生成播放器：

```md
>[这是示例音频](https://example.com/audio.m4a)
```

如果链接没有明显音频后缀，可以在标题里加音乐符号强制识别：

```md
>[🎵这是示例音频](https://example.com/audio)
```

支持格式：`.mp3`、`.m4a`、`.wav`、`.ogg`、`.aac`、`.flac`、`.opus`。

辅助工具：

- 网盘分享链接转直链：<https://lz.qaiu.top/>
- 网盘直链获取工具：<https://link.gimhoy.com/>
- 小飞机云盘：<https://www.feijipan.com>

---

## 六、个性化网站：使用 `Control/`

`Control/` 是网站控制台。想把模板改成「自己的博客」，重点改这里。

| 文件 | 负责什么 |
| --- | --- |
| `site_网站属性.md` | 网站标题、站点名、首页介绍、头像、主题、正式域名 |
| `social_社交媒体.md` | 社交媒体图标、主页链接、联系方式、推广链接 |
| `about_关于页面.md` | About 页面的标题、介绍和头像 |

### 编辑这些文件时记住 4 点

- 冒号后面**保留一个空格**，例如 `site_name: FreeCat`
- 不想填的字段可以**留空**，但**不要删掉整行**
- `_01`、`_02` 这类下划线开头的行是说明文字，**不要改字段名**
- 改完必须用 GitHub Desktop 提交并同步，线上网站才会更新

文件顶部的配置区是这种格式：

```yaml
---
site_title: FreeCat Blog
site_name: FreeCat
hero_title: Hi, I'm FreeCat.
---
```

### `site_网站属性.md` 字段说明

| 字段 | 说明 |
| --- | --- |
| `site_title` | 浏览器标签页显示的网站标题 |
| `site_favicon` | 浏览器标签页图标 URL，留空使用默认图标 |
| `site_name` | 网站顶部显示的站点名 |
| `site_logo_icon` | 站内 Logo 图标 URL，留空使用默认图标 |
| `hero_title` | 首页主标题 |
| `hero_subtitle` | 首页介绍文字 |
| `hero_avatar` | 首页头像 URL |
| `posts_per_page` | 首页文章数量，留空默认 8，填 0 显示全部 |
| `footer_copyright` | 网站底部版权文字 |
| `theme_system` | 跟随系统明暗模式 |
| `theme_light` | 强制浅色模式 |
| `theme_dark` | 强制深色模式 |
| `site_url` | 你的正式网站地址，用于生成 Sitemap |

> 主题设置只需要让 `theme_system`、`theme_light`、`theme_dark` 中**其中一个**为 `true`。

### `social_社交媒体.md` 字段说明

每个平台通常有 3 个字段：

| 字段类型 | 例子 | 作用 |
| --- | --- | --- |
| 是否启用 | `github_enabled: true` | `true` 显示，`false` 隐藏 |
| 自定义图标 | `github_icon_url:` | 留空用默认图标，也可以填自己的图标 URL |
| 主页链接 | `github_url: https://github.com` | 点击图标后跳转到哪里 |

不用的平台，把对应的 `*_enabled` 改成 `false` 即可。

### `about_关于页面.md` 字段说明

| 字段 | 说明 |
| --- | --- |
| `about_hero_title` | About 页面的标题，留空则使用首页标题 |
| `about_hero_subtitle` | About 页面的介绍，留空则使用首页介绍 |
| `about_hero_avatar` | About 页面的头像，留空则使用首页头像 |

如果想让 About 页面和首页保持一致，这三个字段都留空即可。

---

## 七、日常更新博客的 5 个步骤

部署成功后，**以后写文章、改网站只需要这 5 步**：

1. 在 `writing/` 里新增或修改文章。
2. 如果需要，在 `Control/` 里修改网站信息。
3. 保存文件。
4. 打开 GitHub Desktop，写一句提交说明，点 `Commit to main`。
5. 点击 `Push origin`。

![GitHub Desktop commit](all/image/Tutorial/08.png)

![GitHub Desktop push](all/image/Tutorial/09.png)

同步成功后，Cloudflare Pages 或 Vercel 会**自动重新构建**。等 1–3 分钟刷新网站即可看到新内容。

---

## 八、进阶功能

下面这些不是必需的，新手可以先跳过，等熟悉后再回来看。

### 配合 Obsidian 写作

你可以直接用 Obsidian 打开这个博客仓库。推荐在 `writing/` 目录下写文章。

好处：

- 文章都在本地，方便管理
- 可以使用 Obsidian 的双链、标签、搜索
- 写完后用 GitHub Desktop 同步，网站自动发布

### 本地预览和构建

如果你只想写文章和部署，**不需要**在本地构建，部署平台会自动处理。

如果想在电脑上提前检查网站，需要先安装 [Node.js 20+](https://nodejs.org/)，然后：

```bash
cd all
npm install
npm run build
```

构建产物在 `all/dist/`，**不需要手动修改、不需要提交到 GitHub**。

### 项目结构

```text
Freecat-Blog/
├── Control/                # 网站基础配置，新手主要改这里
│   ├── site_网站属性.md
│   ├── social_社交媒体.md
│   └── about_关于页面.md
├── writing/                # 文章 Markdown 源文件,新手主要写这里
├── all/                    # 构建工程目录,部署平台进入这里构建
│   ├── src/                # 页面模板
│   ├── image/              # 图片资源
│   ├── build/              # 构建辅助脚本
│   ├── build.js            # 主构建脚本
│   ├── package.json        # 构建依赖和命令
│   └── dist/               # 构建产物,本地生成,不需要手动改
├── README.md
└── README.en.md
```

### 同步上游模板更新

模板会持续更新（修 bug、加功能、优化样式），仓库自带一个 GitHub Actions 工作流：

`.github/workflows/sync-upstream.yml`

**它会每周二北京时间凌晨 02:17 自动从主仓库 [OUBIGFA/Freecat-Blog](https://github.com/OUBIGFA/Freecat-Blog) 拉取最新的 `all/` 文件夹、`README.md` 和 `README.en.md`，覆盖到你自己仓库，然后 commit + push 到 main 分支。** Cloudflare Pages / Vercel 会随之自动重新构建发布。

#### 关键说明

- 同步范围是 `all/`（构建工程目录）、`README.md` 和 `README.en.md`，**完全不会动**你自己的 `Control/` 和 `writing/`，也不会动 `.github/` 和 `.gitignore`（避免覆盖你自己的工作流改动和忽略规则）
- **路线 A 和路线 B 都能用**。工作流不靠 `git merge`，而是用 `git checkout upstream/main -- ...` 把文件覆盖过来，**不需要两个仓库共享 git 历史**——所以即使你是 ZIP + 复制粘贴搭出来的私有仓库，也能正常自动同步
- 上游模板文件没变化时，工作流会跳过提交，**不会产生空 commit**
- 你的私有仓库**不需要任何额外配置**，工作流自带的 `GITHUB_TOKEN` 就能 push
- GitHub Actions 的定时触发可能有几分钟到十几分钟的延迟，是正常现象

#### 第一次启用：确认 Actions 已开启

私有仓库默认会开启 Actions。如果你打开仓库的 `Actions` 标签看到提示「I understand my workflows, go ahead and enable them」之类，点一下启用即可。之后无需任何操作。

#### 想立刻同步一次（手动触发）

不想等到周二？可以手动跑：

1. 打开你的 GitHub 仓库。
2. 顶部点 `Actions`。
3. 左侧选 `Sync upstream template files`。
4. 右上点 `Run workflow` → `Run workflow` 确认。

几十秒后查看运行结果，绿色对勾即同步完成。

#### 如果你改过 `all/` 里的内容

工作流会**直接覆盖** `all/`。如果你自定义过模板、改过样式、动过构建脚本，自动同步会把你的改动覆盖掉。两种处理方式：

- **关闭自动同步**：删除或重命名 `.github/workflows/sync-upstream.yml`
- **保留自动同步**：把你对 `all/` 的修改单独维护（比如 fork 上游再加 PR），不要直接改私有仓库里的 `all/`

新手 99% 不会改 `all/`，所以默认保持开启即可。

---

### 手动同步上游（进阶 / 兜底）

> 仅当你想**完整合并 `Control/` 等其他目录的上游更新**，或自动工作流出问题时再看。新手通常用不上。

下面的 `git merge` 流程**仅适用于「路线 A：GitHub Importer」搭建的仓库**。ZIP 路线请看本节最后的兜底方案。

**第一次同步前：添加上游仓库**

在命令行里进入你的本地仓库目录：

```bash
cd 你的本地仓库完整路径
git remote add upstream https://github.com/OUBIGFA/Freecat-Blog.git
git remote -v
```

能看到 `origin` 和 `upstream` 就说明成功。

**每次同步上游更新**

```bash
git fetch upstream
git log HEAD..upstream/main --oneline
git merge upstream/main
git push origin main
```

说明：

- `git fetch upstream`：获取上游最新代码，不会改你的文件
- `git log HEAD..upstream/main --oneline`：查看上游有哪些新更新
- `git merge upstream/main`：把上游更新合并到你的仓库
- `git push origin main`：把合并结果同步回 GitHub

**如果出现冲突**

冲突通常是你和上游改了同一个文件。文件里会出现类似标记：

```text
<<<<<<< HEAD
你自己的内容
=======
上游模板的内容
>>>>>>> upstream/main
```

处理方法：

1. 打开冲突文件。
2. 保留你想要的内容。
3. 删除 `<<<<<<<`、`=======`、`>>>>>>>` 这些标记。
4. 保存文件。
5. 运行：

```bash
git add .
git commit -m "Merge upstream Freecat Blog updates"
git push origin main
```

一般建议：

- `Control/` 里**优先保留你自己**的配置
- `writing/` 里**优先保留你自己**的文章
- `all/` 里通常**保留上游**模板更新

**ZIP 路线的兜底更新方法**

如果你是用 ZIP + 复制粘贴搭建的仓库，不建议强行用上面的 `git merge` 方法。可以这样手动更新：

1. 重新下载最新版 Freecat Blog ZIP。
2. 解压。
3. 把新版里的 `all/` 文件夹复制到你的仓库，**覆盖**原有的 `all/` 文件夹。
4. **不要覆盖**你自己的 `Control/`、`writing/`。
5. 用 GitHub Desktop 检查改动。
6. 确认没误删内容后，Commit + Push。

---

## 九、常见问题

**Q：我必须会编程吗？**
不用。日常只需要改 Markdown 文件和配置文件。

**Q：我主要应该改哪些地方？**
写文章改 `writing/`，改网站信息改 `Control/`。新手一般不要改 `all/`。

**Q：必须买域名吗？**
不用。Cloudflare Pages 和 Vercel 都会先提供默认网址。

**Q：部署时最容易填错哪里？**
`Root Directory` 必须是 `all`，`Output Directory` 必须是 `dist`，**不要写成** `all/dist`。

**Q：本地改完后网站没变化怎么办？**
按顺序检查：① 文件是否保存 → ② GitHub Desktop 是否已经 Push → ③ Cloudflare Pages 或 Vercel 是否触发了新构建 → ④ 浏览器强制刷新。

**Q：Cloudflare Pages 和 Vercel 选哪个？**
完全新手推荐 Cloudflare Pages。已经在用 Vercel 的用户可以选 Vercel。内容都在 GitHub，以后可以迁移。

**Q：可以把示例文章删掉吗？**
可以。示例文章都在 `writing/` 里，删除后提交同步即可。

**Q：我已经用 ZIP 路线搭好了，还能改成 Importer 路线吗？**
可以。最稳的办法是重新用 Importer 建一个新仓库，然后把旧仓库里的 `Control/` 和 `writing/` 复制过去，再重新部署或切换部署项目源仓库。

**Q：执行** `git remote add upstream` 提示 `remote upstream already exists` 怎么办？
说明已经添加过上游。可以运行：

```bash
git remote set-url upstream https://github.com/OUBIGFA/Freecat-Blog.git
```

**Q：执行** `git merge upstream/main` 提示 `refusing to merge unrelated histories` 怎么办？
通常说明你是 ZIP 路线建的仓库，不适合直接合并上游。请使用上面的 ZIP 兜底更新方法，或者重新用 Importer 建仓。

---

## 许可证

本项目使用 MIT License。
