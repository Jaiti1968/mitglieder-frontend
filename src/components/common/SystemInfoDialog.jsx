import { useEffect, useRef, useState } from "react";

const frontendVersion = import.meta.env.VITE_APP_VERSION ?? "Nicht verfügbar";

const frontendBuildTime = import.meta.env.VITE_APP_BUILD_TIME ?? null;

function formatDateTime(value) {
  if (!value) return "Nicht verfügbar";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Nicht verfügbar";

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
}

export default function SystemInfoDialog({
  open,
  onClose,
  user,
  systemInfo,
  loading,
  refreshing,
  error,
  lastUpdated,
}) {
  const closeButtonRef = useRef(null);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const backendAvailable = Boolean(systemInfo);
  const backendStatus = refreshing
    ? "Backend-Informationen werden aktualisiert"
    : error
      ? backendAvailable
        ? "Aktualisierung fehlgeschlagen – letzte bekannte Informationen"
        : "Backend-Informationen konnten nicht abgerufen werden"
      : loading
        ? "Backend-Informationen werden geladen"
        : backendAvailable
          ? "Backend-Informationen erfolgreich abgerufen"
          : "Keine Backend-Informationen verfügbar";

  const environment = systemInfo?.environment ?? "Unbekannt";
  const backendVersion = systemInfo?.backendVersion ?? "Nicht verfügbar";
  const backendBuild = formatDateTime(systemInfo?.buildTime);
  const profiles = systemInfo?.activeProfiles?.length
    ? systemInfo.activeProfiles.join(", ")
    : "Nicht verfügbar";

  const fields = [
    ["Umgebung", environment],
    ["Frontend-Version", frontendVersion],
    ["Frontend-Build", formatDateTime(frontendBuildTime)],
    ["Backend-Version", backendVersion],
    ["Backend-Build", backendBuild],
    ["Spring-Profile", profiles],
    ["Benutzername", user?.username ?? "Nicht verfügbar"],
    ["Rolle", user?.role ?? "Nicht verfügbar"],
  ];

  async function handleCopy() {
    const lines = [
      "EMC Mitgliederverwaltung – Systeminformationen",
      "",
      ...fields.map(([label, value]) => `${label}: ${value}`),
      "",
      `Backend-Informationsstand: ${backendStatus}`,
      `Zuletzt erfolgreich abgerufen: ${formatDateTime(lastUpdated)}`,
      `Erfasst am: ${formatDateTime(new Date())}`,
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopyStatus("Informationen kopiert");
    } catch {
      setCopyStatus("Kopieren nicht möglich");
    }
  }

  return (
    <div
      style={overlayStyle}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-info-title"
        style={dialogStyle}
      >
        <div style={headerStyle}>
          <div>
            <h2 id="system-info-title" style={titleStyle}>
              Systeminformationen
            </h2>
            <p style={subtitleStyle}>EMC Mitgliederverwaltung</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            style={closeButtonStyle}
          >
            ×
          </button>
        </div>

        <div style={bodyStyle}>
          <div style={statusStyle} role="status">
            {backendStatus}
          </div>

          <div style={sectionTitleStyle}>Anwendung</div>
          {fields.slice(0, 6).map(([label, value]) => (
            <div key={label} style={fieldRowStyle}>
              <span style={labelStyle}>{label}</span>
              <span style={valueStyle}>{value}</span>
            </div>
          ))}

          <div style={sectionTitleStyle}>Angemeldeter Benutzer</div>
          {fields.slice(6).map(([label, value]) => (
            <div key={label} style={fieldRowStyle}>
              <span style={labelStyle}>{label}</span>
              <span style={valueStyle}>{value}</span>
            </div>
          ))}

          <div style={timestampStyle}>
            Zuletzt erfolgreich abgerufen: {formatDateTime(lastUpdated)}
          </div>
        </div>

        <div style={footerStyle}>
          <span role="status" style={copyStatusStyle}>
            {copyStatus}
          </span>
          <button type="button" onClick={handleCopy} style={copyButtonStyle}>
            Informationen kopieren
          </button>
          <button type="button" onClick={onClose} style={doneButtonStyle}>
            Schließen
          </button>
        </div>
      </section>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  backgroundColor: "rgba(15, 23, 42, 0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "1rem",
};

const dialogStyle = {
  width: "100%",
  maxWidth: "560px",
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: "12px",
  backgroundColor: "#fff",
  boxShadow: "0 16px 48px rgba(0, 0, 0, 0.18)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "1.25rem 1.5rem",
  borderBottom: "1px solid #e5e7eb",
};

const titleStyle = {
  margin: 0,
  fontSize: "1.2rem",
  color: "#172b4d",
};

const subtitleStyle = {
  margin: "0.3rem 0 0",
  fontSize: "0.85rem",
  color: "#64748b",
};

const closeButtonStyle = {
  border: "none",
  background: "transparent",
  fontSize: "1.5rem",
  cursor: "pointer",
  color: "#64748b",
};

const bodyStyle = {
  padding: "1.25rem 1.5rem",
};

const statusStyle = {
  padding: "0.65rem 0.8rem",
  borderRadius: "8px",
  backgroundColor: "#f1f5f9",
  color: "#475569",
  fontSize: "0.8rem",
  marginBottom: "1rem",
};

const sectionTitleStyle = {
  margin: "1.2rem 0 0.5rem",
  fontWeight: 700,
  fontSize: "0.85rem",
  color: "#172b4d",
};

const fieldRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  padding: "0.55rem 0",
  borderBottom: "1px solid #f1f5f9",
};

const labelStyle = {
  fontSize: "0.85rem",
  color: "#64748b",
};

const valueStyle = {
  fontSize: "0.85rem",
  color: "#172b4d",
  fontWeight: 500,
  textAlign: "right",
  overflowWrap: "anywhere",
};

const timestampStyle = {
  marginTop: "1rem",
  fontSize: "0.75rem",
  color: "#64748b",
};

const footerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flexWrap: "wrap",
  gap: "0.6rem",
  padding: "1rem 1.5rem",
  borderTop: "1px solid #e5e7eb",
};

const copyStatusStyle = {
  marginRight: "auto",
  fontSize: "0.75rem",
  color: "#475569",
};

const copyButtonStyle = {
  padding: "0.55rem 0.8rem",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  backgroundColor: "#fff",
  color: "#172b4d",
  cursor: "pointer",
};

const doneButtonStyle = {
  padding: "0.55rem 0.8rem",
  border: "1px solid #234b72",
  borderRadius: "8px",
  backgroundColor: "#234b72",
  color: "#fff",
  cursor: "pointer",
};
