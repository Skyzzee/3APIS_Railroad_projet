const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  open_hour: { type: String, required: true },
  close_hour: { type: String, required: true },
  image: { type: String, required: true }
}, { timestamps: true });

// Crée et exporte le modèle Station basé sur le schéma
const StationModel = mongoose.model('Station', stationSchema);

module.exports = StationModel;
