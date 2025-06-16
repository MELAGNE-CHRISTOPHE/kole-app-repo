import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';

// Configuration Firebase avec valeurs directes pour éviter les problèmes de variables d'environnement en production
const firebaseConfig = {
  apiKey: "AIzaSyAg91x0KxTz0GcIKGdeqfgbGB96GCYLwPY",
  authDomain: "kole-ci.firebaseapp.com",
  databaseURL: "https://kole-ci-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kole-ci",
  storageBucket: "kole-ci.firebasestorage.app",
  messagingSenderId: "643775840877",
  appId: "1:643775840877:web:a6aa41d03bdff9c775f564",
  measurementId: "G-3HGLRN352V"
};

console.log("Firebase: Initialisation avec configuration:", JSON.stringify(firebaseConfig));

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase: App initialisée");

// Exportation des services Firebase
export const auth = getAuth(app);
console.log("Firebase: Auth initialisé");
export const db = getFirestore(app);
console.log("Firebase: Firestore initialisé");
export const storage = getStorage(app);
console.log("Firebase: Storage initialisé");

// Initialisation conditionnelle pour éviter les erreurs côté serveur
let messaging = null;
let analytics = null;
let functions = null;

// Vérifier si nous sommes dans un environnement navigateur
if (typeof window !== 'undefined') {
  try {
    console.log("Firebase: Tentative d'initialisation des services supplémentaires");
    analytics = getAnalytics(app);
    console.log("Firebase: Analytics initialisé");
    
    // Vérifier si le navigateur prend en charge les notifications
    if ('Notification' in window) {
      messaging = getMessaging(app);
      console.log("Firebase: Messaging initialisé");
    } else {
      console.log("Firebase: Notifications non supportées par ce navigateur");
    }
    
    functions = getFunctions(app);
    console.log("Firebase: Functions initialisé");
  } catch (error) {
    console.error('Firebase: Erreur lors de l\'initialisation des services Firebase:', error);
  }
}

export { messaging, analytics, functions };
export default app;
