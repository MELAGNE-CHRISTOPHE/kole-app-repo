import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  Eye, 
  Navigation,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Car,
  User,
  CreditCard
} from 'lucide-react';

interface Trajet {
  id: string;
  reference: string;
  client: {
    nom: string;
    telephone: string;
  };
  chauffeur: {
    nom: string;
    telephone: string;
    vehicule: string;
  };
  depart: {
    adresse: string;
    heure: string;
  };
  arrivee: {
    adresse: string;
    heure?: string;
  };
  statut: 'en_attente' | 'accepte' | 'en_cours' | 'termine' | 'annule';
  montant: number;
  distance: number;
  duree?: string;
  dateCreation: string;
  modePaiement: 'especes' | 'mobile_money' | 'carte';
}

const TrajetsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [dateFilter, setDateFilter] = useState<string>('aujourd_hui');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Données simulées des trajets selon les maquettes
  const trajets: Trajet[] = [
    {
      id: 'TR001',
      reference: '#TR8745',
      client: {
        nom: 'Konan Franck',
        telephone: '+225 07 11 22 33'
      },
      chauffeur: {
        nom: 'Touré Amadou',
        telephone: '+225 05 44 55 66',
        vehicule: 'Toyota Corolla - AB 1234 CI'
      },
      depart: {
        adresse: 'Cocody, Riviera Golf',
        heure: '08:30'
      },
      arrivee: {
        adresse: 'Plateau, Immeuble SCIAM',
        heure: '09:15'
      },
      statut: 'termine',
      montant: 4500,
      distance: 12.5,
      duree: '45 min',
      dateCreation: '15/06/2025',
      modePaiement: 'mobile_money'
    },
    {
      id: 'TR002',
      reference: '#TR8746',
      client: {
        nom: 'Koné Mariam',
        telephone: '+225 01 77 88 99'
      },
      chauffeur: {
        nom: 'Diabaté Sékou',
        telephone: '+225 07 00 11 22',
        vehicule: 'Honda Civic - CD 5678 CI'
      },
      depart: {
        adresse: 'Yopougon, Marché',
        heure: '14:20'
      },
      arrivee: {
        adresse: 'Marcory, Zone 4',
        heure: ''
      },
      statut: 'en_cours',
      montant: 3800,
      distance: 8.2,
      dateCreation: '15/06/2025',
      modePaiement: 'especes'
    },
    {
      id: 'TR003',
      reference: '#TR8747',
      client: {
        nom: 'Koffi Léa',
        telephone: '+225 05 33 44 55'
      },
      chauffeur: {
        nom: 'Coulibaly Ibrahim',
        telephone: '+225 07 22 33 44',
        vehicule: 'Nissan Sentra - EF 9012 CI'
      },
      depart: {
        adresse: 'Abobo, Gare Nord',
        heure: '16:45'
      },
      arrivee: {
        adresse: 'Treichville, Port',
        heure: '17:30'
      },
      statut: 'termine',
      montant: 5200,
      distance: 15.8,
      duree: '45 min',
      dateCreation: '15/06/2025',
      modePaiement: 'carte'
    },
    {
      id: 'TR004',
      reference: '#TR8748',
      client: {
        nom: 'Ouattara Salif',
        telephone: '+225 01 55 66 77'
      },
      chauffeur: {
        nom: 'Traoré Moussa',
        telephone: '+225 05 88 99 00',
        vehicule: 'Hyundai Elantra - GH 3456 CI'
      },
      depart: {
        adresse: 'Adjamé, Gare Routière',
        heure: '10:15'
      },
      arrivee: {
        adresse: 'Cocody, Université',
        heure: ''
      },
      statut: 'accepte',
      montant: 2800,
      distance: 6.5,
      dateCreation: '15/06/2025',
      modePaiement: 'mobile_money'
    },
    {
      id: 'TR005',
      reference: '#TR8749',
      client: {
        nom: 'Bamba Fatou',
        telephone: '+225 07 44 55 66'
      },
      chauffeur: {
        nom: '',
        telephone: '',
        vehicule: ''
      },
      depart: {
        adresse: 'Plateau, Cathédrale',
        heure: '18:00'
      },
      arrivee: {
        adresse: 'Cocody, Deux Plateaux',
        heure: ''
      },
      statut: 'en_attente',
      montant: 3500,
      distance: 9.2,
      dateCreation: '15/06/2025',
      modePaiement: 'especes'
    }
  ];

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      en_attente: { class: 'badge-warning', text: 'En attente', icon: Clock },
      accepte: { class: 'badge-info', text: 'Accepté', icon: CheckCircle },
      en_cours: { class: 'badge-info', text: 'En cours', icon: Navigation },
      termine: { class: 'badge-success', text: 'Terminé', icon: CheckCircle },
      annule: { class: 'badge-danger', text: 'Annulé', icon: XCircle }
    };
    
    const config = statusConfig[statut as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <span className={`badge ${config.class}`}>
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  const getPaymentIcon = (mode: string) => {
    const icons = {
      especes: '💵',
      mobile_money: '📱',
      carte: '💳'
    };
    return icons[mode as keyof typeof icons] || '💵';
  };

  const filteredTrajets = trajets.filter(trajet => {
    const matchesSearch = 
      trajet.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trajet.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trajet.chauffeur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trajet.depart.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trajet.arrivee.adresse.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'tous' || trajet.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTrajets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTrajets = filteredTrajets.slice(startIndex, startIndex + itemsPerPage);

  const handleAction = (action: string, trajetId: string) => {
    console.log(`Action ${action} sur le trajet ${trajetId}`);
    // Ici, implémenter la logique selon l'action
  };

  return (
    <div className="fade-in">
      {/* Statistiques rapides */}
      <div className="kpi-grid mb-6">
        <div className="kpi-card trajets-aujourdhui">
          <div className="kpi-title">TRAJETS AUJOURD'HUI</div>
          <div className="kpi-value">128</div>
        </div>

        <div className="kpi-card chauffeurs-actifs">
          <div className="kpi-title">EN COURS</div>
          <div className="kpi-value">12</div>
        </div>

        <div className="kpi-card revenu-brut">
          <div className="kpi-title">REVENUS DU JOUR</div>
          <div className="kpi-value">574 500 FCFA</div>
        </div>

        <div className="kpi-card chauffeurs-en-ligne">
          <div className="kpi-title">TAUX RÉUSSITE</div>
          <div className="kpi-value">94%</div>
        </div>
      </div>

      {/* Barre de filtres et recherche */}
      <div className="filters-bar">
        <div className="search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Rechercher par référence, client, chauffeur, adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', marginLeft: '8px', flex: 1 }}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            className={`filter-btn ${statusFilter === 'tous' ? 'active' : ''}`}
            onClick={() => setStatusFilter('tous')}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${statusFilter === 'en_attente' ? 'active' : ''}`}
            onClick={() => setStatusFilter('en_attente')}
          >
            En attente
          </button>
          <button
            className={`filter-btn ${statusFilter === 'en_cours' ? 'active' : ''}`}
            onClick={() => setStatusFilter('en_cours')}
          >
            En cours
          </button>
          <button
            className={`filter-btn ${statusFilter === 'termine' ? 'active' : ''}`}
            onClick={() => setStatusFilter('termine')}
          >
            Terminé
          </button>
          <button
            className={`filter-btn ${statusFilter === 'annule' ? 'active' : ''}`}
            onClick={() => setStatusFilter('annule')}
          >
            Annulé
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
      </div>

      {/* Tableau des trajets */}
      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">
            <MapPin size={20} />
            Suivi des Trajets ({filteredTrajets.length} trajets)
          </h2>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Référence</th>
              <th>Client</th>
              <th>Chauffeur</th>
              <th>Itinéraire</th>
              <th>Statut</th>
              <th>Montant</th>
              <th>Distance</th>
              <th>Paiement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTrajets.map((trajet) => (
              <tr key={trajet.id}>
                <td className="font-medium text-blue-600">{trajet.reference}</td>
                <td>
                  <div>
                    <div className="font-medium flex items-center gap-1">
                      <User size={14} />
                      {trajet.client.nom}
                    </div>
                    <div className="text-sm text-gray-500">{trajet.client.telephone}</div>
                  </div>
                </td>
                <td>
                  <div>
                    {trajet.chauffeur.nom ? (
                      <>
                        <div className="font-medium flex items-center gap-1">
                          <Car size={14} />
                          {trajet.chauffeur.nom}
                        </div>
                        <div className="text-sm text-gray-500">{trajet.chauffeur.vehicule}</div>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Non assigné</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="text-sm">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">{trajet.depart.adresse}</span>
                      <span className="text-gray-500">({trajet.depart.heure})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-medium">{trajet.arrivee.adresse}</span>
                      {trajet.arrivee.heure && (
                        <span className="text-gray-500">({trajet.arrivee.heure})</span>
                      )}
                    </div>
                  </div>
                </td>
                <td>{getStatusBadge(trajet.statut)}</td>
                <td className="font-medium">{trajet.montant.toLocaleString()} FCFA</td>
                <td>
                  <div className="text-sm">
                    <div>{trajet.distance} km</div>
                    {trajet.duree && (
                      <div className="text-gray-500">{trajet.duree}</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <span>{getPaymentIcon(trajet.modePaiement)}</span>
                    <span className="text-sm capitalize">{trajet.modePaiement.replace('_', ' ')}</span>
                  </div>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button
                      className="action-btn action-btn-view"
                      title="Voir détails"
                      onClick={() => handleAction('view', trajet.id)}
                    >
                      <Eye size={14} />
                    </button>
                    {trajet.statut === 'en_cours' && (
                      <button
                        className="action-btn action-btn-edit"
                        title="Suivre en temps réel"
                        onClick={() => handleAction('track', trajet.id)}
                      >
                        <Navigation size={14} />
                      </button>
                    )}
                    {trajet.statut === 'en_attente' && (
                      <button
                        className="action-btn action-btn-delete"
                        title="Annuler"
                        onClick={() => handleAction('cancel', trajet.id)}
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
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
            Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredTrajets.length)} trajets sur {filteredTrajets.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrajetsManagement;

