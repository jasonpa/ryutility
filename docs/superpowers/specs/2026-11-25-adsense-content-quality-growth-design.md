# AdSense Readiness, Content Quality & Traffic Growth Design

**Date:** 2026-11-25
**Goal:** Resolve remaining Google AdSense review blockers, elevate content quality and E-E-A-T signals across guides and tools, improve tool UX/retention, and add a high-synergy long-tail calculator (`/heat-pace/`) to drive organic search traffic.

Builds on:
- [2026-06-30-adsense-readiness-design.md](./2026-06-30-adsense-readiness-design.md)
- [2026-07-20-guide-content-expansion-design.md](./2026-07-20-guide-content-expansion-design.md)
- [2026-07-26-seo-structured-data-homepage-design.md](./2026-07-26-seo-structured-data-homepage-design.md)

---

## Context / Evidence

An audit of the repository on 2026-11-25 identified four key areas for improvement:
1. **AdSense Blocker:** `about/index.html` (L19–21) and `contact/index.html` (L14–16) still contain `<aside class="owner-todo">TODO (site owner): ...</aside>` placeholders. Leaving "TODO" notices on trust pages risks immediate rejection under "Under Construction" / "Low Value Content".
2. **Guide Boilerplate Duplication:** All 10 files in `_guides/*.md` repeat nearly identical opening paragraphs (*"I'm a Korean medicine doctor in Vancouver by day..."*) and closing footers (*"This guide is part of R-Lab..."*). Moving this into a shared layout bio box reduces boilerplate ratio and lets each article open with a unique hook.
3. **Missing Guide Structured Data & Social Meta:** `_layouts/guide.html` lacks `Article` JSON-LD and cross-links to other related guides. `_includes/head-meta.html` lacks `og:image` and `twitter:card` meta tags.
4. **Empty Initial Tool States & Growth Opportunity:** Several tool pages (`pace`, `predict`, `hr-zones`, `splits`, `treadmill`, `run`) start with `placeholder`-only inputs and `hidden` results, leaving the above-the-fold result area blank on first load. Furthermore, multiple guides highlight heat/humidity pacing adjustments, making a **Heat & Humidity Pace Adjustment Calculator (`/heat-pace/`)** a natural high-intent addition.

---

## Changes

### Phase 1: AdSense & Trust Signals (Blocker Removal)
- **`about/index.html`**:
  - Remove `<aside class="owner-todo">`.
  - Replace with a clear, authentic "Who runs it" section identifying **Jiman Ryu** (R.Ac., R.TCM.P. in Vancouver with 14+ years of clinical experience treating runners, software engineer, and recreational distance runner), building Ryutility under **R-Lab** (`https://ryu.clinic/lab/`) at **Ryu Clinic Inc.** (`https://ryu.clinic`).
  - Update `updated` / `last_modified_at` front matter to `2026-11-25`.
- **`contact/index.html`**:
  - Remove `<aside class="owner-todo">`.
  - State clearly that `contact@ryutility.com` is maintained by Jiman Ryu / R-Lab and monitored for bug reports, formula questions, corrections, and privacy requests.
  - Update `updated` / `last_modified_at` front matter to `2026-11-25`.
- **`assets/css/site.css`**:
  - Remove unused `.owner-todo` rules (L104–111) once no pages use them.

### Phase 2: Guide E-E-A-T, Boilerplate Reduction & SEO
- **`_layouts/guide.html`**:
  - Add an **Author Bio** section at the bottom of `<main class="guide-page">` (before `tool-links.html`) attributing the guide to Jiman Ryu (R.Ac., R.TCM.P., software engineer, runner; R-Lab / Ryu Clinic Inc.).
  - Add **Related Guides** section showing up to 3 other guides that share at least one `related_tools` entry (excluding `page.url`).
  - Add `<script type="application/ld+json">` for `@type: "Article"` including `headline`, `description`, `datePublished`, `author` (`Person`: Jiman Ryu), and `publisher` (`Organization`: Ryutility).
