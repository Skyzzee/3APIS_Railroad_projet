const StationModel = require('../models/stationModel');

// Récupérer toutes les gares
exports.getAllStations = async (req, res) => {
  try {
    const stations = await StationModel.find();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des gares' });
  }
};

// Enregistrer une nouvelle gare (admin uniquement)
exports.creationStation = async (req, res) => {
  const { name, open_hour, close_hour, image } = req.body;
  try {
    if (!name || !open_hour || !close_hour || !image) {
      return res.status(400).json({ error: "Le nom, les heures d'ouverture et de fermeture ainsi que l'image sont requis !" });
    }
    let station = await StationModel.findOne({ name });
    if (station) {
      return res.status(400).json({ message: "La gare est déjà existante !" });
    } else {
      station = new StationModel({ name, open_hour, close_hour, image });
      await station.save();
      res.status(201).json({ message: "La gare a été enregistrée avec succès" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur Serveur" });
  }
};

// Récupérer d'une gare par ID 
exports.getStationById = async (req, res) => {
  try {
    const station = await StationModel.findById(req.params.id);
    if (!station) return res.status(404).json({ error: 'Gare non trouvée' });
    res.json(station);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du la gare' });
  }
};

// Mettre à jour d'une gare par ID (admin uniquement)
exports.updateStationById = async (req, res) => {
  try {
    const station = await StationModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!station) return res.status(404).json({ error: 'Gare non trouvée' });
    res.json(station);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la gare' });
  }
};

// Supprimer d'une gare par ID (admin uniquement)
exports.deleteStationById = async (req, res) => {
  try {
    const station = await StationModel.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ error: 'Gare non trouvée' });
    res.json(station);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la gare' });
  }
};
