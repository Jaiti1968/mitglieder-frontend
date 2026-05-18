export async function login(username, password) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  return handleAuthResponse(response);
}

export async function logout() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (response.status === 204) {
    return null;
  }

  return handleAuthResponse(response);
}

export async function getCurrentUser() {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  return handleAuthResponse(response);
}

async function handleAuthResponse(response) {
  if (response.ok) {
    return response.json();
  }

  let message = `API-Fehler ${response.status}`;

  try {
    const body = await response.json();

    if (body?.message) {
      message = body.message;
    }
  } catch {
    // Antwort war kein JSON.
  }

  const error = new Error(message);
  error.status = response.status;

  throw error;
}
