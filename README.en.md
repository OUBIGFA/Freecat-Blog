<div align="center">
  <img src="all/image/freecat_web_icon.png" width="120" alt="Freecat Blog Preview">
  <h1>Freecat Blog</h1>
  <p>Write locally, back up with GitHub, and deploy a personal blog for free</p>
  <p>
    <a href="README.md">简体中文</a> | English
  </p>
  <p>
    <img alt="Platform" src="https://img.shields.io/badge/platform-Web-2563eb">
    <img alt="Node" src="https://img.shields.io/badge/Node-20-339933">
    <img alt="Deploy" src="https://img.shields.io/badge/deploy-Cloudflare%20%7C%20Vercel-f97316">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-111827">
  </p>
  <p>
    <a href="https://freecat-blog.pages.dev">Live Demo</a>
  </p>
</div>

> This guide is written for users with **zero programming background**. **Read top-down, follow each step, and you will have your own free blog online.**

## Table of Contents

- [1. What Is This Project](#1-what-is-this-project)
- [2. The Three Most Important Folders](#2-the-three-most-important-folders)
- [3. Preparation](#3-preparation)
- [4. Deployment Tutorial: Get Your Blog Online](#4-deployment-tutorial-get-your-blog-online)
  - [Step 1: Make the Project Your Own GitHub Repository](#step-1-make-the-project-your-own-github-repository)
  - [Step 2: Deploy to Cloudflare Pages (Recommended)](#step-2-deploy-to-cloudflare-pages-recommended)
  - [Step 2 Alternative: Deploy to Vercel](#step-2-alternative-deploy-to-vercel)
- [5. Writing Articles: Using `writing/`](#5-writing-articles-using-writing)
- [6. Customizing the Site: Using `Control/`](#6-customizing-the-site-using-control)
- [7. The 5-Step Daily Update Workflow](#7-the-5-step-daily-update-workflow)
- [8. Advanced Features](#8-advanced-features)
- [9. FAQ](#9-faq)
- [License](#license)

---

## 1. What Is This Project

Freecat Blog is a personal blog template for regular users.

**One sentence:** It turns Markdown files on your computer into a free website automatically.

### How It Works

```text
Your computer: write articles in writing/ + edit settings in Control/
            ↓
GitHub Desktop syncs to GitHub with one click
            ↓
Cloudflare Pages / Vercel builds automatically
            ↓
Your blog updates and publishes automatically
```

Your content is stored on **both your local computer and GitHub**. Deployment platforms only generate web pages — even if you switch platforms later, your articles always belong to you.

![01](all/image/Tutorial/00a.png)
![02](all/image/Tutorial/00b.png)
![03](all/image/Tutorial/00c.png)

### Who Is It For

- People who want a personal blog but do not want to buy or maintain a server
- People who want to write in Markdown
- People who want to keep their article files in their own hands
- People who want free deployment with the option to switch platforms later
- People who want to write in Obsidian, VS Code, or any Markdown editor

### What You Get

- Auto-generated home page, article pages, archive, search, and About page
- Articles support tags, cover, summary, pinning, and visibility fields
- Automatic spacing for mixed Chinese/English text, numbers and units, code blocks, and math
- Drop an audio direct link into an article and a player appears automatically
- Edit site name, avatar, and social links without writing any code

---

## 2. The Three Most Important Folders

You only need to remember three folders for the entire project:

| Folder | Edit often? | What it does |
| --- | --- | --- |
| `writing/` | **Yes** | Stores your blog posts. One Markdown file = one article. |
| `Control/` | **Yes** | Edit the site name, avatar, home intro, social links, and About page. |
| `all/` | Usually no | Build workspace. The deployment platform runs the build command in here. |

Remember this sentence: **Write in `writing/`, customize in `Control/`, and set the deployment root directory to `all`.**

---

## 3. Preparation

Before you start, you only need these tools and accounts:

| Tool / Account | Required? | Purpose | Link |
| --- | --- | --- | --- |
| GitHub account | Required | Hosts your blog repository | <https://github.com/signup> |
| GitHub Desktop | Required | Syncs local changes to GitHub | <https://desktop.github.com/download> |
| Cloudflare account | Recommended | Deploys your blog (free) | <https://dash.cloudflare.com/sign-up> |
| Vercel account | Optional | An alternative free deployment | <https://vercel.com/signup> |

> Cloudflare Pages and Vercel — **pick only one**. Complete beginners should start with Cloudflare Pages.

Once these are ready, move on to deployment.

---

## 4. Deployment Tutorial: Get Your Blog Online

The whole process takes two steps: **first turn the project into your own GitHub repository, then connect it to Cloudflare/Vercel for automatic deployment.**

### Step 1: Make the Project Your Own GitHub Repository

You first need to copy Freecat Blog into your own GitHub account. Two routes are available:

| Route | Recommendation | Best for | Can sync upstream updates later? |
| --- | --- | --- | --- |
| **Route A: GitHub Importer** | Recommended | Users willing to follow GitHub steps | Yes |
| **Route B: Download ZIP + Copy/Paste** | Alternative | Beginners who want zero hassle | No |

> **Choose only one route — do not do both.**

#### Route A: GitHub Importer (Recommended)

**A-1. Open GitHub Importer**

1. Sign in to GitHub.
2. Open: <https://github.com/new/import>

**A-2. Fill in the import form**

| Field | Value |
| --- | --- |
| `Your old repository's clone URL` | `https://github.com/OUBIGFA/Freecat-Blog` |
| `Owner` | Your GitHub account |
| `Repository name` | Your repo name, e.g. `my-freecat-blog` |
| `Privacy` | `Private` recommended |

Click `Begin import`. It usually finishes in a few seconds to a few minutes.

**A-3. Clone the repository to your computer with GitHub Desktop**

1. Open GitHub Desktop and sign in.
2. Click `File` → `Clone repository`.
3. Pick the repository you just imported.
4. Choose a local save location.
5. Click `Clone`.

You now have the full blog project folder on your computer. **Skip down to Step 2 to deploy.**

#### Route B: Download ZIP + Copy/Paste (Alternative)

**B-1. Create your own GitHub repository**

1. Open: <https://github.com/new>
2. Repo name: `my-freecat-blog`.
3. Visibility: `Private`.
4. Check `Add a README file`.
5. Click `Create repository`.

**B-2. Download Freecat Blog source**

1. Open the original repo: <https://github.com/OUBIGFA/Freecat-Blog>
2. Click `Code` → `Download ZIP`.
3. Extract the downloaded ZIP.

**B-3. Clone your repository to your computer**

1. Open GitHub Desktop.
2. Pick your newly created repo.
3. Click `Clone` to download it locally.

**B-4. Copy the source into your repository**

1. Open the extracted Freecat Blog folder.
2. Go into the level that actually contains the source code.
3. Select all the contents.
4. Paste them into the local repo folder cloned by GitHub Desktop.
5. If asked to replace `README.md`, choose replace.

> **Important: do not drop the outer folder in.** The correct result is: your repo root directly contains `all/`, `Control/`, `writing/`, `README.md`.

![10](all/image/Tutorial/10.png)

**B-5. Push to GitHub for the first time**

1. Switch back to GitHub Desktop.
2. You will see many new files on the left.
3. Commit message: `Import Freecat Blog source`.
4. Click `Commit to main`.
5. Click `Push origin`.

Your GitHub repository now has the full Freecat Blog source. **Continue to Step 2.**

### Step 2: Deploy to Cloudflare Pages (Recommended)

Cloudflare Pages is great for long-term hosting of a personal blog. **The key is filling in the build settings correctly.**

**2-1. Open Cloudflare Pages**

1. Sign in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Create an application.

![Cloudflare step 1](all/image/Tutorial/01.png)

3. Select Pages.

![Cloudflare step 2](all/image/Tutorial/02.png)

4. Choose "Import an existing Git repository".

![Cloudflare step 3](all/image/Tutorial/03.png)

5. Select your blog repository.

![Cloudflare step 4](all/image/Tutorial/04.png)

**2-2. Fill in the build settings (the most critical step)**

The project name can be anything. **Fill the key settings exactly as below:**

| Cloudflare UI (English) | Cloudflare 中文界面 | Value |
| --- | --- | --- |
| Framework preset | 框架预设 | `None` / leave unset |
| Root directory (advanced) > Path | 根目录（高级） | `all` |
| Build command | 构建命令 | `npm run build` |
| Build output directory | 构建输出目录 | `dist` |
| Environment variables (optional) | 环境变量（选填） | `NODE_VERSION` = `20` |

![Cloudflare step 5](all/image/Tutorial/05.png)

> **Common mistake:** Output directory should be `dist`, **not `all/dist`** — you have already set the root directory to `all`.

Click `Save and Deploy` and wait for the build (usually 1–3 minutes).

**2-3. Visit your blog**

![Cloudflare step 6](all/image/Tutorial/06.png)

When the build finishes, Cloudflare gives you a default URL (something like `xxx.pages.dev`). Open it and your blog is live 🎉

To use your own domain, bind a custom domain inside your Cloudflare Pages project.

- Free domain guide (Chinese): <https://blog.freeorg.dpdns.org/posts/%E5%85%8D%E8%B4%B9%E5%9F%9F%E5%90%8D%E7%94%B3%E8%AF%B7%E6%8C%87%E5%8D%97.html>
- DNSHE auto-renew project: <https://github.com/OUBIGFA/dnshe-auto-renew>

### Step 2 Alternative: Deploy to Vercel

If you already use Vercel, this route is just as good.

1. Sign in to [Vercel](https://vercel.com/).
2. Click `Add New...` → `Project`.
3. Connect GitHub and pick your blog repo.
4. Fill in the form:

| Field | Value |
| --- | --- |
| Framework Preset | Keep default or pick "Other / Static" |
| Root Directory | `all` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | `20` |

5. Click `Deploy`.

To bind a custom domain, go to project settings → `Domains` and follow the DNS instructions.

---

## 5. Writing Articles: Using `writing/`

After deployment succeeds, you can start writing. `writing/` is the folder you will use most — **one Markdown file is one article**.

The project ships with a few sample articles. You can:

- Open them to learn the format
- Copy one as a template
- Delete the samples you don't need
- Create your own `.md` files

### Article Template

Create a new `.md` file with this metadata header:

```md
---
title: My First Article
date: 2026-01-01
tag:
  - notes
cover: https://XXXXX.com
show_cover: false
show_image_captions: false
description:
pinned: false
show: true
---

The article body goes here.
```

### Article Field Reference

The block at the top wrapped in `---` is called "Front Matter" — configuration the system reads. Common fields:

| Field | Purpose | Example |
| --- | --- | --- |
| `title` | Article title; if empty, the filename is used | `My First Article` |
| `date` | Publish date | `2026-01-01` |
| `tag` | Tags, multiple allowed | `- notes` |
| `cover` | Cover image URL; empty for no cover | `https://...` |
| `show_cover` | Whether to show the cover on the article page | `true` or `false` |
| `description` | Article summary; empty = auto excerpt | `A short intro` |
| `pinned` | Pin to the top | `true` or `false` |
| `show` | Show on the site | `true` or `false` |

After saving, jump to [Section 7](#7-the-5-step-daily-update-workflow) to sync with GitHub Desktop.

### Embedding an Audio Player in an Article

Use blockquote syntax with a direct audio link to auto-generate a player:

```md
>[A demo audio](https://example.com/audio.m4a)
```

If the URL has no obvious audio extension, add a music symbol in the title to force it:

```md
>[🎵A demo audio](https://example.com/audio)
```

Supported formats: `.mp3`, `.m4a`, `.wav`, `.ogg`, `.aac`, `.flac`, `.opus`.

Helper tools:

- Cloud share link → direct link: <https://lz.qaiu.top/>
- Cloud direct link extractor: <https://link.gimhoy.com/>
- Feijipan cloud drive: <https://www.feijipan.com>

---

## 6. Customizing the Site: Using `Control/`

`Control/` is the site control panel. To turn the template into "your blog", focus your edits here.

| File | What it controls |
| --- | --- |
| `site_网站属性.md` | Site title, site name, home intro, avatar, theme, canonical URL |
| `social_社交媒体.md` | Social media icons, profile links, contact, promo links |
| `about_关于页面.md` | About page title, intro, and avatar |

### 4 Things to Remember When Editing

- Keep **one space after the colon**, e.g. `site_name: FreeCat`
- Fields you don't want to fill can be **left empty**, but **don't delete the line**
- Lines starting with `_01`, `_02` etc. are descriptions — **do not rename the field keys**
- After editing, you must commit and push with GitHub Desktop for the live site to update

The config block at the top of each file looks like:

```yaml
---
site_title: FreeCat Blog
site_name: FreeCat
hero_title: Hi, I'm FreeCat.
---
```

### `site_网站属性.md` Field Reference

| Field | Description |
| --- | --- |
| `site_title` | Browser tab title |
| `site_favicon` | Browser tab icon URL; empty = default |
| `site_name` | Site name shown at the top |
| `site_logo_icon` | In-site logo icon URL; empty = default |
| `hero_title` | Home page main title |
| `hero_subtitle` | Home page intro text |
| `hero_avatar` | Home page avatar URL |
| `posts_per_page` | Articles per page on home; empty = 8; `0` = show all |
| `footer_copyright` | Footer copyright text |
| `theme_system` | Follow system light/dark mode |
| `theme_light` | Force light mode |
| `theme_dark` | Force dark mode |
| `site_url` | Your canonical site URL, used for the sitemap |

> Theme: only **one** of `theme_system`, `theme_light`, `theme_dark` should be `true`.

### `social_社交媒体.md` Field Reference

Each platform has 3 fields:

| Field type | Example | Purpose |
| --- | --- | --- |
| Enable toggle | `github_enabled: true` | `true` shows it, `false` hides it |
| Custom icon | `github_icon_url:` | Empty = default icon; or paste your own icon URL |
| Profile link | `github_url: https://github.com` | Where the icon links to |

For platforms you don't use, set the matching `*_enabled` to `false`.

### `about_关于页面.md` Field Reference

| Field | Description |
| --- | --- |
| `about_hero_title` | About page title; empty = use home title |
| `about_hero_subtitle` | About page intro; empty = use home intro |
| `about_hero_avatar` | About page avatar; empty = use home avatar |

To keep the About page identical to the home page, leave all three empty.

---

## 7. The 5-Step Daily Update Workflow

After deployment succeeds, **every future update only takes 5 steps**:

1. Add or edit articles in `writing/`.
2. Edit site settings in `Control/` if needed.
3. Save the files.
4. Open GitHub Desktop, write a short commit message, click `Commit to main`.
5. Click `Push origin`.

![GitHub Desktop commit](all/image/Tutorial/08.png)

![GitHub Desktop push](all/image/Tutorial/09.png)

After pushing, Cloudflare Pages or Vercel **rebuilds automatically**. Refresh the site after 1–3 minutes to see the new content.

---

## 8. Advanced Features

These are not required. Beginners can skip and come back later.

### Writing with Obsidian

You can open this blog repo directly in Obsidian. Recommended: write your articles inside `writing/`.

Why this works well:

- Articles stay local and easy to manage
- You get Obsidian's backlinks, tags, and search
- After writing, sync with GitHub Desktop to publish

### Local Preview and Build

If you only write articles and deploy, you **do not** need to build locally — the platform handles it.

If you want to preview locally, install [Node.js 20+](https://nodejs.org/) first, then:

```bash
cd all
npm install
npm run build
```

The output lives in `all/dist/` — **do not edit it manually and do not commit it to GitHub**.

### Project Structure

```text
Freecat-Blog/
├── Control/                # Site config — beginners mainly edit here
│   ├── site_网站属性.md
│   ├── social_社交媒体.md
│   └── about_关于页面.md
├── writing/                # Article Markdown — beginners mainly write here
├── all/                    # Build workspace — the platform builds in here
│   ├── src/                # Page templates
│   ├── image/              # Image assets
│   ├── build/              # Build helpers
│   ├── build.js            # Main build script
│   ├── package.json        # Build deps and scripts
│   └── dist/               # Build output — generated, do not edit
├── README.md
└── README.en.md
```

### Sync Upstream Template Updates

> Only works for repos created via Route A (GitHub Importer). For Route B, see the fallback below.

**First-time setup: add the upstream remote**

In a terminal, enter your local repo directory:

```bash
cd /full/path/to/your/local/repo
git remote add upstream https://github.com/OUBIGFA/Freecat-Blog.git
git remote -v
```

You should see both `origin` and `upstream`.

**Pull upstream updates**

```bash
git fetch upstream
git log HEAD..upstream/main --oneline
git merge upstream/main
git push origin main
```

What each command does:

- `git fetch upstream` — download upstream changes without touching your files
- `git log HEAD..upstream/main --oneline` — preview what's new upstream
- `git merge upstream/main` — merge upstream into your repo
- `git push origin main` — push the merged result back to GitHub

**If conflicts appear**

Conflicts usually happen when you and upstream edited the same file. You'll see markers like:

```text
<<<<<<< HEAD
your version
=======
upstream version
>>>>>>> upstream/main
```

How to resolve:

1. Open the conflicting file.
2. Keep the content you want.
3. Remove the `<<<<<<<`, `=======`, `>>>>>>>` markers.
4. Save the file.
5. Run:

```bash
git add .
git commit -m "Merge upstream Freecat Blog updates"
git push origin main
```

General guidance:

- In `Control/`, **prefer your own** settings
- In `writing/`, **prefer your own** articles
- In `all/`, usually **prefer upstream** updates

**Fallback for the ZIP route**

If you used the ZIP + copy-paste route, do not force `git merge`. Update manually:

1. Re-download the latest Freecat Blog ZIP.
2. Extract it.
3. Copy the new `all/` folder into your repo, **overwriting** the old `all/`.
4. **Do not overwrite** your own `Control/` or `writing/`.
5. Review the diff in GitHub Desktop.
6. After confirming nothing important is lost, commit and push.

---

## 9. FAQ

**Q: Do I need to know how to code?**
No. Day-to-day, you only edit Markdown and config files.

**Q: Where should I usually edit?**
Articles → `writing/`. Site settings → `Control/`. Beginners normally don't touch `all/`.

**Q: Do I have to buy a domain?**
No. Cloudflare Pages and Vercel both give you a default URL.

**Q: What's the easiest setting to get wrong during deployment?**
`Root Directory` must be `all`, `Output Directory` must be `dist`, **not `all/dist`**.

**Q: I made changes locally but the site isn't updating. What do I do?**
Check in order: ① is the file saved → ② did GitHub Desktop push → ③ did Cloudflare Pages or Vercel start a new build → ④ force-refresh your browser.

**Q: Cloudflare Pages or Vercel — which should I pick?**
Beginners: Cloudflare Pages. Already on Vercel? Stick with Vercel. Your content is on GitHub, so you can switch later.

**Q: Can I delete the sample articles?**
Yes. They live in `writing/` — delete and push to sync.

**Q: I already used the ZIP route. Can I switch to the Importer route?**
Yes. The safest way is to import a fresh repo via GitHub Importer, then copy your `Control/` and `writing/` over and re-deploy or repoint your deployment project.

**Q: `git remote add upstream` says `remote upstream already exists`. What now?**
The remote is already added. Run:

```bash
git remote set-url upstream https://github.com/OUBIGFA/Freecat-Blog.git
```

**Q: `git merge upstream/main` says `refusing to merge unrelated histories`. What now?**
You probably built your repo via the ZIP route, which can't merge cleanly. Use the ZIP fallback above, or rebuild via the Importer route.

---

## License

This project is released under the MIT License.
