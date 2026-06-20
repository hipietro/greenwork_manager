import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, setAuthToken } from "../services/api";

type LoginResponse = {
  token: string;
  user: {
    id: number;
    username: string;
  };
};

export function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim()) {
      setErrorMessage("Inserisci lo username.");
      return;
    }

    if (!password) {
      setErrorMessage("Inserisci la password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        skipAuth: true,
        body: {
          username,
          password,
        },
      });

      setAuthToken(response.token);
      navigate("/");
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante il login.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <span className="brand-icon">🌿</span>
          <div>
            <h1>GreenWork</h1>
            <p>Gestionale giardinaggio</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <h2>Accesso</h2>
            <p>Inserisci le credenziali per accedere al gestionale.</p>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <label className="form-field">
            <span>Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Accesso..." : "Accedi"}
          </button>
        </form>
      </section>
    </main>
  );
}