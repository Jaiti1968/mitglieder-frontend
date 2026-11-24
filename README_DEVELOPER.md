# EMC Mitgliederverwaltung – Frontend Developer Guide

**Dokumentstand:** 24.11.2026

**Dokumentierter Entwicklungsstand:** `1.3.0-SNAPSHOT` einschließlich der vollständigen BL-009-Implementierung, der nachträglichen Layoutanpassung der Ehrungsübersicht sowie BUG-004 einschließlich der Nachbesserung zur Payload-Erzeugung bei der Mitgliedsneuanlage.

BL-009 wurde in DEV bereitgestellt und erfolgreich geprüft. Die Nachbesserung zu BUG-004 wurde lokal implementiert und erfolgreich gegen das DEV-Backend geprüft. Die erneute Bereitstellung des Frontends in DEV sowie die Bereitstellung in PROD stehen noch aus.

## 1. Zweck und Dokumentationsgrenzen

Dieses Dokument beschreibt die technische Struktur des Frontends, Entwicklungsregeln und die vorhandenen Mechanismen für API-Zugriff, Formulare und Tests. Es ist kein Benutzerhandbuch und keine Betriebsanleitung.

- `README.md` im Frontend-Repository: Einstieg, Funktionsüberblick und lokaler Schnellstart.
- `README_DEVELOPER.md`: Entwicklungsarchitektur und konkrete Konventionen des Frontends.
- **EMC-DOKUMENTATION**: Anforderungen, Fach- und technische Konzepte, Entscheidungen, Ergebnisdokumente und Projektstand (einschließlich BL-009 bis BL-011).
- **EMC-INFRA**: Infrastruktur, Umgebungen, Konfiguration, Docker/Compose, Deployment, Betrieb und Runbooks.

Betriebsanweisungen werden nicht parallel in diesem Dokument gepflegt. Bei Widersprüchen zu Infrastrukturdetails sind die aktuellen Unterlagen in EMC-INFRA zu prüfen.

## 2. Technologie und Build

| Bereich                  | Implementierung                        |
| ------------------------ | -------------------------------------- |
| Oberfläche               | React 19, JavaScript                   |
| Build/Entwicklung        | Vite 6                                 |
| Navigation               | React Router 7                         |
| Serverdaten              | TanStack React Query 5                 |
| Formulare                | React Hook Form 7                      |
| Tests                    | Vitest 4 über `scripts/run-vitest.mjs` |
| Statische Bereitstellung | Docker mit NGINX                       |

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

| Route                          | Zweck                                  |
| ------------------------------ | -------------------------------------- |
| `/login`                       | Anmeldung (öffentlich)                 |
| `/members`                     | Mitgliederliste                        |
| `/members/new`                 | Mitglied anlegen                       |
| `/members/:mitgliedsnummer`    | Mitgliederdetails                      |
| `/admin/users`                 | Benutzerverwaltung                     |
| `/reporting`                   | Berichtsübersicht und Geburtstagsliste |
| `/reporting/members-directory` | Mitgliederverzeichnis                  |

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

- `apiClient.js`: `apiGet`, `apiPost`, `apiPut`, `apiDelete`, gemeinsames Response- und Fehlermanagement.
- `memberApi.js`: Mitgliederdaten.
- `lookupApi.js`: Nachschlagewerte.
- `adminUserApi.js`: Benutzerverwaltung.
- `reportingApi.js`: Berichtsaufrufe.
- `honorApi.js`: Ehrungen eines Mitglieds lesen, anlegen, bearbeiten und löschen (BL-009).

`authApi.js` liegt im Ordner `src/auth/` und ist daher **nicht** Teil von `src/api/`.

Der gemeinsame Client sendet Requests mit `credentials: "include"`. Bei `204 No Content` liefert er `null`. Bei Fehlerantworten stellt er unter anderem `status`, `requestId` und `validationErrors` bereit; bei `401` erfolgt eine Weiterleitung auf `/login`.

