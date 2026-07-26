# SEO Structured Data + Homepage Targeting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the structured-data gaps on ryutility.com's 6 calculator pages and retarget the homepage's `<title>`/`<meta description>`, so existing Google Search Console impressions (currently ~1,020 impressions / 0 clicks, avg. position 68) have a better shot at converting to clicks.

**Architecture:** Purely additive JSON-LD `<script type="application/ld+json">` blocks appended to the end of each existing static Jekyll page, following the exact pattern the `FAQPage` schema already uses on 5 of the 6 tool pages. Homepage gets a `<title>`/`<meta name="description">` copy change plus two new JSON-LD blocks generated from the existing `_data/tools.yml` via Liquid (no new data file). No JavaScript logic, no `assets/js/calc.js` changes, no visual/layout changes.

**Tech Stack:** Jekyll (Liquid templating), static HTML, JSON-LD (schema.org). No new dependencies.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-26-seo-structured-data-homepage-design.md`
- No changes to `assets/js/calc.js` or any calculation logic.
- No `aggregateRating` in any `SoftwareApplication` block — don't fabricate ratings that don't exist.
- No new visible content or UI — schema + `<title>`/`<meta description>` only.
- Every JSON-LD block must be valid JSON (no trailing commas, matching braces) — a Jekyll build only catches Liquid syntax errors, not malformed JSON, so each block must be eyeballed or checked with `python3 -m json.tool` before commit.
- Site base URL for absolute URLs in schema: `https://ryutility.com` (per `robots.txt`'s sitemap declaration).

---

### Task 1: Add missing `FAQPage` schema to `/run/`

**Files:**
- Modify: `run/index.html` (append after the closing `</script>` of the existing inline calculator script, currently the last line of the file)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by other tasks — this is a standalone parity fix. The 5 questions below must exactly match the visible FAQ `<details>` blocks already in `run/index.html` (lines ~344–366): "What is VDOT?", "How accurate are the training zones?", "Do I need a recent race time?", "What if I don't know my max heart rate?", "Can I compare a goal race pace to my current fitness?".

- [ ] **Step 1: Append the `FAQPage` JSON-LD block to the end of `run/index.html`**

Add this immediately after the final `</script>` in the file:

```html

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "What is VDOT?", "acceptedAnswer": {"@type": "Answer", "text": "VDOT is a fitness metric developed by exercise physiologist Jack Daniels. It converts a race performance into a single number that predicts equivalent performances at other distances and prescribes training paces."}},
    {"@type": "Question", "name": "How accurate are the training zones?", "acceptedAnswer": {"@type": "Answer", "text": "The zones are estimates based on a validated formula, not a lab test. They're accurate enough to guide day-to-day training, but factors like heat, terrain, and fatigue will shift your actual effort on any given run."}},
    {"@type": "Question", "name": "Do I need a recent race time?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — the calculator needs a real, honest effort (a 5K or 10K time trial or race result from the last few weeks) to estimate your current fitness accurately. Old or non-maximal efforts will skew your zones."}},
    {"@type": "Question", "name": "What if I don't know my max heart rate?", "acceptedAnswer": {"@type": "Answer", "text": "Heart-rate ranges are optional. Leave Max HR and Resting HR blank and the calculator will still show pace-based and lap-split zones."}},
    {"@type": "Question", "name": "Can I compare a goal race pace to my current fitness?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — fill in the optional Target Race section with a goal distance and time to see your target zones compared side-by-side with your current zones, including how much faster or slower the goal pace is."}}
  ]
}
</script>
```

- [ ] **Step 2: Validate the JSON is well-formed**

Run:
```bash
sed -n '/FAQPage/,/^<\/script>/p' run/index.html | sed '1d;$d' | python3 -c "import json,sys; json.loads(sys.stdin.read()); print('valid')"
```
Expected: `valid`

If this is fiddly to isolate with `sed`, instead copy the JSON body (the `{...}` between the `<script>` tags you just added) into a scratch file and run `python3 -m json.tool scratch.json > /dev/null && echo valid`.

