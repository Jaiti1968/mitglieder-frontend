const ENVIRONMENT_STYLES = {
  LOCAL: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
  },
  DEV: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  PROD: {
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
};

export default function EnvironmentBadge({
  environment,
  loading = false,
  error = false,
}) {
  const validEnvironment = Object.prototype.hasOwnProperty.call(
    ENVIRONMENT_STYLES,
    environment,
  );

  const label = loading
    ? "Wird geladen"
    : validEnvironment
      ? environment
      : "Unbekannt";

  const colors = validEnvironment
    ? ENVIRONMENT_STYLES[environment]
    : {
        backgroundColor: "#f3f4f6",
        color: "#4b5563",
      };

  return (
    <span
      style={{
        ...badgeStyle,
        ...colors,
      }}
      title={
        error
          ? "Backend-Systeminformationen konnten nicht aktualisiert werden"
          : "Backend-Laufzeitumgebung"
      }
    >
      {label}
      {error && validEnvironment ? " *" : ""}
    </span>
  );
}

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.35rem 0.7rem",
  borderRadius: "999px",
  fontWeight: 700,
  fontSize: "0.75rem",
  letterSpacing: "0.03em",
  whiteSpace: "nowrap",
  height: "36px",
  boxSizing: "border-box",
};
