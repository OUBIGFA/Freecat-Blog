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
    <a href="https://blog.freeorg.dpdns.org">演示站点</a>
  </p>
</div>

## 这个项目是什么？

Freecat Blog 是一个给普通用户准备的个人博客模板。你可以把它理解成：

- `writing/` 是你的文章文件夹，你把 Markdown 文章放进去。
- `Control/` 是你的网站设置文件夹，你在这里改网站名、头像、介绍、社交链接。
- `all/` 是网站生成工具，部署平台会读取这里，把文章和设置生成成真正的网站。

你不需要买服务器，也不需要自己写网页代码。日常使用时，你主要做三件事：

1. 在 `writing/` 里写文章。
2. 在 `Control/` 里改成自己的站点信息。
3. 用 GitHub Desktop 同步到 GitHub，Cloudflare Pages 或 Vercel 会自动重新发布网站。

一句话总结：**这是一个把本地 Markdown 文章自动变成免费网站的博客系统。**

## 新手最该记住的 3 个文件夹

| 文件夹 | 你要不要经常改 | 作用 |
| --- | --- | --- |
| `writing/` | 要 | 放你的博客文章，一篇 Markdown 文件就是一篇文章 |
| `Control/` | 要 | 改网站名称、头像、首页介绍、社交链接、About 页面 |
| `all/` | 一般不要 | 网站构建工程，部署平台会进入这里运行构建命令 |

新手只要记住：**写文章去 `writing/`，改网站信息去 `Control/`，部署构建填 `all`。**

## 它是怎么工作的？

Freecat Blog 的工作链路很短：

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

也就是说，你的内容同时保存在本地电脑和 GitHub 上。部署平台只负责把它们生成网页，不是内容的唯一来源。

## 适合谁？

- 想拥有个人博客，但不想维护服务器的人
- 想用 Markdown 写文章的人
- 想把文章文件掌握在自己手里的人
- 想免费部署到 Cloudflare Pages 或 Vercel 的人
- 想用 Obsidian、VS Code 或任意 Markdown 编辑器写作的人

## 功能特性

- 本地优先：文章就是本地 Markdown 文件，可自己备份、迁移、版本管理
- GitHub 云同步：用 GitHub Desktop 提交和同步，不依赖手动上传网页
- 免费部署：支持 Cloudflare Pages 和 Vercel
- 自动生成页面：首页、文章页、归档页、搜索页、About 页面
- 文章能力：支持标签、封面、摘要、置顶、是否展示等字段
- 阅读优化：处理中英混排、数字和单位间距、代码块、数学公式等展示
- 音频支持：文章里放音频直链即可生成播放器
- 个性化配置：通过 `Control/` 修改网站基础信息，不需要改代码
- 可迁移：内容在你自己的仓库里，未来可以换部署平台

## 准备工作

开始前只需要准备这些：

| 工具 / 账号 | 是否必需 | 用途 |
| --- | --- | --- |
| GitHub 账号 | 必需 | 保存你的博客仓库 |
| GitHub Desktop | 必需 | 把本地改动同步到 GitHub |
| Cloudflare 账号 | 推荐 | 部署博客网站 |
| Vercel 账号 | 可选 | 另一种部署方式 |

GitHub Desktop 下载地址：<https://desktop.github.com/download>

Cloudflare Pages 和 Vercel 二选一即可。完全新手建议先用 Cloudflare Pages。

## 第一次搭建：先把项目变成你自己的仓库

你需要先把 Freecat Blog 放到自己的 GitHub 账号下面。这里有两种方式：

| 路线 | 推荐程度 | 适合谁 | 以后能否同步模板更新 |
| --- | --- | --- | --- |
| GitHub Importer 导入 | 推荐 | 愿意按步骤操作 GitHub 的用户 | 能 |
| 下载 ZIP + 复制粘贴 | 备选 | 小白用户 | 不能直接同步 |

两条路线只选一条，不要同时做。

## 路线 A：GitHub Importer 导入，推荐

这条路线会把 Freecat Blog 完整复制到你的 GitHub 账号里。以后上游模板更新时，你还有机会继续同步。

### 第 1 步：打开 GitHub Importer

1. 登录 GitHub。
2. 打开：<https://github.com/new/import>

### 第 2 步：填写导入信息

