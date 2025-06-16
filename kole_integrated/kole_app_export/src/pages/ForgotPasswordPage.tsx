// src/pages/ForgotPasswordPage.tsx
import React, { useState } from "react"; // Ajout de useState
import { Link /*, useNavigate*/ } from "react-router-dom"; // useNavigate commenté car non utilisé pour l'instant
import { Mail, ArrowLeft, Send, CheckCircle } from "lucide-react"; // Ajout de CheckCircle
import KoleLogo from "/assets/kole_logo_new.png"; // Chemin du logo corrigé

const ForgotPasswordPage: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [submitted, setSubmitted] = useState(false); // État pour le message de confirmation
  // const navigate = useNavigate(); // Commenté car non utilisé pour l'instant

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Implémenter la logique d'envoi du lien de réinitialisation avec Firebase
    console.log("Demande de réinitialisation pour:", emailOrPhone);
    setSubmitted(true);
    // Optionnel: rediriger après un délai ou laisser l'utilisateur cliquer sur le lien de retour
    // setTimeout(() => navigate("/login"), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-kole-cream-bg p-4">
      {/* Arrière-plan harmonisé avec les autres pages d'authentification */}
      <div className="bg-white p-8 rounded-xl-kole shadow-lg w-full max-w-md">
        <img src={KoleLogo} alt="Kôlê Logo" className="h-12 w-auto mx-auto mb-2" />
        <p className="text-center text-kole-text_secondary font-semibold text-sm mb-6">VOTRE TRAJET, NOTRE MISSION</p>

        {!submitted ? (
          <>
            <h1 className="text-xl font-bold text-center text-kole-text-primary mb-2">Mot de passe oublié ?</h1>
            <p className="text-center text-sm text-kole-text-secondary mb-6">
              Entrez le numéro de téléphone associé à votre compte. Nous vous enverrons un code pour réinitialiser votre mot de passe.
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="emailOrPhone" className="block text-sm font-medium text-kole-text-primary mb-1">Numéro de téléphone</label>
                {/* Champ ajusté pour téléphone uniquement pour cohérence avec le flux OTP */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input 
                    type="tel" 
                    id="emailOrPhone" 
                    placeholder="Votre numéro de téléphone"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-kole-border rounded-lg-kole focus:outline-none focus:ring-2 focus:ring-kole-blue-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-kole-blue-primary text-white py-3 rounded-lg-kole hover:bg-kole-blue-dark transition duration-300 font-semibold flex items-center justify-center text-base"
              >
                <Send className="mr-2 h-5 w-5" /> Envoyer le code
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-xl font-bold text-kole-text-primary mb-2">Demande envoyée !</h1>
            <p className="text-sm text-kole-text-secondary mb-6">
              Si un compte est associé à <span className="font-semibold">{emailOrPhone}</span>, vous recevrez un SMS avec les instructions pour réinitialiser votre mot de passe.
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-kole-text-secondary">
          <Link to="/login" className="font-medium text-kole-blue-primary hover:underline flex items-center justify-center">
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour à la connexion
          </Link>
        </p>
      </div>
      {/* Les motifs en overlay ont été retirés pour harmonisation, à discuter si un motif global doit être appliqué */}
    </div>
  );
};

export default ForgotPasswordPage;

