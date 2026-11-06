import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

// R2 only: no downloads, no R1 inventory reset, no analysis proxies as sources.
const root=fileURLToPath(new URL('../',import.meta.url));
const reportDir=path.join(root,'analyse/feedback-runde-02/implementation/R2-AP01');
const out=path.join(root,'public/media');
const read=async p=>JSON.parse((await fs.readFile(path.join(root,p),'utf8')).replace(/^\uFEFF/,''));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function writeJSON(file,value){
 const temp=file+`.r2-${process.pid}.tmp`;
 await fs.writeFile(temp,JSON.stringify(value,null,2)+'\n');
 for(let attempt=0;;attempt++){try{await fs.rename(temp,file);break}catch(error){if(attempt>=3||!['EBUSY','EPERM'].includes(error.code))throw error;await new Promise(resolve=>setTimeout(resolve,100));}}
}
const catalog=await read('analyse/feedback-runde-02/sources/project-materials-current/metadata-raw.json');
const sources=await read('analyse/feedback-runde-02/sources.json');
let completed=await read('analyse/feedback-runde-02/agents/analyst-a/preparation/completed-manifest.json');
const data=await read('src/data/media.generated.json');
let previous;try{previous=await read('analyse/feedback-runde-02/implementation/R2-AP01/export-report.json')}catch{previous={photos:[],films:[]}}
const report={createdAt:new Date().toISOString(),status:'exporting',photos:previous.photos,films:previous.films,missing:[],limits:{threads:4,minFreeBytes:3*1024**3,longEdge:1280}};
sharp.concurrency(4);
const peopleNames=['08417','08331','06217','05702','05475','05254'];
const greenNames=['09246','08417','08331','07083','06832','06348','06013','05632','05265','06492','06217','05813'];
const culture=n=>catalog.assets.find(a=>a.title===`20250620-7IV${n}.jpg`);
const people=peopleNames.map(culture),green=greenNames.map(culture);
const nohand=catalog.assets.filter(a=>a.customer_title.includes('NoHand')&&a.mime_type==='image/jpeg');
const extraHeidrich=['1roM9qZx1kXSfBj8vEXpBQXHX_nzAA9In','13OAiFJqiZJumy2q_5gxNzHZWpiehED32','1WHp1uvKsTufqQjt9htzE4D8CZE5eaq6I','1sNElv8uau15Fnwky5gkkxX3r03oKeqOX'].map(id=>catalog.assets.find(a=>a.id===id));
const supplied=sources.sources.filter(s=>/^R2-B0[1-4]$/.test(s.source_id)).map(s=>({id:s.drive_id,title:s.filename,size:s.bytes,source:s}));
const descriptions={
 '08417':'Model auf dem Laufsteg im Garten, von hinten fotografiert', '08331':'Model auf dem Laufsteg aus niedriger Perspektive',
 '06217':'Zwei Frauen vor einem dekorierten Veranstaltungsstand', '05702':'Menschen im Gespräch, eine Person trägt Uniform und ein rotes Barett',
 '05475':'Drei Männer an einem weißen Stehtisch im Garten', '05254':'Eine Gruppe macht ein Selfie mit einem Greifvogel',
 '09246':'Gäste auf einem Gartenweg im warmen Abendlicht', '07083':'Veranstaltungsstand mit Speisen, Dekoration und Gästen',
 '06832':'Vier Gäste vor einem dekorierten Stand', '06348':'Detail einer Handbemalung bei einer Veranstaltung',
 '06013':'Ein Gast betrachtet eine verzierte Kanne', '05632':'Frau im goldfarbenen Oberteil mit einem Telefon in der Hand',
 '05265':'Gartengelände mit weißen Stehtischen und einem Gebäude im Hintergrund', '06492':'Gäste im Gespräch an einem Veranstaltungsstand',
 '05813':'Drei Gäste in unterschiedlichen festlichen Gewändern vor einem Stand',
 '05934':'Mountainbiker springt über eine Rampe vor Publikum', '05791':'Mountainbiker in der Luft über einer Erdrampe',
 '06465':'Publikum rund um eine große Mountainbike-Sprungstrecke', '06450':'Mountainbiker klatscht mit Zuschauern an der Absperrung ab',
 '06410':'Mountainbiker springt neben einer Fahne über eine Erdrampe', '06350':'Person mit weißem Fahrradhelm vor der Sprungstrecke',
 '06287':'Person mit Helm beobachtet einen Mountainbike-Sprung', '06136':'Person mit Fahrradhelm und Telefon auf einer Rampe',
 '06022':'Person mit Helm vor Publikum und Mountainbike-Strecke', '06006':'Person mit Fahrradhelm sitzt in einem Liegestuhl',
 '05812':'Person mit Fahrradhelm und schwarzem Hoodie auf dem Bike', '05787':'Mountainbiker auf einem Trail unter einem Sessellift',
 '05770':'Mountainbiker auf einer Erdrampe mit Sessellift im Hintergrund', '05826':'Mountainbiker fährt durch eine Steilkurve auf dem Trail',
 'R2-B01':'Frau sitzt an der Front eines schwarzen BMW im Abendlicht',
 'R2-B02':'Gimbal am Arbeitsplatz vor Bildschirmen mit Foto- und Videomotiven',
 'R2-B03':'Sandro Mondini filmt vor einer Bühne mit Feuerfontänen',
 'R2-B04':'Arbeitsplatz mit DaVinci-Resolve-Timeline auf mehreren Bildschirmen',
};
async function reserve(){const s=await fs.statfs(root);if(s.bavail*s.bsize<3*1024**3)throw Error('3 GiB reserve required');}
function run(command,args){return new Promise((resolve,reject)=>{let stdout='',stderr='';const p=spawn(command,args,{windowsHide:true});p.stdout.on('data',d=>stdout+=d);p.stderr.on('data',d=>stderr+=d);p.on('error',reject);p.on('close',c=>c===0?resolve(stdout):reject(Error(stderr.slice(-3000))));});}
async function probe(file){return JSON.parse(await run('ffprobe',['-v','error','-show_format','-show_streams','-of','json',file]));}
async function verified(item){
 completed=await read('analyse/feedback-runde-02/agents/analyst-a/preparation/completed-manifest.json');
 let extra=[];try{extra=(await read('analyse/feedback-runde-02/implementation/R2-AP01/heidrich-extra-manifest.json')).files}catch{}
 const record=[...completed.files,...extra].find(f=>f.id===item.id);
 const src=item.source;
 const file=record?.absolute_path||(src?path.join(root,src.local_copy):path.join(root,'.cache/drive-originals',`${item.id}.${item.mime_type==='video/mp4'?'mp4':'jpg'}`));
 let bytes;try{bytes=await fs.readFile(file)}catch{report.missing.push({id:item.id,name:item.title});return null}
 if(file.endsWith('.part'))throw Error('Incomplete source');
 if(bytes.length!==Number(item.size??src?.bytes??record?.bytes))throw Error('Source bytes mismatch '+item.id);
 const sha256=hash(bytes),expected=record?.sha256||src?.sha256;
 if(expected&&sha256!==expected)throw Error('Source hash mismatch '+item.id);
 return {file,sha256,bytes:bytes.length,verification:expected?'manifest hash and bytes':'current catalog byte count, local original cache; hash recorded now'};
}
async function variants(file,prefix){
 const all=[];
 const decoded=await sharp(file).rotate().toColourspace('srgb').raw().toBuffer({resolveWithObject:true});
 for(const width of [360,600,900,1200,1600,2000]){
  const result=await sharp(decoded.data,{raw:{width:decoded.info.width,height:decoded.info.height,channels:decoded.info.channels}}).resize({width,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:78,effort:4}).toBuffer({resolveWithObject:true});
  if(all.some(a=>a.width===result.info.width&&a.height===result.info.height))continue;
  const name=`r2-${prefix}-${result.info.width}.webp`;
  await fs.writeFile(path.join(out,name),result.data);
  const meta=await sharp(result.data).metadata();if(meta.exif||meta.icc||meta.format!=='webp')throw Error('Unexpected image metadata/format');
  all.push({src:'/media/'+name,width:result.info.width,height:result.info.height,bytes:result.info.size,sha256:hash(result.data)});
 }
 return all;
}
function photoEntry(id,meta,all,alt,color='#252a28',kind){return {id,width:meta.autoOrient?.width||meta.width,height:meta.autoOrient?.height||meta.height,alt,color,preview:all.filter(v=>v.width<=900),display:all.filter(v=>v.width>=600),large:all.at(-1),...(kind?{kind}:{})};}
await fs.mkdir(reportDir,{recursive:true});await reserve();
for(const item of [...new Map([...supplied,...nohand,...people,...green,...extraHeidrich].map(a=>[a.id,a])).values()]){
 const src=await verified(item);if(!src)continue;
 const old=report.photos.find(p=>p.id===item.id&&p.sha256===src.sha256);
 if(old&&data.photos[item.id]){const alt=descriptions[item.source?.source_id]||descriptions[item.title.match(/7IV(\d+)/)?.[1]];if(alt)data.photos[item.id].alt=alt;continue;}
 await reserve();const meta=await sharp(src.file).metadata(),all=await variants(src.file,src.sha256.slice(0,14));
 const digits=item.title.match(/7IV(\d+)/)?.[1];
 const alt=descriptions[item.source?.source_id]||descriptions[digits]||(item.customer_title?.includes('NoHand')?'Mountainbike, Fahrer und Publikum bei Training und Veranstaltung':'Fahrzeugaufnahme aus der Serie für Autohaus Heidrich');
 data.photos[item.id]=photoEntry(item.id,meta,all,alt);
 report.photos=report.photos.filter(p=>p.id!==item.id);report.photos.push({id:item.id,name:item.title,...src,variants:all,exif:false,icc:false,largeOverBudget:all.at(-1).bytes>400000});
 await writeJSON(path.join(root,'src/data/media.generated.json'),data);
 await writeJSON(path.join(reportDir,'export-report.json'),report);
 console.log('PHOTO '+item.title);
}
const videoSpecs=[
 ['jamina-aperol','19Ydlm9RYGLSRa3u-Tp6gN9_YQLSZT0ac','Jamina','Aperol Sunday Vibes · Ostra Beach',4],
 ['zixspeed-lohsa','1U35GkFf0_LhHiWstPvOWGxNgk06tlQlE','Zixspeedracing','Lohsa · Training mit Kart-Sound',12],
 ['schalla-2024','1LwzfOLQ_7Cevp9yK-B4xUFfNnsiGkHqO','Schalla Balla','15 Jahre · Aftermovie 2024',21.4],
 ['greeneyes-upperhive','1v5LPZiucaNJp4WHpm_91rUuVloGzRxhe','Green Eyes Media · Upperhive','Afterwork Party 2025',4],
 ['greeneyes-roedertal','1KZcd7g5YRYQCu2hbacCRV6h8s5atunKK','Green Eyes Media · FC Rödertal','Saisonende 2025 · Heimspiel-Recap',4],
 ['kekila-marmeladenwettbewerb','1rkKIdPwkTi_D2nYRdqGupD--5sk61vd7','Kekila','Erster Marmeladenwettbewerb',4],
 ['kekila-lager-container-weg','15PrG2MAI9bj20jetmqq6zo-IF1kq0HEX','Kekila','Lager-Update · Der Container ist weg',4],
 ['kekila-lagerregal','1bHeE720_IH5sd9Gxa4s1v_Y21OP8g6r5','Kekila','Neues Lagerregal · Der Container muss weg',4],
 ['lounge-80er-90er','1_pYhlRLUqHPYNY0PMGBPiuRuAD-zWdaT','Lounge Oderwitz','80er-/90er-Party · Mai 2023',4],
 ['lounge-hausparty','1cR0Sg06jqgVFDg4jKzAVeA5-PEhlFvIT','Lounge Oderwitz','Hausparty · Ein Jahr DJ Amil',4],
 ['lounge-tekknowitz','1GicYbn1eKl1sEeM6sNnJqbOpa8j5yg71','Lounge Oderwitz','Tekknowitz 2023 · Throwback',4],
 ['lounge-jakobimarkt','1Ll9UeSqXQzIrnJiiW8FwgEeigl9zdAGa','Lounge Oderwitz','Jakobimarkt 2023 · Showcase',2],
 ['nohand-wheelie','1w3Pat1MdAUYPDGhTA5W8u8FZbWzrqeZY','NoHand MTB','1 Euro · 1 Wheelie',4],
 ['schamo-aftermovie','1IxjY4DEImgV30DG0bJdTAup8NOORVZDQ','Schamo Beach Party','10 Jahre · Aftermovie',4],
 ['hochzeit-marie-wenzel-trailer','13C24d63HkVRRNP1SoBPNPeGJorP78uzj','Marie & Wenzel','Hochzeitsfilm · Trailer',106],
 ['hochzeit-nicole-thomas-trailer','1nh6SVb0Id9q2PzUqSb8usGqTfcIygcu8','Nicole & Thomas','Hochzeitsfilm · Trailer',54],
];
for(const [key,id,title,description,posterTime] of videoSpecs){
 const item=catalog.assets.find(a=>a.id===id)||(()=>{const s=sources.sources.find(s=>s.drive_id===id);return {id,title:s.filename,size:s.bytes,source:s}})();
 const src=await verified(item);if(!src)continue;
 const cached=data.films.some(f=>f.key===key)?report.films.find(f=>f.key===key&&f.sha256===src.sha256):undefined;
 if(cached&&cached.posterTime===posterTime)continue;
 await reserve();const original=await probe(src.file),stream=original.streams.find(s=>s.codec_type==='video');
 const name=`r2-film-${key}-${src.sha256.slice(0,10)}.mp4`,target=path.join(out,name),temp=target+'.partial.mp4';
 let decoder=cached?.decoder||'cpu';
 if(!cached){
  const args=['-hide_banner','-loglevel','error','-y','-threads','4','-filter_threads','4','-i',src.file,'-map','0:v:0','-map','0:a:0?','-map_metadata','-1','-map_chapters','-1','-vf',"scale=w='min(1280,iw)':h='min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2,setsar=1",'-c:v','libx264','-threads','4','-preset','veryfast','-crf','24','-maxrate','4M','-bufsize','8M','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',temp];
  const gpuArgs=[...args];gpuArgs.splice(gpuArgs.indexOf('-i'),0,'-hwaccel','cuda');
  try{await run('ffmpeg',gpuArgs);decoder='cuda'}catch(error){console.log('CUDA decode unavailable, CPU fallback: '+key);await run('ffmpeg',args);decoder='cpu-fallback'}
 }
 const encoded=await probe(cached?target:temp),v=encoded.streams.find(s=>s.codec_type==='video'),a=encoded.streams.find(s=>s.codec_type==='audio');
 if(v.codec_name!=='h264'||(a&&a.codec_name!=='aac')||(original.streams.some(s=>s.codec_type==='audio')&&!a)||Math.max(v.width,v.height)>1280||Math.abs(Number(original.format.duration)-Number(encoded.format.duration))>.25)throw Error('Film validation failed '+key);
 if(!cached)await fs.rename(temp,target);
 const privatePoster=path.join(reportDir,`${key}-original-poster.png`);
 await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-threads','4','-ss',String(posterTime),'-i',src.file,'-frames:v','1','-threads','4',privatePoster]);
 const all=await variants(privatePoster,`poster-${key}-${src.sha256.slice(0,10)}`),meta=await sharp(privatePoster).metadata();
 const coverId='film-poster-'+key;data.photos[coverId]=photoEntry(coverId,meta,all,`${title}: ${description}`,undefined,'film-poster');
 const entry={id,key,title,description,duration:Number(encoded.format.duration),width:v.width,height:v.height,poster:all.find(p=>p.width>=600)?.src||all.at(-1).src,src:'/media/'+name,bytes:(await fs.stat(target)).size,coverId};
 data.films=data.films.filter(f=>f.key!==key);data.films.push(entry);
 report.films=report.films.filter(f=>f.key!==key);report.films.push({key,id,...src,sourceDuration:Number(original.format.duration),sourceWidth:stream.width,sourceHeight:stream.height,export:entry,posterTime,posterFormat:'webp',posterVariants:all,videoCodec:v.codec_name,audioCodec:a?.codec_name,decoder,encodingPreset:cached?(cached.encodingPreset||'fast'):'veryfast',outputSha256:hash(await fs.readFile(target))});
 await writeJSON(path.join(root,'src/data/media.generated.json'),data);
 await writeJSON(path.join(reportDir,'export-report.json'),report);
 console.log('FILM '+key);
}
const exported=items=>items.map(a=>a.id).filter(id=>data.photos[id]);
data.collections.greeneyes=exported(green);data.collections.nohand=exported(nohand);data.collections['people-culture-day']=exported(people);
data.collections.heidrich=[...new Set([...data.collections.heidrich,...exported(extraHeidrich)])];
const order=await read('analyse/feedback-runde-02/agents/analyst-a/people-removal.json');
data.collections.autotreffen=order.purple_vehicle_group.proposed_autotreffen_ids;
report.status=report.missing.length?'sources_missing':'exports_complete';
await writeJSON(path.join(root,'src/data/media.generated.json'),data);
await writeJSON(path.join(reportDir,'export-report.json'),report);
console.log(JSON.stringify({photos:report.photos.length,films:report.films.length,missing:report.missing}));
