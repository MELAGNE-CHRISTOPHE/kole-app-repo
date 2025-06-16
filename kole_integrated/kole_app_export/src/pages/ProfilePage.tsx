// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserData, UserData } from '../services/firestore';

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const data = await getUserData(currentUser.uid);
        setUserData(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des données utilisateur:", err);
        setError("Impossible de charger les données du profil. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Profil Utilisateur</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-red-800 to-yellow-700 flex items-center justify-center text-white text-3xl font-bold">
            {currentUser?.displayName 
              ? currentUser.displayName.charAt(0).toUpperCase()
              : currentUser?.email 
                ? currentUser.email.charAt(0).toUpperCase()
                : 'K'}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Informations de base</h2>
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <p className="text-gray-600"><span className="font-medium">Email:</span> {currentUser?.email || 'Non renseigné'}</p>
              <p className="text-gray-600"><span className="font-medium">Téléphone:</span> {currentUser?.phoneNumber || 'Non renseigné'}</p>
              <p className="text-gray-600"><span className="font-medium">Nom d'utilisateur:</span> {currentUser?.displayName || 'Non renseigné'}</p>
            </div>
          </div>
          
          {userData && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Détails du compte</h2>
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-gray-600"><span className="font-medium">Compte créé le:</span> {userData.createdAt.toLocaleDateString()}</p>
                <p className="text-gray-600"><span className="font-medium">Dernière mise à jour:</span> {userData.updatedAt.toLocaleDateString()}</p>
              </div>
            </div>
          )}
          
          <div className="pt-4">
            <button 
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => alert("Fonctionnalité à venir dans la prochaine version")}
            >
              Modifier le profil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
