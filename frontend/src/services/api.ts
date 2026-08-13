const API_BASE_URL = "/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  skipAuth?: boolean;
};

export type AuthUser = {
  id: number;
  username: string;
  role: "ADMIN" | "DEMO";
};

export function getAuthToken() {
  return localStorage.getItem("greenwork_auth_token");
}

export function setAuthSession(token: string, user: AuthUser) {
  localStorage.setItem("greenwork_auth_token", token);
  localStorage.setItem("greenwork_auth_user", JSON.stringify(user));
}

export function getAuthUser(): AuthUser | null {
  const storedUser = localStorage.getItem("greenwork_auth_user");
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function isDemoUser() {
  return getAuthUser()?.role === "DEMO";
}

export function clearAuthSession() {
  localStorage.removeItem("greenwork_auth_token");
  localStorage.removeItem("greenwork_auth_user");
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = getAuthToken();
  const method = options.method || "GET";

  if (method !== "GET" && !options.skipAuth && isDemoUser()) {
    throw new Error("L'account demo è in sola lettura.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token && !options.skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && !options.skipAuth) {
    clearAuthSession();
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
