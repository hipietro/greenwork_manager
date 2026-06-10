export function EquipmentPage() {
  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Attrezzature</h2>
          <p>Gestisci le attrezzature utilizzabili nei cantieri.</p>
        </div>

        <button className="primary-button">Nuova attrezzatura</button>
      </div>

      <div className="panel">
        <h3>Lista attrezzature</h3>
        <p className="empty-state">Nessuna attrezzatura registrata.</p>
      </div>
    </section>
  );
}