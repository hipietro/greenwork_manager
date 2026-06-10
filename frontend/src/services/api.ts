const API_BASE_URL = "http://localhost:3000/api";

export async function apiRequest<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error("Errore durante la comunicazione con il server.");
  }

  return response.json() as Promise<T>;
}