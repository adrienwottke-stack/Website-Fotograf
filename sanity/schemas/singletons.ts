import { defineType, defineField, defineArrayMember } from 'sanity';

/**
 * Einzelstücke — von diesen Dokumenten gibt es genau eines.
 *
 * Hier stecken die benannten Plätze der Startseite. Aus einer Liste
 * könnte die Seite nicht wissen, welches Bild in den Hero-Streifen
 * gehört und welches nach „Jetzt gerade" — deshalb bekommt jeder Platz
 * ein eigenes Feld statt einer freien Sammlung.
 */

export const startseite = defineType({
  name: 'startseite',
  title: 'Startseite',
  type: 'document',
  groups: [
    { name: 'hallo', title: 'Begrüßung', default: true },
    { name: 'streifen', title: 'Bildstreifen' },
    { name: 'showreel', title: 'Showreel' },
    { name: 'verstehen', title: 'Wie es entsteht' },
    { name: 'person', title: 'Über mich' },
    { name: 'jetzt', title: 'Jetzt gerade' },
  ],

  fields: [
    /* --- Begrüßung ------------------------------------------- */
    defineField({
      name: 'hallo',
      title: 'Begrüßungszeile',
      type: 'string',
      group: 'hallo',
      description: 'Die kleine Zeile ganz oben.',
      initialValue: 'Hallo! Ich bin Sandro — die meisten sagen Monte.',
    }),
    defineField({
      name: 'schlagzeile',
      title: 'Schlagzeile',
      type: 'string',
      group: 'hallo',
      description: 'Das Größte auf der Seite. Kurz halten — zwei Zeilen wirken am besten.',
      validation: (R) => R.required().max(60),
    }),
    defineField({
      name: 'schlagzeileHervorheben',
      title: 'Welches Wort wird markiert?',
      type: 'string',
      group: 'hallo',
      description:
        'Dieses Wort aus der Schlagzeile bekommt den Textmarker-Effekt. Muss genau so geschrieben sein wie oben. Darf leer bleiben.',
    }),
    defineField({
      name: 'einleitung',
      title: 'Einleitung',
      type: 'text',
      rows: 3,
      group: 'hallo',
      validation: (R) => R.required(),
    }),

    /* --- Bildstreifen ---------------------------------------- */
    defineField({
      name: 'streifen',
      title: 'Bildstreifen unter der Begrüßung',
      type: 'array',
      group: 'streifen',
      of: [defineArrayMember({ type: 'bildFeld' })],
      options: { layout: 'grid' },
      description:
        'Genau vier Bilder — sie zeigen auf einen Blick deine Bandbreite. Reihenfolge per Ziehen ändern.',
      validation: (R) =>
        R.length(4).error('Der Streifen braucht genau vier Bilder, sonst bricht das Raster.'),
    }),

    /* --- Showreel -------------------------------------------- */
    defineField({
      name: 'showreel',
      title: 'Showreel',
      type: 'object',
      group: 'showreel',
      description: 'Der gerahmte Videoplatz unter der Begrüßung.',
      fields: [
        defineField({
          name: 'datei',
          title: 'Videodatei',
          type: 'file',
          options: { accept: 'video/mp4' },
          description:
            'MP4, H.264, maximal 1920 px breit. Solange hier nichts liegt, zeigt die Seite das Standbild mit dem Hinweis „Video folgt".',
        }),
        defineField({
          name: 'poster',
          title: 'Standbild',
          type: 'bildFeld',
          description: 'Wird gezeigt, bevor das Video startet — und solange noch keine Datei da ist.',
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'laenge',
          title: 'Länge',
          type: 'string',
          description: 'Steht als kleine Marke im Bild, z. B. „00:47".',
        }),
      ],
    }),

    /* --- Wie es entsteht ------------------------------------- */
    defineField({
      name: 'signatureProjekt',
      title: 'Welches Projekt wird aufgeklappt?',
      type: 'reference',
      group: 'verstehen',
      to: [{ type: 'projekt' }],
      description: 'Titel und Eckdaten werden von dort übernommen.',
    }),
    defineField({
      name: 'verstehenLead',
      title: 'Einleitungssatz',
      type: 'string',
      group: 'verstehen',
      initialValue: 'Die meisten zeigen nur das Ergebnis. Das Schöne passiert davor.',
    }),
    defineField({
      name: 'akte',
      title: 'Die drei Akte',
      type: 'array',
      group: 'verstehen',
      description: 'Genau drei: Aufgabe, Umsetzung, Ergebnis. Je ein Bild und ein bis zwei Sätze.',
      validation: (R) => R.length(3).error('Genau drei Akte — die Sektion ist dreispaltig aufgebaut.'),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'akt',
          fields: [
            defineField({
              name: 'akt',
              title: 'Überschrift',
              type: 'string',
              options: {
                list: ['Die Aufgabe', 'Die Umsetzung', 'Das Ergebnis'],
              },
              validation: (R) => R.required(),
            }),
            defineField({ name: 'bild', title: 'Bild', type: 'bildFeld', validation: (R) => R.required() }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 3, validation: (R) => R.required() }),
          ],
          preview: {
            select: { title: 'akt', subtitle: 'text', media: 'bild.asset' },
          },
        }),
      ],
    }),

    /* --- Über mich ------------------------------------------- */
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'bildFeld',
      group: 'person',
      description: 'Am besten von jemand anderem fotografiert — kein Selfie, kein Standbild aus einem Video.',
    }),
    defineField({
      name: 'personZitat',
      title: 'Zitat',
      type: 'text',
      rows: 2,
      group: 'person',
      initialValue: 'Ich habe die Firma auf Instagram gefunden. Zwei Jahre später habe ich ihre Filme gedreht.',
    }),
    defineField({
      name: 'personText',
      title: 'Kurztext',
      type: 'text',
      rows: 5,
      group: 'person',
    }),

    /* --- Jetzt gerade ---------------------------------------- */
    defineField({
      name: 'jetztGerade',
      title: 'Jetzt gerade',
      type: 'object',
      group: 'jetzt',
      description: 'Dein schnellster Handgriff: ein Bild, ein Satz. Zeigt, dass du gerade arbeitest.',
      fields: [
        defineField({ name: 'bild', title: 'Bild', type: 'bildFeld', validation: (R) => R.required() }),
        defineField({
          name: 'satz',
          title: 'Ein Satz dazu',
          type: 'text',
          rows: 3,
          validation: (R) => R.required(),
        }),
        defineField({
          name: 'datum',
          title: 'Datum',
          type: 'date',
          initialValue: () => new Date().toISOString().slice(0, 10),
        }),
      ],
    }),
  ],

  preview: { prepare: () => ({ title: 'Startseite' }) },
});

