<div align="center">
  <img src="all/image/freecat.png" alt="Freecat Blog Preview" width="120">

  <h1>Freecat Blog</h1>

  <p>Write locally, back up with GitHub, and deploy a personal blog for free</p>

  <p><a href="README.md">简体中文</a> | English</p>

  <p>
    <img src="https://img.shields.io/badge/platform-Web-2563eb" alt="Platform">
    <img src="https://img.shields.io/badge/Node-20-339933" alt="Node">
    <img src="https://img.shields.io/badge/deploy-Cloudflare%20%7C%20Vercel-f97316" alt="Deploy">
    <img src="https://img.shields.io/badge/license-MIT-111827" alt="License">
  </p>

  <p>
    <a href="https://freecat-blog.pages.dev">Live Demo 01</a> |
    <a href="https://freecat-blog-op.pages.dev">Live Demo 02</a>
  </p>
</div>

## What is Freecat Blog?

Freecat Blog builds a static website from Markdown articles. Edit the files locally, then push your commits to GitHub. Cloudflare Pages or Vercel builds and publishes the website. Daily writing does not require code changes or server maintenance.

Your source files stay on your computer. After you push a commit, GitHub also stores that version.

```text
Local computer: write in writing/ and edit site settings in Control/
        ↓ Save, commit, and push
GitHub: store the pushed version
        ↓ The deployment platform detects a new commit
Cloudflare Pages / Vercel: build and publish
        ↓ Deployment succeeds
Website: show the new content
```

![Example blog home page](all/image/Tutorial/00a.png)

![Example blog page 2](all/image/Tutorial/00b.png)

![Example blog page 3](all/image/Tutorial/00c.png)

![Example blog page 4](all/image/Tutorial/00d.png)

Main features:

- Generate the home page, article pages, archive, search page, and About page.
- Set article tags, cover images, summaries, pinned status, and visibility.
- Render math formulas, charts, flowcharts, and Gantt charts.
- Embed audio, video, and external pages that permit embedding.
- Adjust spacing between Chinese and English text, and collapse long code blocks.
- Generate a Sitemap (page list), RSS (subscription feed), and llms.txt (site information for AI tools). See `Control/SEO_搜索优化.md` for settings.
- Set the site name, avatar, social links, and theme in configuration files.

## Diagram engine and rollback

