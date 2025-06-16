// src/pages/driver/DriverProfilePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaStar, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import ProfileAvatar from '../../components/driver/ProfileAvatar';
import DriverBottomNav from '../../components/driver/DriverBottomNav';

const DriverProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Fonction de déconnexion simulée
  const handleLogout = () => {
    console.log('Déconnexion du chauffeur');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary-600 text-white p-6 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>
        
        <div className="flex items-center mb-6">
          <ProfileAvatar 
              size="lg" 
              photoURL={currentUser?.photoURL || undefined}
              name={currentUser?.displayName || 'Chauffeur'} 
          />
          <div className="ml-4">
            <h2 className="text-xl font-semibold">{currentUser?.displayName || 'Chauffeur Kôlê'}</h2>
            <div className="flex items-center">
              <FaStar className="text-yellow-400 mr-1" />
              <span>4.8/5</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <FaUser className="text-primary-500 mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Nom complet</p>
                <p>{currentUser?.displayName || 'Chauffeur Kôlê'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FaEnvelope className="text-primary-500 mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p>{currentUser?.email || 'chauffeur@kole.ci'}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <FaPhone className="text-primary-500 mr-3" />
              <div>
                <p className="text-gray-500 text-sm">Téléphone</p>
                <p>{currentUser?.phoneNumber || '+225 07 XX XX XX XX'}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Véhicule</h3>
          
          <div className="space-y-2">
            <p><span className="text-gray-500">Modèle:</span> Toyota Corolla</p>
            <p><span className="text-gray-500">Année:</span> 2019</p>
            <p><span className="text-gray-500">Plaque:</span> AB 1234 CD</p>
            <p><span className="text-gray-500">Couleur:</span> Blanc</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-3 rounded-xl flex items-center justify-center"
        >
          <FaSignOutAlt className="mr-2" />
          Déconnexion
        </button>
      </div>
      
      <DriverBottomNav />
    </div>
  );
};

export default DriverProfilePage;
