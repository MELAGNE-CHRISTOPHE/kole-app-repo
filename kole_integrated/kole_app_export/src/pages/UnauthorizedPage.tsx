import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Shield } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        {/* <img src={KoleLogo} alt="Kôlê Logo" className="h-12 w-auto mx-auto mb-4" /> */}
        
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Accès non autorisé</h1>
        
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </p>
        
        <div className="space-y-3">
          <Link 
            to="/login" 
            className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
          >
            Se connecter
          </Link>
          
          <Link 
            to="/admin-login" 
            className="block w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-300 font-semibold flex items-center justify-center"
          >
            <Shield className="h-5 w-5 mr-2" />
            Connexion administrateur
          </Link>
          
          <Link 
            to="/" 
            className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition duration-300 font-semibold flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;


