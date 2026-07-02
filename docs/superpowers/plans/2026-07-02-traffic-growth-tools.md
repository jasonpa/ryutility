# Traffic Growth: Five Running Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand ryutility.com from one tool into a five-tool running hub (pace calculator, race predictor, HR zones, splits, treadmill converter) with rich SEO content, per spec `docs/superpowers/specs/2026-07-02-traffic-growth-tools-design.md`.

**Architecture:** Shared pure math extracted to `assets/js/calc.js` (classic browser script + CommonJS export guard for node tests). Each tool is a standalone Jekyll page under its own permalink using the existing `default` layout. Tool metadata lives in `_data/tools.yml`, which drives both the homepage hub and a shared `related-tools.html` include, so each new tool automatically appears everywhere.

**Tech Stack:** Jekyll (GitHub Pages), vanilla JS, plain-node tests (`node tests/<name>.test.js`), no external dependencies.

## Global Constraints

- Static site only (GitHub Pages) — no backend, no build-time JS tooling, no npm packages.
- Tests run with `node tests/<file>.test.js` using the existing hand-rolled `test()` helper pattern (see Task 3 Step 1 for the exact pattern). All test files must exit non-zero on failure.
- Every tool page front matter: `layout: default`, unique `title` targeting the primary keyword, `description`, `permalink`.
- Every tool page includes: FAQ section with matching FAQPage JSON-LD, "Related tools" include, 800+ words of visible content.
- No `console.log` in committed code. No mutation of shared objects — return new objects.
- CSS: never use viewport-based `min-height` inside flex containers (caused a prior desktop layout bug).
- Build verification: `bundle exec jekyll build` must succeed after every page change.
- Commit after every task (conventional commits: `feat:`, `refactor:`, `test:`).

---

### Task 1: Extract shared math into `assets/js/calc.js`

Pure refactor — the 33 existing tests in `tests/calc.test.js` currently test *copies* of functions that live inline in `run/index.html`. Extract the pure functions into a real module both the browser and node consume, eliminating the copy.

**Files:**
- Create: `assets/js/calc.js`
- Modify: `tests/calc.test.js` (replace copied functions with `require`)
- Modify: `run/index.html` (delete inline pure functions, load calc.js)

**Interfaces:**
- Produces (all later tasks depend on these exports): `paceToSec(min, sec)→sec`, `secToPace(totalSec)→"m:ss"`, `kmToMile(secPerKm)→secPerMi`, `lapSplit(secPerKm, distM)→{display, totalSec}`, `toKmh(secPerKm)→kmh`, `toMph(secPerKm)→mph`, `calcKarvonen(hrMax, hrRest, pctLow, pctHigh)→{low, high}`, `calcVDOT(distM, timeSec)→vdot`, `thresholdPaceFromVDOT(vdot)→secPerKm`, `raceTimeToThresholdPace(distKey, totalSec)→secPerKm|null`, `formatDelta(currentZone, targetZone)→string`, `calcZones({refPaceSec, refType, hrMax, hrRest, lapDist})→Zone[]`, plus consts `MULTIPLIERS`, `HR_PCTS`, `ZONE_LABELS`, `DIST_KM`.

- [ ] **Step 1: Create `assets/js/calc.js`**

Copy the pure functions verbatim from `run/index.html` (they live between the `// === CONVERSION ===` comment and the `// === INPUT READER ===` comment, currently lines 360–502). The file is a classic script (function declarations become browser globals) with a CommonJS guard at the bottom:

```js
// Shared running-math library. Loaded as a classic <script> in tool pages
// (top-level declarations are shared globals) and via require() in tests.

// === CONVERSION ===
function paceToSec(min, sec) {
  return min * 60 + sec
}

function secToPace(totalSec) {
  const s = Math.round(totalSec)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

function kmToMile(secPerKm) {
  return secPerKm * 1.60934
}

function lapSplit(secPerKm, distM) {
  const sec = secPerKm * (distM / 1000)
  return { display: secToPace(sec), totalSec: Math.round(sec) }
}

function toKmh(secPerKm) {
  return 3600 / secPerKm
}

function toMph(secPerKm) {
  return toKmh(secPerKm) / 1.60934
}

// === ZONE TABLES ===
const MULTIPLIERS = {
  threshold: {
    jog:       [1.25, 1.35],
    zone2:     [1.15, 1.25],
    tempo:     [1.05, 1.10],
    threshold: [1.00, 1.00],
    vo2max:    [0.90, 0.95],
  },
  tempo: {
    jog:       [1.20, 1.30],
    zone2:     [1.10, 1.20],
    tempo:     [1.00, 1.00],
    threshold: [0.95, 0.97],
    vo2max:    [0.88, 0.92],
  },
  '10k': {
    jog:       [1.30, 1.40],
    zone2:     [1.20, 1.30],
    tempo:     [1.08, 1.12],
    threshold: [1.03, 1.06],
    vo2max:    [1.00, 1.00],
  },
}

const HR_PCTS = {
  jog:       [0.50, 0.60],
  zone2:     [0.60, 0.70],
  tempo:     [0.75, 0.85],
  threshold: [0.83, 0.90],
  vo2max:    [0.90, 1.00],
}

const ZONE_LABELS = {
  jog: 'Jog / Easy', zone2: 'Zone 2', tempo: 'Tempo',
  threshold: 'Threshold', vo2max: 'VO2max',
}

// === CALCULATION ===
function calcKarvonen(hrMax, hrRest, pctLow, pctHigh) {
  const hrr = hrMax - hrRest
  return {
    low:  Math.round(hrRest + hrr * pctLow),
    high: Math.round(hrRest + hrr * pctHigh),
  }
}

// === VDOT MATH (Daniels' Running Formula) ===
const DIST_KM = { '5k': 5.0, '10k': 10.0, half: 21.0975, full: 42.195 }

function calcVDOT(distM, timeSec) {
  const t = timeSec / 60
  const v = distM / t
  const vo2 = -4.60 + 0.182258 * v + 0.000104 * v * v
  const pct = 0.8 + 0.1894393 * Math.exp(-0.012778 * t) + 0.2989558 * Math.exp(-0.1932605 * t)
  return vo2 / pct
}

function thresholdPaceFromVDOT(vdot) {
  const a = 0.000104
  const b = 0.182258
  const c = -(4.60 + 0.88 * vdot)
  const v = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
  return (1000 / v) * 60  // sec/km
}

function raceTimeToThresholdPace(distKey, totalSec) {
  const distKm = DIST_KM[distKey]
  if (!distKm) return null
  const vdot = calcVDOT(distKm * 1000, totalSec)
  if (vdot < 30 || vdot > 85) return null
  return thresholdPaceFromVDOT(vdot)
}

function formatDelta(currentZone, targetZone) {
  const delta = Math.round(currentZone.paceKmSec.hi - targetZone.paceKmSec.hi)
  if (Math.abs(delta) < 1) return ''
  const abs = Math.abs(delta)
  const arrow = delta > 0 ? '▲' : '▼'
  const word  = delta > 0 ? 'faster' : 'slower'
  return abs < 60 ? `${arrow} ${abs}s ${word}` : `${arrow} ${secToPace(abs)} ${word}`
}

function calcZones({ refPaceSec, refType, hrMax, hrRest, lapDist }) {
  const mults = MULTIPLIERS[refType]
  return ['jog', 'zone2', 'tempo', 'threshold', 'vo2max'].map(key => {
    const [loMult, hiMult] = mults[key]
    // loMult is smaller → faster pace (fewer sec/km)
    const paceFastSec = refPaceSec * loMult
    const paceSlowSec = refPaceSec * hiMult
    const hr = calcKarvonen(hrMax, hrRest, HR_PCTS[key][0], HR_PCTS[key][1])
    return {
      key,
      label: ZONE_LABELS[key],
      paceKm: { lo: secToPace(paceFastSec), hi: secToPace(paceSlowSec) },
      paceKmSec: { lo: paceFastSec, hi: paceSlowSec },
      paceMi: { lo: secToPace(kmToMile(paceFastSec)), hi: secToPace(kmToMile(paceSlowSec)) },
      hr,
      hrPct: [Math.round(HR_PCTS[key][0] * 100), Math.round(HR_PCTS[key][1] * 100)],
      lap: {
        fast: lapSplit(paceFastSec, lapDist),
        slow: lapSplit(paceSlowSec, lapDist),
      },
      speedKmh: {
        lo: toKmh(paceSlowSec).toFixed(1),  // slower pace = lower speed
        hi: toKmh(paceFastSec).toFixed(1),
      },
      speedMph: {
        lo: toMph(paceSlowSec).toFixed(1),
        hi: toMph(paceFastSec).toFixed(1),
      },
    }
  })
}

// === NODE EXPORT (no-op in browser) ===
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    paceToSec, secToPace, kmToMile, lapSplit, toKmh, toMph,
    MULTIPLIERS, HR_PCTS, ZONE_LABELS, DIST_KM,
    calcKarvonen, calcVDOT, thresholdPaceFromVDOT, raceTimeToThresholdPace,
    formatDelta, calcZones,
  }
}
```

- [ ] **Step 2: Point `tests/calc.test.js` at the module**

In `tests/calc.test.js`, delete everything from the line `// === FUNCTIONS UNDER TEST (copy from HTML after implementation) ===` down to (but NOT including) the test-helper code (the first line matching `let passed` or `function test(`). Replace the deleted block with:

```js
const {
  paceToSec, secToPace, kmToMile, lapSplit, toKmh, toMph,
  calcKarvonen, calcVDOT, thresholdPaceFromVDOT, raceTimeToThresholdPace,
  formatDelta, calcZones,
} = require('../assets/js/calc.js')
```

(Keep the existing `const assert = require('assert')` line above it.)

- [ ] **Step 3: Run tests — must still pass**

Run: `node tests/calc.test.js`
Expected: `33 passed, 0 failed`

- [ ] **Step 4: Update `run/index.html` to load the module**

Delete the inline pure functions: everything from the line `// === CONVERSION ===` down to (but NOT including) the line `// === INPUT READER ===`. Then change the script opening from:

```html
<script>
```

to:

```html
<script src="{{ '/assets/js/calc.js' | relative_url }}"></script>
<script>
```

