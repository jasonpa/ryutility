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
  const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null)
  if (!store) return null
  try {
    const raw = store.getItem(PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function saveProfile(data, storage) {
  const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null)
  if (!store || !data || typeof data !== 'object') return false
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
  store.setItem(PROFILE_KEY, JSON.stringify(clean))
  return true
}

function clearSavedProfile(storage) {
  const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null)
  if (!store) return
  store.removeItem(PROFILE_KEY)
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

if (typeof window !== 'undefined') {
  window.ryProfile = { loadSavedProfile, saveProfile, clearSavedProfile, calcDaysUntil }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle()
    initCookieConsent()
    initEmbedMode()
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
  }
}
