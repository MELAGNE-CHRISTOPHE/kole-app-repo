// src/components/driver/RealTimeMap.tsx
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getEnvVariable } from '../../utils/environment';

// Définir la clé API Mapbox
mapboxgl.accessToken = getEnvVariable('VITE_MAPBOX_API_KEY');

// Types pour les props
interface RealTimeMapProps {
  driverPosition?: { lat: number; lng: number };
  clientPosition?: { lat: number; lng: number };
  destinationPosition?: { lat: number; lng: number };
  showRoute?: boolean;
}

const RealTimeMap: React.FC<RealTimeMapProps> = ({ 
  driverPosition,
  clientPosition,
  destinationPosition,
  showRoute = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Marqueurs pour le chauffeur, le client et la destination
  const driverMarker = useRef<mapboxgl.Marker | null>(null);
  const clientMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  
  // Position par défaut (Abidjan)
  const defaultPosition = {
    lat: 5.33635,
    lng: -4.01266
  };

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [driverPosition?.lng || defaultPosition.lng, driverPosition?.lat || defaultPosition.lat],
      zoom: 14
    });

    // Ajouter les contrôles de navigation
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Ajouter le contrôle de géolocalisation
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }),
      'top-right'
    );

    // Marquer la carte comme initialisée
    map.current.on('load', () => {
      setMapInitialized(true);
    });

    // Nettoyer la carte lors du démontage du composant
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Mettre à jour la position du chauffeur
  useEffect(() => {
    if (!map.current || !mapInitialized || !driverPosition) return;
    
    const position = [driverPosition.lng, driverPosition.lat];
    
    // Si le marqueur existe déjà, mettre à jour sa position
    if (driverMarker.current) {
      driverMarker.current.setLngLat(position as [number, number]);
    } 
    // Sinon, créer un nouveau marqueur
    else {
      const element = document.createElement('div');
      element.className = 'driver-marker';
      element.style.backgroundColor = '#FF5722';
      element.style.width = '24px';
      element.style.height = '24px';
      element.style.borderRadius = '50%';
      element.style.border = '3px solid white';
      element.style.boxShadow = '0 0 8px rgba(0, 0, 0, 0.5)';
      
      driverMarker.current = new mapboxgl.Marker(element)
        .setLngLat(position as [number, number])
        .addTo(map.current);
    }
    
    // Centrer la carte sur la position du chauffeur
    map.current.flyTo({
      center: position as [number, number],
      zoom: 14,
      speed: 0.8
    });
  }, [driverPosition, mapInitialized]);

  // Mettre à jour la position du client
  useEffect(() => {
    if (!map.current || !mapInitialized || !clientPosition) return;
    
    const position = [clientPosition.lng, clientPosition.lat];
    
    // Si le marqueur existe déjà, mettre à jour sa position
    if (clientMarker.current) {
      clientMarker.current.setLngLat(position as [number, number]);
    } 
    // Sinon, créer un nouveau marqueur
    else {
      const element = document.createElement('div');
      element.className = 'client-marker';
      element.style.backgroundColor = '#4CAF50';
      element.style.width = '20px';
      element.style.height = '20px';
      element.style.borderRadius = '50%';
      element.style.border = '2px solid white';
      element.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
      
      clientMarker.current = new mapboxgl.Marker(element)
        .setLngLat(position as [number, number])
        .addTo(map.current);
    }
  }, [clientPosition, mapInitialized]);

  // Mettre à jour la position de destination
  useEffect(() => {
    if (!map.current || !mapInitialized || !destinationPosition) return;
    
    const position = [destinationPosition.lng, destinationPosition.lat];
    
    // Si le marqueur existe déjà, mettre à jour sa position
    if (destinationMarker.current) {
      destinationMarker.current.setLngLat(position as [number, number]);
    } 
    // Sinon, créer un nouveau marqueur
    else {
      const element = document.createElement('div');
      element.className = 'destination-marker';
      element.style.backgroundColor = '#2196F3';
      element.style.width = '20px';
      element.style.height = '20px';
      element.style.borderRadius = '50%';
      element.style.border = '2px solid white';
      element.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
      
      destinationMarker.current = new mapboxgl.Marker(element)
        .setLngLat(position as [number, number])
        .addTo(map.current);
    }
  }, [destinationPosition, mapInitialized]);

  // Afficher l'itinéraire si demandé
  useEffect(() => {
    if (!map.current || !mapInitialized || !showRoute || !driverPosition || !clientPosition) return;

    // Supprimer l'itinéraire existant s'il y en a un
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    // Créer un itinéraire simple entre le chauffeur et le client
    const routeCoordinates = [
      [driverPosition.lng, driverPosition.lat],
      [clientPosition.lng, clientPosition.lat]
    ];

    // Ajouter la destination si elle existe
    if (destinationPosition) {
      routeCoordinates.push([destinationPosition.lng, destinationPosition.lat]);
    }

    // Ajouter la source et la couche pour l'itinéraire
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates
        }
      }
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3887be',
        'line-width': 5,
        'line-opacity': 0.75
      }
    });

    // Ajuster la vue pour voir tout l'itinéraire
    const bounds = new mapboxgl.LngLatBounds()
      .extend([driverPosition.lng, driverPosition.lat])
      .extend([clientPosition.lng, clientPosition.lat]);
      
    if (destinationPosition) {
      bounds.extend([destinationPosition.lng, destinationPosition.lat]);
    }

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });
  }, [showRoute, driverPosition, clientPosition, destinationPosition, mapInitialized]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} data-testid="realtime-map" />;
};

export default RealTimeMap;
