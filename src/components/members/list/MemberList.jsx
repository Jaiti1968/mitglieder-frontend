import { Link } from "react-router-dom";

export default function MemberList({ members, searchParams }) {
  if (!members || members.length === 0) return null;

  return (
    <div style={listStyle}>
      {members.map((member) => {
        const display = getMemberDisplay(member);

        return (
          <Link
            key={member.mitgliedsnummer}
            to={`/members/${member.mitgliedsnummer}?${searchParams.toString()}`}
            className="member-card"
          >
            <div>
              <strong>{display.name}</strong>

              {display.subtitle && (
                <div style={{ color: "#666", fontSize: "0.9rem" }}>
                  {display.subtitle}
                </div>
              )}

              <div style={{ color: "#666", fontSize: "0.9rem" }}>
                Nr. {member.mitgliedsnummer}
              </div>
            </div>

            <div style={badgeContainer}>
              {display.isFirma && (
                <Badge type="neutral">Firma / Organisation</Badge>
              )}

              {member.ort && <Badge type="neutral">{member.ort}</Badge>}

              {member.mitgliedsstatus && (
                <Badge type={getStatusType(member.mitgliedsstatus)}>
                  {member.mitgliedsstatus}
                </Badge>
              )}

              {member.stimme && <Badge type="voice">{member.stimme}</Badge>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ---------- Fachliche Anzeige ---------- */

function getMemberDisplay(member) {
  const isFirma = member.personFirma === true;

  if (isFirma) {
    return {
      isFirma,
      name: member.nachname || "Firma ohne Namen",
      subtitle: member.vorname ? `Firmenzusatz: ${member.vorname}` : null,
    };
  }

  return {
    isFirma,
    name:
      [member.vorname, member.nachname].filter(Boolean).join(" ") ||
      "Mitglied ohne Namen",
    subtitle: null,
  };
}

/* ---------- UI ---------- */

function Badge({ children, type = "default" }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

function getStatusType(status) {
  if (!status) return "default";

  const s = status.toLowerCase();

  if (s.includes("verstorben")) return "danger";
  if (s.includes("nichtmitglied")) return "danger";
  if (s.includes("aktiv")) return "success";
  if (s.includes("kandidat")) return "success";

  return "default";
}

/* ---------- Styles ---------- */

const listStyle = {
  display: "grid",
  gap: "0.75rem",
};

const badgeContainer = {
  display: "flex",
  gap: "0.4rem",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};
