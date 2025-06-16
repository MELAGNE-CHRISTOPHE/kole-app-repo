import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Eye,
  Filter,
  Search,
  Wallet,
  PieChart,
  BarChart3
} from 'lucide-react';

interface Transaction {
  id: string;
  reference: string;
  type: 'course' | 'commission' | 'retrait' | 'remboursement';
  montant: number;
  statut: 'valide' | 'en_attente' | 'echec';
  date: string;
  heure: string;
  client?: string;
  chauffeur?: string;
  modePaiement: 'especes' | 'mobile_money' | 'carte' | 'virement';
  description: string;
}

const FinanceManagement: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<string>('aujourd_hui');
  const [typeFilter, setTypeFilter] = useState<string>('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Données simulées des transactions selon les maquettes
  const transactions: Transaction[] = [
    {
      id: 'TXN001',
      reference: '#TXN8745001',
      type: 'course',
      montant: 4500,
      statut: 'valide',
      date: '15/06/2025',
      heure: '09:15',
      client: 'Konan Franck',
      chauffeur: 'Touré Amadou',
      modePaiement: 'mobile_money',
      description: 'Paiement course #TR8745 - Cocody → Plateau'
    },
    {
      id: 'TXN002',
      reference: '#TXN8745002',
      type: 'commission',
      montant: 675,
      statut: 'valide',
      date: '15/06/2025',
      heure: '09:15',
      chauffeur: 'Touré Amadou',
      modePaiement: 'mobile_money',
      description: 'Commission 15% sur course #TR8745'
    },
    {
      id: 'TXN003',
      reference: '#TXN8746001',
      type: 'course',
      montant: 3800,
      statut: 'en_attente',
      date: '15/06/2025',
      heure: '14:45',
      client: 'Koné Mariam',
      chauffeur: 'Diabaté Sékou',
      modePaiement: 'especes',
      description: 'Paiement course #TR8746 - Yopougon → Marcory'
    },
    {
      id: 'TXN004',
      reference: '#TXN8747001',
      type: 'course',
      montant: 5200,
      statut: 'valide',
      date: '15/06/2025',
      heure: '17:30',
      client: 'Koffi Léa',
      chauffeur: 'Coulibaly Ibrahim',
      modePaiement: 'carte',
      description: 'Paiement course #TR8747 - Abobo → Treichville'
    },
    {
      id: 'TXN005',
      reference: '#TXN8747002',
      type: 'commission',
      montant: 780,
      statut: 'valide',
      date: '15/06/2025',
      heure: '17:30',
      chauffeur: 'Coulibaly Ibrahim',
      modePaiement: 'carte',
      description: 'Commission 15% sur course #TR8747'
    },
    {
      id: 'TXN006',
      reference: '#RET001',
      type: 'retrait',
      montant: -50000,
      statut: 'valide',
      date: '15/06/2025',
      heure: '16:00',
      chauffeur: 'Touré Amadou',
      modePaiement: 'virement',
      description: 'Retrait gains chauffeur - Semaine 24'
    },
    {
      id: 'TXN007',
      reference: '#RMB001',
      type: 'remboursement',
      montant: -2800,
      statut: 'valide',
      date: '14/06/2025',
      heure: '11:20',
      client: 'Ouattara Salif',
      modePaiement: 'mobile_money',
      description: 'Remboursement course annulée #TR8740'
    }
  ];

  // Calculs des statistiques financières
  const statsFinancieres = {
    chiffreAffairesJour: 574500,
    commissionsJour: 86175,
    retraitsJour: 50000,
    beneficeNet: 36175,
    evolutionCA: 8.5,
    evolutionCommissions: 12.3,
    nbTransactions: 128,
    tauxReussite: 94.2
  };

  const getTransactionIcon = (type: string) => {
    const icons = {
      course: { icon: CreditCard, color: 'text-green-600' },
      commission: { icon: DollarSign, color: 'text-blue-600' },
      retrait: { icon: TrendingDown, color: 'text-red-600' },
      remboursement: { icon: TrendingUp, color: 'text-orange-600' }
    };
    return icons[type as keyof typeof icons] || icons.course;
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      valide: { class: 'badge-success', text: 'Validé' },
      en_attente: { class: 'badge-warning', text: 'En attente' },
      echec: { class: 'badge-danger', text: 'Échec' }
    };
    
    const config = statusConfig[statut as keyof typeof statusConfig];
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getPaymentIcon = (mode: string) => {
    const icons = {
      especes: '💵',
      mobile_money: '📱',
      carte: '💳',
      virement: '🏦'
    };
    return icons[mode as keyof typeof icons] || '💵';
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.client && transaction.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.chauffeur && transaction.chauffeur.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === 'tous' || transaction.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = () => {
    console.log('Export des données financières');
    // Ici, implémenter l'export en CSV/Excel
  };

  const handleViewDetails = (transactionId: string) => {
    console.log(`Voir détails de la transaction ${transactionId}`);
    // Ici, implémenter l'affichage des détails
  };

  return (
    <div className="fade-in">
      {/* Statistiques financières principales */}
      <div className="kpi-grid mb-6">
        <div className="kpi-card revenu-brut">
          <div className="kpi-title">CHIFFRE D'AFFAIRES (JOUR)</div>
          <div className="kpi-value">{statsFinancieres.chiffreAffairesJour.toLocaleString()} FCFA</div>
          <div className="text-sm text-white/80 flex items-center gap-1">
            <TrendingUp size={12} />
            +{statsFinancieres.evolutionCA}% vs hier
          </div>
        </div>

        <div className="kpi-card trajets-aujourdhui">
          <div className="kpi-title">COMMISSIONS (JOUR)</div>
          <div className="kpi-value">{statsFinancieres.commissionsJour.toLocaleString()} FCFA</div>
          <div className="text-sm text-white/80 flex items-center gap-1">
            <TrendingUp size={12} />
            +{statsFinancieres.evolutionCommissions}% vs hier
          </div>
        </div>

        <div className="kpi-card chauffeurs-actifs">
          <div className="kpi-title">RETRAITS (JOUR)</div>
          <div className="kpi-value">{statsFinancieres.retraitsJour.toLocaleString()} FCFA</div>
          <div className="text-sm text-white/80">
            {Math.round(statsFinancieres.retraitsJour / statsFinancieres.chiffreAffairesJour * 100)}% du CA
          </div>
        </div>

        <div className="kpi-card chauffeurs-en-ligne">
          <div className="kpi-title">BÉNÉFICE NET</div>
          <div className="kpi-value">{statsFinancieres.beneficeNet.toLocaleString()} FCFA</div>
          <div className="text-sm text-white/80">
            Marge: {Math.round(statsFinancieres.beneficeNet / statsFinancieres.chiffreAffairesJour * 100)}%
          </div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="dashboard-grid mb-6">
        <div className="chart-section">
          <h3 className="chart-title flex items-center gap-2">
            <BarChart3 size={20} />
            Évolution du Chiffre d'Affaires (7 derniers jours)
          </h3>
          <div className="chart-placeholder">
            Graphique des revenus par jour
            <div className="text-xs text-gray-500 mt-2">
              Intégration Chart.js pour graphique en barres
            </div>
          </div>
        </div>

        <div className="chart-section">
          <h3 className="chart-title flex items-center gap-2">
            <PieChart size={20} />
            Répartition des Modes de Paiement
          </h3>
          <div className="chart-placeholder">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>📱 Mobile Money:</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="flex justify-between">
                <span>💵 Espèces:</span>
                <span className="font-medium">35%</span>
              </div>
              <div className="flex justify-between">
                <span>💳 Carte:</span>
                <span className="font-medium">15%</span>
              </div>
              <div className="flex justify-between">
                <span>🏦 Virement:</span>
                <span className="font-medium">5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de filtres et recherche */}
      <div className="filters-bar">
        <div className="search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Rechercher par référence, client, chauffeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', marginLeft: '8px', flex: 1 }}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            className={`filter-btn ${typeFilter === 'tous' ? 'active' : ''}`}
            onClick={() => setTypeFilter('tous')}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${typeFilter === 'course' ? 'active' : ''}`}
            onClick={() => setTypeFilter('course')}
          >
            Courses
          </button>
          <button
            className={`filter-btn ${typeFilter === 'commission' ? 'active' : ''}`}
            onClick={() => setTypeFilter('commission')}
          >
            Commissions
          </button>
          <button
            className={`filter-btn ${typeFilter === 'retrait' ? 'active' : ''}`}
            onClick={() => setTypeFilter('retrait')}
          >
            Retraits
          </button>
        </div>
        
        <select 
          className="filter-btn"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="aujourd_hui">Aujourd'hui</option>
          <option value="hier">Hier</option>
          <option value="cette_semaine">Cette semaine</option>
          <option value="ce_mois">Ce mois</option>
        </select>

        <button className="add-btn" onClick={handleExport}>
          <Download size={16} />
          Exporter
        </button>
      </div>

      {/* Tableau des transactions */}
      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">
            <Wallet size={20} />
            Transactions Financières ({filteredTransactions.length} transactions)
          </h2>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Type</th>
              <th>Description</th>
              <th>Client/Chauffeur</th>
              <th>Montant</th>
              <th>Mode Paiement</th>
              <th>Statut</th>
              <th>Date/Heure</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((transaction) => {
              const { icon: Icon, color } = getTransactionIcon(transaction.type);
              return (
                <tr key={transaction.id}>
                  <td className="font-medium text-blue-600">{transaction.reference}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={color} />
                      <span className="capitalize">{transaction.type}</span>
                    </div>
                  </td>
                  <td className="text-sm">{transaction.description}</td>
                  <td>
                    <div className="text-sm">
                      {transaction.client && (
                        <div className="font-medium">👤 {transaction.client}</div>
                      )}
                      {transaction.chauffeur && (
                        <div className="text-gray-600">🚗 {transaction.chauffeur}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`font-medium ${transaction.montant >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.montant >= 0 ? '+' : ''}{transaction.montant.toLocaleString()} FCFA
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span>{getPaymentIcon(transaction.modePaiement)}</span>
                      <span className="text-sm capitalize">{transaction.modePaiement.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(transaction.statut)}</td>
                  <td>
                    <div className="text-sm">
                      <div>{transaction.date}</div>
                      <div className="text-gray-500">{transaction.heure}</div>
                    </div>
                  </td>
                  <td>
                    <button
                      className="action-btn action-btn-view"
                      title="Voir détails"
                      onClick={() => handleViewDetails(transaction.id)}
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Précédent
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          
          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Suivant
          </button>
          
          <span className="text-sm text-gray-600 ml-4">
            Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} transactions sur {filteredTransactions.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FinanceManagement;

