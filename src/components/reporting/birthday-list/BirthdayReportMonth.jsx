import { formatIsoDateToGerman } from "../../../utils/forms/dateHelpers";

export default function BirthdayReportMonth({ group }) {
  return (
    <>
      <tr>
        <th colSpan={6} scope="rowgroup" style={monthHeadingStyle}>
          {group.monatsname}
        </th>
      </tr>

      {group.mitglieder.map((member) => (
        <tr key={member.mitgliedsnummer}>
          <td style={cellStyle}>{member.mitgliedsstatus}</td>
          <td style={cellStyle}>{member.stimme}</td>
          <td style={cellStyle}>{member.vorname}</td>
          <td style={cellStyle}>{member.nachname}</td>

          <td style={cellStyle}>
            {member.geburtsdatum
              ? formatIsoDateToGerman(member.geburtsdatum)
              : "unbekannt"}
          </td>

          <td
            style={{
              ...cellStyle,
              ...(member.jubilaeumsgeburtstag ? jubileeAgeStyle : {}),
            }}
          >
            {member.alterImGeschaeftsjahr ?? ""}
          </td>
        </tr>
      ))}
    </>
  );
}

const monthHeadingStyle = {
  padding: "0.75rem 0.5rem 0.4rem",
  textAlign: "left",
  fontSize: "inherit",
  fontWeight: "bold",
};

const cellStyle = {
  padding: "0.35rem 0.5rem",
  textAlign: "left",
  verticalAlign: "top",
  fontSize: "inherit",
};

const jubileeAgeStyle = {
  color: "#c00000",
  fontWeight: "bold",
};
