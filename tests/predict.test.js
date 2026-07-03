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
