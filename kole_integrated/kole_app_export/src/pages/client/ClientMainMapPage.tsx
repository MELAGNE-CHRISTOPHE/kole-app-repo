import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Home,
  Activity,
  CreditCard,
  User,
  Target
} from 'lucide-react';
// import mapboxgl from 'mapbox-gl'; // Removed direct mapbox-gl import
// import 'mapbox-gl/dist/mapbox-gl.css'; // CSS should be handled by MapComponent or globally
import ClientBottomNavBar from '../../components/ClientBottomNavBar';
import MapComponent, { Marker } from '../../components/MapComponent'; // Import MapComponent and Marker type

// Mapbox access token configuration is assumed to be handled within MapComponent or globally once.

const ClientMainMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  // mapLoaded state is removed, MapComponent handles its own loading/rendering.
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyDrivers, setNearbyDrivers] = useState(3); // This remains as it's UI state for an overlay
  
  useEffect(() => {
    // Obtenir la position actuelle du client
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          // initializeMap call removed, MapComponent will react to location prop changes
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          // Position par défaut (Abidjan)
          const defaultLat = 5.3600;
          const defaultLng = -4.0083;
          setLocation({ latitude: defaultLat, longitude: defaultLng });
          // initializeMap call removed
        }
      );
    }
    // Cleanup function for map instance is no longer needed here.
  }, []); // Empty dependency array means this runs once on mount.

  // initializeMap function is removed.

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate('/client/booking', { state: { destination: searchQuery } });
    }
  };

  const handleBookRide = () => {
    navigate('/client/booking');
  };

  return (
    <div className="h-screen flex flex-col bg-kole-cream-light">
      {/* Carte principale */}
      <div className="flex-1 relative">
        {location ? (
          <MapComponent
            latitude={location.latitude}
            longitude={location.longitude}
            zoom={14}
            style={{ width: '100%', height: '100%' }}
            interactive={true}
            markers={[
              { id: 'clientLocation', latitude: location.latitude, longitude: location.longitude, color: '#0052FF', title: 'Ma position' },
              // Faked nearby driver markers (adjust coordinates as needed relative to actual client location)
              { id: 'driver-1', latitude: location.latitude + 0.005, longitude: location.longitude + 0.005, color: '#FF8C00', title: 'Chauffeur Kôlê 1' },
              { id: 'driver-2', latitude: location.latitude - 0.005, longitude: location.longitude + 0.003, color: '#FF8C00', title: 'Chauffeur Kôlê 2' },
              { id: 'driver-3', latitude: location.latitude + 0.003, longitude: location.longitude - 0.005, color: '#FF8C00', title: 'Chauffeur Kôlê 3' },
            ]}
          />
        ) : (
          // Fallback content if location is not yet available (MapComponent typically handles its own loading state)
          // For this refactor, we show a simple loading message similar to before,
          // but MapComponent might have its own internal spinner.
          <div className="w-full h-full bg-kole-cream-light flex items-center justify-center">
            <div className="text-center text-kole-text-secondary">
              {/* MapPin import might be removed if MapComponent handles all visual loading states */}
              {/* <MapPin className="h-12 w-12 mx-auto mb-2 text-kole-blue-primary" /> */}
              <p className="text-kole-brown-dark font-semibold">Chargement de la carte et de la position...</p>
            </div>
          </div>
        )}

        {/* Barre de recherche superposée */}
        <div className="absolute top-4 left-4 right-4 z-10">
          {/* Ensure kole-card includes border-kole-border or add it explicitly if needed */}
          <Card className="kole-card border-kole-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Search className="h-5 w-5 text-kole-text-secondary" />
                <Input
                  placeholder="Où allez-vous ?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  // Ensuring input text color is primary if not default from kole-input base style
                  className="border-none shadow-none text-lg font-medium text-kole-text-primary placeholder:text-kole-text-secondary"
                />
                <Button 
                  onClick={handleSearch}
                  className="kole-btn-primary px-4 py-2.5 aspect-square" // Adjusted padding for a more squarish icon button
                >
                  {/* Ensure icon color contrasts with primary button background */}
                  <Navigation className="h-5 w-5 text-white" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bouton de recentrage */}
        <div className="absolute bottom-24 right-4 z-10">
          {/* Style seems Kôlê compliant, assuming it's the standard for such buttons */}
          <Button
            className="w-12 h-12 rounded-full bg-white shadow-lg border border-kole-border hover:bg-kole-cream-light"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                  },
                  (error) => {
                    console.error('Erreur de géolocalisation (recenter):', error);
                    // Optionally set to default or show error to user via a toast/modal
                  }
                );
              }
            }}
          >
            <Target className="h-5 w-5 text-kole-blue-primary" />
          </Button>
        </div>

        {/* Informations sur les chauffeurs à proximité */}
        <div className="absolute top-20 left-4 z-10">
           {/* Ensure kole-card includes border-kole-border or add it explicitly */}
          <Card className="kole-card border-kole-border">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-lg font-bold text-kole-brown-dark">{nearbyDrivers}</div>
                <div className="text-sm text-kole-text-secondary">chauffeurs à proximité</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bouton de réservation rapide */}
        <div className="absolute bottom-24 left-4 right-4 z-10">
           {/* Ensure kole-card includes border-kole-border or add it explicitly */}
          <Card className="kole-card border-kole-border">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-kole-text-secondary mb-3">Besoin d'un trajet ?</p>
                <Button 
                  onClick={handleBookRide}
                  className="kole-btn-primary w-full py-3 text-lg font-semibold" // Already using kole-btn-primary
                >
                  Commander un Kôlê maintenant
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reusable ClientBottomNavBar */}
      <ClientBottomNavBar />
    </div>
  );
};

export default ClientMainMapPage;

