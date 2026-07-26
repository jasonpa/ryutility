# SEO: Structured Data Completion + Homepage Targeting

**Date:** 2026-07-26
**Goal:** Convert existing search impressions into clicks by closing structured-data gaps and giving the homepage a real keyword target — a follow-up to [2026-07-02-traffic-growth-tools-design.md](2026-07-02-traffic-growth-tools-design.md), triggered by the first live Search Console data.

## Context / Evidence

GA4 was connected for the first time today (measurement ID `G-9P67N4HK4F`), so there's no GA history yet. Search Console (`sc-domain:ryutility.com`) already had 23 days of data (Jul 2–24, 2026):

- 0 clicks, ~1,020 impressions, average position 68 (page 6–9) — the site is being crawled and shown, but nothing converts to a click.
- Top pages by impressions: `/hr-zones/` (320), `/treadmill/` (276), `/pace/` (204), `/predict/` (111), `/splits/` (66), `/run/` (28). Homepage: 8.
- Indexing: 11/16 known pages indexed; the 5 excluded are all `running-pace-calculator.html`-style intentional `noindex` redirect stubs — not a real problem.
- On inspection, 5 of 6 tool pages (`pace`, `hr-zones`, `predict`, `treadmill`, `splits`) already have a "how it works" section, a 5-question FAQ, and `FAQPage` JSON-LD, per the original traffic-growth spec's SEO requirements. `/run/` has the content but is missing the JSON-LD block — an inconsistency, not a content gap.
- No page has `SoftwareApplication` schema. The homepage has no schema and a generic, non-keyword title (`Ryutility — Useful Tools`), matching its near-zero impressions.

Given a 23-day-old domain with no backlinks, position 68 is expected; this spec targets the levers inside the repo (structured data + on-page targeting), not domain authority (backlinks are tracked separately, see Out of Scope).

## Changes

### 1. `SoftwareApplication` JSON-LD on all 6 tool pages
Add to `/pace/`, `/hr-zones/`, `/predict/`, `/run/`, `/treadmill/`, `/splits/` (each page's existing `<script type="application/ld+json">` pattern, as a second script block alongside the FAQPage one):

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "<tool name, e.g. Running Pace Calculator>",
  "url": "<absolute tool URL>",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
```

No `aggregateRating` — don't fabricate ratings that don't exist.

### 2. `FAQPage` JSON-LD on `/run/`
Copy the JSON-LD pattern from the other 5 pages, sourced from `/run/`'s existing 5 `<details>` FAQ entries (already written, just needs the matching schema block).

### 3. Homepage retargeting (`index.html`)
- `title`: from `Ryutility — Useful Tools` to a keyword-bearing variant, e.g. `Free Running Calculators — Pace, VDOT, Heart Rate Zones & Race Predictor`.
- `description`: rewritten to match, keeping it truthful to the existing `home-intro` copy.
- Add `WebSite` JSON-LD (name, url) and an `ItemList` JSON-LD enumerating the 6 tools (name + url per `site.data.tools`), so the tool hub is machine-readable as a list, not just an HTML grid.

## Non-goals / Out of Scope

- No new visible content or UI changes — this is schema + `<title>`/`<meta description>` only.
- No changes to `assets/js/calc.js` or any calculation logic.
- Backlink/community distribution (r/running, r/AdvancedRunning, etc.) — already named in the prior traffic-growth spec's "Distribution" section; stays a manual, non-code action item, not part of this implementation.
- No new guide content.

## Testing

- `bundle exec jekyll build` succeeds with no Liquid/JSON errors.
- Each modified page's JSON-LD validates against [Google's Rich Results Test](https://search.google.com/test/rich-results) (manual, post-deploy).
- Existing `tests/*.test.js` suite still passes unchanged (no calc.js touched).
- Visual check: JSON-LD script blocks are inert (`display: none` by browser default for `<script>`) — confirm no visible layout change on each page.
