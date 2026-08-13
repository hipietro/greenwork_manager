import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiRequest, isDemoUser } from "../services/api";
import type { Equipment } from "../types/equipment";

export function EquipmentPage() {
  const canWrite = !isDemoUser();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [editingEquipmentId, setEditingEquipmentId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  const [showInactive, setShowInactive] = useState(false);
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

  function resetForm() {
    setEditingEquipmentId(null);
    setName("");
    setNotes("");
  }

  function handleEdit(item: Equipment) {
    setEditingEquipmentId(item.id);
    setName(item.name);
    setNotes(item.notes || "");
    setErrorMessage(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setErrorMessage("Il nome dell'attrezzatura è obbligatorio.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload = {
        name,
        notes,
      };

      if (editingEquipmentId) {
        await apiRequest<Equipment>(`/equipment/${editingEquipmentId}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiRequest<Equipment>("/equipment", {
          method: "POST",
          body: payload,
        });
      }

      resetForm();
      await loadEquipment();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante il salvataggio dell'attrezzatura.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deactivateEquipment(id: number) {
    try {
      setErrorMessage(null);

      await apiRequest<Equipment>(`/equipment/${id}/deactivate`, {
        method: "PATCH",
      });

      if (editingEquipmentId === id) {
        resetForm();
      }

      await loadEquipment();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante la disattivazione dell'attrezzatura.");
    }
  }

  async function activateEquipment(id: number) {
    try {
      setErrorMessage(null);

      await apiRequest<Equipment>(`/equipment/${id}/activate`, {
        method: "PATCH",
      });

      await loadEquipment();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante la riattivazione dell'attrezzatura.");
    }
  }

  async function deleteEquipment(id: number) {
    const confirmed = window.confirm(
      "Vuoi eliminare definitivamente questa attrezzatura?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);

      await apiRequest<null>(`/equipment/${id}`, {
        method: "DELETE",
      });

      if (editingEquipmentId === id) {
        resetForm();
      }

      await loadEquipment();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante l'eliminazione dell'attrezzatura.");
    }
  }

  const activeEquipment = equipment.filter((item) => item.isActive);
  const inactiveEquipment = equipment.filter((item) => !item.isActive);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Attrezzature</h2>
          <p>Gestisci l'elenco delle attrezzature usate nei cantieri.</p>
        </div>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="content-grid">
        {canWrite && <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="form-title-row">
            <div>
              <h3>{editingEquipmentId ? "Modifica attrezzatura" : "Nuova attrezzatura"}</h3>
              {editingEquipmentId && (
                <p className="panel-subtitle">
                  Stai modificando un'attrezzatura già registrata.
                </p>
              )}
            </div>

            {editingEquipmentId && (
              <button
                className="secondary-button"
                type="button"
                onClick={resetForm}
              >
                Annulla
              </button>
            )}
          </div>

          <label className="form-field">
            <span>Nome attrezzatura</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Es. Tagliaerba"
            />
          </label>

          <label className="form-field">
            <span>Note</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Es. lama da controllare, usare solo per siepi alte..."
              rows={3}
            />
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Salvataggio..."
              : editingEquipmentId
                ? "Salva modifiche"
                : "Aggiungi attrezzatura"}
          </button>
        </form>}

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Attrezzature attive</h3>
              <p className="panel-subtitle">
                Attrezzature disponibili nella creazione dei cantieri.
              </p>
            </div>
          </div>

          {isLoading ? (
            <p className="empty-state">Caricamento attrezzature...</p>
          ) : activeEquipment.length === 0 ? (
            <p className="empty-state">Nessuna attrezzatura attiva.</p>
          ) : (
            <div className="entity-list">
              {activeEquipment.map((item) => (
                <article key={item.id} className="entity-item">
                  <div>
                    <strong>{item.name}</strong>
                    <p>{item.notes || "Nessuna nota"}</p>
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
                      onClick={() => deactivateEquipment(item.id)}
                    >
                      Disattiva
                    </button>
                  </div>}
                </article>
              ))}
            </div>
          )}

          <div className="inactive-panel">
            <div className="panel-header compact">
              <div>
                <h3>Attrezzature non attive</h3>
                <p className="panel-subtitle">
                  Attrezzature non più usate nei nuovi cantieri.
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
                {inactiveEquipment.length === 0 ? (
                  <p className="empty-state">Nessuna attrezzatura non attiva.</p>
                ) : (
                  <div className="entity-list">
                    {inactiveEquipment.map((item) => (
                      <article key={item.id} className="entity-item">
                        <div>
                          <strong>{item.name}</strong>
                          <p>{item.notes || "Nessuna nota"}</p>
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
                            onClick={() => activateEquipment(item.id)}
                          >
                            Riattiva
                          </button>

                          <button
                            className="danger-button"
                            type="button"
                            onClick={() => deleteEquipment(item.id)}
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
      </div>
    </section>
  );
}
