import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Users,
  Car,
  MapPin,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Target,
  Clock,
  Star
} from 'lucide-react';

const StatisticsManagement: React.FC = () => {
  const [periodFilter, setPeriodFilter] = useState<string>('ce_mois');
  const [viewType, setViewType] = useState<string>('overview');

  // Données statistiques simulées selon les maquettes
  const statistiques = {
    overview: {
      totalTrajets: 3247,
      evolutionTrajets: 12.5,
      totalClients: 1856,
      evolutionClients: 8.3,
      totalChauffeurs: 142,
      evolutionChauffeurs: 15.2,
      chiffreAffaires: 14750000,
      evolutionCA: 18.7,
      noteMoyenne: 4.6,
      tauxSatisfaction: 94.2,
      tempsAttenteMoyen: 3.2,
      tauxAnnulation: 5.8
    },
    performance: {
      trajetsParJour: [
        { jour: 'Lun', trajets: 145, revenus: 652500 },
        { jour: 'Mar', trajets: 167, revenus: 751500 },
        { jour: 'Mer', trajets: 189, revenus: 850500 },
        { jour: 'Jeu', trajets: 156, revenus: 702000 },
        { jour: 'Ven', trajets: 198, revenus: 891000 },
        { jour: 'Sam', trajets: 234, revenus: 1053000 },
        { jour: 'Dim', trajets: 201, revenus: 904500 }
      ],
      heuresPointe: [
        { heure: '07h-09h', pourcentage: 25.3 },
        { heure: '12h-14h', pourcentage: 18.7 },
        { heure: '17h-19h', pourcentage: 31.2 },
        { heure: '20h-22h', pourcentage: 15.8 },
        { heure: 'Autres', pourcentage: 9.0 }
      ],
      zonesPopulaires: [
        { zone: 'Plateau', trajets: 456, pourcentage: 14.1 },
        { zone: 'Cocody', trajets: 389, pourcentage: 12.0 },
        { zone: 'Yopougon', trajets: 324, pourcentage: 10.0 },
        { zone: 'Marcory', trajets: 298, pourcentage: 9.2 },
        { zone: 'Treichville', trajets: 267, pourcentage: 8.2 }
      ]
    },
    chauffeurs: {
      topPerformers: [
        { nom: 'Touré Amadou', trajets: 89, revenus: 401500, note: 4.9 },
        { nom: 'Diabaté Sékou', trajets: 76, revenus: 342000, note: 4.8 },
        { nom: 'Coulibaly Ibrahim', trajets: 71, revenus: 319500, note: 4.7 },
        { nom: 'Koné Fatou', trajets: 68, revenus: 306000, note: 4.6 },
        { nom: 'Ouattara Ibrahim', trajets: 65, revenus: 292500, note: 4.8 }
      ],
      repartitionStatuts: {
        actifs: 89,
        inactifs: 23,
        suspendus: 8,
        en_attente: 22
      }
    }
  };

  const getEvolutionIcon = (evolution: number) => {
    return evolution >= 0 ? (
      <TrendingUp size={16} className="text-green-500" />
    ) : (
      <TrendingDown size={16} className="text-red-500" />
    );
  };

  const getEvolutionColor = (evolution: number) => {
    return evolution >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const handleExport = () => {
    console.log('Export des statistiques');
    // Ici, implémenter l'export des données
  };

  const handleRefresh = () => {
    console.log('Actualisation des données');
    // Ici, implémenter l'actualisation
  };

  return (
    <div className="fade-in">
      {/* Barre de contrôles */}
      <div className="filters-bar mb-6">
        <div className="flex gap-2">
          <button
            className={`filter-btn ${viewType === 'overview' ? 'active' : ''}`}
            onClick={() => setViewType('overview')}
          >
            <BarChart3 size={16} />
            Vue d'ensemble
          </button>
          <button
            className={`filter-btn ${viewType === 'performance' ? 'active' : ''}`}
            onClick={() => setViewType('performance')}
          >
            <Target size={16} />
            Performance
          </button>
          <button
            className={`filter-btn ${viewType === 'chauffeurs' ? 'active' : ''}`}
            onClick={() => setViewType('chauffeurs')}
          >
            <Users size={16} />
            Chauffeurs
          </button>
        </div>
        
        <div className="flex gap-2">
          <select 
            className="filter-btn"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
          >
            <option value="aujourd_hui">Aujourd'hui</option>
            <option value="cette_semaine">Cette semaine</option>
            <option value="ce_mois">Ce mois</option>
            <option value="ce_trimestre">Ce trimestre</option>
            <option value="cette_annee">Cette année</option>
          </select>
          
          <button className="filter-btn" onClick={handleRefresh}>
            <RefreshCw size={16} />
            Actualiser
          </button>
          
          <button className="add-btn" onClick={handleExport}>
            <Download size={16} />
            Exporter
          </button>
        </div>
      </div>

      {/* Vue d'ensemble */}
      {viewType === 'overview' && (
        <>
          {/* KPI principaux */}
          <div className="kpi-grid mb-6">
            <div className="kpi-card trajets-aujourdhui">
              <div className="kpi-title">TOTAL TRAJETS</div>
              <div className="kpi-value">{statistiques.overview.totalTrajets.toLocaleString()}</div>
              <div className="text-sm text-white/80 flex items-center gap-1">
                {getEvolutionIcon(statistiques.overview.evolutionTrajets)}
                +{statistiques.overview.evolutionTrajets}% vs période précédente
              </div>
            </div>

            <div className="kpi-card chauffeurs-actifs">
              <div className="kpi-title">CLIENTS ACTIFS</div>
              <div className="kpi-value">{statistiques.overview.totalClients.toLocaleString()}</div>
              <div className="text-sm text-white/80 flex items-center gap-1">
                {getEvolutionIcon(statistiques.overview.evolutionClients)}
                +{statistiques.overview.evolutionClients}% vs période précédente
              </div>
            </div>

            <div className="kpi-card revenu-brut">
              <div className="kpi-title">CHIFFRE D'AFFAIRES</div>
              <div className="kpi-value">{(statistiques.overview.chiffreAffaires / 1000000).toFixed(1)}M FCFA</div>
              <div className="text-sm text-white/80 flex items-center gap-1">
                {getEvolutionIcon(statistiques.overview.evolutionCA)}
                +{statistiques.overview.evolutionCA}% vs période précédente
              </div>
            </div>

            <div className="kpi-card chauffeurs-en-ligne">
              <div className="kpi-title">SATISFACTION CLIENT</div>
              <div className="kpi-value">{statistiques.overview.tauxSatisfaction}%</div>
              <div className="text-sm text-white/80 flex items-center gap-1">
                <Star size={12} />
                Note moyenne: {statistiques.overview.noteMoyenne}/5
              </div>
            </div>
          </div>

          {/* Métriques secondaires */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="chart-section">
              <h3 className="chart-title flex items-center gap-2">
                <Users size={20} />
                Chauffeurs Partenaires
              </h3>
              <div className="p-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {statistiques.overview.totalChauffeurs}
                </div>
                <div className={`text-sm flex items-center gap-1 ${getEvolutionColor(statistiques.overview.evolutionChauffeurs)}`}>
                  {getEvolutionIcon(statistiques.overview.evolutionChauffeurs)}
                  +{statistiques.overview.evolutionChauffeurs}% ce mois
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3 className="chart-title flex items-center gap-2">
                <Clock size={20} />
                Temps d'Attente Moyen
              </h3>
              <div className="p-4">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {statistiques.overview.tempsAttenteMoyen} min
                </div>
                <div className="text-sm text-gray-600">
                  Objectif: &lt; 5 min
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3 className="chart-title flex items-center gap-2">
                <Target size={20} />
                Taux d'Annulation
              </h3>
              <div className="p-4">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {statistiques.overview.tauxAnnulation}%
                </div>
                <div className="text-sm text-gray-600">
                  Objectif: &lt; 10%
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Vue Performance */}
      {viewType === 'performance' && (
        <>
          <div className="dashboard-grid mb-6">
            <div className="chart-section">
              <h3 className="chart-title flex items-center gap-2">
                <BarChart3 size={20} />
                Trajets par Jour de la Semaine
              </h3>
              <div className="p-4">
                <div className="space-y-3">
                  {statistiques.performance.trajetsParJour.map((jour) => (
                    <div key={jour.jour} className="flex items-center justify-between">
                      <span className="font-medium">{jour.jour}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{jour.trajets} trajets</span>
                        <span className="font-medium">{jour.revenus.toLocaleString()} FCFA</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3 className="chart-title flex items-center gap-2">
                <Clock size={20} />
                Heures de Pointe
              </h3>
              <div className="p-4">
                <div className="space-y-3">
                  {statistiques.performance.heuresPointe.map((heure) => (
                    <div key={heure.heure} className="flex items-center justify-between">
                      <span className="font-medium">{heure.heure}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${heure.pourcentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{heure.pourcentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="chart-section">
            <h3 className="chart-title flex items-center gap-2">
              <MapPin size={20} />
              Zones les Plus Populaires
            </h3>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {statistiques.performance.zonesPopulaires.map((zone, index) => (
                  <div key={zone.zone} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">#{index + 1}</div>
                    <div className="font-medium mb-1">{zone.zone}</div>
                    <div className="text-sm text-gray-600">{zone.trajets} trajets</div>
                    <div className="text-sm font-medium">{zone.pourcentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Vue Chauffeurs */}
      {viewType === 'chauffeurs' && (
        <>
          <div className="dashboard-grid mb-6">
            <div className="chart-section">
              <h3 className="chart-title flex items-center gap-2">
                <Star size={20} />
                Top 5 Chauffeurs du Mois
              </h3>
              <div className="p-4">
                <div className="space-y-4">
                  {statistiques.chauffeurs.topPerformers.map((chauffeur, index) => (
                    <div key={chauffeur.nom} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{chauffeur.nom}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Star size={12} className="text-yellow-400 fill-current" />
                            {chauffeur.note}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{chauffeur.trajets} trajets</div>
                        <div className="text-sm text-green-600">{chauffeur.revenus.toLocaleString()} FCFA</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3 className="chart-title flex items-center gap-2">
                <PieChart size={20} />
                Répartition des Statuts Chauffeurs
              </h3>
              <div className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Actifs</span>
                    </div>
                    <span className="font-medium">{statistiques.chauffeurs.repartitionStatuts.actifs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-400 rounded"></div>
                      <span>Inactifs</span>
                    </div>
                    <span className="font-medium">{statistiques.chauffeurs.repartitionStatuts.inactifs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span>Suspendus</span>
                    </div>
                    <span className="font-medium">{statistiques.chauffeurs.repartitionStatuts.suspendus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>En attente</span>
                    </div>
                    <span className="font-medium">{statistiques.chauffeurs.repartitionStatuts.en_attente}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatisticsManagement;

