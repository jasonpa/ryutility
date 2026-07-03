const assert = require('assert')
const { splitPlan } = require('../assets/js/calc.js')

let passed = 0, failed = 0
function test(name, fn) {
  try { fn(); passed++; process.stdout.write(`✓ ${name}\n`) }
  catch (e) { failed++; process.stdout.write(`✗ ${name}\n  ${e.message}\n`) }
}

test('even splits: 50:00 10K in 1 km splits → ten 300 s rows', () => {
  const plan = splitPlan(3000, 10, 1, 0)
  assert.strictEqual(plan.length, 10)
  plan.forEach(row => assert.ok(Math.abs(row.splitSec - 300) < 0.001, `split was ${row.splitSec}`))
  assert.ok(Math.abs(plan[9].cumSec - 3000) < 0.001)
  assert.strictEqual(plan[9].dist, 10)
})
test('negative splits: first slower than last, total preserved', () => {
  const plan = splitPlan(3000, 10, 1, 6)
  assert.ok(plan[0].splitSec > plan[9].splitSec, 'first split should be slower')
  assert.ok(Math.abs(plan[9].cumSec - 3000) < 0.001, 'total must equal goal time')
})
test('partial final split: marathon with 5 km splits', () => {
  const plan = splitPlan(14400, 42.195, 5, 0)
  assert.strictEqual(plan.length, 9)
  assert.ok(Math.abs(plan[8].dist - 42.195) < 0.001)
  assert.ok(plan[8].splitSec < plan[0].splitSec, 'final partial split takes less time')
  assert.ok(Math.abs(plan[8].cumSec - 14400) < 0.001)
})
test('split numbering is 1-based and cumulative distance grows', () => {
  const plan = splitPlan(3000, 10, 1, 0)
  assert.strictEqual(plan[0].n, 1)
  assert.strictEqual(plan[0].dist, 1)
  assert.strictEqual(plan[4].dist, 5)
})

process.stdout.write(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
