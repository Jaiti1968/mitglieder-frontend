# EMC Mitgliederverwaltung – Frontend

React-Frontend für die browserbasierte Mitgliederverwaltung des EMC Männerchors.

Die Anwendung stellt eine Bedienoberfläche für Mitgliederliste, Suche, Filter, Detailbearbeitung und Neuanlage bereit. Sie kommuniziert ausschließlich über REST-Endpunkte mit dem Spring-Boot-Backend. Ein direkter Datenbankzugriff aus dem Frontend findet nicht statt.

---

## Inhaltsverzeichnis

1. [Projektüberblick](#projektüberblick)
2. [Funktionsumfang](#funktionsumfang)
3. [Technologie-Stack](#technologie-stack)
4. [Projektstruktur](#projektstruktur)
5. [Routing](#routing)
6. [Authentifizierung](#authentifizierung)
7. [API-Kommunikation](#api-kommunikation)
8. [Seiten und Komponenten](#seiten-und-komponenten)
9. [Formulararchitektur](#formulararchitektur)
10. [Validierungskonzept](#validierungskonzept)
11. [Datums- und Payload-Konzept](#datums--und-payload-konzept)
12. [Auto-Save und Speicherstatus](#auto-save-und-speicherstatus)
13. [Unsaved-Changes-Schutz](#unsaved-changes-schutz)
14. [Fehlerbehandlung](#fehlerbehandlung)
15. [Setup und Entwicklung](#setup-und-entwicklung)
16. [Build und Deployment](#build-und-deployment)
17. [Qualitätssicherung und Tests](#qualitätssicherung-und-tests)
18. [Backend-Erwartungen](#backend-erwartungen)
19. [Architekturprinzipien](#architekturprinzipien)
20. [Bekannte Hinweise](#bekannte-hinweise)

---

## Projektüberblick

Das Frontend ist eine Single-Page-Application für die Mitgliederverwaltung.

Ziel ist eine klare, wartbare Oberfläche für folgende Kernprozesse:

- Mitglieder suchen und filtern
- Mitglieder anzeigen
- Mitglieder neu anlegen
- Stammdaten bearbeiten
- Kontaktdaten bearbeiten
- Mitgliedschaft bearbeiten
- Datenschutzdaten bearbeiten
- Chorkleidung bearbeiten
- Änderungen automatisch speichern
- Validierungsfehler direkt am Formular anzeigen

Die Anwendung ist fachlich in mehrere Bereiche aufgeteilt. Dadurch bleiben Komponenten, Validatoren und Payload-Mapping überschaubar.

---

## Funktionsumfang

### Mitgliederliste

Route:

```text
/members
```

Funktionen:

- Freitextsuche
- Filter nach Mitgliederstatus
- Filter nach Stimme
- Mehrfachauswahl bei Filtern
- Pagination
- Anzeige von Trefferinformationen
- Navigation zur Detailseite
- Navigation zur Neuanlage

Beteiligte Komponenten:

```text
src/pages/MembersPage.jsx
src/components/members/list/MemberFilterPanel.jsx
src/components/members/list/MemberList.jsx
src/components/members/list/Pagination.jsx
src/components/members/list/ResultInfo.jsx
```

---

### Mitglied Detail

Route:

```text
/members/:mitgliedsnummer
```

Funktionen:

- Laden eines Mitglieds über die Mitgliedsnummer
- Anzeige eines Mitgliedskopfs
- Bearbeitung in Tabs
- Auto-Save je Formularbereich
- Speicherstatus je Bereich
- Fehleranzeige je Bereich
- Schutz vor ungespeicherten Änderungen

Fachliche Tabs:

- Stammdaten
- Kontakt
- Mitgliedschaft
- Datenschutz
- Chorkleidung

Beteiligte Komponenten:

```text
src/pages/MemberDetailPage.jsx
src/components/members/details/MemberHeader.jsx
src/components/members/details/MemberTabs.jsx
src/components/members/details/MemberSection.jsx
src/components/members/details/MemberStammdatenForm.jsx
src/components/members/details/MemberContactForm.jsx
src/components/members/details/MemberMembershipForm.jsx
src/components/members/details/MemberDatenschutzForm.jsx
src/components/members/details/MemberChorkleidungForm.jsx
```

---

### Mitglied anlegen

Route:

```text
/members/new
```

Funktionen:

- Eingabe über dieselben Formularbereiche wie in der Detailbearbeitung
- Stammdaten, Kontakt und Mitgliedschaft
- Default-Werte für neue Mitglieder
- Validierung durch die jeweiligen Formularvalidatoren
- POST an das Backend
- Weiterleitung zur Detailseite nach erfolgreicher Anlage

Beteiligte Datei:

```text
src/pages/CreateMemberPage.jsx
```

Hinweis: Datenschutz und Chorkleidung werden im Backend bei der Anlage grundsätzlich mit angelegt beziehungsweise über eigene Detailbereiche gepflegt.

---

## Technologie-Stack

### Laufzeit / Framework

- React 19
- Vite
- JavaScript ES Modules
- React Router DOM
- React Hook Form
- TanStack React Query

### Tooling

- ESLint
- Prettier
- Vite Build

### Kommunikation

- Fetch API über einen zentralen API-Client
- Basic Authentication Header über gespeicherte Zugangsdaten
- REST-Kommunikation mit Spring-Boot-Backend

---

## Projektstruktur

Aktuelle Hauptstruktur:

```text
src/
  api/
    apiClient.js
    lookupApi.js
    memberApi.js

  auth/
    authStorage.js
    ProtectedRoute.jsx

  components/
    common/
      EnvironmentBadge.jsx
      ErrorBox.jsx
      UnsavedChangesDialog.jsx

    forms/
      CheckboxField.jsx
      DateField.jsx
      FormField.jsx
      SelectField.jsx

    layouts/
      AppLayout.jsx

    members/
      details/
        MemberChorkleidungForm.jsx
        MemberContactForm.jsx
        MemberDatenschutzForm.jsx
        MemberHeader.jsx
        MemberMembershipForm.jsx
        MemberSection.jsx
        MemberStammdatenForm.jsx
        MemberTabs.jsx

      list/
        MemberFilterPanel.jsx
        MemberList.jsx
        Pagination.jsx
        ResultInfo.jsx

  hooks/
    forms/
      useAutoSaveForm.js
    useAutoSaveStatus.js
    useUnsavedChanges.js

  pages/
    CreateMemberPage.jsx
    LoginPage.jsx
    MemberDetailPage.jsx
    MembersPage.jsx

  routes/
    AppRoutes.jsx

  utils/
    forms/
      backendErrorMapper.js
      dateHelpers.js
      validationHelpers.js

      defaults/
        chorkleidungDefaults.js
        contactDefaults.js
        datenschutzDefaults.js
        index.js
        membershipDefaults.js
        stammdatenDefaults.js

      payloads/
        chorkleidungPayload.js
        contactPayload.js
        datenschutzPayload.js
        index.js
        membershipPayload.js
        stammdatenPayload.js

      validators/
        chorkleidungValidator.js
        contactValidator.js
        datenschutzValidator.js
        index.js
        membershipValidator.js
        stammdatenValidator.js

  App.jsx
  main.jsx
  styles.css
  TODO.md
```

---

## Routing

Die Routen sind zentral in `src/routes/AppRoutes.jsx` definiert.

```text
/                         -> Redirect nach /members
/login                    -> LoginPage
/members                  -> MembersPage
/members/new              -> CreateMemberPage
/members/:mitgliedsnummer -> MemberDetailPage
```

Die geschützten Routen laufen über:

```text
src/auth/ProtectedRoute.jsx
```

und werden im gemeinsamen Layout gerendert:

```text
src/components/layouts/AppLayout.jsx
```

---

## Authentifizierung

Die Authentifizierung ist bewusst einfach gehalten.

### Speicherung

Datei:

```text
src/auth/authStorage.js
```

Gespeichert werden Benutzername und Passwort im Local Storage unter:

```text
emcAuth
```

Daraus wird bei API-Aufrufen ein Basic-Auth-Header erzeugt:

```text
Authorization: Basic ...
```

### Zugriffsschutz

Datei:

```text
src/auth/ProtectedRoute.jsx
```

Wenn keine Login-Daten vorhanden sind, wird auf `/login` weitergeleitet.

### 401-Verhalten

Bei HTTP 401:

- lokale Authentifizierung wird gelöscht
- Weiterleitung nach `/login`
- Fehler `Nicht autorisiert`

---

## API-Kommunikation

Die API-Kommunikation ist in `src/api` gekapselt.

### Zentraler Client

Datei:

```text
src/api/apiClient.js
```

Exportierte Funktionen:

```js
apiGet(path);
apiPost(path, body);
apiPut(path, body);
```

Aufgaben:

- Authorization Header setzen
- JSON serialisieren
- JSON Antworten parsen
- 204 No Content behandeln
- API-Fehler in JavaScript-Error-Objekte überführen
- Backend-Validierungsfehler verfügbar machen

Fehlerobjekte enthalten, soweit vom Backend geliefert:

```js
status;
error;
path;
requestId;
validationErrors;
body;
```

---

### Mitglieder API

Datei:

```text
src/api/memberApi.js
```

Funktionen:

```js
getMembers({ page, pageSize, search, statusIds, stimmeIds });
getMember(mitgliedsnummer);
createMember(member);
updateStammdaten(mitgliedsnummer, stammdaten);
updateKontakt(mitgliedsnummer, kontakt);
updateMitgliedschaft(mitgliedsnummer, mitgliedschaft);
getDatenschutz(mitgliedsnummer);
updateDatenschutz(mitgliedsnummer, datenschutz);
getChorkleidung(mitgliedsnummer);
updateChorkleidung(mitgliedsnummer, chorkleidung);
```

Wichtige Endpunkte:

```text
GET  /api/members
GET  /api/members/{mitgliedsnummer}
POST /api/members
PUT  /api/members/{mitgliedsnummer}/stammdaten
PUT  /api/members/{mitgliedsnummer}/kontakt
PUT  /api/members/{mitgliedsnummer}/mitgliedschaft
GET  /api/members/{mitgliedsnummer}/datenschutz
PUT  /api/members/{mitgliedsnummer}/datenschutz
GET  /api/members/{mitgliedsnummer}/chorkleidung
PUT  /api/members/{mitgliedsnummer}/chorkleidung
```

Mehrfachfilter werden als mehrfach gesetzte Query-Parameter übertragen:

```text
statusId=1&statusId=4&stimmeId=2&stimmeId=6
```

---

### Lookup API

Datei:

```text
src/api/lookupApi.js
```

Funktionen:

```js
getMemberStatuses();
getVoices();
```

Endpunkte:

```text
GET /api/lookups/member-status
GET /api/lookups/voices
```

---

## Seiten und Komponenten

### `LoginPage.jsx`

Zuständig für die Anmeldung. Nach erfolgreicher Eingabe werden die Zugangsdaten gespeichert und die geschützten Routen sind erreichbar.

---

### `MembersPage.jsx`

Zuständig für die Mitgliederliste.

Typische Aufgaben:

- Query-Parameter für Suche und Filter verwalten
- Mitgliederliste über React Query laden
- Filterdaten laden
- Pagination bedienen
- zur Detailseite navigieren

---

### `MemberDetailPage.jsx`

Zuständig für die Detailbearbeitung.

Typische Aufgaben:

- Mitglied laden
- Datenschutz separat laden
- Chorkleidung separat laden
- Lookup-Daten laden
- Mutations für Auto-Save bereitstellen
- Speicherstatus je Formularbereich verwalten
- Serverfehler den jeweiligen Formularen zuordnen
- Unsaved-Changes-Schutz aktivieren

---

### `CreateMemberPage.jsx`

Zuständig für die Neuanlage.

Die Seite verwendet lokale State-Objekte für:

- Stammdaten
- Kontakt
- Mitgliedschaft

Beim Klick auf „Mitglied anlegen“ wird daraus ein Request-Objekt für `POST /api/members` erzeugt.

---

## Formulararchitektur

Die Formularbereiche folgen demselben Muster:

1. Default-Werte erzeugen
2. React Hook Form initialisieren
3. Backenddaten in Formularwerte transformieren
4. Feldänderungen beobachten
5. Clientseitig validieren
6. Payload für Backend bauen
7. Auto-Save oder lokale Änderung auslösen
8. Backendfehler auf Formularfelder mappen

Beteiligte Bausteine:

```text
src/components/forms/*
src/hooks/forms/useAutoSaveForm.js
src/utils/forms/defaults/*
src/utils/forms/payloads/*
src/utils/forms/validators/*
```

---

### Gemeinsame Formular-Komponenten

#### `FormField.jsx`

Standardkomponente für Textfelder und einfache Inputs.

#### `DateField.jsx`

Spezialisierte Datumskomponente für deutsches Datumsformat.

Verwendetes Anzeigeformat:

```text
TT.MM.JJJJ
```

#### `CheckboxField.jsx`

Wiederverwendbare Checkbox-Komponente.

#### `SelectField.jsx`

Wiederverwendbare Select-Komponente, z. B. für Mitgliederstatus und Stimme.

---

## Validierungskonzept

Die Validierung liegt zentral unter:

```text
src/utils/forms
```

Ziel:

- keine Validierungslogik direkt in Komponenten
- wiederverwendbare Hilfsfunktionen
- formularspezifische Fachregeln
- testbare reine JavaScript-Funktionen

---

### `validationHelpers.js`

Generische Regeln:

- `validateRequired`
- `validateMaxLength`
- `validateEmail`
- `validatePostalCode`
- `validateCompleteDate`
- `validateDateRange`
- `validateNotFutureDate`

Die Funktionen arbeiten mit einem Fehlerarray:

```js
[
  {
    field: "email",
    message: "Bitte eine gültige E-Mail-Adresse eingeben",
  },
];
```

---

### Formularspezifische Validatoren

```text
src/utils/forms/validators/stammdatenValidator.js
src/utils/forms/validators/contactValidator.js
src/utils/forms/validators/membershipValidator.js
src/utils/forms/validators/datenschutzValidator.js
src/utils/forms/validators/chorkleidungValidator.js
```

#### Stammdaten

Wichtige Regeln:

- `personFirma === false`: Vorname ist Pflicht
- Nachname bzw. Firmenname ist Pflicht
- Geburtsdatum nur bei Personen relevant
- PLZ muss optional leer oder exakt 5 Ziffern sein
- verschiedene MaxLength-Regeln

#### Kontakt

Wichtige Regeln:

- E-Mail optional, aber falls gefüllt gültig
- E-Mail maximal 100 Zeichen
- Adresszusatz maximal 50 Zeichen

#### Mitgliedschaft

Wichtige Regeln:

- Eintritt und Austritt müssen bei Eingabe vollständig sein
- Austritt darf nicht vor Eintritt liegen
- Mitgliederstatus ist Pflicht
- Stimme ist Pflicht

#### Datenschutz

Wichtige Regeln:

- Datenschutzdatum muss vollständig sein, falls angegeben
- Datenschutzdatum darf nicht in der Zukunft liegen

#### Chorkleidung

Wichtige Regeln:

- Datumsfelder müssen vollständig sein, falls angegeben
- Übergabe darf nicht in der Zukunft liegen
- Sommerkleidung erhalten darf nicht in der Zukunft liegen
- Rückgabe darf nicht vor Übergabe liegen
- Sommerkleidung-Rückgabe darf nicht vor Erhalt liegen
- Kaufpreis muss eine Zahl sein
- Kaufpreis darf nicht negativ sein

---

## Datums- und Payload-Konzept

Das Frontend trennt bewusst zwischen Anzeigeformat und Backendformat.

### Anzeigeformat im Formular

```text
TT.MM.JJJJ
```

Beispiel:

```text
15.05.2026
```

### Backendformat

```text
YYYY-MM-DD
```

Beispiel:

```text
2026-05-15
```

---

### `dateHelpers.js`

Wichtige Funktionen:

```js
formatIsoDateToGerman(value);
parseGermanDateToIso(value);
normalizeGermanDateInput(value);
isCompleteDate(value);
isDateBefore(firstDate, secondDate);
isDateInFuture(value);
```

---

### Defaults

Default Builder transformieren Backenddaten in Formularwerte.

Pfad:

```text
src/utils/forms/defaults
```

Beispiele:

```js
createStammdatenDefaults(stammdaten);
createMitgliedschaftDefaults(mitgliedschaft);
createKontaktDefaults(kontakt);
createDatenschutzDefaults(datenschutz);
createChorkleidungDefaults(chorkleidung);
```

Aufgabe:

- `null` und `undefined` in leere Formularwerte überführen
- ISO-Datum nach deutschem Datum formatieren
- Checkboxen mit Boolean-Defaults versorgen
- Kaufpreis für die Anzeige formatieren

---

### Payload Builder

Payload Builder transformieren Formularwerte in Backend-DTOs.

Pfad:

```text
src/utils/forms/payloads
```

Beispiele:

```js
createStammdatenPayload(values);
createMitgliedschaftPayload(values);
createKontaktPayload(values);
createDatenschutzPayload(values);
createChorkleidungPayload(values);
```

Aufgabe:

- deutsche Datumswerte in ISO-Datum umwandeln
- IDs in Zahlen konvertieren
- Checkboxwerte als Booleans senden
- leere optionale Datumsfelder als `null` senden
- Kaufpreis in numerischen Wert umwandeln

---

## Auto-Save und Speicherstatus

### `useAutoSaveForm.js`

Pfad:

```text
src/hooks/forms/useAutoSaveForm.js
```

Der Hook kapselt die Auto-Save-Logik für Formularbereiche.

Aufgaben:

- Formularwerte über `useWatch` beobachten
- erstes Rendern ignorieren
- Debounce anwenden
- clientseitige Validierung ausführen
- Payload bauen
- `onChange` bzw. Mutation auslösen
- Serverfehler mappen
- Speicherstatus callbacks aufrufen

Standard-Debounce:

```js
500 ms
```

Chorkleidung verwendet im aktuellen Code einen längeren Debounce:

```js
1500 ms
```

---

### `useAutoSaveStatus.js`

Pfad:

```text
src/hooks/useAutoSaveStatus.js
```

Verwaltet Speicherzustände über Formularbereiche hinweg.

Typische Zustände:

- Speichern läuft
- gespeichert
- Fehler
- ungespeicherte Änderungen

Die Erfolgsmeldung bleibt zeitlich begrenzt sichtbar.

---

## Unsaved-Changes-Schutz

Pfad:

```text
src/hooks/useUnsavedChanges.js
src/components/common/UnsavedChangesDialog.jsx
```

Ziel:

- unbeabsichtigtes Verlassen bei ungespeicherten Änderungen verhindern
- interne Navigation abfangen
- Browser-Navigation absichern
- dem Nutzer einen Dialog anzeigen

Dies ist besonders wichtig bei Auto-Save und bei Feldern, die erst bei Blur/Formatierung stabil gespeichert werden können, z. B. Kaufpreis.

---

## Fehlerbehandlung

### Backendfehler

Pfad:

```text
src/utils/forms/backendErrorMapper.js
```

Funktionen:

```js
mapBackendValidationErrors(error, setError, allowedFields);
hasBackendValidationErrors(error);
```

Aufgabe:

- Backend-Validierungsfehler lesen
- Feldfehler in React Hook Form setzen
- nur erlaubte Felder pro Formularbereich berücksichtigen

Erwartetes Fehlerformat:

```json
{
  "message": "Validierungsfehler",
  "validationErrors": [
    {
      "field": "email",
      "message": "Bitte eine gültige E-Mail-Adresse eingeben"
    }
  ]
}
```

---

### UI-Fehler

Globale und fachliche Fehler werden über gemeinsame Komponenten angezeigt:

```text
src/components/common/ErrorBox.jsx
```

Formularfeldfehler werden direkt am jeweiligen Feld angezeigt.

---

## Setup und Entwicklung

### Voraussetzungen

- Node.js passend zur Vite-/React-Version
- npm
- laufendes Backend oder passender Proxy für `/api/...`

---

### Installation

```bash
npm install
```

---

### Development Server starten

```bash
npm run dev
```

Standardmäßig startet Vite lokal und zeigt die URL im Terminal an.

---

### Lint ausführen

```bash
npm run lint
```

---

### Produktionsbuild erzeugen

```bash
npm run build
```

---

### Build lokal prüfen

```bash
npm run preview
```

---

## Build und Deployment

Der Produktionsbuild wird von Vite in den Ordner `dist/` geschrieben.

```text
dist/
```

Typisches Deployment:

- Build lokal oder in CI erzeugen
- Inhalt von `dist/` in einen Nginx-Container kopieren oder mounten
- Nginx liefert die statischen Dateien aus
- API-Aufrufe gehen an das Spring-Boot-Backend

Beispiel-Ziel im Container:

```text
/usr/share/nginx/html
```

Für SPA-Routing muss Nginx so konfiguriert sein, dass unbekannte Pfade auf `index.html` zurückfallen.

---

## Qualitätssicherung und Tests

Das Frontend enthält ein produktiv eingechecktes Vitest-Setup für Unit Tests.

Aktuelle Scripts in `package.json`:

```json
{
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run"
}
```

Aktuell abgedeckte Testbereiche:

- `validationHelpers`
- `dateHelpers`
- `stammdatenValidator`
- `membershipValidator`
- `contactValidator`
- `datenschutzValidator`
- `chorkleidungValidator`

Aktueller Stand:

**64 erfolgreiche Unit Tests**

Tests im Watch-Modus:

```bash
npm run test
```

Einmaliger Testlauf:

```bash
npm run test:run
```

## Die Tests laufen als reine Unit Tests ohne Browserumgebung.

## Backend-Erwartungen

Das Frontend erwartet ein Spring-Boot-Backend mit REST-Endpunkten unter `/api`.

### Mitgliederliste

```text
GET /api/members?page=1&pageSize=20&search=...&statusId=...&stimmeId=...
```

Erwartet wird eine paginierte Antwort mit Mitgliedsdaten und Pagination-Informationen.

---

### Mitglied Detail

```text
GET /api/members/{mitgliedsnummer}
```

Erwartet werden mindestens die Bereiche:

- `stammdaten`
- `kontakt`
- `mitgliedschaft`

Datenschutz und Chorkleidung werden über eigene Endpunkte geladen.

---

### Teilupdates

```text
PUT /api/members/{mitgliedsnummer}/stammdaten
PUT /api/members/{mitgliedsnummer}/kontakt
PUT /api/members/{mitgliedsnummer}/mitgliedschaft
PUT /api/members/{mitgliedsnummer}/datenschutz
PUT /api/members/{mitgliedsnummer}/chorkleidung
```

---

### Lookups

```text
GET /api/lookups/member-status
GET /api/lookups/voices
```

Erwartetes Format:

```json
[{ "id": 1, "label": "Aktiv" }]
```

---

## Architekturprinzipien

Im Projekt gelten folgende Leitlinien:

- Komponenten enthalten möglichst wenig Fachlogik
- Validierung liegt in zentralen Validatoren
- Datumslogik liegt in `dateHelpers.js`
- Backend-Mapping liegt in Payload Buildern
- Default-Erzeugung liegt in Default Buildern
- API-Zugriff erfolgt nur über den API-Layer
- React Query verwaltet Server State
- React Hook Form verwaltet Formular State
- Auto-Save ist über einen Hook wiederverwendbar
- Backend-Validierungsfehler werden feldbezogen gemappt

---

## Bekannte Hinweise

### Authentifizierung

Die aktuelle Authentifizierung speichert Basic-Auth-Zugangsdaten im Local Storage. Das ist für den aktuellen Projektstand praktikabel, sollte bei späterem produktivem Ausbau aber fachlich und sicherheitstechnisch erneut bewertet werden.

### Tests

Das Projekt enthält produktiv eingecheckte Vitest-Unit-Tests als Bestandteil des aktuellen Master-Stands.

### Dokumentationsstand

Diese README beschreibt den aktuell hochgeladenen Frontend-Masterstand inklusive der aus dem Code erkennbaren Architektur und Funktionen.
