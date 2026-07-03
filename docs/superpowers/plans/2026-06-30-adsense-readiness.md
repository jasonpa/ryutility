# AdSense Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare ryutility.com to pass Google AdSense review by migrating the site to Jekyll (for shared layout/nav), adding required legal/trust pages, GA4 analytics with cookie consent, SEO/crawlability basics, and deeper content on the existing running pace calculator — without adding any new tools.

**Architecture:** GitHub Pages natively builds Jekyll with no CI step. Shared chrome (header, footer, cookie banner, `<head>` meta) lives in `_layouts/default.html` and `_includes/*.html`; shared CSS/JS lives in `assets/css/site.css` and `assets/js/site.js`. Each page keeps its own front matter (title, description, permalink) and any tool-specific CSS/JS stays inline in that page, matching the existing single-file-per-tool pattern.

**Tech Stack:** Jekyll (via the `github-pages` gem, Ruby 3.3.5 confirmed installed locally at `/Users/jmryu/.rbenv/shims/ruby`), `jekyll-sitemap` plugin, vanilla JS (no framework), Node's built-in `assert` for tests (matches existing `tests/calc.test.js` convention — no test framework/package.json in this repo).

## Global Constraints

- No new tools are added in this phase — scope is limited to infrastructure, legal pages, and content depth on the existing running pace calculator. (spec: Scope)
- Brand-only identity in all public-facing copy (About/Privacy/Contact) — no personal name disclosed. (spec: Legal & Trust Pages)
- Contact email is `contact@ryutility.com`. Domain email forwarding to `[personal inbox]` is a manual step in the domain registrar, outside this plan's scope — noted as an Open Item. (spec: Open Items)
- GA4 script must only load after the user accepts the cookie banner (or has previously accepted); declining or no choice yet must not load GA4. (spec: Analytics & Consent)
- `ads.txt` is committed now as a placeholder; the real publisher line is added after AdSense approval (future work, not part of this plan). (spec: SEO & Crawlability, Open Items)
- Follow the existing test convention: plain Node scripts using `assert` and a local `test(name, fn)` harness, run directly with `node tests/<file>.test.js` — no test framework or `package.json` is introduced.

---

### Task 1: Jekyll scaffolding

**Files:**
- Create: `Gemfile`
- Create: `_config.yml`
- Modify: `.gitignore`
- Create: `robots.txt`
- Create: `ads.txt`

**Interfaces:**
- Produces: a working `bundle exec jekyll build` command that later tasks rely on to verify their output lands in `_site/`.

- [ ] **Step 1: Create the Gemfile**

```ruby
source "https://rubygems.org"

gem "github-pages", group: :jekyll_plugins
gem "webrick"
```

- [ ] **Step 2: Create `_config.yml`**

```yaml
title: Ryutility
description: A collection of free, no-nonsense web tools.
url: "https://ryutility.com"
plugins:
  - jekyll-sitemap
exclude:
  - Gemfile
  - Gemfile.lock
  - docs
  - tests
  - .superpowers
  - .playwright-mcp
  - "*.png"
  - README.md
```

- [ ] **Step 3: Add Jekyll build artifacts to `.gitignore`**

Append to the existing `.gitignore` (do not remove existing entries):

```
# Jekyll
_site/
.jekyll-cache/
.jekyll-metadata
.bundle/
vendor/
```

- [ ] **Step 4: Create `robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://ryutility.com/sitemap.xml
```

- [ ] **Step 5: Create `ads.txt`**

```
# Placeholder ads.txt — replace this line with the real publisher line
# issued by Google AdSense once the account is approved.
# Example format: google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
```

- [ ] **Step 6: Install gems and verify a clean build**

Run: `bundle install`
Expected: completes without errors (first run may take a few minutes).

Run: `bundle exec jekyll build`
Expected: `Configuration file: _config.yml` ... `done in X.XXX seconds.` with no errors. A `_site/` directory is created containing `index.html`, `run/index.html`, `robots.txt`, `ads.txt`, and `sitemap.xml`.

Run: `ls _site/`
Expected: includes `index.html`, `run`, `robots.txt`, `ads.txt`, `sitemap.xml`.

- [ ] **Step 7: Commit**

```bash
git add Gemfile Gemfile.lock _config.yml .gitignore robots.txt ads.txt
git commit -m "chore: scaffold Jekyll for shared layout support"
```

---

### Task 2: Shared CSS and favicon

**Files:**
- Create: `assets/css/site.css`
- Create: `assets/favicon.svg`

**Interfaces:**
- Consumes: CSS custom properties pattern (`--bg`, `--surface`, `--border`, `--text-primary`, `--text-secondary`, `--accent`) already used in `index.html` and `run/index.html`.
- Produces: `.site-title`, `.site-nav`, `#theme-toggle`, `.site-footer`, `.cookie-banner`, `.cookie-actions`, `#cookie-accept`, `#cookie-decline`, `.skip-link`, `.content-page` classes/ids that Tasks 3, 4, 5, 6, 8 rely on.

- [ ] **Step 1: Create `assets/css/site.css`**

```css
/* THEME VARIABLES */
:root {
  --bg: #f0f0f0; --surface: #ffffff; --border: #e0e0e0;
  --text-primary: #111111; --text-secondary: #666666;
  --accent: #2563eb;
}
[data-theme="dark"] {
  --bg: #111111; --surface: #1e1e1e; --border: #333333;
  --text-primary: #f0f0f0; --text-secondary: #999999;
  --accent: #60a5fa;
}

/* RESET + BASE */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { overflow-x: hidden; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px; background: var(--bg); color: var(--text-primary);
  min-height: 100vh; overflow-x: hidden;
}
input, select, button { font: inherit; }
a { color: inherit; }

/* HEADER */
header {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.site-title {
  font-size: 18px; font-weight: 700; letter-spacing: -0.5px;
  flex: 1; text-decoration: none; color: var(--text-primary);
}
.site-nav { display: flex; gap: 12px; }
.site-nav a { font-size: 13px; text-decoration: none; color: var(--text-secondary); }
.site-nav a:hover { color: var(--accent); }
#theme-toggle {
  background: none; border: 1px solid var(--border); border-radius: 6px;
  padding: 4px 10px; cursor: pointer; color: var(--text-primary);
  font-size: 13px; font-family: inherit;
}

/* FOOTER */
.site-footer {
  display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px;
  padding: 20px 16px; border-top: 1px solid var(--border);
  background: var(--surface); font-size: 12px; color: var(--text-secondary);
}
.site-footer a { text-decoration: none; color: var(--text-secondary); }
.site-footer a:hover { color: var(--accent); }
.site-footer .footer-copyright { margin-left: auto; }

/* COOKIE BANNER */
.cookie-banner {
  position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 200;
  max-width: 480px; margin: 0 auto;
  background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
  padding: 14px 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
.cookie-banner p { font-size: 12px; color: var(--text-secondary); margin-bottom: 10px; }
.cookie-banner a { color: var(--accent); }
.cookie-actions { display: flex; gap: 8px; }
.cookie-actions button {
  flex: 1; padding: 8px 12px; border-radius: 6px; font-size: 13px;
  cursor: pointer; border: 1px solid var(--border); background: var(--bg); color: var(--text-primary);
}
#cookie-accept { background: var(--accent); border-color: var(--accent); color: #fff; }

/* FOCUS */
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
input:focus-visible, select:focus-visible {
  border-color: var(--accent); outline: none;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 25%, transparent);
}

/* SKIP LINK */
.skip-link {
  position: absolute; top: -40px; left: 0;
  background: var(--accent); color: #fff; padding: 6px 12px;
  border-radius: 0 0 6px 0; z-index: 100; font-size: 13px;
  text-decoration: none;
}
.skip-link:focus { top: 0; }

/* CONTENT PAGES (about/privacy/terms/contact) */
.content-page {
  max-width: 720px; margin: 40px auto; padding: 0 16px 60px;
}
.content-page h1 { font-size: 22px; margin-bottom: 16px; }
.content-page h2 { font-size: 16px; font-weight: 700; margin: 24px 0 8px; }
.content-page h2:first-of-type { margin-top: 0; }
.content-page p { font-size: 13px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 10px; }
.content-page ul { padding-left: 18px; margin-bottom: 10px; }
.content-page li { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 6px; }
.content-page a { color: var(--accent); }
.contact-email { font-size: 16px; font-weight: 600; }
```

