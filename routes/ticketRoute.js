const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

// Récupérer tous les tickets d'un utilisateur (utilisateur connecté) -> historique
router.get('/:id_user', ticketController.getAllUserTicket);

// Enregistrer tous les tickets d'un train (employé uniquement) -> controle de disponibilité
router.get('/:id_train', ticketController.getAllTrainTicket);

// Récupérer un ticket par ID (utilisateur connecté & employé pour controle de validité avant de le valider)
router.get('/:id', ticketController.getTicketById); 

// Récupérer un ticket par ID (utilisateur connecté)
router.post('/book', ticketController.creationTicket);

// Valider un ticket par ID (employé uniquement)
router.post('/:id/validate', ticketController.validateTicket);

module.exports = router;
