# EMC Mitgliederverwaltung – Frontend

**Stand der Dokumentation:** 17.11.2026

**Geprüfte Codebasis:** `mitglieder-frontend(3).zip`

**Version laut `package.json`:** `1.2.3`

## Zweck und Projektstand

Dieses Repository enthält die webbasierte Benutzeroberfläche der EMC Mitgliederverwaltung für den Erfurter Männerchor 1890 e. V. Das Frontend basiert auf React und Vite und greift über eine REST-API auf das Java-/Spring-Boot-Backend zu.

Im vorliegenden Code umgesetzt:

- Anmeldung und Abmeldung mit serverseitiger Session sowie Wiederherstellung der Anmeldung beim Start
- Mitgliederliste mit Suche, Filtern und Seitennavigation
- Mitgliedsneuanlage und Mitgliederdetailansicht mit den Bereichen Stammdaten, Kontakt, Mitgliedschaft, Datenschutz und Chorkleidung
- Automatisches Speichern in den vorhandenen Detailformularen
- Rollenabhängige Bedienung (`ADMIN`, `EDITOR`, `VIEWER`) und administrative Benutzerverwaltung
- Reporting: Mitgliederverzeichnis mit PDF- und Excel-Export sowie Geburtstagsliste mit PDF-Export
- Kennzeichnung der Laufzeitumgebung und Dialog mit technischen Systeminformationen

**Abgrenzung:** BL-009 Ehrungen ist im Backend umgesetzt, im hier geprüften Frontend aber noch nicht integriert. Die Frontend-Arbeiten an BL-009 sowie BL-010 Funktionen und BL-011 Verteiler sind nicht Bestandteil dieses Ist-Stands. Aussagen über weitere geplante Funktionen richten sich nach EMC-DOKUMENTATION.

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

Die Zahl erfolgreicher Tests wird hier bewusst nicht festgeschrieben: Maßgeblich ist der jeweilige aktuelle Testlauf. Die vorhandenen Tests konzentrieren sich auf Formularvalidierung und Hilfsfunktionen.

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

**Wichtig:** Die Version `1.2.3` bezeichnet den Stand des geprüften Frontend-Projekts, nicht automatisch die aktuell auf DEV oder PROD installierte Version.

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

Diese README dokumentiert den **Ist-Stand des vorliegenden Frontend-Codes**. Noch nicht umgesetzte Funktionen werden erst nach ihrer tatsächlichen Integration als vorhanden aufgeführt.
