import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Car
} from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de connexion simplifiée pour la démo
    navigate('/client');
  };

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

        {/* Carte de connexion selon les maquettes */}
        <div className="kole-card">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-kole-brown-dark mb-6 text-center">Connexion</h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Champ Email */}
              <div>
                <label className="block text-sm font-medium text-kole-text-dark mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 kole-input"
                    required
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-kole-text-dark mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 kole-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-kole-text-secondary hover:text-kole-text-dark"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Lien mot de passe oublié */}
              <div className="text-right">
                <a 
                  href="/forgot-password" 
                  className="text-sm text-kole-blue-primary hover:underline"
                >
                  Mot de passe oublié ?
                </a>
              </div>

              {/* Bouton de connexion principal */}
              <button 
                type="submit"
                className="w-full kole-btn-primary py-3 text-lg font-semibold"
              >
                <User className="h-5 w-5 mr-2" />
                Se connecter
              </button>

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
            </form>

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

