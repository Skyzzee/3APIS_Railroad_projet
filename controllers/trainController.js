const TrainModel = require('../models/trainModel');

// Récupérer tous les trains
exports.getAllTrains = async (req, res) => {
  try {
    const trains = await TrainModel.find();
    return res.status(200).json({ message: 'Tous les trains ont été récupérés avec succès', trains });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des trains' });
  }
};

// Enregistrer un nouveau train (admin uniquement)
exports.creationTrain = async (req, res) => {
  const { name, start_station, end_station, time_of_departure } = req.body;
  try {
    if (!name || !start_station || !end_station || !time_of_departure) {
      return res.status(400).json({ error: 'Le nom, les stations de début et de fin ainsi que l\'heure de départ sont requis !' });
    }
    let train = await TrainModel.findOne({ name });
    if (train) {
      return res.status(400).json({ error: 'Le train est déjà existant !' });
    } else {
      train = new TrainModel({ name, start_station, end_station, time_of_departure });
      await train.save();
      return res.status(201).json({ message: 'Train enregistré avec succès', train });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la création du trains' });
  }
};

// Récupérer un train par ID
exports.getTrainById = async (req, res) => {
  try {
    const train = await TrainModel.findById(req.params.id);
    if (!train) return res.status(404).json({ error: 'Train non trouvé' });
    return res.status(200).json({ message: 'Train récupéré avec succès', train });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération du train' });
  }
};

// Mettre à jour un train par ID (admin uniquement)
exports.updateTrainById = async (req, res) => {
  try {
    const train = await TrainModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!train) return res.status(404).json({ error: 'Train non trouvé' });
    return res.status(200).json({ message: 'Train mis à jour avec succès', train });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour du train' });
  }
};

// Supprimer un train par ID (admin uniquement)
exports.deleteTrainById = async (req, res) => {
  try {
    const train = await TrainModel.findByIdAndDelete(req.params.id);
    if (!train) return res.status(404).json({ error: 'Train non trouvé' });
    return res.status(204).json({ message: 'Train supprimé avec succès' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la suppression du train' });
  }
};
