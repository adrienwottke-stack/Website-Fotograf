import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
const source='.cache/cutout-originals/sony-front-r3.png';
const input=await fs.readFile(source),hash=crypto.createHash('sha256').update(input).digest('hex').slice(0,12);
const image=sharp(input).trim(),metadata=await image.clone().png().toBuffer({resolveWithObject:true});
if(!metadata.info.channels||metadata.info.channels<4)throw Error('Transparent alpha missing');
const variants=[];
for(const width of [...new Set([360,600,900].map(value=>Math.min(value,metadata.info.width)))]){
const filename=`cutout-sony-front-${hash}-${width}.webp`,{data,info}=await sharp(metadata.data).resize({width,withoutEnlargement:true}).webp({quality:86,alphaQuality:100}).toBuffer({resolveWithObject:true});
await fs.writeFile('public/media/'+filename,data);variants.push({src:'/media/'+filename,width:info.width,height:info.height,bytes:data.length});}
const file='src/data/cutouts.generated.json',manifest=JSON.parse(await fs.readFile(file,'utf8'));
manifest.cutouts.sonyFront={width:metadata.info.width,height:metadata.info.height,alt:'Sandro Mondini mit Kamera, frontal aufgenommen beim Sony-Event',variants};
await fs.writeFile(file,JSON.stringify(manifest,null,2)+'\n');
await fs.mkdir('analyse/feedback-runde-03/implementation/AP04',{recursive:true});
await fs.writeFile('analyse/feedback-runde-03/implementation/AP04/cutout-export.json',JSON.stringify({source,sourcePhoto:'GAP00189.jpg',sourcePhotoId:'1t5AGjwM4lwBSObAkSa9cLW93t_qbNmx5',method:'image_gen background extraction from supplied original, comparison draft; no claim of pixel-identical subject. Full source photo retained.',hash,variants},null,2));
console.log(JSON.stringify({key:'sonyFront',variants}));
