# Ballmecca Website Astro Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Ballmecca marketing site as a static Astro site with a persona-aware home page, app-matched dark theme, fully-static curated coaches, Firebase-Cloud-Function-backed forms, an MDX blog, and full SEO — deployed to Firebase Hosting with auto-deploy from `main`.

**Architecture:** Astro outputs static HTML/CSS to `dist/`, served by Firebase Hosting. No client Firebase SDK. The only client JS is tiny deferred vanilla scripts (mobile nav, persona persistence) and the form `fetch`. Both forms POST to one Firebase Cloud Function (`submitForm`) that validates, writes to Firestore, and emails support. Content (personas, sports, FAQs, coaches, SEO) lives in typed `src/data/*.ts` files; the blog is an MDX content collection.

**Tech Stack:** Astro 4, `@astrojs/sitemap`, `@astrojs/mdx`, TypeScript, Vitest (unit tests for `persona.ts` + the Cloud Function), Firebase Hosting + Cloud Functions (Node 20), GitHub Actions.

**Source of truth for brand:** `../ballmecca4/lib/theme/app_colors.dart` (dark preset). Spec: `docs/superpowers/specs/2026-06-13-ballmecca-website-redesign-design.md`.

**Working branch:** `main` (per user decision).

**Verification note:** This is a presentational static site. Genuine unit tests (TDD) apply to the logic-bearing units — `src/lib/persona.ts` and the Cloud Function validator. Presentational components are verified by `npm run build` succeeding + `astro check` (0 errors) + a stated visual check, per the spec's "verify with a build check" allowance.

---

## File Structure

```
ballmecca-website/
├── package.json  astro.config.mjs  tsconfig.json  .nvmrc
├── firebase.json  .firebaserc
├── .github/workflows/deploy.yml
├── public/
│   ├── robots.txt
│   ├── fonts/            # self-hosted Anton, Open Sans, Nunito (subset)
│   └── images/           # existing imagery + images/coaches/
├── src/
│   ├── styles/{tokens.css, global.css}
│   ├── data/{site.ts, personas.ts, sports.ts, faqs.ts, coaches.ts}
│   ├── lib/persona.ts
│   ├── components/
│   │   ├── Nav.astro  Footer.astro  StoreBadges.astro
│   │   ├── PersonaSelector.astro  PersonaSwitcher.astro
│   │   ├── Hero.astro  StatBar.astro  HowItWorks.astro
│   │   ├── SportsCarousel.astro  TopCoaches.astro  MissionStrip.astro
│   │   ├── DownloadCTA.astro  Faq.astro  EarlyAccessForm.astro
│   │   ├── ContactForm.astro  Seo.astro  JsonLd.astro
│   ├── layouts/{BaseLayout.astro, PersonaLayout.astro}
│   ├── content/{config.ts, blog/*.mdx}
│   └── pages/
│       ├── index.astro
│       ├── athletes.astro  coaches.astro  recruiters.astro
│       ├── about.astro  contact.astro  faq.astro  policies.astro
│       └── blog/{index.astro, [...slug].astro}
├── functions/            # Cloud Function for forms (Node 20)
│   ├── package.json  index.js
│   └── test/{package.json, submitForm.test.js}
└── tests/persona.test.ts
```

Each `src/data/*.ts` file owns one content domain. Each component has one rendering responsibility. The three persona pages are thin wrappers over one `PersonaLayout` + `personas.ts` data, so distinct content lives in data, not duplicated markup.

---

## Phase 0 — Scaffold & Tooling

### Task 0.1: Remove macOS artifacts and add .gitignore entries

**Files:**
- Modify: `.gitignore`
- Delete: `Icon\r`, `.DS_Store`, `images/.DS_Store`

- [ ] **Step 1: Remove the artifacts and ignore them**

```bash
cd ~/Documents/ballmecca-website
git rm --cached -f ".DS_Store" "images/.DS_Store" "Icon"$'\r' 2>/dev/null || true
rm -f ".DS_Store" "images/.DS_Store" 2>/dev/null || true
printf '%s\n' "node_modules/" "dist/" ".astro/" ".DS_Store" "Icon?" "*.log" "functions/node_modules/" "functions/test/node_modules/" ".firebase/" "firebase-debug.log" >> .gitignore
sort -u .gitignore -o .gitignore
```

- [ ] **Step 2: Verify the tree is clean of artifacts**

Run: `git status --short`
Expected: `.DS_Store`/`Icon` show as deleted (staged); no untracked `.DS_Store`.

- [ ] **Step 3: Commit**

```bash
git add .gitignore && git commit -m "chore: remove macOS artifacts, expand .gitignore"
```

### Task 0.2: Initialize Astro project in place

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`, `src/env.d.ts`

The existing `*.html`/`css/`/`js/` stay untouched until Phase 4 ports them; Astro builds from `src/`.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "ballmecca-website",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run"
  },
  "dependencies": {
    "astro": "4.16.18",
    "@astrojs/sitemap": "3.2.1",
    "@astrojs/mdx": "3.1.9"
  },
  "devDependencies": {
    "@astrojs/check": "0.9.4",
    "typescript": "5.6.3",
    "vitest": "2.1.8"
  }
}
```

- [ ] **Step 2: Create .nvmrc**

```
20
```

- [ ] **Step 3: Create astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://ballmecca.com',
  integrations: [sitemap(), mdx()],
  build: { format: 'directory' }, // emits /about/index.html -> clean URL /about
});
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "functions"]
}
```

- [ ] **Step 5: Create src/env.d.ts**

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

- [ ] **Step 6: Install and verify build**

Run: `npm install && npm run build`
Expected: install succeeds; build reports "0 page(s) built" or builds an empty site with no error (no pages yet). No exceptions.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .nvmrc src/env.d.ts
git commit -m "chore: scaffold Astro project"
```

### Task 0.3: Brand tokens (dark only) + global CSS

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`

Values copied verbatim from `ballmecca4/lib/theme/app_colors.dart` dark preset (do not invent).

- [ ] **Step 1: Create src/styles/tokens.css**

```css
/* Brand tokens — mirror of ballmecca4 lib/theme/app_colors.dart (dark preset).
   Source of truth is the Dart file; do not change a hex without checking it. */
:root {
  color-scheme: dark;

  --brand-chrome: #06466A;
  --primary-action: #F35E0A;
  --link: #08B4B6;

  --canvas: #000000;
  --surface: #22222E;
  --surface-variant: #18181E;
  --border: #1F1F2A;

  --on-surface: #FAFAFA;
  --on-surface-variant: #B0BEC5;
  --muted: #95A1AC;

  --success: #068742;
  --warning: #F83502;
  --danger: #A7040E;

  --on-brand-chrome: #FFFFFF;
  --on-primary-action: #FFFFFF;
  --on-link: #FFFFFF;

  --font-display: 'Anton', system-ui, sans-serif;
  --font-heading: 'Open Sans', system-ui, sans-serif;
  --font-body: 'Nunito', system-ui, sans-serif;

  --maxw: 1160px;
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 20px;
  --space-1: 4px; --space-2: 8px; --space-3: 16px; --space-4: 24px;
  --space-5: 32px; --space-6: 48px; --space-7: 64px; --space-8: 96px;
}
```

- [ ] **Step 2: Create src/styles/global.css**

```css
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--canvas);
  color: var(--on-surface);
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3 { font-family: var(--font-heading); line-height: 1.1; }
.display { font-family: var(--font-display); text-transform: uppercase; letter-spacing: .5px; line-height: .95; }
a { color: var(--link); text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; height: auto; display: block; }
.container { width: 100%; max-width: var(--maxw); margin-inline: auto; padding-inline: var(--space-3); }
.text-accent { color: var(--link); }
.text-warm { color: var(--primary-action); }
.text-muted { color: var(--on-surface-variant); }
.visually-hidden { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; }
.skip-link { position:absolute; left:-999px; top:0; background:var(--primary-action); color:var(--on-primary-action); padding:8px 14px; z-index:1000; }
.skip-link:focus { left:8px; top:8px; }
:focus-visible { outline: 3px solid var(--link); outline-offset: 2px; }
.btn { display:inline-flex; align-items:center; gap:8px; font-family:var(--font-body); font-weight:700; border-radius:999px; padding:12px 22px; cursor:pointer; border:2px solid transparent; }
.btn-primary { background:var(--primary-action); color:var(--on-primary-action); }
.btn-accent { background:var(--link); color:var(--on-link); }
.btn-outline { border-color:var(--link); color:var(--link); background:transparent; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } * { animation: none !important; transition: none !important; } }
```

- [ ] **Step 3: Commit**

```bash
git add src/styles && git commit -m "feat: dark brand tokens + global css (mirror app_colors.dart)"
```

### Task 0.4: Self-host fonts

**Files:**
- Create: `public/fonts/` (Anton 400; Open Sans 400/600/700; Nunito 400/600/700/800), `src/styles/fonts.css`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Download subsetted woff2 into public/fonts/**

Run (from repo root):
```bash
mkdir -p public/fonts
# Use the fontsource woff2 files (latin subset). Download the 8 files:
#   anton-latin-400-normal.woff2
#   open-sans-latin-{400,600,700}-normal.woff2
#   nunito-latin-{400,600,700,800}-normal.woff2
# from https://cdn.jsdelivr.net/fontsource/fonts/<family>@latest/<file>
for f in \
  "anton@latest/latin-400-normal.woff2:anton-400.woff2" \
  "open-sans@latest/latin-400-normal.woff2:open-sans-400.woff2" \
  "open-sans@latest/latin-600-normal.woff2:open-sans-600.woff2" \
  "open-sans@latest/latin-700-normal.woff2:open-sans-700.woff2" \
  "nunito@latest/latin-400-normal.woff2:nunito-400.woff2" \
  "nunito@latest/latin-600-normal.woff2:nunito-600.woff2" \
  "nunito@latest/latin-700-normal.woff2:nunito-700.woff2" \
  "nunito@latest/latin-800-normal.woff2:nunito-800.woff2" ; do
  url="https://cdn.jsdelivr.net/fontsource/fonts/${f%%:*}"; out="public/fonts/${f##*:}"
  curl -fsSL "$url" -o "$out"
