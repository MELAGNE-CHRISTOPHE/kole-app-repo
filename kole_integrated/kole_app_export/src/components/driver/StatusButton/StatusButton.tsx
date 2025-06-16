// src/components/driver/StatusButton/StatusButton.tsx
import React, { useState } from 'react';
import { updateDriverStatusAPI } from '../../../services/driverService';
import './StatusButton.css';

export interface StatusButtonProps {
  driverId: string;
  isOnline?: boolean;
  onStatusChange: (status: boolean) => void;
}

const StatusButton: React.FC<StatusButtonProps> = ({ driverId, isOnline = false, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  
  const handleToggle = async () => {
    setLoading(true);
    
    try {
      // Appel à l'API pour mettre à jour le statut
      const newStatus = !isOnline;
      const result = await updateDriverStatusAPI(driverId, newStatus ? 'online' : 'offline');
      
      if (result.success) {
        onStatusChange(newStatus);
      } else {
        console.error('Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`status-button ${isOnline ? 'online' : 'offline'} ${loading ? 'loading' : ''}`}
    >
      <span className="status-indicator"></span>
      <span className="status-text">
        {loading ? 'Mise à jour...' : isOnline ? 'En ligne' : 'Hors ligne'}
      </span>
    </button>
  );
};

export default StatusButton;