Für BL-009 wird auch die gemeinsame DELETE-Unterstützung der API-Schicht genutzt. Die Ehrungsendpunkte sind mitgliedsbezogen; die verbindliche Prüfung von Berechtigungen und fachlichen Regeln erfolgt im Backend.

API-Aufrufe fachlicher Komponenten sollen grundsätzlich über die API-Schicht laufen. Der technische Abruf von `/api/system/info` ist aktuell im Hook `useSystemInfo.js` implementiert und bildet eine bestehende Ausnahme.

## 7. Serverdaten mit React Query

TanStack React Query verwaltet unter anderem Mitglieder-, Lookup-, Benutzer- und Reporting-Daten. Fachliche Mutationen müssen betroffene Abfragen nach erfolgreichem Schreiben aktualisieren beziehungsweise invalidieren.

Serverdaten nicht zusätzlich ohne konkreten Grund in einem globalen lokalen Zustand spiegeln. Lade-, Fehler- und Aktualisierungszustände gehören zur jeweiligen Datenabfrage beziehungsweise Mutation.

## 8. Mitgliederansicht und Formulare

Die Mitgliederdetails werden durch `src/pages/MemberDetailPage.jsx` koordiniert. `MemberTabs.jsx` enthält im aktuellen Entwicklungsstand sechs Bereiche:

1. Stammdaten
2. Kontakt
3. Mitgliedschaft
4. Datenschutz
5. Chorkleidung
6. Ehrungen (BL-009)

Die Formulare liegen unter `src/components/members/details/`. Gemeinsame Eingabekomponenten (`FormField`, `SelectField`, `CheckboxField`, `DateField`) liegen unter `src/components/forms/`.

`src/utils/forms/` enthält Validierungsfunktionen, Payload-Erzeugung, Standardwerte und Datumshelfer. Neue Formulare sollten diese Trennung beibehalten. Das Backend bleibt für die verbindliche fachliche Validierung zuständig; die Frontend-Validierung dient zusätzlich einer verständlichen Eingabeführung. Für Ehrungen liegen die fachliche Prüfung und Payload-Erzeugung insbesondere in `honorValidator` und `honorPayload`.

### 8.1 Mitgliedsneuanlage (BUG-004)

Die Mitgliedsneuanlage wird durch `src/pages/CreateMemberPage.jsx` koordiniert.

Die Seite hält den gemeinsamen Formularzustand für Stammdaten, Kontakt und Mitgliedschaft. Die einzelnen Formulare übertragen ihre aktuellen Werte über `onFormValuesChange` an die übergeordnete Seite. Dabei müssen auch nachträglich geleerte Felder übertragen werden.

Der Wechsel zwischen den Registerkarten darf weder zu einem Verlust der Eingaben noch zu einer Wiederherstellung zuvor gelöschter Werte führen.

Die registerkartenübergreifende Validierung erfolgt über `validateMemberCreation.js`. Dabei werden die vorhandenen Fachvalidatoren wiederverwendet.

Die Schaltfläche „Speichern“ wird nur bei einem insgesamt gültigen Formularzustand aktiviert. Bei ungültigen Eingaben werden die betroffenen Registerkarten, Feldbezeichnungen und Fehlermeldungen in einem Hinweis an der deaktivierten Schaltfläche angezeigt.

Während der Mitgliedsneuanlage erfolgt kein AutoSave an das Backend. Die Übertragung erfolgt ausschließlich durch ausdrückliches Speichern über `POST /api/members`.

### 8.2 Gemeinsame Payload-Erzeugung

Die Aufbereitung der an das Backend zu übertragenden Daten erfolgt über gemeinsame Payload-Funktionen unter `src/utils/forms/payloads/`.

Für die Mitgliedsneuanlage und die Bearbeitung bestehender Mitglieder werden folgende Funktionen gemeinsam verwendet:

| Datenbereich   | Datei                  | Funktion                        |
| -------------- | ---------------------- | ------------------------------- |
| Stammdaten     | `stammdatenPayload.js` | `createStammdatenPayload()`     |
| Kontakt        | `contactPayload.js`    | `createKontaktPayload()`        |
| Mitgliedschaft | `membershipPayload.js` | `createMitgliedschaftPayload()` |

Die Funktionen werden über `src/utils/forms/payloads/index.js` bereitgestellt.

`CreateMemberPage.jsx` verwendet dieselben Payload-Funktionen wie die jeweiligen bestehenden Mitgliedsformulare mit AutoSave.

Die zuvor in `CreateMemberPage.jsx` vorhandenen lokalen Normalisierungsfunktionen wurden im Rahmen der Nachbesserung zu BUG-004 entfernt. Dadurch entfällt die doppelte Implementierung der Datenaufbereitung.

**Entwicklungskonvention:**

Wird dieselbe fachliche Datenstruktur über unterschiedliche Bedien- oder Speicherwege an das Backend übertragen, ist eine gemeinsame Payload-Funktion zu verwenden.

Die Aufbereitung technischer Datenformate erfolgt getrennt vom Formularzustand und der Formularvalidierung.

Bei Erweiterungen ist zu prüfen, ob bereits vorhandene Payload-Funktionen wiederverwendet werden können. Dies gilt insbesondere für neue Funktionen mit getrennten Dialogen zur Neuanlage und Bearbeitung.

### 8.3 Datumsverarbeitung und API-Datenformate

Die Darstellung und Erfassung von Datumswerten in der Oberfläche ist von deren technischer Übertragung an das Backend zu unterscheiden.

| Verarbeitungsebene    | Belegtes Datumsfeld       | Leeres Datumsfeld |
| --------------------- | ------------------------- | ----------------- |
| Formularzustand       | `15.06.1980`              | `""`              |
| JSON-Payload          | `"1980-06-15"`            | `null`            |
| Backend (`LocalDate`) | entsprechender Datumswert | `null`            |
| Datenbank (`DATE`)    | `1980-06-15`              | SQL-`NULL`        |

Die Umwandlung vom deutschen Anzeigeformat in das ISO-Datumsformat erfolgt über `parseGermanDateToIso()` aus `src/utils/forms/dateHelpers.js` innerhalb der jeweiligen Payload-Funktion.

Nicht belegte optionale Datumsfelder werden als `null` an das Backend übertragen. Leere Strings sind Bestandteil des Formularzustands, nicht das vorgesehene API-Format für Datumsfelder.

Beim Wechsel von Person zu Firma beziehungsweise Organisation wird ein gegebenenfalls zuvor erfasstes Geburtsdatum nicht an das Backend übernommen. Die Stammdaten-Payload enthält in diesem Fall `geburtsdatum: null`.

Lookup-IDs werden durch die jeweilige Payload-Funktion in numerische Werte umgewandelt, sofern sie belegt sind.

Die technische Formatumwandlung ersetzt keine fachliche Validierung. Die Zulässigkeit zukünftiger Datumswerte ist weiterhin vom jeweiligen fachlichen Datenbereich abhängig.

## 9. AutoSave und Schutz vor Datenverlust

Der vorhandene Hook `src/hooks/forms/useAutoSaveForm.js` verwendet React Hook Form und `useWatch`. Der Standard-Debounce beträgt **500 ms**. Er unterstützt unter anderem Validierung, Payload-Erzeugung, Rückmeldungen zu Speicheroperationen und die Zuordnung von Backend-Validierungsfehlern.

Ergänzende Bausteine:

- `useAutoSaveStatus.js`: Anzeige- und Fehlerzustände von Speichervorgängen.
- `useUnsavedChanges.js`: Erkennung und Behandlung ausstehender Änderungen beim Verlassen der Mitgliederseite.
- `UnsavedChangesDialog.jsx`: Bestätigungsdialog bei möglichen Datenverlusten.

