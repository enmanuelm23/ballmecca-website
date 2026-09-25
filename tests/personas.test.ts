import { describe, expect, it } from 'vitest';
import { personaByKey } from '../src/data/personas';

// Persona pages label themselves "For <plural>" and "Why <plural> choose
// Ballmecca". English plurals aren't always noun + "s" ("Coachs" shipped once).
describe('persona plural labels', () => {
  it('uses the correct plural for each persona', () => {
    expect(personaByKey('athlete').plural).toBe('Athletes');
    expect(personaByKey('coach').plural).toBe('Coaches');
    expect(personaByKey('recruiter').plural).toBe('Recruiters');
  });
});
