import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const suppliedDirectory = process.argv[2] ?? path.join(os.homedir(), 'Downloads');
const privateDirectory = path.join(root, '.cache/cutout-originals');
const outputDirectory = path.join(root, 'public/media');
const reportDirectory = path.join(root, 'analyse/2026-10-31-cutouts');
const manifestPath = path.join(root, 'src/data/cutouts.generated.json');
const quality = 84;
const alphaQuality = 100;
let previousFiles = [];
try {
  const previous = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  previousFiles = Object.values(previous.cutouts).flatMap(cutout => cutout.variants.map(variant => variant.src));
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const inputs = [
  { key: 'sandroPortrait', number: 1, alt: 'Sandro im grünen Hemd' },
  { key: 'sandroCamera', number: 2, alt: 'Sandro mit Kamera und Gimbal' },
  { key: 'sandroFull', number: 3, alt: 'Sandro steht mit seiner Kamera' },
  { key: 'audi', number: 4, alt: 'Schwarzer Audi Kombi' },
  { key: 'kart', number: 5, alt: 'Rotes Kart mit Fahrer' },
  { key: 'supra', number: 6, alt: 'Weißer Toyota Supra' },
  { key: 'bmw', number: 7, alt: 'Goldener BMW' },
];

for (const directory of [privateDirectory, outputDirectory, reportDirectory]) {
  await fs.mkdir(directory, { recursive: true });
}

function alphaBounds(data, { width, height, channels }) {
  let left = width, top = height, right = -1, bottom = -1;
  let minAlpha = 255, maxAlpha = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * channels + channels - 1];
      minAlpha = Math.min(minAlpha, alpha);
      maxAlpha = Math.max(maxAlpha, alpha);
      // Only completely transparent exterior space is removed. Faint edge
      // pixels supplied in the original remain part of the subject bounds.
      if (alpha > 0) {
        left = Math.min(left, x); top = Math.min(top, y);
        right = Math.max(right, x); bottom = Math.max(bottom, y);
      }
    }
  }
  if (right < left || bottom < top) throw new Error('Cutout contains no visible pixels.');
  return { bounds: { left, top, width: right - left + 1, height: bottom - top + 1 }, minAlpha, maxAlpha };
}

