# Running Pace Calculator — Design Spec
Date: 2026-06-29

## Overview

Single-page static web app for daily running use. Given a manual reference pace, instantly shows VDOT-style training paces and HR-based zones on one screen.

**File:** `running-pace-calculator.html` — fully self-contained (HTML + CSS + JS inline)

---

## Architecture

### File Structure (inline)
```
<head>
  <style>  CSS variables (theme) + layout + card styles </style>
</head>
<body>
  <header>    app name + dark mode toggle
  <main>
    <aside class="input-panel">   input form
    <section class="output-panel">
      <div class="summary-cards">   4 summary cards
      <div class="zone-cards">      5 zone detail cards
<script>
  // Layer 1: Pure conversion functions
  // Layer 2: Calculation functions
  // Layer 3: render() — DOM update only
```

### JS Layers

**Layer 1 — Conversion functions**
- `paceToSec(min, sec)` → sec/km
- `secToPace(sec)` → "M:SS" string
- `kmToMile(secPerKm)` → sec/mile
- `lapSplit(secPerKm, distanceM)` → { display: "M:SS", totalSec: N }
- `toSpeedKmh(secPerKm)` → km/h
- `toSpeedMph(secPerKm)` → mph

**Layer 2 — Calculation functions**
- `calcZones(input)` → zones array (5 zones)
- `calcKarvonen(hrMax, hrRest, pctLow, pctHigh)` → { low, high }

**Layer 3 — Render**
- `render()` — reads DOM inputs, calls calcZones(), updates DOM
- Triggered by `input` event on all form fields (real-time, no button)

---

## Inputs

| Field | Type | Notes |
|-------|------|-------|
| Reference pace (min) | number | 0–59 |
| Reference pace (sec) | number | 0–59 |
| Pace unit | radio | min/km · min/mile |
| Reference type | select | Threshold · Tempo · 10K |
| HR Max | number | bpm |
| Resting HR | number | bpm |
| Lap distance | radio | 100m · 200m · 400m · 800m |
| Display unit | radio | km · mile · both |

---

## Calculation Logic

### Pace Zones (VDOT-style multipliers)

Internal representation: always sec/km. Input in min/mile is converted on read.

Multipliers applied to reference pace (higher = slower):

| Zone | Threshold ref | Tempo ref | 10K ref |
|------|--------------|-----------|---------|
| Jog/Easy | 1.25 – 1.35 | 1.20 – 1.30 | 1.30 – 1.40 |
| Zone 2 | 1.15 – 1.25 | 1.10 – 1.20 | 1.20 – 1.30 |
| Tempo | 1.05 – 1.10 | 1.00 (ref) | 1.08 – 1.12 |
| Threshold | 1.00 (ref) | 0.95 – 0.97 | 1.03 – 1.06 |
| VO2max | 0.90 – 0.95 | 0.88 – 0.92 | 1.00 (ref) |

### HR Zones (Karvonen)

`HRR = hrMax - hrRest`
`zoneHR = Math.round(hrRest + HRR × intensity)`

| Zone | Intensity range |
|------|----------------|
| Jog/Easy | 50 – 60% |
| Zone 2 | 60 – 70% |
| Tempo | 75 – 85% |
| Threshold | 83 – 90% |
| VO2max | 90 – 100% |

Note: MAF is intentionally omitted — absorbed into Zone 2.

### Derived Calculations

- **Lap split:** `lapSec = secPerKm × (lapDistanceM / 1000)` → display as "M:SS (Ns)"
- **Treadmill speed:** `kmh = 3600 / secPerKm` · `mph = kmh / 1.60934`

---

## Outputs

### Summary Cards (top, 4 cards in a row)

Each card shows zone name + pace range only (large text). Cards: Zone 2 · Tempo · Threshold · VO2max.

### Zone Cards (5 cards)

Zones: Jog/Easy · Zone 2 · Tempo · Threshold · VO2max

Each card:
```
THRESHOLD                        83–90% HR
4:15 – 4:30 /km
6:51 – 7:15 /mi          (shown only if unit = both or mile)
400m  1:42–1:48  (102s–108s)    (selected lap distance)
155 – 167 bpm
14.1 – 15.1 km/h  /  8.8 – 9.4 mph
```

---

## UI Layout

### Mobile (single column, stacked)
```
header: app name + dark mode toggle
input-panel (full width)
summary-cards (2×2 grid)
zone-cards (stacked)
```

### Desktop (two-column)
```
┌──────────────┬────────────────────────────┐
│ input-panel  │ summary-cards (4 in a row)  │
│ (fixed ~280px)├────────────────────────────┤
│              │ zone-cards (2-col grid)     │
└──────────────┴────────────────────────────┘
```

---

## Theming

Dark/light via `data-theme` attribute on `<html>`. CSS custom properties:
- `--bg`, `--surface`, `--border`, `--text-primary`, `--text-secondary`, `--accent`

Toggle button flips `data-theme` between `"light"` and `"dark"`. Default: system preference via `prefers-color-scheme`.

---

## Accessibility

- All inputs have `<label for>` association
- Radio groups wrapped in `<fieldset>` + `<legend>`
- Sufficient contrast ratio (≥4.5:1) in both themes
- Keyboard-navigable (natural tab order)
- Semantic HTML: `<header>`, `<main>`, `<aside>`, `<section>`, `<article>` for cards

---

## Constraints

- No localStorage / sessionStorage
- No external dependencies (no CDN, no fonts, no icons)
- Single `.html` file, opens directly in browser
- Mobile-first CSS (base styles for mobile, `@media (min-width: 768px)` for desktop)
