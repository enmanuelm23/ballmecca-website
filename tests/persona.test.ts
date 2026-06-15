import { beforeEach, describe, expect, it } from 'vitest';
import { getPersona, setPersona, PERSONA_STORAGE_KEY } from '../src/lib/persona';

beforeEach(() => localStorage.clear());

describe('persona persistence', () => {
  it('returns null when nothing stored', () => {
    expect(getPersona()).toBeNull();
  });
  it('persists and reads back a valid persona', () => {
    setPersona('coach');
    expect(getPersona()).toBe('coach');
    expect(localStorage.getItem(PERSONA_STORAGE_KEY)).toBe('coach');
  });
  it('round-trips all three valid keys', () => {
    for (const k of ['athlete', 'coach', 'recruiter'] as const) {
      setPersona(k); expect(getPersona()).toBe(k);
    }
  });
  it('ignores an invalid value on read (returns null)', () => {
    localStorage.setItem(PERSONA_STORAGE_KEY, 'banana');
    expect(getPersona()).toBeNull();
  });
  it('refuses to store an invalid value', () => {
    // @ts-expect-error testing runtime guard
    setPersona('banana');
    expect(localStorage.getItem(PERSONA_STORAGE_KEY)).toBeNull();
  });
});
