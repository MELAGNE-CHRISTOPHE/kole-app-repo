// src/components/Header.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-red-800 to-yellow-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">Kôlê</span>
            <span className="text-sm bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full">MVP</span>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-yellow-300 transition-colors">Accueil</Link>
            {currentUser ? (
              <>
                <Link to="/dashboard" className="hover:text-yellow-300 transition-colors">Tableau de bord</Link>
                <Link to="/profile" className="hover:text-yellow-300 transition-colors">Profil</Link>
                <button 
                  onClick={handleLogout}
                  className="hover:text-yellow-300 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-yellow-300 transition-colors">Connexion</Link>
                <Link to="/signup" className="hover:text-yellow-300 transition-colors">Inscription</Link>
              </>
            )}
          </nav>
          
          {/* Menu mobile (à implémenter avec un toggle) */}
          <div className="md:hidden">
            <button className="text-white focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