- [ ] **Step 2: Create `assets/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#2563eb"/>
  <text x="16" y="22" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#ffffff" text-anchor="middle">R</text>
</svg>
```

- [ ] **Step 3: Build and verify assets are copied**

Run: `bundle exec jekyll build`
Expected: succeeds with no errors.

Run: `test -f _site/assets/css/site.css && test -f _site/assets/favicon.svg && echo OK`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add assets/css/site.css assets/favicon.svg
git commit -m "feat: add shared site stylesheet and favicon"
```

---

### Task 3: Shared layout and includes

**Files:**
- Create: `_includes/head-meta.html`
- Create: `_includes/header.html`
- Create: `_includes/footer.html`
- Create: `_includes/cookie-banner.html`
- Create: `_layouts/default.html`

**Interfaces:**
- Consumes: `.site-title`, `.site-nav`, `#theme-toggle`, `.site-footer`, `.cookie-banner`, `#cookie-accept`, `#cookie-decline` CSS classes/ids from Task 2's `assets/css/site.css`.
- Produces: the `default` layout name that Tasks 5, 6, 8 reference via `layout: default` front matter, and the `#theme-toggle`, `#cookie-accept`, `#cookie-decline`, `#cookie-banner` DOM ids that Task 4's `assets/js/site.js` wires up.

- [ ] **Step 1: Create `_includes/head-meta.html`**

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{ page.title | default: site.title }}</title>
<meta name="description" content="{{ page.description | default: site.description }}">
<link rel="canonical" href="{{ page.url | absolute_url }}">
<link rel="icon" type="image/svg+xml" href="{{ '/assets/favicon.svg' | relative_url }}">
<meta property="og:type" content="website">
<meta property="og:title" content="{{ page.title | default: site.title }}">
<meta property="og:description" content="{{ page.description | default: site.description }}">
<meta property="og:url" content="{{ page.url | absolute_url }}">
```

- [ ] **Step 2: Create `_includes/header.html`**

```html
<header>
  <a href="{{ '/' | relative_url }}" class="site-title">Ryutility</a>
  <nav class="site-nav" aria-label="Primary">
    <a href="{{ '/about/' | relative_url }}">About</a>
  </nav>
  <button id="theme-toggle" aria-label="Toggle dark mode">Dark</button>
</header>
```

- [ ] **Step 3: Create `_includes/footer.html`**

```html
<footer class="site-footer">
  <a href="{{ '/about/' | relative_url }}">About</a>
  <a href="{{ '/privacy/' | relative_url }}">Privacy</a>
  <a href="{{ '/terms/' | relative_url }}">Terms</a>
  <a href="{{ '/contact/' | relative_url }}">Contact</a>
  <span class="footer-copyright">&copy; {{ site.time | date: '%Y' }} Ryutility</span>
</footer>
```

- [ ] **Step 4: Create `_includes/cookie-banner.html`**

```html
<div id="cookie-banner" class="cookie-banner" hidden>
  <p>We use cookies for basic analytics to understand how visitors use these tools. See our <a href="{{ '/privacy/' | relative_url }}">Privacy Policy</a>.</p>
  <div class="cookie-actions">
    <button id="cookie-decline" type="button">Decline</button>
    <button id="cookie-accept" type="button">Accept</button>
  </div>
</div>
```

- [ ] **Step 5: Create `_layouts/default.html`**

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  {% include head-meta.html %}
  <link rel="stylesheet" href="{{ '/assets/css/site.css' | relative_url }}">
</head>
<body>
  {% include header.html %}
  {{ content }}
  {% include footer.html %}
  {% include cookie-banner.html %}
  <script src="{{ '/assets/js/site.js' | relative_url }}"></script>
</body>
</html>
```

