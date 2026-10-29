# Sandro Mondini – erster Websiteentwurf

Stand: 29.10.2026. Feedback-Entwurf auf Basis des gelieferten Drive-Materials. Die gestalterische Kundenabnahme ist offen.

Für die Fortsetzung in einem neuen Chat zuerst `AGENTS.md` und `UEBERGABE.md` lesen. Die dort verlinkte Obsidian-Notiz `10-Projektbasis-und-Leitplanken.md` hält Sandros belegte Anforderungen und den Maßstab für jede weitere Änderung fest.

## Vercel-Vorschau

Das vorhandene Vercel-Projekt heißt `website-fotograf` und ist mit `adrienwottke-stack/Website-Fotograf` verbunden. Die Feedback-Vorschau wird aus dem Branch `codex/sandro-feedback-preview` erstellt. `vercel.json` verwendet `npm run build:vercel`; `astro.vercel.config.mjs` ergänzt den Vercel-Adapter, während die lokale Node-Konfiguration erhalten bleibt. Die Kontakt-API läuft als Serverless-Funktion mit Node 22. Vercel-eigene Deployment-Hostnamen werden beim Build für die korrekte Origin-Prüfung übernommen.

SMTP-Zugangsdaten werden ausschließlich als geschützte Umgebungsvariablen beim Hoster eingerichtet. Ohne Versandzugang zeigt das Formular eine Fehlermeldung statt einer falschen Versandbestätigung. Originale, Analyse, Verträge und lokale Zugangsdaten sind vom Git-/Deployment-Upload ausgeschlossen.

## Lokal ansehen

```powershell
npm install
npm run build
npm run preview -- --host 127.0.0.1 --port 4321
```

Danach `http://127.0.0.1:4321/` öffnen. Für laufende Änderungen `npm run dev` verwenden. Der vorhandene Stand enthält die fertigen Webmedien; für den normalen Start werden weder Drive-Zugang noch Originaldateien benötigt.

## Inhalt

### Direkter Formularversand – 29.10.2026

Die Kontaktseite sendet per POST an `/api/kontakt`. Das bisherige Vorbereiten einer Mail im Besucherprogramm entfällt. Die Besucheradresse ist ein Pflichtfeld und wird als Antwortadresse verwendet; der eigentliche Absender kommt aus dem bestätigten SMTP-Zugang. Bestätigung erst nach Annahme durch den Mailserver, bei Fehlern bleiben die Eingaben erhalten. Projektbezug über `?projekt=...` bleibt möglich.

**Aktivierungsstand:** Adrien hat bestätigt, dass noch kein Versandzugang vorhanden ist. Die reguläre Vorschau meldet deshalb ehrlich HTTP 503 und zeigt keine Versandbestätigung. Die komplette Browser-zu-Server-zu-SMTP-Strecke wurde mit einem ausschließlich lokalen Testempfänger geprüft. Es wurde keine Nachricht an Sandro oder einen externen Empfänger gesendet. Einrichtung, Betrieb und kurze Prüfungen stehen in `KONTAKTVERSAND.md`.

### Projektübersicht nach Justin Bettman – 29.10.2026

**Aktueller Stand nach der Flächenkorrektur:** Die vier Projekte bilden ein geschlossenes 2×2-Raster über die gesamte Seitenbreite, mit vollständig gefüllten, gleich hohen Bildern und Texten im Bild. Die warme Hintergrundgestaltung bleibt erhalten. Es gibt keinen „Alle Projekte“-Link und keine separate Projektansicht unter „Arbeiten“ mehr. Projekt-Rückwege und Footer führen zum Startseitenbereich `/#projekte`; alte Aufrufe von `/arbeiten?ansicht=projekte` werden dorthin weitergeleitet. Für die breite KXXMA-Kachel wird ein bereits vorhandenes Querformat aus derselben Serie verwendet. Code und Projektinhalte bleiben in den bisherigen Komponenten beziehungsweise Datenquellen; Ausschnitte und responsive Webvarianten sind in `ProjectIndex.astro` gesteuert. Neue Ansichten/Prüfung: `analyse/2026-10-29-projekte-flaechig/`.

Die folgenden Absätze halten den vorherigen schmaleren Entwurf fest und sind durch diese Flächenkorrektur überholt:

Auf Adriens neue Referenz `https://www.justinbettman.com/projects` wurde die Projektübersicht als ruhiger Index mit vier Spalten, nativen Bildformaten und klaren Titeln aufgebaut. Diese Richtung ersetzt den zwischenzeitlichen Wunsch nach fünf Projektvarianten; dafür wurden keine neuen Optionskomponenten angelegt. Die gemeinsame Startseite nutzt `ProjectSection.astro`, die Projekte-Ansicht unter „Arbeiten“ dieselbe `ProjectIndex.astro`. `src/styles/project-index.css` enthält die begrenzte Gestaltung und leichte Bild-/Textreaktionen auf Hover beziehungsweise Tastaturfokus. Auf Tablet zwei Spalten, mobil eine Bildfolge; Überschrift und Übersichtlink können bei schmalen Breiten umbrechen.

Die vier vorhandenen Projektseiten, Inhalte und Medienzuordnungen bleiben die Linkziele. Es werden ausschließlich bereits exportierte Webbilder verwendet. Kurze Prüfung: Build, 1280px, 375px und 320px, Tastaturfokus, ein vollständiger Weg zur Projektseite und zurück zur Projektübersicht. Ansichten und Grenzen: `analyse/2026-10-29-projekte-bettman/`. Lokal umgesetzt, noch keine Gestaltungsgenehmigung oder Veröffentlichung.

### Filmsektion – 29.10.2026

Fortschreibung nach Adriens Rückmeldung zum Setting: Der Filmblock ist jetzt ein fotografischer Raum mit schwebenden Flächen. Als gemeinsame Kulisse wird der vorhandene private-Original-zu-WebP-Export der warmen Lichter verwendet; keine zusätzlichen Originale oder fremden Referenzgrafiken werden ausgeliefert. Sandros Favorit mit überlagerten Fenstern und die Pflanzenreferenz begründen die Richtung; die konkrete Filmraum-Komposition und Bewegung sind unsere Gestaltung. `src/scripts/film-space.ts` ergänzt langsame unabhängige Drift, geringe Maus-/Scrollparallaxe und eine Pause-Taste. Außerhalb des sichtbaren Bereichs, bei Tastaturfokus auf einem Film, bei geöffnetem Dialog und bei reduzierter Bewegung ruht die Animation. Mobil sind die Wege kleiner und die Parallaxe ausgeschaltet. Neue Ansichten/Prüfgrenzen: `analyse/2026-10-29-filmraum/`.

Die dritte Inhaltssektion auf der Startseite orientiert sich an der Filmübersicht von Mike Schwartz (`https://www.mikeschwartz.work/film`): wechselnde Bildgrößen, freie Abstände, knappe Titel und Laufzeiten. Die Umsetzung bleibt in Sandros Anthrazit-/Gelbpalette und erhält die nativen Filmformate. `src/components/FilmSection.astro` und `src/styles/film-section.css` ersetzen nur den bisherigen Filmblock in der gemeinsamen Startseite; damit verwenden Hero 1 und Hero 2 dieselbe Filmsektion. Direktaufruf: `http://127.0.0.1:4321/#filme`.

Das neue Zixspeed-Poster wurde bei 45 Sekunden aus dem privaten Originalfilm in 800/1200px exportiert (24,5/40,0 KB WebP). `scripts/export-film-section-poster.mjs` erzeugt diese Varianten und `src/data/film-section.generated.json`. Andere Poster und vollständige Filme bleiben erhalten. Vor Auswahl werden ausschließlich Poster geladen; die bestehende Dialog-Wiedergabe übernimmt Start, Stoppen und Fokus-Rückgabe.

Produktionsbuild, Desktop 1280 × 800, Mobil 375 × 812, ein tatsächlicher Filmstart sowie Schließen und Weiterleitung zur Filmübersicht sind kurz geprüft. Ansichten und Exportbericht: `analyse/2026-10-29-filmsektion/`. Lokal umgesetzt, noch keine gestalterische Abnahme oder Veröffentlichung.

### Hero-Bildspur – 29.10.2026

Der Startseiten-Hero verwendet die angefragte React/GSAP-Bildspur mit sieben vorhandenen Webmotiven. Komponente: `src/components/ui/image-trail.tsx`, Gestaltung: `src/styles/hero-trail.css`, Auswahl und Parameter: `src/components/Startseite.astro`. `imageWidth`, `imageHeight`, `threshold` und `duration` steuern Größe, Abstand und Ablauf. Der Alias `@/` verweist auf `src/`; die bestehenden globalen Styles bleiben unter `src/styles/`. Die Utility-Klassen der Vorlage wurden in normales Projekt-CSS übersetzt; Tailwind oder eine vollständige shadcn-Einrichtung sind für diese Integration nicht erforderlich.

