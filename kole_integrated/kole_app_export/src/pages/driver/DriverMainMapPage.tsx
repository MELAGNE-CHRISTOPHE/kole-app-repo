import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { MapPin, Navigation, Clock, DollarSign, X, Check } from 'lucide-react';

// Configuration de Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY || 'pk.eyJ1Ijoia29sZWFwcCIsImEiOiJjbHpzOWdwcXUwMXpqMnFwYTJkNjRlYmRuIn0.VD7jlOAfuReKlMRAm7c47g';

interface RideRequest {
  id: string;
  clientDistance: string;
  pickupAddress: string;
  destinationAddress: string;
  estimatedFare: number;
  timeToAccept: number;
  clientLocation: {
    latitude: number;
    longitude: number;
  };
  destinationLocation: {
    latitude: number;
    longitude: number;
  };
}

const DriverMainMapPage: React.FC = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dailyEarnings, setDailyEarnings] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isRideRequestVisible, setIsRideRequestVisible] = useState(false);
  const [currentRideRequest, setCurrentRideRequest] = useState<RideRequest | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);

  // Initialisation de la carte et de la géolocalisation
  useEffect(() => {
    setLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setLoadingLocation(false);
          
          // Initialisation de la carte Mapbox
          if (mapContainer.current && !map.current) {
            map.current = new mapboxgl.Map({
              container: mapContainer.current,
              style: 'mapbox://styles/mapbox/streets-v11',
              center: [longitude, latitude],
              zoom: 14
            });
            
            // Ajout des contrôles de navigation
            map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
            
            // Création du marqueur du chauffeur
            driverMarker.current = new mapboxgl.Marker({
              color: '#0052FF',
              draggable: false
            })
              .setLngLat([longitude, latitude])
              .addTo(map.current);
          }
        },
        (error) => {
          setErrorMsg('Impossible d\'obtenir la position actuelle: ' + error.message);
          setLoadingLocation(false);
          console.error(error);
        }
      );
    } else {
      setErrorMsg('La géolocalisation n\'est pas supportée par ce navigateur.');
      setLoadingLocation(false);
    }
    
    // Simulation des gains journaliers
    setDailyEarnings(5500);
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Mise à jour de la position en temps réel
  useEffect(() => {
    let watchId: number;
    
    if (isOnline && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          
          // Mise à jour de la position du marqueur et du centre de la carte
          if (map.current && driverMarker.current) {
            driverMarker.current.setLngLat([longitude, latitude]);
            map.current.flyTo({
              center: [longitude, latitude],
              essential: true,
              speed: 0.5
            });
          }
        },
        (error) => {
          console.error('Erreur de suivi de position:', error);
        },
        { enableHighAccuracy: true }
      );
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isOnline]);

  // Gestion du statut en ligne/hors ligne
  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    
    // Si le chauffeur passe en ligne, on peut simuler une demande de course après un délai
    if (!isOnline) {
      setTimeout(() => {
        if (location) {
          simulateNewRideRequest(location);
        }
      }, 5000);
    }
  };

  // Gestion des demandes de course
  const handleAcceptRide = (rideId: string) => {
    console.log('Course acceptée:', rideId);
    
    // Ajout d'un marqueur pour le client
    if (map.current && currentRideRequest) {
      const { clientLocation } = currentRideRequest;
      
      // Création d'un marqueur pour le client
      new mapboxgl.Marker({ color: '#FF8C00' })
        .setLngLat([clientLocation.longitude, clientLocation.latitude])
        .addTo(map.current);
      
      // Ajustement de la vue pour voir à la fois le chauffeur et le client
      if (location) {
        const bounds = new mapboxgl.LngLatBounds()
          .extend([location.longitude, location.latitude])
          .extend([clientLocation.longitude, clientLocation.latitude]);
        
        map.current.fitBounds(bounds, {
          padding: 100
        });
      }
    }
    
    setIsRideRequestVisible(false);
    
    // Redirection vers la page de navigation vers le client
    setTimeout(() => {
      navigate('/driver/navigate-to-client', { 
        state: { 
          rideRequest: currentRideRequest 
        } 
      });
    }, 1500);
  };

  const handleRejectRide = (rideId: string) => {
    console.log('Course refusée:', rideId);
    setIsRideRequestVisible(false);
    setCurrentRideRequest(null);
  };

  const handleClosePopup = () => {
    setIsRideRequestVisible(false);
    setCurrentRideRequest(null);
  };

  // Simulation d'une nouvelle demande de course
  const simulateNewRideRequest = (driverLocation: {latitude: number, longitude: number}) => {
    // Génération d'une position aléatoire à proximité du chauffeur
    const clientLatitude = driverLocation.latitude + (Math.random() - 0.5) * 0.01;
    const clientLongitude = driverLocation.longitude + (Math.random() - 0.5) * 0.01;
    
    // Génération d'une destination aléatoire
    const destLatitude = driverLocation.latitude + (Math.random() - 0.5) * 0.02;
    const destLongitude = driverLocation.longitude + (Math.random() - 0.5) * 0.02;
    
    const newRequest: RideRequest = {
      id: `ride_${Date.now()}`,
      clientDistance: "5 min / 1.2 km",
      pickupAddress: "Rue des Palmiers, Cocody",
      destinationAddress: "Marché Central, Plateau",
      estimatedFare: 700,
      timeToAccept: 30,
      clientLocation: {
        latitude: clientLatitude,
        longitude: clientLongitude
      },
      destinationLocation: {
        latitude: destLatitude,
        longitude: destLongitude
      }
    };
    
    setCurrentRideRequest(newRequest);
    setIsRideRequestVisible(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Barre d'état supérieure */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-800">Kôlê Chauffeur</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={isOnline ? "bg-green-500" : "bg-gray-400"}>
            {isOnline ? "En ligne" : "Hors ligne"}
          </Badge>
          <Button 
            onClick={toggleOnlineStatus}
            className={isOnline ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
          >
            {isOnline ? "Se déconnecter" : "Se connecter"}
          </Button>
        </div>
      </div>
      
      {/* Conteneur principal */}
      <div className="flex-1 relative">
        {/* Affichage des gains journaliers */}
        {dailyEarnings > 0 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white px-4 py-2 rounded-full shadow-md">
            <p className="text-sm font-medium">Gains du jour : {dailyEarnings.toLocaleString()} FCFA</p>
          </div>
        )}
        
        {/* Carte Mapbox */}
        {loadingLocation ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3">Chargement de la carte...</p>
          </div>
        ) : errorMsg ? (
          <div className="flex-1 flex justify-center items-center">
            <p className="text-red-500">{errorMsg}</p>
          </div>
        ) : (
          <div ref={mapContainer} className="w-full h-full" />
        )}
        
        {/* Popup de demande de course */}
        {isRideRequestVisible && currentRideRequest && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-11/12 max-w-md">
            <Card className="p-4 shadow-lg border-2 border-blue-200 animate-pulse">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-blue-600">Nouvelle demande de course !</h2>
                <p className="text-sm text-gray-500">Vous avez {currentRideRequest.timeToAccept} secondes pour accepter</p>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Distance</p>
                    <p className="text-sm">{currentRideRequest.clientDistance}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Prise en charge</p>
                    <p className="text-sm">{currentRideRequest.pickupAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Navigation className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Destination</p>
                    <p className="text-sm">{currentRideRequest.destinationAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <DollarSign className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Gain estimé</p>
                    <p className="text-sm">{currentRideRequest.estimatedFare} FCFA</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 border-red-300 text-red-500 hover:bg-red-50"
                  onClick={() => handleRejectRide(currentRideRequest.id)}
                >
                  <X className="h-4 w-4 mr-2" /> Refuser
                </Button>
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={() => handleAcceptRide(currentRideRequest.id)}
                >
                  <Check className="h-4 w-4 mr-2" /> Accepter
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
      
      {/* Barre de navigation inférieure */}
      <div className="bg-white border-t border-gray-200 p-3 flex justify-around">
        <button className="flex flex-col items-center text-blue-600">
          <MapPin className="h-6 w-6" />
          <span className="text-xs mt-1">Carte</span>
        </button>
        <button className="flex flex-col items-center text-gray-500" onClick={() => navigate('/driver/ride-history')}>
          <Clock className="h-6 w-6" />
          <span className="text-xs mt-1">Historique</span>
        </button>
        <button className="flex flex-col items-center text-gray-500" onClick={() => navigate('/driver/earnings')}>
          <DollarSign className="h-6 w-6" />
          <span className="text-xs mt-1">Gains</span>
        </button>
        <button className="flex flex-col items-center text-gray-500" onClick={() => navigate('/driver/profile')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs mt-1">Profil</span>
        </button>
      </div>
    </div>
  );
};

export default DriverMainMapPage;
