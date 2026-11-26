// === THEME TOGGLE ===
function initThemeToggle() {
  const btn = document.getElementById('theme-toggle')
  const html = document.documentElement
  const apply = t => { html.setAttribute('data-theme', t); btn.textContent = t === 'dark' ? 'Light' : 'Dark' }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  apply(prefersDark ? 'dark' : 'light')
  btn.addEventListener('click', () => apply(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'))
}

// === COOKIE CONSENT ===
const CONSENT_KEY = 'ryutility-consent'

const GA_MEASUREMENT_ID = 'G-9P67N4HK4F'

function shouldShowBanner(storedValue) {
  return storedValue !== 'accepted' && storedValue !== 'declined'
}

function shouldLoadAnalytics(storedValue) {
  return storedValue === 'accepted'
}

function loadAnalytics() {
  if (window.gtagLoaded) return
  window.gtagLoaded = true
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID)
}

function initCookieConsent() {
  const banner = document.getElementById('cookie-banner')
  const acceptBtn = document.getElementById('cookie-accept')
  const declineBtn = document.getElementById('cookie-decline')
  const stored = localStorage.getItem(CONSENT_KEY)

  if (shouldLoadAnalytics(stored)) loadAnalytics()
  if (shouldShowBanner(stored)) banner.hidden = false

  acceptBtn.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    banner.hidden = true
    loadAnalytics()
  })
  declineBtn.addEventListener('click', () => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    banner.hidden = true
  })
}

// === LOCAL BASELINE PROFILE ===
const PROFILE_KEY = 'ryutility-profile-v1'

function loadSavedProfile(storage) {
  try {
    const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null)
    if (!store) return null
    const raw = store.getItem(PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function saveProfile(data, storage) {
  if (!data || typeof data !== 'object') return false
  const clean = {
    dist: data.dist || '5k',
    hh: data.hh ?? '',
    mm: data.mm ?? '',
    ss: data.ss ?? '',
    hrMax: data.hrMax ?? '',
    hrRest: data.hrRest ?? '',
    unit: data.unit || 'km',
    targetDist: data.targetDist || '',
    targetHh: data.targetHh ?? '',
    targetMm: data.targetMm ?? '',
    targetSs: data.targetSs ?? '',
    targetDate: data.targetDate || '',
  }
  try {
    const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null)
    if (!store) return false
    store.setItem(PROFILE_KEY, JSON.stringify(clean))
    return true
  } catch {
    return false
  }
}

function clearSavedProfile(storage) {
  try {
    const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null)
    if (!store) return
    store.removeItem(PROFILE_KEY)
  } catch {
    // ignore storage errors
  }
}

function calcDaysUntil(dateStr, nowDate) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  const targetUtc = Date.UTC(y, m - 1, d)
  const now = nowDate || new Date()
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.round((targetUtc - todayUtc) / 86400000)
}

// === EMBED MODE (?embed=1) ===
function isEmbedMode(searchStr) {
  const s = typeof searchStr === 'string'
    ? searchStr
    : (typeof window !== 'undefined' ? window.location.search : '')
  return new URLSearchParams(s).get('embed') === '1'
}

function initEmbedMode() {
  if (!isEmbedMode()) return
  document.body.classList.add('embed-mode')
  const credit = document.createElement('div')
  credit.className = 'embed-credit'
  credit.innerHTML = 'Powered by <a href="https://ryutility.com/" target="_blank" rel="noopener">Ryutility</a>'
  document.body.appendChild(credit)
}

// === NUMBER INPUT UX (auto-select, mobile keypad, time auto-advance) ===
function sanitizeNumericInput(raw, isDecimal, allowNegative) {
  const s = String(raw ?? '')
  if (!isDecimal) {
    return s.replace(/[^0-9]/g, '')
  }
  let out = ''
  let hasDot = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch >= '0' && ch <= '9') {
      out += ch
    } else if ((ch === '.' || ch === ',') && !hasDot) {
      out += '.'
      hasDot = true
    } else if (ch === '-' && allowNegative && out.length === 0) {
      out += '-'
    }
  }
  return out
}

function shouldAutoAdvance(value, maxDigits, selectionStart, inputType) {
  if (inputType && inputType.startsWith('delete')) return false
  if (!value || value.length < maxDigits) return false
  if (typeof selectionStart === 'number' && selectionStart < value.length) return false
  return true
}

