const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Fonction pour décoder le token et récupérer l'utilisateur
const getUserIdFromToken = async (req) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) throw new Error('Token manquant');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user) throw new Error('Utilisateur non trouvé');
    return user;

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') throw new Error('Token invalide');
    throw new Error('Erreur lors de la récupération de l\'utilisateur');
  }
};

// Middleware pour vérifier le token JWT
const verifyToken = async (req, res, next) => {
  try {
    const user = await getUserIdFromToken(req);
    req.user = user;
    next();
    
  } catch (error) {
    if (error.message === 'Token manquant') {
      return res.status(403).json({ error: 'Veuillez vous connecter' });
    } else if (error.message === 'Token invalide') {
      return res.status(401).json({ error: 'Token invalide' });
    } else if (error.message === 'Utilisateur non trouvé') {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    } else {
      return res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }
  }
};

// Middleware pour autoriser en fonction des rôles
const authorizeRole = (roles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) return res.status(401).json({ error: 'Utilisateur non authentifié' });

    if (roles.includes(user.role) || req.params.id === user._id.toString()) return next();
    
    return res.status(403).json({ error: 'Accès refusé' });
  };
};


module.exports = { getUserIdFromToken, verifyToken, authorizeRole };
