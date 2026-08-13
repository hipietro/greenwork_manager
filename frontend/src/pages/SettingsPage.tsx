import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiRequest, isDemoUser } from "../services/api";
import type { ConfigItem } from "../types/settings";

type ConfigSectionProps = {
  title: string;
  subtitle: string;
  createLabel: string;
  inputPlaceholder: string;
  endpoint: string;
};

function ConfigSection({
  title,
  subtitle,
  createLabel,
  inputPlaceholder,
  endpoint,
}: ConfigSectionProps) {
  const canWrite = !isDemoUser();
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
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
  }, []);

  function resetForm() {
    setEditingItemId(null);
    setName("");
  }

  function handleEdit(item: ConfigItem) {
    setEditingItemId(item.id);
    setName(item.name);
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage("Il nome è obbligatorio.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      if (editingItemId) {
        await apiRequest<ConfigItem>(`${endpoint}/${editingItemId}`, {
          method: "PUT",
          body: {
            name,
          },
        });
      } else {
        await apiRequest<ConfigItem>(endpoint, {
          method: "POST",
          body: {
            name,
          },
        });
      }

      resetForm();
      await loadItems();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante il salvataggio.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deactivateItem(id: number) {
    try {
      setErrorMessage(null);

      await apiRequest<ConfigItem>(`${endpoint}/${id}/deactivate`, {
        method: "PATCH",
      });

      if (editingItemId === id) {
        resetForm();
      }

      await loadItems();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante la disattivazione.");
    }
  }

  async function activateItem(id: number) {
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

  async function deleteItem(id: number) {
    const confirmed = window.confirm(
      "Vuoi eliminare definitivamente questa voce?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);

      await apiRequest<null>(`${endpoint}/${id}`, {
        method: "DELETE",
      });

      if (editingItemId === id) {
        resetForm();
      }

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
          <p className="panel-subtitle">{subtitle}</p>
        </div>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {canWrite && <form className="inline-form" onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={inputPlaceholder}
        />

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Salvataggio..."
            : editingItemId
              ? "Salva modifiche"
              : createLabel}
        </button>

        {editingItemId && (
          <button
            className="secondary-button"
            type="button"
            onClick={resetForm}
          >
            Annulla
          </button>
        )}
      </form>}

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
                  <strong>{item.name}</strong>
                </div>

                {canWrite && <div className="actions-row">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleEdit(item)}
                  >
                    Modifica
                  </button>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => deactivateItem(item.id)}
                  >
                    Disattiva
                  </button>
                </div>}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="inactive-panel">
        <div className="panel-header compact">
          <div>
            <h4>Voci non attive</h4>
            <p className="panel-subtitle">
              Voci nascoste nei nuovi cantieri, ma mantenute nello storico.
            </p>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={() => setShowInactive((current) => !current)}
          >
            {showInactive ? "Nascondi" : "Mostra"}
          </button>
        </div>

        {showInactive && (
          <>
            {inactiveItems.length === 0 ? (
              <p className="empty-state">Nessuna voce non attiva.</p>
            ) : (
              <div className="entity-list">
                {inactiveItems.map((item) => (
                  <article key={item.id} className="entity-item">
                    <div>
                      <strong>{item.name}</strong>
                    </div>

                    {canWrite && <div className="actions-row">
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => handleEdit(item)}
                      >
                        Modifica
                      </button>

                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => activateItem(item.id)}
                      >
                        Riattiva
                      </button>

                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => deleteItem(item.id)}
                      >
                        Elimina
                      </button>
                    </div>}
                  </article>
                ))}
              </div>
            )}
          </>
        )}
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
          <p>Configura le voci operative usate nei cantieri.</p>
        </div>
      </div>

      <div className="settings-stack">
        <ConfigSection
          title="Tipi intervento"
          subtitle="Gestisci i tipi di lavoro disponibili nella creazione dei cantieri."
          createLabel="Aggiungi tipo"
          inputPlaceholder="Es. Potatura alberi"
          endpoint="/work-types"
        />

        <ConfigSection
          title="Stati cantiere"
          subtitle="Gestisci gli stati disponibili per seguire l'avanzamento dei lavori."
          createLabel="Aggiungi stato"
          inputPlaceholder="Es. Da finire"
          endpoint="/job-statuses"
        />
      </div>
    </section>
  );
}
