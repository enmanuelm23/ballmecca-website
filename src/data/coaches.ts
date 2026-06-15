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
