// src/components/driver/NavigationMap.tsx
import React from 'react';
import { FaMapMarkerAlt, FaDirections, FaCheckCircle } from 'react-icons/fa';
import '../../styles/theme.css';

interface NavigationMapProps {
  destination?: string;
  eta?: string;
  distance?: string;
  isArrivedAtPickup?: boolean;
}

const NavigationMap: React.FC<NavigationMapProps> = ({ 
  destination = "Destination", 
  eta = "15 min", 
  distance = "3.2 km",
  isArrivedAtPickup = false
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* Bannière d'instructions */}
      <div className="bg-[var(--kole-blue)] text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FaDirections className="text-xl mr-2" />
            <div>
              <p className="font-medium">{isArrivedAtPickup ? "Vers destination finale" : "Vers le client"}</p>
              <p className="text-sm">{destination}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold">{eta}</p>
            <p className="text-sm">{distance}</p>
          </div>
        </div>
      </div>
      
      {/* Zone de carte */}
      <div className="flex-1 bg-gray-200 relative">
        {/* Placeholder pour la carte */}
        <div className="h-full flex flex-col items-center justify-center">
          <FaMapMarkerAlt className="text-[var(--kole-blue)] text-5xl mb-4" />
          <p className="text-center text-[var(--kole-brown)]">
            Carte de navigation sera intégrée ici avec Leaflet/Mapbox
          </p>
        </div>
      </div>
      
      {/* Boutons d'action */}
      <div className="bg-white p-4 rounded-b-lg shadow-md">
        {isArrivedAtPickup ? (
          <button className="w-full py-3 bg-[var(--kole-red)] text-white rounded-md font-medium">
            Terminer la course
          </button>
        ) : (
          <button className="w-full py-3 bg-[var(--kole-green)] text-white rounded-md font-medium flex items-center justify-center">
            <FaCheckCircle className="mr-2" />
            Je suis arrivé
          </button>
        )}
        
        <div className="flex justify-between mt-3">
          <button className="flex-1 mr-2 py-2 bg-[var(--kole-gray-light)] text-[var(--kole-brown)] rounded-md font-medium text-sm">
            Contacter le client
          </button>
          <button className="flex-1 ml-2 py-2 bg-[var(--kole-gray-light)] text-[var(--kole-brown)] rounded-md font-medium text-sm">
            SOS
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavigationMap;
