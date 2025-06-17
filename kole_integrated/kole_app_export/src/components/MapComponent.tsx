// src/components/MapComponent.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getEnvVariable } from '../utils/environment';

// Définir la clé API Mapbox
mapboxgl.accessToken = getEnvVariable('VITE_MAPBOX_API_KEY');

// Types pour les marqueurs
export interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  color?: string; // Retained for default/other markers
  title?: string;
  iconElement?: HTMLElement; // For fully custom HTML element markers
  isKoleDriver?: boolean;   // Specific flag for Kôlê driver style
}

// Type pour l'état des marqueurs
interface MarkerState {
  marker: mapboxgl.Marker;
  position: [number, number];
}

// Props du composant
interface MapComponentProps {
  latitude: number;
  longitude: number;
  zoom: number;
  style: React.CSSProperties;
  markers?: Marker[];
  route?: {
    origin: [number, number];
    destination: [number, number];
    waypoints?: [number, number][];
  };
  interactive?: boolean;
  driverLatitude?: number;
  driverLongitude?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({
  latitude,
  longitude,
  zoom,
  style,
  markers = [],
  route,
  interactive = true,
  driverLatitude,
  driverLongitude
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const markersRef = useRef<Record<string, MarkerState>>({});

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [longitude, latitude],
      zoom: zoom,
      interactive: interactive
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
  }, [latitude, longitude, zoom, interactive]);

  // Gérer les marqueurs
  const updateMarkers = useCallback(() => {
    if (!map.current || !mapInitialized) return;

    // Créer ou mettre à jour les marqueurs
    markers.forEach(marker => {
      const position: [number, number] = [marker.longitude, marker.latitude];
      
      // Si le marqueur existe déjà, mettre à jour sa position
      if (markersRef.current[marker.id]) {
        const existingMarker = markersRef.current[marker.id];
        
        // Ne mettre à jour que si la position a changé
        if (existingMarker.position[0] !== position[0] || existingMarker.position[1] !== position[1]) {
          existingMarker.marker.setLngLat(position);
          existingMarker.position = position;
        }
      } 
      // Sinon, créer un nouveau marqueur
      else {
        let markerElement: HTMLElement | undefined = undefined;

        if (marker.iconElement) {
          markerElement = marker.iconElement;
        } else if (marker.isKoleDriver) {
          const el = document.createElement('div');
          // Using the class defined in index.css for Kôlê driver (orange circle with white border)
          // Alternatively, apply styles directly as per subtask if .kole-driver-map-icon is not preferred for some reason.
          // el.style.backgroundColor = '#FF8C00'; // kole-orange-primary
          // el.style.width = '20px';
          // el.style.height = '20px';
          // el.style.borderRadius = '50%';
          // el.style.border = '2px solid white';
          // el.style.boxShadow = '0 0 0 1px #FF8C00'; // Creates an outer ring effect
          el.className = 'kole-driver-map-icon'; // Assumes this class provides the Kôlê orange dot style
          // Ensure width/height are set by the class or override here if needed
          // Forcing size here to ensure it's applied if CSS doesn't specify it for this generic class
          el.style.width = '20px';
          el.style.height = '20px';
          markerElement = el;
        } else { // Default marker
          const el = document.createElement('div');
          el.className = 'marker'; // Generic marker class
          el.style.backgroundColor = marker.color || '#3FB1CE'; // Default blue if no color
          el.style.width = '16px'; // Slightly smaller default
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.3)';
          markerElement = el;
        }
        
        if (marker.title && markerElement) { // Add title if element exists
          markerElement.title = marker.title;
        }
        
        const newMarker = markerElement
          ? new mapboxgl.Marker(markerElement).setLngLat(position)
          : new mapboxgl.Marker({ color: marker.color || '#3FB1CE' }).setLngLat(position); // Fallback if no element
          
        if (map.current) {
          newMarker.addTo(map.current);
        }
          
        markersRef.current[marker.id] = {
          marker: newMarker,
          position: position
        };
      }
    });
    
    // Supprimer les marqueurs qui ne sont plus dans la liste
    Object.keys(markersRef.current).forEach(id => {
      if (!markers.find(m => m.id === id)) {
        markersRef.current[id].marker.remove();
        delete markersRef.current[id];
      }
    });
  }, [markers, mapInitialized]);

  // Mettre à jour les marqueurs lorsqu'ils changent
  useEffect(() => {
    updateMarkers();
  }, [markers, updateMarkers]);

  // Gérer l'itinéraire
  useEffect(() => {
    if (!map.current || !mapInitialized || !route) return;

    // Supprimer l'itinéraire existant s'il y en a un
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    // Créer un itinéraire simple (ligne droite) entre l'origine et la destination
    const routeCoordinates = [route.origin];
    
    // Ajouter les points intermédiaires s'ils existent
    if (route.waypoints && route.waypoints.length > 0) {
      routeCoordinates.push(...route.waypoints);
    }
    
    routeCoordinates.push(route.destination);

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
    const bounds = routeCoordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(routeCoordinates[0], routeCoordinates[0]));

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });
  }, [route, mapInitialized]);

  // Gérer la position du chauffeur
  useEffect(() => {
    if (!map.current || !mapInitialized || driverLatitude === undefined || driverLongitude === undefined) return;

    // Identifiant unique pour le marqueur du chauffeur
    const driverMarkerId = 'driver-position';
    
    // Position du chauffeur
    const position: [number, number] = [driverLongitude, driverLatitude];
    
    // Si le marqueur du chauffeur existe déjà, mettre à jour sa position
    if (markersRef.current[driverMarkerId]) {
      const existingMarker = markersRef.current[driverMarkerId];
      if (existingMarker.position[0] !== position[0] || existingMarker.position[1] !== position[1]) {
        existingMarker.marker.setLngLat(position);
        existingMarker.position = position;
      }
    } 
    // Sinon, créer un nouveau marqueur pour le chauffeur (Kôlê style)
    else {
      const el = document.createElement('div');
      // Using the class defined in index.css for Kôlê driver (orange circle with white border)
      // el.style.backgroundColor = '#FF8C00'; // kole-orange-primary (driver tracking color, distinct from other 'kole drivers')
      // el.style.width = '24px'; // Main driver can be slightly larger
      // el.style.height = '24px';
      // el.style.borderRadius = '50%';
      // el.style.border = '3px solid white'; // Thicker border for prominence
      // el.style.boxShadow = '0 0 8px rgba(0,0,0,0.6)';
      el.className = 'kole-driver-map-icon'; // Main driver uses the same style as other Kôlê drivers
      // Ensure width/height are set by the class or override here if needed
      el.style.width = '24px'; // Make main driver marker slightly larger than other Kole drivers if they are 20px
      el.style.height = '24px';
      el.title = 'Votre Chauffeur'; // More specific title
      
      const newMarker = new mapboxgl.Marker(el)
        .setLngLat(position);
        
      if (map.current) {
        newMarker.addTo(map.current);
      }
        
      markersRef.current[driverMarkerId] = {
        marker: newMarker,
        position: position
      };
    }
    
    // Centrer la carte sur la position du chauffeur avec une animation fluide
    map.current.flyTo({
      center: position,
      zoom: 15,
      speed: 0.8
    });
  }, [driverLatitude, driverLongitude, mapInitialized]);

  return <div ref={mapContainer} style={style} data-testid="map-container" />;
};

export default MapComponent;
