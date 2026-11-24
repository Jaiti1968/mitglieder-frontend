# EMC Mitgliederverwaltung – Frontend

**Stand der Dokumentation:** 24.11.2026

**Grundlage:** geprüfte Codebasis einschließlich BL-009 Ehrungen, der nachträglichen Layoutanpassung sowie BUG-004 einschließlich der Nachbesserung zur Payload-Erzeugung bei der Mitgliedsneuanlage

**Version laut letztem Testlauf:** `1.3.0-SNAPSHOT`

## Zweck und Projektstand

Dieses Repository enthält die webbasierte Benutzeroberfläche der EMC Mitgliederverwaltung für den Erfurter Männerchor 1890 e. V. Das Frontend basiert auf React und Vite und greift über eine REST-API auf das Java-/Spring-Boot-Backend zu.

Im vorliegenden Code umgesetzt:

- Anmeldung und Abmeldung mit serverseitiger Session sowie Wiederherstellung der Anmeldung beim Start
- Mitgliederliste mit Suche, Filtern und Seitennavigation
- Mitgliedsneuanlage und Mitgliederdetailansicht mit den Bereichen Stammdaten, Kontakt, Mitgliedschaft, Datenschutz, Chorkleidung und Ehrungen
- Registerkartenübergreifende Formularvalidierung und Zustandsübertragung bei der Mitgliedsneuanlage sowie gemeinsame Payload-Erzeugung für Neuanlage und bestehende Mitgliedsformulare (BUG-004)
- Automatisches Speichern in den vorhandenen Detailformularen; bei Ehrungen ausdrücklich bestätigte Neuanlage und AutoSave beim Bearbeiten
- Rollenabhängige Bedienung (`ADMIN`, `EDITOR`, `VIEWER`) und administrative Benutzerverwaltung
- Reporting: Mitgliederverzeichnis mit PDF- und Excel-Export sowie Geburtstagsliste mit PDF-Export
- Kennzeichnung der Laufzeitumgebung und Dialog mit technischen Systeminformationen

**Abgrenzung:** BL-009 Ehrungen ist im Frontend und Backend vollständig implementiert, fachlich abgenommen und einschließlich der nachträglichen Layoutanpassung in den jeweiligen Master-Stand übernommen. Die Bereitstellung und Funktionsprüfung in DEV sind erfolgt.

Bei der anschließenden DEV-Prüfung von BUG-004 wurde ein Fehler bei der Übertragung von Datumswerten während der Mitgliedsneuanlage festgestellt. Die Nachbesserung wurde lokal implementiert und erfolgreich gegen das DEV-Backend geprüft. Die erneute Bereitstellung des Frontends in DEV steht noch aus.

Die Bereitstellung von BL-009 und BUG-004 in PROD ist noch nicht erfolgt.

BL-010 Funktionen und BL-011 Verteiler sind nicht Bestandteil dieses Stands. Die Pflege der Ehrungsarten selbst erfolgt weiterhin außerhalb der Weboberfläche. Weitere geplante Funktionen sind in EMC-DOKUMENTATION beschrieben.

## Technologie

- React 19, JavaScript, Vite 6
- React Router 7
- TanStack React Query 5
- React Hook Form 7
- Vitest für automatisierte Tests
- Docker/NGINX für die containerisierte Bereitstellung

Die verbindlichen Abhängigkeitsversionen stehen in `package.json` und `package-lock.json`.

## Schnellstart für die lokale Entwicklung

Voraussetzungen sind eine geeignete Node.js-/npm-Installation und ein erreichbares Backend.

```bash
npm ci
npm run dev
```

Die lokale Vite-Konfiguration in `vite.config.js` leitet `/api` derzeit an `http://localhost:8080` weiter. Das Backend muss für API-Funktionen erreichbar sein. Der Entwicklungsserver gibt seine lokale Adresse beim Start aus.

Weitere Befehle:

```bash
npm run test:run   # Vitest einmalig ausführen
npm test           # Vitest über das projektspezifische Startskript
npm run lint       # ESLint
npm run build      # Produktions-Build in dist/
npm run preview    # Lokale Vorschau des Builds
```

Maßgeblich ist der jeweils aktuelle Testlauf. Am 24.11.2026 bestanden 118 Frontend-Tests in 15 Testdateien.

Neben Formularvalidierung und Hilfsfunktionen werden für BL-009 auch Ehrungs-Payloads, Dialogverhalten, AutoSave, Löschfehler, die Kennzeichnung zukünftiger Termine sowie die bedingte Anzeige der Spaltenüberschriften geprüft.

Für BUG-004 wurden zusätzlich Komponententests zur Mitgliedsneuanlage ergänzt. Diese prüfen insbesondere die Übertragung von Datumswerten im ISO-Format, die Verwendung von `null` bei leeren Datumsfeldern, den Wechsel zwischen Person und Firma, die Übertragung numerischer Lookup-IDs und das Speicherverhalten bei ungültigen oder nachträglich geleerten Eingaben.

