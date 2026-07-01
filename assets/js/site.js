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

// Placeholder GA4 ID — replace after creating the real GA4 property
// (see Open Items in docs/superpowers/specs/2026-06-30-adsense-readiness-design.md).
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'

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

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle()
  initCookieConsent()
})
