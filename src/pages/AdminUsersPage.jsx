import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminUser,
  getAdminUsers,
  updateAdminUserActive,
  updateAdminUserPassword,
  updateAdminUserRole,
} from "../api/adminUserApi";
import ErrorBox from "../components/common/ErrorBox";

const ROLES = ["ADMIN", "EDITOR", "VIEWER"];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("VIEWER");
  const [passwordByUserId, setPasswordByUserId] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const {
    data: users = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
  });

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setStatusMessage("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [statusMessage]);

  function markSaving(message = "Speichere Änderungen...") {
    setErrorMessage("");
    setStatusMessage(message);
  }

  function markSaved() {
    setStatusMessage("✔ Gespeichert");
  }

  const createUserMutation = useMutation({
    mutationFn: createAdminUser,
    onMutate: () => {
      markSaving("Lege Benutzer an...");
    },
    onSuccess: () => {
      setNewUsername("");
      setNewPassword("");
      setNewRole("VIEWER");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      markSaved();
    },
    onError: (mutationError) => {
      setStatusMessage("");
      setErrorMessage(mutationError.message);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => updateAdminUserRole(userId, role),
    onMutate: () => {
      markSaving();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      markSaved();
    },
    onError: (mutationError) => {
      setStatusMessage("");
      setErrorMessage(mutationError.message);
    },
  });

  const updateActiveMutation = useMutation({
    mutationFn: ({ userId, active }) => updateAdminUserActive(userId, active),
    onMutate: () => {
      markSaving();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      markSaved();
    },
    onError: (mutationError) => {
      setStatusMessage("");
      setErrorMessage(mutationError.message);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: ({ userId, password }) =>
      updateAdminUserPassword(userId, password),
    onMutate: () => {
      markSaving("Setze Passwort...");
    },
    onSuccess: (_response, variables) => {
      setPasswordByUserId((current) => ({
        ...current,
        [variables.userId]: "",
      }));
      markSaved();
    },
    onError: (mutationError) => {
      setStatusMessage("");
      setErrorMessage(mutationError.message);
    },
  });

  function handleCreateUser(event) {
    event.preventDefault();

    createUserMutation.mutate({
      username: newUsername,
      password: newPassword,
      role: newRole,
    });
  }

  function handlePasswordChange(userId, value) {
    setPasswordByUserId((current) => ({
      ...current,
      [userId]: value,
    }));
  }

  function handleUpdatePassword(userId) {
    const password = passwordByUserId[userId] || "";

    updatePasswordMutation.mutate({
      userId,
      password,
    });
  }

  if (isLoading) {
    return <p>Lade Benutzer...</p>;
  }

  if (isError) {
    return <ErrorBox message={`Fehler beim Laden: ${error.message}`} />;
  }

  return (
    <main>
      <Link to="/members" style={backLinkStyle}>
        ← Zur Mitgliederliste
      </Link>

      <h1>Benutzerverwaltung</h1>

      {statusMessage && <p style={statusMessageStyle}>{statusMessage}</p>}

      {errorMessage && <ErrorBox message={errorMessage} />}

      <div style={infoBoxStyle}>
        Hinweis: Rollen- oder Aktivitätsänderungen werden erst nach erneuter
        Anmeldung des betroffenen Benutzers wirksam.
      </div>

      <section style={sectionStyle}>
        <h2>Neuen Benutzer anlegen</h2>

        <form onSubmit={handleCreateUser} style={createFormStyle}>
          <label style={fieldStyle}>
            <span>Benutzername</span>
            <input
              type="text"
              value={newUsername}
              onChange={(event) => setNewUsername(event.target.value)}
              required
            />
          </label>

          <label style={fieldStyle}>
            <span>Initialpasswort</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
            />
          </label>

          <label style={fieldStyle}>
            <span>Rolle</span>
            <select
              value={newRole}
              onChange={(event) => setNewRole(event.target.value)}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" disabled={createUserMutation.isPending}>
            Benutzer anlegen
          </button>
        </form>
      </section>

      <section style={sectionStyle}>
        <h2>Benutzer</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Benutzername</th>
              <th style={thStyle}>Rolle</th>
              <th style={thStyle}>Aktiv</th>
              <th style={thStyle}>Erstellt</th>
              <th style={thStyle}>Letzter Login</th>
              <th style={thStyle}>Passwort setzen</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={tdStyle}>{user.username}</td>

                <td style={tdStyle}>
                  <select
                    value={user.role}
                    onChange={(event) =>
                      updateRoleMutation.mutate({
                        userId: user.id,
                        role: event.target.value,
                      })
                    }
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>

                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={user.active}
                    onChange={(event) =>
                      updateActiveMutation.mutate({
                        userId: user.id,
                        active: event.target.checked,
                      })
                    }
                  />
                </td>

                <td style={tdStyle}>{formatDateTime(user.createdAt)}</td>

                <td style={tdStyle}>{formatDateTime(user.lastLoginAt)}</td>

                <td style={tdStyle}>
                  <div style={passwordResetStyle}>
                    <input
                      type="password"
                      placeholder="Neues Passwort"
                      value={passwordByUserId[user.id] || ""}
                      onChange={(event) =>
                        handlePasswordChange(user.id, event.target.value)
                      }
                    />

                    <button
                      type="button"
                      onClick={() => handleUpdatePassword(user.id)}
                      disabled={updatePasswordMutation.isPending}
                    >
                      Setzen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("de-DE");
}

const backLinkStyle = {
  display: "inline-block",
  marginBottom: "1rem",
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: 600,
};

const statusMessageStyle = {
  color: "#2e7d32",
  fontWeight: 600,
  marginBottom: "1rem",
};

const infoBoxStyle = {
  marginBottom: "1.5rem",
  padding: "0.75rem 1rem",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  backgroundColor: "#f9fafb",
  color: "#374151",
};

const sectionStyle = {
  marginTop: "1.5rem",
  padding: "1rem",
  border: "1px solid #e2e5ea",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
};

const createFormStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "1rem",
  alignItems: "end",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  textAlign: "left",
  borderBottom: "1px solid #d1d5db",
  padding: "0.5rem",
};

const tdStyle = {
  borderBottom: "1px solid #e5e7eb",
  padding: "0.5rem",
  verticalAlign: "top",
};

const passwordResetStyle = {
  display: "flex",
  gap: "0.5rem",
};
