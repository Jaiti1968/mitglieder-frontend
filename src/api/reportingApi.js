import { apiPost } from "./apiClient";

export async function getMembersDirectoryReport(request) {
  return apiPost("/api/reporting/members-directory/query", request);
}

export async function getBirthdayReport(request) {
  return apiPost("/api/reporting/birthday-list/query", request);
}

export async function downloadMembersDirectoryPdf(request) {
  const response = await fetch("/api/reporting/members-directory/export/pdf", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("PDF konnte nicht erzeugt werden.");
  }

  return response.blob();
}

export async function downloadMembersDirectoryExcel(request) {
  const response = await fetch(
    "/api/reporting/members-directory/export/excel",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );

  if (!response.ok) {
    throw new Error("Excel konnte nicht erzeugt werden.");
  }

  return response.blob();
}

export async function downloadBirthdayReportPdf(request) {
  const response = await fetch("/api/reporting/birthday-list/export/pdf", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("PDF der Geburtstagsliste konnte nicht erzeugt werden.");
  }

  return response.blob();
}
