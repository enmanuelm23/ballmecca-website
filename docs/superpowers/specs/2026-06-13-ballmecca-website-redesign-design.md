# Ballmecca Website Redesign — Design Spec

**Date:** 2026-06-13 (rev. 2026-06-14 after design review)
**Status:** Approved design, pending implementation plan
**Repo:** `Documents/ballmecca-website` (GitHub: `enmanuelm23/ballmecca-website`)

---

## 1. Goal

Rebuild the Ballmecca marketing site to be dramatically more intuitive, on-brand,
and SEO-strong, and migrate hosting from Squarespace/Vercel to **Firebase Hosting**.

The defining new experience: a **persona-aware home page** that lets visitors
self-identify as **Athlete, Coach, or Recruiter** and routes them to a tailored
landing page — without ever gating the primary action.

### Conversion goal per persona
- **Athletes & Coaches** → download the app (App Store / Google Play).
- **Recruiters** → **join early access** (email capture), since recruiter features
  are partial; app download is a secondary action only.

### Success criteria
- A first-time visitor understands what Ballmecca is and can act (download)
  **without scrolling or choosing a persona**.
- A visitor who self-identifies reaches a relevant, trust-building page that
  funnels to the right action.
- Each persona page is independently indexable and ranks for its own keywords.
- The site visually matches the Flutter app's brand (`ballmecca4`), dark theme.
- **Lighthouse (mobile throttling): 95+ Performance / 100 SEO / 100 Accessibility**
  on home + persona pages, enforced by the performance budget in §8.
- Hosting runs on Firebase with auto-deploy from `main`; Squarespace and Vercel are
  retired only after a verified rollback-safe cutover (§11).

---

## 2. Stack & Architecture

**Astro** (static output) → **Firebase Hosting**. Astro ships zero JS by default,
emits plain static HTML/CSS, and gives us component reuse, MDX blogging, and a
built-in sitemap. The site uses **no client-side Firebase SDK** (see §7).

```
ballmecca-website/
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro        # <head>, SEO meta, nav, footer, skip-link
│   │   └── PersonaLayout.astro     # BaseLayout + in-content persona switcher
│   ├── components/
│   │   ├── Nav.astro  Footer.astro  PersonaSwitcher.astro
│   │   ├── Hero.astro  PersonaSelector.astro  StatBar.astro
│   │   ├── HowItWorks.astro  SportsCarousel.astro  MissionStrip.astro
│   │   ├── DownloadCTA.astro  StoreBadges.astro  FaqAccordion.astro
│   │   ├── TopCoaches.astro        # STATIC — renders from data/coaches.ts
│   │   └── EarlyAccessForm.astro   # recruiter email capture
│   ├── pages/
│   │   ├── index.astro             # persona-aware home (Option B)
│   │   ├── athletes.astro  coaches.astro  recruiters.astro
│   │   ├── about.astro  contact.astro  faq.astro  policies.astro
│   │   └── blog/{index.astro, [...slug].astro}
│   ├── content/{config.ts, blog/*.mdx}   # blog collection (seeded w/ 1st article)
│   ├── data/{personas.ts, sports.ts, faqs.ts, seo.ts, coaches.ts}
│   ├── lib/persona.ts              # localStorage read/write + highlight (tiny, deferred)
│   └── styles/{tokens.css, global.css}
├── public/                         # images/ (incl. images/coaches/), favicon, robots.txt
├── astro.config.mjs                # site URL + @astrojs/sitemap + @astrojs/mdx
├── firebase.json  .firebaserc
└── .github/workflows/deploy.yml    # build + deploy to Firebase on push to main
```

Nav, footer, `<head>`, and SEO meta live in **one** `BaseLayout` — eliminating the
current 8-file copy-paste. Sports, FAQs, persona copy, and the curated coach list
are typed data files so they render consistently everywhere.

---

## 3. Brand & Theme (mirror the app — dark only)

The site ships a **single dark theme** matching the app's default. No light mode,
no manual theme toggle (deliberate YAGNI cut: removes FOUC handling, storage,
SVG/OG variants). `src/styles/tokens.css` ports `ballmecca4`'s dark `AppColors`
into CSS custom properties.

| Token | Value | Use |
|---|---|---|
| `--brand-chrome` | `#06466A` | nav, headers, branded chrome |
| `--primary-action` | `#F35E0A` | CTAs, primary buttons |
| `--link` | `#08B4B6` | links, accents, focus rings |
| `--canvas` | `#000000` | page background |
| `--surface` | `#22222E` | cards |
| `--surface-variant` | `#18181E` | nested cards |
| `--border` | `#1F1F2A` | dividers |
| `--on-surface` | `#FAFAFA` | primary text |
| `--on-surface-variant` | `#B0BEC5` | secondary text |
| `--success` / `--warning` / `--danger` | `#068742` / `#F83502` / `#A7040E` | status |
| `--on-brand-chrome` / `--on-primary-action` / `--on-link` | `#FFFFFF` | text on colored bg |
| `--muted` | `#95A1AC` | placeholders/icons |

