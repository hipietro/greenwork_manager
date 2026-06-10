import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";
import type { AttendanceRecord } from "../types/attendance";
import type { Employee } from "../types/employee";

type AttendanceFormState = {
  isPresent: boolean;
  checkInTime: string;
  checkOutTime: string;
  notes: string;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyForm(): AttendanceFormState {
  return {
    isPresent: true,
    checkInTime: "",
    checkOutTime: "",
    notes: "",
  };
}

export function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [forms, setForms] = useState<Record<number, AttendanceFormState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingEmployeeId, setSavingEmployeeId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeEmployees = useMemo(
    () => employees.filter((employee) => employee.isActive),
    [employees]
  );

  async function loadData() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [employeesData, attendanceData] = await Promise.all([
        apiRequest<Employee[]>("/employees"),
        apiRequest<AttendanceRecord[]>(`/attendance?date=${selectedDate}`),
      ]);

      setEmployees(employeesData);
      setRecords(attendanceData);

      const nextForms: Record<number, AttendanceFormState> = {};

      employeesData
        .filter((employee) => employee.isActive)
        .forEach((employee) => {
          const record = attendanceData.find(
            (item) => item.employeeId === employee.id
          );

          nextForms[employee.id] = record
            ? {
                isPresent: record.isPresent,
                checkInTime: record.checkInTime || "",
                checkOutTime: record.checkOutTime || "",
                notes: record.notes || "",
              }
            : createEmptyForm();
        });

      setForms(nextForms);
    } catch (error) {
      console.error(error);
      setErrorMessage("Impossibile caricare le presenze.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  function updateForm(
    employeeId: number,
    field: keyof AttendanceFormState,
    value: string | boolean
  ) {
    setForms((current) => ({
      ...current,
      [employeeId]: {
        ...(current[employeeId] || createEmptyForm()),
        [field]: value,
      },
    }));
  }

  async function saveAttendance(employeeId: number) {
    const form = forms[employeeId] || createEmptyForm();

    if (form.isPresent && !form.checkInTime) {
      setErrorMessage("Se il dipendente è presente, inserisci almeno l'ora di entrata.");
      return;
    }

    if (
      form.isPresent &&
      form.checkInTime &&
      form.checkOutTime &&
      form.checkOutTime < form.checkInTime
    ) {
      setErrorMessage("L'ora di uscita non può essere precedente all'ora di entrata.");
      return;
    }

    try {
      setSavingEmployeeId(employeeId);
      setErrorMessage(null);

      await apiRequest<AttendanceRecord>("/attendance", {
        method: "POST",
        body: {
          employeeId,
          date: selectedDate,
          isPresent: form.isPresent,
          checkInTime: form.isPresent ? form.checkInTime : null,
          checkOutTime: form.isPresent ? form.checkOutTime : null,
          notes: form.notes,
        },
      });

      await loadData();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante il salvataggio della presenza.");
    } finally {
      setSavingEmployeeId(null);
    }
  }

  async function deleteAttendance(recordId: number) {
    const confirmed = window.confirm("Vuoi eliminare questa presenza?");

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);

      await apiRequest<null>(`/attendance/${recordId}`, {
        method: "DELETE",
      });

      await loadData();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante l'eliminazione della presenza.");
    }
  }

  function getRecordForEmployee(employeeId: number) {
    return records.find((record) => record.employeeId === employeeId);
  }

  const presentCount = records.filter((record) => record.isPresent).length;
  const absentCount = records.filter((record) => !record.isPresent).length;

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Presenze</h2>
          <p>Registra entrata, uscita e assenze dei dipendenti giorno per giorno.</p>
        </div>

        <label className="date-filter">
          <span>Giorno</span>
          <input
            className="date-input"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
        </label>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="dashboard-grid attendance-summary">
        <div className="stat-card">
          <span>Dipendenti attivi</span>
          <strong>{activeEmployees.length}</strong>
        </div>

        <div className="stat-card">
          <span>Presenti segnati</span>
          <strong>{presentCount}</strong>
        </div>

        <div className="stat-card">
          <span>Assenti segnati</span>
          <strong>{absentCount}</strong>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h3>Timbro giornaliero</h3>
            <p className="panel-subtitle">
              Ogni riga salva o aggiorna la presenza del singolo dipendente.
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="empty-state">Caricamento presenze...</p>
        ) : activeEmployees.length === 0 ? (
          <p className="empty-state">
            Nessun dipendente attivo. Aggiungi prima i dipendenti nella sezione Dipendenti.
          </p>
        ) : (
          <div className="attendance-list">
            {activeEmployees.map((employee) => {
              const form = forms[employee.id] || createEmptyForm();
              const record = getRecordForEmployee(employee.id);

              return (
                <article key={employee.id} className="attendance-row">
                  <div className="attendance-employee">
                    <h4>{employee.fullName}</h4>
                    <p>{employee.phone || "Telefono non indicato"}</p>
                    {record && (
                      <span className="status-badge">
                        {record.isPresent ? "Registrato presente" : "Registrato assente"}
                      </span>
                    )}
                  </div>

                  <label className="form-field compact-field">
                    <span>Stato</span>
                    <select
                      value={form.isPresent ? "present" : "absent"}
                      onChange={(event) =>
                        updateForm(
                          employee.id,
                          "isPresent",
                          event.target.value === "present"
                        )
                      }
                    >
                      <option value="present">Presente</option>
                      <option value="absent">Assente</option>
                    </select>
                  </label>

                  <label className="form-field compact-field">
                    <span>Entrata</span>
                    <input
                      type="time"
                      value={form.checkInTime}
                      disabled={!form.isPresent}
                      onChange={(event) =>
                        updateForm(employee.id, "checkInTime", event.target.value)
                      }
                    />
                  </label>

                  <label className="form-field compact-field">
                    <span>Uscita</span>
                    <input
                      type="time"
                      value={form.checkOutTime}
                      disabled={!form.isPresent}
                      onChange={(event) =>
                        updateForm(employee.id, "checkOutTime", event.target.value)
                      }
                    />
                  </label>

                  <label className="form-field compact-field notes-field">
                    <span>Note</span>
                    <input
                      value={form.notes}
                      onChange={(event) =>
                        updateForm(employee.id, "notes", event.target.value)
                      }
                      placeholder="Es. mezza giornata, ritardo..."
                    />
                  </label>

                  <div className="attendance-actions">
                    <button
                      className="primary-button"
                      type="button"
                      disabled={savingEmployeeId === employee.id}
                      onClick={() => saveAttendance(employee.id)}
                    >
                      {savingEmployeeId === employee.id ? "Salvo..." : "Salva"}
                    </button>

                    {record && (
                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => deleteAttendance(record.id)}
                      >
                        Elimina
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}