const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  train_id: { type: Number, required: true },
  user_id: { type: Number, required: true },
  valid: { type: Boolean, required: true, default: 'false' }
}, { timestamps: true });

// Crée et exporte le modèle Ticket basé sur le schéma
const TicketModel = mongoose.model('Ticket', ticketSchema);

module.exports = TicketModel;
