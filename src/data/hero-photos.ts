import { collection, photo } from './portfolio';

// Two photographs per theme.
const picks: [string, number | string, string][] = [
  ['fahrzeuge', 0, 'Fahrzeuge'], ['people', 0, 'People'],
  ['events', '1rL5il04tynMaFDDKgwjFBSfhUpKxgL7g', 'Events'], ['hochzeiten', 0, 'Hochzeiten'],
  ['autotreffen', 0, 'Autotreffen'], ['tiere', '16FRzPDaHcg5ZoQGs5EhmfhO28FGZ0SeV', 'Tiere'],
  ['reisen', '1AHXw2T2oqhW7XXNJcV10Q8oTUG0jYiEj', 'Reisen'], ['fahrzeuge', '10Jclk9w74rC7aEzIkqp8MzJ7r7Dl0Ny5', 'Fahrzeuge'],
  ['people', 5, 'People'], ['events', 1, 'Events'],
  ['hochzeiten', 7, 'Hochzeiten'], ['autotreffen', 5, 'Autotreffen'],
  ['tiere', '1AorsqPNBaIjYfez8WHl6bDF4KEI3IuqQ', 'Tiere'], ['reisen', '1557Mxmtu6rwSdSSmDgW8n5NSnDxfkoGg', 'Reisen'],
];

export const heroEntries = picks.map(([themeSlug, selection, themeName]) => ({
  image: typeof selection === 'string' ? photo(selection) : collection(themeSlug)[selection],
  href: `/arbeiten/themen/${themeSlug}`,
  themeSlug,
  themeName,
}));

// Compatibility for the historical hero's import.
export const heroPhotos = heroEntries.map(entry => entry.image);
