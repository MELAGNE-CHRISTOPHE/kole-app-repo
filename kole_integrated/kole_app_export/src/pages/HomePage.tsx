// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-800 to-yellow-700">
            Kôlê - Transport à la demande
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Une solution moderne et culturellement adaptée pour le transport en moto en Afrique
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {currentUser ? (
              <Link 
                to="/dashboard" 
                className="px-8 py-3 bg-gradient-to-r from-red-800 to-yellow-700 text-white font-medium rounded-md hover:opacity-90 transition-opacity"
              >
                Accéder à mon espace
              </Link>
            ) : (
              <>
                <Link 
                  to="/signup" 
                  className="px-8 py-3 bg-gradient-to-r from-red-800 to-yellow-700 text-white font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                  Créer un compte
                </Link>
                <Link 
                  to="/login" 
                  className="px-8 py-3 border-2 border-yellow-700 text-yellow-800 font-medium rounded-md hover:bg-yellow-50 transition-colors"
                >
                  Se connecter
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50 rounded-lg shadow-inner my-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir Kôlê ?</h2>
          
          <div className="grid md:grid-cols-3 gap-8 px-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Rapide et Efficace</h3>
              <p className="text-gray-600">Réservez une moto en quelques clics et suivez votre trajet en temps réel.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Sécurisé</h3>
              <p className="text-gray-600">Conducteurs vérifiés et trajets suivis pour assurer votre sécurité à chaque instant.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Paiement Facile</h3>
              <p className="text-gray-600">Payez en espèces ou utilisez les solutions de paiement mobile populaires.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 text-center mb-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Prêt à essayer Kôlê ?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Rejoignez notre communauté grandissante et transformez vos déplacements quotidiens.
          </p>
          {!currentUser && (
            <Link 
              to="/signup" 
              className="px-8 py-3 bg-gradient-to-r from-red-800 to-yellow-700 text-white font-medium rounded-md hover:opacity-90 transition-opacity"
            >
              Commencer maintenant
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
