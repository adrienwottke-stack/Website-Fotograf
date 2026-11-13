import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import sharp from 'sharp';

// Targeted, reproducible export from the verified local original. No download,
// film transcode or rewrite of the generated portfolio media inventory.
const root=fileURLToPath(new URL('../',import.meta.url));
const source='.cache/feedback-runde-02/project-originals/1LwzfOLQ_7Cevp9yK-B4xUFfNnsiGkHqO.mp4';
const sourceId='1LwzfOLQ_7Cevp9yK-B4xUFfNnsiGkHqO';
const expectedHash='e0e1e89bc30fd5d09cb7790faea3edd88c422f985e3ae13cd9237eb6f0f78f87';
const run=promisify(execFile);
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const bytes=await fs.readFile(path.join(root,source));
if(bytes.length!==126797387||hash(bytes)!==expectedHash)throw Error('Schalla source identity mismatch');
const probe=JSON.parse((await run('ffprobe',['-v','error','-show_format','-show_streams','-of','json',path.join(root,source)],{windowsHide:true})).stdout);
const video=probe.streams.find(stream=>stream.codec_type==='video');
if(video.width!==1080||video.height!==1920)throw Error('Unexpected native source dimensions');
const privateDir=path.join(root,'analyse/2026-11-08-layout-feedback/implementation');
await fs.mkdir(privateDir,{recursive:true});
const selected=[
  {time:18,alt:'Publikum unter gelben Laserstrahlen beim Schalla Balla Open Air'},
  {time:25,alt:'Lichttechnik und Bühnenlicht beim Schalla Balla Open Air'},
  {time:31,alt:'DJ am Pult beim Schalla Balla Open Air'},
];
const frames=[];
for(const [index,{time,alt}] of selected.entries()){
  const originalFrame=path.join(privateDir,`schalla-selected-${time}.png`);
  await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-threads','2','-ss',String(time),'-i',path.join(root,source),'-frames:v','1','-threads','2',originalFrame],{windowsHide:true});
  const variants=[];
  for(const width of [240,360,600,900]){
    const result=await sharp(originalFrame).toColourspace('srgb').resize({width,withoutEnlargement:true}).webp({quality:78,effort:4}).toBuffer({resolveWithObject:true});
    const name=`layout-schalla-${index+1}-${hash(result.data).slice(0,10)}-${width}.webp`;
    const meta=await sharp(result.data).metadata();
    if(meta.format!=='webp'||meta.exif||meta.icc||meta.xmp)throw Error('Unexpected output metadata');
    await fs.writeFile(path.join(root,'public/media',name),result.data);
    variants.push({src:`/media/${name}`,width:meta.width,height:meta.height,bytes:result.data.length,sha256:hash(result.data)});
  }
  frames.push({time,alt,width:video.width,height:video.height,variants});
}
const publicManifest={projectSlug:'schalla-balla',frames:frames.map(({alt,width,height,variants})=>({alt,width,height,variants:variants.map(({src,width,height})=>({src,width,height}))}))};
await fs.writeFile(path.join(root,'src/data/layout-schalla-stills.json'),JSON.stringify(publicManifest,null,2)+'\n');
await fs.writeFile(path.join(privateDir,'schalla-export-report.json'),JSON.stringify({createdAt:new Date().toISOString(),source,sourceId,sourceSha256:expectedHash,sourceBytes:bytes.length,sourceDuration:Number(probe.format.duration),selection:'Visually selected from the eight targeted candidate frames; 18s audience/lasers, 25s lighting equipment, 31s DJ',frames},null,2)+'\n');
console.log(JSON.stringify({frames:frames.length,variants:frames.reduce((n,f)=>n+f.variants.length,0),totalBytes:frames.reduce((n,f)=>n+f.variants.reduce((s,v)=>s+v.bytes,0),0),sourceHash:expectedHash}));
