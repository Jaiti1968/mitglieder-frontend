import { apiGet, apiPut } from "./apiClient";

export function getMembers({
  page = 1,
  pageSize = 20,
  search = "",
  statusId = "",
  stimmeId = "",
} = {}) {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("pageSize", pageSize);

  if (search) params.set("search", search);
  if (statusId) params.set("statusId", statusId);
  if (stimmeId) params.set("stimmeId", stimmeId);

  return apiGet(`/api/members?${params.toString()}`);
}

export function getMember(mitgliedsnummer) {
  return apiGet(`/api/members/${mitgliedsnummer}`);
}

export function updateStammdaten(mitgliedsnummer, stammdaten) {
  return apiPut(`/api/members/${mitgliedsnummer}/stammdaten`, stammdaten);
}

export function updateKontakt(mitgliedsnummer, kontakt) {
  return apiPut(`/api/members/${mitgliedsnummer}/kontakt`, kontakt);
}

export function updateMitgliedschaft(mitgliedsnummer, mitgliedschaft) {
  return apiPut(`/api/members/${mitgliedsnummer}/mitgliedschaft`, mitgliedschaft);
}