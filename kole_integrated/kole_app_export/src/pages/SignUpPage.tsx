// src/pages/SignUpPage.tsx
import React from "react";
import { Link } from "react-router-dom";
// KoleLogo import will be removed as AuthLayout handles it.
// Unused icon imports were already removed.
import SignUpForm from "../../components/Auth/SignUpForm";
import AuthLayout from '../../components/Layout/AuthLayout'; // Import AuthLayout

const SignUpPage: React.FC = () => {
  // Logic and state are in SignUpForm.tsx

  return (
    <AuthLayout>
      {/* The children of AuthLayout is the main content card */}
      {/* The max-w-lg from original page is overridden by AuthLayout's max-w-md.
          If max-w-lg is strictly needed, AuthLayout would need to be more flexible,
          or SignUpForm's card itself would need to manage its width if AuthLayout's child div didn't have max-width.
          For now, we proceed with AuthLayout's default max-w-md.
      */}
      <div className="bg-white p-6 md:p-8 rounded-xl-kole shadow-lg w-full">
        {/* Branding (logo, tagline) is now handled by AuthLayout */}
        
        <SignUpForm />

        <p className="mt-8 text-center text-sm text-kole-text-secondary">
          Déjà inscrit ? 
          <Link to="/login" className="font-medium text-kole-blue-primary hover:underline ml-1">
            Connectez-vous
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignUpPage;

