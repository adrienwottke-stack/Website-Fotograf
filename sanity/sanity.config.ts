import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

/**
 * Konfiguration des Sanity Studios.
 *
 * Die Projekt-ID kommt aus der Umgebung, damit hier keine Zugangsdaten
 * im Repository stehen. Anlegen in `sanity/.env`:
 *
 *   SANITY_STUDIO_PROJECT_ID=xxxxxxxx
 *   SANITY_STUDIO_DATASET=production
 */

const projectId = process.env.SANITY_STUDIO_PROJECT_ID!;
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';

/** Von diesen Typen gibt es genau ein Dokument */
const einzelstuecke = ['startseite', 'einstellungen'];

export default defineConfig({
  name: 'sandro-mondini',
  title: 'Sandro Mondini',
  projectId,
  dataset,

  plugins: [
    structureTool({
      /**
       * Eigene Seitenleiste. Ohne das würde Sanity die Einzelstücke als
       * Listen mit einem Eintrag zeigen — man müsste also erst in eine
       * Liste klicken, um zur Startseite zu kommen. Hier sind sie das,
       * was sie sind: ein Klick, ein Formular.
       *
       * Reihenfolge nach Häufigkeit der Nutzung, nicht alphabetisch.
       */
      structure: (S) =>
        S.list()
          .title('Inhalte')
          .items([
            S.listItem()
              .title('Startseite')
              .id('startseite')
              .child(S.document().schemaType('startseite').documentId('startseite')),

            S.divider(),

            S.documentTypeListItem('journalEintrag').title('Journal'),
            S.documentTypeListItem('projekt').title('Projekte'),

            S.divider(),

            S.documentTypeListItem('leistung').title('Leistungen'),
            S.documentTypeListItem('faq').title('Häufige Fragen'),
            S.documentTypeListItem('kundenstimme').title('Kundenstimmen'),

            S.divider(),

            S.listItem()
              .title('Einstellungen')
              .id('einstellungen')
              .child(S.document().schemaType('einstellungen').documentId('einstellungen')),
          ]),
    }),
    visionTool({ defaultApiVersion: '2024-10-01' }),
  ],

  schema: {
    types: schemaTypes,
    /** Einzelstücke lassen sich nicht mehrfach anlegen */
    templates: (prev) => prev.filter((t) => !einzelstuecke.includes(t.schemaType)),
  },

  document: {
    /** „Duplizieren" und „Löschen" bei Einzelstücken ausblenden */
    actions: (prev, { schemaType }) =>
      einzelstuecke.includes(schemaType)
        ? prev.filter(({ action }) => action !== 'duplicate' && action !== 'delete')
        : prev,
  },
});
