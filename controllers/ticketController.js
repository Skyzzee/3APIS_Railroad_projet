const TicketModel = require('../models/ticketModel');
const { getUserIdFromToken } = require('../middlewares/authMiddleware');


// Récupérer toutes les tickets d'un utilisateur (historique)
exports.getTicketsByUserId = async (req, res) => {
  try {
    const user = await getUserIdFromToken(req); 
    const user_id = user._id;
    const tickets = await TicketModel.find({ user_id });

    if (!tickets.length) return res.status(404).json({ message: 'Aucun ticket trouvé pour cet utilisateur' });

    res.json(tickets); 
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des tickets' });
  }
};



exports.getTicketsByTrainId = async (req, res) => {
  try {
    const tickets = await TicketModel.find({ train_id: req.params.id_train });

    if (!tickets.length) return res.status(404).json({ error: 'Aucun ticket réservé pour ce train' });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tickets' });
  }
};



// Enregistrer une nouvelle gare
exports.creationTicket = async (req, res) => {
  try {
    const user = await getUserIdFromToken(req); // Récupère l'utilisateur à partir du token
    const user_id = user._id;
    const train_id = req.params.id_train;

    const ticket = new TicketModel({ user_id, train_id });
    await ticket.save();
    res.status(201).json({ message: "Le ticket a été réservé avec succès" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur Serveur" });
  }
};

exports.getTicketById = async (req, res) => { 
  try {
    const ticket = await TicketModel.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket non trouvé' });

    const user = await getUserIdFromToken(req); 
    const user_id = user._id;

    if (ticket.user_id !== user_id) return res.status(401).json({ error: 'Accès interdit' });
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du ticket' });
  }
};


exports.validateTicketById = async (req, res) => {
  try {
    const ticket = await TicketModel.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket non trouvé' });

    ticket.valid = true;
    await ticket.save();
    res.json({ message: 'Ticket validé avec succès', ticket });

  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la validation du ticket' });
  }
};

