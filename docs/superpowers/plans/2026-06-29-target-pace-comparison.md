# Target Pace Comparison — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the ambiguous "Reference Pace" input with a race TT input (VDOT-based), and add a Target race comparison so zone cards show Current vs Target paces with a delta.

**Architecture:** Modify `running-pace-calculator.html` in-place. Add Daniels' VDOT math functions (no lookup table — computed from formula). Extend `calcZones()` to include raw `paceKmSec` values. Replace `readInputs()` with a two-section reader. Update `renderZoneCards()` to show Current + Target + delta row. Accessible and beginner-friendly: placeholder hints guide first-time users.

**Tech Stack:** Vanilla JS ES6+, HTML5, CSS3 — no new dependencies.

## Global Constraints

- Single file `running-pace-calculator.html` — no new files
- No CDN, no npm, no localStorage
- `tests/calc.test.js` must remain runnable with `node tests/calc.test.js`
- Mobile-first layout preserved
- VDOT range accepted: 30–85 (outside this, return `null` and show inline warning)
- Delta label format: `▲ Xs faster` (green `#22c55e`) / `▼ Xs slower` (orange `#f59e0b`); if ≥60s, `▲ M:SS faster`
- Empty state message: beginner-friendly, includes example inputs

---

## File Map

| File | Changes |
|------|---------|
| `running-pace-calculator.html` | Add VDOT functions, update `calcZones`, replace input HTML, replace `readInputs`/`render`/`renderZoneCards`, add CSS |
| `tests/calc.test.js` | Add tests for `calcVDOT`, `thresholdPaceFromVDOT`, `raceTimeToThresholdPace`, `formatDelta`, updated `calcZones` |

---

## Task 1: VDOT functions + calcZones paceKmSec (TDD)

**Files:**
- Modify: `running-pace-calculator.html` `<script>` block
- Modify: `tests/calc.test.js`

**Interfaces:**
- Produces:
  - `calcVDOT(distM: number, timeSec: number): number` — Daniels VO2max equivalent
  - `thresholdPaceFromVDOT(vdot: number): number` — sec/km at T-pace (88% VO2max)
  - `raceTimeToThresholdPace(distKey: '5k'|'10k'|'half'|'full', totalSec: number): number|null`
  - `formatDelta(currentZone: Zone, targetZone: Zone): string` — delta label or `''`
  - `calcZones` extended: each Zone now also has `paceKmSec: { lo: number, hi: number }`

- [ ] **Step 1: Add new tests to `tests/calc.test.js`**

Append after the existing `calcZones` tests (before the final `console.log`):

