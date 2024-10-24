const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Middleware pour vérifier le token JWT
const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    console.log("Aucun token fourni");
    return res.status(403).json({ message: "Veuillez vous connecter" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
    if (error) {
      console.log("Erreur de vérification du token:", error);
      return res.status(401).json({ message: "Token invalide" });
    }

    try {
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        console.log("Utilisateur non trouvé");
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.log("Erreur lors de la récupération de l'utilisateur:", error);
      return res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
    }
  });
};


// Middleware pour autoriser en fonction des rôles
const authorizeRole = (roles) => {
  return (req, res, next) => {
    const user = req.user; // Utilisateur déjà chargé dans req par verifyToken

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Vérification si le rôle de l'utilisateur est autorisé
    if (roles.includes(user.role)) {
      return next();
    }

    // Si l'utilisateur peut accéder à ses propres ressources (par ID)
    if (req.params.id === user._id.toString()) {
      return next();
    }

    return res.status(403).json({ message: "Accès refusé" });
  };
};

module.exports = { verifyToken, authorizeRole };