function stepNumericValue(raw, delta, minAttr, maxAttr, stepAttr) {
  const step = parseFloat(stepAttr) || 1
  const cur = parseFloat(raw)
  const base = Number.isFinite(cur) ? cur : (Number.isFinite(parseFloat(minAttr)) ? parseFloat(minAttr) : 0)
  let next = base + delta * step
  const min = parseFloat(minAttr)
  const max = parseFloat(maxAttr)
  if (Number.isFinite(min) && next < min) next = min
  if (Number.isFinite(max) && next > max) next = max
  const decimals = (String(stepAttr || '').split('.')[1] || '').length
  return decimals > 0 ? next.toFixed(decimals) : String(Math.round(next))
}

function selectInputAll(el) {
  try {
    el.select()
    if (typeof el.setSelectionRange === 'function') {
      el.setSelectionRange(0, el.value.length)
    }
  } catch {
    // ignore selection errors
  }
}

function initNumberInputs() {
  const inputs = Array.from(document.querySelectorAll('input[type="number"]'))
  if (!inputs.length) return

  inputs.forEach(el => {
    const stepAttr = el.getAttribute('step') || ''
    const minAttr = el.getAttribute('min')
    const maxAttr = el.getAttribute('max')
    const isDecimal = stepAttr.includes('.')
    const allowNegative = minAttr === null || parseFloat(minAttr) < 0

    el.setAttribute('data-num-input', isDecimal ? 'decimal' : 'numeric')
    el.setAttribute('inputmode', isDecimal ? 'decimal' : 'numeric')
    if (!isDecimal && !allowNegative) {
      el.setAttribute('pattern', '[0-9]*')
    }
    try {
      el.type = 'text'
    } catch {
      // fallback: keep type="number"
    }

    let justFocused = false
    el.addEventListener('focus', () => {
      justFocused = true
      selectInputAll(el)
      setTimeout(() => {
        if (document.activeElement === el) selectInputAll(el)
      }, 0)
    })
    el.addEventListener('mouseup', e => {
      if (justFocused) {
        e.preventDefault()
        justFocused = false
      }
    })
    el.addEventListener('blur', () => {
      justFocused = false
    })

    el.addEventListener('input', () => {
      const cleaned = sanitizeNumericInput(el.value, isDecimal, allowNegative)
      if (cleaned !== el.value) {
        el.value = cleaned
      }
    })

    el.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        const delta = e.key === 'ArrowUp' ? 1 : -1
        el.value = stepNumericValue(el.value, delta, minAttr, maxAttr, stepAttr)
        el.dispatchEvent(new Event('input', { bubbles: true }))
        selectInputAll(el)
      }
    })
  })

  // Auto-advance & Backspace navigation inside .time-inputs / .pace-inputs
  document.querySelectorAll('.time-inputs, .pace-inputs').forEach(group => {
    const fields = Array.from(group.querySelectorAll('input[data-num-input]'))
    fields.forEach((el, idx) => {
      const maxAttr = el.getAttribute('max')
      const maxDigits = maxAttr === '9' ? 1 : 2

      el.addEventListener('input', e => {
        if (!shouldAutoAdvance(el.value, maxDigits, el.selectionStart, e.inputType)) return
        for (let j = idx + 1; j < fields.length; j++) {
          if (fields[j].offsetParent !== null) {
            fields[j].focus()
            break
          }
        }
      })

      el.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && el.value === '') {
          for (let j = idx - 1; j >= 0; j--) {
            if (fields[j].offsetParent !== null) {
              e.preventDefault()
              fields[j].focus()
              break
            }
          }
        }
      })
    })
  })
}

if (typeof window !== 'undefined') {
  window.ryProfile = { loadSavedProfile, saveProfile, clearSavedProfile, calcDaysUntil }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle()
    initCookieConsent()
    initEmbedMode()
    initNumberInputs()
  })
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    shouldShowBanner,
    shouldLoadAnalytics,
    loadSavedProfile,
    saveProfile,
    clearSavedProfile,
    calcDaysUntil,
    isEmbedMode,
    sanitizeNumericInput,
    shouldAutoAdvance,
    stepNumericValue,
  }
}