The remaining inline script (`readRaceInput`, `readInputs`, render/DOM code) uses the calc.js functions as shared globals — classic scripts share top-level scope.

- [ ] **Step 5: Build and smoke-check**

Run: `bundle exec jekyll build`
Expected: build succeeds.
Run: `grep -c "function calcVDOT" _site/run/index.html`
Expected: `0` (definitions removed from page).
Run: `grep -c "assets/js/calc.js" _site/run/index.html`
Expected: `1`.

- [ ] **Step 6: Commit**

```bash
git add assets/js/calc.js tests/calc.test.js run/index.html
git commit -m "refactor: extract shared running math into assets/js/calc.js"
```

---

### Task 2: Tool hub infrastructure (`_data/tools.yml`, homepage loop, related-tools include, shared CSS)

**Files:**
- Create: `_data/tools.yml`
- Create: `_includes/related-tools.html`
- Modify: `index.html` (loop over data file)
- Modify: `assets/css/site.css` (append shared tool-page styles)
- Modify: `run/index.html` (add related-tools include)

**Interfaces:**
- Produces: `_data/tools.yml` entry shape `{ name, url, badge, short, description }` — every later task appends one entry. CSS classes for tool pages: `.tool-wrap`, `.tool-heading`, `.tool-form`, `.field`, `.time-inputs`, `.radio-group`, `.result-cards`, `.result-card`, `.result-table`, `.tool-content`, `.faq`, `.related-tools`.
- Consumes: nothing from Task 1.

- [ ] **Step 1: Create `_data/tools.yml`**

```yaml
- name: Training Zone Calculator
  url: /run/
  badge: Running
  short: VDOT training zones from a recent race
  description: Calculate your personalized training zones from a recent race time using Daniels' VDOT method.
```

- [ ] **Step 2: Rewrite the homepage card list to loop over the data file**

In `index.html`, replace the entire `<div class="tool-grid">...</div>` block with:

```html
<div class="tool-grid">
  {% for tool in site.data.tools %}
  <a href="{{ tool.url | relative_url }}" class="tool-card">
    <span class="tool-badge">{{ tool.badge }}</span>
    <h2>{{ tool.name }}</h2>
    <p>{{ tool.description }}</p>
  </a>
  {% endfor %}
</div>
```

- [ ] **Step 3: Create `_includes/related-tools.html`**

```html
<section class="related-tools" aria-label="Related tools">
  <h2>Related tools</h2>
  <div class="related-grid">
    {% for tool in site.data.tools %}
    {% unless tool.url == page.permalink %}
    <a href="{{ tool.url | relative_url }}" class="related-card">
      <strong>{{ tool.name }}</strong>
      <span>{{ tool.short }}</span>
    </a>
    {% endunless %}
    {% endfor %}
  </div>
</section>
```

- [ ] **Step 4: Append shared tool-page styles to `assets/css/site.css`**

Append at the end of the file:

```css
/* === SHARED TOOL PAGE STYLES === */
.tool-wrap { max-width: 720px; margin: 0 auto; padding: 16px; }
.tool-heading h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }
.tool-heading p { font-size: 12px; color: var(--text-secondary); margin: 2px 0 16px; }

.tool-form {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 10px; padding: 16px; margin-bottom: 16px;
}
.tool-form .field { margin-bottom: 14px; }
.tool-form .field:last-child { margin-bottom: 0; }
.tool-form label, .tool-form legend {
  display: block; font-size: 11px; font-weight: 600;
  color: var(--text-secondary); text-transform: uppercase;
  letter-spacing: 0.5px; margin-bottom: 4px;
}
.tool-form fieldset { border: none; }
.tool-form input[type="number"] {
  width: 80px; padding: 6px 8px; border: 1px solid var(--border);
  border-radius: 6px; background: var(--bg); color: var(--text-primary);
  font-size: 16px;
}
.tool-form input[type="number"]::-webkit-inner-spin-button,
.tool-form input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.tool-form input[type="number"] { -moz-appearance: textfield; }
.tool-form select {
  padding: 6px 8px; border: 1px solid var(--border);
  border-radius: 6px; background: var(--bg); color: var(--text-primary);
  font-size: 16px;
}
.time-inputs { display: flex; align-items: center; gap: 6px; }
.time-inputs input { width: 52px; text-align: center; }
.time-inputs span { color: var(--text-secondary); }
.radio-group { display: flex; gap: 6px; flex-wrap: wrap; }
.radio-group label {
  display: flex; align-items: center; gap: 4px;
  font-size: 13px; font-weight: 400; color: var(--text-primary);
  text-transform: none; letter-spacing: normal;
  padding: 4px 10px; border: 1px solid var(--border); border-radius: 20px;
  cursor: pointer; margin-bottom: 0;
}
.radio-group input[type="radio"] { display: none; }
.radio-group input[type="radio"]:checked + span { font-weight: 600; color: var(--accent); }
.radio-group label:has(input:checked) {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
}
.quick-buttons { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.quick-buttons button {
  font-size: 12px; padding: 3px 10px; border: 1px solid var(--border);
  border-radius: 20px; background: var(--bg); color: var(--text-primary); cursor: pointer;
}
.quick-buttons button:hover { border-color: var(--accent); }

.result-cards {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;
}
@media (min-width: 600px) { .result-cards { grid-template-columns: repeat(3, 1fr); } }
.result-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px; padding: 10px 12px;
}
.result-card .label {
  font-size: 11px; font-weight: 600; color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 0.5px; display: block;
}
.result-card .value { font-size: 20px; font-weight: 700; display: block; margin-top: 2px; }
.result-card .sub { font-size: 12px; color: var(--text-secondary); }

.result-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
.result-table th, .result-table td {
  text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--border);
}
.result-table th {
  font-size: 11px; font-weight: 600; color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 0.5px;
}

.tool-content { margin-top: 24px; }
.tool-content h2 { font-size: 16px; font-weight: 700; margin: 20px 0 8px; }
.tool-content p, .tool-content li { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
.tool-content ul, .tool-content ol { padding-left: 18px; margin-bottom: 8px; }
.tool-content li { margin-bottom: 4px; }
.faq details {
  border: 1px solid var(--border); border-radius: 8px;
  padding: 10px 14px; margin-bottom: 8px; background: var(--surface);
}
.faq summary { font-size: 13px; font-weight: 600; color: var(--text-primary); cursor: pointer; }
.faq details p { margin-top: 8px; }

.related-tools { margin: 32px 0 40px; }
.related-tools h2 { font-size: 14px; font-weight: 700; margin-bottom: 10px; }
.related-grid { display: grid; gap: 8px; }
@media (min-width: 600px) { .related-grid { grid-template-columns: 1fr 1fr; } }
.related-card {
  display: flex; flex-direction: column; gap: 2px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 8px; padding: 10px 14px; text-decoration: none; color: inherit;
  transition: border-color 0.15s;
}
.related-card:hover { border-color: var(--accent); }
.related-card strong { font-size: 13px; }
.related-card span { font-size: 12px; color: var(--text-secondary); }
```

- [ ] **Step 5: Add the include to the RunPace page**

In `run/index.html`, insert immediately after the closing `</section>` of the `tool-content` section (before the `<script src=` line):

```html
<div class="tool-wrap">
  {% include related-tools.html %}
</div>
```

- [ ] **Step 6: Build and verify**

Run: `bundle exec jekyll build`
Expected: success.
Run: `grep -c "tool-card" _site/index.html`
Expected: ≥ 1 (loop renders the RunPace card).
Run: `grep -c "related-tools" _site/run/index.html`
Expected: ≥ 1. With only one tool in tools.yml and `page.permalink == /run/`, the related grid on /run/ is empty — that's expected until Task 3 ships.

- [ ] **Step 7: Run all existing tests**

Run: `node tests/calc.test.js && node tests/consent.test.js`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add _data/tools.yml _includes/related-tools.html index.html assets/css/site.css run/index.html
git commit -m "feat: data-driven tool hub, related-tools include, shared tool page styles"
```

---

### Task 3: Simple Pace Calculator (`/pace/`)

Primary keyword: **running pace calculator**. Solve any one of pace / time / distance from the other two.

**Files:**
- Modify: `assets/js/calc.js` (add functions + exports)
- Create: `tests/pace.test.js`
- Create: `pace/index.html`
- Modify: `_data/tools.yml` (append entry)

**Interfaces:**
- Consumes: `secToPace`, `kmToMile`, `toKmh`, `toMph` from calc.js.
- Produces: `paceFromTimeDistance(timeSec, distKm)→secPerKm`, `timeFromPaceDistance(paceSecPerKm, distKm)→sec`, `distanceFromTimePace(timeSec, paceSecPerKm)→km`, `secToHms(totalSec)→"h:mm:ss"|"m:ss"`. Task 4 reuses `secToHms`.

- [ ] **Step 1: Write the failing test file `tests/pace.test.js`**

```js
const assert = require('assert')
const {
  paceFromTimeDistance, timeFromPaceDistance, distanceFromTimePace, secToHms,
} = require('../assets/js/calc.js')

let passed = 0, failed = 0
function test(name, fn) {
  try { fn(); passed++; process.stdout.write(`✓ ${name}\n`) }
  catch (e) { failed++; process.stdout.write(`✗ ${name}\n  ${e.message}\n`) }
}

test('paceFromTimeDistance: 50:00 over 10 km = 5:00/km', () => {
  assert.strictEqual(paceFromTimeDistance(3000, 10), 300)
})
test('timeFromPaceDistance: 5:00/km over 10 km = 50:00', () => {
  assert.strictEqual(timeFromPaceDistance(300, 10), 3000)
})
test('distanceFromTimePace: 50:00 at 5:00/km = 10 km', () => {
  assert.strictEqual(distanceFromTimePace(3000, 300), 10)
})
test('secToHms formats hours', () => {
  assert.strictEqual(secToHms(3725), '1:02:05')
})
test('secToHms omits hours when zero', () => {
  assert.strictEqual(secToHms(300), '5:00')
})
test('secToHms rounds fractional seconds', () => {
  assert.strictEqual(secToHms(299.6), '5:00')
})