- [ ] **Step 6: Build and verify (expected to still show the pre-migration pages, since Tasks 5–6 haven't converted them yet — this step only confirms the layout/includes themselves compile without Liquid errors)**

Run: `bundle exec jekyll build`
Expected: succeeds with no Liquid syntax errors. (No page uses `layout: default` yet, so `_site/index.html` and `_site/run/index.html` are still the old static output at this point — that's expected and fixed in Tasks 5–6.)

- [ ] **Step 7: Commit**

```bash
git add _includes _layouts
git commit -m "feat: add shared Jekyll layout, header, footer, cookie banner includes"
```

---

### Task 4: Site-wide JS — theme toggle, cookie consent, GA4 loader

**Files:**
- Create: `assets/js/site.js`
- Create: `tests/consent.test.js`

**Interfaces:**
- Consumes: `#theme-toggle`, `#cookie-banner`, `#cookie-accept`, `#cookie-decline` DOM ids from Task 3's includes.
- Produces: `shouldShowBanner(storedValue)` and `shouldLoadAnalytics(storedValue)` pure functions (return `boolean`), referenced only within this task and its test file — no other task calls them directly.

- [ ] **Step 1: Write the failing test**

Create `tests/consent.test.js`:

```js
const assert = require('assert')

// === FUNCTIONS UNDER TEST (copied from assets/js/site.js after implementation) ===

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/consent.test.js`
Expected: every test prints `✗ ... shouldShowBanner is not defined` (or `shouldLoadAnalytics is not defined`), followed by `0 passed, 7 failed`, and the process exits with code 1.

- [ ] **Step 3: Add the pure function implementations to the test file**

Edit `tests/consent.test.js`, replacing the `// === FUNCTIONS UNDER TEST ===` comment block with:

```js
// === FUNCTIONS UNDER TEST (copied from assets/js/site.js after implementation) ===

function shouldShowBanner(storedValue) {
  return storedValue !== 'accepted' && storedValue !== 'declined'
}

function shouldLoadAnalytics(storedValue) {
  return storedValue === 'accepted'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/consent.test.js`
Expected: `7 passed, 0 failed`, exit code 0.

- [ ] **Step 5: Commit the test**

```bash
git add tests/consent.test.js
git commit -m "test: add cookie consent decision logic tests"
```

- [ ] **Step 6: Create `assets/js/site.js` with the matching implementation, wired to the DOM**

```js
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
```

- [ ] **Step 7: Build and verify the asset is copied**

Run: `bundle exec jekyll build`
Expected: succeeds with no errors.

Run: `test -f _site/assets/js/site.js && echo OK`
Expected: `OK`

- [ ] **Step 8: Commit**

```bash
git add assets/js/site.js
git commit -m "feat: add theme toggle, cookie consent, and GA4 loader"
```

---

### Task 5: Migrate the landing page to Jekyll

**Files:**
- Modify: `index.html` (full rewrite)

**Interfaces:**
- Consumes: `layout: default` (Task 3), `.site-title`/`.site-nav`/`#theme-toggle` styling and `assets/js/site.js` behavior (Tasks 2 and 4) via the layout — this page no longer needs its own `<header>`, theme-toggle script, or CSS variables/reset.
- Produces: the `/run/` link that Task 6's page must resolve to (`{{ '/run/' | relative_url }}` → `/run/`).

- [ ] **Step 1: Replace `index.html` in full**

```html
---
layout: default
title: Ryutility — Useful Tools
description: A collection of free, no-nonsense web tools — starting with a running training zone calculator.
permalink: /
---
<style>
  main { max-width: 600px; margin: 40px auto; padding: 0 16px; }
  main h1 { font-size: 22px; margin-bottom: 6px; }
  .tagline { font-size: 14px; color: var(--text-secondary); margin-bottom: 32px; }
  .tool-grid { display: grid; gap: 12px; }
  .tool-card {
    display: block; background: var(--surface);
    border: 1px solid var(--border); border-radius: 10px;
    padding: 16px 20px; text-decoration: none; color: inherit;
    transition: border-color 0.15s;
  }
  .tool-card:hover { border-color: var(--accent); }
  .tool-card h2 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
  .tool-card p { font-size: 13px; color: var(--text-secondary); }
  .tool-badge {
    display: inline-block; font-size: 11px; font-weight: 600;
    color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent);
    border-radius: 4px; padding: 2px 6px; margin-bottom: 8px;
  }
</style>
<main>
  <h1>Useful, free web tools</h1>
  <p class="tagline">A small, growing collection of tools with no sign-up and no clutter.</p>
  <div class="tool-grid">
    <a href="{{ '/run/' | relative_url }}" class="tool-card">
      <span class="tool-badge">Running</span>
      <h2>Training Zone Calculator</h2>
      <p>Calculate your personalized training zones from a recent race time using Daniels' VDOT method.</p>
    </a>
  </div>
</main>
```

- [ ] **Step 2: Build and verify**

Run: `bundle exec jekyll build`
Expected: succeeds with no errors.

Run: `grep -o 'href="/run/"' _site/index.html`
Expected: `href="/run/"`

Run: `grep -c 'class="site-title"' _site/index.html`
Expected: `1` (confirms the shared header rendered via the layout)

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "refactor: migrate landing page to Jekyll layout"
```

---

### Task 6: Migrate the running pace calculator to Jekyll

**Files:**
- Modify: `run/index.html` (full rewrite — same calculation logic and markup, header/theme-toggle/shared CSS removed since the layout now provides them)

**Interfaces:**
- Consumes: `layout: default` (Task 3), shared CSS/JS from Tasks 2 and 4.
- Produces: `#calc-form`, `#zone-cards` structure unchanged from before migration — `tests/calc.test.js` continues to test copies of the same pure functions and is unaffected by this task. Task 7 appends content directly after this file's `</main>` closing tag.

- [ ] **Step 1: Replace `run/index.html` in full**

```html
---
layout: default
title: RunPace — Training Zone Calculator
description: Calculate your personalized running training zones from a recent race time using Daniels' VDOT method.
permalink: /run/
---
<style>
  /* TOOL-SPECIFIC STYLES (theme vars, reset, header, focus, skip-link live in assets/css/site.css) */

  /* TOOL HEADING */
  .tool-heading { padding: 16px 16px 0; }
  .tool-heading h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }
  .tool-heading p { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

  /* LAYOUT */
  main {
    display: flex; flex-direction: column; gap: 0;
    max-width: 1200px; margin: 0 auto;
  }
  @media (min-width: 768px) {
    main { flex-direction: row; align-items: flex-start; }
  }

  /* INPUT PANEL */
  .input-panel {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 16px;
  }
  @media (min-width: 768px) {
    .input-panel {
      width: 280px; flex-shrink: 0;
      border-bottom: none; border-right: 1px solid var(--border);
      min-height: calc(100vh - 49px); position: sticky; top: 0;
    }
  }

  /* FORM FIELDS */
  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 11px; font-weight: 600;
    color: var(--text-secondary); text-transform: uppercase;
    letter-spacing: 0.5px; margin-bottom: 4px; }
  .pace-inputs { display: flex; align-items: center; gap: 6px; }
  .pace-inputs input {
    width: 52px; padding: 6px 8px; border: 1px solid var(--border);
    border-radius: 6px; background: var(--bg); color: var(--text-primary);
    text-align: center; font-size: 16px;
  }
  .pace-inputs span { color: var(--text-secondary); }
  input[type="number"] {
    width: 80px; padding: 6px 8px; border: 1px solid var(--border);
    border-radius: 6px; background: var(--bg); color: var(--text-primary);
    font-size: 16px;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type="number"] { -moz-appearance: textfield; }
  select {
    width: 100%; padding: 6px 8px; border: 1px solid var(--border);
    border-radius: 6px; background: var(--bg); color: var(--text-primary);
    font-size: 16px;
  }
  fieldset { border: none; }
  legend { font-size: 11px; font-weight: 600; color: var(--text-secondary);
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .radio-group { display: flex; gap: 6px; flex-wrap: wrap; }
  .radio-group label {
    display: flex; align-items: center; gap: 4px;
    font-size: 13px; font-weight: 400; color: var(--text-primary);
    text-transform: none; letter-spacing: normal;
    padding: 4px 10px; border: 1px solid var(--border); border-radius: 20px;
    cursor: pointer;
  }
  .radio-group input[type="radio"] { display: none; }
  .radio-group input[type="radio"]:checked + span {
    font-weight: 600; color: var(--accent);
  }
  .radio-group label:has(input:checked) {
    border-color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent);
  }

  /* OUTPUT PANEL */
  .output-panel { flex: 1; padding: 16px; }

  /* SUMMARY CARDS */
  .summary-cards {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 8px; margin-bottom: 16px;
  }
  @media (min-width: 768px) {
    .summary-cards { grid-template-columns: repeat(4, 1fr); }
  }
  .summary-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 12px;
  }
  .summary-card .zone-label {
    font-size: 11px; font-weight: 600; color: var(--text-secondary);
    text-transform: uppercase; letter-spacing: 0.5px; display: block;
  }
  .summary-card .pace-range {
    font-size: clamp(13px, 3.5vw, 18px); font-weight: 700; display: block; margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* ZONE CARDS */
  .zone-cards { display: grid; gap: 8px; }
  @media (min-width: 900px) {
    .zone-cards { grid-template-columns: 1fr 1fr; }
  }
  .zone-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 8px; padding: 12px 14px;
    border-left: 3px solid var(--zone-color, var(--border));
    min-width: 0; overflow: hidden;
  }
  .zone-card[data-zone="jog"]       { --zone-color: #22c55e; }
  .zone-card[data-zone="zone2"]     { --zone-color: #06b6d4; }
  .zone-card[data-zone="tempo"]     { --zone-color: #f59e0b; }
  .zone-card[data-zone="threshold"] { --zone-color: #ef4444; }
  .zone-card[data-zone="vo2max"]    { --zone-color: #8b5cf6; }

  .zone-header { display: flex; justify-content: space-between;
    align-items: baseline; margin-bottom: 6px; }
  .zone-header h2 { font-size: 13px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; }
  .hr-pct { font-size: 11px; color: var(--text-secondary); }

  .pace-km  { font-size: 20px; font-weight: 700; }
  .pace-mi  { font-size: 14px; color: var(--text-secondary); margin-top: 1px; }
  .zone-meta {
    display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;
    font-size: 12px; color: var(--text-secondary);
  }
  .zone-meta span { word-break: break-word; min-width: 0; }

  /* EMPTY STATE */
  .empty-state {
    text-align: center; padding: 40px 20px;
    color: var(--text-secondary); font-size: 14px;
  }

  /* SECTION HEADERS inside input panel */
  .section-header {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: var(--accent); margin-bottom: 8px; margin-top: 4px;
  }
  .section-divider {
    border: none; border-top: 1px solid var(--border); margin: 12px 0;
  }

  /* INLINE WARNING */
  .input-warning {
    font-size: 11px; color: #ef4444; margin-top: 4px; display: none;
  }
  .input-warning.visible { display: block; }

  /* TARGET COMPARE ROW */
  .compare-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; color: var(--text-secondary);
    margin-right: 6px; vertical-align: middle;
  }
  .pace-target {
    font-size: 14px; color: var(--text-secondary); margin-top: 2px;
    display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap;
  }
  .pace-target span { vertical-align: middle; }
  .delta { font-size: 12px; font-weight: 600; }
  .delta-faster { color: #22c55e; }
  .delta-slower { color: #f59e0b; }
</style>
<a href="#zone-cards" class="skip-link">Skip to results</a>
<div class="tool-heading">
  <h1>RunPace</h1>
  <p>Training zone calculator</p>
</div>

<main>
  <aside class="input-panel" aria-label="Calculator inputs">
    <form id="calc-form" autocomplete="off" novalidate>

<p class="section-header">Current Fitness</p>

<div class="field">
  <fieldset>
    <legend>Recent TT Distance</legend>
    <div class="radio-group">
      <label><input type="radio" name="cur-dist" value="5k" checked><span>5K</span></label>
      <label><input type="radio" name="cur-dist" value="10k"><span>10K</span></label>
    </div>
  </fieldset>
</div>

<div class="field">
  <label>Recent TT Time</label>
  <div class="pace-inputs">
    <input type="number" id="cur-mm" min="0" max="99" placeholder="25" aria-label="Minutes">
    <span>:</span>
    <input type="number" id="cur-ss" min="0" max="59" placeholder="00" aria-label="Seconds">
    <span>mm:ss</span>
  </div>
  <div id="cur-warning" class="input-warning">Time out of range (VDOT 30–85)</div>
</div>

<hr class="section-divider">
<p class="section-header">Target Race <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></p>

<div class="field">
  <fieldset>
    <legend>Race Distance</legend>
    <div class="radio-group">
      <label><input type="radio" name="tgt-dist" value="5k" checked><span>5K</span></label>
      <label><input type="radio" name="tgt-dist" value="10k"><span>10K</span></label>
      <label><input type="radio" name="tgt-dist" value="half"><span>Half</span></label>
      <label><input type="radio" name="tgt-dist" value="full"><span>Full</span></label>
    </div>
  </fieldset>
</div>

<div class="field">
  <label>Goal Time</label>
  <div class="pace-inputs" id="tgt-time-inputs">
    <span id="tgt-hh-wrap" style="display:none;align-items:center;gap:6px">
      <input type="number" id="tgt-hh" min="0" max="9" placeholder="1" aria-label="Hours" style="width:52px">
      <span>:</span>
    </span>
    <input type="number" id="tgt-mm" min="0" max="59" placeholder="22" aria-label="Minutes">
    <span>:</span>
    <input type="number" id="tgt-ss" min="0" max="59" placeholder="00" aria-label="Seconds">
    <span id="tgt-time-label">mm:ss</span>
  </div>
  <div id="tgt-warning" class="input-warning">Time out of range (VDOT 30–85)</div>
</div>

<hr class="section-divider">

<div class="field">
  <label for="hr-max">Max HR <span style="font-weight:400">(bpm)</span></label>
  <input type="number" id="hr-max" min="100" max="250" placeholder="185">
</div>

<div class="field">
  <label for="hr-rest">Resting HR <span style="font-weight:400">(bpm)</span></label>
  <input type="number" id="hr-rest" min="30" max="120" placeholder="50">
</div>

<div class="field">
  <fieldset>
    <legend>Lap Distance</legend>
    <div class="radio-group">
      <label><input type="radio" name="lap-dist" value="100"><span>100m</span></label>
      <label><input type="radio" name="lap-dist" value="200"><span>200m</span></label>
      <label><input type="radio" name="lap-dist" value="400" checked><span>400m</span></label>
      <label><input type="radio" name="lap-dist" value="800"><span>800m</span></label>
    </div>
  </fieldset>
</div>

<div class="field">
  <fieldset>
    <legend>Display Unit</legend>
    <div class="radio-group">
      <label><input type="radio" name="disp-unit" value="km" checked><span>km</span></label>
      <label><input type="radio" name="disp-unit" value="mile"><span>mile</span></label>
      <label><input type="radio" name="disp-unit" value="both"><span>both</span></label>
    </div>
  </fieldset>
</div>

    </form>
  </aside>

  <section class="output-panel" aria-label="Training zones" aria-live="polite">

    <div class="summary-cards">
      <article class="summary-card" id="sum-zone2">
        <span class="zone-label">Zone 2</span>
        <span class="pace-range">–</span>
      </article>
      <article class="summary-card" id="sum-tempo">
        <span class="zone-label">Tempo</span>
        <span class="pace-range">–</span>
      </article>
      <article class="summary-card" id="sum-threshold">
        <span class="zone-label">Threshold</span>
        <span class="pace-range">–</span>
      </article>
      <article class="summary-card" id="sum-vo2max">
        <span class="zone-label">VO2max</span>
        <span class="pace-range">–</span>
      </article>
    </div>

    <div class="zone-cards" id="zone-cards">
      <div class="empty-state">Enter a reference pace above to see training zones.</div>
    </div>

  </section>
</main>

<script>
// === CONVERSION ===
function paceToSec(min, sec) {
  return min * 60 + sec
}

function secToPace(totalSec) {
  const s = Math.round(totalSec)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

function kmToMile(secPerKm) {
  return secPerKm * 1.60934
}

function lapSplit(secPerKm, distM) {
  const sec = secPerKm * (distM / 1000)
  return { display: secToPace(sec), totalSec: Math.round(sec) }
}

function toKmh(secPerKm) {
  return 3600 / secPerKm
}

function toMph(secPerKm) {
  return toKmh(secPerKm) / 1.60934
}

// === ZONE TABLES ===
const MULTIPLIERS = {
  threshold: {
    jog:       [1.25, 1.35],
    zone2:     [1.15, 1.25],
    tempo:     [1.05, 1.10],
    threshold: [1.00, 1.00],
    vo2max:    [0.90, 0.95],
  },
  tempo: {
    jog:       [1.20, 1.30],
    zone2:     [1.10, 1.20],
    tempo:     [1.00, 1.00],
    threshold: [0.95, 0.97],
    vo2max:    [0.88, 0.92],
  },
  '10k': {
    jog:       [1.30, 1.40],
    zone2:     [1.20, 1.30],
    tempo:     [1.08, 1.12],
    threshold: [1.03, 1.06],
    vo2max:    [1.00, 1.00],
  },
}

const HR_PCTS = {
  jog:       [0.50, 0.60],
  zone2:     [0.60, 0.70],
  tempo:     [0.75, 0.85],
  threshold: [0.83, 0.90],
  vo2max:    [0.90, 1.00],
}

const ZONE_LABELS = {
  jog: 'Jog / Easy', zone2: 'Zone 2', tempo: 'Tempo',
  threshold: 'Threshold', vo2max: 'VO2max',
}

// === CALCULATION ===
function calcKarvonen(hrMax, hrRest, pctLow, pctHigh) {
  const hrr = hrMax - hrRest
  return {
    low:  Math.round(hrRest + hrr * pctLow),
    high: Math.round(hrRest + hrr * pctHigh),
  }
}

// === VDOT MATH (Daniels' Running Formula) ===
const DIST_KM = { '5k': 5.0, '10k': 10.0, half: 21.0975, full: 42.195 }

function calcVDOT(distM, timeSec) {
  const t = timeSec / 60
  const v = distM / t
  const vo2 = -4.60 + 0.182258 * v + 0.000104 * v * v
  const pct = 0.8 + 0.1894393 * Math.exp(-0.012778 * t) + 0.2989558 * Math.exp(-0.1932605 * t)
  return vo2 / pct
}

function thresholdPaceFromVDOT(vdot) {
  const a = 0.000104
  const b = 0.182258
  const c = -(4.60 + 0.88 * vdot)
  const v = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
  return (1000 / v) * 60  // sec/km
}

function raceTimeToThresholdPace(distKey, totalSec) {
  const distKm = DIST_KM[distKey]
  if (!distKm) return null
  const vdot = calcVDOT(distKm * 1000, totalSec)
  if (vdot < 30 || vdot > 85) return null
  return thresholdPaceFromVDOT(vdot)
}

function formatDelta(currentZone, targetZone) {
  const delta = Math.round(currentZone.paceKmSec.hi - targetZone.paceKmSec.hi)
  if (Math.abs(delta) < 1) return ''
  const abs = Math.abs(delta)
  const arrow = delta > 0 ? '▲' : '▼'
  const word  = delta > 0 ? 'faster' : 'slower'
  return abs < 60 ? `${arrow} ${abs}s ${word}` : `${arrow} ${secToPace(abs)} ${word}`
}

function calcZones({ refPaceSec, refType, hrMax, hrRest, lapDist }) {
  const mults = MULTIPLIERS[refType]
  return ['jog', 'zone2', 'tempo', 'threshold', 'vo2max'].map(key => {
    const [loMult, hiMult] = mults[key]
    // loMult is smaller → faster pace (fewer sec/km)
    const paceFastSec = refPaceSec * loMult
    const paceSlowSec = refPaceSec * hiMult
    const hr = calcKarvonen(hrMax, hrRest, HR_PCTS[key][0], HR_PCTS[key][1])
    return {
      key,
      label: ZONE_LABELS[key],
      paceKm: { lo: secToPace(paceFastSec), hi: secToPace(paceSlowSec) },
      paceKmSec: { lo: paceFastSec, hi: paceSlowSec },
      paceMi: { lo: secToPace(kmToMile(paceFastSec)), hi: secToPace(kmToMile(paceSlowSec)) },
      hr,
      hrPct: [Math.round(HR_PCTS[key][0] * 100), Math.round(HR_PCTS[key][1] * 100)],
      lap: {
        fast: lapSplit(paceFastSec, lapDist),
        slow: lapSplit(paceSlowSec, lapDist),
      },
      speedKmh: {
        lo: toKmh(paceSlowSec).toFixed(1),  // slower pace = lower speed
        hi: toKmh(paceFastSec).toFixed(1),
      },
      speedMph: {
        lo: toMph(paceSlowSec).toFixed(1),
        hi: toMph(paceFastSec).toFixed(1),
      },
    }
  })
}

// === INPUT READER ===
function readRaceInput(distRadioName, mmId, ssId, hhId, warningId) {
  const dist = document.querySelector(`input[name="${distRadioName}"]:checked`)?.value
  const mm = parseInt(document.getElementById(mmId).value, 10)
  const ss = parseInt(document.getElementById(ssId).value, 10)
  const warning = document.getElementById(warningId)
  warning.classList.remove('visible')
  if (!dist || isNaN(mm) || mm < 0) return null
  const hh = hhId ? (parseInt(document.getElementById(hhId).value, 10) || 0) : 0
  const totalSec = hh * 3600 + mm * 60 + (isNaN(ss) ? 0 : ss)
  if (totalSec <= 0) return null
  const refPaceSec = raceTimeToThresholdPace(dist, totalSec)
  if (refPaceSec === null) { warning.classList.add('visible'); return null }
  return { refPaceSec }
}

function readInputs() {
  const hrMax  = parseInt(document.getElementById('hr-max').value, 10)
  const hrRest = parseInt(document.getElementById('hr-rest').value, 10)
  const lapDist  = parseInt(document.querySelector('input[name="lap-dist"]:checked').value, 10)
  const dispUnit = document.querySelector('input[name="disp-unit"]:checked').value
  return {
    current: readRaceInput('cur-dist', 'cur-mm', 'cur-ss', null,      'cur-warning'),
    target:  readRaceInput('tgt-dist', 'tgt-mm', 'tgt-ss', 'tgt-hh', 'tgt-warning'),
    hrMax:  isNaN(hrMax)  ? null : hrMax,
    hrRest: isNaN(hrRest) ? null : hrRest,
    lapDist,
    dispUnit,
  }
}

// === RENDER ===
function renderSummaryCards(zones, dispUnit) {
  const keys = ['zone2', 'tempo', 'threshold', 'vo2max']
  keys.forEach(key => {
    const z = zones.find(z => z.key === key)
    const el = document.querySelector(`#sum-${key} .pace-range`)
    if (!z || !el) return
    const pace = dispUnit === 'mile'
      ? `${z.paceMi.lo}–${z.paceMi.hi}`
      : `${z.paceKm.lo}–${z.paceKm.hi}`
    el.textContent = pace
  })
}

