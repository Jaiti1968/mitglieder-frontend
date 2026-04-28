export default function MemberHeader({ member }) {
  const stammdaten = member.stammdaten ?? {};
  const mitgliedschaft = member.mitgliedschaft ?? {};

  return (
    <header style={headerStyle}>
      <h1 style={{ marginBottom: "0.25rem", fontSize: "1.8rem" }}>
        {stammdaten.vorname} {stammdaten.nachname}
      </h1>

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