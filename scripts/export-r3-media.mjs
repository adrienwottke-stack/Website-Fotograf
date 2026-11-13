import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

// Bounded R3 export: two supplied photographs and two frames from private originals.
// No downloads, video re-encoding, collection reset, or analysis proxy inputs.
const root = fileURLToPath(new URL('../', import.meta.url));
const schamoOnly = process.argv.includes('--schamo-only');
const reportDir = path.join(root, schamoOnly ? 'analyse/feedback-runde-03/nacharbeit-2026-11-13/umsetzung-bilder-marke' : 'analyse/feedback-runde-03/implementation/AP03');
const manifestFile = path.join(root, 'src/data/media.generated.json');
await fs.mkdir(reportDir, { recursive: true });
const data = JSON.parse(await fs.readFile(manifestFile, 'utf8'));
try { await fs.copyFile(manifestFile, path.join(reportDir, 'media-before.json'), fs.constants.COPYFILE_EXCL); } catch (error) { if (error.code !== 'EEXIST') throw error; }
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const report = { exportedAt: new Date().toISOString(), photos: [], posters: [], quality: 78, longEdge: 2400 };

async function variants(source, prefix) {
  const all = [];
  for (const width of [360, 600, 900, 1200, 1600]) {
    const result = await sharp(source).rotate().toColourspace('srgb')
      .resize({ width, height: 2400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 }).toBuffer({ resolveWithObject: true });
    if (all.some(item => item.width === result.info.width && item.height === result.info.height)) continue;
    const src = `/media/r3-${prefix}-${result.info.width}.webp`;
    await fs.writeFile(path.join(root, 'public', src.slice(1)), result.data);
    const meta = await sharp(result.data).metadata();
    if (meta.exif || meta.icc || meta.iptc || meta.xmp || meta.format !== 'webp') throw new Error('Unexpected output metadata/format');
    all.push({ src, width: meta.width, height: meta.height, bytes: result.data.length });
  }
  return all;
}

async function entry(id, source, prefix, alt, kind) {
  const meta = await sharp(source).metadata();
  const width = meta.autoOrient?.width ?? meta.width, height = meta.autoOrient?.height ?? meta.height;
  const all = await variants(source, prefix);
  const pixel = await sharp(source).rotate().toColourspace('srgb').resize(1, 1).removeAlpha().raw().toBuffer();
  const color = '#' + [...pixel.subarray(0, 3)].map(value => value.toString(16).padStart(2, '0')).join('');
  data.photos[id] = { id, width, height, alt, color, preview: all.filter(v => v.width <= 900), display: all.filter(v => v.width >= 600), large: all.at(-1), ...(kind ? { kind } : {}) };
  return { id, width, height, variants: all, largeOverBudget: all.at(-1).bytes > 400000 };
}

for (const spec of [
  { id: '1kmuuEZaYkfyci0Z7Nh4YAlKgjsxPlZHJ', name: '7IV03333.jpg', alt: 'Sandro Mondini im blauen Polo zwischen blühenden Büschen, mit Pilotenbrille und Blick nach vorne' },
  { id: '1t5AGjwM4lwBSObAkSa9cLW93t_qbNmx5', name: 'GAP00189.jpg', alt: 'Sandro Mondini frontal mit Kamera vor einem Sony-Stand bei einer Veranstaltung' },
].filter(() => !schamoOnly)) {
  const relative = `.cache/drive-originals/${spec.id}.jpg`;
  const source = path.join(root, relative), bytes = await fs.readFile(source), hash = sha256(bytes);
  report.photos.push({ ...await entry(spec.id, source, hash.slice(0, 14), spec.alt), name: spec.name, source: relative, sourceBytes: bytes.length, sourceSha256: hash });
}

const completed = JSON.parse(await fs.readFile(path.join(root, 'analyse/feedback-runde-02/agents/analyst-a/preparation/completed-manifest.json'), 'utf8'));
for (const spec of [
  { key: 'schamo-aftermovie', id: '1IxjY4DEImgV30DG0bJdTAup8NOORVZDQ', seconds: 25, alt: 'Tanzende Gäste mit erhobenen Armen bei der Schamo Beach Party' },
  { key: 'jamina-aperol', id: '19Ydlm9RYGLSRa3u-Tp6gN9_YQLSZT0ac', seconds: 2.7, alt: 'Jamina und eine rothaarige Sängerin posieren vor dem Aperol-Schriftzug am Ostra Beach' },
].filter(spec => !schamoOnly || spec.key === 'schamo-aftermovie')) {
  const relative = `.cache/feedback-runde-02/project-originals/${spec.id}.mp4`;
  const source = path.join(root, relative), bytes = await fs.readFile(source), hash = sha256(bytes);
  const expected = completed.files.find(file => file.id === spec.id);
  if (!expected || hash !== expected.sha256 || bytes.length !== Number(expected.bytes)) throw new Error('Original verification failed: ' + spec.key);
  const frame = path.join(reportDir, `${spec.key}-${spec.seconds}s-original.png`);
  const extraction = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-threads', '2', '-ss', String(spec.seconds), '-i', source, '-frames:v', '1', '-threads', '2', '-map_metadata', '-1', frame], { windowsHide: true, encoding: 'utf8' });
  if (extraction.status !== 0) throw new Error(extraction.stderr || 'Frame extraction failed');
  const coverId = `film-poster-${spec.key}`;
  const exported = await entry(coverId, frame, `poster-${spec.key}-${hash.slice(0, 10)}-${spec.seconds}s`, spec.alt, 'film-poster');
  const film = data.films.find(item => item.key === spec.key);
  if (!film) throw new Error('Film missing: ' + spec.key);
  film.coverId = coverId;
  film.poster = data.photos[coverId].preview.find(item => item.width >= 600)?.src ?? data.photos[coverId].large.src;
  report.posters.push({ ...exported, key: spec.key, seconds: spec.seconds, source: relative, sourceBytes: bytes.length, sourceSha256: hash, verifiedAgainst: 'R2 completed-manifest.json: SHA256 and bytes', frame: path.relative(root, frame) });
}

await fs.writeFile(manifestFile, JSON.stringify(data, null, 2) + '\n');
await fs.writeFile(path.join(reportDir, 'media-export.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ photos: report.photos.length, posters: report.posters.length, variants: [...report.photos, ...report.posters].reduce((sum, item) => sum + item.variants.length, 0), overBudget: [...report.photos, ...report.posters].filter(item => item.largeOverBudget).map(item => item.id) }));
