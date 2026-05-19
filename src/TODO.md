# TODO – EMC Mitgliederverwaltung Frontend

## Priorität Hoch

### Security Hardening (abhängig vom Backend)

- [ ] Session Timeout / Auto Logout UX
  - automatische Abmeldung nach Inaktivität
  - Nutzerhinweis vor Logout
  - sauberer Redirect auf Login

- [ ] Passwortwechsel beim Erstlogin UI
  - Passwort ändern Dialog / Seite
  - erzwungener Flow
  - keine Umgehung möglich

- [ ] Passwort Reset UI
  - Admin-initiiertes Reset-Verhalten unterstützen
  - Initialpasswort Workflow abbilden

- [ ] Behandlung gesperrter Benutzer
  - neutrale Fehlermeldung
  - optional UX-Hinweis falls fachlich gewünscht

---

## Priorität Mittel

### Testing

- [ ] React Component Tests

  Fokus:
  - LoginPage
  - ProtectedRoute
  - AuthProvider
  - AppLayout
  - AdminUsersPage

  Ziel:
  - Login-Verhalten absichern
  - Session Restore absichern
  - Rollenabhängige Navigation prüfen
  - Viewer ReadOnly Verhalten absichern
  - Admin Benutzerverwaltung UI absichern

---

- [ ] Integration Tests für kritische Frontend-Flows

  Kandidaten:
  - Login
  - Logout
  - Session Restore
  - Rollensteuerung
  - Viewer ReadOnly
  - Admin Benutzerverwaltung
  - Member Edit Flow

  Hinweis:

  Erst nach Phase 4 Security Hardening sinnvoll, da sich Login-/Session-Verhalten noch ändern wird.

---

### UX Verbesserungen

- [ ] bessere Session-Ladeanzeige beim App Start

- [ ] Benutzerfreundlichere Fehlertexte für Netzwerkfehler

- [ ] Bestätigungsdialoge prüfen
      z. B.:
  - Benutzer deaktivieren
  - Passwort zurücksetzen
  - Mitglied löschen

- [ ] konsistente Success-/Error Notifications
      aktuell Mischung aus:
  - Inline Meldungen
  - Formularstatus
  - Fehlerboxen

---

## Priorität Mittel / Architektur

### Codequalität

- [ ] weitere gemeinsame UI-Komponenten prüfen

- [ ] AdminUsersPage ggf. weiter in kleinere Komponenten aufteilen

- [ ] API Fehlerhandling weiter vereinheitlichen

- [ ] React Query Query Keys zentralisieren

---

## Später

### Erweiterungen

- [ ] Passwortstärke-Anzeige

- [ ] Benutzerprofil / eigenes Passwort ändern

- [ ] Session-Status-Indikator

- [ ] Dark Mode (optional)

---

## Fachliche Erweiterungen

- [ ] Ehrungen UI

- [ ] Funktionen / Chorrollen

- [ ] Berichte / Auswertungen

- [ ] Exportfunktionen

- [ ] Mailfunktionen

---

## Erledigt

- [x] Session-basierte Authentifizierung

- [x] Login / Logout

- [x] Session Restore

- [x] Protected Routes

- [x] Rollenmodell (ADMIN / EDITOR / VIEWER)

- [x] rollenbasierte Navigation

- [x] Viewer ReadOnly Verhalten

- [x] Mitgliederliste

- [x] Suche / Filter / Pagination

- [x] Mitglied Detailansicht

- [x] Neuanlage

- [x] AutoSave Formulare

- [x] Datenschutz Formular

- [x] Chorkleidung Formular

- [x] Admin Benutzerverwaltung

- [x] Formular Refactoring

- [x] gemeinsame Form-Komponenten

- [x] Validator Refactoring

- [x] Frontend Unit Tests (64)
