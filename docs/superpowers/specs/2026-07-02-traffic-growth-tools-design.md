# Traffic Growth Plan: Five Running Tools

**Date:** 2026-07-02
**Goal:** Grow organic search traffic to AdSense-meaningful levels (~10k pageviews/month) by expanding ryutility.com from one tool into a focused running-tools hub.

## Strategy

- **Niche:** Running/fitness only. Deepen topical authority around the existing training-zone calculator (RunPace) rather than competing in general utilities.
- **Content model:** Tools + rich on-page content (how-it-works, formula explanation, FAQ) on every tool page. No separate blog.
- **Rollout:** Hub-first, sequential. Ship the homepage tool hub and shared template first, then one tool per iteration in keyword-priority order. Each tool goes live and starts indexing immediately.

## Competitor Research Summary

| Site | Model | Lesson |
|------|-------|--------|
| Marathon Handbook | Content site + ~15 calculator hub | Tools + deep content + cross-linking wins |
| McMillan Running | Flagship calculator, brand-driven | Don't fight the head term on brand |
| VDOT O2 | Jack Daniels VDOT calculator | RunPace already covers this |
| Omni Calculator | General calculator farm | Beatable on running long-tail |
| Runbundle, Running Writings | Lean single-purpose tools | Small focused tools can rank |

## The Five Tools (priority order)

| # | Tool | URL | Primary keyword | Existing calc.js support |
|---|------|-----|-----------------|--------------------------|
| 1 | Simple Pace Calculator (pace ↔ time ↔ distance) | `/pace/` | running pace calculator | pace/seconds conversions |
| 2 | Race Time Predictor (Riegel, 5K–marathon) | `/predict/` | race time predictor | threshold estimation (partial) |
| 3 | Heart Rate Zone Calculator (Karvonen) | `/hr-zones/` | heart rate zone calculator | Karvonen zones (complete) |
| 4 | Split / Pace Band Calculator (even + negative splits, printable) | `/splits/` | running splits calculator | lap splits |
| 5 | Treadmill Pace Converter (mph/km/h ↔ pace, incline) | `/treadmill/` | treadmill pace conversion | speed conversions |

Excluded: calorie/BMI calculators (dominated by health giants), age-graded calculator (needs WMA data tables, lower volume).

## Architecture

- Each tool is a standalone Jekyll page using the existing shared layout (`_layouts/`, `_includes/`), following the RunPace pattern: sticky input panel (desktop), instant client-side results, content section below.
- Shared math lives in `assets/js/calc.js` (or split into focused modules if it approaches 800 lines), covered by Jest unit tests. TDD per existing workflow.
- Homepage (`index.html`) becomes a tool hub: card per tool with name, one-line description, link.
- Every tool page ends with a "Related tools" section linking to the other four plus RunPace.

## SEO Requirements (per tool page)

- Title and meta description targeting the primary keyword.
- FAQ schema (JSON-LD) matching the visible FAQ content.
- 800+ words of genuinely useful content: how it works, the formula with a worked example, FAQ (5+ questions).
- Included in sitemap (automatic via jekyll-sitemap).
- Submit URL to Google Search Console at each launch.

## Distribution (light touch)

- Google Search Console: submit sitemap and per-tool URLs; monitor query impressions monthly and strengthen pages that get impressions without clicks.
- Community: answer relevant questions on r/running and r/AdvancedRunning, linking a tool only when genuinely helpful. No paid promotion.

## Traffic Milestones (expectations, not promises)

- Months 1–2: indexing, first impressions in Search Console.
- Months 2–4: long-tail clicks begin.
- Months 6–12: AdSense-meaningful traffic (~10k pageviews/month) if pages rank on long-tail terms.

## Testing

- Unit tests for every new calc.js function (Jest, existing setup); tests written first.
- Jekyll build must pass per tool.
- Mobile layout check per tool (RunPace desktop-layout regression is the cautionary example: avoid viewport-based min-height in flex containers).

## Out of Scope

- Separate blog/articles.
- User accounts, saved results, backend of any kind (GitHub Pages static only).
- Calorie, BMI, and age-graded calculators.
