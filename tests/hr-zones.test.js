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
