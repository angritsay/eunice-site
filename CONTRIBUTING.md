# Contributing to the Eunice site

This repo is the live eunice.ai site. Whatever reaches `main` is published within a
couple of minutes, so every change goes through a branch and a pull request first.

## How a change reaches the site

1. **Branch.** Work on your own branch, never on `main`. Name it after yourself and the
   change: `yi/october-event`, `yi/fix-bio-typo`.
2. **Pull request.** Open a pull request from your branch into `main`. A draft is fine
   while you are still working.
3. **Checks.** GitHub runs the build and the tests on every push. Each check must be
   green. Red means something broke: ask Claude to fix it, or ask the repo owner (@angritsay).
4. **Preview.** A few minutes after each push, your pull request gets its own copy of
   the site at `https://angritsay.github.io/eunice-site/preview/pr-<number>/`; a bot posts
   the link on the pull request. Check your change there, on desktop and phone. The
   preview is hidden from search engines, but it is public: don't send it to clients.
5. **Review.** When the preview looks right, mark the pull request ready for review. The
   repo owner (@angritsay) reviews it and approves it. `main` is protected: a pull
   request cannot merge without that approval and green checks.
6. **Merge.** Once approved, the pull request is merged and the real site updates
   itself; the preview disappears. Check the live page afterwards (press Cmd+Shift+R to
   skip the browser cache).

## Making a change with Claude Code (recommended)

Open the repo in Claude Code and describe the change in plain words, e.g. "add the
October event in Singapore" or "update Yi's bio to …". Claude reads [`CLAUDE.md`](CLAUDE.md),
which holds the design rules, makes the change on a new branch, runs the tests and opens
a draft pull request. Open the preview link once the bot posts it, then mark the pull
request ready for review.

Ask Claude to show you a screenshot of the page before you mark it ready.

## A small text fix in the browser

For a typo, you can edit a file on github.com: open the file, click the pencil, make the
edit, then choose **Create a new branch for this commit and start a pull request**. Never
pick "Commit directly to the `main` branch" (the protection will refuse it anyway).

## Where things live

The table under **Editing** in the [README](README.md) says which file holds what:
people and bios, insights, events and roles are in `apps/web/src/content/index.ts`;
the copy of one page is in `apps/web/src/pages/<page>.ts`.

## Never

- Push to `main`, or force-push to any branch.
- Merge your own pull request. The repo owner approves and merges.
- Hand-edit the imported job posts and blog posts in `apps/web/src/content/jobs/` and
  `apps/web/src/content/posts/`; they are re-imported from the live site.
- Change a single page to fix something that shows on several pages. Fix the shared
  component in `apps/web/src/components.ts` so every page gets it.
- Add a package or dependency without saying why in the pull request.

If you are unsure, open the pull request as a draft and ask. A pull request only ever
reaches its preview link; the real site changes only when the owner merges it.
