---
title: Freecat Blog 免费博客构建指南 | 本地写作 + GitHub 备份 + 免费部署
_01: 🔹 文章标题
date: 2026-01-16
_02: 🔹 发布日期：发布或显示的时间
tag:
  - free
_03: 🔹 标签分类：用于文章归类和搜索
cover: https://i.pinimg.com/originals/af/89/3e/af893ef77c62353ce8590e418a94783a.gif
_04: 🔹 封面图片：文章在列表和顶部的展示图
show_cover: false
_05: 🔹 显示封面：是否在文章详情页展示顶部封面图
show_image_captions: true
_06: 🔹 显示图注：是否在文章中显示图片下方的说明文字
description: 一套适合新手的免费个人博客方案：在 writing 文件夹写 Markdown 文章，在 Control 文件夹改网站信息，再通过 GitHub、Cloudflare Pages 或 Vercel 自动发布成网站。
_07: 🔹 文章摘要：不填写则自动截取文章内容
pinned: true
_08: 🔹 置顶文章：是否将此文章固定在首页顶部
show: true
_09: 🔹 显示文章：是否在全站展示此文章
---

## Freecat Blog 是什么

Freecat Blog 是一个把本地 Markdown 文章自动发布成网站的个人博客模板。

你可以把它理解成三部分：

| 文件夹 | 你主要做什么 | 作用 |
| --- | --- | --- |
| `writing/` | 写文章 | 一篇 Markdown 文件就是一篇博客文章 |
| `Control/` | 改网站信息 | 改网站名、头像、首页介绍、社交链接、About 页面 |
| `all/` | 一般不改 | 构建工程，部署平台会进入这里生成网站 |

新手最该记住一句话：

**写文章去 `writing/`，个性化去 `Control/`，部署构建根目录填 `all`。**

---

## 准备工作清单

正式开始前，先把这几件东西准备齐：

