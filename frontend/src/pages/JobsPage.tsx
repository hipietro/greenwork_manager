import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiRequest } from "../services/api";
import type { Equipment } from "../types/equipment";
import type { Job } from "../types/job";
import type { ConfigItem } from "../types/settings";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function toInputDate(date: string | null) {
  if (!date) {
    return "";
  }

  return new Date(date).toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workTypes, setWorkTypes] = useState<ConfigItem[]>([]);
  const [jobStatuses, setJobStatuses] = useState<ConfigItem[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  const [editingJobId, setEditingJobId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [scheduledDate, setScheduledDate] = useState(getTodayDate());
  const [scheduledEndDate, setScheduledEndDate] = useState("");
  const [scheduledStartTime, setScheduledStartTime] = useState("");
  const [scheduledEndTime, setScheduledEndTime] = useState("");
  const [workTypeId, setWorkTypeId] = useState("");
  const [jobStatusId, setJobStatusId] = useState("");
  const [equipmentIds, setEquipmentIds] = useState<number[]>([]);
  const [operationalNotes, setOperationalNotes] = useState("");
  const [finalNotes, setFinalNotes] = useState("");

  const [selectedFilterDate, setSelectedFilterDate] = useState(getTodayDate());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadInitialData() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [jobsData, workTypesData, jobStatusesData, equipmentData] =
        await Promise.all([
          apiRequest<Job[]>(`/jobs?date=${selectedFilterDate}`),
          apiRequest<ConfigItem[]>("/work-types"),
          apiRequest<ConfigItem[]>("/job-statuses"),
          apiRequest<Equipment[]>("/equipment"),
        ]);

      setJobs(jobsData);
      setWorkTypes(workTypesData);
      setJobStatuses(jobStatusesData);
      setEquipment(equipmentData);
    } catch (error) {
      console.error(error);
      setErrorMessage("Impossibile caricare i dati dei cantieri.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, [selectedFilterDate]);

  function toggleEquipment(id: number) {
    setEquipmentIds((current) =>
      current.includes(id)
        ? current.filter((equipmentId) => equipmentId !== id)
        : [...current, id]
    );
  }

  function resetForm() {
    setEditingJobId(null);
    setTitle("");
    setCustomerName("");
    setAddress("");
    setScheduledDate(getTodayDate());
    setScheduledEndDate("");
    setScheduledStartTime("");
    setScheduledEndTime("");
    setWorkTypeId("");
    setJobStatusId("");
    setEquipmentIds([]);
    setOperationalNotes("");
    setFinalNotes("");
  }

  function handleEdit(job: Job) {
    setEditingJobId(job.id);
    setTitle(job.title);
    setCustomerName(job.customerName || "");
    setAddress(job.address || "");
    setScheduledDate(toInputDate(job.scheduledDate));
    setScheduledEndDate(toInputDate(job.scheduledEndDate));
    setScheduledStartTime(job.scheduledStartTime || "");
    setScheduledEndTime(job.scheduledEndTime || "");
    setWorkTypeId(job.workTypeId ? String(job.workTypeId) : "");
    setJobStatusId(job.jobStatusId ? String(job.jobStatusId) : "");
    setEquipmentIds(job.equipment.map((item) => item.equipmentId));
    setOperationalNotes(job.operationalNotes || "");
    setFinalNotes(job.finalNotes || "");
    setErrorMessage(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Il titolo del cantiere è obbligatorio.");
      return;
    }

    if (!scheduledDate) {
      setErrorMessage("La data di inizio del cantiere è obbligatoria.");
      return;
    }

    if (scheduledEndDate && scheduledEndDate < scheduledDate) {
      setErrorMessage("La data di fine non può essere precedente alla data di inizio.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload = {
        title,
        customerName,
        address,
        scheduledDate,
        scheduledEndDate: scheduledEndDate || null,
        scheduledStartTime,
        scheduledEndTime,
        workTypeId: workTypeId ? Number(workTypeId) : null,
        jobStatusId: jobStatusId ? Number(jobStatusId) : null,
        equipmentIds,
        operationalNotes,
        finalNotes,
      };

      if (editingJobId) {
        await apiRequest<Job>(`/jobs/${editingJobId}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiRequest<Job>("/jobs", {
          method: "POST",
          body: payload,
        });
      }

      setSelectedFilterDate(scheduledDate);
      resetForm();
      await loadInitialData();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante il salvataggio del cantiere.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Vuoi eliminare definitivamente questo cantiere?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage(null);

      await apiRequest<null>(`/jobs/${id}`, {
        method: "DELETE",
      });

      if (editingJobId === id) {
        resetForm();
      }

      await loadInitialData();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Errore durante l'eliminazione del cantiere.");
    }
  }

  const activeWorkTypes = workTypes.filter((item) => item.isActive);
  const activeJobStatuses = jobStatuses.filter((item) => item.isActive);
  const activeEquipment = equipment.filter((item) => item.isActive);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Cantieri</h2>
          <p>Gestisci gli interventi giornalieri e lo storico dei lavori.</p>
        </div>

        <label className="date-filter">
          <span>Filtra per data</span>
          <input
            className="date-input"
            type="date"
            value={selectedFilterDate}
            onChange={(event) => setSelectedFilterDate(event.target.value)}
          />
        </label>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="content-grid wide-form">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="form-title-row">
            <div>
              <h3>{editingJobId ? "Modifica cantiere" : "Nuovo cantiere"}</h3>
              {editingJobId && (
                <p className="panel-subtitle">
                  Stai modificando un cantiere già registrato.
                </p>
              )}
            </div>

            {editingJobId && (
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
            <span>Titolo intervento</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Es. Taglio siepi cortile interno"
            />
          </label>

          <label className="form-field">
            <span>Cliente / luogo</span>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Es. Condominio Verdi"
            />
          </label>

          <label className="form-field">
            <span>Indirizzo</span>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Es. Via Roma 12"
            />
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Data inizio</span>
              <input
                type="date"
                value={scheduledDate}
                onChange={(event) => setScheduledDate(event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Data fine</span>
              <input
                type="date"
                value={scheduledEndDate}
                onChange={(event) => setScheduledEndDate(event.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="form-field">
              <span>Ora inizio</span>
              <input
                type="time"
                value={scheduledStartTime}
                onChange={(event) => setScheduledStartTime(event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Ora fine</span>
              <input
                type="time"
                value={scheduledEndTime}
                onChange={(event) => setScheduledEndTime(event.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label className="form-field">
              <span>Tipo intervento</span>
              <select
                value={workTypeId}
                onChange={(event) => setWorkTypeId(event.target.value)}
              >
                <option value="">Non indicato</option>
                {activeWorkTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Stato cantiere</span>
              <select
                value={jobStatusId}
                onChange={(event) => setJobStatusId(event.target.value)}
              >
                <option value="">Senza stato</option>
                {activeJobStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-field">
            <span>Attrezzature</span>

            {activeEquipment.length === 0 ? (
              <p className="empty-state">Nessuna attrezzatura attiva disponibile.</p>
            ) : (
              <div className="checkbox-grid">
                {activeEquipment.map((item) => (
                  <label key={item.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={equipmentIds.includes(item.id)}
                      onChange={() => toggleEquipment(item.id)}
                    />
                    <span>{item.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <label className="form-field">
            <span>Note operative</span>
            <textarea
              value={operationalNotes}
              onChange={(event) => setOperationalNotes(event.target.value)}
              placeholder="Es. Avvisare il portiere, entrare dal cancello laterale..."
              rows={3}
            />
          </label>

          <label className="form-field">
            <span>Note finali</span>
            <textarea
              value={finalNotes}
              onChange={(event) => setFinalNotes(event.target.value)}
              placeholder="Note da compilare a fine lavoro"
              rows={3}
            />
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Salvataggio..."
              : editingJobId
                ? "Salva modifiche"
                : "Salva cantiere"}
          </button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Cantieri del giorno</h3>
              <p className="panel-subtitle">
                Interventi programmati per la data selezionata.
              </p>
            </div>
          </div>

          {isLoading ? (
            <p className="empty-state">Caricamento cantieri...</p>
          ) : jobs.length === 0 ? (
            <p className="empty-state">Nessun cantiere registrato per questa data.</p>
          ) : (
            <div className="job-list">
              {jobs.map((job) => (
                <article key={job.id} className="job-card">
                  <div className="job-card-header">
                    <div>
                      <h4>{job.title}</h4>
                      <p>
                        {job.customerName || "Cliente/luogo non indicato"}
                        {job.address ? ` · ${job.address}` : ""}
                      </p>
                    </div>

                    <div className="actions-row">
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => handleEdit(job)}
                      >
                        Modifica
                      </button>

                      <button
                        className="danger-button"
                        type="button"
                        onClick={() => handleDelete(job.id)}
                      >
                        Elimina
                      </button>
                    </div>
                  </div>

                  <div className="job-meta">
                    <span>
                      {formatDate(job.scheduledDate)}
                      {job.scheduledEndDate
                        ? ` - ${formatDate(job.scheduledEndDate)}`
                        : ""}
                    </span>
                    <span>{job.scheduledStartTime || "Orario non indicato"}</span>
                    <span>{job.workType?.name || "Tipo non indicato"}</span>
                    <span>{job.jobStatus?.name || "Senza stato"}</span>
                  </div>

                  {job.equipment.length > 0 && (
                    <div className="equipment-tags">
                      {job.equipment.map((item) => (
                        <span key={item.id}>{item.equipment.name}</span>
                      ))}
                    </div>
                  )}

                  {job.operationalNotes && (
                    <p className="job-notes">
                      <strong>Note operative:</strong> {job.operationalNotes}
                    </p>
                  )}

                  {job.finalNotes && (
                    <p className="job-notes">
                      <strong>Note finali:</strong> {job.finalNotes}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}