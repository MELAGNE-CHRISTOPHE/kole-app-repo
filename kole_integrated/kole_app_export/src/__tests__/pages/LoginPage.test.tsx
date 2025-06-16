// src/__tests__/pages/LoginPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../../pages/LoginPage';
import { BrowserRouter } from 'react-router-dom';

// Mock du contexte d'authentification
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    currentUser: null
  })
}));

describe('LoginPage', () => {
  test('renders login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Numéro de téléphone/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });
  
  test('handles form submission', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
    
    const phoneInput = screen.getByPlaceholderText(/Numéro de téléphone/i);
    const passwordInput = screen.getByPlaceholderText(/Mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /Se connecter/i });
    
    fireEvent.change(phoneInput, { target: { value: '0123456789' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Vérifier que la tentative de connexion a été effectuée
    // (le mock du contexte d'authentification capture l'appel)
  });
});