process.stdout.write(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/pace.test.js`
Expected: FAIL — `paceFromTimeDistance is not a function`.

- [ ] **Step 3: Implement in `assets/js/calc.js`**

Insert before the `// === NODE EXPORT` block:

```js
// === PACE / TIME / DISTANCE SOLVER ===
function paceFromTimeDistance(timeSec, distKm) {
  return timeSec / distKm
}

function timeFromPaceDistance(paceSecPerKm, distKm) {
  return paceSecPerKm * distKm
}

function distanceFromTimePace(timeSec, paceSecPerKm) {
  return timeSec / paceSecPerKm
}

function secToHms(totalSec) {
  const s = Math.round(totalSec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`
}
```

Add to the `module.exports` object: `paceFromTimeDistance, timeFromPaceDistance, distanceFromTimePace, secToHms,`

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/pace.test.js && node tests/calc.test.js`
Expected: `6 passed, 0 failed` and `33 passed, 0 failed`.

- [ ] **Step 5: Append the tool entry to `_data/tools.yml`**

```yaml
- name: Running Pace Calculator
  url: /pace/
  badge: Running
  short: Solve pace, time, or distance
  description: Calculate your running pace, finish time, or distance — enter any two and get the third, in km and miles.
```

- [ ] **Step 6: Create `pace/index.html`**

```html
---
layout: default
title: Running Pace Calculator — Pace, Time & Distance
description: Free running pace calculator. Enter any two of pace, time, and distance to get the third — with km, mile, and treadmill speed conversions.
permalink: /pace/
---
<div class="tool-wrap">
  <div class="tool-heading">
    <h1>Running Pace Calculator</h1>
    <p>Enter any two of time, distance, and pace — the third is calculated instantly.</p>
  </div>

  <form id="calc-form" class="tool-form" autocomplete="off" novalidate>
    <div class="field">
      <fieldset>
        <legend>Solve for</legend>
        <div class="radio-group">
          <label><input type="radio" name="solve" value="pace" checked><span>Pace</span></label>
          <label><input type="radio" name="solve" value="time"><span>Time</span></label>
          <label><input type="radio" name="solve" value="distance"><span>Distance</span></label>
        </div>
      </fieldset>
    </div>

    <div class="field" id="field-time">
      <label>Time</label>
      <div class="time-inputs">
        <input type="number" id="time-hh" min="0" max="99" placeholder="0" aria-label="Hours">
        <span>:</span>
        <input type="number" id="time-mm" min="0" max="59" placeholder="50" aria-label="Minutes">
        <span>:</span>
        <input type="number" id="time-ss" min="0" max="59" placeholder="00" aria-label="Seconds">
        <span>h:mm:ss</span>
      </div>
    </div>

    <div class="field" id="field-dist">
      <label for="dist">Distance</label>
      <div class="time-inputs">
        <input type="number" id="dist" min="0" step="0.01" placeholder="10" style="width:80px" aria-label="Distance">
        <select id="dist-unit" aria-label="Distance unit">
          <option value="km" selected>km</option>
          <option value="mi">miles</option>
        </select>
      </div>
      <div class="quick-buttons">
        <button type="button" data-km="5">5K</button>
        <button type="button" data-km="10">10K</button>
        <button type="button" data-km="21.0975">Half</button>
        <button type="button" data-km="42.195">Marathon</button>
      </div>
    </div>

    <div class="field" id="field-pace">
      <label>Pace</label>
      <div class="time-inputs">
        <input type="number" id="pace-mm" min="0" max="59" placeholder="5" aria-label="Pace minutes">
        <span>:</span>
        <input type="number" id="pace-ss" min="0" max="59" placeholder="00" aria-label="Pace seconds">
        <select id="pace-unit" aria-label="Pace unit">
          <option value="km" selected>per km</option>
          <option value="mi">per mile</option>
        </select>
      </div>
    </div>
  </form>

  <section id="results" class="result-cards" aria-live="polite" hidden>
    <div class="result-card"><span class="label">Pace / km</span><span class="value" id="out-pace-km">–</span></div>
    <div class="result-card"><span class="label">Pace / mile</span><span class="value" id="out-pace-mi">–</span></div>
    <div class="result-card"><span class="label">Time</span><span class="value" id="out-time">–</span></div>
    <div class="result-card"><span class="label">Distance</span><span class="value" id="out-dist">–</span><span class="sub" id="out-dist-mi"></span></div>
    <div class="result-card"><span class="label">Speed</span><span class="value" id="out-kmh">–</span><span class="sub" id="out-mph"></span></div>
  </section>

  <section class="tool-content">
    <h2>How the pace calculator works</h2>
    <p>Running pace is simply time divided by distance. This calculator solves the pace–time–distance triangle: pick which value you want to solve for, fill in the other two, and the answer appears instantly. Results are always shown in both minutes per kilometer and minutes per mile, along with the equivalent treadmill speed in km/h and mph, so you never need a separate conversion step.</p>
    <p>For example, if you ran 10 km in 50 minutes, your pace is 50:00 ÷ 10 = 5:00 per kilometer, which is 8:03 per mile, or 12.0 km/h (7.5 mph) on a treadmill display. Going the other way, if you want to finish a half marathon (21.0975 km) at 5:30 per kilometer, your finish time will be 5:30 × 21.0975 ≈ 1:56:02.</p>
    <p>Use the quick-select buttons for the four standard race distances — 5K, 10K, half marathon, and marathon — or type any custom distance in kilometers or miles.</p>

    <h2>Common race pace reference points</h2>
    <ul>
      <li><strong>5:00/km (8:03/mi)</strong> — a 25:00 5K, 50:00 10K, or ~3:31 marathon.</li>
      <li><strong>5:41/km (9:09/mi)</strong> — the pace for a 4:00 marathon.</li>
      <li><strong>6:00/km (9:39/mi)</strong> — a 30:00 5K or ~1:00 10K; a common easy-run pace for recreational runners.</li>
      <li><strong>7:07/km (11:27/mi)</strong> — the pace for a 5:00 marathon.</li>
    </ul>

    <h2>Frequently asked questions</h2>
    <div class="faq">
      <details>
        <summary>What is a good running pace?</summary>
        <p>It depends entirely on experience, age, and distance. For recreational runners, 5:30–7:00 per kilometer (roughly 9–11 minutes per mile) is a common training range. Race pace is faster than easy pace: most runners race a 5K 30–60 seconds per kilometer faster than their everyday run.</p>
      </details>
      <details>
        <summary>How do I convert pace per km to pace per mile?</summary>
        <p>Multiply the pace in seconds per kilometer by 1.60934. For example, 5:00/km (300 seconds) × 1.60934 ≈ 483 seconds ≈ 8:03 per mile. This calculator does the conversion automatically and shows both.</p>
      </details>
      <details>
        <summary>What pace do I need for a 4-hour marathon?</summary>
        <p>A 4:00:00 marathon over 42.195 km works out to 5:41 per kilometer, or 9:09 per mile. In practice, plan a few seconds per kilometer faster to leave a buffer for aid stations and late-race slowdown.</p>
      </details>
      <details>
        <summary>Does this work for walking or cycling?</summary>
        <p>Yes — the math is identical for any steady-speed activity. Enter your time and distance and the calculator returns pace and speed regardless of sport.</p>
      </details>
      <details>
        <summary>How is pace different from speed?</summary>
        <p>Pace is time per unit of distance (minutes per km or mile); speed is distance per unit of time (km/h or mph). They're reciprocals: 5:00/km equals 12 km/h. Runners usually think in pace, treadmills usually display speed — this tool shows both.</p>
      </details>
    </div>
  </section>

  {% include related-tools.html %}
</div>

<script src="{{ '/assets/js/calc.js' | relative_url }}"></script>
<script>
const $ = id => document.getElementById(id)

function readTime() {
  const h = parseInt($('time-hh').value, 10) || 0
  const m = parseInt($('time-mm').value, 10) || 0
  const s = parseInt($('time-ss').value, 10) || 0
  const total = h * 3600 + m * 60 + s
  return total > 0 ? total : null
}

function readDistKm() {
  const v = parseFloat($('dist').value)
  if (isNaN(v) || v <= 0) return null
  return $('dist-unit').value === 'mi' ? v * 1.60934 : v
}

function readPaceSecPerKm() {
  const m = parseInt($('pace-mm').value, 10) || 0
  const s = parseInt($('pace-ss').value, 10) || 0
  const perUnit = m * 60 + s
  if (perUnit <= 0) return null
  return $('pace-unit').value === 'mi' ? perUnit / 1.60934 : perUnit
}

function render() {
  const solve = document.querySelector('input[name="solve"]:checked').value
  let t = readTime(), d = readDistKm(), p = readPaceSecPerKm()

  if (solve === 'pace' && t && d) p = paceFromTimeDistance(t, d)
  else if (solve === 'time' && p && d) t = timeFromPaceDistance(p, d)
  else if (solve === 'distance' && t && p) d = distanceFromTimePace(t, p)
  else { $('results').hidden = true; return }

  $('out-pace-km').textContent = `${secToPace(p)} /km`
  $('out-pace-mi').textContent = `${secToPace(kmToMile(p))} /mi`
  $('out-time').textContent = secToHms(t)
  $('out-dist').textContent = `${d.toFixed(2)} km`
  $('out-dist-mi').textContent = `${(d / 1.60934).toFixed(2)} mi`
  $('out-kmh').textContent = `${toKmh(p).toFixed(1)} km/h`
  $('out-mph').textContent = `${toMph(p).toFixed(1)} mph`
  $('results').hidden = false
}

function markSolvedField() {
  const solve = document.querySelector('input[name="solve"]:checked').value
  const map = { pace: 'field-pace', time: 'field-time', distance: 'field-dist' }
  ;['field-pace', 'field-time', 'field-dist'].forEach(id => {
    $(id).style.opacity = id === map[solve] ? '0.45' : '1'
  })
}

document.querySelectorAll('.quick-buttons button').forEach(btn => {
  btn.addEventListener('click', () => {
    $('dist-unit').value = 'km'
    $('dist').value = btn.dataset.km
    render()
  })
})

$('calc-form').addEventListener('input', () => { markSolvedField(); render() })
markSolvedField()
render()
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "What is a good running pace?", "acceptedAnswer": {"@type": "Answer", "text": "It depends on experience, age, and distance. For recreational runners, 5:30–7:00 per kilometer (roughly 9–11 minutes per mile) is a common training range. Race pace is typically 30–60 seconds per kilometer faster than easy pace."}},
    {"@type": "Question", "name": "How do I convert pace per km to pace per mile?", "acceptedAnswer": {"@type": "Answer", "text": "Multiply the pace in seconds per kilometer by 1.60934. For example, 5:00/km is about 8:03 per mile."}},
    {"@type": "Question", "name": "What pace do I need for a 4-hour marathon?", "acceptedAnswer": {"@type": "Answer", "text": "A 4:00:00 marathon over 42.195 km requires 5:41 per kilometer, or 9:09 per mile."}},
    {"@type": "Question", "name": "Does this work for walking or cycling?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — the math is identical for any steady-speed activity. Enter time and distance to get pace and speed for any sport."}},
    {"@type": "Question", "name": "How is pace different from speed?", "acceptedAnswer": {"@type": "Answer", "text": "Pace is time per distance (min/km or min/mile); speed is distance per time (km/h or mph). They are reciprocals: 5:00/km equals 12 km/h."}}
  ]
}
</script>
```

