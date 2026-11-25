const assert = require('assert')
const { riegelPredict, calcVDOT, timeFromVDOT, vdotPredict } = require('../assets/js/calc.js')

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

test('timeFromVDOT: round-trip with calcVDOT across 5K and marathon', () => {
  const vdot5k = calcVDOT(5000, 1500)
  assert.ok(Math.abs(timeFromVDOT(vdot5k, 5) - 1500) < 0.5)
  const vdotFull = calcVDOT(42195, 12600)
  assert.ok(Math.abs(timeFromVDOT(vdotFull, 42.195) - 12600) < 0.5)
})

test('vdotPredict: 25:00 5K → marathon between 3:55 and 4:10', () => {
  const t = vdotPredict(1500, 5, 42.195)
  assert.ok(t > 3.9 * 3600 && t < 4.2 * 3600, `got ${t}`)
})

test('vdotPredict: same distance returns exact input', () => {
  assert.strictEqual(vdotPredict(1500, 5, 5), 1500)
})

test('vdotPredict: returns null when VDOT is out of 30–85 range', () => {
  assert.strictEqual(vdotPredict(3600, 5, 10), null)
  assert.strictEqual(vdotPredict(600, 5, 10), null)
})

process.stdout.write(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
