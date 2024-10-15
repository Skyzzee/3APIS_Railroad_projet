const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Récupérer tous les utilisateurs
router.get('/', userController.getAllUsers);

// Enregistrer un utilisateur
router.post('/register', userController.registerUser);

// Connexion utilisateur
router.post('/login', userController.loginUser);

// Récupérer un utilisateur par ID
router.get('/:id', userController.getUserById);

// Mettre à jour un utilisateur par ID
router.put('/:id', userController.updateUserById);

// Supprimer un utilisateur par ID
router.delete('/:id', userController.deleteUserById);

module.exports = router;
