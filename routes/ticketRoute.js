const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');

// Récupérer tous les tickets d’un utilisateur - Admin - Employee - Lui-même / Connecté
router.get('/history', verifyToken, authorizeRole(['admin', 'employe', 'user']), ticketController.getTicketsByUserId);

// Récupérer tous les tickets d’un train - Admin - Employee / Connecté
router.get('/:id_train/available', verifyToken, authorizeRole(['admin', 'employe']), ticketController.getTicketsByTrainId);

// Créer un ticket (Réserver un billet)  - Admin - Employee - User / Connecté
router.post('/:id_train/booking', verifyToken, authorizeRole(['admin', 'employe', 'user']), ticketController.creationTicket);

// Récupérer un ticket par ID - Admin - Employee - Lui-même  / Connecté
router.get('/:id', verifyToken, authorizeRole(['admin', 'employe', 'user']), ticketController.getTicketById); 

// Valider un ticket par ID - Admin - Employee / Connecté
router.get('/:id/validate', verifyToken, authorizeRole(['admin', 'employe']), ticketController.validateTicketById);

module.exports = router;
