// src/services/apiProxy.ts
import axios from 'axios';
import { getEnvVariable } from '../utils/environment';

/**
 * Service de proxy pour les requêtes API externes
 * Permet de sécuriser les clés API en les gérant côté serveur
 */

// URL de base du service de proxy (à configurer selon l'environnement)
const PROXY_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.kole-app.com/proxy'  // URL de production
  : 'http://localhost:3001/proxy';    // URL de développement local

/**
 * Effectue une requête Mapbox via le proxy pour protéger la clé API
 * @param endpoint Point de terminaison Mapbox (sans la clé API)
 * @param params Paramètres de requête
 * @returns Données de la réponse
 */
export const mapboxProxyRequest = async (endpoint: string, params: Record<string, any> = {}) => {
  try {
    // En mode développement ou test, utiliser directement la clé API
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const apiKey = getEnvVariable('VITE_MAPBOX_API_KEY');
      const url = `https://api.mapbox.com/${endpoint}?access_token=${apiKey}`;
      const response = await axios.get(url, { params });
      return response.data;
    }
    
    // En production, utiliser le proxy pour protéger la clé API
    const response = await axios.post(`${PROXY_BASE_URL}/mapbox`, {
      endpoint,
      params
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la requête Mapbox:', error);
    throw error;
  }
};

/**
 * Effectue une requête de géocodage via le proxy
 * @param query Adresse ou lieu à géocoder
 * @returns Coordonnées et informations sur le lieu
 */
export const geocodeAddress = async (query: string) => {
  try {
    const endpoint = `geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
    const params = {
      limit: 1,
      language: 'fr'
    };
    
    return await mapboxProxyRequest(endpoint, params);
  } catch (error) {
    console.error('Erreur lors du géocodage:', error);
    throw error;
  }
};

/**
 * Calcule un itinéraire entre deux points via le proxy
 * @param origin Point de départ [longitude, latitude]
 * @param destination Point d'arrivée [longitude, latitude]
 * @returns Données de l'itinéraire
 */
export const getDirections = async (origin: [number, number], destination: [number, number]) => {
  try {
    const endpoint = `directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
    const params = {
      geometries: 'geojson',
      overview: 'full',
      steps: true,
      language: 'fr'
    };
    
    return await mapboxProxyRequest(endpoint, params);
  } catch (error) {
    console.error('Erreur lors du calcul d\'itinéraire:', error);
    throw error;
  }
};