Include `<meta name="color-scheme" content="dark">`.

**Typography:** **Anton** for short display headlines only (hero + section titles,
uppercase) — never paragraphs, FAQ questions, nav, or long multi-line mobile
headings. **Open Sans** for sub-headings/labels, **Nunito** for body/UI — matching
the app. Fonts self-hosted in `public/fonts/`, subsetted, limited weights,
`font-display:swap`.

**Token-drift rule:** `lib/theme/app_colors.dart` in `ballmecca4` is the source of
truth. Never change a brand hex in `tokens.css` without checking the app token.

This replaces the current off-brand palette (`#0a0e1a` / `#e84e1b` / `#00c9b1`,
League Spartan / DM Sans), which does not match the app.

---

## 4. Persona Experience (Option B, refined)

### Home page — value first, persona second
1. **Hero** — value prop + sub-line + **store badges as the primary action**. A
   ready-to-convert visitor acts here with no scroll, no choice.
2. **Persona selector** — directly beneath: *"Find the tour built for you"* → three
   **real anchor links** (`<a href="/athletes">` …), crawlable + keyboard-accessible
   with zero JS. A guide, **not a gate**.
3. **Shared story**: stat bar, how-it-works, sports carousel, top coaches (static),
   mission strip, blog teaser, download CTA, footer.

### Persona pages — long-form, disciplined, genuinely distinct
Same spine, **distinct content per page** (different hero promise, objections, FAQ
entries, proof, and schema — never reskinned nouns):

`Hero (CTA up top) → How it works → Why <persona> → Proof → Testimonial →
Model/Pricing → Persona FAQ slice (links to full FAQ) → Final CTA`

- **Athletes** — improve faster, pro feedback in days, affordable, safe for minors.
  CTA: download.
- **Coaches** — earn money, build your roster, Stripe payouts, referrals/
  subscriptions. CTA: download.
- **Recruiters** — discover verified talent, **early access**. Honest positioning:
  "early access" prominent, no implied mature recruiter dashboard. Primary CTA:
  **email capture** (`EarlyAccessForm`); download secondary. Still needs real value
  for SEO: market thesis, discovery workflow, verification philosophy, sport
  coverage, honest roadmap.

### Persona switcher (the corner toggle)
- Appears **only on persona pages** (not the neutral home). Built as accessible
  links/segmented control: real labels, visible focus states, ~44px touch targets,
  clear current-persona indication, sufficient contrast.
- On small screens it is **sticky within content**, not fixed-overlay, to avoid
  covering content or clashing with browser/chat UI.
- Selection persists to `localStorage`; on a return visit to `/`, the home selector
  **pre-highlights** the saved persona. **No auto-redirect** — `/` always shows home.

---

## 5. Blog / Articles (`/blog`)

Minimal Astro **content collection** (MDX). `index.astro` lists articles;
`[...slug].astro` renders each with `Article` JSON-LD, OG tags, canonical URL.
Seeded with the first article the user provides. File-based, no CMS until volume
justifies one. This is the long-term SEO engine.

---

## 6. SEO

- Per-page `<title>`, meta description, canonical (centralized in `seo.ts` +
  `BaseLayout`).
- Open Graph + Twitter Card tags; per-page OG images.
- **JSON-LD:** `Organization` site-wide; `MobileApplication` on home; `Article` on
  posts; `FAQPage` on FAQ.
  - **Honesty guardrail:** rating/review counts must reflect **real** store
    aggregates — never fabricated.
- Auto `sitemap.xml` (`@astrojs/sitemap`) + hand-authored `robots.txt`.
- One `<h1>` per page, semantic hierarchy, descriptive alt text.
- Responsive lazy images via Astro `<Image>`; self-hosted subsetted fonts.
- Per-persona keyword clusters (e.g. *online sports coaching for athletes*, *grow
  your coaching business*, *discover athlete talent*).
- **Caveat (acknowledged):** architecture is necessary, not sufficient — ranking
  depends on real, specific content and proof, which marketing supplies.

---

## 7. Top Coaches — fully static (no Firebase read)

**Decision:** the site performs **no Firestore read**. The existing live query
fails anyway — `firestore.rules:150` requires `request.auth != null` for `coaches`,
so the unauthenticated marketing query already falls back to placeholder data in
production. Loosening that rule would risk leaking private coach fields.

