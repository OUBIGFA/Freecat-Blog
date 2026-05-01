<div align="center">
  <img src="https://cdn.img2ipfs.com/ipfs/QmNxBPYGDuwD5MYyvyzJWZBzW6dFQoYAgXvXdKJP5sumE5?filename=freecat.gif" width="640" alt="Freecat Blog Preview">
  <h1>Freecat Blog</h1>
  <p>本地优先 + 云同步的免费个人博客方案</p>
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
    <a href="https://blog.freeorg.dpdns.org">演示站点</a>
  </p>
</div>

## 简介

Freecat Blog 是一套 **本地优先、写作优先、部署免费** 的个人博客方案。它把写作交给本地 Markdown，把版本管理交给 GitHub，把网站部署交给 Cloudflare Pages 或 Vercel，让你跳过无谓的格式折腾，回归纯粹的写作与阅读。

整套方案不依赖任何单一平台：内容存放在你本地和 GitHub 上，部署平台只负责自动构建静态站点。即便日后切换平台，内容也始终在你手里。

## 工作原理

整套博客的工作链路只有 3 步：

1. 在本地编写 `Markdown` 文章
2. 通过 `GitHub` 实现云备份和版本管理
3. 由 `Cloudflare Pages` 或 `Vercel` 自动构建并发布为网站

你不需要直接编写网页代码，也不需要购买服务器维护环境。

## 功能特性

- **本地优先的写作体验**：本地文件即内容本体，电脑端 + GitHub 双重备份
- **Markdown 与 HTML 兼容**：日常用 Markdown，复杂排版可插入原生 HTML
- **优化过的阅读样式**：自动处理中英混排、数字与单位之间的空格
- **自带搜索、归档、标签**：支持按标签归类、全文搜索、主题切换
- **音频播放支持**：在引用块中插入音频直链即可自动出现播放器
- **高自定义的控制台**：通过 `Control` 文件夹无需改代码即可调整网站基本信息
- **自动化部署**：每次同步到 GitHub 后，部署平台自动构建并发布
- **完全免费**：Cloudflare Pages 和 Vercel 均提供免费额度，个人博客足够使用

## 准备工作

在开始之前，请准备好以下账户：

