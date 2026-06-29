# Running Pace Calculator — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `running-pace-calculator.html` — a single self-contained file that shows VDOT-style training paces and Karvonen HR zones from a manually entered reference pace.

**Architecture:** Pure Vanilla JS, zero external dependencies. All CSS and JS inline in one HTML file. Three JS layers: conversion functions → calculation functions → `render()`. Real-time updates on every `input` event. Tests run via Node.js during development; test file is the source of truth for function contracts.

**Tech Stack:** HTML5, CSS3 (custom properties), Vanilla JS ES6+, Node.js `assert` (tests only — no package.json needed)

## Global Constraints
- Final deliverable: single file `running-pace-calculator.html` at repo root
- No CDN, no npm packages, no build tools, no localStorage/sessionStorage
- Mobile-first CSS base; desktop layout at `@media (min-width: 768px)`
- Semantic HTML: `<header>`, `<main>`, `<aside>`, `<section>`, `<article>`
- All inputs: `<label for="id">` association; radio groups: `<fieldset>` + `<legend>`
- Contrast ratio ≥ 4.5:1 in both themes
- Test file lives at `tests/calc.test.js`, runnable with `node tests/calc.test.js`

---

## File Map

| File | Role |
|------|------|
| `running-pace-calculator.html` | Final deliverable — HTML + inline CSS + inline JS |
| `tests/calc.test.js` | Node.js unit tests for conversion + calculation functions |

---

## Task 1: HTML skeleton + complete CSS

**Files:**
- Create: `running-pace-calculator.html`

**Interfaces:**
- Produces: full HTML structure with IDs consumed by Tasks 3–5; CSS variables consumed by Task 5 dark-mode toggle

