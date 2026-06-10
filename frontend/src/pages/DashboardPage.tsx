import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import type { DailyDashboard } from "../types/dashboard";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DailyDashboard | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const data = await apiRequest<DailyDashboard>(
          `/dashboard/daily?date=${selectedDate}`
        );

        setDashboard(data);
      } catch (error) {
        console.error(error);
        setErrorMessage("Impossibile caricare la dashboard.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [selectedDate]);

  const completedJobs = dashboard?.statusSummary["Completato"] || 0;
  const postponedJobs = dashboard?.statusSummary["Rimandato"] || 0;

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Riepilogo operativo della giornata.</p>
        </div>

        <input
          className="date-input"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </div>

      {isLoading && <p className="empty-state">Caricamento dashboard...</p>}

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {!isLoading && !errorMessage && dashboard && (
        <>
          <div className="cards-grid">
            <div className="card">
              <span className="card-label">Cantieri oggi</span>
              <strong>{dashboard.totalJobs}</strong>
            </div>

            <div className="card">
              <span className="card-label">Completati</span>
              <strong>{completedJobs}</strong>
            </div>

            <div className="card">
              <span className="card-label">Rimandati</span>
              <strong>{postponedJobs}</strong>
            </div>

            <div className="card">
              <span className="card-label">Senza attrezzature</span>
              <strong>{dashboard.jobsWithoutEquipment}</strong>
            </div>
          </div>

          <div className="panel">
            <h3>Cantieri della giornata</h3>

            {dashboard.jobs.length === 0 ? (
              <p className="empty-state">Nessun cantiere da mostrare.</p>
            ) : (
              <div className="job-list">
                {dashboard.jobs.map((job) => (
                  <article key={job.id} className="job-item">
                    <div>
                      <h4>{job.title}</h4>
                      <p>
                        {job.customerName || "Cliente non indicato"}
                        {job.address ? ` · ${job.address}` : ""}
                      </p>
                    </div>

                    <div className="job-meta">
                      <span>{job.scheduledStartTime || "Orario non indicato"}</span>
                      <span>{job.workType?.name || "Tipo non indicato"}</span>
                      <span>{job.jobStatus?.name || "Senza stato"}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}