function buildTargetRow(currentZone, targetZone, dispUnit) {
  const paceStr = (dispUnit === 'mile')
    ? `${targetZone.paceMi.lo} – ${targetZone.paceMi.hi} <span>/mi</span>`
    : `${targetZone.paceKm.lo} – ${targetZone.paceKm.hi} <span>/km</span>`
  const deltaStr = formatDelta(currentZone, targetZone)
  const isFaster = currentZone.paceKmSec.hi > targetZone.paceKmSec.hi
  const deltaHtml = deltaStr
    ? `<span class="delta ${isFaster ? 'delta-faster' : 'delta-slower'}">${deltaStr}</span>`
    : ''
  return `<div class="pace-target"><span class="compare-label">Target</span>${paceStr}${deltaHtml}</div>`
}

function renderZoneCards(currentZones, targetZones, lapDist, dispUnit, hasHr) {
  const container = document.getElementById('zone-cards')
  const showKm = dispUnit === 'km' || dispUnit === 'both'
  const showMi = dispUnit === 'mile' || dispUnit === 'both'

  container.innerHTML = currentZones.map((z, i) => {
    const t = targetZones ? targetZones[i] : null
    const hasTarget = !!t
    const curLabel = hasTarget ? `<span class="compare-label">Current</span>` : ''
    const paceKmHtml = `${z.paceKm.lo} – ${z.paceKm.hi} <span>/km</span>`
    const paceMiHtml = `${z.paceMi.lo} – ${z.paceMi.hi} <span>/mi</span>`
    const hrLine    = hasHr ? `<span>${z.hr.low}–${z.hr.high} bpm</span>` : ''
    const lapLine   = `<span>${lapDist}m&nbsp;${z.lap.fast.display}–${z.lap.slow.display} (${z.lap.fast.totalSec}s–${z.lap.slow.totalSec}s)</span>`
    const speedLine = `<span>${z.speedKmh.lo}–${z.speedKmh.hi} km/h</span>`

    return `
      <article class="zone-card" data-zone="${z.key}">
        <div class="zone-header">
          <h2>${z.label}</h2>
          <span class="hr-pct">${z.hrPct[0]}–${z.hrPct[1]}%</span>
        </div>
        ${showKm ? `<div class="pace-km">${curLabel}${paceKmHtml}</div>` : ''}
        ${showMi && !showKm ? `<div class="pace-mi">${curLabel}${paceMiHtml}</div>` : ''}
        ${showMi && showKm  ? `<div class="pace-mi">${paceMiHtml}</div>` : ''}
        ${hasTarget ? buildTargetRow(z, t, dispUnit) : ''}
        <div class="zone-meta">${hrLine}${lapLine}${speedLine}</div>
      </article>`
  }).join('')
}

