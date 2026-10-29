# Hero 2 – Eine Landschaft, mehrere Perspektiven

29.10.2026. Separate lokale Entwurfsvariante nach Adriens Auftrag. Noch keine Kundenabnahme oder Veröffentlichung. Route `/hero-bildraum`; der bestehende Einstieg wird nicht ersetzt. `/hero-2` wurde parallel von einem anderen Chat belegt und bleibt diesem erhalten.

## Gelesene Referenzen

Alle zwölf Bilder aus „Webdesigns und Design Entscheidungen die mich ansprechen“ anhand der lokal archivierten Referenzbilder betrachtet.

- „Grobe Themen Kachel Idee – Sandros Favorit“: durchgehende Berglandschaft, darauf vier versetzte, unterschiedlich hohe Fenster mit dunklen Oberflächen.
- `IMG-20260819-WA0020.jpg`: ein Hintergrundfoto trägt Überschrift, Navigation und die kleineren fotografischen Themenfenster.
- `IMG-20260819-WA0021.jpg`: zusammenhängende fotografische Umgebung und davon abgesetzte, darüberliegende Inhalte.
- `IMG-20260819-WA0019.jpg` und `WA0017.jpg`: große Fotofläche, schwebende Navigation und klar gefasste äußere Kontur.
- Die übrigen Beispiele erweitern den Rahmen um Bildschriften, abgerundete Aussparungen, grafische Hintergründe und unterschiedliche Fenstergrößen. Nicht jedes Bild verwendet dieselbe Komposition.

## Entwurfsentscheidung

Die wiederkehrende Hintergrundebene wird sichtbar umgesetzt: Sandros eigene Wald-/Nebellandschaft als durchgehender, gerahmter Hero. Links steht sein Name, rechts liegen vier versetzte Themenfenster direkt auf dem Foto. Eine helle Navigation und die ausgesparte untere Ecke nehmen die Rahmen- und Fenstermotive auf. Kein neues Kundenversprechen und keine fremde Referenzgrafik als Websiteinhalt.

Farben bleiben `#FFFDF6`, `#FFF1C9`, `#FFCF3F`, `#B9C2C6`, `#2A2F33`. Archivo für Namen, Plus Jakarta Sans für Text und Navigation. Bildfarben kommen aus Sandros Fotografien. Links ausgerichtete Texte; ein zusammenhängender fotografischer Raum trägt die Komposition. Auf Mobilgeräten zwei Themenfenster je Reihe mit sichtbarem Hintergrund dazwischen.

Das generische Raster wäre hier zu gleichförmig: Die vier Fenster erhalten unterschiedliche Höhen und vertikale Positionen. Die Landschaft bleibt zwischen und um die Fenster sichtbar. Zusätzliche Maus-Effekte sind für diese Variante nicht vorgesehen.

## Dateigrenzen bei paralleler Arbeit

Eigene Seite `src/pages/hero-bildraum.astro`, Hero-Komponente `HeroTwo.astro`, `hero-two.css` und Manifest. Gemeinsame Komponenten und Inhalte werden verwendet, aber nicht geändert. Header-Regeln greifen ausschließlich, wenn der Marker `[data-hero-two-page]` vorhanden ist. Parallel entstandene Hero-/Stream-Varianten sowie Änderungen am gemeinsamen Layout bleiben erhalten.

Gezielter Zusatzexport aus dem privaten Original: `scripts/export-hero-two.mjs`. Gleiche Sharp-/WebP-Grundregeln wie in der bestehenden Pipeline, eigene Ausschnitte und gemessene Maße/Bytes in `src/data/hero-two.generated.json`. Keine Neuverarbeitung des Gesamtportfolios. Nur das Hintergrundbild erhält hohe Ladepriorität; keine Originale oder Filmquellen beim Einstieg.
