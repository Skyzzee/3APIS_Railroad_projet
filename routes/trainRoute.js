const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

// Récupérer tous les trains
router.get('/', verifyToken, authorizeRole(['admin', 'employe', 'user']), trainController.getAllTrains);

// Enregistrer un train
router.post('/create', verifyToken, authorizeRole(['admin']), trainController.creationTrain);

// Récupérer un train par ID
router.get('/:id', verifyToken, authorizeRole(['admin', 'employe', 'user']), trainController.getTrainById);

// Mettre à jour un train par ID
router.put('/:id', verifyToken, authorizeRole(['admin']), trainController.updateTrainById);

// Supprimer un train par ID
router.delete('/:id', verifyToken, authorizeRole(['admin']), trainController.deleteTrainById);

module.exports = router;