```js
// === VDOT FUNCTIONS ===
// Note: copy implementations from HTML into this file after Step 3

function calcVDOT(distM, timeSec) { throw new Error('not implemented') }
function thresholdPaceFromVDOT(vdot) { throw new Error('not implemented') }
function raceTimeToThresholdPace(distKey, totalSec) { throw new Error('not implemented') }
function formatDelta(currentZone, targetZone) { throw new Error('not implemented') }

// calcVDOT
// 5K 25:00 = 1500s, v=200m/min
// VO2 = -4.60 + 0.182258*200 + 0.000104*40000 = 36.01
// %VO2max = 0.8 + 0.1894393*exp(-0.319445) + 0.2989558*exp(-4.831513) ≈ 0.940
// VDOT ≈ 38.3
test('calcVDOT 5K 25:00 ≈ 38.3', () => {
  const result = calcVDOT(5000, 1500)
  assert.ok(result > 38.0 && result < 38.6, `got ${result}`)
})
// 10K 50:00 = 3000s, same velocity → higher %VO2max used → VDOT ≈ 40.0
test('calcVDOT 10K 50:00 ≈ 40.0', () => {
  const result = calcVDOT(10000, 3000)
  assert.ok(result > 39.5 && result < 40.5, `got ${result}`)
})

// thresholdPaceFromVDOT
// VDOT 38.3 → T-pace solves 0.88*38.3 = VO2(v): expect ~310–325 sec/km
test('thresholdPaceFromVDOT(38.3) ≈ 310–325 sec/km', () => {
  const result = thresholdPaceFromVDOT(38.3)
  assert.ok(result > 310 && result < 325, `got ${result}`)
})
// VDOT 60 → elite-ish runner, T-pace ~175–185 sec/km
test('thresholdPaceFromVDOT(60) ≈ 175–185 sec/km', () => {
  const result = thresholdPaceFromVDOT(60)
  assert.ok(result > 175 && result < 185, `got ${result}`)
})

// raceTimeToThresholdPace
test('raceTimeToThresholdPace 5k 25:00 returns 310–330', () => {
  const result = raceTimeToThresholdPace('5k', 1500)
  assert.ok(result !== null && result > 310 && result < 330, `got ${result}`)
})
test('raceTimeToThresholdPace 10k 50:00 returns 295–315', () => {
  const result = raceTimeToThresholdPace('10k', 3000)
  assert.ok(result !== null && result > 295 && result < 315, `got ${result}`)
})
test('raceTimeToThresholdPace half 1:45:00 (6300s) returns 270–310', () => {
  const result = raceTimeToThresholdPace('half', 6300)
  assert.ok(result !== null && result > 270 && result < 310, `got ${result}`)
})
test('raceTimeToThresholdPace out of range returns null', () => {
  // impossibly fast 5K: 10:00 → VDOT >> 85
  assert.strictEqual(raceTimeToThresholdPace('5k', 600), null)
  // impossibly slow 5K: 90:00 → VDOT << 30
  assert.strictEqual(raceTimeToThresholdPace('5k', 5400), null)
})
test('raceTimeToThresholdPace unknown distKey returns null', () => {
  assert.strictEqual(raceTimeToThresholdPace('marathon', 14400), null)
})

// formatDelta — needs Zone with paceKmSec: { lo, hi }
// delta = currentZone.paceKmSec.hi - targetZone.paceKmSec.hi
// 316 - 296 = 20 → "▲ 20s faster"
test('formatDelta 20s faster', () => {
  const cur = { paceKmSec: { lo: 310, hi: 316 } }
  const tgt = { paceKmSec: { lo: 290, hi: 296 } }
  assert.strictEqual(formatDelta(cur, tgt), '▲ 20s faster')
})
// 296 - 316 = -20 → "▼ 20s slower"
test('formatDelta 20s slower', () => {
  const cur = { paceKmSec: { lo: 290, hi: 296 } }
  const tgt = { paceKmSec: { lo: 310, hi: 316 } }
  assert.strictEqual(formatDelta(cur, tgt), '▼ 20s slower')
})
// delta = 0 → ''
test('formatDelta equal = ""', () => {
  const z = { paceKmSec: { lo: 310, hi: 316 } }
  assert.strictEqual(formatDelta(z, z), '')
})
// delta = 80s ≥ 60 → "▲ 1:20 faster"
test('formatDelta 80s faster → "▲ 1:20 faster"', () => {
  const cur = { paceKmSec: { lo: 370, hi: 380 } }
  const tgt = { paceKmSec: { lo: 290, hi: 300 } }
  assert.strictEqual(formatDelta(cur, tgt), '▲ 1:20 faster')
})

// calcZones now includes paceKmSec
test('calcZones zone includes paceKmSec', () => {
  const zones = calcZones({ refPaceSec: 270, refType: 'threshold', hrMax: 185, hrRest: 50, lapDist: 400 })
  const thresh = zones.find(z => z.key === 'threshold')
  assert.ok(typeof thresh.paceKmSec.lo === 'number', 'paceKmSec.lo should be a number')
  assert.ok(typeof thresh.paceKmSec.hi === 'number', 'paceKmSec.hi should be a number')
  assert.strictEqual(thresh.paceKmSec.lo, 270)
  assert.strictEqual(thresh.paceKmSec.hi, 270)
})
```

- [ ] **Step 2: Run tests — expect new tests to fail**

```bash
node tests/calc.test.js
```
Expected: existing 19 pass, new ~15 fail with "not implemented" or assertion errors.

- [ ] **Step 3: Implement the four new functions in `running-pace-calculator.html`**