**Hinweis:** Konfigurationswerte, Protokolle und Konsolenausgaben können Zugangsdaten enthalten. Solche Informationen vor einer Weitergabe schwärzen.

## Anwendung und Berechtigungen

Die wichtigsten Routen sind:

| Route                          | Funktion                                     |
| ------------------------------ | -------------------------------------------- |
| `/login`                       | Anmeldung                                    |
| `/members`                     | Mitgliederübersicht                          |
| `/members/new`                 | Mitglied anlegen                             |
| `/members/:mitgliedsnummer`    | Mitgliederdetails                            |
| `/admin/users`                 | Benutzerverwaltung                           |
| `/reporting`                   | Auswahl und Anzeige der verfügbaren Berichte |
| `/reporting/members-directory` | Mitgliederverzeichnis als eigene Route       |

Die Geburtstagsliste wird innerhalb von `/reporting` ausgewählt; für sie ist in `AppRoutes.jsx` keine eigene Route definiert.

Die Anwendung kennt die Rollen `ADMIN`, `EDITOR` und `VIEWER`. Die Mitgliederbearbeitung ist für `ADMIN` und `EDITOR` vorgesehen; `VIEWER` erhält eine lesende Oberfläche. Benutzerverwaltung und Reporting-Navigation werden nur für `ADMIN` angeboten. Die verbindliche Berechtigungsprüfung erfolgt im Backend, nicht allein über ausgeblendete Bedienelemente.

## Mitgliedsneuanlage und Formularvalidierung (BUG-004)

Die Mitgliedsneuanlage erfolgt über die Registerkarten Stammdaten, Kontakt und Mitgliedschaft. Eingaben bleiben beim Wechsel zwischen den Registerkarten erhalten. Dies gilt auch für nachträglich geleerte Felder.

Die Schaltfläche „Speichern“ ist nur verfügbar, wenn alle relevanten Formularbereiche gültig sind. Bei ungültigen Eingaben informiert ein Hinweis an der deaktivierten Schaltfläche über die betroffenen Registerkarten und Felder.

Die Neuanlage erfolgt ausschließlich durch ausdrückliches Speichern. Die bestehende AutoSave-Funktion bei der Bearbeitung bereits vorhandener Mitglieder bleibt erhalten.

Für die Übertragung der Stammdaten, Kontaktdaten und Mitgliedschaftsdaten an das Backend werden bei Neuanlage und Bearbeitung dieselben jeweiligen Payload-Funktionen verwendet.

Datumswerte werden in der Oberfläche im Format `TT.MM.JJJJ` erfasst und vor der Übertragung in das ISO-Format `YYYY-MM-DD` umgewandelt. Nicht belegte optionale Datumsfelder werden als `null` übertragen.

Die detaillierten technischen Konventionen sind in `README_DEVELOPER.md` beschrieben. Die fachlichen Regeln und Prüfergebnisse zu BUG-004 werden in EMC-DOKUMENTATION geführt.

## Ehrungen (BL-009)

In den Mitgliederdetails können `ADMIN` und `EDITOR` Ehrungen anzeigen, anlegen, bearbeiten und nach Bestätigung löschen. `VIEWER` kann Ehrungen ausschließlich ansehen. Die Berechtigungen werden zusätzlich im Backend durchgesetzt.

Bei der **Neuanlage** wird erst mit „Speichern“ übernommen; „Abbrechen“ verwirft die Eingaben. Bei der **Bearbeitung** werden gültige Änderungen nach einer kurzen Verzögerung automatisch gespeichert (AutoSave, 500 ms). Bereits erfolgreich gespeicherte Änderungen bleiben beim Schließen erhalten. Bei einem Speicherfehler kann erneut gespeichert oder das Verwerfen noch nicht gespeicherter Änderungen bestätigt werden.

Die Ehrungsübersicht verwendet ein einheitliches Spaltenlayout mit den Überschriften „Ehrung“ und „Verliehen am“. Die einzelnen Ehrungen werden als separate, abgerundete und umrandete Zeilen dargestellt. Spaltenüberschriften und Eintragswerte verwenden dieselbe Schriftgröße. Die Spaltenüberschriften werden nur bei vorhandenen Ehrungen angezeigt.

Das Verleihungsdatum ist optional und darf in der Zukunft liegen. Fehlende Datumswerte werden durch einen Gedankenstrich dargestellt. Zukünftige Daten werden mit „Zukünftiger Termin“ unterhalb der Ehrungsbezeichnung gekennzeichnet; am Termintag entfällt der Hinweis. Eine automatische Aktualisierung um Mitternacht ohne erneutes Laden ist nicht vorgesehen.

Pro Mitglied darf jede Ehrungsart nur einmal vergeben werden. Die Liste ist nach Verleihungsdatum absteigend sortiert; bei gleichem Datum erfolgt die Sortierung nach der ID der Ehrungsart aufsteigend. Undatierte Ehrungen stehen zuletzt.

Access und Webanwendung verwenden während der Übergangsphase dieselben Ehrungsdaten. Die gegenseitige Sichtbarkeit von Änderungen wurde praktisch geprüft. Fachliche Regeln und Abnahme sind in EMC-DOKUMENTATION unter BL-009 festgehalten.