**Technische Einschränkungen des geprüften Stands:** Die vorhandene AutoSave-Logik verhindert nicht grundsätzlich parallele bereits gestartete Requests. Änderungen während der Debounce-Wartezeit werden durch den Status-Hook allein nicht vollständig als ausstehend erfasst. Beim Schließen eines einzelnen Bearbeitungsdialogs ist deshalb eine gesonderte Absicherung erforderlich.

Für neue Dialoge ist vor der Wiederverwendung des Hooks zu prüfen, ob laufende Requests, fehlgeschlagene Speicherungen und das Schließen des Dialogs korrekt behandelt werden. Die bestehenden Mitgliedsformulare wurden im Rahmen von BL-009 nicht pauschal umgebaut.

Bei der Mitgliedsneuanlage wird AutoSave nicht für die Übertragung an das Backend verwendet. Die Neuanlage und die Bearbeitung bestehender Mitglieder unterscheiden sich im Speicherzeitpunkt, verwenden jedoch dieselben jeweiligen Payload-Funktionen (siehe Abschnitt 8.2).

Änderungen an gemeinsam verwendeten Payload-Funktionen sind deshalb sowohl hinsichtlich der Mitgliedsneuanlage als auch hinsichtlich der bestehenden AutoSave-Verarbeitung zu prüfen.

### 9.1 Ehrungsdialoge (BL-009)

- **Neuanlage:** `MemberHonorCreateDialog` speichert erst nach ausdrücklichem Klick auf „Speichern“. Die Ehrungsart ist Pflicht; das Datum darf leer bleiben. Abbrechen verwirft die Eingaben.
- **Bearbeitung:** `MemberHonorEditDialog` speichert gültige Änderungen nach einer Verzögerung von 500 ms automatisch. Bereits erfolgreich gespeicherte Änderungen bleiben auch beim Schließen erhalten. Bei einem Speicherfehler ist ein erneuter Versuch möglich; nicht gespeicherte Änderungen werden vor dem Verwerfen durch einen Bestätigungsdialog abgesichert.
- **Löschen:** Vor der Löschung erscheint ein Bestätigungsdialog. Ein fehlgeschlagener Löschversuch lässt den Bearbeitungsdialog geöffnet und kann wiederholt werden.
- **Gemeinsame Dialoge:** `DeleteConfirmationDialog` und `DiscardChangesDialog` unter `src/components/common/` werden für die jeweiligen Bestätigungen verwendet.

Die Ehrungsliste wird durch `MemberHonorsSection` geladen. React Query invalidiert nach erfolgreichen Mutationen die mitgliedsbezogene Ehrungsabfrage, damit die Ansicht aktualisiert wird.

## 10. Systeminformationen und Laufzeitumgebung

Die aktuelle Anzeige besteht aus:

- `src/components/common/EnvironmentBadge.jsx`: kompakte Kennzeichnung `LOCAL`, `DEV` oder `PROD`.
- `src/components/common/SystemInfoDialog.jsx`: detaillierte Systeminformationen.
- `src/hooks/useSystemInfo.js`: Abruf und Aktualisierung von `GET /api/system/info`.

Die Umgebungskennung wird anhand der Backend-Antwort geprüft. Der Systeminfo-Dialog kann unter anderem Frontend-/Backend-Version, Build-Zeitpunkte und Backend-Profile anzeigen. Die Frontend-Version und Build-Zeit werden über `vite.config.js` aus der Paketversion beziehungsweise dem Build-Zeitpunkt eingebettet:

```javascript
import.meta.env.VITE_APP_VERSION;
import.meta.env.VITE_APP_BUILD_TIME;
```

Die frühere Darstellung von Proxy-Zielen und technischen Verbindungsdetails im allgemeinen Umgebungsindikator ist **nicht** mehr der aktuelle Stand. Angaben zur betrieblichen Zuordnung von LOCAL/DEV/PROD stehen in EMC-INFRA; Anforderungen und Entscheidungen zur Anzeige in EMC-DOKUMENTATION (BL-019).

## 11. Reporting

Vorhanden sind die Reporting-Übersicht, das Mitgliederverzeichnis und die Geburtstagsliste. Das Mitgliederverzeichnis unterstützt PDF- und Excel-Export; die Geburtstagsliste PDF-Export.

