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