Add after the existing `calcKarvonen` function and update `calcZones`. Locate the line `function calcZones` and the section just before it:

```js
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
  // Solve 0.88*vdot = -4.60 + 0.182258*v + 0.000104*v^2 for v (m/min)
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
```

Also update `calcZones` to add `paceKmSec`. Find the `return {` block inside `calcZones` and add one line:

```js
// BEFORE (inside the .map callback):
    return {
      key,
      label: ZONE_LABELS[key],
      paceKm: { lo: secToPace(paceFastSec), hi: secToPace(paceSlowSec) },
      paceMi: ...

// AFTER — add paceKmSec line:
    return {
      key,
      label: ZONE_LABELS[key],
      paceKm: { lo: secToPace(paceFastSec), hi: secToPace(paceSlowSec) },
      paceKmSec: { lo: paceFastSec, hi: paceSlowSec },
      paceMi: ...
```

- [ ] **Step 4: Copy new functions into test file, replace stubs**

In `tests/calc.test.js`, find the stub block added in Step 1:
```js
function calcVDOT(distM, timeSec) { throw new Error('not implemented') }
...
```

Replace those 4 stubs with the actual implementations (copy from HTML). Also copy the `DIST_KM` constant and update `calcZones` to include `paceKmSec`.

- [ ] **Step 5: Run tests — expect all to pass**

```bash
node tests/calc.test.js
```
Expected output ends with:
```
34 passed, 0 failed
```

- [ ] **Step 6: Commit**

```bash
git add running-pace-calculator.html tests/calc.test.js
git commit -m "feat: VDOT calculation functions and paceKmSec in zones"
```

---

## Task 2: Input panel HTML overhaul + CSS additions

**Files:**
- Modify: `running-pace-calculator.html` — `<style>` block and `<form id="calc-form">` section

**Interfaces:**
- Produces DOM IDs consumed by Task 3:
  - `cur-dist` (radio name), `cur-mm`, `cur-ss`
  - `tgt-dist` (radio name), `tgt-hh`, `tgt-mm`, `tgt-ss`, `tgt-hh-wrap`
  - `cur-warning`, `tgt-warning`
- Removes: `pace-min`, `pace-sec`, `pace-unit` radio, `ref-type` select, `pace-unit-label`

- [ ] **Step 1: Add CSS to `<style>` block**

Append before the closing `</style>` tag:

```css
/* SECTION HEADERS inside input panel */
.section-header {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 1px; color: var(--accent); margin-bottom: 8px; margin-top: 4px;
}
.section-divider {
  border: none; border-top: 1px solid var(--border); margin: 12px 0;
}

/* INLINE WARNING */
.input-warning {
  font-size: 11px; color: #ef4444; margin-top: 4px; display: none;
}
.input-warning.visible { display: block; }

/* TARGET COMPARE ROW */
.compare-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; color: var(--text-secondary);
  margin-right: 6px; vertical-align: middle;
}
.pace-target {
  font-size: 14px; color: var(--text-secondary); margin-top: 2px;
  display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap;
}
.pace-target span { vertical-align: middle; }
.delta { font-size: 12px; font-weight: 600; }
.delta-faster { color: #22c55e; }
.delta-slower { color: #f59e0b; }
```

- [ ] **Step 2: Replace `<form id="calc-form">` content**

Find the entire `<form id="calc-form" autocomplete="off" novalidate>` block and replace it completely:

```html
<form id="calc-form" autocomplete="off" novalidate>

  <p class="section-header">Current Fitness</p>

  <div class="field">
    <fieldset>
      <legend>Recent TT Distance</legend>
      <div class="radio-group">
        <label><input type="radio" name="cur-dist" value="5k" checked><span>5K</span></label>
        <label><input type="radio" name="cur-dist" value="10k"><span>10K</span></label>
      </div>
    </fieldset>
  </div>

  <div class="field">
    <label>Recent TT Time</label>
    <div class="pace-inputs">
      <input type="number" id="cur-mm" min="0" max="99" placeholder="25" aria-label="Minutes">
      <span>:</span>
      <input type="number" id="cur-ss" min="0" max="59" placeholder="00" aria-label="Seconds">
      <span>mm:ss</span>
    </div>
    <div id="cur-warning" class="input-warning">Time out of range (VDOT 30–85)</div>
  </div>

  <hr class="section-divider">
  <p class="section-header">Target Race <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></p>

  <div class="field">
    <fieldset>
      <legend>Race Distance</legend>
      <div class="radio-group">
        <label><input type="radio" name="tgt-dist" value="5k" checked><span>5K</span></label>
        <label><input type="radio" name="tgt-dist" value="10k"><span>10K</span></label>
        <label><input type="radio" name="tgt-dist" value="half"><span>Half</span></label>
        <label><input type="radio" name="tgt-dist" value="full"><span>Full</span></label>
      </div>
    </fieldset>
  </div>

  <div class="field">
    <label>Goal Time</label>
    <div class="pace-inputs" id="tgt-time-inputs">
      <span id="tgt-hh-wrap" style="display:none;align-items:center;gap:6px">
        <input type="number" id="tgt-hh" min="0" max="9" placeholder="1" aria-label="Hours" style="width:52px">
        <span>:</span>
      </span>
      <input type="number" id="tgt-mm" min="0" max="59" placeholder="22" aria-label="Minutes">
      <span>:</span>
      <input type="number" id="tgt-ss" min="0" max="59" placeholder="00" aria-label="Seconds">
      <span id="tgt-time-label">mm:ss</span>
    </div>
    <div id="tgt-warning" class="input-warning">Time out of range (VDOT 30–85)</div>
  </div>

  <hr class="section-divider">

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
```

- [ ] **Step 3: Verify form renders correctly in browser**

Open `running-pace-calculator.html`. Confirm:
- "CURRENT FITNESS" section with 5K/10K radio and MM:SS inputs
- "TARGET RACE (optional)" section below a divider
- Half/Full options in target distance radio
- All HR, Lap, Display Unit fields still present
- No console errors

- [ ] **Step 4: Commit**

```bash
git add running-pace-calculator.html
git commit -m "feat: replace reference pace inputs with Current/Target sections"
```

---

## Task 3: readInputs + render + renderZoneCards update

**Files:**
- Modify: `running-pace-calculator.html` `<script>` block

**Interfaces:**
- Consumes from Task 1: `raceTimeToThresholdPace`, `formatDelta`, `paceKmSec` in Zone
- Consumes from Task 2: IDs `cur-dist`, `cur-mm`, `cur-ss`, `tgt-dist`, `tgt-hh`, `tgt-mm`, `tgt-ss`, `cur-warning`, `tgt-warning`, `tgt-hh-wrap`, `tgt-time-label`
- Replaces: existing `readInputs()`, `render()`, `renderZoneCards()`
- Updates: `renderSummaryCards()` signature unchanged, still uses current zones only

- [ ] **Step 1: Replace `readInputs()` in the `<script>` block**

Find the existing `// === INPUT READER ===` section and replace it entirely:

```js
// === INPUT READER ===
function readRaceInput(distRadioName, mmId, ssId, hhId, warningId) {
  const dist = document.querySelector(`input[name="${distRadioName}"]:checked`)?.value
  const mm = parseInt(document.getElementById(mmId).value, 10)
  const ss = parseInt(document.getElementById(ssId).value, 10)
  const warning = document.getElementById(warningId)
  warning.classList.remove('visible')
  if (!dist || isNaN(mm) || mm < 0) return null
  const hh = hhId ? (parseInt(document.getElementById(hhId).value, 10) || 0) : 0
  const totalSec = hh * 3600 + mm * 60 + (isNaN(ss) ? 0 : ss)
  if (totalSec <= 0) return null
  const refPaceSec = raceTimeToThresholdPace(dist, totalSec)
  if (refPaceSec === null) { warning.classList.add('visible'); return null }
  return { refPaceSec }
}

function readInputs() {
  const hrMax  = parseInt(document.getElementById('hr-max').value, 10)
  const hrRest = parseInt(document.getElementById('hr-rest').value, 10)
  const lapDist  = parseInt(document.querySelector('input[name="lap-dist"]:checked').value, 10)
  const dispUnit = document.querySelector('input[name="disp-unit"]:checked').value
  return {
    current: readRaceInput('cur-dist', 'cur-mm', 'cur-ss', null,      'cur-warning'),
    target:  readRaceInput('tgt-dist', 'tgt-mm', 'tgt-ss', 'tgt-hh', 'tgt-warning'),
    hrMax:  isNaN(hrMax)  ? null : hrMax,
    hrRest: isNaN(hrRest) ? null : hrRest,
    lapDist,
    dispUnit,
  }
}
```