function render() {
  const input = readInputs()
  const container = document.getElementById('zone-cards')

  if (!input.current) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>Enter your recent race time above.</strong><br>
        Example: 5K TT in 25:00 → your training zones appear here.<br>
        Add a Target time to compare goal paces side by side.
      </div>`
    ;['zone2','tempo','threshold','vo2max'].forEach(k => {
      const el = document.querySelector(`#sum-${k} .pace-range`)
      if (el) el.textContent = '–'
    })
    return
  }

  const hasHr = input.hrMax !== null && input.hrRest !== null && input.hrMax > input.hrRest
  const currentZones = calcZones({
    refPaceSec: input.current.refPaceSec,
    refType: 'threshold',
    hrMax: input.hrMax, hrRest: input.hrRest, lapDist: input.lapDist,
  })
  const targetZones = input.target ? calcZones({
    refPaceSec: input.target.refPaceSec,
    refType: 'threshold',
    hrMax: input.hrMax, hrRest: input.hrRest, lapDist: input.lapDist,
  }) : null

  renderSummaryCards(currentZones, input.dispUnit)
  renderZoneCards(currentZones, targetZones, input.lapDist, input.dispUnit, hasHr)
}

// === EVENT WIRING ===
document.getElementById('calc-form').addEventListener('input', render)
render()

