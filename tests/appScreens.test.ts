// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { screens, journeySteps, mecha, trustPoints, trustPillars, type ScreenKey } from '../src/data/appScreens';

// Expectations come from the agreed design (Sept 2026: coach journey on
// /coaches, parent trust section on the homepage) and the Release 4 store
// README's accuracy rules — not from the implementation.

const assetPath = (key: string) => fileURLToPath(new URL(`../src/assets/app-screens/${key}.webp`, import.meta.url));

describe('coach journey (/coaches)', () => {
  it('tells the story in order: discovered, paid, tracking, inbox', () => {
    expect(journeySteps.map((s) => s.eyebrow)).toEqual(['Get discovered', 'Get paid', 'Session tracking', 'One inbox']);
  });

  it('pairs each step with the screen that shows it', () => {
    const screenFor = Object.fromEntries(journeySteps.map((s) => [s.eyebrow, s.screen]));
    expect(screenFor).toEqual({
      'Get discovered': 'coach-search',
      'Get paid': 'video-analysis',
      'Session tracking': 'completed',
      'One inbox': 'messages',
    });
  });

  it('says team messaging needs a coach subscription', () => {
    const inbox = journeySteps.find((s) => s.eyebrow === 'One inbox')!;
    expect(inbox.body).toMatch(/with a coach subscription/i);
  });

  it('closes on Coach Mecha with its own screen', () => {
    expect(mecha.screen).toBe('coach-mecha');
    expect(mecha.title).toMatch(/Coach Mecha/);
  });
});

describe('trust section (homepage)', () => {
  it('walks parents through verify, revoke, delete', () => {
    expect(trustPoints.map((t) => t.title)).toEqual([
      'A parent verifies first',
      'Consent can be revoked anytime',
      'Parents can delete the data',
    ]);
  });

  it('puts each numbered marker on the right screen, inside it', () => {
    expect(trustPoints.map((t) => t.marker.screen)).toEqual(['parent-verify', 'parent-controls', 'parent-controls']);
    for (const { marker } of trustPoints) {
      expect(marker.x).toBeGreaterThan(0);
      expect(marker.x).toBeLessThan(100);
      expect(marker.y).toBeGreaterThan(0);
      expect(marker.y).toBeLessThan(100);
    }
  });

  it('matches the Privacy Policy: the parent verifies before anything is collected', () => {
    expect(trustPoints[0].body).toMatch(/before any of the athlete's information is collected/);
  });

  it('keeps the two remaining pillars: credential checks and Stripe payments', () => {
    expect(trustPillars.map((p) => p.title)).toEqual(['Credential-checked coaches', 'Secure payments']);
    expect(trustPillars[1].body).toMatch(/Stripe/);
  });
});

describe('copy accuracy', () => {
  const allCopy = [
    ...journeySteps.flatMap((s) => [s.eyebrow, s.title, s.body]),
    mecha.title, mecha.body,
    ...trustPoints.flatMap((t) => [t.title, t.body]),
    ...trustPillars.flatMap((p) => [p.title, p.body]),
  ];

  it('never claims a background check (coach vetting is a credential review only)', () => {
    for (const text of allCopy) {
      for (const m of text.matchAll(/background[- ]check/gi)) {
        expect(text.slice(0, m.index)).toMatch(/not an? $/i);
      }
    }
    expect(trustPillars[0].body).toMatch(/not a background check/);
  });
});

describe('app screen images', () => {
  const used = new Set<ScreenKey>([
    ...journeySteps.map((s) => s.screen),
    mecha.screen,
    ...trustPoints.map((t) => t.marker.screen),
    'video-analysis', 'messages', // homepage hero
  ]);

  it('has an image file and real alt text for every screen used', () => {
    for (const key of used) {
      expect(existsSync(assetPath(key)), `${key}.webp`).toBe(true);
      expect(screens[key].alt.length, `${key} alt`).toBeGreaterThan(30);
    }
  });

  it("shows the app's no-photo avatar in Coach Search, not the real account photo", async () => {
    // Avatar centre in the 720px image: (930, 269) scaled by 720/1206.
    const img = sharp(assetPath('coach-search'));
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    const px = (x: number, y: number) => {
      const i = (Math.round(y) * info.width + Math.round(x)) * info.channels;
      return [data[i], data[i + 1], data[i + 2]];
    };
    const cx = 930 * (720 / 1206), cy = 269 * (720 / 1206);
    // Ring of the circle: the dark brown the app paints behind the person icon.
    for (const [x, y] of [[cx - 30, cy], [cx + 30, cy], [cx, cy + 32]]) {
      const [r, g, b] = px(x, y);
      expect(r, 'red').toBeLessThan(70);
      expect(g, 'green').toBeLessThan(40);
      expect(b, 'blue').toBeLessThan(25);
      expect(r).toBeGreaterThan(b);
    }
    // The orange person icon's head, just above the centre.
    const [r, g, b] = px(cx, cy - 8);
    expect(r).toBeGreaterThan(200);
    expect(g).toBeGreaterThan(60);
    expect(g).toBeLessThan(130);
    expect(b).toBeLessThan(60);
  });
});
