import { defineType, defineField, defineArrayMember } from 'sanity';

/**
 * Bausteine, die in mehreren Dokumenttypen vorkommen.
 *
 * Grundsatz für alle Felder: deutscher Titel, ein Satz Erklärung darunter.
 * Sandro soll nie raten müssen, was gemeint ist — jedes `description`-Feld
 * ist Teil der Bedienbarkeit, nicht Kommentar für Entwickler.
 */

/* ---------------------------------------------------------------
   Bild — überall dasselbe: Datei, Alternativtext, Bildunterschrift
   --------------------------------------------------------------- */
export const bildFeld = defineType({
  name: 'bildFeld',
  title: 'Bild',
  type: 'image',
  options: {
    // Bildausschnitt-Punkt: einmal setzen, gilt für jedes Format
    hotspot: true,
  },
  fields: [
    defineField({
      name: 'alt',
      title: 'Bildbeschreibung',
      type: 'string',
      description:
        'Was ist zu sehen? Sachlich, ein Satz. Wird von Screenreadern vorgelesen und von Suchmaschinen gelesen — sieht sonst niemand.',
      validation: (Rule) =>
        Rule.required().min(10).error('Bitte kurz beschreiben, was auf dem Bild zu sehen ist.'),
    }),
    defineField({
      name: 'bu',
      title: 'Bildunterschrift',
      type: 'string',
      description:
        'Erzähl etwas, statt zu beschreiben. Nicht „BMW auf einer Wiese", sondern „6:40 Uhr, das Licht kam nur zwanzig Minuten so rein." Darf leer bleiben.',
    }),
  ],
  preview: {
    select: { media: 'asset', title: 'bu', subtitle: 'alt' },
  },
});

/* ---------------------------------------------------------------
   Inhaltsblöcke — der Baukasten für Projekte, Journal und Seiten.
   Bewusst nur sechs Stück: jede weitere Auswahl ist eine Entscheidung
   mehr beim Posten, und jede Entscheidung senkt die Wahrscheinlichkeit,
   dass überhaupt gepostet wird.
   --------------------------------------------------------------- */

export const blockText = defineType({
  name: 'blockText',
  title: 'Text',
  type: 'object',
  fields: [
    defineField({
      name: 'inhalt',
      title: 'Text',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          // Bewusst reduziert: keine Überschriften-Ebenen, die das
          // Seitengerüst durcheinanderbringen könnten
          styles: [{ title: 'Absatz', value: 'normal' }],
          lists: [{ title: 'Liste', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Fett', value: 'strong' },
              { title: 'Kursiv', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [{ name: 'href', title: 'Adresse', type: 'url' }],
              },
            ],
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { inhalt: 'inhalt' },
    prepare({ inhalt }) {
      const ersterAbsatz = inhalt?.[0]?.children?.map((c: any) => c.text).join('') ?? '';
      return { title: 'Text', subtitle: ersterAbsatz.slice(0, 70) };
    },
  },
});

export const blockEinzelbild = defineType({
  name: 'blockEinzelbild',
  title: 'Einzelbild',
  type: 'object',
  fields: [
    defineField({ name: 'bild', title: 'Bild', type: 'bildFeld', validation: (R) => R.required() }),
    defineField({
      name: 'breite',
      title: 'Breite',
      type: 'string',
      description: 'Über die ganze Seite oder in normaler Textbreite?',
      options: {
        list: [
          { title: 'Volle Breite', value: 'voll' },
          { title: 'Normal', value: 'normal' },
        ],
        layout: 'radio',
      },
      initialValue: 'normal',
    }),
  ],
  preview: {
    select: { media: 'bild.asset', title: 'bild.bu', subtitle: 'breite' },
    prepare: ({ media, title, subtitle }) => ({
      media,
      title: title || 'Einzelbild',
      subtitle: subtitle === 'voll' ? 'Volle Breite' : 'Normale Breite',
    }),
  },
});

export const blockBildpaar = defineType({
  name: 'blockBildpaar',
  title: 'Zwei Bilder nebeneinander',
  type: 'object',
  fields: [
    defineField({ name: 'links', title: 'Linkes Bild', type: 'bildFeld', validation: (R) => R.required() }),
    defineField({ name: 'rechts', title: 'Rechtes Bild', type: 'bildFeld', validation: (R) => R.required() }),
  ],
  preview: {
    select: { media: 'links.asset' },
    prepare: ({ media }) => ({ media, title: 'Zwei Bilder nebeneinander' }),
  },
});

export const blockStrecke = defineType({
  name: 'blockStrecke',
  title: 'Bilderstrecke',
  type: 'object',
  fields: [
    defineField({
      name: 'bilder',
      title: 'Bilder',
      type: 'array',
      of: [defineArrayMember({ type: 'bildFeld' })],
      options: { layout: 'grid' },
      description: 'Mehrere Dateien auf einmal reinziehen. Reihenfolge lässt sich per Ziehen ändern.',
      validation: (R) => R.min(2).error('Eine Strecke braucht mindestens zwei Bilder.'),
    }),
  ],
  preview: {
    select: { bilder: 'bilder', media: 'bilder.0.asset' },
    prepare: ({ bilder, media }) => ({
      media,
      title: 'Bilderstrecke',
      subtitle: `${bilder?.length ?? 0} Bilder`,
    }),
  },
});

export const blockVideo = defineType({
  name: 'blockVideo',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'datei',
      title: 'Videodatei',
      type: 'file',
      options: { accept: 'video/mp4' },
      description:
        'MP4, maximal 1920 px breit. Für ein Video, das von selbst läuft: unter 3 MB halten. Längere Filme dürfen größer sein, starten dann aber erst auf Klick.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'poster',
      title: 'Standbild',
      type: 'bildFeld',
      description: 'Wird angezeigt, solange das Video nicht läuft. Am besten ein starkes Einzelbild aus dem Film.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'autoplay',
      title: 'Läuft von selbst',
      type: 'boolean',
      description: 'Nur für kurze, stumme Schleifen. Ton startet nie von selbst — das nervt und ist rechtlich heikel.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { media: 'poster.asset', title: 'poster.bu' },
    prepare: ({ media, title }) => ({ media, title: title || 'Video' }),
  },
});

export const blockZitat = defineType({
  name: 'blockZitat',
  title: 'Zitat',
  type: 'object',
  fields: [
    defineField({ name: 'text', title: 'Zitat', type: 'text', rows: 3, validation: (R) => R.required() }),
    defineField({ name: 'quelle', title: 'Von wem?', type: 'string' }),
  ],
  preview: {
    select: { title: 'text', subtitle: 'quelle' },
  },
});

/** Alle Blöcke als Array-Definition — überall gleich einsetzbar */
export const bloeckeFeld = [
  defineArrayMember({ type: 'blockText' }),
  defineArrayMember({ type: 'blockEinzelbild' }),
  defineArrayMember({ type: 'blockBildpaar' }),
  defineArrayMember({ type: 'blockStrecke' }),
  defineArrayMember({ type: 'blockVideo' }),
  defineArrayMember({ type: 'blockZitat' }),
];

export const objects = [
  bildFeld,
  blockText,
  blockEinzelbild,
  blockBildpaar,
  blockStrecke,
  blockVideo,
  blockZitat,
];
