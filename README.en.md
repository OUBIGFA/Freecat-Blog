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
    <a href="https://blog.freeorg.dpdns.org">Live Demo</a>
  </p>
</div>

## What Is This Project?

Freecat Blog is a personal blog template for regular users. You can think of it like this:

- `writing/` is your article folder. Put Markdown articles there.
- `Control/` is your site settings folder. Edit the site name, avatar, intro, and social links there.
- `all/` is the site generator. Deployment platforms read this folder and turn your articles and settings into a real website.

You do not need to buy a server or write web page code. In daily use, you mainly do three things:

1. Write articles in `writing/`.
2. Customize your site in `Control/`.
3. Sync with GitHub Desktop. Cloudflare Pages or Vercel will rebuild and publish the site automatically.

In one sentence: **Freecat Blog turns local Markdown files into a free personal website.**

## The 3 Folders Beginners Should Remember

| Folder | Edit often? | What it does |
| --- | --- | --- |
| `writing/` | Yes | Stores your blog posts. One Markdown file is one article. |
| `Control/` | Yes | Controls the site name, avatar, home intro, social links, and About page. |
| `all/` | Usually no | The build workspace. Deployment platforms enter this folder to run the build command. |

Beginner rule: **write in `writing/`, customize in `Control/`, and set the deployment root directory to `all`.**

## How It Works

The publishing pipeline is short:

```text
Local writing/ articles
        +
Local Control/ settings
        ↓
Sync to GitHub
        ↓
Cloudflare Pages / Vercel builds automatically
        ↓
Your blog website is generated and published
```

Your content is stored on your computer and on GitHub. The deployment platform only generates web pages from it.

## Who Is It For?

- People who want a personal blog without maintaining a server
- People who like writing in Markdown
- People who want to keep their writing files under their own control
- People who want free deployment on Cloudflare Pages or Vercel
- People who use Obsidian, VS Code, or any Markdown editor

## Features

- Local-first: your articles are local Markdown files that can be backed up, migrated, and versioned
- GitHub sync: use GitHub Desktop to commit and sync changes instead of manually uploading pages
- Free deployment: supports Cloudflare Pages and Vercel
- Auto-generated pages: home, post detail, archive, search, and About
- Article controls: tags, covers, descriptions, pinned posts, and visibility
- Reading polish: optimized display for mixed Chinese/English text, numbers, units, code blocks, and math
- Audio support: paste an audio direct link in an article to generate a player
- No-code customization: edit site basics through `Control/`
- Portable: your content lives in your own repository, so you can move deployment platforms later

## Prerequisites

Prepare these first:

| Tool / account | Required? | Purpose |
| --- | --- | --- |
| GitHub account | Required | Stores your blog repository |
| GitHub Desktop | Required | Syncs local changes to GitHub |
| Cloudflare account | Recommended | Deploys the blog |
| Vercel account | Optional | Alternative deployment platform |

GitHub Desktop: <https://desktop.github.com/download>

Pick either Cloudflare Pages or Vercel. Complete beginners should start with Cloudflare Pages.

## First Setup: Put This Project Under Your Own GitHub Account

You need to copy Freecat Blog into your own GitHub account first. There are two routes:

| Route | Recommendation | Best for | Can sync future template updates? |
| --- | --- | --- | --- |
| GitHub Importer | Recommended | Users willing to follow a few GitHub steps | Yes |
| Download ZIP + copy and paste | Fallback | Beginners who just want to get started | Not directly |

Pick only one route. Do not do both.

## Route A: GitHub Importer, Recommended

This route copies Freecat Blog into your GitHub account with its Git history. That makes future template updates easier.

### Step 1: Open GitHub Importer

1. Sign in to GitHub.
2. Open: <https://github.com/new/import>

### Step 2: Fill In the Import Form

| Field | Value |
| --- | --- |
| `Your old repository's clone URL` | `https://github.com/OUBIGFA/Freecat-Blog` |
| `Owner` | Your GitHub account |
| `Repository name` | Your repository name, for example `my-freecat-blog` |
| `Privacy` | Recommended: `Private` |

Click `Begin import`. It usually finishes in seconds to a few minutes.

### Step 3: Clone Locally with GitHub Desktop

1. Open GitHub Desktop and sign in.
2. Click `File` -> `Clone repository`.
3. Select the repository you just imported.
4. Choose a local folder.
5. Click `Clone`.

After this, your computer has the full blog project folder.

## Route B: Download ZIP + Copy and Paste, Fallback

