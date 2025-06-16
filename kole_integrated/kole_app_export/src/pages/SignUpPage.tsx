// src/pages/SignUpPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Briefcase, FileText, ShieldQuestion, Bike } from "lucide-react"; // Ajout des icônes manquantes
import KoleLogo from "/assets/kole_logo_new.png";

const SignUpPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Ajout pour confirmer le mot de passe
  const [accountType, setAccountType] = useState<"client" | "driver" | null>(null);
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false); // Ajout pour les termes et conditions
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1 && !agreedToTerms) {
      alert("Veuillez accepter les Termes & Conditions et la Politique de Confidentialité.");
      return;
    }
    // TODO: Implementer la logique d'inscription réelle avec Firebase, y compris la validation des champs
    if (accountType === "driver" && step === 1) {
      setStep(2);
    } else {
      console.log("Sign-up attempt for:", accountType, "at step:", step);
      navigate("/otp-verification"); 
    }
  };

  const renderStep1 = () => (
    <>
      <h1 className="text-2xl font-bold text-center text-kole-text-primary mb-1">Créez votre compte</h1>
      <p className="text-center text-sm text-kole-text-secondary mb-6">Informations de base</p>
      
      {/* Nom complet (regroupe Nom et Prénom) */}
      <div className="mb-4">
        <label htmlFor="fullName" className="block text-sm font-medium text-kole-text-primary mb-1">Nom complet</label>
        <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" id="fullName" placeholder="Votre nom complet" className="w-full pl-10 pr-4 py-3 border border-kole-border rounded-lg-kole focus:outline-none focus:ring-2 focus:ring-kole-blue-primary" />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="phone" className="block text-sm font-medium text-kole-text-primary mb-1">Numéro de téléphone</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="tel" id="phone" placeholder="Votre numéro de téléphone" className="w-full pl-10 pr-4 py-3 border border-kole-border rounded-lg-kole focus:outline-none focus:ring-2 focus:ring-kole-blue-primary" />
        </div>
      </div>

      {/* Email (conservé car utile, bien que non explicitement dans les champs communs du rapport pour inscription) */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-kole-text-primary mb-1">Email (Optionnel)</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="email" id="email" placeholder="Votre adresse e-mail" className="w-full pl-10 pr-4 py-3 border border-kole-border rounded-lg-kole focus:outline-none focus:ring-2 focus:ring-kole-blue-primary" />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-kole-text-primary mb-1">Mot de passe</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type={showPassword ? "text" : "password"} 
            id="password" 
            placeholder="Créez un mot de passe"
            className="w-full pl-10 pr-10 py-3 border border-kole-border rounded-lg-kole focus:outline-none focus:ring-2 focus:ring-kole-blue-primary"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 hover:text-kole-blue-primary"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </div>

      {/* Confirmer le mot de passe */}
      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-kole-text-primary mb-1">Confirmer le mot de passe</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type={showConfirmPassword ? "text" : "password"} 
            id="confirmPassword" 
            placeholder="Confirmez votre mot de passe"
            className="w-full pl-10 pr-10 py-3 border border-kole-border rounded-lg-kole focus:outline-none focus:ring-2 focus:ring-kole-blue-primary"
          />
          <button 
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 hover:text-kole-blue-primary"
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-kole-text-primary mb-2">Je suis un :</label>
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={() => setAccountType("client")}
            className={`flex flex-col items-center justify-center p-4 border rounded-lg-kole transition-all duration-200 ease-in-out 
                        ${accountType === "client" ? "bg-kole-blue-primary text-white border-kole-blue-primary ring-2 ring-offset-1 ring-kole-blue-primary" 
                                                  : "bg-kole-cream hover:bg-kole-hover-bg border-kole-border text-kole-text-secondary"}`}
          >
            <User className={`mb-1 h-7 w-7 ${accountType === "client" ? "text-white" : "text-kole-blue-primary"}`} />
            <span className="text-sm font-medium">Client</span>
          </button>
          <button 
            type="button"
            onClick={() => setAccountType("driver")}
            className={`flex flex-col items-center justify-center p-4 border rounded-lg-kole transition-all duration-200 ease-in-out 
                        ${accountType === "driver" ? "bg-kole-blue-primary text-white border-kole-blue-primary ring-2 ring-offset-1 ring-kole-blue-primary" 
                                                  : "bg-kole-cream hover:bg-kole-hover-bg border-kole-border text-kole-text-secondary"}`}
          >
            <Briefcase className={`mb-1 h-7 w-7 ${accountType === "driver" ? "text-white" : "text-kole-blue-primary"}`} /> 
            <span className="text-sm font-medium">Chauffeur</span>
          </button>
        </div>
      </div>

      {/* Case à cocher Termes & Conditions */}
      <div className="mb-4">
        <div className="flex items-center">
          <input 
            id="termsAndConditions" 
            name="termsAndConditions" 
            type="checkbox" 
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="h-4 w-4 text-kole-blue-primary border-gray-300 rounded focus:ring-kole-blue-primary"
          />
          <label htmlFor="termsAndConditions" className="ml-2 block text-xs text-kole-text-secondary">
            J\'accepte les <a href="/terms" target="_blank" className="font-medium text-kole-blue-primary hover:underline">Termes & Conditions</a> et la <a href="/privacy" target="_blank" className="font-medium text-kole-blue-primary hover:underline">Politique de Confidentialité</a>.
          </label>
        </div>
      </div>
    </>
  );

  const renderDriverStep2 = () => (
    <>
      <h1 className="text-2xl font-bold text-center text-kole-text-primary mb-1">Informations Chauffeur</h1>
      <p className="text-center text-sm text-kole-text-secondary mb-6">Véhicule & Documents</p>
      
      <div className="mb-4">
        <label htmlFor="vehicleTypeDisplay" className="block text-sm font-medium text-kole-text-primary mb-1">Type de véhicule</label>
        <div className="relative">
            <Bike className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" id="vehicleTypeDisplay" value="Moto" readOnly className="w-full pl-10 pr-4 py-3 border border-kole-border rounded-lg-kole bg-gray-100 cursor-not-allowed" />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="licenseNumber" className="block text-sm font-medium text-kole-text-primary mb-1">Numéro de permis de conduire</label>
        <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" id="licenseNumber" placeholder="Votre numéro de permis" className="w-full pl-10 pr-4 py-3 border border-kole-border rounded-lg-kole focus:outline-none focus:ring-2 focus:ring-kole-blue-primary" />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="licensePlate" className="block text-sm font-medium text-kole-text-primary mb-1">Plaque d\'immatriculation (Moto)</label>
        <div className="relative">
            <ShieldQuestion className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" /> {/* Icône indicative */} 
            <input type="text" id="licensePlate" placeholder="AB-123-CD" className="w-full pl-10 pr-4 py-3 border border-kole-border rounded-lg-kole focus:outline-none focus:ring-2 focus:ring-kole-blue-primary" />
        </div>
      </div>
      
      <p className="text-sm text-kole-text-secondary mb-2">Documents à fournir (Photo de profil, Pièce d\'identité, Permis de conduire, Carte grise du véhicule) :</p>
      {/* TODO: Implémenter des champs d'upload spécifiques pour chaque document requis */}
      <div className="mb-4">
        <label htmlFor="profilePhotoUpload" className="block text-sm font-medium text-kole-text-primary mb-1">Photo de profil</label>
        <input type="file" id="profilePhotoUpload" className="w-full text-sm text-kole-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kole-blue-primary file:text-white hover:file:bg-kole-blue-dark" />
      </div>
      <div className="mb-4">
        <label htmlFor="idCardUpload" className="block text-sm font-medium text-kole-text-primary mb-1">Pièce d\'identité</label>
        <input type="file" id="idCardUpload" className="w-full text-sm text-kole-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-kole-blue-primary file:text-white hover:file:bg-kole-blue-dark" />
      </div>
      {/* Ajouter les autres champs d'upload ici (Permis, Carte grise) */}

       <button 
        type="button" 
        onClick={() => setStep(1)} 
        className="w-full bg-kole-cream text-kole-text-primary py-3 rounded-lg-kole hover:bg-kole-hover-bg border border-kole-border transition duration-300 font-semibold flex items-center justify-center mt-4"
      >
        Précédent
      </button>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-kole-cream-bg p-4">
      <div className="bg-white p-6 md:p-8 rounded-xl-kole shadow-lg w-full max-w-lg">
        <img src={KoleLogo} alt="Kôlê Logo" className="h-12 w-auto mx-auto mb-2" />
        <p className="text-center text-kole-text_secondary font-semibold text-sm mb-6">VOTRE TRAJET, NOTRE MISSION</p>
        
        <form onSubmit={handleSubmit}>
          {step === 1 && renderStep1()}
          {step === 2 && accountType === "driver" && renderDriverStep2()}

          <button 
            type="submit" 
            className={`w-full bg-kole-blue-primary text-white py-3.5 rounded-lg-kole hover:bg-kole-blue-dark transition duration-300 font-semibold flex items-center justify-center mt-6 text-base ${(!accountType && step === 1) || (step === 1 && !agreedToTerms) ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={(!accountType && step === 1) || (step === 1 && !agreedToTerms)}
          >
            {accountType === "driver" && step === 1 ? "Suivant" : "S'inscrire"} <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-kole-text-secondary">
          Déjà inscrit ? 
          <Link to="/login" className="font-medium text-kole-blue-primary hover:underline ml-1">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;

