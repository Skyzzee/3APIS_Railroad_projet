const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  train_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Train', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  valid: { type: Boolean, required: true, default: false }
}, { timestamps: true });

const TicketModel = mongoose.model('Ticket', ticketSchema);

module.exports = TicketModel;
