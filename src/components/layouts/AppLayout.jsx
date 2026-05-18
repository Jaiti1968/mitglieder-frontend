import { Link, Outlet, useNavigate } from "react-router-dom";
import EnvironmentBadge from "../common/EnvironmentBadge";
import useAuth from "../../auth/useAuth";

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div>
      <header style={headerStyle}>
        <Link to="/members" style={brandStyle}>
          EMC Mitgliederverwaltung
        </Link>

        <div style={rightAreaStyle}>
          <div style={userInfoStyle}>
            <span>{user?.username}</span>
            <span style={roleStyle}>{user?.role}</span>
          </div>

          <button onClick={handleLogout} style={logoutButtonStyle}>
            Abmelden
          </button>

          <EnvironmentBadge />
        </div>
      </header>

      <div style={contentStyle}>
        <Outlet />
      </div>
    </div>
  );
}

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
  padding: "0.75rem 1.25rem",
  borderBottom: "1px solid #e2e5ea",
  backgroundColor: "#ffffff",
};

const brandStyle = {
  fontWeight: 700,
  color: "#1f2937",
  textDecoration: "none",
};

const rightAreaStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
};

const userInfoStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  fontSize: "0.9rem",
};

const roleStyle = {
  fontSize: "0.75rem",
  color: "#6b7280",
};

const logoutButtonStyle = {
  padding: "0.45rem 0.8rem",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  backgroundColor: "#ffffff",
  cursor: "pointer",
};

const contentStyle = {
  padding: "1.25rem",
};
