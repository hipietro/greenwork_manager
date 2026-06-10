import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiRequest } from "../services/api";
import type { Employee } from "../types/employee";

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage("Il nome del dipendente è obbligatorio.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await apiRequest<Employee>("/employees", {
        method: "POST",
        body: {
          fullName,
          phone,
          notes,
        },
      });

      setFullName("");
      setPhone("");
      setNotes("");
      await loadEmployees();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante il salvataggio del dipendente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivate(id: number) {
    const confirmed = window.confirm(
      "Vuoi disattivare questo dipendente? Non verrà più mostrato tra quelli attivi."
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);

      await apiRequest<Employee>(`/employees/${id}/deactivate`, {
        method: "PATCH",
      });

      await loadEmployees();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante la disattivazione del dipendente.");
    }
  }

  async function handleActivate(id: number) {
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

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Vuoi eliminare definitivamente questo dipendente? L'operazione non può essere annullata."
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);

      await apiRequest<null>(`/employees/${id}`, {
        method: "DELETE",
      });

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
          <p>Gestisci l’elenco dei dipendenti attivi e non attivi.</p>
        </div>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="content-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h3>Nuovo dipendente</h3>

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
              placeholder="Es. 3331234567"
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
            {isSubmitting ? "Salvataggio..." : "Salva dipendente"}
          </button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Dipendenti attivi</h3>
              <p className="panel-subtitle">
                Questi dipendenti sono attualmente disponibili nell’elenco aziendale.
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
                    <h4>{employee.fullName}</h4>
                    {employee.phone && <p>{employee.phone}</p>}
                    {employee.notes && <p>{employee.notes}</p>}
                  </div>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => handleDeactivate(employee.id)}
                  >
                    Disattiva
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel inactive-panel">
        <div className="panel-header">
          <div>
            <h3>Dipendenti disattivati</h3>
            <p className="panel-subtitle">
              I dipendenti disattivati non vengono mostrati tra quelli attivi.
            </p>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={() => setShowInactive((value) => !value)}
          >
            {showInactive ? "Nascondi" : `Mostra (${inactiveEmployees.length})`}
          </button>
        </div>

        {showInactive &&
          (inactiveEmployees.length === 0 ? (
            <p className="empty-state">Nessun dipendente disattivato.</p>
          ) : (
            <div className="entity-list">
              {inactiveEmployees.map((employee) => (
                <article key={employee.id} className="entity-item muted">
                  <div>
                    <h4>{employee.fullName}</h4>
                    {employee.phone && <p>{employee.phone}</p>}
                    {employee.notes && <p>{employee.notes}</p>}
                  </div>

                  <div className="actions-row">
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => handleActivate(employee.id)}
                    >
                      Riattiva
                    </button>

                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => handleDelete(employee.id)}
                    >
                      Elimina
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ))}
      </div>
    </section>
  );
}