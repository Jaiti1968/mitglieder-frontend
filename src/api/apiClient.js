async function handleResponse(response) {
  if (response.ok) {
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  let errorMessage = `API-Fehler ${response.status}`;

  try {
    const errorBody = await response.json();

    if (errorBody.message) {
      errorMessage = errorBody.message;
    }
  } catch {
    // Falls keine JSON-Fehlerantwort kommt, bleibt die Standardmeldung.
  }

  throw new Error(errorMessage);
}

export async function apiGet(path) {
  const response = await fetch(path);
  return handleResponse(response);
}

export async function apiPut(path, body) {
  const response = await fetch(path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}