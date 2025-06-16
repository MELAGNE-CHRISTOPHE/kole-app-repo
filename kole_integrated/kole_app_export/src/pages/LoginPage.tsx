import React from 'react'; // Removed useState as it's no longer directly used here for form fields
import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react'; // Removed unused icons: Eye, EyeOff, Mail, Lock, User
import LoginForm from '../../components/Auth/LoginForm'; // Import the refactored LoginForm

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  // Removed email, password, showPassword states as they are managed by LoginForm

  // Removed handleLogin as it's now managed by LoginForm

  const handleDriverLogin = () => {
    navigate('/driver');
  };

  return (
    <div className="min-h-screen bg-kole-cream-light african-pattern-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre selon les maquettes */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-kole-brown-dark mb-2">Kôlê</h1>
          <p className="text-kole-text-secondary font-medium">VOTRE TRAJET, NOTRE MISSION</p>
        </div>

        {/* Carte de connexion principale */}
        <div className="kole-card"> {/* This is the outer card for the whole section */}
          <div className="p-8">
            {/* The title "Connexion" is part of LoginPage.tsx structure.
                LoginForm.tsx has its own title "Se connecter à Kôlê" inside its card structure.
                If we want "Connexion" to be the main title for the form provided by LoginForm,
                we might need to pass it as a prop or adjust LoginForm.
                For now, LoginForm will render its own title "Se connecter à Kôlê".
            */}
            {/* <h2 className="text-2xl font-bold text-kole-brown-dark mb-6 text-center">Connexion</h2> */}
            
            {/* Instantiate the refactored LoginForm */}
            <LoginForm />

            {/* Elements below LoginForm remain in LoginPage */}
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
      </div>
    </div>
  );
};

export default LoginPage;