| 字段 | 填什么 |
| --- | --- |
| `Your old repository's clone URL` | `https://github.com/OUBIGFA/Freecat-Blog` |
| `Owner` | 你的 GitHub 账号 |
| `Repository name` | 你的仓库名，例如 `my-freecat-blog` |
| `Privacy` | 建议选 `Private` |

然后点击 `Begin import`。通常几十秒到几分钟会完成。

### 第 3 步：用 GitHub Desktop 下载到本地

1. 打开 GitHub Desktop 并登录。
2. 点击 `File` -> `Clone repository`。
3. 选择你刚导入的仓库。
4. 选择一个本地保存位置。
5. 点击 `Clone`。

完成后，你电脑上会有一个完整的博客项目文件夹。

## 路线 B：下载 ZIP + 复制粘贴，备选

不想折腾的小白推荐这个方法。

注意：这条路线搭建出来的仓库，未来不能方便地同步上游模板更新。十分适合小白。

### 第 1 步：新建你自己的 GitHub 仓库

1. 打开：<https://github.com/new>
2. 仓库名可以写 `my-freecat-blog`。
3. 可见性选 `Private`。
4. 勾选 `Add a README file`。
5. 点击 `Create repository`。

### 第 2 步：下载 Freecat Blog 源码

1. 打开原项目：<https://github.com/OUBIGFA/Freecat-Blog>
2. 点击 `Code`。
3. 点击 `Download ZIP`。
4. 解压下载好的 ZIP。

### 第 3 步：把你的仓库下载到本地

1. 打开 GitHub Desktop。
2. 选择你刚新建的仓库。
3. 点击 `Clone` 下载到本地。

### 第 4 步：复制源码

1. 打开刚解压出来的 Freecat Blog 文件夹。
2. 进入真正放源码的那一层目录。
3. 复制里面的全部内容。
4. 粘贴到 GitHub Desktop 下载下来的本地仓库文件夹里。
5. 如果提示替换 `README.md`，选择替换。

不要把最外层整个文件夹丢进去。正确结果是：你的仓库根目录里能直接看到 `all/`、`Control/`、`writing/`、`README.md`。
![10](all/image/Tutorial/10.png)

### 第 5 步：第一次同步到 GitHub

1. 回到 GitHub Desktop。
2. 左侧会看到很多新增文件。
3. 提交说明写 `Import Freecat Blog source`。
4. 点击 `Commit to main`。
5. 点击 `Push origin`。

## 开始写文章：使用 `writing/`

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

常用字段说明：

| 字段 | 作用 |
| --- | --- |
| `title` | 文章标题 |
| `date` | 发布日期 |
| `tag` | 文章标签，可以写多个 |
| `cover` | 封面图片链接 |
| `show_cover` | 是否在文章页显示封面 |
| `description` | 文章摘要，留空会自动截取 |
| `pinned` | 是否置顶 |
| `show` | 是否在网站上展示 |

写完文章后，保存文件，然后用 GitHub Desktop 提交并同步。同步成功后，部署平台会自动更新网站。

## 个性化网站：使用 `Control/`

`Control/` 是网站控制台。新手想把模板改成自己的博客，优先改这里。

| 文件 | 负责什么 |
| --- | --- |
| `site_网站属性.md` | 网站标题、站点名、首页介绍、头像、主题、正式域名 |
| `social_社交媒体.md` | 社交媒体图标、主页链接、联系方式、推广链接 |
| `about_关于页面.md` | About 页面的标题、介绍和头像 |

这些文件的顶部都有 `---` 包起来的配置区，格式类似：

```yaml
---
site_title: FreeCat Blog
site_name: FreeCat
hero_title: Hi, I'm FreeCat.
---
```

编辑时记住 4 点：

- 冒号后面保留一个空格，例如 `site_name: FreeCat`
- 不想填的字段可以留空，但不要删掉整行
- `_01`、`_02` 这类下划线开头的行是说明文字，不要改字段名
- 改完必须用 GitHub Desktop 提交并同步，线上网站才会更新

### `site_网站属性.md` 常用设置

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

主题设置只需要让 `theme_system`、`theme_light`、`theme_dark` 其中一个为 `true`。

### `social_社交媒体.md` 常用设置

每个平台通常有 3 个字段：

