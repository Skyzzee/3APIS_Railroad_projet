const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

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
    let user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "L'utilisateur est déjà existant !" });
    } else {
      user = new UserModel({ pseudo, email, password });
      await user.save();
      res.status(201).json({ message: "L'utilisateur a été enregistré avec succès" });
    }
  } catch (error) {
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
      return res.status(400).json({ message: "Les informations d'identification sont invalides !" });
    } else {
      const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
      res.status(200).json({ message: "Connexion réussie !", token, user: { id: user._id, pseudo: user.pseudo, email: user.email } });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur du serveur, veuillez réessayer plus tard." });
  }
};

// Récupérer un utilisateur par ID
exports.getUserById = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
};

// Mettre à jour un utilisateur par ID
exports.updateUserById = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
};

// Supprimer un utilisateur par ID
exports.deleteUserById = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
};
