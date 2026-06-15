import type { PersonaKey } from '../data/personas';

export const PERSONA_STORAGE_KEY = 'bm_persona';
const VALID: readonly PersonaKey[] = ['athlete', 'coach', 'recruiter'];

function isValid(v: string | null): v is PersonaKey {
  return v !== null && (VALID as readonly string[]).includes(v);
}

export function getPersona(): PersonaKey | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const v = localStorage.getItem(PERSONA_STORAGE_KEY);
    return isValid(v) ? v : null;
  } catch {
    // Some browsers throw on storage access in private mode.
    return null;
  }
}

export function setPersona(key: PersonaKey): void {
  if (typeof localStorage === 'undefined') return;
  if (!isValid(key)) return;
  try {
    localStorage.setItem(PERSONA_STORAGE_KEY, key);
  } catch {
    // Storage may be unavailable/denied (private mode, quota) — fail silently.
  }
}
