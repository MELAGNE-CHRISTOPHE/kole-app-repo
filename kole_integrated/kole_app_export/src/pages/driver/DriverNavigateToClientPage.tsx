import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { MapPin, Navigation, Clock, DollarSign, Phone, AlertTriangle, Check } from 'lucide-react';
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
        pickupAddress: string;
        clientName?: string;
        clientPhone?: string;
      }
    }
  }
}

const DriverNavigateToClientPage: React.FC = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [clientArrived, setClientArrived] = useState(false);
  const [waitingTime, setWaitingTime] = useState(180); // 3 minutes en secondes
  const [waitingStarted, setWaitingStarted] = useState(false);
  const [extraCharge, setExtraCharge] = useState(0);
  
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
    pickupAddress: 'Rue des Palmiers, Cocody',
    clientName: 'Aminata Touré',
    clientPhone: '+225 07 11 22 33'
  };

  useEffect(() => {
    // Obtenir la position actuelle du chauffeur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          
          // Initialiser la carte une fois la position obtenue
          initializeMap(latitude, longitude, rideRequest.clientLocation);
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
  
  // Timer pour le décompte d'attente
  useEffect(() => {
    let interval: number | undefined;
    
    if (waitingStarted && waitingTime > 0) {
      interval = window.setInterval(() => {
        setWaitingTime(prev => {
          const newTime = prev - 1;
          
          // Ajouter des frais supplémentaires toutes les minutes après les 3 minutes initiales
          if (newTime % 60 === 0 && newTime < 0) {
            setExtraCharge(prev => prev + 50);
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [waitingStarted, waitingTime]);

  // Initialisation de la carte avec itinéraire
  const initializeMap = (driverLat: number, driverLng: number, clientLocation: {latitude: number, longitude: number}) => {
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
        .setLngLat([clientLocation.longitude, clientLocation.latitude])
        .addTo(map);
      
      // Ajuster la vue pour voir les deux points
      const bounds = new mapboxgl.LngLatBounds()
        .extend([driverLng, driverLat])
        .extend([clientLocation.longitude, clientLocation.latitude]);
      
      map.fitBounds(bounds, {
        padding: 100
      });
      
      // Tracer l'itinéraire
      getRoute(map, [driverLng, driverLat], [clientLocation.longitude, clientLocation.latitude]);
      
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
  
  // Notification d'arrivée au client
  const notifyArrival = () => {
    setClientArrived(true);
    setWaitingStarted(true);
    // Ici, on pourrait envoyer une notification au client via Firebase
  };
  
  // Confirmation de la présence du client
  const confirmClientPresence = () => {
    navigate('/driver/navigate-to-destination', { 
      state: { 
        rideRequest: rideRequest 
      } 
    });
  };
  
  // Appeler le client
  const callClient = () => {
    if (rideRequest.clientPhone) {
      window.location.href = `tel:${rideRequest.clientPhone}`;
    }
  };
  
  // Formater le temps d'attente
  const formatWaitingTime = () => {
    const minutes = Math.floor(Math.abs(waitingTime) / 60);
    const seconds = Math.abs(waitingTime) % 60;
    const sign = waitingTime < 0 ? '-' : '';
    return `${sign}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Barre d'état supérieure */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-gray-800">Navigation vers le client</h1>
      </div>
      
      {/* Carte */}
      <div id="map" className="flex-1"></div>
      
      {/* Panneau d'information */}
      <div className="bg-white border-t border-gray-200 p-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {clientArrived ? 'En attente du client' : 'En route vers le client'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Adresse de prise en charge */}
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Adresse de prise en charge</p>
                  <p className="text-sm">{rideRequest.pickupAddress}</p>
                </div>
              </div>
              
              {/* Client */}
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-sm">{rideRequest.clientName}</p>
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex gap-3">
                {!clientArrived ? (
                  <>
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={notifyArrival}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" /> Notifier l'arrivée
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={callClient}
                    >
                      <Phone className="h-4 w-4 mr-2" /> Appeler
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Timer d'attente */}
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium">Temps d'attente</p>
                        <p className={`text-sm font-bold ${waitingTime < 0 ? 'text-red-500' : ''}`}>
                          {formatWaitingTime()}
                        </p>
                      </div>
                      
                      {waitingTime < 0 && (
                        <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                          <p className="text-sm text-red-600">
                            Frais supplémentaires: {extraCharge} FCFA
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        <Button 
                          className="flex-1 bg-green-500 hover:bg-green-600"
                          onClick={confirmClientPresence}
                        >
                          <Check className="h-4 w-4 mr-2" /> Client présent
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={callClient}
                        >
                          <Phone className="h-4 w-4 mr-2" /> Appeler
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverNavigateToClientPage;
