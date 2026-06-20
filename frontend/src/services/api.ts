const API_BASE_URL = "http://localhost:3000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  skipAuth?: boolean;
};

export function getAuthToken() {
  return localStorage.getItem("greenwork_auth_token");
}

export function setAuthToken(token: string) {
  localStorage.setItem("greenwork_auth_token", token);
}

export function clearAuthToken() {
  localStorage.removeItem("greenwork_auth_token");
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token && !options.skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && !options.skipAuth) {
    clearAuthToken();
    window.location.href = "/login";
    throw new Error("Sessione scaduta. Effettua di nuovo l'accesso.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || "Errore durante la comunicazione con il server."
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}