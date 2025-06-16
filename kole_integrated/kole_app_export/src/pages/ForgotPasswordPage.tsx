// src/pages/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send, CheckCircle, Phone } from "lucide-react"; // Added Phone as an alternative for icon if needed
import KoleLogo from "/assets/kole_logo_new.png";

const ForgotPasswordPage: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Implémenter la logique d'envoi du lien/code de réinitialisation avec Firebase
    //       Si c'est un téléphone, on enverrait un OTP. Si email, un lien.
    //       Actuellement, le placeholder et le label indiquent "Numéro de téléphone".
    console.log("Demande de réinitialisation pour:", emailOrPhone);
    setSubmitted(true);
  };

  return (
    // Consistent page layout with LoginPage, SignUpPage, PhoneSignInPage
    <div className="min-h-screen bg-kole-cream-light african-pattern-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding elements - consistent with other auth pages */}
        <div className="text-center mb-8">
          <img src={KoleLogo} alt="Kôlê Logo" className="h-16 w-auto mx-auto mb-3" />
          <h1 className="text-4xl font-bold text-kole-brown-dark mb-2">Kôlê</h1>
          <p className="text-kole-text-secondary font-medium">VOTRE TRAJET, NOTRE MISSION</p>
        </div>

        {/* Main content card */}
        <div className="bg-white p-8 rounded-xl-kole shadow-lg w-full">
          {!submitted ? (
            <>
              <h2 className="text-xl font-bold text-center text-kole-text-primary mb-2">Mot de passe oublié ?</h2>
              <p className="text-center text-sm text-kole-text-secondary mb-6">
                Entrez le numéro de téléphone associé à votre compte. Nous vous enverrons un code pour réinitialiser votre mot de passe.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="emailOrPhone" className="block text-sm font-medium text-kole-text-dark mb-2">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    {/* Using Phone icon as the field is for phone number */}
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-kole-text-secondary" />
                    <input
                      type="tel"
                      id="emailOrPhone"
                      placeholder="Votre numéro de téléphone"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      // Using kole-input for consistency. Padding pl-10 is part of it when an icon is present.
                      className="pl-10 kole-input"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  // Standard Kôlê primary button style
                  className="w-full kole-btn-primary py-3 text-lg font-semibold flex items-center justify-center"
                >
                  <Send className="mr-2 h-5 w-5" /> Envoyer le code
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h2 className="text-xl font-bold text-kole-text-primary mb-2">Demande envoyée !</h2>
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
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
