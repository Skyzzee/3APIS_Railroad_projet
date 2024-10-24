const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Fonction pour décoder le token et récupérer l'utilisateur
const getUserIdFromToken = async (req) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    throw new Error("Token manquant");
  }

  try {
    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Recherche l'utilisateur en fonction de l'ID extrait du token
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }
    return user; // Retourne l'utilisateur s'il est trouvé
  } catch (error) {
    // Gestion des erreurs liées au token et à la recherche utilisateur
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new Error("Token invalide");
    }
    throw new Error("Erreur lors de la récupération de l'utilisateur");
  }
};

// Middleware pour vérifier le token JWT
const verifyToken = async (req, res, next) => {
  try {
    const user = await getUserIdFromToken(req); // Utilise la fonction pour récupérer l'utilisateur
    req.user = user;
    next(); // Continue si tout est correct
  } catch (error) {
    if (error.message === "Token manquant") {
      return res.status(403).json({ message: "Veuillez vous connecter" });
    } else if (error.message === "Token invalide") {
      return res.status(401).json({ message: "Token invalide" });
    } else if (error.message === "Utilisateur non trouvé") {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    } else {
      return res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
    }
  }
};

// Middleware pour autoriser en fonction des rôles
const authorizeRole = (roles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    console.log(roles, user.role);
    if (roles.includes(user.role)) {
      console.log(roles, user.role);
      return next();
    }

    if (req.params.id === user._id.toString()) {
      return next();
    }

    return res.status(403).json({ message: "Accès refusé" });
  };
};


module.exports = { getUserIdFromToken, verifyToken, authorizeRole };
