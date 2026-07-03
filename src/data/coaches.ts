export interface Coach {
  name: string;
  sport: string;
  image: string;       // path under /images/coaches/
  credential?: string; // real credential only
  location?: string;
}
// Real featured coaches (names + sports supplied by the team). Photos live in
// public/images/coaches/ (optimized square crops). Add `credential`/`location`
// per coach only when the team provides verified values — never fabricate.
export const featuredCoaches: Coach[] = [
  { name: 'Coach Derrick Alston', sport: 'Basketball', image: '/images/coaches/derrick-alston.jpg' },
  { name: 'Coach Christin Stewart', sport: 'Baseball', image: '/images/coaches/christin.jpg' },
  { name: 'Coach Christian Ellis', sport: 'Football', image: '/images/coaches/christian-ellis.jpg' },
  { name: 'Coach Jada Moore', sport: 'Track & Field', image: '/images/coaches/jada-moore.jpg' },
  { name: 'Coach Peter Marris', sport: 'Baseball', image: '/images/coaches/peter-marris.jpg' },
  { name: 'Coach Daniel Buell', sport: 'Golf', image: '/images/coaches/daniel-buell.jpg' },
  { name: 'Coach Kevin Vi', sport: 'Tennis', image: '/images/coaches/kevin-vi.jpg' },
  { name: 'Coach Rick A.', sport: 'Baseball', image: '/images/coaches/rick-a.jpg' },
];
