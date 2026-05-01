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
- **自带搜索、归档、标签**:支持按标签归类、全文搜索、主题切换
- **音频播放支持**：在引用块中插入音频直链即可自动出现播放器
- **高自定义的控制台**:通过 `Control` 文件夹无需改代码即可调整网站基本信息
- **自动化部署**:每次同步到 GitHub 后,部署平台自动构建并发布
- **完全免费**:Cloudflare Pages 和 Vercel 均提供免费额度,个人博客足够使用

## 演示站点

在线预览：[https://blog.freeorg.dpdns.org](https://blog.freeorg.dpdns.org)

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

### 第一步：新建一个私有仓库

项目地址：[https://github.com/OUBIGFA/FreeBlog](https://github.com/OUBIGFA/FreeBlog)

1. 登录 GitHub
2. 打开 [https://github.com/new](https://github.com/new)
3. 在 `Repository name` 里输入一个名字，比如 `my-freecat-blog`
4. 在可见性里选择 `Private`
5. 勾选 `Add a README file`
6. 点击 `Create repository`

### 第二步：下载 FreeBlog 的代码压缩包

1. 打开原项目地址：[https://github.com/OUBIGFA/FreeBlog](https://github.com/OUBIGFA/FreeBlog)
2. 点击页面右上方的 `Code`
3. 点击 `Download ZIP`
4. 等待压缩包下载完成

### 第三步：解压压缩包

1. 在电脑里找到刚下载好的 ZIP 文件
2. 右键它
3. 选择 `解压到当前文件夹` 或 `解压到 FreeBlog...`
4. 解压完成后，打开解压出来的文件夹

### 第四步：安装并使用 GitHub Desktop，把私有仓库下载到本地

1. 安装并登录 GitHub 账户
2. 打开 GitHub Desktop
3. 选择你刚创建好的私有仓库
4. 选择一个本地位置
5. 点击 `Clone`

本地仓库文件夹里通常只有一个 `README.md`。

### 第五步：把 FreeBlog 的源码复制进你自己的本地仓库

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

### 第六步：第一次提交到 GitHub

1. 回到 GitHub Desktop
2. 左侧会看到一大批新增文件
3. 在提交说明里输入一句话，比如 `Import FreeBlog source`
4. 点击 `Commit to main`
5. 点击 `Push origin`

GitHub 网页一次最多上传 `100` 个文件，而这个项目文件很多，直接走本地同步更稳。

### 第七步：开始写文章

主要工作集中在两个目录：

- `writing/`：存放 Markdown 文章
- `Control/`：存放网站基础配置

### 第八步：以后怎么同步更新

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

5. 点击部署，等待几分钟后即可获得默认网址

### 绑定自定义域名

1. 进入 Pages 项目设置
2. 找到 `Custom domains`
3. 添加你的域名并按提示完成 DNS 配置

如果域名本就托管在 Cloudflare 上，过程会更顺畅。

## 部署：Vercel

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

5. 点击 `Deploy`，等待构建完成

### 绑定自定义域名

1. 进入项目设置 → `Domains`
2. 添加你的域名并按提示配置解析

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

## 许可证

本项目使用 MIT License。
