export function EmployeesPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Dipendenti</h2>
          <p>Gestisci l’elenco dei dipendenti attivi e non attivi.</p>
        </div>

        <button className="primary-button">Nuovo dipendente</button>
      </div>

      <div className="panel">
        <h3>Lista dipendenti</h3>
        <p className="empty-state">Nessun dipendente registrato.</p>
      </div>
    </section>
  );
}