// === TARGET DISTANCE HOURS TOGGLE ===
document.querySelectorAll('input[name="tgt-dist"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const needsHours = radio.value === 'half' || radio.value === 'full'
    const wrap  = document.getElementById('tgt-hh-wrap')
    const label = document.getElementById('tgt-time-label')
    wrap.style.display  = needsHours ? 'inline-flex' : 'none'
    if (!needsHours) document.getElementById('tgt-hh').value = ''
    label.textContent   = needsHours ? 'hh:mm:ss' : 'mm:ss'
  })
})
</script>
```

- [ ] **Step 2: Verify the calculation logic is unchanged**

Run: `node tests/calc.test.js`
Expected: all existing tests still pass (this file duplicates the same pure functions independently, so it validates the math wasn't altered during the rewrite).

- [ ] **Step 3: Build and verify**

Run: `bundle exec jekyll build`
Expected: succeeds with no errors.

Run: `grep -c 'id="calc-form"' _site/run/index.html`
Expected: `1`

Run: `grep -c 'class="site-title"' _site/run/index.html`
Expected: `1` (confirms the shared header rendered via the layout instead of the page's own duplicated header)

- [ ] **Step 4: Commit**

```bash
git add run/index.html
git commit -m "refactor: migrate running pace calculator to Jekyll layout"
```

---

### Task 7: Add "How it works" and FAQ content to the running pace calculator

**Files:**
- Modify: `run/index.html`

**Interfaces:**
- Consumes: the `</main>` closing tag and `<script>` opening tag produced by Task 6, as the insertion point.

- [ ] **Step 1: Insert the content section between `</main>` and `<script>`**

In `run/index.html`, find:

```html
  </section>
</main>

<script>
```

Replace with:

```html
  </section>
</main>

