import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, LogIn, AlertCircle, Mail, Shield } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { collection, getDocs, query, where, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
// import KoleLogo from "/assets/kole_logo_new.png";
import useRecaptcha from "../hooks/useRecaptcha";

const AdminLoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);
  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const navigate = useNavigate();
  const { executeRecaptcha, loading: recaptchaLoading, error: recaptchaErrorObj } = useRecaptcha();

  // Vérifier s\'il existe déjà un administrateur
  useEffect(() => {
    const checkForAdmins = async () => {
      try {
        setIsLoading(true);
        const adminsQuery = query(collection(db, "users"), where("role", "==", "admin"));
        const adminsSnapshot = await getDocs(adminsQuery);
        
        if (adminsSnapshot.empty) {
          console.log("Aucun administrateur trouvé. Création du premier administrateur activée.");
          setIsFirstAdmin(true);
        } else {
          console.log(`${adminsSnapshot.size} administrateur(s) trouvé(s).`);
          setIsFirstAdmin(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des administrateurs:", error);
        setError("Impossible de vérifier les administrateurs. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

    checkForAdmins();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setRecaptchaError(null);
    
    try {
      // Exécuter reCAPTCHA avant la tentative de connexion
      const token = await executeRecaptcha("ADMIN_LOGIN");
      console.log("reCAPTCHA token:", token);
      
      if (isFirstAdmin) {
        // Création du premier compte administrateur
        await createFirstAdmin();
      } else {
        // Connexion administrateur standard
        await loginAdmin();
      }
    } catch (error) {
      console.error("Erreur reCAPTCHA:", error);
      setRecaptchaError("Vérification de sécurité échouée. Veuillez réessayer.");
    }
  };

  const createFirstAdmin = async () => {
    try {
      setIsCreatingAdmin(true);
      
      // Vérifier à nouveau qu\'il n\'existe pas d\'administrateur (double vérification)
      const adminsQuery = query(collection(db, "users"), where("role", "==", "admin"));
      const adminsSnapshot = await getDocs(adminsQuery);
      
      if (!adminsSnapshot.empty) {
        setError("Un administrateur existe déjà. Veuillez vous connecter.");
        setIsFirstAdmin(false);
        setIsCreatingAdmin(false);
        return;
      }
      
      // Créer le compte utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Créer le document utilisateur dans Firestore avec le rôle admin
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        displayName: "Administrateur",
        role: "admin",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      });
      
      console.log("Premier administrateur créé avec succès:", user.uid);
      
      // Rediriger vers le tableau de bord admin
      navigate("/admin");
    } catch (error: any) {
      console.error("Erreur lors de la création du premier administrateur:", error);
      setError(error.message || "Échec de la création du compte administrateur.");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const loginAdmin = async () => {
    try {
      // Authentification avec Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Vérifier si l\'utilisateur est bien un administrateur
      const userDoc = await getDocs(query(collection(db, "users"), where("email", "==", email), where("role", "==", "admin")));
      
      if (userDoc.empty) {
        setError("Vous n\'avez pas les droits d\'administrateur.");
        await auth.signOut(); // Déconnecter l\'utilisateur
        return;
      }
      
      console.log("Connexion administrateur réussie:", user.uid);
      
      // Rediriger vers le tableau de bord admin
      navigate("/admin");
    } catch (error: any) {
      console.error("Erreur d\'authentification administrateur:", error);
      setError(error.message || "Échec de la connexion. Vérifiez vos identifiants.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification du système d\'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          {/* <img src={KoleLogo} alt="Kôlê Logo" className="h-12 w-auto mr-3" /> */}
          <div className="flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
            <Shield className="h-4 w-4 mr-1" />
            <span className="font-semibold text-sm">Admin</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {isFirstAdmin ? "Créer le compte administrateur" : "Connexion administrateur"}
        </h1>
        
        <p className="text-center text-gray-600 mb-6">
          {isFirstAdmin 
            ? "Vous êtes le premier à configurer l\'application. Créez votre compte administrateur."
            : "Accédez au panneau d\'administration de Kôlê"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {recaptchaError && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg flex items-center text-yellow-700">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{recaptchaError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email administrateur</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="email"
                id="email"
                placeholder="admin@kole.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                placeholder="Mot de passe sécurisé"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                minLength={8}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 hover:text-purple-500"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {isFirstAdmin && (
              <p className="mt-1 text-xs text-gray-500">
                Le mot de passe doit contenir au moins 8 caractères.
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={recaptchaLoading || isCreatingAdmin}
            className={`w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-300 font-semibold flex items-center justify-center text-base ${(recaptchaLoading || isCreatingAdmin) ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {recaptchaLoading || isCreatingAdmin ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                {isFirstAdmin ? 'Création en cours...' : 'Connexion en cours...'}
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-5 w-5" /> 
                {isFirstAdmin ? 'Créer le compte administrateur' : 'Se connecter'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-purple-600 hover:underline">
            Retour à l\'accueil
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;


