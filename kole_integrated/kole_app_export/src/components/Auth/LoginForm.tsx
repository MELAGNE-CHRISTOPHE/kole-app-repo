// src/components/Auth/LoginForm.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Input } from "@/components/ui/input"; // Added import
import { Button } from "@/components/ui/button"; // Added import

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!validateEmail(email)) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Connexion réussie pour l'utilisateur:", userCredential.user.uid);
      navigate('/client'); // Ou '/dashboard' comme c'était avant, selon la destination souhaitée
      
    } catch (firebaseError: any) {
      console.error("Erreur Firebase lors de la connexion:", firebaseError);
      switch(firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError("Email ou mot de passe incorrect.");
          break;
        case 'auth/invalid-email':
          setError("Le format de l'email n'est pas valide.");
          break;
        case 'auth/too-many-requests':
          setError("Trop de tentatives de connexion. Veuillez réessayer plus tard.");
          break;
        default:
          setError("Une erreur est survenue lors de la connexion. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kole-card"> {/* Utilisation du style de carte de LoginPage */}
      <div className="p-8"> {/* Padding interne comme dans LoginPage */}
        <h2 className="text-2xl font-bold text-kole-brown-dark mb-6 text-center">
          Se connecter à Kôlê {/* Titre de LoginForm */}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6"> {/* Espacement comme dans LoginPage */}
          {/* Champ Email */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-kole-text-dark mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
              <Input
                type="email"
                id="login-email"
                placeholder="Votre adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 kole-input" // Style de LoginPage
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-kole-text-dark mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
              <Input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 kole-input" // Style de LoginPage
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost" // Use ghost variant for minimal styling
                size="icon" // Use icon size
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-kole-text-secondary hover:text-kole-text-dark h-auto px-0 py-0" // Adjusted classes, h-auto and px/py to allow icon to define size
                aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Lien mot de passe oublié */}
          <div className="text-right">
            <Link // Utilisation de Link pour la navigation interne React
              to="/forgot-password"
              className="text-sm text-kole-blue-primary hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Bouton de connexion principal */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full kole-btn-primary py-3 text-lg font-semibold" // Style de LoginPage
          >
            {loading ? (
              <span className="flex items-center justify-center">
                {/* Using Lucide Loader2 icon as it's common in Kôlê, or keep SVG if preferred */}
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion...
              </span>
            ) : (
              <>
                <User className="h-5 w-5 mr-2" /> {/* Icone comme dans LoginPage */}
                Se connecter
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

