# GSC Quick-Wins SEO & CTR Optimization Design

**Date:** 2026-11-25
**Goal:** Convert existing Google Search Console impressions (5,549 impressions, 8 clicks over 2026-07-25 – 2026-11-23) into Page-1 clicks by targeting proven quick-win queries (`pos 4–25`) and high-impression tool queries (`treadmill`, `splits`, `pace`).

---

## Evidence from Search Console Export (`2026-11-25`)
1. **"Is pace and speed the same" cluster (Page 1 cusp, 0 clicks):**
   - `is pace and speed the same` (19 impr, pos 9.68)
   - `is pace the same as speed` (13 impr, pos 9.69)
   - `is speed and pace the same` (10 impr, pos 9.70)
   - `are pace and speed the same` (4 impr, pos 10.00)
   - Combined 46 impressions sitting at position ~9.7 with 0 clicks because `_guides/pace-vs-speed.md` lacks a direct-answer title/H2/table for that exact question.
2. **Treadmill conversion chart cluster (2,163 impressions on `/treadmill/`, 0 clicks):**
   - `treadmill conversion` (17 impr, pos 43.76), `treadmill conversion chart` (17 impr, pos 44.18), `treadmill speed to pace km chart` (7 impr, pos 43.57), `12.4 mph to minutes per mile` (3 impr, pos 13.00), `6 mph pace` (3 impr, pos 22.33).
   - `treadmill/index.html` title/description do not highlight "Speed Conversion Chart (mph / km/h)".
3. **Top-performing guides already on Page 1–2:**
   - `/guides/heart-rate-zones-karvonen-vs-max-hr/` (3 clicks, 103 impr, pos 7.68)
   - `/guides/vdot-vs-heart-rate-zones/` (47 impr, pos 7.09)
   - `/guides/gps-watch-pace-vs-splits/` (5 impr, pos 4.4)
   - `/guides/even-vs-negative-splits/` (1 click, 84 impr, pos 17.68)
   - Adding a top-of-article calculator callout (`.guide-callout`) in `_layouts/guide.html` (or in the high-ranking guides) will funnel guide readers directly into the interactive tools.
4. **Splits & Half Marathon queries:**
   - `hybrid race split planner` (6 impr, pos 13.33)
   - `half marathon time calculator` (5 impr, pos 35.60)

---

## Changes

### 1. `_guides/pace-vs-speed.md` — Direct-Answer & Conversion Table Optimization
- Update `title` to `"Pace vs. Speed: Is Pace the Same as Speed? (With Conversion Chart)"`.
- Update `description` to directly answer the query: `"No — pace (min/km or min/mi) and speed (km/h or mph) are reciprocals, not the same. See the quick conversion chart and how to convert between them accurately."`.
- Add `## Is pace the same as speed?` right after the opening hook with a clear 1-sentence direct answer (Featured Snippet target) and a clean Markdown conversion table (`min/km`, `min/mi`, `km/h`, `mph` from 4:00/km to 7:00/km, including `6 mph` and `10 mph`).

### 2. `treadmill/index.html` — Conversion Chart SEO & FAQ
- Update `title` to `"Treadmill Pace Converter & Speed Conversion Chart (mph / km/h)"`.
- Update `description` to emphasize both the instant converter and the mph/km/h-to-pace conversion chart with incline adjustment.
- Add a concise FAQ item covering common chart lookups (`What pace is 6 mph or 10 km/h on a treadmill?`) and sync the `FAQPage` JSON-LD.

### 3. `splits/index.html` & `pace/index.html` — Query Alignment
- In `splits/index.html`, mention `race split planner` (even, negative, and custom pacing) naturally in `description` and intro text.
- In `pace/index.html`, mention `5K, 10K, half marathon, and marathon time calculator` naturally in `description`.

### 4. Top-of-Guide Calculator Callout (`_layouts/guide.html`)
- Add a compact `.guide-callout` banner right above `{{ content }}` (or right below `<h1>`) in `_layouts/guide.html` when `page.related_tools` is present, linking directly to the primary related calculator so organic search visitors to Page-1 guides convert into tool users.
