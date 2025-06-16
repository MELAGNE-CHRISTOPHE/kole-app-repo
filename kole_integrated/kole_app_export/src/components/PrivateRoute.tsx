// src/components/PrivateRoute.tsx
import React from 'react';
import { /*Navigate,*/ Outlet } from 'react-router-dom'; // Navigate commenté
import { useAuth } from '../context/AuthContext';

const PrivateRoute: React.FC = () => {
  const { /*currentUser,*/ loading } = useAuth(); // currentUser commenté

  // Si l'authentification est en cours de chargement, on peut afficher un spinner ou rien
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  // MODIFICATION TEMPORAIRE: Autoriser l'accès pour la démonstration
  // TODO: Rétablir la logique d'authentification après la démonstration/test
  // return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
  return <Outlet />;
};

export default PrivateRoute;

