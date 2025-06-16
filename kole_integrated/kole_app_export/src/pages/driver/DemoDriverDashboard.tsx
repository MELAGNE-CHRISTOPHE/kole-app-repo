// src/pages/driver/DemoDriverDashboard.tsx
import React from 'react';
import { FaHome, FaWallet, FaUser, FaHistory } from 'react-icons/fa';
import DriverBottomNav from '../../components/driver/DriverBottomNav';

const DemoDriverDashboard: React.FC = () => {
  // Données fictives pour le tableau de bord
  const driverStats = {
    balance: 45000,
    todayEarnings: 12500,
    completedRides: 5,
    rating: 4.8,
    onlineHours: 4.5
  };
  
  // Données fictives pour les courses récentes
  const recentRides = [
    {
      id: '1',
      date: '17 mai 2023',
      pickup: 'Cocody, Rue des Jardins',
      dropoff: 'Plateau, Avenue de la République',
      amount: 2500
    },
    {
      id: '2',
      date: '16 mai 2023',
      pickup: 'Marcory, Zone 4',
      dropoff: 'Treichville, Avenue 16',
      amount: 3000
    },
    {
      id: '3',
      date: '16 mai 2023',
      pickup: 'Yopougon, Niangon',
      dropoff: 'Adjamé, Forum',
      amount: 4500
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary-600 text-white p-6 rounded-b-3xl shadow-md">
        <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
        
        <div className="bg-white text-gray-800 rounded-xl p-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Solde disponible</p>
              <p className="text-2xl font-bold">{driverStats.balance.toLocaleString()} FCFA</p>
            </div>
            <button className="bg-primary-500 text-white px-4 py-2 rounded-lg">
              Retirer
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Statistiques du jour */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-500 text-sm">Revenus aujourd'hui</p>
            <p className="text-xl font-bold">{driverStats.todayEarnings.toLocaleString()} FCFA</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-500 text-sm">Courses complétées</p>
            <p className="text-xl font-bold">{driverStats.completedRides}</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-500 text-sm">Note moyenne</p>
            <p className="text-xl font-bold">{driverStats.rating}/5</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-md">
            <p className="text-gray-500 text-sm">Heures en ligne</p>
            <p className="text-xl font-bold">{driverStats.onlineHours}h</p>
          </div>
        </div>
        
        {/* Courses récentes */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Courses récentes</h2>
          
          <div className="space-y-4">
            {recentRides.map(ride => (
              <div key={ride.id} className="border-b pb-3">
                <div className="flex justify-between mb-1">
                  <p className="text-gray-500 text-sm">{ride.date}</p>
                  <p className="font-medium text-green-600">{ride.amount.toLocaleString()} FCFA</p>
                </div>
                <p className="text-sm">De: {ride.pickup}</p>
                <p className="text-sm">À: {ride.dropoff}</p>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-3 text-primary-600 py-2 border border-primary-600 rounded-lg">
            Voir tout l'historique
          </button>
        </div>
        
        {/* Accès rapides */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <FaWallet className="text-blue-600" />
            </div>
            <p>Mes revenus</p>
          </button>
          
          <button className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
            <div className="bg-green-100 p-3 rounded-full mb-2">
              <FaHistory className="text-green-600" />
            </div>
            <p>Historique</p>
          </button>
          
          <button className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
            <div className="bg-purple-100 p-3 rounded-full mb-2">
              <FaHome className="text-purple-600" />
            </div>
            <p>Zones actives</p>
          </button>
          
          <button className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
            <div className="bg-orange-100 p-3 rounded-full mb-2">
              <FaUser className="text-orange-600" />
            </div>
            <p>Mon profil</p>
          </button>
        </div>
      </div>
      
      <DriverBottomNav />
    </div>
  );
};

export default DemoDriverDashboard;
