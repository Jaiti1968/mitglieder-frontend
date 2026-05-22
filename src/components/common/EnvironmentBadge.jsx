import { useEffect, useState } from "react";

export default function EnvironmentBadge() {
  const envName = "localhost";
  const proxyTarget = "localhost:8080";
  const frontendVersion = import.meta.env.VITE_APP_VERSION;

  const [backendVersion, setBackendVersion] = useState(null);

  useEffect(() => {
    fetch("/api/system/info", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("System info unavailable");
        }
        return res.json();
      })
      .then((data) => {
        setBackendVersion(data.backendVersion);
      })
      .catch(() => {
        setBackendVersion("n/a");
      });
  }, []);

  return (
    <div style={containerStyle}>
      <span style={badgeStyle}>{envName}</span>
      <span style={urlStyle}>Proxy → {proxyTarget}</span>
      <span style={versionStyle}>FE v{frontendVersion}</span>
      <span style={versionStyle}>BE v{backendVersion ?? "..."}</span>
    </div>
  );
}

const containerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const badgeStyle = {
  color: "#fff",
  backgroundColor: "#1565c0",
  padding: "0.3rem 0.65rem",
  borderRadius: "999px",
  fontWeight: 700,
  fontSize: "0.8rem",
};

const urlStyle = {
  fontSize: "0.8rem",
  color: "#555",
  fontFamily: "monospace",
};

const versionStyle = {
  fontSize: "0.8rem",
  color: "#6b7280",
  fontFamily: "monospace",
};
