import { apiGet, apiPost, apiPut, apiDelete } from "./apiClient";

export function getMemberHonors(mitgliedsnummer) {
  return apiGet(`/api/members/${mitgliedsnummer}/honors`);
}

export function createMemberHonor(mitgliedsnummer, honor) {
  return apiPost(`/api/members/${mitgliedsnummer}/honors`, honor);
}

export function updateMemberHonor(mitgliedsnummer, honorId, honor) {
  return apiPut(`/api/members/${mitgliedsnummer}/honors/${honorId}`, honor);
}

export function deleteMemberHonor(mitgliedsnummer, honorId) {
  return apiDelete(`/api/members/${mitgliedsnummer}/honors/${honorId}`);
}
