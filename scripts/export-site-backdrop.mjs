import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// A targeted decorative role in the existing private-original -> WebP pipeline.
const root = fileURLToPath(new URL('../', import.meta.url));
const sourceId = '171xak3oe2QLpcW5He397Q7UDrxQD4l4X';
const sourceName = '7IV05521.jpg';
const original = path.join(root, '.cache/drive-originals', `${sourceId}.jpg`);
const bytes = await fs.readFile(original);
const metadata = await sharp(original).metadata();
const rotated = (metadata.orientation ?? 1) >= 5;
const width = rotated ? metadata.height : metadata.width;
const height = rotated ? metadata.width : metadata.height;
// Upper lights/foliage, and a left-hand portrait detail. The car stays outside both crops.
const crops = {
  landscape: { left: 0, top: 0, width: Math.round(width * .65), height: Math.round(height * .38) },
  portrait: { left: 0, top: 0, width: Math.round(width * .26), height: Math.round(height * .65) },
};
const hash = crypto.createHash('sha256').update(bytes).update(JSON.stringify({ crops, quality: 78 })).digest('hex').slice(0, 12);
const manifest = { sourceId, sourceName, description: 'Warme Lichter und Baumkronen, dekorativer Detailausschnitt', crops, landscape: [], portrait: [] };
await fs.mkdir(path.join(root, 'public/media'), { recursive: true });
for (const [role, crop] of Object.entries(crops)) {
  for (const targetWidth of role === 'landscape' ? [1200, 2000] : [480, 720]) {
    const name = `sandro-lichter-${hash}-${role}-${targetWidth}.webp`;
    const target = path.join(root, 'public/media', name);
    try { await fs.access(target); }
    catch {
      await sharp(original).rotate().extract(crop).resize({ width: targetWidth, withoutEnlargement: true })
        .toColourspace('srgb').webp({ quality: 78, effort: 4 }).toFile(target);
    }
    const result = await sharp(target).metadata();
    const stat = await fs.stat(target);
    manifest[role].push({ src: `/media/${name}`, width: result.width, height: result.height, bytes: stat.size });
  }
}
await fs.writeFile(path.join(root, 'src/data/site-backdrop.generated.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