| 字段类型 | 例子 | 作用 |
| --- | --- | --- |
| 是否启用 | `github_enabled: true` | `true` 显示，`false` 隐藏 |
| 自定义图标 | `github_icon_url:` | 留空用默认图标，也可以填自己的图标 URL |
| 主页链接 | `github_url: https://github.com` | 点击图标后跳转到哪里 |

不用的平台，把对应的 `*_enabled` 改成 `false` 即可。

### `about_关于页面.md` 常用设置

| 字段 | 说明 |
| --- | --- |
| `about_hero_title` | About 页面的标题，留空则使用首页标题 |
| `about_hero_subtitle` | About 页面的介绍，留空则使用首页介绍 |
| `about_hero_avatar` | About 页面的头像，留空则使用首页头像 |

如果想让 About 页面和首页保持一致，这三个字段都留空即可。

## 本地预览和构建

如果你只想写文章和部署，不一定需要在本地构建。Cloudflare Pages 或 Vercel 会自动构建。

如果你想在电脑上提前检查网站，可以这样做：

```bash
cd all
npm install
npm run build
```

构建成功后会生成：

```text
all/dist/
```

`all/dist/` 是生成出来的网站文件，不需要手动修改，也不需要提交到 GitHub。

## 部署到 Cloudflare Pages，推荐

Cloudflare Pages 适合长期稳定运行个人博客。部署时重点是填对构建参数。

### 第 1 步：进入 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 创建应用程序。

![Cloudflare step 1](all/image/Tutorial/01.png)

3. 选择 Pages。

![Cloudflare step 2](all/image/Tutorial/02.png)

4. 选择导入现有 Git 仓库。

![Cloudflare step 3](all/image/Tutorial/03.png)

5. 选择你自己的博客仓库。

![Cloudflare step 4](all/image/Tutorial/04.png)

### 第 2 步：填写构建参数

项目名称可以自由填写。关键参数按下表填写：

| Cloudflare 中文界面 | Cloudflare English UI | 填写值 |
| --- | --- | --- |
| 框架预设 | Framework preset | `None` / `无` / 不选预设 |
| 根目录（高级） | Root directory (advanced) > Path | `all` |
| 构建命令 | Build command | `npm run build` |
| 构建输出目录 | Build output directory | `dist` |
| 环境变量 | Environment variables | `NODE_VERSION` = `20` |

![Cloudflare step 5](all/image/Tutorial/05.png)

然后点击 `Save and Deploy`，等待构建完成。


### 第 3 步：访问网站
![Cloudflare step 6](all/image/Tutorial/06.png)
构建完成后，Cloudflare 会给你一个默认网址。你可以先用这个默认网址访问博客。

如果想使用自己的域名，可以在 Cloudflare Pages 里绑定自定义域名。

免费域名教程：<https://blog.freeorg.dpdns.org/posts/%E5%85%8D%E8%B4%B9%E5%9F%9F%E5%90%8D%E7%94%B3%E8%AF%B7%E6%8C%87%E5%8D%97.html>

DNSHE 自动续期项目：<https://github.com/OUBIGFA/dnshe-auto-renew>

## 部署到 Vercel，备选

如果你已经在用 Vercel，也可以部署到 Vercel。

