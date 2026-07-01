# AdSense Readiness Design

## Goal

Prepare ryutility.com to pass Google AdSense review within 4–6 weeks, without adding new tools in this phase. Focus is entirely on trust signals, legal compliance, content depth on the existing tool, and site infrastructure that will scale once more tools are added later.

## Scope

In scope:
- Migrate the site from duplicated static HTML to Jekyll (native GitHub Pages build) for shared layout/header/footer/nav.
- Add required legal/trust pages: Privacy Policy, Terms of Use, About, Contact.
- Add GA4 analytics with a simple cookie consent banner.
- Add `ads.txt` placeholder, favicon, and SEO meta tags (Open Graph, canonical, sitemap.xml, robots.txt).
- Deepen content on the existing running pace/VDOT calculator page with a usage/methodology explanation and FAQ section.

Out of scope (explicitly deferred):
- Adding new tools (unit converter, percentage calculator, etc.) — to be scoped in a future design once this foundation lands.
- Setting up the actual domain email forwarding account (contact@ryutility.com → owner's personal inbox) — this is a manual action in the domain registrar's dashboard, outside repo scope. The Contact page will reference `contact@ryutility.com`; the user is responsible for configuring forwarding before publishing.

## Architecture: Jekyll Migration

GitHub Pages natively builds Jekyll sites with no CI/build step required from the user — push to `master` and GitHub builds automatically.

Structure:
```
_config.yml
_layouts/default.html       # <html>, <head>, meta tags, header/footer includes
_includes/header.html       # site title, dark-mode toggle, nav
_includes/footer.html       # links to Privacy/Terms/About/Contact
_includes/cookie-banner.html
_includes/head-meta.html    # OG tags, canonical, favicon links
index.html                  # landing page hub (front matter + content)
run/index.html              # running pace calculator (front matter + content, JS/CSS specific to the tool kept inline as today)
privacy/index.html
terms/index.html
about/index.html
contact/index.html
ads.txt
robots.txt
```

- Shared CSS variables (theme colors, base typography) move into a single `assets/css/site.css` included via the default layout; tool-specific CSS/JS stays inline in each tool's page as it does today.
- `jekyll-sitemap` plugin (GitHub Pages safe list) auto-generates `sitemap.xml`.
- Each page sets its own `title`, `description`, and `canonical` via front matter, consumed by `_includes/head-meta.html`.
- The dark-mode toggle script and cookie-consent script are shared includes so behavior stays consistent across all pages without duplication.

## Legal & Trust Pages

- **Privacy Policy** (`/privacy/`): discloses GA4 data collection, cookie usage, AdSense personalized advertising notice, GDPR (EU) and CCPA (California) opt-out guidance, and how to contact the site owner.
- **Terms of Use** (`/terms/`): disclaimer that calculator results are informational only (not medical/financial advice), copyright notice.
- **About** (`/about/`): describes the Ryutility brand and mission (free practical tools). No personal identity disclosed — brand name only, per user preference.
- **Contact** (`/contact/`): displays `contact@ryutility.com` as a mailto link. No contact form needed since this is a forwarding address, not a public inbox.

## Content Depth: Running Pace Calculator

Add to `/run/index.html` below the existing calculator:
- "How it works" section explaining Daniels' VDOT method in plain language.
- "How to use your training zones" section (practical guidance).
- FAQ section (3–5 Q&As) covering common questions (e.g., "What's a training zone?", "How accurate is VDOT?", "Do I need a recent race time?").

This brings the page's non-tool textual content to roughly 300–600 words, addressing AdSense's "thin content" rejection pattern for tool-only pages.

## Analytics & Consent

- GA4 tag added via `_includes/head-meta.html`, but the GA4 script only fires after consent.
- A simple cookie banner (`_includes/cookie-banner.html`) shows on first visit: "Accept" / "Decline" buttons, choice stored in `localStorage`.
- If accepted, GA4 loads; if declined, no tracking script loads. No further re-prompting once a choice is stored.
- This is an MVP consent flow — not full IAB TCF/Google Consent Mode v2 — sufficient for AdSense's baseline disclosure requirement at this stage.

## SEO & Crawlability

- `ads.txt` created at root with a placeholder line to be replaced with the real publisher line once AdSense issues one after approval.
- `robots.txt` allowing full crawl, pointing to `sitemap.xml`.
- Favicon (`favicon.ico` + apple-touch-icon) added to `_includes/head-meta.html`.
- Open Graph tags (title, description, url, image) and canonical URL per page.

## Testing

- No new calculation logic is introduced in this phase, so no new unit tests are required for `tests/calc.test.js`.
- Manual QA checklist before submitting to AdSense: verify Jekyll build succeeds on GitHub Pages, all nav links resolve, cookie banner accept/decline works, GA4 fires only after consent (verified via GA4 DebugView or browser network tab), privacy/terms/about/contact pages render correctly on mobile and desktop, dark mode toggle still works across all new pages.

## Open Items for the User (outside this design's execution)

1. Configure `contact@ryutility.com` → owner's personal inbox forwarding in the domain registrar before the Contact page goes live.
2. After AdSense approval, replace the `ads.txt` placeholder with the real publisher line and re-enable the ad slot.
