# Sanity Studio — Einrichtung

Das Redaktionswerkzeug, mit dem Sandro Bilder, Videos und Texte selbst ändert.
Der Ordner ist bewusst getrennt vom Astro-Projekt: er hat eigene Abhängigkeiten
und wird eigenständig veröffentlicht.

**Stand: Schema fertig, Studio noch nicht eingerichtet.** Die Schritte unten
brauchen einen Sanity-Account und sind noch offen.

---

## Wer welchen Account braucht

Sanity, Hosting und Domain sollten auf **Sandro** laufen, nicht auf die Agentur.
Sonst hängt sein Geschäft an fremden Zugängen, und beim Übergeben wird es
unangenehm. Mitarbeiter lassen sich jederzeit einladen — Eigentum später
umzuhängen ist deutlich mühsamer.

## Einrichtung

```bash
cd sanity
npm create sanity@latest -- --template clean --create-project "Sandro Mondini" --dataset production
```

Beim Anlegen die vorhandenen Dateien **nicht überschreiben** — `sanity.config.ts`
und `schemas/` sind schon fertig.

Danach `sanity/.env` anlegen (steht in `.gitignore`, gehört nicht ins Repository):

```
SANITY_STUDIO_PROJECT_ID=<Projekt-ID aus sanity.io/manage>
SANITY_STUDIO_DATASET=production
```

Lokal starten:

```bash
npm run dev
```

Veröffentlichen — danach erreichbar unter `sandro.sanity.studio`:

```bash
npx sanity deploy
```

## Warum nicht unter der eigenen Domain

`sandromondini.de/studio` würde Server-Rendering voraussetzen; die Website ist
bewusst statisch. Der von Sanity gehostete Weg kostet nichts und ist für ihn
genauso ein Link — Icon auf den Startbildschirm legen, fertig.

## Aufbau des Schemas

| Datei | Inhalt |
|---|---|
| `schemas/objects.ts` | Bild-Feld und die sechs Inhaltsblöcke |
| `schemas/documents.ts` | Projekt, Journal, Leistung, Häufige Frage, Kundenstimme |
| `schemas/singletons.ts` | Startseite und Einstellungen — davon je genau eines |

### Zwei Entscheidungen, die drinstecken

**Nur sechs Blocktypen.** Text, Einzelbild, Bildpaar, Strecke, Video, Zitat.
Jeder weitere Typ ist eine Entscheidung mehr beim Posten — und jede Entscheidung
senkt die Wahrscheinlichkeit, dass überhaupt gepostet wird.

**Benannte Plätze statt freier Sammlung.** Der Bildstreifen, die drei Akte und
„Jetzt gerade" sind eigene Felder mit fester Anzahl, keine offene Liste. Sonst
könnte die Seite nicht wissen, welches Bild wohin gehört. Die Prüfregeln
(genau vier Bilder, genau drei Akte) verhindern, dass das Raster bricht.

## Was noch fehlt

- [ ] Sanity-Projekt anlegen, `.env` füllen, Studio veröffentlichen
- [ ] Datenschicht der Website auf Abfragen umbauen (`src/data/*.ts`)
- [ ] `Bild.astro` auf das Sanity-Bild-CDN umstellen, damit der Bildausschnitt-Punkt greift
- [ ] Webhook auf den Build legen: veröffentlichen → Seite baut → ~90 Sekunden live
- [ ] Vorhandene Inhalte einmalig übertragen
- [ ] Anleitung für Sandro plus Screenrecording

## Video

Zum Start liegen Videos als Datei direkt in Sanity. Bedingung: eine
web-fertige MP4 (H.264, max. 1920 px breit, für selbstlaufende Schleifen unter
3 MB). Sanity wandelt nichts um.

Wenn Video später mehr Gewicht bekommt, lässt sich das Mux-Plugin nachrüsten —
dann läuft die Umwandlung im Hintergrund, und Sandro zieht die Datei weiterhin
ins selbe Studio. Der Wechsel betrifft ein Feld.
