import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiRequest } from "../services/api";
import type { Employee } from "../types/employee";

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [showInactive, setShowInactive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadEmployees() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await apiRequest<Employee[]>("/employees");
      setEmployees(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("Impossibile caricare i dipendenti.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  function resetForm() {
    setEditingEmployeeId(null);
    setFullName("");
    setPhone("");
    setNotes("");
  }

  function handleEdit(employee: Employee) {
    setEditingEmployeeId(employee.id);
    setFullName(employee.fullName);
    setPhone(employee.phone || "");
    setNotes(employee.notes || "");
    setErrorMessage(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage("Il nome del dipendente è obbligatorio.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload = {
        fullName,
        phone,
        notes,
      };

      if (editingEmployeeId) {
        await apiRequest<Employee>(`/employees/${editingEmployeeId}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiRequest<Employee>("/employees", {
          method: "POST",
          body: payload,
        });
      }

      resetForm();
      await loadEmployees();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante il salvataggio del dipendente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deactivateEmployee(id: number) {
    try {
      setErrorMessage(null);

      await apiRequest<Employee>(`/employees/${id}/deactivate`, {
        method: "PATCH",
      });

      if (editingEmployeeId === id) {
        resetForm();
      }

      await loadEmployees();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante la disattivazione del dipendente.");
    }
  }

  async function activateEmployee(id: number) {
    try {
      setErrorMessage(null);

      await apiRequest<Employee>(`/employees/${id}/activate`, {
        method: "PATCH",
      });

      await loadEmployees();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante la riattivazione del dipendente.");
    }
  }

  async function deleteEmployee(id: number) {
    const confirmed = window.confirm(
      "Vuoi eliminare definitivamente questo dipendente?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);

      await apiRequest<null>(`/employees/${id}`, {
        method: "DELETE",
      });

      if (editingEmployeeId === id) {
        resetForm();
      }

      await loadEmployees();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante l'eliminazione del dipendente.");
    }
  }

  const activeEmployees = employees.filter((employee) => employee.isActive);
  const inactiveEmployees = employees.filter((employee) => !employee.isActive);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Dipendenti</h2>
          <p>Gestisci l'elenco dei dipendenti attivi e non attivi.</p>
        </div>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="form-title-row">
            <div>
              <h3>{editingEmployeeId ? "Modifica dipendente" : "Nuovo dipendente"}</h3>
              {editingEmployeeId && (
                <p className="panel-subtitle">
                  Stai modificando un dipendente già registrato.
                </p>
              )}
            </div>

            {editingEmployeeId && (
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
            <span>Nome completo</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Es. Mario Rossi"
            />
          </label>

          <label className="form-field">
            <span>Telefono</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Es. 333 1234567"
            />
          </label>

          <label className="form-field">
            <span>Note</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Es. disponibile solo la mattina"
              rows={3}
            />
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Salvataggio..."
              : editingEmployeeId
                ? "Salva modifiche"
                : "Aggiungi dipendente"}
          </button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Dipendenti attivi</h3>
              <p className="panel-subtitle">
                Dipendenti disponibili per presenze e gestione operativa.
              </p>
            </div>
          </div>

          {isLoading ? (
            <p className="empty-state">Caricamento dipendenti...</p>
          ) : activeEmployees.length === 0 ? (
            <p className="empty-state">Nessun dipendente attivo.</p>
          ) : (
            <div className="entity-list">
              {activeEmployees.map((employee) => (
                <article key={employee.id} className="entity-item">
                  <div>
                    <strong>{employee.fullName}</strong>
                    <p>{employee.phone || "Telefono non indicato"}</p>
                    {employee.notes && <p>{employee.notes}</p>}
                  </div>

                  <div className="actions-row">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => handleEdit(employee)}
                    >
                      Modifica
                    </button>

                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => deactivateEmployee(employee.id)}
                    >
                      Disattiva
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="inactive-panel">
            <div className="panel-header compact">
              <div>
                <h3>Dipendenti non attivi</h3>
                <p className="panel-subtitle">
                  Dipendenti rimossi dall'uso quotidiano, ma mantenuti nello storico.
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
                {inactiveEmployees.length === 0 ? (
                  <p className="empty-state">Nessun dipendente non attivo.</p>
                ) : (
                  <div className="entity-list">
                    {inactiveEmployees.map((employee) => (
                      <article key={employee.id} className="entity-item">
                        <div>
                          <strong>{employee.fullName}</strong>
                          <p>{employee.phone || "Telefono non indicato"}</p>
                          {employee.notes && <p>{employee.notes}</p>}
                        </div>

                        <div className="actions-row">
                          <button
                            className="secondary-button"
                            type="button"
                            onClick={() => handleEdit(employee)}
                          >
                            Modifica
                          </button>

                          <button
                            className="secondary-button"
                            type="button"
                            onClick={() => activateEmployee(employee.id)}
                          >
                            Riattiva
                          </button>

                          <button
                            className="danger-button"
                            type="button"
                            onClick={() => deleteEmployee(employee.id)}
                          >
                            Elimina
                          </button>
                        </div>
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