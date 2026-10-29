import fs from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const source = JSON.parse(await fs.readFile(new URL('analyse/2026-10-29-ueberblick/assets/medien.json', root), 'utf8'));
const groups = [
  ['people', 'People Fotografie', ['7IV04322.jpg','7IV04591.jpg','lina-first-location-wideshot-sitting.jpg','7IV04789.jpg','7IV04610.jpg','7IV00165.jpg','7IV04192.jpg','A7405996.jpg']],
  ['fahrzeuge', 'Fahrzeug Shootings', ['7IV04638.jpg','7IV01013.jpg','7IV00744.jpg','7IV03934.jpg','7IV00316.jpg','7IV05521.jpg','7IV04530.jpg','ford-raptor-insta-crop-hills-1.jpg','7IV00869.jpg','7IV08317.jpg']],
  ['events', 'Party und Event', ['7IV07391.jpg','7IV07644-Verbessert-RR.jpg','7IV07539-Verbessert-RR.jpg','7IV07456.jpg','7IV04250.jpg','7IV04137.jpg','7IV03964.jpg','7IV03750.jpg','7IV03539.jpg','7IV03508.jpg']],
  ['hochzeiten', 'Hochzeit Foto', ['7IV07743.jpg','7IV07816.jpg','7IV09423.jpg','7IV08422.jpg','7IV08001.jpg','7IV06837.jpg','7IV06623.jpg','brautpaar-foto-21.jpg','brautpaar-foto-5.jpg','großes-gruppen-foto-3-best.jpg']],
  ['autotreffen', 'Autotreffen', ['7IV05433.jpg','7IV05409.jpg','7IV05474.jpg','7IV05378.jpg','7IV05437.jpg','7IV05536.jpg','7IV04327.jpg','honda-accord-r-euro-ronny-6.jpg']],
  ['tiere', 'Tier Fotografie', ['7IV06175.jpg','7IV04433.jpg','7IV06254.jpg','7IV05954.jpg','7IV05841.jpg','7IV05691.jpg','7IV00257.jpg','7IV04366.jpg']],
  ['reisen', 'Reisen Fotografie', ['7IV02821.jpg','A7405847.jpg','A7405784.jpg','7IV00436.jpg','7IV00608.jpg','A7405858.jpg','A7405832.jpg','A7405781.jpg']],
  ['heidrich', 'Heidrich', ['7IV00262closer.jpg','7IV01087.jpg','7IV00612.jpg','7IV00572.jpg','7IV01013.jpg','7IV00079closer.jpg','7IV09771closer.jpg','7IV08451.jpg']],
  ['kekila', 'Kekila', ['7IV03850.jpg','7IV04239.jpg','7IV01056.jpg','7IV09944.jpg','7IV05315.jpg','7IV05340.jpg','7IV02632.jpg']],
  ['zixspeed', 'Zixspeed', ['7IV03211.jpg','7IV03418.jpg','7IV03385.jpg','7IV09508closer.jpg','7IV09203closer.jpg','7IV09301.jpg','7IV09080.jpg','7IV04447 2.jpg']],
  ['kxxma', 'KXXMA', ['7IV07644-Verbessert-RR.jpg','7IV07665-Verbessert-RR.jpg','7IV07613-Verbessert-RR.jpg','7IV07596-Verbessert-RR.jpg','7IV07539-Verbessert-RR.jpg','7IV07528.jpg']],
  ['sandro', 'Presse', ['7IV03315.jpg','A7401116.jpg','A7401161-Verbessert-RR.jpg']],
];
const images = [], collections = {};
for (const [key, folder, names] of groups) {
  collections[key] = names.map(name => {
    const item = source.images.find(x => x.kind === 'photo' && x.folderPath.includes(folder) && x.name === name);
    if (!item) throw Error('Fehlendes Material: '+folder+'/'+name);
    if (!images.some(x=>x.id===item.id)) images.push({...item, collection:key});
    return item.id;
  });
}
const videoTerms = ['kxxma-takt','der-größte-teebeutel','gokart-kurzfilm','hochzeit-marie-wenzel-short-cinematics-trauung'];
const videos = videoTerms.map((term,n) => {
  const video = source.videos.find(x=>x.name.includes(term));
  if(!video)throw Error('Fehlender Film: '+term);
  return {...video, key:['kxxma','kekila','zixspeed','hochzeit'][n]};
});
const result = {sourceDate:'2026-10-27', selectedAt:'2026-10-29', images, videos, collections};
await fs.mkdir(new URL('.cache/',root),{recursive:true});
await fs.writeFile(new URL('.cache/media-selection.json',root),JSON.stringify(result,null,2));
console.log(JSON.stringify({photos:images.length,videos:videos.length,collections:Object.fromEntries(Object.entries(collections).map(([k,v])=>[k,v.length]))}));