Die Implementierung verteilt sich auf `src/pages/`, `src/components/reporting/` und `src/api/reportingApi.js`. Fachliche Regeln, Berichtsumfang und Umsetzungsergebnisse sind in EMC-DOKUMENTATION unter BL-012/BL-020 beschrieben.

## 12. Automatisierte Tests

Die Frontend-Tests verwenden Vitest. Neben Formularvalidierung und Hilfsfunktionen (`validationHelpers`, `dateHelpers` und die bisherigen Fachvalidatoren) sind für BL-009 Tests der Ehrungsvalidierung, Payload-Erzeugung, Dialogzustände und API-Mutationsanbindung hinzugekommen.

`MemberHonorsSection.test.jsx` prüft außerdem:

- Die Anzeige des Hinweises „Zukünftiger Termin“ für zukünftige, heutige, vergangene und fehlende Ehrungsdaten.
- Die Position des Zukunftshinweises innerhalb der Ehrungsbeschreibung.
- Die Anzeige der Spaltenüberschriften bei vorhandenen Ehrungen.
- Das Ausblenden der Spaltenüberschriften bei einer leeren Ehrungsliste.

Die optische Ausrichtung der Spalten und das responsive Verhalten wurden zusätzlich im Browser geprüft.

### Regressionstests zu BUG-004

`validateMemberCreation.test.js` prüft die registerkartenübergreifende Formularvalidierung bei der Mitgliedsneuanlage.

Mit `src/pages/__tests__/CreateMemberPage.test.jsx` wird zusätzlich die tatsächliche Seitenkomponente mit den zugehörigen Formularen und gemockter API-Anbindung geprüft.

Die sechs Komponententests decken folgende Fälle ab:

| Testfall | Prüfgegenstand                                                                              |
| -------- | ------------------------------------------------------------------------------------------- |
| T01      | Übertragung von Geburtsdatum, Eintritt und Austritt im ISO-Format                           |
| T02      | Übertragung leerer optionaler Datumsfelder als `null`                                       |
| T03      | Wechsel von Person zu Firma einschließlich Bereinigung personenbezogener Angaben            |
| T04      | Übertragung der voreingestellten Lookup-IDs als numerische Werte                            |
| T05      | Verhinderung der Speicherung bei einem ungültigen Datum                                     |
| T06      | Nachträgliches Leeren von Datumsfeldern und korrekte Übertragung nach Registerkartenwechsel |

Die Tests prüfen den tatsächlich an die API-Funktion übergebenen Request-Payload. Sie verwenden keine reale Backend- oder Datenbankverbindung.

Ergänzend wurden praktische Funktionsprüfungen mit dem lokalen Frontend gegen das DEV-Backend durchgeführt. Diese umfassten die Mitgliedsneuanlage, die Bearbeitung bestehender Stammdaten per AutoSave und die Kontrolle der gespeicherten Datumswerte in der DEV-Datenbank.

```bash
npm run test:run
npm run lint
npm run build
```

**Letzter bestätigter vollständiger Frontend-Testlauf (24.11.2026): 15 Testdateien, 118 Tests bestanden, 0 fehlgeschlagen.**

Dies ist ein dokumentiertes Prüfergebnis und keine dauerhaft garantierte Testanzahl. Für neue Funktionen sind geeignete Tests der fachlichen Logik und, soweit erforderlich, der API-Interaktion und Dialogzustände zu ergänzen.

## 13. Entwicklungsworkflow und Versionierung

Änderungen erfolgen auf dafür vorgesehenen Git-Branches, beispielsweise `feature/BL-009-ehrungen`. Vor einem Commit sollten Tests und Build entsprechend der Änderung geprüft werden. Merge, Image-Erstellung und Deployment erfolgen als gesonderte Arbeitsschritte.

