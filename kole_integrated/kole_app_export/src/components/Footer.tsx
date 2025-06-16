// src/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2">Kôlê</h3>
            <p className="text-gray-400 text-sm">Transport à la demande pour motos</p>
          </div>
          
          <div className="flex flex-col md:flex-row md:space-x-8 text-center md:text-left">
            <div className="mb-4 md:mb-0">
              <h4 className="text-yellow-500 font-medium mb-2">Liens rapides</h4>
              <ul className="space-y-1 text-sm">
                <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Accueil</a></li>
                <li><a href="/login" className="text-gray-400 hover:text-white transition-colors">Connexion</a></li>
                <li><a href="/signup" className="text-gray-400 hover:text-white transition-colors">Inscription</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-yellow-500 font-medium mb-2">Contact</h4>
              <ul className="space-y-1 text-sm">
                <li className="text-gray-400">info@kole-ci.com</li>
                <li className="text-gray-400">+225 XX XX XX XX</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Kôlê. Tous droits réservés.</p>
          <p className="mt-1">Version MVP 1.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