- [ ] **Step 7: Build and verify**

Run: `bundle exec jekyll build`
Expected: success.
Run: `grep -c "FAQPage" _site/pace/index.html && grep -c "related-card" _site/pace/index.html`
Expected: `1` and ≥ 1 (RunPace appears as related tool). Also check `grep -c "/pace/" _site/index.html` ≥ 1 (hub card) and `grep -c "/pace/" _site/sitemap.xml` = 1.

- [ ] **Step 8: Commit**

```bash
git add assets/js/calc.js tests/pace.test.js pace/index.html _data/tools.yml
git commit -m "feat: add running pace calculator at /pace/"
```

---

### Task 4: Race Time Predictor (`/predict/`)

Primary keyword: **race time predictor**. Riegel formula: `t2 = t1 × (d2/d1)^1.06`.

**Files:**
- Modify: `assets/js/calc.js`
- Create: `tests/predict.test.js`
- Create: `predict/index.html`
- Modify: `_data/tools.yml` (append entry)

**Interfaces:**
- Consumes: `secToPace`, `secToHms`, `kmToMile`, `DIST_KM` from calc.js.
- Produces: `riegelPredict(t1Sec, d1Km, d2Km)→sec` (exported).

- [ ] **Step 1: Write the failing test file `tests/predict.test.js`**

```js
const assert = require('assert')
const { riegelPredict } = require('../assets/js/calc.js')

let passed = 0, failed = 0
function test(name, fn) {
  try { fn(); passed++; process.stdout.write(`✓ ${name}\n`) }
  catch (e) { failed++; process.stdout.write(`✗ ${name}\n  ${e.message}\n`) }
}

test('riegelPredict: 25:00 5K → ~52:07 10K', () => {
  assert.strictEqual(Math.round(riegelPredict(1500, 5, 10)), 3127)
})
test('riegelPredict: same distance returns same time', () => {
  assert.strictEqual(riegelPredict(1500, 5, 5), 1500)
})
test('riegelPredict: shorter target is faster', () => {
  assert.ok(riegelPredict(3000, 10, 5) < 1500 * 1.05, 'predicted 5K from 50:00 10K should be under ~26:15')
  assert.ok(riegelPredict(3000, 10, 5) > 1400, 'and over 23:20')
})
test('riegelPredict: 20:00 5K → marathon between 3:10 and 3:25', () => {
  const t = riegelPredict(1200, 5, 42.195)
  assert.ok(t > 3.16 * 3600 && t < 3.42 * 3600, `got ${t}`)
})

process.stdout.write(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/predict.test.js`
Expected: FAIL — `riegelPredict is not a function`.

- [ ] **Step 3: Implement in `assets/js/calc.js`**

Insert before the `// === NODE EXPORT` block:

```js
// === RACE PREDICTION (Riegel, 1981) ===
const RIEGEL_EXPONENT = 1.06

function riegelPredict(t1Sec, d1Km, d2Km) {
  return t1Sec * Math.pow(d2Km / d1Km, RIEGEL_EXPONENT)
}
```

Add `riegelPredict,` to `module.exports`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/predict.test.js && node tests/calc.test.js && node tests/pace.test.js`
Expected: all pass.

- [ ] **Step 5: Append the tool entry to `_data/tools.yml`**

```yaml
- name: Race Time Predictor
  url: /predict/
  badge: Running
  short: Predict 5K to marathon finish times
  description: Predict your finish time for 5K, 10K, half, and full marathon from one recent race result using the Riegel formula.
```

- [ ] **Step 6: Create `predict/index.html`**

```html
---
layout: default
title: Race Time Predictor — 5K, 10K, Half & Marathon
description: Predict your race finish times from one recent result. Free race time predictor using the proven Riegel formula, with pace per km and mile.
permalink: /predict/
---
<div class="tool-wrap">
  <div class="tool-heading">
    <h1>Race Time Predictor</h1>
    <p>Enter one recent race result to predict your times at other distances.</p>
  </div>

  <form id="calc-form" class="tool-form" autocomplete="off" novalidate>
    <div class="field">
      <fieldset>
        <legend>Recent race distance</legend>
        <div class="radio-group">
          <label><input type="radio" name="race-dist" value="5k" checked><span>5K</span></label>
          <label><input type="radio" name="race-dist" value="10k"><span>10K</span></label>
          <label><input type="radio" name="race-dist" value="half"><span>Half</span></label>
          <label><input type="radio" name="race-dist" value="full"><span>Marathon</span></label>
        </div>
      </fieldset>
    </div>
    <div class="field">
      <label>Finish time</label>
      <div class="time-inputs">
        <input type="number" id="time-hh" min="0" max="9" placeholder="0" aria-label="Hours">
        <span>:</span>
        <input type="number" id="time-mm" min="0" max="59" placeholder="25" aria-label="Minutes">
        <span>:</span>
        <input type="number" id="time-ss" min="0" max="59" placeholder="00" aria-label="Seconds">
        <span>h:mm:ss</span>
      </div>
    </div>
  </form>

  <section aria-live="polite">
    <table class="result-table" id="predict-table" hidden>
      <thead>
        <tr><th>Distance</th><th>Predicted time</th><th>Pace /km</th><th>Pace /mi</th></tr>
      </thead>
      <tbody id="predict-body"></tbody>
    </table>
    <p class="tool-content" id="empty-msg" style="color:var(--text-secondary);font-size:13px">Enter a recent finish time above to see predictions.</p>
  </section>

  <section class="tool-content">
    <h2>How race time prediction works</h2>
    <p>This predictor uses the Riegel formula, published by engineer Pete Riegel in 1981 and still the most widely used race prediction model: <em>T2 = T1 × (D2 ÷ D1)<sup>1.06</sup></em>. The exponent 1.06 captures how much runners slow down as the distance grows — roughly 6% more time per doubling of distance beyond simple proportionality. It has held up remarkably well across four decades of race data for distances from 1500 m to the marathon.</p>
    <p>For example, a 25:00 5K predicts a 52:07 10K — not 50:00, because nobody holds their 5K pace for twice the distance. The same 25:00 5K predicts roughly a 1:55 half marathon and a 4:00 marathon.</p>

    <h2>How to get an accurate prediction</h2>
    <ul>
      <li><strong>Use a recent, all-out result.</strong> A race or honest time trial from the last 6–8 weeks reflects your current fitness. A PR from two years ago does not.</li>
      <li><strong>Predict adjacent distances.</strong> A 5K predicts a 10K very well, a half marathon reasonably well, and a marathon only if you've done the training volume. Marathon predictions assume marathon-appropriate endurance.</li>
      <li><strong>Adjust for conditions.</strong> Heat, hills, and wind all slow real races. Treat the prediction as your ceiling on a fair day, not a guarantee.</li>
    </ul>

    <h2>Frequently asked questions</h2>
    <div class="faq">
      <details>
        <summary>How accurate is the Riegel formula?</summary>
        <p>For well-trained runners predicting adjacent distances (5K→10K, 10K→half), it's usually within 1–2%. Marathon predictions are less reliable because they depend heavily on endurance training — many runners run 10–20 minutes slower than their 5K-predicted marathon time if their weekly mileage is low.</p>
      </details>
      <details>
        <summary>Why is my predicted marathon time so fast?</summary>
        <p>The formula assumes your endurance scales with your speed. If you haven't built marathon-specific mileage (long runs of 28 km+ and consistent 50 km+ weeks), expect to be slower than predicted. Use the prediction as a training target, not a race-day pace plan.</p>
      </details>
      <details>
        <summary>What race result should I use as input?</summary>
        <p>Your most recent all-out effort at a shorter distance — ideally an official race, or a solo time trial where you genuinely emptied the tank. The fresher and more honest the input, the better the prediction.</p>
      </details>
      <details>
        <summary>Can I use this to plan my race pace?</summary>
        <p>Yes — divide the predicted time by the distance to get target pace (shown in the table). Many runners aim for the predicted pace through 80% of the race and speed up at the end if they feel strong.</p>
      </details>
      <details>
        <summary>Is there a better model than Riegel?</summary>
        <p>VDOT (Jack Daniels) and Cameron's model give similar results for most runners. Riegel is the simplest and most transparent. For training zones rather than race predictions, use our VDOT-based Training Zone Calculator.</p>
      </details>
    </div>
  </section>

  {% include related-tools.html %}
</div>

<script src="{{ '/assets/js/calc.js' | relative_url }}"></script>
<script>
const $ = id => document.getElementById(id)
const LABELS = { '5k': '5K', '10k': '10K', half: 'Half marathon', full: 'Marathon' }

function render() {
  const distKey = document.querySelector('input[name="race-dist"]:checked').value
  const h = parseInt($('time-hh').value, 10) || 0
  const m = parseInt($('time-mm').value, 10) || 0
  const s = parseInt($('time-ss').value, 10) || 0
  const t1 = h * 3600 + m * 60 + s
  const table = $('predict-table')
  const empty = $('empty-msg')

  if (t1 <= 0) { table.hidden = true; empty.hidden = false; return }

  const d1 = DIST_KM[distKey]
  $('predict-body').innerHTML = Object.keys(DIST_KM).map(key => {
    const d2 = DIST_KM[key]
    const t2 = riegelPredict(t1, d1, d2)
    const pace = t2 / d2
    const isInput = key === distKey
    return `<tr${isInput ? ' style="font-weight:700"' : ''}>
      <td>${LABELS[key]}${isInput ? ' (your result)' : ''}</td>
      <td>${secToHms(t2)}</td>
      <td>${secToPace(pace)}</td>
      <td>${secToPace(kmToMile(pace))}</td>
    </tr>`
  }).join('')
  table.hidden = false
  empty.hidden = true
}

