import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Composant ErrorBoundary pour capturer et gérer les erreurs React
 * Permet d'afficher un fallback UI et de journaliser les erreurs
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Mettre à jour l'état pour afficher l'UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Capturer les détails de l'erreur pour la journalisation
    this.setState({ errorInfo });
    
    // Journaliser l'erreur
    console.error('ErrorBoundary a capturé une erreur:', error, errorInfo);
    
    // Appeler le callback onError si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Envoyer l'erreur à un service de monitoring (à implémenter)
    this.logErrorToService(error, errorInfo);
  }

  // Méthode pour envoyer l'erreur à un service de monitoring
  logErrorToService(error: Error, errorInfo: ErrorInfo): void {
    // Simulation d'envoi à un service de monitoring
    // À remplacer par une implémentation réelle (Sentry, LogRocket, etc.)
    console.log('Envoi de l\'erreur au service de monitoring:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  // Méthode pour réinitialiser l'état d'erreur
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Afficher le fallback personnalisé ou le fallback par défaut
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Fallback par défaut avec détails de l'erreur et bouton de réinitialisation
      return (
        <div className="error-boundary-container p-6 max-w-md mx-auto my-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-800">Une erreur est survenue</h2>
          </div>
          
          <div className="mb-4">
            <p className="text-red-700 mb-2">
              {this.state.error?.message || "Erreur inattendue dans l'application"}
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2 text-sm">
                <summary className="text-red-600 cursor-pointer">Détails techniques (développement uniquement)</summary>
                <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto text-xs text-red-800">
                  {this.state.error?.stack}
                </pre>
                <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto text-xs text-red-800">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={this.resetError}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300 transition-colors"
            >
              Rafraîchir la page
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      );
    }

    // Rendre les enfants normalement s'il n'y a pas d'erreur
    return this.props.children;
  }
}

export default ErrorBoundary;
