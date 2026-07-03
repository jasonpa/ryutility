const assert = require('assert')
const {
  paceFromTimeDistance, timeFromPaceDistance, distanceFromTimePace, secToHms,
} = require('../assets/js/calc.js')

let passed = 0, failed = 0
function test(name, fn) {
  try { fn(); passed++; process.stdout.write(`✓ ${name}\n`) }
  catch (e) { failed++; process.stdout.write(`✗ ${name}\n  ${e.message}\n`) }
}

test('paceFromTimeDistance: 50:00 over 10 km = 5:00/km', () => {
  assert.strictEqual(paceFromTimeDistance(3000, 10), 300)
})
test('timeFromPaceDistance: 5:00/km over 10 km = 50:00', () => {
  assert.strictEqual(timeFromPaceDistance(300, 10), 3000)
})
test('distanceFromTimePace: 50:00 at 5:00/km = 10 km', () => {
  assert.strictEqual(distanceFromTimePace(3000, 300), 10)
})
test('secToHms formats hours', () => {
  assert.strictEqual(secToHms(3725), '1:02:05')
})
test('secToHms omits hours when zero', () => {
  assert.strictEqual(secToHms(300), '5:00')
})
test('secToHms rounds fractional seconds', () => {
  assert.strictEqual(secToHms(299.6), '5:00')
})

process.stdout.write(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
