import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [] 
}) => {
  const { currentUser, userRole, loading, error, bypassAuthCheck } = useAuth();
  const location = useLocation();

  // Option de contournement pour le développement/débogage - PRIORITÉ ABSOLUE
  if (bypassAuthCheck) {
    console.log('[ProtectedRoute] Contournement de la vérification d\'authentification activé - Accès direct accordé');
    return <>{children}</>;
  }

  // Afficher un écran de chargement pendant la vérification de l'authentification
  // avec un timeout plus court pour éviter les blocages
  if (loading) {
    return (
      <LoadingScreen 
        message="Vérification de votre accès..." 
        timeout={8000} // Réduit à 8 secondes
        onTimeout={() => {
          console.warn('[ProtectedRoute] Timeout de vérification d\'accès');
          // Rediriger vers la page de connexion en cas de timeout
          window.location.href = '/login';
        }}
      />
    );
  }

  // Afficher un message d'erreur si une erreur s'est produite
  if (error) {
    return (
      <div className="auth-error-container">
        <h2>Erreur d'authentification</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Réessayer
        </button>
        <button onClick={() => window.location.href = '/login'}>
          Retour à la connexion
        </button>
        
        <style jsx>{`
          .auth-error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            padding: 2rem;
            text-align: center;
          }
          
          h2 {
            color: #e74c3c;
            margin-bottom: 1rem;
          }
          
          p {
            margin-bottom: 2rem;
            max-width: 500px;
          }
          
          button {
            background-color: #3498db;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            margin: 0.5rem;
            transition: background-color 0.2s;
          }
          
          button:hover {
            background-color: #2980b9;
          }
        `}</style>
      </div>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  if (!currentUser) {
    console.log('[ProtectedRoute] Utilisateur non connecté, redirection vers /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si aucun rôle n'est requis, autoriser l'accès
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Vérifier si l'utilisateur a un rôle défini
  if (!userRole) {
    console.warn('[ProtectedRoute] Utilisateur connecté mais sans rôle défini');
    
    // Attribuer un rôle par défaut pour éviter le blocage
    const defaultRole = 'client';
    console.log(`[ProtectedRoute] Attribution du rôle par défaut: ${defaultRole}`);
    
    // Vérifier si ce rôle par défaut est autorisé
    if (allowedRoles.includes(defaultRole)) {
      console.log(`[ProtectedRoute] Le rôle par défaut ${defaultRole} est autorisé, accès accordé`);
      return <>{children}</>;
    } else {
      console.log(`[ProtectedRoute] Le rôle par défaut ${defaultRole} n'est pas autorisé, redirection vers /unauthorized`);
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
  }

  // Vérifier si l'utilisateur a un rôle autorisé
  if (!allowedRoles.includes(userRole)) {
    console.log(`[ProtectedRoute] Rôle non autorisé: ${userRole}, redirection vers /unauthorized`);
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Afficher le contenu protégé si toutes les conditions sont remplies
  console.log(`[ProtectedRoute] Accès autorisé pour le rôle: ${userRole}`);
  return <>{children}</>;
};

export default ProtectedRoute;

