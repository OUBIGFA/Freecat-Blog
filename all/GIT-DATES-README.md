# Article Date Snapshots

`all/git-dates.json` stores the last Git commit time for every Markdown article in `writing/`.
It also stores each article's first recorded publish time, fixed public post id, and latest body update summary.

## Automatic Flow

Users only need to edit articles and push to `main`.

When files under `writing/` change, GitHub Actions runs `.github/workflows/update-git-dates.yml` automatically:

1. Checks out the repository with full Git history.
2. Runs `cd all && npm ci && npm run extract-dates`.
3. Commits the updated `all/git-dates.json` back to `main` if it changed.

Every hosting platform builds from the committed snapshot. No platform tokens or extra deployment settings are required.

## Build Rule

Production builds trust only `all/git-dates.json` for article modified dates, fixed post ids, and latest update summaries.
Articles with `date` frontmatter use that value as the publish date. Articles without `date` frontmatter use the stored publish value in `all/git-dates.json`, so their publish dates do not drift when the repository is checked out again.
Article links use the stored fixed post id, so changing a title or renaming a file does not change the public URL after the snapshot workflow has recorded the article.
Articles with `show_latest_update: true` use the stored latest body update summary; frontmatter-only changes are ignored.
Public article URLs are extensionless, such as `/posts/2026053111535906`; the generated file lives at `dist/posts/2026053111535906/index.html`.

If `all/git-dates.json` is missing, the build fails instead of falling back to file system times. Checkout file times are not real article edit times. If the snapshot does not contain a visible article yet, every platform skips that article and keeps building until the snapshot workflow records it.

## Manual Refresh

If you need to refresh the snapshot locally:

```bash
cd all
npm run extract-dates
```

Then commit `all/git-dates.json`.
