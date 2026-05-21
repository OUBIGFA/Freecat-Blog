# Article Date Snapshots

`all/git-dates.json` stores the last Git commit time for every Markdown article in `writing/`.
It also stores the first recorded publish time for articles that do not provide a `date` in frontmatter.

## Automatic Flow

Users only need to edit articles and push to `main`.

When files under `writing/` change, GitHub Actions runs `.github/workflows/update-git-dates.yml` automatically:

1. Checks out the repository with full Git history.
2. Runs `cd all && npm ci && npm run extract-dates`.
3. Commits the updated `all/git-dates.json` back to `main` if it changed.

Cloudflare Pages or Vercel then builds from the committed snapshot. No platform tokens or extra deployment settings are required.

## Build Rule

Production builds trust only `all/git-dates.json` for article modified dates.
Articles with `date` frontmatter use that value as the publish date. Articles without `date` frontmatter use the stored publish value in `all/git-dates.json`, so their publish dates do not drift when the repository is checked out again.

If `all/git-dates.json` is missing, or if it does not contain a visible article, the build fails instead of falling back to file system times. Checkout file times are not real article edit times.

## Manual Refresh

If you need to refresh the snapshot locally:

```bash
cd all
npm run extract-dates
```

Then commit `all/git-dates.json`.
