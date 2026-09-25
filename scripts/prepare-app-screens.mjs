// Turns the raw App Store captures into the app screens the site shows.
//
//   npm run prepare-screens -- "<path to _edited captures (sRGB)>"
//
// Source: the "STORE READY - coaches" set's `_edited captures (sRGB)` folder
// (phone captures, 1206 px wide, already converted from Display P3 to sRGB).
// Output: src/assets/app-screens/<key>.webp at 720 px wide. Astro's image
// pipeline makes the served sizes and formats from these.
//
// Privacy: the Coach Search capture shows the capturing account's real photo in
// the header. It is replaced with the app's own no-photo avatar, copied from the
// Messages capture, which is exactly what the app shows for a user without a photo.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = process.argv[2];
if (!src) {
  console.error('Usage: npm run prepare-screens -- "<path to _edited captures (sRGB)>"');
  process.exit(1);
}
const out = fileURLToPath(new URL('../src/assets/app-screens/', import.meta.url));
const CAPTURE_WIDTH = 1206; // the avatar coordinates below assume this width
const OUTPUT_WIDTH = 720;

// capture file -> screen key used by src/data/appScreens.ts
const captures = {
  'p-video-analysis.png': 'video-analysis',
  'p-messages.png': 'messages',
  'p-coach-search.png': 'coach-search',
  'p-completed-sessions.png': 'completed',
  'p-ai-coach.png': 'coach-mecha',
  'p-parents-in-control.png': 'parent-verify',
  'p-parental-controls.png': 'parent-controls',
};

async function assertWidth(file) {
  const { width } = await sharp(file).metadata();
  if (width !== CAPTURE_WIDTH) throw new Error(`${file} is ${width}px wide; expected ${CAPTURE_WIDTH}`);
}

// The no-photo avatar from the Messages list (second row), cut to a circle.
async function genericAvatar(diameter) {
  const file = join(src, 'p-messages.png');
  await assertWidth(file);
  const circle = Buffer.from(
    `<svg width="${diameter}" height="${diameter}"><circle cx="${diameter / 2}" cy="${diameter / 2}" r="${diameter / 2}" fill="#fff"/></svg>`,
  );
  return sharp(file)
    .extract({ left: 48, top: 812, width: 145, height: 145 })
    .resize(diameter, diameter)
    .composite([{ input: circle, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

// Coach Search with the signed-in account's photo (centred at 930,269) replaced.
async function coachSearchWithoutRealAvatar() {
  const file = join(src, 'p-coach-search.png');
  await assertWidth(file);
  const d = 128;
  return sharp(file)
    .composite([{ input: await genericAvatar(d), left: 930 - d / 2, top: 269 - d / 2 }])
    .png()
    .toBuffer();
}

await mkdir(out, { recursive: true });
for (const [file, key] of Object.entries(captures)) {
  const input = key === 'coach-search' ? await coachSearchWithoutRealAvatar() : join(src, file);
  const info = await sharp(input).resize({ width: OUTPUT_WIDTH }).webp({ quality: 90 }).toFile(join(out, `${key}.webp`));
  console.log(`${key.padEnd(16)} ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
}
