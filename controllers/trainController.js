const TrainModel = require('../models/trainModel');

// Récupérer tous les trains
exports.getAllTrains = async (req, res) => {
  try {
    const trains = await TrainModel.find();
    res.json(trains);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des trains' });
  }
};

// Enregistrer un nouveau train (admin uniquement)
exports.creationTrain = async (req, res) => {
  const { name, start_station, end_station, time_of_departure } = req.body;
  try {
    if (!name || !start_station || !end_station || !time_of_departure) {
      return res.status(400).json({ error: "Le nom, les stations de début et de fin ainsi que l'heure de départ sont requis !" });
    }
    let train = await TrainModel.findOne({ name });
    if (train) {
      return res.status(400).json({ message: "Le train est déjà existant !" });
    } else {
      train = new TrainModel({ name, start_station, end_station, time_of_departure });
      await train.save();
      res.status(201).json({ message: "Le train a été enregistré avec succès" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur Serveur" });
  }
};

// Récupérer un train par ID
exports.getTrainById = async (req, res) => {
  try {
    const train = await TrainModel.findById(req.params.id);
    if (!train) return res.status(404).json({ error: 'Train non trouvé' });
    res.json(train);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du train' });
  }
};

// Mettre à jour un train par ID (admin uniquement)
exports.updateTrainById = async (req, res) => {
  try {
    const train = await TrainModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!train) return res.status(404).json({ error: 'Train non trouvé' });
    res.json(train);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du train' });
  }
};

// Supprimer un train par ID (admin uniquement  )
exports.deleteTrainById = async (req, res) => {
  try {
    const train = await TrainModel.findByIdAndDelete(req.params.id);
    if (!train) return res.status(404).json({ error: 'Train non trouvé' });
    res.json(train);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du train' });
  }
};
