import { apiGet, apiPost, apiPut } from "./apiClient";

export function getMembers({
  page = 1,
  pageSize = 20,
  search = "",
  statusIds = [],
  stimmeIds = [],
} = {}) {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("pageSize", pageSize);

  if (search) {
    params.set("search", search);
  }

  statusIds.forEach((id) => {
    params.append("statusId", id);
  });

  stimmeIds.forEach((id) => {
    params.append("stimmeId", id);
  });

  return apiGet(`/api/members?${params.toString()}`);
}

export function getMember(mitgliedsnummer) {
  return apiGet(`/api/members/${mitgliedsnummer}`);
}

export function createMember(member) {
  return apiPost("/api/members", member);
}

export function updateStammdaten(mitgliedsnummer, stammdaten) {
  return apiPut(`/api/members/${mitgliedsnummer}/stammdaten`, stammdaten);
}

export function updateKontakt(mitgliedsnummer, kontakt) {
  return apiPut(`/api/members/${mitgliedsnummer}/kontakt`, kontakt);
}

export function updateMitgliedschaft(mitgliedsnummer, mitgliedschaft) {
  return apiPut(
    `/api/members/${mitgliedsnummer}/mitgliedschaft`,
    mitgliedschaft
  );
}