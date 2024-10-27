const Joi = require('joi');
const TrainModel = require('../models/trainModel');

// Validation des paramètres de requête avec messages d'erreur personnalisés
const validateQueryParams = (query) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      'number.base': 'La page doit être un nombre',
      'number.integer': 'La page doit être un entier',
      'number.min': 'La page doit être supérieure ou égale à 1'
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      'number.base': 'La limite doit être un nombre',
      'number.integer': 'La limite doit être un entier',
      'number.min': 'La limite doit être supérieure ou égale à 1',
      'number.max': 'La limite ne peut pas dépasser 100'
    }),
    sort: Joi.string().valid('name', 'start_station', 'end_station', 'time_of_departure').default('name').messages({
      'string.base': 'Le champ de tri doit être une chaîne',
      'any.only': 'Le champ de tri doit être l’un des suivants : name, start_station, end_station, time_of_departure'
    }),
    order: Joi.string().valid('asc', 'desc').default('asc').messages({
      'string.base': 'L\'ordre doit être une chaîne',
      'any.only': 'L\'ordre doit être soit "asc" soit "desc"'
    }),
  });
  return schema.validate(query);
};

// Récupérer tous les trains avec tri et pagination
exports.getAllTrains = async (req, res) => {
  try {
    const { error, value } = validateQueryParams(req.query);
    if (error) return res.status(400).json({ error: error.message });

    const { page = 1, limit = 10, sort = 'name', order = 'asc' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const sortOrder = order === 'asc' ? 1 : -1; // 1 pour ascendant, -1 pour descendant
    const sortField = ['name', 'start_station', 'end_station', 'time_of_departure'].includes(sort) ? sort : 'name';
    const offset = (pageNum - 1) * limitNum;

    const trains = await TrainModel.find()
      .sort({ [sortField]: sortOrder })
      .skip(offset)
      .limit(limitNum);

    const total = await TrainModel.countDocuments(); 

    if (!trains.length) {
      return res.status(404).json({ error: 'Aucun train trouvé pour cette page' });
    }

    return res.status(200).json({ message: 'Tous les trains ont été récupérés avec succès', total, trains });
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
