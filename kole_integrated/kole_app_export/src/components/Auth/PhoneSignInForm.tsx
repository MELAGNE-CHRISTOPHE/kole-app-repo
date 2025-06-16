// src/components/Auth/PhoneSignInForm.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { createOrUpdateUser } from '../../services/firestore';
import { Phone, KeyRound, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input"; // Added Input import
import { Button } from "@/components/ui/button"; // Added Button import

// Constantes
const CONFIRMATION_CODE_LENGTH = 6;
const GENERIC_PHONE_ERROR = "Une erreur est survenue. Veuillez vérifier votre numéro et réessayer.";

interface PhoneSignInFormProps {}

const PhoneSignInForm: React.FC<PhoneSignInFormProps> = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'enterPhone' | 'enterOtp'>('enterPhone');
  const [confirmationResultState, setConfirmationResultState] = useState<ConfirmationResult | null>(null); // Renamed to avoid conflict
  const navigate = useNavigate();

  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (recaptchaContainerRef.current && !recaptchaVerifierRef.current && auth) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          'size': 'invisible',
          'callback': () => console.log("reCAPTCHA résolu"),
          'expired-callback': () => {
            console.warn("reCAPTCHA expiré");
            setError("Le contrôle de sécurité a expiré. Veuillez réessayer.");
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.render().then(widgetId => {
                    // @ts-ignore
                    window.grecaptcha?.reset(widgetId);
                }).catch(err => console.error("Error resetting reCAPTCHA", err));
            }
          }
        });
        recaptchaVerifierRef.current.render().catch(err => {
            console.error("Error rendering reCAPTCHA initially:", err);
            setError("Impossible d'initialiser le contrôle de sécurité reCAPTCHA. Veuillez rafraîchir.");
        });
      } catch (error) {
        console.error("Erreur lors de l'initialisation de reCAPTCHA:", error);
        setError("Impossible d'initialiser le contrôle de sécurité. Veuillez rafraîchir la page.");
      }
    }
    // Cleanup on unmount is important for RecaptchaVerifier
    return () => {
        if (recaptchaVerifierRef.current) {
            // No direct 'clear' or 'destroy'. Resetting the container or ensuring it's empty.
            // The main thing is to avoid creating multiple verifiers for the same container.
            // Actual cleanup might involve `window.grecaptcha.reset(widgetId)` if the widgetId was stored.
            // For invisible reCAPTCHA, simply ensuring it's not re-initialized on fast re-renders is key.
            // The auth object itself handles instance lifecycle tied to it.
        }
    };
  }, [auth]); // Added auth to dependency array

  const handleSendOtp = async () => {
    setError(null);
    if (!phoneNumber.match(/^\+[1-9]\d{1,14}$/)) { // Basic E.164 format check
      setError("Veuillez entrer un numéro de téléphone valide au format international (ex: +2250000000000).");
      return;
    }
    if (!recaptchaVerifierRef.current) {
      setError("Le vérificateur reCAPTCHA n'est pas prêt. Veuillez patienter ou rafraîchir.");
      return;
    }
    setLoading(true);

    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
      setConfirmationResultState(result);
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
      // Attempt to reset reCAPTCHA on error
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.render().then(widgetId => {
            // @ts-ignore
            window.grecaptcha?.reset(widgetId);
        }).catch(err => console.error("Error resetting reCAPTCHA after send error", err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp || otp.length !== CONFIRMATION_CODE_LENGTH || !confirmationResultState) {
      setError(`Veuillez entrer le code à ${CONFIRMATION_CODE_LENGTH} chiffres reçu.`);
      return;
    }
    setLoading(true);

    try {
      const userCredential = await confirmationResultState.confirm(otp);
      console.log("Connexion par téléphone réussie:", userCredential.user.uid);
      
      await createOrUpdateUser(userCredential.user, { phoneNumber: userCredential.user.phoneNumber, accountType: 'client' }); // Assuming default client for phone signin
      
      navigate('/client'); // Navigate to client dashboard or appropriate page
      
    } catch (error: any) {
      console.error("Erreur lors de la vérification du code:", error);
      if (error.code === 'auth/invalid-verification-code' || error.code === 'auth/session-expired') {
        setError("Le code de vérification est invalide ou a expiré.");
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
    <div className="kole-card"> {/* Kôlê card style */}
      <div className="p-8">
        <h2 className="text-2xl font-bold text-kole-brown-dark mb-6 text-center">
          {step === 'enterPhone' ? 'Connexion par téléphone' : 'Vérifier le code'}
        </h2>

        {error && (
          // Kôlê styled error message
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
            {error}
          </div>
        )}

        {step === 'enterPhone' && (
          <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-6">
            <div>
              <label htmlFor="phone-number" className="block text-sm font-medium text-kole-text-dark mb-2">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
                <Input
                  type="tel"
                  id="phone-number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+225XXXXXXXXXX"
                  required
                  disabled={loading}
                  className="pl-10 kole-input"
                  autoComplete="tel"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full kole-btn-primary py-3 text-lg font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Envoi...
                </span>
              ) : 'Envoyer le code'}
            </Button>
          </form>
        )}

        {step === 'enterOtp' && (
          <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-6">
            <div>
              <label htmlFor="otp-code" className="block text-sm font-medium text-kole-text-dark mb-2">
                Code de vérification (reçu par SMS)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
                <Input
                  type="number"
                  id="otp-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder={`Code à ${CONFIRMATION_CODE_LENGTH} chiffres`}
                  required
                  onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      if (target.value.length > CONFIRMATION_CODE_LENGTH) {
                          target.value = target.value.slice(0, CONFIRMATION_CODE_LENGTH);
                      }
                  }}
                  disabled={loading}
                  className="pl-10 kole-input appearance-none m-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  autoComplete="one-time-code"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading || otp.length !== CONFIRMATION_CODE_LENGTH}
              className="w-full kole-btn-primary py-3 text-lg font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Vérification...
                </span>
              ) : 'Vérifier et se connecter'}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="link" // Using link variant for this button
                onClick={() => { setStep('enterPhone'); setError(null); setOtp(''); }}
                disabled={loading}
                className="text-sm text-kole-blue-primary hover:underline h-auto py-0" // Adjusted styling for link variant
              >
                Changer de numéro ou renvoyer le code
              </Button>
            </div>
          </form>
        )}
        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container" ref={recaptchaContainerRef} className="my-2"></div>
      </div>
    </div>
  );
};

export default PhoneSignInForm;
