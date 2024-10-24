const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

// Récupérer toutes les gares
router.get('/', verifyToken, authorizeRole(['admin', 'employe', 'user']), stationController.getAllStations);

// Enregistrer une gare
router.post('/create', verifyToken, authorizeRole(['admin']), stationController.creationStation);

// Récupérer une gare par ID
router.get('/:id', verifyToken, authorizeRole(['admin', 'employe', 'user']), stationController.getStationById);

// Mettre à jour une gare par ID
router.put('/:id', verifyToken, authorizeRole(['admin']), stationController.updateStationById);

// Supprimer une gare par ID
router.delete('/:id', verifyToken, authorizeRole(['admin']), stationController.deleteStationById);

module.exports = router;
