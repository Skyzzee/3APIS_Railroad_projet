const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
};

// Enregistrer un nouvel utilisateur
exports.registerUser = async (req, res) => {
  const { pseudo, email, password } = req.body;
  try {
    if (!pseudo || !email || !password) {
      return res.status(400).json({ error: "Le nom, l'email et le mot de passe sont requis !" });
    }

    // Vérifiez si l'utilisateur existe déjà
    let user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "L'utilisateur est déjà existant !" });
    }

    // Créer l'utilisateur sans avoir à hash le mot de passe ici
    user = new UserModel({ pseudo, email, password }); // Le mot de passe sera haché automatiquement
    await user.save();

    res.status(201).json({ message: "L'utilisateur a été enregistré avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
    res.status(500).json({ message: "Erreur Serveur" });
  }
};

// Connexion utilisateur
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "L'email et le mot de passe sont requis !" });
  }

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "L'email est invalide !" });
    }

    // Utiliser la méthode comparePassword pour vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    console.log(isMatch, password, user.password); // Pour débogage
    if (!isMatch) {
      return res.status(400).json({ message: "Le mot de passe est invalide !" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1000h' });
    res.status(200).json({ message: "Connexion réussie !", token, user: { id: user._id, pseudo: user.pseudo, email: user.email } });
    
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur du serveur, veuillez réessayer plus tard." });
  }
};

// Récupérer un utilisateur par ID (seulement pour l’employé/admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
};

// Mettre à jour un utilisateur par ID (l’utilisateur peut seulement se modifier lui-même) - admin
exports.updateUserById = async (req, res) => {
  const { password } = req.body; // Récupérer le mot de passe du corps de la requête

  try {
    // Si le mot de passe est présent, le hacher
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash le nouveau mot de passe
      req.body.password = hashedPassword; // Remplace le mot de passe par le mot de passe haché
    }

    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
};


// Supprimer un utilisateur par ID (l’utilisateur peut seulement se supprimer lui-même) - admin
exports.deleteUserById = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
};

// Modifier le role d'un utilisateur
exports.editRoleUser = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['user', 'admin', 'employee'];

    // Vérifier si le rôle est valide
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    // Vérifier si l'utilisateur qui fait la requête a un rôle limité
    if (req.user.role === 'user') {
      return res.status(403).json({ error: 'Accès refusé : vous ne pouvez pas modifier des rôles.' });
    }

    // Mettre à jour le rôle de l'utilisateur cible
    const user = await UserModel.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    
    res.json({ message: 'Rôle mis à jour avec succès', role: user.role });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle de l\'utilisateur' });
  }
};


