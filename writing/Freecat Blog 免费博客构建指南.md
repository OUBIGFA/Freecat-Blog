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
Freecat Blog 是一套面向新手的个人博客模板。本地写 Markdown，把改动同步到 GitHub，Cloudflare Pages 或 Vercel 会自动发布成网站。

不用买服务器，不用维护后台，也不用先学编程。日常只要记住三个文件夹。

| 文件夹 | 功能 | 说明 |
| --- | --- | --- |
| `writing/` | 写文章 | 一篇 Markdown 文件就是一篇博客文章 |
| `Control/` | 改网站信息 | 改网站名、头像、首页介绍、社交链接、About 页面 |
| `all/` | 构建资源 | 部署平台从这里构建网站 |

**写文章去** `writing/`，个性化去 `Control/`，部署构建根目录填 `all`。

---

## 最短部署路径预览

1. 用 GitHub Importer 创建自己的私人博客仓库
2. 去 Cloudflare Pages 或 Vercel 导入仓库构建
3. 等部署完成，打开默认网址确认

---

## 最短使用路径预览

1. 用 GitHub Desktop 拉到本地
2. 本地打开项目，在`writing`文件夹中撰写或存入一篇文章
3. 通过GitHub Desktop提交并同步到 GitHub
4. 等待平台自动部署构建
5. 完成

---

## 就三件事

- 内容在本地，不锁死在任何平台。
- GitHub 负责备份，顺便通知部署平台更新。
- 部署平台只管生成网站，不是你的写作后台。

---

## 新手怎么挑部署平台

### 首选：Cloudflare Pages

适合绝大多数个人博客。

- 免费
- 稳定
- 配置清晰
- 静态网站托管成熟
- 绑自定义域名方便

### 备选：Vercel

已经有 Vercel 账号、或者习惯用 Vercel 的，也可以直接选它。

- 上手快
- 界面清爽
- 和 GitHub 联动顺
- 个人博客完全够用

完全新手选 Cloudflare Pages；已经在用 Vercel 的，选 Vercel。两个平台以后想换都容易，内容都在本地和 GitHub 上。

---

## 动手前准备这些