$('calc-form').addEventListener('input', render)
render()
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "How accurate is the Riegel formula?", "acceptedAnswer": {"@type": "Answer", "text": "For well-trained runners predicting adjacent distances (5K to 10K, 10K to half marathon), it is usually within 1–2%. Marathon predictions are less reliable and depend heavily on endurance training volume."}},
    {"@type": "Question", "name": "Why is my predicted marathon time so fast?", "acceptedAnswer": {"@type": "Answer", "text": "The formula assumes endurance scales with speed. Without marathon-specific mileage, expect to run slower than predicted. Use it as a training target, not a race-day pace plan."}},
    {"@type": "Question", "name": "What race result should I use as input?", "acceptedAnswer": {"@type": "Answer", "text": "Your most recent all-out effort at a shorter distance — an official race or an honest solo time trial from the last 6–8 weeks."}},
    {"@type": "Question", "name": "Can I use this to plan my race pace?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — the table shows the target pace per km and per mile for each predicted time."}},
    {"@type": "Question", "name": "Is there a better model than Riegel?", "acceptedAnswer": {"@type": "Answer", "text": "VDOT and Cameron's model give similar results. Riegel is the simplest and most transparent for race prediction."}}
  ]
}
</script>
```

- [ ] **Step 7: Build and verify**

Run: `bundle exec jekyll build`
Expected: success. `grep -c "FAQPage" _site/predict/index.html` = 1; `grep -c "/predict/" _site/sitemap.xml` = 1.

- [ ] **Step 8: Commit**

```bash
git add assets/js/calc.js tests/predict.test.js predict/index.html _data/tools.yml
git commit -m "feat: add Riegel race time predictor at /predict/"
```

---

### Task 5: Heart Rate Zone Calculator (`/hr-zones/`)

Primary keyword: **heart rate zone calculator**. Karvonen (heart-rate-reserve) method; falls back to %max when resting HR is blank; estimates max HR from age (Tanaka).

**Files:**
- Modify: `assets/js/calc.js`
- Create: `tests/hr-zones.test.js`
- Create: `hr-zones/index.html`
- Modify: `_data/tools.yml` (append entry)

**Interfaces:**
- Consumes: `calcKarvonen`, `HR_PCTS`, `ZONE_LABELS` from calc.js.
- Produces: `estimateMaxHr(age)→bpm` (Tanaka: 208 − 0.7×age, rounded), `hrZones(hrMax, hrRest)→[{key, label, pct:[lo,hi], low, high}]` (pass `hrRest = 0` for %max method).

- [ ] **Step 1: Write the failing test file `tests/hr-zones.test.js`**

```js
const assert = require('assert')
const { estimateMaxHr, hrZones } = require('../assets/js/calc.js')

let passed = 0, failed = 0
function test(name, fn) {
  try { fn(); passed++; process.stdout.write(`✓ ${name}\n`) }
  catch (e) { failed++; process.stdout.write(`✗ ${name}\n  ${e.message}\n`) }
}

test('estimateMaxHr: Tanaka formula, age 40 → 180', () => {
  assert.strictEqual(estimateMaxHr(40), 180)
})
test('estimateMaxHr rounds: age 25 → 191 (190.5 rounds up)', () => {
  assert.strictEqual(estimateMaxHr(25), 191)
})
test('hrZones returns five zones in order', () => {
  const zones = hrZones(185, 50)
  assert.strictEqual(zones.length, 5)
  assert.deepStrictEqual(zones.map(z => z.key), ['jog', 'zone2', 'tempo', 'threshold', 'vo2max'])
})
test('hrZones Karvonen: zone2 for 185/50 is 131–145 bpm', () => {
  const z2 = hrZones(185, 50).find(z => z.key === 'zone2')
  assert.strictEqual(z2.low, 131)
  assert.strictEqual(z2.high, 145)
  assert.deepStrictEqual(z2.pct, [60, 70])
})
test('hrZones with hrRest 0 equals percent-of-max', () => {
  const z2 = hrZones(185, 0).find(z => z.key === 'zone2')
  assert.strictEqual(z2.low, 111)
  assert.strictEqual(z2.high, 130)  // 185*0.7 = 129.5 → 130
})

process.stdout.write(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/hr-zones.test.js`
Expected: FAIL — `estimateMaxHr is not a function`.

- [ ] **Step 3: Implement in `assets/js/calc.js`**

Insert before the `// === NODE EXPORT` block:

```js
// === HEART RATE ZONES ===
function estimateMaxHr(age) {
  return Math.round(208 - 0.7 * age)  // Tanaka et al., 2001
}

function hrZones(hrMax, hrRest) {
  return ['jog', 'zone2', 'tempo', 'threshold', 'vo2max'].map(key => {
    const [lo, hi] = HR_PCTS[key]
    const range = calcKarvonen(hrMax, hrRest, lo, hi)
    return {
      key,
      label: ZONE_LABELS[key],
      pct: [Math.round(lo * 100), Math.round(hi * 100)],
      low: range.low,
      high: range.high,
    }
  })
}
```

Add `estimateMaxHr, hrZones,` to `module.exports`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/hr-zones.test.js && node tests/calc.test.js`
Expected: all pass.

- [ ] **Step 5: Append the tool entry to `_data/tools.yml`**

```yaml
- name: Heart Rate Zone Calculator
  url: /hr-zones/
  badge: Fitness
  short: Karvonen training zones in bpm
  description: Calculate your five heart rate training zones with the Karvonen method, from your max and resting heart rate or your age.
```

- [ ] **Step 6: Create `hr-zones/index.html`**

```html
---
layout: default
title: Heart Rate Zone Calculator — Karvonen Method
description: Free heart rate zone calculator. Get your five training zones in bpm using the Karvonen (heart rate reserve) method, from max/resting HR or age.
permalink: /hr-zones/
---
<div class="tool-wrap">
  <div class="tool-heading">
    <h1>Heart Rate Zone Calculator</h1>
    <p>Five training zones in bpm, using the Karvonen (heart-rate-reserve) method.</p>
  </div>

  <form id="calc-form" class="tool-form" autocomplete="off" novalidate>
    <div class="field">
      <label for="hr-max">Max heart rate (bpm)</label>
      <input type="number" id="hr-max" min="120" max="230" placeholder="185">
      <div class="quick-buttons" style="align-items:center">
        <span style="font-size:12px;color:var(--text-secondary)">or estimate from age:</span>
        <input type="number" id="age" min="10" max="99" placeholder="40" style="width:60px" aria-label="Age">
      </div>
    </div>
    <div class="field">
      <label for="hr-rest">Resting heart rate (bpm, optional)</label>
      <input type="number" id="hr-rest" min="30" max="110" placeholder="60">
    </div>
  </form>

  <section aria-live="polite">
    <table class="result-table" id="zones-table" hidden>
      <thead><tr><th>Zone</th><th>Intensity</th><th>Heart rate</th></tr></thead>
      <tbody id="zones-body"></tbody>
    </table>
    <p id="empty-msg" style="color:var(--text-secondary);font-size:13px">Enter your max heart rate (or age) to see your zones.</p>
  </section>

  <section class="tool-content">
    <h2>How heart rate zones are calculated</h2>
    <p>This calculator uses the Karvonen method, which bases zones on your heart rate <em>reserve</em> — the gap between resting and maximum heart rate — rather than a simple percentage of max. The formula is: <em>target HR = resting HR + (max HR − resting HR) × intensity%</em>. Because it accounts for your resting heart rate, it personalizes zones better than %max alone: two runners with the same max HR but different fitness levels get different (and more accurate) zones.</p>
    <p>If you leave resting HR blank, the calculator falls back to a straight percentage of max HR — less precise but still useful. If you don't know your max HR, enter your age and the calculator estimates it with the Tanaka formula (208 − 0.7 × age), which research shows is more accurate than the traditional "220 minus age".</p>

    <h2>What each zone is for</h2>
    <ul>
      <li><strong>Jog / Easy (50–60%)</strong> — recovery runs and warm-ups. Builds the aerobic base with minimal stress.</li>
      <li><strong>Zone 2 (60–70%)</strong> — the foundation of endurance training. Most weekly volume belongs here; you should be able to hold a conversation.</li>
      <li><strong>Tempo (75–85%)</strong> — "comfortably hard" sustained efforts that improve your lactate clearance.</li>
      <li><strong>Threshold (83–90%)</strong> — roughly one-hour race effort; cruise intervals and threshold runs live here.</li>
      <li><strong>VO2max (90–100%)</strong> — short hard intervals (3–5 minutes) that raise your aerobic ceiling.</li>
    </ul>

    <h2>Frequently asked questions</h2>
    <div class="faq">
      <details>
        <summary>How do I find my real max heart rate?</summary>
        <p>Age formulas are estimates with a standard deviation of about ±10 bpm. For a real number, look at the highest value your HR monitor has recorded at the end of a hard race or all-out hill repeats. A field test: after a thorough warm-up, run 3 × 2 minutes uphill at maximal effort — the peak reading is close to your true max.</p>
      </details>
      <details>
        <summary>How do I measure resting heart rate?</summary>
        <p>Check your heart rate first thing in the morning before getting out of bed, for several days, and take the average. Most watches with sleep tracking report it automatically.</p>
      </details>
      <details>
        <summary>Why is Zone 2 training so popular?</summary>
        <p>Zone 2 builds mitochondrial density and fat-burning capacity with low injury risk, so you can accumulate a lot of it. Most successful endurance programs put roughly 80% of training time at or below Zone 2 intensity.</p>
      </details>
      <details>
        <summary>Karvonen vs. percentage of max — which should I use?</summary>
        <p>Karvonen (enter both max and resting HR) is more personalized because it accounts for fitness via resting heart rate. Use %max only if you don't know your resting HR. The zones from the two methods can differ by 5–15 bpm at the low end.</p>
      </details>
      <details>
        <summary>My watch shows different zones. Which is right?</summary>
        <p>Watch vendors use different zone models (some use 5 zones of %max, some use lactate-threshold anchored zones). None is "wrong" — what matters is using one model consistently. This calculator's zones map to common running training language (easy/tempo/threshold/VO2max).</p>
      </details>
    </div>
  </section>

  {% include related-tools.html %}
</div>

<script src="{{ '/assets/js/calc.js' | relative_url }}"></script>
<script>
const $ = id => document.getElementById(id)
const ZONE_COLORS = { jog: '#22c55e', zone2: '#06b6d4', tempo: '#f59e0b', threshold: '#ef4444', vo2max: '#8b5cf6' }

function render() {
  const explicitMax = parseInt($('hr-max').value, 10)
  const age = parseInt($('age').value, 10)
  const hrMax = !isNaN(explicitMax) ? explicitMax : (!isNaN(age) ? estimateMaxHr(age) : null)
  const rest = parseInt($('hr-rest').value, 10)
  const hrRest = isNaN(rest) ? 0 : rest
  const table = $('zones-table')
  const empty = $('empty-msg')

  if (!hrMax || hrMax <= hrRest) { table.hidden = true; empty.hidden = false; return }

  $('zones-body').innerHTML = hrZones(hrMax, hrRest).map(z => `
    <tr>
      <td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${ZONE_COLORS[z.key]};margin-right:6px"></span>${z.label}</td>
      <td>${z.pct[0]}–${z.pct[1]}%</td>
      <td><strong>${z.low}–${z.high} bpm</strong></td>
    </tr>`).join('')
  table.hidden = false
  empty.hidden = true
}

$('calc-form').addEventListener('input', render)
render()
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "How do I find my real max heart rate?", "acceptedAnswer": {"@type": "Answer", "text": "Age formulas are estimates (±10 bpm). Check the highest value your HR monitor recorded at the end of a hard race, or do a field test: after warming up, run 3 × 2 minutes uphill all-out and note the peak reading."}},
    {"@type": "Question", "name": "How do I measure resting heart rate?", "acceptedAnswer": {"@type": "Answer", "text": "Measure first thing in the morning before getting up, over several days, and average the readings. Watches with sleep tracking report it automatically."}},
    {"@type": "Question", "name": "Why is Zone 2 training so popular?", "acceptedAnswer": {"@type": "Answer", "text": "Zone 2 builds mitochondrial density and fat-burning capacity with low injury risk. Most endurance programs put about 80% of training time at or below Zone 2."}},
    {"@type": "Question", "name": "Karvonen vs. percentage of max — which should I use?", "acceptedAnswer": {"@type": "Answer", "text": "Karvonen is more personalized because it accounts for resting heart rate. Use percent-of-max only if you don't know your resting HR."}},
    {"@type": "Question", "name": "My watch shows different zones. Which is right?", "acceptedAnswer": {"@type": "Answer", "text": "Vendors use different zone models. None is wrong — consistency matters. This calculator's zones map to common running training language."}}
  ]
}
</script>
```

- [ ] **Step 7: Build and verify**

Run: `bundle exec jekyll build`
Expected: success. `grep -c "FAQPage" _site/hr-zones/index.html` = 1; `grep -c "/hr-zones/" _site/sitemap.xml` = 1.

- [ ] **Step 8: Commit**

```bash
git add assets/js/calc.js tests/hr-zones.test.js hr-zones/index.html _data/tools.yml
git commit -m "feat: add Karvonen heart rate zone calculator at /hr-zones/"
```

---

### Task 6: Split / Pace Band Calculator (`/splits/`)

Primary keyword: **running splits calculator**. Even or negative splits for a goal time; printable table.

**Files:**
- Modify: `assets/js/calc.js`
- Create: `tests/splits.test.js`
- Create: `splits/index.html`
- Modify: `_data/tools.yml` (append entry)

**Interfaces:**
- Consumes: `secToPace`, `secToHms`, `DIST_KM` from calc.js.
- Produces: `splitPlan(totalSec, distKm, splitKm, strategyPct)→[{n, dist, splitSec, cumSec}]` (exported). `strategyPct` 0 = even; positive N = negative split where the first split is ~N% slower than average and the last ~N% faster, linearly graded, normalized so cumulative time exactly equals `totalSec`. Handles a final partial split (e.g., marathon 42.195 with 1 km splits ends with a 0.195 km row).

- [ ] **Step 1: Write the failing test file `tests/splits.test.js`**

```js
const assert = require('assert')
const { splitPlan } = require('../assets/js/calc.js')

