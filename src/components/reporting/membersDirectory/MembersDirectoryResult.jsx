export default function MembersDirectoryResult({ report }) {
  if (!report) {
    return null;
  }

  return (
    <div>
      {report.groups.map((group) => (
        <section key={group.mitgliedsstatus}>
          <h3>
            {group.mitgliedsstatus} (
            {group.stimmgruppen.reduce(
              (sum, sg) => sum + sg.mitglieder.length,
              0,
            )}
            )
          </h3>

          {group.stimmgruppen.map((stimmgruppe) => (
            <div key={`${group.mitgliedsstatus}-${stimmgruppe.stimme}`}>
              <h4>
                {formatStimme(stimmgruppe.stimme)} (
                {stimmgruppe.mitglieder.length})
              </h4>

              <ul>
                {stimmgruppe.mitglieder.map((mitglied) => (
                  <li key={mitglied.mitgliedsnummer}>
                    {mitglied.nachname}, {mitglied.vorname} (
                    {mitglied.mitgliedsnummer})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function formatStimme(stimme) {
  if (!stimme || stimme.toLowerCase() === "keine") {
    return "Ohne Stimme";
  }

  return stimme;
}
