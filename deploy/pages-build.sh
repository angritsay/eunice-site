#!/usr/bin/env bash
# Builds what GitHub Pages serves: main at the root, and every open pull request
# from this repository under preview/pr-<N>/, so a change can be seen on a real
# site before it is merged. Pull requests from forks are never built.
#
# Run from the repository root, on a checkout of main, with pnpm installed.
#   REPO      owner/name, e.g. angritsay/eunice-site
#   GH_TOKEN  a token that can list pull requests
# Writes apps/web/dist/ and prints the previewed pull request numbers, one per
# line, to the file named by PREVIEWS_OUT (default: previews.txt).
set -euo pipefail

: "${REPO:?set REPO to owner/name}"
repo_name=${REPO#*/}
out=apps/web/dist
list=${PREVIEWS_OUT:-previews.txt}
: >"$list"

# main, exactly as it always deployed: project pages live under /<repo-name>/.
BASE_PATH="/$repo_name/" pnpm build

# Search engines: previews carry noindex. robots.txt only takes effect once the
# site is served from the root of its own domain.
printf 'User-agent: *\nDisallow: /preview/\n' >"$out/robots.txt"

numbers=$(gh pr list --repo "$REPO" --state open --limit 50 \
  --json number,isCrossRepository --jq '.[] | select(.isCrossRepository | not) | .number')

for n in $numbers; do
  dir=$(mktemp -d)
  git fetch --quiet --depth=1 origin "pull/$n/head"
  git worktree add --quiet --detach "$dir" FETCH_HEAD
  if (cd "$dir" && pnpm install --frozen-lockfile --silent &&
    BASE_PATH="/$repo_name/preview/pr-$n/" pnpm build); then
    dest="$out/preview/pr-$n"
    mkdir -p "$dest"
    cp -R "$dir/apps/web/dist/." "$dest/"
    find "$dest" -name '*.html' -exec sed -i 's|<head>|<head>\n<meta name="robots" content="noindex">|' {} +
    echo "$n" >>"$list"
  else
    echo "::warning::Pull request #$n did not build, so it has no preview this time."
  fi
  git worktree remove --force "$dir"
done
