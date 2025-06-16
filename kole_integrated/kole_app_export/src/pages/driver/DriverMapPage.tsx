// src/pages/driver/DriverMapPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../../components/MapComponent';
import DriverBottomNav from '../../components/driver/DriverBottomNav';
import StatusButton from '../../components/driver/StatusButton/StatusButton';
import CourseNotification from '../../components/driver/CourseNotification';

const DriverMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [driverPosition, setDriverPosition] = useState<{lat: number, lng: number} | null>(null);
  
  // Simuler la position du chauffeur
  useEffect(() => {
    // Position initiale (Abidjan)
    setDriverPosition({
      lat: 5.33635,
      lng: -4.01266
    });
    
    // Simuler un changement de position toutes les 10 secondes
    const interval = setInterval(() => {
      if (isOnline) {
        setDriverPosition(prev => {
          if (!prev) return prev;
          return {
            lat: prev.lat + (Math.random() - 0.5) * 0.001,
            lng: prev.lng + (Math.random() - 0.5) * 0.001
          };
        });
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isOnline]);
  
  // Simuler une notification de course après un délai si le chauffeur est en ligne
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isOnline && !showNotification) {
      timeout = setTimeout(() => {
        setShowNotification(true);
      }, 15000); // 15 secondes après être passé en ligne
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isOnline, showNotification]);
  
  // Gérer le changement de statut
  const handleStatusChange = (status: boolean) => {
    setIsOnline(status);
    if (!status) {
      setShowNotification(false);
    }
  };
  
  // Gérer l'acceptation d'une course
  const handleAcceptCourse = () => {
    setShowNotification(false);
    navigate('/driver/navigate-to-client');
  };
  
  // Gérer le refus d'une course
  const handleRejectCourse = () => {
    setShowNotification(false);
  };
  
  return (
    <div className="h-screen flex flex-col">
      {/* Carte en plein écran */}
      <div className="flex-grow relative">
        <MapComponent 
          latitude={driverPosition?.lat || 5.33635}
          longitude={driverPosition?.lng || -4.01266}
          zoom={14}
          style={{ width: '100%', height: '100%' }}
          interactive={true}
          driverLatitude={driverPosition?.lat}
          driverLongitude={driverPosition?.lng}
        />
        
        {/* Bouton de statut en superposition */}
        <div className="absolute top-4 left-0 right-0 flex justify-center">
          <div className="bg-white rounded-full shadow-lg px-4 py-2">
            <StatusButton 
              isOnline={isOnline} 
              onStatusChange={handleStatusChange}
              driverId="driver123"
            />
          </div>
        </div>
        
        {/* Notification de course en superposition */}
        {showNotification && (
          <div className="absolute bottom-20 left-4 right-4">
            <CourseNotification
              pickupAddress="Cocody, Rue des Jardins"
              dropoffAddress="Plateau, Avenue de la République"
              estimatedEarnings="2500 FCFA"
              onAccept={handleAcceptCourse}
              onReject={handleRejectCourse}
            />
          </div>
        )}
      </div>
      
      {/* Navigation en bas */}
      <DriverBottomNav />
    </div>
  );
};

export default DriverMapPage;
