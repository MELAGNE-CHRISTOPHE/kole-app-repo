// src/components/Auth/SignUpForm.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { auth } from '../../firebase/config';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { createOrUpdateUser } from '../../services/firestore'; // Import Firestore service

const SignUpForm: React.FC = () => {
  // États pour les champs du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fonction de gestion de la soumission du formulaire
  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation des champs
    if (password !== confirmPassword) {
      setError("Les mots de passe ne sont pas identiques.");
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      // Création de l'utilisateur avec Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Inscription réussie pour l'utilisateur:", userCredential.user.uid);
      
      // Créer/Mettre à jour l'utilisateur dans Firestore
      await createOrUpdateUser(userCredential.user);
      
      // Message de succès
      setSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      
      // Réinitialisation des champs
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      
      // TODO: Rediriger l'utilisateur après un court délai ou sur clic
      
    } catch (firebaseError: any) {
      console.error("Erreur Firebase lors de l'inscription:", firebaseError);
      
      // Gestion des erreurs Firebase
      switch(firebaseError.code) {
        case 'auth/email-already-in-use':
          setError("Cet email est déjà utilisé par un autre compte.");
          break;
        case 'auth/invalid-email':
          setError("Le format de l'email n'est pas valide.");
          break;
        case 'auth/weak-password':
          setError("Le mot de passe est trop faible.");
          break;
        default:
          setError("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 md:p-8 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Créer un compte Kôlê</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md border border-green-300">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
            Adresse Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition duration-200"
            placeholder="Votre email"
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition duration-200"
            placeholder="Minimum 6 caractères"
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-700">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition duration-200"
            placeholder="Retapez votre mot de passe"
            required
            disabled={loading}
          />
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
              Création...
            </span>
          ) : 'Créer mon compte'}
        </button>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Vous avez déjà un compte?{' '}
          <Link to="/login" className="font-medium text-yellow-700 hover:text-red-800 transition-colors">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignUpForm;
