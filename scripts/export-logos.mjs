import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
// Private originals are downloaded with the authenticated Drive connector.
// Alternative colour versions represent the same mark and are not repeated.
const selection = [
  { id: '1C795EFCBkzrG9VV6KgMFGdqELeS7sYP3', ext: 'jpg', key: 'heidrich', name: 'Autohaus Heidrich', background: [255, 255, 255], keepBackground: true, width: 220 },
  { id: '1z5kgRfxlb1rd479aZqbzKMVoXLiBPUhg', ext: 'png', key: 'kxxma', name: 'KXXMA', width: 200 },
  { id: '1YrUctqrpIp9K6sR6H9Zj-guSOWQvyxUr', ext: 'png', key: 'green-eyes', name: 'Green Eyes Media', dark: true, width: 150 },
  { id: '1FM1TCg6u5lqGdtWHgp0xkfrvBoW3blzb', ext: 'png', key: 'kekila', name: 'Kekila', width: 138 },
  { id: '1DycU9UP8hxise_2AxBGd_9_V7aMoJq_K', ext: 'png', key: 'jamina', name: 'Jamina1404', width: 180 },
  { id: '1Mhc5o_aKxoBQzU5TUsHr89GvTPaSkiFL', ext: 'png', key: 'zixspeed', name: 'Zixspeed Racing Team', width: 230 },
  { id: '1MqYGgav-23gEkpuFgBx98EAVhTV3bvJR', ext: 'png', key: 'schalla-balla', name: 'Schalla Balla', width: 108 },
  { id: '1j9oB0HiTL_i5_eTn6KR6o84Bmap9mrNG', ext: 'jpg', key: 'schamo', name: 'Schamo Beachparty', background: [40, 39, 37], width: 165 },
  { id: '1O6C_w3_JuiwGDWhvuKrLfaJIS9geEjaK', ext: 'png', key: 'lounge-oderwitz', name: 'Lounge Oderwitz', width: 104 },
  { id: '1rml6AxtWaN3Q6-JtRdObCJKvqJ8_Y__k', ext: 'png', key: 'motorsport', name: 'Motorsport-Signet', width: 86 },
];

// Remove only the connected exterior background in the two supplied JPEGs.
// Transparent artwork keeps its original RGB colour and alpha channel.
function clearExterior(data, width, height, background) {
  const visited = new Uint8Array(width * height);
  const queue = new Uint32Array(width * height);
  let start = 0, end = 0;
  const enqueue = index => {
    if (visited[index]) return;
    visited[index] = 1;
    const p = index * 4;
    const distance = Math.max(...background.map((value, channel) => Math.abs(data[p + channel] - value)));
    if (distance <= 29) queue[end++] = index;
  };
  for (let x = 0; x < width; x++) { enqueue(x); enqueue((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { enqueue(y * width); enqueue(y * width + width - 1); }
  while (start < end) {
    const index = queue[start++]; data[index * 4 + 3] = 0;
    const x = index % width, y = Math.floor(index / width);
    if (x > 0) enqueue(index - 1); if (x < width - 1) enqueue(index + 1);
    if (y > 0) enqueue(index - width); if (y < height - 1) enqueue(index + width);
  }
  return data;
}

const logos = [];
const only = process.argv.find(arg => arg.startsWith('--only='))?.split('=')[1];
if (only && !selection.some(entry => entry.key === only)) throw new Error('Unknown logo selection');
for (const entry of selection.filter(entry => !only || entry.key === only)) {
  const source = path.join(root, '.cache/logo-originals', `${entry.id}.${entry.ext}`);
  const bytes = await fs.readFile(source);
  let prepared = await sharp(bytes).rotate().toColourspace('srgb')
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (entry.background && !entry.keepBackground) clearExterior(prepared.data, prepared.info.width, prepared.info.height, entry.background);
  const trimmed = await sharp(prepared.data, { raw: prepared.info }).trim({ threshold: 8 }).png().toBuffer();
  const hash = crypto.createHash('sha256').update(bytes).update(entry.keepBackground ? 'logo-original-white-v2' : 'logo-lossless-v1').digest('hex').slice(0, 10);
  const variants = [];
  for (const density of [1, 2]) {
    const output = await sharp(trimmed).resize({ width: entry.width * density, height: 90 * density, fit: 'inside', withoutEnlargement: true })
      .webp({ lossless: true, effort: 6 }).toBuffer({ resolveWithObject: true });
    const name = `logo-${entry.key}-${hash}-${density}x.webp`;
    await fs.writeFile(path.join(root, 'public/media', name), output.data);
    variants.push({ src: `/media/${name}`, width: output.info.width, height: output.info.height, bytes: output.data.length, density });
  }
  logos.push({ key: entry.key, name: entry.name, dark: entry.dark ?? false, variants });
}
const merged = only ? JSON.parse(await fs.readFile(path.join(root, 'src/data/logos.generated.json'), 'utf8')).logos.map(logo => logos.find(item => item.key === logo.key) ?? logo) : logos;
await fs.writeFile(path.join(root, 'src/data/logos.generated.json'), JSON.stringify({ logos: merged }, null, 2) + '\n');
await fs.mkdir(path.join(root, 'analyse/feedback-runde-01/implementation/AP-08'), { recursive: true });
await fs.writeFile(path.join(root, 'analyse/feedback-runde-01/implementation/AP-08/logo-export.json'), JSON.stringify({
  exportedAt: new Date().toISOString(), selection, logos,
  note: 'Supplied marks retain original colours. Heidrich keeps its supplied white ground to preserve enclosed shapes on the white logo strip. Only selected originals are re-exported when --only is set. Lossless WebP, originals private.'
}, null, 2) + '\n');
console.log(JSON.stringify({ marks: logos.length, variants: logos.length * 2, bytes: logos.reduce((total, logo) => total + logo.variants.reduce((sum, v) => sum + v.bytes, 0), 0) }));
