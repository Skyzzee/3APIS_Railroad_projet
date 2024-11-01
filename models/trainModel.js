const mongoose = require('mongoose');

const trainSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  start_station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  end_station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
  time_of_departure: { type: Date, required: true }
}, { timestamps: true });

const TrainModel = mongoose.model('Train', trainSchema);

module.exports = TrainModel;
