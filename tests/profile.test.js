const assert = require('assert')
const {
  loadSavedProfile,
  saveProfile,
  clearSavedProfile,
  calcDaysUntil,
  isEmbedMode,
} = require('../assets/js/site.js')

function createMockStorage(initial = {}) {
  const store = { ...initial }
  return {
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null },
    setItem(k, v) { store[k] = String(v) },
    removeItem(k) { delete store[k] },
    _store: store,
  }
}

// === TESTS ===
let passed = 0, failed = 0

function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); passed++ }
  catch (e) { console.error(`  ✗ ${name}: ${e.message}`); failed++ }
}

// loadSavedProfile
test('loadSavedProfile returns null when storage is null/unavailable', () => {
  assert.strictEqual(loadSavedProfile(null), null)
})

test('loadSavedProfile returns null when key is missing', () => {
  const storage = createMockStorage()
  assert.strictEqual(loadSavedProfile(storage), null)
})

test('loadSavedProfile returns null on invalid JSON', () => {
  const storage = createMockStorage({ 'ryutility-profile-v1': '{bad-json' })
  assert.strictEqual(loadSavedProfile(storage), null)
})

test('loadSavedProfile returns null when stored JSON is not an object', () => {
  const storage = createMockStorage({ 'ryutility-profile-v1': '"hello"' })
  assert.strictEqual(loadSavedProfile(storage), null)
})

// saveProfile & loadSavedProfile & clearSavedProfile
test('saveProfile saves sanitized profile and loadSavedProfile reads it back', () => {
  const storage = createMockStorage()
  const ok = saveProfile({
    dist: '10k',
    hh: 0,
    mm: 45,
    ss: 30,
    hrMax: 190,
    hrRest: 52,
    unit: 'mi',
    targetDist: 'hm',
    targetHh: 1,
    targetMm: 35,
    targetSs: 0,
    targetDate: '2026-10-18',
  }, storage)
  assert.strictEqual(ok, true)
  const loaded = loadSavedProfile(storage)
  assert.deepStrictEqual(loaded, {
    dist: '10k',
    hh: 0,
    mm: 45,
    ss: 30,
    hrMax: 190,
    hrRest: 52,
    unit: 'mi',
    targetDist: 'hm',
    targetHh: 1,
    targetMm: 35,
    targetSs: 0,
    targetDate: '2026-10-18',
  })
})

test('saveProfile applies defaults for omitted fields and rejects invalid input', () => {
  const storage = createMockStorage()
  assert.strictEqual(saveProfile(null, storage), false)
  assert.strictEqual(saveProfile({}, null), false)
  assert.strictEqual(saveProfile({}, storage), true)
  const loaded = loadSavedProfile(storage)
  assert.strictEqual(loaded.dist, '5k')
  assert.strictEqual(loaded.unit, 'km')
  assert.strictEqual(loaded.hh, '')
  assert.strictEqual(loaded.targetDate, '')
})

test('clearSavedProfile removes saved profile', () => {
  const storage = createMockStorage()
  saveProfile({ dist: '5k', mm: 22 }, storage)
  assert.notStrictEqual(loadSavedProfile(storage), null)
  clearSavedProfile(storage)
  assert.strictEqual(loadSavedProfile(storage), null)
  clearSavedProfile(null) // should not throw
})

// calcDaysUntil
test('calcDaysUntil returns 0 on D-day', () => {
  const now = new Date(Date.UTC(2026, 4, 10, 15, 30, 0))
  assert.strictEqual(calcDaysUntil('2026-05-10', now), 0)
})

test('calcDaysUntil returns positive days for future date', () => {
  const now = new Date(Date.UTC(2026, 4, 10))
  assert.strictEqual(calcDaysUntil('2026-05-17', now), 7)
})

test('calcDaysUntil returns negative days for past date', () => {
  const now = new Date(Date.UTC(2026, 4, 10))
  assert.strictEqual(calcDaysUntil('2026-05-05', now), -5)
})

test('calcDaysUntil returns null for invalid or empty date strings', () => {
  const now = new Date(Date.UTC(2026, 4, 10))
  assert.strictEqual(calcDaysUntil('', now), null)
  assert.strictEqual(calcDaysUntil(null, now), null)
  assert.strictEqual(calcDaysUntil('2026/05/10', now), null)
  assert.strictEqual(calcDaysUntil('2026-5-10', now), null)
  assert.strictEqual(calcDaysUntil('not-a-date', now), null)
})

// isEmbedMode
test('isEmbedMode("?embed=1") = true', () => {
  assert.strictEqual(isEmbedMode('?embed=1'), true)
})

test('isEmbedMode("?embed=0") = false', () => {
  assert.strictEqual(isEmbedMode('?embed=0'), false)
})

test('isEmbedMode("?foo=bar&embed=1") = true', () => {
  assert.strictEqual(isEmbedMode('?foo=bar&embed=1'), true)
})

test('isEmbedMode("") and other values = false', () => {
  assert.strictEqual(isEmbedMode(''), false)
  assert.strictEqual(isEmbedMode('?embed=true'), false)
})

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) process.exit(1)
