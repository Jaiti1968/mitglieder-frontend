# EMC Mitgliederverwaltung Frontend

## Projektüberblick

Das Frontend der EMC Mitgliederverwaltung ist eine Single-Page-Webanwendung zur Verwaltung von Mitgliederdaten. Es kommuniziert mit einem Spring-Boot-Backend über REST APIs und bildet die fachlichen Prozesse rund um Mitgliederpflege, Neuanlage, Suche und Detailbearbeitung ab.

## Ziele

- Verwaltung von Mitgliedern in einer browserbasierten Oberfläche
- Schnelle Suche und Filterung
- Bearbeitung in fachlich getrennten Formularbereichen
- Automatisches Speichern von Änderungen
- Schutz vor unbeabsichtigtem Verlassen bei ungespeicherten Änderungen
- Klare Trennung von UI, Formularlogik, Validierung und API-Kommunikation

---

# Tech Stack

## Framework / Runtime

- React 19
- Vite
- React Router DOM
- React Hook Form
- TanStack React Query

## Qualität / Tooling

- ESLint
- Prettier
- Vitest

## Backend-Anbindung

- REST API (Spring Boot Backend)
- Session-/Basic-Auth abhängig vom Backend-Setup

---

# Projektstruktur

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
    forms/
    layouts/
    members/
      details/
      list/

  hooks/
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
      payloads/
      validators/