- [ ] **Step 1: Create the file with semantic HTML structure**

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RunPace — Training Zone Calculator</title>
  <style>
    /* THEME VARIABLES */
    :root {
      --bg: #f0f0f0; --surface: #ffffff; --border: #e0e0e0;
      --text-primary: #111111; --text-secondary: #666666;
      --accent: #2563eb;
    }
    [data-theme="dark"] {
      --bg: #111111; --surface: #1e1e1e; --border: #333333;
      --text-primary: #f0f0f0; --text-secondary: #999999;
      --accent: #60a5fa;
    }

    /* RESET + BASE */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px; background: var(--bg); color: var(--text-primary);
      min-height: 100vh;
    }
    input, select, button { font: inherit; }

    /* HEADER */
    header {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px; border-bottom: 1px solid var(--border);
      background: var(--surface);
    }
    header h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }
    header p { font-size: 12px; color: var(--text-secondary); flex: 1; }
    #theme-toggle {
      background: none; border: 1px solid var(--border); border-radius: 6px;
      padding: 4px 10px; cursor: pointer; color: var(--text-primary);
      font-size: 13px;
    }

    /* LAYOUT */
    main {
      display: flex; flex-direction: column; gap: 0;
      max-width: 1200px; margin: 0 auto;
    }
    @media (min-width: 768px) {
      main { flex-direction: row; align-items: flex-start; }
    }

    /* INPUT PANEL */
    .input-panel {
      background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 16px;
    }
    @media (min-width: 768px) {
      .input-panel {
        width: 280px; flex-shrink: 0;
        border-bottom: none; border-right: 1px solid var(--border);
        min-height: calc(100vh - 49px); position: sticky; top: 0;
      }
    }

    /* FORM FIELDS */
    .field { margin-bottom: 14px; }
    .field label { display: block; font-size: 11px; font-weight: 600;
      color: var(--text-secondary); text-transform: uppercase;
      letter-spacing: 0.5px; margin-bottom: 4px; }
    .pace-inputs { display: flex; align-items: center; gap: 6px; }
    .pace-inputs input {
      width: 52px; padding: 6px 8px; border: 1px solid var(--border);
      border-radius: 6px; background: var(--bg); color: var(--text-primary);
      text-align: center; font-size: 16px;
    }
    .pace-inputs span { color: var(--text-secondary); }
    input[type="number"] {
      width: 80px; padding: 6px 8px; border: 1px solid var(--border);
      border-radius: 6px; background: var(--bg); color: var(--text-primary);
      font-size: 15px;
    }
    select {
      width: 100%; padding: 6px 8px; border: 1px solid var(--border);
      border-radius: 6px; background: var(--bg); color: var(--text-primary);
    }
    fieldset { border: none; }
    legend { font-size: 11px; font-weight: 600; color: var(--text-secondary);
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .radio-group { display: flex; gap: 6px; flex-wrap: wrap; }
    .radio-group label {
      display: flex; align-items: center; gap: 4px;
      font-size: 13px; font-weight: 400; color: var(--text-primary);
      text-transform: none; letter-spacing: normal;
      padding: 4px 10px; border: 1px solid var(--border); border-radius: 20px;
      cursor: pointer;
    }
    .radio-group input[type="radio"] { display: none; }
    .radio-group input[type="radio"]:checked + span {
      font-weight: 600; color: var(--accent);
    }
    .radio-group label:has(input:checked) {
      border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent);
    }

    /* OUTPUT PANEL */
    .output-panel { flex: 1; padding: 16px; }

    /* SUMMARY CARDS */
    .summary-cards {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 8px; margin-bottom: 16px;
    }
    @media (min-width: 768px) {
      .summary-cards { grid-template-columns: repeat(4, 1fr); }
    }
    .summary-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 10px 12px;
    }
    .summary-card .zone-label {
      font-size: 11px; font-weight: 600; color: var(--text-secondary);
      text-transform: uppercase; letter-spacing: 0.5px; display: block;
    }
    .summary-card .pace-range {
      font-size: 18px; font-weight: 700; display: block; margin-top: 2px;
    }

    /* ZONE CARDS */
    .zone-cards { display: grid; gap: 8px; }
    @media (min-width: 900px) {
      .zone-cards { grid-template-columns: 1fr 1fr; }
    }
    .zone-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 8px; padding: 12px 14px;
      border-left: 3px solid var(--zone-color, var(--border));
    }
    .zone-card[data-zone="jog"]       { --zone-color: #22c55e; }
    .zone-card[data-zone="zone2"]     { --zone-color: #06b6d4; }
    .zone-card[data-zone="tempo"]     { --zone-color: #f59e0b; }
    .zone-card[data-zone="threshold"] { --zone-color: #ef4444; }
    .zone-card[data-zone="vo2max"]    { --zone-color: #8b5cf6; }

    .zone-header { display: flex; justify-content: space-between;
      align-items: baseline; margin-bottom: 6px; }
    .zone-header h2 { font-size: 13px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; }
    .hr-pct { font-size: 11px; color: var(--text-secondary); }

    .pace-km  { font-size: 20px; font-weight: 700; }
    .pace-mi  { font-size: 14px; color: var(--text-secondary); margin-top: 1px; }
    .zone-meta {
      display: flex; gap: 12px; margin-top: 6px; flex-wrap: wrap;
      font-size: 12px; color: var(--text-secondary);
    }
    .zone-meta span { white-space: nowrap; }

    /* EMPTY STATE */
    .empty-state {
      text-align: center; padding: 40px 20px;
      color: var(--text-secondary); font-size: 14px;
    }

    /* FOCUS */
    :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    input:focus-visible, select:focus-visible {
      border-color: var(--accent); outline: none;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 25%, transparent);
    }
  </style>
</head>
<body>
  <header>
    <h1>RunPace</h1>
    <p>Training zone calculator</p>
    <button id="theme-toggle" aria-label="Toggle dark mode">Dark</button>
  </header>

  <main>
    <aside class="input-panel" aria-label="Calculator inputs">
      <form id="calc-form" autocomplete="off" novalidate>

        <div class="field">
          <label for="pace-min">Reference Pace</label>
          <div class="pace-inputs">
            <input type="number" id="pace-min" min="1" max="30" value="" placeholder="4" aria-label="Minutes">
            <span>:</span>
            <input type="number" id="pace-sec" min="0" max="59" value="" placeholder="30" aria-label="Seconds">
            <span id="pace-unit-label">/km</span>
          </div>
        </div>

        <div class="field">
          <fieldset>
            <legend>Pace Unit</legend>
            <div class="radio-group">
              <label><input type="radio" name="pace-unit" value="km" checked><span>min/km</span></label>
              <label><input type="radio" name="pace-unit" value="mile"><span>min/mi</span></label>
            </div>
          </fieldset>
        </div>

        <div class="field">
          <label for="ref-type">Reference Type</label>
          <select id="ref-type">
            <option value="threshold">Threshold</option>
            <option value="tempo">Tempo</option>
            <option value="10k">10K</option>
          </select>
        </div>

        <div class="field">
          <label for="hr-max">Max HR <span style="font-weight:400">(bpm)</span></label>
          <input type="number" id="hr-max" min="100" max="250" placeholder="185">
        </div>

        <div class="field">
          <label for="hr-rest">Resting HR <span style="font-weight:400">(bpm)</span></label>
          <input type="number" id="hr-rest" min="30" max="120" placeholder="50">
        </div>

        <div class="field">
          <fieldset>
            <legend>Lap Distance</legend>
            <div class="radio-group">
              <label><input type="radio" name="lap-dist" value="100"><span>100m</span></label>
              <label><input type="radio" name="lap-dist" value="200"><span>200m</span></label>
              <label><input type="radio" name="lap-dist" value="400" checked><span>400m</span></label>
              <label><input type="radio" name="lap-dist" value="800"><span>800m</span></label>
            </div>
          </fieldset>
        </div>

        <div class="field">
          <fieldset>
            <legend>Display Unit</legend>
            <div class="radio-group">
              <label><input type="radio" name="disp-unit" value="km" checked><span>km</span></label>
              <label><input type="radio" name="disp-unit" value="mile"><span>mile</span></label>
              <label><input type="radio" name="disp-unit" value="both"><span>both</span></label>
            </div>
          </fieldset>
        </div>

      </form>
    </aside>

    <section class="output-panel" aria-label="Training zones" aria-live="polite">

      <div class="summary-cards">
        <article class="summary-card" id="sum-zone2">
          <span class="zone-label">Zone 2</span>
          <span class="pace-range">–</span>
        </article>
        <article class="summary-card" id="sum-tempo">
          <span class="zone-label">Tempo</span>
          <span class="pace-range">–</span>
        </article>
        <article class="summary-card" id="sum-threshold">
          <span class="zone-label">Threshold</span>
          <span class="pace-range">–</span>
        </article>
        <article class="summary-card" id="sum-vo2max">
          <span class="zone-label">VO2max</span>
          <span class="pace-range">–</span>
        </article>
      </div>

      <div class="zone-cards" id="zone-cards">
        <div class="empty-state">Enter a reference pace above to see training zones.</div>
      </div>

    </section>
  </main>

  <script>
    // JS added in Task 2–5
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify file opens in browser with correct layout**

Open `running-pace-calculator.html` in browser. Confirm:
- Header with "RunPace" title and "Dark" button
- Input panel with all fields visible
- Empty state text in output area
- No JS errors in console

- [ ] **Step 3: Commit**

```bash
git add running-pace-calculator.html
git commit -m "feat: HTML skeleton and complete CSS"
```

---

## Task 2: Conversion + calculation functions (TDD)

**Files:**
- Create: `tests/calc.test.js`
- Modify: `running-pace-calculator.html` `<script>` block

**Interfaces:**
- Produces (consumed by Task 4 render function):
  - `paceToSec(min: number, sec: number): number` → total seconds per km
  - `secToPace(totalSec: number): string` → `"M:SS"`
  - `kmToMile(secPerKm: number): number` → sec per mile
  - `lapSplit(secPerKm: number, distM: number): { display: string, totalSec: number }`
  - `toKmh(secPerKm: number): number`
  - `toMph(secPerKm: number): number`
  - `calcKarvonen(hrMax: number, hrRest: number, pctLow: number, pctHigh: number): { low: number, high: number }`
  - `calcZones(input: CalcInput): Zone[]`
  - `CalcInput: { refPaceSec: number, refType: string, hrMax: number, hrRest: number, lapDist: number }`
  - `Zone: { key: string, label: string, paceKm: {lo:string,hi:string}, paceMi: {lo:string,hi:string}, hr: {low:number,high:number}, hrPct: [number,number], lap: {fast:{display:string,totalSec:number}, slow:{display:string,totalSec:number}}, speedKmh: {lo:string,hi:string}, speedMph: {lo:string,hi:string} }`

- [ ] **Step 1: Write failing tests**

Create `tests/calc.test.js`:

```js
const assert = require('assert')

// === FUNCTIONS UNDER TEST (copy from HTML after implementation) ===
// Paste functions here after implementing; re-run to verify

function paceToSec(min, sec) { throw new Error('not implemented') }
function secToPace(totalSec) { throw new Error('not implemented') }
function kmToMile(secPerKm) { throw new Error('not implemented') }
function lapSplit(secPerKm, distM) { throw new Error('not implemented') }
function toKmh(secPerKm) { throw new Error('not implemented') }
function toMph(secPerKm) { throw new Error('not implemented') }
function calcKarvonen(hrMax, hrRest, pctLow, pctHigh) { throw new Error('not implemented') }
function calcZones(input) { throw new Error('not implemented') }

// === TESTS ===
let passed = 0, failed = 0

function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); passed++ }
  catch(e) { console.error(`  ✗ ${name}: ${e.message}`); failed++ }
}

// paceToSec
test('paceToSec(4, 30) = 270', () => assert.strictEqual(paceToSec(4, 30), 270))
test('paceToSec(5, 0) = 300', () => assert.strictEqual(paceToSec(5, 0), 300))

// secToPace
test('secToPace(270) = "4:30"', () => assert.strictEqual(secToPace(270), '4:30'))
test('secToPace(305) = "5:05"', () => assert.strictEqual(secToPace(305), '5:05'))
test('secToPace(60) = "1:00"', () => assert.strictEqual(secToPace(60), '1:00'))

// kmToMile
test('kmToMile(270) ≈ 434.5', () => {
  const result = kmToMile(270)
  assert.ok(result > 434 && result < 435, `got ${result}`)
})

// lapSplit 400m at 4:30/km = 108s = 1:48
test('lapSplit(270, 400).totalSec = 108', () => assert.strictEqual(lapSplit(270, 400).totalSec, 108))
test('lapSplit(270, 400).display = "1:48"', () => assert.strictEqual(lapSplit(270, 400).display, '1:48'))
// lapSplit 200m at 4:30/km = 54s = 0:54
test('lapSplit(270, 200).totalSec = 54', () => assert.strictEqual(lapSplit(270, 200).totalSec, 54))
// lapSplit 100m at 4:30/km = 27s = 0:27
test('lapSplit(270, 100).totalSec = 27', () => assert.strictEqual(lapSplit(270, 100).totalSec, 27))
// lapSplit 800m at 4:30/km = 216s = 3:36
test('lapSplit(270, 800).totalSec = 216', () => assert.strictEqual(lapSplit(270, 800).totalSec, 216))

// toKmh: 3600/270 = 13.333...
test('toKmh(270) ≈ 13.3', () => {
  const result = toKmh(270)
  assert.ok(result > 13.3 && result < 13.4, `got ${result}`)
})

// toMph: 13.333/1.60934 ≈ 8.28
test('toMph(270) ≈ 8.28', () => {
  const result = toMph(270)
  assert.ok(result > 8.2 && result < 8.4, `got ${result}`)
})

// calcKarvonen: hrMax=185, hrRest=50, HRR=135
// 60%: 50 + 135*0.60 = 131, 70%: 50 + 135*0.70 = 145
test('calcKarvonen(185, 50, 0.60, 0.70) = {low:131, high:145}', () => {
  const result = calcKarvonen(185, 50, 0.60, 0.70)
  assert.deepStrictEqual(result, { low: 131, high: 145 })
})
// 90%: 50 + 135*0.90 = 171.5 → 172, 100%: 50+135 = 185
test('calcKarvonen(185, 50, 0.90, 1.00) = {low:172, high:185}', () => {
  const result = calcKarvonen(185, 50, 0.90, 1.00)
  assert.deepStrictEqual(result, { low: 172, high: 185 })
})

// calcZones: threshold ref, 4:30/km (270s) → Zone[0] = jog, multiplier [1.25,1.35]
// jog pace: 270*1.25=337.5s="5:38", 270*1.35=364.5s="6:05"
test('calcZones threshold ref produces 5 zones', () => {
  const zones = calcZones({ refPaceSec: 270, refType: 'threshold', hrMax: 185, hrRest: 50, lapDist: 400 })
  assert.strictEqual(zones.length, 5)
})
test('calcZones jog zone key', () => {
  const zones = calcZones({ refPaceSec: 270, refType: 'threshold', hrMax: 185, hrRest: 50, lapDist: 400 })
  assert.strictEqual(zones[0].key, 'jog')
})
test('calcZones threshold zone pace lo = ref pace', () => {
  const zones = calcZones({ refPaceSec: 270, refType: 'threshold', hrMax: 185, hrRest: 50, lapDist: 400 })
  const thresh = zones.find(z => z.key === 'threshold')
  assert.strictEqual(thresh.paceKm.lo, '4:30')
  assert.strictEqual(thresh.paceKm.hi, '4:30')
})
test('calcZones vo2max pace is faster than threshold', () => {
  const zones = calcZones({ refPaceSec: 270, refType: 'threshold', hrMax: 185, hrRest: 50, lapDist: 400 })
  const vo2 = zones.find(z => z.key === 'vo2max')
  // 270*0.90 = 243s < 270s
  assert.ok(paceToSec(...vo2.paceKm.lo.split(':').map(Number)) < 270)
})

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
```

- [ ] **Step 2: Run tests — expect all to fail**

```bash
node tests/calc.test.js
```
Expected: all `✗` errors with "not implemented"

- [ ] **Step 3: Implement all functions**

Replace the `<script>` block placeholder in `running-pace-calculator.html`:

```html
<script>
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
</script>
```

- [ ] **Step 4: Copy functions to test file and run**

In `tests/calc.test.js`, replace the stub functions at the top with the actual implementations (copy the full function bodies from the HTML). Keep all test cases unchanged below.

```bash
node tests/calc.test.js
```
Expected output:
```
  ✓ paceToSec(4, 30) = 270
  ✓ paceToSec(5, 0) = 300
  ✓ secToPace(270) = "4:30"
  ✓ secToPace(305) = "5:05"
  ✓ secToPace(60) = "1:00"
  ✓ kmToMile(270) ≈ 434.5
  ✓ lapSplit(270, 400).totalSec = 108
  ✓ lapSplit(270, 400).display = "1:48"
  ✓ lapSplit(270, 200).totalSec = 54
  ✓ lapSplit(270, 100).totalSec = 27
  ✓ lapSplit(270, 800).totalSec = 216
  ✓ toKmh(270) ≈ 13.3
  ✓ toMph(270) ≈ 8.28
  ✓ calcKarvonen(185, 50, 0.60, 0.70) = {low:131, high:145}
  ✓ calcKarvonen(185, 50, 0.90, 1.00) = {low:172, high:185}
  ✓ calcZones threshold ref produces 5 zones
  ✓ calcZones jog zone key
  ✓ calcZones threshold zone pace lo = ref pace
  ✓ calcZones vo2max pace is faster than threshold

19 passed, 0 failed
```

- [ ] **Step 5: Commit**

```bash
git add running-pace-calculator.html tests/calc.test.js
git commit -m "feat: conversion and calculation functions with tests"
```

---

## Task 3: Render function + event wiring

**Files:**
- Modify: `running-pace-calculator.html` `<script>` block (append after existing functions)

**Interfaces:**
- Consumes: `calcZones()`, `paceToSec()`, `kmToMile()` from Task 2
- Produces: live DOM updates whenever any input changes

- [ ] **Step 1: Add `readInputs()` and `render()` to the script block**

Append inside `<script>`, after the calcZones function:

```js
// === INPUT READER ===
function readInputs() {
  const paceMin = parseInt(document.getElementById('pace-min').value, 10)
  const paceSec = parseInt(document.getElementById('pace-sec').value, 10)
  const paceUnit = document.querySelector('input[name="pace-unit"]:checked').value
  const refType = document.getElementById('ref-type').value
  const hrMax = parseInt(document.getElementById('hr-max').value, 10)
  const hrRest = parseInt(document.getElementById('hr-rest').value, 10)
  const lapDist = parseInt(document.querySelector('input[name="lap-dist"]:checked').value, 10)
  const dispUnit = document.querySelector('input[name="disp-unit"]:checked').value

  if (isNaN(paceMin) || isNaN(paceSec) || paceMin < 1) return null

  let refPaceSec = paceToSec(paceMin, Math.min(59, Math.max(0, paceSec || 0)))
  if (paceUnit === 'mile') refPaceSec = refPaceSec / 1.60934

  return {
    refPaceSec, refType, lapDist, dispUnit,
    hrMax: isNaN(hrMax) ? null : hrMax,
    hrRest: isNaN(hrRest) ? null : hrRest,
  }
}

// === RENDER ===
function fmt(kmStr, miStr, unit) {
  if (unit === 'km')   return `${kmStr} /km`
  if (unit === 'mile') return `${miStr} /mi`
  return `${kmStr} /km`  // summary cards always show km
}

function renderSummaryCards(zones, dispUnit) {
  const keys = ['zone2', 'tempo', 'threshold', 'vo2max']
  keys.forEach(key => {
    const z = zones.find(z => z.key === key)
    const el = document.querySelector(`#sum-${key} .pace-range`)
    if (!z || !el) return
    const pace = dispUnit === 'mile'
      ? `${z.paceMi.lo}–${z.paceMi.hi}`
      : `${z.paceKm.lo}–${z.paceKm.hi}`
    el.textContent = pace
  })
}

function renderZoneCards(zones, lapDist, dispUnit, hasHr) {
  const container = document.getElementById('zone-cards')
  container.innerHTML = zones.map(z => {
    const paceKm = `${z.paceKm.lo} – ${z.paceKm.hi} <span>/km</span>`
    const paceMi = `${z.paceMi.lo} – ${z.paceMi.hi} <span>/mi</span>`
    const hrLine = hasHr
      ? `<span>${z.hr.low}–${z.hr.high} bpm</span>`
      : ''
    const lapLine = `<span>${lapDist}m&nbsp;${z.lap.fast.display}–${z.lap.slow.display} (${z.lap.fast.totalSec}s–${z.lap.slow.totalSec}s)</span>`
    const speedLine = `<span>${z.speedKmh.lo}–${z.speedKmh.hi} km/h</span>`

    const showMi = dispUnit === 'mile' || dispUnit === 'both'
    const showKm = dispUnit === 'km' || dispUnit === 'both'

    return `
      <article class="zone-card" data-zone="${z.key}">
        <div class="zone-header">
          <h2>${z.label}</h2>
          <span class="hr-pct">${z.hrPct[0]}–${z.hrPct[1]}%</span>
        </div>
        ${showKm ? `<div class="pace-km">${paceKm}</div>` : ''}
        ${showMi ? `<div class="pace-mi">${paceMi}</div>` : ''}
        <div class="zone-meta">
          ${hrLine}
          ${lapLine}
          ${speedLine}
        </div>
      </article>`
  }).join('')
}

function render() {
  const input = readInputs()
  const container = document.getElementById('zone-cards')

  if (!input) {
    container.innerHTML = '<div class="empty-state">Enter a reference pace above to see training zones.</div>'
    ;['zone2','tempo','threshold','vo2max'].forEach(k => {
      const el = document.querySelector(`#sum-${k} .pace-range`)
      if (el) el.textContent = '–'
    })
    return
  }

  const zones = calcZones(input)
  const hasHr = input.hrMax !== null && input.hrRest !== null && input.hrMax > input.hrRest

  renderSummaryCards(zones, input.dispUnit)
  renderZoneCards(zones, input.lapDist, input.dispUnit, hasHr)
}

// === EVENT WIRING ===
document.getElementById('calc-form').addEventListener('input', render)
render()
```

- [ ] **Step 2: Verify real-time calculation in browser**

Open `running-pace-calculator.html`. Type `4` in minutes, `30` in seconds. Confirm:
- Summary cards immediately show pace ranges (e.g., Zone 2: `5:11–5:38`)
- 5 zone cards appear with pace, lap, speed
- Changing "Pace Unit" to `min/mi` recalculates instantly
- Changing "Reference Type" to `Tempo` changes all pace values
- Changing "Lap Distance" to `200m` updates all lap displays

- [ ] **Step 3: Verify lap format**

With 4:30/km, 400m selected, Threshold zone should show:
- `400m 4:30–4:30 (270s–270s)` ← threshold ref with threshold zone, both multipliers = 1.00

- [ ] **Step 4: Verify HR calculation**

Enter HR Max: 185, Resting HR: 50. Zone 2 should show `131–145 bpm`. Threshold should show `162–172 bpm`.

- [ ] **Step 5: Commit**

```bash
git add running-pace-calculator.html
git commit -m "feat: render function and real-time event wiring"
```

---

## Task 4: Dark mode toggle + pace unit label + accessibility pass

**Files:**
- Modify: `running-pace-calculator.html` `<script>` block (append) and `<style>` block (minor additions)

**Interfaces:**
- Consumes: `data-theme` attribute on `<html>` from Task 1 CSS
- Produces: working dark mode toggle; pace unit label updates with radio selection; accessible focus styles

- [ ] **Step 1: Add dark mode toggle and pace unit label wiring to `<script>`**

Append inside `<script>` (after event wiring):

```js
// === DARK MODE ===
const themeBtn = document.getElementById('theme-toggle')
const html = document.documentElement

function applyTheme(theme) {
  html.setAttribute('data-theme', theme)
  themeBtn.textContent = theme === 'dark' ? 'Light' : 'Dark'
}

// Init from system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
applyTheme(prefersDark ? 'dark' : 'light')

themeBtn.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')
})