done
ls -1 public/fonts
```
Expected: 8 `.woff2` files listed.

- [ ] **Step 2: Create src/styles/fonts.css**

```css
@font-face { font-family:'Anton'; src:url('/fonts/anton-400.woff2') format('woff2'); font-weight:400; font-display:swap; }
@font-face { font-family:'Open Sans'; src:url('/fonts/open-sans-400.woff2') format('woff2'); font-weight:400; font-display:swap; }
@font-face { font-family:'Open Sans'; src:url('/fonts/open-sans-600.woff2') format('woff2'); font-weight:600; font-display:swap; }
@font-face { font-family:'Open Sans'; src:url('/fonts/open-sans-700.woff2') format('woff2'); font-weight:700; font-display:swap; }
@font-face { font-family:'Nunito'; src:url('/fonts/nunito-400.woff2') format('woff2'); font-weight:400; font-display:swap; }
@font-face { font-family:'Nunito'; src:url('/fonts/nunito-600.woff2') format('woff2'); font-weight:600; font-display:swap; }
@font-face { font-family:'Nunito'; src:url('/fonts/nunito-700.woff2') format('woff2'); font-weight:700; font-display:swap; }
@font-face { font-family:'Nunito'; src:url('/fonts/nunito-800.woff2') format('woff2'); font-weight:800; font-display:swap; }
```

- [ ] **Step 3: Import fonts first in global.css**

At the very top of `src/styles/global.css`, above the tokens import:
```css
@import './fonts.css';
```

- [ ] **Step 4: Commit**

```bash
git add public/fonts src/styles && git commit -m "feat: self-host subsetted fonts (Anton/Open Sans/Nunito)"
```

---

## Phase 1 — Site Data & Shared Layout

### Task 1.1: Site-wide data file

**Files:**
- Create: `src/data/site.ts`

- [ ] **Step 1: Create src/data/site.ts**

```ts
export const site = {
  name: 'Ballmecca',
  url: 'https://ballmecca.com',
  tagline: 'Revolutionizing sports education for the next generation.',
  description:
    'Ballmecca connects athletes with verified coaches through bite-sized video coaching. Upload a clip, get expert feedback, level up — anywhere.',
  email: 'support@ballmecca.com',
  appStoreUrl: 'https://apps.apple.com/us/app/ballmecca/id1663498139',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.ballmecca.ballmecca',
  social: {
    instagram: 'https://www.instagram.com/ballmecca/',
    youtube: 'https://www.youtube.com/@ballmecca',
  },
  formEndpoint: '/api/submitForm', // rewritten to the Cloud Function in firebase.json
} as const;
```

- [ ] **Step 2: Typecheck and commit**

Run: `npx astro check` (expect 0 errors for this file)
```bash
git add src/data/site.ts && git commit -m "feat: site-wide data"
```

### Task 1.2: SEO + JSON-LD components

**Files:**
- Create: `src/components/Seo.astro`, `src/components/JsonLd.astro`

- [ ] **Step 1: Create src/components/Seo.astro**

```astro
---
import { site } from '../data/site';
interface Props {
  title: string;
  description?: string;
  path: string;            // e.g. "/athletes"
  ogImage?: string;        // absolute or root-relative
  noindex?: boolean;
}
const { title, description = site.description, path, ogImage = '/images/og-default.jpg', noindex = false } = Astro.props;
const canonical = new URL(path, site.url).href;
const ogAbs = new URL(ogImage, site.url).href;
const fullTitle = path === '/' ? `${site.name} — ${site.tagline}` : `${title} | ${site.name}`;
---
<title>{fullTitle}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
{noindex && <meta name="robots" content="noindex,nofollow" />}
<meta name="color-scheme" content="dark" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content={site.name} />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogAbs} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={fullTitle} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogAbs} />
```

- [ ] **Step 2: Create src/components/JsonLd.astro**

```astro
---
interface Props { schema: Record<string, unknown> }
const { schema } = Astro.props;
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} is:inline />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Seo.astro src/components/JsonLd.astro
git commit -m "feat: SEO meta + JSON-LD components"
```

### Task 1.3: Nav, Footer, StoreBadges

**Files:**
- Create: `src/components/StoreBadges.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Create src/components/StoreBadges.astro**

```astro
---
import { site } from '../data/site';
interface Props { source: string } // analytics label, e.g. "hero"
const { source } = Astro.props;
---
<div class="store-badges">
  <a class="badge" href={site.appStoreUrl} target="_blank" rel="noopener"
     data-event="store_click" data-store="app_store" data-source={source}>
    <span class="badge-sub">Download on the</span><span class="badge-main">App Store</span>
  </a>
  <a class="badge" href={site.playStoreUrl} target="_blank" rel="noopener"
     data-event="store_click" data-store="google_play" data-source={source}>
    <span class="badge-sub">Get it on</span><span class="badge-main">Google Play</span>
  </a>
</div>
<style>
  .store-badges { display:flex; gap:12px; flex-wrap:wrap; }
  .badge { display:flex; flex-direction:column; background:var(--surface); border:1px solid var(--border);
    color:var(--on-surface); border-radius:var(--radius-sm); padding:8px 16px; min-width:150px; }
  .badge:hover { text-decoration:none; border-color:var(--link); }
  .badge-sub { font-size:11px; color:var(--on-surface-variant); }
  .badge-main { font-size:18px; font-weight:700; }
</style>
```

- [ ] **Step 2: Create src/components/Nav.astro**

```astro
---
import { site } from '../data/site';
const links = [
  { href: '/athletes', label: 'Athletes' },
  { href: '/coaches', label: 'Coaches' },
  { href: '/recruiters', label: 'Recruiters' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];
const current = Astro.url.pathname.replace(/\/$/, '') || '/';
---
<nav class="nav">
  <div class="container nav-inner">
    <a href="/" class="nav-logo display">Ballmecca</a>
    <button class="nav-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="nav-menu">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav-links" id="nav-menu">
      {links.map((l) => (
        <li><a href={l.href} aria-current={current === l.href ? 'page' : undefined}>{l.label}</a></li>
      ))}
    </ul>
  </div>
</nav>
<style>
  .nav { position:sticky; top:0; z-index:100; background:var(--brand-chrome); }
  .nav-inner { display:flex; align-items:center; justify-content:space-between; height:64px; }
  .nav-logo { color:var(--on-brand-chrome); font-size:24px; }
  .nav-logo:hover { text-decoration:none; }
  .nav-links { display:flex; gap:22px; list-style:none; margin:0; padding:0; }
  .nav-links a { color:var(--on-brand-chrome); font-weight:600; font-size:15px; }
  .nav-links a[aria-current='page'] { color:var(--link); }
  .nav-toggle { display:none; flex-direction:column; gap:5px; background:none; border:0; cursor:pointer; padding:8px; }
  .nav-toggle span { width:24px; height:2px; background:var(--on-brand-chrome); display:block; }
  @media (max-width: 820px) {
    .nav-toggle { display:flex; }
    .nav-links { position:absolute; top:64px; left:0; right:0; flex-direction:column; gap:0;
      background:var(--brand-chrome); max-height:0; overflow:hidden; transition:max-height .25s ease; }
    .nav-links.open { max-height:420px; }
    .nav-links li { border-top:1px solid rgba(255,255,255,.12); }
    .nav-links a { display:block; padding:14px 20px; }
  }
</style>
<script>
  const t = document.getElementById('nav-toggle');
  const m = document.getElementById('nav-menu');
  t?.addEventListener('click', () => {
    const open = m?.classList.toggle('open');
    t.setAttribute('aria-expanded', String(!!open));
  });
</script>
```

- [ ] **Step 3: Create src/components/Footer.astro**

```astro
---
import { site } from '../data/site';
---
<footer class="footer">
  <div class="container footer-grid">
    <div>
      <div class="display footer-logo">Ballmecca</div>
      <p class="text-muted">{site.tagline}</p>
      <div class="footer-social">
        <a href={site.social.instagram} target="_blank" rel="noopener">Instagram</a>
        <a href={site.social.youtube} target="_blank" rel="noopener">YouTube</a>
      </div>
    </div>
    <div>
      <h4>Explore</h4>
      <ul>
        <li><a href="/athletes">Athletes</a></li>
        <li><a href="/coaches">Coaches</a></li>
        <li><a href="/recruiters">Recruiters</a></li>
        <li><a href="/blog">Blog</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </div>
    <div>
      <h4>Legal</h4>
      <ul>
        <li><a href="/policies#privacy">Privacy</a></li>
        <li><a href="/policies#terms">Terms</a></li>
        <li><a href="/policies#acceptable-use">Acceptable Use</a></li>
        <li><a href="/policies#dmca">DMCA</a></li>
      </ul>
    </div>
    <div>
      <h4>Get the app</h4>
      <ul>
        <li><a href={site.appStoreUrl} target="_blank" rel="noopener">App Store</a></li>
        <li><a href={site.playStoreUrl} target="_blank" rel="noopener">Google Play</a></li>
        <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
      </ul>
    </div>
  </div>
  <div class="container footer-bottom"><p class="text-muted">© 2026 Ballmecca Inc. All rights reserved.</p></div>
</footer>
<style>
  .footer { background:var(--surface-variant); border-top:1px solid var(--border); padding:56px 0 24px; margin-top:80px; }
  .footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:32px; }
  .footer-logo { font-size:26px; color:var(--link); }
  .footer h4 { font-size:14px; text-transform:uppercase; letter-spacing:1px; color:var(--on-surface-variant); }
  .footer ul { list-style:none; padding:0; margin:0; display:grid; gap:8px; }
  .footer-social { display:flex; gap:16px; margin-top:12px; }
  .footer-bottom { margin-top:40px; padding-top:20px; border-top:1px solid var(--border); }
  @media (max-width:820px){ .footer-grid{ grid-template-columns:1fr 1fr; } }
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/StoreBadges.astro src/components/Nav.astro src/components/Footer.astro
git commit -m "feat: nav, footer, store badges"
```

### Task 1.4: BaseLayout + analytics hook

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/lib/analytics.ts`

- [ ] **Step 1: Create src/lib/analytics.ts**

Lightweight, dependency-free event delegation on `[data-event]`. Replace the `send()` body with the chosen provider in Phase 8; until then it is a no-op that logs in dev.

```ts
export function send(event: string, params: Record<string, string> = {}) {
  if (typeof window === 'undefined') return;
  // Phase 8 wires a real provider here.
  if (import.meta.env.DEV) console.debug('[analytics]', event, params);
  // @ts-expect-error optional global
  window.dataLayer?.push({ event, ...params });
}

export function initDelegation() {
  document.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement)?.closest('[data-event]') as HTMLElement | null;
    if (!el) return;
    const { event, ...rest } = el.dataset as Record<string, string>;
    if (event) send(event, rest);
  });
}
```

- [ ] **Step 2: Create src/layouts/BaseLayout.astro**

```astro
---
import '../styles/global.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
import Seo from '../components/Seo.astro';
interface Props {
  title: string; description?: string; path: string; ogImage?: string; noindex?: boolean;
}
const { title, description, path, ogImage, noindex } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/images/favicon.png" />
  <link rel="preload" href="/fonts/anton-400.woff2" as="font" type="font/woff2" crossorigin />
  <Seo title={title} description={description} path={path} ogImage={ogImage} noindex={noindex} />
  <slot name="head" />
</head>
<body>
  <a href="#main" class="skip-link">Skip to content</a>
  <Nav />
  <main id="main"><slot /></main>
  <Footer />
  <script>
    import { initDelegation } from '../lib/analytics';
    initDelegation();
  </script>
</body>
</html>
```

- [ ] **Step 3: Create a temporary home page to verify the layout builds**

Create `src/pages/index.astro`:
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout title="Home" path="/">
  <section class="container" style="padding:80px 0;">
    <h1 class="display" style="font-size:56px;">Ballmecca</h1>
    <p class="text-muted">Scaffolding works.</p>
  </section>
</BaseLayout>
```

- [ ] **Step 4: Build and verify**

