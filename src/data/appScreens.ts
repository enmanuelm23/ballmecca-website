// Real app screens from the Release 4 App Store captures (fictional athletes and
// data inside real app UI). Images live in src/assets/app-screens/<key>.webp and
// are regenerated with `npm run prepare-screens`.
export type ScreenKey =
  | 'video-analysis'
  | 'messages'
  | 'coach-search'
  | 'completed'
  | 'coach-mecha'
  | 'parent-verify'
  | 'parent-controls';

export const screens: Record<ScreenKey, { alt: string }> = {
  'video-analysis': { alt: "Ballmecca app: a coach drawing frame-by-frame feedback on an athlete's pitching video" },
  messages: { alt: "Ballmecca app: a coach's inbox with a team group chat and messages from athletes" },
  'coach-search': { alt: "Ballmecca app: searching baseball coaches, with each coach's experience and session prices" },
  completed: { alt: 'Ballmecca app: the Coaching tab listing completed sessions tagged Complete or Review submitted' },
  'coach-mecha': { alt: 'Ballmecca app: Coach Mecha, the in-app AI assistant, suggesting drills and practice plans' },
  'parent-verify': { alt: "Ballmecca app: the parent verification screen offering a refundable card check before an athlete's account is set up" },
  'parent-controls': { alt: "Ballmecca app: the Manage my athlete's data screen, with options to revoke consent or delete the athlete's data" },
};

export interface JourneyStep { eyebrow: string; title: string; body: string; screen: ScreenKey }

// "Your business, handled" on /coaches. Captions reuse the Release 4 store copy,
// which was checked against the app for accuracy. Team messaging is a paid coach
// subscription feature, so that step must say so.
export const journeySteps: JourneyStep[] = [
  {
    eyebrow: 'Get discovered',
    title: 'Get found beyond your local field.',
    body: 'Athletes search coaches by sport and see your experience, bio and rates. You price every one-off session.',
    screen: 'coach-search',
  },
  {
    eyebrow: 'Get paid',
    title: 'See what you earn before you record.',
    body: "Draw on the athlete's clip frame by frame, record your voiceover, and get paid out to your Stripe account.",
    screen: 'video-analysis',
  },
  {
    eyebrow: 'Session tracking',
    title: 'From request to completed.',
    body: 'The Coaching tab tracks each session from request to completed, so you see your body of work add up.',
    screen: 'completed',
  },
  {
    eyebrow: 'One inbox',
    title: "Your team's chats, one inbox.",
    body: 'With a coach subscription, message the athletes on your team and your team chat, all in one place.',
    screen: 'messages',
  },
];

// The banner that closes the journey section.
export const mecha: JourneyStep = {
  eyebrow: 'Coach Mecha',
  title: 'Stuck on a drill? Ask Coach Mecha.',
  body: 'Your in-app AI assistant helps you brainstorm drills, practice plans and workout outlines.',
  screen: 'coach-mecha',
};

export interface TrustPoint {
  title: string;
  body: string;
  // Where the numbered marker sits on the screen, in % of its width and height.
  marker: { screen: ScreenKey; x: number; y: number };
}

// Homepage Trust & Safety. Wording must stay consistent with the Privacy
// Policy's Children's Privacy section (verification before any collection).
export const trustPoints: TrustPoint[] = [
  {
    title: 'A parent verifies first',
    body: "Under 13? A parent creates the account and confirms it with a quick, refundable card check before any of the athlete's information is collected.",
    marker: { screen: 'parent-verify', x: 87, y: 83.3 }, // "Verify with card" button
  },
  {
    title: 'Consent can be revoked anytime',
    body: "Revoking consent stops all collection and use of the athlete's data immediately.",
    marker: { screen: 'parent-controls', x: 88, y: 51.3 }, // "Revoke consent" card
  },
  {
    title: 'Parents can delete the data',
    body: "Review what's on file, or permanently delete the athlete's data, right in the app.",
    marker: { screen: 'parent-controls', x: 88, y: 74.5 }, // "Delete my athlete's data now" card
  },
];

export const trustPillars = [
  {
    icon: 'badge-check',
    title: 'Credential-checked coaches',
    body: "We review the credentials each coach submits before they can coach. It's a credential check, not a background check or a guarantee of safety.",
  },
  {
    icon: 'lock',
    title: 'Secure payments',
    body: 'Payments are processed securely through Stripe. You only pay for sessions you book.',
  },
] as const;