<section class="tool-content">
  <h2>How VDOT training zones work</h2>
  <p>This calculator uses Jack Daniels' VDOT formula, a widely used method in exercise science for estimating running fitness from a single race or time-trial result. Enter a recent 5K or 10K time, and the calculator estimates your VDOT score, then derives five training zones (Jog/Easy, Zone 2, Tempo, Threshold, VO2max) as pace ranges, heart-rate ranges, and lap splits.</p>
  <p>Training zones exist because different paces stress your body differently. Running everything at one pace — usually too fast — is one of the most common mistakes recreational runners make. Structuring training across zones, with mostly easy running and a few focused hard sessions, builds aerobic fitness while limiting injury risk.</p>

  <h2>How to use your training zones</h2>
  <ul>
    <li><strong>Jog / Easy</strong> — most of your weekly mileage should be here. It should feel conversational.</li>
    <li><strong>Zone 2</strong> — steady aerobic effort, slightly firmer than easy but still sustainable for long periods.</li>
    <li><strong>Tempo</strong> — "comfortably hard" effort used for tempo runs and progression workouts.</li>
    <li><strong>Threshold</strong> — the pace you could sustain for about an hour in a race; used for threshold or cruise-interval workouts.</li>
    <li><strong>VO2max</strong> — hard interval pace, typically 3–5 minute repeats with recovery, used to raise your aerobic ceiling.</li>
  </ul>

  <h2>Frequently asked questions</h2>
  <div class="faq">
    <details>
      <summary>What is VDOT?</summary>
      <p>VDOT is a fitness metric developed by exercise physiologist Jack Daniels. It converts a race performance into a single number that predicts equivalent performances at other distances and prescribes training paces.</p>
    </details>
    <details>
      <summary>How accurate are the training zones?</summary>
      <p>The zones are estimates based on a validated formula, not a lab test. They're accurate enough to guide day-to-day training, but factors like heat, terrain, and fatigue will shift your actual effort on any given run.</p>
    </details>
    <details>
      <summary>Do I need a recent race time?</summary>
      <p>Yes — the calculator needs a real, honest effort (a 5K or 10K time trial or race result from the last few weeks) to estimate your current fitness accurately. Old or non-maximal efforts will skew your zones.</p>
    </details>
    <details>
      <summary>What if I don't know my max heart rate?</summary>
      <p>Heart-rate ranges are optional. Leave Max HR and Resting HR blank and the calculator will still show pace-based and lap-split zones.</p>
    </details>
    <details>
      <summary>Can I compare a goal race pace to my current fitness?</summary>
      <p>Yes — fill in the optional Target Race section with a goal distance and time to see your target zones compared side-by-side with your current zones, including how much faster or slower the goal pace is.</p>
    </details>
  </div>
</section>

