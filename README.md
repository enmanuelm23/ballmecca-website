# Ballmecca Website

Marketing site for ballmecca.com — 5 pages, Firebase-connected, mobile-first.

## File structure

```
ballmecca-site/
├── index.html          ← Home page
├── about.html          ← About Us
├── contact.html        ← Contact (with Formspree form)
├── faq.html            ← FAQ (accordion)
├── policies.html       ← All legal policies (structured placeholders)
├── css/
│   ├── style.css       ← Shared styles (nav, footer, buttons, typography)
│   ├── home.css        ← Home page styles
│   └── about.css       ← About page styles
├── js/
│   └── main.js         ← Nav, scroll reveal, sport carousel, Firebase coaches
└── images/             ← Put your photos here (see below)
```

## Images needed

Copy these files into the `images/` folder:

| Filename | Source |
|----------|--------|
| `logo-cyan.png` | transparent_background_logo.png (your cyan logo) |
| `favicon.png` | icon_logo_1024x1024_white_on_black.png (resize to 32x32) |
| `hero-golf.jpg` | IMG_9792.jpeg (golf course wide shot) |
| `hero-golf2.jpg` | IMG_8692.jpeg (golfer putting) |
| `hero-tennis.jpg` | DSCF0006.JPG (tennis athlete) |
| `tennis-court.jpg` | DSCF9986.JPG (seated athlete) |

## Setup checklist

### 1. Add your images
Copy your photos into `images/` with the filenames above.

### 2. Connect Firebase (for live top coaches section)
Open `js/main.js` and replace the firebaseConfig block:
```js
const firebaseConfig = {
  apiKey: "YOUR_REAL_API_KEY",           // ← from Firebase console
  authDomain: "ballmecca-982c8.firebaseapp.com",
  projectId: "ballmecca-982c8",
  storageBucket: "ballmecca-982c8.appspot.com",
};
```
Get these values from: Firebase Console → Project Settings → Your Apps → Web App → SDK setup

### 3. Set up the contact form (Formspree)
1. Go to https://formspree.io and create a free account
2. Create a new form → copy the form ID (looks like `xdoqkzrp`)
3. Open `contact.html` and replace `YOUR_FORM_ID`:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" ...>
   ```
4. Formspree will email submissions to support@ballmecca.com (set this in your Formspree dashboard)

### 4. Add your policy text
Open `policies.html` and for each section, delete the placeholder `<div class="policy-placeholder">` block and paste your actual policy text using `<h3>` headings and `<p>` paragraphs.

---

## Deploy to Vercel (free)

### Step 1 — Put the site on GitHub
1. Go to github.com → New repository → name it `ballmecca-website` → Public → Create
2. In terminal:
```bash
cd ~/Desktop/ballmecca-site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ballmecca-website.git
git push -u origin main
```

### Step 2 — Connect to Vercel
1. Go to vercel.com → Sign up with GitHub
2. Click "Add New Project"
3. Select `ballmecca-website` from your repos
4. Framework: "Other" (it's plain HTML)
5. Click Deploy → your site is live at `ballmecca-website.vercel.app`

### Step 3 — Connect ballmecca.com
1. In Vercel → your project → Settings → Domains
2. Add `ballmecca.com` and `www.ballmecca.com`
3. Vercel will show you two DNS records to add
4. Log into your domain registrar (GoDaddy, Namecheap, etc.)
5. Replace the existing FlutterFlow DNS records with Vercel's records
6. Within 30 minutes, ballmecca.com points to this site

---

## Updating the site going forward

Any time you make a change locally:
```bash
git add .
git commit -m "describe what you changed"
git push
```
Vercel auto-deploys within ~30 seconds. No extra steps.

---

## Policies page
The `policies.html` file has clearly marked placeholder blocks for each policy:
```html
<!-- ↓ PASTE YOUR PRIVACY POLICY TEXT BELOW THIS LINE ↓ -->
<div class="policy-placeholder">...</div>
<!-- ↑ PASTE YOUR PRIVACY POLICY TEXT ABOVE THIS LINE ↑ -->
```
Delete the `<div class="policy-placeholder">` and paste your text using:
- `<h3>Section Title</h3>` for subheadings
- `<p>Your paragraph text.</p>` for body text
- `<ul><li>Item</li></ul>` for lists
