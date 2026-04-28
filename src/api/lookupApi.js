import { apiGet } from "./apiClient";

export function getMemberStatuses() {
  return apiGet("/api/lookups/member-status");
}

export function getVoices() {
  return apiGet("/api/lookups/voices");
}