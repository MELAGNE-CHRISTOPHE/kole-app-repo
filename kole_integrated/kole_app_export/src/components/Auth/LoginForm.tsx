// src/components/Auth/LoginForm.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginForm: React.FC = () => {
  // États pour les champs du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook pour la redirection

  // Fonction de validation de l'email avec regex
  const validateEmail = (email: string): boolean => {
    // Regex standard pour la validation d'email
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };

  // Fonction de gestion de la soumission du formulaire
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Validation du format de l'email avant de contacter Firebase
    if (!validateEmail(email)) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    setLoading(true);

    try {
      // Connexion de l'utilisateur avec Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Connexion réussie pour l'utilisateur:", userCredential.user.uid);
      
      // Rediriger l'utilisateur vers le tableau de bord après la connexion
      navigate('/dashboard'); 
      
    } catch (firebaseError: any) {
      console.error("Erreur Firebase lors de la connexion:", firebaseError);
      
      // Gestion des erreurs Firebase
      switch(firebaseError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': // Code d'erreur plus récent pour email/mdp incorrect
          setError("Email ou mot de passe incorrect.");
          break;
        case 'auth/invalid-email': // Ce cas peut toujours être utile si Firebase renvoie cette erreur spécifique
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
    <div className="max-w-md mx-auto p-6 md:p-8 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Se connecter à Kôlê</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
          {error}
        </div>
      )}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block mb-1 text-sm font-medium text-gray-700">
            Adresse Email
          </label>
          <input
            type="email" // Garder type="email" pour la validation native et le clavier mobile
            id="login-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition duration-200"
            placeholder="Votre email"
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>
        
        <div>
          <label htmlFor="login-password" className="block mb-1 text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition duration-200"
            placeholder="Votre mot de passe"
            required
            disabled={loading}
            autoComplete="current-password"
          />
          <div className="text-right mt-1">
            <Link to="/forgot-password" className="text-xs text-yellow-700 hover:text-red-800 transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-red-800 to-yellow-700 hover:opacity-90 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600 disabled:opacity-50 transition duration-200"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connexion...
            </span>
          ) : 'Se connecter'}
        </button>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Pas encore de compte?{' '}
          <Link to="/signup" className="font-medium text-yellow-700 hover:text-red-800 transition-colors">
            Créer un compte
          </Link>
        </p>
        
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link to="/phone-signin" className="font-medium text-yellow-700 hover:text-red-800 transition-colors">
            se connecter avec votre téléphone
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;

