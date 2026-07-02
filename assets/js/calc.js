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
