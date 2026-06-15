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
  formEndpoint: '/api/submitForm',
  // GA4 measurement id (e.g. 'G-XXXX'); empty disables analytics. Owner to provide (spec §12).
  ga4Id: '',
} as const;
