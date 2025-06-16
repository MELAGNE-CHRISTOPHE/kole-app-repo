// src/pages/SignUpPage.tsx
import React from "react"; // Removed useState
import { Link } from "react-router-dom"; // Removed useNavigate as it's handled by SignUpForm
// Removed unused icons: User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Briefcase, FileText, ShieldQuestion, Bike
import KoleLogo from "/assets/kole_logo_new.png";
import SignUpForm from "../../components/Auth/SignUpForm"; // Import the refactored SignUpForm

const SignUpPage: React.FC = () => {
  // All state and handlers (showPassword, showConfirmPassword, accountType, step, agreedToTerms, handleSubmit, renderStep1, renderDriverStep2)
  // have been moved to SignUpForm.tsx.

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-kole-cream-bg p-4">
      <div className="bg-white p-6 md:p-8 rounded-xl-kole shadow-lg w-full max-w-lg">
        <img src={KoleLogo} alt="Kôlê Logo" className="h-12 w-auto mx-auto mb-2" />
        <p className="text-center text-kole-text_secondary font-semibold text-sm mb-6">VOTRE TRAJET, NOTRE MISSION</p>
        
        {/* Render the SignUpForm component here */}
        <SignUpForm />

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