- [ ] **Step 3: Build the site and confirm no errors**

Run: `bundle exec jekyll build`
Expected: build completes with no errors (warnings about unrelated pages are fine).

- [ ] **Step 4: Commit**

```bash
git add run/index.html
git commit -m "feat: add missing FAQPage schema to /run/"
```

---

### Task 2: Add `SoftwareApplication` schema to all 6 tool pages

**Files:**
- Modify: `pace/index.html` (append after final `</script>`)
- Modify: `hr-zones/index.html` (append after final `</script>`)
- Modify: `predict/index.html` (append after final `</script>`)
- Modify: `run/index.html` (append after the `FAQPage` block added in Task 1)
- Modify: `treadmill/index.html` (append after final `</script>`)
- Modify: `splits/index.html` (append after final `</script>`)

**Interfaces:**
- Consumes: Task 1's `run/index.html` state (this task appends after that task's new block).
- Produces: nothing consumed by later tasks. `name`/`url`/`description` values below are copied verbatim from `_data/tools.yml`, so they stay in sync with the homepage cards and `related-tools.html`.

- [ ] **Step 1: Append to `pace/index.html`**

```html

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Running Pace Calculator",
  "url": "https://ryutility.com/pace/",
  "description": "Calculate your running pace, finish time, or distance — enter any two and get the third, in km and miles.",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Any",
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}
}
</script>
```

- [ ] **Step 2: Append to `hr-zones/index.html`**

```html

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Heart Rate Zone Calculator",
  "url": "https://ryutility.com/hr-zones/",
  "description": "Calculate your five heart rate training zones with the Karvonen method, from your max and resting heart rate or your age.",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Any",
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}
}
</script>
```

- [ ] **Step 3: Append to `predict/index.html`**

```html

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Race Time Predictor",
  "url": "https://ryutility.com/predict/",
  "description": "Predict your finish time for 5K, 10K, half, and full marathon from one recent race result using the Riegel formula.",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Any",
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}
}
</script>
```

- [ ] **Step 4: Append to `run/index.html`** (after the `FAQPage` block from Task 1)

```html

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Training Zone Calculator",
  "url": "https://ryutility.com/run/",
  "description": "Calculate your personalized training zones from a recent race time using Daniels' VDOT method.",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Any",
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}
}
</script>
```

- [ ] **Step 5: Append to `treadmill/index.html`**

```html

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Treadmill Pace Converter",
  "url": "https://ryutility.com/treadmill/",
  "description": "Convert treadmill speed (mph or km/h) to running pace, and see the equivalent outdoor pace for any incline setting.",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Any",
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}
}
</script>
```

- [ ] **Step 6: Append to `splits/index.html`**

```html

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Splits Calculator",
  "url": "https://ryutility.com/splits/",
  "description": "Build a printable split table for any race — even or negative splits per km or mile for 5K to marathon.",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Any",
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}
}
</script>
```

- [ ] **Step 7: Validate each new JSON block is well-formed**

For each of the 6 files, extract the last `<script type="application/ld+json">...</script>` block's JSON body into a scratch file and run:
```bash
python3 -m json.tool scratch.json > /dev/null && echo valid
```
Expected: `valid` for all 6.

- [ ] **Step 8: Build the site and confirm no errors**

Run: `bundle exec jekyll build`
Expected: build completes with no errors.

- [ ] **Step 9: Run the existing JS test suite to confirm no regression**

Run: `for f in tests/*.test.js; do node "$f"; done`
Expected: all tests pass (this task touches no `calc.js` logic, so this is a no-op confirmation).

- [ ] **Step 10: Commit**

```bash
git add pace/index.html hr-zones/index.html predict/index.html run/index.html treadmill/index.html splits/index.html
git commit -m "feat: add SoftwareApplication schema to all tool pages"
```

---

