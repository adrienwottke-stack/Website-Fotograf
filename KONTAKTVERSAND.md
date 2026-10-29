# Kontaktformular: direkter Mailversand

Stand 29.10.2026: lokal implementiert und mit lokalem SMTP-Empfänger geprüft. Adrien hat bestätigt, dass noch kein Versandzugang vorhanden ist. Die reguläre Vorschau sendet deshalb noch keine echten Nachrichten an Sandro. Ein fehlender Zugang ergibt HTTP 503 mit verständlicher Rückmeldung; keine simulierte Erfolgsmeldung.

## Versandzugang anschließen

1. Einen regulären SMTP-Zugang für die Website einrichten. Benötigt werden Host, Port 587 mit STARTTLS oder 465 mit TLS, Benutzername, Passwort und eine vom Anbieter zugelassene Absenderadresse.
2. `.env.example` nach `.env` kopieren und lokal ausfüllen. `.env` ist Git-ignoriert. Auf dem späteren Host die Werte als private Server-Umgebungsvariablen setzen; niemals als `PUBLIC_`-Werte. Keine Zugangsdaten in Chats oder Quellcode schreiben.
3. `CONTACT_TO_EMAIL` kann leer bleiben: Ziel ist dann Sandros bereits vorhandene Kontaktadresse aus `src/data/portfolio.ts`. Die Besucheradresse wird ausschließlich als Reply-To verwendet. Der Browser kann weder Absender noch Empfänger bestimmen.
4. Für die öffentliche Website `CONTACT_ALLOWED_ORIGINS` vor dem Build mit den tatsächlichen Origins füllen, z. B. `https://example.com,https://www.example.com`. Diese Werte konfigurieren auch Astros zulässige Hostnamen. Nach Änderungen neu bauen und Server neu starten. Lokal sind `127.0.0.1` und `localhost` zugelassen.

## Serverbetrieb

Die Inhaltsseiten bleiben vorab erzeugt; `/api/kontakt` braucht eine Node-Laufzeit. Ein reiner Upload statischer Dateien reicht für den Formularversand nicht mehr. Der Adapter ist für einen eigenständigen Node-Server eingerichtet, ohne Entscheidung für einen Hostinganbieter. Bei einer späteren Plattform mit eigenem Astro-Adapter muss die Integration entsprechend angepasst werden.

Mit der hier vorhandenen Node-Version 24:

```powershell
npm run build
$env:HOST='127.0.0.1'
$env:PORT='4321'
npm start
```

`npm start` lädt eine vorhandene lokale `.env`. Für die lokale Vorschau funktioniert weiterhin `npm run preview -- --host 127.0.0.1 --port 4321`. Hinter einem öffentlichen Reverse Proxy müssen Origin/Host und die tatsächliche Client-IP korrekt weitergereicht und untrusted Forwarding-Header verworfen werden. TLS wird vom regulären Hosting/Proxy bereitgestellt. Das Hosting ist noch nicht ausgewählt.

## Betroffene Dateien und Verhalten

- `src/pages/kontakt.astro`: E-Mail-Pflichtfeld und echtes POST-Formular; `data-astro-reload` nimmt es aus Astros Formularnavigation heraus. Ohne JavaScript gibt es eine einfache HTML-Rückmeldung.
- `src/scripts/contact-form.ts`: Versandstatus, gesperrte Taste während des Versands, Eingaben bleiben bei Fehlern erhalten; wiederholte Versuche derselben Anfrage verwenden dieselbe Anfrage-ID.
- `src/pages/api/kontakt.ts` und `src/server/contact.mjs`: private Laufzeit-Konfiguration, Pflichtfeld-/Längenprüfung, 32-KiB-Grenze auch für gestreamte Bodies, Origin-Prüfung, verstecktes Bot-Feld, fünf Versandversuche pro Client und 15 Minuten, SMTP-TLS und feste Empfängeradresse.
- Temporäre Hashes und Anfrage-IDs werden nach 15 Minuten gelöscht. Rate-Limit und Schutz vor doppeltem Versand gelten pro Node-Prozess; bei mehreren Instanzen ist dafür gemeinsamer Speicher nötig. Es gibt keine Formulardatenbank und kein Logging der Nachricht oder Zugangsdaten.
- Bestätigung bedeutet Annahme durch den SMTP-Mailserver. Spamfilter, spätere Unzustellbarkeit und Eingang im tatsächlichen Postfach werden damit nicht bestätigt. Eine Unterbrechung nach SMTP-Annahme kann trotz Wiederholschutz einen unklaren Versandzustand hinterlassen.
- Der Datenschutzentwurf beschreibt den neuen Weg; endgültige Betreiber-/Hosting-/Mailanbieterangaben bleiben offen.

## Kurze Prüfung

`npm run test:contact` prüft tatsächliche SMTP-Übertragung an einen Testserver im eigenen Prozess, Empfänger/Absender/Reply-To/Inhalt, fehlende Konfiguration, ungültige Eingaben, Header-Injection, Bot-Feld, fremde Origin, Größenlimit, doppelte Übertragung, SMTP-Ablehnung, Rate-Limit und HTML-Fallback. Keine Internet-Zustellung.

Für eine manuelle Browserprüfung nach dem Build: `node scripts/contact-smtp-preview.mjs`. Es startet einen lokalen SMTP-Empfänger sowie eine isolierte Vorschau unter `http://127.0.0.1:4339/kontakt/`. Ausschließlich `sandro@example.test` ist als Ziel erlaubt; die letzte Testmail liegt unter `.cache/contact-test/latest.eml`. Beenden mit `stop` oder Strg+C. Die reguläre Vorschau und ihre Konfiguration werden nicht umgestellt.

Prüfbelege: `analyse/2026-10-29-kontaktversand/`. Der Browser-Versand erzeugte genau eine lokal angenommene Mail mit korrektem Projektbetreff und Reply-To. In der regulären Vorschau wurden fehlender SMTP-Zugang, erhaltene Eingaben und erneutes Absenden geprüft, außerdem Mobilansicht ohne horizontalen Überlauf.

Bei der Installation meldet `npm audit` bekannte Sicherheitsbefunde in der vorhandenen Astro-5-Basis und dem dazu kompatiblen Node-9-Adapter. Die vollständige Behebung verlangt einen größeren Framework-/Adapterwechsel; dieser wurde nicht in die Formulariteration aufgenommen. Vor einer öffentlichen Inbetriebnahme ist dieser Stand zu aktualisieren. Der Entwurf läuft weiterhin nur lokal; es erfolgte keine Veröffentlichung.
