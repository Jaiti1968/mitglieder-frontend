export default function MemberHeader({ member }) {
  const stammdaten = member.stammdaten ?? {};
  const mitgliedschaft = member.mitgliedschaft ?? {};

  const isFirma = stammdaten.personFirma === true;

  const displayName = isFirma
    ? stammdaten.nachname || "Firma ohne Namen"
    : [stammdaten.vorname, stammdaten.nachname].filter(Boolean).join(" ") ||
      "Mitglied ohne Namen";

  const subtitle = isFirma ? stammdaten.vorname : null;

  return (
    <header style={headerStyle}>
      <div style={titleRowStyle}>
        <div>
          <h1 style={{ marginBottom: "0.25rem", fontSize: "1.8rem" }}>
            {displayName}
          </h1>

          {subtitle && (
            <p style={{ margin: 0, color: "#555" }}>
              Firmenzusatz: <strong>{subtitle}</strong>
            </p>
          )}
        </div>

        <span style={typeBadgeStyle}>
          {isFirma ? "Firma / Organisation" : "Person"}
        </span>
      </div>

      <p style={{ margin: 0, color: "#555" }}>
        Mitgliedsnummer: <strong>{member.mitgliedsnummer}</strong>
      </p>

      <p style={{ marginTop: "0.5rem", color: "#555" }}>
        {mitgliedschaft.mitgliedsstatus && (
          <span>{mitgliedschaft.mitgliedsstatus}</span>
        )}
        {mitgliedschaft.stimme && <span> · {mitgliedschaft.stimme}</span>}
        {mitgliedschaft.kammerchor && <span> · Kammerchor</span>}
      </p>
    </header>
  );
}

const headerStyle = {
  marginBottom: "1.5rem",
  padding: "1.25rem",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e5ea",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
};

const titleRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "1rem",
};

const typeBadgeStyle = {
  display: "inline-block",
  padding: "0.35rem 0.6rem",
  borderRadius: "999px",
  backgroundColor: "#eef3ff",
  color: "#1f5fbf",
  fontSize: "0.85rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
};