```

---

# Architektur

## Routing

### Öffentliche Route

- LoginPage

### Geschützte Routen

Über `ProtectedRoute.jsx`:

- Mitgliederliste
- Mitglied anlegen
- Mitglied bearbeiten

## Layout

`AppLayout.jsx`

- Grundlayout
- Navigation / Seitenrahmen
- gemeinsame Darstellung

---

# API Layer

## apiClient.js

Zentrale HTTP-Kommunikation:

- Basis-Konfiguration
- Header
- Authentifizierungsweitergabe
- Fehlerhandling

## memberApi.js

Mitglieder-Endpunkte:

- Mitgliederliste laden
- Mitglied laden
- Mitglied anlegen
- Teilbereiche aktualisieren

## lookupApi.js

Referenzdaten:

- Mitgliederstatus
- Stimmen
- weitere Select-Daten

---

# Authentifizierung

## authStorage.js

Verantwortlich für:

- Persistenz Login-Daten
- Token / Credentials Speicherung
- Logout-Bereinigung

## ProtectedRoute.jsx

Blockiert Zugriff auf geschützte Seiten ohne Authentifizierung.

---

# Seiten

## MembersPage

Funktion:
Mitgliederübersicht

Features:

- Suche
- Filter
- Paging
- Ergebnisanzeige
- Navigation zu Detailseite
- Navigation zur Neuanlage

Verwendete Komponenten:

- MemberFilterPanel
- MemberList
- Pagination
- ResultInfo

---

## MemberDetailPage

Funktion:
Detailbearbeitung eines Mitglieds

Bereiche:

- Stammdaten
- Kontakt
- Mitgliedschaft
- Datenschutz
- Chorkleidung

Features:

- Laden des Mitglieds
- Lookup-Daten
- Tab-Steuerung
- Autosave
- Fehlerbehandlung
- Unsaved Changes Schutz

---

## CreateMemberPage

Funktion:
Neuanlage eines Mitglieds

Features:

- Default-Werte
- Validierung
- Backend POST
- Navigation nach Erfolg

---

## LoginPage

Authentifizierung für Anwendung.

---

# Komponentenarchitektur

## Common Components

### ErrorBox

Zentrale Fehlerdarstellung

### EnvironmentBadge

Anzeige der aktiven Umgebung

### UnsavedChangesDialog

Dialog bei ungespeicherten Änderungen

---

## Form Components

### FormField

Standard Text-/Input-Komponente

### DateField

Spezialisierte Datumseingabe

- deutsches Datumsformat
- Integration mit RHF

### CheckboxField

Checkbox-Abstraktion

### SelectField

Select-Komponente für Lookup-Werte

---

## Member Detail Forms

### MemberStammdatenForm

Felder:

- Person/Firma
- Vorname
- Nachname/Firmenname
- Anschrift
- PLZ/Ort
- Geburtsdaten / weitere Stammdaten je Backend-Modell

### MemberContactForm

Felder:

- Telefon
- Mobil
- E-Mail
- Adresszusatz etc.

### MemberMembershipForm

Felder:

- Eintritt
- Austritt
- Mitgliederstatus
- Stimme

### MemberDatenschutzForm

Felder:

- Datenschutzdatum / Einwilligungsdaten

### MemberChorkleidungForm

Felder:

- Übergabe
- Rückgabe
- Sommerkleidung
- Kaufpreis

---

# Formulararchitektur

## Prinzip

Jeder Formularbereich folgt derselben Struktur:

1. Default Values
2. React Hook Form
3. Validator
4. Payload Mapping
5. Autosave / Submit Callback

## Defaults

Unter:
`src/utils/forms/defaults`

Beispiele:

- createStammdatenDefaults
- createMembershipDefaults
- createContactDefaults

## Payload Builder

Unter:
`src/utils/forms/payloads`

Aufgabe:
Frontend-Modell → Backend DTO

## Validatoren

Unter:
`src/utils/forms/validators`

Aufgabe:
fachliche Validierung ohne UI-Abhängigkeit

---

# Validierungskonzept

## validationHelpers.js

Generische Regeln:

- Required
- MaxLength
- Email
- Postal Code
- Complete Date
- Date Range
- Not Future Date

## dateHelpers.js

Datumslogik:

- Vollständigkeit
- Datumsvergleich
- Zukunftsprüfung

## Fachvalidatoren

- stammdatenValidator
- contactValidator
- membershipValidator
- datenschutzValidator
- chorkleidungValidator

Designziel:
Keine Businesslogik in Komponenten.

---

# State Management

## React Hook Form

Für Formularzustand:

- register
- Controller
- validation state
- dirty state
- reset
- setError

## React Query

Für Serverkommunikation:

- Queries
- Mutations
- Caching
- Refetching

---

# Custom Hooks

## useAutoSaveStatus

Verantwortung:
Statusmodell für Speichern

Typische States:

- saving
- saved
- error
- unsaved

## useUnsavedChanges

Verhindert unbeabsichtigtes Verlassen:

- Browser Navigation
- interne Navigation
- Dialogintegration

---

# Fehlerbehandlung

## Backend Fehler

Mapping über:
`backendErrorMapper.js`

Ziel:
Backend Validation Errors → RHF Fehler

## UI Fehler

Anzeige über:

- ErrorBox
- Formularfeldfehler

---

# Datenfluss

## Bearbeitung Mitglied

1. MemberDetailPage lädt Mitglied
2. Daten werden in Formular transformiert
3. RHF verwaltet State
4. Validator prüft
5. Payload Builder erstellt DTO
6. Mutation sendet Update
7. UI aktualisiert Status

## Neuanlage

1. Default Model
2. Eingabe
3. Validierung
4. DTO Mapping
5. POST
6. Redirect

---

# Entwicklung

## Installation

```bash
npm install
```

## Development Server

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Tests

Watch-Modus:

```bash
npm run test
```

Einmaliger Lauf:

```bash
npm run test:run
```

---

# Backend Erwartungen

Das Frontend erwartet ein kompatibles Spring-Boot-Backend mit:

## Mitglieder API

Beispiel:

- GET /api/members
- GET /api/members/{id}
- POST /api/members
- PUT/PATCH Teilupdates

## Lookup API

- Mitgliederstatus
- Stimmen

## Fehlerformat

Validierungsfehler sollten feldbezogen zurückgegeben werden.

---

# Deployment

Geeignet für:

- statisches Vite Build Deployment
- nginx
- Docker
- Reverse Proxy Setup

Build Output:

```text
dist/
```

Beispiel nginx root:

```text
/usr/share/nginx/html
```

---

# Qualitätsstatus

Aktueller Stand:

- strukturierte Formulararchitektur
- zentrale Validatoren
- zentrale Payload Builder
- Lookup API Trennung
- Routing Protection
- produktiv integrierte Vitest Unit Tests
- 64 erfolgreiche Unit Tests

Abgedeckte Testbereiche:

- validationHelpers
- dateHelpers
- stammdatenValidator
- membershipValidator
- contactValidator
- datenschutzValidator
- chorkleidungValidator

Empfohlene nächste Schritte:

- Component Tests
- Integration Tests
- API Mock Tests
- CI Pipeline

---

# Architekturprinzipien

Projektentscheidungen:

- Fachlogik nicht in Komponenten
- Validatoren separat
- Payload Mapping separat
- RHF für Formulare
- React Query für Serverstate
- Wiederverwendbare Form-Komponenten
- geschützte Routen
- explizite Fehlerbehandlung

---

# Hinweise

Die Dokumentation beschreibt den aktuellen Frontend-Masterstand. Backend-Verträge müssen synchron zur Backend-Implementierung gehalten werden.
