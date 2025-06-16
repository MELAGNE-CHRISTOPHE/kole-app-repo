import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { MapPin, Navigation, Clock, DollarSign, Check, Star } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Configuration de Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY || 'pk.eyJ1Ijoia29sZWFwcCIsImEiOiJjbHpzOWdwcXUwMXpqMnFwYTJkNjRlYmRuIn0.VD7jlOAfuReKlMRAm7c47g';

interface NavigationProps {
  location: {
    state: {
      rideRequest: {
        id: string;
        clientLocation: {
          latitude: number;
          longitude: number;
        };
        destinationLocation: {
          latitude: number;
          longitude: number;
        };
        destinationAddress: string;
        clientName?: string;
        clientPhone?: string;
        estimatedFare: number;
      }
    }
  }
}

const DriverNavigateToDestinationPage: React.FC = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [rideCompleted, setRideCompleted] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState('10 min');
  const [distance, setDistance] = useState('3.5 km');
  
  // Simulation des données de la course
  const rideRequest = {
    id: 'ride_123456',
    clientLocation: {
      latitude: 5.341,
      longitude: -4.017
    },
    destinationLocation: {
      latitude: 5.345,
      longitude: -4.025
    },
    destinationAddress: 'Marché Central, Plateau',
    clientName: 'Aminata Touré',
    clientPhone: '+225 07 11 22 33',
    estimatedFare: 700
  };

  useEffect(() => {
    // Obtenir la position actuelle du chauffeur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          
          // Initialiser la carte une fois la position obtenue
          initializeMap(latitude, longitude, rideRequest.destinationLocation);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
    
    // Nettoyage
    return () => {
      if (mapLoaded) {
        const map = mapboxgl.Map.instance;
        if (map) map.remove();
      }
    };
  }, []);

  // Initialisation de la carte avec itinéraire
  const initializeMap = (driverLat: number, driverLng: number, destinationLocation: {latitude: number, longitude: number}) => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [driverLng, driverLat],
      zoom: 14
    });
    
    map.on('load', () => {
      // Ajouter les marqueurs
      new mapboxgl.Marker({ color: '#0052FF' })
        .setLngLat([driverLng, driverLat])
        .addTo(map);
        
      new mapboxgl.Marker({ color: '#FF8C00' })
        .setLngLat([destinationLocation.longitude, destinationLocation.latitude])
        .addTo(map);
      
      // Ajuster la vue pour voir les deux points
      const bounds = new mapboxgl.LngLatBounds()
        .extend([driverLng, driverLat])
        .extend([destinationLocation.longitude, destinationLocation.latitude]);
      
      map.fitBounds(bounds, {
        padding: 100
      });
      
      // Tracer l'itinéraire
      getRoute(map, [driverLng, driverLat], [destinationLocation.longitude, destinationLocation.latitude]);
      
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
      
      // Mettre à jour les informations de trajet
      if (data.duration) {
        const minutes = Math.round(data.duration / 60);
        setEstimatedArrival(`${minutes} min`);
      }
      
      if (data.distance) {
        const km = (data.distance / 1000).toFixed(1);
        setDistance(`${km} km`);
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
  
  // Compléter la course
  const completeRide = () => {
    setRideCompleted(true);
  };
  
  // Confirmer la fin de la course
  const confirmRideCompletion = () => {
    // Ici, on pourrait envoyer une notification au client via Firebase
    // et mettre à jour le statut de la course dans la base de données
    
    // Redirection vers la page d'accueil du chauffeur
    navigate('/driver');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Barre d'état supérieure */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-gray-800">Navigation vers la destination</h1>
      </div>
      
      {/* Carte */}
      <div id="map" className="flex-1"></div>
      
      {/* Panneau d'information */}
      <div className="bg-white border-t border-gray-200 p-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {rideCompleted ? 'Course terminée' : 'En route vers la destination'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!rideCompleted ? (
                <>
                  {/* Adresse de destination */}
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Destination</p>
                      <p className="text-sm">{rideRequest.destinationAddress}</p>
                    </div>
                  </div>
                  
                  {/* Informations de trajet */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Temps estimé</p>
                        <p className="text-sm">{estimatedArrival}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Navigation className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Distance</p>
                        <p className="text-sm">{distance}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Client et tarif */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium">Client</p>
                        <p className="text-sm">{rideRequest.clientName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <DollarSign className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Tarif</p>
                        <p className="text-sm">{rideRequest.estimatedFare} FCFA</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bouton pour terminer la course */}
                  <Button 
                    className="w-full bg-green-500 hover:bg-green-600"
                    onClick={completeRide}
                  >
                    <Check className="h-4 w-4 mr-2" /> Arrivé à destination
                  </Button>
                </>
              ) : (
                <>
                  {/* Récapitulatif de la course */}
                  <div className="bg-green-50 border border-green-200 rounded p-4 mb-4 text-center">
                    <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">Course terminée avec succès !</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <p className="text-sm">Tarif de la course</p>
                      <p className="text-sm font-medium">{rideRequest.estimatedFare} FCFA</p>
                    </div>
                    
                    <div className="flex justify-between">
                      <p className="text-sm">Commission Kôlê (20%)</p>
                      <p className="text-sm font-medium">-{Math.round(rideRequest.estimatedFare * 0.2)} FCFA</p>
                    </div>
                    
                    <div className="flex justify-between border-t pt-2">
                      <p className="font-medium">Votre gain</p>
                      <p className="font-medium">{Math.round(rideRequest.estimatedFare * 0.8)} FCFA</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-center mb-2">Le client va maintenant évaluer la course</p>
                    <div className="flex justify-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-6 w-6 text-amber-400" fill="#FBBF24" />
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={confirmRideCompletion}
                    >
                      Terminer et retourner à l'accueil
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverNavigateToDestinationPage;