// === PACE UNIT LABEL ===
document.querySelectorAll('input[name="pace-unit"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.getElementById('pace-unit-label').textContent =
      radio.value === 'km' ? '/km' : '/mi'
  })
})
```

- [ ] **Step 2: Add skip-to-content link in `<body>` (before `<header>`)**

In the HTML `<body>`, add before `<header>`:

```html
<a href="#zone-cards" class="skip-link">Skip to results</a>
```

Add to `<style>`:

```css
.skip-link {
  position: absolute; top: -40px; left: 0;
  background: var(--accent); color: #fff; padding: 6px 12px;
  border-radius: 0 0 6px 0; z-index: 100; font-size: 13px;
  text-decoration: none;
}
.skip-link:focus { top: 0; }
```

- [ ] **Step 3: Verify dark mode in browser**

- Click "Dark" button → background turns dark, text stays readable
- Click "Light" → returns to light
- Open in browser with system dark mode: should default to dark

- [ ] **Step 4: Verify keyboard navigation**

Tab through all fields. Confirm focus ring visible on every focused element. Press Space to toggle radio buttons. No focus traps.

- [ ] **Step 5: Verify pace unit label**

Switch to `min/mi` radio. Confirm `/km` label next to pace inputs changes to `/mi`. Switch back — changes to `/km`.

- [ ] **Step 6: Commit**

```bash
git add running-pace-calculator.html
git commit -m "feat: dark mode toggle, pace unit label, accessibility"
```

---

## Task 5: Final browser verification + cleanup

**Files:**
- Modify: `running-pace-calculator.html` (minor fixes if any found)

**Interfaces:**
- Consumes: all prior tasks

- [ ] **Step 1: Full calculation verification**

Open in browser. Enter: pace `4:30`, unit `min/km`, ref type `Threshold`, HR Max `185`, HR Rest `50`, lap `400m`, display `both`.

Verify each zone against these expected values:

| Zone | Pace km | Pace mi | HR (bpm) | 400m lap | Speed km/h |
|------|---------|---------|----------|----------|------------|
| Jog/Easy | 5:38–6:04 | 9:03–9:46 | 118–131 | 2:15–2:26 (135s–146s) | 9.9–10.7 |
| Zone 2 | 5:11–5:38 | 8:21–9:03 | 131–145 | 2:04–2:15 (124s–135s) | 10.7–11.6 |
| Tempo | 4:44–4:57 | 7:37–7:58 | 149–163 | 1:54–1:59 (114s–119s) | 12.1–12.7 |
| Threshold | 4:30–4:30 | 7:15–7:15 | 162–172 | 1:48–1:48 (108s–108s) | 13.3–13.3 |
| VO2max | 4:03–4:17 | 6:31–6:53 | 172–185 | 1:37–1:43 (97s–103s) | 14.0–14.8 |

- [ ] **Step 2: Verify unit switching**

- Switch display to `km` only → mile rows disappear
- Switch to `mile` only → km rows disappear
- Switch to `both` → both rows visible
- Switch pace unit input to `min/mi`, enter 7:15 → should produce same Threshold pace as 4:30 /km

- [ ] **Step 3: Verify empty/partial state**

- Clear pace minutes field → empty state shown, summary cards show "–"
- Enter only pace, no HR → zone cards show without HR bpm line
- Enter pace + HR Max but not HR Rest → HR should not show (requires both)

- [ ] **Step 4: Verify mobile layout**

Resize browser to 375px width. Confirm:
- Input panel full width, stacked above results
- Summary cards 2×2 grid
- Zone cards single column

- [ ] **Step 5: Final commit**

```bash
git add running-pace-calculator.html
git commit -m "feat: complete running pace calculator"
```

---

## Spec Coverage Check

| Requirement | Task |
|-------------|------|
| Single HTML file, no build tools | Task 1 |
| Mobile-first, desktop layout | Task 1 (CSS) |
| Dark mode | Task 4 |
| No localStorage | — (never used) |
| Semantic HTML, label, fieldset, keyboard | Task 1, Task 4 |
| All inputs: pace, unit, ref type, HR max/rest, lap, display unit | Task 1 |
| 5 zones output (Jog, Zone 2, Tempo, Threshold, VO2max) | Task 2 |
| Per zone: pace range, HR range, lap split, speed | Task 3 |
| Lap: min:sec + (total seconds) | Task 2, 3 |
| 100/200/400/800m lap options | Task 1, 3 |
| VDOT-style multipliers per ref type | Task 2 |
| Karvonen HR zones | Task 2 |
| 4 summary cards (Zone2/Tempo/Threshold/VO2max) | Task 1, 3 |
| Real-time calculation | Task 3 |
| min/km ↔ min/mile conversion | Task 2 |
| MAF removed (absorbed into Zone 2) | Task 2 (omitted) |
