import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  DollarSign, 
  Clock, 
  MapPin, 
  TrendingUp,
  Activity,
  Car,
  BarChart3,
  Navigation,
  Home,
  CreditCard,
  User
} from 'lucide-react';

const DriverDashboard: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-kole-cream-light">
      {/* En-tête avec solde selon les maquettes */}
      <div className="bg-kole-blue-primary text-white p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Tableau de bord</h1>
          <div className="bg-white/20 rounded-lg p-4 mb-4">
            <div className="text-sm opacity-90">Solde disponible</div>
            <div className="text-3xl font-bold">45 000 FCFA</div>
            <Button 
              size="sm" 
              className="mt-2 bg-white text-kole-blue-primary hover:bg-gray-100"
            >
              Retirer
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-4 pb-20 overflow-y-auto">
        {/* Statut du chauffeur */}
        <Card className="kole-card mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-kole-text-secondary">Statut</div>
                <div className="text-lg font-semibold text-kole-text-dark">Hors ligne</div>
              </div>
              <Button className="kole-btn-primary">
                Se connecter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques du jour */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-kole-brown-dark mb-4">Aujourd'hui</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="kole-card">
              <CardContent className="p-4 text-center">
                <Car className="h-8 w-8 mx-auto mb-2 text-kole-blue-primary" />
                <div className="text-sm text-kole-text-secondary">Courses</div>
                <div className="text-2xl font-bold text-kole-brown-dark">5</div>
              </CardContent>
            </Card>

            <Card className="kole-card">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-kole-green" />
                <div className="text-sm text-kole-text-secondary">Revenus</div>
                <div className="text-2xl font-bold text-kole-brown-dark">12 500 FCFA</div>
              </CardContent>
            </Card>

            <Card className="kole-card">
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-kole-ocre" />
                <div className="text-sm text-kole-text-secondary">Temps en ligne</div>
                <div className="text-2xl font-bold text-kole-brown-dark">4h 30m</div>
              </CardContent>
            </Card>

            <Card className="kole-card">
              <CardContent className="p-4 text-center">
                <Navigation className="h-8 w-8 mx-auto mb-2 text-kole-blue-primary" />
                <div className="text-sm text-kole-text-secondary">Distance</div>
                <div className="text-2xl font-bold text-kole-brown-dark">45 km</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activité récente */}
        <Card className="kole-card">
          <CardHeader>
            <CardTitle className="text-kole-brown-dark">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-kole-cream-light rounded-lg">
                <div>
                  <div className="font-semibold text-kole-text-dark">Course #12345</div>
                  <div className="text-sm text-kole-text-secondary">Aujourd'hui, 14:30</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-kole-green">+2 500 FCFA</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-kole-cream-light rounded-lg">
                <div>
                  <div className="font-semibold text-kole-text-dark">Course #12344</div>
                  <div className="text-sm text-kole-text-secondary">Aujourd'hui, 12:15</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-kole-green">+3 000 FCFA</div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-kole-cream-light rounded-lg">
                <div>
                  <div className="font-semibold text-kole-text-dark">Course #12343</div>
                  <div className="text-sm text-kole-text-secondary">Aujourd'hui, 10:45</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-kole-green">+2 000 FCFA</div>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-kole-blue-primary text-kole-blue-primary hover:bg-kole-blue-primary hover:text-white"
              >
                Voir tout l'historique
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation inférieure selon les maquettes */}
      <div className="kole-bottom-nav">
        <a href="/driver" className="kole-nav-item active">
          <BarChart3 className="h-5 w-5 mb-1" />
          <span>Tableau de bord</span>
        </a>
        <a href="/driver/map" className="kole-nav-item">
          <MapPin className="h-5 w-5 mb-1" />
          <span>Carte</span>
        </a>
        <a href="/driver/earnings" className="kole-nav-item">
          <DollarSign className="h-5 w-5 mb-1" />
          <span>Revenus</span>
        </a>
        <a href="/driver/profile" className="kole-nav-item">
          <User className="h-5 w-5 mb-1" />
          <span>Profil</span>
        </a>
      </div>
    </div>
  );
};

export default DriverDashboard;

