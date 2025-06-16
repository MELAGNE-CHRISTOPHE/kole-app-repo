import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Bell,
  Shield,
  DollarSign,
  MapPin,
  Users,
  Car,
  Smartphone,
  Mail,
  Globe,
  Database,
  Key,
  AlertTriangle,
  CheckCircle,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';

interface ParametreSection {
  id: string;
  titre: string;
  description: string;
  icon: React.ComponentType<any>;
}

const ParametresManagement: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('general');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Configuration des sections selon les maquettes
  const sections: ParametreSection[] = [
    {
      id: 'general',
      titre: 'Paramètres Généraux',
      description: 'Configuration de base de l\'application',
      icon: Settings
    },
    {
      id: 'tarification',
      titre: 'Tarification',
      description: 'Gestion des tarifs et commissions',
      icon: DollarSign
    },
    {
      id: 'notifications',
      titre: 'Notifications',
      description: 'Configuration des alertes et notifications',
      icon: Bell
    },
    {
      id: 'securite',
      titre: 'Sécurité',
      description: 'Paramètres de sécurité et accès',
      icon: Shield
    },
    {
      id: 'zones',
      titre: 'Zones de Service',
      description: 'Gestion des zones géographiques',
      icon: MapPin
    },
    {
      id: 'integration',
      titre: 'Intégrations',
      description: 'APIs et services externes',
      icon: Globe
    }
  ];

  // États des paramètres
  const [parametres, setParametres] = useState({
    general: {
      nomApplication: 'Kôlê',
      versionApplication: '1.0.0',
      emailContact: 'contact@kole.ci',
      telephoneSupport: '+225 27 20 30 40 50',
      adresseEntreprise: 'Abidjan, Plateau',
      deviseDefaut: 'FCFA',
      langueDefaut: 'fr',
      fuseauHoraire: 'Africa/Abidjan'
    },
    tarification: {
      tarifBase: 500,
      tarifParKm: 300,
      tarifParMinute: 50,
      commissionPlateforme: 15,
      fraisAnnulation: 1000,
      seuilGratuite: 2000,
      majorationNuit: 25,
      majorationWeekend: 10
    },
    notifications: {
      emailNouveauClient: true,
      emailNouveauChauffeur: true,
      emailTrajetTermine: true,
      emailProbleme: true,
      smsConfirmation: true,
      smsPaiement: false,
      pushTrajets: true,
      pushProblemes: true
    },
    securite: {
      motDePasseAdmin: '',
      sessionTimeout: 30,
      tentativesConnexion: 3,
      verificationTelephone: true,
      verificationEmail: true,
      authentificationDouble: false,
      journalisationActions: true
    },
    zones: {
      rayonService: 50,
      zonesActives: ['Plateau', 'Cocody', 'Yopougon', 'Marcory', 'Treichville'],
      zonesRestreintes: ['Aéroport'],
      tarifZonePremium: 20
    },
    integration: {
      apiMobileMoney: {
        active: true,
        provider: 'Orange Money',
        cleApi: '***************'
      },
      apiCartes: {
        active: false,
        provider: 'Visa/Mastercard',
        cleApi: ''
      },
      apiSMS: {
        active: true,
        provider: 'SMS CI',
        cleApi: '***************'
      },
      apiMaps: {
        active: true,
        provider: 'Google Maps',
        cleApi: '***************'
      }
    }
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setParametres(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: any) => {
    setParametres(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subsection]: {
          ...(prev[section as keyof typeof prev] as any)[subsection],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Sauvegarde des paramètres:', parametres);
    setHasChanges(false);
    // Ici, implémenter la sauvegarde
  };

  const handleReset = () => {
    console.log('Réinitialisation des paramètres');
    setHasChanges(false);
    // Ici, implémenter la réinitialisation
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Nom de l'application</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.general.nomApplication}
            onChange={(e) => handleInputChange('general', 'nomApplication', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Version</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.general.versionApplication}
            onChange={(e) => handleInputChange('general', 'versionApplication', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email de contact</label>
          <input
            type="email"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.general.emailContact}
            onChange={(e) => handleInputChange('general', 'emailContact', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Téléphone support</label>
          <input
            type="tel"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.general.telephoneSupport}
            onChange={(e) => handleInputChange('general', 'telephoneSupport', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Devise par défaut</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.general.deviseDefaut}
            onChange={(e) => handleInputChange('general', 'deviseDefaut', e.target.value)}
          >
            <option value="FCFA">FCFA</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Langue par défaut</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.general.langueDefaut}
            onChange={(e) => handleInputChange('general', 'langueDefaut', e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderTarificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Tarif de base (FCFA)</label>
          <input
            type="number"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.tarification.tarifBase}
            onChange={(e) => handleInputChange('tarification', 'tarifBase', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tarif par km (FCFA)</label>
          <input
            type="number"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.tarification.tarifParKm}
            onChange={(e) => handleInputChange('tarification', 'tarifParKm', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tarif par minute (FCFA)</label>
          <input
            type="number"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.tarification.tarifParMinute}
            onChange={(e) => handleInputChange('tarification', 'tarifParMinute', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Commission plateforme (%)</label>
          <input
            type="number"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.tarification.commissionPlateforme}
            onChange={(e) => handleInputChange('tarification', 'commissionPlateforme', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Majoration nuit (%)</label>
          <input
            type="number"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.tarification.majorationNuit}
            onChange={(e) => handleInputChange('tarification', 'majorationNuit', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Majoration weekend (%)</label>
          <input
            type="number"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.tarification.majorationWeekend}
            onChange={(e) => handleInputChange('tarification', 'majorationWeekend', parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationsSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Mail size={16} />
            Notifications Email
          </h4>
          {Object.entries(parametres.notifications).filter(([key]) => key.startsWith('email')).map(([key, value]) => (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={value as boolean}
                onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">
                {key === 'emailNouveauClient' && 'Nouveau client inscrit'}
                {key === 'emailNouveauChauffeur' && 'Nouveau chauffeur inscrit'}
                {key === 'emailTrajetTermine' && 'Trajet terminé'}
                {key === 'emailProbleme' && 'Problème signalé'}
              </span>
            </label>
          ))}
        </div>
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Smartphone size={16} />
            Notifications SMS & Push
          </h4>
          {Object.entries(parametres.notifications).filter(([key]) => key.startsWith('sms') || key.startsWith('push')).map(([key, value]) => (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={value as boolean}
                onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">
                {key === 'smsConfirmation' && 'SMS de confirmation'}
                {key === 'smsPaiement' && 'SMS de paiement'}
                {key === 'pushTrajets' && 'Push nouveaux trajets'}
                {key === 'pushProblemes' && 'Push problèmes'}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuriteSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Nouveau mot de passe admin</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full p-3 border border-gray-300 rounded-lg pr-10"
              value={parametres.securite.motDePasseAdmin}
              onChange={(e) => handleInputChange('securite', 'motDePasseAdmin', e.target.value)}
              placeholder="Laisser vide pour ne pas changer"
            />
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Timeout session (minutes)</label>
          <input
            type="number"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.securite.sessionTimeout}
            onChange={(e) => handleInputChange('securite', 'sessionTimeout', parseInt(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tentatives de connexion max</label>
          <input
            type="number"
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={parametres.securite.tentativesConnexion}
            onChange={(e) => handleInputChange('securite', 'tentativesConnexion', parseInt(e.target.value))}
          />
        </div>
        <div className="space-y-4">
          <h4 className="font-medium">Options de sécurité</h4>
          {Object.entries(parametres.securite).filter(([key]) => typeof parametres.securite[key as keyof typeof parametres.securite] === 'boolean').map(([key, value]) => (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={value as boolean}
                onChange={(e) => handleInputChange('securite', key, e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">
                {key === 'verificationTelephone' && 'Vérification téléphone obligatoire'}
                {key === 'verificationEmail' && 'Vérification email obligatoire'}
                {key === 'authentificationDouble' && 'Authentification à double facteur'}
                {key === 'journalisationActions' && 'Journalisation des actions'}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      {Object.entries(parametres.integration).map(([key, config]) => (
        <div key={key} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">
              {key === 'apiMobileMoney' && 'API Mobile Money'}
              {key === 'apiCartes' && 'API Cartes Bancaires'}
              {key === 'apiSMS' && 'API SMS'}
              {key === 'apiMaps' && 'API Cartes/Navigation'}
            </h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.active}
                onChange={(e) => handleNestedInputChange('integration', key, 'active', e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Actif</span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fournisseur</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={config.provider}
                onChange={(e) => handleNestedInputChange('integration', key, 'provider', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Clé API</label>
              <input
                type="password"
                className="w-full p-3 border border-gray-300 rounded-lg"
                value={config.cleApi}
                onChange={(e) => handleNestedInputChange('integration', key, 'cleApi', e.target.value)}
                placeholder="Entrer la clé API"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'tarification':
        return renderTarificationSettings();
      case 'notifications':
        return renderNotificationsSettings();
      case 'securite':
        return renderSecuriteSettings();
      case 'zones':
        return (
          <div className="text-center py-8 text-gray-500">
            <MapPin size={48} className="mx-auto mb-4" />
            <p>Configuration des zones de service</p>
            <p className="text-sm">Fonctionnalité en développement</p>
          </div>
        );
      case 'integration':
        return renderIntegrationSettings();
      default:
        return null;
    }
  };

  return (
    <div className="fade-in">
      <div className="flex gap-6">
        {/* Menu latéral des sections */}
        <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <Settings size={20} />
            Paramètres
          </h3>
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <div>
                      <div className="font-medium text-sm">{section.titre}</div>
                      <div className="text-xs text-gray-500">{section.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {sections.find(s => s.id === activeSection)?.titre}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {sections.find(s => s.id === activeSection)?.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="filter-btn"
                    onClick={handleReset}
                    disabled={!hasChanges}
                  >
                    <RefreshCw size={16} />
                    Réinitialiser
                  </button>
                  <button
                    className={`add-btn ${hasChanges ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
                    onClick={handleSave}
                    disabled={!hasChanges}
                  >
                    <Save size={16} />
                    Sauvegarder
                  </button>
                </div>
              </div>
              {hasChanges && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Vous avez des modifications non sauvegardées
                  </span>
                </div>
              )}
            </div>

            {/* Contenu */}
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParametresManagement;