let passed = 0, failed = 0
function test(name, fn) {
  try { fn(); passed++; process.stdout.write(`✓ ${name}\n`) }
  catch (e) { failed++; process.stdout.write(`✗ ${name}\n  ${e.message}\n`) }
}

test('even splits: 50:00 10K in 1 km splits → ten 300 s rows', () => {
  const plan = splitPlan(3000, 10, 1, 0)
  assert.strictEqual(plan.length, 10)
  plan.forEach(row => assert.ok(Math.abs(row.splitSec - 300) < 0.001, `split was ${row.splitSec}`))
  assert.ok(Math.abs(plan[9].cumSec - 3000) < 0.001)
  assert.strictEqual(plan[9].dist, 10)
})
test('negative splits: first slower than last, total preserved', () => {
  const plan = splitPlan(3000, 10, 1, 6)
  assert.ok(plan[0].splitSec > plan[9].splitSec, 'first split should be slower')
  assert.ok(Math.abs(plan[9].cumSec - 3000) < 0.001, 'total must equal goal time')
})
test('partial final split: marathon with 5 km splits', () => {
  const plan = splitPlan(14400, 42.195, 5, 0)
  assert.strictEqual(plan.length, 9)
  assert.ok(Math.abs(plan[8].dist - 42.195) < 0.001)
  assert.ok(plan[8].splitSec < plan[0].splitSec, 'final partial split takes less time')
  assert.ok(Math.abs(plan[8].cumSec - 14400) < 0.001)
})
test('split numbering is 1-based and cumulative distance grows', () => {
  const plan = splitPlan(3000, 10, 1, 0)
  assert.strictEqual(plan[0].n, 1)
  assert.strictEqual(plan[0].dist, 1)
  assert.strictEqual(plan[4].dist, 5)
})

