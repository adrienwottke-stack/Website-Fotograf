# Sandro Mondini – Bildfenster

Stand 29.10.2026. Beauftragte Richtung für den ersten lokalen Entwurf; noch keine gestalterische Abnahme. Grundlage: Sandros gelieferte Favoriten und Adriens Entscheidung für ein breites, mutiges Portfolio.

## Farben und Schrift

| Rolle | Wert |
|---|---|
| Grund | `#FFFDF6` |
| Warmer Abschnitt | `#FFF1C9` |
| Aktion/Akzent | `#FFCF3F` |
| Schrift/Filmbühne | `#2A2F33` |
| Nebenfarbe | `#B9C2C6` |

Archivo Variable für Namen und Überschriften, Plus Jakarta Sans Variable für Navigation und Texte. Schriften lokal ausliefern. Fließtext linksbündig, ausreichend kurze Zeilen. Anthrazit auf Gelb; keine helle Schrift auf Gelb.

## Komposition

Der Einstieg verbindet große Namenstypografie mit vier verschieden großen Fotografien. Bildfenster und asymmetrische Raster sind die wiederkehrende Form; unterschiedliche Seitenverhältnisse erhalten die jeweilige Motivwirkung. Schatten nur im räumlichen Einstieg. Abgerundete Bildfenster mit etwa 12px Radius, keine zusätzlichen dekorativen Karten um Textabsätze.

Maximale Inhaltsbreite 1600px. Außenabstände wachsen von 22px auf bis zu 88px. Auf Mobilgeräten zwei Bildfenster pro Reihe beziehungsweise eine klare Bildfolge; die Seite selbst scrollt ausschließlich vertikal. Ein eigenes Punktraster begleitet den persönlichen Abschnitt.

## Bewegung und Bedienung

Einmalige Entfaltung der Einstiegsbilder unter 800ms. Leichte Reaktion auf Hover/Fokus. Themenfenster und Galeriekopf erhalten zusammengehörige View Transitions. Großansichten und Filme öffnen in einem nativen Dialog. Escape, sichtbare Schaltflächen und Fokus-Rückgabe gehören dazu. Reduzierte Bewegung zeigt direkt den Endzustand.

CSS/kleines JavaScript und der vorhandene Astro ClientRouter. Inhalte bleiben serverseitig vorhanden. Keine blockierenden Ladeanimationen oder Eingriffe in das normale Scrollverhalten.

## Medien und Inhalte

Die Arbeitsanweisung im Obsidian-Projekt ist maßgeblich: Originale privat; WebP-Basis, gezielte AVIF-Ausgaben, responsive Vorschauen und nachgeladene Großansichten. Ein Hauptbild mit hoher Priorität. Filme zunächst als Poster und nur nach Auswahl laden. Foto-/Filmthemen, Projekte und Leistungen getrennt halten.

Personenmarke Sandro Mondini. Vier Leistungsbereiche aus dem PDF, individuelle Kalkulation. Keine alten Paketpreise, erfundenen Referenzen, Verfügbarkeit oder Erfolgszahlen übernehmen. Persönlichen Text nur sprachlich glätten.