| 项目 | 是否必需 | 说明 |
| --- | --- | --- |
| GitHub 账户 | 必需 | 用于保存你的博客仓库 |
| GitHub Desktop | 必需 | 本地同步工具，[下载地址](https://desktop.github.com/download) |
| Markdown 编辑器 | 必需 | 写文章和改配置，推荐 [Obsidian](https://obsidian.md/zh) |
| Cloudflare 账户 | 推荐 | 用于自动构建和发布网站 |
| Vercel 账户 | 可选 | 另一种自动部署方式 |

GitHub 账户和 GitHub Desktop 是底子，Cloudflare Pages 和 Vercel 二选一。

---

## 第一步：建一个自己的博客仓库

### 1. 登录 GitHub

1. 打开 <https://github.com/>
2. 登录账号
3. 没有账号就先注册一个

### 2. 打开 Importer 页面

浏览器访问 <https://github.com/new/import>

### 3. 填写导入表单

| 字段 | 应填写的值 |
| --- | --- |
| `Your old repository's clone URL` | `https://github.com/OUBIGFA/Freecat-Blog` |
| `Owner` | 选你自己的 GitHub 账户 |
| `Repository name` | 起一个名字，比如 `my-freecat-blog` |
| `Privacy` | 选 `Private` |

### 4. 开始导入

1. 点页面底部的 `Begin import`
2. 等导入完成，一般几十秒到几分钟
3. 看到 `Your new repository ... is ready` 就成功了
4. 点进新仓库，确认能看到 `all/`、`Control/`、`writing/` 等文件夹

### 5. 下载到本地

1. 装好并登录 GitHub Desktop
2. 点 `File` → `Clone repository`
3. 选刚导入好的仓库
4. 选一个好找的本地位置
5. 点 `Clone`

到这一步，电脑里就有完整的 Freecat Blog 项目了。

---

## 第二步：部署参数速查表

用 Cloudflare Pages 还是 Vercel，关键参数都一样。

| 项目 | 应该填写什么 |
| --- | --- |
| 仓库 | 你自己的 GitHub 仓库 |
| 根目录 / Root Directory / Base Directory | `all` |
| 构建命令 / Build Command | `npm run build` |
| 构建输出目录 / Output Directory / Publish Directory | `dist` |
| 环境变量 / Environment Variable | `NODE_VERSION=20` |

最容易错的是输出目录。正确写 `dist`，不要写 `all/dist`，因为根目录已经切到 `all`，输出目录要按它里面的相对路径写。

把 `NODE_VERSION` 显式设为 `20`，免得受平台默认 Node 版本变动影响。

---

## 方案一：部署到 Cloudflare Pages

### 第 1 步：进入 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点「创建应用程序」

![01](../all/image/Tutorial/01.png)

1. 选「Pages」

![02](../all/image/Tutorial/02.png)

1. 选「导入现有 Git 储存库」

![03](../all/image/Tutorial/03.png)

1. 选你自己的博客仓库

![04](../all/image/Tutorial/04.png)

### 第 2 步：填写构建配置

项目名称随意起，关键参数按下表填。

| Cloudflare 界面中文 | Cloudflare UI English | 应填写的值 |
| --- | --- | --- |
| 框架预设 | Framework preset | `无 / None`，或不选预设 |
| 根目录（高级） | Root directory (advanced) > Path | `all` |
| 构建命令 | Build command | `npm run build` |
| 构建输出目录 | Build output directory | `dist` |
| 环境变量（选填） | Environment variables | `NODE_VERSION` = `20` |

![05](../all/image/Tutorial/05.png)

填好点 `Save and Deploy`，等构建跑完。一般 1-3 分钟。

### 第 3 步：访问默认网址

构建完成后，Cloudflare 会给你一个 `xxx.pages.dev` 形式的默认网址。打开能看到博客页面，就说明部署成功。

![06](../all/image/Tutorial/06.png)

### 第 4 步：以后怎么更新网站

之后不用手动上传文件，按这个流程走。

1. 本地写文章或改配置
2. 用 GitHub Desktop 提交并同步到 GitHub
3. Cloudflare 自动重新构建
4. 网站自动更新

### 第 5 步：绑定自己的域名

想用自己的网址，在 Cloudflare Pages 项目里绑定自定义域名，按平台提示改 DNS 解析就行。

可以参考：

- [免费域名申请指南](https://blog.freeorg.dpdns.org/posts/%E5%85%8D%E8%B4%B9%E5%9F%9F%E5%90%8D%E7%94%B3%E8%AF%B7%E6%8C%87%E5%8D%97.html)
- [DNSHE 自动续期项目](https://github.com/OUBIGFA/dnshe-auto-renew)

### Cloudflare Pages 常见坑

#### 坑 1：根目录没填 `all`

项目实际在 `all/` 里。不填的话，平台会从仓库根目录找 `package.json`，多半构建失败。

#### 坑 2：输出目录填成 `all/dist`

根目录已经是 `all`，输出目录直接写 `dist` 就行，不用再带前缀。

#### 坑 3：随便选了框架预设

这个项目不属于 Next.js、Nuxt、Astro 这类框架，预设选 `None / 无` 最稳。

#### 坑 4：网站没更新就以为失败

先看 Cloudflare 后台最新那次构建有没有成功，再 `Ctrl + F5` 强刷一下。很多时候只是浏览器缓存。

---

## 方案二：部署到 Vercel

习惯用 Vercel 的，按这个流程来。

### 第 1 步：导入 GitHub 仓库

1. 登录 [Vercel](https://vercel.com/)
2. 点 `Add New...`
3. 选 `Project`
4. 连接 GitHub
5. 授权 Vercel 访问你的仓库
6. 选你自己的博客仓库

### 第 2 步：填写项目配置

| 字段 | 应填写的值 |
| --- | --- |
| Framework Preset | 保持默认，或选择静态/其他类型 |
| Root Directory | `all` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version（如能设置） | `20` |

最容易踩的坑还是 `Output Directory`，填 `dist`，别带 `all/`。

### 第 3 步：部署并访问

1. 点 `Deploy`
2. 等 Vercel 构建完成，一般 1-3 分钟
3. 成功后打开 Vercel 给的默认网址

### 第 4 步：绑定自己的域名

进项目设置里的 `Domains`，加上自己的域名，按 Vercel 提示改解析。

---

## 第三步：开始写文章

`writing/` 是日常用得最多的文件夹，一个 `.md` 文件就是一篇文章。可以打开示例文章看格式、复制一篇当模板、新建自己的 `.md`，不要的示例直接删掉。

一篇文章通常长这样。

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

常用字段：

| 字段 | 作用 |
| --- | --- |
| `title` | 文章标题，留空时用文件名 |
| `date` | 发布或显示日期 |
| `tag` | 标签，可以写多个 |
| `cover` | 封面图片 URL，留空则没有封面 |
| `show_cover` | 是否在文章详情页显示封面 |
| `show_image_captions` | 是否显示图片下方说明文字 |
| `description` | 文章摘要，留空则自动截取 |
| `pinned` | 是否置顶 |
| `show` | 是否在网站上展示 |

---

## 文章内音频播放器

在文章里用引用格式 + 音频直链，会自动出现播放器。

```md
>[这是示例格式](https://xxx.xxx/example.m4a)
```

链接没有明显音频后缀的话，在标题里加个 `🎵` 强制识别。

```md
>[🎵这是示例格式](https://xxx.xxx/example)
```

支持的常见音频格式：`.mp3`、`.m4a`、`.wav`、`.ogg`、`.aac`、`.flac`、`.opus`。

辅助工具：

- [网盘分享链接转直链工具](https://lz.qaiu.top/)
- [网盘直链获取工具](https://link.gimhoy.com/)
- [小飞机云盘](https://www.feijipan.com)

---

## 第四步：个性化网站

`Control/` 是网站控制台。想把模板改成自己的博客，主要就改这里。

| 文件 | 负责什么 |
| --- | --- |
| `site_网站属性.md` | 网站标题、站点名、首页介绍、头像、主题 |
| `SEO_搜索优化.md` | 正式域名、SEO 摘要、作者信息、AI 爬虫和 llms.txt |
| `social_社交媒体.md` | 社交媒体图标、主页链接、联系方式、推广链接 |
| `about_关于页面.md` | About 页面的标题、介绍和头像 |

编辑要点：

- 所有参数都写在文件顶部 `---` 包起来的 Frontmatter 区块里
- 格式是 `键: 值`，冒号后留一个空格
- 留空字段保留 `键:` 即可，别删整行
- `_01`、`_02` 这类是说明文字，构建时会忽略，别改名

### `site_网站属性.md`

常改的几项：网站名称、网站描述、首页标题、头像、网站图标、默认主题、每页显示文章数量、底部版权文字。

主题设置里，下面三个字段只能有一个为 `true`。

- `theme_system`
- `theme_light`
- `theme_dark`

三个都为 `false` 时，会自动回退到跟随系统。别三个一起写 `true`。

### `social_社交媒体.md`

每个社交平台一般有三类字段。

| 字段类型 | 例子 | 作用 |
| --- | --- | --- |
| 启用开关 | `github_enabled: true` | `true` 显示，`false` 隐藏 |
| 自定义图标 | `github_icon_url:` | 留空走默认图标，也可填自己的图标 URL |
| 主页链接 | `github_url: https://github.com` | 点图标后跳转到哪 |

用不到的平台，把对应的 `*_enabled` 改成 `false`。

### `about_关于页面.md`

常用字段。

| 字段 | 说明 |
| --- | --- |
| `about_hero_title` | About 页面的标题，留空则用首页标题 |
| `about_hero_subtitle` | About 页面的介绍，留空则用首页介绍 |
| `about_hero_avatar` | About 页面的头像，留空则用首页头像 |

想让 About 和首页保持一致，这三个字段都留空即可。

---

## 日常更新流程

以后每次更新博客，照这个流程走。

1. 在本地写文章或改配置
2. 保存文件
3. 打开 GitHub Desktop
4. 写一句提交说明
5. 点 `Commit to main`
6. 点 `Push origin`
7. 等部署平台自动更新
8. 打开网站检查结果

这一套跑通，博客就能长期稳定用下去。

---

## 模板更新怎么同步过来

Freecat Blog 会持续更新模板工程，比如修 bug、加功能、优化样式。仓库里自带一个 GitHub Actions 工作流：`.github/workflows/sync-upstream.yml`。

每周二北京时间凌晨 02:17，它会自动从主仓库 [OUBIGFA/Freecat-Blog](https://github.com/OUBIGFA/Freecat-Blog) 同步模板文件，提交到你的仓库。部署平台收到新提交后会自动重建网站。

同步范围：

- 会同步：`all/`、`README.md`、`README.en.md`
- 会保留：`all/git-dates.json`
- 不会动：`Control/`、`writing/`、`.github/`、`.gitignore`

也就是说，你写的文章和网站配置不会被模板更新覆盖。

想马上手动触发一次同步：

1. 打开你的 GitHub 仓库
2. 点顶部 `Actions`
3. 左侧选 `Sync upstream template files`
4. 右上角点 `Run workflow`
5. 再点一次 `Run workflow` 确认

几个细节：

- 上游模板没变化时，工作流会跳过提交。
- GitHub Actions 定时触发可能延迟几分钟，属正常现象。
- 改过 `all/` 里的模板、样式或构建脚本的话，自动同步可能覆盖这些改动。新手通常别动 `all/`。

---

## 进阶：用 Obsidian 做本地写作中心

可以把这个博客仓库直接当成 Obsidian 仓库用。

推荐流程：

1. 用 Obsidian 打开本地博客文件夹
2. 在 `writing/` 目录写文章
3. 改完顺手检查文章头部属性
4. 用 GitHub Desktop 同步
5. 等平台自动部署

养成三个习惯：

- 写完就同步
- 大改前先同步一次
- 别把"还没保存的内容"只留在某个临时软件里

这样内容更安全。

---

## 进阶：本地预览和构建

只是写文章和部署的话，不用本地构建，平台会自动处理。

想在本机提前预览网站，先装 [Node.js 20+](https://nodejs.org/)，再在项目里运行：

```bash
cd all
npm install
npm run build
```

构建产物在 `all/dist/`。这是自动生成的目录，不用手动改，也不用提交到 GitHub。

---

## 进阶：先用好皮肤，再考虑改皮肤

这套博客可以理解成「一套博客皮肤 + 一套本地写作和自动发布工作流」。

对新手来说，合适的顺序是这样：

1. 先部署成功
2. 先稳定写文章
3. 先形成更新习惯
4. 再慢慢改外观和功能

先上线才有反馈，先写内容才知道自己真正缺什么，先稳定使用，后面改动才不会越改越乱。

---

## 进阶：怎么搭配 AI 一起用

Markdown 是纯文本，整理、改写、拆分都方便，特别适合配合 AI 工具用。

可以让 AI 帮你做这些事：

- 润色文章
- 生成标题
- 改写摘要
- 拆分长文结构
- 优化排版
- 想选题
- 做专题策划

建议先自己写出内容，再让 AI 整理、补强、压缩或扩展。这样文章更像你写的，不会一股模板味。

编程软件参考：

> [用户体验拉满的编程软件汇总](https://free-blog-pied.vercel.app/posts/%E7%BC%96%E7%A8%8B%E8%BD%AF%E4%BB%B6%E6%B1%87%E6%80%BB.html)

---

## 常见问题

### 我必须会编程吗

不用。只想写文章 + 部署，按这篇教程一步步来就够。

### 我必须先买域名吗

不用。Cloudflare Pages 和 Vercel 都会先给一个默认网址，以后想换自己的域名再说。

### 为什么我本地改完了，网站没变

按顺序检查：

1. 文件有没有保存
2. GitHub Desktop 有没有提交
3. 有没有同步到 GitHub
4. 部署平台有没有开始自动构建
5. 浏览器是不是缓存了旧页面

### 以后能从 Vercel 换到 Cloudflare Pages 吗

可以。内容都在本地和 GitHub 上，不锁死在哪个平台。

### 我最容易填错什么

最常出错的就这两项：

- Root Directory / Base Directory 没填 `all`
- Output Directory / Publish Directory 错填成 `all/dist`

正确填法：

- 根目录：`all`
- 输出目录：`dist`

### 可以删除示例文章吗

可以。示例都在 `writing/` 里，删掉后提交并同步即可。

### 可以直接改 `all/` 吗

新手不建议。`all/` 是模板工程目录，自动同步上游模板时这里的改动可能被覆盖。日常写作和个性化主要在 `writing/` 和 `Control/` 里改。