Run: `npm run build && npx astro check`
Expected: build emits `dist/index.html`; `astro check` reports 0 errors.
Visual check: `npm run dev`, open `http://localhost:4321/` — dark page, blue sticky nav, footer, fonts applied.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/lib/analytics.ts src/pages/index.astro
git commit -m "feat: BaseLayout + analytics delegation + scaffold home"
```

---

## Phase 2 — Home Page (value-first, persona-second)

### Task 2.1: Content data — sports & coaches

**Files:**
- Create: `src/data/sports.ts`, `src/data/coaches.ts`
- Create: `public/images/coaches/.gitkeep`

- [ ] **Step 1: Create src/data/sports.ts**

```ts
export interface Sport { name: string; icon: string; comingSoon?: boolean }
export const sports: Sport[] = [
  { name: 'Basketball', icon: '🏀' },
  { name: 'Baseball', icon: '⚾' },
  { name: 'Softball', icon: '🥎' },
  { name: 'Soccer', icon: '⚽' },
  { name: 'Football', icon: '🏈' },
  { name: 'Tennis', icon: '🎾' },
  { name: 'Golf', icon: '⛳' },
  { name: 'Swimming', icon: '🏊' },
  { name: 'Track & Field', icon: '🏃' },
  { name: 'Gymnastics', icon: '🤸' },
  { name: 'Hockey', icon: '🏒' },
  { name: 'Dance', icon: '💃', comingSoon: true },
];
```

- [ ] **Step 2: Create src/data/coaches.ts (static, curated — placeholder entries until real list provided)**

```ts
export interface Coach {
  name: string;
  sport: string;
  image: string;       // path under /images/coaches/
  credential?: string; // real credential only
  location?: string;
}
// NOTE: Curated, fully static. Replace with the real coach list + photos the
// user supplies (spec §7 / §12). No Firestore read. `image` files live in
// public/images/coaches/. Until then these render with an initial-avatar fallback.
export const featuredCoaches: Coach[] = [
  { name: 'Coach Marcus T.', sport: 'Basketball', image: '/images/coaches/marcus.jpg', location: 'Los Angeles, CA' },
  { name: 'Coach Denise W.', sport: 'Tennis', image: '/images/coaches/denise.jpg', location: 'Atlanta, GA' },
  { name: 'Coach David R.', sport: 'Baseball', image: '/images/coaches/david.jpg', location: 'Miami, FL' },
  { name: 'Coach Sarah K.', sport: 'Golf', image: '/images/coaches/sarah.jpg', location: 'Phoenix, AZ' },
];
```

- [ ] **Step 3: Keep the coaches image dir tracked**

```bash
mkdir -p public/images/coaches && touch public/images/coaches/.gitkeep
```

- [ ] **Step 4: Commit**

```bash
git add src/data/sports.ts src/data/coaches.ts public/images/coaches/.gitkeep
git commit -m "feat: sports + curated static coaches data"
```

### Task 2.2: Presentational sections — StatBar, HowItWorks, SportsCarousel, TopCoaches, MissionStrip, DownloadCTA

**Files:**
- Create: `src/components/StatBar.astro`, `HowItWorks.astro`, `SportsCarousel.astro`, `TopCoaches.astro`, `MissionStrip.astro`, `DownloadCTA.astro`

- [ ] **Step 1: Create src/components/StatBar.astro**

```astro
---
const stats = [
  { value: '68%', label: 'of youth coaches are unpaid volunteers', cls: 'text-warm' },
  { value: '20+', label: 'sports covered', cls: 'text-accent' },
  { value: '100%', label: 'verified coaches', cls: 'text-warm' },
];
---
<section class="statbar"><div class="container statbar-inner">
  {stats.map((s) => (
    <div class="stat"><span class={`stat-value ${s.cls}`}>{s.value}</span><span class="text-muted">{s.label}</span></div>
  ))}
</div></section>
<style>
  .statbar { background:var(--surface); border-block:1px solid var(--border); }
  .statbar-inner { display:flex; justify-content:space-around; gap:24px; padding:28px 0; text-align:center; flex-wrap:wrap; }
  .stat { display:flex; flex-direction:column; gap:6px; }
  .stat-value { font-family:var(--font-display); font-size:40px; }
</style>
```

- [ ] **Step 2: Create src/components/HowItWorks.astro**

```astro
---
const steps = [
  { n: '01', icon: '📹', h: 'Upload a video', p: 'Record a swing, throw, or serve and send it to your chosen coach.' },
  { n: '02', icon: '🎯', h: 'Get matched with a coach', p: 'Browse verified coaches in your sport — all vetted professionals.' },
  { n: '03', icon: '⚡', h: 'Receive expert feedback', p: 'Get a 1–5 minute personalized video analysis with targeted drills.' },
];
---
<section class="container how">
  <p class="eyebrow text-warm">How it works</p>
  <h2 class="display how-title">Three steps to better performance.</h2>
  <div class="how-grid">
    {steps.map((s) => (
      <div class="how-card">
        <div class="how-num text-muted">{s.n}</div>
        <div class="how-icon" aria-hidden="true">{s.icon}</div>
        <h3>{s.h}</h3>
        <p class="text-muted">{s.p}</p>
      </div>
    ))}
  </div>
</section>
<style>
  .how { padding:80px 0; }
  .eyebrow { text-transform:uppercase; letter-spacing:2px; font-size:13px; font-weight:700; }
  .how-title { font-size:40px; margin:8px 0 32px; }
  .how-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
  .how-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-md); padding:28px; }
  .how-num { font-family:var(--font-display); font-size:28px; }
  .how-icon { font-size:36px; margin:8px 0; }
  @media (max-width:820px){ .how-grid{ grid-template-columns:1fr; } }
</style>
```

- [ ] **Step 3: Create src/components/SportsCarousel.astro (CSS scroll-snap, no JS)**

```astro
---
import { sports } from '../data/sports';
import { site } from '../data/site';
---
<section class="container sports">
  <p class="eyebrow text-accent">On the platform</p>
  <h2 class="display sports-title">Find coaching in your sport.</h2>
  <div class="sports-track" role="list">
    {sports.map((s) => (
      <div class="sport" role="listitem">
        <div class="sport-icon" aria-hidden="true">{s.icon}</div>
        <div class="sport-name">{s.name}</div>
        {s.comingSoon && <span class="soon">Coming soon</span>}
      </div>
    ))}
  </div>
  <a class="btn btn-outline" href={site.appStoreUrl} target="_blank" rel="noopener" data-event="store_click" data-store="app_store" data-source="sports">Get the app</a>
</section>
<style>
  .sports { padding:40px 0 80px; }
  .sports-title { font-size:40px; margin:8px 0 24px; }
  .sports-track { display:flex; gap:16px; overflow-x:auto; scroll-snap-type:x mandatory; padding-bottom:12px; }
  .sport { scroll-snap-align:start; flex:0 0 140px; background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-md); padding:24px; text-align:center; position:relative; }
  .sport-icon { font-size:40px; }
  .sport-name { margin-top:8px; font-weight:700; }
  .soon { position:absolute; top:8px; right:8px; font-size:10px; background:var(--primary-action);
    color:var(--on-primary-action); padding:2px 8px; border-radius:999px; }
</style>
```

- [ ] **Step 4: Create src/components/TopCoaches.astro (static)**

```astro
---
import { featuredCoaches } from '../data/coaches';
function initial(name: string) { return name.replace(/^Coach\s+/i, '').trim()[0] ?? '?'; }
---
<section class="container coaches">
  <p class="eyebrow text-accent">Top performers</p>
  <h2 class="display coaches-title">Meet our coaches.</h2>
  <div class="coaches-grid">
    {featuredCoaches.map((c) => (
      <article class="coach">
        <div class="coach-photo">
          <img src={c.image} alt={`${c.name}, ${c.sport} coach`} loading="lazy" width="320" height="320"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
          <div class="coach-fallback" style="display:none;" aria-hidden="true">{initial(c.name)}</div>
        </div>
        <div class="coach-body">
          <div class="text-accent coach-sport">{c.sport}</div>
          <h3>{c.name}</h3>
          {c.location && <div class="text-muted coach-loc">📍 {c.location}</div>}
        </div>
      </article>
    ))}
  </div>
</section>
<style>
  .coaches { padding:40px 0 80px; }
  .coaches-title { font-size:40px; margin:8px 0 24px; }
  .coaches-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
  .coach { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-md); overflow:hidden; }
  .coach-photo { aspect-ratio:1; background:var(--surface-variant); }
  .coach-photo img { width:100%; height:100%; object-fit:cover; }
  .coach-fallback { width:100%; height:100%; align-items:center; justify-content:center;
    font-family:var(--font-display); font-size:48px; color:var(--link); }
  .coach-body { padding:16px; }
  .coach-sport { font-size:13px; font-weight:700; }
  @media (max-width:820px){ .coaches-grid{ grid-template-columns:1fr 1fr; } }
</style>
```

- [ ] **Step 5: Create src/components/MissionStrip.astro**

```astro
---
const img = '/images/acro.jpg';
---
<section class="mission"><div class="container mission-inner">
  <div>
    <p class="eyebrow text-warm">Our mission</p>
    <h2 class="display mission-title">With the right guidance, anyone can achieve greatness.</h2>
    <p class="text-muted">Too often, access to quality coaching is limited by zip code or income. Ballmecca is leveling the playing field — giving every kid a shot through mentorship, passion, and accountability.</p>
    <a class="btn btn-primary" href="/about">Our story</a>
  </div>
  <img src={img} alt="A young athlete training with a coach" loading="lazy" width="560" height="420" />
</div></section>
<style>
  .mission { background:var(--surface); border-block:1px solid var(--border); padding:72px 0; }
  .mission-inner { display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center; }
  .mission-title { font-size:36px; margin:8px 0 16px; }
  .mission img { border-radius:var(--radius-md); }
  @media (max-width:820px){ .mission-inner{ grid-template-columns:1fr; } }
</style>
```

- [ ] **Step 6: Create src/components/DownloadCTA.astro**

```astro
---
import StoreBadges from './StoreBadges.astro';
interface Props { source?: string }
const { source = 'download_section' } = Astro.props;
---
<section class="container download">
  <p class="eyebrow text-accent">Mobile app</p>
  <h2 class="display download-title">Elite coaching, in your pocket.</h2>
  <p class="text-muted">Whether you're chasing a dream or building a coaching business, Ballmecca puts it within reach. Anytime. Anywhere.</p>
  <StoreBadges source={source} />
</section>
<style>
  .download { padding:80px 0; text-align:center; }
  .download-title { font-size:40px; margin:8px 0 12px; }
  .download .store-badges { justify-content:center; margin-top:20px; }
</style>
```

- [ ] **Step 7: Build, check, commit**

Run: `npm run build && npx astro check`
Expected: 0 errors.
```bash
git add src/components/StatBar.astro src/components/HowItWorks.astro src/components/SportsCarousel.astro src/components/TopCoaches.astro src/components/MissionStrip.astro src/components/DownloadCTA.astro
git commit -m "feat: home page sections"
```

### Task 2.3: Hero + PersonaSelector + assemble home

**Files:**
- Create: `src/components/Hero.astro`, `src/components/PersonaSelector.astro`
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Create src/components/Hero.astro**

```astro
---
import { site } from '../data/site';
import StoreBadges from './StoreBadges.astro';
const heroImg = '/images/hero-basketball.jpg';
---
<section class="hero" style={`background-image:linear-gradient(120deg, rgba(6,70,106,.92), rgba(0,0,0,.78)), url('${heroImg}')`}>
  <div class="container hero-content">
    <p class="eyebrow text-accent">Join the movement</p>
    <h1 class="display hero-title">Revolutionizing sports education for <span class="text-accent">the next generation.</span></h1>
    <p class="hero-sub">Upload a clip. Get personalized feedback from a verified coach. Level up — anywhere.</p>
    <StoreBadges source="hero" />
  </div>
