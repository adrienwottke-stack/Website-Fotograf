/**
 * PLATZHALTER-DATEN
 *
 * Aus dem Instagram-Feed abgeleitet, damit der Entwurf mit realistischem
 * Rhythmus und echten Kategorien zu sehen ist. KEINE echten Kundenprojekte —
 * Kundennamen, Jahre und Eckdaten sind erfunden und müssen vor dem Launch
 * ersetzt werden (LIEFERLISTE.md, A2/A3).
 *
 * Später kommt diese Struktur 1:1 aus Sanity.
 */

import { bilder, s15Strecke, type Bild } from './bilder';

export type Kategorie = 'Fahrzeuge' | 'Event' | 'Unternehmen' | 'Menschen';
export type Leistung = 'Film' | 'Foto' | 'Luftaufnahmen';
export type Grade = 'bluete' | 'gold' | 'petrol' | 'neon' | 'wald' | 'sonne';

export interface Projekt {
  slug: string;
  titel: string;
  kunde: string;
  jahr: number;
  kategorie: Kategorie;
  leistung: Leistung[];
  /** Farbverlauf-Platzhalter, solange kein echtes Bild vorliegt */
  grade: Grade;
  /** Echtes Titelbild — hat Vorrang vor grade */
  bild?: Bild;
  /** Echte Bildstrecke für die Projektseite */
  strecke?: Bild[];
  anriss: string;
  aufgabe?: string;
  eckdaten?: { drehtage: string; umfang: string; lieferzeit: string };
  featured?: boolean;
  signature?: boolean;
}

export const projekte: Projekt[] = [
  {
    slug: 'carmeet-oberlausitz',
    titel: 'Carmeet Oberlausitz',
    kunde: 'Platzhalter — Veranstalter folgt',
    jahr: 2025,
    kategorie: 'Event',
    leistung: ['Foto', 'Luftaufnahmen'],
    grade: 'gold',
    bild: bilder.heckHimmel,
    strecke: s15Strecke,
    anriss: 'Tiefergelegt, poliert — und alle warten auf das gute Licht.',
    aufgabe:
      'Der Veranstalter brauchte Material für die Ankündigung des Folgejahres — und zwar so, dass man die Stimmung sieht und nicht nur die Autos. Auf dem Hof standen die Fahrzeuge so eng, dass für die meisten Perspektiven schlicht kein Platz war. Also runter auf den Boden und zwischen den Autos hindurch.',
    eckdaten: { drehtage: '1 Tag', umfang: '85 Bilder', lieferzeit: '12 Tage' },
    featured: true,
    signature: true,
  },
  {
    slug: 'kirschbluete',
    titel: 'Kirschblüte & Zweirad',
    kunde: 'Platzhalter — Kunde folgt',
    jahr: 2025,
    kategorie: 'Fahrzeuge',
    leistung: ['Foto'],
    grade: 'bluete',
    anriss: 'Zwei Wochen im Jahr blüht das. Danach ist Schluss.',
    aufgabe:
      'Die Idee gab es seit einem Jahr, das Zeitfenster war zwei Wochen lang. Als es endlich blühte, hatten wir zwei Abende, an denen es nicht geregnet hat.',
    eckdaten: { drehtage: '2 Abende', umfang: '18 Bilder', lieferzeit: '7 Tage' },
    featured: true,
  },
  {
    slug: 'kartsport-saisonauftakt',
    titel: 'Kartsport — Saisonauftakt',
    kunde: 'Platzhalter — Team folgt',
    jahr: 2025,
    kategorie: 'Event',
    leistung: ['Foto', 'Film'],
    grade: 'sonne',
    anriss: 'Renntag von der ersten Ausfahrt bis zum Podium.',
    aufgabe:
      'Ein kompletter Renntag sollte dokumentiert werden — für Sponsoren, für Social Media und für das Team selbst.',
    eckdaten: { drehtage: '1 Tag', umfang: '120 Bilder, 3 Reels', lieferzeit: '8 Tage' },
    featured: true,
  },
  {
    slug: 'werkstattportrait',
    titel: 'Werkstattportrait',
    kunde: 'Platzhalter — Betrieb folgt',
    jahr: 2024,
    kategorie: 'Unternehmen',
    leistung: ['Foto', 'Film'],
    grade: 'petrol',
    anriss: 'Imagebilder für einen Betrieb, der keine Zeit für Fototermine hat.',
    aufgabe:
      'Ein Handwerksbetrieb brauchte Bilder für Website und Stellenanzeigen. Die Bedingung: Der Betrieb läuft weiter, niemand stellt sich hin und posiert.',
    eckdaten: { drehtage: '1/2 Tag', umfang: '22 Bilder', lieferzeit: '10 Tage' },
    featured: true,
  },
  {
    slug: 'clubnacht',
    titel: 'Clubnacht',
    kunde: 'Platzhalter — Veranstalter folgt',
    jahr: 2025,
    kategorie: 'Event',
    leistung: ['Foto', 'Film'],
    grade: 'neon',
    anriss: 'Vier Stunden Nebel, Wechsellicht und gute Laune.',
    featured: true,
  },
  {
    slug: 'zweitakt-treffen',
    titel: 'Zweitakt-Treffen',
    kunde: 'Platzhalter — Veranstalter folgt',
    jahr: 2024,
    kategorie: 'Event',
    leistung: ['Foto'],
    grade: 'wald',
    anriss: 'Simson, Schwalbe und alles, was zwei Takte hat.',
    featured: true,
  },
  {
    slug: 'produktstrecke',
    titel: 'Produktstrecke',
    kunde: 'Platzhalter — Kunde folgt',
    jahr: 2024,
    kategorie: 'Unternehmen',
    leistung: ['Foto'],
    grade: 'neon',
    anriss: 'Freigestellt, farbig ausgeleuchtet, für den Shop.',
  },
  {
    slug: 'hallensport',
    titel: 'Hallensport',
    kunde: 'Platzhalter — Verein folgt',
    jahr: 2024,
    kategorie: 'Menschen',
    leistung: ['Foto'],
    grade: 'sonne',
    anriss: 'Schlechtes Hallenlicht, schnelle Bewegung, kein zweiter Versuch.',
  },
  {
    slug: 'hochzeit-im-gruenen',
    titel: 'Hochzeit im Grünen',
    kunde: 'Platzhalter — Paar folgt',
    jahr: 2025,
    kategorie: 'Menschen',
    leistung: ['Foto', 'Film'],
    grade: 'bluete',
    anriss: 'Ein Tag, an dem man nichts wiederholen kann.',
  },
];

export const kategorien: Kategorie[] = ['Fahrzeuge', 'Event', 'Unternehmen', 'Menschen'];

export const signature = projekte.find((p) => p.signature)!;
export const featured = projekte.filter((p) => p.featured);
