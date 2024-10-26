const TicketModel = require('../models/ticketModel');
const { getUserIdFromToken } = require('../middlewares/authMiddleware');


// Récupérer toutes les tickets d'un utilisateur (historique)
exports.getTicketsByUserId = async (req, res) => {
  try {
    const user = await getUserIdFromToken(req); 
    const user_id = user._id;
    const tickets = await TicketModel.find({ user_id });

    if (!tickets.length) return res.status(404).json({ error: 'Aucun ticket trouvé pour cet utilisateur' });

    return res.status(200).json({ message: 'Tous les tickets ont été récupérés avec succès', tickets }); 
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des tickets' });
  }
};



exports.getTicketsByTrainId = async (req, res) => {
  try {
    const tickets = await TicketModel.find({ train_id: req.params.id_train });

    if (!tickets.length) return res.status(404).json({ error: 'Aucun ticket réservé pour ce train' });

    return res.status(200).json({ message: 'Tous les tickets ont été récupérés avec succès', tickets });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des tickets' });
  }
};



// Enregistrer une nouvelle gare
exports.creationTicket = async (req, res) => {
  try {
    const user = await getUserIdFromToken(req); // Récupération de l'utilisateur à partir du token
    const user_id = user._id;
    const train_id = req.params.id_train;

    const ticket = new TicketModel({ user_id, train_id });
    await ticket.save();
    res.status(201).json({ message: 'Le ticket a été réservé avec succès', ticket });

  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la réservation du ticket' });
  }
};

exports.getTicketById = async (req, res) => { 
  try {
    const ticket = await TicketModel.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket non trouvé' });

    const user = await getUserIdFromToken(req); 

    if (!ticket.user_id.equals(user._id) && user._role === 'user') return res.status(401).json({ error: 'Accès interdit' });
    
    return res.status(200).json({ message: 'Le ticket à été récupéré avec succès', ticket });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération du ticket' });
  }
};


exports.validateTicketById = async (req, res) => {
  try {
    const ticket = await TicketModel.findById(req.params.id);

    if (!ticket) return res.status(404).json({ error: 'Ticket non trouvé' });
    ticket.valid = true;
    await ticket.save();
    return res.status(200).json({ message: 'Ticket validé avec succès', ticket });

  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la validation du ticket' });
  }
};

