import { describe, expect, it } from 'vitest';
import { team, lineup } from '../src/data/team';

// Expectations come from the requested About-page change (Sept 2026), not from
// the implementation: Tess replaces Amelia on the core team, Enmanuel's bio is
// toned down, and Amelia plus six early contributors move to "The original
// lineup" at the bottom of the page.

const names = (xs: { name: string }[]) => xs.map((x) => x.name);

describe('core team', () => {
  it('is exactly Enmanuel (CEO) then Tess (Chief Brand Officer)', () => {
    expect(team.map(({ name, role }) => ({ name, role }))).toEqual([
      { name: 'Enmanuel Madera', role: 'CEO' },
      { name: 'Tess Madera', role: 'Chief Brand Officer' },
    ]);
  });

  it("describes Tess's athletic, teaching and nonprofit background", () => {
    const bio = team.find((t) => t.name === 'Tess Madera')!.bio.toLowerCase();
    for (const word of ['swimmer', 'cross country', 'educator', 'nonprofit', 'marketing', 'communications']) {
      expect(bio).toContain(word);
    }
  });

  it("gives Enmanuel the humbler bio: baseball to engineering, no 'visionary'", () => {
    const bio = team.find((t) => t.name === 'Enmanuel Madera')!.bio;
    expect(bio).toMatch(/baseball/i);
    expect(bio).toContain('Aerospace and Mechanical Engineering');
    expect(bio).not.toMatch(/visionary/i);
  });
});

it('uses the name Enmanuel everywhere, never Manny', () => {
  expect(JSON.stringify({ team, lineup })).not.toMatch(/Manny/);
  expect(lineup.find((c) => c.name === 'Laura Rodriguez')!.credit).toContain("Enmanuel and Justin's first photo");
});

describe('the original lineup', () => {
  it('lists the seven contributors in the order given', () => {
    expect(names(lineup)).toEqual([
      'Amelia Arabe',
      'Justin Starkman',
      'Perla Peralta',
      'Misgana Yousief',
      'Katherine Pena',
      'Laura Rodriguez',
      'Felix Laniyan',
    ]);
  });

  it('moves Amelia here instead of dropping or duplicating her', () => {
    expect(names(team)).not.toContain('Amelia Arabe');
    expect(names(lineup).filter((n) => n === 'Amelia Arabe')).toHaveLength(1);
  });

  it('credits each person with their own contribution', () => {
    const credit = (name: string) => lineup.find((c) => c.name === name)!.credit;
    expect(credit('Amelia Arabe')).toMatch(/community experience/i);
    expect(credit('Justin Starkman')).toMatch(/Video Analysis/);
    expect(credit('Perla Peralta')).toMatch(/marketing strategy/i);
    expect(credit('Misgana Yousief')).toMatch(/AI assistant/i);
    expect(credit('Katherine Pena')).toMatch(/sales/i);
    expect(credit('Katherine Pena')).toMatch(/subscription/i);
    expect(credit('Laura Rodriguez')).toMatch(/intern/i);
    expect(credit('Laura Rodriguez')).toMatch(/photo/i);
    expect(credit('Felix Laniyan')).toMatch(/Sports House Map/);
  });

  it('does not label Justin as a co-founder', () => {
    const justin = lineup.find((c) => c.name === 'Justin Starkman')!;
    expect(justin.credit).not.toMatch(/co-?founder/i);
  });
});
