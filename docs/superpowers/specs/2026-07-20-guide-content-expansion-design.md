# Guide Content Expansion — Design

## Goal

Google AdSense flagged ryutility.com as **"Low value content"** (site review, Jul 12 2026). The site currently has 6 tool pages but only 3 long-form guides, and 2 tools (`/pace/`, `/treadmill/`) have zero dedicated guide content. Goal: expand `_guides/` from 3 → 10 articles so every tool has at least 2 guides pointing at it, then request an AdSense re-review.

## Current State (audit)

| Tool | Existing guide(s) |
|---|---|
| `/run/` | vdot-vs-heart-rate-zones (primary) |
| `/predict/` | riegel-formula-race-prediction (primary), even-vs-negative-splits (secondary) |
| `/hr-zones/` | vdot-vs-heart-rate-zones (secondary only) |
| `/splits/` | even-vs-negative-splits (primary) |
| `/pace/` | riegel-formula-race-prediction (secondary only) |
| `/treadmill/` | **none** |

Existing guides run 820–987 words each.

## New Guides (7)

| # | Slug | Title | related_tools |
|---|---|---|---|
| 1 | `pace-vs-speed` | Pace vs Speed: Reading min/km, min/mi, and mph Together | `/pace/`, `/run/` |
| 2 | `treadmill-incline-pace` | Treadmill Incline and Pace: Why 1% ≈ Outdoor Running | `/treadmill/`, `/run/` |
| 3 | `heart-rate-zones-karvonen-vs-max-hr` | Heart Rate Zones Explained: Karvonen vs. % of Max HR | `/hr-zones/`, `/run/` |
| 4 | `marathon-pacing-strategy-splits` | Marathon Pacing Strategy: Building a Split Table That Survives Mile 20+ | `/splits/`, `/predict/` |
| 5 | `estimate-max-heart-rate` | How to Estimate Max Heart Rate Without a Lab Test | `/hr-zones/`, `/run/` |
| 6 | `gps-watch-pace-vs-splits` | Why Your GPS Watch Pace Doesn't Match Your Splits | `/pace/`, `/splits/` |
| 7 | `treadmill-vs-outdoor-running` | Treadmill vs Outdoor Running: When Effort and Pace Diverge | `/treadmill/`, `/hr-zones/` |

Resulting coverage: every tool has ≥2 guides.

## Content Structure & Style (match existing guides)

Each guide follows the established pattern from `_guides/riegel-formula-race-prediction.md`:

- **Frontmatter**: `title`, `description`, `date: 2026-07-20`, `related_tools` (array of tool permalinks)
- **Opening**: 1 short paragraph in the author's established voice (Korean medicine doctor + software engineer + runner, R-Lab/Ryu Clinic Inc. side project) — reuse the existing bio framing, vary the personal anecdote per topic
- **Body**: formula/mechanism section → worked numeric example → where it breaks down / common mistakes → how to apply it correctly
- **Closing "Using it in practice"** paragraph that links to the primary and secondary tool with natural anchor text
- **Closing italic sign-off line** ("This guide is part of R-Lab...") — reused verbatim per existing guides
- **Length target**: 1,000–1,400 words each (existing guides run 820–987; nudging up strengthens the "low value content" fix without padding)
- No stock imagery, no filler — every section must contain a concrete number, formula, or example (matches existing guides' density)

## File/Data Changes

- 7 new files under `_guides/<slug>.md`
- No changes needed to `_data/tools.yml` (guide↔tool linking is one-directional via `related_tools`; `related-guides.html` already filters `site.guides` by tool permalink)
- No layout/CSS changes needed — reuses `_layouts/guide.html` and existing `.related-tools` styling

## Out of Scope

- Expanding the 3 existing guides' word count (deferred — new guides address the immediate flag)
- Any AdSense dashboard interaction — that's a manual "Request review" click after this content ships and Google recrawls
- ads.txt (already confirmed live and correct in this session)

## Success Criteria

- 7 new guide files build cleanly (`bundle exec jekyll build` with no errors)
- Each new guide's `related_tools` renders correctly on the corresponding tool page via `related-guides.html`
- All existing JS tests still pass (guides don't touch `calc.js`, so this should be a no-op check)
- Site pushed to production; ads.txt re-crawl and AdSense "Request review" are manual follow-up steps for the user, not part of this work
