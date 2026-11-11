Adapted from https://github.com/yuhui-zh15/Minimal-Academic-Website.

## Maintenance

Papers, research reports, and projects live in `publications.json`. The same cards are also baked into `index.html` as static HTML (by `build-static.js`) so scrapers that do not run JavaScript can read them.

- A pre-commit hook regenerates and stages `index.html` on every commit. Enable it once per clone: `git config core.hooksPath .githooks`
- A GitHub Action fails the push if `index.html` was ever committed out of sync.
- Manual run, if needed: `node build-static.js`
