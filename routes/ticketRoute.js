const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

// Récupérer tous les tickets d'un utilisateur (utilisateur connecté) -> historique
router.get('/:id_user', verifyToken, authorizeRole(['admin', 'employe', 'user']), ticketController.getAllUserTicket);

// Acheter un ticket par ID (utilisateur connecté)
router.post('/:id_train/booking', verifyToken, authorizeRole(['admin', 'employe', 'user']), ticketController.creationTicket);

// Récupérer tous les tickets d'un train (employé uniquement) -> controle de disponibilité
router.get('/:id_train', verifyToken, authorizeRole(['admin', 'employe']), ticketController.getAllTrainTicket);

// Récupérer un ticket par ID (utilisateur connecté & employé pour controle de validité avant de le valider)
router.get('/:id', verifyToken, authorizeRole(['admin', 'employe']), ticketController.getTicketById); 

// Valider un ticket par ID (employé uniquement)
router.post('/:id/validate', verifyToken, authorizeRole(['admin', 'employe']), ticketController.validateTicket);

module.exports = router;