Use this if GitHub Importer is unavailable or you want the simplest path.

Note: repositories created this way cannot conveniently sync future upstream template updates. It is fine if you just want to get the blog online first.

### Step 1: Create Your Own GitHub Repository

1. Open: <https://github.com/new>
2. Name it something like `my-freecat-blog`.
3. Choose `Private`.
4. Enable `Add a README file`.
5. Click `Create repository`.

### Step 2: Download the Freecat Blog Source

1. Open the original project: <https://github.com/OUBIGFA/Freecat-Blog>
2. Click `Code`.
3. Click `Download ZIP`.
4. Extract the downloaded ZIP file.

### Step 3: Clone Your Repository Locally

1. Open GitHub Desktop.
2. Select the repository you just created.
3. Click `Clone`.

### Step 4: Copy the Source Files

1. Open the extracted Freecat Blog folder.
2. Enter the inner folder that actually contains the source files.
3. Copy everything inside it.
4. Paste those files into the local repository folder cloned by GitHub Desktop.
5. If asked whether to replace `README.md`, choose replace.

Do not paste the outer folder itself. The correct result is that the repository root directly contains `all/`, `Control/`, `writing/`, and `README.md`.

![Correct root directory example](all/image/Tutorial/10.png)

### Step 5: Sync to GitHub for the First Time

1. Go back to GitHub Desktop.
2. You will see many new files.
3. Use a commit message like `Import Freecat Blog source`.
4. Click `Commit to main`.
5. Click `Push origin`.

## Start Writing: Use `writing/`

`writing/` is the folder you will use most. Each Markdown file is one article.

The project includes several sample articles. You can:

- Open them to learn the format
- Copy one as a template
- Delete sample articles you do not need
- Create your own `.md` files

A typical article looks like this:

```md
---
title: My First Article
date: 2026-05-03
tag:
  - Notes
cover:
show_cover: false
show_image_captions: true
description: Write the article summary here
pinned: false
show: true
---

Start writing here.
```

Common fields:

| Field | Purpose |
| --- | --- |
| `title` | Article title |
| `date` | Publish date |
| `tag` | Article tags. You can use multiple tags. |
| `cover` | Cover image URL |
| `show_cover` | Whether to show the cover on the article page |
| `description` | Article summary. If empty, it is generated automatically. |
| `pinned` | Whether to pin the article |
| `show` | Whether to show the article on the site |

After writing, save the file, commit with GitHub Desktop, and push. The deployment platform will update the website automatically.

## Customize the Site: Use `Control/`

`Control/` is the site control panel. If you want to turn the template into your own blog, edit this folder first.

| File | What it controls |
| --- | --- |
| `site_网站属性.md` | Site title, site name, home intro, avatar, theme, official domain |
| `social_社交媒体.md` | Social icons, profile links, contact links, promotion links |
| `about_关于页面.md` | About page title, intro, and avatar |

These files use a settings block wrapped by `---` at the top:

```yaml
---
site_title: FreeCat Blog
site_name: FreeCat
hero_title: Hi, I'm FreeCat.
---
```

Editing rules:

- Keep one space after the colon, for example `site_name: FreeCat`
- Empty fields may stay empty, but do not delete the whole line
- Lines like `_01` and `_02` are helper notes; do not rename those keys
- After editing, commit and push with GitHub Desktop so the live site can rebuild

### Common Settings in `site_网站属性.md`

| Field | Description |
| --- | --- |
| `site_title` | Browser tab title |
| `site_favicon` | Browser favicon URL. Empty means the default icon is used. |
| `site_name` | Site name shown in the header |
| `site_logo_icon` | Site logo URL. Empty means the default icon is used. |
| `hero_title` | Home page main title |
| `hero_subtitle` | Home page intro text |
| `hero_avatar` | Home page avatar URL |
| `posts_per_page` | Number of posts on the home page. Empty = 8. `0` = show all. |
| `footer_copyright` | Footer copyright text |
| `theme_system` | Follow system theme |
| `theme_light` | Force light theme |
| `theme_dark` | Force dark theme |
| `site_url` | Official site URL, used for Sitemap |

Only one of `theme_system`, `theme_light`, and `theme_dark` should be `true`.

### Common Settings in `social_社交媒体.md`

Each platform usually has 3 fields:

| Field type | Example | Purpose |
| --- | --- | --- |
| Enable switch | `github_enabled: true` | `true` shows it, `false` hides it |
| Custom icon | `github_icon_url:` | Empty uses the default icon; you can also paste your own icon URL |
| Profile URL | `github_url: https://github.com` | Where the icon links to |

