# EMC Mitgliederverwaltung – Frontend

**Stand der Dokumentation:** 20.11.2026

**Grundlage:** bisher geprüfte Codebasis und abgeschlossene BL-009-Umsetzung mit erfolgreichen Tests vom 20.11.2026

**Version laut letztem Testlauf (`npm run test:run`):** `1.3.0-SNAPSHOT`

## Zweck und Projektstand

Dieses Repository enthält die webbasierte Benutzeroberfläche der EMC Mitgliederverwaltung für den Erfurter Männerchor 1890 e. V. Das Frontend basiert auf React und Vite und greift über eine REST-API auf das Java-/Spring-Boot-Backend zu.

Im vorliegenden Code umgesetzt:

- Anmeldung und Abmeldung mit serverseitiger Session sowie Wiederherstellung der Anmeldung beim Start
- Mitgliederliste mit Suche, Filtern und Seitennavigation
- Mitgliedsneuanlage und Mitgliederdetailansicht mit den Bereichen Stammdaten, Kontakt, Mitgliedschaft, Datenschutz, Chorkleidung und Ehrungen
- Automatisches Speichern in den vorhandenen Detailformularen; bei Ehrungen ausdrücklich bestätigte Neuanlage und AutoSave beim Bearbeiten
- Rollenabhängige Bedienung (`ADMIN`, `EDITOR`, `VIEWER`) und administrative Benutzerverwaltung
- Reporting: Mitgliederverzeichnis mit PDF- und Excel-Export sowie Geburtstagsliste mit PDF-Export
- Kennzeichnung der Laufzeitumgebung und Dialog mit technischen Systeminformationen

**Abgrenzung:** BL-009 Ehrungen ist im Frontend und Backend implementiert und lokal geprüft; Commit, Merge und kontrolliertes Deployment stehen noch aus. BL-010 Funktionen und BL-011 Verteiler sind nicht Bestandteil dieses Stands. Die Pflege der Ehrungsarten selbst erfolgt weiterhin außerhalb der Weboberfläche. Weitere geplante Funktionen sind in EMC-DOKUMENTATION beschrieben.

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

Maßgeblich ist der jeweils aktuelle Testlauf. Am 20.11.2026 bestanden 110 Frontend-Tests in 14 Testdateien. Neben Formularvalidierung und Hilfsfunktionen werden für BL-009 auch Ehrungs-Payloads, Dialogverhalten, AutoSave, Löschfehler und die Kennzeichnung zukünftiger Termine geprüft.

**Hinweis:** Konfigurationswerte, Protokolle und Konsolenausgaben können Zugangsdaten enthalten. Solche Informationen vor einer Weitergabe schwärzen.

## Anwendung und Berechtigungen

Die wichtigsten Routen sind:

| Route | Funktion |
| --- | --- |
| `/login` | Anmeldung |
| `/members` | Mitgliederübersicht |
| `/members/new` | Mitglied anlegen |
| `/members/:mitgliedsnummer` | Mitgliederdetails |
| `/admin/users` | Benutzerverwaltung |
| `/reporting` | Auswahl und Anzeige der verfügbaren Berichte |
| `/reporting/members-directory` | Mitgliederverzeichnis als eigene Route |

Die Geburtstagsliste wird innerhalb von `/reporting` ausgewählt; für sie ist in `AppRoutes.jsx` keine eigene Route definiert.

Die Anwendung kennt die Rollen `ADMIN`, `EDITOR` und `VIEWER`. Die Mitgliederbearbeitung ist für `ADMIN` und `EDITOR` vorgesehen; `VIEWER` erhält eine lesende Oberfläche. Benutzerverwaltung und Reporting-Navigation werden nur für `ADMIN` angeboten. Die verbindliche Berechtigungsprüfung erfolgt im Backend, nicht allein über ausgeblendete Bedienelemente.

## Ehrungen (BL-009)

In den Mitgliederdetails können `ADMIN` und `EDITOR` Ehrungen anzeigen, anlegen, bearbeiten und nach Bestätigung löschen. `VIEWER` kann Ehrungen ausschließlich ansehen. Die Berechtigungen werden zusätzlich im Backend durchgesetzt.

Bei der **Neuanlage** wird erst mit „Speichern“ übernommen; „Abbrechen“ verwirft die Eingaben. Bei der **Bearbeitung** werden gültige Änderungen nach einer kurzen Verzögerung automatisch gespeichert (AutoSave, 500 ms). Bereits erfolgreich gespeicherte Änderungen bleiben beim Schließen erhalten. Bei einem Speicherfehler kann erneut gespeichert oder das Verwerfen noch nicht gespeicherter Änderungen bestätigt werden.

Das Verleihungsdatum ist optional und darf in der Zukunft liegen. Zukünftige Daten werden mit „Zukünftiger Termin“ gekennzeichnet; am Termintag entfällt der Hinweis. Eine automatische Aktualisierung um Mitternacht ohne erneutes Laden ist nicht vorgesehen. Pro Mitglied darf jede Ehrungsart nur einmal vergeben werden. Die Liste ist nach Verleihungsdatum absteigend sortiert; undatierte Ehrungen stehen zuletzt.

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

| Bericht | Anzeige und Ausgabe |
| --- | --- |
| Mitgliederverzeichnis | Browseransicht, PDF und Excel |
| Geburtstagsliste | Browseransicht mit Monatsgruppierung und Kennzeichnung runder Geburtstage, PDF |

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

Diese README dokumentiert den **lokal implementierten und geprüften Stand** einschließlich BL-009. Noch nicht umgesetzte Funktionen werden erst nach ihrer tatsächlichen Integration als vorhanden aufgeführt.
