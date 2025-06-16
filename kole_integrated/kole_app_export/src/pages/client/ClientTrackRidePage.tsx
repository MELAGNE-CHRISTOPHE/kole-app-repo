import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { MapPin, Navigation, Phone, MessageCircle, Clock } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Configuration de Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY || 'pk.eyJ1Ijoia29sZWFwcCIsImEiOiJjbHpzOWdwcXUwMXpqMnFwYTJkNjRlYmRuIn0.VD7jlOAfuReKlMRAm7c47g';

const ClientTrackRidePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const clientMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  
  const rideDetails = location.state || {
    pickup: { 
      coordinates: { latitude: 5.341, longitude: -4.017 },
      address: 'Position actuelle' 
    },
    destination: { 
      coordinates: { latitude: 5.345, longitude: -4.025 },
      address: 'Destination' 
    },
    price: 700,
    estimatedTime: '10 min',
    driver: {
      name: 'Konan Kouadio',
      rating: 4.8,
      vehicle: 'Honda PCX',
      plate: 'AB 1234 CD',
      arrivalTime: '3 min',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      phone: '+225 07 12 34 56'
    }
  };
  
  const [driverLocation, setDriverLocation] = useState<{latitude: number, longitude: number}>({
    latitude: 5.339,
    longitude: -4.019
  });
  const [rideStatus, setRideStatus] = useState<'to_client' | 'waiting' | 'in_progress' | 'arrived'>('to_client');
  const [waitingTimer, setWaitingTimer] = useState<number | null>(null);
  const [extraCharge, setExtraCharge] = useState(0);
  const [arrivalNotified, setArrivalNotified] = useState(false);
  
  // Initialiser la carte
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      const { pickup, destination } = rideDetails;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [driverLocation.longitude, driverLocation.latitude],
        zoom: 14
      });
      
      map.current.on('load', () => {
        // Ajouter les marqueurs
        driverMarker.current = new mapboxgl.Marker({ color: '#0052FF' })
          .setLngLat([driverLocation.longitude, driverLocation.latitude])
          .addTo(map.current!);
          
        clientMarker.current = new mapboxgl.Marker({ color: '#FF8C00' })
          .setLngLat([pickup.coordinates.longitude, pickup.coordinates.latitude])
          .addTo(map.current!);
          
        destinationMarker.current = new mapboxgl.Marker({ color: '#22C55E' })
          .setLngLat([destination.coordinates.longitude, destination.coordinates.latitude])
          .addTo(map.current!);
        
        // Ajuster la vue pour voir tous les points
        const bounds = new mapboxgl.LngLatBounds()
          .extend([driverLocation.longitude, driverLocation.latitude])
          .extend([pickup.coordinates.longitude, pickup.coordinates.latitude])
          .extend([destination.coordinates.longitude, destination.coordinates.latitude]);
        
        map.current!.fitBounds(bounds, {
          padding: 100
        });
        
        // Tracer l'itinéraire initial (chauffeur vers client)
        getRoute(
          map.current!, 
          [driverLocation.longitude, driverLocation.latitude], 
          [pickup.coordinates.longitude, pickup.coordinates.latitude]
        );
      });
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Simuler le mouvement du chauffeur
  useEffect(() => {
    let interval: number;
    
    if (rideStatus === 'to_client') {
      // Simuler le mouvement du chauffeur vers le client
      interval = window.setInterval(() => {
        setDriverLocation(prev => {
          const { pickup } = rideDetails;
          
          // Calculer la nouvelle position (se rapprocher du client)
          const newLat = prev.latitude + (pickup.coordinates.latitude - prev.latitude) * 0.1;
          const newLng = prev.longitude + (pickup.coordinates.longitude - prev.longitude) * 0.1;
          
          // Mettre à jour le marqueur du chauffeur
          if (driverMarker.current && map.current) {
            driverMarker.current.setLngLat([newLng, newLat]);
            
            // Mettre à jour l'itinéraire
            getRoute(
              map.current, 
              [newLng, newLat], 
              [pickup.coordinates.longitude, pickup.coordinates.latitude]
            );
          }
          
          // Vérifier si le chauffeur est arrivé près du client
          const distance = calculateDistance(
            newLat, newLng,
            pickup.coordinates.latitude, pickup.coordinates.longitude
          );
          
          if (distance < 0.0005 && !arrivalNotified) { // ~50 mètres
            setRideStatus('waiting');
            setWaitingTimer(180); // 3 minutes en secondes
            setArrivalNotified(true);
            clearInterval(interval);
          }
          
          return { latitude: newLat, longitude: newLng };
        });
      }, 1000);
    } else if (rideStatus === 'in_progress') {
      // Simuler le mouvement du chauffeur vers la destination
      interval = window.setInterval(() => {
        setDriverLocation(prev => {
          const { destination } = rideDetails;
          
          // Calculer la nouvelle position (se rapprocher de la destination)
          const newLat = prev.latitude + (destination.coordinates.latitude - prev.latitude) * 0.05;
          const newLng = prev.longitude + (destination.coordinates.longitude - prev.longitude) * 0.05;
          
          // Mettre à jour le marqueur du chauffeur
          if (driverMarker.current && map.current) {
            driverMarker.current.setLngLat([newLng, newLat]);
            
            // Mettre à jour l'itinéraire
            getRoute(
              map.current, 
              [newLng, newLat], 
              [destination.coordinates.longitude, destination.coordinates.latitude]
            );
          }
          
          // Vérifier si le chauffeur est arrivé à destination
          const distance = calculateDistance(
            newLat, newLng,
            destination.coordinates.latitude, destination.coordinates.longitude
          );
          
          if (distance < 0.0005) { // ~50 mètres
            setRideStatus('arrived');
            clearInterval(interval);
            
            // Rediriger vers la page d'évaluation après 2 secondes
            setTimeout(() => {
              navigate('/client/rate-ride', {
                state: {
                  ...rideDetails,
                  extraCharge
                }
              });
            }, 2000);
          }
          
          return { latitude: newLat, longitude: newLng };
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [rideStatus, arrivalNotified]);
  
  // Gérer le timer d'attente
  useEffect(() => {
    let interval: number;
    
    if (rideStatus === 'waiting' && waitingTimer !== null) {
      interval = window.setInterval(() => {
        setWaitingTimer(prev => {
          if (prev === null) return null;
          
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
  }, [rideStatus, waitingTimer]);
  
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
  
  // Calculer la distance entre deux points (formule de Haversine simplifiée)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
  };
  
  // Formater le temps d'attente
  const formatWaitingTime = () => {
    if (waitingTimer === null) return '00:00';
    
    const minutes = Math.floor(Math.abs(waitingTimer) / 60);
    const seconds = Math.abs(waitingTimer) % 60;
    const sign = waitingTimer < 0 ? '-' : '';
    return `${sign}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Appeler le chauffeur
  const callDriver = () => {
    if (rideDetails.driver.phone) {
      window.location.href = `tel:${rideDetails.driver.phone}`;
    }
  };
  
  // Confirmer la présence du client
  const confirmPresence = () => {
    setRideStatus('in_progress');
    
    // Mettre à jour l'itinéraire vers la destination
    if (map.current) {
      const { destination } = rideDetails;
      getRoute(
        map.current, 
        [driverLocation.longitude, driverLocation.latitude], 
        [destination.coordinates.longitude, destination.coordinates.latitude]
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Barre d'état supérieure */}
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-lg font-semibold text-gray-800">
          {rideStatus === 'to_client' && 'Chauffeur en route'}
          {rideStatus === 'waiting' && 'Chauffeur arrivé'}
          {rideStatus === 'in_progress' && 'En route vers la destination'}
          {rideStatus === 'arrived' && 'Arrivé à destination'}
        </h1>
      </div>
      
      {/* Carte */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Statut du trajet */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white px-4 py-2 rounded-full shadow-md">
          <p className="text-sm font-medium">
            {rideStatus === 'to_client' && `${rideDetails.driver.name} arrive dans ${rideDetails.driver.arrivalTime}`}
            {rideStatus === 'waiting' && 'Chauffeur en attente'}
            {rideStatus === 'in_progress' && `En route vers ${rideDetails.destination.address}`}
            {rideStatus === 'arrived' && 'Vous êtes arrivé à destination'}
          </p>
        </div>
      </div>
      
      {/* Panneau inférieur */}
      <div className="bg-white border-t border-gray-200 p-4">
        <Card>
          <CardContent className="p-4">
            {/* Informations du chauffeur */}
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                <img src={rideDetails.driver.photo} alt="Driver" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{rideDetails.driver.name}</h3>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm ml-1">{rideDetails.driver.rating}</span>
                </div>
                <p className="text-sm text-gray-500">{rideDetails.driver.vehicle} • {rideDetails.driver.plate}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={callDriver}>
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Détails du trajet */}
            <div className="space-y-3 mb-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Départ</p>
                  <p className="text-sm">{rideDetails.pickup.address}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Navigation className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Destination</p>
                  <p className="text-sm">{rideDetails.destination.address}</p>
                </div>
              </div>
            </div>
            
            {/* Actions spécifiques selon le statut */}
            {rideStatus === 'waiting' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Temps d'attente</p>
                    <p className={`font-bold ${waitingTimer !== null && waitingTimer < 0 ? 'text-red-500' : ''}`}>
                      {formatWaitingTime()}
                    </p>
                  </div>
                  
                  {waitingTimer !== null && waitingTimer < 0 && (
                    <div className="text-right">
                      <p className="text-sm font-medium">Frais supplémentaires</p>
                      <p className="font-bold text-red-500">+{extraCharge} FCFA</p>
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={confirmPresence}
                >
                  Je suis présent
                </Button>
              </div>
            )}
            
            {/* Prix total */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between">
                <p className="font-medium">Prix total</p>
                <p className="font-bold">{rideDetails.price + extraCharge} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientTrackRidePage;
