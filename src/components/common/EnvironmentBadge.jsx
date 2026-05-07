export default function EnvironmentBadge() {
  const envName = "localhost";
  const proxyTarget = "localhost:8080";

  return (
    <div style={containerStyle}>
      <span style={badgeStyle}>{envName}</span>

      <span style={urlStyle}>Proxy → {proxyTarget}</span>
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
