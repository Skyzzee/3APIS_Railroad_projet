const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainController');

// Récupérer tous les trains
router.get('/', trainController.getAllTrains);

// Enregistrer un train
router.post('/create', trainController.creationTrain);

// Récupérer un train par ID
router.get('/:id', trainController.getTrainById);

// Mettre à jour un train par ID
router.put('/:id', trainController.updateTrainById);

// Supprimer un train par ID
router.delete('/:id', trainController.deleteTrainById);

module.exports = router;
