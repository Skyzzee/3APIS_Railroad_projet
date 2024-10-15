const express = require('express');
const dotenv = require('dotenv');

const { connectDB } = require('./config/db');

const userRoutes = require('./routes/userRoute');
const trainRoutes = require('./routes/trainRoute');
const stationRoutes = require('./routes/stationRoute');

// Charger les variables d'environnement
dotenv.config();

const app = express();

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Connexion à MongoDB
connectDB();

// Route de base pour vérifier le fonctionnement
app.get('/', (req, res) => {
    res.send('Bienvenue à l\'API RailRoad');
});

// Routes générales du projet
app.use('/user', userRoutes); // Route des utilisateurs
app.use('/train', trainRoutes); // Route des trains
app.use('/station', stationRoutes); // Route des gares


module.exports = app;

// Lancer le serveur
if (process.env.NODE_ENV !== 'test') {
    app.listen(process.env.PORT, () => {
      console.log(`Serveur en écoute sur le port ${process.env.PORT}`);
    });
  }
