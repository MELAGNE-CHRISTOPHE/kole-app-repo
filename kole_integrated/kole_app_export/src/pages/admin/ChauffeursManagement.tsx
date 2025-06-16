import React, { useState } from 'react';
import { 
  UserCheck, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  Car,
  Star
} from 'lucide-react';

interface Chauffeur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  statut: 'actif' | 'inactif' | 'suspendu' | 'en_attente';
  dateInscription: string;
  nbTrajets: number;
  noteGlobale: number;
  vehicule: string;
  permis: string;
  photo?: string;
}

const ChauffeursManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Données simulées des chauffeurs selon les maquettes
  const chauffeurs: Chauffeur[] = [
    {
      id: 'CH001',
      nom: 'Kouassi',
      prenom: 'Jean',
      telephone: '+225 07 11 22 33',
      email: 'jean.kouassi@example.com',
      statut: 'actif',
      dateInscription: '15/03/2025',
      nbTrajets: 245,
      noteGlobale: 4.8,
      vehicule: 'Toyota Corolla - AB 1234 CI',
      permis: 'Valide jusqu\'au 15/12/2026'
    },
    {
      id: 'CH002',
      nom: 'Diabaté',
      prenom: 'Aminata',
      telephone: '+225 05 44 55 66',
      email: 'aminata.diabate@example.com',
      statut: 'actif',
      dateInscription: '22/02/2025',
      nbTrajets: 189,
      noteGlobale: 4.6,
      vehicule: 'Honda Civic - CD 5678 CI',
      permis: 'Valide jusqu\'au 08/09/2025'
    },
    {
      id: 'CH003',
      nom: 'Traoré',
      prenom: 'Moussa',
      telephone: '+225 01 77 88 99',
      email: 'moussa.traore@example.com',
      statut: 'en_attente',
      dateInscription: '10/06/2025',
      nbTrajets: 0,
      noteGlobale: 0,
      vehicule: 'Nissan Sentra - EF 9012 CI',
      permis: 'En cours de vérification'
    },
    {
      id: 'CH004',
      nom: 'Koné',
      prenom: 'Fatou',
      telephone: '+225 07 00 11 22',
      email: 'fatou.kone@example.com',
      statut: 'suspendu',
      dateInscription: '05/01/2025',
      nbTrajets: 156,
      noteGlobale: 3.2,
      vehicule: 'Hyundai Elantra - GH 3456 CI',
      permis: 'Valide jusqu\'au 20/11/2025'
    },
    {
      id: 'CH005',
      nom: 'Ouattara',
      prenom: 'Ibrahim',
      telephone: '+225 05 33 44 55',
      email: 'ibrahim.ouattara@example.com',
      statut: 'actif',
      dateInscription: '18/04/2025',
      nbTrajets: 312,
      noteGlobale: 4.9,
      vehicule: 'Kia Cerato - IJ 7890 CI',
      permis: 'Valide jusqu\'au 30/06/2026'
    }
  ];

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      actif: { class: 'badge-success', text: 'Actif', icon: CheckCircle },
      inactif: { class: 'badge-warning', text: 'Inactif', icon: Clock },
      suspendu: { class: 'badge-danger', text: 'Suspendu', icon: XCircle },
      en_attente: { class: 'badge-info', text: 'En attente', icon: Clock }
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

  const getStarRating = (note: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= note ? 'text-yellow-400 fill-current' : 'text-gray-300'}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({note.toFixed(1)})</span>
      </div>
    );
  };

  const filteredChauffeurs = chauffeurs.filter(chauffeur => {
    const matchesSearch = 
      chauffeur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chauffeur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chauffeur.telephone.includes(searchTerm) ||
      chauffeur.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'tous' || chauffeur.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredChauffeurs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedChauffeurs = filteredChauffeurs.slice(startIndex, startIndex + itemsPerPage);

  const handleAction = (action: string, chauffeurId: string) => {
    console.log(`Action ${action} sur le chauffeur ${chauffeurId}`);
    // Ici, implémenter la logique selon l'action
  };

  return (
    <div className="fade-in">
      {/* Barre de filtres et recherche */}
      <div className="filters-bar">
        <div className="search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, email..."
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
            className={`filter-btn ${statusFilter === 'actif' ? 'active' : ''}`}
            onClick={() => setStatusFilter('actif')}
          >
            Actif
          </button>
          <button
            className={`filter-btn ${statusFilter === 'en_attente' ? 'active' : ''}`}
            onClick={() => setStatusFilter('en_attente')}
          >
            En attente
          </button>
          <button
            className={`filter-btn ${statusFilter === 'suspendu' ? 'active' : ''}`}
            onClick={() => setStatusFilter('suspendu')}
          >
            Suspendu
          </button>
          <button
            className={`filter-btn ${statusFilter === 'inactif' ? 'active' : ''}`}
            onClick={() => setStatusFilter('inactif')}
          >
            Inactif
          </button>
        </div>
        
        <button className="add-btn" onClick={() => handleAction('add', '')}>
          <Plus size={16} />
          Ajouter un chauffeur
        </button>
      </div>

      {/* Tableau des chauffeurs */}
      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">
            <UserCheck size={20} />
            Gestion des Chauffeurs ({filteredChauffeurs.length} chauffeurs)
          </h2>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Chauffeur</th>
              <th>Contact</th>
              <th>Statut</th>
              <th>Date d'inscription</th>
              <th>Trajets</th>
              <th>Note</th>
              <th>Véhicule</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedChauffeurs.map((chauffeur) => (
              <tr key={chauffeur.id}>
                <td className="font-medium">{chauffeur.id}</td>
                <td>
                  <div>
                    <div className="font-medium">{chauffeur.prenom} {chauffeur.nom}</div>
                    <div className="text-sm text-gray-500">{chauffeur.permis}</div>
                  </div>
                </td>
                <td>
                  <div>
                    <div className="text-sm">{chauffeur.telephone}</div>
                    <div className="text-sm text-blue-600">{chauffeur.email}</div>
                  </div>
                </td>
                <td>{getStatusBadge(chauffeur.statut)}</td>
                <td>{chauffeur.dateInscription}</td>
                <td className="text-center font-medium">{chauffeur.nbTrajets}</td>
                <td>{getStarRating(chauffeur.noteGlobale)}</td>
                <td>
                  <div className="text-sm">
                    <div className="flex items-center gap-1">
                      <Car size={14} />
                      {chauffeur.vehicule}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button
                      className="action-btn action-btn-view"
                      title="Voir/Modifier"
                      onClick={() => handleAction('view', chauffeur.id)}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="action-btn action-btn-edit"
                      title="Modifier"
                      onClick={() => handleAction('edit', chauffeur.id)}
                    >
                      <Edit size={14} />
                    </button>
                    {chauffeur.statut === 'en_attente' && (
                      <button
                        className="action-btn action-btn-view"
                        title="Valider"
                        onClick={() => handleAction('validate', chauffeur.id)}
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                    {chauffeur.statut === 'actif' && (
                      <button
                        className="action-btn action-btn-delete"
                        title="Suspendre"
                        onClick={() => handleAction('suspend', chauffeur.id)}
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                    <button
                      className="action-btn action-btn-delete"
                      title="Supprimer"
                      onClick={() => handleAction('delete', chauffeur.id)}
                    >
                      <Trash2 size={14} />
                    </button>
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
            Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredChauffeurs.length)} chauffeurs sur {filteredChauffeurs.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChauffeursManagement;