For platforms you do not use, set `*_enabled` to `false`.

### Common Settings in `about_关于页面.md`

| Field | Description |
| --- | --- |
| `about_hero_title` | About page title. Empty uses the home title. |
| `about_hero_subtitle` | About page intro. Empty uses the home intro. |
| `about_hero_avatar` | About page avatar. Empty uses the home avatar. |

To keep the About page consistent with the home page, leave all three fields empty.

## Local Preview and Build

If you only want to write and deploy, you do not have to build locally. Cloudflare Pages or Vercel will build for you.

If you want to check the site on your computer first:

```bash
cd all
npm install
npm run build
```

After a successful build, this folder is generated:

```text
all/dist/
```

`all/dist/` contains generated website files. Do not edit it manually, and do not commit it to GitHub.

## Deploy to Cloudflare Pages, Recommended

Cloudflare Pages is a good default for long-term personal blog hosting. The key is to fill in the build settings correctly.

### Step 1: Enter Cloudflare Pages

1. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Create an application.

![Cloudflare step 1](all/image/Tutorial/01.png)

3. Choose Pages.

![Cloudflare step 2](all/image/Tutorial/02.png)

4. Choose to import an existing Git repository.

![Cloudflare step 3](all/image/Tutorial/03.png)

5. Select your blog repository.

![Cloudflare step 4](all/image/Tutorial/04.png)

### Step 2: Fill In Build Settings

The project name can be anything. Fill in the important fields like this:

| Cloudflare Chinese UI | Cloudflare English UI | Value |
| --- | --- | --- |
| 框架预设 | Framework preset | `None`, `无`, or no preset |
| 根目录（高级） | Root directory (advanced) > Path | `all` |
| 构建命令 | Build command | `npm run build` |
| 构建输出目录 | Build output directory | `dist` |
| 环境变量 | Environment variables | `NODE_VERSION` = `20` |

![Cloudflare step 5](all/image/Tutorial/05.png)

Click `Save and Deploy` and wait for the build to finish.

![Cloudflare step 6](all/image/Tutorial/06.png)

### Step 3: Visit the Website

After the build finishes, Cloudflare gives you a default URL. Use it to check your blog first.

If you want your own domain, bind a custom domain in Cloudflare Pages.

Free domain guide: <https://blog.freeorg.dpdns.org/posts/%E5%85%8D%E8%B4%B9%E5%9F%9F%E5%90%8D%E7%94%B3%E8%AF%B7%E6%8C%87%E5%8D%97.html>

DNSHE auto-renew project: <https://github.com/OUBIGFA/dnshe-auto-renew>

## Deploy to Vercel, Fallback

If you already use Vercel, you can deploy there too.

