export function SettingsPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Impostazioni</h2>
          <p>Personalizza le liste operative usate nell’applicazione.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="panel">
          <h3>Tipi di intervento</h3>
          <p className="empty-state">
            Gestione dei tipi di lavoro: taglio erba, potatura, siepi e altri interventi.
          </p>
        </div>

        <div className="panel">
          <h3>Stati cantiere</h3>
          <p className="empty-state">
            Gestione degli stati: programmato, completato, rimandato e altri.
          </p>
        </div>
      </div>
    </section>
  );
}