export const einstellungen = defineType({
  name: 'einstellungen',
  title: 'Einstellungen',
  type: 'document',
  groups: [
    { name: 'verfuegbarkeit', title: 'Verfügbarkeit', default: true },
    { name: 'kontakt', title: 'Kontakt' },
  ],
  fields: [
    defineField({
      name: 'verfuegbarkeitKurz',
      title: 'Kurzform',
      type: 'string',
      group: 'verfuegbarkeit',
      description: 'Steht oben im Kopf der Seite. Sehr kurz, z. B. „Frei ab November".',
      validation: (R) => R.required().max(28),
    }),
    defineField({
      name: 'verfuegbarkeitLang',
      title: 'Ganzer Satz',
      type: 'string',
      group: 'verfuegbarkeit',
      description: 'z. B. „Ich nehme aktuell Projekte ab November an."',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'antwortzeit',
      title: 'Antwortzeit-Versprechen',
      type: 'string',
      group: 'verfuegbarkeit',
      description: 'Lieber bescheiden und eingehalten als ehrgeizig und gebrochen.',
      initialValue: 'Antwort innerhalb von 3 Werktagen',
    }),

    defineField({ name: 'mail', title: 'E-Mail', type: 'string', group: 'kontakt', validation: (R) => R.required() }),
    defineField({ name: 'telefon', title: 'Telefon', type: 'string', group: 'kontakt' }),
    defineField({ name: 'instagram', title: 'Instagram', type: 'url', group: 'kontakt' }),
    defineField({ name: 'youtube', title: 'YouTube', type: 'url', group: 'kontakt' }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'string',
      group: 'kontakt',
      initialValue: 'Oberlausitz',
    }),
    defineField({
      name: 'seit',
      title: 'Jahre in der Branche',
      type: 'number',
      group: 'kontakt',
      description: 'Bitte einmal im Jahr hochzählen.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Einstellungen' }) },
});

export const singletons = [startseite, einstellungen];
