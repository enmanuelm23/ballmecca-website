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
