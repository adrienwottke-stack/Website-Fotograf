# Lieferliste — was Sandro noch bereitstellen muss

Arbeitsdokument für die Website. Stand: 18.08.2026

---

## So funktioniert diese Liste

Der Code ist nicht der Engpass — **der Content ist es.** Diese Liste ist nach Dringlichkeit sortiert, nicht nach Thema:

| Stufe | Bedeutung |
|---|---|
| **A** | Blockiert alles. Ohne das kann die Seite nicht gebaut werden. |
| **B** | Braucht Vorlauf von anderen Menschen. Deshalb heute anstoßen, auch wenn es später gebraucht wird. |
| **C** | Kann er allein und jederzeit erledigen. |
| **D** | Nice to have. Kann auch nach dem Launch kommen. |

**Wichtig zur Einordnung:** An Bildmaterial mangelt es nicht — der Instagram-Feed zeigt sechs Jahre Arbeit in großer Menge und Qualität. Was fehlt, ist fast ausschließlich der **geschäftliche Rahmen**: Wer war Kunde, was war der Auftrag, was durfte gezeigt werden, was hat es gekostet.

---

## Stand 18.08.2026 — was bereits eingebaut ist

| Geliefert | Wo es steckt | Was noch fehlt |
|---|---|---|
| **6 Fotos** vom Carmeet (Nissan Silvia S15) | Startseite, Projektseite „Carmeet Oberlausitz", Über mich | Originaldateien statt Instagram-Export (siehe C4) |
| **Sein Lebenslauf-Text** aus dem Instagram-Beitrag | Seite „Über mich", neu gesetzt statt als Bild | Freigabe, welche Stellen öffentlich stehen dürfen |
| **Technik-Chronik** 2015–2023 | Zeitleiste auf „Über mich" | — |
| **4 Videoclips** | im Projekt unter `public/video/`, noch nicht eingebunden | siehe Hinweis unten |

**Zu den Videos:** Die vier Clips liegen zwischen 7 und 26 MB. Für die Website sind sie in dieser Größe unbrauchbar — ein Hero-Video sollte unter 3 MB bleiben. Auf diesem Rechner ist kein ffmpeg installiert, ich konnte sie also weder prüfen noch komprimieren. Entweder er exportiert sie neu nach den Vorgaben unter C5, oder ffmpeg wird installiert und ich mache es.

**Neu aufgefallen — zwei rechtliche Punkte, siehe A1:** Auf den Carmeet-Fotos sind ein **Kennzeichen** und **erkennbare Personen** zu sehen.

---

## STUFE A — blockiert alles

### A1 · Rechte an bestehenden Arbeiten klären

- [ ] **TEXSIB-Arbeiten:** Schriftliche Freigabe einholen, welche der dort entstandenen Arbeiten im eigenen Portfolio gezeigt werden dürfen.
- [ ] **Nebentätigkeit:** Prüfen, ob die selbstständige Tätigkeit dem Arbeitgeber angezeigt bzw. von ihm genehmigt ist.
- [ ] **Kundenarbeiten allgemein:** Pro Projekt klären, ob Veröffentlichung erlaubt ist. Bei Firmenkunden oft vertraglich geregelt.
- [ ] **Personen auf Bildern:** Bei erkennbaren Personen (Portraits, Events, Hochzeiten) Einwilligung nach DSGVO / KUG. Besonders relevant bei den Hochzeits- und Portraitaufnahmen.
- [ ] **Konkret auf den gelieferten Carmeet-Fotos:** Auf `carmeet-luecke.jpg` sind im Hintergrund zwei Personen klar erkennbar. Entweder Einwilligung einholen, das Bild austauschen oder die Personen unkenntlich machen. Für eine Website ist das etwas anderes als für einen Instagram-Post.
- [ ] **Kennzeichen:** Auf `s15-heck-himmel.jpg` und `carmeet-luecke.jpg` ist ein amtliches Kennzeichen lesbar. Kennzeichen gelten als personenbezogenes Datum. Bei Fahrzeugtreffen ist meist ein Einverständnis des Halters gegeben, sauberer ist trotzdem: Halter fragen oder Kennzeichen retuschieren. Seine Entscheidung, aber sie sollte bewusst fallen.
- [ ] **Fremde Fahrzeuge:** Das fotografierte Auto gehört jemandem. Wenn es prominent auf der Website steht, ist eine kurze Rückfrage beim Besitzer gute Praxis — und bringt nebenbei oft eine Kundenstimme (siehe B1).

