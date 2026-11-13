import { collection, photo } from './portfolio';

// AP-02 proposal: fourteen existing web photographs, two per theme.
// This is the complete pool, not fourteen fully visible images at once.
const picks: [string, number, string][] = [
  ['fahrzeuge', 0, 'Fahrzeuge'], ['people', 0, 'People'],
  ['events', 0, 'Events'], ['hochzeiten', 0, 'Hochzeiten'],
  ['autotreffen', 0, 'Autotreffen'], ['tiere', 0, 'Tiere'],
  ['reisen', 0, 'Reisen'], ['fahrzeuge', 2, 'Fahrzeuge'],
  ['people', 5, 'People'], ['events', 1, 'Events'],
  ['hochzeiten', 7, 'Hochzeiten'], ['autotreffen', 5, 'Autotreffen'],
  ['tiere', 3, 'Tiere'], ['reisen', 2, 'Reisen'],
];

export const heroEntries = picks.map(([themeSlug, index, themeName]) => ({
  // R2 replaces exactly the two landscape slots; all other ring picks stay put.
  image: themeSlug === 'events' && index === 0
    ? photo('1rL5il04tynMaFDDKgwjFBSfhUpKxgL7g')
    : themeSlug === 'fahrzeuge' && index === 2
      ? photo('10Jclk9w74rC7aEzIkqp8MzJ7r7Dl0Ny5')
      : themeSlug === 'tiere'
        ? photo(index === 0 ? '16FRzPDaHcg5ZoQGs5EhmfhO28FGZ0SeV' : '1AorsqPNBaIjYfez8WHl6bDF4KEI3IuqQ')
        : collection(themeSlug)[index],
  href: `/arbeiten/themen/${themeSlug}`,
  themeSlug,
  themeName,
}));

// Compatibility for the historical hero's import.
export const heroPhotos = heroEntries.map(entry => entry.image);
