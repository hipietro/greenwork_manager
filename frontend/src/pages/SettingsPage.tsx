import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiRequest } from "../services/api";
import type { ConfigItem } from "../types/settings";

type ConfigSectionProps = {
  title: string;
  description: string;
  endpoint: string;
  nameLabel: string;
  placeholder: string;
};

function ConfigSection({
  title,
  description,
  endpoint,
  nameLabel,
  placeholder,
}: ConfigSectionProps) {
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [name, setName] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadItems() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await apiRequest<ConfigItem[]>(endpoint);
      setItems(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Impossibile caricare i dati.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [endpoint]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage("Il nome è obbligatorio.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await apiRequest<ConfigItem>(endpoint, {
        method: "POST",
        body: {
          name,
        },
      });

      setName("");
      await loadItems();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante il salvataggio.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate(id: number) {
    const confirmed = window.confirm("Vuoi disattivare questa voce?");

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);

      await apiRequest<ConfigItem>(`${endpoint}/${id}/deactivate`, {
        method: "PATCH",
      });

      await loadItems();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante la disattivazione.");
    }
  }

  async function handleActivate(id: number) {
    try {
      setErrorMessage(null);

      await apiRequest<ConfigItem>(`${endpoint}/${id}/activate`, {
        method: "PATCH",
      });

      await loadItems();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante la riattivazione.");
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Vuoi eliminare definitivamente questa voce? L'operazione non può essere annullata."
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);

      await apiRequest<null>(`${endpoint}/${id}`, {
        method: "DELETE",
      });

      await loadItems();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante l'eliminazione.");
    }
  }

  const activeItems = items.filter((item) => item.isActive);
  const inactiveItems = items.filter((item) => !item.isActive);

  return (
    <div className="panel settings-section">
      <div className="panel-header">
        <div>
          <h3>{title}</h3>
          <p className="panel-subtitle">{description}</p>
        </div>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <form className="inline-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>{nameLabel}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={placeholder}
          />
        </label>

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvataggio..." : "Aggiungi"}
        </button>
      </form>

      <div className="settings-list-block">
        <h4>Voci attive</h4>

        {isLoading ? (
          <p className="empty-state">Caricamento...</p>
        ) : activeItems.length === 0 ? (
          <p className="empty-state">Nessuna voce attiva.</p>
        ) : (
          <div className="entity-list">
            {activeItems.map((item) => (
              <article key={item.id} className="entity-item">
                <div>
                  <h4>{item.name}</h4>
                </div>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => handleDeactivate(item.id)}
                >
                  Disattiva
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="settings-list-block">
        <div className="panel-header compact">
          <div>
            <h4>Voci disattivate</h4>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={() => setShowInactive((value) => !value)}
          >
            {showInactive ? "Nascondi" : `Mostra (${inactiveItems.length})`}
          </button>
        </div>

        {showInactive &&
          (inactiveItems.length === 0 ? (
            <p className="empty-state">Nessuna voce disattivata.</p>
          ) : (
            <div className="entity-list">
              {inactiveItems.map((item) => (
                <article key={item.id} className="entity-item muted">
                  <div>
                    <h4>{item.name}</h4>
                  </div>

                  <div className="actions-row">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => handleActivate(item.id)}
                    >
                      Riattiva
                    </button>

                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => handleDelete(item.id)}
                    >
                      Elimina
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Impostazioni</h2>
          <p>Personalizza le liste operative usate nell’applicazione.</p>
        </div>
      </div>

      <div className="settings-stack">
        <ConfigSection
          title="Tipi di intervento"
          description="Gestisci i tipi di lavoro usati nei cantieri."
          endpoint="/work-types"
          nameLabel="Nome tipo intervento"
          placeholder="Es. Posa prato sintetico"
        />

        <ConfigSection
          title="Stati cantiere"
          description="Gestisci gli stati disponibili per i cantieri."
          endpoint="/job-statuses"
          nameLabel="Nome stato cantiere"
          placeholder="Es. Da richiamare"
        />
      </div>
    </section>
  );
}