React wird nur für diese Insel auf Geräten mit Maus, ab 701px und ohne reduzierte Bewegung aktiviert. Die zusätzlichen Spur-Bilder erhalten ihre responsiven WebP-Quellen erst bei Pointerbewegung. Auf Mobilgeräten, ohne JavaScript und bei reduzierter Bewegung bleiben die vier verlinkten Bildfenster sichtbar. Die Bildspur hat keine Dauerschleife; Pointerereignisse lösen begrenzte GSAP-Timelines aus, die beim Verlassen, Scrollen, Ausblenden oder Seitenwechsel beendet werden.

Kurze Prüfbelege und Screenshots: `analyse/2026-10-29-hero-trail/`. Die Änderung ist lokal, nicht veröffentlicht.

Startseite, Arbeiten mit drei Ansichten, sieben Themengalerien, vier Projektseiten, Leistungen mit vier FAQ, Über mich, Kontakt, zwei rechtliche Entwurfsseiten und eine 404-Seite. Die aktuelle Inhaltsquelle ist `src/data/portfolio.ts`; die Webvarianten stehen in `src/data/media.generated.json`.

Die Kontaktseite verwendet den direkten Formularversand über den Website-Server; der SMTP-Zugang fehlt noch (siehe oben). Der Projektbezug wird über `?projekt=...` übernommen. Unter Arbeiten sind `?ansicht=themen|filme` erreichbar; Projekte stehen auf der Startseite unter `/#projekte`.

Impressum und Datenschutz sind ausdrücklich Entwurfsstände. Die Domain ist noch nicht in der Konfiguration festgelegt. Der Entwurf enthält `noindex, nofollow`.

## Medien

94 Foto-Dateieinträge wurden anhand der Originale auf **91 unterschiedliche Fotos** reduziert. Covers und Startseite referenzieren denselben Bestand. Alle Fotos kommen aus gelieferten Originalen, mit eigener Orientierung/Farbumwandlung, WebP-Ausgaben und gezielten AVIF-Varianten. Originale und PDF liegen außerhalb von `public/` und `dist/`.

Die vier vollständigen Filme sind H.264-Webfassungen mit AAC-Ton, entfernten Dateimetadaten und Faststart. Ein Film erhält erst nach einer Abspielaktion eine Quelle; beim Schließen oder Seitenwechsel wird sie wieder entfernt. Die langen Formate sind weiterhin größere Dateien und werden einzeln bei Bedarf geladen.

- Auswahl und private Originale: `.cache/media-selection.json`, `.cache/drive-originals/` (Git ignoriert).
- Auswahl neu erzeugen: `npm run media:select` (benötigt das lokale Analyseinventar vom 29.10.2026).
- Varianten erzeugen: `npm run media:export` (benötigt die ausgewählten Originale im privaten Cache sowie ffmpeg im PATH).
- Bereinigen und Beschreibungen aktualisieren: `node scripts/finish-media.mjs`.
- Bildbeschreibungen: `scripts/photo-descriptions.mjs`.
- Exportbericht und technische Sichtung: `analyse/2026-10-29-entwurf/` (Git ignoriert).

## Redaktion und nächste Freigaben

Sandros Geschichte stammt aus seinem gelieferten PDF; Rechtschreibung und Satzbau wurden geglättet. Der Vergleich zum Original liegt im privaten Analyseordner. Neue Texte für Einstieg, Themen und Projekte sind redaktionelle Entwürfe. Die Projektseiten enthalten keine ergänzten Erfolgszahlen, erfundenen Rollen, Lieferfristen oder Preise. Kundenlogos werden bis zur konkreten Zuordnung nicht als allgemeine Kundenliste eingesetzt.

Vor einer Veröffentlichung: Gestaltung und Auswahl rückmelden, Projektrollen/Credits und Medienfreigaben bestätigen, persönliche Textstellen prüfen, Betreiberangaben/Hosting/Domain festlegen. Das vorbereitete Sanity-Verzeichnis ist weiterhin eine Grundlage für eine spätere Redaktion und noch nicht angebunden.

`KONZEPT.md`, `LIEFERLISTE.md` und `PLAN-CMS.md` sind historische August-Unterlagen. Bei Abweichungen gelten das aktuelle Briefing, der beauftragte Entwurf und das Designsystem vom 29.10.2026.
