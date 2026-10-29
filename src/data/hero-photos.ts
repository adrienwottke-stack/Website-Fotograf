import { collection } from './portfolio';

// Curated from existing exports of Sandro's Drive originals, interleaving
// different subjects rather than repeating a cover image on each side.
const picks: [string, number][] = [
  ['fahrzeuge',0],['people',0],['events',0],['hochzeiten',0],
  ['reisen',0],['tiere',0],['fahrzeuge',2],['events',1],
  ['people',1],['hochzeiten',7],['autotreffen',5],['zixspeed',0],
  ['kekila',1],['fahrzeuge',3],['tiere',1],['reisen',2],
  ['people',5],['hochzeiten',1],['heidrich',2],['events',4],
  ['autotreffen',7],['reisen',3],['fahrzeuge',5],['tiere',3],
  ['people',7],['zixspeed',7],['hochzeiten',4],['kekila',5],
  ['heidrich',7],['events',5],['reisen',1],['fahrzeuge',9],
];
const projectLinks: Record<string,string> = {heidrich:'autohaus-heidrich',zixspeed:'zixspeedracing',kekila:'kekila'};
export const heroEntries = picks.map(([key,index]) => ({
  image: collection(key)[index],
  href: projectLinks[key] ? `/arbeiten/${projectLinks[key]}` : `/arbeiten/themen/${key}`,
}));
export const heroPhotos = heroEntries.map(entry => entry.image);
