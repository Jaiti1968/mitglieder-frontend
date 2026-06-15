# EMC Mitgliederverwaltung – Frontend

## Überblick

React-Frontend für die EMC Mitgliederverwaltung.

Die Anwendung stellt die Benutzeroberfläche für die Mitgliederverwaltung bereit und kommuniziert mit dem Spring Boot Backend über eine REST-API.

Funktionale Schwerpunkte:

- Mitgliederliste mit Suche, Filter und Pagination
- Detailansicht für Mitglieder
- AutoSave in Detailformularen
- Session-basierte Benutzeranmeldung
- rollenbasierte UI
- Admin Benutzerverwaltung
- Anzeige von Frontend- und Backend-Version

Aktueller Stand:

**Phase 3c abgeschlossen (Auth + Rollen + Admin UI + Versionsanzeige)**

---

## Technologien

- React 19
- Vite
- React Router
- TanStack React Query
- React Hook Form
- Vitest
- JavaScript
- Docker

---

## Architektur

Grundstruktur:

```text
Pages
→ Feature Components
→ Shared Form Components
→ Hooks
→ API Layer
→ Spring Boot Backend
```

---

## Projektstruktur

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

## Kernkonzepte

## Session-basierte Authentifizierung

Das Frontend verwendet Session-basierte Authentifizierung.

Kein JWT.

Kein dauerhafter Login-State im Browser.

Ablauf:

1. Login gegen Backend

```http
POST /api/auth/login
```

2. Session-Cookie wird vom Browser verwaltet

3. Session Restore beim App-Start:

```http
GET /api/auth/me
```

4. Logout:

```http
POST /api/auth/logout
```

---

## Rollenmodell

Unterstützte Rollen:

- `ADMIN`
- `EDITOR`
- `VIEWER`

---

### Rollenverhalten

#### ADMIN

Vollzugriff:

- Mitglieder lesen
- Mitglieder anlegen
- Mitglieder bearbeiten
- Mitglieder löschen
- Benutzerverwaltung

---

#### EDITOR

Eingeschränkter Schreibzugriff:

- Mitglieder lesen
- Mitglieder anlegen
- Mitglieder bearbeiten

Kein:

- Löschen
- Benutzerverwaltung

---

#### VIEWER

ReadOnly:

- Mitglieder lesen
- Detailansicht lesen

Kein:

- Bearbeiten
- Anlegen
- Löschen
- Benutzerverwaltung

---

## Routing

Aktuelle Routen:

```text
/login
/members
/members/new
/members/:mitgliedsnummer
/admin/users
```

---

## Seiten

## LoginPage

Benutzeranmeldung.

Funktionen:

- Login
- Fehleranzeige
- Session Aufbau

---

## MembersPage

Mitgliederübersicht.

Funktionen:

- Suche
- Filter Mitgliederstatus
- Filter Stimme
- Pagination
- Link zur Detailansicht
- Neuanlage (rollenabhängig)

---

## MemberDetailPage

Detailansicht eines Mitglieds.

Tabs:

- Stammdaten
- Kontakt
- Mitgliedschaft
- Datenschutz
- Chorkleidung

Verhalten:

- ADMIN / EDITOR → editierbar
- VIEWER → ReadOnly

---

## CreateMemberPage

Neuanlage.

Bereiche:

- Stammdaten
- Kontakt
- Mitgliedschaft

---

## AdminUsersPage

Nur für ADMIN.

Funktionen:

- Benutzerliste
- Benutzer anlegen
- Rolle ändern
- aktiv/inaktiv setzen
- Passwort setzen

Hinweis:

Rollen-/Aktivitätsänderungen wirken nach erneuter Anmeldung des betroffenen Benutzers.

---

## Formulare / AutoSave

Detailformulare speichern automatisch.

Betroffene Formulare:

- MemberStammdatenForm
- MemberContactForm
- MemberMembershipForm
- MemberDatenschutzForm
- MemberChorkleidungForm

---

### Verhalten

Änderung:

```text
Speichere Änderungen...
```

Erfolg:

```text
✔ Gespeichert
```

Fehler:

- ErrorBox
- feldbezogene Fehlermeldungen

---

## API Layer

Ordner:

```text
src/api
```

Aktuell:

- `authApi.js`
- `memberApi.js`
- `lookupApi.js`
- `adminUserApi.js`

Verantwortung:

- HTTP Requests
- Fehlerbehandlung
- DTO Mapping falls erforderlich

---

## Auth Layer

Ordner:

```text
src/auth
```

Komponenten:

- `AuthProvider`
- `ProtectedRoute`
- `useAuth`

Verantwortung:

- Session Restore
- User State
- Rollenprüfung
- Logout

---

## Form Utilities

Ordner:

```text
src/utils/forms
```

Bereiche:

- defaults
- payloads
- validators
- validationHelpers
- dateHelpers

Ziel:

Zentrale Wiederverwendung von Formularlogik.

---

## Gemeinsame Form-Komponenten

Ordner:

```text
src/components/forms
```

Komponenten:

- FormField
- SelectField
- CheckboxField
- DateField

---

## Testing

Framework:

```text
Vitest
```

Aktueller Stand:

```text
64 erfolgreiche Unit Tests
```

Abgedeckt:

- validationHelpers
- dateHelpers
- stammdatenValidator
- membershipValidator
- contactValidator
- datenschutzValidator
- chorkleidungValidator

Ziel:

Qualitätssicherung der Formular- und Validierungslogik.

---

## Backend Integration

Backend:

Spring Boot REST API