## Aufbau des Quellcodes

```text
src/
├── api/                 # API-Client und fachliche API-Funktionen
├── auth/                # Session, Auth-Kontext und geschützte Routen
├── components/
│   ├── common/          # Gemeinsame UI-Bausteine, Systeminformationen
│   ├── forms/           # Wiederverwendbare Formularfelder
│   ├── layouts/         # Anwendungsrahmen
│   ├── members/         # Mitgliederliste und Detailformulare
│   └── reporting/       # Mitgliederverzeichnis und Geburtstagsliste
├── hooks/               # Gemeinsame Hooks, darunter AutoSave
├── pages/               # Seitenkomponenten
├── routes/              # Routen
└── utils/forms/         # Validierung, Datums- und Formularhilfen
```

Detaillierte Entwicklungsregeln, Komponenten und API-Konventionen werden in [`README_DEVELOPER.md`](README_DEVELOPER.md) beschrieben. Diese Datei wird separat an den aktuellen Codebestand angepasst.

## Authentifizierung und API

Die Anmeldung ist sessionbasiert; der Browser verwendet das vom Backend gesetzte Session-Cookie. Es wird kein JWT-basierter Login verwendet.

Wichtige Authentifizierungsendpunkte:

```http
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

Die fachlichen API-Aufrufe sind unter `src/api/` gekapselt. Der gemeinsame API-Client verwendet `credentials: "include"` und verarbeitet auch leere Antworten mit HTTP 204.

## Reporting

Unter `/reporting` können Administratoren zwischen folgenden Berichten wählen:

| Bericht               | Anzeige und Ausgabe                                                            |
| --------------------- | ------------------------------------------------------------------------------ |
| Mitgliederverzeichnis | Browseransicht, PDF und Excel                                                  |
| Geburtstagsliste      | Browseransicht mit Monatsgruppierung und Kennzeichnung runder Geburtstage, PDF |

Die Berichte werden über das Backend erzeugt bzw. mit Daten versorgt. Fachliche Regeln und Reporting-Entscheidungen sind in EMC-DOKUMENTATION beschrieben.

## Laufzeitumgebung und Versionsinformationen

Die Kopfzeile zeigt eine Kennzeichnung der vom Backend gemeldeten Umgebung (`LOCAL`, `DEV` oder `PROD`). Über **Info** öffnet sich ein Dialog mit Systeminformationen, darunter Frontend-Version und Build-Zeit sowie Backend-Version und Backend-Build, soweit verfügbar.

Die Frontend-Version stammt aus `package.json` und wird beim Build über Vite bereitgestellt (`VITE_APP_VERSION`). Auch die Frontend-Build-Zeit wird beim Build gesetzt (`VITE_APP_BUILD_TIME`). Backend-Informationen werden über die vorhandene Systeminfo-Anbindung geladen.

**Wichtig:** `1.3.0-SNAPSHOT` ist die Version des zuletzt getesteten lokalen Frontend-Stands. Daraus lässt sich nicht ableiten, welche Version derzeit auf DEV oder PROD installiert ist.

## Build, Deployment und Betrieb

Der Produktions-Build wird mit `npm run build` erzeugt. Das Projekt enthält ein `Dockerfile` sowie NGINX-Konfigurationen unter `docker/`.

DEV und PROD werden nach dem dokumentierten Betriebsstandard als versionierte Container-Images bereitgestellt. Die konkreten Image-Tags, Compose-Konfigurationen, Deploymentschritte und Betriebsanweisungen werden **nicht** in dieser README doppelt gepflegt.

Maßgeblich sind:

- **EMC-INFRA:** Infrastruktur, Laufzeitumgebungen, Docker-/Compose-Konfiguration, Deployment, Betrieb, Monitoring und Runbooks.
- **EMC-DOKUMENTATION:** Projektsteuerung, Anforderungen, Fach- und Technikkonzepte, Entscheidungen, Teststrategie und Ergebnisdokumente einschließlich BL-009.

Vor einem Release ist insbesondere zu prüfen, ob die Version in `package.json` zum vorgesehenen Build passt. Das Erzeugen eines lokalen Builds ist noch kein Deployment.

## Weiterführende Dokumentation

- [`README_DEVELOPER.md`](README_DEVELOPER.md) – Frontend-Architektur, Entwicklungsregeln und technische Details
- **EMC-DOKUMENTATION** – übergreifende Projekt- und Funktionsdokumentation
- **EMC-INFRA** – verbindliche Infrastruktur- und Betriebsdokumentation

Diese README dokumentiert den lokal implementierten und geprüften Entwicklungsstand einschließlich BL-009 und BUG-004. Der tatsächliche Bereitstellungsstand in DEV und PROD wird gesondert in der Projekt- und Betriebsdokumentation geführt. Noch nicht umgesetzte Funktionen werden erst nach ihrer tatsächlichen Integration als vorhanden aufgeführt.
