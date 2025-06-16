// src/pages/PhoneSignInPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import PhoneSignInForm from '../components/Auth/PhoneSignInForm';
import KoleLogo from "/assets/kole_logo_new.png"; // Import the logo

const PhoneSignInPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-kole-cream-light african-pattern-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md"> {/* Consistent width with LoginPage */}
        {/* Logo and tagline */}
        <div className="text-center mb-8">
          <img src={KoleLogo} alt="Kôlê Logo" className="h-16 w-auto mx-auto mb-3" /> {/* Adjusted size slightly */}
          <h1 className="text-4xl font-bold text-kole-brown-dark mb-2">Kôlê</h1>
          <p className="text-kole-text-secondary font-medium">VOTRE TRAJET, NOTRE MISSION</p>
        </div>

        {/* PhoneSignInForm component will render its own card */}
        <PhoneSignInForm />

        {/* Navigation links below the form card */}
        <div className="text-center mt-8">
          <span className="text-kole-text-secondary">Ou connectez-vous avec votre </span>
          <Link
            to="/login"
            className="text-kole-blue-primary hover:underline font-semibold"
          >
            Email
          </Link>
        </div>
        <div className="text-center mt-4">
          <span className="text-kole-text-secondary">Pas encore de compte ? </span>
          <Link
            to="/signup"
            className="text-kole-blue-primary hover:underline font-semibold"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PhoneSignInPage;
