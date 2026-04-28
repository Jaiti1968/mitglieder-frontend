const AUTH_STORAGE_KEY = "emcAuth";

export function saveAuth(username, password) {
  const authData = {
    username,
    password,
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
}

export function getAuth() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    clearAuth();
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isLoggedIn() {
  return getAuth() !== null;
}

export function getAuthorizationHeader() {
  const auth = getAuth();

  if (!auth?.username || !auth?.password) {
    return null;
  }

  return `Basic ${btoa(`${auth.username}:${auth.password}`)}`;
}