const assert = require('assert')
const { kmhToSecPerKm, mphToKmh, equivalentFlatKmh } = require('../assets/js/calc.js')

let passed = 0, failed = 0
function test(name, fn) {
  try { fn(); passed++; process.stdout.write(`✓ ${name}\n`) }
  catch (e) { failed++; process.stdout.write(`✗ ${name}\n  ${e.message}\n`) }
}

test('kmhToSecPerKm: 12 km/h = 5:00/km (300 s)', () => {
  assert.strictEqual(kmhToSecPerKm(12), 300)
})
test('mphToKmh: 6.2 mph ≈ 9.978 km/h', () => {
  assert.ok(Math.abs(mphToKmh(6.2) - 9.978) < 0.001)
})
test('equivalentFlatKmh: 0% grade changes nothing', () => {
  assert.strictEqual(equivalentFlatKmh(10, 0), 10)
})
test('equivalentFlatKmh: 10 km/h at 1% ≈ 10.45 km/h flat', () => {
  assert.ok(Math.abs(equivalentFlatKmh(10, 1) - 10.45) < 0.001)
})
test('equivalentFlatKmh: steeper grade → faster equivalent', () => {
  assert.ok(equivalentFlatKmh(10, 5) > equivalentFlatKmh(10, 2))
})

process.stdout.write(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
