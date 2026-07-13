# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ryutility (ryutility.com) — a Jekyll static site of free running/training calculators, deployed to GitHub Pages (see `CNAME`). No JS framework, no build tooling beyond Jekyll/Sass, no package.json.

## Commands

```bash
# Serve locally (if the shell locale is unset/C, prefix LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8 to avoid an
# SCSS "Invalid US-ASCII character" build error from a gem-bundled theme asset — check `locale` first)
bundle exec jekyll serve --port 4321

# Build only
bundle exec jekyll build

# Run all JS unit tests (plain Node scripts, no test framework/package.json)
for f in tests/*.test.js; do node "$f"; done

# Run a single test file
node tests/pace.test.js
```

Tests use a hand-rolled `test()`/`assert` helper (see any file in `tests/`) and `require()` the browser-facing `assets/js/calc.js` via its Node `module.exports` guard at the bottom of that file — no separate test-only implementation.

## Architecture

**Two content models coexist:**
- **Tools** (`/run/`, `/pace/`, `/predict/`, `/hr-zones/`, `/splits/`, `/treadmill/`) are hand-written pages, each `layout: default`, with their own inline `<form>` + `<script>` calling shared functions from `assets/js/calc.js`. Tool metadata (name, url, badge, description) lives in `_data/tools.yml` and drives `_includes/related-tools.html`, which renders cross-links between tool pages.
- **Guides** (`_guides/*.md`) are a Jekyll collection (configured in `_config.yml`) of long-form articles, rendered through `_layouts/guide.html`. Guides link to tools via a `related_tools:` front-matter array (matched against `_data/tools.yml` in `_includes/tool-links.html`), and tools link back to guides via `_includes/related-guides.html`, which filters `site.guides` where `related_tools` contains the current tool's permalink. New guide docs get `layout: guide` automatically from the `defaults:` scope in `_config.yml` — don't set it per-file.

**All math lives in one place**: `assets/js/calc.js` is a single shared library — pace/time/distance conversions, VDOT, Karvonen heart-rate zones, Riegel race prediction, split tables, treadmill/incline conversion. It's loaded as a classic `<script>` in every tool page (top-level function declarations become shared globals) and also `require()`-d directly in `tests/*.test.js`. When adding a calculator function, add it here and add it to the `module.exports` block at the bottom, not to a page-local `<script>`.

**Shared page chrome**: `_layouts/default.html` includes `head-meta.html`, `header.html`, `footer.html`, `cookie-banner.html`, `site.js` — edit these once rather than per-page. Tool/guide cross-link cards (`related-tools.html`, `related-guides.html`, `tool-links.html`) all reuse the same `.related-tools`/`.related-grid`/`.related-card` CSS classes in `assets/css/site.css` rather than each having their own styles.

**`_site/`** is the generated build output — don't edit it directly.
