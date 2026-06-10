export function DashboardPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Riepilogo operativo della giornata.</p>
        </div>
      </div>

      <div className="cards-grid">
        <div className="card">
          <span className="card-label">Cantieri oggi</span>
          <strong>0</strong>
        </div>

        <div className="card">
          <span className="card-label">Completati</span>
          <strong>0</strong>
        </div>

        <div className="card">
          <span className="card-label">Rimandati</span>
          <strong>0</strong>
        </div>

        <div className="card">
          <span className="card-label">Senza attrezzature</span>
          <strong>0</strong>
        </div>
      </div>

      <div className="panel">
        <h3>Cantieri della giornata</h3>
        <p className="empty-state">Nessun cantiere da mostrare.</p>
      </div>
    </section>
  );
}