Die Version wird in `package.json` geführt und von Vite zur Build-Zeit eingebettet. `npm version <version> --no-git-tag-version` aktualisiert die Paketversion ohne Git-Tag; bei vorhandenem Lockfile wird dieses mit angepasst.

Aktueller Kontext:

- Aktuelle Paketversion: `1.3.0-SNAPSHOT`.
- BL-009 Ehrungen einschließlich der nachträglichen Layoutanpassung ist vollständig in `master` enthalten.
- Die ursprüngliche Umsetzung von BUG-004 ist ebenfalls Bestandteil dieses Entwicklungsstands.
- BL-009 und die ursprüngliche Umsetzung von BUG-004 wurden in DEV bereitgestellt.
- Bei der anschließenden DEV-Prüfung von BUG-004 wurde ein Fehler bei der Übertragung von Datumswerten während der Mitgliedsneuanlage festgestellt.
- Die Nachbesserung zu BUG-004 wurde lokal implementiert und durch automatisierte Tests sowie praktische Funktionsprüfungen gegen das DEV-Backend abgesichert.
- Die erneute Bereitstellung des Frontends in DEV und der Abschluss der DEV-Abnahme zu BUG-004 stehen noch aus.
- Die Bereitstellung von BL-009 und BUG-004 in PROD steht noch aus.

## 14. Docker und Betrieb

Das Repository enthält Docker- und NGINX-Konfigurationen für die Frontend-Bereitstellung. Die Anwendung wird im Container über NGINX ausgeliefert. Für konkrete Build-Plattformen, Image-Tags, NAS-Zielumgebungen, Compose-Dateien, Rollback und Deployment-Abläufe ist **EMC-INFRA** maßgeblich.

In diesem Dokument werden bewusst keine möglicherweise veralteten Image-Build- oder Portainer-Anweisungen dupliziert.

## 15. BL-009 Ehrungen – Implementierung und Abgrenzung

BL-009 ist im aktuellen Frontend-Entwicklungsstand umgesetzt. Der Ehrungsbereich ist in die Mitgliederdetails integriert und verwendet die bestehende mitgliedsbezogene Navigation; eine eigenständige Route ist nicht erforderlich.

### 15.1 Komponenten und Datenfluss

- `src/api/honorApi.js` kapselt die REST-Aufrufe für die Ehrungszuordnungen eines Mitglieds.
- `MemberHonorsSection.jsx` lädt die Zuordnungen mit React Query und zeigt Ehrungsart und Verleihungsdatum an. Sie öffnet die Anlage- und Bearbeitungsdialoge und stößt die Mutationen an.
- `MemberHonorCreateDialog.jsx` und `MemberHonorEditDialog.jsx` behandeln Neuanlage und Bearbeitung mit unterschiedlichem Speicherverhalten (siehe Abschnitt 9.1).
- `honorValidator` und `honorPayload` bilden Frontend-Prüfungen und API-Nutzdaten ab. Die verbindlichen Regeln prüft das Backend.

Die Anzeige folgt der vom Backend gelieferten Reihenfolge: Ehrungsdatum absteigend, bei gleichem Datum Ehrungsart-ID aufsteigend, fehlende Daten zuletzt.

Für Ehrungsdaten nach dem aktuellen Tag erscheint „Zukünftiger Termin“ unterhalb der Ehrungsbezeichnung. Der Hinweis ist nicht persistiert; eine automatische Aktualisierung um Mitternacht ohne Neuladen ist nicht erforderlich.

#### Darstellung der Ehrungsübersicht

Die Ehrungsübersicht verwendet ein spaltenorientiertes Kartenlayout mit den Überschriften „Ehrung“ und „Verliehen am“. Die Spaltenüberschriften werden nur bei vorhandenen Ehrungszuordnungen angezeigt.

Das Layout wird in `styles.css` über CSS Grid umgesetzt:

