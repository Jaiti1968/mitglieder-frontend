# EMC Mitgliederverwaltung – Frontend Developer Guide

**Dokumentstand:** 17.11.2026

**Geprüfte Codebasis:** `mitglieder-frontend(3).zip` (Version `1.2.3` laut dortiger `package.json`)

**Hinweis zur Weiterentwicklung:** Auf dem neuen Branch `feature/BL-009-ehrungen` wurde die Paketversion inzwischen auf `1.3.0-SNAPSHOT` gesetzt. Die hier beschriebenen vorhandenen Funktionen entsprechen weiterhin dem geprüften Stand `1.2.3`; die Frontend-Implementierung von BL-009 steht noch aus.

## 1. Zweck und Dokumentationsgrenzen

Dieses Dokument beschreibt die technische Struktur des Frontends, Entwicklungsregeln und die vorhandenen Mechanismen für API-Zugriff, Formulare und Tests. Es ist kein Benutzerhandbuch und keine Betriebsanleitung.

- `README.md` im Frontend-Repository: Einstieg, Funktionsüberblick und lokaler Schnellstart.
- `README_DEVELOPER.md`: Entwicklungsarchitektur und konkrete Konventionen des Frontends.
- **EMC-DOKUMENTATION**: Anforderungen, Fach- und technische Konzepte, Entscheidungen, Ergebnisdokumente und Projektstand (einschließlich BL-009 bis BL-011).
- **EMC-INFRA**: Infrastruktur, Umgebungen, Konfiguration, Docker/Compose, Deployment, Betrieb und Runbooks.

Betriebsanweisungen werden nicht parallel in diesem Dokument gepflegt. Bei Widersprüchen zu Infrastrukturdetails sind die aktuellen Unterlagen in EMC-INFRA zu prüfen.

## 2. Technologie und Build

| Bereich | Implementierung |
| --- | --- |
| Oberfläche | React 19, JavaScript |
| Build/Entwicklung | Vite 6 |
| Navigation | React Router 7 |
| Serverdaten | TanStack React Query 5 |
| Formulare | React Hook Form 7 |
| Tests | Vitest 4 über `scripts/run-vitest.mjs` |
| Statische Bereitstellung | Docker mit NGINX |

Maßgeblich für die exakten Versionen sind `package.json` und `package-lock.json`.

```bash
npm ci
npm run dev
npm run lint
npm run test:run
npm run build
npm run preview
```

`npm test` ruft ebenfalls das projektspezifische Vitest-Startskript auf. Für einen einmaligen vollständigen Testlauf eignet sich `npm run test:run`.

In `vite.config.js` wird `/api` für die lokale Entwicklung derzeit an `http://localhost:8080` weitergeleitet. Diese Einstellung ist eine Entwicklungsproxy-Konfiguration und keine Beschreibung der NAS-Umgebungen.

## 3. Projektstruktur

```text
src/
├── api/                  # API-Client und fachliche API-Module
├── auth/                 # Session, Login und Routenschutz
├── components/
│   ├── common/           # Gemeinsame UI-Elemente
│   ├── forms/            # Gemeinsame Formularfelder
│   ├── layouts/          # AppLayout
│   ├── members/          # Mitgliederliste und Mitgliederdetails
│   └── reporting/        # Reporting-Komponenten
├── hooks/                # AutoSave, Lookups, Systeminformationen
│   └── forms/
├── pages/                # Seitenkomponenten
├── routes/               # Routen
└── utils/forms/          # Validierung, Payloads, Defaults, Datumshelfer
```

Grundprinzip: Seiten koordinieren Navigation und Datenzugriff, fachliche Komponenten stellen Inhalte dar, Hooks bündeln wiederkehrendes Verhalten, und API-Funktionen kapseln die Backend-Kommunikation.

## 4. Routing und Zugriffsschutz

Routendefinition: `src/routes/AppRoutes.jsx`.

| Route | Zweck |
| --- | --- |
| `/login` | Anmeldung (öffentlich) |
| `/members` | Mitgliederliste |
| `/members/new` | Mitglied anlegen |
| `/members/:mitgliedsnummer` | Mitgliederdetails |
| `/admin/users` | Benutzerverwaltung |
| `/reporting` | Berichtsübersicht und Geburtstagsliste |
| `/reporting/members-directory` | Mitgliederverzeichnis |

`/` leitet auf `/members` um. Die geschützten Seiten liegen unter `ProtectedRoute` und `AppLayout`. Die Geburtstagsliste besitzt keine eigene Route, sondern wird innerhalb des Reporting-Bereichs ausgewählt.

## 5. Authentifizierung und Rollen

Die Anmeldung erfolgt über eine Backend-Session mit Cookie. Zuständig sind `src/auth/AuthContext.jsx`, `ProtectedRoute.jsx` und `useAuth.js`; die Auth-Endpunkte werden über `src/auth/authApi.js` angesprochen.