- [ ] **Step 2: Replace `renderZoneCards()` in the `<script>` block**

Find the existing `function renderZoneCards(zones, lapDist, dispUnit, hasHr)` and replace it:

```js
function buildTargetRow(currentZone, targetZone, dispUnit) {
  const paceStr = (dispUnit === 'mile')
    ? `${targetZone.paceMi.lo} – ${targetZone.paceMi.hi} <span>/mi</span>`
    : `${targetZone.paceKm.lo} – ${targetZone.paceKm.hi} <span>/km</span>`
  const deltaStr = formatDelta(currentZone, targetZone)
  const isFaster = currentZone.paceKmSec.hi > targetZone.paceKmSec.hi
  const deltaHtml = deltaStr
    ? `<span class="delta ${isFaster ? 'delta-faster' : 'delta-slower'}">${deltaStr}</span>`
    : ''
  return `<div class="pace-target"><span class="compare-label">Target</span>${paceStr}${deltaHtml}</div>`
}

function renderZoneCards(currentZones, targetZones, lapDist, dispUnit, hasHr) {
  const container = document.getElementById('zone-cards')
  const showKm = dispUnit === 'km' || dispUnit === 'both'
  const showMi = dispUnit === 'mile' || dispUnit === 'both'

  container.innerHTML = currentZones.map((z, i) => {
    const t = targetZones ? targetZones[i] : null
    const hasTarget = !!t
    const curLabel = hasTarget ? `<span class="compare-label">Current</span>` : ''
    const paceKmHtml = `${z.paceKm.lo} – ${z.paceKm.hi} <span>/km</span>`
    const paceMiHtml = `${z.paceMi.lo} – ${z.paceMi.hi} <span>/mi</span>`
    const hrLine    = hasHr ? `<span>${z.hr.low}–${z.hr.high} bpm</span>` : ''
    const lapLine   = `<span>${lapDist}m&nbsp;${z.lap.fast.display}–${z.lap.slow.display} (${z.lap.fast.totalSec}s–${z.lap.slow.totalSec}s)</span>`
    const speedLine = `<span>${z.speedKmh.lo}–${z.speedKmh.hi} km/h</span>`

    return `
      <article class="zone-card" data-zone="${z.key}">
        <div class="zone-header">
          <h2>${z.label}</h2>
          <span class="hr-pct">${z.hrPct[0]}–${z.hrPct[1]}%</span>
        </div>
        ${showKm ? `<div class="pace-km">${curLabel}${paceKmHtml}</div>` : ''}
        ${showMi && !showKm ? `<div class="pace-mi">${curLabel}${paceMiHtml}</div>` : ''}
        ${showMi && showKm  ? `<div class="pace-mi">${paceMiHtml}</div>` : ''}
        ${hasTarget ? buildTargetRow(z, t, dispUnit) : ''}
        <div class="zone-meta">${hrLine}${lapLine}${speedLine}</div>
      </article>`
  }).join('')
}
```

- [ ] **Step 3: Replace `render()` in the `<script>` block**

Find the existing `function render()` and replace it:

