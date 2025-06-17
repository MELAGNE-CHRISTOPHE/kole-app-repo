import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Composants de chargement et d'erreur
import LoadingScreen from './components/common/LoadingScreen';
import ErrorBoundary from './components/common/ErrorBoundary';

// Pages principales - chargement immédiat
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLoginDirect from './pages/AdminLoginDirect';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { Suspense, lazy } from 'react';

// Pages avec chargement différé (lazy loading)
const ClientMainMapPage = lazy(() => import('./pages/client/ClientMainMapPage'));
const ClientBookingPage = lazy(() => import('./pages/client/ClientBookingPage'));
const ClientSearchingDriverPage = lazy(() => import('./pages/client/ClientSearchingDriverPage'));
const ClientTrackRidePage = lazy(() => import('./pages/client/ClientTrackRidePage'));
const ClientRateRidePage = lazy(() => import('./pages/client/ClientRateRidePage'));
const ClientRideCompletedPage = lazy(() => import('./pages/client/ClientRideCompletedPage'));
const ClientEditProfilePage = lazy(() => import('./pages/client/ClientEditProfilePage'));
const ClientFavoritePlacesPage = lazy(() => import('./pages/client/ClientFavoritePlacesPage'));
const ClientRideReceiptPage = lazy(() => import('./pages/client/ClientRideReceiptPage'));
const ClientReportIssuePage = lazy(() => import('./pages/client/ClientReportIssuePage')); // Added Report Issue Page

const DriverDashboard = lazy(() => import('./pages/driver/DriverDashboard'));
const DriverMainMapPage = lazy(() => import('./pages/driver/DriverMainMapPage'));
const DriverNavigateToClientPage = lazy(() => import('./pages/driver/DriverNavigateToClientPage'));
const DriverNavigateToDestinationPage = lazy(() => import('./pages/driver/DriverNavigateToDestinationPage'));

// Routes administrateur
const AdminRoutes = lazy(() => import('./pages/AdminRoutes'));

// Mode développement pour contourner les vérifications d'authentification
const DEV_MODE = true; // Activé temporairement pour résoudre les problèmes d'accès

