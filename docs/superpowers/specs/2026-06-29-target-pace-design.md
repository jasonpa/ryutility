# Target Pace Comparison — Design Spec
Date: 2026-06-29

## Overview

Two improvements to `running-pace-calculator.html`:

1. **Replace ambiguous "Reference Pace" input** with race TT input (5K or 10K time trial) → VDOT lookup → threshold pace auto-derived
2. **Add Target comparison** — goal race (5K/10K/Half/Full + goal time) → VDOT lookup → zone cards show Current vs Target paces with delta

Single file modification. No new files. No external dependencies.

---

## VDOT Lookup Table

Embed Daniels' Running Formula VDOT table (VDOT 30–85) as a JS constant:

```js
const VDOT_TABLE = {
  // vdot: { '5k': secPerKm, '10k': secPerKm, 'half': secPerKm, 'full': secPerKm,
  //         threshold: secPerKm, tempo: secPerKm }
  30: { '5k': 480, '10k': 499, half: 530, full: 560, threshold: 385, tempo: 370 },
  // ... entries for each integer VDOT 30–85
  85: { '5k': 173, '10k': 180, half: 190, full: 200, threshold: 138, tempo: 132 },
}
```

### Conversion flow

1. User inputs: race distance key + total finish time in seconds
2. `totalSec / distanceKm` → sec/km pace for that distance
3. Scan VDOT_TABLE[distance column], find two bracketing entries, linear interpolate → VDOT value
4. Look up `VDOT_TABLE[vdot].threshold` → `refPaceSec`
5. Pass to existing `calcZones({ refPaceSec, refType: 'threshold', ... })` unchanged

### New function

```js
function raceTimeToThresholdPace(distKey, totalSec)
  // distKey: '5k' | '10k' | 'half' | 'full'
  // totalSec: finish time in seconds
  // returns: threshold pace in sec/km, or null if out of table range
```

Both Current and Target use identical conversion path.

### Distance constants (km)

| Key | Distance |
|-----|----------|
| `5k` | 5.0 |
| `10k` | 10.0 |
| `half` | 21.0975 |
| `full` | 42.195 |

---

## Input Panel Changes

### Remove
- Reference pace min/sec inputs
- Pace unit radio (min/km · min/mile)
- Reference type select (Threshold/Tempo/10K)

### Add

**CURRENT FITNESS section:**
- Distance radio: `5K | 10K`
- Recent TT time: `[MM] : [SS]`

**TARGET section:**
- Race distance radio: `5K | 10K | Half | Full`
- Goal time:
  - 5K/10K: `[MM] : [SS]`
  - Half/Full: `[HH] : [MM] : [SS]` (hours field shown/hidden dynamically)

**Unchanged:** Max HR, Resting HR, Lap Distance, Display Unit

### Layout

```
┌─────────────────────────────┐
│  CURRENT FITNESS            │
│  Distance: ○5K ○10K         │
│  Recent TT: [MM]:[SS]       │
│  ─────────────────────────  │
│  TARGET                     │
│  Race: ○5K ○10K ○Half ○Full │
│  Goal:  [MM]:[SS]           │
│  ─────────────────────────  │
│  Max HR: [185]              │
│  Resting HR: [50]           │
│  Lap: ○100m ○200m ○400m ○800m│
│  Display: ○km ○mile ○both   │
└─────────────────────────────┘
```

---

## Zone Card Delta Display

Each zone card shows Current, Target (if entered), and delta:

```
┌──────────────────────────────────────────┐
│ THRESHOLD                      83–90% HR │
│                                          │
│ Current  4:30 – 4:30 /km                 │
│ Target   4:10 – 4:10 /km   ▲ 20s faster │
│                                          │
│ 400m  1:40–1:40 (100s)  │  14.4 km/h    │
│ 155–167 bpm                              │
└──────────────────────────────────────────┘
```

### Delta calculation

`delta = currentPaceSlowSec - targetPaceSlowSec` (using slow end of range for comparison)

| Condition | Display | Color |
|-----------|---------|-------|
| delta > 0 | `▲ Xs faster` | green (`#22c55e`) |
| delta < 0 | `▼ Xs slower` | orange (`#f59e0b`) |
| delta = 0 | hidden | — |

Delta shown in seconds (e.g., `▲ 20s faster`). If delta ≥ 60s, show as `▲ 1:20 faster`.

### Target missing

When Target section is empty: delta row hidden, zone cards show Current only. Backward compatible with existing behavior.

### Summary cards (4 top cards)

Show Current pace only. Target not added to summary cards (keeps them scannable).

---

## readInputs() Changes

New return shape:

```js
{
  current: { refPaceSec: number } | null,
  target:  { refPaceSec: number } | null,
  hrMax: number | null,
  hrRest: number | null,
  lapDist: number,
  dispUnit: string,
}
```

`calcZones()` called twice — once for `current.refPaceSec`, once for `target.refPaceSec`. Existing `calcZones` signature unchanged.

---

## Tests (tests/calc.test.js additions)

New tests for `raceTimeToThresholdPace`:

```js
// 5K 25:00 (1500s) → threshold near 5:00–5:10/km range
test('raceTimeToThresholdPace 5k 25min returns threshold pace', ...)
// 10K 50:00 (3000s) → similar fitness level
test('raceTimeToThresholdPace 10k 50min returns threshold pace', ...)
// Out of range returns null
test('raceTimeToThresholdPace out of range returns null', ...)
// Half 1:45:00 → threshold derivation
test('raceTimeToThresholdPace half 1:45:00', ...)
```

---

## Constraints

- Single `running-pace-calculator.html` file — no new files
- No external dependencies
- No localStorage
- Mobile-first layout preserved
- VDOT table range: VDOT 30–85 (covers ~10:00/km jogger to elite runner)
- Out-of-range input: show inline warning, no crash