process.stdout.write(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/splits.test.js`
Expected: FAIL — `splitPlan is not a function`.

- [ ] **Step 3: Implement in `assets/js/calc.js`**

Insert before the `// === NODE EXPORT` block:

```js
// === SPLIT PLANNER ===
// strategyPct 0 = even splits; positive = negative split (start slower, finish
// faster), linearly graded by segment midpoint, normalized to the exact total.
function splitPlan(totalSec, distKm, splitKm, strategyPct) {
  const basePace = totalSec / distKm
  const d = (strategyPct || 0) / 100
  const segments = []
  for (let start = 0; start < distKm - 1e-9; start += splitKm) {
    const len = Math.min(splitKm, distKm - start)
    const mid = start + len / 2
    const factor = 1 + d * (1 - 2 * mid / distKm)
    segments.push({ len, sec: basePace * factor * len })
  }
  const rawTotal = segments.reduce((sum, seg) => sum + seg.sec, 0)
  const scale = totalSec / rawTotal
  let cum = 0
  let dist = 0
  return segments.map((seg, i) => {
    const splitSec = seg.sec * scale
    cum += splitSec
    dist += seg.len
    return { n: i + 1, dist: Math.round(dist * 1000) / 1000, splitSec, cumSec: cum }
  })
}
```

Add `splitPlan,` to `module.exports`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/splits.test.js && node tests/calc.test.js`
Expected: all pass.

- [ ] **Step 5: Append the tool entry to `_data/tools.yml`**

```yaml
- name: Splits Calculator
  url: /splits/
  badge: Running
  short: Even & negative split tables
  description: Build a printable split table for any race — even or negative splits per km or mile for 5K to marathon.
```

- [ ] **Step 6: Create `splits/index.html`**

```html
---
layout: default
title: Running Splits Calculator — Even & Negative Splits
description: Free running splits calculator. Get km or mile split times for your goal race time — even pacing or negative splits — with a printable pace table.
permalink: /splits/
---
<style>
  @media print {
    header, footer, .tool-form, .tool-content, .related-tools,
    .cookie-banner, #print-btn { display: none !important; }
    .tool-wrap { padding: 0; }
  }
</style>
<div class="tool-wrap">
  <div class="tool-heading">
    <h1>Running Splits Calculator</h1>
    <p>Split times for your goal race — even or negative pacing, printable.</p>
  </div>

  <form id="calc-form" class="tool-form" autocomplete="off" novalidate>
    <div class="field">
      <fieldset>
        <legend>Race distance</legend>
        <div class="radio-group">
          <label><input type="radio" name="race-dist" value="5k" checked><span>5K</span></label>
          <label><input type="radio" name="race-dist" value="10k"><span>10K</span></label>
          <label><input type="radio" name="race-dist" value="half"><span>Half</span></label>
          <label><input type="radio" name="race-dist" value="full"><span>Marathon</span></label>
        </div>
      </fieldset>
    </div>
    <div class="field">
      <label>Goal time</label>
      <div class="time-inputs">
        <input type="number" id="time-hh" min="0" max="9" placeholder="0" aria-label="Hours">
        <span>:</span>
        <input type="number" id="time-mm" min="0" max="59" placeholder="50" aria-label="Minutes">
        <span>:</span>
        <input type="number" id="time-ss" min="0" max="59" placeholder="00" aria-label="Seconds">
        <span>h:mm:ss</span>
      </div>
    </div>
    <div class="field">
      <label for="split-unit">Split every</label>
      <select id="split-unit">
        <option value="1" selected>1 km</option>
        <option value="1.60934">1 mile</option>
        <option value="5">5 km</option>
      </select>
    </div>
    <div class="field">
      <fieldset>
        <legend>Pacing strategy</legend>
        <div class="radio-group">
          <label><input type="radio" name="strategy" value="0" checked><span>Even</span></label>
          <label><input type="radio" name="strategy" value="3"><span>Negative 3%</span></label>
          <label><input type="radio" name="strategy" value="6"><span>Negative 6%</span></label>
        </div>
      </fieldset>
    </div>
  </form>

  <section aria-live="polite">
    <table class="result-table" id="splits-table" hidden>
      <thead><tr><th>#</th><th>At distance</th><th>Split</th><th>Cumulative</th></tr></thead>
      <tbody id="splits-body"></tbody>
    </table>
    <button type="button" id="print-btn" class="tool-form" style="cursor:pointer;padding:8px 16px;font-size:13px" hidden>Print pace table</button>
    <p id="empty-msg" style="color:var(--text-secondary);font-size:13px">Enter a goal time above to build your split table.</p>
  </section>

  <section class="tool-content">
    <h2>How to use a split table</h2>
    <p>A split table tells you what your watch should read at each kilometer or mile marker if you're on target. Racing to a plan beats racing on feel: the most common race mistake at every level is starting too fast, banking "free" seconds early, and paying them back double in the final third. Write your splits on your arm, tape them to your bottle, or print this table as a classic pace band.</p>
    <p>Choose <strong>even splits</strong> for flat courses and shorter races. Choose a <strong>negative split</strong> — starting slightly slower than average and finishing faster — for longer races: it keeps early effort honest and consistently produces better times. A 3% gradient means your first kilometer is about 3% slower than average pace and your last about 3% faster; 6% is a more aggressive progression best suited to experienced racers or training runs.</p>

    <h2>Why negative splits work</h2>
    <ul>
      <li><strong>Physiology:</strong> starting hard burns carbohydrate faster and accumulates fatigue you cannot recover mid-race. A conservative start preserves glycogen for the finish.</li>
      <li><strong>Evidence:</strong> most world records from 1500 m to the marathon were set with even or negative splits — almost never with a fast start.</li>
      <li><strong>Psychology:</strong> passing people in the final kilometers is worth more mentally than being passed while fading.</li>
    </ul>

    <h2>Frequently asked questions</h2>
    <div class="faq">
      <details>
        <summary>What are splits in running?</summary>
        <p>Splits are your times for each segment of a race — typically each kilometer or mile. "Even splits" means running every segment at the same pace; a "negative split" means running the second half faster than the first.</p>
      </details>
      <details>
        <summary>Should I run even or negative splits?</summary>
        <p>For 5K and 10K on flat courses, even splits work well. For half and full marathons, a slight negative split (2–4%) is the strategy most coaches recommend — start controlled, finish strong.</p>
      </details>
      <details>
        <summary>How do I make a pace band?</summary>
        <p>Generate your split table, press "Print pace table", cut out the cumulative column, and tape it around your wrist (clear packing tape makes it sweat-proof). At each marker, compare your watch to the band.</p>
      </details>
      <details>
        <summary>Why doesn't the last marathon split match the others?</summary>
        <p>A marathon is 42.195 km, so with 1 km splits the final row covers only 0.195 km. The table shows the correct shorter time for that partial segment, and the cumulative column still ends exactly at your goal time.</p>
      </details>
      <details>
        <summary>Do course hills change my splits?</summary>
        <p>Yes — a fixed table assumes a flat course. On hilly courses, run by effort on the climbs and let the splits average out; expect to give back 2–4 seconds per kilometer of net climbing.</p>
      </details>
    </div>
  </section>

  {% include related-tools.html %}
</div>

<script src="{{ '/assets/js/calc.js' | relative_url }}"></script>
<script>
const $ = id => document.getElementById(id)

function render() {
  const distKey = document.querySelector('input[name="race-dist"]:checked').value
  const h = parseInt($('time-hh').value, 10) || 0
  const m = parseInt($('time-mm').value, 10) || 0
  const s = parseInt($('time-ss').value, 10) || 0
  const total = h * 3600 + m * 60 + s
  const splitKm = parseFloat($('split-unit').value)
  const strategy = parseInt(document.querySelector('input[name="strategy"]:checked').value, 10)
  const table = $('splits-table')
  const empty = $('empty-msg')
  const printBtn = $('print-btn')

  if (total <= 0) { table.hidden = true; printBtn.hidden = true; empty.hidden = false; return }

  const isMile = splitKm > 1.6 && splitKm < 1.62
  const plan = splitPlan(total, DIST_KM[distKey], splitKm, strategy)
  $('splits-body').innerHTML = plan.map(row => {
    const distLabel = isMile
      ? `${(row.dist / 1.60934).toFixed(row.dist % 1.60934 < 0.01 ? 0 : 2)} mi`
      : `${row.dist} km`
    return `<tr><td>${row.n}</td><td>${distLabel}</td><td>${secToPace(row.splitSec)}</td><td><strong>${secToHms(row.cumSec)}</strong></td></tr>`
  }).join('')
  table.hidden = false
  printBtn.hidden = false
  empty.hidden = true
}

$('print-btn').addEventListener('click', () => window.print())
$('calc-form').addEventListener('input', render)
render()
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "What are splits in running?", "acceptedAnswer": {"@type": "Answer", "text": "Splits are your times for each segment of a race, typically each kilometer or mile. Even splits means the same pace throughout; a negative split means running the second half faster."}},
    {"@type": "Question", "name": "Should I run even or negative splits?", "acceptedAnswer": {"@type": "Answer", "text": "For 5K and 10K on flat courses, even splits work well. For half and full marathons, a slight negative split of 2–4% is what most coaches recommend."}},
    {"@type": "Question", "name": "How do I make a pace band?", "acceptedAnswer": {"@type": "Answer", "text": "Generate the split table, print it, cut out the cumulative column, and tape it around your wrist with clear tape."}},
    {"@type": "Question", "name": "Why doesn't the last marathon split match the others?", "acceptedAnswer": {"@type": "Answer", "text": "A marathon is 42.195 km, so with 1 km splits the final row covers only 0.195 km and takes proportionally less time."}},
    {"@type": "Question", "name": "Do course hills change my splits?", "acceptedAnswer": {"@type": "Answer", "text": "Yes — a fixed table assumes a flat course. On hills, run by effort and expect to give back 2–4 seconds per kilometer of net climbing."}}
  ]
}
</script>
```

- [ ] **Step 7: Build and verify**

Run: `bundle exec jekyll build`
Expected: success. `grep -c "FAQPage" _site/splits/index.html` = 1; `grep -c "/splits/" _site/sitemap.xml` = 1.

- [ ] **Step 8: Commit**

```bash
git add assets/js/calc.js tests/splits.test.js splits/index.html _data/tools.yml
git commit -m "feat: add splits / pace band calculator at /splits/"
```

---

### Task 7: Treadmill Pace Converter (`/treadmill/`)

Primary keyword: **treadmill pace conversion**. Speed ↔ pace, plus equivalent flat-ground pace at incline (ACSM running economy).

**Files:**
- Modify: `assets/js/calc.js`
- Create: `tests/treadmill.test.js`
- Create: `treadmill/index.html`
- Modify: `_data/tools.yml` (append entry)

**Interfaces:**
- Consumes: `secToPace`, `kmToMile` from calc.js.
- Produces: `kmhToSecPerKm(kmh)→secPerKm`, `mphToKmh(mph)→kmh`, `equivalentFlatKmh(kmh, gradePct)→kmh` (all exported). `equivalentFlatKmh` derives from the ACSM running equation (VO2 = 3.5 + 0.2v + 0.9v·grade, v in m/min): the flat speed with equal oxygen cost is `kmh × (1 + 4.5 × gradePct/100)`.

- [ ] **Step 1: Write the failing test file `tests/treadmill.test.js`**

```js
const assert = require('assert')
const { kmhToSecPerKm, mphToKmh, equivalentFlatKmh } = require('../assets/js/calc.js')

let passed = 0, failed = 0
function test(name, fn) {
  try { fn(); passed++; process.stdout.write(`✓ ${name}\n`) }
  catch (e) { failed++; process.stdout.write(`✗ ${name}\n  ${e.message}\n`) }
}

test('kmhToSecPerKm: 12 km/h = 5:00/km (300 s)', () => {
  assert.strictEqual(kmhToSecPerKm(12), 300)
})
test('mphToKmh: 6.2 mph ≈ 9.978 km/h', () => {
  assert.ok(Math.abs(mphToKmh(6.2) - 9.978) < 0.001)
})
test('equivalentFlatKmh: 0% grade changes nothing', () => {
  assert.strictEqual(equivalentFlatKmh(10, 0), 10)
})
test('equivalentFlatKmh: 10 km/h at 1% ≈ 10.45 km/h flat', () => {
  assert.ok(Math.abs(equivalentFlatKmh(10, 1) - 10.45) < 0.001)
})
test('equivalentFlatKmh: steeper grade → faster equivalent', () => {
  assert.ok(equivalentFlatKmh(10, 5) > equivalentFlatKmh(10, 2))
})

