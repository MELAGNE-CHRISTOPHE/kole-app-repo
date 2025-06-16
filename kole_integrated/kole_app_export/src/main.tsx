import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// Ajouter un gestionnaire d'erreurs global
window.addEventListener('error', (event) => {
  console.error('Erreur globale capturée:', event.error);
  
  // Afficher une erreur visible à l'utilisateur si l'application n'est pas encore chargée
  const rootElement = document.getElementById('root');
  if (rootElement && rootElement.innerHTML.includes('Chargement')) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); max-width: 500px;">
          <div style="color: #e53e3e; margin-bottom: 16px; font-size: 24px;">⚠️ Erreur de chargement</div>
          <p style="margin-bottom: 16px;">Une erreur s'est produite lors du chargement de l'application.</p>
          <p style="margin-bottom: 16px; color: #718096; font-size: 14px;">Détail technique: ${event.error?.message || 'Erreur inconnue'}</p>
          <button onclick="window.location.reload()" style="background-color: #3182ce; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
            Réessayer
          </button>
        </div>
      </div>
    `;
  }
});

// Ajouter un timeout pour détecter les chargements infinis
const loadingTimeout = setTimeout(() => {
  const rootElement = document.getElementById('root');
  if (rootElement && rootElement.innerHTML.includes('Chargement')) {
    console.error('Timeout de chargement détecté après 30 secondes');
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center;">
        <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); max-width: 500px;">
          <div style="color: #e53e3e; margin-bottom: 16px; font-size: 24px;">⚠️ Délai d'attente dépassé</div>
          <p style="margin-bottom: 16px;">L'application n'a pas pu se charger dans le délai imparti.</p>
          <p style="margin-bottom: 16px;">Cela peut être dû à un problème de connexion aux services Firebase ou à une erreur dans l'application.</p>
          <div style="display: flex; justify-content: space-between; margin-top: 16px;">
            <button onclick="window.location.reload()" style="background-color: #3182ce; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
              Réessayer
            </button>
            <a href="/admin-login" style="background-color: #4c51bf; color: white; text-decoration: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
              Accès direct admin
            </a>
          </div>
        </div>
      </div>
    `;
  }
}, 30000); // 30 secondes

// Nettoyer le timeout si l'application se charge correctement
window.addEventListener('load', () => {
  clearTimeout(loadingTimeout);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)


