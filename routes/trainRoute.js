const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

// Récupérer tous les trains -
router.get('/', trainController.getAllTrains);

// Créer un train - Admin / Connecté
router.post('/create', verifyToken, authorizeRole(['admin']), trainController.creationTrain);

// Récupérer un train par son ID - 
router.get('/:id', trainController.getTrainById);

// Modifier un train - Admin / Connecté
router.put('/:id', verifyToken, authorizeRole(['admin']), trainController.updateTrainById);

// Supprimer un train - Admin / Connecté
router.delete('/:id', verifyToken, authorizeRole(['admin']), trainController.deleteTrainById);

module.exports = router;
