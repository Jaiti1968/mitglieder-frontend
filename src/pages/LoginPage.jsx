import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";
import ErrorBox from "../components/common/ErrorBox";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const redirectTo = location.state?.from?.pathname || "/members";

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setIsLoggingIn(true);

    try {
      await login(username, password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "Login fehlgeschlagen.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>EMC Mitgliederverwaltung</h1>
        <p style={{ color: "#666" }}>Bitte anmelden</p>

        <ErrorBox message={errorMessage} />

        <form onSubmit={handleSubmit}>
          <label style={fieldStyle}>
            <span>Benutzername</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              //autoComplete="username"
              autocomplete="off"
              required
            />
          </label>

          <label style={fieldStyle}>
            <span>Passwort</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              //autoComplete="current-password"
              autoComplete="new-password"
              required
            />
          </label>

          <button type="submit" disabled={isLoggingIn} style={buttonStyle}>
            {isLoggingIn ? "Melde an..." : "Anmelden"}
          </button>
        </form>
      </section>
    </main>
  );
}

/* ---------- Styles ---------- */

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#f5f7fa",
};

const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e5ea",
  borderRadius: "12px",
  padding: "1.5rem",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
  marginBottom: "1rem",
  fontWeight: 600,
};

const buttonStyle = {
  width: "100%",
  marginTop: "0.5rem",
};
