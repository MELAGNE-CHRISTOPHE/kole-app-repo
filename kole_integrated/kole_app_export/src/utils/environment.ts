// src/utils/environment.ts
/**
 * Utilitaire pour accéder aux variables d'environnement
 * Compatible avec les tests Jest et l'environnement de production
 */

// Clé API Mapbox par défaut pour la production
const MAPBOX_API_KEY = 'pk.eyJ1IjoibWVsYWduZSIsImEiOiJjbWFtNDZkajUwZzAwMmlzMWw2ZWg3OHg3In0.yRGskZwORiD-sDcwfntTKg';

// Flags pour les routes publiques
const PUBLIC_CLIENT_MAP = 'true';
const PUBLIC_CHAUFFEUR_MAP = 'true';

/**
 * Récupère une variable d'environnement
 * @param key Nom de la variable d'environnement
 * @returns Valeur de la variable d'environnement
 */
export function getEnvVariable(key: string): string {
  // Essayer d'accéder à import.meta.env (environnement Vite)
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignorer l'erreur si import.meta n'est pas disponible (tests Jest)
  }

  // Valeurs par défaut pour les tests et la production
  switch (key) {
    case 'VITE_MAPBOX_API_KEY':
      return MAPBOX_API_KEY;
    case 'VITE_PUBLIC_CLIENT_MAP':
      return PUBLIC_CLIENT_MAP;
    case 'VITE_PUBLIC_CHAUFFEUR_MAP':
      return PUBLIC_CHAUFFEUR_MAP;
    default:
      return '';
  }
}