- `.honor-list`: Container der Ehrungsliste mit einer maximalen Breite von 750 px.
- `.honor-list-header`: gemeinsame Spaltenüberschriften.
- `.honor-card`: einzelne Ehrungszeile unter Wiederverwendung des allgemeinen Kartenlayouts `.member-card`.
- `.honor-card-description`: Ehrungsbezeichnung und gegebenenfalls Zukunftshinweis.
- `.honor-card-name`: Ehrungsbezeichnung.
- `.honor-card-future`: ergänzender Hinweis auf einen zukünftigen Termin.
- `.honor-card-date`: linksbündige Anzeige des Verleihungsdatums.

Die CSS-Variable `--honor-columns` definiert ein gemeinsames Spaltenraster für Überschriften und Ehrungszeilen. Die Datumsspalte verwendet regulär 25 % der verfügbaren Rasterbreite. Bei Bildschirmbreiten bis 550 px wird sie auf 7,5 rem festgelegt.

Spaltenüberschriften und Eintragswerte verwenden dieselbe Schriftgröße. Der Zukunftshinweis wird als ergänzende Information kleiner dargestellt.

Das Darstellungskonzept dient auch als Orientierung für BL-010 Funktionen. Eine gemeinsame React-Komponente für beide Bereiche wurde bislang bewusst nicht eingeführt.

### 15.2 Fachliche Regeln und Zugriff

Eine Ehrungsart darf pro Mitglied nur einmal zugeordnet sein. Das Ehrungsdatum ist optional und darf auch in der Zukunft liegen. Eine bestehende Zuordnung kann geändert oder nach Bestätigung gelöscht werden. `ADMIN` und `EDITOR` erhalten Schreibaktionen, `VIEWER` eine reine Leseansicht. Die Rollenprüfung wird zusätzlich im Backend erzwungen.

Während der Übergangsphase nutzen Access und Webanwendung dieselben Ehrungsdaten. Die Kompatibilität wurde in beide Richtungen praktisch geprüft.

Eine nachträgliche Datenbank-Bestandsaufnahme hat unterschiedliche Schema-Constraints zwischen DEV/TEST und PROD ergeben. DEV und TEST sichern die Pflichtangabe der Ehrungsart und die Eindeutigkeit der Kombination aus Mitglied und Ehrungsart bereits auf Datenbankebene ab.

Die Angleichung der PROD-Datenbank wurde vorbereitet und in EMC-DOKUMENTATION unter `BL-009-datenbank-schemaangleichung-v0.1.md` dokumentiert. Sie wurde noch nicht ausgeführt. Die bestehenden Fremdschlüsselregeln bleiben unverändert.

Aus der Schemaangleichung ergibt sich nach erfolgter Prüfung kein erforderlicher Änderungsbedarf an der Frontend-Implementierung.

### 15.3 Offene Arbeiten

Die Implementierung und die lokale fachliche Abnahme einschließlich der nachträglichen Layoutanpassung sind abgeschlossen. Sämtliche Frontend-Änderungen zu BL-009 sind in `master` enthalten.

Die kontrollierte Bereitstellung und Funktionsprüfung von BL-009 in DEV erfolgten am 24.11.2026 erfolgreich.

Noch ausstehend sind:

- Praktische Erprobung der vorbereiteten SQL-Änderungs- und Rückfallskripte.
- Angleichung des PROD-Datenbankschemas nach gesonderter Freigabe.
- Kontrollierte Bereitstellung und Funktionsprüfung in PROD.
- Fortschreibung der Versions- und Änderungsdokumentation entsprechend dem tatsächlichen Bereitstellungsstand.

Details und Abnahmeergebnisse stehen in den Ergebnisdokumenten zu BL-009 in EMC-DOKUMENTATION.

BL-010 Funktionen und BL-011 Verteiler sind **nicht** Teil der BL-009-Implementierung. Gemeinsame UI-Bausteine können später wiederverwendet werden, die fachlichen Regeln bleiben getrennt; insbesondere darf die Eindeutigkeitsregel für Ehrungen nicht auf Funktionen übertragen werden.

Weitere technische Erweiterungen und ihre Priorisierung werden in EMC-DOKUMENTATION geführt und nicht durch diese README neu beschlossen.
