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
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ClientBottomNavBar from '../../components/ClientBottomNavBar'; // Import ClientBottomNavBar

// Configuration de Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY || 'pk.eyJ1Ijoia29sZWFwcCIsImEiOiJjbHpzOWdwcXUwMXpqMnFwYTJkNjRlYmRuIn0.VD7jlOAfuReKlMRAm7c47g';

const ClientMainMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyDrivers, setNearbyDrivers] = useState(3);
  
  useEffect(() => {
    // Obtenir la position actuelle du client
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          initializeMap(latitude, longitude);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          // Position par défaut (Abidjan)
          const defaultLat = 5.3600;
          const defaultLng = -4.0083;
          setLocation({ latitude: defaultLat, longitude: defaultLng });
          initializeMap(defaultLat, defaultLng);
        }
      );
    }
    
    return () => {
      if (mapLoaded) {
        const mapContainer = document.getElementById('map');
        if (mapContainer && mapContainer.firstChild) {
          mapContainer.removeChild(mapContainer.firstChild);
        }
      }
    };
  }, []);

  const initializeMap = (lat: number, lng: number) => {
    try {
      const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [lng, lat],
        zoom: 14
      });

      // Marqueur pour la position du client
      new mapboxgl.Marker({ color: '#0052FF' })
        .setLngLat([lng, lat])
        .addTo(map);

      // Ajouter quelques marqueurs de chauffeurs fictifs
      const driverLocations = [
        [lng + 0.01, lat + 0.01],
        [lng - 0.01, lat + 0.005],
        [lng + 0.005, lat - 0.01]
      ];

      driverLocations.forEach((coords) => {
        new mapboxgl.Marker({ color: '#FF8C00' })
          .setLngLat(coords)
          .addTo(map);
      });

      setMapLoaded(true);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
    }
  };

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
      {/* Carte principale selon les maquettes */}
      <div className="flex-1 relative">
        <div id="map" className="w-full h-full">
          {!mapLoaded && (
            <div className="w-full h-full bg-kole-cream-light flex items-center justify-center">
              <div className="text-center text-kole-text-secondary">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-kole-blue-primary" />
                <p className="text-kole-brown-dark font-semibold">Chargement de la carte...</p>
              </div>
            </div>
          )}
        </div>

        {/* Barre de recherche superposée selon les maquettes */}
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
              if (location) {
                initializeMap(location.latitude, location.longitude);
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

