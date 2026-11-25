# AdSense Readiness, Content Quality & Traffic Growth Implementation Plan

> **Workflow:** Executed with strict role separation — **Architect** (spec & plan), **Implementer** (code & content edits), and **Verifier** (independent tests, JSON-LD/HTML/link validation, spec compliance check).

**Goal:** Eliminate AdSense approval blockers, improve E-E-A-T and SEO structure across guides and tools, pre-populate tool defaults with shareable links, and launch the Heat & Humidity Pace Adjustment Calculator (`/heat-pace/`) + accompanying guide.

**Spec:** [2026-11-25-adsense-content-quality-growth-design.md](../specs/2026-11-25-adsense-content-quality-growth-design.md)

**Tech Stack:** Jekyll (GitHub Pages), Vanilla JS (`assets/js/calc.js`, `assets/js/site.js`), Vanilla CSS (`assets/css/site.css`), Node.js unit tests (`tests/*.test.js`).

---

## Global Constraints
- Preserve all existing math functions and tests in `assets/js/calc.js` and `tests/*.test.js` (64 existing tests must continue to pass).
- Do not edit `_site/` directly.
- Every task must be checked off `- [x]` as it is completed and verified.

---

### Task 1: Remove AdSense Blockers on Trust Pages (Phase 1)
**Owner:** Implementer
**Files:**
- Modify: `about/index.html`
- Modify: `contact/index.html`
- Modify: `assets/css/site.css`

- [x] **Step 1:** Update `about/index.html` to remove `<aside class="owner-todo">` and add the real operator bio (Jiman Ryu, R.Ac., R.TCM.P. in Vancouver, software engineer, distance runner, R-Lab / Ryu Clinic Inc.), updating `updated` and `last_modified_at` to `2026-11-25`.
- [x] **Step 2:** Update `contact/index.html` to remove `<aside class="owner-todo">` and confirm `contact@ryutility.com` operator details, updating `updated` and `last_modified_at` to `2026-11-25`.
- [x] **Step 3:** Remove `.owner-todo` CSS rules from `assets/css/site.css`.

### Task 2: Guide E-E-A-T Layout, JSON-LD & Boilerplate Cleanup (Phase 2)
**Owner:** Implementer
**Files:**
- Modify: `_layouts/guide.html`
- Modify: `_guides/*.md` (10 files)
- Modify: `_includes/head-meta.html`
- Create: `assets/og-image.png`
- Modify: `assets/css/site.css` (author bio box & related-guides styling if needed)

- [x] **Step 1:** Generate `assets/og-image.png` (1200×630) and add `og:image`, `og:site_name`, and `twitter:card` tags to `_includes/head-meta.html`.
- [x] **Step 2:** Update `_layouts/guide.html` to include an Author Bio block, related-guides cross-links (up to 3 guides sharing `related_tools`), and an `Article` JSON-LD script.
- [x] **Step 3:** Clean up duplicated opening bio sentences and closing `*This guide is part of R-Lab...*` footers across all 10 `_guides/*.md` files while preserving each guide's unique opening hook and clinical/running context.

### Task 3: Tool Defaults, Shareable URLs & Navigation (Phase 3)
**Owner:** Implementer
**Files:**
- Modify: `_includes/header.html`
- Modify: `pace/index.html`, `predict/index.html`, `hr-zones/index.html`, `splits/index.html`, `treadmill/index.html`, `run/index.html`
- Modify: `assets/css/site.css` (share button styling)

- [x] **Step 1:** Add `Calculators` link to `_includes/header.html`.
- [x] **Step 2:** Add default `value` attributes (matching worked examples) and `URLSearchParams` read/share-link support to all 6 tool pages so results render immediately on load.

### Task 4: Heat & Humidity Pace Adjustment Calculator + Guide (Phase 4)
**Owner:** Implementer
**Files:**
- Modify: `assets/js/calc.js`
- Create: `tests/heat-pace.test.js`
- Create: `heat-pace/index.html`
- Modify: `_data/tools.yml`
- Create: `_guides/running-in-heat-and-humidity.md`

- [x] **Step 1:** Implement `calcDewPointC`, `heatPaceAdjustmentPct`, and `adjustPaceForHeat` in `assets/js/calc.js` and export them in `module.exports`.
- [x] **Step 2:** Write `tests/heat-pace.test.js` and verify it passes.
- [x] **Step 3:** Create `heat-pace/index.html` with full calculator UI, worked example, formula/sources, limitations, FAQ, and `FAQPage` + `SoftwareApplication` JSON-LD.
- [x] **Step 4:** Register `Heat Pace Calculator` in `_data/tools.yml` and create `_guides/running-in-heat-and-humidity.md`.

### Task 5: Independent Verification & Audit
**Owner:** Verifier
- [x] **Step 1:** Run all `tests/*.test.js` via Node and confirm 0 failures.
- [x] **Step 2:** Run automated checks (via Node script) to verify:
  - Zero `TODO` / `owner-todo` occurrences across the site.
  - All JSON-LD blocks in HTML/layouts parse as valid JSON (accounting for Liquid templates where applicable).
  - All `related_tools` in `_guides/*.md` match valid URLs in `_data/tools.yml`.
  - `assets/og-image.png` exists and is referenced in `_includes/head-meta.html`.
  - All 6+1 tool pages have default values and share-link support.
- [x] **Step 3:** Update this plan file with `[x]` checkmarks and report any findings.