</section>
<style>
  .hero { background-size:cover; background-position:center; }
  .hero-content { padding:96px 0; max-width:780px; }
  .hero-title { font-size:clamp(40px, 7vw, 76px); margin:12px 0; }
  .hero-sub { font-size:19px; color:#dfe7ec; max-width:560px; margin-bottom:24px; }
</style>
```

- [ ] **Step 2: Create src/components/PersonaSelector.astro**

```astro
---
import { personas } from '../data/personas'; // created in Phase 3, Task 3.1
---
<section class="container selector">
  <h2 class="display selector-title">Find the tour built for you.</h2>
  <p class="text-muted">Not sure? Just grab the app above — this is only a guided tour.</p>
  <div class="selector-grid">
    {personas.map((p) => (
      <a class="persona-card" href={p.href} data-persona={p.key} data-event="persona_select" data-source="home">
        <div class="persona-emoji" aria-hidden="true">{p.emoji}</div>
        <h3>I'm {p.article} {p.noun}</h3>
        <p class="text-muted">{p.tagline}</p>
        <span class="persona-arrow text-accent">{p.cta} →</span>
      </a>
    ))}
  </div>
</section>
<style>
  .selector { padding:72px 0; text-align:center; }
  .selector-title { font-size:36px; }
  .selector-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:28px; }
  .persona-card { display:block; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg);
    padding:32px; text-align:left; color:var(--on-surface); transition:border-color .2s, transform .2s; }
  .persona-card:hover { text-decoration:none; border-color:var(--link); transform:translateY(-4px); }
  .persona-card[data-highlight] { border-color:var(--primary-action); box-shadow:0 0 0 2px var(--primary-action) inset; }
  .persona-emoji { font-size:40px; }
  .persona-arrow { font-weight:700; }
  @media (max-width:820px){ .selector-grid{ grid-template-columns:1fr; } }
</style>
<script>
  import { getPersona } from '../lib/persona';
  const saved = getPersona();
  if (saved) document.querySelector(`.persona-card[data-persona="${saved}"]`)?.setAttribute('data-highlight', 'true');
</script>
```

- [ ] **Step 3: Replace src/pages/index.astro with the full home page**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import JsonLd from '../components/JsonLd.astro';
import Hero from '../components/Hero.astro';
import PersonaSelector from '../components/PersonaSelector.astro';
import StatBar from '../components/StatBar.astro';
import HowItWorks from '../components/HowItWorks.astro';
import SportsCarousel from '../components/SportsCarousel.astro';
import TopCoaches from '../components/TopCoaches.astro';
import MissionStrip from '../components/MissionStrip.astro';
import DownloadCTA from '../components/DownloadCTA.astro';
import { site } from '../data/site';

const appSchema = {
  '@context': 'https://schema.org', '@type': 'MobileApplication',
  name: 'Ballmecca', operatingSystem: 'iOS, Android', applicationCategory: 'SportsApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: site.url, downloadUrl: [site.appStoreUrl, site.playStoreUrl],
  // NOTE: add aggregateRating ONLY with REAL store numbers (spec §6 honesty guardrail).
};
---
<BaseLayout title="Home" path="/">
  <JsonLd slot="head" schema={appSchema} />
  <Hero />
  <PersonaSelector />
  <StatBar />
  <HowItWorks />
  <SportsCarousel />
  <TopCoaches />
  <MissionStrip />
  <DownloadCTA />
</BaseLayout>
```

- [ ] **Step 4: Build, check, visual verify, commit**