Instead, a **curated set of real coaches** (name, sport, photo, optional real
credential) is hardcoded in `src/data/coaches.ts`, with images stored in
`public/images/coaches/`. `TopCoaches.astro` renders them at **build time** —
static HTML, zero client JS, zero Firebase SDK, no privacy surface. Updating the
lineup is a data-file + image edit. (Future option: a build-time admin-SDK export
into a sanitized `publicCoaches` set — out of scope now.)

---

## 8. Performance Budget & Interactivity Classification

Targets enforced on **mobile throttling**, not desktop. No client Firebase SDK in
any path. Per-component JS policy:

| Feature | Implementation | Client JS |
|---|---|---|
| Mobile nav | vanilla, deferred | tiny |
| Persona highlight/persist | `lib/persona.ts`, deferred | tiny |
| Persona switcher | accessible links | none (JS only enhances) |
| FAQ | native `<details>/<summary>` | none |
| Sports carousel | CSS `scroll-snap` | none |
| Top coaches | static (§7) | none |
| Theme | dark-only CSS | none |
| Recruiter form | `EarlyAccessForm` (see §9) | minimal |
| Analytics | lightweight (§10) | minimal |

Budget: near-zero critical-path JS; fonts subsetted + limited weights; all
above-the-fold images sized + compressed (preload only the hero); no carousel
library; avoid layout shift (sized images, `font-display:swap`).

---

## 9. Forms — Firebase Cloud Function endpoint (no Formspree)

Both forms POST via `fetch` to a **Firebase Cloud Function HTTP endpoint** — no
client Firebase SDK on the page, staying fully static/fast and entirely in the
Firebase ecosystem. The function validates input, writes the submission to a
Firestore collection (e.g. `contactMessages` / `earlyAccessSignups`), and/or emails
`support@ballmecca.com`.

- **Contact** — re-themed form (currently a non-functional Formspree placeholder —
  `action="…/YOUR_FORM_ID"` — to be replaced).
- **Recruiter early access** — `EarlyAccessForm` captures email with confirmation
  state and honest "early access" copy.
- **Cross-cutting:** server-side validation, CORS limited to the site origin, spam
  protection (honeypot + reCAPTCHA/App Check), progressive-enhancement fallback
  (`mailto:` shown if JS fails). Whether the function lives in the existing
  `ballmecca4` `firebase/functions` codebase or a small dedicated one is decided in
  the implementation plan.

---

## 10. Analytics & Conversion Events

Define a lightweight analytics layer (platform chosen in the plan; must respect the
JS budget). Events:

- Store-badge click (App Store / Google Play, separately)
- Persona card click; persona switcher click
- FAQ expand
- Contact submit; recruiter early-access submit
- Blog CTA click; top-coach card click

Dimensions: persona selected, page, source/medium, device. Without this the
redesign can look good but teach us nothing.

---

## 11. Firebase Hosting Migration (rollback-safe)

- `firebase.json` hosting target serving `dist/`, clean-URL rewrites, long-cache
  headers for hashed assets.
- `.github/workflows/deploy.yml`: build + deploy to Firebase on push to `main`;
  PRs → **preview channels**.
- **Redirect map (built before launch):** old `*.html` → clean URLs with `301`
  (`/about.html`→`/about`, etc.), plus an inventory of existing Squarespace slugs →
  new URLs. Losing indexed URLs costs SEO momentum.
- **Cutover sequence:** build preview → verify all pages, forms, analytics,
  redirects, robots/sitemap, canonical host → **lower DNS TTL** → cut DNS to
  Firebase → monitor logs + Search Console → keep Squarespace/Vercel live as
  rollback through a confidence window → **retire only after** that window.
- Marketing site stays separate from the Flutter app at `app.ballmecca.com`.

---

## 12. Open Questions for the Implementation Plan
Exact App Store / Play URLs (confirmed live: `id1663498139`,
`com.ballmecca.ballmecca`); current DNS records + registrar; Firebase project +
hosting target (`ballmecca-982c8`?); GitHub deploy secret ownership; analytics
platform; Squarespace URL inventory for the redirect map; which coaches to curate
for §7; the first blog article; where the §9 form Cloud Function lives (existing
`firebase/functions` vs. dedicated) and its email-sending mechanism.

---

## 13. Out of Scope (YAGNI)
No CMS; no light mode / theme toggle; no i18n/auth/e-commerce; no client Firebase
SDK; no redesign of the Flutter app or `app.ballmecca.com`; no recruiter product
features (page sells existing/early capability).

---

## 14. Migration of Existing Content
Port + re-theme About, Contact (Formspree placeholder replaced by the §9 Cloud
Function endpoint), FAQ (accordion → native
`<details>` + `FAQPage` JSON-LD), Policies (sticky-sidebar + placeholder slots
preserved). Remove committed macOS artifacts (`Icon\r`, `.DS_Store`) and gitignore
them as part of the rebuild.
