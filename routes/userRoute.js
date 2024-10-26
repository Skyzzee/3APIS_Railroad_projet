const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');


// Récupérer tous les utilisateurs - Admin - Employee / Connecté
router.get('/', verifyToken, authorizeRole(['admin', 'employe']), userController.getAllUsers);

// S’inscrire - 
router.post('/register', userController.registerUser);

// Se connecter - 
router.post('/login', userController.loginUser);

// Récupérer un utilisateur par son ID - Admin - Employee - Lui-même / Connecté
router.get('/:id', verifyToken, authorizeRole(['admin', 'employe']), userController.getUserById);

// Modifier un utilisateur  - Admin - Lui-même / Connecté
router.put('/:id', verifyToken, authorizeRole(['admin']), userController.updateUserById);

// Supprimer un utilisateur - Admin - Lui-même / Connecté
router.delete('/:id', verifyToken, authorizeRole(['admin']), userController.deleteUserById);

// Modifier le role d’un utilisateur - Admin / Connecté
router.put('/:id/role', verifyToken,authorizeRole(['admin']), userController.editRoleUser);

module.exports = router;