```http
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

Rollen: `ADMIN`, `EDITOR`, `VIEWER`. `ADMIN` kann die Benutzerverwaltung nutzen; `ADMIN` und `EDITOR` können die vorhandenen Mitgliedsformulare bearbeiten; `VIEWER` erhält eine lesende Darstellung. Reporting wird in der Oberfläche für `ADMIN` angeboten. Maßgeblich für die tatsächlichen Zugriffsrechte ist stets das Backend.

**Entwicklungsregel:** Das Ausblenden von Schaltflächen ersetzt keine serverseitige Autorisierung.

## 6. API-Schicht und Fehlerbehandlung

Die zentralen API-Module befinden sich in `src/api/`:

- `apiClient.js`: `apiGet`, `apiPost`, `apiPut`, gemeinsames Response- und Fehlermanagement.
- `memberApi.js`: Mitgliederdaten.
- `lookupApi.js`: Nachschlagewerte.
- `adminUserApi.js`: Benutzerverwaltung.
- `reportingApi.js`: Berichtsaufrufe.

`authApi.js` liegt im Ordner `src/auth/` und ist daher **nicht** Teil von `src/api/`.

Der gemeinsame Client sendet Requests mit `credentials: "include"`. Bei `204 No Content` liefert er `null`. Bei Fehlerantworten stellt er unter anderem `status`, `requestId` und `validationErrors` bereit; bei `401` erfolgt eine Weiterleitung auf `/login`.

**Aktuelle Grenze:** Eine allgemeine Funktion `apiDelete` ist im geprüften Stand noch nicht vorhanden. Sie wird für BL-009 benötigt.

API-Aufrufe fachlicher Komponenten sollen grundsätzlich über die API-Schicht laufen. Der technische Abruf von `/api/system/info` ist aktuell im Hook `useSystemInfo.js` implementiert und bildet eine bestehende Ausnahme.

## 7. Serverdaten mit React Query

TanStack React Query verwaltet unter anderem Mitglieder-, Lookup-, Benutzer- und Reporting-Daten. Fachliche Mutationen müssen betroffene Abfragen nach erfolgreichem Schreiben aktualisieren beziehungsweise invalidieren.

Serverdaten nicht zusätzlich ohne konkreten Grund in einem globalen lokalen Zustand spiegeln. Lade-, Fehler- und Aktualisierungszustände gehören zur jeweiligen Datenabfrage beziehungsweise Mutation.

## 8. Mitgliederansicht und Formulare

Die Mitgliederdetails werden durch `src/pages/MemberDetailPage.jsx` koordiniert. `MemberTabs.jsx` enthält im geprüften Stand fünf Bereiche:

1. Stammdaten
2. Kontakt
3. Mitgliedschaft
4. Datenschutz
5. Chorkleidung

Die Formulare liegen unter `src/components/members/details/`. Gemeinsame Eingabekomponenten (`FormField`, `SelectField`, `CheckboxField`, `DateField`) liegen unter `src/components/forms/`.

`src/utils/forms/` enthält Validierungsfunktionen, Payload-Erzeugung, Standardwerte und Datumshelfer. Neue Formulare sollten diese Trennung beibehalten. Das Backend bleibt für die verbindliche fachliche Validierung zuständig; die Frontend-Validierung dient zusätzlich einer verständlichen Eingabeführung.

## 9. AutoSave und Schutz vor Datenverlust

Der vorhandene Hook `src/hooks/forms/useAutoSaveForm.js` verwendet React Hook Form und `useWatch`. Der Standard-Debounce beträgt **500 ms**. Er unterstützt unter anderem Validierung, Payload-Erzeugung, Rückmeldungen zu Speicheroperationen und die Zuordnung von Backend-Validierungsfehlern.

Ergänzende Bausteine:

- `useAutoSaveStatus.js`: Anzeige- und Fehlerzustände von Speichervorgängen.
- `useUnsavedChanges.js`: Erkennung und Behandlung ausstehender Änderungen beim Verlassen der Mitgliederseite.
- `UnsavedChangesDialog.jsx`: Bestätigungsdialog bei möglichen Datenverlusten.

**Technische Einschränkungen des geprüften Stands:** Die vorhandene AutoSave-Logik verhindert nicht grundsätzlich parallele bereits gestartete Requests. Änderungen während der Debounce-Wartezeit werden durch den Status-Hook allein nicht vollständig als ausstehend erfasst. Beim Schließen eines einzelnen Bearbeitungsdialogs ist deshalb eine gesonderte Absicherung erforderlich.

Für neue Dialoge ist vor der Wiederverwendung des Hooks zu prüfen, ob laufende Requests, fehlgeschlagene Speicherungen und das Schließen des Dialogs korrekt behandelt werden. Die bestehenden Mitgliedsformulare werden im Rahmen von BL-009 nicht pauschal umgebaut.

## 10. Systeminformationen und Laufzeitumgebung

Die aktuelle Anzeige besteht aus:

- `src/components/common/EnvironmentBadge.jsx`: kompakte Kennzeichnung `LOCAL`, `DEV` oder `PROD`.
- `src/components/common/SystemInfoDialog.jsx`: detaillierte Systeminformationen.
- `src/hooks/useSystemInfo.js`: Abruf und Aktualisierung von `GET /api/system/info`.

Die Umgebungskennung wird anhand der Backend-Antwort geprüft. Der Systeminfo-Dialog kann unter anderem Frontend-/Backend-Version, Build-Zeitpunkte und Backend-Profile anzeigen. Die Frontend-Version und Build-Zeit werden über `vite.config.js` aus der Paketversion beziehungsweise dem Build-Zeitpunkt eingebettet:

```javascript
import.meta.env.VITE_APP_VERSION
import.meta.env.VITE_APP_BUILD_TIME
```

Die frühere Darstellung von Proxy-Zielen und technischen Verbindungsdetails im allgemeinen Umgebungsindikator ist **nicht** mehr der aktuelle Stand. Angaben zur betrieblichen Zuordnung von LOCAL/DEV/PROD stehen in EMC-INFRA; Anforderungen und Entscheidungen zur Anzeige in EMC-DOKUMENTATION (BL-019).

## 11. Reporting

Vorhanden sind die Reporting-Übersicht, das Mitgliederverzeichnis und die Geburtstagsliste. Das Mitgliederverzeichnis unterstützt PDF- und Excel-Export; die Geburtstagsliste PDF-Export.

Die Implementierung verteilt sich auf `src/pages/`, `src/components/reporting/` und `src/api/reportingApi.js`. Fachliche Regeln, Berichtsumfang und Umsetzungsergebnisse sind in EMC-DOKUMENTATION unter BL-012/BL-020 beschrieben.

## 12. Automatisierte Tests

Die Frontend-Tests verwenden Vitest und konzentrieren sich im geprüften Stand auf Formularvalidierung und Hilfsfunktionen, insbesondere `validationHelpers`, `dateHelpers` sowie die Validatoren für Stammdaten, Mitgliedschaft, Kontakt, Datenschutz und Chorkleidung.

```bash
npm run test:run
npm run lint
npm run build
```

Eine feste Anzahl erfolgreicher Tests wird nicht dokumentiert: Der jeweils aktuelle Testlauf ist maßgeblich. Für neue Funktionen sind geeignete Tests der fachlichen Logik und, soweit erforderlich, der API-Interaktion und Dialogzustände zu ergänzen.

## 13. Entwicklungsworkflow und Versionierung

Änderungen erfolgen auf dafür vorgesehenen Git-Branches, beispielsweise `feature/BL-009-ehrungen`. Vor einem Commit sollten Tests und Build entsprechend der Änderung geprüft werden. Merge, Image-Erstellung und Deployment erfolgen als gesonderte Arbeitsschritte.

Die Version wird in `package.json` geführt und von Vite zur Build-Zeit eingebettet. `npm version <version> --no-git-tag-version` aktualisiert die Paketversion ohne Git-Tag; bei vorhandenem Lockfile wird dieses mit angepasst.

Aktueller Kontext:

- Geprüfter und dokumentierter Funktionsstand: `1.2.3`.
- Neuer Entwicklungsbranch für BL-009: `feature/BL-009-ehrungen`, Paketversion `1.3.0-SNAPSHOT`.
- Die README-Dateien werden nach Implementierung und Prüfung der Ehrungen erneut auf den dann erreichten Funktionsstand gebracht.

## 14. Docker und Betrieb

Das Repository enthält Docker- und NGINX-Konfigurationen für die Frontend-Bereitstellung. Die Anwendung wird im Container über NGINX ausgeliefert. Für konkrete Build-Plattformen, Image-Tags, NAS-Zielumgebungen, Compose-Dateien, Rollback und Deployment-Abläufe ist **EMC-INFRA** maßgeblich.

In diesem Dokument werden bewusst keine möglicherweise veralteten Image-Build- oder Portainer-Anweisungen dupliziert.

## 15. Abgrenzung und nächste Entwicklung

**BL-009 Ehrungen ist im geprüften Frontend noch nicht implementiert.** Für die anstehende Umsetzung gelten das freigegebene `BL-009-frontend-konzept-v0.1.md` und die Anforderungen `BL-009-ehrungen-v0.2.md` in EMC-DOKUMENTATION.

Vorgesehen sind ein Ehrungsreiter, die Ehrungsliste, ein Anlegedialog mit explizitem Speichern, ein Bearbeitungsdialog mit abgesichertem AutoSave und eine bestätigungspflichtige Löschfunktion. Die Sortierung liefert das Backend. Bei Ehrungen ist dieselbe Ehrungsart pro Mitglied nur einmal zulässig; für BL-010 Funktionen gelten andere fachliche Regeln.

BL-010 Funktionen und BL-011 Verteiler sind ebenfalls **keine vorhandenen Frontend-Funktionen** dieses dokumentierten Stands. Gemeinsame UI-Bausteine können später wiederverwendet werden, die fachlichen Prüfungen bleiben getrennt.

Weitere technische Erweiterungen und ihre Priorisierung werden in EMC-DOKUMENTATION geführt und nicht durch diese README neu beschlossen.
