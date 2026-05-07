import { Link, Outlet } from "react-router-dom";
import EnvironmentBadge from "../common/EnvironmentBadge";

export default function AppLayout() {
  return (
    <div>
      <header style={headerStyle}>
        <Link to="/members" style={brandStyle}>
          EMC Mitgliederverwaltung
        </Link>

        <EnvironmentBadge />
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

const contentStyle = {
  padding: "1.25rem",
};
