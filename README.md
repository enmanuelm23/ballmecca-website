# Ballmecca — Marketing Website

> *Revolutionizing sports education for the next generation.*

---

## What is Ballmecca?

Ballmecca is a sports coaching marketplace built on a simple belief: with the right guidance and feedback, anyone can achieve greatness. Too often, access to elite coaching is limited by zip code or income. Ballmecca changes that.

Through the Ballmecca app, athletes upload short video clips of their technique — a golf swing, a softball throw, a tennis serve — and receive 1–5 minutes of personalized video feedback from a verified coach. No travel. No scheduling conflicts. No barriers. Just expert coaching made affordable and accessible for every athlete, everywhere.

Ballmecca was born in Baltimore, Maryland, out of Loyola University Maryland, and has grown into a platform serving athletes across 15+ sports with verified coaches across the country. The platform is backed by partnerships with Leveling the Playing Field (LPF) and supported by the Baltiprenuers Accelerator Program.

**The app is live:**
- [App Store](https://apps.apple.com/us/app/ballmecca/id1663498139) — iOS 14+
- [Google Play](https://play.google.com/store/apps/details?id=com.ballmecca.ballmecca) — Android

---

## About this repository

This is the **public marketing website** for Ballmecca — the face of the brand at `ballmecca.com`. It is a fast, mobile-first, SEO-friendly static website built in plain HTML, CSS, and JavaScript. It connects to the Ballmecca Firebase database to display live coach data, and drives visitors to download the app.

This site is intentionally separate from the Flutter-based coach and athlete dashboards, which live at `app.ballmecca.com`. The marketing site prioritizes speed, search engine indexing, and visual impact on iPhone screens.

---

## What's on the site

### Home (`index.html`)
The primary landing experience. Designed to convert a first-time visitor into an app download within seconds.

- **Rotating hero** — full-screen background slideshow using Ballmecca's own athlete photography (golf, tennis). Headline: *"Revolutionizing sports education for the next generation."* App Store and Google Play download badges prominently displayed.
- **Stats bar** — key platform facts: 68% of youth coaches are unpaid volunteers, 20+ sports covered, 100% verified coaches.
- **Sport carousel** — horizontally scrollable cards for every sport on the platform. The final card is **Dance — Coming Soon**, with a direct call-to-action to download the app and get notified at launch.
- **How it works** — three-step visual explanation: upload a video → get matched with a coach → receive personalized feedback.
- **Top 5 coaches** — live data pulled from Firebase Firestore, ordered by rating. Shows coach photo, name, sport, star rating, and location. Links directly to the app. Falls back gracefully to placeholder cards if Firebase is not yet configured.
- **Mission strip** — Ballmecca's purpose statement alongside athlete photography. Links to the About page.
- **App download section** — dedicated full-width CTA with both store badges.
- **Join the movement CTA** — secondary call-to-action linking to the app and the contact page.

### About Us (`about.html`)
The story and soul of Ballmecca. Purpose-driven, human, and grounded in values.

- **Mission statement** — "We believe that with the right guidance and feedback, anyone can achieve greatness." Accompanied by the platform's founding ethos: providing access to top-tier coaching and supporting underserved youth through the power of sports.
- **Core values** — displayed as bold full-width stripe rows in Ballmecca's brand colors:
  - **Wisdom** — Learning from experience, mentors, and the game itself.
  - **Cura Personalis** — Latin for "care for the whole person." Nurturing athletes as people, not just players.
  - **Discipline** — Building habits that lead to excellence on the field and in the office.
  - **Access** — No athlete should be limited by their zip code.
- **Changing the game** — three impact statements about leveling the playing field for underserved athletes.
- **The team** — Manny Madera (CEO) and Amelia Arabe (CXIO). Engineers, athletes, and leaders.
- **Partnerships** — Leveling the Playing Field (LPF) and Loyola University Maryland, including the Baltiprenuers Accelerator, Engineering Department, Loyola Consulting Group, and Loyola Athletics.

### Contact (`contact.html`)
A clean, functional contact page that routes inquiries to the right place.

- Contact form powered by Formspree — submissions are emailed directly to `support@ballmecca.com`. Dropdown subject selector: Coach joining the platform / Athlete looking for coaching / Partnership / Press / General / Support.
- Direct email, app store links, and Instagram + YouTube social links displayed alongside the form.

### FAQ (`faq.html`)
Accordion-style frequently asked questions organized into three categories: General, For Athletes, and For Coaches. Covers how coaching sessions work, response time, safety for minors, payments via Stripe, the Coaching Rewards profit-sharing program, and team subscriptions.

### Policies (`policies.html`)
A structured legal policies page with a sticky sidebar navigation. Contains clearly marked placeholder sections for all seven policies — ready for legal text to be pasted in without touching the design:

- Privacy Policy
- Terms & Conditions
- Returns Policy
- Acceptable Use Policy
- Cookie Policy
- DMCA
- Disclaimer

---

## Technology

| Layer | Technology |
|-------|-----------|
| HTML | Semantic, accessible, mobile-first |
| CSS | Custom properties, no frameworks, League Spartan + DM Sans fonts |
| JavaScript | Vanilla JS — no build step, no dependencies |
| Database | Firebase Firestore (read-only, for live coach data) |
| Contact form | Formspree (free tier) |
| Hosting | Vercel (free tier, auto-deploy from GitHub) |

The site requires no Node.js, no build process, and no package manager. Open `index.html` in a browser and it works.

---

## Brand

| Element | Value |
|---------|-------|
| Primary font | League Spartan (headings, display) |
| Body font | DM Sans |
| Navy | `#0a0e1a` — primary background |
| Olive | `#4a5e1e` — mission sections, values |
| Cyan | `#00c9b1` — accents, icons, interactive elements |
| Orange | `#e84e1b` — CTAs, highlights, warmth |
| Cream | `#f0ece2` — values section background |

---

## Setup

### 1. Add images

Copy your photos into the `images/` folder with these exact filenames:

| Filename | What it is |
|----------|-----------|
| `logo-cyan.png` | Ballmecca logo, transparent background, cyan version |
| `favicon.png` | App icon (resize to 32x32px) |
| `hero-golf.jpg` | Golf course wide shot (hero slide 1) |
| `hero-golf2.jpg` | Golfer putting, close up (hero slide 2 + mission section) |
| `hero-tennis.jpg` | Tennis athlete with racket (hero slide 3) |
| `tennis-court.jpg` | Seated athlete, indoor (about page) |

### 2. Connect Firebase

Open `js/main.js` and fill in your Firebase project credentials:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "ballmecca-982c8.firebaseapp.com",
  projectId: "ballmecca-982c8",
  storageBucket: "ballmecca-982c8.appspot.com",
};
```

Find these values in: Firebase Console → Project Settings → Your Apps → Web App → SDK setup and config.

### 3. Connect the contact form

1. Create a free account at [formspree.io](https://formspree.io)
2. Create a new form and set the notification email to `support@ballmecca.com`
3. Copy the form ID (e.g. `xdoqkzrp`)
4. Open `contact.html` and replace `YOUR_FORM_ID`:

```html
<form action="https://formspree.io/f/YOUR_FORM_ID" ...>
```

### 4. Add legal policy text

Open `policies.html`. Each policy section has clearly marked comments:

```html
<!-- PASTE YOUR PRIVACY POLICY TEXT BELOW THIS LINE -->
<div class="policy-placeholder">...</div>
<!-- PASTE YOUR PRIVACY POLICY TEXT ABOVE THIS LINE -->
```

Delete the `<div class="policy-placeholder">` block and paste your text using `<h3>` for section headings and `<p>` for body paragraphs.

---

## Deployment

### Step 1 — GitHub

```bash
cd ~/Desktop/ballmecca-site
git init
git add .
git commit -m "Initial Ballmecca website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ballmecca-website.git
git push -u origin main
```

### Step 2 — Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project** and select `ballmecca-website`
3. Framework preset: **Other**
4. Click **Deploy**

Your site is live at `ballmecca-website.vercel.app` within about 60 seconds.

### Step 3 — Point ballmecca.com to Vercel

1. Vercel → your project → **Settings → Domains**
2. Add `ballmecca.com` and `www.ballmecca.com`
3. Vercel provides two DNS records
4. Log into your domain registrar and replace the existing FlutterFlow DNS records with Vercel's
5. DNS propagates within 30 minutes to a few hours

### Making updates

Any time you edit files locally:

```bash
git add .
git commit -m "describe what you changed"
git push
```

Vercel detects the push and redeploys automatically — typically live within 30 seconds.

---

## Related systems

| System | Description |
|--------|-------------|
| **Mobile app** | Flutter app on App Store and Google Play |
| **Coach & athlete dashboards** | Flutter web app hosted at `app.ballmecca.com` |
| **Internal team portal** | `/team` route in the Flutter web app — kanban board, announcements, staff directory |
| **Firebase** | Single Firestore database shared by the app, dashboards, and this marketing site |

---

## Contact

support@ballmecca.com
instagram.com/ballmecca
youtube.com/@ballmecca
