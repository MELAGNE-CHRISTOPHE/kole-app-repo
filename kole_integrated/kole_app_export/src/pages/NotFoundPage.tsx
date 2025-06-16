import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-blue-500 mb-6">
        <AlertCircle size={64} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page non trouvée</h1>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/" 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