const cutouts = {};
const exports = [];
for (const input of inputs) {
  const sourceName = `ohne_background_${input.number}.png`;
  const cachedSource = path.join(privateDirectory, sourceName);
  let source;
  try { source = await fs.readFile(path.join(suppliedDirectory, sourceName)); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    source = await fs.readFile(cachedSource);
  }
  // The private copy preserves the delivered bytes. It is never published.
  await fs.writeFile(cachedSource, source);
  const metadata = await sharp(source).metadata();
  if (!metadata.hasAlpha) throw new Error(`${sourceName} has no alpha channel.`);
  const oriented = await sharp(source).rotate().toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { bounds, minAlpha, maxAlpha } = alphaBounds(oriented.data, oriented.info);
  if (minAlpha === 255) throw new Error(`${sourceName} has no transparent pixels.`);
  const sourceSha256 = crypto.createHash('sha256').update(source).digest('hex');
  const hash = crypto.createHash('sha256').update(source).update(JSON.stringify({ bounds, encoding: 'webp-photo-v2', quality, alphaQuality })).digest('hex').slice(0, 12);
  const widths = [...new Set([360, 600, 900].filter(width => width <= bounds.width)
    .concat(bounds.width < 900 ? [bounds.width] : []))].sort((a, b) => a - b);
  const variants = [];
  const outputChecks = [];
  for (const width of widths) {
    const filename = `cutout-${input.key}-${hash}-${width}.webp`;
    const outputPath = path.join(outputDirectory, filename);
    const resized = await sharp(oriented.data, { raw: oriented.info }).extract(bounds)
      .resize({ width, withoutEnlargement: true }).raw().toBuffer({ resolveWithObject: true });
    const lossy = await sharp(resized.data, { raw: resized.info })
      .webp({ quality, alphaQuality, effort: 6 }).toBuffer({ resolveWithObject: true });
    const lossless = await sharp(resized.data, { raw: resized.info })
      .webp({ lossless: true, effort: 6 }).toBuffer({ resolveWithObject: true });
    const useLossless = lossless.data.length < lossy.data.length;
    const image = useLossless ? lossless : lossy;
    await fs.writeFile(outputPath, image.data);
    const outputMetadata = await sharp(image.data).metadata();
    const decoded = await sharp(image.data).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const { minAlpha: outputAlphaMin, maxAlpha: outputAlphaMax } = alphaBounds(decoded.data, decoded.info);
    let changedAlphaPixels = 0;
    for (let pixel = 0; pixel < resized.info.width * resized.info.height; pixel++) {
      if (resized.data[pixel * 4 + 3] !== decoded.data[pixel * 4 + 3]) changedAlphaPixels++;
    }
    if (changedAlphaPixels || !outputMetadata.hasAlpha || outputMetadata.exif || outputMetadata.icc || outputMetadata.xmp || outputMetadata.iptc) {
      throw new Error(`${filename} failed transparency or metadata verification.`);
    }
    variants.push({ src: `/media/${filename}`, width: image.info.width, height: image.info.height, bytes: image.data.length });
    outputChecks.push({ src: `/media/${filename}`, format: outputMetadata.format, hasAlpha: outputMetadata.hasAlpha,
      alphaRange: [outputAlphaMin, outputAlphaMax], changedAlphaPixels,
      encoding: { lossless: useLossless, quality: useLossless ? null : quality, alphaQuality: useLossless ? null : alphaQuality },
      candidates: { photoWebPBytes: lossy.data.length, losslessWebPBytes: lossless.data.length },
      exif: false, icc: false, xmp: false, iptc: false });
  }
  cutouts[input.key] = { width: bounds.width, height: bounds.height, alt: input.alt, variants };
  exports.push({ key: input.key, sourceName, sourceSha256, sourceBytes: source.length,
    sourceDimensions: { width: metadata.width, height: metadata.height },
    orientedDimensions: { width: oriented.info.width, height: oriented.info.height },
    originalHasAlpha: metadata.hasAlpha, originalAlphaRange: [minAlpha, maxAlpha], alphaBounds: bounds,
    encoding: { format: 'webp', quality, alphaQuality, losslessOnlyWhenSmallerAtIdenticalDimensions: true, effort: 6, colourspace: 'srgb' }, variants, outputChecks });
}

await fs.writeFile(manifestPath, JSON.stringify({ cutouts }, null, 2) + '\n');
const currentFiles = new Set(Object.values(cutouts).flatMap(cutout => cutout.variants.map(variant => variant.src)));
const removedFiles = [];
for (const previous of previousFiles) {
  if (currentFiles.has(previous) || !/^\/media\/cutout-[A-Za-z0-9-]+\.webp$/.test(previous)) continue;
  const obsoletePath = path.resolve(outputDirectory, path.basename(previous));
  if (!obsoletePath.startsWith(outputDirectory + path.sep)) throw new Error('Obsolete output escaped the media directory.');
  try { await fs.unlink(obsoletePath); removedFiles.push(previous); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const totals = { cutouts: inputs.length, variants: exports.reduce((sum, entry) => sum + entry.variants.length, 0),
  bytes: exports.reduce((sum, entry) => sum + entry.variants.reduce((total, variant) => total + variant.bytes, 0), 0) };
await fs.writeFile(path.join(reportDirectory, 'export.json'), JSON.stringify({ exportedAt: new Date().toISOString(),
  processing: 'Only completely transparent exterior space trimmed. RGB encoded at quality84; alphaQuality100, pixel equality of resized alpha verified. Lossless used only if smaller at identical dimensions. No retouching, generated content or background compositing.',
  metadataScope: 'EXIF, ICC, XMP and IPTC properties reported by sharp checked absent; this is not a proof that every possible metadata format has been audited.',
  removedPreviousUnreferencedCutoutFiles: removedFiles, totals, exports }, null, 2) + '\n');
console.log(JSON.stringify({ ...totals, cutoutDimensions: Object.fromEntries(Object.entries(cutouts).map(([key, value]) => [key, { width: value.width, height: value.height, variants: value.variants.map(v => ({ width: v.width, height: v.height, bytes: v.bytes })) }])) }));
