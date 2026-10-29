import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import sharp from 'sharp';
import {photoDescriptions} from './photo-descriptions.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const selection=JSON.parse(await fs.readFile(path.join(root,'.cache/media-selection.json'),'utf8'));
const out=path.join(root,'public/media');
await fs.mkdir(out,{recursive:true});
const photos={},aliases={},hashes=new Map(),report=[];
const labels={people:'Porträtfotografie im natürlichen Licht',fahrzeuge:'Fahrzeugfotografie mit Umgebung und Licht',events:'Licht und Menschen bei einer Veranstaltung',hochzeiten:'Ein Moment aus einer Hochzeitsbegleitung',autotreffen:'Fahrzeuge und Atmosphäre bei einem Autotreffen',tiere:'Tierfotografie in natürlicher Umgebung',reisen:'Reisefotografie: Landschaft und Architektur',heidrich:'Fahrzeugaufnahme aus der Serie für Autohaus Heidrich',kekila:'Einblick in Menschen und Produkte bei Kekila',zixspeed:'Motorsportaufnahme mit Zixspeedracing',kxxma:'KXXMA auf der Bühne im Veranstaltungslicht',sandro:'Sandro Mondini bei der Arbeit'};
const altOverrides={
 '7IV04638.jpg':'Gelber Kleinwagen vor einem Industriegebäude, gespiegelt in einer Pfütze',
 '7IV04322.jpg':'Porträt einer jungen Frau im warmen Gegenlicht zwischen grünen Blättern',
 '7IV07391.jpg':'Sandro filmt vor einer vollen Bühne mit Feuerfontänen',
 '7IV03315.jpg':'Sandro Mondini im natürlichen Licht, draußen im Grünen',
 'A7401116.jpg':'Sandro Mondini mit Kamera und Gimbal bei einem Dreh',
 'A7401161-Verbessert-RR.jpg':'Sandro Mondini arbeitet mit einer Kamera auf einem Gimbal',
 '7IV07743.jpg':'Laura und Florian als Brautpaar, nah beieinander im Freien',
 '7IV07644-Verbessert-RR.jpg':'KXXMA am DJ-Pult im Bühnenlicht',
 '7IV02821.jpg':'Wald und Landschaft im natürlichen Licht',
 '7IV06175.jpg':'Mensch und Pferd im warmen Gegenlicht',
 '7IV03211.jpg':'Rennkart und Fahrer auf der Strecke bei Zixspeedracing',
 '7IV03850.jpg':'Menschen bei der Arbeit im Betrieb von Kekila',
 '7IV04239.jpg':'Produktaufnahme aus der Arbeit für Kekila',
};
async function sourceFile(id,ext){
  const file=path.join(root,'.cache/drive-originals',`${id}.${ext}`);
  for(let i=0;i<420;i++){
    try {const s=await fs.stat(file);if(s.size>0){await new Promise(r=>setTimeout(r,150));const t=await fs.stat(file);if(t.size===s.size)return file;}}catch{}
    if(i===0)console.log('Warte auf Original: '+id);
    await new Promise(r=>setTimeout(r,2000));
  }
  throw Error('Original fehlt: '+id);
}
async function variant(file,hash,width,height,format,quality){
  const filename=`${hash}-${width}.${format}`,target=path.join(out,filename);
  let result;
  try {result=await fs.stat(target);}catch{
    let pipeline=sharp(file).rotate().resize({width,height,fit:'inside',withoutEnlargement:true}).toColourspace('srgb');
    pipeline=format==='avif'?pipeline.avif({quality:50,effort:4}):pipeline.webp({quality,effort:4});
    await pipeline.toFile(target);result=await fs.stat(target);
  }
  const metadata=await sharp(target).metadata();
  return {src:'/media/'+filename,width:metadata.width,height:metadata.height,bytes:result.size};
}
for(const item of selection.images){
  const file=await sourceFile(item.id,'jpg');
  const bytes=await fs.readFile(file),hash=crypto.createHash('sha256').update(bytes).digest('hex');
  if(hashes.has(hash)){const canonical=hashes.get(hash);photos[item.id]=photos[canonical];aliases[item.id]=canonical;continue;}
  hashes.set(hash,item.id);
  const metadata=await sharp(file).metadata();
  const orientation=metadata.orientation??1;
  const width=orientation>=5?metadata.height:metadata.width,height=orientation>=5?metadata.width:metadata.height;
  const stats=await sharp(file).resize(1,1).raw().toBuffer();
  const color='#'+[...stats.subarray(0,3)].map(x=>x.toString(16).padStart(2,'0')).join('');
  const shortHash=hash.slice(0,14),all=[];
  for(const w of [360,600,900,1200,1600,2000]){
    const v=await variant(file,shortHash,w,2400,'webp',78);
    if(!all.some(x=>x.width===v.width&&x.height===v.height))all.push(v);
  }
  const preview=all.filter(x=>x.width<=900),display=all.filter(x=>x.width>=600);
  const entry={id:item.id,width,height,alt:photoDescriptions[item.name]||altOverrides[item.name]||labels[item.collection],color,preview:preview.length?preview:[all[0]],display:display.length?display:all,large:all.at(-1)};
  if(['1cIhKnr4m7rg4p_VHGHVvNzvu-_0RTEtb','1XpXigQVcsMNC2XFNH8ZbzLsSDWJ4iBkh','1t-cZCSsIs2BtliD1Yat6F_YLotP8Yv-G','1um66Saf2tu0BfSTe43d7BqFp7D3xXU5W'].includes(item.id)){
    const avif=[];
    for(const w of [360,600,900]){const v=await variant(file,shortHash,w,2400,'avif',50);const comparable=all.find(x=>x.width===v.width);if(comparable&&v.bytes<comparable.bytes*.9)avif.push(v);}
    if(avif.length)entry.avif=avif;
  }
  photos[item.id]=entry;
  report.push({sourceId:item.id,name:item.name,sourceBytes:bytes.length,sourceWidth:width,sourceHeight:height,hash,variants:[...all,...(entry.avif||[])],largeOverBudget:entry.large.bytes>400000});
  console.log(`Foto ${Object.keys(photos).length}/${selection.images.length}: ${item.collection}`);
}
const videoInfo={
 kxxma:{title:'KXXMA',description:'Taktgefühl 2024 · Stage-Edit'},
 kekila:{title:'Kekila',description:'Social Content · ein Teebeutel im Großformat'},
 zixspeed:{title:'Zixspeedracing',description:'Mülsen 2024 · Kurzfilm'},
 hochzeit:{title:'Marie & Wenzel',description:'Hochzeit · kurze Cinematics'},
};
function run(command,args){return new Promise((resolve,reject)=>{const child=spawn(command,args,{cwd:root,windowsHide:true,stdio:['ignore','ignore','pipe']});let error='';child.stderr.on('data',x=>error+=x);child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(error.slice(-1800))));});}
const films=[];
for(const item of selection.videos){
  const file=await sourceFile(item.id,'mp4');
  const target=path.join(out,`film-${item.key}.mp4`),poster=path.join(out,`poster-${item.key}.webp`);
  try {
    const existing=await fs.stat(target);await fs.access(poster);
    if(existing.size>10000){films.push({id:item.id,key:item.key,...videoInfo[item.key],duration:item.duration,width:item.width,height:item.height,src:'/media/film-'+item.key+'.mp4',poster:'/media/poster-'+item.key+'.webp',bytes:existing.size});console.log('Film aus Exportcache: '+item.key);continue;}
  }catch{}
  await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(Math.min(4,item.duration*.15)),'-i',file,'-frames:v','1','-vf','scale=800:1000:force_original_aspect_ratio=decrease','-quality','78',poster]);
  const scale=item.width>item.height?'scale=1280:-2':'scale=-2:960';
  await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',file,'-map_metadata','-1','-vf',scale,'-c:v','libx264','-preset','fast','-crf','25','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',target]);
  films.push({id:item.id,key:item.key,...videoInfo[item.key],duration:item.duration,width:item.width,height:item.height,src:'/media/film-'+item.key+'.mp4',poster:'/media/poster-'+item.key+'.webp',bytes:(await fs.stat(target)).size});
  console.log('Film exportiert: '+item.key);
}
const collections=Object.fromEntries(Object.entries(selection.collections).map(([key,ids])=>[key,[...new Set(ids.map(id=>aliases[id]||id))]]));
await fs.mkdir(path.join(root,'src/data'),{recursive:true});
await fs.writeFile(path.join(root,'src/data/media.generated.json'),JSON.stringify({photos,collections,films},null,2));
await fs.mkdir(path.join(root,'analyse/2026-10-29-entwurf'),{recursive:true});
await fs.writeFile(path.join(root,'analyse/2026-10-29-entwurf/exportbericht.json'),JSON.stringify({createdAt:new Date().toISOString(),photos:hashes.size,aliases,report,films},null,2));
console.log(JSON.stringify({uniquePhotos:hashes.size,films:films.length,complete:true}));
