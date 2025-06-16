// src/components/Auth/PhoneSignInForm.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { createOrUpdateUser } from '../../services/firestore';

// Constantes
const CONFIRMATION_CODE_LENGTH = 6;
const GENERIC_PHONE_ERROR = "Une erreur est survenue. Veuillez vérifier votre numéro et réessayer.";

// Interface pour les props (si nécessaire à l'avenir)
interface PhoneSignInFormProps {}

const PhoneSignInForm: React.FC<PhoneSignInFormProps> = () => {
  // États
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'enterPhone' | 'enterOtp'>('enterPhone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const navigate = useNavigate(); // Hook pour la redirection

  // Référence pour le conteneur reCAPTCHA
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Effet pour initialiser reCAPTCHA une seule fois
  useEffect(() => {
    if (recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          'size': 'invisible',
          'callback': () => {
            console.log("reCAPTCHA résolu");
          },
          'expired-callback': () => {
            console.warn("reCAPTCHA expiré");
            setError("Le contrôle de sécurité a expiré. Veuillez réessayer.");
            recaptchaVerifierRef.current?.render().then(widgetId => {
              // @ts-ignore
              window.grecaptcha.reset(widgetId);
            });
          }
        });
        recaptchaVerifierRef.current.render();
      } catch (error) {
        console.error("Erreur lors de l'initialisation de reCAPTCHA:", error);
        setError("Impossible d'initialiser le contrôle de sécurité. Veuillez rafraîchir la page.");
      }
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  // Fonction pour envoyer le code OTP
  const handleSendOtp = async () => {
    setError(null);
    if (!phoneNumber || !recaptchaVerifierRef.current) {
      setError("Veuillez entrer un numéro de téléphone valide.");
      return;
    }
    setLoading(true);

    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setStep('enterOtp');
      console.log("Code OTP envoyé avec succès.");
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du code OTP:", error);
      if (error.code === 'auth/invalid-phone-number') {
        setError("Le format du numéro de téléphone n'est pas valide.");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Trop de demandes. Veuillez réessayer plus tard.");
      } else {
        setError(GENERIC_PHONE_ERROR);
      }
      recaptchaVerifierRef.current?.render().then(widgetId => {
        // @ts-ignore
        window.grecaptcha.reset(widgetId);
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour vérifier le code OTP
  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp || otp.length !== CONFIRMATION_CODE_LENGTH || !confirmationResult) {
      setError(`Veuillez entrer le code à ${CONFIRMATION_CODE_LENGTH} chiffres reçu.`);
      return;
    }
    setLoading(true);

    try {
      const userCredential = await confirmationResult.confirm(otp);
      console.log("Connexion par téléphone réussie:", userCredential.user.uid);
      
      // Créer/Mettre à jour l'utilisateur dans Firestore
      await createOrUpdateUser(userCredential.user);
      
      // Rediriger vers le tableau de bord
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error("Erreur lors de la vérification du code:", error);
      if (error.code === 'auth/invalid-verification-code') {
        setError("Le code de vérification est invalide.");
      } else if (error.code === 'auth/code-expired') {
        setError("Le code de vérification a expiré. Veuillez renvoyer un code.");
      } else {
        setError(GENERIC_PHONE_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 md:p-8 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {step === 'enterPhone' ? 'Connexion par téléphone' : 'Vérifier le code'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
          {error}
        </div>
      )}

      {/* Étape 1: Saisie du numéro */}
      {step === 'enterPhone' && (
        <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
          <div>
            <label htmlFor="phone-number" className="block mb-1 text-sm font-medium text-gray-700">
              Numéro de téléphone (avec indicatif pays)
            </label>
            <input
              type="tel"
              id="phone-number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+225XXXXXXXX" // Exemple Côte d'Ivoire
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition duration-200"
              autoComplete="tel"
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
                Envoi...
              </span>
            ) : 'Envoyer le code'}
          </button>
        </form>
      )}

      {/* Étape 2: Saisie du code OTP */}
      {step === 'enterOtp' && (
        <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-4">
          <div>
            <label htmlFor="otp-code" className="block mb-1 text-sm font-medium text-gray-700">
              Code de vérification (reçu par SMS)
            </label>
            <input
              type="number"
              id="otp-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder={`Code à ${CONFIRMATION_CODE_LENGTH} chiffres`}
              required
              maxLength={CONFIRMATION_CODE_LENGTH}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent transition duration-200 appearance-none m-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoComplete="one-time-code"
            />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length !== CONFIRMATION_CODE_LENGTH}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-red-800 to-yellow-700 hover:opacity-90 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-600 disabled:opacity-50 transition duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Vérification...
              </span>
            ) : 'Vérifier et se connecter'}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => { setStep('enterPhone'); setError(null); setOtp(''); /* Réinitialiser reCAPTCHA si nécessaire */ }}
              disabled={loading}
              className="text-xs text-yellow-700 hover:text-red-800 transition-colors"
            >
              Changer de numéro ou renvoyer le code
            </button>
          </div>
        </form>
      )}

      {/* Conteneur pour reCAPTCHA (doit être dans le DOM) */}
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>

      {/* Lien vers d'autres méthodes */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Ou connectez-vous avec{' '}
        <Link to="/login" className="font-medium text-yellow-700 hover:text-red-800 transition-colors">
          votre email
        </Link>
      </p>
    </div>
  );
};

export default PhoneSignInForm;
