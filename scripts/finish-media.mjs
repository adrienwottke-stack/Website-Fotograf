import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {photoDescriptions} from './photo-descriptions.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const file=path.join(root,'src/data/media.generated.json');
const data=JSON.parse(await fs.readFile(file,'utf8'));
const selection=JSON.parse(await fs.readFile(path.join(root,'.cache/media-selection.json'),'utf8'));
for(const item of selection.images){if(photoDescriptions[item.name])data.photos[item.id].alt=photoDescriptions[item.name];}
await fs.writeFile(file,JSON.stringify(data,null,2));
const used=new Set(Object.values(data.photos).flatMap(x=>[...x.preview,...x.display,x.large,...(x.avif||[])].map(v=>path.basename(v.src))));
for(const film of data.films){used.add(path.basename(film.src));used.add(path.basename(film.poster));}
const mediaRoot=path.join(root,'public/media');
const spare=path.join(root,'.cache/unused-web-variants');
await fs.mkdir(spare,{recursive:true});
for(const name of await fs.readdir(mediaRoot)){if(!used.has(name))await fs.rename(path.join(mediaRoot,name),path.join(spare,name));}
console.log(JSON.stringify({usedFiles:used.size,photos:new Set(Object.values(data.photos).map(x=>x.id)).size,films:data.films.map(f=>({name:f.title,MB:Math.round(f.bytes/100000)/10}))}));