| 项目 | 是否必需 | 说明 |
| --- | --- | --- |
| GitHub 账户 | 必需 | 用于托管你的博客私有仓库 |
| GitHub Desktop | 必需 | 本地同步工具，[下载地址](https://desktop.github.com/download) |
| Cloudflare 账户 | 推荐 | 用于自动构建和发布网站，新手推荐 `Cloudflare Pages` |
| Vercel 账户 | 可选 | 如果你已经在用 Vercel，也可以直接选它 |

> GitHub 账户和 GitHub Desktop 是基础。Cloudflare Pages 和 Vercel 二选一即可。

---

## 这套博客到底是怎么工作的

逻辑非常简单：

```text
本地 writing/ 文章
        +
本地 Control/ 配置
        ↓
同步到 GitHub
        ↓
Cloudflare Pages / Vercel 自动构建
        ↓
生成并发布你的博客网站
```

你不用直接写网页代码，也不用自己买服务器折腾环境。

这套方案的重点就是：`本地优先`、`写作优先`、`部署免费`、`后续可深度定制`。

---

## 先说结论：新手怎么选部署平台

### 第一推荐：Cloudflare Pages

适合绝大多数人。

- 免费
- 稳定
- 配置清晰
- 自定义域名方便
- 更适合长期运营个人博客

### 第二推荐：Vercel

如果你已经有 Vercel 账户，或者你本来就习惯用 Vercel，也完全可以直接用。

- 上手非常快
- 界面简单
- 和 GitHub 联动很顺
- 个人博客完全够用

一句话建议：

- 想少折腾、长期稳定：选 `Cloudflare Pages`
- 想快速上线、已经在用 Vercel：选 `Vercel`

---

## Freecat Blog 的优势

### 1. 本地优先，写作体验稳定

- 本地文件就是你的内容本体
- 不依赖单一平台
- 电脑里有一份，GitHub 云端再有一份

### 2. Markdown 和 HTML 都能用

- 日常写作直接用 `Markdown`
- 需要更自由的排版时，也能插入 `HTML`
- 既照顾小白，也照顾以后想折腾的人

### 3. 阅读体验是优化过的

- 中英混排、数字和单位之间会自动优化空格
- 页面阅读样式是专门调过的
- 默认更适合长文、笔记、随笔和知识整理

### 4. 自带搜索、归档、标签和主题

- 可以按标签归类
- 可以全文搜索
- 可以切换主题
- 可以做成很个人化的博客

### 5. 支持文章内音频播放

- [音频播放演示案例](https://blog.freeorg.dpdns.org/posts/%E4%B8%BA%E4%BB%80%E4%B9%88%E5%9D%90%E6%9C%88%E5%AD%90%E6%98%AF%E9%99%8B%E4%B9%A0%EF%BC%9F.html)
- 文章中使用引用格式加音频直链，就能自动出现播放器

示例：

```md
>[这是示例格式](https://xxx.xxx/example.m4a)
```

如果链接本身没有明显的音频后缀，也可以在标题里加 `🎵` 强制启用播放器：

```md
>[🎵这是示例格式](https://xxx.xxx/example)
```

支持识别的常见音频格式：

- `.mp3`
- `.m4a`
- `.wav`
- `.ogg`
- `.aac`
- `.flac`
- `.opus`

辅助工具：

- [网盘分享链接转直链工具](https://lz.qaiu.top/)
- [网盘直链获取工具](https://link.gimhoy.com/)
- [小飞机云盘](https://www.feijipan.com)

如果你后面要做更稳定的音频方案，建议直接问 AI：

`下载工具捕获的音频下载链接都会过期，还有其他更可靠的能在网盘分享链接中提取音频文件，或者其他完全不一样但依然可以实现播放音频的方案吗？`

---

## 部署前你只需要搞清楚 4 件事

### 1. 博客内容在本地写

你平时主要改的是文章和配置，不是直接去平台后台写网页。

### 2. GitHub 是内容仓库

GitHub 负责云备份，也负责通知部署平台重新构建。

### 3. 部署平台只负责“自动生成网站”

你每次把内容同步到 GitHub 后，平台会自动构建，然后更新网站。

### 4. 这套项目的关键部署参数是固定的

后面无论是 Cloudflare Pages 还是 Vercel，核心都填这几个：

- 根目录 / Root Directory：`all`
- 构建命令 / Build Command：`npm run build`
- 构建输出目录 / Output Directory：`dist`
- 环境变量 / Environment Variable：`NODE_VERSION=20`（可选，建议固定）

如果你看到平台里有这些字段，照着填就行。

---

## 新手正式开始前的准备

接下来要把 Freecat-Blog 的代码放进**你自己的私有 GitHub 仓库**里。这一步有两条路线：**有技术背景、想长期同步模板更新，推荐 GitHub Importer；完全小白，推荐下载 ZIP + 复制粘贴**。

| 路线 | 是否保留 Git 历史 | 能否一条命令同步上游更新 | 适合谁 |
| --- | --- | --- | --- |
| **路线 A：GitHub Importer 一键导入（推荐）** | 是 | 能 | 熟悉 GitHub / Git，想保留历史并长期同步上游更新的人 |
| **路线 B：下载 ZIP + 复制粘贴（备选）** | 否 | 不能 | 完全新手，只想尽快搭起来；或网络打不开 Importer 的人 |

**两条路线只能选一条。** 不要又导入又复制粘贴。

> 有 GitHub / Git 基础，想未来跟上 Freecat-Blog 的修复和升级 → 选 `路线 A`。
> 完全小白，只想先跑起来 → 选 `路线 B`。

---

## 路线 A：GitHub Importer 一键创建私有仓库（推荐）

GitHub 自带的 Importer 工具可以把一个公开仓库完整克隆进你自己的私有仓库，包括所有 commit 历史。这意味着以后想升级 Freecat-Blog，只要一条 `git merge upstream/main` 就能搞定。这个路线更适合对 GitHub / Git 有一点基础的人。

### A-1. 先登录 GitHub

1. 打开 <https://github.com/>
2. 登录你自己的账号
3. 还没账号？先完成注册再回来

### A-2. 打开 Importer 页面

浏览器访问：
<https://github.com/new/import>

### A-3. 填写导入表单

按下表逐项填好：

| 字段 | 应填写的值 |
| --- | --- |
| `Your old repository's clone URL` | `https://github.com/OUBIGFA/Freecat-Blog` |
| `Owner` | 选你自己的 GitHub 账户 |
| `Repository name` | 起一个名字，比如 `my-freecat-blog` |
| `Privacy` | 选 `Private` |

> 如果浏览器打不开 `https://github.com/OUBIGFA/Freecat-Blog`，说明 GitHub 网络不通；先解决网络问题，或者改走下面的「路线 B」。

### A-4. 开始导入

1. 点击页面底部的 `Begin import`
2. 屏幕上会出现进度条
3. 一般 30 秒到 2 分钟就完成
4. 看到 `Your new repository ... is ready` 这一行，就成功了
5. 点进新仓库看一眼，文件应该和 `OUBIGFA/Freecat-Blog` 一模一样

### A-5. 用 GitHub Desktop 把仓库下载到本地

1. 安装并登录 `GitHub Desktop`（下载地址在文章开头的「准备工作清单」里）
2. 点击 `File` → `Clone repository`
3. 选择你刚导入好的私有仓库
4. 选一个你自己容易找到的本地位置
5. 点击 `Clone`

到这里你的本地文件夹里就是完整的 Freecat-Blog 项目，**直接跳到下面的「不论走哪条路线，接下来都一样」一节继续**。

---

<details>
<summary><b>📦 路线 B：下载 ZIP + 复制粘贴（备选，不保留 Git 历史） — 点击展开</b></summary>

<br>

> 提示：用这种方式建出来的仓库，未来**没法用 `git pull` 拉取上游更新**。如果你不在乎这点，或者 Importer 因为网络问题打不开，可以走这条路。

### B-1. 先注册并登录 GitHub

项目地址：
<https://github.com/OUBIGFA/Freecat-Blog>

1. 登录 GitHub
2. 如果还没有账号，先完成注册
3. 登录后先停在 GitHub 首页

### B-2. 新建一个你自己的私有仓库

1. 打开 <https://github.com/new>
2. 在 `Repository name` 里输入一个名字
3. 名字可以直接写成 `my-freecat-blog`
4. 在仓库可见性里选择 `Private`
5. 勾选 `Add a README file`
6. 点击 `Create repository`

### B-3. 下载 Freecat-Blog 的代码压缩包

1. 打开原项目地址
2. 进入 <https://github.com/OUBIGFA/Freecat-Blog>
3. 点击页面右上方的 `Code`
4. 点击 `Download ZIP`
5. 等待 ZIP 文件下载完成

### B-4. 把 ZIP 文件解压到电脑里

1. 找到刚下载好的 ZIP 文件
2. 右键它
3. 选择 `解压到当前文件夹`，或者选择类似的解压选项
4. 解压后打开新出现的文件夹

### B-5. 安装并使用 GitHub Desktop，把私有仓库下载到本地

如果还没装，下载地址在文章开头的`准备工作清单`里。

你要做的事：

1. 安装 `GitHub Desktop`
2. 登录你的 GitHub 账户
3. 选择你刚才创建好的私有仓库
4. 选择一个你自己容易找到的本地位置
5. 点击下载到本地

本地仓库文件夹里通常只有一个 `README.md`。

### B-6. 把 Freecat-Blog 的源码复制进你自己的本地仓库

1. 打开刚才解压出来的 `Freecat-Blog` 文件夹
2. 进入最里面那一层真正放源码的目录
3. 全选里面的内容
4. 复制这些内容
5. 打开 GitHub Desktop 刚刚克隆下来的那个私有仓库文件夹
6. 把复制的内容全部粘贴进去
7. 如果系统提示是否替换原来的 `README.md`，直接点 `替换`

注意：

- 不要把最外层整个 `Freecat-Blog` 文件夹丢进去
- 要复制的是“里面的内容”
- 否则你的仓库里会多套一层目录，部署平台找不到 `all/`，构建必然失败

正确结果是：仓库根目录里能直接看到 `all/`、`Control/`、`writing/`、`README.md`。

![正确的仓库根目录示例](../all/image/Tutorial/10.png)

### B-7. 第一次提交到 GitHub

1. 回到 `GitHub Desktop`
2. 左侧会看到很多新增文件
3. 在提交说明里输入一句话，比如 `Import Freecat-Blog source`
4. 点击 `Commit to main`
5. 再点击 `Push origin`

GitHub 官方文档当前写明：

- 网页一次最多上传 `100` 个文件
- 网页上传时单个文件不能超过 `25 MiB`

而这套项目文件很多，直接走本地同步更稳，也更适合后面长期更新。

</details>

---

## 不论走哪条路线，接下来都一样

### 开始写文章：使用 `writing/`

`writing/` 是你最常用的文件夹。每一篇 Markdown 文件就是一篇文章。

项目自带了几篇示例文章，你可以：

- 打开它们学习格式
- 复制一份当模板
- 删除不需要的示例文章
- 新建自己的 `.md` 文件

一篇文章通常长这样：

```md
---
title: 我的第一篇文章
date: 2026-05-03
tag:
  - 随笔
cover:
show_cover: false
show_image_captions: true
description: 这里写文章摘要
pinned: false
show: true
---

这里开始写正文。
```

### 个性化网站：使用 `Control/`

`Control/` 是网站控制台。新手想把模板改成自己的博客，优先改这里。

| 文件 | 负责什么 |
| --- | --- |
| `site_网站属性.md` | 网站标题、站点名、首页介绍、头像、主题、正式域名 |
| `social_社交媒体.md` | 社交媒体图标、主页链接、联系方式、推广链接 |
| `about_关于页面.md` | About 页面的标题、介绍和头像 |

### 每次改完记得同步到 GitHub

在 `GitHub Desktop` 里：

1. 可以看到你改了哪些文件
2. 写一句提交说明
3. 点击提交
4. 点击同步到 GitHub

只要同步成功，部署平台就会自动开始更新网站。

---

## 部署参数速查表

这是最容易填错的地方，先单独列出来。

| 项目 | 应该填写什么 |
| --- | --- |
| 仓库 | 你自己的私有 GitHub 仓库 |
| 根目录 / Root Directory / Base Directory | `all` |
| 构建命令 / Build Command | `npm run build` |
| 构建输出目录 / Output Directory / Publish Directory | `dist` |
| 环境变量 / Environment Variable | `NODE_VERSION=20`（可选，建议固定） |

注意：

- 如果平台已经把项目根目录切到 `all`，输出目录就写 `dist`
- 不要写成 `all/dist`
- Cloudflare Pages 新版默认 Node.js 22；如果你想和本文档保持一致，建议加上 `NODE_VERSION=20`

---

## 方案一：Cloudflare Pages 详细小白教程

### 第 1 步：注册并登录 Cloudflare

官网：
<https://dash.cloudflare.com/>

如果你还没有账户：

1. 注册 Cloudflare
2. 登录后台

### 第 2 步：进入 Pages 并创建项目

登录后按这个顺序走：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，点击「创建应用程序」

![01](../all/image/Tutorial/01.png)

2. 选择「部署 Pages」

![02](../all/image/Tutorial/02.png)

3. 选择「导入现有 Git 储存库」

![03](../all/image/Tutorial/03.png)

4. 选择你自己的博客仓库

![04](../all/image/Tutorial/04.png)

### 第 3 步：填写构建配置并部署（最关键的一步）

项目名称可以自由设置。**关键参数严格按下表填写**：

| Cloudflare 界面中文 | Cloudflare UI English | 应填写的值 |
| --- | --- | --- |
| 框架预设 | Framework preset | 保持 `无 / None`，或者不选预设 |
| 根目录（高级） | Root directory (advanced) > Path | `all` |
| 构建命令 | Build command | `npm run build` |
| 构建输出目录 | Build output directory | `dist` |
| 环境变量（选填） | Environment variables (optional) | `NODE_VERSION` = `20` |

![05](../all/image/Tutorial/05.png)

> **最容易踩的坑：** `构建输出目录` 要填 `dist`，**不是** `all/dist`。因为你已经把根目录设成 `all` 了，再加一遍 `all/` 就找不到产物了。

填好后点击 `Save and Deploy（保存并部署）`，等待构建完成（一般 1–3 分钟）。

### 第 4 步：完成部署并访问默认网址

构建完成后，Cloudflare 会给你一个默认网址（类似 `xxx.pages.dev`），打开就能看到自己的博客了。

![06](../all/image/Tutorial/06.png)

### 第 5 步：以后怎么更新网站

以后你不需要再来 Cloudflare 手动上传文件。

正确流程是：

1. 在本地写文章或改配置
2. 打开 `GitHub Desktop`
3. 提交改动
4. 同步到 GitHub
5. Cloudflare 自动重新构建
6. 网站自动更新

### 第 6 步：绑定自己的域名

由于 Cloudflare 被墙，所以想要对外展示，通常需要绑定自定义域名。具体教程自行 [Google](https://www.google.com)。

免费域名推荐：
<https://blog.freeorg.dpdns.org/posts/%E5%85%8D%E8%B4%B9%E5%9F%9F%E5%90%8D%E7%94%B3%E8%AF%B7%E6%8C%87%E5%8D%97.html>

[DNSHE](https://my.dnshe.com/) 自动续期项目：
<https://github.com/OUBIGFA/dnshe-auto-renew>

### 第 7 步：Cloudflare Pages 最常见的 4 个坑

#### 坑 1：根目录（Root directory）填错

一定要填 `all`，因为实际构建项目在这个子目录里。如果不填，平台会从仓库根目录找 `package.json`，肯定找不到。

#### 坑 2：输出目录填成 `all/dist`

不对。

正确写法是 `dist`。因为根目录已经切到 `all`，输出路径是相对根目录算的。

#### 坑 3：看见默认框架就随便选

这个项目不是常规 React / Next.js 网站，框架预设直接选 `None / 无` 最稳，让平台老老实实跑 `npm run build`。

#### 坑 4：网站没更新就以为失败了

很多时候只是缓存问题。

先去 Cloudflare 后台看一眼最新一次构建是不是成功，再用 `Ctrl + F5` 强制刷新页面，最后才判断是不是真的没更新。

### Cloudflare Pages 一句话版

如果你已经会了，记住这一句就够：

`创建应用程序 → 部署 Pages → 导入现有 Git 储存库 → 选择目标仓库 → 根目录填 all → 构建命令填 npm run build → 构建输出目录填 dist → Save and Deploy`

---

<details>
<summary><b>🚀 方案二：Vercel 详细小白教程 — 点击展开</b></summary>

<br>

如果你已经有 Vercel 账户，或者你就是习惯用 Vercel，这个方案也完全没问题。

### 第 1 步：注册并登录 Vercel

官网：
<https://vercel.com/>

如果还没有账户：

1. 注册 Vercel
2. 登录后台

### 第 2 步：导入 GitHub 仓库

登录后：

1. 点击 `Add New...`
2. 选择 `Project`
3. 连接 GitHub
4. 授权 Vercel 访问你的仓库
5. 选择你自己的博客仓库
6. 点击导入

### 第 3 步：填写项目配置（最关键的一步）

按下表逐项填写：

| 字段 | 应填写的值 |
| --- | --- |
| Framework Preset | 保持默认即可；如果让你手动选，选最普通的静态构建思路，不要乱改成其他框架 |
| Root Directory | `all` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version（如能设置） | `20` |

> **最容易踩的坑：** `Output Directory` 填 `dist`，**不是** `all/dist`，因为 `Root Directory` 已经切到 `all` 了。

### 第 4 步：点击部署

填完后：

1. 点击 `Deploy`
2. 等待 Vercel 构建完成（一般 1–3 分钟）
3. 成功后会给你一个默认网址

这时网站就上线了。

### 第 5 步：以后怎么更新网站

后续更新逻辑和 Cloudflare 一样：

1. 本地改文章或配置
2. 在 `GitHub Desktop` 提交
3. 同步到 GitHub
4. Vercel 自动重新构建
5. 网站自动更新

### 第 6 步：绑定自己的域名

如果你要改成自己的网址：

1. 进入项目设置
2. 找到 `Domains`
3. 添加你的域名
4. 按 Vercel 提示配置解析

### 第 7 步：Vercel 最常见的 4 个坑

#### 坑 1：Root Directory 没改

默认经常不是 `all`，你要手动改。

#### 坑 2：输出目录没填或填成 `all/dist`

正确写法是 `dist`。已经把 `Root Directory` 切到 `all` 了，再加一遍 `all/` 就找不到产物。

#### 坑 3：把这个项目误当成需要服务器的项目

这套博客本质上是 `静态构建`，不是你自己去搭一台服务器。

#### 坑 4：改了文章却没同步 GitHub

只在本地改，不同步到 GitHub，Vercel 不会知道你更新了什么。

### Vercel 一句话版

`导入 GitHub 仓库 → Root Directory 填 all → Build Command 填 npm run build → Output Directory 填 dist → 部署`

</details>

---

## Cloudflare Pages 和 Vercel，到底选哪个

### 如果你是完全新手

优先选 `Cloudflare Pages`。

原因：

- 更适合纯静态博客
- 长期托管更稳
- 域名和 CDN 配合更顺

### 如果你已经在用 Vercel

直接用 `Vercel` 就行。

原因：

- 学习成本更低
- 不用额外适应新后台
- 个人博客完全足够

### 如果你怕选错

放心，这两个平台都可以随时切换。

因为内容在你本地和 GitHub，不锁死在某个平台里。

---

## 日常使用流程，记住这一条就够

以后你每次更新博客，标准流程就是：

1. 在本地写文章
2. 保存文件
3. 用 `GitHub Desktop` 提交并同步
4. 等部署平台自动更新
5. 打开网站检查结果

只要这一条跑通，博客就能长期稳定使用。

---

## 进阶教程

这一部分不是让你一上来就学完。

正确顺序是：

1. 先把博客部署成功
2. 先能稳定发文章
3. 再开始做个性化和工作流优化

---

## 进阶一：用 Obsidian 做本地写作中心

这是最推荐的新手进阶路线。

### 为什么推荐 Obsidian

- 本地文件可控
- 写 Markdown 很舒服
- 双链、标签、搜索都很强
- 很适合长期积累个人知识库

### 最适合你的使用方式

你可以把这个博客仓库直接当成一个 Obsidian 仓库来使用。

这样做的好处：

- 平时就在 Obsidian 里写文章
- 文章天然是本地文件
- 写完后再用 GitHub 同步
- 写作和发布是一套连续动作

### 推荐工作流

1. 用 Obsidian 打开你的博客本地文件夹
2. 在 `writing` 目录写文章
3. 改完后检查文章头部属性
4. 用 GitHub Desktop 同步
5. 等待平台自动部署

### 你真正需要养成的习惯

- 写完就同步
- 大改前先同步一次
- 不要把“还没保存的内容”只留在某个临时软件里

这样你的内容安全性会高很多。

---

## 进阶二：把 Control 文件夹当成网站总控制台

这一部分是整套博客最值得理解的地方之一。

你可以把 `Control` 文件夹理解成：

`不改代码，也能改网站核心信息的控制区`。

> 编辑规则：所有参数都写在文件最顶部 `---` 包裹的 Frontmatter 区块里，格式是 `键: 值`，冒号后必须保留一个空格。
> 文件里那些以 `_01`、`_02`、`_03` 开头的字段是注释行，仅用来说明上一行参数的作用，**不要删除也不要改名**。

### 1. `site_网站属性`

这里通常负责网站的基础属性，比如：

- 网站名称
- 网站描述
- 头像
- 网站图标
- 默认主题
- 其他全站基础信息

适合什么时候改：

- 你刚搭好博客，准备换成自己的名字
- 想替换成自己的头像、Logo、站点图标
- 想统一网站整体气质

#### `site_网站属性` 全参数详解

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `site_title` | `FreeCat Blog` | 浏览器标签页上显示的网页标题 |
| `site_favicon` | 空 | 浏览器标签页上显示的网页图标 URL；留空就用内置图标 |
| `site_name` | `FreeCat` | 站内顶部显示的站位名称 |
| `site_logo_icon` | 空 | 站内 Logo 图标，可填 SVG 链接；留空使用默认图标 |
| `hero_title` | `Hi, I'm FreeCat.创建自己的博客 & 创作自己的文字` | 首页主标题 / Slogan |
| `hero_subtitle` | 一段中英文介绍 | 首页详情介绍文案 |
| `hero_avatar` | 空 | 首页个人头像 URL |
| `posts_per_page` | 空 | 首页文章显示数量；空 = 默认 `8`；填 `0` = 全部显示 |
| `footer_copyright` | `© FreeCat \| Curiosity is the best motivation.` | 网站底部版权信息 |
| `theme_system` | `true` | 跟随系统：根据浏览器或操作系统设置自动切换明暗 |
| `theme_light` | `false` | 浅色模式：全站强制使用明亮风格 |
| `theme_dark` | `false` | 深色模式：全站强制使用暗黑风格 |
| `site_url` | `https://blog.freeorg.dpdns.org` | 网站正式域名，用于生成 Sitemap 和 Canonical 标签 |

主题三个开关的搭配规则：

- `theme_system`、`theme_light`、`theme_dark` 三个里只把其中一个写成 `true`，另外两个保持 `false`
- 三个都是 `false` 时，会自动回退到跟随系统
- 不要三个一起写 `true`，会冲突

### 2. `social_社交媒体`

这里通常负责外部链接和社交入口，比如：

- 社交媒体主页
- 友链
- 联系方式
- 推广链接

你可以改什么：

- 图标
- 标题
- 跳转地址
- 展示顺序

适合什么时候改：

- 你想挂自己的主页
- 你想放公众号、频道、社媒链接
- 你想加朋友网站或合作入口

#### `social_社交媒体` 全参数详解

每个社交平台都对应 3 个参数：是否启用、自定义图标、跳转链接。

| 平台 | 启用开关 | 自定义图标 | 主页链接 |
| --- | --- | --- | --- |
| Twitter / X | `twitter_enabled` | `twitter_icon_url` | `twitter_url` |
| Instagram | `instagram_enabled` | `instagram_icon_url` | `instagram_url` |
| GitHub | `github_enabled` | `github_icon_url` | `github_url` |
| Behance | `behance_enabled` | `behance_icon_url` | `behance_url` |
| TikTok | `tiktok_enabled` | `tiktok_icon_url` | `tiktok_url` |
| Facebook | `facebook_enabled` | `facebook_icon_url` | `facebook_url` |

填写说明：

- `*_enabled`：填 `true` 显示该社交图标，填 `false` 直接隐藏
- `*_icon_url`：留空时使用项目内置的官方图标；想换风格可以填一个图标 URL（推荐 SVG 或正方形 PNG）
- `*_url`：填你自己的社交主页地址，比如 `https://x.com/yourname`

实战建议：

- 默认开启的是 `Twitter`、`Instagram`、`GitHub`，你可以直接把 `_url` 改成自己的主页
- 用不到的平台，把对应的 `_enabled` 改成 `false` 就行，不用整段删
- 要新增其他平台时，建议先把这套已有的字段填完整，再考虑改代码扩展

### 3. `about_关于页面`

这里通常负责“关于我”页面的单独内容。

你可以写：

- 你是谁
- 你写这个博客的目的
- 你的兴趣方向
- 联系方式
- 你的项目、作品或其他入口

最实用的写法建议：

- 不要一开始写太长
- 先把身份、内容方向、联系方式写清楚
- 后面再慢慢补充

#### `about_关于页面` 全参数详解

| 参数 | 说明 |
| --- | --- |
| `about_hero_title` | About 页面的标题；留空则自动使用主页 `hero_title` |
| `about_hero_subtitle` | About 页面的详情介绍；留空则自动使用主页 `hero_subtitle` |
| `about_hero_avatar` | About 页面的头像；留空则自动使用主页 `hero_avatar` |

使用建议：

- 想让 About 页和首页保持完全一致 —— 三个字段都留空
- 只想换其中一个（比如换张头像）—— 只填那一项，其他保持空白
- 长篇“关于我”内容仍然推荐另写一篇普通文章，再在导航或社交区指向它

### Control 文件夹通用注意事项

- 改完任何一个 `Control` 文件，记得用 `GitHub Desktop` 提交并同步，否则线上不会变化
- 留空的字段直接保留 `键:` 这种写法即可，不要把整行删掉
- 看到 `_01`、`_02` 这种带下划线的字段不要慌，它们只是注释行，构建时会被忽略
- 改完上线没生效时，先强制刷新浏览器（Ctrl + F5）再判断

---

## 进阶三：先会用皮肤，再考虑改皮肤

这套博客本质上可以理解成：

`一套已经打磨过的博客皮肤 + 一套本地写作和自动发布工作流`

对新手来说，正确顺序不是一上来就改样式，而是：

1. 先直接用
2. 先稳定写
3. 先形成更新习惯
4. 再去改外观和功能

为什么这样更合理：

- 你先上线，才有反馈
- 你先写内容，才知道自己真正缺什么
- 你先稳定使用，后面改动才不会越改越乱

一句话：

先把它当一套成熟皮肤来用，后面再把它慢慢改成你的样子。

---

## 进阶四：以后你还能拿它做什么

### 1. 不只是博客，也可以做个人网站

这套方案不是只能写文章。

同样的逻辑，也可以做：

- 个人主页
- 作品集
- 知识库网站
- 项目展示站
- 品牌介绍页

原因很简单：

- 本地写内容
- GitHub 做版本管理
- 平台自动部署

这套链路本身就很通用。

### 2. 不只是文章，也可以顺手完成云备份

哪怕你暂时不做网站，`GitHub` 也可以先当免费云备份来用。

适合备份：

- 笔记
- 草稿
- 资料整理
- 文案
- Markdown 文档

---

## 进阶五：如何更高效地配合 AI 使用

如果你习惯用 Markdown 写作，其实很适合配合各种 AI 工具。

### 为什么这套工作流和 AI 很搭

- Markdown 是纯文本，AI 最容易处理
- 编程软件天然支持 Markdown
- 很多工具本身就内置 AI
- 你的内容是本地文件，更方便反复整理和改写

### 最实用的 AI 用法

你可以直接让 AI 帮你做这些事：

- 润色文章
- 生成标题
- 改写摘要
- 拆分长文结构
- 优化排版
- 生成 FAQ
- 想选题
- 想专题策划

### 一个很实用的原则

不要让 AI 替你“假装思考”。

更好的方式是：

- 你先写出自己的内容
- 再让 AI 帮你整理、补强、压缩、扩展

这样文章会更像你，而不是一股模板味。

编程软件参考：

>[用户体验拉满的编程软件汇总](https://free-blog-pied.vercel.app/posts/%E7%BC%96%E7%A8%8B%E8%BD%AF%E4%BB%B6%E6%B1%87%E6%80%BB.html)

---

## 常见问题

### 我必须会编程吗

不用。

如果你只是写文章并完成部署，按这篇教程一步步做就够了。

### 我必须先买域名吗

不用。

Cloudflare Pages 和 Vercel 都会先给你一个默认网址，后面想换自己的域名再说。

### 为什么我本地改完了，网站没变

先检查这几件事：

1. 你有没有保存文件
2. 你有没有在 GitHub Desktop 提交
3. 你有没有同步到 GitHub
4. 部署平台有没有开始自动构建
5. 浏览器是不是缓存了旧页面

### 以后能从 Vercel 换到 Cloudflare Pages 吗

可以。

因为内容在你本地和 GitHub，不在平台里锁死。

### 我最容易填错什么

最容易错的是这两个：

- Root Directory / Base Directory 没填 `all`
- Output Directory / Publish Directory 错填成 `all/dist`

再强调一次，正确是：

- 根目录：`all`
- 输出目录：`dist`

---

## 最后给新手的最短行动清单

如果你只想先把它跑起来，直接照这个顺序做：

1. 准备你自己的项目仓库
2. 安装 GitHub Desktop 并拉取到本地
3. 本地打开项目，先写一篇测试文章
4. 提交并同步到 GitHub
5. 去 `Cloudflare Pages` 或 `Vercel` 导入仓库
6. 填：
   - Root Directory：`all`
   - Build Command：`npm run build`
   - Output Directory：`dist`
   - NODE_VERSION：`20`
7. 等待部署成功
8. 打开网站检查效果

如果你完全不想纠结，直接选 `Cloudflare Pages`。
