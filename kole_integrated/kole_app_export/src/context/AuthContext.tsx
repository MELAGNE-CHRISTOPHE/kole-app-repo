import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import app from '../firebase/config';

// Types
type UserRole = 'admin' | 'client' | 'driver' | null;

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  userProfile: any | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, recaptchaToken?: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole, recaptchaToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetError: () => void;
  bypassAuthCheck: boolean;
  setBypassAuthCheck: (bypass: boolean) => void;
}

// Création du contexte avec valeurs par défaut
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  userProfile: null,
  loading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resetError: () => {},
  bypassAuthCheck: false,
  setBypassAuthCheck: () => {}
});

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => useContext(AuthContext);

// Délai maximum pour la récupération du profil (en ms)
const PROFILE_FETCH_TIMEOUT = 5000; // Réduit à 5 secondes
const AUTH_STATE_TIMEOUT = 3000; // Timeout pour l'état d'authentification

// Fournisseur du contexte
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bypassAuthCheck, setBypassAuthCheck] = useState<boolean>(false);
  const [authStateResolved, setAuthStateResolved] = useState<boolean>(false);

  // Initialisation des services Firebase
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Fonction pour journaliser les événements d'authentification
  const logAuthEvent = (event: string, details: any = {}) => {
    console.log(`[Auth] ${event}:`, details);
  };

  // Fonction pour récupérer le profil utilisateur depuis Firestore avec timeout amélioré
  const fetchUserProfile = async (uid: string): Promise<any> => {
    return new Promise<any>(async (resolve) => {
      // Définir un timeout pour éviter un blocage indéfini
      const timeoutId = setTimeout(() => {
        console.warn(`[Auth] TIMEOUT: La récupération du profil a pris trop de temps (${PROFILE_FETCH_TIMEOUT}ms)`);
        // En cas de timeout, définir un rôle par défaut et continuer
        setUserRole('client');
        setUserProfile({ role: 'client', isDefaultProfile: true });
        setLoading(false);
        resolve({ role: 'client', isDefaultProfile: true });
      }, PROFILE_FETCH_TIMEOUT);

      try {
        console.log(`[Auth] Récupération du profil utilisateur pour UID: ${uid}`);
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);
        
        // Annuler le timeout car la requête a abouti
        clearTimeout(timeoutId);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log(`[Auth] Profil récupéré avec succès pour ${uid}, rôle: ${userData.role}`);
          setUserRole(userData.role as UserRole);
          setUserProfile(userData);
          logAuthEvent('Profil utilisateur récupéré', { uid, role: userData.role });
          setLoading(false);
          resolve(userData);
        } else {
          console.warn(`[Auth] Aucun profil trouvé pour l'utilisateur: ${uid}`);
          
          // Créer un profil par défaut pour éviter le blocage
          const defaultRole: UserRole = 'client'; // Rôle par défaut
          console.log(`[Auth] Création d'un profil par défaut avec le rôle: ${defaultRole}`);
          
          try {
            await setDoc(userDocRef, {
              email: currentUser?.email || 'unknown@example.com',
              role: defaultRole,
              displayName: currentUser?.email?.split('@')[0] || 'Utilisateur',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              isActive: true,
              isDefaultProfile: true // Marquer comme profil par défaut
            });
            
            setUserRole(defaultRole);
            setUserProfile({
              role: defaultRole,
              isDefaultProfile: true
            });
            
            logAuthEvent('Profil par défaut créé', { uid, role: defaultRole });
            setLoading(false);
            resolve({ role: defaultRole, isDefaultProfile: true });
          } catch (createErr) {
            console.error('[Auth] Erreur lors de la création du profil par défaut:', createErr);
            setUserRole('client'); // Fallback en cas d'erreur
            setUserProfile({ role: 'client', isDefaultProfile: true });
            setLoading(false);
            resolve({ role: 'client', isDefaultProfile: true });
          }
        }
      } catch (err: any) {
        // Annuler le timeout car la requête a échoué
        clearTimeout(timeoutId);
        
        console.error('[Auth] Erreur lors de la récupération du profil:', err);
        
        // En cas d'erreur, définir un rôle par défaut pour éviter le blocage
        setUserRole('client');
        setUserProfile({ role: 'client', isDefaultProfile: true });
        setLoading(false);
        resolve({ role: 'client', isDefaultProfile: true });
      }
    });
  };

  // Observer les changements d'état d'authentification avec timeout amélioré
  useEffect(() => {
    console.log('[Auth] Initialisation du listener d\'authentification');
    
    // Définir un timeout global pour éviter un blocage indéfini
    const globalTimeoutId = setTimeout(() => {
      console.warn('[Auth] TIMEOUT GLOBAL: L\'authentification prend trop de temps');
      if (!authStateResolved) {
        setLoading(false);
        setAuthStateResolved(true);
        console.log('[Auth] Résolution forcée de l\'état d\'authentification (utilisateur non connecté)');
      }
    }, AUTH_STATE_TIMEOUT);
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[Auth] Changement d\'état d\'authentification:', user ? `Utilisateur connecté: ${user.uid}` : 'Utilisateur déconnecté');
      
      // Marquer l'état d'authentification comme résolu
      setAuthStateResolved(true);
      
      // Annuler le timeout global car l'événement d'authentification a été déclenché
      clearTimeout(globalTimeoutId);
      
      setCurrentUser(user);
      
      if (user) {
        try {
          await fetchUserProfile(user.uid);
        } catch (err) {
          console.error('[Auth] Erreur lors de la récupération du profil après authentification:', err);
          // En cas d'erreur, définir des valeurs par défaut
          setUserRole('client');
          setUserProfile({ role: 'client', isDefaultProfile: true });
          setLoading(false);
        }
      } else {
        setUserRole(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    // Nettoyage du listener et du timeout lors du démontage du composant
    return () => {
      console.log('[Auth] Nettoyage du listener d\'authentification');
      clearTimeout(globalTimeoutId);
      unsubscribe();
    };
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string, recaptchaToken?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`[Auth] Tentative de connexion pour: ${email}`);
      logAuthEvent('Tentative de connexion', { email, hasRecaptcha: !!recaptchaToken });
      
      // Vérification du token reCAPTCHA (simulation côté client)
      if (recaptchaToken) {
        console.log('[Auth] Token reCAPTCHA fourni:', recaptchaToken.substring(0, 20) + '...');
      } else {
        console.warn('[Auth] Aucun token reCAPTCHA fourni pour la connexion');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log(`[Auth] Connexion réussie pour: ${email} (${user.uid})`);
      logAuthEvent('Connexion réussie', { uid: user.uid, email });
      
      // Mettre à jour la dernière connexion dans Firestore
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp(),
          recaptchaVerified: !!recaptchaToken
        });
      } catch (err) {
        console.warn('[Auth] Erreur lors de la mise à jour de la dernière connexion:', err);
        // Non bloquant, on continue
      }
      
      await fetchUserProfile(user.uid);
    } catch (err: any) {
      console.error('[Auth] Erreur de connexion:', err);
      logAuthEvent('Échec de connexion', { email, error: err.message });
      
      // Messages d'erreur plus conviviaux
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email ou mot de passe incorrect.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
      } else {
        setError(`Erreur de connexion: ${err.message}`);
      }
      setLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (email: string, password: string, role: UserRole, recaptchaToken?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`[Auth] Tentative d'inscription pour: ${email} avec rôle: ${role}`);
      logAuthEvent("Tentative d'inscription", { email, role, hasRecaptcha: !!recaptchaToken });
      
      // Vérification du token reCAPTCHA (simulation côté client)
      if (recaptchaToken) {
        console.log('[Auth] Token reCAPTCHA fourni:', recaptchaToken.substring(0, 20) + '...');
      } else {
        console.warn('[Auth] Aucun token reCAPTCHA fourni pour l\'inscription');
      }
      
      // Vérification du rôle (sécurité supplémentaire)
      if (role === 'admin') {
        console.warn('[Auth] Tentative de création d\'un compte admin via l\'inscription standard');
        throw new Error('La création de comptes administrateurs n\'est pas autorisée par cette méthode.');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log(`[Auth] Inscription réussie pour: ${email} (${user.uid})`);
      
      // Créer le profil utilisateur dans Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email,
        role,
        displayName: email.split('@')[0], // Nom d'affichage par défaut
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        recaptchaVerified: !!recaptchaToken
      });
      
      logAuthEvent('Inscription réussie', { uid: user.uid, email, role });
      
      // Récupérer le profil utilisateur
      await fetchUserProfile(user.uid);
    } catch (err: any) {
      console.error('[Auth] Erreur d\'inscription:', err);
      logAuthEvent('Échec d\'inscription', { email, role, error: err.message });
      
      // Messages d'erreur plus conviviaux
      if (err.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé par un autre compte.');
      } else if (err.code === 'auth/weak-password') {
        setError('Le mot de passe est trop faible. Utilisez au moins 6 caractères.');
      } else {
        setError(`Erreur d'inscription: ${err.message}`);
      }
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      setLoading(true);
      
      console.log('[Auth] Tentative de déconnexion');
      if (currentUser) {
        logAuthEvent('Déconnexion', { uid: currentUser.uid });
      }
      
      await signOut(auth);
      
      console.log('[Auth] Déconnexion réussie');
    } catch (err: any) {
      console.error('[Auth] Erreur de déconnexion:', err);
      setError(`Erreur de déconnexion: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour réinitialiser les erreurs
  const resetError = () => {
    setError(null);
  };

  // Valeur du contexte
  const value: AuthContextType = {
    currentUser,
    userRole,
    userProfile,
    loading,
    error,
    login,
    register,
    logout,
    resetError,
    bypassAuthCheck,
    setBypassAuthCheck
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

