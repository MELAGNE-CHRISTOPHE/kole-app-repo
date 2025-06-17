import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { MapPin, Navigation, ArrowLeft, Search } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Configuration de Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY || 'pk.eyJ1Ijoia29sZWFwcCIsImEiOiJjbHpzOWdwcXUwMXpqMnFwYTJkNjRlYmRuIn0.VD7jlOAfuReKlMRAm7c47g';

const ClientBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialDestination = location.state?.destination || '';
  
  const [clientLocation, setClientLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [destinationQuery, setDestinationQuery] = useState(initialDestination);
  const [pickupAddress, setPickupAddress] = useState('Ma position actuelle');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [destinationCoordinates, setDestinationCoordinates] = useState<{latitude: number, longitude: number} | null>(null);
  
  useEffect(() => {
    // Obtenir la position actuelle du client
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setClientLocation({ latitude, longitude });
          
          // Obtenir l'adresse du client par géocodage inverse
          reverseGeocode(latitude, longitude)
            .then(address => {
              if (address) setPickupAddress(address);
            });
          
          // Si une destination est déjà spécifiée, la géocoder
          if (initialDestination) {
            geocodeDestination(initialDestination);
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  }, [initialDestination]);
  
  // Effet pour initialiser la carte une fois les deux positions connues
  useEffect(() => {
    if (clientLocation && destinationCoordinates) {
      initializeMap(clientLocation, destinationCoordinates);
    }
  }, [clientLocation, destinationCoordinates]);
  
  // Géocodage inverse pour obtenir l'adresse à partir des coordonnées
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      return null;
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
      return null;
    }
  };
  
  // Géocodage pour obtenir les coordonnées à partir d'une adresse
  const geocodeDestination = async (address: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        setDestinationCoordinates({ latitude, longitude });
        setDestinationAddress(data.features[0].place_name);
      }
    } catch (error) {
      console.error('Erreur de géocodage:', error);
    }
  };
  
  // Initialisation de la carte avec itinéraire
  const initializeMap = (start: {latitude: number, longitude: number}, end: {latitude: number, longitude: number}) => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [start.longitude, start.latitude],
      zoom: 12
    });
    
    map.on('load', () => {
      // Ajouter les marqueurs
      new mapboxgl.Marker({ color: '#0052FF' })
        .setLngLat([start.longitude, start.latitude])
        .addTo(map);
        
      new mapboxgl.Marker({ color: '#FF8C00' })
        .setLngLat([end.longitude, end.latitude])
        .addTo(map);
      
      // Ajuster la vue pour voir les deux points
      const bounds = new mapboxgl.LngLatBounds()
        .extend([start.longitude, start.latitude])
        .extend([end.longitude, end.latitude]);
      
      map.fitBounds(bounds, {
        padding: 100
      });
      
      // Tracer l'itinéraire
      getRoute(map, [start.longitude, start.latitude], [end.longitude, end.latitude]);
      
      setMapLoaded(true);
    });
  };
  
  // Obtenir et afficher l'itinéraire
  const getRoute = async (map: mapboxgl.Map, start: [number, number], end: [number, number]) => {
    try {
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
      );
      const json = await query.json();
      const data = json.routes[0];
      const route = data.geometry.coordinates;
      
      // Calculer le prix estimé (basé sur la distance)
      if (data.distance) {
        const distanceKm = data.distance / 1000;
        const basePrice = 300; // Prix de base en FCFA
        const pricePerKm = 100; // Prix par km en FCFA
        const estimatedPrice = Math.round(basePrice + (distanceKm * pricePerKm));
        setEstimatedPrice(estimatedPrice);
      }
      
      // Calculer le temps estimé
      if (data.duration) {
        const minutes = Math.round(data.duration / 60);
        setEstimatedTime(`${minutes} min`);
      }
      
      // Ajouter la source de données pour l'itinéraire
      if (!map.getSource('route')) {
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route
            }
          }
        });
        
        // Ajouter la couche pour afficher l'itinéraire
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#0052FF',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      } else {
        // Mettre à jour l'itinéraire existant
        map.getSource('route').setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route
          }
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'itinéraire:", error);
    }
  };
  
  // Rechercher une destination
  const handleSearch = () => {
    if (destinationQuery.trim()) {
      geocodeDestination(destinationQuery);
    }
  };
  
  // Commander un trajet
  const bookRide = () => {
    if (clientLocation && destinationCoordinates) {
      navigate('/client/searching-driver', {
        state: {
          pickup: {
            coordinates: clientLocation,
            address: pickupAddress
          },
          destination: {
            coordinates: destinationCoordinates,
            address: destinationAddress
          },
          price: estimatedPrice,
          estimatedTime: estimatedTime
        }
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-kole-cream-bg"> {/* Standard Kôlê page background */}
      {/* Barre d'état supérieure */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <button onClick={() => navigate('/client')} className="mr-4 p-2 rounded-full hover:bg-kole-hover-bg"> {/* Hover effect */}
          <ArrowLeft className="h-5 w-5 text-kole-text-primary" /> {/* Icon color standardized */}
        </button>
        <h1 className="text-lg font-semibold text-kole-text-primary">Commander un Kôlê</h1> {/* Text color standardized */}
      </div>
      
      {/* Barre de recherche */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex gap-2 mb-3">
          <div className="flex-none pt-2">
            <MapPin className="h-5 w-5 text-kole-blue-primary" /> {/* Icon color standardized */}
          </div>
          <div className="flex-1">
            <p className="text-sm text-kole-text-secondary">Départ</p> {/* Text color standardized */}
            <p className="font-medium truncate text-kole-text-primary">{pickupAddress}</p> {/* Ensure primary text color */}
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-none pt-2">
            {/* Assuming kole-orange-primary or similar exists, otherwise use another theme color e.g. kole-accent */}
            <Navigation className="h-5 w-5 text-kole-orange-primary" /> {/* Icon color standardized */}
          </div>
          <div className="flex-1">
            <p className="text-sm text-kole-text-secondary">Destination</p> {/* Text color standardized */}
            <div className="flex gap-2">
              <Input
                placeholder="Où allez-vous ?"
                value={destinationQuery}
                onChange={(e) => setDestinationQuery(e.target.value)}
                className="flex-1 kole-input" /* Ensure kole-input styling */
              />
              {/* Apply Kôlê button style, e.g., secondary or icon-specific */}
              <Button onClick={handleSearch} className="kole-btn-secondary p-2.5 aspect-square"> {/* Made squarish */}
                <Search className="h-5 w-5" /> {/* Adjusted size for consistency */}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Carte */}
      <div className="flex-1 relative">
        {!mapLoaded ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kole-blue-primary"></div> {/* Spinner color standardized */}
            <p className="ml-3 text-kole-text-secondary">Chargement de l'itinéraire...</p> {/* Text color standardized */}
          </div>
        ) : (
          <div id="map" className="w-full h-full" />
        )}
      </div>
      
      {/* Panneau inférieur */}
      {destinationCoordinates && (
        <div className="bg-white border-t border-kole-border p-4"> {/* Border color standardized */}
          <Card className="border-kole-border"> {/* Explicitly set border if Card default isn't Kôlê */}
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-kole-text-primary">Détails du trajet</CardTitle> {/* Text color standardized */}
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-sm text-kole-text-secondary">Prix estimé</p> {/* Text color standardized */}
                  <p className="font-bold text-xl text-kole-text-primary">{estimatedPrice} FCFA</p> {/* Text color standardized */}
                </div>
                <div>
                  <p className="text-sm text-kole-text-secondary">Temps estimé</p> {/* Text color standardized */}
                  <p className="font-medium text-kole-text-primary">{estimatedTime}</p> {/* Text color standardized */}
                </div>
              </div>
              
              <Button 
                className="w-full kole-btn-primary" /* Standard Kôlê primary button */
                onClick={bookRide}
              >
                Commander maintenant
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClientBookingPage;
