// IMPORTS
const StationModel = require('../models/stationModel');
const TrainModel = require('../models/trainModel'); 

// Récupérer toutes les gares
exports.getAllStations = async (req, res) => {
  try {
    const stations = await StationModel.find();
    return res.status(200).json({ message: 'Gares récupérées avec succès', stations });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des gares' });
  }
};

// Enregistrer une nouvelle gare (admin uniquement)
exports.creationStation = async (req, res) => {
  const { name, open_hour, close_hour, image } = req.body;
  try {
    if (!name || !open_hour || !close_hour || !image) {
      return res.status(400).json({ error: 'Le nom, les heures d\'ouverture et de fermeture ainsi que l\'image sont requis !' });
    }
    let station = await StationModel.findOne({ name });
    if (station) {
      return res.status(400).json({ error: 'La gare est déjà existante !' });
    } else {
      station = new StationModel({ name, open_hour, close_hour, image });
      await station.save();
      res.status(201).json({ message: 'La gare a été enregistrée avec succès', station });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la création de la gare' });
  }
};

// Récupérer d'une gare par ID 
exports.getStationById = async (req, res) => {
  try {
    const station = await StationModel.findById(req.params.id);
    if (!station) return res.status(404).json({ error: 'Gare non trouvée' });
    return res.status(200).json({ message: 'Gare récupérée avec succès', station });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'Erreur lors de la récupération de la gare' });
  }
};

// Mettre à jour d'une gare par ID (admin uniquement)
exports.updateStationById = async (req, res) => {
  try {
    const station = await StationModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!station) return res.status(404).json({ error: 'Gare non trouvée' });
    return res.status(200).json({ message: 'Gare mise à jour avec succès', station });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour de la gare' });
  }
};

// Supprimer d'une gare par ID (admin uniquement)
exports.deleteStationById = async (req, res) => {
  try {
    // Suppression de la gare
    const station = await StationModel.findByIdAndDelete(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Gare non trouvée' });
    }

    // Suppression de tous les trains liés à cette gare
    await TrainModel.deleteMany({ start_station: req.params.id});
    await TrainModel.deleteMany({ end_station: req.params.id});

    return res.status(204).json({ message: 'Gare et trains associés supprimés avec succès' });
  } catch (error) {
    return res.status(500).json({ error: 'Erreur lors de la suppression de la gare et des trains associés' });
  }
};

