const TicketModel = require('../models/ticketModel');

// Récupérer toutes les tickets d'un utilisateur (historique)
exports.getAllUserTicket = async (req, res) => {
  try {
    const tickets = await TicketModel.findById(req.params.id_user);
    if (!tickets) return res.status(404).json({ error: 'Aucun ticket trouvée' });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tickets de l\'utilisateur' });
  }
};

exports.getAllTrainTicket = async (req, res) => {
  try {
    const tickets = await TicketModel.find();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des gares' });
  }
};

// Enregistrer une nouvelle gare
exports.creationTicket = async (req, res) => {
  const { name, open_hour, close_hour, image } = req.body;
  try {
    if (!name || !open_hour || !close_hour || !image) {
      return res.status(400).json({ error: "Le nom, les heures d'ouverture et de fermeture ainsi que l'image sont requis !" });
    }
    let station = await TicketModel.findOne({ name });
    if (station) {
      return res.status(400).json({ message: "La gare est déjà existante !" });
    } else {
      station = new TicketModel({ name, open_hour, close_hour, image });
      await station.save();
      res.status(201).json({ message: "La gare a été enregistrée avec succès" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur Serveur" });
  }
};

// Récupérer d'une gare par ID
exports.getTicketById = async (req, res) => {
  try {
    const station = await TicketModel.findById(req.params.id);
    if (!station) return res.status(404).json({ error: 'Gare non trouvée' });
    res.json(station);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du la gare' });
  }
};

exports.validateTicket = async (req, res) => { };
