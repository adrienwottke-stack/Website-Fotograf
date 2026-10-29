import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceId = '1AHXw2T2oqhW7XXNJcV10Q8oTUG0jYiEj';
const original = path.join(root, '.cache/drive-originals', `${sourceId}.jpg`);
const bytes = await fs.readFile(original);
const metadata = await sharp(original).metadata();
const rotated = (metadata.orientation ?? 1) >= 5;
const width = rotated ? metadata.height : metadata.width;
const height = rotated ? metadata.width : metadata.height;
// Keep the sky, misty horizon and forest in the wide crop; mobile uses the
// original vertical composition. Only these generated WebP variants are public.
const crops = {
  landscape: { left: 0, top: Math.round(height * .14), width, height: Math.round(width / 1.5) },
  portrait: { left: 0, top: 0, width, height },
};
const quality = 74;
const hash = crypto.createHash('sha256').update(bytes).update(JSON.stringify({ crops, quality })).digest('hex').slice(0, 12);
const manifest = { sourceId, sourceName: '7IV02821.jpg', description: 'Sonnenlicht über einer nebligen Wald- und Hügellandschaft', format: 'webp', quality, crops, landscape: [], portrait: [] };
await fs.mkdir(path.join(root, 'public/media'), { recursive: true });
for (const [role, crop] of Object.entries(crops)) {
  for (const targetWidth of role === 'landscape' ? [1200, 2000] : [480, 720]) {
    const name = `sandro-nebellandschaft-${hash}-${role}-${targetWidth}.webp`;
    const target = path.join(root, 'public/media', name);
    try { await fs.access(target); }
    catch {
      await sharp(original).rotate().extract(crop).resize({ width: targetWidth, withoutEnlargement: true })
        .toColourspace('srgb').webp({ quality, effort: 4 }).toFile(target);
    }
    const info = await sharp(target).metadata();
    const stat = await fs.stat(target);
    manifest[role].push({ src: `/media/${name}`, width: info.width, height: info.height, bytes: stat.size });
  }
}
await fs.writeFile(path.join(root, 'src/data/theme-backdrop.generated.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