<script>
```

- [ ] **Step 2: Add CSS for the new section**

In `run/index.html`, find the end of the `<style>` block:

```css
  .delta-faster { color: #22c55e; }
  .delta-slower { color: #f59e0b; }
</style>
```

Replace with:

```css
  .delta-faster { color: #22c55e; }
  .delta-slower { color: #f59e0b; }

  /* TOOL CONTENT (how it works / FAQ) */
  .tool-content {
    max-width: 720px; margin: 24px auto; padding: 0 16px 40px;
  }
  .tool-content h2 { font-size: 16px; font-weight: 700; margin: 20px 0 8px; }
  .tool-content h2:first-child { margin-top: 0; }
  .tool-content p, .tool-content li { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }
  .tool-content ul { padding-left: 18px; margin-bottom: 8px; }
  .tool-content li { margin-bottom: 4px; }
  .faq details {
    border: 1px solid var(--border); border-radius: 8px;
    padding: 10px 14px; margin-bottom: 8px; background: var(--surface);
  }
  .faq summary {
    font-size: 13px; font-weight: 600; color: var(--text-primary);
    cursor: pointer;
  }
  .faq details p { margin-top: 8px; }
</style>
```

- [ ] **Step 3: Build and verify**

Run: `bundle exec jekyll build`
Expected: succeeds with no errors.

Run: `grep -c 'Frequently asked questions' _site/run/index.html`
Expected: `1`

Run: `node tests/calc.test.js`
Expected: all tests still pass (content-only change, calculation script untouched).

- [ ] **Step 4: Commit**

```bash
git add run/index.html
git commit -m "content: add how-it-works and FAQ section to running pace calculator"
```

---

### Task 8: Legal and trust pages

**Files:**
- Create: `about/index.html`
- Create: `privacy/index.html`
- Create: `terms/index.html`
- Create: `contact/index.html`

**Interfaces:**
- Consumes: `layout: default` (Task 3), `.content-page`/`.contact-email` styling (Task 2).
- Produces: the `/about/`, `/privacy/`, `/terms/`, `/contact/` pages that `_includes/footer.html` (Task 3) already links to.

- [ ] **Step 1: Create `about/index.html`**

```html
---
layout: default
title: About Ryutility
description: Ryutility builds small, free, no-nonsense web tools — no sign-up, no clutter.
permalink: /about/
---
<main class="content-page">
  <h1>About Ryutility</h1>
  <p>Ryutility is a small, independent collection of free web tools. The goal is simple: solve one specific, everyday problem per tool, load fast, work on any device, and get out of your way — no account required, no unnecessary clutter.</p>
  <p>The first tool, the <a href="{{ '/run/' | relative_url }}">Training Zone Calculator</a>, turns a recent race time into personalized running training paces using Jack Daniels' VDOT method. More tools are added over time, always with the same philosophy: useful first, simple always.</p>
  <p>Ryutility is built and maintained independently. If something is broken or you have a suggestion, see the <a href="{{ '/contact/' | relative_url }}">Contact</a> page.</p>
</main>
```

- [ ] **Step 2: Create `privacy/index.html`**

```html
---
layout: default
title: Privacy Policy — Ryutility
description: How Ryutility collects, uses, and protects information from visitors.
permalink: /privacy/
---
<main class="content-page">
  <h1>Privacy Policy</h1>
  <p><em>Last updated: June 30, 2026</em></p>

  <h2>Overview</h2>
  <p>Ryutility ("we", "us", "the site") provides free web-based tools at ryutility.com. This policy explains what information is collected when you use the site, how it's used, and the choices available to you.</p>

  <h2>Information we collect</h2>
  <p>The tools on this site run entirely in your browser. Calculator inputs (such as race times or personal metrics you type in) are processed locally on your device and are never sent to our servers or stored by us.</p>
  <p>If you accept the cookie banner, we use Google Analytics (GA4) to understand aggregate site usage — pages visited, approximate location (derived from IP address), device and browser type, and referral source. This data is not linked to your name or any other directly identifying information we collect, because we don't collect any.</p>

  <h2>Cookies</h2>
  <p>We use a small number of cookies and browser local storage:</p>
  <ul>
    <li><strong>Consent preference</strong> — stored in your browser's local storage to remember whether you accepted or declined analytics cookies.</li>
    <li><strong>Google Analytics cookies</strong> — set only after you accept the cookie banner, used to measure site usage as described above.</li>
    <li><strong>Advertising cookies</strong> — once this site displays ads via Google AdSense, Google and its partners may use cookies to serve ads based on your visits to this and other sites. See "Advertising" below.</li>
  </ul>

  <h2>Advertising</h2>
  <p>This site may display ads served by Google AdSense. Google uses cookies to serve ads based on a user's prior visits to this and other websites. You can opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener">Google Ads Settings</a>, or by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener">aboutads.info</a> (US) or <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener">youronlinechoices.eu</a> (EU).</p>

  <h2>Your rights (GDPR / CCPA)</h2>
  <p>If you are located in the European Economic Area, you have the right to access, correct, or request deletion of any personal data we hold about you, and the right to withdraw analytics consent at any time by clearing your browser's local storage for this site.</p>
  <p>If you are a California resident, you have the right to know what personal information is collected and to opt out of its "sale" or "sharing" (as those terms are defined by the CCPA/CPRA). We do not sell personal information. You can limit analytics and ad personalization using the tools linked above.</p>

  <h2>Data retention</h2>
  <p>We do not operate a server-side database of visitor information. Any data collected via Google Analytics is retained and governed according to Google's own data retention settings and policies.</p>

  <h2>Children's privacy</h2>
  <p>This site is not directed at children under 13, and we do not knowingly collect information from children.</p>

  <h2>Changes to this policy</h2>
  <p>We may update this policy from time to time. Changes will be posted on this page with an updated "Last updated" date.</p>

  <h2>Contact</h2>
  <p>Questions about this policy can be sent to <a href="mailto:contact@ryutility.com">contact@ryutility.com</a>.</p>
</main>
```

- [ ] **Step 3: Create `terms/index.html`**

```html
---
layout: default
title: Terms of Use — Ryutility
description: The terms governing your use of Ryutility's free web tools.
permalink: /terms/
---
<main class="content-page">
  <h1>Terms of Use</h1>
  <p><em>Last updated: June 30, 2026</em></p>

  <h2>Acceptance of terms</h2>
  <p>By using ryutility.com ("the site"), you agree to these Terms of Use. If you don't agree, please don't use the site.</p>

  <h2>Description of service</h2>
  <p>Ryutility provides free, browser-based calculators and tools. All results are informational and educational only — they are not medical, financial, or professional advice of any kind. For running and fitness tools specifically, consult a coach or medical professional before making training decisions based on this site's output.</p>

  <h2>No warranty</h2>
  <p>The site and its tools are provided "as is," without warranty of any kind, express or implied. We do not guarantee that calculations are error-free, complete, or suitable for any particular purpose. Use the site at your own risk.</p>

  <h2>Limitation of liability</h2>
  <p>To the fullest extent permitted by law, Ryutility and its operator are not liable for any damages, injury, or loss arising from your use of, or inability to use, this site or its tools.</p>

  <h2>Intellectual property</h2>
  <p>The site's design, code, and written content are owned by Ryutility unless otherwise noted, and may not be reproduced without permission. You're welcome to link to any page on this site.</p>

  <h2>Third-party links and ads</h2>
  <p>This site may contain links to third-party sites and, once approved, third-party advertisements (via Google AdSense). We are not responsible for the content, accuracy, or practices of any third-party site.</p>

  <h2>Changes to these terms</h2>
  <p>We may update these terms from time to time. Continued use of the site after changes means you accept the updated terms.</p>

  <h2>Contact</h2>
  <p>Questions about these terms can be sent to <a href="mailto:contact@ryutility.com">contact@ryutility.com</a>.</p>
</main>
```

- [ ] **Step 4: Create `contact/index.html`**

```html
---
layout: default
title: Contact — Ryutility
description: Get in touch with Ryutility.
permalink: /contact/
---
<main class="content-page">
  <h1>Contact</h1>
  <p>Found a bug, have a suggestion for a new tool, or have a question about a calculator's results? Send an email to:</p>
  <p><a href="mailto:contact@ryutility.com" class="contact-email">contact@ryutility.com</a></p>
  <p>We read every message and try to respond within a few days.</p>
</main>
```

- [ ] **Step 5: Build and verify**

Run: `bundle exec jekyll build`
Expected: succeeds with no errors.

Run: `for p in about privacy terms contact; do test -f _site/$p/index.html && echo "$p OK"; done`
Expected:
```
about OK
privacy OK
terms OK
contact OK
```

Run: `grep -o 'href="/privacy/"' _site/index.html`
Expected: `href="/privacy/"` (confirms the shared footer link resolves correctly from the landing page)

- [ ] **Step 6: Commit**

```bash
git add about privacy terms contact
git commit -m "content: add about, privacy policy, terms, and contact pages"
```

---

### Task 9: Final integration check

**Files:** none created or modified — verification only.

- [ ] **Step 1: Full clean build**

Run: `rm -rf _site .jekyll-cache && bundle exec jekyll build`
Expected: succeeds with no errors or warnings about missing layouts/includes.

- [ ] **Step 2: Run both test suites**

Run: `node tests/calc.test.js && node tests/consent.test.js`
Expected: both print `N passed, 0 failed` and exit 0.

- [ ] **Step 3: Verify SEO/crawlability files exist in the build output**

Run: `for f in robots.txt ads.txt sitemap.xml; do test -f _site/$f && echo "$f OK"; done`
Expected:
```
robots.txt OK
ads.txt OK
sitemap.xml OK
```

- [ ] **Step 4: Verify the legacy redirect file still passes through untouched**

Run: `grep -c 'url=/run' _site/running-pace-calculator.html`
Expected: `1` (confirms Jekyll copied this static file as-is, since it has no front matter and isn't a Jekyll page)

- [ ] **Step 5: Verify every page links to all four legal pages via the shared footer**

Run: `for p in index run/index about/index privacy/index terms/index contact/index; do echo "== $p =="; grep -c 'href="/privacy/"' _site/$p.html; done`
Expected: every page prints `== <page> ==` followed by `1`.

- [ ] **Step 6: Commit any final cleanup (if Step 1–5 required fixes)**

```bash
git add -A
git commit -m "chore: final AdSense readiness integration check" --allow-empty
```

- [ ] **Step 7: Manual QA checklist (perform after pushing and GitHub Pages rebuilds)**

This step cannot be automated locally — GA4 firing and live-domain behavior require the deployed site. After pushing to `master` and confirming the GitHub Pages build succeeded (`gh api repos/jasonpa/ryutility/pages/builds/latest`), manually verify on https://ryutility.com:

- [ ] Dark mode toggle works on `/`, `/run/`, `/about/`, `/privacy/`, `/terms/`, `/contact/`
- [ ] Cookie banner appears on first visit, "Accept" hides it and (after replacing `GA_MEASUREMENT_ID` with a real ID) triggers a GA4 network request, "Decline" hides it with no GA4 request
- [ ] All footer links (About/Privacy/Terms/Contact) resolve with no 404s
- [ ] `/run/` FAQ `<details>` sections expand/collapse correctly
- [ ] Mobile viewport (375px) shows no horizontal scroll on any page
- [ ] `https://ryutility.com/sitemap.xml` and `https://ryutility.com/robots.txt` are publicly reachable

## Post-plan open items (not part of this plan's tasks)

1. Configure `contact@ryutility.com` → `[personal inbox]` forwarding in the domain registrar before relying on the Contact page.
2. Create a real GA4 property and replace `GA_MEASUREMENT_ID` in `assets/js/site.js`.
3. After AdSense approval, replace the `ads.txt` placeholder with the real publisher line.
4. Consider adding a real raster `apple-touch-icon.png` and `og:image` once brand assets exist (not required for AdSense review).
