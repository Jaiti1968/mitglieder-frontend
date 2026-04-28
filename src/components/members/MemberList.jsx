import { Link } from "react-router-dom";

export default function MemberList({ members, searchParams }) {
  if (!members || members.length === 0) return null;

  return (
    <div style={listStyle}>
      {members.map((member) => (
        <Link
          key={member.mitgliedsnummer}
          to={`/members/${member.mitgliedsnummer}?${searchParams.toString()}`}
          className="member-card"
        >
          <div>
            <strong>
              {member.vorname} {member.nachname}
            </strong>
            <div style={{ color: "#666", fontSize: "0.9rem" }}>
              Nr. {member.mitgliedsnummer}
            </div>
          </div>

          <div style={badgeContainer}>
            {member.ort && <Badge type="neutral">{member.ort}</Badge>}

            {member.mitgliedsstatus && (
              <Badge type={getStatusType(member.mitgliedsstatus)}>
                {member.mitgliedsstatus}
              </Badge>
            )}

            {member.stimme && <Badge type="voice">{member.stimme}</Badge>}
          </div>
        </Link>
      ))}
    </div>
  );
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