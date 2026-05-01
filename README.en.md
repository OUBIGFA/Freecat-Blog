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

## Live Demo

[https://blog.freeorg.dpdns.org](https://blog.freeorg.dpdns.org)

## Prerequisites

Before you start, get the following accounts ready:

- A **GitHub account** (required)
- Either a **Cloudflare account** or a **Vercel account**
- **GitHub Desktop** (required): [Download here](https://desktop.github.com/download)

## Deployment Configuration Cheat Sheet

The core deployment settings are the same on Cloudflare Pages and Vercel:

| Field | Value |
| --- | --- |
| Repository | Your own GitHub repository |
| Root Directory / Base Directory | `all` |
| Build Command | `npm run build` |
| Output Directory / Publish Directory | `dist` |
| Node Version | `20` |

Note: once the root directory is set to `all`, the output directory is just `dist`, not `all/dist`.

## Quick Start

### Step 1: Create your own private repository

Project URL: [https://github.com/OUBIGFA/FreeBlog](https://github.com/OUBIGFA/FreeBlog)

1. Sign in to GitHub
2. Open [https://github.com/new](https://github.com/new)
3. Enter a repository name, for example `my-freecat-blog`
4. Choose `Private`
5. Turn on `Add a README file`
6. Click `Create repository`

### Step 2: Download the FreeBlog ZIP package

1. Open the original project page: [https://github.com/OUBIGFA/FreeBlog](https://github.com/OUBIGFA/FreeBlog)
2. Click `Code`
3. Click `Download ZIP`
4. Wait for the ZIP file to finish downloading

### Step 3: Extract the ZIP file

1. Find the ZIP file on your computer
2. Right-click it
3. Extract it
4. Open the extracted folder

### Step 4: Install GitHub Desktop and clone your private repository

1. Install and sign in with your GitHub account
2. Open GitHub Desktop
3. Pick the private repository you just created
4. Choose a local folder
5. Click `Clone`

The local folder usually contains only a `README.md`.

### Step 5: Copy the FreeBlog source files into your local private repository

1. Open the extracted `FreeBlog` folder
2. Go into the innermost folder that actually contains the source files
3. Select everything inside that folder
4. Copy those files
5. Open the local folder that GitHub Desktop just cloned
6. Paste all copied files into that folder
7. If Windows asks whether to replace `README.md`, choose `Replace`

Note:

- Do not paste the outer `FreeBlog` folder itself
- Paste the contents inside it
- Otherwise you will end up with one extra folder layer and deployment will fail

### Step 6: Commit the source code to GitHub

1. Go back to GitHub Desktop
2. You will see many new files in the left panel
3. Enter a commit message such as `Import FreeBlog source`
4. Click `Commit to main`
5. Click `Push origin`

GitHub's web UI can upload up to `100` files at a time, and this project contains many more files, so local sync is the safer path.

### Step 7: Write articles

You will mostly work in two folders:

- `writing/` — Markdown articles
- `Control/` — site configuration

### Step 8: Sync updates later

In GitHub Desktop:

1. Review changed files
2. Add a commit message
3. Click Commit
4. Click Push to sync to GitHub

Once the push succeeds, the deployment platform automatically rebuilds.

## Deploy with Cloudflare Pages (Recommended)

Best for long-term, stable hosting, especially with custom domains.

### Configuration

1. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. From the sidebar, go to `Workers & Pages` → `Create` → `Pages`
3. Connect GitHub and select your repository
4. Fill in the build configuration:

| Field | Value |
| --- | --- |
| Framework preset | `None` |
| Root directory | `all` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `20` |

5. Click Deploy. After a few minutes you will get a default URL

### Custom Domain

1. Open the Pages project settings
2. Find `Custom domains`
3. Add your domain and follow the DNS instructions

The flow is even smoother if your domain is already on Cloudflare.

## Deploy with Vercel

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

## Project Structure

```text
FreeBlog/
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

## License

This project is licensed under the MIT License.