- **`_guides/*.md` (all 10 existing guides)**:
  - Remove the duplicated opening bio sentence and duplicated closing `*This guide is part of [R-Lab]...*` footer from each markdown file, keeping each guide's unique clinical/running anecdote or opening hook intact.
- **`_includes/head-meta.html` & `assets/og-image.png`**:
  - Generate a clean 1200×630 `assets/og-image.png` social preview card (dark/light crisp brand card for Ryutility).
  - Add `og:image`, `og:site_name`, and `twitter:card` (`summary_large_image`) tags to `_includes/head-meta.html`.

### Phase 3: Tool UX, Initial State & Navigation
- **Default Values on Initial Load**:
  - Pre-fill sensible default `value` attributes (matching each tool's worked example) on `pace/index.html`, `predict/index.html`, `hr-zones/index.html`, `splits/index.html`, `treadmill/index.html`, and `run/index.html` so that `render()` displays live results immediately on page load instead of an empty hidden box.
- **Shareable URL Parameters (`?` query string)**:
  - Support reading initial inputs from `URLSearchParams` (overriding defaults when present) and provide a lightweight **"Copy link"** button on tool pages so runners can share a specific calculation or split table.
- **Navigation (`_includes/header.html`)**:
  - Add a `Calculators` link pointing to `/` (or `/#tools`) alongside `Guides`, `About`, `Contact` so visitors arriving directly on a guide page have an obvious path to the calculators.

### Phase 4: Traffic Growth — Heat & Humidity Pace Calculator (`/heat-pace/`)
- **`assets/js/calc.js`**:
  - Add pure, exported functions:
    - `calcDewPointC(tempC, humidityPct)` (Magnus formula)
    - `heatPaceAdjustmentPct(tempC, dewPointC)` (established empirical running heat+dew-point slowdown model based on combined `temp°F + dewPoint°F` thresholds: `< 100` → 0%, `100–110` → 0.5%, `110–120` → 1.5%, `120–130` → 3.0%, `130–140` → 4.5%, `140–150` → 6.5%, `150–160` → 8.5%, `> 160` → 10.5% interpolated smoothly or stepped cleanly with documented source)
    - `adjustPaceForHeat(paceSecPerKm, tempC, humidityPct)` returning `{ dewPointC, combinedF, slowdownPct, adjustedPaceKmSec, adjustedPaceMiSec }`.
- **`heat-pace/index.html`**:
  - Full tool page (`layout: default`, `permalink: /heat-pace/`) with °C/°F toggle, humidity %, base pace (min/km or min/mi), live result cards, formula/sources, limitations, worked example, FAQ, `FAQPage` + `SoftwareApplication` JSON-LD, `related-tools.html`, and `related-guides.html`.
- **`_data/tools.yml`**:
  - Add `Heat Pace Calculator` (`/heat-pace/`).
- **`_guides/running-in-heat-and-humidity.md`**:
  - Add an in-depth guide (~800+ words) explaining dew point vs. air temperature, why pacing by heart rate or adjusted pace prevents summer overtraining, a worked example, and links to `/heat-pace/` and `/hr-zones/`.
- **`tests/heat-pace.test.js`**:
  - Unit tests covering `calcDewPointC`, `heatPaceAdjustmentPct`, and `adjustPaceForHeat` edge cases.

---

## Out of Scope / Non-goals
- Installing/running Jekyll locally if Ruby gems are not installed in this VM (verification will validate JS unit tests, JSON-LD syntax, HTML structure, and Liquid/front-matter consistency via Node scripts).
- Modifying `assets/js/calc.js` existing formulas (VDOT, Riegel, Karvonen, Tanaka, ACSM).
- Inserting live `<script async src="...adsbygoogle.js">` display ad units (site owner enables Auto Ads or ad slots in AdSense dashboard after review approval).
