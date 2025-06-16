// src/pages/DashboardPage.tsx
import React, { useState } from 'react';
import { FaUser, FaMapMarkerAlt, FaWallet } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'activity' | 'map'>('activity');

  // Données fictives pour l'historique des courses
  const rideHistory = [
    {
      id: '1',
      date: '17 mai 2023',
      from: 'Cocody, Rue des Jardins',
      to: 'Plateau, Avenue de la République',
      price: 2500,
      status: 'completed'
    },
    {
      id: '2',
      date: '15 mai 2023',
      from: 'Marcory, Zone 4',
      to: 'Treichville, Avenue 16',
      price: 3000,
      status: 'completed'
    },
    {
      id: '3',
      date: '12 mai 2023',
      from: 'Yopougon, Niangon',
      to: 'Adjamé, Forum',
      price: 4500,
      status: 'completed'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary-600 text-white p-6 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
        
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
            <FaUser className="text-primary-600 text-xl" />
          </div>
          <div>
            <p className="font-semibold">{currentUser?.displayName || 'Utilisateur'}</p>
            <p className="text-sm opacity-80">{currentUser?.phoneNumber || '+225 07 XX XX XX XX'}</p>
          </div>
        </div>
        
        <div className="flex bg-white/20 rounded-lg p-1">
          <button 
            className={`flex-1 py-2 rounded-md ${activeTab === 'activity' ? 'bg-white text-primary-600' : 'text-white'}`}
            onClick={() => setActiveTab('activity')}
          >
            Activité
          </button>
          <button 
            className={`flex-1 py-2 rounded-md ${activeTab === 'map' ? 'bg-white text-primary-600' : 'text-white'}`}
            onClick={() => setActiveTab('map')}
          >
            Carte
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {activeTab === 'activity' ? (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
                <div className="bg-blue-100 p-3 rounded-full mb-2">
                  <FaMapMarkerAlt className="text-blue-600" />
                </div>
                <p className="text-gray-500 text-sm">Courses totales</p>
                <p className="font-bold text-lg">24</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
                <div className="bg-green-100 p-3 rounded-full mb-2">
                  <FaWallet className="text-green-600" />
                </div>
                <p className="text-gray-500 text-sm">Économisé</p>
                <p className="font-bold text-lg">15 000 FCFA</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold mb-4">Historique des courses</h2>
              
              <div className="space-y-4">
                {rideHistory.map(ride => (
                  <div key={ride.id} className="border-b pb-3">
                    <div className="flex justify-between mb-1">
                      <p className="text-gray-500 text-sm">{ride.date}</p>
                      <p className="font-medium">{ride.price.toLocaleString()} FCFA</p>
                    </div>
                    <p className="text-sm">De: {ride.from}</p>
                    <p className="text-sm">À: {ride.to}</p>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => navigate('/history')}
                className="w-full mt-3 text-primary-600 py-2 border border-primary-600 rounded-lg"
              >
                Voir tout l'historique
              </button>
            </div>
            
            <button 
              onClick={() => navigate('/client/map')}
              className="w-full bg-primary-600 text-white py-3 rounded-xl flex items-center justify-center"
            >
              <FaMapMarkerAlt className="mr-2" />
              Nouvelle course
            </button>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-4 h-[500px]">
            <MapComponent 
              latitude={5.33635} 
              longitude={-4.01266} 
              zoom={12} 
              style={{ width: '100%', height: '100%' }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
