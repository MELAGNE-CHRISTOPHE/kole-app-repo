import React, { useEffect, useState } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction pour l'icône par défaut de Leaflet avec Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapContainerProps {
  // Props futures: position initiale, marqueurs, etc.
}

const MapComponent: React.FC<MapContainerProps> = () => {
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tileLayerUrl = import.meta.env.VITE_LEAFLET_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const mapApiKey = import.meta.env.VITE_MAP_API_KEY;

  useEffect(() => {
    if (!tileLayerUrl.includes("openstreetmap.org") && !mapApiKey) {
      console.error("Clé API pour la carte non configurée ou URL du fournisseur de tuiles invalide.");
      setError("Configuration de la carte manquante. Veuillez vérifier les variables d'environnement.");
      setMapReady(false);
      return;
    }
    setMapReady(true);
  }, [mapApiKey, tileLayerUrl]);

  // Test de rendu simple
  // return <div style={{color: "red", fontSize: "30px", padding: "20px", border: "2px solid blue"}}>TEST MAP CONTAINER RENDERING</div>;

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: '#f0f0f0', padding: '20px' }}>
        <p style={{ color: 'red', textAlign: 'center' }}>Carte indisponible, réessayez plus tard.<br />({error})</p>
      </div>
    );
  }

  if (!mapReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '20px' }}>
        <p>Chargement de la carte...</p>
      </div>
    );
  }

  const defaultPosition: L.LatLngExpression = [5.336264, -4.027996];

  return (
    <div style={{ height: "100%", width: "100%" }}> {/* Conteneur parent avec hauteur/largeur explicites */} 
      {/* Message de test pour vérifier si le composant est monté */}
      {/* <h1 style={{color: "magenta", position: "absolute", zIndex: 9999}}>MAP CONTAINER EST MONTÉ</h1> */}
      <LeafletMapContainer center={defaultPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileLayerUrl}
        />
        <Marker position={defaultPosition}>
          <Popup>
            Position actuelle du chauffeur.
          </Popup>
        </Marker>
      </LeafletMapContainer>
    </div>
  );
};

export default MapComponent;

