/**
 * Echte Bilder von Sandro.
 *
 * Herkunft: Instagram-Export (1440×1920). Für den Entwurf gut genug, für den
 * Launch braucht es die Originaldateien — Instagram komprimiert stark und
 * beschneidet auf feste Formate (LIEFERLISTE.md, C4).
 *
 * `alt`  beschreibt sachlich, was zu sehen ist — für Screenreader und Suche.
 * `bu`   ist die Bildunterschrift: erzählt, statt zu beschreiben.
 *        Die Bildunterschriften sind PLATZHALTER in seinem Sinne geschrieben
 *        und müssen von ihm bestätigt oder ersetzt werden (LIEFERLISTE.md, C3).
 */

import heckHimmel from '../assets/bilder/s15-heck-himmel.jpg';
import radSeite from '../assets/bilder/s15-rad-seite.jpg';
import scheinwerfer from '../assets/bilder/s15-scheinwerfer.jpg';
import heckSchraeg from '../assets/bilder/s15-heck-schraeg.jpg';
import haubeBlitz from '../assets/bilder/haube-blitz.jpg';
import carmeetLuecke from '../assets/bilder/carmeet-luecke.jpg';

export interface Bild {
  src: ImageMetadata;
  alt: string;
  bu?: string;
}

export const bilder = {
  heckHimmel: {
    src: heckHimmel,
    alt: 'Silbergrauer Nissan Silvia S15 von schräg hinten, tiefer Standpunkt, Heckflügel vor blauem Wolkenhimmel',
    bu: 'Runter auf den Asphalt, bis der Flügel den Himmel schneidet.',
  },
  radSeite: {
    src: radSeite,
    alt: 'Seitenansicht des Nissan Silvia S15 aus Bodenhöhe, weiße Nismo-Felge im Vordergrund',
    bu: 'Weiße Felge, blauer Himmel, tiefergelegt. Mehr braucht das Bild nicht.',
  },
  scheinwerfer: {
    src: scheinwerfer,
    alt: 'Nahaufnahme des vorderen Scheinwerfers eines Nissan Silvia S15 mit Wolkenspiegelung im Glas',
    bu: 'Im Scheinwerfer stand der ganze Himmel. Dafür musste ich in die Hocke.',
  },
  heckSchraeg: {
    src: heckSchraeg,
    alt: 'Nissan Silvia S15 von hinten seitlich zwischen anderen Fahrzeugen auf einem Treffen',
    bu: 'Zwischen zwei Autos durch — auf Treffen ist der Platz genau so eng.',
  },
  haubeBlitz: {
    src: haubeBlitz,
    alt: 'Hellblaue Motorhaube mit rotem Blitz-Emblem, harter Schlagschatten und ein Grasbüschel im Asphaltriss',
    bu: 'Das Gras im Riss war nicht geplant. Aber es blieb drin.',
  },
  carmeetLuecke: {
    src: carmeetLuecke,
    alt: 'Blick durch eine Lücke zwischen zwei Autos auf einen silbernen Nissan Silvia S15, im Hintergrund Menschen und eine Halle',
    bu: 'Manchmal ist der beste Blickwinkel der, den man sich freilaufen muss.',
  },
} satisfies Record<string, Bild>;

/** Bildstrecke des S15-Projekts, in gewünschter Reihenfolge */
export const s15Strecke: Bild[] = [
  bilder.heckHimmel,
  bilder.scheinwerfer,
  bilder.radSeite,
  bilder.heckSchraeg,
  bilder.carmeetLuecke,
];
