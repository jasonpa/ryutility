const assert = require('assert')

// === FUNCTIONS UNDER TEST (copied from assets/js/site.js after implementation) ===

function shouldShowBanner(storedValue) {
  return storedValue !== 'accepted' && storedValue !== 'declined'
}

function shouldLoadAnalytics(storedValue) {
  return storedValue === 'accepted'
}

// === TESTS ===
let passed = 0, failed = 0

function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); passed++ }
  catch(e) { console.error(`  ✗ ${name}: ${e.message}`); failed++ }
}

test('shouldShowBanner(null) = true', () => assert.strictEqual(shouldShowBanner(null), true))
test('shouldShowBanner(undefined) = true', () => assert.strictEqual(shouldShowBanner(undefined), true))
test('shouldShowBanner("accepted") = false', () => assert.strictEqual(shouldShowBanner('accepted'), false))
test('shouldShowBanner("declined") = false', () => assert.strictEqual(shouldShowBanner('declined'), false))
test('shouldLoadAnalytics("accepted") = true', () => assert.strictEqual(shouldLoadAnalytics('accepted'), true))
test('shouldLoadAnalytics("declined") = false', () => assert.strictEqual(shouldLoadAnalytics('declined'), false))
test('shouldLoadAnalytics(null) = false', () => assert.strictEqual(shouldLoadAnalytics(null), false))

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
