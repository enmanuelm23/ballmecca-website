# Ballmecca Website Redesign — Design Spec

**Date:** 2026-06-13
**Status:** Approved design, pending implementation plan
**Repo:** `Documents/ballmecca-website` (GitHub: `enmanuelm23/ballmecca-website`)

---

## 1. Goal

Rebuild the Ballmecca marketing site to be dramatically more intuitive, on-brand,
and SEO-strong, and migrate hosting from Squarespace/Vercel to **Firebase Hosting**.

The defining new experience: a **persona-aware home page** that lets visitors
self-identify as **Athlete, Coach, or Recruiter** and routes them to a tailored
landing page — without ever gating the primary action (downloading the app).

### Success criteria
- A first-time visitor understands what Ballmecca is and can download the app
  **without scrolling or choosing a persona**.
- A visitor who self-identifies reaches a relevant, trust-building page that
  funnels to download.
- Each persona page is independently indexable and ranks for its own keywords.
- The site visually matches the Flutter app's brand (`ballmecca4`).
- Lighthouse: 95+ Performance / 100 SEO / 100 Accessibility on the home page.
- Hosting runs on Firebase with auto-deploy from `main`; Squarespace and Vercel
  are retired after DNS cutover.

---

## 2. Stack & Architecture

**Astro** (static output) → **Firebase Hosting**. Astro ships zero JS by default,
emits plain static HTML/CSS (ideal for SEO + Lighthouse), and gives us component
reuse, MDX-based blogging, and a built-in sitemap. A small Node build step is the
only cost; the maintainability and SEO wins are large.

```
ballmecca-website/
├── src/
│   ├── layouts/
│   │   ├── BaseLayout.astro        # <head>, SEO meta, nav, footer, skip-link
│   │   └── PersonaLayout.astro     # BaseLayout + corner persona toggle
│   ├── components/
│   │   ├── Nav.astro  Footer.astro  PersonaToggle.astro
│   │   ├── Hero.astro  PersonaSelector.astro  StatBar.astro
│   │   ├── HowItWorks.astro  SportsCarousel.astro  MissionStrip.astro
│   │   ├── DownloadCTA.astro  StoreBadges.astro  FaqAccordion.astro
│   │   └── TopCoaches.astro        # client-hydrated Firestore island
│   ├── pages/
│   │   ├── index.astro             # persona-aware home (Option B)
│   │   ├── athletes.astro          # persona landing (long-form)
│   │   ├── coaches.astro           # persona landing (long-form)
│   │   ├── recruiters.astro        # persona landing (early-access)
│   │   ├── about.astro  contact.astro  faq.astro  policies.astro
│   │   └── blog/
│   │       ├── index.astro         # article list
│   │       └── [...slug].astro     # article pages from content collection
│   ├── content/
│   │   ├── config.ts               # blog collection schema (zod)
│   │   └── blog/*.mdx              # articles (seeded with first article)
│   ├── data/
│   │   ├── personas.ts             # per-persona copy, benefits, CTAs, SEO
│   │   ├── sports.ts  faqs.ts  seo.ts
│   ├── lib/persona.ts              # localStorage read/write + highlight logic
│   └── styles/
│       ├── tokens.css              # app theme tokens (CSS custom properties)
│       └── global.css
├── public/                         # images/, favicon, robots.txt, app store assets
├── astro.config.mjs                # site URL + @astrojs/sitemap + @astrojs/mdx
├── firebase.json  .firebaserc
└── .github/workflows/deploy.yml    # build + deploy to Firebase on push to main
```

Nav, footer, `<head>`, and SEO meta live in **one** `BaseLayout` — eliminating the
current 8-file copy-paste. Sports, FAQs, and persona copy are typed data files so
they render consistently across home, persona pages, and the footer.

---

## 3. Brand & Theme (mirror the app)

`src/styles/tokens.css` ports `ballmecca4`'s `AppColors` exactly into CSS custom
properties, with light/dark via `prefers-color-scheme` + a manual toggle.

| Token | Value | Use |
|---|---|---|
| `--brand-chrome` | `#06466A` | nav, headers, branded chrome |
| `--primary-action` | `#F35E0A` | CTAs, primary buttons |
| `--link` | `#08B4B6` | links, accents, focus rings |
| `--canvas` (dark) | `#000000` | page background |
| `--canvas` (light) | `#FAFAFA` | page background |
| `--surface` (dark/light) | `#22222E` / `#F1F3F5` | cards |
| `--surface-variant` | `#18181E` / `#DEE2E6` | nested cards |
| `--border` | `#1F1F2A` / `#E9ECEF` | dividers |
| `--on-surface` | `#FAFAFA` / `#1A1A2E` | primary text |
| `--on-surface-variant` | `#B0BEC5` / `#6B7280` | secondary text |
| `--success` / `--warning` / `--danger` | `#068742` / `#F83502` / `#A7040E` | status |
| on-fixed | `--on-brand-chrome` / `--on-primary-action` / `--on-link` = `#FFFFFF` | text on colored bg |

**Typography:** **Anton** for display headlines (hero + section titles, uppercase),
**Open Sans** for sub-headings/labels, **Nunito** for body and UI — matching the app
(Open Sans + Nunito) while giving the hero athletic energy. Self-host the fonts in
`public/fonts/` with `font-display:swap` for performance and privacy.

