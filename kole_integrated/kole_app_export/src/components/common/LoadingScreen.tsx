import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  message?: string;
  timeout?: number;
  onTimeout?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Chargement...", 
  timeout = 30000, // 30 secondes par défaut
  onTimeout 
}) => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState<boolean>(false);
  const [dots, setDots] = useState<string>('');

  // Animation des points de chargement
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + '.' : '');
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  // Gestion du temps écoulé et du timeout
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1000;
        
        // Afficher un message après 10 secondes
        if (newTime >= 10000 && !showTimeoutMessage) {
          setShowTimeoutMessage(true);
        }
        
        // Déclencher le callback de timeout si défini
        if (newTime >= timeout && onTimeout) {
          onTimeout();
          clearInterval(timer);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeout, onTimeout, showTimeoutMessage]);

  // Formatage du temps écoulé
  const formatElapsedTime = () => {
    const seconds = Math.floor(elapsedTime / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="spinner"></div>
        <h2>{message}{dots}</h2>
        <p className="elapsed-time">Temps écoulé: {formatElapsedTime()}</p>
        
        {showTimeoutMessage && (
          <div className="timeout-message">
            <p>Le chargement prend plus de temps que prévu. Vous pouvez patienter ou rafraîchir la page.</p>
            <button 
              className="refresh-button"
              onClick={() => window.location.reload()}
            >
              Rafraîchir la page
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        
        .loading-container {
          text-align: center;
          padding: 2rem;
          border-radius: 8px;
          background-color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 90%;
          width: 400px;
        }
        
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid #3498db;
          width: 50px;
          height: 50px;
          margin: 0 auto 1rem;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        h2 {
          margin-bottom: 1rem;
          color: #333;
        }
        
        .elapsed-time {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 1rem;
        }
        
        .timeout-message {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }
        
        .timeout-message p {
          color: #e74c3c;
          margin-bottom: 1rem;
        }
        
        .refresh-button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        
        .refresh-button:hover {
          background-color: #2980b9;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
