# GSC Quick-Wins SEO & CTR Optimization Implementation Plan

**Goal:** Improve Page-1 CTR and rankings on proven Search Console quick-win queries (`pos 4–25`) and funnel guide traffic into interactive calculators.

**Spec:** [2026-11-25-gsc-quick-wins-seo-design.md](../specs/2026-11-25-gsc-quick-wins-seo-design.md)

---

### Task 1: Optimize `_guides/pace-vs-speed.md` for "Is pace and speed the same"
**Owner:** Implementer
- [x] **Step 1:** Update front-matter `title` and `description` in `_guides/pace-vs-speed.md`.
- [x] **Step 2:** Add `## Is pace the same as speed?` direct-answer section and a Markdown pace-to-speed conversion table (`min/km`, `min/mi`, `km/h`, `mph`).

### Task 2: Optimize `treadmill/index.html`, `splits/index.html`, and `pace/index.html` metadata & FAQ
**Owner:** Implementer
- [x] **Step 1:** Update `title`, `description`, FAQ, and `FAQPage` JSON-LD in `treadmill/index.html` to target treadmill speed conversion chart queries.
- [x] **Step 2:** Refine `description` in `splits/index.html` and `pace/index.html` to include `race split planner` and `half marathon time calculator` naturally.

### Task 3: Add top-of-guide calculator callout in `_layouts/guide.html`
**Owner:** Implementer
- [x] **Step 1:** In `_layouts/guide.html`, render a `.guide-callout` link to the first tool in `page.related_tools` (looking up its name from `site.data.tools`) right below `<h1>{{ page.title }}</h1>`.

### Task 4: Independent Verification
**Owner:** Verifier
- [x] **Step 1:** Run all `tests/*.test.js` (73 tests) and confirm 0 failures.
- [x] **Step 2:** Validate all JSON-LD blocks in `treadmill/index.html`, `splits/index.html`, `pace/index.html`, and `_layouts/guide.html`.
- [x] **Step 3:** Verify `_guides/pace-vs-speed.md` front-matter and Markdown table, and mark all tasks `[x]`.
