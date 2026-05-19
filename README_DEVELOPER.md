# EMC Mitgliederverwaltung – Frontend Developer Guide

## Zweck

Dieses Dokument beschreibt die technische Architektur und Entwicklungsrichtlinien des Frontends.

Zielgruppe:

- Frontend-Entwicklung
- Backend-Entwicklung mit Frontend-Schnittstellenbezug
- technische Weiterentwicklung

Dieses Dokument ist kein Benutzerhandbuch.

---

# Technologie Stack

## Core

- React 19
- Vite
- JavaScript

## Routing

- React Router

## State / Server State

- TanStack React Query

## Formulare

- React Hook Form

## Tests

- Vitest

## Deployment

- Docker

---

# Architekturüberblick

Grundstruktur:

```text
Pages
→ Feature Components
→ Shared Components
→ Hooks
→ API Layer
→ Spring Boot Backend
```

Designprinzipien:

- klare Verantwortlichkeiten
- Wiederverwendung
- kleine Komponenten
- API-Zugriffe zentral
- Formularlogik entkoppelt
- Backend als Source of Truth

---

# Projektstruktur

```text
src
├── api
├── auth
├── components
│   ├── common
│   ├── forms
│   ├── layouts
│   └── members
├── hooks
│   └── forms
├── pages
├── routes
├── utils
│   └── forms
└── tests
```

---

# Routing

Definition:

```text
src/routes/AppRoutes.jsx
```

Aktuelle Routen:

```text
/login
/members
/members/new
/members/:mitgliedsnummer
/admin/users
```

---

## Routing-Regeln

Geschützte Routen laufen über:

```text
ProtectedRoute
```

Layout:

```text
AppLayout
```

Öffentliche Route:

```text
/login
```

Geschützt:

```text
/members
/members/new
/members/:mitgliedsnummer
/admin/users
```

---

# Auth Architektur

Ordner:

```text
src/auth
```

Komponenten:

- `AuthProvider`
- `ProtectedRoute`
- `useAuth`

---

## AuthProvider

Verantwortung:

- Session Restore
- User State
- Login
- Logout
- Loading State

Backend-Endpunkte:

```http
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

---

## ProtectedRoute

Verhindert Zugriff ohne Session.

Verhalten:

keine Session:

```text
redirect → /login
```

Session vorhanden:

```text
Render geschützter Bereich
```

---

## useAuth

Zentrale API:

```javascript
const { user, login, logout, isAuthenticated, isLoading } = useAuth();
```

---

# Rollenmodell

Unterstützte Rollen:

```text
ADMIN
EDITOR
VIEWER
```

---

## UI Verhalten

### ADMIN

Vollzugriff:

- lesen
- anlegen
- bearbeiten
- löschen
- Benutzerverwaltung

---

### EDITOR

Erlaubt:

- lesen
- anlegen
- bearbeiten

Nicht erlaubt:

- löschen
- Benutzerverwaltung

---

### VIEWER

Nur ReadOnly.

Keine Änderungen.

---

# API Layer

Ordner:

```text
src/api
```

Aktuelle Module:

- `authApi.js`
- `memberApi.js`
- `lookupApi.js`
- `adminUserApi.js`

---

## Regeln

API-Aufrufe nur hier.

Keine direkten Fetch-Aufrufe in Pages/Components.

Beispiel:

gut:

```javascript
await login(credentials);
```

schlecht:

```javascript
fetch("/api/auth/login");
```

---

# React Query

Verwendung für:

- Member Daten
- Lookup Daten
- Admin User Daten

Verantwortung:

- Caching
- Refetch
- Loading States
- Mutation Handling

---

## Regeln

Serverdaten niemals manuell global spiegeln.

React Query ist Source of Truth.

---

# Pages

Ordner:

```text
src/pages
```

Aktuell:

- `LoginPage`
- `MembersPage`
- `MemberDetailPage`
- `CreateMemberPage`
- `AdminUsersPage`

---

## Verantwortlichkeit

Pages:

- Seitennavigation
- Daten laden
- Seitenlayout
- Containerlogik

Keine komplexe Formularlogik.

---

# Components

## Shared Components

Ordner:

```text
src/components/common
```

Beispiele:

- ErrorBox
- EnvironmentBadge

---

## Layout Components

Ordner:

```text
src/components/layouts
```

Aktuell:

- AppLayout

---

## Feature Components

Ordner:

```text
src/components/members
```

Mitglieder-bezogene Komponenten.

---

# Form Architektur

## Shared Form Components

Ordner:

```text
src/components/forms
```

Aktuell:

- `FormField`
- `SelectField`
- `CheckboxField`
- `DateField`

---

## Regeln

Neue Form Controls zuerst hier prüfen.

Keine redundanten Feldkomponenten erzeugen.

---

# React Hook Form

Verwendung in Formularen.

Pattern:

```javascript
useForm({
  mode: "onChange",
});
```

---

## Regeln

Validierung zentral.

Keine verstreute Inline-Validierungslogik.

---

# AutoSave Architektur

Zentrale Hook:

```text
src/hooks/forms/useAutoSaveForm.js
```

---

## Verantwortung

- Watch Formularzustand
- Debounce
- Validation
- Payload Build
- Save Trigger
- Serverfehler Mapping
- Success/Error Handling

---

## Pattern

Form:

```javascript
useAutoSaveForm({
  control,
  validate,
  buildPayload,
});
```

---

## Regeln

Neue AutoSave Formulare müssen diese Hook nutzen.

Keine individuelle Debounce-Logik pro Formular.

---

# Form Utilities

Ordner:

```text
src/utils/forms
```

Bereiche:

- validators
- payloads
- defaults
- validationHelpers
- dateHelpers

---

## validators

Fachliche Frontend-Validierung.

Beispiele:

- `validateStammdaten`
- `validateKontakt`
- `validateMitgliedschaft`
- `validateDatenschutz`
- `validateChorkleidung`

---

## payloads

Form → Backend DTO Mapping.

---

## defaults

Initialwerte / Reset Mapping.

---

## dateHelpers

Datumsverarbeitung.

---

## validationHelpers

gemeinsame Hilfsfunktionen.

---

# Member Detail Architektur

Tabs:

- Stammdaten
- Kontakt
- Mitgliedschaft
- Datenschutz
- Chorkleidung

Form-Komponenten:

- `MemberStammdatenForm`
- `MemberContactForm`
- `MemberMembershipForm`
- `MemberDatenschutzForm`
- `MemberChorkleidungForm`

---

## Rollensteuerung

ReadOnly wird über Props gesteuert:

```javascript
readOnly={true}
```

VIEWER darf niemals editieren.

---

# Admin User Management

Page:

```text
AdminUsersPage
```

API:

```text
adminUserApi.js
```

Nur ADMIN.

Funktionen:

- Benutzerliste
- Anlegen
- Rolle ändern
- aktiv/inaktiv
- Passwort setzen

---

# Fehlerbehandlung

## API Fehler

Anzeige:

- ErrorBox
- Formularfeldfehler

---

## Login Fehler

Neutral:

```text
Anmeldung nicht möglich.
```

---

## Rollenfehler

Backend liefert:

```http
403
```

UI blendet Funktionen idealerweise vorher aus.

---

# Testing

Framework:

```text
Vitest
```

Aktueller Stand:

```text
64 Tests
```

Abgedeckt:

- validationHelpers
- dateHelpers
- stammdatenValidator
- membershipValidator
- contactValidator
- datenschutzValidator
- chorkleidungValidator

---

## Teststrategie

Frontend Fokus:

- Formularlogik
- Validatoren
- Helper

Nicht primär:

- visuelle Snapshot Tests
- komplexe UI Integration

---

# Entwicklungsworkflow

Branching Pattern:

Feature:

```text
feature/*
```

Refactoring:

```text
refactor/*
```

Docs:

```text
docs/*
```

---

## Beispiel

```text
feature/security-hardening
refactor/forms
docs/readme-update-phase3
```

---

# Entwicklungsregeln

## Komponenten

Bevorzugt:

- kleine Komponenten
- klarer Scope
- Wiederverwendung

Vermeiden:

- Monster-Komponenten
- doppelte Logik

---

## State

Lokal:

UI State

React Query:

Server State

AuthProvider:

Session/Auth State

---

## API

Keine Fetch-Aufrufe direkt in Components.

---

## Validierung

Backend bleibt Source of Truth.

Frontend validiert primär UX-orientiert.

---

## Security

Keine Sicherheitslogik nur im Frontend.

Berechtigungen immer zusätzlich im Backend.

---

# Build

Development:

```bash
npm install
npm run dev
```

Tests:

```bash
npm test
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

---

# Deployment Kontext

Ziel:

```text
Docker Container auf UGREEN NAS
```

Kommunikation:

```text
Frontend → Backend REST API
```

Session basiert über Browser Cookie.

---

# Geplante technische Erweiterungen

- Session Timeout UX
- Auto Logout Hinweis
- Passwortwechsel UI
- Passwort Reset UI
- zusätzliche Integrationstests
- Rollen-/Security UX Optimierung
