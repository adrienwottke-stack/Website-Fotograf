# Website Sandro Mondini

Foto & Film aus der Oberlausitz. Astro-Website, aktuell im **Entwurfsstadium** — fünf Designrichtungen stehen zur Auswahl.

## Starten

```bash
npm install
```

```bash
npm run dev
```

Läuft dann auf `http://localhost:4321`.

## Designrichtungen vergleichen

Oben auf jeder Seite liegt eine Leiste mit fünf Richtungen. Die Wahl gilt seitenübergreifend und wird im Browser gespeichert.

| Nr | Richtung | Charakter |
|---|---|---|
| 1 | Werkstatt | Warm, hell, farbenfroh |
| 2 | Postkarte | Laut, Typografie dominiert |
| 3 | Sonntagslicht | Leise, viel Luft, Serifen |
| 4 | Abendwerkstatt | Warmes Dunkel, Kinoformate |
| 5 | Zeitung | Dicht, viele Spalten, harte Linien |

Die Richtungen unterscheiden sich nicht nur in der Farbe, sondern strukturell: Schriftgröße und -gewicht, Rasterspalten, Bildformate und Sektionsrhythmus.

**Beim Launch:** `src/components/DesignWahl.astro` löschen, `--dw-h` in `src/styles/global.css` auf `0px` setzen und die Token der gewählten Richtung nach `:root` ziehen.

## Aufbau

```
src/
  data/         Inhalte (später aus Sanity): projekte, bilder, site
  components/   Bausteine — Bild, Frame (Platzhalter), Karten, Header, Footer
  layouts/      Base.astro: Grundgerüst, Schriften, Interaktion
  pages/        Routen
  styles/       global.css — alle Design-Token und die fünf Richtungen
referenz/       Quellmaterial (Instagram-Slides), nicht Teil der Website
```

## Dokumente

- **[KONZEPT.md](KONZEPT.md)** — Strategie, Seitenstruktur, Storytelling, Technik, offene Entscheidungen
- **[LIEFERLISTE.md](LIEFERLISTE.md)** — was Sandro noch liefern muss, nach Dringlichkeit sortiert

## Stand

- Fertig gestaltet: Startseite, Arbeiten, Projektseite, Leistungen, Über mich
- Platzhalter: Ablauf, Journal, Kontakt, Impressum, Datenschutz
- Echte Fotos nur beim Projekt „Carmeet Oberlausitz"; sonst Farbflächen als Platzhalter
- Alle Preise, Kundennamen und Eckdaten sind Platzhalter
- Rohvideos liegen lokal unter `public/video/` und sind bewusst nicht eingecheckt (50 MB, müssen neu exportiert werden)

## Technik

Astro 5, keine UI-Bibliothek. Schriften über `@fontsource` selbst gehostet — kein Google-CDN (DSGVO). Bilder werden zu AVIF in vier Größen gerendert. Kein Tracking, keine Cookies.
