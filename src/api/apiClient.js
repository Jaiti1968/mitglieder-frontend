async function handleResponse(response) {
  if (response.ok) {
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("Nicht autorisiert");
  }

  let errorBody = null;
  let errorMessage = `API-Fehler ${response.status}`;

  try {
    errorBody = await response.json();

    if (errorBody?.message) {
      errorMessage = errorBody.message;
    }
  } catch {
    // Antwort war kein JSON
  }

  const apiError = new Error(errorMessage);

  apiError.status = response.status;
  apiError.error = errorBody?.error;
  apiError.path = errorBody?.path;
  apiError.requestId = errorBody?.requestId;
  apiError.validationErrors = Array.isArray(errorBody?.validationErrors)
    ? errorBody.validationErrors
    : [];
  apiError.body = errorBody;

  throw apiError;
}

function createRequestOptions(method = "GET", body = null) {
  const options = {
    method,
    credentials: "include",
    headers: {},
  };

  if (body !== null) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  return options;
}

export async function apiGet(path) {
  const response = await fetch(path, createRequestOptions("GET"));
  return handleResponse(response);
}

export async function apiPost(path, body) {
  const response = await fetch(path, createRequestOptions("POST", body));
  return handleResponse(response);
}

export async function apiPut(path, body) {
  const response = await fetch(path, createRequestOptions("PUT", body));
  return handleResponse(response);
}
