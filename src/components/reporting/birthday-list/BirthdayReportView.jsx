import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useMemberLookups from "../../../hooks/useMemberLookups";
import {
  downloadBirthdayReportPdf,
  getBirthdayReport,
} from "../../../api/reportingApi";
import BirthdayReportFilterPanel from "./BirthdayReportFilterPanel";
import BirthdayReportMonth from "./BirthdayReportMonth";

export default function BirthdayReportView() {
  const [mitgliedsstatusIds, setMitgliedsstatusIds] = useState([]);
  const [stimmeIds, setStimmeIds] = useState([]);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const [pdfError, setPdfError] = useState("");

  const { statuses, voices } = useMemberLookups();

  const {
    data: report,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["birthday-report", mitgliedsstatusIds, stimmeIds],
    queryFn: () =>
      getBirthdayReport({
        mitgliedsstatusIds,
        stimmeIds,
      }),
  });

  const hasActiveFilters =
    mitgliedsstatusIds.length > 0 || stimmeIds.length > 0;

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
    setMitgliedsstatusIds([]);
    setStimmeIds([]);
  }

  async function handleDownloadPdf() {
    setIsDownloadingPdf(true);
    setPdfError("");

    try {
      const pdfBlob = await downloadBirthdayReportPdf({
        mitgliedsstatusIds,
        stimmeIds,
      });

      const downloadUrl = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `geburtstagsliste-${report?.geschaeftsjahr ?? "export"}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      setPdfError(
        error?.message ??
          "PDF der Geburtstagsliste konnte nicht heruntergeladen werden.",
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return (
    <section>
      <h2>Geburtstagsliste</h2>

      <BirthdayReportFilterPanel
        mitgliedsstatusIds={mitgliedsstatusIds}
        stimmeIds={stimmeIds}
        statuses={statuses}
        voices={voices}
        hasActiveFilters={hasActiveFilters}
        onToggleFilter={toggleFilter}
        onResetFilters={resetFilters}
      />

      <div style={actionRowStyle}>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf || !report}
        >
          {isDownloadingPdf ? "PDF wird erstellt ..." : "PDF herunterladen"}
        </button>
      </div>

      {pdfError && <p style={errorStyle}>{pdfError}</p>}

      {isFetching && <p>Lade Geburtstagsliste ...</p>}

      {isError && (
        <p>
          Geburtstagsliste konnte nicht geladen werden:{" "}
          {error?.message ?? "Unbekannter Fehler"}
        </p>
      )}

      {!isError && report && (
        <>
          <p>
            <strong>Geschäftsjahr:</strong> {report.geschaeftsjahr}
          </p>

          {report.monthGroups.length === 0 && <p>Keine Mitglieder gefunden.</p>}

          {report.monthGroups.length > 0 && (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Status</th>
                  <th style={headerCellStyle}>Stimme</th>
                  <th style={headerCellStyle}>Vorname</th>
                  <th style={headerCellStyle}>Nachname</th>
                  <th style={headerCellStyle}>Geburtsdatum</th>
                  <th style={headerCellStyle}>Alter</th>
                </tr>
              </thead>

              <tbody>
                {report.monthGroups.map((group) => (
                  <BirthdayReportMonth
                    key={group.monat ?? "unbekannt"}
                    group={group}
                  />
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </section>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "1rem",
};

const headerCellStyle = {
  padding: "0.5rem",
  textAlign: "left",
  borderBottom: "1px solid #d1d5db",
  fontSize: "inherit",
  fontWeight: 600,
};

const actionRowStyle = {
  display: "flex",
  marginTop: "1rem",
  marginBottom: "1rem",
};

const errorStyle = {
  color: "#b91c1c",
  marginTop: "0.5rem",
};
