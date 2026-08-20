import { defineType, defineField, defineArrayMember } from 'sanity';
import { bloeckeFeld } from './objects';

/**
 * Die Dokumenttypen, von denen es viele gibt.
 * Aufgeteilt in Reiter (groups), damit kein Formular länger ist als
 * ein Handybildschirm — das ist der Unterschied zwischen „mach ich schnell"
 * und „mach ich später".
 */

export const projekt = defineType({
  name: 'projekt',
  title: 'Projekt',
  type: 'document',
  groups: [
    { name: 'basis', title: 'Basis', default: true },
    { name: 'geschichte', title: 'Geschichte' },
    { name: 'bilder', title: 'Bilder' },
    { name: 'fakten', title: 'Fakten' },
  ],
  fields: [
    defineField({
      name: 'titel',
      title: 'Titel',
      type: 'string',
      group: 'basis',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Adresse',
      type: 'slug',
      group: 'basis',
      description: 'Wird aus dem Titel erzeugt. Nach dem Veröffentlichen besser nicht mehr ändern — sonst laufen alte Links ins Leere.',
      options: { source: 'titel', maxLength: 60 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'kunde',
      title: 'Kunde',
      type: 'string',
      group: 'basis',
      description: 'Nur eintragen, wenn die Veröffentlichung freigegeben ist.',
    }),
    defineField({
      name: 'jahr',
      title: 'Jahr',
      type: 'number',
      group: 'basis',
      validation: (R) => R.min(2015).max(2100),
    }),
    defineField({
      name: 'kategorie',
      title: 'Anlass',
      type: 'string',
      group: 'basis',
      options: {
        list: [
          { title: 'Fahrzeuge', value: 'Fahrzeuge' },
          { title: 'Event', value: 'Event' },
          { title: 'Unternehmen', value: 'Unternehmen' },
          { title: 'Menschen', value: 'Menschen' },
        ],
        layout: 'radio',
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'leistung',
      title: 'Leistung',
      type: 'array',
      group: 'basis',
      of: [defineArrayMember({ type: 'string' })],
      options: {
        list: [
          { title: 'Foto', value: 'Foto' },
          { title: 'Film', value: 'Film' },
          { title: 'Luftaufnahmen', value: 'Luftaufnahmen' },
        ],
      },
      validation: (R) => R.min(1).error('Mindestens eine Leistung auswählen.'),
    }),

    defineField({
      name: 'coverbild',
      title: 'Titelbild',
      type: 'bildFeld',
      group: 'bilder',
      description: 'Das Bild, mit dem das Projekt in der Übersicht steht.',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'anriss',
      title: 'Ein-Satz-Anriss',
      type: 'string',
      group: 'basis',
      description: 'Steht unter dem Titel in der Übersicht. Ein Satz, der neugierig macht.',
      validation: (R) => R.max(90).warning('Kurz halten — über 90 Zeichen wird es in der Kachel eng.'),
    }),

    defineField({
      name: 'aufgabe',
      title: 'Akt 1 — Die Aufgabe',
      type: 'text',
      rows: 5,
      group: 'geschichte',
      description: 'Was sollte entstehen, was stand im Weg? Drei bis fünf Sätze in deiner Sprache.',
    }),
    defineField({
      name: 'umsetzung',
      title: 'Akt 2 — Die Umsetzung',
      type: 'array',
      group: 'geschichte',
      of: [defineArrayMember({ type: 'bildFeld' })],
      options: { layout: 'grid' },
      description:
        'Blicke hinter die Kulissen von genau diesem Dreh. Der Teil, den sonst niemand zeigt — und der am meisten überzeugt. Handybilder reichen.',
    }),
    defineField({
      name: 'strecke',
      title: 'Akt 3 — Das Ergebnis',
      type: 'array',
      group: 'bilder',
      of: bloeckeFeld,
      description: 'Die eigentliche Bildstrecke. Blöcke lassen sich frei kombinieren und per Ziehen sortieren.',
    }),

    defineField({
      name: 'eckdaten',
      title: 'Was drin war',
      type: 'object',
      group: 'fakten',
      description: 'Nüchterne Zahlen nach der Geschichte. Beweisen und filtern gleichzeitig.',
      options: { columns: 3 },
      fields: [
        defineField({ name: 'drehtage', title: 'Aufwand', type: 'string', description: 'z. B. „1 Tag"' }),
        defineField({ name: 'umfang', title: 'Umfang', type: 'string', description: 'z. B. „85 Bilder"' }),
        defineField({ name: 'lieferzeit', title: 'Lieferzeit', type: 'string', description: 'z. B. „12 Tage"' }),
      ],
    }),
    defineField({
      name: 'kundenstimme',
      title: 'Kundenstimme',
      type: 'reference',
      group: 'fakten',
      to: [{ type: 'kundenstimme' }],
    }),
    defineField({
      name: 'hervorgehoben',
      title: 'Auf der Startseite zeigen',
      type: 'boolean',
      group: 'basis',
      description: 'Dort stehen höchstens sechs Projekte. Weniger wirkt stärker.',
      initialValue: false,
    }),
    defineField({
      name: 'reihenfolge',
      title: 'Reihenfolge',
      type: 'number',
      group: 'basis',
      description: 'Kleinere Zahl steht weiter vorn.',
      initialValue: 100,
    }),
  ],
  orderings: [
    { title: 'Reihenfolge', name: 'reihenfolge', by: [{ field: 'reihenfolge', direction: 'asc' }] },
    { title: 'Neueste zuerst', name: 'jahr', by: [{ field: 'jahr', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'titel', kategorie: 'kategorie', jahr: 'jahr', media: 'coverbild.asset', hv: 'hervorgehoben' },
    prepare: ({ title, kategorie, jahr, media, hv }) => ({
      title: hv ? `★ ${title}` : title,
      subtitle: [kategorie, jahr].filter(Boolean).join(' · '),
      media,
    }),
  },
});

export const journalEintrag = defineType({
  name: 'journalEintrag',
  title: 'Journal-Eintrag',
  type: 'document',
  fields: [
    defineField({ name: 'titel', title: 'Titel', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'slug',
      title: 'Adresse',
      type: 'slug',
      options: { source: 'titel', maxLength: 60 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'datum',
      title: 'Datum',
      type: 'date',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (R) => R.required(),
    }),
    defineField({ name: 'coverbild', title: 'Titelbild', type: 'bildFeld', validation: (R) => R.required() }),
    defineField({
      name: 'anriss',
      title: 'Anriss',
      type: 'string',
      description: 'Ein bis zwei Zeilen für die Übersicht.',
    }),
    defineField({
      name: 'bloecke',
      title: 'Inhalt',
      type: 'array',
      of: bloeckeFeld,
      description: 'Für den schnellsten Eintrag reicht ein Einzelbild plus ein Textblock.',
    }),
  ],
  orderings: [{ title: 'Neueste zuerst', name: 'datum', by: [{ field: 'datum', direction: 'desc' }] }],
  preview: {
    select: { title: 'titel', subtitle: 'datum', media: 'coverbild.asset' },
  },
});

export const leistung = defineType({
  name: 'leistung',
  title: 'Leistung',
  type: 'document',
  fields: [
    defineField({ name: 'titel', title: 'Titel', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'text', title: 'Beschreibung', type: 'text', rows: 3 }),
    defineField({
      name: 'enthalten',
      title: 'Was ist drin',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Ein Punkt pro Zeile.',
    }),
    defineField({ name: 'aufwand', title: 'Aufwand', type: 'string', description: 'z. B. „halber Tag"' }),
    defineField({ name: 'lieferzeit', title: 'Lieferzeit', type: 'string', description: 'z. B. „10 Tage"' }),
    defineField({
      name: 'preis',
      title: 'Ab-Preis',
      type: 'string',
      description: 'z. B. „ab 890 €". Sichtbare Preise sind der stärkste Filter der ganzen Seite.',
    }),
    defineField({ name: 'reihenfolge', title: 'Reihenfolge', type: 'number', initialValue: 100 }),
  ],
  orderings: [{ title: 'Reihenfolge', name: 'reihenfolge', by: [{ field: 'reihenfolge', direction: 'asc' }] }],
  preview: { select: { title: 'titel', subtitle: 'preis' } },
});

export const faq = defineType({
  name: 'faq',
  title: 'Häufige Frage',
  type: 'document',
  fields: [
    defineField({ name: 'frage', title: 'Frage', type: 'string', validation: (R) => R.required() }),
    defineField({
      name: 'antwort',
      title: 'Antwort',
      type: 'text',
      rows: 4,
      description: 'Zwei bis vier Sätze. Jede Frage hier ist eine Nachricht weniger im Postfach.',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'reihenfolge', title: 'Reihenfolge', type: 'number', initialValue: 100 }),
  ],
  orderings: [{ title: 'Reihenfolge', name: 'reihenfolge', by: [{ field: 'reihenfolge', direction: 'asc' }] }],
  preview: { select: { title: 'frage', subtitle: 'antwort' } },
});

export const kundenstimme = defineType({
  name: 'kundenstimme',
  title: 'Kundenstimme',
  type: 'document',
  fields: [
    defineField({ name: 'text', title: 'Zitat', type: 'text', rows: 4, validation: (R) => R.required() }),
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (R) => R.required() }),
    defineField({ name: 'rolle', title: 'Rolle', type: 'string', description: 'z. B. „Geschäftsführer"' }),
    defineField({ name: 'firma', title: 'Firma', type: 'string' }),
    defineField({ name: 'logo', title: 'Logo', type: 'image', description: 'Am besten SVG oder PNG mit transparentem Hintergrund.' }),
    defineField({
      name: 'freigabe',
      title: 'Schriftlich freigegeben',
      type: 'boolean',
      description: 'Nur freigegebene Stimmen erscheinen auf der Website.',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'name', firma: 'firma', media: 'logo', freigabe: 'freigabe' },
    prepare: ({ title, firma, media, freigabe }) => ({
      title: freigabe ? title : `${title} (nicht freigegeben)`,
      subtitle: firma,
      media,
    }),
  },
});

export const documents = [projekt, journalEintrag, leistung, faq, kundenstimme];