1. Sign in to [Vercel](https://vercel.com/).
2. Click `Add New...` -> `Project`.
3. Connect GitHub and select your blog repository.
4. Fill in the settings:

| Field | Value |
| --- | --- |
| Framework Preset | Keep the default or choose a plain static build option |
| Root Directory | `all` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node Version | `20` |

5. Click `Deploy`.

For a custom domain, open project settings -> `Domains` and follow the DNS instructions.

## How to Update the Blog Later

After deployment, everyday updates are only 5 steps:

1. Add or edit articles in `writing/`.
2. Edit site settings in `Control/` if needed.
3. Save the files.
4. Open GitHub Desktop and click `Commit to main`.
5. Click `Push origin`.

![GitHub Desktop commit](all/image/Tutorial/08.png)

![GitHub Desktop push](all/image/Tutorial/09.png)

After the push succeeds, Cloudflare Pages or Vercel rebuilds automatically. Refresh the site after a short wait.

## Project Structure

```text
Freecat-Blog/
├── Control/                # Site configuration. Beginners mainly edit this.
│   ├── site_网站属性.md
│   ├── social_社交媒体.md
│   └── about_关于页面.md
├── writing/                # Markdown article source files. Beginners mainly write here.
├── all/                    # Build workspace. Deployment platforms build from here.
│   ├── src/                # Page templates
│   ├── image/              # Image assets
│   ├── build/              # Build helper scripts
│   ├── build.js            # Main build script
│   ├── package.json        # Build dependencies and commands
│   └── dist/               # Generated output. Do not edit manually.
├── README.md
└── README.en.md
```

## Audio Player in Articles

Use a blockquote with an audio direct link to generate a player:

```md
>[Sample audio](https://example.com/audio.m4a)
```

If the link has no obvious audio extension, add the music symbol to force recognition:

```md
>[🎵Sample audio](https://example.com/audio)
```

Supported formats: `.mp3`, `.m4a`, `.wav`, `.ogg`, `.aac`, `.flac`, `.opus`.

Helper tools:

- Cloud share link to direct link converter: <https://lz.qaiu.top/>
- Cloud direct link extractor: <https://link.gimhoy.com/>
- Feijipan cloud drive: <https://www.feijipan.com>

## Write with Obsidian

You can open this blog repository directly as an Obsidian vault. Write articles under `writing/`.

Benefits:

- Articles stay local and easy to manage
- Obsidian backlinks, tags, and search are available
- Write locally, sync with GitHub Desktop, and let the site publish automatically

## Sync Upstream Template Updates, Advanced

If you used the GitHub Importer route, you can sync updates from the upstream Freecat Blog template.

If you used ZIP + copy and paste, use the fallback method at the end of this section.

### Before the First Sync: Add the Upstream Repository

Open a terminal in your local repository:

```bash
cd /full/path/to/your/local/repository
```

Add upstream:

```bash
git remote add upstream https://github.com/OUBIGFA/Freecat-Blog.git
```

Check it:

```bash
git remote -v
```

If you see both `origin` and `upstream`, it worked.

### Sync Upstream Updates Each Time

```bash
git fetch upstream
git log HEAD..upstream/main --oneline
git merge upstream/main
git push origin main
```

Meaning:

- `git fetch upstream`: fetches latest upstream code without changing your files
- `git log HEAD..upstream/main --oneline`: shows what is new upstream
- `git merge upstream/main`: merges upstream updates into your repository
- `git push origin main`: pushes the merged result back to GitHub

### If Conflicts Happen

Conflicts usually mean you and upstream edited the same file. A conflict looks like this:

```text
  <<<<<<< HEAD
your content
  =======
upstream template content
  >>>>>>> upstream/main
```

How to resolve:

1. Open the conflict file.
2. Keep the content you want.
3. Delete the `<<<<<<<`, `=======`, and `>>>>>>>` markers.
4. Save the file.
5. Run:

```bash
git add .
git commit -m "Merge upstream Freecat Blog updates"
git push origin main
```

General advice:

- Prefer your own settings in `Control/`
- Prefer your own articles in `writing/`
- Usually keep upstream template updates in `all/`

### Fallback Update Method for ZIP Route

If your repository was built with ZIP + copy and paste, do not force the `git merge` method above.

Manual update:

1. Download the latest Freecat Blog ZIP again.
2. Extract it.
3. Copy template files such as `all/`, `README.md`, and `README.en.md` into your repository.
4. Do not overwrite your own `Control/` or `writing/`.
5. Review changes in GitHub Desktop.
6. If your content is safe, commit and push.

## FAQ

**Q: Do I need to know programming?**

No. For daily use, you only edit Markdown files and settings files.

**Q: What should I mainly edit?**

Write articles in `writing/`. Edit site information in `Control/`. Beginners usually should not edit `all/`.

**Q: Do I need to buy a domain?**

No. Cloudflare Pages and Vercel both provide a default URL first.

**Q: What are the most common deployment mistakes?**

`Root Directory` must be `all`, and `Output Directory` must be `dist`, not `all/dist`.

**Q: I edited locally but the website did not change. What should I check?**

Make sure the file was saved, GitHub Desktop pushed the change, and the deployment platform started a new build. Then hard-refresh the browser.

**Q: Should I choose Cloudflare Pages or Vercel?**

Complete beginners should choose Cloudflare Pages. Existing Vercel users can choose Vercel. Your content stays on GitHub, so you can migrate later.

**Q: Can I delete the sample articles?**

Yes. They are in `writing/`. Delete them, commit, and push.

**Q: I already used the ZIP route. Can I switch to the Importer route?**

Yes. The safest way is to create a new repository with GitHub Importer, copy your old `Control/` and `writing/` folders over, then redeploy or switch the deployment project to the new repository.

**Q: `git remote add upstream` says `remote upstream already exists`. What should I do?**

It was already added. Run:

```bash
git remote set-url upstream https://github.com/OUBIGFA/Freecat-Blog.git
```

**Q: `git merge upstream/main` says `refusing to merge unrelated histories`. What should I do?**

This usually means your repository was created with the ZIP route, so it should not merge upstream directly. Use the ZIP fallback update method above, or rebuild the repository with GitHub Importer.

## License

This project is licensed under the MIT License.