Wichtige Endpunkte:

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
GET  /api/members
GET  /api/lookups/*
GET  /api/admin/users
GET  /api/system/info
```

---

## Versionsanzeige

Das Frontend zeigt im `EnvironmentBadge` die aktuell laufenden Frontend- und Backend-Versionen an.

Beispiel DEV:

```text
FE v1.1.2-SNAPSHOT | BE v1.1.2-SNAPSHOT
```

Beispiel PROD:

```text
FE v1.1.1 | BE v1.1.2
```

Zweck:

- Deployment Smoke Tests
- schnelle Betriebsidentifikation
- Support / Fehlerdiagnose
- Erkennung von Frontend-/Backend-Versionsabweichungen

### Frontend-Version

Die Frontend-Version wird zentral in:

```text
package.json
```

definiert:

```json
"version": "1.1.2-SNAPSHOT"
```

Über Vite wird diese Build-Zeit-Information bereitgestellt:

```javascript
import.meta.env.VITE_APP_VERSION;
```

Konfiguration:

```javascript
// vite.config.js
"import.meta.env.VITE_APP_VERSION": JSON.stringify(packageJson.version)
```

Hinweis:

Die Anzeige der Frontend-Version basiert auf der Version in `package.json` zum Zeitpunkt des Builds.

Für Release-Builds muss daher eine Release-Version gesetzt werden:

```json
"version": "1.1.1"
```

Für Entwicklungsstände wird die Version als Snapshot geführt:

```json
"version": "1.1.2-SNAPSHOT"
```

Nach einem Release-Build wird die Entwicklungsversion wieder auf die nächste Snapshot-Version angehoben.

### Backend-Version

Die Backend-Version wird über den authentifizierten technischen Endpoint geladen:

```http
GET /api/system/info
```

Beispiel Response:

```json
{
  "backendVersion": "1.1.2"
}
```

Da das Backend session-basiert arbeitet, erfolgt der Request mit Browser-Session:

```javascript
credentials: "include";
```

### Implementierung

Anzeige erfolgt über:

```text
src/components/common/EnvironmentBadge.jsx
```

---

## Fehlerbehandlung

Fehlerquellen:

- API Fehler
- Auth Fehler
- Validierungsfehler
- Netzwerkfehler

Anzeige:

- ErrorBox
- Feldfehler in Formularen

Login Fehler:

```text
Anmeldung nicht möglich.
```

---

## Build

Development:

```bash
npm install
npm run dev
```

Production Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

---

## Deployment

Deployment erfolgt containerisiert.

Frontend DEV und PROD werden als versionierte Docker Images betrieben.

Deployment-Artefakte:

DEV:
emc-mitglieder-frontend:X.Y.Z-SNAPSHOT

PROD:
emc-mitglieder-frontend:X.Y.Z

Vor jedem Release-Build ist die Version in package.json zu prüfen, da die Frontend-Versionsanzeige aus dieser Datei erzeugt wird.

Docker Desktop muss für den Build-Prozess gestartet sein.

Zielumgebung:

```text
UGREEN NAS DH2300
```

Frontend läuft als Docker Container hinter Reverse Proxy / NAS Setup.

### Deployment Standard

Frontend DEV und PROD werden image-basiert betrieben.

Build-Artefakt:

```text
dist/
```

Container Runtime:

```text
nginx:alpine
```

Deploymentmodell:

```text
npm run build
→ dist auf NAS übertragen
→ Docker Image Build auf NAS
→ Docker Compose Deployment
```

Die Compose-Dateien sind Bestandteil des Repositories:

```text
emc-infra
```

und bilden die operative Source of Truth.

---

### Deployment Standard

Frontend DEV und PROD werden image-basiert betrieben.

Deployment-Artefakte:

DEV:
emc-mitglieder-frontend:X.Y.Z-SNAPSHOT

PROD:
emc-mitglieder-frontend:X.Y.Z

Build-Plattform:

linux/arm64

Build-Konfiguration:

NGINX_CONF

Mögliche Werte:

- nginx-local.conf
- nginx-dev.conf
- nginx-prod.conf

Deployment-Prozess:

1. package.json Version prüfen
2. npm run build
3. Docker Image Build
4. docker save
5. Übertragung auf NAS
6. docker load
7. Portainer Redeploy
8. Smoke Test

Die Compose-Dateien sind Bestandteil des Repositories emc-infra und bilden die operative Source of Truth.

## Docker

Projektdateien:

```text
Dockerfile
.dockerignore

docker/
├── nginx-local.conf
├── nginx-dev.conf
└── nginx-prod.conf
```

### Lokaler Test

Build:

```bash
docker build \
  --build-arg NGINX_CONF=nginx-local.conf \
  -t emc-mitglieder-frontend:local .
```

Start:

```bash
docker run -p 8088:80 emc-mitglieder-frontend:local
```

### NAS Deployment

DEV:

```bash
docker build \
  --platform linux/arm64 \
  --build-arg NGINX_CONF=nginx-dev.conf \
  -t emc-mitglieder-frontend:1.1.2-SNAPSHOT .
```

PROD:

```bash
docker build \
  --platform linux/arm64 \
  --build-arg NGINX_CONF=nginx-prod.conf \
  -t emc-mitglieder-frontend:1.1.1 .
```

---

## Betriebsstandard

Im Rahmen der EMC NAS Betriebsstandardisierung wurde Frontend Deployment Standard v1 eingeführt.

Merkmale:

- image-basiertes Deployment
- versioniertes Dockerfile
- versionierte nginx-Konfiguration
- Docker Compose Deployment
- keine Runtime Bind-Mounts für Frontend-Artefakte
- Git-basierte Änderungsverfolgung
- Snapshot-/Release-Strategie analog Backend
- ARM64-kompatible Images für NAS Deployment
- Image-Transfer über docker save / docker load

Ziel:

identischer Betriebsstandard für Frontend und Backend.

---

## Aktueller Projektstatus

### Fertig

- Login
- Logout
- Session Restore
- Protected Routes
- Rollenmodell
- Mitgliederliste
- Suche / Filter
- Pagination
- Detailansicht
- AutoSave
- Datenschutz
- Chorkleidung
- Neuanlage
- Benutzerverwaltung
- ReadOnly Viewer
- Unit Tests

---

## Geplant

### Security Hardening

Backend-getrieben:

- Session Timeout
- Auto Logout
- Passwortwechsel beim Erstlogin
- Passwort Reset
- temporäre Kontosperre

---

### Frontend

Mögliche Erweiterungen:

- bessere Session Timeout UX
- Passwortwechsel UI
- Passwort Reset UI
- Security Status Hinweise

---

## Nicht im MVP

- Ehrungen
- Berichte
- Exporte
- Mailfunktionen
- Historisierung
