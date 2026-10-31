import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { photoDescriptions } from './photo-descriptions.mjs';

// Targeted extension of the existing manifest. Original files stay in the ignored cache.
const root = fileURLToPath(new URL('../', import.meta.url));
const source = JSON.parse(await fs.readFile(path.join(root, 'analyse/2026-10-29-ueberblick/assets/medien.json'), 'utf8'));
const manifestPath = path.join(root, 'src/data/media.generated.json');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const groups = [
  ['people', 'People Fotografie', null],
  ['fahrzeuge', 'Fahrzeug Shootings', ['7IV00262closer.jpg','7IV00612.jpg','7IV00325.jpg','7IV03573.jpg','7IV03614.jpg','7IV04188.jpg','7IV04491.jpg','7IV08155.jpg','7IV09635.jpg','IMG_4138.jpg']],
  ['events', 'Party und Event', ['7IV07665-Verbessert-RR.jpg','7IV07509-Verbessert-RR.jpg','7IV07426.jpg','7IV07348.jpg','7IV04220.jpg','7IV04165.jpg','7IV03818.jpg','7IV03595.jpg','7IV03722.jpg','7IV04248.jpg']],
  ['hochzeiten', 'Hochzeit Foto', ['7IV06502.jpg','7IV06732.jpg','7IV06880.jpg','7IV07033.jpg','7IV07802.jpg','7IV08105.jpg','7IV08970.jpg','brautpaar-foto-15.jpg','nicole-thomas-insta-post-bild-2.jpg','quatsch-fotos-7.jpg']],
  ['autotreffen', 'Autotreffen', ['7IV05469.jpg','7IV05465.jpg','7IV05380.jpg','7IV05435.jpg','7IV05397.jpg','7IV05423.jpg','7IV05400.jpg','7IV04412.jpg','7IV04333.jpg','7IV04262.jpg','honda-accord-r-euro-ronny-10.jpg','honda-accord-r-euro-ronny-4.jpg']],
  ['tiere', 'Tier Fotografie', null],
  ['reisen', 'Reisen Fotografie', null],
];
const descriptions = {
  '7IV00142.jpg':'Mann mit schwarzem Hut bei einer Veranstaltung im Freien',
  '7IV00474.jpg':'Person vor einer historischen Eckhausfassade',
  '7IV03315.jpg':'Sandro Mondini im natürlichen Licht zwischen blühenden Sträuchern',
  '7IV04585.jpg':'Porträt einer Frau vor violetten Blüten',
  '7IV04033.jpg':'Frau mit Sonnenbrille im Haar zwischen blühenden Sträuchern',
  '7IV03993.jpg':'Frau im geblümten Oberteil in einer sonnigen Lichtung',
  'lina-first-location-closeup-standing-2.jpg':'Lächelnde Frau zwischen grünen Blättern im Wald',
  'lina-first-location-closeup-sitting-heart.jpg':'Frau sitzt im Wald und formt mit den Händen ein Herz',
  'jana-stax-fespa-hp-2025-2.jpg':'Frau in einem roten Rennanzug vor einer bedruckten Wand',
  '7IV07402.jpg':'Sandro filmt auf einer Bühne vor einer Feuerfontäne',
  '7IV07391.jpg':'Sandro filmt vor einer vollen Bühne mit Feuerfontänen',
  'A7406175.jpg':'Porträt eines Mannes mit heller Jacke in einer Veranstaltungshalle',
  '7IV00262closer.jpg':'Roter Opel aus erhöhter Perspektive auf einer Rennstrecke',
  '7IV00612.jpg':'Orangefarbenes Fahrzeug an einer Tankstelle',
  '7IV00325.jpg':'Nahaufnahme des Kühlergrills eines roten Oldtimers',
  '7IV03573.jpg':'Motorraddetail vor blühenden Bäumen',
  '7IV03614.jpg':'Motorradfahrer unter rosa blühenden Bäumen',
  '7IV04188.jpg':'Motorradfahrer zwischen Betonbrüstungen in einem Parkhaus',
  '7IV04491.jpg':'Gelber Audi neben einem hohen Industriegebäude',
  '7IV08155.jpg':'Schwarzer Audi in Fahrt an einem Getreidefeld',
  '7IV09635.jpg':'Blauer Kombi aus erhöhter Perspektive vor einem Industriegebäude',
  'IMG_4138.jpg':'Motorradfahrer neben großen Rohrleitungen in einer Industrieanlage',
  '7IV07665-Verbessert-RR.jpg':'DJ mit Kapuze vor dem Publikum auf einer Bühne',
  '7IV07509-Verbessert-RR.jpg':'Drei DJs am Mischpult im violetten Bühnenlicht',
  '7IV07426.jpg':'Publikum vor einer hell beleuchteten Konzertbühne',
  '7IV07348.jpg':'Sandro mit Kamera im blauen Bühnenlicht',
  '7IV04220.jpg':'Sängerin mit Mikrofon bei einem Liveauftritt',
  '7IV04165.jpg':'Zwei Musiker lachen gemeinsam auf einer Bühne',
  '7IV03818.jpg':'Schlagzeuger mit Kopfhörern während eines Konzerts',
  '7IV03595.jpg':'Getränke werden an einer Veranstaltungsbar ausgeschenkt',
  '7IV03722.jpg':'Rotes Fahrzeug zwischen Gästen in einem beleuchteten Veranstaltungsraum',
  '7IV04248.jpg':'Sänger mit Gitarre und Keyboard auf einer Bühne',
  '7IV06502.jpg':'Hochzeitsschuhe, Schmuck und Parfum auf einem Holztisch',
  '7IV06732.jpg':'Armbanduhr und Fliege bei den Hochzeitsvorbereitungen',
  '7IV06880.jpg':'Braut betrachtet ihr Kleid vor einem Spiegel',
  '7IV07033.jpg':'Braut und Bräutigam sitzen während ihrer Trauung nebeneinander',
  '7IV07802.jpg':'Braut lächelt in den Armen des Bräutigams',
  '7IV08105.jpg':'Brautpaar auf einer Wiese vor einer weiten Hügellandschaft',
  '7IV08970.jpg':'Brautpaar tanzt während der Hochzeitsfeier',
  'brautpaar-foto-15.jpg':'Brautpaar unter einem Holzdach mit warmen Lichterketten',
  'nicole-thomas-insta-post-bild-2.jpg':'Brautpaar durch einen hölzernen Schriftzug fotografiert',
  'quatsch-fotos-7.jpg':'Hochzeitsgäste tragen lachend eine Person vor Lichterketten',
  '7IV05469.jpg':'Silbernes Fahrzeug mit großen Felgen auf einer Wiese',
  '7IV05465.jpg':'Blick in einen Fahrzeuginnenraum mit gelbem Überrollkäfig',
  '7IV05380.jpg':'Mehrere Fahrzeuge zwischen Bäumen bei einem Autotreffen',
  '7IV05435.jpg':'Nahaufnahme einer hellen Felge am silbernen Fahrzeug',
  '7IV05397.jpg':'Dunkles Fahrzeug zwischen Bäumen und weiteren Autos',
  '7IV05423.jpg':'Klassische Fahrzeuge unter Bäumen im warmen Sonnenlicht',
  '7IV05400.jpg':'Blick von oben durch eine geöffnete Heckklappe',
  '7IV04412.jpg':'Silbernes Sportcoupé aus niedriger Perspektive vor blauem Himmel',
  '7IV04333.jpg':'Felge und Karosserie eines tiefgelegten silbernen Fahrzeugs',
  '7IV04262.jpg':'Weißes Fahrzeug mit geöffneter Motorhaube auf einem Treffen',
  'honda-accord-r-euro-ronny-10.jpg':'Blick in das Cockpit eines weißen Honda mit grünen Gurten',
  'honda-accord-r-euro-ronny-4.jpg':'Geöffneter Motorraum eines weißen Honda bei einem Autotreffen',
  '7IV06106.jpg':'Frau steht eng neben ihrem Pferd auf einer Wiese',
  '7IV05859.jpg':'Frau mit Pferd im tiefen Sonnenlicht am Feldrand',
  '7IV05599.jpg':'Mensch und Pferd auf einer blühenden Wiese vor blauem Himmel',
  '7IV00227.jpg':'Reiterin auf einem schwarzweißen Pferd bei einer Veranstaltung',
  '7IV00346closer.jpg':'Mensch mit Schäferhund auf einem sonnigen Waldweg',
};
const selected = [];
for (const [key, folder, names] of groups) {
  const candidates = source.images.filter(x => x.kind === 'photo' && x.folderPath.includes(folder));
  const additions = names ? names.map(name => {
    const item = candidates.find(x => x.name === name);
    if (!item) throw Error(`Quelle fehlt: ${folder}/${name}`);
    return item;
  }) : candidates.filter(x => !['recap-2024-thumbnail-no-caps.jpg','7IV03333.jpg'].includes(x.name));
  for (const item of additions) selected.push({ ...item, collection: key, alt:descriptions[item.name] || photoDescriptions[item.name] });
}
await fs.writeFile(path.join(root, '.cache/gallery-expansion-selection.json'), JSON.stringify(selected, null, 2));
if (process.argv.includes('--selection-only')) {
  const missing=[];
  for(const item of selected) { try { await fs.access(path.join(root, '.cache/drive-originals', `${item.id}.jpg`)); } catch { if(!manifest.photos[item.id])missing.push(item); } }
  console.log(JSON.stringify({ selected:selected.length, missing:missing.length, counts:Object.fromEntries(groups.map(([key])=>[key,selected.filter(x=>x.collection===key).length])) }));
  await fs.writeFile(path.join(root,'.cache/gallery-expansion-missing.json'),JSON.stringify(missing,null,2));
  process.exit(0);
}
const out=path.join(root,'public/media');
const report=[];
const hashes=new Map();
// Match existing original hashes so photos reused between source folders stay canonical.
for(const id of Object.keys(manifest.photos)){
  try { const bytes=await fs.readFile(path.join(root,'.cache/drive-originals',`${id}.jpg`)); hashes.set(crypto.createHash('sha256').update(bytes).digest('hex'),manifest.photos[id].id); } catch {}
}
const aliases={};
for(const item of selected){
  if(manifest.photos[item.id]) { aliases[item.id]=manifest.photos[item.id].id; continue; }
  const file=path.join(root,'.cache/drive-originals',`${item.id}.jpg`);
  const bytes=await fs.readFile(file);
  const hash=crypto.createHash('sha256').update(bytes).digest('hex');
  if(hashes.has(hash)){aliases[item.id]=hashes.get(hash); continue;}
  hashes.set(hash,item.id); aliases[item.id]=item.id;
  const meta=await sharp(file).metadata();
  const rotated=(meta.orientation??1)>=5;
  const width=rotated?meta.height:meta.width, height=rotated?meta.width:meta.height;
  const colorBytes=await sharp(file).rotate().resize(1,1).removeAlpha().raw().toBuffer();
  const color='#'+[...colorBytes.subarray(0,3)].map(x=>x.toString(16).padStart(2,'0')).join('');
  const variants=[];
  for(const targetWidth of [360,600,900,1200,1600,2000]){
    const scale=Math.min(1,targetWidth/width,2400/height);
    const expectedWidth=Math.round(width*scale),expectedHeight=Math.round(height*scale);
    if(variants.some(x=>x.width===expectedWidth&&x.height===expectedHeight))continue;
    const filename=`${hash.slice(0,14)}-${targetWidth}.webp`, target=path.join(out,filename);
    try { await fs.access(target); } catch { await sharp(file).rotate().resize({width:targetWidth,height:2400,fit:'inside',withoutEnlargement:true}).toColourspace('srgb').webp({quality:78,effort:4}).toFile(target); }
    const vmeta=await sharp(target).metadata();
    if(variants.some(x=>x.width===vmeta.width&&x.height===vmeta.height))continue;
    variants.push({src:'/media/'+filename,width:vmeta.width,height:vmeta.height,bytes:(await fs.stat(target)).size});
  }
  if(!item.alt)throw Error('Alttext fehlt: '+item.name);
  const entry={id:item.id,width,height,alt:item.alt,color,preview:variants.filter(x=>x.width<=900),display:variants.filter(x=>x.width>=600),large:variants.at(-1)};
  manifest.photos[item.id]=entry;
  report.push({id:item.id,name:item.name,collection:item.collection,sourceWidth:width,sourceHeight:height,variants,previewOverBudget:entry.preview.some(x=>x.bytes>120000),largeOverBudget:entry.large.bytes>400000});
  console.log(`Webvarianten: ${item.collection}/${item.name}`);
}
const counts={};
for(const [key] of groups){
  const existing=manifest.collections[key];
  const extra=[...new Set(selected.filter(x=>x.collection===key).map(x=>aliases[x.id]))].filter(id=>!existing.includes(id));
  // Keep the cover and initial framing; weave the extension between existing photographs.
  const result=[];
  for(let i=0;i<existing.length;i++){
    result.push(existing[i]);
    if(i>0&&extra.length)result.push(extra.shift());
  }
  result.push(...extra);
  manifest.collections[key]=[...new Set(result)];
  counts[key]=manifest.collections[key].length;
}
await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
await fs.mkdir(path.join(root,'analyse/2026-10-31-update'),{recursive:true});
await fs.writeFile(path.join(root,'analyse/2026-10-31-update/gallery-export.json'),JSON.stringify({createdAt:new Date().toISOString(),counts,newPhotos:report.length,aliases,sourceLimits:{tiere:13,reisen:8},report},null,2));
console.log(JSON.stringify({counts,newPhotos:report.length}));
