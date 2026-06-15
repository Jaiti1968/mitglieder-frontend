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
- Vite Build Metadata (`package.json version`)

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

Hinweis:

Systeminformationen werden aktuell direkt in `EnvironmentBadge` geladen.

Eine spätere Auslagerung nach:

```text
systemApi.js
```

ist möglich.

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

EnvironmentBadge zeigt:

- Umgebung (derzeit aus Frontend-Konfiguration abgeleitet)
- Proxy-Ziel
- Frontend-Version
- Backend-Version

Hinweis:

Die aktuelle Umgebungsanzeige basiert auf Frontend-Konfigurationsinformationen und ist nicht in allen Deployment-Szenarien eindeutig.

Eine zukünftige Version soll die Umgebungskennung über den Backend-Endpunkt

GET /api/system/info

bereitstellen und damit DEV/PROD eindeutig anzeigen.

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

# Versionsinformationen

Das Frontend unterstützt technische Versionsanzeige für Betrieb, Deployment-Kontrolle und Fehlerdiagnose.

## Frontend-Version

Quelle:

```text
package.json
```

Beispiel Entwicklungsstand:

```json
"version": "1.1.2-SNAPSHOT"
```

Beispiel Release:

```json
"version": "1.1.1"
```

Bereitstellung via Vite:

```javascript
import.meta.env.VITE_APP_VERSION;
```

Konfiguration:

```javascript
// vite.config.js
"import.meta.env.VITE_APP_VERSION": JSON.stringify(packageJson.version)
```

Wichtig:

Die Frontend-Version wird zum Build-Zeitpunkt aus `package.json` übernommen.

Vor einem Release-Build muss daher geprüft werden, dass eine Release-Version ohne `-SNAPSHOT` gesetzt ist.

Nach Abschluss eines Releases wird die Entwicklungsversion auf die nächste Snapshot-Version angehoben.

## Backend-Version

Quelle:

```http
GET /api/system/info
```

Beispiel Response:

```json
{
  "backendVersion": "1.1.2"
}
```

Der Endpoint ist authentifiziert und nutzt die bestehende Session.

Request:

```javascript
fetch("/api/system/info", {
  credentials: "include",
});
```

## Anzeige

Komponente:

```text
src/components/common/EnvironmentBadge.jsx
```

Beispiel DEV:

```text
<Umgebung> | FE v1.1.2-SNAPSHOT | BE v1.1.2-SNAPSHOT
```

Beispiel PROD:

```text
<Umgebung> | FE v1.1.1 | BE v1.1.1
```

## Zweck

- Deployment-Verifikation
- Versionskontrolle DEV/PROD
- Support / Diagnose
- Erkennung von Versions-Mismatch

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
- Benutzer anlegen
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

(Ausnahme aktuell: technischer System-Info Abruf im `EnvironmentBadge`.)

---

## Validierung

Backend bleibt Source of Truth.

Frontend validiert primär UX-orientiert.

---

## Security

Keine Sicherheitslogik nur im Frontend.

Berechtigungen immer zusätzlich im Backend.

---

# Docker Deployment

## Docker Artefakte

```text
Dockerfile
.dockerignore

docker/
├── nginx-local.conf
├── nginx-dev.conf
└── nginx-prod.conf
```

## Deployment Architektur

Frontend wird image-basiert betrieben.

Ablauf:

```text
1. package.json Version prüfen
2. npm run build
3. Docker Image Build
4. docker save
5. Übertragung auf NAS
6. docker load
7. Portainer Redeploy
8. Smoke Test
9. Browser-Cache prüfen / Seite neu laden
```

Runtime:

```text
nginx:alpine
```

## Image Versionierung

Image Tags enthalten die Anwendungsversion.

Beispiel:

```text
DEV:
emc-mitglieder-frontend:X.Y.Z-SNAPSHOT

PROD:
emc-mitglieder-frontend:X.Y.Z
```

Build-Plattform:

linux/arm64

NAS-Deployments müssen ARM64-kompatible Images erzeugen.

Beispiel:

docker build \
 --platform linux/arm64 \
 --build-arg NGINX_CONF=nginx-prod.conf \
 -t emc-mitglieder-frontend:1.1.1 .

Dadurch bleiben Deployments und Rollbacks nachvollziehbar.

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

Voraussetzungen:

Hinweis:

Für den anschließenden Docker Image Build muss Docker Desktop gestartet und die Docker Engine erreichbar sein.

Vor Release-Builds ist die Version in package.json zu prüfen.

Dabei wird die Frontend-Version aus:

```text
package.json
```

in die Anwendung eingebettet.

Preview:

```bash
npm run preview
```

---

## Lokaler Docker Test

Build:

```bash
docker build \
  --platform linux/arm64 \
  --build-arg NGINX_CONF=nginx-prod.conf \
  -t emc-mitglieder-frontend:1.1.1 .
```

Start:

```bash
docker run -p 8088:80 emc-mitglieder-frontend:local
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

Technischer System-Endpoint:

```http
GET /api/system/info
```

Session basiert über Browser Cookie.

Betriebsstandard:

```text
Git Repository
→ Build-Artefakte
→ Docker Image
→ Docker Compose
→ NAS Deployment
```

Die operative Compose Source of Truth liegt im Repository:

```text
emc-infra
```

---

# Geplante technische Erweiterungen

- Session Timeout UX
- Auto Logout Hinweis
- Passwortwechsel UI
- Passwort Reset UI
- zusätzliche Integrationstests
- Rollen-/Security UX Optimierung