1. 登录 [Vercel](https://vercel.com/)。
2. 点击 `Add New...` -> `Project`。
3. 连接 GitHub，选择你的博客仓库。
4. 按下表填写：

| 字段 | 填写值 |
| --- | --- |
| Framework Preset | 保持默认或选静态构建 |
| Root Directory | `all` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | `20` |

5. 点击 `Deploy`。

绑定自定义域名时，进入项目设置里的 `Domains`，按提示配置解析即可。

## 以后怎么更新博客？

部署成功后，日常更新只需要 5 步：

1. 在 `writing/` 里新增或修改文章。
2. 如果需要，在 `Control/` 里修改网站信息。
3. 保存文件。
4. 打开 GitHub Desktop，点击 `Commit to main`。
5. 点击 `Push origin`。

![GitHub Desktop commit](all/image/Tutorial/08.png)

![GitHub Desktop push](all/image/Tutorial/09.png)

同步成功后，Cloudflare Pages 或 Vercel 会自动重新构建。等一会儿刷新网站即可看到新内容。

## 项目结构

```text
Freecat-Blog/
├── Control/                # 网站基础配置，新手主要改这里
│   ├── site_网站属性.md
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

## 文章里的音频播放器

在文章中使用引用格式加音频直链，可以自动生成播放器：

```md
>[这是示例音频](https://example.com/audio.m4a)
```

如果链接没有明显音频后缀，可以在标题里加音乐符号强制识别：

```md
>[🎵这是示例音频](https://example.com/audio)
```

支持的格式包括：`.mp3`、`.m4a`、`.wav`、`.ogg`、`.aac`、`.flac`、`.opus`。

辅助工具：

- 网盘分享链接转直链工具：<https://lz.qaiu.top/>
- 网盘直链获取工具：<https://link.gimhoy.com/>
- 小飞机云盘：<https://www.feijipan.com>

## 配合 Obsidian 写作

你可以直接用 Obsidian 打开这个博客仓库。推荐在 `writing/` 目录下写文章。

这样做的好处是：

- 文章都在本地，方便管理
- 可以使用 Obsidian 的双链、标签、搜索
- 写完后用 GitHub Desktop 同步，网站自动发布

## 同步上游模板更新，进阶

如果你当初用的是 GitHub Importer 路线，可以同步上游 Freecat Blog 的模板更新。

如果你当初用的是 ZIP + 复制粘贴路线，请看本节最后的兜底方案。

### 第一次同步前：添加上游仓库

在命令行里进入你的本地仓库目录：

```bash
cd 你的本地仓库完整路径
```

添加上游仓库：

```bash
git remote add upstream https://github.com/OUBIGFA/Freecat-Blog.git
```

检查是否成功：

```bash
git remote -v
```

能看到 `origin` 和 `upstream` 就说明成功。

### 每次同步上游更新

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

### 如果出现冲突

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

- `Control/` 里优先保留你自己的配置
- `writing/` 里优先保留你自己的文章
- `all/` 里通常保留上游模板更新

### ZIP 路线的兜底更新方法

如果你是用 ZIP + 复制粘贴搭建的仓库，不建议强行用上面的 `git merge` 方法。

可以这样手动更新：

1. 重新下载最新版 Freecat Blog ZIP。
2. 解压。
3. 把新版里的 `all/` 文件夹复制到你的仓库，覆盖原有的 `all/` 文件夹。
4. 不要覆盖你自己的 `Control/`、`writing/`。
5. 用 GitHub Desktop 检查改动。
6. 确认没误删内容后，Commit + Push。

## 常见问题

**Q：我必须会编程吗？**
不用。日常只需要改 Markdown 文件和配置文件。

**Q：我主要应该改哪些地方？**
写文章改 `writing/`，改网站信息改 `Control/`。新手一般不要改 `all/`。

**Q：必须买域名吗？**
不用。Cloudflare Pages 和 Vercel 都会先提供默认网址。

**Q：部署时最容易填错哪里？**
`Root Directory` 必须是 `all`，`Output Directory` 必须是 `dist`，不要写成 `all/dist`。

**Q：本地改完后网站没变化怎么办？**
先检查文件是否保存，再检查 GitHub Desktop 是否已经 Push。然后去 Cloudflare Pages 或 Vercel 看是否触发了新构建。最后尝试强制刷新浏览器。

**Q：Cloudflare Pages 和 Vercel 选哪个？**
完全新手推荐 Cloudflare Pages。已经在用 Vercel 的用户可以选 Vercel。内容都在 GitHub，以后可以迁移。

**Q：可以把示例文章删掉吗？**
可以。示例文章都在 `writing/` 里，删除后提交同步即可。

**Q：我已经用 ZIP 路线搭好了，还能改成 Importer 路线吗？**
可以。最稳的办法是重新用 Importer 建一个新仓库，然后把旧仓库里的 `Control/` 和 `writing/` 复制过去，再重新部署或切换部署项目源仓库。

**Q：执行 `git remote add upstream` 提示 `remote upstream already exists` 怎么办？**
说明已经添加过上游。可以运行：

```bash
git remote set-url upstream https://github.com/OUBIGFA/Freecat-Blog.git
```

**Q：执行 `git merge upstream/main` 提示 `refusing to merge unrelated histories` 怎么办？**
通常说明你是 ZIP 路线建的仓库，不适合直接合并上游。请使用上面的 ZIP 兜底更新方法，或者重新用 Importer 建仓。

## 许可证

本项目使用 MIT License。