Run: `npm run build && npx astro check`
Expected: 0 errors (after Task 3.1's `personas.ts` exists; if running strictly in order, do Task 3.1 first — see note). Visual: hero → persona cards → sections render top to bottom.

> **Ordering note:** `PersonaSelector` imports `personas.ts`. If executing strictly top-to-bottom, do **Task 3.1 before** Task 2.3 Step 4's build. The commit below is fine to make after 3.1.

```bash
git add src/components/Hero.astro src/components/PersonaSelector.astro src/pages/index.astro
git commit -m "feat: home hero + persona selector + assembled home page"
```

---

## Phase 3 — Persona Pages & Switcher

### Task 3.1: Persona data (distinct content per persona)

**Files:**
- Create: `src/data/personas.ts`

- [ ] **Step 1: Create src/data/personas.ts**

```ts
export type PersonaKey = 'athlete' | 'coach' | 'recruiter';

export interface PersonaSection { heading: string; body: string }
export interface PersonaFaq { q: string; a: string }

export interface Persona {
  key: PersonaKey;
  noun: string; article: 'an' | 'a'; emoji: string; href: string;
  tagline: string;            // selector card subtitle
  cta: string;                // selector card CTA label
  seoTitle: string; seoDescription: string;
  heroPromise: string;        // distinct hero headline
  heroSub: string;
  primaryCta: 'download' | 'earlyAccess';
  why: PersonaSection[];      // 3 distinct value props
  model: PersonaSection;      // pricing / business model section
  testimonial: { quote: string; attribution: string };
  faqs: PersonaFaq[];         // distinct subset
  keywords: string;
}

export const personas: Persona[] = [
  {
    key: 'athlete', noun: 'Athlete', article: 'an', emoji: '🏅', href: '/athletes',
    tagline: 'Train like the pros, from your phone.', cta: 'Explore for athletes',
    seoTitle: 'Online Sports Coaching for Athletes',
    seoDescription: 'Upload a clip and get personalized video feedback from verified coaches in days. Affordable 1-on-1 sports coaching for athletes of every level.',
    heroPromise: 'Train like the pros. From your phone.',
    heroSub: 'Upload a clip, get personalized video feedback from a verified coach in days. No travel, no scheduling.',
    primaryCta: 'download',
    why: [
      { heading: 'Feedback in days, not weeks', body: 'Send a clip and get a 1–5 minute breakdown with targeted drills — no waiting for the next in-person session.' },
      { heading: 'A fraction of in-person rates', body: 'Pay per session at prices coaches set. Referral discounts and free sessions via the Coaching Fund keep it accessible.' },
      { heading: 'Verified coaches, any sport', body: 'Every coach is vetted with real credentials, across 20+ sports — wherever you live.' },
    ],
    model: { heading: 'Simple, pay-as-you-go', body: 'No subscription required. Pay only for the sessions you book; each coach sets their own price. Earn referral discounts and qualify for free sessions through the Coaching Fund.' },
    testimonial: { quote: 'Fixed my jump shot in two sessions. My coach broke down exactly what I was doing wrong.', attribution: 'Jordan, 15' },
    faqs: [
      { q: 'Is Ballmecca safe for minors?', a: 'Yes. Young athletes use parent-managed accounts, and all coaches are verified.' },
      { q: 'How fast will I get feedback?', a: 'Most coaches respond within a few days; many far sooner.' },
      { q: 'How do payments work?', a: 'Securely through Stripe inside the app. You only pay for sessions you book.' },
    ],
    keywords: 'online sports coaching, video analysis for athletes, remote sports coach',
  },
  {
    key: 'coach', noun: 'Coach', article: 'a', emoji: '🎽', href: '/coaches',
    tagline: 'Build your coaching business.', cta: 'Explore for coaches',
    seoTitle: 'Grow Your Coaching Business',
    seoDescription: 'Coach athletes anywhere, set your own prices, and get paid via Stripe. Build your roster and earn with Ballmecca\'s referral and subscription model.',
    heroPromise: 'Coach anywhere. Get paid. Grow your roster.',
    heroSub: 'Turn your expertise into income. Set your prices, review athletes on your schedule, and get paid securely.',
    primaryCta: 'download',
    why: [
      { heading: 'Set your own prices', body: 'You decide what a session costs. Ballmecca adds a small platform fee on top — you keep the rest.' },
      { heading: 'Get paid via Stripe', body: 'Payouts are automatic and secure. No invoicing, no chasing payments.' },
      { heading: 'Grow with referrals & subscriptions', body: 'Earn from athletes you refer and offer team subscriptions for recurring income.' },
    ],
    model: { heading: 'Keep more of what you earn', body: 'Price each session yourself; Ballmecca adds a 15% platform fee on top of your rate. Offer Foundations, Varsity, or Pro team subscriptions, and earn 50% of Ballmecca\'s fee on one-off sessions from athletes you referred.' },
    testimonial: { quote: 'I coach kids across three states now — all from my phone between practices.', attribution: 'Coach Marcus, basketball' },
    faqs: [
      { q: 'How do I get paid?', a: 'Automatically via Stripe after each completed session.' },
      { q: 'Can college athletes coach?', a: 'Yes — college athletes can coach younger athletes with a college-athlete profile.' },
      { q: 'What does it cost me?', a: 'Nothing to join. Ballmecca adds a 15% platform fee on top of your set price.' },
    ],
    keywords: 'become a sports coach online, coaching business app, get paid to coach',
  },
  {
    key: 'recruiter', noun: 'Recruiter', article: 'a', emoji: '🔎', href: '/recruiters',
    tagline: 'Discover verified talent. Early access.', cta: 'Get early access',
    seoTitle: 'Discover Verified Athlete Talent (Early Access)',
    seoDescription: 'Ballmecca is building tools for recruiters to discover verified, up-and-coming athletes by sport and skill. Join early access to help shape it.',
    heroPromise: 'Discover the next generation of talent.',
    heroSub: 'We\'re building recruiter tools to surface verified, motivated athletes by sport and skill. Early access is open — help shape what we build.',
    primaryCta: 'earlyAccess',
    why: [
      { heading: 'Verified, motivated athletes', body: 'Athletes on Ballmecca actively train and submit real performance video — a signal of commitment, not just a profile.' },
      { heading: 'Discovery by sport & skill', body: 'Our roadmap focuses on surfacing talent across 20+ sports, filterable by discipline and development.' },
      { heading: 'Shape the product', body: 'Early-access recruiters get a direct line to our team and influence over the features we ship first.' },
    ],
    model: { heading: 'Where recruiter tools are today', body: 'Recruiter features are in early development. Today you can explore the platform and the athletes on it; dedicated discovery and outreach tooling is on the roadmap. We\'re being upfront: join early access for honest updates as it ships — not a finished dashboard.' },
    testimonial: { quote: 'The verified-video angle is exactly what scouting at the youth level has been missing.', attribution: 'Early-access recruiter' },
    faqs: [
      { q: 'Is there a recruiter dashboard today?', a: 'Not yet — recruiter tooling is in early development. Early access gets you updates as features ship.' },
      { q: 'What can I do right now?', a: 'Explore the platform and the athletes on it, and tell us what you need from recruiter tools.' },
      { q: 'How do I join?', a: 'Add your email below and we\'ll bring you in as features become available.' },
    ],
    keywords: 'athlete recruiting platform, discover youth sports talent, scout athletes online',
  },
];

export const personaByKey = (k: PersonaKey) => personas.find((p) => p.key === k)!;
```

- [ ] **Step 2: Typecheck and commit**

Run: `npx astro check`
Expected: 0 errors.
```bash
git add src/data/personas.ts && git commit -m "feat: distinct persona content data"
```

### Task 3.2: persona.ts (localStorage) — TDD

**Files:**
- Create: `src/lib/persona.ts`, `tests/persona.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] } });
```

Add `jsdom` to devDependencies:
```bash
npm install -D jsdom@25.0.1
```

- [ ] **Step 2: Write the failing test — tests/persona.test.ts**

Intended behavior (from spec §4): `getPersona` returns a valid stored key or null; `setPersona` persists only valid keys; invalid/garbage values never round-trip. These kill: a no-op getter (returns null always), a setter that stores anything (no validation), and a typo'd storage key mismatch between get/set.

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { getPersona, setPersona, PERSONA_STORAGE_KEY } from '../src/lib/persona';

beforeEach(() => localStorage.clear());

describe('persona persistence', () => {
  it('returns null when nothing stored', () => {
    expect(getPersona()).toBeNull();
  });
  it('persists and reads back a valid persona', () => {
    setPersona('coach');
    expect(getPersona()).toBe('coach');
    expect(localStorage.getItem(PERSONA_STORAGE_KEY)).toBe('coach');
  });
  it('round-trips all three valid keys', () => {
    for (const k of ['athlete', 'coach', 'recruiter'] as const) {
      setPersona(k); expect(getPersona()).toBe(k);
    }
  });
  it('ignores an invalid value on read (returns null)', () => {
    localStorage.setItem(PERSONA_STORAGE_KEY, 'banana');
    expect(getPersona()).toBeNull();
  });
  it('refuses to store an invalid value', () => {
    // @ts-expect-error testing runtime guard
    setPersona('banana');
    expect(localStorage.getItem(PERSONA_STORAGE_KEY)).toBeNull();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/lib/persona'`.

- [ ] **Step 4: Implement src/lib/persona.ts**

```ts
import type { PersonaKey } from '../data/personas';

export const PERSONA_STORAGE_KEY = 'bm_persona';
const VALID: readonly PersonaKey[] = ['athlete', 'coach', 'recruiter'];

function isValid(v: string | null): v is PersonaKey {
  return v !== null && (VALID as readonly string[]).includes(v);
}

export function getPersona(): PersonaKey | null {
  if (typeof localStorage === 'undefined') return null;
  const v = localStorage.getItem(PERSONA_STORAGE_KEY);
  return isValid(v) ? v : null;
}

export function setPersona(key: PersonaKey): void {
  if (typeof localStorage === 'undefined') return;
  if (!isValid(key)) return;
  localStorage.setItem(PERSONA_STORAGE_KEY, key);
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts tests/persona.test.ts src/lib/persona.ts package.json package-lock.json
git commit -m "feat: persona localStorage helper (TDD)"
```

### Task 3.3: PersonaSwitcher + PersonaLayout + EarlyAccessForm

**Files:**
- Create: `src/components/PersonaSwitcher.astro`, `src/components/EarlyAccessForm.astro`, `src/layouts/PersonaLayout.astro`

- [ ] **Step 1: Create src/components/PersonaSwitcher.astro**

```astro
---
import { personas } from '../data/personas';
import type { PersonaKey } from '../data/personas';
interface Props { active: PersonaKey }
const { active } = Astro.props;
---
<nav class="switcher" aria-label="Choose your persona">
  <span class="switcher-label">I'm a…</span>
  <ul>
    {personas.map((p) => (
      <li><a href={p.href} aria-current={p.key === active ? 'true' : undefined}
             data-persona={p.key} data-event="persona_switch" data-source={active}>{p.noun}</a></li>
    ))}
  </ul>
</nav>
<style>
  .switcher { position:sticky; top:64px; z-index:50; display:flex; align-items:center; gap:12px;
    background:var(--surface); border-bottom:1px solid var(--border); padding:10px 16px; }
  .switcher-label { color:var(--on-surface-variant); font-size:14px; }
  .switcher ul { display:flex; gap:8px; list-style:none; margin:0; padding:0; }
  .switcher a { display:inline-block; padding:8px 16px; min-height:40px; border-radius:999px;
    border:1px solid var(--border); color:var(--on-surface); font-weight:700; font-size:14px; }
  .switcher a:hover { text-decoration:none; border-color:var(--link); }
  .switcher a[aria-current='true'] { background:var(--link); color:var(--on-link); border-color:var(--link); }
</style>
<script>
  import { setPersona } from '../lib/persona';
  document.querySelectorAll('.switcher a[data-persona]').forEach((a) => {
    a.addEventListener('click', () => setPersona(a.getAttribute('data-persona') as any));
  });
</script>
```

- [ ] **Step 2: Create src/components/EarlyAccessForm.astro**

```astro
---
import { site } from '../data/site';
---
<form class="ea-form" id="early-access" method="POST" action={site.formEndpoint}>
  <input type="hidden" name="formType" value="earlyAccess" />
  <label class="visually-hidden" for="ea-email">Email address</label>
  <input id="ea-email" name="email" type="email" required placeholder="you@example.com" autocomplete="email" />
  <input type="text" name="company_website" class="visually-hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />
  <button class="btn btn-primary" type="submit" data-event="early_access_submit">Join early access</button>
  <p class="ea-status" id="ea-status" role="status" aria-live="polite"></p>
  <noscript><p class="text-muted">Email <a href={`mailto:${site.email}`}>{site.email}</a> to join.</p></noscript>
</form>
<style>
  .ea-form { display:flex; gap:12px; flex-wrap:wrap; align-items:center; margin-top:20px; }
  .ea-form input[type=email] { flex:1 1 260px; padding:12px 16px; border-radius:999px;
    border:1px solid var(--border); background:var(--surface); color:var(--on-surface); font-size:16px; }
  .ea-status { width:100%; margin:4px 0 0; }
</style>
<script>
  const form = document.getElementById('early-access') as HTMLFormElement | null;
  const status = document.getElementById('ea-status');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if ((form.elements.namedItem('company_website') as HTMLInputElement)?.value) return; // honeypot
    status!.textContent = 'Submitting…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      status!.textContent = res.ok ? "You're on the list — we'll be in touch." : 'Something went wrong. Please email support@ballmecca.com.';
      if (res.ok) form.reset();
    } catch { status!.textContent = 'Something went wrong. Please email support@ballmecca.com.'; }
  });
</script>
```

- [ ] **Step 3: Create src/layouts/PersonaLayout.astro**

```astro
---
import BaseLayout from './BaseLayout.astro';
import PersonaSwitcher from '../components/PersonaSwitcher.astro';
import type { PersonaKey } from '../data/personas';
interface Props { title: string; description?: string; path: string; active: PersonaKey }
const { title, description, path, active } = Astro.props;
---
<BaseLayout title={title} description={description} path={path}>
  <slot name="head" slot="head" />
  <PersonaSwitcher active={active} />
  <slot />
</BaseLayout>
```

- [ ] **Step 4: Build, check, commit**

Run: `npm run build && npx astro check`
Expected: 0 errors.
```bash
git add src/components/PersonaSwitcher.astro src/components/EarlyAccessForm.astro src/layouts/PersonaLayout.astro
git commit -m "feat: persona switcher, early-access form, persona layout"
```

### Task 3.4: The three persona pages (one template, distinct data)

**Files:**
- Create: `src/components/PersonaPage.astro`, `src/pages/athletes.astro`, `src/pages/coaches.astro`, `src/pages/recruiters.astro`

- [ ] **Step 1: Create src/components/PersonaPage.astro (shared body driven by data)**

```astro
---
import StoreBadges from './StoreBadges.astro';
import EarlyAccessForm from './EarlyAccessForm.astro';
import Faq from './Faq.astro';            // created in Phase 4, Task 4.3
import { sports } from '../data/sports';
import type { Persona } from '../data/personas';
interface Props { persona: Persona }
const { persona } = Astro.props;
---
<section class="p-hero">
  <div class="container">
    <p class="eyebrow text-accent">For {persona.noun}s</p>
    <h1 class="display p-hero-title">{persona.heroPromise}</h1>
    <p class="p-hero-sub text-muted">{persona.heroSub}</p>
    {persona.primaryCta === 'download'
      ? <StoreBadges source={`persona_${persona.key}_hero`} />
      : <EarlyAccessForm />}
  </div>
</section>

<section class="container p-why">
  <h2 class="display">Why {persona.noun.toLowerCase()}s choose Ballmecca</h2>
  <div class="p-why-grid">
    {persona.why.map((w) => (
      <div class="p-why-card"><h3>{w.heading}</h3><p class="text-muted">{w.body}</p></div>
    ))}
  </div>
</section>

<section class="p-band"><div class="container">
  <h2 class="display">{persona.model.heading}</h2>
  <p class="text-muted p-model">{persona.model.body}</p>
</div></section>

<section class="container p-sports">
  <h2 class="display">Across 20+ sports</h2>
  <div class="p-sport-row">{sports.map((s) => <span class="p-sport">{s.icon} {s.name}</span>)}</div>
</section>

<section class="p-quote"><div class="container">
  <blockquote>“{persona.testimonial.quote}”</blockquote>
  <cite class="text-muted">— {persona.testimonial.attribution}</cite>
</div></section>

<Faq title={`${persona.noun} FAQ`} items={persona.faqs} seeAllLink />

<section class="container p-final">
  <h2 class="display">{persona.primaryCta === 'download' ? 'Your next level starts now.' : 'Help us build it.'}</h2>
  {persona.primaryCta === 'download'
    ? <StoreBadges source={`persona_${persona.key}_final`} />
    : <EarlyAccessForm />}
</section>

<style>
  .eyebrow { text-transform:uppercase; letter-spacing:2px; font-size:13px; font-weight:700; }
  .p-hero { background:linear-gradient(160deg, var(--brand-chrome), var(--canvas)); padding:80px 0; }
  .p-hero-title { font-size:clamp(36px,6vw,64px); margin:10px 0; max-width:14ch; }
  .p-hero-sub { font-size:19px; max-width:560px; margin-bottom:24px; }
  .p-why { padding:72px 0; }
  .p-why-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:24px; }
  .p-why-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-md); padding:24px; }
  .p-band { background:var(--surface); border-block:1px solid var(--border); padding:64px 0; }
  .p-model { max-width:680px; font-size:18px; }
  .p-sports { padding:64px 0; }
  .p-sport-row { display:flex; flex-wrap:wrap; gap:10px; margin-top:16px; }
  .p-sport { background:var(--surface); border:1px solid var(--border); border-radius:999px; padding:8px 14px; }
  .p-quote { background:var(--brand-chrome); padding:64px 0; }
  .p-quote blockquote { font-family:var(--font-heading); font-size:26px; margin:0; max-width:760px; color:var(--on-brand-chrome); }
  .p-final { padding:80px 0; text-align:center; }
  .p-final .store-badges, .p-final .ea-form { justify-content:center; margin-top:20px; }
  @media (max-width:820px){ .p-why-grid{ grid-template-columns:1fr; } }
</style>
```

- [ ] **Step 2: Create src/pages/athletes.astro**

```astro
---
import PersonaLayout from '../layouts/PersonaLayout.astro';
import PersonaPage from '../components/PersonaPage.astro';
import JsonLd from '../components/JsonLd.astro';
import { personaByKey } from '../data/personas';
const p = personaByKey('athlete');
const faqSchema = { '@context':'https://schema.org','@type':'FAQPage',
  mainEntity: p.faqs.map((f) => ({ '@type':'Question', name:f.q, acceptedAnswer:{ '@type':'Answer', text:f.a } })) };
---
<PersonaLayout title={p.seoTitle} description={p.seoDescription} path={p.href} active="athlete">
  <JsonLd slot="head" schema={faqSchema} />
  <PersonaPage persona={p} />
</PersonaLayout>
```

- [ ] **Step 3: Create src/pages/coaches.astro**

```astro
---
import PersonaLayout from '../layouts/PersonaLayout.astro';
import PersonaPage from '../components/PersonaPage.astro';
import JsonLd from '../components/JsonLd.astro';
import { personaByKey } from '../data/personas';
const p = personaByKey('coach');
const faqSchema = { '@context':'https://schema.org','@type':'FAQPage',
  mainEntity: p.faqs.map((f) => ({ '@type':'Question', name:f.q, acceptedAnswer:{ '@type':'Answer', text:f.a } })) };
---
<PersonaLayout title={p.seoTitle} description={p.seoDescription} path={p.href} active="coach">
  <JsonLd slot="head" schema={faqSchema} />
  <PersonaPage persona={p} />
</PersonaLayout>
```

- [ ] **Step 4: Create src/pages/recruiters.astro**

```astro
---
import PersonaLayout from '../layouts/PersonaLayout.astro';
import PersonaPage from '../components/PersonaPage.astro';
import JsonLd from '../components/JsonLd.astro';
import { personaByKey } from '../data/personas';
const p = personaByKey('recruiter');
const faqSchema = { '@context':'https://schema.org','@type':'FAQPage',
  mainEntity: p.faqs.map((f) => ({ '@type':'Question', name:f.q, acceptedAnswer:{ '@type':'Answer', text:f.a } })) };
---
<PersonaLayout title={p.seoTitle} description={p.seoDescription} path={p.href} active="recruiter">
  <JsonLd slot="head" schema={faqSchema} />
  <PersonaPage persona={p} />
</PersonaLayout>
```

- [ ] **Step 5: Build, check, visual verify, commit**

Run: `npm run build && npx astro check` (requires `Faq.astro` from Task 4.3 — do 4.3 first if running strictly in order).
Expected: 0 errors; `/athletes`, `/coaches`, `/recruiters` build. Recruiter shows the email form (not badges) in hero + final; athletes/coaches show badges.
```bash
git add src/components/PersonaPage.astro src/pages/athletes.astro src/pages/coaches.astro src/pages/recruiters.astro
git commit -m "feat: athlete/coach/recruiter persona pages"
```

---

## Phase 4 — Port Existing Pages

### Task 4.1: FAQ data extracted from faq.html

**Files:**
- Create: `src/data/faqs.ts`

- [ ] **Step 1: Read the existing answers**

Run: `sed -n '120,260p' faq.html` and copy each question + answer text.

- [ ] **Step 2: Create src/data/faqs.ts**

Transcribe the real Q&A from `faq.html` (3 categories: General, For Athletes, For Coaches) into this shape. Example structure (fill every entry from the source — do not summarize):

```ts
export interface FaqItem { q: string; a: string }
export interface FaqCategory { title: string; items: FaqItem[] }
export const faqCategories: FaqCategory[] = [
  { title: 'General', items: [
    { q: 'What is Ballmecca?', a: '<transcribe from faq.html>' },
    // …all General items
  ]},
  { title: 'For Athletes', items: [ /* …all */ ] },
  { title: 'For Coaches', items: [ /* …all */ ] },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/data/faqs.ts && git commit -m "feat: FAQ content data ported from faq.html"
```

### Task 4.2: Migrate static imagery from the old site

**Files:**
- Move: existing `images/*` → `public/images/*`

- [ ] **Step 1: Copy imagery into public/**

```bash
mkdir -p public/images
cp -r images/* public/images/ 2>/dev/null || true
ls public/images | head
```
Expected: hero-*.jpg, acro.jpg, logo-cyan.png, favicon.png, etc. present under `public/images`.

- [ ] **Step 2: Commit**

```bash
git add public/images && git commit -m "chore: move site imagery into public/images"
```

### Task 4.3: Faq component + FAQ page

**Files:**
- Create: `src/components/Faq.astro`, `src/pages/faq.astro`

- [ ] **Step 1: Create src/components/Faq.astro (native details/summary, no JS)**

```astro
---
interface Item { q: string; a: string }
interface Props { title?: string; items: Item[]; seeAllLink?: boolean }
const { title, items, seeAllLink = false } = Astro.props;
---
<section class="container faq-block">
  {title && <h2 class="display faq-h">{title}</h2>}
  <div class="faq-list">
    {items.map((it) => (
      <details class="faq-item">
        <summary>{it.q}</summary>
        <div class="faq-answer text-muted" set:html={it.a} />
      </details>
    ))}
  </div>
  {seeAllLink && <a class="text-accent" href="/faq">See all FAQs →</a>}
</section>
<style>
  .faq-block { padding:48px 0; }
  .faq-h { font-size:32px; margin-bottom:16px; }
  .faq-item { border-bottom:1px solid var(--border); padding:14px 0; }
  .faq-item summary { cursor:pointer; font-weight:700; font-family:var(--font-heading); list-style:none; }
  .faq-item summary::-webkit-details-marker { display:none; }
  .faq-item summary::after { content:'+'; float:right; color:var(--link); }
  .faq-item[open] summary::after { content:'–'; }
  .faq-answer { padding-top:10px; }
</style>
```

- [ ] **Step 2: Create src/pages/faq.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Faq from '../components/Faq.astro';
import JsonLd from '../components/JsonLd.astro';
import { faqCategories } from '../data/faqs';
const all = faqCategories.flatMap((c) => c.items);
const faqSchema = { '@context':'https://schema.org','@type':'FAQPage',
  mainEntity: all.map((f) => ({ '@type':'Question', name:f.q, acceptedAnswer:{ '@type':'Answer', text:f.a.replace(/<[^>]+>/g,'') } })) };
---
<BaseLayout title="FAQ" description="Answers about how Ballmecca coaching works — for athletes, coaches, and parents." path="/faq">
  <JsonLd slot="head" schema={faqSchema} />
  <section class="container" style="padding:64px 0 8px;"><h1 class="display" style="font-size:48px;">Frequently asked questions.</h1></section>
  {faqCategories.map((c) => <Faq title={c.title} items={c.items} />)}
</BaseLayout>
```

- [ ] **Step 3: Build, check, commit**

Run: `npm run build && npx astro check`
Expected: 0 errors; `/faq` renders three categories with expandable native accordions.
```bash
git add src/components/Faq.astro src/pages/faq.astro
git commit -m "feat: FAQ component (native details) + FAQ page"
```

### Task 4.4: About page

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Read the source content**

Run: `sed -n '1,400p' about.html` — copy the mission statement, the four core values (Wisdom, Cura Personalis, Discipline, Access), the team (Manny Madera CEO, Amelia Arabe CXIO), and partnerships (LPF, Loyola).

- [ ] **Step 2: Create src/pages/about.astro**

Transcribe the real About content into this structure (fill from source; keep the four values + team + partnerships verbatim in meaning):

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
const values = [
  { h: 'Wisdom', p: 'Learning from experience, mentors, and the game itself.' },
  { h: 'Cura Personalis', p: 'Care for the whole person — nurturing athletes as people, not just players.' },
  { h: 'Discipline', p: 'Building habits that lead to excellence on the field and in life.' },
  { h: 'Access', p: 'No athlete should be limited by their zip code.' },
];
const team = [
  { name: 'Manny Madera', role: 'CEO' },
  { name: 'Amelia Arabe', role: 'CXIO' },
];
---
<BaseLayout title="About Us" description="Ballmecca's mission: with the right guidance, anyone can achieve greatness. Born in Baltimore out of Loyola University Maryland." path="/about">
  <section class="container" style="padding:64px 0;">
    <h1 class="display" style="font-size:52px;">We believe anyone can achieve greatness.</h1>
    <p class="text-muted" style="max-width:680px;">Ballmecca provides access to top-tier coaching and supports underserved youth through the power of sports. Born in Baltimore, Maryland, out of Loyola University Maryland.</p>
  </section>
  <section class="container" style="padding:24px 0 64px;">
    <h2 class="display" style="font-size:32px;">Our values</h2>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:20px;">
      {values.map((v) => (
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;">
          <h3>{v.h}</h3><p class="text-muted">{v.p}</p>
        </div>
      ))}
    </div>
  </section>
  <section class="container" style="padding:0 0 80px;">
    <h2 class="display" style="font-size:32px;">The team</h2>
    <div style="display:flex;gap:24px;flex-wrap:wrap;margin-top:16px;">
      {team.map((t) => <div><strong>{t.name}</strong><div class="text-muted">{t.role}</div></div>)}
    </div>
    <p class="text-muted" style="margin-top:32px;">In partnership with Leveling the Playing Field (LPF) and Loyola University Maryland.</p>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Build, check, commit**

Run: `npm run build && npx astro check`
```bash
git add src/pages/about.astro && git commit -m "feat: about page"
```

### Task 4.5: Contact page + ContactForm

**Files:**
- Create: `src/components/ContactForm.astro`, `src/pages/contact.astro`

- [ ] **Step 1: Create src/components/ContactForm.astro**

```astro
---
import { site } from '../data/site';
const subjects = ['Coach joining the platform','Athlete looking for coaching','Partnership','Press','General','Support'];
---
<form class="contact-form" id="contact-form" method="POST" action={site.formEndpoint}>
  <input type="hidden" name="formType" value="contact" />
  <div class="row">
    <div><label for="c-name">Name</label><input id="c-name" name="name" required autocomplete="name" /></div>
    <div><label for="c-email">Email</label><input id="c-email" name="email" type="email" required autocomplete="email" /></div>
  </div>
  <label for="c-subject">Subject</label>
  <select id="c-subject" name="subject">{subjects.map((s) => <option value={s}>{s}</option>)}</select>
  <label for="c-message">Message</label>
  <textarea id="c-message" name="message" rows="6" required></textarea>
  <input type="text" name="company_website" class="visually-hidden" tabindex="-1" autocomplete="off" aria-hidden="true" />
  <button class="btn btn-primary" type="submit" data-event="contact_submit">Send message</button>
  <p class="c-status" id="c-status" role="status" aria-live="polite"></p>
  <noscript><p class="text-muted">Email us directly at <a href={`mailto:${site.email}`}>{site.email}</a>.</p></noscript>
</form>
<style>
  .contact-form { display:grid; gap:12px; max-width:620px; }
  .contact-form .row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .contact-form label { font-weight:700; font-size:14px; }
  .contact-form input, .contact-form select, .contact-form textarea {
    width:100%; padding:12px 14px; border-radius:var(--radius-sm); border:1px solid var(--border);
    background:var(--surface); color:var(--on-surface); font-size:16px; font-family:var(--font-body); }
  @media (max-width:600px){ .contact-form .row{ grid-template-columns:1fr; } }
</style>
<script>
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const status = document.getElementById('c-status');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if ((form.elements.namedItem('company_website') as HTMLInputElement)?.value) return;
    status!.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method:'POST', body:new FormData(form), headers:{ Accept:'application/json' } });
      status!.textContent = res.ok ? 'Thanks — we\'ll be in touch shortly.' : 'Something went wrong. Email support@ballmecca.com.';
      if (res.ok) form.reset();
    } catch { status!.textContent = 'Something went wrong. Email support@ballmecca.com.'; }
  });
</script>
```

- [ ] **Step 2: Create src/pages/contact.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ContactForm from '../components/ContactForm.astro';
import { site } from '../data/site';
---
<BaseLayout title="Contact" description="Get in touch with the Ballmecca team." path="/contact">
  <section class="container" style="padding:64px 0;">
    <h1 class="display" style="font-size:48px;">Get in touch.</h1>
    <p class="text-muted">Questions, partnerships, press — we'd love to hear from you. Or email <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    <div style="margin-top:32px;"><ContactForm /></div>
  </section>
</BaseLayout>
```

- [ ] **Step 3: Build, check, commit**

Run: `npm run build && npx astro check`
```bash
git add src/components/ContactForm.astro src/pages/contact.astro
git commit -m "feat: contact page + form (posts to Cloud Function endpoint)"
```

### Task 4.6: Policies page (port full legal text)

**Files:**
- Create: `src/pages/policies.astro`

- [ ] **Step 1: Read the source**

Run: `sed -n '160,1200p' policies.html` — the page contains real legal text across sections with ids `privacy, terms, returns, acceptable-use, cookie, dmca, disclaimer`.

- [ ] **Step 2: Create src/pages/policies.astro with sticky sidebar + ported sections**

Transcribe each `<div class="policy-section" id="…">` block from `policies.html` into the `sections` content below (keep ids stable for the footer anchors and external links). Structure:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
const nav = [
  { id:'privacy', label:'Privacy Policy' },
  { id:'terms', label:'Terms & Conditions' },
  { id:'returns', label:'Returns Policy' },
  { id:'acceptable-use', label:'Acceptable Use' },
  { id:'cookie', label:'Cookie Policy' },
  { id:'dmca', label:'DMCA' },
  { id:'disclaimer', label:'Disclaimer' },
];
---
<BaseLayout title="Policies" description="Ballmecca's privacy policy, terms, and legal information." path="/policies">
  <section class="container" style="padding:48px 0;">
    <h1 class="display" style="font-size:44px;">Our policies.</h1>
    <div class="pol-grid">
      <aside class="pol-nav">
        <ul>{nav.map((n) => <li><a href={`#${n.id}`}>{n.label}</a></li>)}</ul>
      </aside>
      <div class="pol-body">
        <!-- For each id in `nav`, paste the corresponding section from policies.html: -->
        <section id="privacy"><h2>Privacy Policy</h2><!-- …ported h3/p content… --></section>
        <section id="terms"><h2>Terms & Conditions</h2><!-- …ported… --></section>
        <section id="returns"><h2>Returns Policy</h2><!-- …ported… --></section>
        <section id="acceptable-use"><h2>Acceptable Use Policy</h2><!-- …ported… --></section>
        <section id="cookie"><h2>Cookie Policy</h2><!-- …ported… --></section>
        <section id="dmca"><h2>DMCA</h2><!-- …ported… --></section>
        <section id="disclaimer"><h2>Disclaimer</h2><!-- …ported… --></section>
      </div>
    </div>
  </section>
</BaseLayout>
<style>
  .pol-grid { display:grid; grid-template-columns:240px 1fr; gap:40px; margin-top:24px; }
  .pol-nav { position:sticky; top:80px; align-self:start; }
  .pol-nav ul { list-style:none; padding:0; margin:0; display:grid; gap:8px; }
  .pol-body section { padding:24px 0; border-top:1px solid var(--border); scroll-margin-top:90px; }
  .pol-body h2 { font-family:var(--font-display); }
  @media (max-width:820px){ .pol-grid{ grid-template-columns:1fr; } .pol-nav{ position:static; } }
</style>
```

> The `<!-- …ported… -->` comments are explicit instructions to paste the real legal text from `policies.html` (which already contains it) — not placeholders to ship. The page is not done until all seven sections contain their real content.

- [ ] **Step 3: Build, check, commit**

Run: `npm run build && npx astro check`
Expected: anchors `/policies#privacy` etc. resolve and match footer links.
```bash
git add src/pages/policies.astro && git commit -m "feat: policies page (ported legal text, sticky sidebar)"
```

---

## Phase 5 — Blog

### Task 5.1: Blog content collection

**Files:**
- Create: `src/content/config.ts`, `src/content/blog/welcome-to-ballmecca.mdx` (replaced by the user's real first article)

- [ ] **Step 1: Create src/content/config.ts**

```ts
import { defineCollection, z } from 'astro:content';
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    heroImage: z.string().optional(),
    author: z.string().default('Ballmecca'),
    draft: z.boolean().default(false),
  }),
});
export const collections = { blog };
```

- [ ] **Step 2: Create a seed article src/content/blog/welcome-to-ballmecca.mdx**

```mdx
---
title: "Welcome to Ballmecca"
description: "Why we're building accessible, bite-sized coaching for every athlete."
pubDate: 2026-06-15
author: "Ballmecca"
---

Ballmecca exists because great coaching shouldn't depend on your zip code.

<!-- The user will replace this file with their real first article. -->
```

- [ ] **Step 3: Commit**

```bash
git add src/content/config.ts src/content/blog/welcome-to-ballmecca.mdx
git commit -m "feat: blog content collection + seed article"
```

### Task 5.2: Blog index + article pages

**Files:**
- Create: `src/pages/blog/index.astro`, `src/pages/blog/[...slug].astro`

- [ ] **Step 1: Create src/pages/blog/index.astro**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getCollection } from 'astro:content';
const posts = (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
---
<BaseLayout title="Blog" description="Coaching tips, athlete stories, and Ballmecca news." path="/blog">
  <section class="container" style="padding:64px 0;">
    <h1 class="display" style="font-size:48px;">The Ballmecca blog.</h1>
    <ul style="list-style:none;padding:0;display:grid;gap:24px;margin-top:24px;">
      {posts.map((post) => (
        <li style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:24px;">
          <a href={`/blog/${post.slug}`} data-event="blog_click">
            <h2 style="margin:0 0 6px;">{post.data.title}</h2>
          </a>
          <p class="text-muted" style="margin:0;">{post.data.description}</p>
          <time class="text-muted" datetime={post.data.pubDate.toISOString()} style="font-size:13px;">
            {post.data.pubDate.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}
          </time>
        </li>
      ))}
    </ul>
  </section>
</BaseLayout>
```

- [ ] **Step 2: Create src/pages/blog/[...slug].astro**

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import JsonLd from '../../components/JsonLd.astro';
import { getCollection } from 'astro:content';
import { site } from '../../data/site';
export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({ params: { slug: post.slug }, props: { post } }));
}
const { post } = Astro.props;
const { Content } = await post.render();
const schema = { '@context':'https://schema.org','@type':'Article',
  headline: post.data.title, description: post.data.description,
  datePublished: post.data.pubDate.toISOString(), author: { '@type':'Organization', name: post.data.author },
  publisher: { '@type':'Organization', name:'Ballmecca' }, mainEntityOfPage: new URL(`/blog/${post.slug}`, site.url).href };
---
<BaseLayout title={post.data.title} description={post.data.description} path={`/blog/${post.slug}`} ogImage={post.data.heroImage}>
  <JsonLd slot="head" schema={schema} />
  <article class="container" style="padding:64px 0;max-width:760px;">
    <h1 class="display" style="font-size:clamp(32px,5vw,52px);">{post.data.title}</h1>
    <time class="text-muted" datetime={post.data.pubDate.toISOString()}>
      {post.data.pubDate.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}
    </time>
    <div style="margin-top:24px;"><Content /></div>
  </article>
</BaseLayout>
```

- [ ] **Step 3: Build, check, commit**

Run: `npm run build && npx astro check`
Expected: `/blog` lists the seed post; `/blog/welcome-to-ballmecca` renders.
```bash
git add src/pages/blog/index.astro "src/pages/blog/[...slug].astro"
git commit -m "feat: blog index + article pages with Article JSON-LD"
```

---

## Phase 6 — Forms Cloud Function

### Task 6.1: Cloud Function with TDD validator

**Files:**
- Create: `functions/package.json`, `functions/index.js`, `functions/test/package.json`, `functions/test/submitForm.test.js`

- [ ] **Step 1: Create functions/package.json (Node 20, pinned exact)**

```json
{
  "name": "ballmecca-website-functions",
  "private": true,
  "engines": { "node": "20" },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "12.7.0",
    "firebase-functions": "5.1.1"
  }
}
```

- [ ] **Step 2: Create functions/index.js**

```js
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
admin.initializeApp();

const ALLOWED_ORIGIN = 'https://ballmecca.com';
const TYPES = { contact: 'contactMessages', earlyAccess: 'earlyAccessSignups' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pure validator — unit-tested in test/submitForm.test.js
function validate(body) {
  const errors = [];
  const formType = String(body.formType || '');
  if (!TYPES[formType]) errors.push('formType');
  if (body.company_website) errors.push('spam'); // honeypot must be empty
  if (!EMAIL_RE.test(String(body.email || ''))) errors.push('email');
  if (formType === 'contact') {
    if (!String(body.name || '').trim()) errors.push('name');
    if (!String(body.message || '').trim()) errors.push('message');
  }
  return { ok: errors.length === 0, errors, collection: TYPES[formType] };
}

const submitForm = onRequest({ cors: ALLOWED_ORIGIN, region: 'us-central1' }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const body = req.body && Object.keys(req.body).length ? req.body : Object.fromEntries(new URLSearchParams(req.rawBody?.toString() || ''));
  const result = validate(body);
  if (!result.ok) return res.status(result.errors.includes('spam') ? 200 : 400).json({ ok: result.errors.includes('spam') });
  await admin.firestore().collection(result.collection).add({
    email: body.email, name: body.name || null, subject: body.subject || null,
    message: body.message || null, createdAt: admin.firestore.FieldValue.serverTimestamp(),
    source: 'website',
  });
  // Email notification is wired in the implementation (e.g. via an extension or nodemailer) per §12.
  return res.status(200).json({ ok: true });
});

module.exports = { submitForm, validate };
```

- [ ] **Step 3: Create functions/test/package.json**

```json
{
  "name": "ballmecca-website-functions-test",
  "private": true,
  "scripts": { "test": "jest" },
  "devDependencies": { "jest": "29.7.0" }
}
```

- [ ] **Step 4: Write failing tests — functions/test/submitForm.test.js**

Intended behavior (spec §9): only known form types accepted; email always required & format-checked; contact requires name+message; a filled honeypot is treated as spam (silently OK, not stored). Mutations killed: accepting any formType, skipping email validation, storing spam, contact without message.

```js
const { validate } = require('../index');

describe('submitForm.validate', () => {
  test('valid contact passes', () => {
    expect(validate({ formType:'contact', email:'a@b.com', name:'A', message:'Hi' }))
      .toMatchObject({ ok:true, collection:'contactMessages' });
  });
  test('valid earlyAccess passes with just email', () => {
    expect(validate({ formType:'earlyAccess', email:'a@b.com' }))
      .toMatchObject({ ok:true, collection:'earlyAccessSignups' });
  });
  test('unknown formType rejected', () => {
    expect(validate({ formType:'hack', email:'a@b.com' }).ok).toBe(false);
  });
  test('bad email rejected', () => {
    expect(validate({ formType:'earlyAccess', email:'nope' }).errors).toContain('email');
  });
  test('contact without message rejected', () => {
    expect(validate({ formType:'contact', email:'a@b.com', name:'A' }).errors).toContain('message');
  });
  test('honeypot flagged as spam', () => {
    expect(validate({ formType:'earlyAccess', email:'a@b.com', company_website:'x' }).errors).toContain('spam');
  });
});
```

- [ ] **Step 5: Run tests to verify they fail then pass**

Run: `cd functions && npm install && cd test && npm install && npm test`
Expected: with `index.js` present, 6 tests PASS. (If you write the test before `validate`, it fails with module/function-not-found first.)

- [ ] **Step 6: Commit**

```bash
cd ~/Documents/ballmecca-website
git add functions/package.json functions/index.js functions/test/package.json functions/test/submitForm.test.js
git commit -m "feat: submitForm Cloud Function + validator unit tests (TDD)"
```

---

## Phase 7 — robots, OG image, SEO finishing

### Task 7.1: robots.txt + default OG image

**Files:**
- Create: `public/robots.txt`, `public/images/og-default.jpg`

- [ ] **Step 1: Create public/robots.txt**

```
User-agent: *
Allow: /

Sitemap: https://ballmecca.com/sitemap-index.xml
```

- [ ] **Step 2: Provide a default OG image**

```bash
# Use an existing branded hero as the default OG image (1200x630 ideal).
cp public/images/hero-basketball.jpg public/images/og-default.jpg
```
(Replace later with a purpose-made 1200×630 card.)

- [ ] **Step 3: Build and verify sitemap**

Run: `npm run build`
Expected: `dist/sitemap-index.xml` and `dist/sitemap-0.xml` exist and list `/`, `/athletes`, `/coaches`, `/recruiters`, `/about`, `/faq`, `/contact`, `/policies`, `/blog`, `/blog/welcome-to-ballmecca`.

- [ ] **Step 4: Commit**

```bash
git add public/robots.txt public/images/og-default.jpg
git commit -m "feat: robots.txt + default OG image"
```

---

## Phase 8 — Analytics

### Task 8.1: Wire the analytics provider

**Files:**
- Modify: `src/lib/analytics.ts`, `src/layouts/BaseLayout.astro`

> Provider TBD by the user (spec §12). This task uses **GA4 via gtag**, loaded `async`, with the existing app measurement id as a placeholder to be confirmed. If the user picks a different provider, swap the snippet — the `send()` contract and all `data-event` attributes stay identical, so no component changes are needed.

- [ ] **Step 1: Add the gtag loader to BaseLayout `<head>` (deferred)**

In `src/layouts/BaseLayout.astro`, add inside `<head>` after `<Seo>`:
```astro
<script type="text/partytown" is:inline define:vars={{ id: 'G-XXXXXXX' }}>
  // Replace G-XXXXXXX with the confirmed GA4 id. Loaded async; non-blocking.
</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX" is:inline></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>
```

- [ ] **Step 2: Update send() to forward to gtag**

In `src/lib/analytics.ts`, replace the `send` body:
```ts
export function send(event: string, params: Record<string, string> = {}) {
  if (typeof window === 'undefined') return;
  // @ts-expect-error gtag global
  if (typeof window.gtag === 'function') window.gtag('event', event, params);
  else window.dataLayer?.push({ event, ...params });
}
```

- [ ] **Step 3: Build, check, commit**

Run: `npm run build && npx astro check`
```bash
git add src/lib/analytics.ts src/layouts/BaseLayout.astro
git commit -m "feat: GA4 analytics wiring (id to be confirmed)"
```

---

## Phase 9 — Firebase Hosting, CI, Cutover

### Task 9.1: firebase.json + .firebaserc

**Files:**
- Create: `firebase.json`, `.firebaserc`

- [ ] **Step 1: Create firebase.json**

```json
{
  "hosting": {
    "public": "dist",
    "cleanUrls": true,
    "trailingSlash": false,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "/api/submitForm", "function": "submitForm" }
    ],
    "redirects": [
      { "source": "/index.html", "destination": "/", "type": 301 },
      { "source": "/about.html", "destination": "/about", "type": 301 },
      { "source": "/contact.html", "destination": "/contact", "type": 301 },
      { "source": "/faq.html", "destination": "/faq", "type": 301 },
      { "source": "/policies.html", "destination": "/policies", "type": 301 }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|woff2|jpg|png|svg|webp)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      }
    ]
  },
  "functions": { "source": "functions", "runtime": "nodejs20" }
}
```

- [ ] **Step 2: Create .firebaserc (project id to confirm — spec §12)**

```json
{ "projects": { "default": "ballmecca-982c8" } }
```

- [ ] **Step 3: Local emulator smoke test**

Run: `npm run build && firebase emulators:start --only hosting`
Expected: site served locally from `dist`; clean URLs (`/about`) resolve; `.html` redirects 301.
Stop with Ctrl-C.

- [ ] **Step 4: Commit**

```bash
git add firebase.json .firebaserc
git commit -m "feat: Firebase Hosting config + function rewrite + .html redirects"
```

### Task 9.2: GitHub Actions auto-deploy

**Files:**
- Create: `.github/workflows/deploy.yml`

> Requires a `FIREBASE_SERVICE_ACCOUNT` GitHub secret (a service-account JSON with Hosting + Functions deploy rights). Owner to provide (spec §12).

- [ ] **Step 1: Create .github/workflows/deploy.yml**

```yaml
name: Deploy to Firebase Hosting
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy (preview on PR, live on main)
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: ballmecca-982c8
          channelId: ${{ github.event_name == 'pull_request' && format('pr-{0}', github.event.number) || 'live' }}
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: build, test, and deploy to Firebase Hosting (preview on PR, live on main)"
```

### Task 9.3: Lighthouse + accessibility verification

**Files:** none (verification gate)

- [ ] **Step 1: Build and audit**

Run:
```bash
npm run build && npm run preview &
npx --yes lighthouse http://localhost:4321/ --only-categories=performance,seo,accessibility --form-factor=mobile --screenEmulation.mobile --quiet --chrome-flags="--headless" --output=json --output-path=./lh-home.json
```

- [ ] **Step 2: Verify thresholds**

Open `lh-home.json` (or the printed scores). Expected: Performance ≥ 0.95, SEO = 1.0, Accessibility = 1.0 on `/`. Repeat for `/athletes`. If any category falls short, fix per the spec §8 budget (oversized images, unpreloaded fonts, layout shift) before proceeding — do not relax the target.

- [ ] **Step 3: Manual a11y pass**

Keyboard-only: Tab through home + a persona page. Confirm: skip-link works, nav toggle is reachable + `aria-expanded` flips, persona switcher has visible focus + ~44px targets + `aria-current`, all images have alt text. Fix any gaps.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "fix: lighthouse/a11y polish to hit budget"
```

### Task 9.4: Cutover (manual, owner-gated — NOT automated)

**Files:** none (runbook)

> Do NOT delete Squarespace or the Vercel project until the confidence window passes.

- [ ] **Step 1: Pre-cutover verification on the live `*.web.app` URL**
  - All pages load; forms submit and write to Firestore (`contactMessages`, `earlyAccessSignups`); recruiter form shows confirmation.
  - `/sitemap-index.xml` and `/robots.txt` resolve; canonical host is correct.
  - `.html` → clean-URL redirects return 301.
- [ ] **Step 2: Build the full Squarespace redirect inventory** (old slug → new URL, 301) and add any missing entries to `firebase.json` `redirects`. Commit + redeploy.
- [ ] **Step 3: Lower DNS TTL** at the registrar to 300s; wait for the old TTL to expire.
- [ ] **Step 4: Cut DNS** for `ballmecca.com` + `www` to Firebase Hosting (add both custom domains in the Firebase console first; complete domain verification).
- [ ] **Step 5: Monitor** Firebase Hosting logs + Google Search Console (coverage, redirects) for the confidence window (suggested 1–2 weeks).
- [ ] **Step 6: Retire** the Vercel project and Squarespace site only after the window passes with no regressions. Record completion in the spec/memory.

---

## Phase 10 — Cleanup

### Task 10.1: Remove the legacy static site

**Files:**
- Delete: `about.html`, `contact.html`, `faq.html`, `index.html`, `policies.html`, `nav-footer.html`, `css/`, `js/`, top-level `images/` (now under `public/images/`), `README.md` (rewrite for Astro)

> Do this only after Phase 9 verification passes and the Astro site is confirmed live.

- [ ] **Step 1: Delete legacy files**

```bash
git rm index.html about.html contact.html faq.html policies.html nav-footer.html
git rm -r css js images
```

- [ ] **Step 2: Rewrite README.md for the Astro + Firebase stack**

Replace the Vercel/Formspree instructions with: Astro dev/build commands, Firebase Hosting deploy, where content data lives (`src/data/*`), how to add a blog post (`src/content/blog/*.mdx`), and how to update curated coaches (`src/data/coaches.ts` + `public/images/coaches/`).

- [ ] **Step 3: Build, check, commit**

Run: `npm run build && npx astro check && npm test`
```bash
git add -A && git commit -m "chore: remove legacy static site, rewrite README for Astro/Firebase"
```

---

## Self-Review (completed)

**Spec coverage:** §1 goal → all phases; §2 architecture → Phase 0–1; §3 dark theme/fonts → Tasks 0.3/0.4; §4 persona experience (value-first home, distinct persona pages, switcher on persona pages only, no auto-redirect, real anchor links) → Phases 2–3; §5 blog → Phase 5; §6 SEO (meta, OG, JSON-LD Organization/MobileApplication/Article/FAQPage, sitemap, robots, honesty guardrail) → Tasks 1.2/2.3/3.4/4.3/5.2/7.1; §7 static coaches (no Firebase read) → Task 2.1/2.2; §8 perf budget + JS policy (native details, CSS scroll-snap, no client Firebase SDK) → Tasks 2.2/4.3/9.3; §9 forms via Cloud Function → Phase 6 + Tasks 3.3/4.5; §10 analytics events → Tasks 1.4/8.1; §11 migration (firebase.json, CI, redirect map, rollback-safe cutover) → Phase 9; §13 YAGNI (dark-only, no client SDK) honored; §14 content migration + artifact removal → Tasks 0.1/4.x/10.1.

**Placeholder scan:** The only intentional "fill from source" steps (FAQ §4.1, About §4.4, Policies §4.6) point at the real content already present in the legacy HTML and instruct full transcription, with explicit "not done until real content present" notes — these are content-port instructions, not shippable placeholders. GA4 id and Firebase project id are flagged as owner-confirm items (spec §12), not invented values presented as final.

**Type consistency:** `PersonaKey`/`Persona` defined in `personas.ts` (3.1) are used consistently by `persona.ts` (3.2), `PersonaSwitcher`/`PersonaLayout`/`PersonaPage` (3.3/3.4). `site.formEndpoint` (1.1) matches the `firebase.json` rewrite source `/api/submitForm` (9.1) and both forms' `action` (3.3/4.5). The Cloud Function `validate`/`submitForm` exports (6.1) match the test imports. `send()`/`initDelegation()` (1.4) are reused unchanged in Phase 8.

**Ordering callouts:** `personas.ts` (3.1) and `Faq.astro` (4.3) are imported by Phase 2/3 components; the plan flags doing them before those build steps if executing strictly in order. Subagent-driven execution should sequence 3.1 and 4.3 early.
