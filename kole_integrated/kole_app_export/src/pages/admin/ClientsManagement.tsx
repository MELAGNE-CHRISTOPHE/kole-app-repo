import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Ban, 
  Trash2, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

interface Client {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  statut: 'Actif' | 'Bloqué' | 'Inactif';
  dateInscription: string;
  nbTrajets: number;
  solde: number;
}

const ClientsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const clients: Client[] = [
    {
      id: 'CL001',
      nom: 'Aminata Touré',
      telephone: '+225 07 11 22 33',
      email: 'aminata.t@example.com',
      statut: 'Actif',
      dateInscription: '10/05/2025',
      nbTrajets: 15,
      solde: 5000
    },
    {
      id: 'CL002',
      nom: 'Ibrahim Koné',
      telephone: '+225 05 44 55 66',
      email: 'ibrahim.k@example.com',
      statut: 'Actif',
      dateInscription: '12/05/2025',
      nbTrajets: 8,
      solde: 2500
    },
    {
      id: 'CL003',
      nom: 'Sophie Mensah',
      telephone: '+225 01 77 88 99',
      email: 'sophie.m@example.com',
      statut: 'Bloqué',
      dateInscription: '05/05/2025',
      nbTrajets: 3,
      solde: 0
    },
    {
      id: 'CL004',
      nom: 'Yao Kouassi',
      telephone: '+225 07 00 11 22',
      email: 'yao.k@example.com',
      statut: 'Inactif',
      dateInscription: '15/04/2025',
      nbTrajets: 12,
      solde: 3200
    },
    {
      id: 'CL005',
      nom: 'Mariam Diallo',
      telephone: '+225 05 33 44 55',
      email: 'mariam.d@example.com',
      statut: 'Actif',
      dateInscription: '20/05/2025',
      nbTrajets: 7,
      solde: 1800
    }
  ];

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.telephone.includes(searchTerm) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'Tous' || client.statut === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'Actif':
        return <span className="badge badge-success">Actif</span>;
      case 'Bloqué':
        return <span className="badge badge-danger">Bloqué</span>;
      case 'Inactif':
        return <span className="badge" style={{ backgroundColor: 'var(--kole-text-light)' }}>Inactif</span>;
      default:
        return <span className="badge badge-info">{statut}</span>;
    }
  };

  const handleAction = (action: string, clientId: string) => {
    console.log(`Action ${action} sur client ${clientId}`);
  };

  return (
    <div className="fade-in">
      {/* Filtres et recherche selon les maquettes */}
      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search 
            size={20} 
            color="var(--kole-text-light)" 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)' 
            }} 
          />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, email..."
            className="search-input"
            style={{ paddingLeft: '40px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['Tous', 'Actif', 'Bloqué', 'Inactif'].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
        <button className="add-btn">
          <Plus size={20} />
          Ajouter un client
        </button>
      </div>

      {/* Tableau des clients selon les maquettes */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">
            Gestion des Clients
          </h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Statut</th>
              <th>Date d'inscription</th>
              <th>Nb Trajets</th>
              <th>Solde (FCFA)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClients.map((client) => (
              <tr key={client.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{client.id}</td>
                <td style={{ fontWeight: '500' }}>{client.nom}</td>
                <td>{client.telephone}</td>
                <td style={{ color: 'var(--kole-blue-primary)' }}>{client.email}</td>
                <td>{getStatusBadge(client.statut)}</td>
                <td>{client.dateInscription}</td>
                <td style={{ textAlign: 'center', fontWeight: '600' }}>{client.nbTrajets}</td>
                <td style={{ fontWeight: '600', color: 'var(--kole-green-primary)' }}>
                  {client.solde.toLocaleString()} FCFA
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      className="action-btn action-btn-view"
                      onClick={() => handleAction('view', client.id)}
                      title="Voir/Modifier"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-btn action-btn-edit"
                      onClick={() => handleAction('block', client.id)}
                      title={client.statut === 'Bloqué' ? 'Débloquer' : 'Bloquer'}
                    >
                      <Ban size={16} />
                    </button>
                    <button
                      className="action-btn action-btn-delete"
                      onClick={() => handleAction('delete', client.id)}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        <div style={{ 
          textAlign: 'center', 
          padding: '1rem',
          color: 'var(--kole-text-light)',
          fontSize: '0.875rem',
          borderTop: '1px solid var(--kole-gray-200)'
        }}>
          Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredClients.length)} clients sur {filteredClients.length}
        </div>
      </div>
    </div>
  );
};

export default ClientsManagement;

