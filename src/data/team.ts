export interface TeamMember { name: string; role: string; bio: string }
export interface Contributor { name: string; credit: string }

// "Meet the team" on the About page.
export const team: TeamMember[] = [
  {
    name: 'Enmanuel Madera',
    role: 'CEO',
    bio: "A former baseball player who went on to become a proud nerd in college, majoring in Aerospace and Mechanical Engineering. Now building the tools to put quality coaching within every athlete's reach.",
  },
  {
    name: 'Tess Madera',
    role: 'Chief Brand Officer',
    bio: 'A former swimmer and cross country runner who began her career as an educator, then led marketing and communications for nonprofit organizations. Now shaping how Ballmecca tells its story.',
  },
];

// "The original lineup" — people who helped build Ballmecca's first versions.
// Shown at the bottom of the About page, in this order.
export const lineup: Contributor[] = [
  { name: 'Amelia Arabe', credit: 'Led community experience and operations as CXIO.' },
  { name: 'Justin Starkman', credit: 'The Original Co-founder — Developed the original Ballmecca Video Analysis tool.' },
  { name: 'Perla Peralta', credit: "Developed Ballmecca's original marketing strategy." },
  { name: 'Misgana Yousief', credit: 'Developed the original Coach Mecha AI assistant.' },
  { name: 'Katherine Pena', credit: "Led Ballmecca's first sales efforts and helped pivot the business toward the coach subscription model." },
  { name: 'Laura Rodriguez', credit: "Our first intern. Created Ballmecca's first polished visual materials and took Enmanuel and Justin's first photo as co-founders." },
  { name: 'Felix Laniyan', credit: 'Our second intern. Developed the first version of the Ballmecca Sports House Map.' },
];
