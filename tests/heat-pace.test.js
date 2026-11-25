const assert = require('assert')
const { calcDewPointC, heatPaceAdjustmentPct, adjustPaceForHeat } = require('../assets/js/calc.js')

let passed = 0, failed = 0
function test(name, fn) {
  try { fn(); passed++; process.stdout.write(`✓ ${name}\n`) }
  catch (e) { failed++; process.stdout.write(`✗ ${name}\n  ${e.message}\n`) }
}

test('calcDewPointC: 100% humidity equals air temperature', () => {
  assert.ok(Math.abs(calcDewPointC(20, 100) - 20) < 0.001)
})

test('calcDewPointC: 24°C at 70% humidity ≈ 18.18°C', () => {
  assert.ok(Math.abs(calcDewPointC(24, 70) - 18.18) < 0.05)
})

test('calcDewPointC: higher humidity yields higher dew point', () => {
  assert.ok(calcDewPointC(25, 80) > calcDewPointC(25, 40))
})

test('calcDewPointC: 0% humidity clamps safely without NaN', () => {
  const dp = calcDewPointC(20, 0)
  assert.ok(Number.isFinite(dp) && dp < 20)
})

test('heatPaceAdjustmentPct: combined < 100°F gives 0% slowdown', () => {
  // 10°C (50°F) + 5°C (41°F) = 91°F
  assert.strictEqual(heatPaceAdjustmentPct(10, 5), 0)
})

test('heatPaceAdjustmentPct: steps across all empirical brackets', () => {
  // Helper: convert combinedF target to equal tempF=dewPointF=combinedF/2 -> C
  const cFromF = f => (f - 32) * 5 / 9
  assert.strictEqual(heatPaceAdjustmentPct(cFromF(52), cFromF(52)), 0.5)   // 104
  assert.strictEqual(heatPaceAdjustmentPct(cFromF(57), cFromF(57)), 1.5)   // 114
  assert.strictEqual(heatPaceAdjustmentPct(cFromF(62), cFromF(62)), 3.0)   // 124
  assert.strictEqual(heatPaceAdjustmentPct(cFromF(67), cFromF(67)), 4.5)   // 134
  assert.strictEqual(heatPaceAdjustmentPct(cFromF(72), cFromF(72)), 6.5)   // 144
  assert.strictEqual(heatPaceAdjustmentPct(cFromF(77), cFromF(77)), 8.5)   // 154
  assert.strictEqual(heatPaceAdjustmentPct(cFromF(82), cFromF(82)), 10.5)  // 164
})

test('adjustPaceForHeat: 5:00/km at 24°C and 70% humidity', () => {
  const res = adjustPaceForHeat(300, 24, 70)
  assert.ok(Math.abs(res.dewPointC - 18.18) < 0.05)
  assert.ok(res.combinedF > 130 && res.combinedF < 140)
  assert.strictEqual(res.slowdownPct, 4.5)
  assert.ok(Math.abs(res.adjustedPaceKmSec - 313.5) < 0.01)
  assert.ok(Math.abs(res.adjustedPaceMiSec - 313.5 * 1.60934) < 0.01)
})

test('adjustPaceForHeat: cool conditions apply 0% slowdown', () => {
  const res = adjustPaceForHeat(300, 10, 40)
  assert.strictEqual(res.slowdownPct, 0)
  assert.strictEqual(res.adjustedPaceKmSec, 300)
})

test('adjustPaceForHeat: extreme heat/humidity (>160°F combined) applies 10.5%', () => {
  const res = adjustPaceForHeat(300, 35, 80)
  assert.ok(res.combinedF > 160)
  assert.strictEqual(res.slowdownPct, 10.5)
  assert.ok(Math.abs(res.adjustedPaceKmSec - 331.5) < 0.01)
})

process.stdout.write(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
