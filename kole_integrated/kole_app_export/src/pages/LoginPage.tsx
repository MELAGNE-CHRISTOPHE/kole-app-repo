import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import LoginForm from '../../components/Auth/LoginForm';
import AuthLayout from '../../components/Layout/AuthLayout'; // Import AuthLayout

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleDriverLogin = () => {
    navigate('/driver');
  };

  return (
    <AuthLayout>
      {/* The children of AuthLayout is the main content card */}
      <div className="kole-card"> {/* This is the outer card for the whole section */}
        <div className="p-8">
          {/* LoginForm will render its own title "Se connecter à Kôlê" inside its card structure. */}
          <LoginForm />

          {/* Elements below LoginForm remain in LoginPage's card */}
          {/* Séparateur */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-kole-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-kole-text-secondary">Ou se connecter avec</span>
            </div>
          </div>

          {/* Connexion chauffeur */}
          <button
            type="button"
            onClick={handleDriverLogin}
            className="w-full kole-btn-secondary py-3 text-lg font-semibold"
          >
            <Car className="h-5 w-5 mr-2" />
            Connexion Chauffeur
          </button>

          {/* Options de connexion sociale */}
          <div className="flex justify-center space-x-4 mt-6">
            <button className="w-12 h-12 rounded-full bg-white border border-kole-border flex items-center justify-center hover:bg-kole-cream-light transition-colors">
              <span className="text-lg font-bold text-blue-600">G</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-white border border-kole-border flex items-center justify-center hover:bg-kole-cream-light transition-colors">
              <span className="text-lg font-bold text-blue-800">f</span>
            </button>
          </div>

          {/* Lien vers inscription */}
          <div className="text-center mt-8">
            <span className="text-kole-text-secondary">Pas encore de compte ? </span>
            <a
              href="/signup"
              className="text-kole-blue-primary hover:underline font-semibold"
            >
              S'inscrire
            </a>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

