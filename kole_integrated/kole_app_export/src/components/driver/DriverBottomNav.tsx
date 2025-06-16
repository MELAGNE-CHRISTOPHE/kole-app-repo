// src/components/driver/DriverBottomNav.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaHistory, FaWallet, FaUser } from 'react-icons/fa';

const DriverBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Définir les routes pour la navigation
  const routes = [
    { path: '/chauffeur/map', icon: <FaHome />, label: 'Accueil' },
    { path: '/driver/history', icon: <FaHistory />, label: 'Historique' },
    { path: '/driver/earnings', icon: <FaWallet />, label: 'Revenus' },
    { path: '/driver/profile', icon: <FaUser />, label: 'Profil' }
  ];
  
  // Vérifier si un chemin est actif
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="bg-white shadow-lg border-t border-gray-200 fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around">
      {routes.map((route, index) => (
        <button
          key={index}
          onClick={() => navigate(route.path)}
          className={`flex flex-col items-center justify-center w-1/4 h-full ${
            isActive(route.path) ? 'text-primary-600' : 'text-gray-500'
          }`}
        >
          <div className="text-xl">{route.icon}</div>
          <span className="text-xs mt-1">{route.label}</span>
        </button>
      ))}
    </div>
  );
};

export default DriverBottomNav;