const App: React.FC = () => {
  const { currentUser, userRole, loading, setBypassAuthCheck } = useAuth();
  const location = useLocation();

  // Activer le contournement des vérifications d'authentification en mode développement
  React.useEffect(() => {
    if (DEV_MODE) {
      console.log('[App] Mode développement activé, contournement des vérifications d\'authentification');
      setBypassAuthCheck(true);
    }
  }, [setBypassAuthCheck]);

  // Redirection automatique selon le rôle après connexion
  const getHomeRoute = () => {
    // En mode développement, permettre l'accès direct aux modules
    if (DEV_MODE) {
      const path = location.pathname;
      if (path.startsWith('/client')) return '/client';
      if (path.startsWith('/driver')) return '/driver';
      if (path.startsWith('/admin')) return '/admin';
    }
    
    if (!currentUser) return '/login';
    
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'driver':
        return '/driver';
      case 'client':
        return '/client';
      default:
        // Si aucun rôle n'est défini mais l'utilisateur est connecté,
        // rediriger vers le module client par défaut
        console.log('[App] Aucun rôle défini, redirection vers le module client par défaut');
        return '/client';
    }
  };

  // Afficher un message d'erreur global en cas de problème
  const handleGlobalError = (error: Error) => {
    console.error('[App] Erreur globale capturée:', error);
    // Ici, on pourrait implémenter un envoi à un service de monitoring
  };

  // En mode développement, afficher un message d'information
  const DevModeNotice = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#f39c12',
      color: 'white',
      padding: '0.5rem',
      textAlign: 'center',
      fontSize: '0.9rem',
      zIndex: 10000
    }}>
      Mode développement activé - Accès libre aux modules
    </div>
  );

  // Composant de route simple sans protection en mode développement
  const SimpleRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (DEV_MODE) {
      console.log('[SimpleRoute] Mode développement - Accès direct accordé');
      return <>{children}</>;
    }
    
    // En mode production, utiliser la logique d'authentification normale
    if (loading) {
      return <LoadingScreen message="Chargement..." />;
    }
    
    if (!currentUser) {
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <ErrorBoundary 
      fallback={
        <div className="error-container">
          <h2>Une erreur est survenue</h2>
          <p>Nous sommes désolés, une erreur inattendue s'est produite.</p>
          <button onClick={() => window.location.reload()}>
            Rafraîchir la page
          </button>
          <style jsx>{`
            .error-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              padding: 2rem;
              text-align: center;
            }
            
            h2 {
              color: #e74c3c;
              margin-bottom: 1rem;
            }
            
            p {
              margin-bottom: 2rem;
            }
            
            button {
              background-color: #3498db;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
            }
          `}</style>
        </div>
      }
      onError={handleGlobalError}
    >
      {DEV_MODE && <DevModeNotice />}
      <div style={{ marginTop: DEV_MODE ? '2.5rem' : '0' }}>
        <Suspense fallback={<LoadingScreen message="Chargement de l'application..." />}>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin-login-direct" element={<AdminLoginDirect />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Redirection vers la page d'accueil selon le rôle */}
            <Route path="/" element={<Navigate to={getHomeRoute()} replace />} />
            
            {/* Routes client avec protection simplifiée */}
            <Route path="/client" element={
              <SimpleRoute>
                <ClientMainMapPage />
              </SimpleRoute>
            } />
            <Route path="/client/booking" element={
              <SimpleRoute>
                <ClientBookingPage />
              </SimpleRoute>
            } />
            <Route path="/client/searching" element={
              <SimpleRoute>
                <ClientSearchingDriverPage />
              </SimpleRoute>
            } />
            <Route path="/client/track" element={
              <SimpleRoute>
                <ClientTrackRidePage />
              </SimpleRoute>
            } />
            <Route path="/client/rate" element={
              <SimpleRoute>
                <ClientRateRidePage />
              </SimpleRoute>
            } />
            <Route path="/client/completed" element={
              <SimpleRoute>
                <ClientRideCompletedPage />
              </SimpleRoute>
            } />
            <Route path="/client/profile/edit" element={ // New Route for Edit Profile
              <SimpleRoute>
                <ClientEditProfilePage />
              </SimpleRoute>
            } />
            <Route path="/client/profile/favorites" element={ // New Route for Favorite Places
              <SimpleRoute>
                <ClientFavoritePlacesPage />
              </SimpleRoute>
            } />
            <Route path="/client/ride-receipt" element={ // New Route for Ride Receipt
              <SimpleRoute>
                <ClientRideReceiptPage />
              </SimpleRoute>
            } />
            <Route path="/client/report-issue" element={ // New Route for Report Issue
              <SimpleRoute>
                <ClientReportIssuePage />
              </SimpleRoute>
            } />
            
            {/* Routes chauffeur avec protection simplifiée */}
            <Route path="/driver" element={
              <SimpleRoute>
                <DriverDashboard />
              </SimpleRoute>
            } />
            <Route path="/driver/map" element={
              <SimpleRoute>
                <DriverMainMapPage />
              </SimpleRoute>
            } />
            <Route path="/driver/navigate-to-client" element={
              <SimpleRoute>
                <DriverNavigateToClientPage />
              </SimpleRoute>
            } />
            <Route path="/driver/navigate-to-destination" element={
              <SimpleRoute>
                <DriverNavigateToDestinationPage />
              </SimpleRoute>
            } />
            
            {/* Routes administrateur avec protection simplifiée */}
            <Route path="/admin/*" element={
              <SimpleRoute>
                <AdminRoutes />
              </SimpleRoute>
            } />
            
            {/* Route 404 pour toutes les autres URL */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export default App;

