// src/server/server.js
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du build
app.use(express.static(path.join(__dirname, '../../dist')));

// Injecter la clé API directement dans l'application
app.get('/api/config', (req, res) => {
  res.json({
    mapboxApiKey: process.env.VITE_MAPBOX_API_KEY
  });
});

// Toutes les autres requêtes renvoient vers index.html (pour le routage côté client)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