- **GitHub 账户**（必需）
- **Cloudflare 账户** 或 **Vercel 账户**（二选一）
- **GitHub Desktop**（必需）：[下载地址](https://desktop.github.com/download)

## 部署参数速查

无论使用 Cloudflare Pages 还是 Vercel，核心配置都是固定的：

| 参数 | 应填写的值 |
| --- | --- |
| 仓库 | 你自己的 GitHub 仓库 |
| Root Directory / Base Directory | `all` |
| Build Command | `npm run build` |
| Output Directory / Publish Directory | `dist` |
| Node Version | `20` |

注意：当根目录已切到 `all` 后，输出目录直接写 `dist`，不要写成 `all/dist`。

## 快速开始

接下来有两条路线，**优先选推荐路线**：

| 路线 | 是否保留 Git 历史 | 能否 `git pull` 跟上游同步 | 适合谁 |
| --- | --- | --- | --- |
| 推荐：GitHub Importer 一键导入 | 是 | 能 | 所有人，新手也无压力 |
| 备选：下载 ZIP + 复制粘贴 | 否 | 不能（参见 [常见问题](#%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98)） | 网络打不开 Importer，或者已经这样做完了 |

> 两条路线**只能选一条**。不要既导入又复制粘贴，会冲突。

---

### 推荐路线：用 GitHub Importer 创建私有仓库（支持同步上游）

GitHub 自带的 Importer 工具能把一个公开仓库**完整克隆**进你自己的私有仓库，包括所有 commit 历史。这意味着以后想同步 FreeBlog 的更新只要一条命令。

#### 第一步：打开 Importer 页面

1. 登录 GitHub
2. 浏览器访问：<https://github.com/new/import>

#### 第二步：填写导入表单

按下表逐项填写：

| 字段 | 应填写的值 |
| --- | --- |
| `Your old repository's clone URL` | `https://github.com/OUBIGFA/FreeBlog` |
| `Owner` | 选你自己的 GitHub 账户 |
| `Repository name` | 起一个名字，比如 `my-freecat-blog` |
| `Privacy` | 选 `Private` |

> 网络访问不到上面那个 `https://github.com/OUBIGFA/FreeBlog`，说明 GitHub 不通；先解决网络再继续，或者直接走备选路线。

#### 第三步：开始导入

1. 点击 `Begin import`
2. 页面会显示进度条，通常 30 秒到 2 分钟之间
3. 看到 `Your new repository... is ready` 就完成了
4. 点击新仓库链接进去看一眼，文件应该和 OUBIGFA/FreeBlog 一模一样

#### 第四步：用 GitHub Desktop 把仓库克隆到本地

1. 安装并登录 [GitHub Desktop](https://desktop.github.com/download)
2. 在 GitHub Desktop 里点 `File` → `Clone repository`
3. 选择你刚导入好的私有仓库
4. 选择一个本地位置（建议放在你常用的文件夹里）
5. 点击 `Clone`

到这里你的本地文件夹里就是完整的 FreeBlog 项目，可以**直接跳到 [开始写文章](#%E5%BC%80%E5%A7%8B%E5%86%99%E6%96%87%E7%AB%A0)** 那一节。

---

<details>
<summary><b>📦 备选路线：下载 ZIP + 复制粘贴（无法同步上游） — 点击展开</b></summary>

<br>

> 提示：用这种方式建出来的仓库，未来**没法用** `git pull` 拉取上游更新。如果你不在乎这一点，或者 Importer 因为网络问题打不开，可以走这条路。

#### 第一步：新建一个私有仓库

项目地址：<https://github.com/OUBIGFA/FreeBlog>

1. 登录 GitHub
2. 打开 <https://github.com/new>
3. 在 `Repository name` 里输入一个名字，比如 `my-freecat-blog`
4. 在可见性里选择 `Private`
5. 勾选 `Add a README file`
6. 点击 `Create repository`

#### 第二步：下载 FreeBlog 的代码压缩包

1. 打开原项目地址：<https://github.com/OUBIGFA/FreeBlog>
2. 点击页面右上方的 `Code`
3. 点击 `Download ZIP`
4. 等待压缩包下载完成

#### 第三步：解压压缩包

1. 在电脑里找到刚下载好的 ZIP 文件
2. 右键它
3. 选择 `解压到当前文件夹` 或 `解压到 FreeBlog...`
4. 解压完成后，打开解压出来的文件夹

#### 第四步：安装并使用 GitHub Desktop，把私有仓库下载到本地

1. 安装并登录 GitHub 账户
2. 打开 GitHub Desktop
3. 选择你刚创建好的私有仓库
4. 选择一个本地位置
5. 点击 `Clone`

本地仓库文件夹里通常只有一个 `README.md`。

#### 第五步：把 FreeBlog 的源码复制进你自己的本地仓库

1. 打开你刚才解压出来的 `FreeBlog` 文件夹
2. 进入最里面那一层真正放源码的目录
3. 选中里面的全部内容
4. 复制这些内容
5. 打开 GitHub Desktop 刚刚克隆下来的那个私有仓库文件夹
6. 把刚复制的内容粘贴进去
7. 如果系统提示是否替换原来的 `README.md`，点 `替换`

注意：
不要把最外层整个文件夹直接丢进去。
要复制的是“文件夹里面的内容”，不是“外面那层文件夹”。
否则仓库里会多出一层目录，部署平台找不到 `all/`，构建必然失败。

#### 第六步：第一次提交到 GitHub

1. 回到 GitHub Desktop
2. 左侧会看到一大批新增文件
3. 在提交说明里输入一句话，比如 `Import FreeBlog source`
4. 点击 `Commit to main`
5. 点击 `Push origin`

GitHub 网页一次最多上传 `100` 个文件，而这个项目文件很多，直接走本地同步更稳。

</details>

---

### 开始写文章

不论用哪条路线，从这里开始两边汇合。主要工作集中在两个目录：

- `writing/`：存放 Markdown 文章
- `Control/`：存放网站基础配置（详见后文「通过 Control 文件夹自定义网站」）

### 以后怎么同步更新

在 GitHub Desktop 中：

1. 查看变更文件
2. 填写提交说明
3. 点击 Commit
4. 点击 Push 同步到 GitHub

只要同步成功，部署平台就会自动重新构建。

## 部署：Cloudflare Pages（推荐）

适合长期稳定运营，对纯静态博客和自定义域名最友好。

### 配置步骤

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在左侧导航点击 `Workers & Pages` → `Create` → `Pages`
3. 连接 GitHub 并选择你自己的仓库
4. 按下表填写构建配置：

| 字段 | 值 |
| --- | --- |
| Framework preset | `None` |
| Root directory | `all` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `20` |

1. 点击部署，等待几分钟后即可获得默认网址

### 绑定自定义域名

1. 进入 Pages 项目设置
2. 找到 `Custom domains`
3. 添加你的域名并按提示完成 DNS 配置

如果域名本就托管在 Cloudflare 上，过程会更顺畅。

<details>
<summary><b>🚀 部署：Vercel — 点击展开</b></summary>

<br>

适合已有 Vercel 账户或习惯 Vercel 后台的用户。

### 配置步骤

1. 登录 [Vercel](https://vercel.com/)
2. 点击 `Add New...` → `Project`
3. 连接 GitHub 并选择你自己的仓库
4. 按下表填写项目配置：

| 字段 | 值 |
| --- | --- |
| Framework Preset | 保持默认或选静态构建 |
| Root Directory | `all` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | `20` |

1. 点击 `Deploy`，等待构建完成

### 绑定自定义域名

1. 进入项目设置 → `Domains`
2. 添加你的域名并按提示配置解析

</details>

## 平台选择建议

| 场景 | 推荐 |
| --- | --- |
| 完全新手 / 长期稳定运营 | Cloudflare Pages |
| 已经在用 Vercel / 想快速上线 | Vercel |
| 担心选错 | 任意均可，内容不锁死，可随时切换 |

## 日常使用流程

部署成功后，每次更新博客只需要这 5 步：

1. 在本地编写或修改文章
2. 保存文件
3. 用 GitHub Desktop 提交并同步
4. 等待部署平台自动构建
5. 打开网站检查结果

## 同步上游 FreeBlog 模板更新

当上游 [OUBIGFA/FreeBlog](https://github.com/OUBIGFA/FreeBlog) 修了 Bug、加了新功能、优化了样式时，你可以把这些更新拉到自己的私有仓库。

> **前置条件**：你必须是用「推荐路线（GitHub Importer）」建仓的。如果你走的是 ZIP + 复制粘贴路线，跳到下面的「兜底方案」。

### 推荐方法：用 `git remote add upstream` 拉取上游更新

只在第一次需要执行 1～3 步，之后每次同步只跑 4～7 步即可。

#### 第一步：打开命令行工具

- Windows：`Win + R`，输入 `cmd`，回车
- macOS：打开 `终端 (Terminal)`

#### 第二步：进入你的本地仓库目录

```bash
cd 你的本地仓库完整路径
```

例如 Windows 下：

```bash
cd D:\GitHub\my-freecat-blog
```

不知道路径在哪？打开 GitHub Desktop，点击顶部菜单 `Repository` → `Show in Explorer / Finder`，看地址栏即可。

#### 第三步：注册上游仓库（一次性，永久生效）

```bash
git remote add upstream https://github.com/OUBIGFA/FreeBlog.git
```

确认是否成功：

```bash
git remote -v
```

应该看到两行 `origin` 和两行 `upstream`，类似：

```
origin    https://github.com/你的用户名/my-freecat-blog.git (fetch)
origin    https://github.com/你的用户名/my-freecat-blog.git (push)
upstream  https://github.com/OUBIGFA/FreeBlog.git (fetch)
upstream  https://github.com/OUBIGFA/FreeBlog.git (push)
```

#### 第四步：抓取上游最新代码

```bash
git fetch upstream
```

这一步只会把上游的更新下载到本地缓存，**不会动你的任何文件**。

#### 第五步：查看上游有哪些新更新（可选）

```bash
git log HEAD..upstream/main --oneline
```

会列出从你上次同步到现在，上游新增的所有 commit。如果一行都没有，说明上游没更新，到此结束。

#### 第六步：合并上游更新到你的分支

```bash
git merge upstream/main
```

可能出现 3 种结果：

1. `Already up to date.` —— 上游没有新东西，结束。
2. `Fast-forward` 或 `Merge made by the 'recursive' strategy` —— 顺利合并完成，进入第七步。
3. **冲突**（屏幕显示 `CONFLICT`）—— 你和上游改了同一个文件的同一行。处理方法见下面的「冲突解决」。

#### 第七步：把合并结果推回 GitHub

```bash
git push origin main
```

推送成功后，部署平台会自动触发新一轮构建，网站随即更新。

### 冲突解决

最常见的冲突场景：你改过 `Control/site_网站属性.md`（换了自己的站点名/头像），上游也改了同一个文件。

冲突的文件里会出现这样的标记：

```
<<<<<<< HEAD
你这一边的内容（你自己写的）
=======
上游那一边的内容（OUBIGFA/FreeBlog 改的）
>>>>>>> upstream/main
```

处理三步：

1. 用编辑器打开冲突文件
2. 决定保留哪一边（通常 `Control/` 里的配置保留你自己的，`all/` 里的构建脚本保留上游的）
3. 删掉 `<<<<<<<`、`=======`、`>>>>>>>` 这三行标记，只留下你想要的内容

全部冲突文件都处理完后：

```bash
git add .
git commit -m "Merge upstream FreeBlog updates"
git push origin main
```

### 兜底方案：手动 ZIP 覆盖（用于备选路线建的仓库）

如果你当初是走 ZIP + 复制粘贴路线建的仓库，没法用 `git remote add upstream`（强行用会报 `refusing to merge unrelated histories` 然后所有文件冲突）。退而求其次的办法：

1. 重新到 [OUBIGFA/FreeBlog](https://github.com/OUBIGFA/FreeBlog) 下载最新 ZIP
2. 解压
3. 把解压出的 `all/`、`README.md`、`README.en.md` 等**模板/构建相关文件**覆盖到你的本地仓库
4. **千万不要覆盖** `Control/`、`writing/`、`image/` 这些你自己的内容目录
5. 用 GitHub Desktop 检查变更（左侧会列出所有改动），确认没误伤你的内容
6. Commit + Push

> 想一劳永逸的话，建议在方便时按推荐路线重建一次仓库，把内容文件搬过去即可。一次小投入，换来未来每次升级都很轻松。

## 项目结构

```text
FreeBlog/
├── Control/                # 网站基础配置（站点信息、社交、关于页）
│   ├── site_网站属性.md
│   ├── social_社交媒体.md
│   └── about_关于页面.md
├── writing/                # 文章 Markdown 源文件
├── all/                    # 构建工程目录
│   ├── src/                # 模板文件（HTML 模板、样式、脚本）
│   ├── image/              # 图片资源
│   ├── build.js            # 构建脚本
│   ├── extract-git-dates.js
│   └── package.json
├── README.md
└── README.en.md
```

构建产物 `all/dist/` 不会提交到仓库。

## 文章 Frontmatter 字段

每篇文章的头部支持以下属性：

```yaml
---
title: 文章标题
date: 2026-01-16
tag:
  - free
cover: https://example.com/cover.gif      # 封面图片
show_cover: false                          # 是否在详情页显示封面
show_image_captions: true                  # 是否显示图注
description: 文章摘要，留空则自动截取
pinned: true                               # 是否置顶
show: true                                 # 是否在全站展示
---
```

## 音频播放

在文章中使用引用格式加音频直链，即可自动出现播放器：

```md
>[这是示例格式](https://xxx.xxx/example.m4a)
```

如果链接没有明显音频后缀，可在标题加 `🎵` 强制启用：

```md
>[🎵这是示例格式](https://xxx.xxx/example)
```

支持识别的音频格式：`.mp3`、`.m4a`、`.wav`、`.ogg`、`.aac`、`.flac`、`.opus`

辅助工具：

- [网盘分享链接转直链工具](https://lz.qaiu.top/)
- [网盘直链获取工具](https://link.gimhoy.com/)
- [小飞机云盘](https://www.feijipan.com)

## 进阶用法

### 配合 Obsidian 写作

将博客仓库当作 Obsidian 仓库直接打开，可获得：

- 本地文件可控
- 双链、标签、搜索能力
- 写作 → Git 同步 → 自动发布的连续工作流

推荐在 `writing` 目录下编辑文章，写完后用 GitHub Desktop 同步即可。

### 通过 Control 文件夹自定义网站

`Control/` 目录是不需要改代码就能调整网站核心信息的控制台：

| 文件 | 作用 |
| --- | --- |
| `site_网站属性.md` | 网站名称、描述、头像、图标、默认主题 |
| `social_社交媒体.md` | 社交媒体、友链、联系方式、推广链接 |
| `about_关于页面.md` | "关于我"页面的单独文字内容 |

> 编辑规则：所有参数都写在文件顶部 `---` 包裹的 Frontmatter 区块里，`键: 值` 之间必须保留一个空格；带 `_01`、`_02` 这样下划线开头的字段是注释行，**请勿删除或重命名**，仅作为参数说明展示。

#### 1. `site_网站属性.md` 详细参数

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `site_title` | `FreeCat Blog` | 浏览器标签页显示的网页标题 |
| `site_favicon` | 空 | 浏览器标签页显示的网页图标 URL；留空使用内置图标 |
| `site_name` | `FreeCat` | 站内顶部显示的站位名称 |
| `site_logo_icon` | 空 | 站内 Logo 图标，可填 SVG 链接；留空使用默认图标 |
| `hero_title` | `Hi, I'm FreeCat...` | 首页主标题 / Slogan |
| `hero_subtitle` | 一段中英文介绍 | 首页详情介绍文案 |
| `hero_avatar` | 空 | 首页个人头像 URL |
| `posts_per_page` | 空 | 首页文章显示数量；空 = 默认 `8`；`0` = 显示全部 |
| `footer_copyright` | `© FreeCat \\| Curiosity is the best motivation.` | 网站底部版权信息 |
| `theme_system` | `true` | 跟随系统：根据浏览器或操作系统设置自动切换明暗 |
| `theme_light` | `false` | 浅色模式：全站强制使用明亮风格 |
| `theme_dark` | `false` | 深色模式：全站强制使用暗黑风格 |
| `site_url` | `https://blog.freeorg.dpdns.org` | 网站正式域名，用于生成 Sitemap 和 Canonical 标签 |

主题设置规则：`theme_system`、`theme_light`、`theme_dark` 三选一为 `true`，其它两个保持 `false`。如果都是 `false`，会回退到跟随系统。

#### 2. `social_社交媒体.md` 详细参数

每个社交平台都有 3 个参数：是否启用、自定义图标、跳转链接。

| 平台 | 启用开关 | 自定义图标 | 主页链接 |
| --- | --- | --- | --- |
| Twitter / X | `twitter_enabled` | `twitter_icon_url` | `twitter_url` |
| Instagram | `instagram_enabled` | `instagram_icon_url` | `instagram_url` |
| GitHub | `github_enabled` | `github_icon_url` | `github_url` |
| Behance | `behance_enabled` | `behance_icon_url` | `behance_url` |
| TikTok | `tiktok_enabled` | `tiktok_icon_url` | `tiktok_url` |
| Facebook | `facebook_enabled` | `facebook_icon_url` | `facebook_url` |

填写说明：

- `*_enabled`：填 `true` 显示该社交图标，填 `false` 隐藏
- `*_icon_url`：留空时使用项目内置图标；如需自定义可填图标的 URL（建议 SVG 或正方形 PNG）
- `*_url`：填写你自己的社交主页地址，例如 `https://x.com/yourname`

如果某个平台你不用，把 `*_enabled` 改成 `false` 即可，不需要删整段。

#### 3. `about_关于页面.md` 详细参数

| 参数 | 说明 |
| --- | --- |
| `about_hero_title` | About 页面的标题；留空则自动使用主页 `hero_title` |
| `about_hero_subtitle` | About 页面的详情介绍；留空则自动使用主页 `hero_subtitle` |
| `about_hero_avatar` | About 页面的头像；留空则自动使用主页 `hero_avatar` |

使用建议：

- 想让 About 与首页保持一致时，三个字段全部留空即可
- 只想替换其中一项（比如换一张头像）时，只填那一项，其他保持空白
- 长文形式的"关于我"内容仍然推荐写成一篇普通文章，再在导航或社交链接里指向它

#### Control 文件夹通用注意事项

- **改完必须 push**：任何 `Control` 文件改动都要用 GitHub Desktop 提交并同步到 GitHub，部署平台才会重新构建
- **留空字段保留** `键:`：不要直接整行删掉，否则会破坏 Frontmatter 结构
- `_01`、`_02` 行不要动：这些下划线开头的字段是注释行，构建时会被忽略
- **改完没生效**：先在浏览器里强制刷新（Windows 按 Ctrl + F5，macOS 按 Cmd + Shift + R），再判断是否真的没更新

### 拓展使用场景

同样的逻辑可以用于：

- 个人主页
- 作品集
- 知识库网站
- 项目展示站
- 笔记云备份

## 常见问题

**Q：我必须会编程吗？**
不用。按照本文档一步步操作即可完成部署和发布。

**Q：必须先买域名吗？**
不用。Cloudflare Pages 和 Vercel 都会先提供默认网址。

**Q：本地改完后网站没变化怎么办？**
依次检查：

1. 是否已保存文件
2. 是否在 GitHub Desktop 中提交并同步
3. 部署平台是否触发了自动构建
4. 浏览器是否缓存了旧页面（强制刷新试试）

**Q：以后能从 Vercel 换到 Cloudflare Pages 吗？**
可以。内容存在你本地和 GitHub，不被任何平台锁定。

**Q：最容易填错的两个地方？**

- Root Directory 必须是 `all`
- Output Directory 必须是 `dist`，不要写成 `all/dist`

**Q：我已经用 ZIP + 复制粘贴方式建好仓库了，还能切到 Importer 路线吗？**
可以。最稳妥的做法是按推荐路线**重新建一个新的私有仓库**，把老仓库的 `Control/`、`writing/`、`image/` 等内容文件复制过去，再把 Cloudflare/Vercel 项目源切换到新仓库（或重新建一个）。原仓库可以先留着不删，确认新仓库部署成功后再处理。

**Q：用 Importer 导入会不会把上游的 README、示例文章一起带过来？**
会。导入后新仓库等同于上游的完整克隆，里面的 README、`writing/` 下的示例文章都在。你可以正常修改、删除它们，这些操作只影响你自己的仓库。

**Q：执行** `git remote add upstream` 时报 `remote upstream already exists`？
说明你之前加过了。可以用 `git remote set-url upstream https://github.com/OUBIGFA/FreeBlog.git` 直接覆盖，或者先 `git remote remove upstream` 再重新添加。

**Q：**`git merge upstream/main` 出现 `refusing to merge unrelated histories`？
说明你的仓库不是用 Importer 路线建的，没法直接合并。请走「同步上游」章节里的「兜底方案」，或重建仓库。

## 许可证

本项目使用 MIT License。

