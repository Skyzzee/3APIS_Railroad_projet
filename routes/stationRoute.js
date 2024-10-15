const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');

// Récupérer toutes les gares
router.get('/', stationController.getAllStations);

// Enregistrer une gare
router.post('/create', stationController.creationStation);

// Récupérer une gare par ID
router.get('/:id', stationController.getStationById);

// Mettre à jour une gare par ID
router.put('/:id', stationController.updateStationById);

// Supprimer une gare par ID
router.delete('/:id', stationController.deleteStationById);

module.exports = router;
