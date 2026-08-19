/**
 * Globale Seiteneinstellungen.
 * Später das Sanity-Singleton `einstellungen` — dann ohne Deploy änderbar.
 * PLATZHALTER: Kontaktdaten und Zahlen müssen ersetzt werden (LIEFERLISTE.md, C8).
 */

export const site = {
  name: 'Sandro Mondini',
  rolle: 'Foto & Film',
  region: 'Oberlausitz',
  seit: 6, // Jahre in der Branche, laut Instagram-Profil
  mail: 'hallo@sandromondini.de', // PLATZHALTER
  instagram: 'https://www.instagram.com/sandro_mondini/',
  youtube: 'https://www.youtube.com/@sandro_mondini',
};

export const verfuegbarkeit = {
  kurz: 'Frei ab November',
  lang: 'Ich nehme aktuell Projekte ab November an.',
  antwortzeit: 'Antwort innerhalb von 3 Werktagen',
};

/** Die drei Kernleistungen für die Startseite */
export const leistungen = [
  {
    nr: '01',
    titel: 'Film',
    text: 'Imagefilme, Eventaufnahmen und kurze Formate für Social Media — von der Idee bis zum fertigen Schnitt.',
  },
  {
    nr: '02',
    titel: 'Foto',
    text: 'Fahrzeuge, Menschen, Produkte und Betriebe. Draußen, in der Halle oder nachts an der Laterne.',
  },
  {
    nr: '03',
    titel: 'Luftaufnahmen',
    text: 'Drohnenaufnahmen als eigenes Format oder als Ergänzung — dort, wo die Perspektive den Unterschied macht.',
  },
];

/** Ablauf in Kurzform für die Startseite */
export const ablaufKurz = [
  { nr: '01', titel: 'Du schreibst mir', text: 'Über das Formular. Mit Budgetrahmen, damit wir beide wissen, woran wir sind.' },
  { nr: '02', titel: 'Wir reden 15 Minuten', text: 'Kurz und ehrlich: Passt das, oder passt das nicht.' },
  { nr: '03', titel: 'Ich liefere', text: 'Festes Angebot, fester Termin, feste Lieferzeit.' },
];
