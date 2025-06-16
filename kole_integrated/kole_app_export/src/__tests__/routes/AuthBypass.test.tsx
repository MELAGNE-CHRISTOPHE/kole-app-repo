// src/__tests__/routes/AuthBypass.test.tsx
import { render, screen } from '@testing-library/react';
import App from '../../App';

// Mock des composants pour simplifier les tests
jest.mock('../../pages/client/ClientMainMapPage', () => () => <div data-testid="client-map">Client Map</div>);
jest.mock('../../pages/driver/DriverMainMapPage', () => () => <div data-testid="driver-map">Driver Map</div>);

// Mock du Router pour éviter l'erreur de double Router
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock du contexte d'authentification
jest.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({ currentUser: null }),
}));

describe('Routes avec bypass d\'authentification', () => {
  test('la route /client/map est accessible sans authentification', () => {
    // Utiliser une approche différente pour tester le routage sans imbriquer les Router
    window.history.pushState({}, '', '/client/map');
    
    render(<App />);
    
    expect(screen.getByTestId('client-map')).toBeInTheDocument();
  });

  test('la route /chauffeur/map est accessible sans authentification', () => {
    // Utiliser une approche différente pour tester le routage sans imbriquer les Router
    window.history.pushState({}, '', '/chauffeur/map');
    
    render(<App />);
    
    expect(screen.getByTestId('driver-map')).toBeInTheDocument();
  });
});
