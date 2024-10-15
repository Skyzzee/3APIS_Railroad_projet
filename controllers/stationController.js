const StationModel = require('../models/stationModel');

// Récupérer toutes les gares
exports.getAllStations = async (req, res) => {
  try {
    const stations = await StationModel.find();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des stations' });
  }
};

// Enregistrer une nouvelle gare
exports.creationStation = async (req, res) => {
  const { name, open_hour, close_hour, image } = req.body;
  try {
    if (!name || !open_hour || !close_hour || !image) {
      return res.status(400).json({ error: "Le nom, les stations de début et de fin ainsi que l'heure de départ sont requis !" });
    }
    let station = await StationModel.findOne({ name });
    if (station) {
      return res.status(400).json({ message: "Le station est déjà existant !" });
    } else {
      station = new StationModel({ name, open_hour, close_hour, image });
      await station.save();
      res.status(201).json({ message: "Le station a été enregistré avec succès" });
    }
  } catch (error) {
    res.status(500).json({ message: "Erreur Serveur" });
  }
};

// Récupérer d'une gare par ID
exports.getStationById = async (req, res) => {
  try {
    const station = await StationModel.findById(req.params.id);
    if (!station) return res.status(404).json({ error: 'Station non trouvé' });
    res.json(station);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du station' });
  }
};

// Mettre à jour d'une gare par ID
exports.updateStationById = async (req, res) => {
  try {
    const station = await StationModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!station) return res.status(404).json({ error: 'Station non trouvé' });
    res.json(station);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du station' });
  }
};

// Supprimer d'une gare par ID
exports.deleteStationById = async (req, res) => {
  try {
    const station = await StationModel.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ error: 'Station non trouvé' });
    res.json(station);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du station' });
  }
};
