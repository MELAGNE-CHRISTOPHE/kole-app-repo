import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';

// Mock du contexte d'authentification pour simuler différents rôles
jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: jest.fn()
}));

// Mock des composants de page pour faciliter les tests
jest.mock('../pages/client/ClientMainMapPage', () => () => <div data-testid="client-main-page">Client Main Page</div>);
jest.mock('../pages/driver/DriverMainMapPage', () => () => <div data-testid="driver-main-page">Driver Main Page</div>);
jest.mock('../pages/admin/AdminDashboard', () => () => <div data-testid="admin-dashboard">Admin Dashboard</div>);
jest.mock('../pages/LoginPage', () => () => <div data-testid="login-page">Login Page</div>);
jest.mock('../pages/UnauthorizedPage', () => () => <div data-testid="unauthorized-page">Unauthorized Page</div>);

// Import du mock pour pouvoir le configurer dans les tests
import { useAuth } from '../context/AuthContext';

describe('Tests de navigation et de sécurité multi-rôles', () => {
  // Configuration pour simuler un utilisateur non connecté
  const setupNotAuthenticated = () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: null,
      userRole: null,
      loading: false
    });
  };

  // Configuration pour simuler un utilisateur client
  const setupClientUser = () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'client123' },
      userRole: 'client',
      loading: false
    });
  };

  // Configuration pour simuler un utilisateur chauffeur
  const setupDriverUser = () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'driver123' },
      userRole: 'driver',
      loading: false
    });
  };

  // Configuration pour simuler un utilisateur administrateur
  const setupAdminUser = () => {
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { uid: 'admin123' },
      userRole: 'admin',
      loading: false
    });
  };

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  test('Utilisateur non connecté est redirigé vers la page de connexion', async () => {
    setupNotAuthenticated();
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  test('Utilisateur client accède à la page client', async () => {
    setupClientUser();
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('client-main-page')).toBeInTheDocument();
    });
  });

  test('Utilisateur chauffeur accède à la page chauffeur', async () => {
    setupDriverUser();
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('driver-main-page')).toBeInTheDocument();
    });
  });

  test('Utilisateur admin accède au tableau de bord admin', async () => {
    setupAdminUser();
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    });
  });

  test('Client tentant d\'accéder à la page chauffeur est redirigé vers la page non autorisée', async () => {
    setupClientUser();
    
    // Simuler une navigation vers /driver
    window.history.pushState({}, 'Driver Page', '/driver');
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument();
    });
  });

  test('Chauffeur tentant d\'accéder à la page admin est redirigé vers la page non autorisée', async () => {
    setupDriverUser();
    
    // Simuler une navigation vers /admin
    window.history.pushState({}, 'Admin Page', '/admin');
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument();
    });
  });

  test('Admin peut accéder à toutes les pages', async () => {
    setupAdminUser();
    
    // Test pour la page admin
    window.history.pushState({}, 'Admin Page', '/admin');
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    });

    // Nettoyer et tester pour la page client
    cleanup();
    window.history.pushState({}, 'Client Page', '/client');
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('client-main-page')).toBeInTheDocument();
    });

    // Nettoyer et tester pour la page chauffeur
    cleanup();
    window.history.pushState({}, 'Driver Page', '/driver');
    
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('driver-main-page')).toBeInTheDocument();
    });
  });
});
