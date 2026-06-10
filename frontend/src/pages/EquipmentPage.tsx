import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import type { Equipment } from "../types/equipment";

export function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadEquipment() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await apiRequest<Equipment[]>("/equipment");
      setEquipment(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Impossibile caricare le attrezzature.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEquipment();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage("Il nome dell'attrezzatura è obbligatorio.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await apiRequest<Equipment>("/equipment", {
        method: "POST",
        body: {
          name,
          notes,
        },
      });

      setName("");
      setNotes("");
      await loadEquipment();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante il salvataggio dell'attrezzatura.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate(id: number) {
    const confirmed = window.confirm(
      "Vuoi disattivare questa attrezzatura? Non verrà eliminata dallo storico."
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);

      await apiRequest<Equipment>(`/equipment/${id}/deactivate`, {
        method: "PATCH",
      });

      await loadEquipment();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante la disattivazione dell'attrezzatura.");
    }
  }

  const activeEquipment = equipment.filter((item) => item.isActive);
  const inactiveEquipment = equipment.filter((item) => !item.isActive);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Attrezzature</h2>
          <p>Gestisci le attrezzature utilizzabili nei cantieri.</p>
        </div>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h3>Nuova attrezzatura</h3>

          <label className="form-field">
            <span>Nome attrezzatura</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Es. Tagliaerba Honda"
            />
          </label>

          <label className="form-field">
            <span>Note</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Note opzionali"
              rows={4}
            />
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvataggio..." : "Salva attrezzatura"}
          </button>
        </form>

        <div className="panel">
          <h3>Attrezzature attive</h3>

          {isLoading ? (
            <p className="empty-state">Caricamento attrezzature...</p>
          ) : activeEquipment.length === 0 ? (
            <p className="empty-state">Nessuna attrezzatura attiva.</p>
          ) : (
            <div className="entity-list">
              {activeEquipment.map((item) => (
                <article key={item.id} className="entity-item">
                  <div>
                    <h4>{item.name}</h4>
                    {item.notes && <p>{item.notes}</p>}
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
      </div>

      {inactiveEquipment.length > 0 && (
        <div className="panel inactive-panel">
          <h3>Attrezzature disattivate</h3>

          <div className="entity-list">
            {inactiveEquipment.map((item) => (
              <article key={item.id} className="entity-item muted">
                <div>
                  <h4>{item.name}</h4>
                  {item.notes && <p>{item.notes}</p>}
                </div>

                <span className="status-badge">Disattivata</span>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}