```js
function render() {
  const input = readInputs()
  const container = document.getElementById('zone-cards')

  if (!input.current) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>Enter your recent race time above.</strong><br>
        Example: 5K TT in 25:00 → your training zones appear here.<br>
        Add a Target time to compare goal paces side by side.
      </div>`
    ;['zone2','tempo','threshold','vo2max'].forEach(k => {
      const el = document.querySelector(`#sum-${k} .pace-range`)
      if (el) el.textContent = '–'
    })
    return
  }

  const hasHr = input.hrMax !== null && input.hrRest !== null && input.hrMax > input.hrRest
  const currentZones = calcZones({
    refPaceSec: input.current.refPaceSec,
    refType: 'threshold',
    hrMax: input.hrMax, hrRest: input.hrRest, lapDist: input.lapDist,
  })
  const targetZones = input.target ? calcZones({
    refPaceSec: input.target.refPaceSec,
    refType: 'threshold',
    hrMax: input.hrMax, hrRest: input.hrRest, lapDist: input.lapDist,
  }) : null

  renderSummaryCards(currentZones, input.dispUnit)
  renderZoneCards(currentZones, targetZones, input.lapDist, input.dispUnit, hasHr)
}
```

- [ ] **Step 4: Add target distance hours toggle to event wiring section**

Find `// === PACE UNIT LABEL ===` and append after it:

```js
// === TARGET DISTANCE HOURS TOGGLE ===
document.querySelectorAll('input[name="tgt-dist"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const needsHours = radio.value === 'half' || radio.value === 'full'
    const wrap  = document.getElementById('tgt-hh-wrap')
    const label = document.getElementById('tgt-time-label')
    wrap.style.display  = needsHours ? 'inline-flex' : 'none'
    label.textContent   = needsHours ? 'hh:mm:ss' : 'mm:ss'
  })
})
```

- [ ] **Step 5: Remove dead code — old pace unit label wiring**

The `// === PACE UNIT LABEL ===` block references `pace-unit` and `pace-unit-label` which no longer exist. Remove it entirely:

```js
// DELETE this entire block:
// === PACE UNIT LABEL ===
document.querySelectorAll('input[name="pace-unit"]').forEach(radio => {
  radio.addEventListener('change', () => {
    document.getElementById('pace-unit-label').textContent =
      radio.value === 'km' ? '/km' : '/mi'
  })
})
```

- [ ] **Step 6: Run unit tests to confirm no regression**

```bash
node tests/calc.test.js
```
Expected: `34 passed, 0 failed`

- [ ] **Step 7: Verify in browser**

Open `running-pace-calculator.html`. Test these scenarios:

**Scenario A — Current only:**
Enter 5K TT: 25:00 → 5 zone cards appear with Current label removed (no target), summary cards show paces.

**Scenario B — Current + Target:**
Enter 5K TT 25:00. Enter 5K Target 22:00 → zone cards show:
```
Current  5:18 – 5:18 /km
Target   4:41 – 4:41 /km  ▲ 37s faster
```
(exact values may differ slightly; Target should be faster)

**Scenario C — Target Half:**
Select Half in target, enter 1:45:00. Confirm hours input appears (`hh:mm:ss` label shows). Zone cards update with target comparison.

**Scenario D — Out of range:**
Enter 5K TT: 5:00 (impossibly fast) → "Time out of range" warning appears, zones still show empty state.

**Scenario E — Target cleared:**
Delete target MM field → target rows disappear from zone cards, Current only displayed.

- [ ] **Step 8: Commit**

```bash
git add running-pace-calculator.html
git commit -m "feat: VDOT-based inputs with Current/Target zone comparison"
```

---

## Spec Coverage Check

| Requirement | Task |
|-------------|------|
| Replace ambiguous reference pace with TT input | Task 2 |
| 5K / 10K as Current fitness input | Task 2 |
| VDOT computation from race time (Daniels formula) | Task 1 |
| `raceTimeToThresholdPace` returns null + warning when out of range | Task 1, 3 |
| Target: 5K / 10K / Half / Full | Task 2 |
| Half/Full shows hours field | Task 2, 3 |
| Zone cards: Current pace row | Task 3 |
| Zone cards: Target pace row with delta | Task 3 |
| Delta: `▲ Xs faster` green / `▼ Xs slower` orange | Task 1, 3 |
| Delta ≥ 60s formatted as `M:SS` | Task 1 |
| Target missing → Current-only display | Task 3 |
| Summary cards show Current only | Task 3 |
| `calcZones` extended with `paceKmSec` | Task 1 |
| Beginner-friendly empty state with example | Task 3 |
| 34 tests passing | Tasks 1, 3 |
