import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, '.cache/drive-originals/1tFyxGO07brxTGIa5zMeyhyKhm4zvTB8b.mp4');
const frameSeconds = 45;
const variants = [];
for (const width of [800, 1200]) {
  const src = `/media/poster-zixspeed-${frameSeconds}s-${width}.webp`;
  const target = path.join(root, 'public', src.slice(1));
  const result = spawnSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-ss', String(frameSeconds), '-i', source,
    '-frames:v', '1', '-vf', `scale=${width}:-2`, '-map_metadata', '-1', '-quality', '78', target,
  ], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'Posterexport fehlgeschlagen');
  const metadata = await sharp(target).metadata();
  variants.push({ src, width: metadata.width, height: metadata.height, bytes: (await fs.stat(target)).size });
}
await fs.writeFile(path.join(root, 'src/data/film-section.generated.json'), JSON.stringify({ zixspeed: variants }, null, 2) + '\n');
const reportDirectory = path.join(root, 'analyse/2026-10-29-filmsektion');
await fs.mkdir(reportDirectory, { recursive: true });
await fs.writeFile(path.join(reportDirectory, 'poster-export.json'), JSON.stringify({
  film: 'zixspeed', frameSeconds, source: path.relative(root, source), format: 'webp', quality: 78, variants,
}, null, 2) + '\n');
console.log(JSON.stringify({ frameSeconds, variants }));
