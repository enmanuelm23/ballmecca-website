export interface FaqItem { q: string; a: string }
export interface FaqCategory { title: string; items: FaqItem[] }

// Ported verbatim from the legacy faq.html (3 categories). Answers keep simple
// inline links as HTML so the Faq component can render them with set:html.
export const faqCategories: FaqCategory[] = [
  {
    title: 'General',
    items: [
      {
        q: 'What is Ballmecca?',
        a: "Ballmecca is a sports coaching marketplace that connects athletes with verified coaches through short video sessions. Athletes upload a clip of their performance, a coach reviews it and sends back 1–5 minutes of personalized feedback and drills. It's elite coaching made affordable and accessible — anytime, anywhere.",
      },
      {
        q: 'What sports does Ballmecca cover?',
        a: 'We currently cover basketball, baseball, softball, soccer, football, tennis, golf, swimming, track & field, gymnastics, hockey, lacrosse, wrestling, rowing, and running. Dance is coming soon — download the app to be notified when it launches.',
      },
      {
        q: 'How do I get started?',
        a: 'Download the Ballmecca app from the <a href="https://apps.apple.com/us/app/ballmecca/id1663498139">App Store</a> or <a href="https://play.google.com/store/apps/details?id=com.ballmecca.ballmecca">Google Play</a>. Create an account, choose whether you\'re an athlete or a coach, and you\'ll be guided through the rest. It takes less than 5 minutes.',
      },
    ],
  },
  {
    title: 'For Athletes',
    items: [
      {
        q: 'How does a coaching session work?',
        a: "Browse coaches in your sport, select one, and purchase a session. Record a short video of your technique — a swing, a throw, a serve, a run. Upload it directly to your coach. They'll send back a personalized video analysis (1–5 minutes) with specific feedback and drills tailored to you.",
      },
      {
        q: 'How quickly will I get feedback?',
        a: "Most coaches respond within 24–48 hours. Response time is displayed on each coach's profile. If a coach hasn't responded within the stated time, you can contact us at <a href=\"mailto:support@ballmecca.com\">support@ballmecca.com</a>.",
      },
      {
        q: 'Is Ballmecca safe for my child?',
        a: 'Yes. All coaches are verified before they can accept sessions. Parental consent is required for athletes under 13. All payments are handled securely through Stripe. We take the safety of young athletes very seriously — it\'s core to everything we build.',
      },
      {
        q: "What if I'm not happy with my session?",
        a: "We want every session to be valuable. If you're not satisfied, reach out to us at <a href=\"mailto:support@ballmecca.com\">support@ballmecca.com</a> within 7 days and we'll work with you to make it right.",
      },
    ],
  },
  {
    title: 'For Coaches',
    items: [
      {
        q: 'How do I become a coach on Ballmecca?',
        a: 'Download the app, create a coach account, and complete your profile. Our team will review your application and verify your credentials. Once approved, you can set your rate, choose your sports, and start accepting sessions.',
      },
      {
        q: 'How do I get paid?',
        a: 'Payments are processed securely through Stripe with payouts to your bank account. You set your own rate per session. Ballmecca takes a small platform fee; the majority goes directly to you.',
      },
      {
        q: 'What is the Coaching Rewards program?',
        a: "Coaches earn profit sharing whenever an athlete they refer purchases a coaching session — receiving 50% of Ballmecca's fee on those sessions. It's our way of rewarding coaches who grow the community.",
      },
      {
        q: 'Can I offer team subscriptions?',
        a: "Yes. Team subscriptions allow coaches to give free bite-sized feedback to their athletes while tracking activity directly through the app. It's perfect for coaches who work with schools, clubs, or youth organizations.",
      },
    ],
  },
];
