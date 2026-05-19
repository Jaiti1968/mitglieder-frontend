import { apiGet, apiPost, apiPut } from "./apiClient";

export function getAdminUsers() {
  return apiGet("/api/admin/users");
}

export function createAdminUser(userData) {
  return apiPost("/api/admin/users", userData);
}

export function updateAdminUserRole(userId, role) {
  return apiPut(`/api/admin/users/${userId}/role`, { role });
}

export function updateAdminUserActive(userId, active) {
  return apiPut(`/api/admin/users/${userId}/active`, { active });
}

export function updateAdminUserPassword(userId, password) {
  return apiPut(`/api/admin/users/${userId}/password`, { password });
}