process.stdout.write(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/treadmill.test.js`
Expected: FAIL — `kmhToSecPerKm is not a function`.

- [ ] **Step 3: Implement in `assets/js/calc.js`**

Insert before the `// === NODE EXPORT` block:

```js
// === TREADMILL CONVERSION ===
function kmhToSecPerKm(kmh) {
  return 3600 / kmh
}

function mphToKmh(mph) {
  return mph * 1.60934
}

// Equivalent flat-ground speed with the same oxygen cost, from the ACSM
// running equation (VO2 = 3.5 + 0.2·v + 0.9·v·grade, v in m/min).
function equivalentFlatKmh(kmh, gradePct) {
  return kmh * (1 + 4.5 * gradePct / 100)
}
```

Add `kmhToSecPerKm, mphToKmh, equivalentFlatKmh,` to `module.exports`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node tests/treadmill.test.js && node tests/calc.test.js`
Expected: all pass.

- [ ] **Step 5: Append the tool entry to `_data/tools.yml`**

```yaml
- name: Treadmill Pace Converter
  url: /treadmill/
  badge: Running
  short: mph / km/h to pace, with incline
  description: Convert treadmill speed (mph or km/h) to running pace, and see the equivalent outdoor pace for any incline setting.
```

- [ ] **Step 6: Create `treadmill/index.html`**

```html
---
layout: default
title: Treadmill Pace Converter — Speed to Pace with Incline
description: Convert treadmill speed in mph or km/h to running pace per mile and km, and find the equivalent flat-ground pace for any incline. Free conversion chart.
permalink: /treadmill/
---
<div class="tool-wrap">
  <div class="tool-heading">
    <h1>Treadmill Pace Converter</h1>
    <p>Turn a treadmill speed into running pace — and see what the incline is really worth.</p>
  </div>

  <form id="calc-form" class="tool-form" autocomplete="off" novalidate>
    <div class="field">
      <label for="speed">Treadmill speed</label>
      <div class="time-inputs">
        <input type="number" id="speed" min="0" step="0.1" placeholder="10.0" aria-label="Speed">
        <span class="radio-group">
          <label><input type="radio" name="speed-unit" value="kmh" checked><span>km/h</span></label>
          <label><input type="radio" name="speed-unit" value="mph"><span>mph</span></label>
        </span>
      </div>
    </div>
    <div class="field">
      <label for="incline">Incline (%)</label>
      <input type="number" id="incline" min="0" max="15" step="0.5" value="1">
    </div>
  </form>

  <section id="results" class="result-cards" aria-live="polite" hidden>
    <div class="result-card"><span class="label">Belt pace / km</span><span class="value" id="out-pace-km">–</span></div>
    <div class="result-card"><span class="label">Belt pace / mile</span><span class="value" id="out-pace-mi">–</span></div>
    <div class="result-card"><span class="label">Equivalent flat pace / km</span><span class="value" id="out-flat-km">–</span><span class="sub" id="out-flat-mi"></span></div>
  </section>

  <section aria-live="polite">
    <h2 style="font-size:14px;font-weight:700;margin:8px 0">Conversion chart at your incline</h2>
    <table class="result-table">
      <thead><tr><th>km/h</th><th>mph</th><th>Pace /km</th><th>Pace /mi</th><th>Flat-equivalent /km</th></tr></thead>
      <tbody id="chart-body"></tbody>
    </table>
  </section>

  <section class="tool-content">
    <h2>How treadmill conversion works</h2>
    <p>Treadmills display speed (km/h or mph), but runners think in pace (minutes per km or mile). The conversion is a simple reciprocal: pace per km = 3600 ÷ speed in km/h. So 12.0 km/h is 5:00/km, and 6.0 mph is 10:00 per mile. The cards above convert your exact belt speed; the chart shows the full range so you can plan interval settings before stepping on.</p>
    <p>Incline changes the effort, not the belt speed. This converter uses the ACSM running-economy equation to compute the <em>flat-ground equivalent</em>: the outdoor pace that costs the same oxygen as your belt speed at your incline. At 1% incline the equivalent is about 4.5% faster than the belt pace — which is why the common advice is to set 1% to mimic outdoor running: it compensates for the missing air resistance and the belt assisting your leg turnover.</p>

    <h2>Common treadmill settings</h2>
    <ul>
      <li><strong>8.0 km/h (5.0 mph)</strong> — 7:30/km, brisk jog or recovery pace for most runners.</li>
      <li><strong>10.0 km/h (6.2 mph)</strong> — 6:00/km, a typical easy-run pace.</li>
      <li><strong>12.0 km/h (7.5 mph)</strong> — 5:00/km, a common tempo setting.</li>
      <li><strong>14.5 km/h (9.0 mph)</strong> — 4:08/km, interval territory for trained runners.</li>
    </ul>

    <h2>Frequently asked questions</h2>
    <div class="faq">
      <details>
        <summary>Should I always run at 1% incline?</summary>
        <p>The 1% convention comes from a 1996 study showing it best matches the energy cost of outdoor running at paces faster than about 5:00/km. At easy paces the difference is negligible, so 0–1% is fine. Use higher inclines as deliberate hill training, not as a default.</p>
      </details>
      <details>
        <summary>What is 7.0 mph in minutes per mile?</summary>
        <p>60 ÷ 7.0 ≈ 8:34 per mile (about 5:20 per km). The chart above covers the full range of common belt speeds.</p>
      </details>
      <details>
        <summary>Why does treadmill running feel easier (or harder) than outside?</summary>
        <p>Easier: no wind resistance, perfectly even surface, and the belt helps leg turnover. Harder: heat builds up indoors, and the fixed pace removes natural micro-variations. On balance most runners find a given pace slightly easier on the treadmill — the 1% incline roughly evens it out.</p>
      </details>
      <details>
        <summary>How accurate is the flat-ground equivalent?</summary>
        <p>It's based on the ACSM metabolic equation, a population average. Individual running economy varies, so treat it as a good estimate (within a few percent) rather than an exact match.</p>
      </details>
      <details>
        <summary>Is treadmill distance accurate?</summary>
        <p>Belt speed is usually calibrated within a few percent, but worn belts and user weight can affect it. If your treadmill and GPS watch disagree, the truth is typically in between — trust effort and heart rate over either display.</p>
      </details>
    </div>
  </section>

  {% include related-tools.html %}
</div>

<script src="{{ '/assets/js/calc.js' | relative_url }}"></script>
<script>
const $ = id => document.getElementById(id)
const CHART_KMH = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

function renderChart(incline) {
  $('chart-body').innerHTML = CHART_KMH.map(kmh => {
    const pace = kmhToSecPerKm(kmh)
    const flat = kmhToSecPerKm(equivalentFlatKmh(kmh, incline))
    return `<tr>
      <td>${kmh.toFixed(1)}</td>
      <td>${(kmh / 1.60934).toFixed(1)}</td>
      <td>${secToPace(pace)}</td>
      <td>${secToPace(kmToMile(pace))}</td>
      <td>${secToPace(flat)}</td>
    </tr>`
  }).join('')
}

function render() {
  const raw = parseFloat($('speed').value)
  const unit = document.querySelector('input[name="speed-unit"]:checked').value
  const incline = parseFloat($('incline').value) || 0
  renderChart(incline)

  if (isNaN(raw) || raw <= 0) { $('results').hidden = true; return }
  const kmh = unit === 'mph' ? mphToKmh(raw) : raw
  const pace = kmhToSecPerKm(kmh)
  const flatPace = kmhToSecPerKm(equivalentFlatKmh(kmh, incline))
  $('out-pace-km').textContent = `${secToPace(pace)} /km`
  $('out-pace-mi').textContent = `${secToPace(kmToMile(pace))} /mi`
  $('out-flat-km').textContent = `${secToPace(flatPace)} /km`
  $('out-flat-mi').textContent = `${secToPace(kmToMile(flatPace))} /mi`
  $('results').hidden = false
}

$('calc-form').addEventListener('input', render)
render()
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type": "Question", "name": "Should I always run at 1% incline?", "acceptedAnswer": {"@type": "Answer", "text": "The 1% convention best matches outdoor energy cost at paces faster than about 5:00/km. At easy paces 0–1% is fine. Use higher inclines as deliberate hill training."}},
    {"@type": "Question", "name": "What is 7.0 mph in minutes per mile?", "acceptedAnswer": {"@type": "Answer", "text": "60 ÷ 7.0 ≈ 8:34 per mile, or about 5:20 per kilometer."}},
    {"@type": "Question", "name": "Why does treadmill running feel easier or harder than outside?", "acceptedAnswer": {"@type": "Answer", "text": "No wind resistance and an even surface make it easier; indoor heat and fixed pacing can make it feel harder. A 1% incline roughly evens it out."}},
    {"@type": "Question", "name": "How accurate is the flat-ground equivalent?", "acceptedAnswer": {"@type": "Answer", "text": "It uses the ACSM metabolic equation, a population average — a good estimate within a few percent, not an exact individual match."}},
    {"@type": "Question", "name": "Is treadmill distance accurate?", "acceptedAnswer": {"@type": "Answer", "text": "Usually within a few percent, but belt wear and user weight affect it. Trust effort and heart rate over either display."}}
  ]
}
</script>
```

- [ ] **Step 7: Build and verify**

Run: `bundle exec jekyll build`
Expected: success. `grep -c "FAQPage" _site/treadmill/index.html` = 1; `grep -c "/treadmill/" _site/sitemap.xml` = 1.

- [ ] **Step 8: Commit**

```bash
git add assets/js/calc.js tests/treadmill.test.js treadmill/index.html _data/tools.yml
git commit -m "feat: add treadmill pace converter at /treadmill/"
```

---

### Task 8: Launch verification & Search Console checklist

**Files:**
- No code changes expected (fix anything the checks surface).

- [ ] **Step 1: Full test suite**

Run: `for f in tests/*.test.js; do node "$f" || exit 1; done`
Expected: every file passes (calc 33, consent 7, pace 6, predict 4, hr-zones 5, splits 4, treadmill 5).

- [ ] **Step 2: Full build + link integrity**

Run: `bundle exec jekyll build`
Then verify each page exists and cross-links:

```bash
for p in pace predict hr-zones splits treadmill run; do
  test -f "_site/$p/index.html" || echo "MISSING $p"
  grep -q "related-tools" "_site/$p/index.html" || echo "NO RELATED $p"
done
grep -o 'tool-card' _site/index.html | wc -l   # expect 6
grep -c '<loc>' _site/sitemap.xml               # expect ≥ 11 (6 tools + legal pages + home)
```

- [ ] **Step 3: Mobile spot-check**

Serve locally (`bundle exec jekyll serve`) and check each new page at 375 px width: form usable, no horizontal scroll, results readable. (If a browser skill is available, use it; otherwise flag for the user to check.)

- [ ] **Step 4: Push to deploy**

```bash
git push origin master
```

GitHub Pages rebuilds automatically; site is live at ryutility.com.

- [ ] **Step 5: Manual follow-ups for the user (cannot be automated)**

Present this checklist to the user:
1. In Google Search Console, confirm the sitemap `https://ryutility.com/sitemap.xml` is submitted and re-fetched.
2. Use "URL Inspection → Request Indexing" for each new URL: `/pace/`, `/predict/`, `/hr-zones/`, `/splits/`, `/treadmill/`.
3. Set a monthly reminder to review Search Console queries: strengthen pages with impressions but few clicks (improve title/description), and note which tools earn impressions fastest.
4. Optional: when genuinely relevant threads appear on r/running or r/AdvancedRunning, share a tool link — never cold-post.
