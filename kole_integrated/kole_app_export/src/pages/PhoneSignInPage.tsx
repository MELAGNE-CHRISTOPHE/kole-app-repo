// src/pages/PhoneSignInPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import PhoneSignInForm from '../components/Auth/PhoneSignInForm';
// KoleLogo import will be removed as AuthLayout handles it.
import AuthLayout from '../../components/Layout/AuthLayout'; // Import AuthLayout

const PhoneSignInPage: React.FC = () => {
  return (
    <AuthLayout>
      {/* PhoneSignInForm component will render its own card */}
      <PhoneSignInForm />

      {/* Navigation links below the form card, these become direct children of AuthLayout's content div */}
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
    </AuthLayout>
  );
};

export default PhoneSignInPage;
