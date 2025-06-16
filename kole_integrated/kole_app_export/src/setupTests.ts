// src/setupTests.ts
import '@testing-library/jest-dom';

// Polyfill pour TextEncoder/TextDecoder utilisé par React Router
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock pour les variables d'environnement
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock pour import.meta.env dans l'environnement de test
// Utiliser Object.defineProperty pour éviter l'erreur de typage
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_MAPBOX_API_KEY: 'test-mapbox-key',
        VITE_PUBLIC_CLIENT_MAP: 'true',
        VITE_PUBLIC_CHAUFFEUR_MAP: 'true',
        DEV: true,
      },
    },
  },
  writable: true,
});

// Suppression des avertissements de console pendant les tests
console.error = jest.fn();
console.warn = jest.fn();
