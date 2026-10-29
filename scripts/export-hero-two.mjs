import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Targeted hero role in the existing original -> WebP workflow.
// The shared portfolio manifest and its exports are deliberately left alone.
const root = fileURLToPath(new URL('../', import.meta.url));
const sourceId = '1AHXw2T2oqhW7XXNJcV10Q8oTUG0jYiEj';
const source = path.join(root, '.cache/drive-originals', `${sourceId}.jpg`);
const bytes = await fs.readFile(source);
const metadata = await sharp(source).metadata();
const rotated = (metadata.orientation ?? 1) >= 5;
const width = rotated ? metadata.height : metadata.width;
const height = rotated ? metadata.width : metadata.height;
const crops = {
  landscape: { left: 0, top: Math.round(height * 0.07), width, height: Math.round(width / 1.6) },
  portrait: { left: Math.round((width - height * 0.6) / 2), top: 0, width: Math.round(height * 0.6), height },
};
const fingerprint = crypto.createHash('sha256').update(bytes).update(JSON.stringify({ crops, quality: 78 })).digest('hex').slice(0, 12);
const output = path.join(root, 'public/media');
await fs.mkdir(output, { recursive: true });

const manifest = { sourceId, alt: 'Sonnenlicht über einer nebligen Wald- und Hügellandschaft', crops, landscape: [], portrait: [] };
for (const [role, crop] of Object.entries(crops)) {
  for (const targetWidth of role === 'landscape' ? [720, 1200, 1600, 2000] : [480, 720]) {
    const name = `hero-two-${fingerprint}-${role}-${targetWidth}.webp`;
    const target = path.join(output, name);
    try { await fs.access(target); }
    catch {
      await sharp(source).rotate().extract(crop)
        .resize({ width: targetWidth, withoutEnlargement: true })
        .toColourspace('srgb').webp({ quality: 78, effort: 4 }).toFile(target);
    }
    const result = await sharp(target).metadata();
    const stat = await fs.stat(target);
    manifest[role].push({ src: `/media/${name}`, width: result.width, height: result.height, bytes: stat.size });
  }
}
await fs.writeFile(path.join(root, 'src/data/hero-two.generated.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ sourceId, variants: [...manifest.landscape, ...manifest.portrait] }, null, 2));