This replaces the current off-brand palette (`#0a0e1a` / `#e84e1b` / `#00c9b1`,
League Spartan / DM Sans), which does **not** match the app.

---

## 4. Persona Experience (Option B, refined)

### Home page (`index.astro`) — value first, persona second
1. **Hero** — one-line value prop (*"Revolutionizing sports education for the next
   generation."*) + sub-line + **App Store / Google Play badges as the primary
   action**. A ready-to-convert visitor downloads here with no scroll, no choice.
2. **Persona selector** — directly beneath the hero: *"Find the tour built for
   you"* → three cards: **I'm an Athlete / I'm a Coach / I'm a Recruiter**.
   This is a helpful guide, **not a gate**.
3. **Shared story** below: stat bar, how-it-works, sports carousel, top coaches,
   mission strip, blog teaser, download CTA, footer.

The persona selector is built as **real anchor links** (`<a href="/athletes">`),
crawlable and keyboard-accessible with zero JS. JS only adds the "remember +
pre-highlight" enhancement on top.

### Persona pages — long-form, disciplined (`/athletes`, `/coaches`, `/recruiters`)
Each uses `PersonaLayout` and follows the same spine, with **genuinely distinct
content** (no reskins):

`Hero (with download CTA up top) → How it works → Why <persona> → Sports/Proof →
Testimonial → Pricing/Model → Persona FAQ slice (links to full FAQ) → Final CTA + badges`

- **Athletes** — *improve faster, pro feedback in days, affordable, safe for minors.*
- **Coaches** — *earn money, build your roster, get paid via Stripe, referral &
  subscription model.*
- **Recruiters** — *discover verified talent (early access).* Sells the vision
  honestly since the feature is partial; CTA = download to be among the first.

"Disciplined" = long enough to answer real questions and earn SEO, but the
download CTA sits in the hero so converters never scroll.

### Persona toggle
- A small fixed-corner toggle (Athlete / Coach / Recruiter) appears **only on
  persona pages** — it is a "switch context" control, absent from the neutral home
  where the hero already handles the choice.
- Selection persists to `localStorage`.
- On a return visit to `/`, the home persona selector **pre-highlights** the saved
  persona. **No auto-redirect** — landing on `/` always shows the home page (keeps
  shareable links, back-button, and shared-device behavior intuitive).

---

## 5. Blog / Articles (`/blog`)

Minimal Astro **content collection** (MDX). `blog/index.astro` lists articles
(title, date, excerpt, hero image); `blog/[...slug].astro` renders each with
`Article` JSON-LD, OG tags, and a canonical URL. Seeded with the first article the
user provides. This is the long-term SEO engine; structure is in place now,
content grows over time.

---

## 6. SEO

- Per-page `<title>`, meta description, and canonical (centralized in `seo.ts` +
  `BaseLayout`).
- Open Graph + Twitter Card tags; per-page OG images.
- **JSON-LD structured data:** `Organization` (logo, social profiles) site-wide;
  `MobileApplication` (name, OS, store URLs, real aggregate rating) on home;
  `Article` on blog posts; `FAQPage` on the FAQ page.
  - **Honesty guardrail:** rating/review counts must reflect **real** App Store /
    Play aggregates — never fabricated. Fabricated ratings risk Google penalties
    and are dishonest.
- Auto-generated `sitemap.xml` (`@astrojs/sitemap`) + hand-authored `robots.txt`.
- Semantic heading hierarchy (one `<h1>` per page), descriptive alt text.
- Responsive, lazy-loaded images via Astro's `<Image>`; self-hosted fonts.
- Each persona page targets its own keyword cluster (e.g. *"online sports coaching
  for athletes"*, *"grow your coaching business"*, *"discover athlete talent"*).

---

## 7. Live Coaches (Firestore)

Port the existing read-only Firestore "top coaches" query into a **client-hydrated
Astro island** (`TopCoaches.astro` + a small script) so it stays dynamic without
blocking the static build or the hero's load. **Lazy/deferred** load so it never
hurts mobile LCP. Same graceful placeholder fallback as today. Reuses the existing
public web Firebase config (read-only; security enforced by Firestore rules).

---

## 8. Firebase Hosting Migration

- `firebase.json` hosting target serving Astro's `dist/`, with clean-URL rewrites
  and long-cache headers for hashed assets.
- `.github/workflows/deploy.yml`: on push to `main`, build Astro and deploy to
  Firebase Hosting (same auto-deploy DX as Vercel). PRs deploy to **preview
  channels** for review.
- **Cutover:** deploy to Firebase → verify on the `*.web.app` URL → repoint
  `ballmecca.com` + `www` DNS to Firebase → **retire the Vercel project and the
  Squarespace site**.
- Marketing site stays separate from the Flutter app at `app.ballmecca.com`.

---

## 9. Out of Scope (YAGNI)
- No CMS — blog is file-based MDX until volume justifies otherwise.
- No i18n, no auth, no e-commerce on the marketing site.
- No redesign of the Flutter app or `app.ballmecca.com`.
- Recruiter product features themselves (page sells the existing/early capability).

---

## 10. Migration of Existing Content
Port and re-theme existing pages: About, Contact (Formspree form preserved), FAQ
(accordion → `FaqAccordion` + `FAQPage` JSON-LD), Policies (sticky-sidebar layout +
placeholder slots preserved). Remove the committed macOS artifacts (`Icon\r`,
`.DS_Store`) and add them to `.gitignore` as part of the rebuild.
