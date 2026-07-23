import { useState } from "react";
import BackLink from "../components/common/BackLink";
import ReportingMembersDirectoryPage from "./ReportingMembersDirectoryPage";
import {
  REPORT_OPTIONS,
  REPORT_TYPES,
} from "../components/reporting/reportTypes";
import BirthdayReportView from "../components/reporting/birthday-list/BirthdayReportView";

export default function ReportingPage() {
  const [selectedReport, setSelectedReport] = useState(
    REPORT_TYPES.MEMBERS_DIRECTORY,
  );

  return (
    <main>
      <BackLink to="/members">Zur Mitgliederliste</BackLink>
      <h1>Reporting</h1>

      <section style={sectionStyle}>
        <label htmlFor="reportType" style={labelStyle}>
          Bericht
        </label>

        <select
          id="reportType"
          value={selectedReport}
          onChange={(event) => setSelectedReport(event.target.value)}
          style={selectStyle}
        >
          {REPORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </section>

      {selectedReport === REPORT_TYPES.MEMBERS_DIRECTORY && (
        <ReportingMembersDirectoryPage embedded />
      )}

      {selectedReport === REPORT_TYPES.BIRTHDAY_LIST && <BirthdayReportView />}
    </main>
  );
}

const sectionStyle = {
  marginBottom: "1.5rem",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.4rem",
  fontWeight: 600,
};

const selectStyle = {
  minWidth: "260px",
  padding: "0.45rem 0.6rem",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  backgroundColor: "#ffffff",
};
