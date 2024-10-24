const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, authorizeRole } = require('../middlewares/authMiddleware');


// Récupérer tous les utilisateurs
router.get('/', verifyToken, authorizeRole(['admin' || 'employe']), userController.getAllUsers);

// Enregistrer un utilisateur
router.post('/register', userController.registerUser);

// Connexion utilisateur
router.post('/login', userController.loginUser);

// Récupérer un utilisateur par ID
router.get('/:id', verifyToken, authorizeRole(['admin' || 'employe']), userController.getUserById);

// Mettre à jour un utilisateur par ID
router.put('/:id', verifyToken, authorizeRole(['admin']), userController.updateUserById);

// Supprimer un utilisateur par ID
router.delete('/:id', verifyToken, authorizeRole(['admin']), userController.deleteUserById);

// Modifie le role d'un utilisateur
router.put('/:id/role', verifyToken,authorizeRole(['admin']), userController.editRoleUser);

module.exports = router;
