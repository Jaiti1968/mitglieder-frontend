import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import EnvironmentBadge from "../common/EnvironmentBadge";
import useAuth from "../../auth/useAuth";
import useSystemInfo from "../../hooks/useSystemInfo";
import SystemInfoDialog from "../common/SystemInfoDialog";

export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { systemInfo, loading, refreshing, error, lastUpdated, refresh } =
    useSystemInfo();

  const [infoDialogOpen, setInfoDialogOpen] = useState(false);

  function handleOpenInfo() {
    setInfoDialogOpen(true);
    refresh();
  }

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
          <span style={brandIconStyle} aria-hidden="true">
            ♫
          </span>
          <span>EMC Mitgliederverwaltung</span>
        </Link>

        <div style={rightAreaStyle}>
          {user?.role === "ADMIN" && (
            <nav style={navigationStyle}>
              <Link to="/reporting" style={navLinkStyle}>
                Reporting
              </Link>

              <Link to="/admin/users" style={navLinkStyle}>
                Benutzer
              </Link>
            </nav>
          )}

          <span style={separatorStyle} aria-hidden="true" />

          <div style={userInfoStyle}>
            <span style={userIconStyle} aria-hidden="true">
              ♙
            </span>
            <span style={usernameStyle}>{user?.username ?? "Unbekannt"}</span>
            <span style={roleStyle}>{user?.role ?? "Unbekannt"}</span>
          </div>

          <span style={separatorStyle} aria-hidden="true" />

          <EnvironmentBadge
            environment={systemInfo?.environment}
            loading={loading}
            error={error}
          />

          <button
            type="button"
            onClick={handleOpenInfo}
            style={infoButtonStyle}
            title="Systeminformationen anzeigen"
          >
            <span aria-hidden="true">ⓘ</span>
            <span>Info</span>
          </button>

          <span style={separatorStyle} aria-hidden="true" />

          <button onClick={handleLogout} style={logoutButtonStyle}>
            Abmelden
          </button>
        </div>
      </header>

      <SystemInfoDialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        user={user}
        systemInfo={systemInfo}
        loading={loading}
        refreshing={refreshing}
        error={error}
        lastUpdated={lastUpdated}
      />

      <main style={contentStyle}>
        <Outlet />
      </main>
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
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.035)",
  flexWrap: "wrap",
};

const brandStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.65rem",
  fontWeight: 700,
  fontSize: "1.05rem",
  color: "#172b4d",
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const brandIconStyle = {
  fontSize: "1.65rem",
  color: "#234b72",
  lineHeight: 1,
};

const rightAreaStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "0.85rem",
  flexWrap: "wrap",
};

const navigationStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
};

const navLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.5rem 0.85rem",
  border: "1px solid #d1d9e3",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "#172b4d",
  textDecoration: "none",
  cursor: "pointer",
  font: "inherit",
  lineHeight: 1.2,
  height: "36px",
  boxSizing: "border-box",
};

const separatorStyle = {
  width: "1px",
  height: "28px",
  backgroundColor: "#e2e5ea",
};

const userInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  whiteSpace: "nowrap",
};

const userIconStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  backgroundColor: "#f3f6fa",
  color: "#234b72",
  fontSize: "1.2rem",
};

const usernameStyle = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#172b4d",
};

const roleStyle = {
  padding: "0.25rem 0.5rem",
  borderRadius: "999px",
  backgroundColor: "#f1f5f9",
  color: "#64748b",
  fontSize: "0.7rem",
  fontWeight: 700,
  height: "36px",
  boxSizing: "border-box",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const logoutButtonStyle = {
  padding: "0.5rem 0.85rem",
  border: "1px solid #f3b4b4",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "#b91c1c",
  cursor: "pointer",
  font: "inherit",
  height: "36px",
  boxSizing: "border-box",
};

const contentStyle = {
  padding: "1.25rem",
};

const infoButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  padding: "0.5rem 0.75rem",
  border: "1px solid #d1d9e3",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "#172b4d",
  cursor: "pointer",
  font: "inherit",
  fontSize: "0.85rem",
  height: "36px",
  boxSizing: "border-box",
};
