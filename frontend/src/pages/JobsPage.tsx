export function JobsPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Cantieri</h2>
          <p>Gestisci gli interventi giornalieri e lo storico dei lavori.</p>
        </div>

        <button className="primary-button">Nuovo cantiere</button>
      </div>

      <div className="panel">
        <h3>Lista cantieri</h3>
        <p className="empty-state">Nessun cantiere registrato.</p>
      </div>
    </section>
  );
}