const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

// Récupérer toutes les gares -
router.get('/', stationController.getAllStations);

// Créer une gare - Admin / Connecté
router.post('/create', verifyToken, authorizeRole(['admin']), stationController.creationStation);

// Récupérer une gare par son ID - 
router.get('/:id', stationController.getStationById);

// Modifier une gare - Admin / Connecté
router.put('/:id', verifyToken, authorizeRole(['admin']), stationController.updateStationById);

// Supprimer une gare - Admin  / Connecté
router.delete('/:id', verifyToken, authorizeRole(['admin']), stationController.deleteStationById);

module.exports = router;
