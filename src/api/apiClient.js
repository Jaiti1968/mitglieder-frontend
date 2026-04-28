import { getAuthorizationHeader, clearAuth } from "../auth/authStorage";

async function handleResponse(response) {
  if (response.ok) {
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // 🔴 WICHTIG: 401 behandeln
  if (response.status === 401) {
    clearAuth();

    // Weiterleitung zum Login
    window.location.href = "/login";

    throw new Error("Nicht autorisiert");
  }

  let errorMessage = `API-Fehler ${response.status}`;

  try {
    const errorBody = await response.json();
    if (errorBody.message) {
      errorMessage = errorBody.message;
    }
  } catch {}

  throw new Error(errorMessage);
}

function createHeaders(extraHeaders = {}) {
  const headers = {
    ...extraHeaders,
  };

  const authHeader = getAuthorizationHeader();

  if (authHeader) {
    headers.Authorization = authHeader;
  }

  return headers;
}

export async function apiGet(path) {
  const response = await fetch(path, {
    headers: createHeaders(),
  });

  return handleResponse(response);
}

export async function apiPost(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: createHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}

export async function apiPut(path, body) {
  const response = await fetch(path, {
    method: "PUT",
    headers: createHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}