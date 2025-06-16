// src/server/proxy.cjs
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Proxy pour les requêtes Mapbox - utilisation de la syntaxe correcte pour capturer tous les sous-chemins
app.get('/api/mapbox/*', async (req, res) => {
  try {
    // Extraire le chemin après /api/mapbox/
    const pathSegment = req.params[0];
    const queryParams = new URLSearchParams(req.query);
    
    // Ajouter la clé API
    queryParams.append('access_token', process.env.VITE_MAPBOX_API_KEY);
    
    const url = `https://api.mapbox.com/${pathSegment}?${queryParams.toString()}`;
    
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Erreur proxy Mapbox:', error);
    res.status(error.response?.status || 500).json({
      error: 'Erreur lors de la requête Mapbox',
      details: error.message
    });
  }
});

// Servir les fichiers statiques du build
app.use(express.static(path.join(__dirname, '../../dist')));

// Toutes les autres requêtes renvoient vers index.html (pour le routage côté client)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