> **Warum zuerst:** Der gesamte Beweis-Teil der Website hängt an dieser Frage. Wenn die stärksten Arbeiten nicht gezeigt werden dürfen, ändert sich die Projektauswahl komplett — und damit das halbe Layout.

### A2 · Auftragsarbeit von Leidenschaftsprojekt trennen

Der Feed mischt beides: bezahlte Aufträge, private Carmeets, eigene Fahrzeuge, Freunde, Reisen. Für eine Website, die Geschäftskunden überzeugen soll, muss das getrennt werden.

- [ ] **Liste anlegen:** Alle zeigbaren Arbeiten der letzten ~3 Jahre in drei Spalten sortieren:
  - **Auftrag** — es gab einen Kunden und Geld
  - **Kooperation** — z. B. Produkt gestellt, Sichtbarkeit als Gegenleistung
  - **Frei** — eigenes Projekt, Hobby, Freunde

> **Warum:** Auftragsarbeiten gehören ins Portfolio (`/arbeiten`) und beweisen Professionalität. Freie Arbeiten gehören ins Journal und zeigen Handschrift. Beides ist wertvoll — aber vermischt entsteht der Eindruck eines Hobbyfotografen, und genau den soll die Seite vermeiden.

### A3 · Die Projektauswahl treffen

- [ ] **1 Signature-Projekt** — das beste Auftragsprojekt, mit dem größten Umfang und der besten Geschichte. Bekommt die volle Inszenierung.
- [ ] **3–5 weitere Projekte** mit Dreiakter-Text
- [ ] **6–14 Projekte** als reine Bildstrecke, ohne Text

> **Auswahlkriterium — nicht „welches ist am schönsten", sondern:** *„Welches Projekt würde ich einem Wunschkunden zeigen, damit er versteht, was er bei mir bekommt?"* Ein technisch mittelmäßiges Projekt mit starker Geschichte schlägt ein perfektes Bild ohne Kontext.

### A4 · Positionierung festlegen

Aus dem Instagram-Profil: *„Content Creator für mittelständische Unternehmen und Events aller Art."* Das ist ein guter Ausgangspunkt, aber für die Leistungsseite zu breit.

- [ ] **Welche Kunden will er?** Autohäuser und Tuning-Betriebe? Produzierendes Gewerbe? Veranstalter? Handwerk? Die Bandbreite im Feed reicht von Kartsport über Handball bis Produktfotografie — die Website muss sich für einen Schwerpunkt entscheiden, sonst wirkt sie beliebig.
- [ ] **Macht er Hochzeiten?** Im Feed sind mehrere Hochzeitsaufnahmen. Das muss auf der Seite klar mit Ja oder Nein beantwortet werden — „auf Anfrage" erzeugt genau die Nachrichten, die wir vermeiden wollen.
- [ ] **Spitzname „Monte" nutzen oder nicht?** Er führt ihn im Profil prominent, inklusive des Witzes über den Streamer. Das ist charmant und einprägsam — aber es ist eine Entscheidung, ob die Marke „Sandro Mondini" oder „Monte" heißt. Empfehlung: offizieller Name als Marke, „Monte" als persönliche Note auf der Über-mich-Seite.

### A5 · Preise festlegen

- [ ] Für jedes Paket: Ab-Preis oder Preisspanne (Vorschlag mit Platzhalterzahlen steht im Konzept, Abschnitt 4)
- [ ] Umsatzsteuer-Status klären: Kleinunternehmer nach §19 UStG oder regelbesteuert? Bestimmt die Preisauszeichnung.
- [ ] Reisegebiet und ab wann Fahrtkosten berechnet werden

---

## STUFE B — heute anstoßen, weil andere liefern müssen

### B1 · Kundenstimmen

