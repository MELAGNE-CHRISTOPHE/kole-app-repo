import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="fade-in">
      {/* Cartes KPI exactement selon l'image dashboardadmin.png */}
      <div className="kpi-grid">
        <div className="kpi-card chauffeurs-actifs">
          <div className="kpi-title">CHAUFFEURS ACTIFS</div>
          <div className="kpi-value">150</div>
        </div>

        <div className="kpi-card trajets-aujourdhui">
          <div className="kpi-title">TRAJETS AUJOURD'HUI</div>
          <div className="kpi-value">350</div>
        </div>

        <div className="kpi-card revenu-brut">
          <div className="kpi-title">REVENU BRUT (JOUR)</div>
          <div className="kpi-value">175 000 FCFA</div>
        </div>

        <div className="kpi-card chauffeurs-en-ligne">
          <div className="kpi-title">CHAUFFEURS EN LIGNE</div>
          <div className="kpi-value">85</div>
        </div>
      </div>

      {/* Section graphique et alertes exactement selon l'image */}
      <div className="dashboard-grid">
        {/* Graphique principal avec encadrement blanc */}
        <div className="chart-section">
          <h3 className="chart-title">Évolution des Trajets (7 derniers jours)</h3>
          <div className="chart-placeholder">
            Graphique des trajets ici
          </div>
        </div>

        {/* Section alertes avec encadrement blanc */}
        <div className="alert-section">
          <h3 className="alert-title">Chauffeurs en attente de validation</h3>
          <div className="alert-content">
            <div className="alert-number">5</div>
            <div className="alert-text">chauffeurs en attente.</div>
            <button 
              className="alert-btn"
              onClick={() => window.location.href = '/admin/chauffeurs'}
            >
              Voir la liste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

