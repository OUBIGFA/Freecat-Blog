<div align="center">
  <img src="https://cdn.img2ipfs.com/ipfs/QmNxBPYGDuwD5MYyvyzJWZBzW6dFQoYAgXvXdKJP5sumE5?filename=freecat.gif" width="640" alt="Freecat Blog Preview">
  <h1>Freecat Blog</h1>
  <p>A free, local-first personal blog with cloud sync</p>
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
    <a href="https://blog.freeorg.dpdns.org">Live Demo</a>
  </p>
</div>

## Overview

Freecat Blog is a **local-first, writing-first, free-to-deploy** personal blog setup. Writing happens in local Markdown, version control runs on GitHub, and deployment is handled by Cloudflare Pages or Vercel, so you can skip formatting friction and focus on writing and reading.

The setup is not tied to any single platform: your content lives on your computer and on GitHub, and the deployment platform only generates a static site. Switching platforms later is painless because the content always stays in your hands.

## How It Works

The whole pipeline is just 3 steps:

1. Write `Markdown` articles locally
2. Use `GitHub` for cloud backup and version control
3. Let `Cloudflare Pages` or `Vercel` build and publish the static site automatically

You never write web page code directly, and you never need to maintain your own server.

## Features

- **Local-first writing**: local files are the source of truth, with GitHub as the cloud backup
- **Markdown and HTML compatible**: Markdown for daily writing, raw HTML when you want richer layout
- **Polished reading experience**: automatic spacing for mixed Chinese/English/numbers/units
- **Search, archive, tags built in**: tag-based grouping, full-text search, theme switching
- **Audio playback**: drop an audio direct link inside a blockquote and the player appears automatically
- **Configurable control center**: edit site info via the `Control` folder without touching code
- **Auto deployment**: every push to GitHub triggers a fresh build on the platform
- **Completely free**: Cloudflare Pages and Vercel free tiers are more than enough for a personal blog

## Prerequisites

Before you start, get the following accounts ready:

- A **GitHub account** (required)
- Either a **Cloudflare account** or a **Vercel account**
- **GitHub Desktop** (required): [Download here](https://desktop.github.com/download)

## Deployment Configuration Cheat Sheet

The core deployment settings are the same on Cloudflare Pages and Vercel:

| Field (CN / EN) | Value |
| --- | --- |
| Repository | Your own GitHub repository |
| Root Directory / Base Directory / 根目录 | `all` |
| Build Command / 构建命令 | `npm run build` |
| Output Directory / Publish Directory / 构建输出目录 | `dist` |
| Environment Variable / 环境变量 | `NODE_VERSION=20` (optional, recommended to pin) |

Notes:

- Once the root directory is set to `all`, the output directory is just `dist`, not `all/dist`
- The latest Cloudflare Pages build image defaults to Node.js 22; if you want this guide's tested setup, add `NODE_VERSION=20` as an environment variable

## Quick Start

There are two routes: **if you have some technical background and want long-term template updates, use GitHub Importer; if you are a complete beginner, use ZIP + copy & paste**.

| Route | Keeps Git history | Can `git pull` upstream updates | Best for |
| --- | --- | --- | --- |
| Recommended for technical users: GitHub Importer | Yes | Yes | People comfortable with GitHub / Git who want history and long-term upstream updates |
| Recommended for beginners: ZIP + copy & paste | No | No (see [FAQ](#faq)) | Complete beginners who just want to get online quickly, or anyone who cannot reach Importer |

> Pick **only one** of the two routes — never do both, they conflict.

---

### Recommended for technical users: Use GitHub Importer to create your private repo (keeps upstream Git history)

GitHub's built-in Importer copies a public repository **completely** into your own private repository, including all commit history. That means future upgrades from Freecat-Blog only take a single command. This route is better for people who already have some basic GitHub / Git experience.

#### Step 1: Open the Importer page

1. Sign in to GitHub
2. Open in your browser: [https://github.com/new/import](https://github.com/new/import)

#### Step 2: Fill in the import form

| Field | Value |
| --- | --- |
| `Your old repository's clone URL` | `https://github.com/OUBIGFA/Freecat-Blog` |
| `Owner` | Your GitHub account |
| `Repository name` | A name like `my-freecat-blog` |
| `Privacy` | `Private` |

> If you cannot reach `https://github.com/OUBIGFA/Freecat-Blog` in the browser, GitHub itself is unreachable on your network — fix that first or take the fallback route.

#### Step 3: Run the import

1. Click `Begin import`
2. A progress bar appears, usually finishes between 30 seconds and 2 minutes
3. When you see `Your new repository... is ready`, you're done
4. Click into the new repo and confirm the file list looks identical to OUBIGFA/Freecat-Blog

#### Step 4: Clone the repo locally with GitHub Desktop

1. Install and sign in to [GitHub Desktop](https://desktop.github.com/download)
2. In GitHub Desktop, click `File` → `Clone repository`
3. Pick the private repo you just imported
4. Choose a local folder (somewhere you can find easily)
5. Click `Clone`

You now have the full Freecat-Blog project locally — **skip ahead to [Write articles](#write-articles)**.

---

<details>
<summary><b>📦 Fallback route: Download ZIP + copy & paste (no Git history preserved) — click to expand</b></summary>

<br>

> Heads-up: A repo created this way **cannot use `git pull` to fetch upstream updates**. Take this route only if you don't need that, or the Importer page is unreachable on your network.

#### Step 1: Create your own private repository

Project URL: [https://github.com/OUBIGFA/Freecat-Blog](https://github.com/OUBIGFA/Freecat-Blog)

1. Sign in to GitHub
2. Open [https://github.com/new](https://github.com/new)
3. Enter a repository name, for example `my-freecat-blog`
4. Choose `Private`
5. Turn on `Add a README file`
6. Click `Create repository`

#### Step 2: Download the Freecat-Blog ZIP package

1. Open the original project page: [https://github.com/OUBIGFA/Freecat-Blog](https://github.com/OUBIGFA/Freecat-Blog)
2. Click `Code`
3. Click `Download ZIP`
4. Wait for the ZIP file to finish downloading

#### Step 3: Extract the ZIP file

1. Find the ZIP file on your computer
2. Right-click it
3. Extract it
4. Open the extracted folder

#### Step 4: Install GitHub Desktop and clone your private repository

1. Install and sign in with your GitHub account
2. Open GitHub Desktop
3. Pick the private repository you just created
4. Choose a local folder
5. Click `Clone`

The local folder usually contains only a `README.md`.

#### Step 5: Copy the Freecat-Blog source files into your local private repository

1. Open the extracted `Freecat-Blog` folder
2. Go into the innermost folder that actually contains the source files
3. Select everything inside that folder
4. Copy those files
5. Open the local folder that GitHub Desktop just cloned
6. Paste all copied files into that folder
7. If Windows asks whether to replace `README.md`, choose `Replace`

Note:

- Do not paste the outer `Freecat-Blog` folder itself
- Paste the contents inside it
- Otherwise you will end up with one extra folder layer and deployment will fail

#### Step 6: Commit the source code to GitHub

1. Go back to GitHub Desktop
2. You will see many new files in the left panel
3. Enter a commit message such as `Import Freecat-Blog source`
4. Click `Commit to main`
5. Click `Push origin`

GitHub's web UI can upload up to `100` files at a time, and this project contains many more files, so local sync is the safer path.

</details>

---

### Write articles

Both routes converge here. You'll mostly work in two folders:

- `writing/` — Markdown articles
- `Control/` — site configuration (see "Customize via the Control Folder" below)

### Sync updates later

In GitHub Desktop:

1. Review changed files
2. Add a commit message
3. Click Commit
4. Click Push to sync to GitHub

Once the push succeeds, the deployment platform automatically rebuilds.

## Deploy with Cloudflare Pages (Recommended)

Best for long-term, stable hosting, especially for plain static blogs and custom domains.

### Configuration
0. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
1. Create an application
![01](all/image/Tutorial/01.png)
2. Choose Pages deployment
![02](all/image/Tutorial/02.png)
3. Choose to import an existing Git repository
![03](all/image/Tutorial/03.png)
4. Select your target repository
![04](all/image/Tutorial/04.png)
5. Fill in the build settings. The project name can be anything you want. Then click `Save and Deploy` and wait for the build to finish
![05](all/image/Tutorial/05.png)

| Cloudflare UI Chinese | Cloudflare UI English | Value |
| --- | --- | --- |
| 框架预设 | Framework preset | keep `None`, `无`, or no preset |
| 根目录（高级） | Root directory (advanced) > Path | `all` |
| 构建命令 | Build command | `npm run build` |
| 构建输出目录 | Build output directory | `dist` |
| 环境变量（可选） | Environment variables (optional) | `NODE_VERSION` = `20` |

6. Deployment completed and the default URL becomes available
![06](all/image/Tutorial/06.png)

### Custom Domain

Because Cloudflare itself is blocked in some regions, you may need to bind a custom domain if you want the site to be publicly reachable from outside.

Free domain recommendation:
https://blog.freeorg.dpdns.org/posts/%E5%85%8D%E8%B4%B9%E5%9F%9F%E5%90%8D%E7%94%B3%E8%AF%B7%E6%8C%87%E5%8D%97.html

[DNSHE](https://my.dnshe.com/) auto-renew project:
https://github.com/OUBIGFA/dnshe-auto-renew

<details>
<summary><b>🚀 Deploy with Vercel — click to expand</b></summary>

<br>

A good fit if you already have a Vercel account or prefer Vercel's dashboard.

### Configuration

1. Sign in to [Vercel](https://vercel.com/)
2. Click `Add New...` → `Project`
3. Connect GitHub and pick your repository
4. Fill in the project configuration:

| Field | Value |
| --- | --- |
| Framework Preset | Default or any plain static option |
| Root Directory | `all` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | `20` |

5. Click `Deploy` and wait for the build to finish

### Custom Domain

1. Open project settings → `Domains`
2. Add your domain and follow Vercel's DNS instructions

</details>

## Choosing a Platform

| Situation | Recommendation |
| --- | --- |
| Total beginner / long-term hosting | Cloudflare Pages |
| Already on Vercel / want to ship fast | Vercel |
| Worried about picking the wrong one | Either is fine, you can switch any time |

## Daily Workflow

Once everything is deployed, updating the blog is just 5 steps:

1. Edit articles locally
2. Save the files
3. Commit and push from GitHub Desktop
4. Wait for the platform to rebuild
5. Open the site to verify

## Sync Upstream Freecat-Blog Updates

When upstream [OUBIGFA/Freecat-Blog](https://github.com/OUBIGFA/Freecat-Blog) ships a bug fix, a new feature, or a style tweak, you can pull those updates into your private repo.

> **Prerequisite**: you must have built your repo via the **technical-user route (GitHub Importer)**. If you went with ZIP + paste, jump to the "Fallback" section below.

### Recommended: `git remote add upstream` to pull updates

Steps 1–3 only run once; afterwards just steps 4–7 every time.

#### Step 1: Open a terminal

- Windows: `Win + R`, type `cmd`, press Enter
- macOS: open `Terminal`

#### Step 2: Enter your local repo directory

```bash
cd /full/path/to/your/local/repo
```

Don't know the path? In GitHub Desktop, click `Repository` → `Show in Explorer / Finder`, then copy the path from the address bar.

#### Step 3: Register the upstream remote (one-time, persistent)

```bash
git remote add upstream https://github.com/OUBIGFA/Freecat-Blog.git
```

Verify:

```bash
git remote -v
```

You should see two `origin` lines and two `upstream` lines, like:

```
origin    https://github.com/your-name/my-freecat-blog.git (fetch)
origin    https://github.com/your-name/my-freecat-blog.git (push)
upstream  https://github.com/OUBIGFA/Freecat-Blog.git (fetch)
upstream  https://github.com/OUBIGFA/Freecat-Blog.git (push)
```

#### Step 4: Fetch upstream updates

```bash
git fetch upstream
```

Downloads upstream changes to local cache only — **none of your files change yet**.

#### Step 5: Inspect what's new (optional)

```bash
git log HEAD..upstream/main --oneline
```

Lists every new upstream commit since your last sync. No output means nothing to merge.

#### Step 6: Merge upstream into your branch

```bash
git merge upstream/main
```

Three possible outcomes:

1. **`Already up to date.`** — nothing to do, finished.
2. **`Fast-forward` or `Merge made by the 'recursive' strategy`** — clean merge, go to step 7.
3. **Conflict** (`CONFLICT` in the output) — you and upstream changed the same lines. See "Resolving conflicts" below.

#### Step 7: Push the merged result

```bash
git push origin main
```

The deployment platform auto-rebuilds and the site updates.

### Resolving conflicts

Most common case: you edited `Control/site_网站属性.md` (your site name / avatar) and upstream also touched the same file.

The conflicting file will look like:

```
<<<<<<< HEAD
your side (what you wrote)
=======
upstream side (what OUBIGFA/Freecat-Blog changed)
>>>>>>> upstream/main
```

How to resolve:

1. Open the conflicting file in any editor
2. Decide which side wins (usually keep your own values in `Control/`, take upstream changes in `all/`)
3. Delete the `<<<<<<<`, `=======`, `>>>>>>>` lines and keep only what you want

After all conflicts are resolved:

```bash
git add .
git commit -m "Merge upstream Freecat-Blog updates"
git push origin main
```

### Fallback: Manual ZIP overwrite (for repos built via the fallback route)

If you originally built the repo with ZIP + copy & paste, `git remote add upstream` does not work cleanly (forcing it triggers `refusing to merge unrelated histories` and conflicts every file). Workaround:

1. Re-download the latest ZIP from [OUBIGFA/Freecat-Blog](https://github.com/OUBIGFA/Freecat-Blog)
2. Extract it
3. Overwrite **template / build files** (`all/`, `README.md`, `README.en.md`, etc.) into your local repo
4. **Never overwrite `Control/`, `writing/`, `image/`** — those are your own content
5. Use GitHub Desktop to review the diff and confirm no content was clobbered
6. Commit + push

> For a permanent fix, rebuild the repo via the recommended route when you have time, and migrate your content folders. One small migration buys cheap upgrades forever.

## Project Structure

```text
Freecat-Blog/
├── Control/                # Site configuration (info, social, about)
│   ├── site_网站属性.md
│   ├── social_社交媒体.md
│   └── about_关于页面.md
├── writing/                # Markdown articles
├── all/                    # Build workspace
│   ├── src/                # Templates (HTML, styles, scripts)
│   ├── image/              # Image assets
│   ├── build.js            # Build script
│   ├── extract-git-dates.js
│   └── package.json
├── README.md
└── README.en.md
```

The build output `all/dist/` is intentionally excluded from the repository.

## Article Frontmatter

Each article supports the following frontmatter fields:

```yaml
---
title: Article Title
date: 2026-01-16
tag:
  - free
cover: https://example.com/cover.gif      # Cover image URL
show_cover: false                          # Show cover on the detail page
show_image_captions: true                  # Show captions under images
description: Summary, auto-generated if empty
pinned: true                               # Pin to the top of home
show: true                                 # Show site-wide
---
```

## Audio Playback

Put an audio direct link inside a blockquote, and the player shows up automatically:

```md
>[Sample format](https://xxx.xxx/example.m4a)
```

If the URL has no obvious audio extension, prepend `🎵` to force the player:

```md
>[🎵Sample format](https://xxx.xxx/example)
```

Supported audio formats: `.mp3`, `.m4a`, `.wav`, `.ogg`, `.aac`, `.flac`, `.opus`

Helper tools:

- [Cloud share link to direct link converter](https://lz.qaiu.top/)
- [Cloud direct link extractor](https://link.gimhoy.com/)
- [Feijipan cloud drive](https://www.feijipan.com)

## Advanced Usage

### Pair with Obsidian

Open the blog repository as an Obsidian vault to get:

- Full local file control
- Backlinks, tags, and search
- A continuous flow from writing to Git sync to auto deployment

Edit articles inside `writing/` and push with GitHub Desktop when ready.

### Customize via the Control Folder

The `Control/` folder is the no-code control panel for the site:

| File | Purpose |
| --- | --- |
| `site_网站属性.md` | Site name, description, avatar, favicon, default theme |
| `social_社交媒体.md` | Social media links, friend links, contact, promo links |
| `about_关于页面.md` | Standalone copy for the "About" page |

> Editing rule: every parameter lives inside the YAML frontmatter (between the `---` lines) at the top of the file. Keep one space after the `:` in `key: value`. Lines that start with an underscore (`_01`, `_02`, ...) are inline comments — **do not delete or rename them**, they only render as helper hints.

#### 1. `site_网站属性.md` — full parameter list

| Field | Default | Description |
| --- | --- | --- |
| `site_title` | `FreeCat Blog` | Page title shown on the browser tab |
| `site_favicon` | empty | Favicon URL shown on the browser tab; falls back to the bundled icon when empty |
| `site_name` | `FreeCat` | Site brand name displayed in the header |
| `site_logo_icon` | empty | Logo URL (SVG recommended); falls back to the default icon when empty |
| `hero_title` | `Hi, I'm FreeCat...` | Home page slogan / hero title |
| `hero_subtitle` | bilingual intro line | Home page subtitle / intro paragraph |
| `hero_avatar` | empty | Home page avatar URL |
| `posts_per_page` | empty | How many posts to show on the home page; empty = `8`, `0` = show all |
| `footer_copyright` | `© FreeCat \| Curiosity is the best motivation.` | Footer copyright text |
| `theme_system` | `true` | Follow OS / browser theme automatically |
| `theme_light` | `false` | Force light theme site-wide |
| `theme_dark` | `false` | Force dark theme site-wide |
| `site_url` | `https://blog.freeorg.dpdns.org` | Canonical site URL used for sitemap and canonical tags |

Theme rule: set exactly one of `theme_system` / `theme_light` / `theme_dark` to `true` and keep the other two as `false`. If all three are `false`, the site falls back to the system theme.

#### 2. `social_社交媒体.md` — full parameter list

Each social platform exposes the same 3 fields: an enable switch, an optional custom icon URL, and the profile URL.

| Platform | Enable flag | Custom icon | Profile URL |
| --- | --- | --- | --- |
| Twitter / X | `twitter_enabled` | `twitter_icon_url` | `twitter_url` |
| Instagram | `instagram_enabled` | `instagram_icon_url` | `instagram_url` |
| GitHub | `github_enabled` | `github_icon_url` | `github_url` |
| Behance | `behance_enabled` | `behance_icon_url` | `behance_url` |
| TikTok | `tiktok_enabled` | `tiktok_icon_url` | `tiktok_url` |
| Facebook | `facebook_enabled` | `facebook_icon_url` | `facebook_url` |

How to fill them in:

- `*_enabled`: `true` shows the icon, `false` hides it
- `*_icon_url`: leave empty to use the bundled icon, or paste an icon URL (SVG or square PNG works best)
- `*_url`: your own profile URL, e.g. `https://x.com/yourname`

To hide a platform you do not use, just flip `*_enabled` to `false` — no need to delete the whole block.

#### 3. `about_关于页面.md` — full parameter list

| Field | Description |
| --- | --- |
| `about_hero_title` | Title on the About page; falls back to the home `hero_title` when empty |
| `about_hero_subtitle` | Intro paragraph on the About page; falls back to the home `hero_subtitle` when empty |
| `about_hero_avatar` | Avatar on the About page; falls back to the home `hero_avatar` when empty |

Tips:

- To keep the About page in sync with the home page, leave all three fields empty
- To override only one of them (for example a different avatar), fill in just that one field and keep the rest empty
- For longer "About me" content, consider writing it as a regular article and linking to it from your social or navigation area

#### General notes for the Control folder

- **You must push**: any change inside `Control/` must be committed and pushed via GitHub Desktop, otherwise the deployment platform will not rebuild
- **Empty fields keep `key:`**: leave the line in place when a value is empty, do not delete the whole line, or the frontmatter structure will break
- **Do not touch `_01`, `_02` lines**: those underscore lines are inline comments and are stripped at build time
- **Not seeing the update**: hard refresh the browser first (Ctrl + F5 on Windows, Cmd + Shift + R on macOS) before assuming the deploy failed

### Beyond Blogging

The same pipeline also works for:

- Personal home pages
- Portfolios
- Knowledge bases
- Project showcase sites
- Markdown-based cloud backup

## FAQ

**Q: Do I need to know how to code?**
No. Following this guide step by step is enough to deploy and publish.

**Q: Do I need to buy a domain first?**
No. Cloudflare Pages and Vercel both give you a default URL out of the box.

**Q: I edited locally but the site did not change?**
Check, in order:
1. Did you save the file?
2. Did you commit and push in GitHub Desktop?
3. Did the platform start an auto build?
4. Is the browser caching the old page (try a hard refresh)?

**Q: Can I move from Vercel to Cloudflare Pages later?**
Yes. The content lives on your machine and on GitHub. Nothing locks you in.

**Q: Which fields are easiest to fill incorrectly?**
- Root Directory must be `all`
- Output Directory must be `dist`, not `all/dist`

**Q: I already built my repo via ZIP + paste — can I switch to the Importer route?**
Yes. The safest path is to **build a brand-new private repo** via the recommended route, copy your content folders (`Control/`, `writing/`, `image/`) over, and then point Cloudflare/Vercel at the new repo (or create a fresh project there). Keep the old repo around until the new one is verified deployable.

**Q: Does the Importer pull upstream README and example articles into my new repo?**
Yes. The new repo is a complete clone of upstream, including the upstream README and the sample articles in `writing/`. You can edit or delete them freely — those changes only affect your repo.

**Q: `git remote add upstream` says `remote upstream already exists`?**
You added it before. Either run `git remote set-url upstream https://github.com/OUBIGFA/Freecat-Blog.git` to overwrite, or `git remote remove upstream` first and re-add.

**Q: `git merge upstream/main` says `refusing to merge unrelated histories`?**
Your repo wasn't built via the Importer route, so it has no shared history with upstream. Use the "Fallback" workflow in "Sync Upstream Freecat-Blog Updates", or rebuild the repo.

## License

This project is licensed under the MIT License.