### Task 3: Retarget homepage title/description and add `WebSite` + `ItemList` schema

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: `site.data.tools` (from `_data/tools.yml`, unchanged) via the same Liquid `{% for tool in site.data.tools %}` pattern already used in this file's tool-grid loop (lines 34–40).
- Produces: nothing consumed by other tasks. This is the final task.

- [ ] **Step 1: Update the front matter `title` and `description`**

In `index.html`, replace:

```yaml
title: Ryutility — Useful Tools
description: A collection of free, no-nonsense web tools — starting with a running training zone calculator.
```

with:

```yaml
title: Free Running Calculators — Pace, VDOT, Heart Rate Zones & Race Predictor
description: Free running calculators for pace, VDOT training zones, heart rate zones, race prediction, splits, and treadmill conversion — no sign-up, no clutter.
```

- [ ] **Step 2: Append `WebSite` and `ItemList` JSON-LD before the closing `</main>` tag's sibling content ends the file**

Add this at the very end of `index.html` (after the existing closing `</main>` tag, i.e. as the new last lines of the file):

```html

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Ryutility",
  "url": "https://ryutility.com/"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {% for tool in site.data.tools %}
    {"@type": "ListItem", "position": {{ forloop.index }}, "name": {{ tool.name | jsonify }}, "url": "https://ryutility.com{{ tool.url }}"}{% unless forloop.last %},{% endunless %}
    {% endfor %}
  ]
}
</script>
```

Note: `{{ tool.name | jsonify }}` (Liquid's built-in JSON-string filter) is used instead of a plain quoted string so any future tool name containing a quote or special character stays valid JSON — the other hand-written blocks in this plan use plain strings because their text is static and already known-safe.

- [ ] **Step 3: Build the site and inspect the rendered output**

Run: `bundle exec jekyll build`
Expected: build completes with no errors.

Then check the rendered `ItemList` is valid JSON with 6 items:
```bash
sed -n '/"@type": "ItemList"/,/^<\/script>/p' _site/index.html | sed '1d;$d' > /tmp/itemlist.json
python3 -c "import json; d = json.load(open('/tmp/itemlist.json')); assert len(d['itemListElement']) == 6; print('valid, 6 items')"
```
Expected: `valid, 6 items`

- [ ] **Step 4: Visual check — no layout change**

Run: `bundle exec jekyll serve --port 4321` (prefix `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8` if the shell locale is unset, per this repo's CLAUDE.md), open `http://localhost:4321/` in a browser, and confirm the page renders identically to before (the new `<script>` blocks are inert and produce no visible output). Stop the server after confirming.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: retarget homepage title/description, add WebSite and ItemList schema"
```

---

### Task 4: Deploy and validate on live search tooling

**Files:** none (deployment + manual validation only)

**Interfaces:**
- Consumes: the committed state from Tasks 1–3.
- Produces: nothing — this is the final verification task closing out the spec.

- [ ] **Step 1: Push to origin**

```bash
git push origin master
```

- [ ] **Step 2: Confirm GitHub Pages build succeeded**

Check the repo's Actions tab (or `gh run list --limit 1` if the `gh` CLI is available) for a green build on the pushed commit.

- [ ] **Step 3: Validate each of the 7 changed pages with Google's Rich Results Test**

For each URL — `https://ryutility.com/`, `/pace/`, `/hr-zones/`, `/predict/`, `/run/`, `/treadmill/`, `/splits/` — run it through https://search.google.com/test/rich-results and confirm:
- No JSON-LD parse errors.
- `FAQPage` detected on the 5 pages that already had it plus `/run/`.
- `SoftwareApplication` detected on all 6 tool pages.
- `WebSite` and `ItemList` detected on the homepage.

- [ ] **Step 4: Resubmit the sitemap in Search Console (optional refresh signal)**

In Search Console (`sc-domain:ryutility.com` property) → Sitemaps, confirm `sitemap.xml` still shows Status: Success — no resubmission needed unless the URL set changed (it hasn't).

This task has no commit step — it's a deploy-and-verify checkpoint, not a code change.
