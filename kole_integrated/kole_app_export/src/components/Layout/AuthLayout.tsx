import React from 'react';
// Assuming KoleLogo is often imported, let's try that. If not, direct path /assets/kole_logo_new.png will be used.
// For consistency, let's assume direct path as used in other page files if they don't import KoleLogo image asset.
// After checking ForgotPasswordPage, it uses: import KoleLogo from "/assets/kole_logo_new.png";
// So, this component should probably do the same.

// Correction: The task description uses direct path in the example, let's stick to that for now for simplicity,
// as image imports can sometimes have build configurations.
// However, if other components *import* KoleLogo, that's better.
// The pages like ForgotPasswordPage *do* import `KoleLogo from "/assets/kole_logo_new.png";`
// So, the AuthLayout should also import it.

import KoleLogo from '/assets/kole_logo_new.png';
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <div className="min-h-screen bg-kole-cream-light african-pattern-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md"> {/* Wrapper for branding and content card */}
        {/* Branding elements - styled consistently with other auth pages */}
        <div className="text-center"> {/* Branding text also centered */}
          <img src={KoleLogo} alt={t('authLayout.koleLogoAlt')} className="h-16 w-auto mx-auto mb-3" />
          <h1 className="text-4xl font-bold text-kole-brown-dark mb-2">{t('authLayout.mainTitle')}</h1>
          <p className="text-kole-text-secondary font-medium mb-8">{t('authLayout.tagline')}</p> {/* This mb-8 provides space before children card */}
        </div>

        {/* Children will typically be the Card component for the specific auth form */}
        {/* No extra div or mt-8 needed here if the mb-8 on tagline is sufficient */}
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