Keep writing `mermaid` code fences. A pinned [Pele](https://pele.run) package renders them using the site's local fonts; the build ships the engine and MIT license under `/assets/pele/` and loads it only on diagram pages. `echarts` / `chart` fences continue to use ECharts.

Gantt charts retain their timeline canvas width so narrow containers do not push short task names outside their bars. Small screens initially show the overview, with zoom and pan for reading; other diagram types keep adapting their layout to the container.

Theme changes do not rerender Pele diagrams. Wide diagrams support zoom buttons, pinch, or `Ctrl` / `⌘` + wheel, followed by dragging to pan; ordinary wheel input still scrolls the page. `<br/>` line breaks and URL links are supported; arbitrary HTML labels and JavaScript `click` callbacks are not. Layout is not pixel-identical to Mermaid.

For rollback, set the build environment variable `DIAGRAM_ENGINE=mermaid` and rebuild. Remove it or set `pele` to restore the default. Unknown values fail explicitly. The retained Mermaid path still uses its original CDN and is not an offline fallback. Keep the legacy implementation until the rollback window closes.

Build-time SVG is not enabled yet: local font measurement works, but a single static layout makes text too small on phones. It needs responsive-layout and reading-interaction validation first; no Ondine dependency or source migration is required.

From `all/`, run `npm test` and `npm run build`. Preview uses `http://127.0.0.1:4173`; run browser checks with `npm run test:browser`.

## Folder purposes

| Folder | Purpose | When to edit |
| --- | --- | --- |
| `writing/` | Article source files | To add or change articles |
| `Control/` | Site configuration | To change site information |
| `all/` | Templates, assets, and build scripts | To change template features; not required for daily writing |

Set the deployment root directory to `all`. A detailed [Freecat Blog setup guide](<writing/Freecat Blog 免费博客构建指南.md>) is also available in Chinese.

## Prepare for deployment

This guide uses GitHub Desktop to commit and push files. A push uploads local commits to GitHub. If you know Git, you can use another Git tool.

| Tool or account | When needed | Purpose | Link |
| --- | --- | --- | --- |
| GitHub account | Required | Store the blog repository | <https://github.com/signup> |
| GitHub Desktop | To follow this guide | Commit and push local files | <https://desktop.github.com/download> |
| Markdown editor | Required | Edit articles and settings; use Obsidian or VS Code | <https://obsidian.md/> |
| Cloudflare account | If you choose Cloudflare Pages | Build and publish the website | <https://dash.cloudflare.com/sign-up> |
| Vercel account | If you choose Vercel | Build and publish the website | <https://vercel.com/signup> |

Choose one deployment platform. Cloudflare Pages is recommended for a first deployment. If you already use Vercel, you can continue with Vercel. Free plans are subject to each platform's limits and terms.

## Step 1: Create the blog repository

1. Sign in to GitHub.
2. Open [Import a repository](https://github.com/new/import).
3. Complete the form as shown below.

   | Field | Value |
   | --- | --- |
   | `Your old repository's clone URL` | `https://github.com/OUBIGFA/Freecat-Blog` |
   | `Owner` | Your GitHub account |
   | `Repository name` | A name you choose, such as `my-freecat-blog` |
   | `Privacy` | `Private` |

4. Click `Begin import`.
5. Wait for `Your new repository ... is ready`.
6. Open the new repository.
7. Make sure it contains `all/`, `Control/`, and `writing/`.

Then download a local copy of the repository:

1. Open GitHub Desktop.
2. Select `File` → `Clone repository`.
3. Select the repository you imported.
4. Select a local folder for the repository.
5. Click `Clone`.

![Clone the repository in GitHub Desktop](all/image/Tutorial/10.png)

## Step 2: Deploy the website

### Cloudflare Pages (recommended)

Platform labels can change. Use the screenshots to locate the controls. Use the table for the build settings.

1. Sign in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Click the control to create an application.

   ![Create a Cloudflare application](all/image/Tutorial/01.png)

3. Select `Pages`.

   ![Select Pages](all/image/Tutorial/02.png)

4. Select the option to import an existing Git repository.

   ![Import a Git repository](all/image/Tutorial/03.png)

5. If GitHub is not connected, follow the prompts to let Cloudflare access your blog repository.
6. Select your blog repository.

   ![Select the blog repository](all/image/Tutorial/04.png)

7. Enter a project name.
8. Set the build parameters as shown below.

   | Chinese UI | English UI | Value |
   | --- | --- | --- |
   | 框架预设 | Framework preset | `None` |
   | 根目录（高级） | Root directory (advanced) > Path | `all` |
   | 构建命令 | Build command | `npm run build` |
   | 构建输出目录 | Build output directory | `dist` |
   | 环境变量（建议填写） | Environment variables | `NODE_VERSION` = `20` (recommended) |

   ![Cloudflare Pages build settings](all/image/Tutorial/05.png)

9. Click `Save and Deploy`.
10. Wait for a successful deployment status.
11. Open the URL from Cloudflare, such as `https://your-project.pages.dev`.
12. Make sure the home page and one article open correctly.

![Cloudflare Pages deployment result](all/image/Tutorial/06.png)

Build time depends on the files, cache, and platform queue. If deployment fails, read the build log for that deployment.

Enable `Build cache` in the project settings to reuse cached dependencies. Font generation does not require Python. Cloudflare Pages does not retain this project's custom font subset cache. Later builds may still need to generate fonts.

If you have a domain, add it in the Pages project's custom domain settings. Then configure DNS as instructed. DNS records point the domain to the website. Related resources: [free domain guide](https://blog.freeorg.dpdns.org/posts/2026053112195526) and [DNSHE auto-renew project](https://github.com/OUBIGFA/dnshe-auto-renew).

### Vercel

1. Sign in to [Vercel](https://vercel.com/).
2. Select `Add New...` → `Project`.
3. If GitHub is not connected, follow the prompts to let Vercel access your blog repository.
4. Select your blog repository.
5. Click `Edit` next to `Root Directory`.

   ![Edit the Vercel root directory](all/image/Tutorial/11.png)

6. Select the `all` folder in the dialog.
7. Click `Continue`.

   ![Set the Vercel root directory to all](all/image/Tutorial/12.png)

8. Keep the default `Build and Output Settings`.
9. Click `Deploy`.
10. Wait for a successful deployment status.
11. Open the default URL from Vercel.
12. Make sure the home page and one article open correctly.

`all/vercel.json` specifies the build command, output directory, and page URL rules. Set the root directory to `all`. If the build fails or a page returns 404, check the root directory and build log first.

Vercel can reuse font subsets from its build cache. Font generation is skipped only when the cache is valid, covers the required characters, and matches the font configuration.

If you have a domain, add it under `Domains` in the project settings. Then configure DNS as instructed.

## Step 3: Write articles

Each `.md` file in `writing/` is one article. Open the repository in a Markdown editor. Create a file or copy a sample article as a template.

The section between the two `---` lines is called Frontmatter. It sets article properties such as title and date. Put the article text below the second `---`. Frontmatter is optional; omitted properties use project defaults.

```md
---
title: My First Article
date: 2026-01-01
tag:
  - notes
cover:
show_image_captions: true
description:
pinned: false
show: true
copy_content: false
---

Article content starts here.
```

| Field | Purpose or value |
| --- | --- |
| `title` | Article title. If empty, use the filename |
| `date` | Displayed publication date, such as `2026-01-01` |
| `tag` | One tag per line, in the format shown above |
| `cover` | Cover image URL. If empty, show no cover |
| `show_image_captions` | `true` shows image captions; `false` hides them |
| `description` | Article summary. If empty, extract a summary from the article |
| `pinned` | `true` pins the article; `false` does not |
| `show` | `true` publishes the article; `false` hides it from the website |
| `copy_content` | `true` shows the copy-content button; `false` hides the button |

`date` does not schedule publication. `copy_content` does not prevent readers from copying text through the browser.

## Step 4: Set site information

Edit the configuration files in `Control/`.

| File | Settings |
| --- | --- |
| `site_网站属性.md` | Site title, site name, home introduction, avatar, theme |
| `SEO_搜索优化.md` | Canonical domain, search summary, author information, AI crawler rules, llms.txt |
| `social_社交媒体.md` | Social icons, profile links, contact methods, promotion links |
| `about_关于页面.md` | About page title, introduction, and avatar |

Use these rules when editing:

- Edit parameters in the Frontmatter at the top of the file.
- Put one space after the colon when a field has a value, for example `site_name: FreeCat`.
- If a field permits an empty value, keep `key:`. Read the description next to the field for its requirements.
- Keep the field names unchanged. Fields such as `_01` and `_02` contain descriptions; the build ignores them.

Common settings:

| Setting | Action | Result |
| --- | --- | --- |
| Default theme | Set one of `theme_system`, `theme_light`, and `theme_dark` to `true`. Set the others to `false` | Select system, light, or dark mode. If all are `false`, use system mode. A visitor's saved choice takes precedence |
| Home page | Set `home_page: posts` (default) or `home_page: about` in `site_网站属性.md` | About mode renders the About content at `/`. Posts links to `/blog`, retaining the article list and pagination; `/all` remains the full archive |
| Hide the share button | Set `show_share_button: false` in `site_网站属性.md` | Omit the share button at the end of articles; defaults to `true` |
| Shuffle playback | Open the header song list and click the shuffle icon (tooltip: “随机播放”) | Start a random track and continue randomly without immediately repeating the current track (unless there is only one). Click again to restore sequential playback without interrupting the current track |
| Social link | Set the matching `*_enabled` to `true` and enter `*_url` | Show that platform's link, for example `github_enabled: true` with `github_url: https://github.com/your-account` |
| Social icon | Enter an image URL in the matching `*_icon_url` | Use that icon. If empty, use the default icon |
| Hide a social platform | Set the matching `*_enabled` to `false` | Hide that platform |
| About page | Edit `about_hero_title`, `about_hero_subtitle`, and `about_hero_avatar` | Set the title, introduction, and avatar. An empty field uses the corresponding home page value |

## Publish daily updates

After you edit articles or settings, use these steps to publish the changes. The default branch is `main`. If you renamed it, the commit button shows the new branch name.

1. Save the changed files.
2. Open GitHub Desktop.
3. Select your blog repository.
4. Check the file list for the changes you want to publish.
5. Enter a commit message in `Summary`.
6. Click `Commit to main`.

   ![Commit local changes](all/image/Tutorial/08.png)

7. Click `Push origin`.

   ![Push the commit to GitHub](all/image/Tutorial/09.png)

8. Wait for the deployment platform to deploy the new commit successfully.
9. Open the website to check the changed content.

If the content did not change, follow the checks under "Common questions" below.

## Audio and video players

Put a direct media URL in Markdown image syntax. The build creates a player. A direct URL returns the media file, not a sharing page. Replace the example URLs with your file URLs.

```md
![Example audio](https://example.com/audio.mp3)
![Example video](https://example.com/video.mp4)
```

If the URL has no media extension, add `🎵` for audio or `🎬` for video before the text in brackets.

```md
![🎵Example audio](https://example.com/audio)
![🎬Example video](https://example.com/video)
```

The build recognizes these extensions:

- Audio: `.mp3`, `.m4a`, `.wav`, `.ogg`, `.aac`, `.flac`, `.opus`.
- Video: `.mp4`, `.webm`, `.mov`, `.m4v`, `.ogv`, `.m3u8`.

A recognized extension does not guarantee playback. Playback also depends on the encoding, browser support, and media server access rules.

To check a media URL:

1. Open the URL in a browser window where you are not signed in to the media website.
2. Make sure it returns the media file, not a sharing, sign-in, or access-code page.
3. Put the URL in the article.
4. Test the player in the local preview or on the published website.

If you only have a sharing link, you can try the [direct link tool](https://link.gimhoy.com/), [sharing link converter](https://lz.qaiu.top/), or [Feijipan](https://www.feijipan.com). A usable direct URL depends on service support.

If a player stops working, open the direct URL to check it. If the URL expired, get a new one. Replace the article URL, then commit and push. If the URL works but the player fails, check the encoding and server access rules.

## Update the template

GitHub Actions runs automated tasks in a repository. The `.github/workflows/sync-upstream.yml` workflow copies template files from [OUBIGFA/Freecat-Blog](https://github.com/OUBIGFA/Freecat-Blog).

The default schedule is Tuesday at 02:17 Beijing time (UTC+8). Scheduled runs can be delayed; use the `Actions` records to check the actual run time. The workflow skips synchronization when it runs in the upstream repository itself.

Before first use:

1. Open `Actions` in your repository.
2. If GitHub prompts you to enable workflows, enable them.
3. Make sure repository or organization policies permit the workflow to write to the repository.

The workflow uses the scope below. Preserved files are excluded from template replacement.

| Scope | Files or folders |
| --- | --- |
| Synchronized | `all/`, `README.md`, `README.en.md` |
| Local versions preserved | `all/git-dates.json`, `all/build/font-subsets-manifest.json`, `all/src/assets/fonts/` |
| Unchanged | `Control/`, `writing/`, `.github/`, `.gitignore` |

If you changed templates, styles, scripts, or READMEs in the synchronized scope, save a copy of your changes first. Synchronization can overwrite them.

To run synchronization manually:

1. Open `Actions` in your repository.
2. Select `Sync upstream template files`.
3. Click `Run workflow`.
4. Select the `main` branch in the run form.
5. Click `Run workflow` in that form.
6. Wait for the run to succeed.
7. If the run created a commit, make sure the deployment platform deployed it.

The first run can create a baseline commit. Later runs skip file updates if there are no template changes to copy.

### Correct workflow problems

Read the failed task's log before you decide to update a workflow. The two workflows have different purposes:

| Workflow | Purpose |
| --- | --- |
| [sync-upstream.yml](https://github.com/OUBIGFA/Freecat-Blog/blob/main/.github/workflows/sync-upstream.yml) | Synchronize template files in the scope above |
| [update-git-dates.yml](https://github.com/OUBIGFA/Freecat-Blog/blob/main/.github/workflows/update-git-dates.yml) | Update article snapshots, including dates, stable article IDs, and recent changes |

If the log identifies a missing workflow fix, copy the corresponding upstream file into the same file in your repository. Then commit and push. Workflow files are in `.github/workflows/`; template synchronization does not update them. After the update, run the corresponding workflow manually in `Actions` and check its result.

If a new feature needs additional settings, read its parameters in the upstream [Control folder](https://github.com/OUBIGFA/Freecat-Blog/tree/main/Control). Add the required parameters to the corresponding local file. Keep your existing configuration values.

## Common questions

| Question | Answer |
| --- | --- |
| Do I need coding knowledge? | Daily use requires Markdown and configuration edits. Template feature changes require relevant coding knowledge |
| Must I buy a domain? | No. Cloudflare Pages and Vercel both provide a default URL |
| Which build settings should I check? | Use root directory `all` and output directory `dist`. The output path is relative to the root directory; do not enter `all/dist` |
| Can I change deployment platforms? | Yes. Import the same GitHub repository into the new platform. Follow this guide's configuration steps. For a custom domain, also update the domain connection and DNS |
| Can I delete sample articles? | Yes. Delete their files from `writing/`, then commit and push |
| Can I edit `all/`? | Yes, but template synchronization can overwrite your changes. Use `writing/` and `Control/` for daily content and site settings |

### Local files changed, but the website did not

Check the following items in order. Correct each failed item before you continue.

1. Make sure the editor saved the files.
2. Make sure GitHub Desktop committed and pushed the changes.
3. Make sure the changed files appear in the GitHub repository.
4. Make sure the deployment platform successfully deployed the commit that contains the changes.
5. Press `Ctrl + F5` on the website page to force a refresh.

If deployment failed, read the build log. A browser refresh cannot correct a failed build.

### Use .gitignore

`.gitignore` specifies untracked files that Git must ignore. Put one rule on each line, for example:

```gitignore
drafts/
Thumbs.db
*.log
```

New ignore rules do not affect tracked files. They do not remove files from the repository or erase file history.

## Local preview (optional)

Use local preview to check content before publication. A local build is not required for platform deployment; the platform builds the website itself.

1. Install [Node.js](https://nodejs.org/) (this project's deployment examples use Node.js 20).
2. Open a terminal in the repository root.
3. Run `cd all` to enter the build directory.
4. Before first use, or after dependencies change, run `npm install`.
5. Run `npm run preview`.
6. Wait for `Preview ready: http://127.0.0.1:4173/` in the terminal.
7. Open <http://127.0.0.1:4173/> in a browser.

`npm run preview` runs a full build, then starts the preview server. It does not open a browser or watch for later file changes. After you edit files, press `Ctrl + C` in the preview terminal to stop the server. Then run `npm run preview` again.

The build output is in `all/dist/`. Do not edit or commit that directory.

## License

This project uses the MIT License.
