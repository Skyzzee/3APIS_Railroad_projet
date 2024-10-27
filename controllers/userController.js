const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getUserIdFromToken } = require('../middlewares/authMiddleware');



// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    return res.status(200).json({ message: 'Tous les utilisateurs ont été récupérés avec succès', users });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
};

// Enregistrer un nouvel utilisateur
exports.registerUser = async (req, res) => {
  const { pseudo, email, password } = req.body;
  try {
    if (!pseudo || !email || !password) return res.status(400).json({ error: 'Le nom, l\'email et le mot de passe sont requis !' });

    // Vérifiez si l'utilisateur existe déjà
    let user = await UserModel.findOne({ email });
    if (user) return res.status(400).json({ error: 'L\'utilisateur est déjà existant !' });

    // Créer l'utilisateur sans avoir à hash le mot de passe ici
    user = new UserModel({ pseudo, email, password }); // Le mot de passe sera haché automatiquement
    await user.save();

    return res.status(201).json({ message: 'L\'utilisateur a été enregistré avec succès', user });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
};

// Connexion utilisateur
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'L\'email et le mot de passe sont requis !' });

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ error: 'L\'email est invalide !' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Le mot de passe est invalide !' });


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1000h' });
    return res.status(200).json({ message: 'Connexion réussie !', token, user });
    
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la connexion de l\'utilisateur' });
  }
};

// Récupérer un utilisateur par ID (seulement pour l’employé/admin)
exports.getUserById = async (req, res) => {
  try {
    const userByToken = await getUserIdFromToken(req);
    const user = await UserModel.findById(req.params.id);
    if (userByToken.role !== 'admin' && userByToken.id !== user.id) return res.status(403).json({ error: 'Accès refusé' });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    return res.status(200).json({ message: 'Utilisateur récupéré avec succès', user });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
};

// Mettre à jour un utilisateur par ID (l’utilisateur peut seulement se modifier lui-même) - admin
exports.updateUserById = async (req, res) => {
  try {
  const { password } = req.body;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); 
      req.body.password = hashedPassword;
    }

    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    
    return res.status(200).json({ message: 'Utilisateur mis à jour avec succès', user });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
};


// Supprimer un utilisateur par ID (l’utilisateur peut seulement se supprimer lui-même) - admin
exports.deleteUserById = async (req, res) => {
  try {
    const userByToken = await getUserIdFromToken(req);
    const userByRequest = await UserModel.findByIdAndDelete(req.params.id);
    if (!userByRequest) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    if (userByToken.id !== userByRequest.id && userByToken.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
    return res.status(204).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
};

// Modifier le role d'un utilisateur
exports.editRoleUser = async (req, res) => {
  try {
    const { role } = req.body;
    const userByToken = await getUserIdFromToken(req);
    const validRoles = ['user', 'admin', 'employee'];

    if (userByToken.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Rôle invalide' });

    const user = await UserModel.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    
    return res.status(200).json({ message: 'Rôle mis à jour avec succès', role: user.role });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour du rôle de l\'utilisateur' });
  }
};


