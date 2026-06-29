const assert = require('assert')

// === FUNCTIONS UNDER TEST (copy from HTML after implementation) ===

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
        lo: toKmh(paceSlowSec).toFixed(1),
        hi: toKmh(paceFastSec).toFixed(1),
      },
      speedMph: {
        lo: toMph(paceSlowSec).toFixed(1),
        hi: toMph(paceFastSec).toFixed(1),
      },
    }
  })
}

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