- [ ] **3–5 Zitate** von echten Kunden einsammeln
- [ ] Je Zitat: Name, Rolle, Firma, und die schriftliche Erlaubnis zur Veröffentlichung

> **Der längste Posten der ganzen Liste.** Menschen antworten langsam. Zwei bis vier Wochen einplanen.
>
> **Praxistipp:** Nicht „kannst du mir eine Bewertung schreiben?" fragen — das erzeugt Arbeit und wird aufgeschoben. Stattdessen drei konkrete Fragen stellen und die Antwort selbst zu einem Zitat verdichten (zur Freigabe zurückschicken):
> 1. Was war der Anlass?
> 2. Was hattest du vorher befürchtet?
> 3. Was war am Ergebnis am wichtigsten für euch?

### B2 · Kundennamen und Logos

- [ ] **4–8 Logos** mit schriftlicher Freigabe zur Nutzung als Referenz
- [ ] Format: SVG bevorzugt, sonst PNG mit transparentem Hintergrund, mindestens 600 px breit

> Falls Logos nicht freigegeben werden: Alternative ist eine reine Textliste („Kunden u. a.: …") oder eine anonymisierte Branchenliste. Schwächer, aber besser als nichts.

---

## STUFE C — kann er allein erledigen

### C1 · Texte

| Text | Umfang | Hinweis |
|---|---|---|
| - [ ] **Über mich** | 200–300 Wörter | Der Berufswechsel gehört hier rein. Der Satz *„Ich habe die Firma auf Instagram gefunden, zwei Jahre später habe ich ihre Filme gedreht"* ist der stärkste, den er hat. In seiner Sprache schreiben, nicht in Agentursprache. |
| - [ ] **Haltung / wie er arbeitet** | 3–4 Sätze | Hier darf der Freigeist sprechen. Der Humor aus dem Instagram-Profil darf durchkommen. |
| - [ ] **Projektbeschreibungen** | 3–5 Sätze je Projekt (nur A3-Projekte mit Text) | Aufgabe, Herausforderung, Entscheidung — nicht die Bilder beschreiben |
| - [ ] **Leistungsbeschreibungen** | 2–3 Sätze je Paket | Was ist drin, was nicht |
| - [ ] **FAQ-Antworten** | 10–14 Antworten à 2–4 Sätze | Fragenliste steht im Konzept, Abschnitt 4 |
| - [ ] **„Für wen das nichts ist"** | 3–4 Sätze | Ehrlich und direkt. Filtert am stärksten. |

### C2 · Projekt-Eckdaten

Für jedes Projekt mit Text:

- [ ] Kunde, Jahr, erbrachte Leistung
- [ ] Drehtage bzw. Aufwand
- [ ] Anzahl gelieferter Bilder / Filme
- [ ] Tatsächliche Lieferzeit

> Diese Zahlen beweisen und filtern gleichzeitig. Sie sind mehr wert als drei zusätzliche Bilder.

### C3 · Bildunterschriften

- [ ] **Ein Satz pro gezeigtem Bild** — erzählend, nicht beschreibend

> Nicht: *„BMW E30 auf einer Wiese"*
> Sondern: *„Der Besitzer hat sechs Jahre daran geschraubt. Das Licht hatten wir zwölf Minuten."*
>
> Billigster Premium-Hebel der ganzen Seite. Kostet ihn eine Minute pro Bild und hebt das Ergebnis sofort über jede Konkurrenzseite.

### C4 · Bildmaterial in Originalqualität

- [ ] **Auswahl als Originaldateien** liefern, nicht als Instagram-Export
- [ ] Format: JPEG in höchster Qualität oder TIFF, **mindestens 2400 px lange Kante**, sRGB-Farbprofil
- [ ] Benennung: `projektname-01.jpg`, `projektname-02.jpg` … (fortlaufend, in gewünschter Reihenfolge)
- [ ] Pro Projekt in einem eigenen Ordner

> Instagram komprimiert stark und beschneidet auf feste Formate. Für Vollbild-Darstellung auf großen Monitoren reicht das nicht.

### C5 · Hero-Bewegtbild & Showreel

Unter dem Hero ist jetzt ein gerahmter Platz für ein Showreel eingebaut — darauf legt die Seite sichtbar Wert. Es kann derselbe Clip sein wie das Hero-Bewegtbild oder ein eigener Zusammenschnitt (30–60 s).

- [ ] **10–15 Sekunden**, ohne Ton, nahtlos loopbar
- [ ] **Zwei Schnitte:** quer (16:9) für Desktop, hoch (9:16) für Mobil
- [ ] Format: MP4 (H.264), maximal 1920 px breit, Ziel unter 3 MB

> Das ist das erste, was jeder Besucher sieht. Es sollte das Beste sein, was er hat — und zu den Kunden passen, die er gewinnen will. Ein Kartsport-Clip spricht andere Kunden an als eine Werkhallen-Fahrt.

### C6 · Portrait

- [ ] **Ein gutes Portrait von ihm**, von jemand anderem fotografiert
- [ ] Quer und hoch, damit es in beiden Layouts funktioniert

> Er ist auf Instagram und YouTube ständig selbst vor der Kamera und wirkt dort sehr natürlich — das ist ein großer Vorteil. Für die Website braucht es trotzdem ein bewusst gesetztes Bild, kein Selfie und kein Standbild aus einem Video.

### C7 · Behind-the-Scenes

- [ ] **15–25 Aufnahmen**, verteilt über die ausgewählten Projekte

> Teilweise vorhanden — im Feed sind Aufnahmen von ihm mit Gimbal, beim Schnitt am Schreibtisch, am Set. Für die Projektseiten braucht es aber **projektbezogenes** Material: BTS aus *diesem* Dreh, nicht allgemeine Arbeitsbilder.
>
> **Ab dem nächsten Auftrag konsequent mitnehmen — Handy reicht.** Rückwirkend ist das nicht herstellbar, und der zweite Akt jeder Projektgeschichte lebt davon.

### C8 · Kontakt- und Rechtsangaben

- [ ] Vollständige Anschrift für das Impressum
- [ ] Geschäftliche E-Mail und Telefonnummer
- [ ] Umsatzsteuer-ID oder Steuernummer, falls vorhanden
- [ ] Gewünschte Domain
- [ ] Verfügbarkeitsstatus für den Start („nehme Projekte ab … an")

---

## STUFE D — kann nach dem Launch kommen

- [ ] **Erste 3 Journal-Einträge** zum Start, damit die Seite nicht leer wirkt. Formate „Das eine Bild" und „Was du nicht siehst" sind am schnellsten gemacht.
- [ ] **Equipment-Liste** für die Über-mich-Seite (Kameras, Objektive, Drohne, Licht, Ton)
- [ ] **Entscheidung zum YouTube-Kanal:** verlinken, einbetten oder weglassen? Der Kanal zeigt Technikwissen und Tutorials — das ist ein starkes Kompetenzsignal gegenüber Firmenkunden. Andererseits ist es Creator-Content, keine Auftragsarbeit. *Empfehlung: dezent auf der Über-mich-Seite verlinken, nicht in der Hauptnavigation.*
- [ ] **Drohnen-Nachweise:** EU-Drohnenführerschein und Betreiber-ID, falls vorhanden. Bei Geschäftskunden ein echtes Vertrauensargument und rechtlich relevant.

---

## Was NICHT geliefert werden muss

Damit die Liste nicht länger wirkt, als sie ist:

- **Keine Logos oder Designs.** Kommt aus dem Konzept.
- **Keine Texte für Impressum und Datenschutz.** Werden erstellt, er liefert nur die Daten (C8).
- **Keine zugeschnittenen oder optimierten Bilder.** Originale reichen, den Rest macht die Website automatisch.
- **Keine SEO-Texte oder Keywords.**
- **Keine Farbkorrektur für die Website.** Seine Bearbeitung ist die Bearbeitung.

---

## Reihenfolge in einem Satz

**Diese Woche:** A1 (Rechte) und B1 (Kundenstimmen) anstoßen — beide hängen von anderen Menschen ab.
**Danach:** A2 bis A5, weil daran die Struktur hängt.
**Parallel, wann immer Zeit ist:** alles unter C.
**Ab sofort bei jedem Dreh:** Behind-the-Scenes mitnehmen (C7).
