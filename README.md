# Ballmecca — Marketing Website

The public marketing site for **Ballmecca**, a youth sports coaching marketplace.
Static site built with **Astro**, deployed on **Firebase Hosting**, with a small
**Cloud Function** backing the contact / early-access forms. Lives at
[ballmecca.com](https://ballmecca.com).

## Tech stack

- **[Astro](https://astro.build)** — static-site generator (pages in `src/pages`, prerendered to `dist/`)
- **Firebase Hosting** — serves the built `dist/` (custom domain `ballmecca.com`)
- **Firebase Cloud Functions** — `submitForm` handles form posts → Firestore + email
- **Firestore + Trigger Email extension** — stores submissions, emails `support@ballmecca.com`
- **Google Analytics 4** — gated behind a consent banner (loads only after opt-in; honors GPC)
- **Vitest** — unit tests for pure logic (`tests/`)

## Repository layout

```
src/
  pages/        Routes (index, athletes, coaches, recruiters, about, faq, contact, policies, blog/)
  components/   UI components (Hero, Nav, Footer, ConsentBanner, StoreBadges, …)
  layouts/      BaseLayout, PersonaLayout
  data/         Editable content: site.ts, coaches.ts, faqs.ts, personas.ts, sports.ts
  content/      Blog content collection (MDX) — src/content/blog/*.mdx
  styles/       tokens.css (brand tokens, mirror the app), global.css, fonts.css
  lib/          analytics.ts (consent-gated GA4), reveal.ts, persona.ts
public/         Static assets served as-is (images/, fonts/, robots.txt)
functions/      Cloud Function (submitForm) + its separate test package
firebase.json   Hosting (public: dist) + function rewrite (/api/submitForm)
```

## Local development

```bash
npm install
npm run dev      # dev server at http://localhost:4321
npm run build    # production build → dist/
npm run preview  # serve the built dist/
npx vitest run   # run unit tests
```

Node version is pinned in `.nvmrc` (20).

## Editing content

Most copy lives in typed data files — no component edits needed:

- **Site meta / links / GA4 id** — `src/data/site.ts`
- **Featured coaches** — `src/data/coaches.ts` (photos in `public/images/coaches/`)
- **FAQs** — `src/data/faqs.ts`
- **Persona pages** (athlete / coach / recruiter) — `src/data/personas.ts`
- **Legal policies** — `src/pages/policies.astro`
- **Blog posts** — add an MDX file under `src/content/blog/`

## Forms

The contact and early-access forms POST to `/api/submitForm`, rewritten to the
`submitForm` Cloud Function (`functions/index.js`). It validates input, stores the
submission in Firestore (`contactMessages` / `earlyAccessSignups`), and enqueues a
notification via the **Trigger Email** extension (`mail` collection).

```bash
cd functions && npm ci && cd test && npm install && npm test   # function unit tests
```

## Deployment

CI is **GitHub Actions** (`.github/workflows/deploy.yml`), authenticating to Google
Cloud **keylessly via Workload Identity Federation** (no stored service-account key):

- **Push to `main`** → build + test → deploy Hosting (live) **and** Functions
- **Open a PR** → deploy to a temporary **preview channel** (URL in the run logs)

Manual deploy (if ever needed):

```bash
npm run build
npx firebase-tools deploy --only hosting --project ballmeccaweb
```

## Analytics & privacy

GA4 does **not** load until the visitor accepts the consent banner
(`src/components/ConsentBanner.astro`); it honors Global Privacy Control and a stored
decline, and the footer's "Your Privacy Choices" link reopens it. See the Cookie and
Privacy policies in `src/pages/policies.astro`.

## Related

- **Firebase project:** `ballmeccaweb` (dedicated to this marketing site)
- **The Ballmecca app** (Flutter) lives in a separate repository.
- **Contact:** support@ballmecca.com
