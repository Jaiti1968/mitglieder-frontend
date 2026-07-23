import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useMemberLookups from "../hooks/useMemberLookups";
import MembersDirectoryFilterPanel from "../components/reporting/membersDirectory/MembersDirectoryFilterPanel";
import MembersDirectoryResult from "../components/reporting/membersDirectory/MembersDirectoryResult";
import {
  getMembersDirectoryReport,
  downloadMembersDirectoryPdf,
  downloadMembersDirectoryExcel,
} from "../api/reportingApi";
import BackLink from "../components/common/BackLink";

export default function ReportingMembersDirectoryPage({ embedded = false }) {
  const [search, setSearch] = useState("");
  const [mitgliedsstatusIds, setMitgliedsstatusIds] = useState([]);
  const [stimmeIds, setStimmeIds] = useState([]);
  const [kammerchor, setKammerchor] = useState(false);

  const searchIsValid = search.length === 0 || search.length >= 3;

  const { statuses, voices } = useMemberLookups();

  const {
    data: report,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "members-directory-report",
      search,
      mitgliedsstatusIds,
      stimmeIds,
      kammerchor,
    ],
    queryFn: () =>
      getMembersDirectoryReport({
        search,
        mitgliedsstatusIds,
        stimmeIds,
        kammerchor: kammerchor ? true : null,
      }),
    enabled: searchIsValid,
  });

  const totalMembers =
    report?.groups?.reduce(
      (statusSum, group) =>
        statusSum +
        group.stimmgruppen.reduce(
          (voiceSum, stimmgruppe) => voiceSum + stimmgruppe.mitglieder.length,
          0,
        ),
      0,
    ) ?? 0;

  const hasActiveFilters =
    search.length > 0 ||
    mitgliedsstatusIds.length > 0 ||
    stimmeIds.length > 0 ||
    kammerchor;

  function toggleFilter(filterName, value) {
    const stringValue = String(value);

    if (filterName === "mitgliedsstatusId") {
      setMitgliedsstatusIds((current) =>
        current.includes(stringValue)
          ? current.filter((id) => id !== stringValue)
          : [...current, stringValue],
      );
    }

    if (filterName === "stimmeId") {
      setStimmeIds((current) =>
        current.includes(stringValue)
          ? current.filter((id) => id !== stringValue)
          : [...current, stringValue],
      );
    }
  }

  function resetFilters() {
    setSearch("");
    setMitgliedsstatusIds([]);
    setStimmeIds([]);
    setKammerchor(false);
  }

  async function handleDownloadPdf() {
    const blob = await downloadMembersDirectoryPdf({
      search,
      mitgliedsstatusIds,
      stimmeIds,
      kammerchor: kammerchor ? true : null,
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mitgliederverzeichnis.pdf";
    link.click();

    window.URL.revokeObjectURL(url);
  }

  async function handleDownloadExcel() {
    const blob = await downloadMembersDirectoryExcel({
      search,
      mitgliedsstatusIds,
      stimmeIds,
      kammerchor: kammerchor ? true : null,
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mitgliederverzeichnis.xlsx";
    link.click();

    window.URL.revokeObjectURL(url);
  }

  return (
    <section>
      {!embedded && (
        <>
          <BackLink to="/members">Zur Mitgliederliste</BackLink>

          <h1>Reporting</h1>
        </>
      )}

      <h2>Mitgliederverzeichnis</h2>

      <MembersDirectoryFilterPanel
        search={search}
        mitgliedsstatusIds={mitgliedsstatusIds}
        stimmeIds={stimmeIds}
        statuses={statuses}
        voices={voices}
        kammerchor={kammerchor}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearch}
        onToggleFilter={toggleFilter}
        onToggleKammerchor={() => setKammerchor((current) => !current)}
        onResetFilters={resetFilters}
      />

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginTop: "1rem",
          marginBottom: "1rem",
        }}
      >
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={!searchIsValid}
        >
          PDF herunterladen
        </button>

        <button
          type="button"
          onClick={handleDownloadExcel}
          disabled={!searchIsValid}
        >
          Excel herunterladen
        </button>
      </div>

      {!searchIsValid && (
        <p>Bitte mindestens 3 Zeichen für die Suche eingeben.</p>
      )}

      {isFetching && <p>Lade Mitgliederverzeichnis ...</p>}

      {isError && (
        <p>
          Mitgliederverzeichnis konnte nicht geladen werden:{" "}
          {error?.message ?? "Unbekannter Fehler"}
        </p>
      )}

      {!isError && report && <p>Angezeigte Mitglieder: {totalMembers}</p>}

      {!isError && report && totalMembers === 0 && (
        <p>Keine Mitglieder gefunden.</p>
      )}

      {!isError && report && totalMembers > 0 && (
        <MembersDirectoryResult report={report} />
      )}
    </section>
  );
}
