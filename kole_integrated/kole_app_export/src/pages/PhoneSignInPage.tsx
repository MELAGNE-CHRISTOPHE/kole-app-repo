// src/pages/PhoneSignInPage.tsx
import React from 'react';
import PhoneSignInForm from '../components/Auth/PhoneSignInForm';

const PhoneSignInPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Connexion par téléphone</h1>
      <PhoneSignInForm />
    </div>
  );
};

export default PhoneSignInPage;
